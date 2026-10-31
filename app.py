import os
import uuid
import shutil
import threading
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from dotenv import load_dotenv

# Load server environment variables (.env)
load_dotenv()

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from services import (
    jobs,
    jobs_lock,
    get_job,
    update_job,
    is_valid_youtube_url,
    run_pipeline_for_url,
    run_pipeline_for_upload,
    get_history,
    DOWNLOAD_DIR,
    OUTPUT_DIR,
    BASE_DIR
)
import generators

app = FastAPI(
    title="Multimodal Video Summarizer",
    description="Tool-first, market-level AI video summarizer powered by local Whisper and Qwen models.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STATIC_DIR = os.path.join(BASE_DIR, "static")
os.makedirs(STATIC_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


class URLRequest(BaseModel):
    url: str
    mode: Optional[str] = "educational"


ALLOWED_EXTENSIONS = {".mp4", ".mov", ".mkv", ".avi", ".webm", ".mp3", ".wav", ".m4a"}


@app.get("/")
async def index():
    index_file = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"message": "Multimodal Video Summarizer API running. Static UI not found."}


@app.get("/api/health")
async def health():
    import torch
    device = "mps" if torch.backends.mps.is_available() else ("cuda" if torch.cuda.is_available() else "cpu")
    return {
        "status": "healthy",
        "device": device,
        "active_jobs": len([j for j in jobs.values() if j.get("status") == "processing"])
    }


@app.post("/api/summarize/url")
async def summarize_url(payload: URLRequest):
    url = (payload.url or "").strip()
    if not url:
        raise HTTPException(status_code=400, detail="YouTube URL is required.")

    if not is_valid_youtube_url(url):
        raise HTTPException(
            status_code=400,
            detail="Invalid YouTube URL. Please enter a valid YouTube link (e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...)."
        )

    job_id = str(uuid.uuid4())[:8]
    with jobs_lock:
        jobs[job_id] = {
            "id": job_id,
            "type": "url",
            "url": url,
            "mode": payload.mode or "educational",
            "status": "queued",
            "step": 0,
            "step_name": "Queued",
            "progress": 0,
            "message": "Initializing video processing task...",
            "result": None,
            "error": None
        }

    thread = threading.Thread(
        target=run_pipeline_for_url,
        args=(job_id, url, payload.mode or "educational"),
        daemon=True
    )
    thread.start()

    return {"job_id": job_id, "status": "queued", "message": "Video summarization task started."}


@app.post("/api/summarize/upload")
async def summarize_upload(
    file: UploadFile = File(...),
    mode: str = Form("educational")
):
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No file was uploaded.")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported format '{ext}'. Allowed formats: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        )

    job_id = str(uuid.uuid4())[:8]
    saved_filename = f"upload_{job_id}_{file.filename}"
    saved_path = os.path.join(DOWNLOAD_DIR, saved_filename)

    with open(saved_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    with jobs_lock:
        jobs[job_id] = {
            "id": job_id,
            "type": "upload",
            "filename": file.filename,
            "mode": mode,
            "status": "queued",
            "step": 0,
            "step_name": "Queued",
            "progress": 0,
            "message": "File uploaded. Initializing audio extraction...",
            "result": None,
            "error": None
        }

    thread = threading.Thread(
        target=run_pipeline_for_upload,
        args=(job_id, saved_path, file.filename, mode),
        daemon=True
    )
    thread.start()

    return {"job_id": job_id, "status": "queued", "message": "File upload accepted and processing."}


@app.get("/api/job/{job_id}")
async def job_status(job_id: str):
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job with ID '{job_id}' not found.")
    return job


@app.get("/api/history")
async def history():
    return get_history()


class GenerateRequest(BaseModel):
    title: str
    summary: str
    transcript: Optional[str] = ""
    apiKey: Optional[str] = None


class PptxRequest(BaseModel):
    title: str
    slides: List[Dict[str, Any]]


@app.post("/api/generate/flashcards")
async def api_generate_flashcards(payload: GenerateRequest):
    try:
        data = generators.generate_flashcards(
            title=payload.title,
            summary=payload.summary,
            transcript=payload.transcript or "",
            api_key=payload.apiKey
        )
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate/presentation")
async def api_generate_presentation(payload: GenerateRequest):
    try:
        data = generators.generate_presentation(
            title=payload.title,
            summary=payload.summary,
            transcript=payload.transcript or "",
            api_key=payload.apiKey
        )
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate/quiz")
async def api_generate_quiz(payload: GenerateRequest):
    try:
        data = generators.generate_quiz(
            title=payload.title,
            summary=payload.summary,
            transcript=payload.transcript or "",
            api_key=payload.apiKey
        )
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/download/pptx")
async def api_download_pptx(payload: PptxRequest):
    try:
        temp_filename = f"presentation_{uuid.uuid4().hex[:8]}.pptx"
        output_path = os.path.join(OUTPUT_DIR, temp_filename)
        generators.build_pptx_file(payload.model_dump(), output_path)
        
        return FileResponse(
            output_path,
            filename=f"{(payload.title or 'Presentation').replace(' ', '_')}.pptx",
            media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to compile PPTX: {e}")


if __name__ == "__main__":
    import uvicorn
    print("\nStarting Multimodal Video Summarizer on http://127.0.0.1:8000 ...")
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=False)
