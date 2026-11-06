
# import os
# import subprocess
# import yt_dlp
# import whisper

# BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# if BASE_DIR:
#     os.chdir(BASE_DIR)


# # ============================================================
# # CONFIGURATION
# # ============================================================

# VIDEO_URL = input("Enter YouTube URL: ").strip()

# DOWNLOAD_DIR = "downloads"
# AUDIO_DIR = "audio"
# OUTPUT_DIR = "output"

# os.makedirs(DOWNLOAD_DIR, exist_ok=True)
# os.makedirs(AUDIO_DIR, exist_ok=True)
# os.makedirs(OUTPUT_DIR, exist_ok=True)


# # ============================================================
# # STEP 1 — DOWNLOAD YOUTUBE VIDEO
# # ============================================================

# def download_video(url):

#     print("\n" + "=" * 60)
#     print("STEP 1: DOWNLOADING YOUTUBE VIDEO")
#     print("=" * 60)

#     output_template = os.path.join(
#         DOWNLOAD_DIR,
#         "youtube_video.%(ext)s"
#     )

#     ydl_opts = {

#         # Try exactly 144p first.
#         # If unavailable, use the closest available format.
#         "format": (
#             "bestvideo[height=144]+bestaudio/"
#             "best[height=144]/"
#             "bestvideo[height<=144]+bestaudio/"
#             "best[height<=144]"
#         ),

#         "outtmpl": output_template,

#         "merge_output_format": "mp4",

#         "noplaylist": True,

#         "quiet": False,

#         "extractor_args": {
#             "youtube": {
#                 "player_client": ["android", "ios"]
#             }
#         },

#         "http_headers": {
#             "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
#         },
#     }

#     try:

#         with yt_dlp.YoutubeDL(ydl_opts) as ydl:

#             info = ydl.extract_info(
#                 url,
#                 download=True
#             )

#             filename = ydl.prepare_filename(info)

#         # After merging, yt-dlp normally creates MP4
#         possible_files = [
#             os.path.splitext(filename)[0] + ".mp4",
#             filename
#         ]

#         for file in possible_files:

#             if os.path.exists(file):

#                 print("\n✓ Video downloaded successfully")
#                 print("Video:", file)

#                 return file

#         raise FileNotFoundError(
#             "Downloaded video could not be located."
#         )

#     except Exception as e:

#         print("\n✗ Video download failed")
#         print("Error:", e)

#         raise


# # ============================================================
# # STEP 2 — EXTRACT AUDIO
# # ============================================================

# def extract_audio(video_path):

#     print("\n" + "=" * 60)
#     print("STEP 2: EXTRACTING AUDIO")
#     print("=" * 60)

#     audio_path = os.path.join(
#         AUDIO_DIR,
#         "audio.wav"
#     )

#     command = [

#         "ffmpeg",

#         "-y",

#         "-i",
#         video_path,

#         # Remove video stream
#         "-vn",

#         # WAV audio
#         "-acodec",
#         "pcm_s16le",

#         # 16 kHz
#         "-ar",
#         "16000",

#         # Mono
#         "-ac",
#         "1",

#         audio_path
#     ]

#     try:

#         subprocess.run(
#             command,
#             check=True,
#             stdout=subprocess.DEVNULL,
#             stderr=subprocess.DEVNULL
#         )

#         print("\n✓ Audio extracted successfully")
#         print("Audio:", audio_path)


#         # ====================================================
#         # DELETE VIDEO AFTER SUCCESSFUL AUDIO EXTRACTION
#         # ====================================================

#         if os.path.exists(video_path):

#             os.remove(video_path)

#             print("✓ Downloaded video deleted")

#         else:

#             print("Video file was already removed.")


#         return audio_path

#     except FileNotFoundError:

#         print(
#             "\n✗ FFmpeg was not found."
#             "\nInstall FFmpeg and add it to PATH."
#         )

#         raise

#     except subprocess.CalledProcessError as e:

#         print("\n✗ Audio extraction failed")
#         print(e)

