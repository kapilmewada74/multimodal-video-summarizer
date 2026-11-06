import os
import re
import sys
import uuid
import time
import shutil
import logging
import threading
from typing import Dict, Any, Optional
from dotenv import load_dotenv

# Safe stdout/stderr wrapper to prevent [Errno 5] Input/output error on detached terminals
class SafeStream:
    """Safely wraps stdout/stderr to prevent [Errno 5] Input/output error on detached or closed terminals."""
    def __init__(self, stream):
        self._stream = stream
    def write(self, data):
        try:
            return self._stream.write(data)
        except (OSError, IOError):
            return len(data) if data else 0
    def flush(self):
        try:
            return self._stream.flush()
        except (OSError, IOError):
            pass
    def isatty(self):
        try:
            return self._stream.isatty()
        except (OSError, IOError):
            return False
    def fileno(self):
        try:
            return self._stream.fileno()
        except (OSError, IOError, AttributeError):
            raise OSError(5, "Input/output error")
    def __getattr__(self, name):
        return getattr(self._stream, name)

if not isinstance(sys.stdout, SafeStream):
    sys.stdout = SafeStream(sys.stdout)
if not isinstance(sys.stderr, SafeStream):
    sys.stderr = SafeStream(sys.stderr)

# Ensure environment variables are loaded
load_dotenv()

import yt_dlp

# Configure project directories
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DOWNLOAD_DIR = os.path.join(BASE_DIR, "downloads")
AUDIO_DIR = os.path.join(BASE_DIR, "audio")
OUTPUT_DIR = os.path.join(BASE_DIR, "output")
HISTORY_FILE = os.path.join(OUTPUT_DIR, "history.json")

