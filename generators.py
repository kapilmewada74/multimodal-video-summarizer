import os
import json
import re
import logging
from typing import Dict, Any, Optional, List
import httpx
from dotenv import load_dotenv

# Ensure environment variables from .env are loaded
load_dotenv()

logger = logging.getLogger("summarizer_generators")

# In-memory generation cache to prevent duplicate external API calls
_GENERATION_CACHE: Dict[str, Any] = {}

def get_cache_key(prefix: str, title: str, summary: str) -> str:
    import hashlib
    raw = f"{prefix}:{title}:{summary[:300]}"
    return hashlib.md5(raw.encode("utf-8")).hexdigest()

def _clean_xai_key(key: Optional[str] = None) -> Optional[str]:
    k = key or os.getenv("XAI_API_KEY") or os.getenv("GROK_API_KEY")
    if not k:
        return None
    k = k.strip()
    if "xai-" in k:
        return "xai-" + k.split("xai-", 1)[1].strip()
    return k

def _get_gemini_models():
    configured = os.getenv("GEMINI_MODEL", "gemini-3.5-flash").strip()
    # Prefer flash-lite first for sub-2s latency, followed by full flash
    models = []
    if "lite" in configured:
        models.append(configured)
    else:
        models.append("gemini-3.5-flash-lite")
        models.append(configured)
    for alt in ["gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-flash-latest"]:
        if alt not in models:
            models.append(alt)
    return models

def get_local_llm():
    from services import get_llm
    return get_llm()

def _clean_json_text(text: str) -> str:
    """Strip markdown codeblocks and extraneous characters from LLM JSON response."""
    text = text.strip()
    match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', text)
    if match:
        text = match.group(1).strip()
    return text

def _parse_json_safely(raw_text: str, fallback_type: str = "flashcards") -> Dict[str, Any]:
    cleaned = _clean_json_text(raw_text)
    try:
        return json.loads(cleaned)
    except Exception as e:
        logger.warning(f"Failed to parse json directly: {e}. Attempting recovery.")
        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start != -1 and end != -1:
            try:
                return json.loads(cleaned[start:end+1])
            except Exception:
                pass
        
        # Safe dummy fallbacks if parsing completely fails
        if fallback_type == "flashcards":
            return {
                "flashcards": [
                    {"front": "Key Takeaway", "back": cleaned[:300], "tag": "Overview"}
                ]
            }
        elif fallback_type == "ppt":
            return {
                "title": "Video Presentation",
                "slides": [
                    {"title": "Overview", "bullets": [cleaned[:200]], "notes": "Key points from video."}
                ]
            }
        else: # quiz
            return {
                "quiz": [
                    {
                        "question": "What is the primary topic discussed in the video?",
                        "options": ["Key Subject", "Alternative Topic A", "Alternative Topic B", "Alternative Topic C"],
                        "answerIndex": 0,
                        "explanation": "Derived from the summary and transcript."
                    }
                ]
            }

def _call_gemini_rest(prompt: str, system_instruction: Optional[str] = None) -> Optional[tuple[str, str]]:
    """Execute high-speed REST call to Google Gemini API with model cascade."""
    key = os.getenv("GEMINI_API_KEY")
    if not key:
        return None
    key = key.strip()

    full_prompt = f"{system_instruction}\n\n{prompt}" if system_instruction else prompt
    payload = {
        "contents": [{"parts": [{"text": full_prompt}]}],
        "generationConfig": {
            "temperature": 0.2,
            "responseMimeType": "application/json"
        }
    }

    models_to_try = _get_gemini_models()
    for model in models_to_try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"
        try:
            with httpx.Client(timeout=16.0) as client:
                r = client.post(url, json=payload)
                if r.status_code == 200:
                    data = r.json()
                    text = data["candidates"][0]["content"]["parts"][0]["text"]
                    return text, model
                else:
                    logger.warning(f"Gemini {model} returned {r.status_code}. Trying next model...")
        except Exception as e:
            logger.warning(f"Gemini {model} call error: {e}. Trying next model...")

    return None


# ============================================================
# 1. FLASHCARDS GENERATION (Gemini 3.5 with Local Fallback)
# ============================================================

FLASHCARD_SYSTEM_PROMPT = """You are an educational specialist creating revision flashcards.
Based strictly on the provided summary and transcript, generate 6 to 10 high-impact study flashcards.
Each flashcard must have a concise question or concept on the front, and a clear, accurate explanation on the back.

Return ONLY a valid JSON object matching this schema:
{
  "flashcards": [
    {
      "front": "Clear question or concept name",
      "back": "Accurate, concise explanation (1-3 sentences)",
      "tag": "Category (e.g. Definition, Syntax, Principle, Method)"
    }
  ]
}
"""

