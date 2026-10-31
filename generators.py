import os
import json
import re
import logging
from typing import Dict, Any, Optional, List
import httpx

logger = logging.getLogger("summarizer_generators")

# Local LLM import from services
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
        # Try to find outermost { ... }
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
                    {"front": "Key Concept", "back": cleaned[:300], "tag": "Overview"}
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
                        "options": ["Key Subject", "Irrelevant Topic A", "Irrelevant Topic B", "Irrelevant Topic C"],
                        "answerIndex": 0,
                        "explanation": "Based on the transcript and summary."
                    }
                ]
            }


# ============================================================
# 1. FLASHCARDS GENERATION (Gemini API with Local Fallback)
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
    gemini_key = api_key or os.getenv("GEMINI_API_KEY")
    prompt = f"TITLE: {title}\n\nSUMMARY:\n{summary}\n\nTRANSCRIPT EXCERPT:\n{transcript[:4000]}"
    
    # 1. Try Gemini API if key is available
    if gemini_key:
        try:
            logger.info("Generating flashcards using Gemini API...")
            from google import genai
            client = genai.Client(api_key=gemini_key)
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=f"{FLASHCARD_SYSTEM_PROMPT}\n\n{prompt}"
            )
            data = _parse_json_safely(response.text, "flashcards")
            data["provider"] = "Gemini API (gemini-2.0-flash)"
            return data
        except Exception as e:
            logger.warning(f"Gemini API flashcard generation failed: {e}. Falling back to local LLM.")
    
    # 2. Local Fallback with Qwen2.5
    logger.info("Generating flashcards using Local Qwen LLM...")
    try:
        from langchain_core.prompts import ChatPromptTemplate
        from langchain_core.output_parsers import StrOutputParser

        llm = get_local_llm()
        chat_prompt = ChatPromptTemplate.from_messages([
            ("system", FLASHCARD_SYSTEM_PROMPT),
            ("human", prompt)
        ])
        chain = chat_prompt | llm | StrOutputParser()
        raw = chain.invoke({})
        data = _parse_json_safely(raw, "flashcards")
        data["provider"] = "Local Engine (Qwen2.5)"
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
        return {"flashcards": cards, "provider": "Local Engine (Rule-based Fallback)"}


# ============================================================
# 2. PRESENTATION (PPT) GENERATION (Gemini API with Local Fallback)
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
    gemini_key = api_key or os.getenv("GEMINI_API_KEY")
    prompt = f"TITLE: {title}\n\nSUMMARY:\n{summary}\n\nTRANSCRIPT EXCERPT:\n{transcript[:4000]}"
    
    # 1. Try Gemini API
    if gemini_key:
        try:
            logger.info("Generating PPT outline using Gemini API...")
            from google import genai
            client = genai.Client(api_key=gemini_key)
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=f"{PPT_SYSTEM_PROMPT}\n\n{prompt}"
            )
            data = _parse_json_safely(response.text, "ppt")
            data["provider"] = "Gemini API (gemini-2.0-flash)"
            return data
        except Exception as e:
            logger.warning(f"Gemini API PPT generation failed: {e}. Falling back to local LLM.")

    # 2. Local Fallback with Qwen2.5
    logger.info("Generating PPT outline using Local Qwen LLM...")
    try:
        from langchain_core.prompts import ChatPromptTemplate
        from langchain_core.output_parsers import StrOutputParser

        llm = get_local_llm()
        chat_prompt = ChatPromptTemplate.from_messages([
            ("system", PPT_SYSTEM_PROMPT),
            ("human", prompt)
        ])
        chain = chat_prompt | llm | StrOutputParser()
        raw = chain.invoke({})
        data = _parse_json_safely(raw, "ppt")
        data["provider"] = "Local Engine (Qwen2.5)"
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
        return {
            "title": title or "Video Presentation",
            "slides": slides,
            "provider": "Local Engine (Rule-based Fallback)"
        }


