/**
 * Multimodal Video Summarizer — Client Application
 * Tool-first UX with BYAMN Design Tokens & Live Pipeline Stepper
 */

document.addEventListener("DOMContentLoaded", () => {
  // --- Theme Management ---
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const htmlEl = document.documentElement;
  
  const savedTheme = localStorage.getItem("theme") || "dark";
  htmlEl.classList.add(savedTheme);
  updateThemeIcon(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const isDark = htmlEl.classList.contains("dark");
      const nextTheme = isDark ? "light" : "dark";
      htmlEl.classList.remove("dark", "light");
      htmlEl.classList.add(nextTheme);
      localStorage.setItem("theme", nextTheme);
      updateThemeIcon(nextTheme);
      showToast(`Switched to ${nextTheme} mode`, "info");
    });
  }

  function updateThemeIcon(theme) {
    if (!themeToggleBtn) return;
    themeToggleBtn.innerHTML = theme === "dark" 
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>` 
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
  }

  // --- Input Mode Tabs (URL vs Upload) ---
  const tabUrlBtn = document.getElementById("tab-url-btn");
  const tabUploadBtn = document.getElementById("tab-upload-btn");
  const sectionUrlInput = document.getElementById("section-url-input");
  const sectionUploadInput = document.getElementById("section-upload-input");

  let activeInputMode = "url";

  if (tabUrlBtn && tabUploadBtn) {
    tabUrlBtn.addEventListener("click", () => {
      activeInputMode = "url";
      tabUrlBtn.classList.add("active");
      tabUploadBtn.classList.remove("active");
      sectionUrlInput.style.display = "block";
      sectionUploadInput.style.display = "none";
    });

    tabUploadBtn.addEventListener("click", () => {
      activeInputMode = "upload";
      tabUploadBtn.classList.add("active");
      tabUrlBtn.classList.remove("active");
      sectionUploadInput.style.display = "block";
      sectionUrlInput.style.display = "none";
    });
  }

  // --- Paste Clipboard Helper ---
  const pasteBtn = document.getElementById("paste-btn");
  const youtubeUrlInput = document.getElementById("youtube-url-input");

  if (pasteBtn && youtubeUrlInput) {
    pasteBtn.addEventListener("click", async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          youtubeUrlInput.value = text.trim();
          showToast("URL pasted from clipboard!", "info");
        }
      } catch (err) {
        showToast("Clipboard access denied. Please paste manually.", "error");
      }
    });
  }

  // --- Drag and Drop File Upload ---
  const dropzone = document.getElementById("file-dropzone");
  const fileInput = document.getElementById("file-input");
  const fileSelectedInfo = document.getElementById("file-selected-info");
  const fileNameDisplay = document.getElementById("file-name-display");
  const fileRemoveBtn = document.getElementById("file-remove-btn");

  let currentUploadedFile = null;

  if (dropzone && fileInput) {
    dropzone.addEventListener("click", () => fileInput.click());

    ["dragenter", "dragover"].forEach(name => {
      dropzone.addEventListener(name, (e) => {
        e.preventDefault();
        dropzone.style.borderColor = "var(--brand-lime)";
        dropzone.style.backgroundColor = "rgba(217, 236, 149, 0.05)";
      });
    });

    ["dragleave", "drop"].forEach(name => {
      dropzone.addEventListener(name, (e) => {
        e.preventDefault();
        dropzone.style.borderColor = "var(--card-border)";
        dropzone.style.backgroundColor = "transparent";
      });
    });

    dropzone.addEventListener("drop", (e) => {
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileSelection(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFileSelection(e.target.files[0]);
      }
    });
  }

  function handleFileSelection(file) {
    const ext = "." + file.name.split(".").pop().toLowerCase();
    const validExts = [".mp4", ".mov", ".mkv", ".avi", ".webm", ".mp3", ".wav", ".m4a"];
    if (!validExts.includes(ext)) {
      showToast(`Unsupported format '${ext}'. Allowed: ${validExts.join(", ")}`, "error");
      return;
    }
    currentUploadedFile = file;
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    fileNameDisplay.textContent = `${file.name} (${sizeMb} MB)`;
    fileSelectedInfo.style.display = "flex";
    dropzone.style.display = "none";
  }

  if (fileRemoveBtn) {
    fileRemoveBtn.addEventListener("click", () => {
      currentUploadedFile = null;
      fileInput.value = "";
      fileSelectedInfo.style.display = "none";
      dropzone.style.display = "flex";
    });
  }

  // --- Processing & Loading State ---
  const startSummarizeBtn = document.getElementById("start-summarize-btn");
  const loadingContainer = document.getElementById("loading-container");
  const errorContainer = document.getElementById("error-container");

  let activePollingTimer = null;
  let activeJobId = null;

  if (startSummarizeBtn) {
    startSummarizeBtn.addEventListener("click", async () => {
      if (activeInputMode === "url") {
        const url = (youtubeUrlInput.value || "").trim();
        if (!url) {
          showToast("Please enter a YouTube URL.", "error");
          youtubeUrlInput.focus();
          return;
        }
        await initiateJob("/api/summarize/url", { url }, false);
      } else {
        if (!currentUploadedFile) {
          showToast("Please select a video or audio file to upload.", "error");
          return;
        }
        const formData = new FormData();
        formData.append("file", currentUploadedFile);
        await initiateJob("/api/summarize/upload", formData, true);
      }
    });
  }

  async function initiateJob(endpoint, body, isFormData) {
    startSummarizeBtn.disabled = true;
    startSummarizeBtn.textContent = "Processing...";
    if (loadingContainer) loadingContainer.style.display = "block";
    if (errorContainer) errorContainer.style.display = "none";
    if (workspaceContainer) workspaceContainer.style.display = "none";

    try {
      const opts = {
        method: "POST",
        body: isFormData ? body : JSON.stringify(body),
        headers: isFormData ? {} : { "Content-Type": "application/json" }
      };

      const res = await fetch(endpoint, opts);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to start summarization task.");
      }

      activeJobId = data.job_id;
      showToast("Pipeline initiated locally!", "info");
      startPolling(activeJobId);

    } catch (err) {
      showToast(err.message, "error");
      startSummarizeBtn.disabled = false;
      startSummarizeBtn.textContent = "Summarize Video →";
      if (loadingContainer) loadingContainer.style.display = "none";
      if (errorContainer) {
        errorContainer.style.display = "block";
        errorContainer.textContent = err.message;
      }
    }
  }

  function startPolling(jobId) {
    if (activePollingTimer) clearInterval(activePollingTimer);

    activePollingTimer = setInterval(async () => {
      try {
        const res = await fetch(`/api/job/${jobId}`);
        if (!res.ok) throw new Error("Could not check task status.");

        const job = await res.json();

        if (job.status === "completed") {
          clearInterval(activePollingTimer);
          if (loadingContainer) loadingContainer.style.display = "none";
          startSummarizeBtn.disabled = false;
          startSummarizeBtn.textContent = "Summarize Video →";
          showToast("Summarization complete!", "success");
          renderOutputWorkspace(job.result);
        } else if (job.status === "failed") {
          clearInterval(activePollingTimer);
          if (loadingContainer) loadingContainer.style.display = "none";
          startSummarizeBtn.disabled = false;
          startSummarizeBtn.textContent = "Summarize Video →";
          if (errorContainer) {
            errorContainer.style.display = "block";
            errorContainer.textContent = job.error || "An error occurred.";
          }
          showToast(job.error || "Summarization failed", "error");
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 1500);
  }

  // --- Output Workspace Rendering & Multi-Tab Features ---
  const workspaceContainer = document.getElementById("workspace-container");
  const videoTitleHeading = document.getElementById("video-title-heading");
  const summaryContentEl = document.getElementById("summary-content");
  const transcriptContentEl = document.getElementById("transcript-content");
  const transcriptSearchInput = document.getElementById("transcript-search-input");

  const tabSummaryView = document.getElementById("tab-summary-view");
  const tabTranscriptView = document.getElementById("tab-transcript-view");
  const tabFlashcardsView = document.getElementById("tab-flashcards-view");
  const tabPresentationView = document.getElementById("tab-presentation-view");
  const tabQuizView = document.getElementById("tab-quiz-view");

  const viewSummaryPane = document.getElementById("view-summary-pane");
  const viewTranscriptPane = document.getElementById("view-transcript-pane");
  const viewFlashcardsPane = document.getElementById("view-flashcards-pane");
  const viewPresentationPane = document.getElementById("view-presentation-pane");
  const viewQuizPane = document.getElementById("view-quiz-pane");

  const flashcardsContainer = document.getElementById("flashcards-container");
  const presentationContainer = document.getElementById("presentation-container");
  const quizContainer = document.getElementById("quiz-container");

  let currentResult = null;
  let cachedFlashcards = null;
  let cachedPresentation = null;
  let cachedQuiz = null;

  function switchTab(activeBtn, activePane) {
    [tabSummaryView, tabTranscriptView, tabFlashcardsView, tabPresentationView, tabQuizView].forEach(btn => {
      if (btn) btn.classList.remove("active");
    });
    [viewSummaryPane, viewTranscriptPane, viewFlashcardsPane, viewPresentationPane, viewQuizPane].forEach(pane => {
      if (pane) pane.style.display = "none";
    });

    if (activeBtn) activeBtn.classList.add("active");
    if (activePane) activePane.style.display = "block";
  }

  if (tabSummaryView) tabSummaryView.addEventListener("click", () => switchTab(tabSummaryView, viewSummaryPane));
  if (tabTranscriptView) tabTranscriptView.addEventListener("click", () => switchTab(tabTranscriptView, viewTranscriptPane));
  if (tabFlashcardsView) {
    tabFlashcardsView.addEventListener("click", () => {
      switchTab(tabFlashcardsView, viewFlashcardsPane);
      if (!cachedFlashcards) loadFlashcards();
    });
  }
  if (tabPresentationView) {
    tabPresentationView.addEventListener("click", () => {
      switchTab(tabPresentationView, viewPresentationPane);
      if (!cachedPresentation) loadPresentation();
    });
  }
  if (tabQuizView) {
    tabQuizView.addEventListener("click", () => {
      switchTab(tabQuizView, viewQuizPane);
      if (!cachedQuiz) loadQuiz();
    });
  }

  // --- Flashcards Logic ---
  async function loadFlashcards() {
    if (!currentResult) return;
    flashcardsContainer.innerHTML = `
      <div style="text-align: center; padding: 48px 20px;">
        <div style="width: 36px; height: 36px; border: 3px solid var(--card-border); border-top-color: var(--brand-lime); border-radius: 50%; margin: 0 auto 14px auto; animation: spin 0.8s linear infinite;"></div>
        <div style="font-size: 15px; font-weight: 700;">Generating Study Flashcards...</div>
        <div style="font-size: 13px; color: var(--text-muted);">Powered by Gemini AI with local fallback</div>
      </div>
    `;

    try {
      const res = await fetch("/api/generate/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: currentResult.title,
          summary: currentResult.summary,
          transcript: currentResult.transcript
        })
      });
      const data = await res.json();
      cachedFlashcards = data.flashcards || [];
      renderFlashcards(cachedFlashcards, data.provider);
      showToast(`Flashcards ready! (${data.provider})`, "success");
    } catch (err) {
      flashcardsContainer.innerHTML = `<div style="color: var(--color-danger); text-align: center; padding: 20px;">Failed to generate flashcards: ${err.message}</div>`;
    }
  }

  function renderFlashcards(cards, provider) {
    if (!cards || cards.length === 0) {
      flashcardsContainer.innerHTML = `<div style="text-align: center; padding: 20px; color: var(--text-muted);">No flashcards generated.</div>`;
      return;
    }

    let cardIdx = 0;
    let isFlipped = false;

    function renderCurrentCard() {
      const card = cards[cardIdx];
      flashcardsContainer.innerHTML = `
        <div style="max-width: 600px; margin: 0 auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 13px;">
            <span style="font-weight: 700;">Card ${cardIdx + 1} of ${cards.length}</span>
            <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: var(--btn-secondary-bg); border: 1px solid var(--card-border);">${provider || "AI"}</span>
          </div>
          
          <div id="flashcard-box" style="min-height: 240px; padding: 36px 24px; border-radius: 16px; background: var(--card-surface-elevated); border: 1px solid var(--card-border); cursor: pointer; display: flex; flex-direction: column; justify-content: space-between; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
            <div style="display: flex; justify-content: space-between;">
              <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; background: var(--btn-secondary-bg); padding: 2px 8px; border-radius: 6px;">${card.tag || (isFlipped ? "Explanation" : "Concept")}</span>
              <span style="font-size: 11px; color: var(--text-muted);">Click to flip</span>
            </div>
            <div style="margin: auto 0; font-size: ${isFlipped ? '15px' : '18px'}; font-weight: ${isFlipped ? '500' : '800'}; line-height: 1.6;">
              ${isFlipped ? card.back : card.front}
            </div>
            <div style="font-size: 11px; color: var(--text-muted);">
              ${isFlipped ? "Showing Back (Click to flip)" : "Showing Front (Click to flip)"}
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 18px;">
            <button id="fc-prev-btn" class="btn-secondary" ${cardIdx === 0 ? "disabled" : ""}>← Previous</button>
            <button id="fc-flip-btn" class="btn-secondary">Flip Card</button>
            <button id="fc-next-btn" class="btn-secondary" ${cardIdx === cards.length - 1 ? "disabled" : ""}>Next →</button>
          </div>
        </div>
      `;

      document.getElementById("flashcard-box").addEventListener("click", () => {
        isFlipped = !isFlipped;
        renderCurrentCard();
      });

      document.getElementById("fc-flip-btn").addEventListener("click", () => {
        isFlipped = !isFlipped;
        renderCurrentCard();
      });

      const prevBtn = document.getElementById("fc-prev-btn");
      if (prevBtn && cardIdx > 0) {
        prevBtn.addEventListener("click", () => {
          cardIdx--;
          isFlipped = false;
          renderCurrentCard();
        });
      }

      const nextBtn = document.getElementById("fc-next-btn");
      if (nextBtn && cardIdx < cards.length - 1) {
        nextBtn.addEventListener("click", () => {
          cardIdx++;
          isFlipped = false;
          renderCurrentCard();
        });
      }
    }

    renderCurrentCard();
  }

  // --- Presentation Logic ---
  async function loadPresentation() {
    if (!currentResult) return;
    presentationContainer.innerHTML = `
      <div style="text-align: center; padding: 48px 20px;">
        <div style="width: 36px; height: 36px; border: 3px solid var(--card-border); border-top-color: var(--brand-lime); border-radius: 50%; margin: 0 auto 14px auto; animation: spin 0.8s linear infinite;"></div>
        <div style="font-size: 15px; font-weight: 700;">Generating Keynote Presentation...</div>
        <div style="font-size: 13px; color: var(--text-muted);">Powered by Gemini AI with downloadable .pptx</div>
      </div>
    `;

    try {
      const res = await fetch("/api/generate/presentation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: currentResult.title,
          summary: currentResult.summary,
          transcript: currentResult.transcript
        })
      });
      const data = await res.json();
      cachedPresentation = data;
      renderPresentation(data);
      showToast(`Presentation slides ready! (${data.provider})`, "success");
    } catch (err) {
      presentationContainer.innerHTML = `<div style="color: var(--color-danger); text-align: center; padding: 20px;">Failed to generate presentation: ${err.message}</div>`;
    }
  }

  function renderPresentation(data) {
    if (!data || !data.slides || data.slides.length === 0) {
      presentationContainer.innerHTML = `<div style="text-align: center; padding: 20px; color: var(--text-muted);">No slides available.</div>`;
      return;
    }

    let slideIdx = 0;
    const slides = data.slides;

    function renderCurrentSlide() {
      const slide = slides[slideIdx];
      presentationContainer.innerHTML = `
        <div style="max-width: 750px; margin: 0 auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <div>
              <div style="font-size: 15px; font-weight: 800;">${data.title || "Presentation"}</div>
              <div style="font-size: 12px; color: var(--text-muted);">Slide ${slideIdx + 1} of ${slides.length} • ${data.provider || "AI"}</div>
            </div>
            <button id="download-pptx-btn" class="btn-primary" style="padding: 6px 14px; font-size: 12px;">
              Download .PPTX
            </button>
          </div>

          <div style="aspect-ratio: 16/9; min-height: 320px; border-radius: 16px; background: #0E0F0C; color: #F2F2F0; padding: 36px 40px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 10px 30px rgba(0,0,0,0.4); border: 1px solid var(--card-border); position: relative; overflow: hidden;">
            <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: var(--brand-lime);"></div>
            <div>
              <div style="font-size: 11px; font-weight: 700; color: var(--brand-lime); text-transform: uppercase; margin-bottom: 6px;">SLIDE ${slideIdx + 1}</div>
              <div style="font-size: 24px; font-weight: 800; color: #F2F2F0; line-height: 1.25;">${slide.title}</div>
            </div>

            <div style="margin: auto 0; padding: 12px 0;">
              ${slide.bullets.map(b => `<div style="margin-bottom: 10px; font-size: 15px; color: #E5E7EB; display: flex; align-items: flex-start; gap: 8px;"><span style="color: var(--brand-lime);">•</span> <span>${b}</span></div>`).join("")}
            </div>

            <div style="font-size: 11px; color: #6B7280; border-top: 1px solid #1F2937; padding-top: 8px; display: flex; justify-content: space-between;">
              <span>${data.title || "Presentation"}</span>
              <span>${slideIdx + 1} / ${slides.length}</span>
            </div>
          </div>

          ${slide.notes ? `
            <div style="margin-top: 14px; padding: 12px 16px; border-radius: 10px; background: var(--card-surface-elevated); border: 1px solid var(--card-border); font-size: 12px; color: var(--text-muted);">
              <strong style="color: var(--text-main);">Speaker Notes:</strong> ${slide.notes}
            </div>
          ` : ""}

          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 18px;">
            <button id="ppt-prev-btn" class="btn-secondary" ${slideIdx === 0 ? "disabled" : ""}>← Previous</button>
            <div style="display: flex; gap: 6px;">
              ${slides.map((_, i) => `<button class="slide-dot-btn btn-secondary" style="padding: 4px 8px; font-size: 11px; ${i === slideIdx ? 'background: var(--brand-lime); color: #0E0F0C; font-weight: 800;' : ''}" data-idx="${i}">${i + 1}</button>`).join("")}
            </div>
            <button id="ppt-next-btn" class="btn-secondary" ${slideIdx === slides.length - 1 ? "disabled" : ""}>Next →</button>
          </div>
        </div>
      `;

      document.getElementById("download-pptx-btn").addEventListener("click", async () => {
        const btn = document.getElementById("download-pptx-btn");
        btn.disabled = true;
        btn.textContent = "Compiling PPTX...";
        try {
          const res = await fetch("/api/download/pptx", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: data.title, slides: data.slides })
          });
          if (!res.ok) throw new Error("PPTX creation failed");
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${(data.title || "presentation").replace(/[^a-z0-9]+/gi, "_")}.pptx`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          showToast("PowerPoint file downloaded!", "success");
        } catch (e) {
          showToast(e.message, "error");
        } finally {
          btn.disabled = false;
          btn.textContent = "Download .PPTX";
        }
      });

      const prevBtn = document.getElementById("ppt-prev-btn");
      if (prevBtn && slideIdx > 0) {
        prevBtn.addEventListener("click", () => {
          slideIdx--;
          renderCurrentSlide();
        });
      }

      const nextBtn = document.getElementById("ppt-next-btn");
      if (nextBtn && slideIdx < slides.length - 1) {
        nextBtn.addEventListener("click", () => {
          slideIdx++;
          renderCurrentSlide();
        });
      }

      document.querySelectorAll(".slide-dot-btn").forEach(b => {
        b.addEventListener("click", (e) => {
          slideIdx = parseInt(e.target.getAttribute("data-idx"));
          renderCurrentSlide();
        });
      });
    }

    renderCurrentSlide();
  }

  // --- Quiz Logic ---
  async function loadQuiz() {
    if (!currentResult) return;
    quizContainer.innerHTML = `
      <div style="text-align: center; padding: 48px 20px;">
        <div style="width: 36px; height: 36px; border: 3px solid var(--card-border); border-top-color: var(--brand-lime); border-radius: 50%; margin: 0 auto 14px auto; animation: spin 0.8s linear infinite;"></div>
        <div style="font-size: 15px; font-weight: 700;">Generating Knowledge Check Quiz...</div>
        <div style="font-size: 13px; color: var(--text-muted);">Powered by Grok AI with local fallback</div>
      </div>
    `;

    try {
      const res = await fetch("/api/generate/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: currentResult.title,
          summary: currentResult.summary,
          transcript: currentResult.transcript
        })
      });
      const data = await res.json();
      cachedQuiz = data.quiz || [];
      renderQuiz(cachedQuiz, data.provider);
      showToast(`Quiz ready! (${data.provider})`, "success");
    } catch (err) {
      quizContainer.innerHTML = `<div style="color: var(--color-danger); text-align: center; padding: 20px;">Failed to generate quiz: ${err.message}</div>`;
    }
  }

  function renderQuiz(questions, provider) {
    if (!questions || questions.length === 0) {
      quizContainer.innerHTML = `<div style="text-align: center; padding: 20px; color: var(--text-muted);">No quiz questions generated.</div>`;
      return;
    }

    let qIdx = 0;
    const answers = {};

    function renderCurrentQuestion() {
      const q = questions[qIdx];
      const hasAnswered = answers[qIdx] !== undefined;
      const userChoice = answers[qIdx];

      quizContainer.innerHTML = `
        <div style="max-width: 600px; margin: 0 auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; font-size: 13px;">
            <span style="font-weight: 700;">Question ${qIdx + 1} of ${questions.length}</span>
            <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: var(--btn-secondary-bg); border: 1px solid var(--card-border);">${provider || "AI"}</span>
          </div>

          <div style="padding: 24px; border-radius: 16px; background: var(--card-surface-elevated); border: 1px solid var(--card-border); margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="font-size: 16px; font-weight: 800; line-height: 1.5; margin-bottom: 18px;">${q.question}</div>

            <div style="display: flex; flex-direction: column; gap: 10px;">
              ${q.options.map((opt, i) => {
                let bg = "var(--card-bg)";
                let border = "var(--card-border)";
                let color = "var(--text-main)";

                if (hasAnswered) {
                  if (i === q.answerIndex) {
                    bg = "rgba(34, 197, 94, 0.15)";
                    border = "#22c55e";
                    color = "#22c55e";
                  } else if (i === userChoice) {
                    bg = "rgba(239, 68, 68, 0.15)";
                    border = "#ef4444";
                    color = "#ef4444";
                  } else {
                    bg = "var(--card-bg)";
                    color = "var(--text-muted)";
                  }
                }

                return `
                  <button class="quiz-opt-btn" data-opt="${i}" ${hasAnswered ? "disabled" : ""} style="padding: 12px 16px; text-align: left; border-radius: 10px; background: ${bg}; border: 1px solid ${border}; color: ${color}; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s ease; display: flex; align-items: center; gap: 10px;">
                    <span style="width: 22px; height: 22px; border-radius: 6px; background: var(--btn-secondary-bg); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800;">${String.fromCharCode(65 + i)}</span>
                    <span>${opt}</span>
                  </button>
                `;
              }).join("")}
            </div>

            ${hasAnswered ? `
              <div style="margin-top: 16px; padding: 12px 14px; border-radius: 8px; background: var(--btn-secondary-bg); font-size: 12px; line-height: 1.5; color: var(--text-muted);">
                <strong style="color: var(--text-main);">${userChoice === q.answerIndex ? "✅ Correct!" : "❌ Incorrect."}</strong> ${q.explanation}
              </div>
            ` : ""}
          </div>

          ${hasAnswered ? `
            <div style="display: flex; justify-content: flex-end;">
              <button id="quiz-next-btn" class="btn-primary" style="padding: 8px 18px;">
                ${qIdx < questions.length - 1 ? "Next Question →" : "View Score 🏆"}
              </button>
            </div>
          ` : ""}
        </div>
      `;

      document.querySelectorAll(".quiz-opt-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const opt = parseInt(e.currentTarget.getAttribute("data-opt"));
          answers[qIdx] = opt;
          renderCurrentQuestion();
        });
      });

      const nextBtn = document.getElementById("quiz-next-btn");
      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          if (qIdx < questions.length - 1) {
            qIdx++;
            renderCurrentQuestion();
          } else {
            // Render Final Score
            const correctCount = questions.reduce((acc, question, index) => acc + (answers[index] === question.answerIndex ? 1 : 0), 0);
            const pct = Math.round((correctCount / questions.length) * 100);
            quizContainer.innerHTML = `
              <div style="max-width: 500px; margin: 0 auto; text-align: center; padding: 32px 20px;">
                <div style="width: 64px; height: 64px; border-radius: 50%; background: var(--brand-lime); color: #0E0F0C; display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto 16px auto;">🏆</div>
                <h3 style="font-size: 22px; font-weight: 800; margin-bottom: 6px;">Quiz Completed!</h3>
                <div style="font-size: 36px; font-weight: 900; color: var(--brand-lime); margin: 16px 0;">${pct}%</div>
                <p style="font-size: 14px; color: var(--text-muted); margin-bottom: 24px;">You answered ${correctCount} of ${questions.length} questions correctly.</p>
                <button id="quiz-retake-btn" class="btn-primary" style="padding: 10px 24px;">Retake Quiz</button>
              </div>
            `;
            document.getElementById("quiz-retake-btn").addEventListener("click", () => {
              for (const k in answers) delete answers[k];
              qIdx = 0;
              renderCurrentQuestion();
            });
          }
        });
      }
    }

    renderCurrentQuestion();
  }

  // --- Quick Study Toolkit Card Listeners ---
  const quickFlashcardsCard = document.getElementById("quick-flashcards-card");
  const quickPresentationCard = document.getElementById("quick-presentation-card");
  const quickQuizCard = document.getElementById("quick-quiz-card");

  if (quickFlashcardsCard) {
    quickFlashcardsCard.addEventListener("click", () => {
      switchTab(tabFlashcardsView, viewFlashcardsPane);
      if (!cachedFlashcards) loadFlashcards();
    });
  }

  if (quickPresentationCard) {
    quickPresentationCard.addEventListener("click", () => {
      switchTab(tabPresentationView, viewPresentationPane);
      if (!cachedPresentation) loadPresentation();
    });
  }

  if (quickQuizCard) {
    quickQuizCard.addEventListener("click", () => {
      switchTab(tabQuizView, viewQuizPane);
      if (!cachedQuiz) loadQuiz();
    });
  }

  function renderOutputWorkspace(result) {
    if (!result) return;
    currentResult = result;
    workspaceContainer.style.display = "block";
    workspaceContainer.scrollIntoView({ behavior: "smooth" });

    videoTitleHeading.textContent = result.title || "Video Summary";

    // Render Markdown + Math
    if (window.marked) {
      summaryContentEl.innerHTML = marked.parse(result.summary || "");
    } else {
      summaryContentEl.textContent = result.summary || "";
    }

    // Trigger KaTeX Formula Rendering
    if (window.renderMathInElement) {
      renderMathInElement(summaryContentEl, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "\\[", right: "\\]", display: true },
          { left: "$", right: "$", display: false },
          { left: "\\(", right: "\\)", display: false }
        ],
        throwOnError: false
      });
    }

    // Populate Transcript
    renderTranscript(result.transcript || "");
  }

  function renderTranscript(text, filter = "") {
    transcriptContentEl.innerHTML = "";
    if (!text) {
      transcriptContentEl.textContent = "No transcript available.";
      return;
    }

    const lines = text.split("\n").filter(l => l.trim().length > 0);
    const filtered = filter ? lines.filter(l => l.toLowerCase().includes(filter.toLowerCase())) : lines;

    if (filtered.length === 0) {
      transcriptContentEl.innerHTML = `<div style="color: var(--text-muted); font-size: 14px;">No matching segments found for "${filter}".</div>`;
      return;
    }

    filtered.forEach((line) => {
      const p = document.createElement("p");
      p.style.marginBottom = "10px";
      p.style.lineHeight = "1.7";
      p.style.fontSize = "14px";
      p.textContent = line;
      transcriptContentEl.appendChild(p);
    });
  }

  if (transcriptSearchInput) {
    transcriptSearchInput.addEventListener("input", (e) => {
      if (currentResult) {
        renderTranscript(currentResult.transcript, e.target.value);
      }
    });
  }

  // --- Export Actions ---
  const copySummaryBtn = document.getElementById("copy-summary-btn");
  const copyTranscriptBtn = document.getElementById("copy-transcript-btn");
  const exportPdfBtn = document.getElementById("export-pdf-btn");
  const downloadTxtSummaryBtn = document.getElementById("download-txt-summary-btn");
  const exportPdfTranscriptBtn = document.getElementById("export-pdf-transcript-btn");
  const downloadTxtBtn = document.getElementById("download-txt-btn");

  function printCleanPdf(title, contentHtml) {
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title></title>
  <style>
    @page {
      margin: 16mm;
      size: auto;
    }
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #111111;
      background: #ffffff;
      line-height: 1.6;
      padding: 0;
      margin: 0;
    }
    .pdf-header {
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 2px solid #eaeaea;
    }
    .pdf-title {
      font-size: 22px;
      font-weight: 800;
      color: #0E0F0C;
      margin: 0;
    }
    .pdf-body {
      font-size: 13.5px;
      color: #222222;
      line-height: 1.7;
    }
    h1, h2, h3, h4 { color: #0E0F0C; font-weight: 700; margin-top: 18px; margin-bottom: 8px; }
    h1 { font-size: 18px; }
    h2 { font-size: 15px; }
    h3 { font-size: 13.5px; }
    p { margin: 8px 0; }
    ul, ol { padding-left: 20px; margin: 8px 0; }
    li { margin: 4px 0; }
    code { font-family: monospace; background: #f4f4f4; padding: 2px 4px; border-radius: 4px; font-size: 12px; }
    pre { background: #f4f4f4; padding: 12px; border-radius: 6px; overflow-x: auto; font-size: 12px; }
    .transcript-line { margin-bottom: 10px; font-size: 13.5px; color: #222; }
  </style>
</head>
<body>
  <div class="pdf-header">
    <h1 class="pdf-title">${title}</h1>
  </div>
  <div class="pdf-body">
    ${contentHtml}
  </div>
</body>
</html>`);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }, 250);
  }

  if (copySummaryBtn) {
    copySummaryBtn.addEventListener("click", () => {
      if (!currentResult || !currentResult.summary) return;
      navigator.clipboard.writeText(currentResult.summary).then(() => {
        showToast("Summary copied to clipboard!", "success");
      });
    });
  }

  if (exportPdfBtn) {
    exportPdfBtn.addEventListener("click", () => {
      if (!currentResult || !currentResult.summary) return;
      printCleanPdf(currentResult.title || "Video Summary", summaryContentEl.innerHTML);
    });
  }

  if (downloadTxtSummaryBtn) {
    downloadTxtSummaryBtn.addEventListener("click", () => {
      if (!currentResult || !currentResult.summary) return;
      downloadFile(currentResult.summary, `${sanitizeFilename(currentResult.title)}_summary.txt`, "text/plain");
      showToast("Downloaded Summary TXT!", "success");
    });
  }

  if (copyTranscriptBtn) {
    copyTranscriptBtn.addEventListener("click", () => {
      if (!currentResult || !currentResult.transcript) return;
      navigator.clipboard.writeText(currentResult.transcript).then(() => {
        showToast("Transcript copied to clipboard!", "success");
      });
    });
  }

  if (exportPdfTranscriptBtn) {
    exportPdfTranscriptBtn.addEventListener("click", () => {
      if (!currentResult || !currentResult.transcript) return;
      const transcriptHtml = currentResult.transcript
        .split("\n")
        .filter(l => l.trim().length > 0)
        .map(l => `<p class="transcript-line">${l.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`)
        .join("");
      printCleanPdf(`${currentResult.title || "Video"} — Full Transcript`, transcriptHtml);
    });
  }

  if (downloadTxtBtn) {
    downloadTxtBtn.addEventListener("click", () => {
      if (!currentResult || !currentResult.transcript) return;
      downloadFile(currentResult.transcript, `${sanitizeFilename(currentResult.title)}_transcript.txt`, "text/plain");
      showToast("Downloaded Transcript TXT!", "success");
    });
  }

  function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function sanitizeFilename(title) {
    return (title || "video").toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 40);
  }

  // --- Toast System ---
  const toastContainer = document.getElementById("toast-container");

  function showToast(message, type = "info") {
    if (!toastContainer) return;

    const toast = document.createElement("div");
    toast.className = "toast";

    let iconSvg = "";
    if (type === "success") {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
    } else if (type === "error") {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
    } else {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand-lime)" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    }

    toast.innerHTML = `${iconSvg}<span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = "all 0.3s ease";
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
});
