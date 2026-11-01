"use client";

import React, { useState, useEffect, useRef } from "react";
import { Navbar } from "../components/Navbar";
import { HeroSection } from "../components/HeroSection";
import { ToolCard } from "../components/ToolCard";
import { OutputWorkspace } from "../components/OutputWorkspace";
import { GeneratingProgressCard } from "../components/GeneratingProgressCard";
import { FeaturesSection } from "../components/FeaturesSection";
import { FaqSection } from "../components/FaqSection";
import { Footer } from "../components/Footer";
import { JobState, JobResult } from "../lib/types";
import { CheckCircle2, AlertCircle, Info, Loader2 } from "lucide-react";

export default function Home() {
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [job, setJob] = useState<JobState | null>(null);
  const [result, setResult] = useState<JobResult | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const lastInputRef = useRef<{ type: "url" | "upload"; value: string } | null>(null);
  const lastSubmittedFileRef = useRef<File | null>(null);

  // Load theme from localStorage (defaults to light mode)
  useEffect(() => {
    const saved = (localStorage.getItem("theme") as "dark" | "light") || "light";
    setTheme(saved);
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(saved);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("theme", next);
      document.documentElement.classList.remove("dark", "light");
      document.documentElement.classList.add(next);
      return next;
    });
  };

  const showToast = (message: string, type: "success" | "info" | "error" = "info") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  const startPolling = (jobId: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/job/${jobId}`);
        if (!res.ok) return;
        const data: JobState = await res.json();
        setJob(data);

        if (data.status === "completed") {
          if (pollingRef.current) clearInterval(pollingRef.current);
          if (data.result) {
            setResult(data.result);
            showToast("Video summarized successfully!", "success");
          }
        } else if (data.status === "failed") {
          if (pollingRef.current) clearInterval(pollingRef.current);
          showToast(data.error || "Summarization failed", "error");
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 1500);
  };

  const handleUrlSubmit = async (url: string, force: boolean = false) => {
    const trimmed = url.trim();
    if (!trimmed) return;

    // If summary is already generated for this exact URL and not forcing regeneration, do not re-run
    if (!force && result && lastInputRef.current?.type === "url" && lastInputRef.current?.value === trimmed) {
      showToast("Summary already generated for this video.", "info");
      const workspaceEl = document.getElementById("workspace-container");
      if (workspaceEl) {
        workspaceEl.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }

    lastInputRef.current = { type: "url", value: trimmed };
    if (!force) setResult(null);

    setJob({
      id: "init",
      type: "url",
      status: "queued",
      step: 1,
      step_name: "Connecting",
      progress: 5,
      message: force ? "Regenerating summary with AI..." : "Initiating video pipeline...",
    });

    try {
      const res = await fetch("/api/summarize/url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to start summarization");

      showToast(force ? "Regenerating summary..." : "Pipeline initiated locally!", "info");
      startPolling(data.job_id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error submitting URL";
      setJob({
        id: "err",
        type: "url",
        status: "failed",
        step: 1,
        step_name: "Error",
        progress: 0,
        message: msg,
        error: msg,
      });
      showToast(msg, "error");
    }
  };

  const handleUploadSubmit = async (file: File, force: boolean = false) => {
    const fileId = `${file.name}_${file.size}_${file.lastModified}`;

    // If summary is already generated for this exact file and not forcing regeneration, do not re-run
    if (!force && result && lastInputRef.current?.type === "upload" && lastInputRef.current?.value === fileId) {
      showToast("Summary already generated for this file.", "info");
      const workspaceEl = document.getElementById("workspace-container");
      if (workspaceEl) {
        workspaceEl.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }

    lastInputRef.current = { type: "upload", value: fileId };
    lastSubmittedFileRef.current = file;
    if (!force) setResult(null);

    setJob({
      id: "init",
      type: "upload",
      status: "queued",
      step: 1,
      step_name: "Uploading",
      progress: 10,
      message: force ? "Regenerating summary with AI..." : "Uploading media to worker...",
    });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/summarize/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to upload file");

      showToast(force ? "Regenerating summary..." : "File uploaded! Processing audio...", "info");
      startPolling(data.job_id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error uploading file";
      setJob({
        id: "err",
        type: "upload",
        status: "failed",
        step: 1,
        step_name: "Error",
        progress: 0,
        message: msg,
        error: msg,
      });
      showToast(msg, "error");
    }
  };

  const handleRegenerateSummary = () => {
    if (!lastInputRef.current) return;
    if (lastInputRef.current.type === "url") {
      handleUrlSubmit(lastInputRef.current.value, true);
    } else if (lastSubmittedFileRef.current) {
      handleUploadSubmit(lastSubmittedFileRef.current, true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-app)] text-[var(--text-main)] transition-colors">
      <Navbar theme={theme} onToggleTheme={toggleTheme} />

      {/* ============================================================
           HERO & TOOL SECTION — SEAMLESS EDGE-TO-EDGE BLENDED ON APP BACKGROUND
           ============================================================ */}
      <section className="w-full px-0 pt-10 sm:pt-16 md:pt-20 lg:pt-24 pb-16 sm:pb-24 lg:pb-32 no-print">
        <div className="w-full max-w-[2048px] mx-auto">
          <HeroSection />
          <ToolCard
            isProcessing={job?.status === "processing" || job?.status === "queued"}
            onSubmitUrl={handleUrlSubmit}
            onSubmitUpload={handleUploadSubmit}
            onError={(msg) => showToast(msg, "error")}
          />
        </div>
      </section>

      {/* ============================================================
           MAIN WORKSPACE & CONTENT CONTAINER
           ============================================================ */}
      <main className="flex-1 max-w-[1180px] w-full mx-auto px-3 sm:px-6 pb-12 sm:pb-16">
        {/* Intelligent Audio Waveform & 3-Stage Progress Card */}
        {job && (job.status === "processing" || job.status === "queued") && (
          <GeneratingProgressCard job={job} />
        )}

        {/* Failure Alert */}
        {job && job.status === "failed" && (
          <div className="p-4 my-6 bg-red-500/10 border border-red-500/20 rounded-xl text-center text-sm font-semibold text-[var(--color-danger)] no-print">
            {job.error || "An error occurred while generating the summary."}
          </div>
        )}

        {/* Output Workspace */}
        {result && (
          <OutputWorkspace
            result={result}
            onToast={showToast}
          />
        )}

        {/* Core Capabilities & Workflow */}
        <FeaturesSection />

        {/* Frequently Asked Questions */}
        <FaqSection />
      </main>

      {/* Modern Footer */}
      <Footer />

      {/* Floating Toast System */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-2xl text-xs font-bold animate-in fade-in slide-in-from-bottom-3 duration-200 text-[var(--text-main)]">
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-[var(--color-success)]" />
          ) : toast.type === "error" ? (
            <AlertCircle className="w-4 h-4 text-[var(--color-danger)]" />
          ) : (
            <Info className="w-4 h-4 text-[var(--brand-lime)]" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
