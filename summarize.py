# import os
# import torch
# from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline

# BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# if BASE_DIR:
#     os.chdir(BASE_DIR)

# from dotenv import load_dotenv

# from langchain_text_splitters import RecursiveCharacterTextSplitter
# from langchain_core.prompts import ChatPromptTemplate
# from langchain_core.output_parsers import StrOutputParser
# from langchain_huggingface import (
#     HuggingFacePipeline,
#     ChatHuggingFace
# )




# # ============================================================
# # CONFIGURATION
# # ============================================================

# load_dotenv()

# TRANSCRIPT_FILE = "output/transcript.txt"
# SUMMARY_FILE = "output/summary.txt"


# # ============================================================
# # POWERFUL SUMMARY PROMPT
# # ============================================================

# SUMMARY_PROMPT = """
# You are an expert video summarization AI.

# Your task is to create a highly accurate, clear, and comprehensive summary strictly from the provided transcript.

# CRITICAL INSTRUCTIONS:
# 1. LANGUAGE REQUIREMENT: Output strictly in natural, professional English. Never include Chinese, Japanese, or other non-English characters.
# 2. Summarize ONLY information actually present in the transcript. Never invent facts, formulas, code, or concepts.
# 3. Remove filler words, conversational chitchat, greetings, and unnecessary repetition.
# 4. Preserve key concepts, terminology, steps, and examples directly mentioned by the speaker.
# 5. Adapt the structure naturally to the topic of the video (e.g. programming, science, lecture, podcast).
# 6. Do NOT invent mathematical formulas or code unless the speaker explicitly discussed them in the transcript.
# 7. MATHEMATICAL FORMULAS & SCIENTIFIC NOTATION: Whenever the video discusses mathematical equations, formulas, loss functions, algorithms, or quantitative metrics (e.g. Min-Max Scaling, Normalization, Standard Deviation, physics, calculus, statistics), ALWAYS format them cleanly using standard LaTeX notation ($...$ for inline or $$...$$ for display block equations) so they render with pristine mathematical typography.

# OUTPUT STRUCTURE:
# # Summary

# ## 1. Main Topic
# Brief explanation of what the video covers.

# ## 2. Key Concepts & Definitions
# - Bullet points detailing the key concepts, terms, or ideas introduced.

# ## 3. Detailed Explanation
# Clear, structured breakdown of the explanations and arguments presented.

# ## 4. Key Takeaways
# - Practical insights or main conclusions to remember from this video.

# TRANSCRIPT:

# {transcript}
# """


# # ============================================================
# # FINAL COMBINATION PROMPT
# # ============================================================

# FINAL_SUMMARY_PROMPT = """
# You are an expert video summarization AI.

# Below are summaries generated from different sections of the transcript. Combine them into ONE coherent, well-structured, final study summary.

# INSTRUCTIONS:
# 1. LANGUAGE REQUIREMENT: Output strictly in natural, professional English. Never include Chinese, Japanese, or other non-English characters.
# 2. Deduplicate repeated points across sections.
# 3. Maintain logical flow and clear hierarchy.
# 4. Faithfully preserve any key definitions, steps, code concepts, or terminology discussed.
# 5. Do NOT hallucinate concepts, examples, or formulas not discussed in the original transcript.
# 6. MATHEMATICAL FORMULAS & SCIENTIFIC NOTATION: Whenever preserving mathematical formulas or equations, format them in standard LaTeX ($...$ inline or $$...$$ display) so they are rendered with proper mathematical notation.

# OUTPUT STRUCTURE:
# # Video Summary

# ## Main Topic
# A concise overview of the core subject.

# ## Key Concepts
# - Bullet points of primary concepts, techniques, or definitions.

# ## Detailed Breakdown
# Structured sections explaining the topics in depth.

# ## Key Takeaways
# - Main conclusions or practical insights mentioned.

# CHUNK SUMMARIES:

# {summaries}
# """


# # ============================================================
# # LOAD TRANSCRIPT
# # ============================================================

# def load_transcript():

