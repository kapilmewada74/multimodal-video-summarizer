import os
import re
import sys
import uuid
import time
import shutil
import logging
import threading
from typing import Dict, Any, Optional

import yt_dlp
import whisper
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
from langchain_huggingface import HuggingFacePipeline, ChatHuggingFace
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# Configure directories
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

# Global model caches
_whisper_model = None
_llm_instance = None
_model_lock = threading.Lock()

# Jobs store
jobs: Dict[str, Dict[str, Any]] = {}
jobs_lock = threading.Lock()


def get_whisper_model(model_name: str = "base"):
    global _whisper_model
    with _model_lock:
        if _whisper_model is None:
            logger.info(f"Loading Whisper model '{model_name}'...")
            _whisper_model = whisper.load_model(model_name)
            logger.info("Whisper model loaded successfully.")
        return _whisper_model


def get_llm():
    global _llm_instance
    with _model_lock:
        if _llm_instance is None:
            model_id = "Qwen/Qwen2.5-0.5B-Instruct"
            logger.info(f"Loading local LLM '{model_id}'...")
            tokenizer = AutoTokenizer.from_pretrained(model_id)
            device = "mps" if torch.backends.mps.is_available() else "cpu"
            model = AutoModelForCausalLM.from_pretrained(model_id).to(device)

            pipe = pipeline(
                "text-generation",
                model=model,
                tokenizer=tokenizer,
                max_new_tokens=1500,
                temperature=0.2,
                do_sample=True,
                return_full_text=False
            )
            hf_pipe = HuggingFacePipeline(pipeline=pipe)
            _llm_instance = ChatHuggingFace(llm=hf_pipe)
            logger.info(f"Local LLM loaded on {device}.")
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


def run_pipeline_for_url(job_id: str, url: str, mode: str = "educational"):
    audio_path = None
    video_path = None
    try:
        update_job(job_id, status="processing", step=1, step_name="Downloading Video", progress=15, message="Connecting to YouTube and extracting stream...")
        
        output_template = os.path.join(DOWNLOAD_DIR, f"yt_{job_id}.%(ext)s")
        ydl_opts = {
            "format": "bestaudio/bestvideo[height<=144]+bestaudio/best[height<=144]/best",
            "outtmpl": output_template,
            "noplaylist": True,
            "quiet": True,
            "extractor_args": {
                "youtube": {
                    "player_client": ["android", "ios"]
                }
            },
            "http_headers": {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
            }
        }

        video_title = "YouTube Video"
        video_duration = 0
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            video_title = info.get("title", "YouTube Video")
            video_duration = info.get("duration", 0)
            filename = ydl.prepare_filename(info)

        candidates = [
            filename,
            os.path.splitext(filename)[0] + ".mp4",
            os.path.splitext(filename)[0] + ".m4a",
            os.path.splitext(filename)[0] + ".webm",
            os.path.splitext(filename)[0] + ".opus",
        ]
        for f in candidates:
            if os.path.exists(f):
                video_path = f
                break

        if not video_path and os.path.exists(DOWNLOAD_DIR):
            prefix = f"yt_{job_id}."
            for fname in os.listdir(DOWNLOAD_DIR):
                if fname.startswith(prefix):
                    video_path = os.path.join(DOWNLOAD_DIR, fname)
                    break

        if not video_path:
            raise FileNotFoundError("Downloaded YouTube media could not be located.")

        update_job(job_id, step=1, step_name="Extracting Audio", progress=30, message="Extracting 16kHz audio stream...", video_title=video_title, duration=video_duration)
        
        audio_path = os.path.join(AUDIO_DIR, f"audio_{job_id}.wav")
        extract_audio_from_file(video_path, audio_path)

        # Cleanup video file to save disk space
        if os.path.exists(video_path):
            try:
                os.remove(video_path)
            except Exception:
                pass

        _transcribe_and_summarize(job_id, audio_path, video_title, video_duration, mode)

    except Exception as e:
        logger.error(f"Job {job_id} failed: {e}", exc_info=True)
        update_job(job_id, status="failed", error=str(e), message="Pipeline processing encountered an error.")
    finally:
        if audio_path and os.path.exists(audio_path):
            try:
                os.remove(audio_path)
            except Exception:
                pass


