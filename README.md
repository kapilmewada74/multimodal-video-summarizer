# Multimodal Video Summarizer & RAG Assistant

**An AI-powered platform for intelligent video summarization, transcript extraction, and knowledge assistance.**

Transform lengthy videos into concise, structured, and meaningful summaries. This project combines multimodal processing, automatic speech recognition, and generative AI to help users understand educational content efficiently.

---

## Overview

The **Multimodal Video Summarizer** is an AI-powered application designed to extract meaningful information from video and audio content and convert it into structured, easy-to-understand summaries.

Users can provide video URLs or upload their own video and audio files. The system extracts spoken content, generates transcripts, and processes the extracted information using AI-powered summarization techniques.

The platform also aims to provide a Retrieval-Augmented Generation (RAG) assistant for interacting with video-based knowledge.

Whether you are a student, researcher, educator, or professional, this application helps reduce the time required to understand lengthy video content.

---

## Key Features

### 1. Video Summarization
- Summarize videos directly from supported URLs.
- Upload local video files for summarization.
- Extract meaningful information from lengthy videos.
- Generate concise and structured summaries.
- Organize generated content into meaningful sections.

### 2. Audio & Transcript Processing
- Support audio and video uploads.
- Extract transcripts from video content.
- Use YouTube transcript extraction when available.
- Automatic speech recognition using Faster-Whisper as a fallback.
- Support multilingual speech recognition.

### 3. AI-Powered Summarization
- Convert lengthy transcripts into concise summaries.
- Generate structured educational notes.
- Preserve important concepts and technical information.
- Organize information using headings and bullet points.
- Reduce unnecessary conversational content.

### 4. RAG-Based Knowledge Assistant
- Designed to make video-derived information accessible through conversational queries.
- Support knowledge retrieval from processed content.
- Help users understand specific topics without watching the entire video again.

### 5. Modern Web Interface
- Modern and responsive user interface.
- Easy video and audio upload workflow.
- Simple URL-based video processing.
- Organized presentation of generated summaries.
- User-friendly frontend experience.

---

##  System Architecture

The application follows a modular architecture that separates the frontend, backend, media processing, transcription, and AI summarization components.

```text
              USER
                |
                v
       FRONTEND APPLICATION
                |
                v
         BACKEND API
                |
                v
       INPUT PROCESSING
          /         \
         /           \
   VIDEO URL      FILE UPLOAD
         \           /
          \         /
                |
                v
        AUDIO EXTRACTION
                |
                v
       TRANSCRIPTION ENGINE
          /          \
         /            \
 YouTube Transcript  Faster-Whisper
         \            /
          \          /
                |
                v
         GENERATED TRANSCRIPT
                |
                v
        AI SUMMARIZATION
                |
                v
       STRUCTURED SUMMARY
                |
                v
       RAG KNOWLEDGE ASSISTANT
                |
                v
        RESULTS TO THE USER
```

---

## Technology Stack

| Component | Technologies |
|---|---|
| Programming Language | Python |
| Frontend | Next.js, React, TypeScript |
| Backend | FastAPI |
| Styling | Tailwind CSS |
| Speech Recognition | Faster-Whisper |
| Video Processing | yt-dlp, FFmpeg |
| Transcript Extraction | YouTube Transcript API |
| AI Summarization | Large Language Models (LLMs) |
| GPU Acceleration | CUDA, cuDNN |
| API Communication | REST API |
| Version Control | Git & GitHub |

---

## Installation & Setup

Follow these steps to run the project locally.

### Prerequisites

Make sure you have installed:

- Python 3.10 or later (use a version compatible with the project dependencies).
- Node.js and npm.
- Git.
- FFmpeg.
- CUDA-compatible NVIDIA GPU and drivers (optional, for GPU acceleration).

### 1. Clone the Repository

```bash
git clone https://github.com/kapilmewada74/multimodal-video-summarizer.git
```

Navigate to the project directory:

```bash
cd multimodal-video-summarizer
```

### 2. Backend Setup

Create a Python virtual environment:

```bash
python -m venv venv
```

Activate the environment on Windows:

```powershell
venv\Scripts\activate
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Configure the required environment variables according to your AI provider and backend configuration.

### 3. Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the application in your browser at:

```text
http://localhost:3000
```

### 4. Start the Backend

Start the backend using the configured application entry point and API server.

For a FastAPI application exposed as `app` in `app.py`, the command is:

```bash
uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

If your application uses a different entry point, adjust the module path accordingly.

---

## Application Workflow

1. **Input:** Provide a supported video URL or upload a video/audio file.
2. **Processing:** The backend processes the input and extracts audio when required.
3. **Transcription:** The system retrieves an available transcript or generates one using speech recognition.
4. **Summarization:** The extracted transcript is processed by an AI language model.
5. **Knowledge Generation:** The application organizes the extracted information into structured content.
6. **Output:** The generated summary is presented through the web interface.

---

## Project Documentation

Detailed technical documentation and design specifications are available below:

- [**UI Design System & Architecture Specification**](https://github.com/kapilmewada74/multimodal-video-summarizer/blob/main/docs/UI_DESIGN_SYSTEM.md) — Design guidelines, design tokens, component anatomy, interface structure, and product workflows.
- [**Contributing Guide**](https://github.com/kapilmewada74/multimodal-video-summarizer/blob/main/CONTRIBUTING.md) — Guidelines for contributing to the project.

---

## Future Enhancements

Potential areas for future development include:

- Advanced Retrieval-Augmented Generation (RAG) capabilities.
- Interactive question-answering over video content.
- Automatic generation of educational notes and study materials.
- Timestamp-based summary navigation.
- Improved multilingual transcription and summarization.
- Video chapter detection and topic segmentation.
- Export summaries into PDF and other document formats.
- Improved processing performance and scalability.

---

##  Contributing

Contributions are welcome!

If you would like to improve this project, fix a bug, optimize the summarization pipeline, introduce new features, or improve the documentation, you are welcome to contribute.

Please read the [**Contributing Guide**](https://github.com/kapilmewada74/multimodal-video-summarizer/blob/main/CONTRIBUTING.md) before submitting changes.

### Quick Contribution Workflow

1. Fork the repository.
2. Clone your fork.
3. Create a new branch.
4. Make your changes.
5. Test your changes.
6. Push your branch.
7. Open a Pull Request.

[**Read the Full Contributing Guide**](https://github.com/kapilmewada74/multimodal-video-summarizer/blob/main/CONTRIBUTING.md)

---

## Developer

**Kapil Mewada**

- GitHub: [@kapilmewada74](https://github.com/kapilmewada74)
- Project Repository: [Multimodal Video Summarizer](https://github.com/kapilmewada74/multimodal-video-summarizer)

---

##  License

Please refer to the repository's license file for licensing information.

---

<p align="center">
  <b>Built with AI to make learning smarter, faster, and more accessible.</b>
</p>

<p align="center">
   If you find this project useful, consider giving it a star!
</p>