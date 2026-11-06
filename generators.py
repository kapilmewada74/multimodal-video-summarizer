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
    configured = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite").strip()
    models = ["gemini-3.5-flash-lite", "gemini-2.5-flash-lite", "gemini-flash-latest"]
    if configured not in models:
        models.insert(0, configured)
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

FLASHCARD_SYSTEM_PROMPT = """You are an expert educational specialist designing high-retention study flashcards.
Based strictly on the provided video summary and transcript, generate 6 to 10 comprehensive, active-recall study flashcards.
Requirements:
1. Front: Formulate as an engaging, direct question or targeted concept name (e.g. "What is the primary purpose of ...?", "How does ... solve the problem of ...?", "What are the 3 key pillars of ...?").
2. Back: Provide an accurate, comprehensive, easy-to-read explanation (2-3 sentences or clean bullet points).
3. Tag: Relevant topic category (e.g. "Definition", "Architecture", "Key Concept", "Framework", "Practical Application").
4. Mathematical Formulas: If the topic involves mathematical equations, statistical formulas, or quantitative metrics (e.g. Min-Max Scaling, Normalization, Standard Deviation, loss functions, algorithms), ALWAYS format them in standard LaTeX notation ($...$ inline or $$...$$ display) so they render as proper mathematical formulas.

Return ONLY a valid JSON object matching this schema:
{
  "flashcards": [
    {
      "front": "Clear question or targeted concept",
      "back": "Accurate, structured explanation with key details",
      "tag": "Category"
    }
  ]
}
"""

def generate_flashcards(title: str, summary: str, transcript: str, api_key: Optional[str] = None, force_refresh: bool = False) -> Dict[str, Any]:
    cache_key = get_cache_key("flashcards", title, summary)
    if not force_refresh and cache_key in _GENERATION_CACHE:
        return _GENERATION_CACHE[cache_key]
    if force_refresh and cache_key in _GENERATION_CACHE:
        del _GENERATION_CACHE[cache_key]

    prompt = f"TITLE: {title}\n\nSUMMARY:\n{summary}\n\nTRANSCRIPT EXCERPT:\n{transcript[:8000]}"
    
    # 1. Try Gemini API
    res = _call_gemini_rest(prompt, FLASHCARD_SYSTEM_PROMPT)
    if res:
        raw_text, used_model = res
        data = _parse_json_safely(raw_text, "flashcards")
        data["provider"] = ""
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

PPT_SYSTEM_PROMPT = """You are an expert keynote presentation designer and structured slide content planner.
Based strictly on the provided summary and transcript, generate an outline for a professional 5 to 7 slide presentation.
To ensure the presentation slides render with immaculate visual balance, proper alignment, and zero text overflow or awkward spacing across custom graphical templates, follow these strict content budget rules:
- title: Short, punchy headline (strictly 3 to 7 words).
- kicker: Category kicker or subtitle (strictly 2 to 4 words).
- summary: Concise explanatory thesis/summary for the slide (strictly 25 to 45 words, 2-3 sentences).
- bullets: Exactly 3 to 4 distinct key takeaway points (strictly 8 to 14 words each).
- layout: Layout archetype choice ("split_left_image", "split_right_image", or "cards_right").
- image_asset: Best matching visual context:
  * "photo_classroom_raising_hands.png" (definitions, active discussion, questions, core concepts)
  * "photo_classroom_desks.png" (structure, discipline, institutional pillar, societal role)
  * "photo_school_building.png" (foundations, architecture, environment, key roles)
- notes: Speaker notes providing context for the presenter.
- formulas: If discussing mathematical equations or quantitative formulas, format them in clean standard LaTeX notation ($...$).

Return ONLY a valid JSON object matching this schema:
{
  "title": "Presentation Title",
  "slides": [
    {
      "title": "Slide Title",
      "kicker": "Category Kicker",
      "summary": "Brief 2-sentence explanatory overview of this topic.",
      "bullets": [
        "Concise insight one with clear takeaway",
        "Concise insight two explaining mechanism",
        "Concise insight three highlighting real-world impact",
        "Concise insight four outlining key outcome"
      ],
      "layout": "split_left_image",
      "image_asset": "photo_classroom_raising_hands.png",
      "notes": "Speaker notes providing speaking context for the presenter."
    }
  ]
}
"""