#         # IMPORTANT:
#         # Video is NOT deleted if audio extraction fails.

#         raise


# # ============================================================
# # STEP 3 — LOAD OPEN-SOURCE WHISPER MODEL
# # ============================================================

# def load_whisper():

#     print("\n" + "=" * 60)
#     print("STEP 3: LOADING WHISPER MODEL")
#     print("=" * 60)

#     MODEL_NAME = "base"

#     print(
#         f"\nLoading Whisper '{MODEL_NAME}' model..."
#     )

#     try:

#         model = whisper.load_model(
#             MODEL_NAME
#         )

#         print("\n✓ Whisper model loaded")

#         return model

#     except Exception as e:

#         print("\n✗ Whisper model loading failed")
#         print("Error:", e)

#         raise


# # ============================================================
# # STEP 4 — SPEECH TO TEXT
# # ============================================================

# def transcribe_audio(
#     model,
#     audio_path
# ):

#     print("\n" + "=" * 60)
#     print("STEP 4: SPEECH → TEXT")
#     print("=" * 60)

#     print("\nTranscribing audio...")
#     print("Please wait...\n")

#     try:

#         result = model.transcribe(
#             audio_path,

#             # Automatically detect language
#             fp16=False
#         )

#         transcript = result[
#             "text"
#         ].strip()

#         print(
#             "\n✓ Transcription completed"
#         )

#         return transcript

#     except Exception as e:

#         print(
#             "\n✗ Transcription failed"
#         )

#         print(
#             "Error:",
#             e
#         )

#         raise


# # ============================================================
# # STEP 5 — DISPLAY ACTUAL TEXT
# # ============================================================

# def display_transcript(
#     transcript
# ):

#     print("\n")

#     print("=" * 70)
#     print("                    ACTUAL TRANSCRIPT")
#     print("=" * 70)

#     print("\n")

#     print(transcript)

#     print("\n")

#     print("=" * 70)


# # ============================================================
# # STEP 6 — SAVE TEXT
# # ============================================================

# def save_transcript(
#     transcript
# ):

#     print(
#         "\nSaving transcript..."
#     )

#     output_file = os.path.join(
#         OUTPUT_DIR,
#         "transcript.txt"
#     )

#     with open(
#         output_file,
#         "w",
#         encoding="utf-8"
#     ) as file:

#         file.write(
#             transcript
#         )

#     print(
#         "\n✓ Transcript saved"
#     )

#     print(
#         "File:",
#         output_file
#     )

#     return output_file


# # ============================================================
# # STEP 7 — DELETE AUDIO
# # ============================================================

# def delete_audio(
#     audio_path
# ):

#     print(
#         "\nDeleting temporary audio file..."
#     )

#     try:

#         if os.path.exists(
#             audio_path
#         ):

#             os.remove(
#                 audio_path
#             )

#             print(
#                 "✓ Audio file deleted"
#             )

#         else:

#             print(
#                 "Audio file was already removed."
#             )

#     except Exception as e:

#         print(
#             "⚠ Could not delete audio file:"
#         )

#         print(e)


# # ============================================================
# # COMPLETE PIPELINE
# # ============================================================

# def main():

#     print("\n")

#     print("=" * 70)
#     print(
#         "             YOUTUBE VIDEO TRANSCRIPTION PIPELINE"
#     )
#     print("=" * 70)


#     video_path = None
#     audio_path = None

#     try:

#         # ----------------------------------------------------
#         # 1. YouTube → Video
#         # ----------------------------------------------------

#         video_path = download_video(
#             VIDEO_URL
#         )


#         # ----------------------------------------------------
#         # 2. Video → Audio
#         # ----------------------------------------------------

#         audio_path = extract_audio(
#             video_path
#         )


#         # ----------------------------------------------------
#         # 3. Load Whisper
#         # ----------------------------------------------------

#         whisper_model = load_whisper()


#         # ----------------------------------------------------
#         # 4. Audio → Text
#         # ----------------------------------------------------

