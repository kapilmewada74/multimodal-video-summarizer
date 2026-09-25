
import os
import subprocess
import yt_dlp
import whisper


# ============================================================
# CONFIGURATION
# ============================================================

VIDEO_URL = input("Enter YouTube URL: ").strip()

DOWNLOAD_DIR = "downloads"
AUDIO_DIR = "audio"
OUTPUT_DIR = "output"

os.makedirs(DOWNLOAD_DIR, exist_ok=True)
os.makedirs(AUDIO_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)


# ============================================================
# STEP 1 — DOWNLOAD YOUTUBE VIDEO
# ============================================================

def download_video(url):

    print("\n" + "=" * 60)
    print("STEP 1: DOWNLOADING YOUTUBE VIDEO")
    print("=" * 60)

    output_template = os.path.join(
        DOWNLOAD_DIR,
        "youtube_video.%(ext)s"
    )

    ydl_opts = {

        # Try exactly 144p first.
        # If unavailable, use the closest available format.
        "format": (
            "bestvideo[height=144]+bestaudio/"
            "best[height=144]/"
            "bestvideo[height<=144]+bestaudio/"
            "best[height<=144]"
        ),

        "outtmpl": output_template,

        "merge_output_format": "mp4",

        "noplaylist": True,

        "quiet": False,
    }

    try:

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:

            info = ydl.extract_info(
                url,
                download=True
            )

            filename = ydl.prepare_filename(info)

        # After merging, yt-dlp normally creates MP4
        possible_files = [
            os.path.splitext(filename)[0] + ".mp4",
            filename
        ]

        for file in possible_files:

            if os.path.exists(file):

                print("\n✓ Video downloaded successfully")
                print("Video:", file)

                return file

        raise FileNotFoundError(
            "Downloaded video could not be located."
        )

    except Exception as e:

        print("\n✗ Video download failed")
        print("Error:", e)

        raise


# ============================================================
# STEP 2 — EXTRACT AUDIO
# ============================================================

def extract_audio(video_path):

    print("\n" + "=" * 60)
    print("STEP 2: EXTRACTING AUDIO")
    print("=" * 60)

    audio_path = os.path.join(
        AUDIO_DIR,
        "audio.wav"
    )

    command = [

        "ffmpeg",

        "-y",

        "-i",
        video_path,

        # Remove video stream
        "-vn",

        # WAV audio
        "-acodec",
        "pcm_s16le",

        # 16 kHz
        "-ar",
        "16000",

        # Mono
        "-ac",
        "1",

        audio_path
    ]

    try:

        subprocess.run(
            command,
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )

        print("\n✓ Audio extracted successfully")
        print("Audio:", audio_path)


        # ====================================================
        # DELETE VIDEO AFTER SUCCESSFUL AUDIO EXTRACTION
        # ====================================================

        if os.path.exists(video_path):

            os.remove(video_path)

            print("✓ Downloaded video deleted")

        else:

            print("Video file was already removed.")


        return audio_path

    except FileNotFoundError:

        print(
            "\n✗ FFmpeg was not found."
            "\nInstall FFmpeg and add it to PATH."
        )

        raise

    except subprocess.CalledProcessError as e:

        print("\n✗ Audio extraction failed")
        print(e)

        # IMPORTANT:
        # Video is NOT deleted if audio extraction fails.

        raise


# ============================================================
# STEP 3 — LOAD OPEN-SOURCE WHISPER MODEL
# ============================================================

def load_whisper():

    print("\n" + "=" * 60)
    print("STEP 3: LOADING WHISPER MODEL")
    print("=" * 60)

    MODEL_NAME = "base"

    print(
        f"\nLoading Whisper '{MODEL_NAME}' model..."
    )

    try:

        model = whisper.load_model(
            MODEL_NAME
        )

        print("\n✓ Whisper model loaded")

        return model

    except Exception as e:

        print("\n✗ Whisper model loading failed")
        print("Error:", e)

        raise


# ============================================================
# STEP 4 — SPEECH TO TEXT
# ============================================================

def transcribe_audio(
    model,
    audio_path
):

    print("\n" + "=" * 60)
    print("STEP 4: SPEECH → TEXT")
    print("=" * 60)

    print("\nTranscribing audio...")
    print("Please wait...\n")

    try:

        result = model.transcribe(
            audio_path,

            # Automatically detect language
            fp16=False
        )

        transcript = result[
            "text"
        ].strip()

        print(
            "\n✓ Transcription completed"
        )

        return transcript

    except Exception as e:

        print(
            "\n✗ Transcription failed"
        )

        print(
            "Error:",
            e
        )

        raise


