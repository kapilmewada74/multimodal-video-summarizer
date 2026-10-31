"use client";

import React, { useState, useEffect, useRef } from "react";
import { Navbar } from "../components/Navbar";
import { ToolCard } from "../components/ToolCard";
import { OutputWorkspace } from "../components/OutputWorkspace";
import { JobState, JobResult } from "../lib/types";
import { CheckCircle2, AlertCircle, Info, Loader2 } from "lucide-react";

export default function Home() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [job, setJob] = useState<JobState | null>(null);
  const [result, setResult] = useState<JobResult | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Load theme from localStorage
  useEffect(() => {
    const saved = (localStorage.getItem("theme") as "dark" | "light") || "dark";
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

  const handleUrlSubmit = async (url: string) => {
    setResult(null);
    setJob({
      id: "init",
      type: "url",
      status: "queued",
      step: 1,
      step_name: "Connecting",
      progress: 5,
      message: "Initiating video pipeline...",
    });

    try {
      const res = await fetch("/api/summarize/url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to start summarization");

      showToast("Pipeline initiated locally!", "info");
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

  const handleUploadSubmit = async (file: File) => {
    setResult(null);
    setJob({
      id: "init",
      type: "upload",
      status: "queued",
      step: 1,
      step_name: "Uploading",
      progress: 10,
      message: "Uploading media to worker...",
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

      showToast("File uploaded! Processing audio...", "info");
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

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-app)] text-[var(--text-main)] transition-colors">
      <Navbar theme={theme} onToggleTheme={toggleTheme} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Clean Hero Section */}
        <div className="text-center mb-10 no-print">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.15] mb-3.5 text-[var(--text-main)]">
            Summarize Any Video in Seconds
          </h1>

          <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-xl mx-auto leading-relaxed font-normal">
            Generate structured study notes, complete transcripts, flashcards, slide presentations, and interactive quizzes from any video.
          </p>
        </div>

        {/* Central Tool Card */}
        <div className="no-print">
          <ToolCard
            isProcessing={job?.status === "processing" || job?.status === "queued"}
            onSubmitUrl={handleUrlSubmit}
            onSubmitUpload={handleUploadSubmit}
            onError={(msg) => showToast(msg, "error")}
          />
        </div>

        {/* Minimal Clean Loading Indicator */}
        {job && (job.status === "processing" || job.status === "queued") && (
          <div className="flex flex-col items-center justify-center py-12 px-6 my-8 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-sm text-center no-print">
            <div className="w-10 h-10 border-3 border-[var(--card-border)] border-t-[var(--brand-lime)] rounded-full animate-spin mb-4" />
            <h3 className="text-base font-bold text-[var(--text-main)]">Generating summary...</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm">
              Transcribing audio and synthesizing key takeaways locally.
            </p>
          </div>
        )}

        {/* Failure Alert */}
        {job && job.status === "failed" && (
          <div className="p-4 my-6 bg-red-500/10 border border-red-500/20 rounded-xl text-center text-sm font-semibold text-[var(--color-danger)] no-print">
            {job.error || "An error occurred while generating the summary."}
          </div>
        )}

        {/* Output Workspace */}
        {result && (
          <OutputWorkspace result={result} onToast={showToast} />
        )}
      </main>

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