def _sanitize_presentation_data(data: Dict[str, Any], default_title: str = "Presentation") -> Dict[str, Any]:
    """Sanitize and enforce strict text budgets, alternating archetypes, and image assignments."""
    if not isinstance(data, dict):
        data = {}
    title = str(data.get("title") or default_title).strip()
    raw_slides = data.get("slides")
    if not isinstance(raw_slides, list) or len(raw_slides) == 0:
        raw_slides = []

    layouts = ["split_left_image", "split_right_image", "cards_right"]
    images = [
        "photo_classroom_raising_hands.png",
        "photo_classroom_desks.png",
        "photo_school_building.png"
    ]

    clean_slides = []
    for idx, s in enumerate(raw_slides):
        if not isinstance(s, dict):
            continue
        s_title = str(s.get("title") or f"Key Insight {idx + 1}").strip()
        title_words = s_title.split()
        if len(title_words) > 9:
            s_title = " ".join(title_words[:8]) + "..."

        s_kicker = str(s.get("kicker") or f"Section {idx + 1:02d} • Core Concept").strip()
        kicker_words = s_kicker.split()
        if len(kicker_words) > 6:
            s_kicker = " ".join(kicker_words[:5])

        # Bullets handling (budget max 4 bullets, max 16 words each)
        raw_bullets = s.get("bullets") or []
        if isinstance(raw_bullets, str):
            raw_bullets = [b.strip() for b in raw_bullets.split("\n") if b.strip()]
        clean_bullets = []
        for b in raw_bullets:
            b_str = str(b).lstrip("-*•0123456789. ").strip()
            if not b_str:
                continue
            words = b_str.split()
            if len(words) > 16:
                b_str = " ".join(words[:15]) + "..."
            clean_bullets.append(b_str)
            if len(clean_bullets) >= 4:
                break

        if not clean_bullets:
            clean_bullets = [
                f"Core foundation and analysis of {s_title}",
                "Structured mechanism for practical comprehension",
                "Key takeaway and contextual application"
            ]

        # Summary handling (25-45 words budget)
        s_summary = str(s.get("summary") or "").strip()
        if not s_summary or len(s_summary) < 15:
            s_summary = f"{s_title} establishes a foundational pillar in this subject. It provides structural clarity, methodological rigor, and actionable insight for learners."
        else:
            sum_words = s_summary.split()
            if len(sum_words) > 50:
                s_summary = " ".join(sum_words[:48]) + "..."

        # Layout assignment
        layout = s.get("layout")
        if layout not in layouts:
            layout = layouts[idx % len(layouts)]

        img = s.get("image_asset")
        if not img or img not in images:
            img = images[idx % len(images)]

        notes = str(s.get("notes") or f"Speaker notes and key discussion points for {s_title}.").strip()

        clean_slides.append({
            "title": s_title,
            "kicker": s_kicker,
            "summary": s_summary,
            "bullets": clean_bullets,
            "layout": layout,
            "image_asset": img,
            "notes": notes
        })

    if not clean_slides:
        clean_slides = [
            {
                "title": "Core Foundations & Objectives",
                "kicker": "Section 01 • Introduction",
                "summary": "This overview introduces the primary themes, foundational context, and practical significance covered throughout the lecture.",
                "bullets": [
                    "Establish clear baseline definitions and principles",
                    "Understand key interactions and structural components",
                    "Synthesize takeaways for practical application"
                ],
                "layout": "split_left_image",
                "image_asset": images[0],
                "notes": "Introduction to the presentation topics and goals."
            }
        ]

    return {
        "title": title,
        "slides": clean_slides,
        "provider": data.get("provider", "Gemini AI")
    }

def generate_presentation(title: str, summary: str, transcript: str, api_key: Optional[str] = None, force_refresh: bool = False) -> Dict[str, Any]:
    cache_key = get_cache_key("presentation", title, summary)
    if not force_refresh and cache_key in _GENERATION_CACHE:
        return _GENERATION_CACHE[cache_key]
    if force_refresh and cache_key in _GENERATION_CACHE:
        del _GENERATION_CACHE[cache_key]

    prompt = f"TITLE: {title}\n\nSUMMARY:\n{summary}\n\nTRANSCRIPT EXCERPT:\n{transcript[:4000]}"
    
    # 1. Try Gemini API
    res = _call_gemini_rest(prompt, PPT_SYSTEM_PROMPT)
    if res:
        raw_text, used_model = res
        parsed = _parse_json_safely(raw_text, "ppt")
        parsed["provider"] = ""
        data = _sanitize_presentation_data(parsed, default_title=title or "Video Presentation")
        data["provider"] = ""
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
        parsed = _parse_json_safely(raw, "ppt")
        parsed["provider"] = "Local Engine (Qwen2.5)"
        data = _sanitize_presentation_data(parsed, default_title=title or "Video Presentation")
        data["provider"] = parsed["provider"]
        _GENERATION_CACHE[cache_key] = data
        return data
    except Exception as e:
        logger.error(f"Local PPT generation failed: {e}")
        # Rule-based fallback
        sections = [s.strip() for s in summary.split("## ") if s.strip()]
        slides = []
        layouts = ["split_left_image", "split_right_image", "cards_right"]
        images = [
            "photo_classroom_raising_hands.png",
            "photo_classroom_desks.png",
            "photo_school_building.png"
        ]
        for idx, sec in enumerate(sections[:6]):
            lines = [l.strip() for l in sec.split("\n") if l.strip()]
            sec_title = lines[0] if lines else "Overview"
            bullets = [l.lstrip("-* ").strip() for l in lines[1:5] if l.startswith("-") or l.startswith("*")]
            if not bullets:
                bullets = [lines[1]] if len(lines) > 1 else ["Key takeaways from section."]
            slides.append({
                "title": sec_title,
                "kicker": f"Topic {idx + 1:02d} • Core Concept",
                "summary": f"In-depth analysis of {sec_title}, exploring its mechanisms, real-world context, and key practical outcomes.",
                "bullets": bullets[:4],
                "layout": layouts[idx % len(layouts)],
                "image_asset": images[idx % len(images)],
                "notes": f"Explanation of {sec_title}."
            })
        raw_fallback = {
            "title": title or "Video Presentation",
            "slides": slides,
            "provider": "Local Engine (Rule-based Fallback)"
        }
        res_data = _sanitize_presentation_data(raw_fallback, default_title=title or "Video Presentation")
        res_data["provider"] = raw_fallback["provider"]
        _GENERATION_CACHE[cache_key] = res_data
        return res_data