#     print("\n" + "=" * 70)
#     print("STEP 1: LOADING TRANSCRIPT")
#     print("=" * 70)

#     if not os.path.exists(TRANSCRIPT_FILE):

#         raise FileNotFoundError(
#             f"Transcript file not found: {TRANSCRIPT_FILE}"
#         )

#     with open(
#         TRANSCRIPT_FILE,
#         "r",
#         encoding="utf-8"
#     ) as file:

#         transcript = file.read().strip()

#     if not transcript:

#         raise ValueError(
#             "Transcript file is empty."
#         )

#     print("\n✓ Transcript loaded")
#     print(
#         f"Characters: {len(transcript):,}"
#     )

#     return transcript


# # ============================================================
# # CREATE LLM
# # ============================================================

# # def create_llm():

# #     print("\n" + "=" * 70)
# #     print("STEP 2: LOADING OPEN-SOURCE LLM")
# #     print("=" * 70)

# #     token = os.getenv("HUGGINGFACEHUB_API_TOKEN")

# #     if not token:

# #         raise ValueError(
# #             "HUGGINGFACEHUB_API_TOKEN not found in .env file."
# #         )

# #     llm = HuggingFaceEndpoint(
# #         repo_id="Qwen/Qwen2.5-7B-Instruct",
# #         huggingfacehub_api_token=token,
# #         temperature=0.2,
# #         max_new_tokens=3000,
# #     )

# #     print("\n✓ Open-source LLM configured")

# #     return llm
# def create_llm():

#     print("\n" + "=" * 70)
#     print("STEP 2: LOADING LOCAL OPEN-SOURCE LLM (Qwen2.5)")
#     print("=" * 70)

#     model_id = "Qwen/Qwen2.5-0.5B-Instruct"
#     tokenizer = AutoTokenizer.from_pretrained(model_id)
#     device = "mps" if torch.backends.mps.is_available() else "cpu"
#     model = AutoModelForCausalLM.from_pretrained(model_id).to(device)

#     pipe = pipeline(
#         "text-generation",
#         model=model,
#         tokenizer=tokenizer,
#         max_new_tokens=1500,
#         temperature=0.2,
#         do_sample=True,
#         return_full_text=False
#     )

#     hf_pipe = HuggingFacePipeline(pipeline=pipe)
#     llm = ChatHuggingFace(
#         llm=hf_pipe
#     )

#     print(f"\n✓ Local LLM ({model_id}) loaded successfully on {device}")

#     return llm

# # ============================================================
# # CREATE LANGCHAIN CHAINS
# # ============================================================

# def create_chains(llm):

#     print("\nCreating LangChain pipelines...")

#     summary_prompt = ChatPromptTemplate.from_template(
#         SUMMARY_PROMPT
#     )

#     final_prompt = ChatPromptTemplate.from_template(
#         FINAL_SUMMARY_PROMPT
#     )

#     parser = StrOutputParser()

#     chunk_chain = (
#         summary_prompt
#         | llm
#         | parser
#     )

#     final_chain = (
#         final_prompt
#         | llm
#         | parser
#     )

#     print("✓ LangChain chains created")

#     return chunk_chain, final_chain


# # ============================================================
# # SPLIT TRANSCRIPT
# # ============================================================

# def split_transcript(transcript):

#     print("\n" + "=" * 70)
#     print("STEP 3: SPLITTING TRANSCRIPT")
#     print("=" * 70)

#     splitter = RecursiveCharacterTextSplitter(
#         chunk_size=6000,
#         chunk_overlap=500,
#         separators=[
#             "\n\n",
#             "\n",
#             ". ",
#             " ",
#             ""
#         ]
#     )

#     chunks = splitter.split_text(
#         transcript
#     )

#     print(
#         f"\n✓ Transcript split into {len(chunks)} chunks"
#     )

#     return chunks


# # ============================================================
# # SUMMARIZE CHUNKS
# # ============================================================

# def summarize_chunks(
#     chunks,
#     chunk_chain
# ):

#     print("\n" + "=" * 70)
#     print("STEP 4: SUMMARIZING TRANSCRIPT CHUNKS")
#     print("=" * 70)

