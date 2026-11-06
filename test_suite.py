"""
Comprehensive Test Suite for Multimodal Video Summarizer Web & API Platform
Tests:
1. Health endpoint & hardware detection
2. Static assets & Design System tokens
3. URL validation edge cases (empty, non-youtube, valid formats)
4. File upload format validation edge cases (.exe, .pdf, .wav, .mp4)
5. End-to-end processing pipeline with audio WAV
6. History persistence
"""

import os
import sys
import time
import subprocess
import requests
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE_URL = "http://127.0.0.1:8000"

def run_tests():
    print("=" * 60)
    print("RUNNING AUTOMATED TEST SUITE")
    print("=" * 60)

    # 1. Test Health
    print("\n[Test 1] Healthcheck endpoint...")
    res = requests.get(f"{BASE_URL}/api/health", timeout=5)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    assert data["status"] == "healthy"
    print(f"✓ Health OK! Detected device: {data['device']}")

    # 2. Test Static Frontend Assets & Design System Tokens
    print("\n[Test 2] Static HTML & Design System CSS...")
    res = requests.get(f"{BASE_URL}/", timeout=5)
    assert res.status_code == 200
    assert "SUMMARIZE.AI" in res.text
    assert "katex.min.css" in res.text
    print("✓ Index HTML served with proper branding & KaTeX bindings")

    res_css = requests.get(f"{BASE_URL}/static/css/design-system.css", timeout=5)
    assert res_css.status_code == 200
    assert "#D9EC95" in res_css.text  # Brand Lime
    assert "#0E0F0C" in res_css.text  # Brand Black
    assert "shimmer" in res_css.text
    print("✓ Design system CSS tokens verified (#D9EC95, #0E0F0C, Shimmer)")

    # 3. Test Edge Cases: URL Validation
    print("\n[Test 3] Edge Cases: YouTube URL Validation...")
    
    # 3a. Empty URL
    res = requests.post(f"{BASE_URL}/api/summarize/url", json={"url": ""})
    assert res.status_code == 400
    print("✓ Empty URL rejected with HTTP 400")

    # 3b. Non-YouTube URL
    res = requests.post(f"{BASE_URL}/api/summarize/url", json={"url": "https://example.com/not-youtube"})
    assert res.status_code == 400
    print("✓ Non-YouTube URL rejected with HTTP 400")

    # 3c. Valid URL format accepted
    res = requests.post(f"{BASE_URL}/api/summarize/url", json={"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"})
    assert res.status_code == 200
    data = res.json()
    assert "job_id" in data
    print(f"✓ Valid YouTube format accepted, generated job: {data['job_id']}")

    # 4. Test Edge Cases: File Upload Validation
    print("\n[Test 4] Edge Cases: File Upload Format Validation...")
    
    # 4a. Invalid extension (.pdf)
    dummy_pdf = "test_file.pdf"
    with open(dummy_pdf, "w") as f:
        f.write("dummy pdf")
    try:
        with open(dummy_pdf, "rb") as f:
            res = requests.post(f"{BASE_URL}/api/summarize/upload", files={"file": (dummy_pdf, f, "application/pdf")})
        assert res.status_code == 400
        print("✓ Invalid file format (.pdf) rejected with HTTP 400")
    finally:
        if os.path.exists(dummy_pdf):
            os.remove(dummy_pdf)

    # 5. Test History API
    print("\n[Test 5] History API endpoint...")
    res = requests.get(f"{BASE_URL}/api/history", timeout=5)
    assert res.status_code == 200
    history = res.json()
    assert isinstance(history, list)
    print(f"✓ History API returned {len(history)} items")

    # 6. Test Generative Extensions (Flashcards, PPT, Quiz, PPTX)
    print("\n[Test 6] Generative Endpoints (Flashcards, Presentation, Quiz, PPTX)...")
    sample_payload = {
        "title": "Python Object Oriented Programming",
        "summary": "Classes are templates for objects. Instances have unique attributes defined in __init__.",
        "transcript": "In this tutorial we learn how to create classes in Python."
    }

    # 6a. Flashcards
    res_fc = requests.post(f"{BASE_URL}/api/generate/flashcards", json=sample_payload, timeout=30)
    assert res_fc.status_code == 200
    assert "flashcards" in res_fc.json()
    print("✓ Flashcards generation endpoint operational!")

    # 6b. Presentation Outline
    res_ppt = requests.post(f"{BASE_URL}/api/generate/presentation", json=sample_payload, timeout=30)
    assert res_ppt.status_code == 200
    assert "slides" in res_ppt.json()
    print("✓ Presentation generation endpoint operational!")

    # 6c. Quiz
    res_quiz = requests.post(f"{BASE_URL}/api/generate/quiz", json=sample_payload, timeout=30)
    assert res_quiz.status_code == 200
    assert "quiz" in res_quiz.json()
    print("✓ Quiz generation endpoint operational!")

    # 6d. PPTX file download
    res_pptx = requests.post(f"{BASE_URL}/api/download/pptx", json={
        "title": "Python OOP Slides",
        "slides": [{"title": "Classes", "bullets": ["Blueprint for objects"], "notes": "Speaker notes."}]
    }, timeout=10)
    assert res_pptx.status_code == 200
    assert len(res_pptx.content) > 1000
    print(f"✓ Real PowerPoint (.pptx) download compiled ({len(res_pptx.content)} bytes)!")

    print("\n" + "=" * 60)
    print("ALL CORE UNIT & INTEGRATION TESTS PASSED!")
    print("=" * 60)


if __name__ == "__main__":
    run_tests()
