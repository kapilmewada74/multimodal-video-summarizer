/**
 * Multimodal Video Summarizer — Client Application
 * Tool-first UX with BYAMN Design Tokens & Live Pipeline Stepper
 */

document.addEventListener("DOMContentLoaded", () => {
  // --- Theme Management ---
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const htmlEl = document.documentElement;
  
  const savedTheme = localStorage.getItem("theme") || "dark";
  htmlEl.classList.remove("dark", "light");
  htmlEl.classList.add(savedTheme);
  updateThemeIcon(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const isDark = htmlEl.classList.contains("dark") && !htmlEl.classList.contains("light");
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

    youtubeUrlInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const startBtn = document.getElementById("start-summarize-btn");
        if (startBtn && !startBtn.disabled) startBtn.click();
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

  const summaryExportToolbar = document.getElementById("summary-export-toolbar");

  function switchTab(activeBtn, activePane) {
    [tabSummaryView, tabTranscriptView, tabFlashcardsView, tabPresentationView, tabQuizView].forEach(btn => {
      if (btn) btn.classList.remove("active");
    });
    [viewSummaryPane, viewTranscriptPane, viewFlashcardsPane, viewPresentationPane, viewQuizPane].forEach(pane => {
      if (pane) pane.style.display = "none";
    });

    if (activeBtn) activeBtn.classList.add("active");
    if (activePane) activePane.style.display = "block";

    // Summary export toolbar (PDF, .TXT, Copy) should ONLY be visible on the AI Summary tab!
    // On Full Transcript, Flashcards, Presentation, and Quiz, do NOT show it.
    if (summaryExportToolbar) {
      if (activeBtn === tabSummaryView) {
        summaryExportToolbar.style.display = "flex";
      } else {
        summaryExportToolbar.style.display = "none";
      }
    }
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
      if (!cachedQuiz) renderQuizSetup();
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

          <!-- 3D Page Paper Turn Scene -->
          <div class="flashcard-paper-scene" style="margin-bottom: 20px; select: none;">
            <div id="flashcard-paper-card" class="flashcard-paper-card ${isFlipped ? 'flipped' : ''}">
              <!-- Front Face (Question) -->
              <div class="flashcard-paper-face flashcard-paper-front">
                <div style="display: flex; justify-content: space-between;">
                  <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; background: var(--btn-secondary-bg); padding: 2px 8px; border-radius: 6px;">${card.tag || "Question"}</span>
                  <span style="font-size: 11px; color: var(--text-muted);">Click to turn page</span>
                </div>
                <div style="margin: auto 0; font-size: 19px; font-weight: 800; line-height: 1.5; padding: 18px 0; color: var(--text-main);">
                  ${card.front}
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted);">
                  <span>Card ${cardIdx + 1} of ${cards.length}</span>
                  <span>Turn page →</span>
                </div>
                <div class="page-curl"></div>
              </div>

              <!-- Back Face (Answer) -->
              <div class="flashcard-paper-face flashcard-paper-back">
                <div style="display: flex; justify-content: space-between;">
                  <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; background: var(--btn-secondary-bg); padding: 2px 8px; border-radius: 6px;">${card.tag || "Answer"}</span>
                  <span style="font-size: 11px; color: var(--text-muted);">Click to flip back</span>
                </div>
                <div style="margin: auto 0; font-size: 15px; font-weight: 500; line-height: 1.6; padding: 18px 0; color: var(--text-main);">
                  ${card.back}
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted);">
                  <span>Answer</span>
                  <span>← Flip back</span>
                </div>
              </div>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 18px;">
            <button id="fc-prev-btn" class="btn-secondary" ${cardIdx === 0 ? "disabled" : ""} style="width: 38px; height: 38px; border-radius: 50%; padding: 0; display: flex; align-items: center; justify-content: center;" title="Previous Card">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <div style="display: flex; gap: 6px;">
              ${cards.map((_, i) => `<span style="display: inline-block; width: ${i === cardIdx ? '16px' : '6px'}; height: 6px; border-radius: 3px; background: ${i === cardIdx ? 'var(--brand-lime)' : 'var(--card-border)'}; transition: all 0.2s;"></span>`).join("")}
            </div>
            <button id="fc-next-btn" class="btn-secondary" ${cardIdx === cards.length - 1 ? "disabled" : ""} style="width: 38px; height: 38px; border-radius: 50%; padding: 0; display: flex; align-items: center; justify-content: center;" title="Next Card">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
      `;

      const paperCard = document.getElementById("flashcard-paper-card");
      if (paperCard) {
        paperCard.addEventListener("click", () => {
          isFlipped = !isFlipped;
          paperCard.classList.toggle("flipped", isFlipped);
        });
      }

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
  let selectedQuizDifficulty = "medium";
  let selectedQuizCount = 5;

  function renderQuizSetup() {
    let chosenDiff = selectedQuizDifficulty || "medium";
    let chosenCount = selectedQuizCount || 5;

    quizContainer.innerHTML = `
      <div style="max-width: 520px; margin: 0 auto; text-align: center; padding: 16px 12px 32px 12px;">
        <!-- Illustrated Quiz Clipboard Header -->
        <svg width="120" height="110" viewBox="0 0 120 110" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin: 0 auto 10px auto; display: block;">
          <path d="M25 65C15 50 25 25 50 25C70 15 95 25 100 45C108 65 95 85 75 90C50 95 35 80 25 65Z" fill="#D9EC95" fill-opacity="0.38" />
          <line x1="18" y1="28" x2="26" y2="22" stroke="#F59E0B" stroke-width="3" stroke-linecap="round" />
          <line x1="26" y1="36" x2="34" y2="30" stroke="#F59E0B" stroke-width="3" stroke-linecap="round" />
          <path d="M96 22L97.5 27L102.5 28.5L97.5 30L96 35L94.5 30L89.5 28.5L94.5 27L96 22Z" fill="#15803D" />
          <rect x="36" y="22" width="48" height="62" rx="7" fill="#FFFFFF" stroke="#1E3A1A" stroke-width="2.5" />
          <rect x="49" y="17" width="22" height="10" rx="3" fill="#D9EC95" stroke="#1E3A1A" stroke-width="2.2" />
          <circle cx="60" cy="22" r="2" fill="#1E3A1A" />
          <path d="M44 38L47 41L53 35" stroke="#16A34A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
          <line x1="57" y1="38" x2="74" y2="38" stroke="#1E3A1A" stroke-width="2" stroke-linecap="round" />
          <path d="M44 51L47 54L53 48" stroke="#16A34A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
          <line x1="57" y1="51" x2="74" y2="51" stroke="#1E3A1A" stroke-width="2" stroke-linecap="round" />
          <path d="M44 64L47 67L53 61" stroke="#16A34A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
          <line x1="57" y1="64" x2="74" y2="64" stroke="#1E3A1A" stroke-width="2" stroke-linecap="round" />
          <g transform="rotate(35 82 48)">
            <rect x="74" y="24" width="7" height="24" rx="1.5" fill="#FBBF24" stroke="#1E3A1A" stroke-width="1.8" />
            <rect x="74" y="20" width="7" height="5" rx="1.5" fill="#F87171" stroke="#1E3A1A" stroke-width="1.8" />
            <rect x="74" y="24" width="7" height="2" fill="#9CA3AF" />
            <polygon points="74,48 81,48 77.5,55" fill="#FDE68A" stroke="#1E3A1A" stroke-width="1.8" />
            <polygon points="76.5,52 78.5,52 77.5,55" fill="#1E3A1A" />
          </g>
        </svg>

        <h3 style="font-size: 32px; font-weight: 900; letter-spacing: -0.02em; margin-bottom: 6px; color: var(--text-main);">Quiz</h3>
        <p style="font-size: 14px; color: var(--text-muted); margin-bottom: 32px;">Test your knowledge with customizable quizzes.</p>

        <div style="max-width: 480px; margin: 0 auto 36px auto;">
          <!-- Row 1: Difficulty -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; gap: 12px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 10px; color: var(--text-main); font-size: 15px; font-weight: 600;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              <span>Difficulty</span>
            </div>
            <div style="display: flex; gap: 8px;">
              <button type="button" class="setup-diff-btn" data-diff="easy" style="padding: 8px 22px; font-size: 14px; border-radius: 9999px; cursor: pointer; transition: all 0.15s; min-width: 68px; text-align: center; ${chosenDiff === "easy" ? "background: var(--brand-lime); color: #0E0F0C; font-weight: 700; border: 1px solid var(--brand-lime);" : "background: var(--card-bg); color: var(--text-main); font-weight: 500; border: 1px solid var(--card-border);"}">Easy</button>
              <button type="button" class="setup-diff-btn" data-diff="medium" style="padding: 8px 22px; font-size: 14px; border-radius: 9999px; cursor: pointer; transition: all 0.15s; min-width: 68px; text-align: center; ${chosenDiff === "medium" ? "background: var(--brand-lime); color: #0E0F0C; font-weight: 700; border: 1px solid var(--brand-lime);" : "background: var(--card-bg); color: var(--text-main); font-weight: 500; border: 1px solid var(--card-border);"}">Medium</button>
              <button type="button" class="setup-diff-btn" data-diff="hard" style="padding: 8px 22px; font-size: 14px; border-radius: 9999px; cursor: pointer; transition: all 0.15s; min-width: 68px; text-align: center; ${chosenDiff === "hard" ? "background: var(--brand-lime); color: #0E0F0C; font-weight: 700; border: 1px solid var(--brand-lime);" : "background: var(--card-bg); color: var(--text-main); font-weight: 500; border: 1px solid var(--card-border);"}">Hard</button>
            </div>
          </div>

          <!-- Row 2: Number of Questions -->
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 10px; color: var(--text-main); font-size: 15px; font-weight: 600;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span>Number of Questions</span>
            </div>
            <div style="display: flex; gap: 8px;">
              <button type="button" class="setup-count-btn" data-count="3" style="padding: 8px 22px; font-size: 14px; border-radius: 9999px; cursor: pointer; transition: all 0.15s; min-width: 54px; text-align: center; ${chosenCount === 3 ? "background: var(--brand-lime); color: #0E0F0C; font-weight: 700; border: 1px solid var(--brand-lime);" : "background: var(--card-bg); color: var(--text-main); font-weight: 500; border: 1px solid var(--card-border);"}">3</button>
              <button type="button" class="setup-count-btn" data-count="5" style="padding: 8px 22px; font-size: 14px; border-radius: 9999px; cursor: pointer; transition: all 0.15s; min-width: 54px; text-align: center; ${chosenCount === 5 ? "background: var(--brand-lime); color: #0E0F0C; font-weight: 700; border: 1px solid var(--brand-lime);" : "background: var(--card-bg); color: var(--text-main); font-weight: 500; border: 1px solid var(--card-border);"}">5</button>
              <button type="button" class="setup-count-btn" data-count="10" style="padding: 8px 22px; font-size: 14px; border-radius: 9999px; cursor: pointer; transition: all 0.15s; min-width: 54px; text-align: center; ${chosenCount === 10 ? "background: var(--brand-lime); color: #0E0F0C; font-weight: 700; border: 1px solid var(--brand-lime);" : "background: var(--card-bg); color: var(--text-main); font-weight: 500; border: 1px solid var(--card-border);"}">10</button>
            </div>
          </div>
        </div>

        <div>
          <button id="start-setup-quiz-btn" style="background: #2E7D32; color: #FFFFFF; font-size: 15px; font-weight: 700; padding: 13px 44px; border-radius: 9999px; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 14px rgba(46, 125, 50, 0.25); transition: all 0.2s ease;">
            <span>Start Quiz</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </div>
      </div>
    `;

    const startBtn = document.getElementById("start-setup-quiz-btn");

    document.querySelectorAll(".setup-diff-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        document.querySelectorAll(".setup-diff-btn").forEach(b => {
          b.style.background = "var(--card-bg)";
          b.style.color = "var(--text-main)";
          b.style.borderColor = "var(--card-border)";
          b.style.fontWeight = "500";
        });
        e.currentTarget.style.background = "var(--brand-lime)";
        e.currentTarget.style.color = "#0E0F0C";
        e.currentTarget.style.borderColor = "var(--brand-lime)";
        e.currentTarget.style.fontWeight = "700";
        chosenDiff = e.currentTarget.getAttribute("data-diff");
      });
    });

    document.querySelectorAll(".setup-count-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        document.querySelectorAll(".setup-count-btn").forEach(b => {
          b.style.background = "var(--card-bg)";
          b.style.color = "var(--text-main)";
          b.style.borderColor = "var(--card-border)";
          b.style.fontWeight = "500";
        });
        e.currentTarget.style.background = "var(--brand-lime)";
        e.currentTarget.style.color = "#0E0F0C";
        e.currentTarget.style.borderColor = "var(--brand-lime)";
        e.currentTarget.style.fontWeight = "700";
        chosenCount = parseInt(e.currentTarget.getAttribute("data-count"), 10) || 5;
      });
    });

    if (startBtn) {
      startBtn.addEventListener("click", () => {
        loadQuiz(chosenDiff, chosenCount, true);
      });
    }
  }

  async function loadQuiz(difficulty = "medium", numQuestions = 5, forceRefresh = false) {
    if (!currentResult) return;
    selectedQuizDifficulty = difficulty;
    selectedQuizCount = numQuestions;

    quizContainer.innerHTML = `
      <div style="text-align: center; padding: 48px 20px;">
        <div style="width: 36px; height: 36px; border: 3px solid var(--card-border); border-top-color: var(--brand-lime); border-radius: 50%; margin: 0 auto 14px auto; animation: spin 0.8s linear infinite;"></div>
        <div style="font-size: 15px; font-weight: 700;">Generating ${difficulty.toUpperCase()} Quiz (${numQuestions} Questions)...</div>
        <div style="font-size: 13px; color: var(--text-muted);">Synthesizing conceptual questions with instant feedback</div>
      </div>
    `;

    try {
      const res = await fetch("/api/generate/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: currentResult.title,
          summary: currentResult.summary,
          transcript: currentResult.transcript,
          difficulty: difficulty,
          num_questions: numQuestions,
          force_refresh: forceRefresh
        })
      });
      const data = await res.json();
      cachedQuiz = data.quiz || [];
      renderQuiz(cachedQuiz, data.provider, difficulty);
      showToast(`Quiz ready! (${numQuestions} Qs • ${difficulty.toUpperCase()})`, "success");
    } catch (err) {
      quizContainer.innerHTML = `<div style="color: var(--color-danger); text-align: center; padding: 20px;">Failed to generate quiz: ${err.message}</div>`;
    }
  }

  function renderQuiz(questions, provider, difficulty = "medium") {
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
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-weight: 700;">Question ${qIdx + 1} of ${questions.length}</span>
              <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: var(--btn-secondary-bg); border: 1px solid var(--card-border); text-transform: capitalize;">${difficulty}</span>
            </div>
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
                <strong style="color: ${userChoice === q.answerIndex ? 'var(--color-success)' : 'var(--color-danger)'}; display: inline-flex; align-items: center; gap: 4px;">
                  ${userChoice === q.answerIndex ? `
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>Correct!</span>
                  ` : `
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    <span>Incorrect</span>
                  `}
                </strong> ${q.explanation}
              </div>
            ` : ""}
          </div>

          ${hasAnswered ? `
            <div style="display: flex; justify-content: flex-end;">
              <button id="quiz-next-btn" class="btn-primary" style="padding: 9px 20px;">
                ${qIdx < questions.length - 1 ? "Next Question →" : "View Results"}
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
                <div style="width: 64px; height: 64px; border-radius: 50%; background: var(--brand-lime); color: #0E0F0C; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto;">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                </div>
                <h3 style="font-size: 22px; font-weight: 800; margin-bottom: 6px;">Quiz Completed!</h3>
                <div style="font-size: 36px; font-weight: 900; color: var(--brand-lime); margin: 16px 0;">${pct}%</div>
                <p style="font-size: 14px; color: var(--text-muted); margin-bottom: 24px;">You answered ${correctCount} of ${questions.length} questions correctly (${difficulty}).</p>
                
                <div style="display: flex; justify-content: center; gap: 10px;">
                  <button id="quiz-retake-btn" class="btn-secondary" style="padding: 10px 20px;">Retake Quiz</button>
                  <button id="quiz-more-btn" class="btn-primary" style="padding: 10px 20px;">Generate More Questions</button>
                </div>
              </div>
            `;

            document.getElementById("quiz-retake-btn").addEventListener("click", () => {
              for (const k in answers) delete answers[k];
              qIdx = 0;
              renderCurrentQuestion();
            });

            document.getElementById("quiz-more-btn").addEventListener("click", () => {
              renderQuizSetup();
            });
          }
        });
      }
    }

    renderCurrentQuestion();
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

  function renderTranscript(text) {
    transcriptContentEl.innerHTML = "";
    if (!text) {
      transcriptContentEl.textContent = "No transcript available.";
      return;
    }

    const lines = text.split("\n").filter(l => l.trim().length > 0);
    lines.forEach((line) => {
      const p = document.createElement("p");
      p.style.marginBottom = "10px";
      p.style.lineHeight = "1.7";
      p.style.fontSize = "14px";
      p.textContent = line;
      transcriptContentEl.appendChild(p);
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

  // --- Keyboard Shortcuts ---
  window.addEventListener("keydown", (e) => {
    // Skip if user is typing in an input or textarea
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      if (e.key === "Escape") {
        e.target.blur();
      }
      return;
    }

    // 1. Flashcards Navigation
    if (tabFlashcardsView && tabFlashcardsView.classList.contains("active")) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        const prev = document.getElementById("fc-prev-btn");
        if (prev && !prev.disabled) prev.click();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        const next = document.getElementById("fc-next-btn");
        if (next && !next.disabled) next.click();
      } else if (e.key === " " || e.key === "Enter" || e.key.toLowerCase() === "f") {
        e.preventDefault();
        const box = document.getElementById("flashcard-box");
        if (box) box.click();
      }
      return;
    }

    // 2. Presentation (PPT) Navigation
    if (tabPresentationView && tabPresentationView.classList.contains("active")) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        const prev = document.getElementById("ppt-prev-btn");
        if (prev && !prev.disabled) prev.click();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        const next = document.getElementById("ppt-next-btn");
        if (next && !next.disabled) next.click();
      }
      return;
    }

    // 3. Quiz Navigation
    if (tabQuizView && tabQuizView.classList.contains("active")) {
      // Setup screen
      const startSetupBtn = document.getElementById("start-setup-quiz-btn");
      if (startSetupBtn && document.body.contains(startSetupBtn)) {
        if (e.key === "Enter") {
          e.preventDefault();
          startSetupBtn.click();
        }
        return;
      }

      // Result screen
      const retakeBtn = document.getElementById("quiz-retake-btn");
      const moreBtn = document.getElementById("quiz-more-btn");
      if (retakeBtn && document.body.contains(retakeBtn)) {
        if (e.key.toLowerCase() === "r") {
          e.preventDefault();
          retakeBtn.click();
        } else if (e.key.toLowerCase() === "m" || e.key === "Enter") {
          e.preventDefault();
          if (moreBtn) moreBtn.click();
        }
        return;
      }

      // Quiz in progress: Options 1..4 or A..D
      const opts = document.querySelectorAll(".quiz-opt-btn");
      const key = e.key.toLowerCase();
      if (["1", "a"].includes(key) && opts[0] && !opts[0].disabled) {
        e.preventDefault();
        opts[0].click();
      } else if (["2", "b"].includes(key) && opts[1] && !opts[1].disabled) {
        e.preventDefault();
        opts[1].click();
      } else if (["3", "c"].includes(key) && opts[2] && !opts[2].disabled) {
        e.preventDefault();
        opts[2].click();
      } else if (["4", "d"].includes(key) && opts[3] && !opts[3].disabled) {
        e.preventDefault();
        opts[3].click();
      } else if (e.key === "Enter" || e.key === " ") {
        const nextBtn = document.getElementById("quiz-next-btn");
        if (nextBtn) {
          e.preventDefault();
          nextBtn.click();
        }
      }
    }
  });
});