# ============================================================
# 3. QUIZ GENERATION (Grok with Gemini & Local Fallbacks)
# ============================================================

QUIZ_SYSTEM_PROMPT = """You are an expert exam educator creating interactive test quizzes.
Based strictly on the provided summary and transcript, generate 5 multiple choice questions.
Each question must test genuine understanding, have 4 distinct plausible options, indicate the correct option index (0 to 3), and provide an explanation.
If questions, options, or explanations involve mathematical equations or formulas, format them in standard LaTeX notation ($...$).

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

def generate_quiz(
    title: str,
    summary: str,
    transcript: str,
    difficulty: str = "medium",
    num_questions: int = 5,
    api_key: Optional[str] = None,
    force_refresh: bool = False
) -> Dict[str, Any]:
    cache_key = get_cache_key("quiz", f"{title}:{difficulty}:{num_questions}", summary)
    if not force_refresh and cache_key in _GENERATION_CACHE:
        return _GENERATION_CACHE[cache_key]

    diff_text = {
        "easy": "EASY (fundamental definitions, direct facts, basic recall)",
        "medium": "MEDIUM (conceptual understanding, logical deduction, practical context)",
        "hard": "HARD (subtle edge cases, deep analysis, tricky plausible distractors)"
    }.get(difficulty.lower(), "MEDIUM")

    quiz_system_prompt = f"""You are an expert exam educator creating interactive test quizzes.
Based strictly on the provided summary and transcript, generate {num_questions} multiple choice questions.
TARGET DIFFICULTY: {diff_text}
Each question must test understanding at this difficulty level, have 4 distinct plausible options, indicate the correct option index (0 to 3), and provide a concise, high-value explanation.