#     summaries = []

#     for index, chunk in enumerate(
#         chunks,
#         start=1
#     ):

#         print(
#             f"\nProcessing chunk {index}/{len(chunks)}..."
#         )

#         try:

#             summary = chunk_chain.invoke(
#                 {
#                     "transcript": chunk
#                 }
#             )

#             summaries.append(
#                 summary
#             )

#             print(
#                 f"✓ Chunk {index} completed"
#             )

#         except Exception as e:

#             print(
#                 f"✗ Chunk {index} failed"
#             )

#             print(
#                 "Error:",
#                 e
#             )

#             raise

#     return summaries


# # ============================================================
# # CREATE FINAL SUMMARY
# # ============================================================

# def create_final_summary(
#     summaries,
#     final_chain
# ):

#     print("\n" + "=" * 70)
#     print("STEP 5: CREATING FINAL SUMMARY")
#     print("=" * 70)

#     combined_summaries = "\n\n".join(
#         f"--- Section {i + 1} ---\n{summary}"
#         for i, summary in enumerate(summaries)
#     )

#     print("\nGenerating final summary...")

#     final_summary = final_chain.invoke(
#         {
#             "summaries": combined_summaries
#         }
#     )

#     final_summary = final_summary.strip()

#     print("\n✓ Final summary generated")

#     return final_summary


# # ============================================================
# # SAVE SUMMARY
# # ============================================================

# def save_summary(summary):

#     print("\n" + "=" * 70)
#     print("STEP 6: SAVING SUMMARY")
#     print("=" * 70)

#     os.makedirs(
#         "output",
#         exist_ok=True
#     )

#     with open(
#         SUMMARY_FILE,
#         "w",
#         encoding="utf-8"
#     ) as file:

#         file.write(
#             summary
#         )

#     print(
#         "\n✓ Summary saved successfully"
#     )

#     print(
#         "File:",
#         SUMMARY_FILE
#     )

#     return SUMMARY_FILE


# # ============================================================
# # COMPLETE SUMMARIZATION PIPELINE
# # ============================================================

# def summarize_video():

#     transcript = load_transcript()

#     llm = create_llm()

#     chunk_chain, final_chain = create_chains(
#         llm
#     )

#     chunks = split_transcript(
#         transcript
#     )

#     summaries = summarize_chunks(
#         chunks,
#         chunk_chain
#     )

#     final_summary = create_final_summary(
#         summaries,
#         final_chain
#     )

#     summary_file = save_summary(
#         final_summary
#     )

#     print("\n" + "=" * 70)
#     print("SUMMARIZATION COMPLETED")
#     print("=" * 70)

#     print(
#         f"\nFinal summary:"
#     )

#     print(
#         summary_file
#     )

#     return final_summary


# # ============================================================
# # RUN DIRECTLY
# # ============================================================

# if __name__ == "__main__":

#     try:

#         summarize_video()

#     except Exception as e:

#         print("\n" + "=" * 70)
#         print("SUMMARIZATION FAILED")
#         print("=" * 70)

#         print(
#             "\nError:",
#             e
#         )


# api call code 
 

import os
import sys
import time

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

from dotenv import load_dotenv
from groq import Groq


# ============================================================
# CONFIGURATION
# ============================================================

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

TRANSCRIPT_FILE = os.path.join(
    BASE_DIR, "output", "transcript.txt"
)

SUMMARY_FILE = os.path.join(
    BASE_DIR, "output", "summary.txt"
)

MODEL_NAME = os.getenv(
    "MODEL_NAME",
    "openai/gpt-oss-20b"
)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

MAX_OUTPUT_TOKENS = 4000


# ============================================================
# SUMMARY PROMPT
# ============================================================