def generate_flashcards(title: str, summary: str, transcript: str, api_key: Optional[str] = None) -> Dict[str, Any]:
    cache_key = get_cache_key("flashcards", title, summary)
    if cache_key in _GENERATION_CACHE:
        return _GENERATION_CACHE[cache_key]

    prompt = f"TITLE: {title}\n\nSUMMARY:\n{summary}\n\nTRANSCRIPT EXCERPT:\n{transcript[:4000]}"
    
    # 1. Try Gemini API
    res = _call_gemini_rest(prompt, FLASHCARD_SYSTEM_PROMPT)
    if res:
        raw_text, used_model = res
        data = _parse_json_safely(raw_text, "flashcards")
        data["provider"] = f"Gemini API ({used_model})"
        _GENERATION_CACHE[cache_key] = data
        return data
    
    # 2. Local Fallback with Qwen2.5
    logger.info("Generating flashcards using Local Qwen LLM...")
    try:
        from langchain_core.prompts import ChatPromptTemplate
        from langchain_core.output_parsers import StrOutputParser

        llm = get_local_llm()
        chat_prompt = ChatPromptTemplate.from_messages([
            ("system", "{sys}"),
            ("human", "{human_input}")
        ])
        chain = chat_prompt | llm | StrOutputParser()
        raw = chain.invoke({"sys": FLASHCARD_SYSTEM_PROMPT, "human_input": prompt})
        data = _parse_json_safely(raw, "flashcards")
        data["provider"] = "Local Engine (Qwen2.5)"
        _GENERATION_CACHE[cache_key] = data
        return data
    except Exception as e:
        logger.error(f"Local flashcard generation failed: {e}")
        # Rule-based fallback from summary
        lines = [l.strip() for l in summary.split("\n") if l.strip().startswith("- ") or l.strip().startswith("* ")]
        cards = []
        for line in lines[:8]:
            clean = line.lstrip("-* ").strip()
            if ":" in clean:
                f, b = clean.split(":", 1)
                cards.append({"front": f.strip(), "back": b.strip(), "tag": "Key Point"})
            else:
                cards.append({"front": "Concept", "back": clean, "tag": "Note"})
        if not cards:
            cards = [{"front": "Main Subject", "back": title, "tag": "Overview"}]
        res_data = {"flashcards": cards, "provider": "Local Engine (Rule-based Fallback)"}
        _GENERATION_CACHE[cache_key] = res_data
        return res_data


# ============================================================
# 2. PRESENTATION (PPT) GENERATION (Gemini 3.5 with Local Fallback)
# ============================================================

PPT_SYSTEM_PROMPT = """You are an expert keynote presentation designer.
Based strictly on the provided summary and transcript, generate an outline for a professional 5 to 8 slide presentation.
Each slide must have a compelling title, 3 to 4 concise bullet points, and speaker notes.

Return ONLY a valid JSON object matching this schema:
{
  "title": "Presentation Title",
  "slides": [
    {
      "title": "Slide Title",
      "bullets": [
        "Key insight 1",
        "Key insight 2",
        "Key insight 3"
      ],
      "notes": "Speaker notes providing speaking context for the presenter."
    }
  ]
}
"""