Return ONLY a valid JSON object matching this schema:
{{
  "quiz": [
    {{
      "question": "Clear question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answerIndex": 0,
      "explanation": "Concise explanation why the correct option is right."
    }}
  ]
}}
"""

    prompt = f"TITLE: {title}\nDIFFICULTY: {difficulty}\n\nSUMMARY:\n{summary}\n\nTRANSCRIPT EXCERPT:\n{transcript[:4000]}"
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
                    {"role": "system", "content": quiz_system_prompt},
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
                    data["provider"] = ""
                    data["difficulty"] = difficulty
                    _GENERATION_CACHE[cache_key] = data
                    return data
                else:
                    logger.warning(f"Grok API status {r.status_code}: {r.text[:200]}. Engaging Gemini fallback.")
        except Exception as e:
            logger.warning(f"Grok API call failed: {e}. Engaging Gemini fallback.")

    # 2. Try Gemini API as Intelligent Quiz Fallback
    res = _call_gemini_rest(prompt, quiz_system_prompt)
    if res:
        raw_text, used_model = res
        data = _parse_json_safely(raw_text, "quiz")
        data["provider"] = ""
        data["difficulty"] = difficulty
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
        raw = chain.invoke({"sys": quiz_system_prompt, "human_input": prompt})
        data = _parse_json_safely(raw, "quiz")
        data["provider"] = "Local Engine (Qwen2.5)"
        data["difficulty"] = difficulty
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
            "provider": "Local Engine (Rule-based Fallback)",
            "difficulty": difficulty
        }
        _GENERATION_CACHE[cache_key] = res_data
        return res_data


# ============================================================
# 4. POWERPOINT PPTX BUILDER (.pptx file binary generation)
# ============================================================

def build_pptx_file(presentation_data: Dict[str, Any], output_path: Optional[str] = None) -> bytes:
    """Generate professional 16:9 widescreen PPTX file with template branding."""
    import io, os
    from pptx import Presentation
    from pptx.util import Inches, Pt
    from pptx.dml.color import RGBColor
    from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
    from pptx.enum.shapes import MSO_SHAPE

    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    blank_layout = prs.slide_layouts[6]

    title_text = presentation_data.get("title", "Lecture Summary")
    slides_data = presentation_data.get("slides", [])
    template = presentation_data.get("template", "warm_hexagons")

    base_dir = os.path.dirname(os.path.abspath(__file__))
    tmpl_dir_hexagons = os.path.join(base_dir, "static", "templates", "warm_hexagons")
    tmpl_dir_editorial = os.path.join(base_dir, "static", "templates", "modern_editorial")

    has_editorial = (
        template == "modern_editorial"
        and os.path.exists(tmpl_dir_editorial)
    )

    f_first = os.path.join(tmpl_dir_hexagons, "slide_first.png")
    f_body = os.path.join(tmpl_dir_hexagons, "slide_body.png")
    f_last = os.path.join(tmpl_dir_hexagons, "slide_last.png")

    has_hexagons = (
        template == "warm_hexagons"
        and os.path.exists(f_first)
        and os.path.exists(f_body)
        and os.path.exists(f_last)
    )

    if has_editorial:
        # ========================================================
        # TEMPLATE 2: Modern Editorial Navy (Sample 2 Archetypes)
        # ========================================================
        COLOR_NAVY = RGBColor(27, 57, 93)      # #1B395D
        COLOR_BLACK = RGBColor(0, 0, 0)        # #000000
        COLOR_WHITE = RGBColor(255, 255, 255)  # #FFFFFF
        COLOR_CHARCOAL = RGBColor(45, 55, 72)  # #2D3748
        COLOR_MUTED = RGBColor(74, 85, 104)    # #4A5568

        def add_editorial_footer(slide, deck_title, page_str):
            bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(6.8), Inches(13.333), Inches(0.7))
            bar.fill.solid()
            bar.fill.fore_color.rgb = COLOR_NAVY
            bar.line.fill.background()
            
            tb_l = slide.shapes.add_textbox(Inches(0.6), Inches(6.85), Inches(8.0), Inches(0.6))
            tf_l = tb_l.text_frame
            tf_l.word_wrap = False
            p_l = tf_l.paragraphs[0]
            p_l.text = deck_title
            p_l.font.name = "Arial"
            p_l.font.size = Pt(11)
            p_l.font.bold = True
            p_l.font.color.rgb = COLOR_WHITE
            
            tb_r = slide.shapes.add_textbox(Inches(10.5), Inches(6.85), Inches(2.2), Inches(0.6))
            tf_r = tb_r.text_frame
            tf_r.word_wrap = False
            p_r = tf_r.paragraphs[0]
            p_r.text = page_str
            p_r.alignment = PP_ALIGN.RIGHT
            p_r.font.name = "Arial"
            p_r.font.size = Pt(11)
            p_r.font.bold = True
            p_r.font.color.rgb = COLOR_WHITE

        # 1. Slide 0: Cover Slide (Clean Editorial Layout — Image Free)
        s0 = prs.slides.add_slide(blank_layout)
        top_bar = s0.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(0.12))
        top_bar.fill.solid()
        top_bar.fill.fore_color.rgb = COLOR_NAVY
        top_bar.line.fill.background()

        first_kicker = slides_data[0].get("kicker", "Core Lecture & Keynote") if slides_data else "Core Lecture & Keynote"
        tb_kicker = s0.shapes.add_textbox(Inches(0.85), Inches(0.9), Inches(8.0), Inches(0.5))
        tf_kicker = tb_kicker.text_frame
        p_k = tf_kicker.paragraphs[0]
        p_k.text = first_kicker
        p_k.font.name = "Arial"
        p_k.font.size = Pt(13)
        p_k.font.bold = True
        p_k.font.color.rgb = COLOR_MUTED

        tb_t = s0.shapes.add_textbox(Inches(0.85), Inches(1.5), Inches(6.8), Inches(3.6))
        tf_t = tb_t.text_frame
        tf_t.word_wrap = True
        p_t = tf_t.paragraphs[0]
        p_t.text = title_text.upper()
        p_t.font.name = "Arial"
        p_t.font.size = Pt(38)
        p_t.font.bold = True
        p_t.font.color.rgb = COLOR_BLACK

        # Executive Briefing Box (Replaces Cover Image)
        box_sum = s0.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(7.5), Inches(2.2), Inches(5.1), Inches(3.6))
        box_sum.fill.solid()
        box_sum.fill.fore_color.rgb = COLOR_WHITE
        box_sum.line.color.rgb = RGBColor(220, 224, 232)

        tb_tag = s0.shapes.add_textbox(Inches(7.8), Inches(2.4), Inches(4.5), Inches(0.4))
        p_tag = tb_tag.text_frame.paragraphs[0]
        p_tag.text = "EXECUTIVE BRIEFING"
        p_tag.font.name = "Arial"
        p_tag.font.size = Pt(11)
        p_tag.font.bold = True
        p_tag.font.color.rgb = COLOR_NAVY

        first_summary = slides_data[0].get("summary", "A comprehensive structured lecture synthesizing core principles, real-world context, and key practical takeaways.") if slides_data else "A comprehensive structured lecture synthesizing core principles, real-world context, and key practical takeaways."
        tb_sum = s0.shapes.add_textbox(Inches(7.8), Inches(3.0), Inches(4.5), Inches(2.6))
        tf_sum = tb_sum.text_frame
        tf_sum.word_wrap = True
        p_sum = tf_sum.paragraphs[0]
        p_sum.text = first_summary
        p_sum.font.name = "Arial"
        p_sum.font.size = Pt(13)
        p_sum.font.color.rgb = COLOR_CHARCOAL

        add_editorial_footer(s0, title_text, "Page 01")

        # 2. Slide 1 to N: Content Archetypes (Clean Image-Free Vector Architecture)
        layouts = ["split_left_image", "split_right_image", "cards_right"]

        for idx, slide_info in enumerate(slides_data, start=1):
            s = prs.slides.add_slide(blank_layout)
            layout = slide_info.get("layout")
            if layout not in layouts:
                layout = layouts[(idx - 1) % len(layouts)]

            page_num_str = f"Page {idx + 1:02d}"

            # Top accent line on every slide
            top_bar = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(0.12))
            top_bar.fill.solid()
            top_bar.fill.fore_color.rgb = COLOR_NAVY
            top_bar.line.fill.background()

            if layout == "split_left_image":
                tb_k = s.shapes.add_textbox(Inches(0.85), Inches(0.8), Inches(5.2), Inches(0.4))
                tf_k = tb_k.text_frame
                pk = tf_k.paragraphs[0]
                pk.text = slide_info.get("kicker", f"Topic {idx:02d}")
                pk.font.name = "Arial"
                pk.font.size = Pt(13)
                pk.font.bold = True
                pk.font.color.rgb = COLOR_MUTED

                tb_tit = s.shapes.add_textbox(Inches(0.85), Inches(1.2), Inches(5.2), Inches(1.2))
                tf_tit = tb_tit.text_frame
                tf_tit.word_wrap = True
                ptit = tf_tit.paragraphs[0]
                ptit.text = slide_info.get("title", f"Slide {idx}").upper()
                ptit.font.name = "Arial"
                ptit.font.size = Pt(26)
                ptit.font.bold = True
                ptit.font.color.rgb = COLOR_BLACK

                # Left Editorial Focus Card (Replaces Photo)
                box_c = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.85), Inches(2.6), Inches(5.2), Inches(3.7))
                box_c.fill.solid()
                box_c.fill.fore_color.rgb = COLOR_WHITE
                box_c.line.color.rgb = COLOR_NAVY

                tb_c_tag = s.shapes.add_textbox(Inches(1.1), Inches(2.8), Inches(4.7), Inches(0.4))
                pc_tag = tb_c_tag.text_frame.paragraphs[0]
                pc_tag.text = "CORE PRINCIPLE & FORMULATION"
                pc_tag.font.name = "Arial"
                pc_tag.font.size = Pt(11)
                pc_tag.font.bold = True
                pc_tag.font.color.rgb = COLOR_NAVY

                tb_c_txt = s.shapes.add_textbox(Inches(1.1), Inches(3.3), Inches(4.7), Inches(2.6))
                tfc_txt = tb_c_txt.text_frame
                tfc_txt.word_wrap = True
                pc_txt = tfc_txt.paragraphs[0]
                pc_txt.text = slide_info.get("summary", "") or slide_info.get("title", "")
                pc_txt.font.name = "Arial"
                pc_txt.font.size = Pt(13)
                pc_txt.font.color.rgb = COLOR_BLACK

                # Right Side: Contrast Grey Panel with Bullets
                panel_r = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(6.5), Inches(0.12), Inches(6.833), Inches(6.68))
                panel_r.fill.solid()
                panel_r.fill.fore_color.rgb = RGBColor(222, 222, 224)
                panel_r.line.fill.background()

                tb_b = s.shapes.add_textbox(Inches(7.1), Inches(1.2), Inches(5.5), Inches(5.0))
                tf_b = tb_b.text_frame
                tf_b.word_wrap = True
                bullets = slide_info.get("bullets", [])
                for b_idx, bullet in enumerate(bullets[:4]):
                    bp = tf_b.paragraphs[0] if b_idx == 0 else tf_b.add_paragraph()
                    bp.text = f"•  {bullet}"
                    bp.font.name = "Arial"
                    bp.font.size = Pt(13)
                    bp.font.color.rgb = COLOR_BLACK
                    bp.space_before = Pt(16)

                add_editorial_footer(s, title_text, page_num_str)

            elif layout == "split_right_image":
                tb_tit = s.shapes.add_textbox(Inches(0.85), Inches(0.8), Inches(5.6), Inches(1.1))
                tf_tit = tb_tit.text_frame
                tf_tit.word_wrap = True
                ptit = tf_tit.paragraphs[0]
                ptit.text = slide_info.get("title", f"Slide {idx}").upper()
                ptit.font.name = "Arial"
                ptit.font.size = Pt(26)
                ptit.font.bold = True
                ptit.font.color.rgb = COLOR_BLACK

                tb_k = s.shapes.add_textbox(Inches(0.85), Inches(1.9), Inches(5.6), Inches(0.4))
                tf_k = tb_k.text_frame
                pk = tf_k.paragraphs[0]
                pk.text = slide_info.get("kicker", f"Topic {idx:02d}")
                pk.font.name = "Arial"
                pk.font.size = Pt(14)
                pk.font.bold = True
                pk.font.color.rgb = COLOR_BLACK

                tb_sum = s.shapes.add_textbox(Inches(0.85), Inches(2.3), Inches(5.6), Inches(1.3))
                tf_sum = tb_sum.text_frame
                tf_sum.word_wrap = True
                psum = tf_sum.paragraphs[0]
                psum.text = slide_info.get("summary", "")
                psum.font.name = "Arial"
                psum.font.size = Pt(12)
                psum.font.color.rgb = COLOR_CHARCOAL

                bullets = slide_info.get("bullets", [])
                for b_idx, bullet in enumerate(bullets[:4]):
                    y_pos = Inches(3.7 + b_idx * 0.68)
                    badge = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.85), y_pos, Inches(0.35), Inches(0.35))
                    badge.fill.solid()
                    badge.fill.fore_color.rgb = COLOR_NAVY
                    badge.line.fill.background()
                    btf = badge.text_frame
                    btf.vertical_anchor = MSO_ANCHOR.MIDDLE
                    bp = btf.paragraphs[0]
                    bp.alignment = PP_ALIGN.CENTER
                    bp.text = f"{b_idx+1:02d}"
                    bp.font.name = "Arial"
                    bp.font.size = Pt(10)
                    bp.font.bold = True
                    bp.font.color.rgb = COLOR_WHITE

                    tb_txt = s.shapes.add_textbox(Inches(1.35), y_pos - Inches(0.06), Inches(5.1), Inches(0.5))
                    tft = tb_txt.text_frame
                    tft.word_wrap = True
                    pt = tft.paragraphs[0]
                    pt.text = bullet
                    pt.font.name = "Arial"
                    pt.font.size = Pt(12)
                    pt.font.color.rgb = COLOR_BLACK

                # Right Side: Deep Navy Framework Card (Replaces Photo)
                box_r = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(0.8), Inches(5.7), Inches(5.5))
                box_r.fill.solid()
                box_r.fill.fore_color.rgb = COLOR_NAVY
                box_r.line.fill.background()

                tb_r_tag = s.shapes.add_textbox(Inches(7.1), Inches(1.1), Inches(5.1), Inches(0.4))
                pr_tag = tb_r_tag.text_frame.paragraphs[0]
                pr_tag.text = "ANALYTICAL FRAMEWORK"
                pr_tag.font.name = "Arial"
                pr_tag.font.size = Pt(11)
                pr_tag.font.bold = True
                pr_tag.font.color.rgb = RGBColor(217, 236, 149)

                tb_r_tit = s.shapes.add_textbox(Inches(7.1), Inches(1.6), Inches(5.1), Inches(1.0))
                tfr_tit = tb_r_tit.text_frame
                tfr_tit.word_wrap = True
                pr_tit = tfr_tit.paragraphs[0]
                pr_tit.text = slide_info.get("title", "").upper()
                pr_tit.font.name = "Arial"
                pr_tit.font.size = Pt(20)
                pr_tit.font.bold = True
                pr_tit.font.color.rgb = COLOR_WHITE

                tb_r_sum = s.shapes.add_textbox(Inches(7.1), Inches(2.8), Inches(5.1), Inches(3.0))
                tfr_sum = tb_r_sum.text_frame
                tfr_sum.word_wrap = True
                pr_sum = tfr_sum.paragraphs[0]
                pr_sum.text = slide_info.get("summary", "")
                pr_sum.font.name = "Arial"
                pr_sum.font.size = Pt(13)
                pr_sum.font.color.rgb = RGBColor(240, 243, 248)

                add_editorial_footer(s, title_text, page_num_str)

            else:  # cards_right
                # Left Side: Contrast Grey Overview Panel (Replaces Photo)
                panel_l = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0.12), Inches(5.8), Inches(6.68))
                panel_l.fill.solid()
                panel_l.fill.fore_color.rgb = RGBColor(222, 222, 224)
                panel_l.line.fill.background()

                box_brief = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.85), Inches(0.8), Inches(4.4), Inches(1.8))
                box_brief.fill.solid()
                box_brief.fill.fore_color.rgb = COLOR_WHITE
                box_brief.line.color.rgb = RGBColor(200, 204, 212)

                tb_br_tag = s.shapes.add_textbox(Inches(1.05), Inches(0.95), Inches(4.0), Inches(0.35))
                pbr_tag = tb_br_tag.text_frame.paragraphs[0]
                pbr_tag.text = "EXECUTIVE BRIEFING"
                pbr_tag.font.name = "Arial"
                pbr_tag.font.size = Pt(11)
                pbr_tag.font.bold = True
                pbr_tag.font.color.rgb = COLOR_NAVY

                tb_br_k = s.shapes.add_textbox(Inches(1.05), Inches(1.35), Inches(4.0), Inches(1.0))
                tfbr_k = tb_br_k.text_frame
                tfbr_k.word_wrap = True
                pbr_k = tfbr_k.paragraphs[0]
                pbr_k.text = slide_info.get("kicker", "Core Strategy")
                pbr_k.font.name = "Arial"
                pbr_k.font.size = Pt(13)
                pbr_k.font.bold = True
                pbr_k.font.color.rgb = COLOR_BLACK

                tb_sum = s.shapes.add_textbox(Inches(0.85), Inches(2.9), Inches(4.4), Inches(3.2))
                tf_sum = tb_sum.text_frame
                tf_sum.word_wrap = True
                psum = tf_sum.paragraphs[0]
                psum.text = slide_info.get("summary", "")
                psum.font.name = "Arial"
                psum.font.size = Pt(13)
                psum.font.color.rgb = COLOR_CHARCOAL

                # Right Side: Navy Banner Cards
                sq = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(6.2), Inches(0.88), Inches(0.22), Inches(0.22))
                sq.fill.solid()
                sq.fill.fore_color.rgb = COLOR_NAVY
                sq.line.fill.background()

                tb_tit = s.shapes.add_textbox(Inches(6.55), Inches(0.8), Inches(6.0), Inches(0.9))
                tf_tit = tb_tit.text_frame
                tf_tit.word_wrap = True
                ptit = tf_tit.paragraphs[0]
                ptit.text = slide_info.get("title", f"Slide {idx}").upper()
                ptit.font.name = "Arial"
                ptit.font.size = Pt(24)
                ptit.font.bold = True
                ptit.font.color.rgb = COLOR_BLACK

                bullets = slide_info.get("bullets", [])
                for b_idx, bullet in enumerate(bullets[:4]):
                    card = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(6.2), Inches(1.85 + b_idx * 1.08), Inches(6.3), Inches(0.82))
                    card.fill.solid()
                    card.fill.fore_color.rgb = COLOR_NAVY
                    card.line.fill.background()
                    ctf = card.text_frame
                    ctf.vertical_anchor = MSO_ANCHOR.MIDDLE
                    ctf.margin_left = Inches(0.25)
                    cp = ctf.paragraphs[0]
                    cp.text = f"{b_idx+1:02d}    {bullet}"
                    cp.font.name = "Arial"
                    cp.font.size = Pt(12)
                    cp.font.bold = True
                    cp.font.color.rgb = COLOR_WHITE

                add_editorial_footer(s, title_text, page_num_str)

            notes_text = slide_info.get("notes", "")
            if notes_text:
                s.notes_slide.notes_text_frame.text = notes_text

        # 3. Last Slide (Thank You)
        s_last = prs.slides.add_slide(blank_layout)
        bg_cover = os.path.join(tmpl_dir_editorial, "bg_cover.png")
        if os.path.exists(bg_cover):
            s_last.shapes.add_picture(bg_cover, Inches(0), Inches(0), width=prs.slide_width, height=prs.slide_height)

        tb_k_last = s_last.shapes.add_textbox(Inches(0.85), Inches(1.2), Inches(6.0), Inches(0.5))
        tf_k_last = tb_k_last.text_frame
        p_kl = tf_k_last.paragraphs[0]
        p_kl.text = "Summary & Key Takeaways"
        p_kl.font.name = "Arial"
        p_kl.font.size = Pt(13)
        p_kl.font.bold = True
        p_kl.font.color.rgb = COLOR_MUTED

        tb_last = s_last.shapes.add_textbox(Inches(0.85), Inches(1.8), Inches(6.8), Inches(1.8))
        tf_last = tb_last.text_frame
        p_last = tf_last.paragraphs[0]
        p_last.text = "THANK YOU"
        p_last.font.name = "Arial"
        p_last.font.size = Pt(46)
        p_last.font.bold = True
        p_last.font.color.rgb = COLOR_BLACK

        tb_sum_last = s_last.shapes.add_textbox(Inches(0.85), Inches(3.6), Inches(6.8), Inches(1.8))
        tf_sum_last = tb_sum_last.text_frame
        tf_sum_last.word_wrap = True
        p_sl = tf_sum_last.paragraphs[0]
        p_sl.text = f"Key takeaways and strategic conclusions for: {title_text}"
        p_sl.font.name = "Arial"
        p_sl.font.size = Pt(14)
        p_sl.font.color.rgb = COLOR_CHARCOAL

        add_editorial_footer(s_last, title_text, f"Page {len(slides_data) + 2:02d}")

    elif has_hexagons:
        # ========================================================
        # TEMPLATE 1: Warm Earthy Hexagons (Sample 1)
        # ========================================================
        COLOR_TITLE = RGBColor(59, 34, 19)      # Warm dark chocolate
        COLOR_SUBTITLE = RGBColor(92, 68, 54)   # Warm bronze brown
        COLOR_BODY = RGBColor(66, 55, 48)       # Readable dark charcoal-brown

        # 1. First Slide (Title)
        s1 = prs.slides.add_slide(blank_layout)
        s1.shapes.add_picture(f_first, Inches(0), Inches(0), width=prs.slide_width, height=prs.slide_height)

        tb1 = s1.shapes.add_textbox(Inches(0.85), Inches(3.8), Inches(7.5), Inches(2.5))
        tf1 = tb1.text_frame
        tf1.word_wrap = True
        p1 = tf1.paragraphs[0]
        p1.text = title_text
        p1.font.name = "Georgia"
        p1.font.size = Pt(36)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_TITLE
        p1.alignment = PP_ALIGN.LEFT

        p1_sub = tf1.add_paragraph()
        p1_sub.text = "KEY TAKEAWAYS & EXECUTIVE SUMMARY"
        p1_sub.font.name = "Arial"
        p1_sub.font.size = Pt(13)
        p1_sub.font.bold = True
        p1_sub.font.color.rgb = COLOR_SUBTITLE
        p1_sub.space_before = Pt(14)

        # 2. Content Slides
        for idx, slide_info in enumerate(slides_data, start=1):
            s = prs.slides.add_slide(blank_layout)
            s.shapes.add_picture(f_body, Inches(0), Inches(0), width=prs.slide_width, height=prs.slide_height)

            # Header Title Box
            h_box = s.shapes.add_textbox(Inches(0.85), Inches(1.5), Inches(7.8), Inches(1.2))
            htf = h_box.text_frame
            htf.word_wrap = True
            hp = htf.paragraphs[0]
            hp.text = slide_info.get("title", f"Slide {idx}")
            hp.font.name = "Georgia"
            hp.font.size = Pt(30)
            hp.font.bold = True
            hp.font.color.rgb = COLOR_TITLE

            # Content Bullets Box
            b_box = s.shapes.add_textbox(Inches(0.85), Inches(2.7), Inches(7.8), Inches(4.2))
            btf = b_box.text_frame
            btf.word_wrap = True
            bullets = slide_info.get("bullets", [])
            for b_idx, bullet in enumerate(bullets):
                bp = btf.paragraphs[0] if b_idx == 0 else btf.add_paragraph()
                bp.text = f"•  {bullet}"
                bp.font.name = "Arial"
                bp.font.size = Pt(16)
                bp.font.color.rgb = COLOR_BODY
                bp.space_before = Pt(12)

            # Speaker Notes
            notes_text = slide_info.get("notes", "")
            if notes_text:
                s.notes_slide.notes_text_frame.text = notes_text

        # 3. Last Slide (Thank You)
        s_last = prs.slides.add_slide(blank_layout)
        s_last.shapes.add_picture(f_last, Inches(0), Inches(0), width=prs.slide_width, height=prs.slide_height)

        tb_last = s_last.shapes.add_textbox(Inches(0.85), Inches(4.2), Inches(6.8), Inches(2.2))
        tf_last = tb_last.text_frame
        tf_last.word_wrap = True
        p_last = tf_last.paragraphs[0]
        p_last.text = "Thank you"
        p_last.font.name = "Georgia"
        p_last.font.size = Pt(46)
        p_last.font.bold = True
        p_last.font.color.rgb = COLOR_TITLE

        p_last_sub = tf_last.add_paragraph()
        p_last_sub.text = f"Key takeaways & insights on: {title_text}"
        p_last_sub.font.name = "Arial"
        p_last_sub.font.size = Pt(13)
        p_last_sub.font.bold = False
        p_last_sub.font.color.rgb = COLOR_SUBTITLE
        p_last_sub.space_before = Pt(12)

    else:
        # ========================================================
        # TEMPLATE 2: Modern Dark (Classic Midnight Lime)
        # ========================================================
        BRAND_BLACK = RGBColor(14, 15, 12)       # #0E0F0C
        BRAND_LIME = RGBColor(217, 236, 149)     # #D9EC95
        TEXT_WHITE = RGBColor(242, 242, 240)     # #F2F2F0

        # Title Slide
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

        # Content Slides
        for idx, slide_info in enumerate(slides_data, start=1):
            s = prs.slides.add_slide(blank_layout)
            bg = s.background
            fill = bg.fill
            fill.solid()
            fill.fore_color.rgb = BRAND_BLACK

            header_box = s.shapes.add_textbox(Inches(1.0), Inches(0.8), Inches(11.333), Inches(1.2))
            htf = header_box.text_frame
            htf.word_wrap = True
            hp = htf.paragraphs[0]
            hp.text = f"{idx}. {slide_info.get('title', 'Slide')}"
            hp.font.size = Pt(28)
            hp.font.bold = True
            hp.font.color.rgb = BRAND_LIME

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

            notes_text = slide_info.get("notes", "")
            if notes_text:
                s.notes_slide.notes_text_frame.text = notes_text

    if output_path:
        prs.save(output_path)
        with open(output_path, "rb") as f:
            return f.read()

    out = io.BytesIO()
    prs.save(out)
    return out.getvalue()