# ============================================================
# STEP 5 — DISPLAY ACTUAL TEXT
# ============================================================

def display_transcript(
    transcript
):

    print("\n")

    print("=" * 70)
    print("                    ACTUAL TRANSCRIPT")
    print("=" * 70)

    print("\n")

    print(transcript)

    print("\n")

    print("=" * 70)


# ============================================================
# STEP 6 — SAVE TEXT
# ============================================================

def save_transcript(
    transcript
):

    print(
        "\nSaving transcript..."
    )

    output_file = os.path.join(
        OUTPUT_DIR,
        "transcript.txt"
    )

    with open(
        output_file,
        "w",
        encoding="utf-8"
    ) as file:

        file.write(
            transcript
        )

    print(
        "\n✓ Transcript saved"
    )

    print(
        "File:",
        output_file
    )

    return output_file


# ============================================================
# STEP 7 — DELETE AUDIO
# ============================================================

def delete_audio(
    audio_path
):

    print(
        "\nDeleting temporary audio file..."
    )

    try:

        if os.path.exists(
            audio_path
        ):

            os.remove(
                audio_path
            )

            print(
                "✓ Audio file deleted"
            )

        else:

            print(
                "Audio file was already removed."
            )

    except Exception as e:

        print(
            "⚠ Could not delete audio file:"
        )

        print(e)


# ============================================================
# COMPLETE PIPELINE
# ============================================================

def main():

    print("\n")

    print("=" * 70)
    print(
        "             YOUTUBE VIDEO TRANSCRIPTION PIPELINE"
    )
    print("=" * 70)


    video_path = None
    audio_path = None

    try:

        # ----------------------------------------------------
        # 1. YouTube → Video
        # ----------------------------------------------------

        video_path = download_video(
            VIDEO_URL
        )


        # ----------------------------------------------------
        # 2. Video → Audio
        # ----------------------------------------------------

        audio_path = extract_audio(
            video_path
        )


        # ----------------------------------------------------
        # 3. Load Whisper
        # ----------------------------------------------------

        whisper_model = load_whisper()


        # ----------------------------------------------------
        # 4. Audio → Text
        # ----------------------------------------------------

        transcript = transcribe_audio(
            whisper_model,
            audio_path
        )


        # ----------------------------------------------------
        # 5. Display actual text
        # ----------------------------------------------------

        display_transcript(
            transcript
        )


        # ----------------------------------------------------
        # 6. Save transcript
        # ----------------------------------------------------

        transcript_file = save_transcript(
            transcript
        )


        # ----------------------------------------------------
        # 7. DELETE AUDIO AFTER TRANSCRIPTION
        # ----------------------------------------------------

        delete_audio(
            audio_path
        )


        # ----------------------------------------------------
        # PIPELINE COMPLETE
        # ----------------------------------------------------

        print("\n")

        print("=" * 70)
        print(
            "                  PIPELINE COMPLETED"
        )
        print("=" * 70)

        print(
            "\n✓ YouTube video downloaded"
        )

        print(
            "✓ Audio extracted"
        )

        print(
            "✓ Video automatically deleted"
        )

        print(
            "✓ Whisper transcription completed"
        )

        print(
            "✓ Actual text generated"
        )

        print(
            "✓ Transcript saved"
        )

        print(
            "✓ Audio automatically deleted"
        )

        print(
            f"\nFinal output:"
        )

        print(
            transcript_file
        )

    except Exception as e:

        print("\n")

        print("=" * 70)
        print(
            "                    PIPELINE FAILED"
        )
        print("=" * 70)

        print(
            "\nError:",
            e
        )

        # ----------------------------------------------------
        # SAFETY CLEANUP
        # ----------------------------------------------------
        #
        # If transcription fails, DO NOT delete the audio.
        # This allows you to inspect/reuse it for debugging.
        #
        # If audio extraction fails, the video is also kept.
        # ----------------------------------------------------

        print(
            "\nTemporary files have been kept"
            " because the pipeline failed."
        )


# ============================================================
# RUN PIPELINE
# ============================================================

if __name__ == "__main__":

    main()