#         transcript = transcribe_audio(
#             whisper_model,
#             audio_path
#         )


#         # ----------------------------------------------------
#         # 5. Display actual text
#         # ----------------------------------------------------

#         display_transcript(
#             transcript
#         )


#         # ----------------------------------------------------
#         # 6. Save transcript
#         # ----------------------------------------------------

#         transcript_file = save_transcript(
#             transcript
#         )


#         # ----------------------------------------------------
#         # 7. DELETE AUDIO AFTER TRANSCRIPTION
#         # ----------------------------------------------------

#         delete_audio(
#             audio_path
#         )


#         # ----------------------------------------------------
#         # PIPELINE COMPLETE
#         # ----------------------------------------------------

#         print("\n")

#         print("=" * 70)
#         print(
#             "                  PIPELINE COMPLETED"
#         )
#         print("=" * 70)

#         print(
#             "\n✓ YouTube video downloaded"
#         )

#         print(
#             "✓ Audio extracted"
#         )

#         print(
#             "✓ Video automatically deleted"
#         )

#         print(
#             "✓ Whisper transcription completed"
#         )

#         print(
#             "✓ Actual text generated"
#         )

#         print(
#             "✓ Transcript saved"
#         )

#         print(
#             "✓ Audio automatically deleted"
#         )

#         print(
#             f"\nFinal output:"
#         )

#         print(
#             transcript_file
#         )

#     except Exception as e:

#         print("\n")

#         print("=" * 70)
#         print(
#             "                    PIPELINE FAILED"
#         )
#         print("=" * 70)

#         print(
#             "\nError:",
#             e
#         )

#         # ----------------------------------------------------
#         # SAFETY CLEANUP
#         # ----------------------------------------------------
#         #
#         # If transcription fails, DO NOT delete the audio.
#         # This allows you to inspect/reuse it for debugging.
#         #
#         # If audio extraction fails, the video is also kept.
#         # ----------------------------------------------------

#         print(
#             "\nTemporary files have been kept"
#             " because the pipeline failed."
#         )


# # ============================================================
# # RUN PIPELINE
# # ============================================================

# if __name__ == "__main__":

#     main()




import os
import sys
import re
import subprocess

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from pathlib import Path
from urllib.parse import urlparse, parse_qs

import yt_dlp
from youtube_transcript_api import YouTubeTranscriptApi
from indic_transliteration import sanscript


# ============================================================
# CONFIGURATION
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

DOWNLOAD_DIR = BASE_DIR / "downloads"
AUDIO_DIR = BASE_DIR / "audio"
OUTPUT_DIR = BASE_DIR / "output"

CUDA_DLL_PATH = BASE_DIR / "cuda-libs"

WHISPER_MODEL_NAME = "small"
WHISPER_DEVICE = "cuda"
WHISPER_COMPUTE_TYPE = "float16"

# Create project directories
for directory in (DOWNLOAD_DIR, AUDIO_DIR, OUTPUT_DIR):
    directory.mkdir(parents=True, exist_ok=True)


# ============================================================
# CUDA DLL CONFIGURATION
# IMPORTANT: Configure BEFORE importing faster-whisper
# ============================================================

if CUDA_DLL_PATH.is_dir():
    os.environ["PATH"] = (
        str(CUDA_DLL_PATH) + os.pathsep + os.environ.get("PATH", "")
    )

    # Keep the DLL directory handle alive throughout the program.
    if hasattr(os, "add_dll_directory"):
        CUDA_DLL_HANDLE = os.add_dll_directory(str(CUDA_DLL_PATH))
else:
    raise FileNotFoundError(
        f"CUDA DLL directory not found: {CUDA_DLL_PATH}"
    )

# Import only after CUDA DLL configuration.
from faster_whisper import WhisperModel


# ============================================================
# STEP 1 — EXTRACT YOUTUBE VIDEO ID
# ============================================================

