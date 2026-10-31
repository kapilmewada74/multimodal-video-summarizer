import os
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR:
    os.chdir(BASE_DIR)

from dotenv import load_dotenv

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_huggingface import (
    HuggingFacePipeline,
    ChatHuggingFace
)




# ============================================================
# CONFIGURATION
# ============================================================

load_dotenv()

TRANSCRIPT_FILE = "output/transcript.txt"
SUMMARY_FILE = "output/summary.txt"


# ============================================================
# POWERFUL SUMMARY PROMPT
# ============================================================

SUMMARY_PROMPT = """
You are an expert video summarization AI.

Your task is to create a highly accurate, clear, and comprehensive summary strictly from the provided transcript.

CRITICAL INSTRUCTIONS:
1. Summarize ONLY information actually present in the transcript. Never invent facts, formulas, code, or concepts.
2. Remove filler words, conversational chitchat, greetings, and unnecessary repetition.
3. Preserve key concepts, terminology, steps, and examples directly mentioned by the speaker.
4. Adapt the structure naturally to the topic of the video (e.g. programming, science, lecture, podcast).
5. Do NOT invent mathematical formulas or code unless the speaker explicitly discussed them in the transcript.

OUTPUT STRUCTURE:
# Summary

## 1. Main Topic
Brief explanation of what the video covers.

## 2. Key Concepts & Definitions
- Bullet points detailing the key concepts, terms, or ideas introduced.

## 3. Detailed Explanation
Clear, structured breakdown of the explanations and arguments presented.

## 4. Key Takeaways
- Practical insights or main conclusions to remember from this video.

TRANSCRIPT:

{transcript}
"""


# ============================================================
# FINAL COMBINATION PROMPT
# ============================================================

FINAL_SUMMARY_PROMPT = """
You are an expert video summarization AI.

Below are summaries generated from different sections of the transcript. Combine them into ONE coherent, well-structured, final study summary.

INSTRUCTIONS:
1. Deduplicate repeated points across sections.
2. Maintain logical flow and clear hierarchy.
3. Faithfully preserve any key definitions, steps, code concepts, or terminology discussed.
4. Do NOT hallucinate concepts, examples, or formulas not discussed in the original transcript.

OUTPUT STRUCTURE:
# Video Summary

## Main Topic
A concise overview of the core subject.

## Key Concepts
- Bullet points of primary concepts, techniques, or definitions.

## Detailed Breakdown
Structured sections explaining the topics in depth.

## Key Takeaways
- Main conclusions or practical insights mentioned.

CHUNK SUMMARIES:

{summaries}
"""


# ============================================================
# LOAD TRANSCRIPT
# ============================================================

def load_transcript():

    print("\n" + "=" * 70)
    print("STEP 1: LOADING TRANSCRIPT")
    print("=" * 70)

    if not os.path.exists(TRANSCRIPT_FILE):

        raise FileNotFoundError(
            f"Transcript file not found: {TRANSCRIPT_FILE}"
        )

    with open(
        TRANSCRIPT_FILE,
        "r",
        encoding="utf-8"
    ) as file:

        transcript = file.read().strip()

    if not transcript:

        raise ValueError(
            "Transcript file is empty."
        )

    print("\n✓ Transcript loaded")
    print(
        f"Characters: {len(transcript):,}"
    )

    return transcript


# ============================================================
# CREATE LLM
# ============================================================

# def create_llm():

#     print("\n" + "=" * 70)
#     print("STEP 2: LOADING OPEN-SOURCE LLM")
#     print("=" * 70)

#     token = os.getenv("HUGGINGFACEHUB_API_TOKEN")

#     if not token:

#         raise ValueError(
#             "HUGGINGFACEHUB_API_TOKEN not found in .env file."
#         )

#     llm = HuggingFaceEndpoint(
#         repo_id="Qwen/Qwen2.5-7B-Instruct",
#         huggingfacehub_api_token=token,
#         temperature=0.2,
#         max_new_tokens=3000,
#     )

#     print("\n✓ Open-source LLM configured")

#     return llm
def create_llm():

    print("\n" + "=" * 70)
    print("STEP 2: LOADING LOCAL OPEN-SOURCE LLM (Qwen2.5)")
    print("=" * 70)

    model_id = "Qwen/Qwen2.5-0.5B-Instruct"
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
    llm = ChatHuggingFace(
        llm=hf_pipe
    )

    print(f"\n✓ Local LLM ({model_id}) loaded successfully on {device}")

    return llm