FINAL_SUMMARY_PROMPT = SUMMARY_PROMPT = """
You are an expert educational video summarization AI.

Create an accurate, structured and useful study summary
from the supplied educational video transcript.

STRICT RULES:

1. Use ONLY information found in the transcript.
2. Never invent facts, explanations, examples, formulas or conclusions.
3. Remove greetings, filler words and repeated statements.
4. Preserve major concepts and technical terminology.
5. Explain difficult concepts in student-friendly language.
6. Preserve the correct order of processes and algorithms.
7. Include important comparisons and numerical values.
8. Avoid unnecessary repetition.
9. Do not claim that the transcript covers missing information.

MATHEMATICAL CONTENT:

Preserve important:
- Mathematical formulas and equations.
- Machine learning and statistical formulas.
- Variables and mathematical symbols.
- Numerical calculations and derivations.
- Loss functions and optimization equations.

Never replace an actual formula with a vague description.

For each important formula, provide:

Formula:
[Actual formula]

Explanation:
[Meaning of the formula and its variables]

Numerical Example:
[Calculation and result, if present in transcript]

Do not invent missing formulas or numerical values.

TECHNICAL CONTENT:

For AI, machine learning, data science, programming
and mathematics, preserve:

- Algorithm names and steps.
- Model architectures and parameters.
- Input/output relationships.
- Code concepts and technical examples.

OUTPUT FORMAT:

# Video Summary

## 1. Main Topic
Explain the central topic.

## 2. Important Concepts
List and explain important concepts.

## 3. Detailed Explanation
Explain important ideas in logical order.

## 4. Mathematical Formulas
Include formulas, variable meanings and calculations.

## 5. Algorithms and Processes
Explain algorithms and their steps where applicable.

## 6. Important Examples
Include examples and numerical calculations from the transcript.

## 7. Key Takeaways
List the most important learning points.

Only include relevant sections.

Keep the summary concise but sufficiently detailed for revision.

The transcript may contain selected passages from a longer video.
Do not assume missing information.

TRANSCRIPT:

{transcript}
"""


# ============================================================
# STEP 1: LOAD TRANSCRIPT
# ============================================================

def load_transcript():

    print("\n" + "=" * 60)
    print("STEP 1: LOADING TRANSCRIPT")
    print("=" * 60)

    if not os.path.exists(TRANSCRIPT_FILE):
        raise FileNotFoundError(
            f"Transcript not found: {TRANSCRIPT_FILE}"
        )

    with open(
        TRANSCRIPT_FILE,
        "r",
        encoding="utf-8"
    ) as file:

        transcript = file.read().strip()

    if not transcript:
        raise ValueError("Transcript is empty.")

    print("Transcript loaded successfully.")
    print(f"Characters: {len(transcript):,}")
    print(f"Words: {len(transcript.split()):,}")

    return transcript


# ============================================================
# STEP 2: CREATE GROQ CLIENT
# ============================================================

def create_llm():

    print("\n" + "=" * 60)
    print("STEP 2: CONFIGURING GROQ API")
    print("=" * 60)

    if not GROQ_API_KEY:
        raise ValueError(
            "GROQ_API_KEY is missing from .env file."
        )

    client = Groq(
        api_key=GROQ_API_KEY,
        timeout=300,
        max_retries=2
    )

    print(f"Model: {MODEL_NAME}")
    print("Provider: Groq API")
    print("Inference: Cloud API")
    print("API calls: One")
    print("Local GPU/Ollama: Not required")

    return client


# ============================================================
# STEP 3: GENERATE SUMMARY - SINGLE API CALL
# ============================================================