os.makedirs(DOWNLOAD_DIR, exist_ok=True)
os.makedirs(AUDIO_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

logger = logging.getLogger("summarizer_services")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

class YTDLPSafeLogger:
    """Custom logger for yt-dlp to avoid raw ANSI progress strings on closed ttys."""
    def debug(self, msg):
        pass
    def info(self, msg):
        pass
    def warning(self, msg):
        pass
    def error(self, msg):
        logger.error(f"[yt-dlp] {msg}")

# Global model caches
_whisper_instance = None
_llm_instance = None
_model_lock = threading.Lock()

# Jobs store
jobs: Dict[str, Dict[str, Any]] = {}
jobs_lock = threading.Lock()


def get_whisper_model():
    """Lazily load Faster-Whisper with CUDA/GPU acceleration, falling back to CPU."""
    global _whisper_instance
    with _model_lock:
        if _whisper_instance is None:
            from pipeline import load_whisper
            _whisper_instance = load_whisper()
        return _whisper_instance


def get_llm():
    """Return local LLM or Groq wrapper if requested."""
    global _llm_instance
    with _model_lock:
        if _llm_instance is None:
            try:
                from summarize import create_llm
                _llm_instance = create_llm()
            except Exception as e:
                logger.warning(f"Could not load Groq client in get_llm: {e}")
        return _llm_instance


def update_job(job_id: str, **kwargs):
    with jobs_lock:
        if job_id in jobs:
            jobs[job_id].update(kwargs)
            jobs[job_id]["updated_at"] = time.time()


def get_job(job_id: str) -> Optional[Dict[str, Any]]:
    with jobs_lock:
        return jobs.get(job_id)


def is_valid_youtube_url(url: str) -> bool:
    if not url or not isinstance(url, str):
        return False
    url = url.strip()
    patterns = [
        r'^(https?://)?(www\.)?(youtube\.com/watch\?v=[\w-]{11})',
        r'^(https?://)?(www\.)?(youtu\.be/[\w-]{11})',
        r'^(https?://)?(www\.)?(youtube\.com/shorts/[\w-]{11})',
        r'^(https?://)?(www\.)?(youtube\.com/embed/[\w-]{11})'
    ]
    return any(re.match(p, url) for p in patterns)


def extract_audio_from_file(input_file: str, output_wav: str) -> str:
    import subprocess
    cmd = [
        "ffmpeg", "-y", "-i", input_file,
        "-vn", "-acodec", "pcm_s16le",
        "-ar", "16000", "-ac", "1",
        output_wav
    ]
    res = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        raise RuntimeError(f"FFmpeg audio extraction failed: {res.stderr.strip()[:200]}")
    return output_wav


def clean_and_deduplicate_summary(text: str) -> str:
    """Clean hallucinated CJK characters and deduplicate repeating summary blocks while preserving full detailed content."""
    if not text:
        return ""

    # Strip CJK characters and CJK punctuation
    cleaned = re.sub(r'[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af\u3000-\u303f\uff00-\uffef]+', '', text)
    cleaned = re.sub(r'\(\s*\)', '', cleaned)
    cleaned = re.sub(r'\(\s*Section\s*\d*\s*\)', '', cleaned)
    cleaned = re.sub(r'\*\*\s*\*\*', '', cleaned)
    cleaned = re.sub(r'^\s*[-*]\s*[-*:\s]*$', '', cleaned, flags=re.MULTILINE)

    # 1. Check if the text contains multiple '# Video Summary' or '# Summary' blocks
    pattern = r'(?=(?:^|\n)#+\s*(?:Video\s+)?Summary)'
    blocks = [b.strip() for b in re.split(pattern, cleaned, flags=re.IGNORECASE) if b.strip()]
    if len(blocks) > 1:
        best_block = max(blocks, key=len)
        cleaned = best_block

    # 2. Check if a major section like '## Main Topic' or '## 1. Main Topic' repeats within the text
    m = re.search(r'(##\s*(?:\d+\.\s*)?Main Topic)', cleaned, re.IGNORECASE)
    if m:
        first_header = m.group(1)
        second_pos = cleaned.lower().find(first_header.lower(), m.end())
        if second_pos != -1 and second_pos > m.end() + 100:
            cleaned = cleaned[:second_pos].strip()

    # 3. Clean any artificial trailing delimiters
    cleaned = re.sub(r'\n\s*---\s*$', '', cleaned).strip()
    return re.sub(r'\n{3,}', '\n\n', cleaned).strip()


def run_pipeline_for_url(job_id: str, url: str, mode: str = "educational"):
    """
    High-Speed Video Pipeline:
    1. Instantly queries existing YouTube captions (taking ~0.5s).
    2. If captions not present, downloads low-bitrate stream and uses Faster-Whisper GPU (~3-5s).
    3. Runs high-speed Groq AI summarization (~2-4s) with Gemini fallback.
    Total pipeline execution: typically 2 to 8 seconds!
    """
    try:
        update_job(
            job_id,
            status="processing",
            step=1,
            step_name="Connecting to YouTube",
            progress=15,
            message="Connecting to YouTube and retrieving metadata..."
        )

        # 1. Fast metadata extraction (title, duration) without downloading media bytes
        video_title = "YouTube Video"
        video_duration = 0
        try:
            ydl_opts_meta = {
                "quiet": True,
                "no_warnings": True,
                "skip_download": True,
                "logger": YTDLPSafeLogger(),
                "http_headers": {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
                }
            }
            with yt_dlp.YoutubeDL(ydl_opts_meta) as ydl:
                info = ydl.extract_info(url, download=False)
                video_title = info.get("title", "YouTube Video")
                video_duration = info.get("duration", 0)
        except Exception as meta_err:
            logger.warning(f"Metadata lookup warning: {meta_err}")

        update_job(job_id, video_title=video_title, duration=video_duration)

        # 2. Check for YouTube captions first (Instant, < 1s)
        update_job(
            job_id,
            step=2,
            step_name="Checking Captions",
            progress=35,
            message="Checking for official/auto-generated video captions..."
        )
        
        from pipeline import fetch_youtube_transcript, convert_to_english_script
        transcript = None
        try:
            transcript = fetch_youtube_transcript(url)
        except Exception as cap_err:
            logger.warning(f"Caption fetch warning: {cap_err}")

        if transcript and transcript.strip():
            logger.info("Retrieved transcript instantly via YouTube captions.")
            update_job(
                job_id,
                step=2,
                step_name="Formatting Transcript",
                progress=65,
                message="Processing and formatting transcript..."
            )
            try:
                transcript = convert_to_english_script(transcript)
            except Exception:
                pass
        else:
            # Fallback: Download audio and transcribe with Faster-Whisper
            logger.info("No captions available; falling back to Faster-Whisper audio transcription...")
            update_job(
                job_id,
                step=2,
                step_name="Faster-Whisper Transcription",
                progress=40,
                message="No captions found. Downloading 144p audio stream for Faster-Whisper..."
            )
            from pipeline import download_video, extract_audio, load_whisper, transcribe_audio, delete_audio

            video_path = download_video(url)
            audio_path = extract_audio(video_path)
            try:
                whisper_model = load_whisper()
                transcript = transcribe_audio(whisper_model, audio_path)
                transcript = convert_to_english_script(transcript)
            finally:
                delete_audio(audio_path)

        if not transcript or not transcript.strip():
            raise ValueError("No audible speech or transcript could be extracted from this video.")

        # 3. Summarize in 2-5 seconds via Groq / Gemini
        _summarize_and_complete(job_id, transcript, video_title, video_duration, mode)

    except Exception as e:
        logger.error(f"Job {job_id} failed: {e}", exc_info=True)
        update_job(job_id, status="failed", error=str(e), message=f"Pipeline error: {str(e)}")


def run_pipeline_for_upload(job_id: str, uploaded_file_path: str, original_filename: str, mode: str = "educational"):
    """
    High-Speed Media Upload Pipeline:
    1. Extracts 16kHz audio stream.
    2. Transcribes with Faster-Whisper GPU/CPU.
    3. Summarizes via Groq/Gemini in 2-5 seconds.
    """
    audio_path = None
    try:
        update_job(
            job_id,
            status="processing",
            step=1,
            step_name="Extracting Audio",
            progress=25,
            message="Extracting 16kHz audio stream from uploaded file...",
            video_title=original_filename
        )

        audio_path = os.path.join(AUDIO_DIR, f"audio_{job_id}.wav")
        extract_audio_from_file(uploaded_file_path, audio_path)

        # Cleanup original uploaded file
        if os.path.exists(uploaded_file_path):
            try:
                os.remove(uploaded_file_path)
            except Exception:
                pass

        update_job(
            job_id,
            step=2,
            step_name="Faster-Whisper Transcription",
            progress=50,
            message="Transcribing speech with Faster-Whisper..."
        )
        from pipeline import load_whisper, transcribe_audio, convert_to_english_script

        whisper_model = load_whisper()
        transcript = transcribe_audio(whisper_model, audio_path)
        transcript = convert_to_english_script(transcript)

        if not transcript or not transcript.strip():
            raise ValueError("No audible speech detected in the uploaded file.")

        _summarize_and_complete(job_id, transcript, original_filename, 0, mode)

    except Exception as e:
        logger.error(f"Job {job_id} upload failed: {e}", exc_info=True)
        update_job(job_id, status="failed", error=str(e), message=f"Upload processing failed: {str(e)}")
    finally:
        if audio_path and os.path.exists(audio_path):
            try:
                os.remove(audio_path)
            except Exception:
                pass


def _summarize_and_complete(job_id: str, transcript: str, title: str, duration: int, mode: str):
    """
    Summarize transcript in 2-5 seconds using Groq API, with Gemini API fallback.
    """
    update_job(
        job_id,
        step=3,
        step_name="AI Summarization",
        progress=75,
        message="Generating structured study summary in seconds with Groq AI..."
    )

    # 1. Save transcript to output/transcript.txt
    transcript_file = os.path.join(OUTPUT_DIR, "transcript.txt")
    with open(transcript_file, "w", encoding="utf-8") as f:
        f.write(transcript)

    final_summary = None
    engine_used = "Groq"

    # Engine 1: Groq API (Ultra-fast, 2-5 seconds)
    try:
        from summarize import create_llm, generate_summary
        client = create_llm()
        summary, elapsed = generate_summary(transcript, client)
        if summary and summary.strip():
            final_summary = summary
            engine_used = f"Groq ({os.getenv('MODEL_NAME', 'openai/gpt-oss-20b')})"
            logger.info(f"Groq generated summary in {elapsed:.2f} seconds.")
    except Exception as groq_err:
        logger.warning(f"Groq summarization encountered error: {groq_err}. Falling back to Gemini...")

    # Engine 2: Google Gemini Fallback (1-3 seconds)
    if not final_summary:
        try:
            from generators import _call_gemini_rest
            from summarize import SUMMARY_PROMPT
            prompt = f"{SUMMARY_PROMPT}\n\nTRANSCRIPT:\n{transcript}"
            gemini_res = _call_gemini_rest(prompt, "You are an expert video summarization AI.")
            if gemini_res and gemini_res[0]:
                final_summary = gemini_res[0]
                engine_used = f"Gemini ({gemini_res[1]})"
                logger.info("Gemini successfully generated summary fallback.")
        except Exception as gem_err:
            logger.warning(f"Gemini summarization fallback encountered error: {gem_err}")

    if not final_summary or not final_summary.strip():
        raise RuntimeError("All AI summarization engines (Groq and Gemini) failed to produce a summary. Check API keys and network connection.")

    final_summary = clean_and_deduplicate_summary(final_summary)

    # 2. Save summary to output/summary.txt
    summary_file = os.path.join(OUTPUT_DIR, "summary.txt")
    with open(summary_file, "w", encoding="utf-8") as f:
        f.write(final_summary)

    # 3. Save to history
    _append_history({
        "job_id": job_id,
        "title": title,
        "duration": duration,
        "timestamp": time.time(),
        "summary": final_summary,
        "transcript": transcript,
        "mode": mode,
        "engine": engine_used
    })

    # 4. Mark job completed
    update_job(
        job_id,
        status="completed",
        step=3,
        step_name="Complete",
        progress=100,
        message=f"Video successfully summarized in seconds with {engine_used}!",
        result={
            "title": title,
            "duration": duration,
            "transcript": transcript,
            "summary": final_summary,
            "mode": mode,
            "engine": engine_used
        }
    )


def _append_history(entry: Dict[str, Any]):
    import json
    history = []
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, "r", encoding="utf-8") as f:
                history = json.load(f)
        except Exception:
            history = []
    history.insert(0, entry)
    # keep last 20 entries
    history = history[:20]
    try:
        with open(HISTORY_FILE, "w", encoding="utf-8") as f:
            json.dump(history, f, indent=2, ensure_ascii=False)
    except Exception as e:
        logger.warning(f"Could not write history file: {e}")


def get_history():
    import json
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []
    return []