def extract_video_id(url):

    parsed = urlparse(url)
    host = parsed.netloc.lower().split(":")[0]

    if host == "youtu.be" or host.endswith(".youtu.be"):
        video_id = parsed.path.strip("/").split("/")[0]

    elif host == "youtube.com" or host.endswith(".youtube.com"):

        if parsed.path == "/watch":
            video_id = parse_qs(parsed.query).get("v", [""])[0]

        elif parsed.path.startswith(("/shorts/", "/embed/", "/live/")):
            parts = parsed.path.strip("/").split("/")
            video_id = parts[1] if len(parts) > 1 else ""

        else:
            video_id = ""

    else:
        raise ValueError("Please provide a valid YouTube URL.")

    if not re.fullmatch(r"[A-Za-z0-9_-]{11}", video_id):
        raise ValueError("Could not extract a valid YouTube video ID.")

    return video_id


# ============================================================
# STEP 2 — FETCH EXISTING YOUTUBE TRANSCRIPT
# ============================================================

def fetch_youtube_transcript(url):

    print("\n" + "=" * 65)
    print("STEP 1: CHECKING YOUTUBE CAPTIONS")
    print("=" * 65)

    video_id = extract_video_id(url)

    # Hindi and English captions are supported.
    languages = ["en", "en-US", "en-GB", "hi", "hi-IN"]

    try:
        api = YouTubeTranscriptApi()

        # Current youtube-transcript-api interface
        if hasattr(api, "fetch"):

            try:
                fetched = api.fetch(
                    video_id,
                    languages=languages
                )

                transcript = " ".join(
                    item.text.strip()
                    for item in fetched
                    if item.text.strip()
                ).strip()

                if transcript:
                    print("YouTube captions found.")
                    return transcript

            except Exception as exc:
                print("Direct caption fetch unavailable:", exc)

        # Try listing available transcripts
        if hasattr(api, "list"):

            try:
                transcript_list = api.list(video_id)

                for language in languages:

                    try:
                        selected = transcript_list.find_transcript(
                            [language]
                        )

                        fetched = selected.fetch()

                        transcript = " ".join(
                            item.text.strip()
                            for item in fetched
                            if item.text.strip()
                        ).strip()

                        if transcript:
                            print(
                                "YouTube captions found:",
                                language
                            )
                            return transcript

                    except Exception:
                        continue

                # Try any available caption language as a fallback.
                try:
                    selected = next(iter(transcript_list))
                    fetched = selected.fetch()

                    transcript = " ".join(
                        item.text.strip()
                        for item in fetched
                        if item.text.strip()
                    ).strip()

                    if transcript:
                        print("Captions found in another language.")
                        return transcript

                except Exception:
                    pass

            except Exception as exc:
                print("Could not list captions:", exc)

        # Compatibility with older API versions
        if hasattr(YouTubeTranscriptApi, "get_transcript"):

            try:
                snippets = YouTubeTranscriptApi.get_transcript(
                    video_id,
                    languages=languages
                )

                transcript = " ".join(
                    item["text"].strip()
                    for item in snippets
                    if item.get("text", "").strip()
                ).strip()

                if transcript:
                    print("YouTube captions found.")
                    return transcript

            except Exception as exc:
                print("Legacy caption fetch unavailable:", exc)

    except Exception as exc:
        print("YouTube caption service unavailable:", exc)

    print("\nNo usable captions found.")
    print("Switching to Faster-Whisper.")

    return None


# ============================================================
# STEP 3 — DOWNLOAD YOUTUBE VIDEO
# ============================================================

