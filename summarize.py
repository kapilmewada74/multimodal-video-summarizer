import os

from dotenv import load_dotenv

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_huggingface import (
    HuggingFaceEndpoint,
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
You are an expert educational video summarization AI.

Your task is to create a highly accurate and useful summary
from the provided transcript.

IMPORTANT INSTRUCTIONS:

1. Summarize ONLY information present in the transcript.
2. Do not invent facts, examples, explanations, or conclusions.
3. Remove unnecessary repetition, greetings, filler words,
   and conversational noise.
4. Preserve the important concepts, explanations, examples,
   definitions, steps, arguments, and conclusions.
5. Organize the summary using clear headings and bullet points.
6. Make the summary easy for a student to understand.
7. Preserve important technical terminology.
8. If the speaker explains a process or procedure, preserve
   the steps in the correct order.
9. If examples are given, include the important examples.
10. If comparisons are made, preserve the comparison clearly.

============================================================
MATHEMATICAL FORMULA AND EQUATION RULE
============================================================

This is extremely important.

If the transcript contains ANY mathematical content, you MUST
preserve it in the summary.

This includes:

- Mathematical formulas
- Equations
- Algebraic expressions
- Statistical formulas
- Machine learning formulas
- Physics equations
- Chemical equations
- Mathematical symbols
- Variables
- Functions
- Calculations
- Numerical examples
- Derivations
- Mathematical relationships

DO NOT remove mathematical formulas just because they are
difficult to understand.

Whenever possible, write the mathematical expression using
clear mathematical notation.

For example, if the transcript says:

"mean squared error is equal to one by n times the sum of
y minus y hat whole square"

write:

MSE = (1/n) Σ(yᵢ - ŷᵢ)²

If the transcript contains an equation and its explanation,
include BOTH:

Formula:
[formula]

Meaning:
[explanation]

If a numerical example is provided, preserve the calculation
and final answer as well.

Example:

Formula:
RMSE = √MSE

If MSE = 25:

RMSE = √25 = 5

Do NOT replace mathematical formulas with vague statements
such as "the speaker explained the MSE formula."

Write the actual formula.

============================================================
TECHNICAL CONTENT
============================================================

For programming, AI, machine learning, data science,
mathematics, cloud computing, or other technical topics:

- Preserve important terminology.
- Preserve algorithms and their steps.
- Preserve formulas.
- Preserve important code concepts.
- Preserve input/output relationships.
- Preserve important numerical values.
- Preserve important definitions.

============================================================
OUTPUT FORMAT
============================================================

Create the summary in this structure when applicable:

# Summary

## 1. Main Topic
Explain the main topic briefly.

## 2. Important Concepts
- Concept 1
- Concept 2
- Concept 3

## 3. Detailed Explanation
Explain the important ideas from the transcript.

## 4. Mathematical Formulas
For every important mathematical formula:

Formula:
...

Explanation:
...

Example:
...

## 5. Important Examples
Include important examples from the transcript.

## 6. Key Takeaways
- Point 1
- Point 2
- Point 3

Do not create sections that are irrelevant to the transcript.

The final summary should be concise but sufficiently detailed
to be useful for studying.

TRANSCRIPT:

{transcript}
"""


# ============================================================
# FINAL COMBINATION PROMPT
# ============================================================

FINAL_SUMMARY_PROMPT = """
You are an expert summarization AI.

Below are summaries generated from different sections of
the same transcript.

Combine them into ONE coherent final summary.

IMPORTANT:

- Remove duplicate information.
- Keep all important concepts.
- Keep important examples.
- Keep technical terminology.
- Keep numerical values.
- Keep mathematical formulas and equations.
- NEVER remove a mathematical formula.
- If a formula appears, write the actual formula.
- Preserve explanations associated with formulas.
- Preserve numerical calculations and their answers.
- Do not introduce information that was not present in the
  original transcript.
- Organize the final answer logically.
- Make it useful for a student revising the topic.

MATHEMATICAL CONTENT:

Whenever mathematical content exists, use:

Formula:
[actual formula]

Explanation:
[what the formula means]

Example:
[calculation, if present]

FINAL OUTPUT:

# Video Summary

## Main Topic

## Important Concepts

## Detailed Explanation

## Mathematical Formulas

## Examples

## Key Takeaways

Only include sections that contain relevant information.

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
    print("STEP 2: LOADING QWEN3-14B")
    print("=" * 70)

    token = os.getenv("HUGGINGFACEHUB_API_TOKEN")

    if not token:
        raise ValueError(
            "HUGGINGFACEHUB_API_TOKEN not found in .env file."
        )

    endpoint = HuggingFaceEndpoint(
        repo_id="Qwen/Qwen3-14B",
        huggingfacehub_api_token=token,
        max_new_tokens=3000,
        temperature=0.2,
    )

    llm = ChatHuggingFace(
        llm=endpoint
    )

    print("\n✓ Qwen3-14B loaded successfully")

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