def generate_presentation(title: str, summary: str, transcript: str, api_key: Optional[str] = None) -> Dict[str, Any]:
    cache_key = get_cache_key("presentation", title, summary)
    if cache_key in _GENERATION_CACHE:
        return _GENERATION_CACHE[cache_key]

    prompt = f"TITLE: {title}\n\nSUMMARY:\n{summary}\n\nTRANSCRIPT EXCERPT:\n{transcript[:4000]}"
    
    # 1. Try Gemini API
    res = _call_gemini_rest(prompt, PPT_SYSTEM_PROMPT)
    if res:
        raw_text, used_model = res
        data = _parse_json_safely(raw_text, "ppt")
        data["provider"] = f"Gemini API ({used_model})"
        _GENERATION_CACHE[cache_key] = data
        return data

    # 2. Local Fallback with Qwen2.5
    logger.info("Generating PPT outline using Local Qwen LLM...")
    try:
        from langchain_core.prompts import ChatPromptTemplate
        from langchain_core.output_parsers import StrOutputParser

        llm = get_local_llm()
        chat_prompt = ChatPromptTemplate.from_messages([
            ("system", "{sys}"),
            ("human", "{human_input}")
        ])
        chain = chat_prompt | llm | StrOutputParser()
        raw = chain.invoke({"sys": PPT_SYSTEM_PROMPT, "human_input": prompt})
        data = _parse_json_safely(raw, "ppt")
        data["provider"] = "Local Engine (Qwen2.5)"
        _GENERATION_CACHE[cache_key] = data
        return data
    except Exception as e:
        logger.error(f"Local PPT generation failed: {e}")
        # Rule-based fallback
        sections = [s.strip() for s in summary.split("## ") if s.strip()]
        slides = []
        for sec in sections[:6]:
            lines = [l.strip() for l in sec.split("\n") if l.strip()]
            sec_title = lines[0] if lines else "Overview"
            bullets = [l.lstrip("-* ").strip() for l in lines[1:5] if l.startswith("-") or l.startswith("*")]
            if not bullets:
                bullets = [lines[1]] if len(lines) > 1 else ["Key takeaways from section."]
            slides.append({
                "title": sec_title,
                "bullets": bullets,
                "notes": f"Explanation of {sec_title}."
            })
        res_data = {
            "title": title or "Video Presentation",
            "slides": slides,
            "provider": "Local Engine (Rule-based Fallback)"
        }
        _GENERATION_CACHE[cache_key] = res_data
        return res_data


# ============================================================
# 3. QUIZ GENERATION (Grok with Gemini & Local Fallbacks)
# ============================================================

QUIZ_SYSTEM_PROMPT = """You are an expert exam educator creating interactive test quizzes.
Based strictly on the provided summary and transcript, generate 5 multiple choice questions.
Each question must test genuine understanding, have 4 distinct plausible options, indicate the correct option index (0 to 3), and provide an explanation.

Return ONLY a valid JSON object matching this schema:
{
  "quiz": [
    {
      "question": "What is ...?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answerIndex": 0,
      "explanation": "Explanation why Option A is the correct answer."
    }
  ]
}
"""

