/**
 * Multimodal Video Summarizer — Client Application
 * Tool-first UX with Modern Design Tokens & Live Pipeline Stepper
 */

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

document.addEventListener("DOMContentLoaded", () => {
  // --- Theme Management ---
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const htmlEl = document.documentElement;
  
  const savedTheme = localStorage.getItem("theme") || "light";
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
    const setTabState = (mode) => {
      activeInputMode = mode;
      if (mode === "url") {
        tabUrlBtn.classList.add("active");
        tabUploadBtn.classList.remove("active");
        tabUrlBtn.style.background = "";
        tabUrlBtn.style.color = "";
        tabUploadBtn.style.background = "";
        tabUploadBtn.style.color = "";
        if (sectionUrlInput) sectionUrlInput.style.display = "flex";
        if (sectionUploadInput) sectionUploadInput.style.display = "none";
      } else {
        tabUploadBtn.classList.add("active");
        tabUrlBtn.classList.remove("active");
        tabUrlBtn.style.background = "";
        tabUrlBtn.style.color = "";
        tabUploadBtn.style.background = "";
        tabUploadBtn.style.color = "";
        if (sectionUploadInput) sectionUploadInput.style.display = "flex";
        if (sectionUrlInput) sectionUrlInput.style.display = "none";
      }
    };

    tabUrlBtn.addEventListener("click", () => setTabState("url"));
    tabUploadBtn.addEventListener("click", () => setTabState("upload"));
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
  const fileInput = document.getElementById("file-input");
  const fileDropzoneText = document.getElementById("file-dropzone-text");
  const browseFileBtn = document.getElementById("browse-file-btn");
  const fileRemoveBtn = document.getElementById("file-remove-btn");
  const browseSparks = document.getElementById("browse-sparks");

  let currentUploadedFile = null;

  if (sectionUploadInput && fileInput) {
    sectionUploadInput.addEventListener("click", (e) => {
      if (e.target !== fileRemoveBtn && !fileRemoveBtn.contains(e.target)) {
        if (!currentUploadedFile) fileInput.click();
      }
    });

    if (browseFileBtn) {
      browseFileBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        fileInput.click();
      });
    }

    ["dragenter", "dragover"].forEach(name => {
      sectionUploadInput.addEventListener(name, (e) => {
        e.preventDefault();
        sectionUploadInput.style.borderColor = "var(--brand-lime)";
        sectionUploadInput.style.backgroundColor = "rgba(217, 236, 149, 0.08)";
        if (!currentUploadedFile && fileDropzoneText) {
          fileDropzoneText.textContent = "Drop video or audio right here...";
        }
      });
    });

    ["dragleave", "drop"].forEach(name => {
      sectionUploadInput.addEventListener(name, (e) => {
        e.preventDefault();
        sectionUploadInput.style.borderColor = "var(--card-border)";
        sectionUploadInput.style.backgroundColor = "var(--card-bg)";
        if (!currentUploadedFile && fileDropzoneText) {
          fileDropzoneText.textContent = "Click to upload or drag & drop video/audio";
        }
      });
    });

    sectionUploadInput.addEventListener("drop", (e) => {
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
    if (fileDropzoneText) {
      fileDropzoneText.textContent = `${file.name} (${sizeMb} MB)`;
      fileDropzoneText.style.color = "var(--text-main)";
      fileDropzoneText.style.fontWeight = "700";
    }
    if (browseFileBtn) browseFileBtn.style.display = "none";
    if (browseSparks) browseSparks.style.display = "none";
    if (fileRemoveBtn) fileRemoveBtn.style.display = "inline-flex";
  }

  if (fileRemoveBtn) {
    fileRemoveBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      currentUploadedFile = null;
      fileInput.value = "";
      if (fileDropzoneText) {
        fileDropzoneText.textContent = "Click to upload or drag & drop video/audio";
        fileDropzoneText.style.color = "var(--text-muted)";
        fileDropzoneText.style.fontWeight = "normal";
      }
      if (browseFileBtn) browseFileBtn.style.display = "inline-flex";
      if (browseSparks) browseSparks.style.display = "block";
      fileRemoveBtn.style.display = "none";
    });
  }

  // --- Processing & Loading State ---
  const startSummarizeBtn = document.getElementById("start-summarize-btn");
  const loadingContainer = document.getElementById("loading-container");
  const errorContainer = document.getElementById("error-container");

  let activePollingTimer = null;
  let activeJobId = null;
  let lastSubmittedInput = null;
  let jobElapsedSeconds = 0;
  let jobElapsedTimer = null;

  function resetLoadingUI() {
    jobElapsedSeconds = 0;
    if (jobElapsedTimer) clearInterval(jobElapsedTimer);
    jobElapsedTimer = setInterval(() => {
      jobElapsedSeconds += 1;
      updateLoadingUI(null, jobElapsedSeconds);
    }, 1000);
    updateLoadingUI(null, 0);
  }

  function stopLoadingUI() {
    if (jobElapsedTimer) clearInterval(jobElapsedTimer);
  }

  function updateLoadingUI(job, elapsed) {
    const stageSubtitle = document.getElementById("loading-stage-subtitle");
    const progressPct = document.getElementById("static-progress-pct");
    const progressBarFill = document.getElementById("static-progress-bar-fill");
    const dot1 = document.getElementById("static-stage-dot-1");
    const dot2 = document.getElementById("static-stage-dot-2");
    const dot3 = document.getElementById("static-stage-dot-3");
    const label1 = document.getElementById("static-stage-label-1");
    const label2 = document.getElementById("static-stage-label-2");
    const label3 = document.getElementById("static-stage-label-3");
    const line1 = document.getElementById("static-step-line-1");
    const line2 = document.getElementById("static-step-line-2");

    let activeStage = 1;
    let baseTarget = 5;
    if (job && job.progress) baseTarget = Math.max(job.progress, baseTarget);
    let slowCreep = Math.min((elapsed || 0) * 0.25, 12);
    let progressVal = Math.min(baseTarget + slowCreep, 93);

    if (job) {
      if (job.progress >= 80 || (job.step_name && job.step_name.toLowerCase().includes("synthesiz")) || (job.message && job.message.toLowerCase().includes("synthesiz"))) {
        activeStage = 3;
      } else if (job.progress >= 45 || job.step === 3 || (job.step_name && job.step_name.toLowerCase().includes("summariz")) || (job.message && job.message.toLowerCase().includes("summariz"))) {
        activeStage = 2;
      }
    }

    if (elapsed >= 16) {
      activeStage = Math.max(activeStage, 3);
    } else if (elapsed >= 7) {
      activeStage = Math.max(activeStage, 2);
    }

    if (stageSubtitle) {
      if (job && job.message && !job.message.toLowerCase().includes("processing")) {
        stageSubtitle.textContent = job.message;
      } else if (activeStage === 1) {
        stageSubtitle.textContent = "Transcribing audio speech with local AI model...";
      } else if (activeStage === 2) {
        stageSubtitle.textContent = "Extracting core concepts, principles, and structured highlights...";
      } else {
        stageSubtitle.textContent = "Synthesizing final structured summary...";
      }
    }

    if (progressPct) progressPct.textContent = `${Math.round(progressVal)}%`;
    if (progressBarFill) progressBarFill.style.width = `${Math.max(6, Math.round(progressVal))}%`;

    // Render Stage 1
    if (dot1 && label1) {
      if (activeStage > 1) {
        dot1.style.background = "var(--brand-lime)";
        dot1.style.color = "#0E0F0C";
        dot1.innerHTML = `<svg style="width:16px;height:16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
        label1.style.fontWeight = "600";
        label1.style.color = "var(--text-main)";
        label1.style.opacity = "1";
      } else {
        dot1.style.background = "var(--brand-lime)";
        dot1.style.color = "#0E0F0C";
        dot1.innerHTML = `<span style="width:8px;height:8px;border-radius:50%;background:#0E0F0C;animation:pulse-dot 1.2s infinite ease-in-out;"></span>`;
        label1.style.fontWeight = "700";
        label1.style.color = "var(--text-main)";
        label1.style.opacity = "1";
      }
    }

    // Render Stage 2
    if (dot2 && label2) {
      if (activeStage > 2) {
        dot2.style.background = "var(--brand-lime)";
        dot2.style.border = "none";
        dot2.style.color = "#0E0F0C";
        dot2.innerHTML = `<svg style="width:16px;height:16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
        label2.style.fontWeight = "600";
        label2.style.color = "var(--text-main)";
        label2.style.opacity = "1";
      } else if (activeStage === 2) {
        dot2.style.background = "var(--brand-lime)";
        dot2.style.border = "none";
        dot2.style.color = "#0E0F0C";
        dot2.style.boxShadow = "0 0 10px rgba(217, 236, 149, 0.4)";
        dot2.innerHTML = `<span style="width:8px;height:8px;border-radius:50%;background:#0E0F0C;animation:pulse-dot 1.2s infinite ease-in-out;"></span>`;
        label2.style.fontWeight = "700";
        label2.style.color = "var(--text-main)";
        label2.style.opacity = "1";
      } else {
        dot2.style.background = "var(--card-elevated)";
        dot2.style.border = "1px solid var(--card-border)";
        dot2.style.color = "var(--text-muted)";
        dot2.style.boxShadow = "none";
        dot2.innerHTML = "2";
        label2.style.fontWeight = "500";
        label2.style.color = "var(--text-muted)";
        label2.style.opacity = "0.65";
      }
    }

    // Render Stage 3
    if (dot3 && label3) {
      if (activeStage === 3) {
        dot3.style.background = "var(--brand-lime)";
        dot3.style.border = "none";
        dot3.style.color = "#0E0F0C";
        dot3.style.boxShadow = "0 0 10px rgba(217, 236, 149, 0.4)";
        dot3.innerHTML = `<span style="width:8px;height:8px;border-radius:50%;background:#0E0F0C;animation:pulse-dot 1.2s infinite ease-in-out;"></span>`;
        label3.style.fontWeight = "700";
        label3.style.color = "var(--text-main)";
        label3.style.opacity = "1";
      } else {
        dot3.style.background = "var(--card-elevated)";
        dot3.style.border = "1px solid var(--card-border)";
        dot3.style.color = "var(--text-muted)";
        dot3.style.boxShadow = "none";
        dot3.innerHTML = "3";
        label3.style.fontWeight = "500";
        label3.style.color = "var(--text-muted)";
        label3.style.opacity = "0.65";
      }
    }

    // Render Connecting Lines
    if (line1) {
      line1.style.background = activeStage > 1 ? "var(--brand-lime)" : "var(--brand-lime)";
    }
    if (line2) {
      line2.style.background = activeStage > 2 ? "var(--brand-lime)" : activeStage === 2 ? "linear-gradient(to right, var(--brand-lime), var(--card-border))" : "var(--card-border)";
    }
  }

  if (startSummarizeBtn) {
    startSummarizeBtn.addEventListener("click", async () => {
      if (activeInputMode === "url") {
        const url = (youtubeUrlInput.value || "").trim();
        if (!url) {
          showToast("Please enter a YouTube URL.", "error");
          youtubeUrlInput.focus();
          return;
        }
        if (currentResult && lastSubmittedInput && lastSubmittedInput.type === "url" && lastSubmittedInput.value === url) {
          showToast("Summary already generated! Use 'Regenerate' in the toolbar to create a new one.", "info");
          if (workspaceContainer) workspaceContainer.scrollIntoView({ behavior: "smooth" });
          return;
        }
        lastSubmittedInput = { type: "url", value: url };
        await initiateJob("/api/summarize/url", { url }, false);
      } else {
        if (!currentUploadedFile) {
          showToast("Please select a video or audio file to upload.", "error");
          return;
        }
        const fileId = `${currentUploadedFile.name}_${currentUploadedFile.size}_${currentUploadedFile.lastModified}`;
        if (currentResult && lastSubmittedInput && lastSubmittedInput.type === "upload" && lastSubmittedInput.value === fileId) {
          showToast("Summary already generated! Use 'Regenerate' in the toolbar to create a new one.", "info");
          if (workspaceContainer) workspaceContainer.scrollIntoView({ behavior: "smooth" });
          return;
        }
        lastSubmittedInput = { type: "upload", value: fileId };
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
    resetLoadingUI();

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
      stopLoadingUI();
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
        updateLoadingUI(job, jobElapsedSeconds);

        if (job.status === "completed") {
          clearInterval(activePollingTimer);
          stopLoadingUI();
          if (loadingContainer) loadingContainer.style.display = "none";
          startSummarizeBtn.disabled = false;
          startSummarizeBtn.textContent = "Summarize Video →";
          showToast("Summarization complete!", "success");
          renderOutputWorkspace(job.result);
        } else if (job.status === "failed") {
          clearInterval(activePollingTimer);
          stopLoadingUI();
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
  async function loadFlashcards(forceRefresh = false) {
    if (!currentResult) return;
    flashcardsContainer.innerHTML = `
      <div style="text-align: center; padding: 48px 20px;">
        <div style="width: 36px; height: 36px; border: 3px solid var(--card-border); border-top-color: var(--brand-lime); border-radius: 50%; margin: 0 auto 14px auto; animation: spin 0.8s linear infinite;"></div>
        <div style="font-size: 15px; font-weight: 700;">Generating Study Flashcards...</div>
        <div style="font-size: 13px; color: var(--text-muted);">Synthesizing key formulas, concepts, and definitions</div>
      </div>
    `;

    try {
      const res = await fetch("/api/generate/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: currentResult.title,
          summary: currentResult.summary,
          transcript: currentResult.transcript,
          force_refresh: forceRefresh,
          forceRefresh: forceRefresh
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

  const DESK_NOTE_THEMES = [
    {
      id: "yellow",
      name: "Yellow",
      bg: "#FFF8B8",
      pinBg: "#E59819",
      accentBtn: "#E5A024",
      textColor: "#1F1E1B",
      subtextColor: "#3F3C36",
    },
    {
      id: "pink",
      name: "Pink",
      bg: "#FFE4EC",
      pinBg: "#E15A78",
      accentBtn: "#DE5473",
      textColor: "#1F1E1B",
      subtextColor: "#3F3C36",
    },
    {
      id: "tan",
      name: "Tan",
      bg: "#F0E9DA",
      pinBg: "#8B5E3C",
      accentBtn: "#845634",
      textColor: "#1F1E1B",
      subtextColor: "#3F3C36",
    },
    {
      id: "mint",
      name: "Mint",
      bg: "#E1EEE8",
      pinBg: "#2F7E6B",
      accentBtn: "#3D8280",
      textColor: "#1F1E1B",
      subtextColor: "#3F3C36",
    },
    {
      id: "blue",
      name: "Blue",
      bg: "#E0F0F8",
      pinBg: "#2B78A8",
      accentBtn: "#2373A4",
      textColor: "#1F1E1B",
      subtextColor: "#3F3C36",
    },
  ];

  function renderFlashcards(cards, provider) {
    if (!cards || cards.length === 0) {
      flashcardsContainer.innerHTML = `<div style="text-align: center; padding: 24px; color: var(--text-muted);">No flashcards generated.</div>`;
      return;
    }

    let deck = cards.map((c, i) => ({
      ...c,
      colorIndex: c.colorIndex !== undefined ? c.colorIndex : (i % DESK_NOTE_THEMES.length)
    }));

    let activeModalIndex = null;

    function renderDesk() {
      flashcardsContainer.innerHTML = `
        <div style="width: 100%; padding: 4px 0;">
          <!-- Desk Header Controls -->
          <div style="display: flex; justify-content: flex-end; align-items: center; margin-bottom: 12px; gap: 8px;">
            <button id="desk-regen-btn" class="btn-secondary" style="height: 32px; padding: 0 12px; border-radius: 10px; display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; cursor: pointer;" title="Regenerate Flashcards">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
              <span>Regenerate</span>
            </button>
            <div style="width: 1px; height: 16px; background: var(--card-border); margin: 0 4px;"></div>
            <button id="desk-scroll-prev" class="btn-secondary" style="width: 32px; height: 32px; padding: 0; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer;" title="Scroll Left">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <button id="desk-scroll-next" class="btn-secondary" style="width: 32px; height: 32px; padding: 0; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer;" title="Scroll Right">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>

          <!-- Horizontal Carousel Track -->
          <div id="desk-track" class="desk-notes-track" style="display: flex; gap: 20px; overflow-x: auto; padding: 8px 4px 16px 4px; scroll-behavior: smooth;">
            ${deck.map((card, i) => {
              const th = DESK_NOTE_THEMES[card.colorIndex ?? (i % DESK_NOTE_THEMES.length)] || DESK_NOTE_THEMES[0];
              const lines = card.back ? card.back.split(/\n+/).map(l => l.trim()).filter(Boolean) : [];
              return `
                <div class="tilted-card-wrapper" data-idx="${i}" style="perspective: 1000px; width: 320px; height: 340px; flex-shrink: 0; cursor: pointer; user-select: none;">
                  <div class="tilted-card-inner" style="width: 100%; height: 100%; position: relative; transform-style: preserve-3d; transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1); border-radius: 22px;">
                    <!-- Front Face -->
                    <div class="tilted-card-front" style="position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; border-radius: 22px; background-color: ${th.bg}; color: ${th.textColor}; padding: 22px; box-shadow: 0 10px 24px -6px rgba(0,0,0,0.12); display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; transform-style: preserve-3d; border: 1px solid rgba(0,0,0,0.08);">
                      <!-- 3D Pushpin (Depth 35px) -->
                      <div style="transform: translateZ(35px); display: flex; justify-content: space-between; align-items: center; width: 100%;">
                        <div style="display: flex; flex-direction: column; items-center;">
                          <div class="desk-note-pin-head" style="width: 16px; height: 16px; border-radius: 50%; background-color: ${th.pinBg}; background-image: radial-gradient(circle at 35% 30%, #FFFFFF 0%, ${th.pinBg} 60%, rgba(0,0,0,0.4) 100%); box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>
                          <div style="width: 12px; height: 4px; border-radius: 50%; background: rgba(0,0,0,0.25); filter: blur(1px); margin-top: -2px;"></div>
                        </div>
                        ${card.tag ? `<span style="font-size: 10px; font-weight: 800; text-transform: uppercase; background: rgba(0,0,0,0.06); padding: 2px 8px; border-radius: 9999px;">${escapeHtml(card.tag)}</span>` : ''}
                      </div>

                      <!-- Question Title (Depth 25px) -->
                      <div style="transform: translateZ(25px); margin-top: 14px;">
                        <h4 style="font-size: 15px; font-weight: 600; line-height: 1.4; color: #1F1E1B; margin: 0;">
                          ${escapeHtml(card.front)}
                        </h4>
                      </div>

                      <!-- Footer Cue (Depth 15px) -->
                      <div style="transform: translateZ(15px); display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-weight: 800; color: rgba(0,0,0,0.55); margin-top: auto; padding-top: 12px;">
                        <span>${i + 1}</span>
                        <span style="width: 28px; height: 28px; border-radius: 50%; background: rgba(0,0,0,0.06); display: flex; align-items: center; justify-content: center; color: rgba(0,0,0,0.7); font-size: 13px;" title="Flip card">↻</span>
                      </div>

                      <!-- Glare Overlay -->
                      <div class="tilted-card-glare" style="position: absolute; inset: 0; pointer-events: none; border-radius: 22px; opacity: 0; transition: opacity 0.2s ease; mix-blend-mode: overlay; z-index: 20;"></div>
                    </div>

                    <!-- Back Face (Flip) -->
                    <div class="tilted-card-back" style="position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; transform: rotateY(180deg); border-radius: 22px; background-color: ${th.bg}; color: ${th.textColor}; padding: 22px; box-shadow: 0 10px 24px -6px rgba(0,0,0,0.12); display: flex; flex-direction: column; justify-content: space-between; overflow-y: auto; border: 1px solid rgba(0,0,0,0.08);">
                      <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(0,0,0,0.1); padding-bottom: 8px; margin-bottom: 12px;">
                          <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: rgba(0,0,0,0.6);">${escapeHtml(card.tag || "Explanation")}</span>
                          <span style="width: 28px; height: 28px; border-radius: 50%; background: rgba(0,0,0,0.06); display: flex; align-items: center; justify-content: center; color: rgba(0,0,0,0.7); font-size: 13px;" title="Flip back">↺</span>
                        </div>
                        <div style="font-size: 13.5px; line-height: 1.6; color: #2E2C28;">
                          ${lines.length > 1
                            ? `<ul style="padding-left: 16px; margin: 0;">${lines.map(l => `<li style="margin-bottom: 4px;">${escapeHtml(l.replace(/^[-•*]\s*/, ''))}</li>`).join('')}</ul>`
                            : escapeHtml(card.back)
                          }
                        </div>
                      </div>
                      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-weight: 800; color: rgba(0,0,0,0.55); margin-top: auto; padding-top: 12px; border-top: 1px solid rgba(0,0,0,0.06);">
                        <span>${i + 1}</span>
                        <span style="width: 28px; height: 28px; border-radius: 50%; background: rgba(0,0,0,0.06); display: flex; align-items: center; justify-content: center; color: rgba(0,0,0,0.7); font-size: 13px;" title="Flip back">↺</span>
                      </div>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;

      // Event Listeners for Track
      const track = document.getElementById("desk-track");
      const prevBtn = document.getElementById("desk-scroll-prev");
      const nextBtn = document.getElementById("desk-scroll-next");

      if (prevBtn && track) {
        prevBtn.addEventListener("click", () => track.scrollBy({ left: -340, behavior: "smooth" }));
      }
      if (nextBtn && track) {
        nextBtn.addEventListener("click", () => track.scrollBy({ left: 340, behavior: "smooth" }));
      }

      const regenBtn = document.getElementById("desk-regen-btn");
      if (regenBtn) {
        regenBtn.addEventListener("click", () => loadFlashcards(true));
      }

      // 3D Tilt and Flip Listeners on each card
      document.querySelectorAll(".tilted-card-wrapper").forEach(wrapper => {
        const inner = wrapper.querySelector(".tilted-card-inner");
        const glare = wrapper.querySelector(".tilted-card-glare");
        let isFlipped = false;

        wrapper.addEventListener("mousemove", (e) => {
          const rect = wrapper.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;

          const rotX = -((y - centerY) / centerY) * 12;
          const rotY = ((x - centerX) / centerX) * 12;

          const baseRotY = isFlipped ? 180 - rotY : rotY;
          const currentRotX = isFlipped ? -rotX : rotX;

          inner.style.transform = `scale(1.05) rotateX(${currentRotX}deg) rotateY(${baseRotY}deg)`;

          if (glare) {
            glare.style.opacity = "0.5";
            glare.style.background = `radial-gradient(circle at ${(x / rect.width) * 100}% ${(y / rect.height) * 100}%, rgba(255,255,255,0.5), transparent 70%)`;
          }
        });

        wrapper.addEventListener("mouseleave", () => {
          inner.style.transform = isFlipped ? "rotateY(180deg) scale(1)" : "rotateY(0deg) scale(1)";
          if (glare) glare.style.opacity = "0";
        });

        wrapper.addEventListener("click", () => {
          isFlipped = !isFlipped;
          inner.style.transform = isFlipped ? "rotateY(180deg) scale(1.03)" : "rotateY(0deg) scale(1.03)";
        });
      });
    }

    renderDesk();
  }

  // --- Presentation Logic ---
  let selectedPptTemplate = "modern_editorial";

  async function loadPresentation() {
    if (!currentResult) return;
    presentationContainer.innerHTML = `
      <div style="text-align: center; padding: 48px 20px;">
        <div style="width: 36px; height: 36px; border: 3px solid var(--card-border); border-top-color: var(--brand-lime); border-radius: 50%; margin: 0 auto 14px auto; animation: spin 0.8s linear infinite;"></div>
        <div style="font-size: 15px; font-weight: 700;">Generating Keynote Presentation...</div>
        <div style="font-size: 13px; color: var(--text-muted);">Planning structured layout archetypes & photo pairings</div>
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
      presentationContainer.innerHTML = `
        <div style="max-width: 600px; margin: 0 auto; text-align: center; padding: 32px 16px;">
          <h4 style="font-size: 17px; font-weight: 800; margin-bottom: 6px;">Choose Presentation Template</h4>
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 20px;">Select your preferred keynote design style before generating slides.</p>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 24px;">
            <div class="template-choice-card ${selectedPptTemplate === 'modern_editorial' ? 'selected' : ''}" data-tmpl="modern_editorial" style="border: 2px solid ${selectedPptTemplate === 'modern_editorial' ? 'var(--brand-lime)' : 'var(--card-border)'}; border-radius: 14px; padding: 14px; cursor: pointer; text-align: left; background: var(--card-bg);">
              <span style="font-size: 10px; font-weight: 800; background: var(--btn-secondary-bg); padding: 2px 6px; border-radius: 6px; text-transform: uppercase;">Featured</span>
              <div style="font-size: 14px; font-weight: 800; margin: 6px 0 2px 0;">Modern Editorial</div>
              <div style="font-size: 12px; color: var(--text-muted);">Blueprint navy & light grey photo splits</div>
            </div>
            <div class="template-choice-card ${selectedPptTemplate === 'warm_hexagons' ? 'selected' : ''}" data-tmpl="warm_hexagons" style="border: 2px solid ${selectedPptTemplate === 'warm_hexagons' ? 'var(--brand-lime)' : 'var(--card-border)'}; border-radius: 14px; padding: 14px; cursor: pointer; text-align: left; background: var(--card-bg);">
              <span style="font-size: 10px; font-weight: 800; background: var(--btn-secondary-bg); padding: 2px 6px; border-radius: 6px; text-transform: uppercase;">Warm</span>
              <div style="font-size: 14px; font-weight: 800; margin: 6px 0 2px 0;">Earthy Hexagons</div>
              <div style="font-size: 12px; color: var(--text-muted);">Warm cream & terracotta honeycomb</div>
            </div>
            <div class="template-choice-card ${selectedPptTemplate === 'modern_dark' ? 'selected' : ''}" data-tmpl="modern_dark" style="border: 2px solid ${selectedPptTemplate === 'modern_dark' ? 'var(--brand-lime)' : 'var(--card-border)'}; border-radius: 14px; padding: 14px; cursor: pointer; text-align: left; background: var(--card-bg);">
              <span style="font-size: 10px; font-weight: 800; background: var(--btn-secondary-bg); padding: 2px 6px; border-radius: 6px; text-transform: uppercase;">Classic</span>
              <div style="font-size: 14px; font-weight: 800; margin: 6px 0 2px 0;">Midnight Lime</div>
              <div style="font-size: 12px; color: var(--text-muted);">High-contrast dark obsidian</div>
            </div>
          </div>
          <button id="generate-pptx-trigger-btn" class="btn-primary" style="padding: 10px 24px; font-size: 13px; font-weight: 800; border-radius: 12px; cursor: pointer;">
            Generate Slides
          </button>
        </div>
      `;

      presentationContainer.querySelectorAll(".template-choice-card").forEach(c => {
        c.addEventListener("click", () => {
          selectedPptTemplate = c.dataset.tmpl;
          renderPresentation(data);
        });
      });

      const genBtn = document.getElementById("generate-pptx-trigger-btn");
      if (genBtn) genBtn.addEventListener("click", loadPresentation);
      return;
    }

    const rawSlides = data.slides;
    const layouts = ["split_left_image", "split_right_image", "cards_right"];
    const images = ["photo_classroom_raising_hands.png", "photo_classroom_desks.png", "photo_school_building.png"];

    const deckSlides = [
      {
        type: "title",
        title: data.title || "Presentation",
        kicker: rawSlides[0]?.kicker || "Presentation Overview",
        summary: rawSlides[0]?.summary || "A structured keynote presentation exploring core principles, systematic frameworks, and key strategic takeaways.",
        subtitle: "KEY TAKEAWAYS & EXECUTIVE SUMMARY",
        notes: "Opening introduction and presentation overview."
      },
      ...rawSlides.map((s, idx) => ({
        type: "body",
        title: s.title || `Slide ${idx + 1}`,
        kicker: s.kicker || `Section ${String(idx + 1).padStart(2, "0")} • Core Focus`,
        summary: s.summary || (s.bullets && s.bullets[0] ? `${s.title} establishes a critical mechanism in this domain.` : "Overview of key insights."),
        bullets: s.bullets || [],
        layout: s.layout || layouts[idx % layouts.length],
        image_asset: s.image_asset || images[idx % images.length],
        notes: s.notes || ""
      })),
      {
        type: "last",
        title: "Thank you",
        kicker: "Summary & Key Takeaways",
        summary: data.title ? `Key takeaways and strategic conclusions for "${data.title}".` : "Keynote Presentation",
        subtitle: data.title ? `Key insights & overview for "${data.title}"` : "Keynote Presentation",
        notes: "Closing Slide: Summary and final remarks."
      }
    ];

    let slideIdx = 0;
    const totalCount = deckSlides.length;

    function renderCurrentSlide() {
      const slide = deckSlides[slideIdx];
      const pageStr = `Page ${String(slideIdx + 1).padStart(2, "0")}`;

      let canvasHtml = "";

      if (selectedPptTemplate === "modern_editorial") {
        if (slide.type === "title") {
          canvasHtml = `
            <div style="width: 100%; height: 100%; padding: 5%; display: flex; flex-direction: column; justify-content: space-between; position: relative; background-image: url('/static/templates/modern_editorial/bg_cover.png'); background-size: cover; background-position: center; box-sizing: border-box;">
              <div style="max-width: 65%; text-align: left;">
                <div style="font-size: clamp(10px, 1.2vw, 13px); font-weight: 700; color: #4A5568; margin-bottom: 8px;">${escapeHtml(slide.kicker)}</div>
                <h2 style="font-family: Arial, sans-serif; font-size: clamp(20px, 3.2vw, 42px); font-weight: 900; line-height: 1.1; color: #000; text-transform: uppercase; margin: 0;">${escapeHtml(slide.title)}</h2>
              </div>
              <div style="align-self: flex-end; max-width: 44%; text-align: left; margin: auto 0 auto auto; padding-right: 2%;">
                <p style="font-size: clamp(11px, 1.3vw, 15px); color: #2D3748; line-height: 1.5; font-weight: 400; margin: 0;">${escapeHtml(slide.summary)}</p>
              </div>
              <div style="padding-bottom: 5%;"></div>
              <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 9%; background: #1B395D; display: flex; align-items: center; justify-content: space-between; padding: 0 4%; color: #fff; font-size: clamp(10px, 1.1vw, 12px); font-weight: 700;">
                <span>${escapeHtml(data.title || "Presentation")}</span>
                <span>${pageStr}</span>
              </div>
            </div>
          `;
        } else if (slide.type === "body") {
          if (slide.layout === "split_left_image") {
            canvasHtml = `
              <div style="width: 100%; height: 100%; display: flex; padding-bottom: 9%; box-sizing: border-box; position: relative;">
                <div style="width: 50%; padding: 4%; display: flex; flex-direction: column; justify-content: space-between; background: #EEF0F6; box-sizing: border-box;">
                  <div>
                    <div style="font-size: clamp(9px, 1vw, 12px); font-weight: 700; color: #1A1A1A; margin-bottom: 4px;">${escapeHtml(slide.kicker)}</div>
                    <h2 style="font-size: clamp(16px, 2.2vw, 28px); font-weight: 900; color: #000; text-transform: uppercase; line-height: 1.15; margin: 0;">${escapeHtml(slide.title)}</h2>
                  </div>
                  <div style="width: 100%; aspect-ratio: 4/3; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.15); margin-top: 8px;">
                    <img src="/static/templates/modern_editorial/${slide.image_asset || 'photo_classroom_raising_hands.png'}" style="width: 100%; height: 100%; object-fit: cover;" />
                  </div>
                </div>
                <div style="width: 50%; padding: 4%; background: #DEDEE0; display: flex; flex-direction: column; justify-content: center; box-sizing: border-box;">
                  <p style="font-size: clamp(11px, 1.25vw, 14px); color: #2D3748; line-height: 1.45; margin: 0 0 14px 0;">${escapeHtml(slide.summary)}</p>
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${slide.bullets.map(b => `
                      <div style="padding-bottom: 6px; border-bottom: 1px dotted rgba(0,0,0,0.35); display: flex; align-items: center; gap: 8px; font-size: clamp(10px, 1.2vw, 13px); color: #000; font-weight: 600;">
                        <span style="width: 6px; height: 6px; border-radius: 50%; background: #000; shrink-0;"></span>
                        <span>${escapeHtml(b)}</span>
                      </div>
                    `).join("")}
                  </div>
                </div>
                <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 9%; background: #1B395D; display: flex; align-items: center; justify-content: space-between; padding: 0 4%; color: #fff; font-size: clamp(10px, 1.1vw, 12px); font-weight: 700;">
                  <span>${escapeHtml(data.title || "School Presentation")}</span>
                  <span>${pageStr}</span>
                </div>
              </div>
            `;
          } else if (slide.layout === "split_right_image") {
            canvasHtml = `
              <div style="width: 100%; height: 100%; display: flex; padding-bottom: 9%; box-sizing: border-box; position: relative;">
                <div style="width: 52%; padding: 4%; display: flex; flex-direction: column; justify-content: center; background: #EEF0F6; box-sizing: border-box;">
                  <h2 style="font-size: clamp(16px, 2.2vw, 28px); font-weight: 900; color: #000; text-transform: uppercase; line-height: 1.15; margin: 0 0 4px 0;">${escapeHtml(slide.title)}</h2>
                  <div style="font-size: clamp(10px, 1.1vw, 13px); font-weight: 700; color: #000; margin-bottom: 8px;">${escapeHtml(slide.kicker)}</div>
                  <p style="font-size: clamp(10px, 1.15vw, 13px); color: #2D3748; line-height: 1.4; margin: 0 0 12px 0;">${escapeHtml(slide.summary)}</p>
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${slide.bullets.map((b, i) => `
                      <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 20px; height: 20px; background: #1B395D; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; border-radius: 3px; shrink-0;">${String(i+1).padStart(2, "0")}</div>
                        <span style="font-size: clamp(10px, 1.2vw, 13px); color: #000; font-weight: 600;">${escapeHtml(b)}</span>
                      </div>
                    `).join("")}
                  </div>
                </div>
                <div style="width: 48%; padding: 3%; background: #EEF0F6; display: flex; align-items: center; justify-content: center; box-sizing: border-box;">
                  <div style="width: 100%; height: 100%; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                    <img src="/static/templates/modern_editorial/${slide.image_asset || 'photo_classroom_desks.png'}" style="width: 100%; height: 100%; object-fit: cover;" />
                  </div>
                </div>
                <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 9%; background: #1B395D; display: flex; align-items: center; justify-content: space-between; padding: 0 4%; color: #fff; font-size: clamp(10px, 1.1vw, 12px); font-weight: 700;">
                  <span>${escapeHtml(data.title || "School Presentation")}</span>
                  <span>${pageStr}</span>
                </div>
              </div>
            `;
          } else {
            canvasHtml = `
              <div style="width: 100%; height: 100%; display: flex; padding-bottom: 9%; box-sizing: border-box; position: relative;">
                <div style="width: 45%; padding: 4%; background: #DEDEE0; display: flex; flex-direction: column; justify-content: center; box-sizing: border-box;">
                  <div style="width: 100%; aspect-ratio: 16/10; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.15); margin-bottom: 10px;">
                    <img src="/static/templates/modern_editorial/${slide.image_asset || 'photo_school_building.png'}" style="width: 100%; height: 100%; object-fit: cover;" />
                  </div>
                  <p style="font-size: clamp(10px, 1.1vw, 12px); color: #2D3748; line-height: 1.4; margin: 0;">${escapeHtml(slide.summary)}</p>
                </div>
                <div style="width: 55%; padding: 4%; background: #EEF0F6; display: flex; flex-direction: column; justify-content: center; box-sizing: border-box;">
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                    <div style="width: 12px; height: 12px; background: #1B395D;"></div>
                    <h2 style="font-size: clamp(15px, 2vw, 24px); font-weight: 900; color: #000; text-transform: uppercase; margin: 0;">${escapeHtml(slide.title)}</h2>
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${slide.bullets.map((b, i) => `
                      <div style="background: #1B395D; color: #fff; padding: 8px 12px; border-radius: 4px; display: flex; align-items: center; gap: 10px; font-size: clamp(10px, 1.15vw, 13px); font-weight: 700; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
                        <span style="opacity: 0.85; font-weight: 900;">${String(i+1).padStart(2, "0")}</span>
                        <span>${escapeHtml(b)}</span>
                      </div>
                    `).join("")}
                  </div>
                </div>
                <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 9%; background: #1B395D; display: flex; align-items: center; justify-content: space-between; padding: 0 4%; color: #fff; font-size: clamp(10px, 1.1vw, 12px); font-weight: 700;">
                  <span>${escapeHtml(data.title || "School Presentation")}</span>
                  <span>${pageStr}</span>
                </div>
              </div>
            `;
          }
        } else {
          canvasHtml = `
            <div style="width: 100%; height: 100%; padding: 5%; display: flex; flex-direction: column; justify-content: space-between; position: relative; background-image: url('/static/templates/modern_editorial/bg_cover.png'); background-size: cover; background-position: center; box-sizing: border-box;">
              <div style="max-width: 65%; text-align: left;">
                <div style="font-size: clamp(10px, 1.2vw, 13px); font-weight: 700; color: #4A5568; margin-bottom: 8px;">Summary & Key Takeaways</div>
                <h2 style="font-family: Arial, sans-serif; font-size: clamp(24px, 4vw, 54px); font-weight: 900; line-height: 1.1; color: #000; text-transform: uppercase; margin: 0;">THANK YOU</h2>
                <p style="font-size: clamp(11px, 1.3vw, 15px); color: #2D3748; line-height: 1.5; font-weight: 400; margin-top: 14px;">${escapeHtml(slide.summary)}</p>
              </div>
              <div style="padding-bottom: 5%;"></div>
              <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 9%; background: #1B395D; display: flex; align-items: center; justify-content: space-between; padding: 0 4%; color: #fff; font-size: clamp(10px, 1.1vw, 12px); font-weight: 700;">
                <span>${escapeHtml(data.title || "Presentation")}</span>
                <span>${pageStr}</span>
              </div>
            </div>
          `;
        }
      } else if (selectedPptTemplate === "warm_hexagons") {
        let bgHex = "/static/templates/warm_hexagons/slide_body.png";
        if (slide.type === "title") bgHex = "/static/templates/warm_hexagons/slide_first.png";
        else if (slide.type === "last") bgHex = "/static/templates/warm_hexagons/slide_last.png";

        canvasHtml = `
          <div style="width: 100%; height: 100%; background-color: #F0E7DD; background-image: url('${bgHex}'); background-size: cover; background-position: center; position: relative;">
            ${slide.type === "title" ? `
              <div style="position: absolute; left: 6.2%; top: 55%; transform: translateY(-50%); max-width: 55%; text-align: left;">
                <h2 style="font-family: Georgia, serif; font-size: clamp(20px, 3vw, 38px); font-weight: 900; line-height: 1.2; color: #3B2213; margin: 0;">${escapeHtml(slide.title)}</h2>
                <div style="font-size: clamp(10px, 1.1vw, 12px); font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: #5C4436; margin-top: 14px;">${escapeHtml(slide.subtitle)}</div>
              </div>
            ` : slide.type === "body" ? `
              <div style="position: absolute; left: 6.2%; top: 18%; max-width: 58%; text-align: left;">
                <h2 style="font-family: Georgia, serif; font-size: clamp(18px, 2.4vw, 30px); font-weight: 800; line-height: 1.25; color: #3B2213; margin: 0;">${escapeHtml(slide.title)}</h2>
              </div>
              <div style="position: absolute; left: 6.2%; top: 34%; max-width: 58%; text-align: left; display: flex; flex-direction: column; gap: 10px;">
                ${slide.bullets.map(b => `
                  <div style="display: flex; align-items: flex-start; gap: 10px; font-size: clamp(12px, 1.3vw, 15px); color: #423730; line-height: 1.45; font-weight: 500;">
                    <span style="width: 6px; height: 6px; border-radius: 50%; background: #5C4436; margin-top: 6px; flex-shrink: 0;"></span>
                    <span>${escapeHtml(b)}</span>
                  </div>
                `).join("")}
              </div>
            ` : `
              <div style="position: absolute; left: 6.0%; top: 60%; transform: translateY(-50%); max-width: 52%; text-align: left;">
                <h2 style="font-family: Georgia, serif; font-size: clamp(30px, 4.2vw, 54px); font-weight: 900; line-height: 1.1; color: #3B2213; margin: 0;">Thank you</h2>
                <div style="font-size: clamp(11px, 1.2vw, 13px); font-weight: 600; color: #5C4436; margin-top: 12px;">${escapeHtml(slide.subtitle)}</div>
              </div>
            `}
          </div>
        `;
      } else {
        canvasHtml = `
          <div style="width: 100%; height: 100%; background: #0E0F0C; padding: 8%; display: flex; flex-direction: column; justify-content: space-between; color: #F2F2F0; box-sizing: border-box;">
            <div>
              <span style="font-size: 11px; font-weight: 800; letter-spacing: 0.15em; color: var(--brand-lime); text-transform: uppercase;">SLIDE ${slideIdx + 1}</span>
              <h2 style="font-size: clamp(18px, 2.5vw, 32px); font-weight: 900; margin: 6px 0 0 0;">${escapeHtml(slide.title)}</h2>
            </div>
            <div style="display: flex; flex-direction: column; gap: 10px; margin: auto 0;">
              ${slide.bullets.map(b => `
                <div style="display: flex; align-items: flex-start; gap: 10px; font-size: clamp(12px, 1.3vw, 15px); color: #ddd;">
                  <span style="width: 6px; height: 6px; border-radius: 50%; background: var(--brand-lime); margin-top: 6px; flex-shrink: 0;"></span>
                  <span>${escapeHtml(b)}</span>
                </div>
              `).join("")}
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; color: #666; border-top: 1px solid #222; padding-top: 10px;">
              <span>${escapeHtml(data.title || "Video Presentation")}</span>
              <span>${slideIdx + 1} / ${totalCount}</span>
            </div>
          </div>
        `;
      }

      presentationContainer.innerHTML = `
        <div style="max-width: 840px; margin: 0 auto;">
          <!-- Presentation Header Bar -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
            <div>
              <div style="font-size: 15px; font-weight: 800; color: var(--text-main);">${escapeHtml(data.title || "Presentation")}</div>
              <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
                <span>Slide ${slideIdx + 1} of ${totalCount}</span>
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 8px;">
              <select id="static-template-select" style="font-size: 11px; font-weight: 700; padding: 6px 10px; border-radius: 10px; background: var(--btn-secondary-bg); border: 1px solid var(--card-border); color: var(--text-main); cursor: pointer;">
                <option value="modern_editorial" ${selectedPptTemplate === "modern_editorial" ? "selected" : ""}>Modern Editorial (Sample 2)</option>
                <option value="warm_hexagons" ${selectedPptTemplate === "warm_hexagons" ? "selected" : ""}>Earthy Hexagons (Sample 1)</option>
                <option value="modern_dark" ${selectedPptTemplate === "modern_dark" ? "selected" : ""}>Midnight Lime (Classic)</option>
              </select>

              <div style="position: relative;" id="download-dropdown-wrap">
                <button id="download-toggle-btn" class="btn-primary" style="padding: 7px 14px; font-size: 12px; font-weight: 800; border-radius: 10px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  <span>Download</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                <div id="download-menu" style="display: none; position: absolute; right: 0; top: 100%; margin-top: 6px; width: 175px; background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.25); z-index: 100; padding: 6px;">
                  <button id="menu-download-pptx" style="width: 100%; display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 8px; border: none; background: transparent; color: var(--text-main); font-size: 12px; font-weight: 700; cursor: pointer; text-align: left;">
                    <span style="color: #E2552B;">📊</span>
                    <span>PowerPoint (.PPTX)</span>
                  </button>
                  <button id="menu-download-pdf" style="width: 100%; display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 8px; border: none; background: transparent; color: var(--text-main); font-size: 12px; font-weight: 700; cursor: pointer; text-align: left;">
                    <span style="color: #1B395D;">📄</span>
                    <span>PDF Document (.PDF)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 16:9 Canvas View -->
          <div style="aspect-ratio: 16/9; min-height: 320px; border-radius: 18px; border: 1px solid rgba(0,0,0,0.12); position: relative; overflow: hidden; box-shadow: 0 12px 36px rgba(0,0,0,0.2);">
            ${canvasHtml}
          </div>

          <!-- Speaker Notes Drawer -->
          ${slide.notes ? `
            <div style="margin-top: 14px; padding: 12px 16px; border-radius: 12px; background: var(--card-surface-elevated); border: 1px solid var(--card-border); font-size: 13px; color: var(--text-muted); text-align: left;">
              <strong style="color: var(--text-main);">Speaker Notes:</strong> <span style="color: var(--text-main);">${escapeHtml(slide.notes)}</span>
            </div>
          ` : ""}

          <!-- Slide Navigation & Jump Controls -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 18px;">
            <button id="ppt-prev-btn" class="btn-secondary" style="padding: 6px 14px; font-size: 12px; font-weight: 700; border-radius: 10px; cursor: pointer;" ${slideIdx === 0 ? "disabled style='opacity:0.35; cursor:not-allowed;'" : ""}>← Previous</button>
            <div style="display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; overflow: hidden; padding: 2px; scrollbar-width: none;">
              ${deckSlides.map((s, i) => `
                <button class="slide-dot-btn btn-secondary" style="padding: 4px 10px; font-size: 11px; border-radius: 8px; cursor: pointer; ${i === slideIdx ? 'background: var(--brand-lime); color: #0E0F0C; font-weight: 800; border-color: var(--brand-lime);' : ''}" data-idx="${i}">
                  ${i === 0 ? "Title" : i === totalCount - 1 ? "End" : i}
                </button>
              `).join("")}
            </div>
            <button id="ppt-next-btn" class="btn-secondary" style="padding: 6px 14px; font-size: 12px; font-weight: 700; border-radius: 10px; cursor: pointer;" ${slideIdx === totalCount - 1 ? "disabled style='opacity:0.35; cursor:not-allowed;'" : ""}>Next →</button>
          </div>
        </div>
      `;

      // Template Switch Listener
      const tmplSel = document.getElementById("static-template-select");
      if (tmplSel) {
        tmplSel.addEventListener("change", (e) => {
          selectedPptTemplate = e.target.value;
          renderCurrentSlide();
        });
      }

      // Download Dropdown & Handlers
      const toggleBtn = document.getElementById("download-toggle-btn");
      const downloadMenu = document.getElementById("download-menu");
      if (toggleBtn && downloadMenu) {
        toggleBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          downloadMenu.style.display = downloadMenu.style.display === "block" ? "none" : "block";
        });
        document.addEventListener("click", () => {
          downloadMenu.style.display = "none";
        });
      }

      const pptxBtn = document.getElementById("menu-download-pptx");
      if (pptxBtn) {
        pptxBtn.addEventListener("click", async () => {
          if (downloadMenu) downloadMenu.style.display = "none";
          showToast("Compiling PowerPoint (.pptx)...", "info");
          try {
            const res = await fetch("/api/download/pptx", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: data.title,
                slides: data.slides,
                template: selectedPptTemplate
              })
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
            showToast("PowerPoint (.pptx) downloaded successfully!", "success");
          } catch (e) {
            showToast(e.message, "error");
          }
        });
      }

      const pdfBtn = document.getElementById("menu-download-pdf");
      if (pdfBtn) {
        pdfBtn.addEventListener("click", () => {
          if (downloadMenu) downloadMenu.style.display = "none";
          showToast("Preparing presentation PDF...", "info");
          const iframe = document.createElement("iframe");
          iframe.style.position = "fixed";
          iframe.style.right = "0";
          iframe.style.bottom = "0";
          iframe.style.width = "0";
          iframe.style.height = "0";
          iframe.style.border = "0";
          document.body.appendChild(iframe);

          const doc = iframe.contentWindow?.document;
          if (!doc) return;

          const slidesHtml = deckSlides.map((s, sIdx) => `
            <div style="width: 100vw; height: 100vh; page-break-after: always; position: relative; padding: 48px 64px 64px 64px; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; background: #EEF0F6; font-family: Arial, sans-serif;">
              <div>
                <div style="font-size: 13px; font-weight: 700; color: #4A5568; text-transform: uppercase; margin-bottom: 12px;">${escapeHtml(s.kicker || `Slide ${sIdx + 1}`)}</div>
                <h1 style="font-size: 32px; font-weight: 900; color: #000; margin: 0 0 16px 0; text-transform: uppercase;">${escapeHtml(s.title)}</h1>
                ${s.summary ? `<p style="font-size: 15px; color: #2D3748; line-height: 1.6; max-width: 80%;">${escapeHtml(s.summary)}</p>` : ""}
                ${s.bullets && s.bullets.length ? `<ul style="margin: 16px 0; padding-left: 24px; font-size: 15px; line-height: 1.8; color: #1F1E1B;">${s.bullets.map(b => `<li style="margin-bottom: 6px;">${escapeHtml(b)}</li>`).join("")}</ul>` : ""}
              </div>
              <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 44px; background: #1B395D; color: #FFFFFF; display: flex; align-items: center; justify-content: space-between; padding: 0 40px; font-size: 12px; font-weight: 700;">
                <span>${escapeHtml(data.title || "Presentation")}</span>
                <span>Page ${String(sIdx + 1).padStart(2, "0")}</span>
              </div>
            </div>
          `).join("");

          doc.open();
          doc.write(`<!DOCTYPE html><html><head><title>${escapeHtml(data.title || "Presentation")}</title><style>@page { size: landscape; margin: 0; } * { box-sizing: border-box; } body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }</style></head><body>${slidesHtml}</body></html>`);
          doc.close();

          setTimeout(() => {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            setTimeout(() => {
              if (document.body.contains(iframe)) document.body.removeChild(iframe);
            }, 2000);
          }, 400);
        });
      }

      const prevBtn = document.getElementById("ppt-prev-btn");
      if (prevBtn && slideIdx > 0) {
        prevBtn.addEventListener("click", () => {
          slideIdx--;
          renderCurrentSlide();
        });
      }

      const nextBtn = document.getElementById("ppt-next-btn");
      if (nextBtn && slideIdx < totalCount - 1) {
        nextBtn.addEventListener("click", () => {
          slideIdx++;
          renderCurrentSlide();
        });
      }

      document.querySelectorAll(".slide-dot-btn").forEach(b => {
        b.addEventListener("click", (e) => {
          slideIdx = parseInt(e.target.getAttribute("data-idx"), 10);
          renderCurrentSlide();
        });
      });
    }

    renderCurrentSlide();
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
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; gap: 16px;">
            <div style="color: var(--text-main); font-size: 15px; font-weight: 600;">Difficulty</div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; width: 260px;">
              <button type="button" class="setup-diff-btn" data-diff="easy" style="width: 100%; padding: 8px 0; font-size: 14px; border-radius: 9999px; cursor: pointer; transition: all 0.15s; text-align: center; box-sizing: border-box; ${chosenDiff === "easy" ? "background: var(--brand-lime); color: #0E0F0C; font-weight: 700; border: 1px solid var(--brand-lime);" : "background: var(--card-bg); color: var(--text-main); font-weight: 500; border: 1px solid var(--card-border);"}">Easy</button>
              <button type="button" class="setup-diff-btn" data-diff="medium" style="width: 100%; padding: 8px 0; font-size: 14px; border-radius: 9999px; cursor: pointer; transition: all 0.15s; text-align: center; box-sizing: border-box; ${chosenDiff === "medium" ? "background: var(--brand-lime); color: #0E0F0C; font-weight: 700; border: 1px solid var(--brand-lime);" : "background: var(--card-bg); color: var(--text-main); font-weight: 500; border: 1px solid var(--card-border);"}">Medium</button>
              <button type="button" class="setup-diff-btn" data-diff="hard" style="width: 100%; padding: 8px 0; font-size: 14px; border-radius: 9999px; cursor: pointer; transition: all 0.15s; text-align: center; box-sizing: border-box; ${chosenDiff === "hard" ? "background: var(--brand-lime); color: #0E0F0C; font-weight: 700; border: 1px solid var(--brand-lime);" : "background: var(--card-bg); color: var(--text-main); font-weight: 500; border: 1px solid var(--card-border);"}">Hard</button>
            </div>
          </div>

          <!-- Row 2: Number of Questions -->
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px;">
            <div style="color: var(--text-main); font-size: 15px; font-weight: 600;">Number of Questions</div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; width: 260px;">
              <button type="button" class="setup-count-btn" data-count="3" style="width: 100%; padding: 8px 0; font-size: 14px; border-radius: 9999px; cursor: pointer; transition: all 0.15s; text-align: center; box-sizing: border-box; ${chosenCount === 3 ? "background: var(--brand-lime); color: #0E0F0C; font-weight: 700; border: 1px solid var(--brand-lime);" : "background: var(--card-bg); color: var(--text-main); font-weight: 500; border: 1px solid var(--card-border);"}">3</button>
              <button type="button" class="setup-count-btn" data-count="5" style="width: 100%; padding: 8px 0; font-size: 14px; border-radius: 9999px; cursor: pointer; transition: all 0.15s; text-align: center; box-sizing: border-box; ${chosenCount === 5 ? "background: var(--brand-lime); color: #0E0F0C; font-weight: 700; border: 1px solid var(--brand-lime);" : "background: var(--card-bg); color: var(--text-main); font-weight: 500; border: 1px solid var(--card-border);"}">5</button>
              <button type="button" class="setup-count-btn" data-count="10" style="width: 100%; padding: 8px 0; font-size: 14px; border-radius: 9999px; cursor: pointer; transition: all 0.15s; text-align: center; box-sizing: border-box; ${chosenCount === 10 ? "background: var(--brand-lime); color: #0E0F0C; font-weight: 700; border: 1px solid var(--brand-lime);" : "background: var(--card-bg); color: var(--text-main); font-weight: 500; border: 1px solid var(--card-border);"}">10</button>
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



function cleanAndDeduplicateSummary(rawText) {
  if (!rawText) return "";

  // 1. Remove hallucinated CJK characters and punctuation
  var cleaned = rawText.replace(/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af\u3000-\u303f\uff00-\uffef]+/g, "");
  cleaned = cleaned.replace(/\(\s*\)/g, "");
  cleaned = cleaned.replace(/\(\s*Section\s*\d*\s*\)/gi, "");
  cleaned = cleaned.replace(/\*\*\s*\*\*/g, "");
  cleaned = cleaned.replace(/^\s*[-*]\s*[-*:\s]*$/gm, "");

  // 2. Check for duplicate blocks separated by --- or repeated # Video Summary / ## Main Topic
  var parts = cleaned.split(/\n\s*---\s*\n/);
  if (parts.length <= 1) {
    var summaryHeaderMatches = [...cleaned.matchAll(/(?:^|\n)#+\s*Video Summary/gi)];
    if (summaryHeaderMatches.length > 1) {
      parts = [cleaned.slice(0, summaryHeaderMatches[1].index), cleaned.slice(summaryHeaderMatches[1].index)];
    }
  }

  if (parts.length <= 1) {
    var mainTopicMatches = [...cleaned.matchAll(/(?:^|\n)##\s*Main Topic/gi)];
    if (mainTopicMatches.length > 1) {
      parts = [cleaned.slice(0, mainTopicMatches[1].index), cleaned.slice(mainTopicMatches[1].index)];
    }
  }

  if (parts.length <= 1) {
    return cleaned.replace(/^\s*#+\s*(?:Video\s+)?Summary\s*\n+/i, "").trim();
  }

  var mainTopics = [];
  var keyConcepts = [];
  var detailedBreakdowns = [];
  var keyTakeaways = [];

  for (var i = 0; i < parts.length; i++) {
    var part = parts[i];
    var mtMatch = part.match(/##\s*Main Topic\s*\n+([\s\S]*?)(?=\n##|$)/i);
    if (mtMatch) {
      var mt = mtMatch[1].trim();
      if (mt && !mainTopics.includes(mt)) mainTopics.push(mt);
    }

    var kcMatch = part.match(/##\s*Key Concepts\s*\n+([\s\S]*?)(?=\n##|$)/i);
    if (kcMatch) {
      var lines = kcMatch[1].trim().split("\n");
      for (var j = 0; j < lines.length; j++) {
        var trimmed = lines[j].trim();
        if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
          var item = trimmed.replace(/^[-*]\s*/, "").replace(/^[-:\s]+/, "").trim();
          if (item && !keyConcepts.some(function(e) { return e.toLowerCase() === item.toLowerCase(); })) {
            keyConcepts.push(item);
          }
        }
      }
    }

    var dbMatch = part.match(/##\s*Detailed Breakdown\s*\n+([\s\S]*?)(?=\n##|$)/i);
    if (dbMatch) {
      var lines = dbMatch[1].trim().split("\n");
      for (var j = 0; j < lines.length; j++) {
        var trimmed = lines[j].trim();
        if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
          var item = trimmed.replace(/^[-*]\s*/, "").replace(/^[-:\s]+/, "").trim();
          if (item && !detailedBreakdowns.some(function(e) { return e.toLowerCase() === item.toLowerCase(); })) {
            detailedBreakdowns.push(item);
          }
        }
      }
    }

    var ktMatch = part.match(/##\s*Key Takeaways\s*\n+([\s\S]*?)(?=\n##|$)/i);
    if (ktMatch) {
      var lines = ktMatch[1].trim().split("\n");
      for (var j = 0; j < lines.length; j++) {
        var trimmed = lines[j].trim();
        if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
          var item = trimmed.replace(/^[-*]\s*/, "").replace(/^[-:\s]+/, "").trim();
          if (item && !keyTakeaways.some(function(e) { return e.toLowerCase() === item.toLowerCase(); })) {
            keyTakeaways.push(item);
          }
        } else if (trimmed && !trimmed.startsWith("#") && trimmed.length > 3) {
          if (!keyTakeaways.includes(trimmed)) keyTakeaways.push(trimmed);
        }
      }
    }
  }

  var out = [];
  if (mainTopics.length) out.push("## Main Topic\n" + mainTopics.join(" ") + "\n");
  if (keyConcepts.length) out.push("## Key Concepts\n" + keyConcepts.map(function(c) { return "- " + c; }).join("\n") + "\n");
  if (detailedBreakdowns.length) out.push("## Detailed Breakdown\n" + detailedBreakdowns.map(function(b) { return "- " + b; }).join("\n") + "\n");
  if (keyTakeaways.length) out.push("## Key Takeaways\n" + keyTakeaways.map(function(t) { return t.startsWith("-") ? t : "- " + t; }).join("\n") + "\n");

  return out.join("\n").trim();
}

  function renderOutputWorkspace(result) {
    if (!result) return;
    currentResult = result;
    workspaceContainer.style.display = "block";
    workspaceContainer.scrollIntoView({ behavior: "smooth" });

    videoTitleHeading.textContent = result.title || "Video";

    var cleanedSummary = cleanAndDeduplicateSummary(result.summary || "");
    currentResult.cleanedSummary = cleanedSummary;

    // Render Markdown + Math
    if (window.marked) {
      summaryContentEl.innerHTML = marked.parse(cleanedSummary);
    } else {
      summaryContentEl.textContent = cleanedSummary;
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
      if (!currentResult || (!currentResult.summary && !currentResult.cleanedSummary)) return;
      var textToCopy = currentResult.cleanedSummary ? `# Video Summary\n\n${currentResult.cleanedSummary}` : currentResult.summary;
      navigator.clipboard.writeText(textToCopy).then(() => {
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
      if (!currentResult || (!currentResult.summary && !currentResult.cleanedSummary)) return;
      var textToDownload = currentResult.cleanedSummary ? `# Video Summary\n\n${currentResult.cleanedSummary}` : currentResult.summary;
      downloadFile(textToDownload, `${sanitizeFilename(currentResult.title)}_summary.txt`, "text/plain");
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

  // --- FAQ Accordion Interactive Toggle ---
  document.querySelectorAll(".faq-btn, .faq-card-modern").forEach(elem => {
    elem.addEventListener("click", () => {
      const item = elem.classList.contains("faq-card-modern") ? elem : elem.closest(".faq-item");
      if (!item) return;
      const isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item, .faq-card-modern").forEach(other => other.classList.remove("open"));
      if (!isOpen) {
        item.classList.add("open");
      }
    });
  });

  // --- Landing Page ScrollStack Controller ---
  const stackTrack = document.getElementById("static-stack-track");
  const stackPrev = document.getElementById("static-stack-prev");
  const stackNext = document.getElementById("static-stack-next");
  const stackLabel = document.getElementById("static-stack-label");

  if (stackTrack && stackPrev && stackNext) {
    stackPrev.addEventListener("click", () => {
      stackTrack.scrollBy({ top: -380, behavior: "smooth" });
    });
    stackNext.addEventListener("click", () => {
      stackTrack.scrollBy({ top: 380, behavior: "smooth" });
    });
    stackTrack.addEventListener("scroll", () => {
      const st = stackTrack.scrollTop;
      const idx = st < 180 ? 1 : st < 540 ? 2 : 3;
      if (stackLabel) stackLabel.textContent = `Card ${idx} of 3`;
    });
  }
});
