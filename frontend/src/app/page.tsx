"use client";

import React, { useState, useEffect, useRef } from "react";
import { Navbar } from "../components/Navbar";
import { ToolCard } from "../components/ToolCard";
import { ProgressStepper } from "../components/ProgressStepper";
import { OutputWorkspace } from "../components/OutputWorkspace";
import { RecentHistory } from "../components/RecentHistory";
import { JobState, JobResult, HistoryItem } from "../lib/types";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

export default function Home() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [job, setJob] = useState<JobState | null>(null);
  const [result, setResult] = useState<JobResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Load theme from localStorage
  useEffect(() => {
    const saved = (localStorage.getItem("theme") as "dark" | "light") || "dark";
    setTheme(saved);
    if (saved === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
    fetchHistory();
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    if (next === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
  };

  const showToast = (message: string, type: "success" | "info" | "error" = "info") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/history");
      if (res.ok) {
        const data = await res.json();
        setHistory(data || []);
      }
    } catch {
      // ignore
    }
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
            fetchHistory();
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

  const handleUrlSubmit = async (url: string, mode: string) => {
    setResult(null);
    setJob({
      id: "init",
      type: "url",
      status: "queued",
      step: 1,
      step_name: "Connecting",
      progress: 5,
      message: "Initiating local video pipeline...",
    });

    try {
      const res = await fetch("/api/summarize/url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, mode }),
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

  const handleUploadSubmit = async (file: File, mode: string) => {
    setResult(null);
    setJob({
      id: "init",
      type: "upload",
      status: "queued",
      step: 1,
      step_name: "Uploading",
      progress: 10,
      message: "Uploading media to local worker...",
    });

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mode", mode);

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
    <div className="min-h-screen flex flex-col">
      <Navbar theme={theme} onToggleTheme={toggleTheme} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Hero Section */}
        <div className="text-center mb-10 no-print">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-[var(--brand-lime)] bg-[rgba(217,236,149,0.12)] border border-[rgba(217,236,149,0.25)] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-lime)]" />
            <span>AI Video Summarizer</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.1] mb-3.5">
            Summarize Any Video in Seconds
          </h1>

          <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-xl mx-auto leading-relaxed">
            Generate structured notes, preserve mathematical formulas, and explore searchable transcripts — powered by local AI without external API fees.
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

        {/* Live Stepper */}
        {job && job.status !== "completed" && (
          <div className="no-print">
            <ProgressStepper job={job} />
          </div>
        )}

        {/* Output Workspace */}
        {result && (
          <OutputWorkspace result={result} onToast={showToast} />
        )}

        {/* Recent History Drawer */}
        <div className="no-print">
          <RecentHistory
            items={history}
            onSelect={(item) => {
              setResult({
                title: item.title,
                duration: item.duration,
                summary: item.summary,
                transcript: item.transcript,
                mode: item.mode,
              });
              showToast(`Loaded: ${item.title}`, "info");
              window.scrollTo({ top: 400, behavior: "smooth" });
            }}
          />
        </div>
      </main>

      {/* Floating Toast System */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-2xl text-xs font-bold animate-in fade-in slide-in-from-bottom-3 duration-200">
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