def download_video(url):

    print("\n" + "=" * 65)
    print("STEP 2: DOWNLOADING YOUTUBE VIDEO")
    print("=" * 65)

    output_template = str(
        DOWNLOAD_DIR / "youtube_video.%(ext)s"
    )

    ydl_opts = {
        "format": (
            "bestvideo[height=144]+bestaudio/"
            "best[height=144]/"
            "bestvideo[height<=144]+bestaudio/"
            "best[height<=144]/best"
        ),

        "outtmpl": output_template,
        "merge_output_format": "mp4",
        "noplaylist": True,
        "quiet": False,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:

        info = ydl.extract_info(url, download=True)
        filename = ydl.prepare_filename(info)

    possible_files = [
        Path(os.path.splitext(filename)[0] + ".mp4"),
        Path(filename),
    ]

    for file_path in possible_files:

        if file_path.is_file():
            print("Video downloaded:", file_path)
            return file_path

    stem = Path(os.path.splitext(filename)[0])

    for extension in (".mkv", ".webm", ".mp4", ".mov"):

        candidate = stem.with_suffix(extension)

        if candidate.is_file():
            print("Video downloaded:", candidate)
            return candidate

    raise FileNotFoundError("Downloaded video could not be located.")


# ============================================================
# STEP 4 — EXTRACT AUDIO
# ============================================================

def extract_audio(video_path):

    print("\n" + "=" * 65)
    print("STEP 3: EXTRACTING AUDIO")
    print("=" * 65)

    audio_path = AUDIO_DIR / "audio.wav"

    command = [
        "ffmpeg",
        "-y",
        "-i", str(video_path),
        "-vn",
        "-acodec", "pcm_s16le",
        "-ar", "16000",
        "-ac", "1",
        str(audio_path),
    ]

    subprocess.run(
        command,
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE,
    )

    if not audio_path.is_file():
        raise FileNotFoundError("Extracted audio was not created.")

    print("Audio extracted:", audio_path)

    # Delete video only after successful audio extraction.
    video_path.unlink()
    print("Downloaded video deleted.")

    return audio_path


# ============================================================
# STEP 5 — LOAD FASTER-WHISPER MODEL
# ============================================================

def load_whisper():

    print("\n" + "=" * 65)
    print("STEP 4: LOADING FASTER-WHISPER")
    print("=" * 65)

    print("Model:", WHISPER_MODEL_NAME)
    print("Device:", WHISPER_DEVICE)
    print("Compute type:", WHISPER_COMPUTE_TYPE)

    model = WhisperModel(
        WHISPER_MODEL_NAME,
        device=WHISPER_DEVICE,
        compute_type=WHISPER_COMPUTE_TYPE,
    )

    print("Faster-Whisper model loaded on GPU.")

    return model


# ============================================================
# STEP 6 — TRANSCRIBE AUDIO
# ============================================================


def convert_to_english_script(transcript):
    """
    Convert Hindi Devanagari text into Roman-script Hinglish.
    Existing English words remain unchanged.
    """

    return sanscript.transliterate(
        transcript,
        sanscript.DEVANAGARI,
        sanscript.ITRANS
    )

def transcribe_audio(model, audio_path):

    print("\n" + "=" * 65)
    print("STEP 5: TRANSCRIBING AUDIO")
    print("=" * 65)

    print("Processing audio using RTX 3050...")

    # First detect and transcribe the original spoken language.
    segments, info = model.transcribe(
        str(audio_path),
        beam_size=5,
        vad_filter=True,
        task="transcribe",
    )

    transcript_parts = []

    for segment in segments:
        text = segment.text.strip()

        if text:
            transcript_parts.append(text)

    transcript = " ".join(transcript_parts).strip()

    if not transcript:
        raise RuntimeError("Whisper produced an empty transcript.")

    detected_language = info.language

    print("Detected language:", detected_language)
    print(
        "Language probability:",
        round(info.language_probability, 3)
    )

    # For languages other than English and Hindi,
    # generate an English translation.
    if detected_language not in ("en", "hi"):

        print("Converting speech into English...")

        segments, info = model.transcribe(
            str(audio_path),
            beam_size=5,
            vad_filter=True,
            task="translate",
        )

        translated_parts = []

        for segment in segments:
            text = segment.text.strip()

            if text:
                translated_parts.append(text)

        transcript = " ".join(translated_parts).strip()

        if not transcript:
            raise RuntimeError("English translation is empty.")

    # Convert Hindi-script words into Roman-script Hinglish.
    transcript = convert_to_english_script(transcript)

    print("\nTranscription completed.")
    print("Output format: English / Hinglish")

    return transcript
# def transcribe_audio(model, audio_path):

#     print("\n" + "=" * 65)
#     print("STEP 5: TRANSCRIBING AUDIO")
#     print("=" * 65)

#     print("Processing audio using RTX 3050...")

#     segments, info = model.transcribe(
#         str(audio_path),
#         beam_size=5,
#         vad_filter=True,
#     )

#     transcript_parts = []

#     # Segments are generated lazily.
#     for segment in segments:

#         text = segment.text.strip()

#         if text:
#             transcript_parts.append(text)

#     transcript = " ".join(transcript_parts).strip()

#     if not transcript:
#         raise RuntimeError("Whisper produced an empty transcript.")

#     print("\nTranscription completed.")
#     print("Detected language:", info.language)
#     print(
#         "Language probability:",
#         round(info.language_probability, 3)
#     )

#     return transcript




# ============================================================
# STEP 7 — DISPLAY TRANSCRIPT
# ============================================================

def display_transcript(transcript):

    print("\n" + "=" * 65)
    print("ACTUAL TRANSCRIPT")
    print("=" * 65)

    print(transcript)

    print("=" * 65)


# ============================================================
# STEP 8 — SAVE TRANSCRIPT
# ============================================================

def save_transcript(transcript):

    output_file = OUTPUT_DIR / "transcript.txt"

    with open(output_file, "w", encoding="utf-8") as file:
        file.write(transcript)

    print("\nTranscript saved:", output_file)

    return output_file


# ============================================================
# STEP 9 — DELETE TEMPORARY AUDIO
# ============================================================

def delete_audio(audio_path):

    if audio_path and Path(audio_path).is_file():

        try:
            Path(audio_path).unlink()
            print("Temporary audio deleted.")

        except OSError as exc:
            print("Warning: Could not delete audio:", exc)


# ============================================================
# COMPLETE PIPELINE
# ============================================================

def main():

    print("\n" + "=" * 70)
    print("YOUTUBE TRANSCRIPT-FIRST TRANSCRIPTION PIPELINE")
    print("=" * 70)

    if len(sys.argv) > 1 and sys.argv[1].strip():
        video_url = sys.argv[1].strip()
        print(f"Using YouTube URL from command-line argument: {video_url}")
    else:
        video_url = input("\nEnter YouTube URL: ").strip()

    video_path = None
    audio_path = None
    transcription_completed = False

    try:

        if not video_url:
            raise ValueError("YouTube URL cannot be empty.")

        # PATH A: Existing YouTube captions
        transcript = fetch_youtube_transcript(video_url)

        if transcript:

            source = "YouTube captions"

        # PATH B: Faster-Whisper fallback
        else:

            video_path = download_video(video_url)

            audio_path = extract_audio(video_path)
            video_path = None

            whisper_model = load_whisper()

            transcript = transcribe_audio(
                whisper_model,
                audio_path
            )

            source = "Faster-Whisper GPU transcription"

        # Convert Hindi-script captions into Roman-script Hinglish.
        transcript = convert_to_english_script(transcript)

        # Save common output
        display_transcript(transcript)

        transcript_file = save_transcript(transcript)

        transcription_completed = True

        print("\n" + "=" * 70)
        print("TRANSCRIPTION PIPELINE COMPLETED")
        print("=" * 70)

        print("Transcript source:", source)
        print("Transcript file:", transcript_file)
        print("Ready for summarization.")

    except Exception as exc:

        print("\n" + "=" * 70)
        print("PIPELINE FAILED")
        print("=" * 70)

        print("Error:", exc)
        print("Temporary files are retained where possible.")

    finally:

        # Delete audio only when transcription and saving succeed.
        if transcription_completed:
            delete_audio(audio_path)


# ============================================================
# RUN PIPELINE
# ============================================================

if __name__ == "__main__":
    main()
