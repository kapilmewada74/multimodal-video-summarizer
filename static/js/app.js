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

  // --- Processing & Stepper State ---
  const startSummarizeBtn = document.getElementById("start-summarize-btn");
  const stepperContainer = document.getElementById("stepper-container");
  const progressFill = document.getElementById("progress-fill");
  const progressPercentText = document.getElementById("progress-percent-text");
  const stepMessageText = document.getElementById("step-message-text");
  
  const step1Pill = document.getElementById("step-1-pill");
  const step2Pill = document.getElementById("step-2-pill");
  const step3Pill = document.getElementById("step-3-pill");

  let activePollingTimer = null;
  let activeJobId = null;

  if (startSummarizeBtn) {
    startSummarizeBtn.addEventListener("click", async () => {
      const mode = document.querySelector('input[name="summary-mode"]:checked')?.value || "educational";

      if (activeInputMode === "url") {
        const url = (youtubeUrlInput.value || "").trim();
        if (!url) {
          showToast("Please enter a YouTube URL.", "error");
          youtubeUrlInput.focus();
          return;
        }
        await initiateJob("/api/summarize/url", { url, mode }, false);
      } else {
        if (!currentUploadedFile) {
          showToast("Please select a video or audio file to upload.", "error");
          return;
        }
        const formData = new FormData();
        formData.append("file", currentUploadedFile);
        formData.append("mode", mode);
        await initiateJob("/api/summarize/upload", formData, true);
      }
    });
  }

  async function initiateJob(endpoint, body, isFormData) {
    startSummarizeBtn.disabled = true;
    startSummarizeBtn.textContent = "Processing...";
    stepperContainer.style.display = "block";
    resetStepper();

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
      stepMessageText.textContent = `Error: ${err.message}`;
    }
  }

  function resetStepper() {
    progressFill.style.width = "5%";
    progressPercentText.textContent = "5%";
    stepMessageText.textContent = "Task initialized. Preparing pipeline...";
    setStepState(step1Pill, "processing");
    setStepState(step2Pill, "pending");
    setStepState(step3Pill, "pending");
  }

  function setStepState(pill, state) {
    if (!pill) return;
    pill.classList.remove("processing", "completed", "failed");
    const dot = pill.querySelector(".pulsing-dot");

    if (state === "processing") {
      pill.classList.add("processing");
      if (dot) dot.style.display = "inline-block";
    } else if (state === "completed") {
      pill.classList.add("completed");
      if (dot) dot.style.display = "inline-block";
    } else {
      if (dot) dot.style.display = "none";
    }
  }

  function startPolling(jobId) {
    if (activePollingTimer) clearInterval(activePollingTimer);

    activePollingTimer = setInterval(async () => {
      try {
        const res = await fetch(`/api/job/${jobId}`);
        if (!res.ok) throw new Error("Could not check task status.");

        const job = await res.json();
        const progress = Math.max(5, Math.min(100, job.progress || 5));
        progressFill.style.width = `${progress}%`;
        progressPercentText.textContent = `${progress}%`;
        stepMessageText.textContent = job.message || "Working...";

        // Update step pills
        if (job.step === 1) {
          setStepState(step1Pill, "processing");
          setStepState(step2Pill, "pending");
          setStepState(step3Pill, "pending");
        } else if (job.step === 2) {
          setStepState(step1Pill, "completed");
          setStepState(step2Pill, "processing");
          setStepState(step3Pill, "pending");
        } else if (job.step === 3 && job.status === "processing") {
          setStepState(step1Pill, "completed");
          setStepState(step2Pill, "completed");
          setStepState(step3Pill, "processing");
        }

        if (job.status === "completed") {
          clearInterval(activePollingTimer);
          setStepState(step1Pill, "completed");
          setStepState(step2Pill, "completed");
          setStepState(step3Pill, "completed");
          progressFill.style.width = "100%";
          progressPercentText.textContent = "100%";
          startSummarizeBtn.disabled = false;
          startSummarizeBtn.textContent = "Summarize Video →";
          showToast("Summarization complete!", "success");
          renderOutputWorkspace(job.result);
          loadHistory();
        } else if (job.status === "failed") {
          clearInterval(activePollingTimer);
          startSummarizeBtn.disabled = false;
          startSummarizeBtn.textContent = "Summarize Video →";
          stepMessageText.innerHTML = `<span style="color: var(--color-danger); font-weight: 600;">Failed: ${job.error || "An error occurred."}</span>`;
          showToast(job.error || "Summarization failed", "error");
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 1500);
  }

  // --- Output Workspace Rendering ---
  const workspaceContainer = document.getElementById("workspace-container");
  const videoTitleHeading = document.getElementById("video-title-heading");
  const summaryContentEl = document.getElementById("summary-content");
  const transcriptContentEl = document.getElementById("transcript-content");
  const transcriptSearchInput = document.getElementById("transcript-search-input");

  const tabSummaryView = document.getElementById("tab-summary-view");
  const tabTranscriptView = document.getElementById("tab-transcript-view");
  const viewSummaryPane = document.getElementById("view-summary-pane");
  const viewTranscriptPane = document.getElementById("view-transcript-pane");

  let currentResult = null;

  if (tabSummaryView && tabTranscriptView) {
    tabSummaryView.addEventListener("click", () => {
      tabSummaryView.classList.add("active");
      tabTranscriptView.classList.remove("active");
      viewSummaryPane.style.display = "block";
      viewTranscriptPane.style.display = "none";
    });

    tabTranscriptView.addEventListener("click", () => {
      tabTranscriptView.classList.add("active");
      tabSummaryView.classList.remove("active");
      viewTranscriptPane.style.display = "block";
      viewSummaryPane.style.display = "none";
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
  const downloadMdBtn = document.getElementById("download-md-btn");
  const downloadTxtBtn = document.getElementById("download-txt-btn");
  const exportPdfBtn = document.getElementById("export-pdf-btn");

  if (copySummaryBtn) {
    copySummaryBtn.addEventListener("click", () => {
      if (!currentResult || !currentResult.summary) return;
      navigator.clipboard.writeText(currentResult.summary).then(() => {
        showToast("Summary copied to clipboard!", "success");
      });
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

  if (downloadMdBtn) {
    downloadMdBtn.addEventListener("click", () => {
      if (!currentResult || !currentResult.summary) return;
      downloadFile(currentResult.summary, `${sanitizeFilename(currentResult.title)}_summary.md`, "text/markdown");
      showToast("Downloaded Markdown file!", "success");
    });
  }

  if (downloadTxtBtn) {
    downloadTxtBtn.addEventListener("click", () => {
      if (!currentResult || !currentResult.transcript) return;
      downloadFile(currentResult.transcript, `${sanitizeFilename(currentResult.title)}_transcript.txt`, "text/plain");
      showToast("Downloaded Transcript file!", "success");
    });
  }

  if (exportPdfBtn) {
    exportPdfBtn.addEventListener("click", () => {
      window.print();
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

  // --- Recent History Drawer ---
  const historyListEl = document.getElementById("history-list");

  async function loadHistory() {
    if (!historyListEl) return;
    try {
      const res = await fetch("/api/history");
      if (!res.ok) return;
      const history = await res.json();
      historyListEl.innerHTML = "";

      if (!history || history.length === 0) {
        historyListEl.innerHTML = `<div style="color: var(--text-muted); font-size: 13px;">No past summaries recorded yet.</div>`;
        return;
      }

      history.forEach(item => {
        const itemEl = document.createElement("div");
        itemEl.className = "card-elevated";
        itemEl.style.padding = "10px 14px";
        itemEl.style.marginBottom = "8px";
        itemEl.style.display = "flex";
        itemEl.style.alignItems = "center";
        itemEl.style.justifyContent = "space-between";
        itemEl.style.cursor = "pointer";
        itemEl.style.transition = "border-color 0.2s ease";

        const titleSpan = document.createElement("div");
        titleSpan.style.fontSize = "13px";
        titleSpan.style.fontWeight = "600";
        titleSpan.style.whiteSpace = "nowrap";
        titleSpan.style.overflow = "hidden";
        titleSpan.style.textOverflow = "ellipsis";
        titleSpan.style.maxWidth = "70%";
        titleSpan.textContent = item.title || "Video";

        const loadBtn = document.createElement("button");
        loadBtn.className = "btn-secondary";
        loadBtn.style.padding = "4px 10px";
        loadBtn.style.fontSize = "12px";
        loadBtn.textContent = "View";

        itemEl.appendChild(titleSpan);
        itemEl.appendChild(loadBtn);

        itemEl.addEventListener("click", () => {
          renderOutputWorkspace(item);
          showToast(`Loaded: ${item.title}`, "info");
        });

        historyListEl.appendChild(itemEl);
      });
    } catch (e) {
      console.error("Could not load history:", e);
    }
  }

  loadHistory();

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