# ============================================================
# 3. QUIZ GENERATION (Grok API with Local Fallback)
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
    grok_key = api_key or os.getenv("GROK_API_KEY") or os.getenv("XAI_API_KEY")
    prompt = f"TITLE: {title}\n\nSUMMARY:\n{summary}\n\nTRANSCRIPT EXCERPT:\n{transcript[:4000]}"
    
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
                "temperature": 0.3
            }
            res = httpx.post("https://api.x.ai/v1/chat/completions", headers=headers, json=payload, timeout=40.0)
            if res.status_code == 200:
                data = res.json()
                content = data["choices"][0]["message"]["content"]
                parsed = _parse_json_safely(content, "quiz")
                parsed["provider"] = "Grok API (grok-2-mini)"
                return parsed
            else:
                logger.warning(f"Grok API returned status {res.status_code}: {res.text}. Falling back to local LLM.")
        except Exception as e:
            logger.warning(f"Grok API call failed: {e}. Falling back to local LLM.")

    # 2. Local Fallback with Qwen2.5
    logger.info("Generating quiz using Local Qwen LLM...")
    try:
        from langchain_core.prompts import ChatPromptTemplate
        from langchain_core.output_parsers import StrOutputParser

        llm = get_local_llm()
        chat_prompt = ChatPromptTemplate.from_messages([
            ("system", QUIZ_SYSTEM_PROMPT),
            ("human", prompt)
        ])
        chain = chat_prompt | llm | StrOutputParser()
        raw = chain.invoke({})
        data = _parse_json_safely(raw, "quiz")
        data["provider"] = "Local Engine (Qwen2.5)"
        return data
    except Exception as e:
        logger.error(f"Local quiz generation failed: {e}")
        # Rule-based fallback
        return {
            "quiz": [
                {
                    "question": f"What is the main topic covered in '{title}'?",
                    "options": [title, "Unrelated Programming Topic", "Machine Learning Theory", "General Computing"],
                    "answerIndex": 0,
                    "explanation": f"The video explicitly teaches concepts related to {title}."
                }
            ],
            "provider": "Local Engine (Rule-based Fallback)"
        }


# ============================================================
# 4. POWERPOINT (.pptx) FILE CREATION
# ============================================================

def build_pptx_file(presentation_data: Dict[str, Any], output_path: str) -> str:
    """Generate a clean, styled Microsoft PowerPoint (.pptx) file."""
    import pptx
    from pptx.util import Inches, Pt
    from pptx.dml.color import RGBColor
    from pptx.enum.text import PP_ALIGN

    prs = pptx.Presentation()
    # 16:9 widescreen layout
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    blank_layout = prs.slide_layouts[6]

    # Color tokens matching BYAMN Design
    brand_black = RGBColor(14, 15, 12)
    brand_lime = RGBColor(217, 236, 149)
    brand_dark_gray = RGBColor(35, 38, 30)
    text_white = RGBColor(245, 245, 242)
    text_muted = RGBColor(180, 180, 175)

    # 1. Title Slide
    slide = prs.slides.add_slide(blank_layout)
    bg = slide.background
    fill = bg.fill
    fill.solid()
    fill.fore_color.rgb = brand_black

    # Title Box
    title_box = slide.shapes.add_textbox(Inches(1.5), Inches(2.2), Inches(10.3), Inches(2.5))
    tf = title_box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = presentation_data.get("title", "Video Presentation")
    p.font.size = Pt(44)
    p.font.bold = True
    p.font.color.rgb = brand_lime

    p2 = tf.add_paragraph()
    p2.text = "Generated by AI Video Study Suite"
    p2.font.size = Pt(20)
    p2.font.color.rgb = text_muted
    p2.space_before = Pt(24)

    # 2. Content Slides
    slides_list = presentation_data.get("slides", [])
    for idx, s in enumerate(slides_list, 1):
        slide = prs.slides.add_slide(blank_layout)
        bg = slide.background
        fill = bg.fill
        fill.solid()
        fill.fore_color.rgb = brand_black

        # Slide Header Bar
        header_box = slide.shapes.add_textbox(Inches(1.2), Inches(0.8), Inches(10.9), Inches(1.2))
        htf = header_box.text_frame
        htf.word_wrap = True
        hp = htf.paragraphs[0]
        hp.text = s.get("title", f"Slide {idx}")
        hp.font.size = Pt(30)
        hp.font.bold = True
        hp.font.color.rgb = brand_lime

        # Slide Bullets Box
        bullets_box = slide.shapes.add_textbox(Inches(1.2), Inches(2.2), Inches(10.9), Inches(4.5))
        btf = bullets_box.text_frame
        btf.word_wrap = True

        bullets = s.get("bullets", [])
        for b_idx, bullet in enumerate(bullets):
            bp = btf.paragraphs[0] if b_idx == 0 else btf.add_paragraph()
            bp.text = f"•  {bullet}"
            bp.font.size = Pt(20)
            bp.font.color.rgb = text_white
            bp.space_before = Pt(16)

        # Speaker notes
        notes_text = s.get("notes", "")
        if notes_text:
            notes_slide = slide.notes_slide
            notes_slide.notes_text_frame.text = notes_text

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    prs.save(output_path)
    return output_path
