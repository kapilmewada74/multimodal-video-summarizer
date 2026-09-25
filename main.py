import os
import subprocess
import sys


# ============================================================
# CONFIGURATION
# ============================================================

TRANSCRIPTION_SCRIPT = "pipeline.py"
SUMMARY_FILE = "output/summary.txt"
TRANSCRIPT_FILE = "output/transcript.txt"


# ============================================================
# RUN TRANSCRIPTION
# ============================================================

def run_transcription():

    print("\n" + "=" * 70)
    print("PHASE 1: VIDEO TRANSCRIPTION")
    print("=" * 70)

    result = subprocess.run(
        [
            sys.executable,
            TRANSCRIPTION_SCRIPT
        ],
        check=False
    )

    if result.returncode != 0:

        raise RuntimeError(
            "Transcription pipeline failed."
        )

    if not os.path.exists(
        TRANSCRIPT_FILE
    ):

        raise FileNotFoundError(
            "Transcription completed but "
            "transcript.txt was not generated."
        )

    print("\n✓ Transcription pipeline completed")
    print(
        "✓ Transcript found:",
        TRANSCRIPT_FILE
    )


# ============================================================
# RUN SUMMARIZATION
# ============================================================

def run_summarization():

    print("\n" + "=" * 70)
    print("PHASE 2: AI SUMMARIZATION")
    print("=" * 70)

    # Import after transcription has completed
    from summarize import summarize_video

    summary = summarize_video()

    if not os.path.exists(
        SUMMARY_FILE
    ):

        raise FileNotFoundError(
            "Summarization completed but "
            "summary.txt was not generated."
        )

    print("\n✓ Summarization pipeline completed")

    return summary


# ============================================================
# MAIN PIPELINE
# ============================================================

def main():

    print("\n")

    print("=" * 70)
    print("             AI VIDEO SUMMARIZER")
    print("=" * 70)

    try:

        # ----------------------------------------------------
        # PHASE 1
        # YouTube → Audio → Whisper → Transcript
        # ----------------------------------------------------

        run_transcription()


        # ----------------------------------------------------
        # PHASE 2
        # Transcript → LangChain → Open-source LLM → Summary
        # ----------------------------------------------------

        run_summarization()


        # ----------------------------------------------------
        # COMPLETE
        # ----------------------------------------------------

        print("\n")

        print("=" * 70)
        print("                  PIPELINE COMPLETED")
        print("=" * 70)

        print("\n✓ Video downloaded")
        print("✓ Audio extracted")
        print("✓ Video deleted")
        print("✓ Whisper transcription completed")
        print("✓ Transcript generated")
        print("✓ Transcript loaded")
        print("✓ LangChain processing completed")
        print("✓ Open-source LLM generated summary")
        print("✓ Mathematical formulas preserved")
        print("✓ Final summary generated")
        print("✓ Summary saved")

        print("\nOutput files:")

        print(
            "Transcript:",
            TRANSCRIPT_FILE
        )

        print(
            "Summary:",
            SUMMARY_FILE
        )


    except Exception as e:

        print("\n")

        print("=" * 70)
        print("                    PIPELINE FAILED")
        print("=" * 70)

        print(
            "\nError:",
            e
        )


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":

    main()