def generate_quiz(title: str, summary: str, transcript: str, api_key: Optional[str] = None) -> Dict[str, Any]:
    cache_key = get_cache_key("quiz", title, summary)
    if cache_key in _GENERATION_CACHE:
        return _GENERATION_CACHE[cache_key]

    prompt = f"TITLE: {title}\n\nSUMMARY:\n{summary}\n\nTRANSCRIPT EXCERPT:\n{transcript[:4000]}"
    grok_key = _clean_xai_key(api_key)
    
    # 1. Try Grok (xAI) API
    if grok_key:
        try:
            logger.info("Generating quiz using Grok API...")
            headers = {
                "Authorization": f"Bearer {grok_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": "grok-2-mini",
                "messages": [
                    {"role": "system", "content": QUIZ_SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.2
            }
            with httpx.Client(timeout=20.0) as client:
                r = client.post("https://api.x.ai/v1/chat/completions", headers=headers, json=payload)
                if r.status_code == 200:
                    resp_json = r.json()
                    raw_text = resp_json["choices"][0]["message"]["content"]
                    data = _parse_json_safely(raw_text, "quiz")
                    data["provider"] = "Grok API (grok-2-mini)"
                    _GENERATION_CACHE[cache_key] = data
                    return data
                else:
                    logger.warning(f"Grok API status {r.status_code}: {r.text[:200]}. Engaging Gemini fallback.")
        except Exception as e:
            logger.warning(f"Grok API call failed: {e}. Engaging Gemini fallback.")

    # 2. Try Gemini API as Intelligent Quiz Fallback
    res = _call_gemini_rest(prompt, QUIZ_SYSTEM_PROMPT)
    if res:
        raw_text, used_model = res
        data = _parse_json_safely(raw_text, "quiz")
        data["provider"] = f"Gemini API ({used_model})"
        _GENERATION_CACHE[cache_key] = data
        return data

    # 3. Local Fallback with Qwen2.5
    logger.info("Generating quiz using Local Qwen LLM...")
    try:
        from langchain_core.prompts import ChatPromptTemplate
        from langchain_core.output_parsers import StrOutputParser

        llm = get_local_llm()
        chat_prompt = ChatPromptTemplate.from_messages([
            ("system", "{sys}"),
            ("human", "{human_input}")
        ])
        chain = chat_prompt | llm | StrOutputParser()
        raw = chain.invoke({"sys": QUIZ_SYSTEM_PROMPT, "human_input": prompt})
        data = _parse_json_safely(raw, "quiz")
        data["provider"] = "Local Engine (Qwen2.5)"
        _GENERATION_CACHE[cache_key] = data
        return data
    except Exception as e:
        logger.error(f"Local Quiz generation failed: {e}")
        # Rule-based fallback
        res_data = {
            "quiz": [
                {
                    "question": f"What was the primary focus of '{title}'?",
                    "options": [
                        title,
                        "Unrelated General Discussion",
                        "Historical Chronology Only",
                        "Future Speculation"
                    ],
                    "answerIndex": 0,
                    "explanation": f"The primary subject of this video presentation is {title}."
                }
            ],
            "provider": "Local Engine (Rule-based Fallback)"
        }
        _GENERATION_CACHE[cache_key] = res_data
        return res_data


# ============================================================
# 4. POWERPOINT PPTX BUILDER (.pptx file binary generation)
# ============================================================

def build_pptx_file(presentation_data: Dict[str, Any], output_path: Optional[str] = None) -> bytes:
    """Generate professional 16:9 widescreen PPTX file with branding."""
    import io
    from pptx import Presentation
    from pptx.util import Inches, Pt
    from pptx.dml.color import RGBColor
    from pptx.enum.text import PP_ALIGN

    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    blank_layout = prs.slide_layouts[6]

    title_text = presentation_data.get("title", "Lecture Summary")
    slides_data = presentation_data.get("slides", [])

    # Brand Colors
    BRAND_BLACK = RGBColor(14, 15, 12)       # #0E0F0C
    BRAND_LIME = RGBColor(217, 236, 149)     # #D9EC95
    TEXT_WHITE = RGBColor(242, 242, 240)     # #F2F2F0
    TEXT_MUTED = RGBColor(160, 160, 160)

    # 1. Title Slide
    slide = prs.slides.add_slide(blank_layout)
    bg = slide.background
    fill = bg.fill
    fill.solid()
    fill.fore_color.rgb = BRAND_BLACK

    tx_box = slide.shapes.add_textbox(Inches(1.0), Inches(2.2), Inches(11.333), Inches(3.0))
    tf = tx_box.text_frame
    tf.word_wrap = True

    p = tf.paragraphs[0]
    p.text = title_text
    p.font.size = Pt(44)
    p.font.bold = True
    p.font.color.rgb = BRAND_LIME
    p.alignment = PP_ALIGN.LEFT

    p2 = tf.add_paragraph()
    p2.text = "Multimodal Video Summary & Lecture Deck"
    p2.font.size = Pt(20)
    p2.font.color.rgb = TEXT_WHITE
    p2.space_before = Pt(14)

    # 2. Content Slides
    for idx, slide_info in enumerate(slides_data, start=1):
        s = prs.slides.add_slide(blank_layout)
        bg = s.background
        fill = bg.fill
        fill.solid()
        fill.fore_color.rgb = BRAND_BLACK

        # Header Box
        header_box = s.shapes.add_textbox(Inches(1.0), Inches(0.8), Inches(11.333), Inches(1.2))
        htf = header_box.text_frame
        htf.word_wrap = True
        hp = htf.paragraphs[0]
        hp.text = f"{idx}. {slide_info.get('title', 'Slide')}"
        hp.font.size = Pt(28)
        hp.font.bold = True
        hp.font.color.rgb = BRAND_LIME

        # Bullets Box
        bullets_box = s.shapes.add_textbox(Inches(1.0), Inches(2.2), Inches(11.333), Inches(4.5))
        btf = bullets_box.text_frame
        btf.word_wrap = True

        bullets = slide_info.get("bullets", [])
        for b_idx, bullet in enumerate(bullets):
            bp = btf.paragraphs[0] if b_idx == 0 else btf.add_paragraph()
            bp.text = f"•  {bullet}"
            bp.font.size = Pt(18)
            bp.font.color.rgb = TEXT_WHITE
            bp.space_before = Pt(16)

        # Speaker notes
        notes_text = slide_info.get("notes", "")
        if notes_text:
            notes_slide = s.notes_slide
            text_frame = notes_slide.notes_text_frame
            text_frame.text = notes_text

    if output_path:
        prs.save(output_path)
        with open(output_path, "rb") as f:
            return f.read()

    out = io.BytesIO()
    prs.save(out)
    return out.getvalue()