def generate_summary(transcript, client):

    print("\n" + "=" * 60)
    print("STEP 3: GENERATING EDUCATIONAL SUMMARY")
    print("=" * 60)

    prompt = SUMMARY_PROMPT.format(
        transcript=transcript
    )

    start_time = time.perf_counter()

    print("Sending transcript to Groq...")
    print(f"Model: {MODEL_NAME}")
    print("Reasoning effort: Medium")
    print("Waiting for model response...")

    try:

        response = client.chat.completions.create(

            model=MODEL_NAME,

            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],

            temperature=0.2,

            max_completion_tokens=4000,

            reasoning_effort="medium",

            reasoning_format="hidden",

            stream=False
        )

        print("API response received successfully!")

    except Exception as error:

        print("\nGROQ API ERROR")
        print("-" * 60)

        print(f"Error type: {type(error).__name__}")
        print(f"Error details: {error}")

        raise

    elapsed_time = time.perf_counter() - start_time

    # --------------------------------------------------------
    # EXTRACT RESPONSE
    # --------------------------------------------------------

    if not response.choices:

        raise ValueError(
            "Groq returned no response choices."
        )

    choice = response.choices[0]

    summary = choice.message.content

    finish_reason = choice.finish_reason

    if not summary or not summary.strip():

        raise ValueError(
            "Groq returned an empty summary. "
            f"Finish reason: {finish_reason}"
        )

    summary = summary.strip()

    # --------------------------------------------------------
    # TOKEN USAGE
    # --------------------------------------------------------

    usage = response.usage

    input_tokens = (
        usage.prompt_tokens if usage else 0
    )

    output_tokens = (
        usage.completion_tokens if usage else 0
    )

    total_tokens = (
        usage.total_tokens if usage else 0
    )

    # --------------------------------------------------------
    # PERFORMANCE DETAILS
    # --------------------------------------------------------

    print("\nSUMMARY GENERATED SUCCESSFULLY!")
    print("=" * 60)

    print(f"Generation time: {elapsed_time:.2f} seconds")

    print("\nPERFORMANCE DETAILS")
    print("-" * 60)

    print(f"Provider: Groq")
    print(f"Model: {MODEL_NAME}")
    print(f"Input tokens: {input_tokens:,}")
    print(f"Output tokens: {output_tokens:,}")
    print(f"Total tokens: {total_tokens:,}")
    print(f"Finish reason: {finish_reason}")
    print(f"Summary characters: {len(summary):,}")
    print(f"Summary words: {len(summary.split()):,}")

    # --------------------------------------------------------
    # CHECK OUTPUT COMPLETION
    # --------------------------------------------------------

    if finish_reason == "length":

        print("\nWARNING:")
        print(
            "Maximum output token limit reached. "
            "The summary may be incomplete."
        )

    elif finish_reason != "stop":

        print("\nWARNING:")
        print(f"Unexpected finish reason: {finish_reason}")

    print("\nSummary preview:")
    print("-" * 60)

    try:
        print(summary[:500])
    except UnicodeEncodeError:
        print(summary[:500].encode('ascii', errors='replace').decode('ascii'))

    if len(summary) > 500:
        print("...")

    print("-" * 60)

    return summary, elapsed_time



# ============================================================
# STEP 4: SAVE SUMMARY
# ============================================================

def save_summary(summary):

    print("\n" + "=" * 60)
    print("STEP 4: SAVING SUMMARY")
    print("=" * 60)

    os.makedirs(
        os.path.dirname(SUMMARY_FILE),
        exist_ok=True
    )

    with open(
        SUMMARY_FILE,
        "w",
        encoding="utf-8"
    ) as file:

        file.write(summary)

    print("Summary saved successfully.")
    print(f"Location: {SUMMARY_FILE}")

    return SUMMARY_FILE


# ============================================================
# COMPLETE SUMMARIZATION PIPELINE
# ============================================================

def summarize_video():

    total_start = time.perf_counter()

    transcript = load_transcript()

    client = create_llm()

    summary, generation_time = generate_summary(
        transcript,
        client
    )

    summary_file = save_summary(summary)

    total_time = time.perf_counter() - total_start

    print("\n" + "=" * 60)
    print("SUMMARIZATION COMPLETED")
    print("=" * 60)

    print(f"Generation time: {generation_time:.2f} seconds")
    print(f"Total time: {total_time:.2f} seconds")
    print(f"Summary file: {summary_file}")

    return summary


# ============================================================
# RUN APPLICATION
# ============================================================

if __name__ == "__main__":

    try:

        summarize_video()

    except Exception as error:

        print("\n" + "=" * 60)
        print("SUMMARIZATION FAILED")
        print("=" * 60)

        print(f"Error: {type(error).__name__}")
        print(f"Details: {error}")