# ============================================================
# CREATE LANGCHAIN CHAINS
# ============================================================

def create_chains(llm):

    print("\nCreating LangChain pipelines...")

    summary_prompt = ChatPromptTemplate.from_template(
        SUMMARY_PROMPT
    )

    final_prompt = ChatPromptTemplate.from_template(
        FINAL_SUMMARY_PROMPT
    )

    parser = StrOutputParser()

    chunk_chain = (
        summary_prompt
        | llm
        | parser
    )

    final_chain = (
        final_prompt
        | llm
        | parser
    )

    print("✓ LangChain chains created")

    return chunk_chain, final_chain


# ============================================================
# SPLIT TRANSCRIPT
# ============================================================

def split_transcript(transcript):

    print("\n" + "=" * 70)
    print("STEP 3: SPLITTING TRANSCRIPT")
    print("=" * 70)

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=6000,
        chunk_overlap=500,
        separators=[
            "\n\n",
            "\n",
            ". ",
            " ",
            ""
        ]
    )

    chunks = splitter.split_text(
        transcript
    )

    print(
        f"\n✓ Transcript split into {len(chunks)} chunks"
    )

    return chunks


# ============================================================
# SUMMARIZE CHUNKS
# ============================================================

def summarize_chunks(
    chunks,
    chunk_chain
):

    print("\n" + "=" * 70)
    print("STEP 4: SUMMARIZING TRANSCRIPT CHUNKS")
    print("=" * 70)

    summaries = []

    for index, chunk in enumerate(
        chunks,
        start=1
    ):

        print(
            f"\nProcessing chunk {index}/{len(chunks)}..."
        )

        try:

            summary = chunk_chain.invoke(
                {
                    "transcript": chunk
                }
            )

            summaries.append(
                summary
            )

            print(
                f"✓ Chunk {index} completed"
            )

        except Exception as e:

            print(
                f"✗ Chunk {index} failed"
            )

            print(
                "Error:",
                e
            )

            raise

    return summaries


# ============================================================
# CREATE FINAL SUMMARY
# ============================================================

def create_final_summary(
    summaries,
    final_chain
):

    print("\n" + "=" * 70)
    print("STEP 5: CREATING FINAL SUMMARY")
    print("=" * 70)

    combined_summaries = "\n\n".join(
        f"--- Section {i + 1} ---\n{summary}"
        for i, summary in enumerate(summaries)
    )

    print("\nGenerating final summary...")

    final_summary = final_chain.invoke(
        {
            "summaries": combined_summaries
        }
    )

    final_summary = final_summary.strip()

    print("\n✓ Final summary generated")

    return final_summary


# ============================================================
# SAVE SUMMARY
# ============================================================

def save_summary(summary):

    print("\n" + "=" * 70)
    print("STEP 6: SAVING SUMMARY")
    print("=" * 70)

    os.makedirs(
        "output",
        exist_ok=True
    )

    with open(
        SUMMARY_FILE,
        "w",
        encoding="utf-8"
    ) as file:

        file.write(
            summary
        )

    print(
        "\n✓ Summary saved successfully"
    )

    print(
        "File:",
        SUMMARY_FILE
    )

    return SUMMARY_FILE


# ============================================================
# COMPLETE SUMMARIZATION PIPELINE
# ============================================================

def summarize_video():

    transcript = load_transcript()

    llm = create_llm()

    chunk_chain, final_chain = create_chains(
        llm
    )

    chunks = split_transcript(
        transcript
    )

    summaries = summarize_chunks(
        chunks,
        chunk_chain
    )

    final_summary = create_final_summary(
        summaries,
        final_chain
    )

    summary_file = save_summary(
        final_summary
    )

    print("\n" + "=" * 70)
    print("SUMMARIZATION COMPLETED")
    print("=" * 70)

    print(
        f"\nFinal summary:"
    )

    print(
        summary_file
    )

    return final_summary


# ============================================================
# RUN DIRECTLY
# ============================================================

if __name__ == "__main__":

    try:

        summarize_video()

    except Exception as e:

        print("\n" + "=" * 70)
        print("SUMMARIZATION FAILED")
        print("=" * 70)

        print(
            "\nError:",
            e
        )