def run_pipeline_for_upload(job_id: str, uploaded_file_path: str, original_filename: str, mode: str = "educational"):
    audio_path = None
    try:
        update_job(job_id, status="processing", step=1, step_name="Extracting Audio", progress=25, message="Processing uploaded media file...", video_title=original_filename)
        
        audio_path = os.path.join(AUDIO_DIR, f"audio_{job_id}.wav")
        extract_audio_from_file(uploaded_file_path, audio_path)

        # Cleanup uploaded raw file
        if os.path.exists(uploaded_file_path):
            try:
                os.remove(uploaded_file_path)
            except Exception:
                pass

        _transcribe_and_summarize(job_id, audio_path, original_filename, 0, mode)

    except Exception as e:
        logger.error(f"Job {job_id} failed: {e}", exc_info=True)
        update_job(job_id, status="failed", error=str(e), message="File processing encountered an error.")
    finally:
        if audio_path and os.path.exists(audio_path):
            try:
                os.remove(audio_path)
            except Exception:
                pass


def _transcribe_and_summarize(job_id: str, audio_path: str, title: str, duration: int, mode: str):
    # Step 2: Speech to Text
    update_job(job_id, step=2, step_name="Whisper Transcription", progress=45, message="Transcribing speech with OpenAI Whisper (local)...")
    whisper_model = get_whisper_model()

    transcribe_res = whisper_model.transcribe(audio_path, fp16=False)
    transcript = transcribe_res.get("text", "").strip()

    if not transcript:
        update_job(job_id, status="failed", error="No audible speech detected in the audio file.", message="Transcription completed but no speech was detected.")
        return

    # Save to output/transcript.txt for CLI compatibility
    transcript_file = os.path.join(OUTPUT_DIR, "transcript.txt")
    with open(transcript_file, "w", encoding="utf-8") as f:
        f.write(transcript)

    # Step 3: Summarization
    update_job(job_id, step=3, step_name="AI Summarization", progress=75, message="Splitting transcript into semantic chunks and generating summary with Qwen2.5...")
    
    from summarize import SUMMARY_PROMPT, FINAL_SUMMARY_PROMPT
    llm = get_llm()
    summary_prompt = ChatPromptTemplate.from_template(SUMMARY_PROMPT)
    final_prompt = ChatPromptTemplate.from_template(FINAL_SUMMARY_PROMPT)
    parser = StrOutputParser()

    chunk_chain = summary_prompt | llm | parser
    final_chain = final_prompt | llm | parser

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=6000,
        chunk_overlap=500,
        separators=["\n\n", "\n", ". ", " ", ""]
    )
    chunks = splitter.split_text(transcript)

    summaries = []
    for idx, chunk in enumerate(chunks, 1):
        pct = 75 + int((idx / len(chunks)) * 15)
        update_job(job_id, step=3, step_name="AI Summarization", progress=pct, message=f"Summarizing chunk {idx} of {len(chunks)}...")
        res = chunk_chain.invoke({"transcript": chunk})
        summaries.append(res)

    update_job(job_id, step=3, step_name="Synthesizing Final Summary", progress=95, message="Synthesizing final structured summary with formulas...")
    
    if len(summaries) == 1:
        final_summary = summaries[0]
    else:
        combined_summaries = "\n\n".join(f"--- Section {i + 1} ---\n{s}" for i, s in enumerate(summaries))
        final_summary = final_chain.invoke({"summaries": combined_summaries}).strip()

    # Save to output/summary.txt for CLI compatibility
    summary_file = os.path.join(OUTPUT_DIR, "summary.txt")
    with open(summary_file, "w", encoding="utf-8") as f:
        f.write(final_summary)

    # Save to history
    _append_history({
        "job_id": job_id,
        "title": title,
        "duration": duration,
        "timestamp": time.time(),
        "summary": final_summary,
        "transcript": transcript,
        "mode": mode
    })

    update_job(
        job_id,
        status="completed",
        step=3,
        step_name="Complete",
        progress=100,
        message="Video successfully summarized!",
        result={
            "title": title,
            "duration": duration,
            "transcript": transcript,
            "summary": final_summary,
            "mode": mode
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
