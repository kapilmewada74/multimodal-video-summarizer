"use client";

import React, { useState, useRef } from "react";
import { Link2, UploadCloud, Clipboard, Play, FileVideo, X, Loader2 } from "lucide-react";

interface ToolCardProps {
  isProcessing: boolean;
  onSubmitUrl: (url: string) => void;
  onSubmitUpload: (file: File) => void;
  onError: (msg: string) => void;
}

export function ToolCard({ isProcessing, onSubmitUrl, onSubmitUpload, onError }: ToolCardProps) {
  const [activeTab, setActiveTab] = useState<"url" | "upload">("url");
  const [url, setUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
      }
    } catch {
      onError("Clipboard access denied. Please paste manually into the input box.");
    }
  };

  const handleFileChange = (file: File) => {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    const valid = [".mp4", ".mov", ".mkv", ".avi", ".webm", ".mp3", ".wav", ".m4a"];
    if (!valid.includes(ext)) {
      onError(`Unsupported file type '${ext}'. Supported: ${valid.join(", ")}`);
      return;
    }
    setSelectedFile(file);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (activeTab === "url") {
      if (!url.trim()) {
        onError("Please enter a YouTube video URL.");
        return;
      }
      onSubmitUrl(url.trim());
    } else {
      if (!selectedFile) {
        onError("Please select or drop a media file.");
        return;
      }
      onSubmitUpload(selectedFile);
    }
  };

  return (
    <div className="w-full no-print select-none my-0 transition-colors">
      {/* ============================================================
           SEAMLESS HERO CANVAS WITH USER'S NEW SVG ARTWORK
           ============================================================ */}
      <div className="relative w-full">
        {/* Subtle Ambient Pale-Green Radial Glows (Blends naturally without boundaries) */}
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden select-none" aria-hidden="true">
          {/* Subtle central glow under title & input */}
          <div 
            className="absolute top-[8%] left-1/2 -translate-x-1/2 w-[75%] max-w-[1100px] h-[55%] rounded-full blur-[100px] opacity-70 dark:opacity-25"
            style={{
              background: "radial-gradient(ellipse at center, rgba(217, 236, 149, 0.25) 0%, rgba(217, 236, 149, 0.08) 45%, transparent 75%)"
            }}
          />
          {/* Subtle glow around the student & desk illustrations on left */}
          <div 
            className="absolute top-[20%] left-[2%] w-[38%] max-w-[520px] h-[65%] rounded-full blur-[90px] opacity-60 dark:opacity-20"
            style={{
              background: "radial-gradient(circle at center, rgba(217, 236, 149, 0.22) 0%, rgba(217, 236, 149, 0.06) 50%, transparent 75%)"
            }}
          />
          {/* Subtle glow around the Notes, Flashcards & Quiz cards on right */}
          <div 
            className="absolute top-[18%] right-[2%] w-[40%] max-w-[560px] h-[68%] rounded-full blur-[95px] opacity-65 dark:opacity-25"
            style={{
              background: "radial-gradient(circle at center, rgba(217, 236, 149, 0.24) 0%, rgba(217, 236, 149, 0.07) 50%, transparent 75%)"
            }}
          />
        </div>

        {/* Base Layer: High-Resolution Clean SVG Illustration — Seamlessly Blended */}
        <img
          src="/summarize-ai-hero-illustration.svg"
          alt="Summarize AI Hero Illustration"
          className="w-full h-auto block select-none pointer-events-none dark:invert-[0.93] dark:hue-rotate-180 transition-all"
          loading="eager"
        />

        {/* ============================================================
             OVERLAY LAYER: TEXTS, TABS, URL INPUT & BUTTON (PERFECT SPACING)
             ============================================================ */}
        <div className="hidden sm:block absolute inset-0 w-full h-full">
          {/* 1. Header Typography: Title with Doodle Underline & Sparks */}
          <div className="absolute top-[4.5%] left-0 w-full text-center px-4 pointer-events-auto">
            <h1 className="text-[clamp(1.5rem,2.8vw,3.75rem)] font-black tracking-[-0.03em] leading-tight text-[var(--text-main)] max-w-6xl mx-auto">
              Summarize Any Video in{" "}
              <span className="relative inline-block">
                Seconds
                {/* Hand-drawn Green Doodle Underline */}
                <svg
                  className="absolute -bottom-2 sm:-bottom-2.5 md:-bottom-3 left-0 w-full h-3 sm:h-4 lg:h-5 text-[var(--brand-lime-hover)] dark:text-[var(--brand-lime)] pointer-events-none"
                  viewBox="0 0 160 14"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M3 10 C 45 3, 115 4, 157 9 C 115 12, 45 11, 3 10"
                    stroke="currentColor"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {/* Hand-drawn Green Doodle Sparks */}
                <svg
                  className="absolute -top-3.5 -right-5 sm:-right-6 md:-right-8 w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-[var(--brand-lime-hover)] dark:text-[var(--brand-lime)] pointer-events-none"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="12" y1="2" x2="12" y2="8" />
                  <line x1="4" y1="7" x2="9" y2="10.5" />
                  <line x1="20" y1="7" x2="15" y2="10.5" />
                </svg>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-[clamp(0.75rem,1.0vw,1.15rem)] text-[var(--text-muted)] max-w-3xl xl:max-w-4xl mx-auto leading-relaxed mt-1 sm:mt-2 xl:mt-3 font-normal">
              Generate structured study notes, complete transcripts, active-recall flashcards, slide presentations, and interactive quizzes from any video.
            </p>
          </div>

          {/* 2. Tab Navigation: YouTube URL / Upload Video */}
          <div className="absolute top-[48.0%] left-[37.5%] flex items-center gap-2.5 sm:gap-3.5 pointer-events-auto">
            <button
              type="button"
              onClick={() => setActiveTab("url")}
              className={`flex items-center gap-1.5 px-3.5 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95 ${
                activeTab === "url"
                  ? "bg-[var(--brand-lime)] text-[#0E0F0C] shadow-xs"
                  : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
              }`}
            >
              <Link2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>YouTube URL</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              className={`flex items-center gap-1.5 px-3 sm:px-3.5 md:px-4 py-1.5 sm:py-2 md:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95 ${
                activeTab === "upload"
                  ? "bg-[var(--brand-lime)] text-[#0E0F0C] shadow-xs"
                  : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Upload Video / Audio</span>
            </button>
          </div>

          {/* 3. Interactive Pill Box — Identical layout for both URL and Upload modes */}
          <div className="absolute top-[57.5%] left-[37.5%] w-[45.0%] h-[14.0%] pointer-events-auto flex items-center">
            <div
              onClick={() => {
                if (activeTab === "upload" && !selectedFile) {
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={(e) => {
                if (activeTab === "upload") {
                  e.preventDefault();
                  setIsDragging(true);
                }
              }}
              onDragLeave={() => {
                if (activeTab === "upload") setIsDragging(false);
              }}
              onDrop={(e) => {
                if (activeTab === "upload") {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileChange(e.dataTransfer.files[0]);
                  }
                }
              }}
              className={`relative w-full h-full rounded-full border border-black/15 dark:border-white/15 bg-white dark:bg-[#141512] shadow-xs flex items-center px-2 sm:px-3 md:px-4 transition-all focus-within:border-[var(--brand-lime)] focus-within:ring-2 focus-within:ring-[var(--brand-lime)]/20 ${
                activeTab === "upload" && !selectedFile ? "cursor-pointer" : ""
              } ${isDragging ? "ring-2 ring-[var(--brand-lime)] border-[var(--brand-lime)] bg-[var(--brand-lime)]/10" : ""}`}
            >
              {activeTab === "url" ? (
                <>
                  {/* Play Icon in circle outline */}
                  <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full border border-black/20 dark:border-white/20 flex items-center justify-center shrink-0 text-black/60 dark:text-white/60 ml-1.5 sm:ml-2">
                    <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current ml-0.5" />
                  </div>

                  {/* Text Input */}
                  <input
                    type="text"
                    inputMode="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                    placeholder="Paste YouTube video link here..."
                    disabled={isProcessing}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    name="yt_link_no_autofill"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    className="hero-input w-full h-full bg-transparent !border-none !outline-none !ring-0 !shadow-none focus:!outline-none focus:!ring-0 focus:!border-none focus:!shadow-none px-2 sm:px-3 md:px-4 text-xs sm:text-sm md:text-base lg:text-lg text-[var(--text-main)] placeholder:text-[var(--text-muted)]"
                    aria-label="Paste YouTube video link here"
                  />

                  {/* Paste Pill Button with Doodle Sparks */}
                  <div className="relative shrink-0 mr-0.5">
                    <button
                      type="button"
                      onClick={handlePaste}
                      disabled={isProcessing}
                      className="h-[34px] sm:h-[38px] md:h-[44px] px-3 sm:px-4 md:px-5 rounded-full bg-[#EFEFEc] hover:bg-[#E5E5E1] dark:bg-[#20211D] dark:hover:bg-[#2A2B25] text-[var(--text-main)] border border-black/10 dark:border-white/10 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                      title="Paste from clipboard"
                    >
                      <Clipboard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>Paste</span>
                    </button>

                    {/* Green Doodle Sparks on top-right of Paste button */}
                    <svg
                      className="absolute -top-3 -right-3 sm:-top-3.5 sm:-right-3.5 w-4 h-4 sm:w-5 sm:h-5 text-[var(--brand-lime-hover)] dark:text-[var(--brand-lime)] pointer-events-none"
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <line x1="10" y1="2" x2="10" y2="7" />
                      <line x1="3" y1="6" x2="7" y2="9" />
                      <line x1="17" y1="6" x2="13" y2="9" />
                    </svg>
                  </div>
                </>
              ) : (
                <>
                  {/* Upload / Video Icon in circle outline */}
                  <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full border border-black/20 dark:border-white/20 flex items-center justify-center shrink-0 text-black/60 dark:text-white/60 ml-1.5 sm:ml-2">
                    {selectedFile ? (
                      <FileVideo className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--brand-lime-hover)] dark:text-[var(--brand-lime)]" />
                    ) : (
                      <UploadCloud className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    )}
                  </div>

                  {/* Upload Prompt or Selected File Name */}
                  {!selectedFile ? (
                    <div className="w-full h-full flex items-center px-2 sm:px-3 md:px-4 select-none">
                      <span className="text-xs sm:text-sm md:text-base lg:text-lg text-[var(--text-muted)] truncate">
                        {isDragging ? "Drop video or audio right here..." : "Click to upload or drag & drop video/audio"}
                      </span>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center px-2 sm:px-3 md:px-4 select-none min-w-0">
                      <span className="text-xs sm:text-sm md:text-base font-bold text-[var(--text-main)] truncate">
                        {selectedFile.name}
                      </span>
                      <span className="text-[11px] sm:text-xs text-[var(--text-muted)] ml-2 shrink-0">
                        ({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)
                      </span>
                    </div>
                  )}

                  {/* Browse / Clear Button */}
                  <div className="relative shrink-0 mr-0.5">
                    {!selectedFile ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        disabled={isProcessing}
                        className="h-[34px] sm:h-[38px] md:h-[44px] px-3 sm:px-4 md:px-5 rounded-full bg-[#EFEFEc] hover:bg-[#E5E5E1] dark:bg-[#20211D] dark:hover:bg-[#2A2B25] text-[var(--text-main)] border border-black/10 dark:border-white/10 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                        title="Browse files"
                      >
                        <UploadCloud className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>Browse</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                        }}
                        className="h-[34px] sm:h-[38px] md:h-[44px] px-3 rounded-full bg-red-500/10 hover:bg-red-500/20 text-[var(--color-danger)] border border-red-500/20 text-xs sm:text-sm font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                        title="Remove file"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    )}

                    {/* Green Doodle Sparks on top-right of Browse button when no file */}
                    {!selectedFile && (
                      <svg
                        className="absolute -top-3 -right-3 sm:-top-3.5 sm:-right-3.5 w-4 h-4 sm:w-5 sm:h-5 text-[var(--brand-lime-hover)] dark:text-[var(--brand-lime)] pointer-events-none"
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      >
                        <line x1="10" y1="2" x2="10" y2="7" />
                        <line x1="3" y1="6" x2="7" y2="9" />
                        <line x1="17" y1="6" x2="13" y2="9" />
                      </svg>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Hidden File Input for desktop overlay */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp4,.mov,.mkv,.avi,.webm,.mp3,.wav,.m4a"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileChange(e.target.files[0]);
              }
            }}
          />

          {/* 4. Summarize Video Pill Button (Centered under input, meeting the curved arrow) */}
          <div className="absolute top-[75.5%] left-[51.5%] w-[21.5%] h-[10.5%] pointer-events-auto flex items-center justify-center">
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={isProcessing}
              className="w-full h-full rounded-full bg-[var(--brand-lime)] hover:bg-[var(--brand-lime-hover)] active:scale-[0.97] text-[#0E0F0C] font-extrabold text-[clamp(0.75rem,1.0vw,1.15rem)] flex items-center justify-center gap-2 transition-all shadow-xs hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              title="Summarize Video"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0E0F0C]" />
                  <span>{activeTab === "upload" ? "Uploading..." : "Processing..."}</span>
                </>
              ) : (
                <>
                  <span>Summarize Video</span>
                  <span className="font-bold text-sm md:text-base leading-none">→</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================
           MOBILE VIEWPORT CONTROLS (<sm): CLEAN RESPONSIVE FORM
           ============================================================ */}
      <div className="sm:hidden w-full px-3 mt-4">
        <div className="w-full p-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-sm">
          {/* Mobile Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-black text-[var(--text-main)] tracking-tight">
            Summarize Any Video in{" "}
            <span className="relative inline-block text-[var(--brand-lime-hover)] dark:text-[var(--brand-lime)]">
              Seconds
            </span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Generate notes, transcripts, flashcards, slides, and quizzes.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mb-3">
          <button
            type="button"
            onClick={() => setActiveTab("url")}
            className={`flex-1 py-2 rounded-full text-xs font-bold transition-all text-center ${
              activeTab === "url"
                ? "bg-[var(--brand-lime)] text-[#0E0F0C]"
                : "bg-black/5 dark:bg-white/5 text-[var(--text-muted)]"
            }`}
          >
            YouTube URL
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`flex-1 py-2 rounded-full text-xs font-bold transition-all text-center ${
              activeTab === "upload"
                ? "bg-[var(--brand-lime)] text-[#0E0F0C]"
                : "bg-black/5 dark:bg-white/5 text-[var(--text-muted)]"
            }`}
          >
            Upload File
          </button>
        </div>

        {activeTab === "url" ? (
          <div className="space-y-3">
            <div className="relative flex items-center">
              <input
                type="text"
                inputMode="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                disabled={isProcessing}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                name="mobile_yt_link"
                className="w-full h-11 pl-4 pr-20 text-xs rounded-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-lime)]"
              />
              <button
                type="button"
                onClick={handlePaste}
                disabled={isProcessing}
                className="absolute right-1.5 h-8 px-3 rounded-full bg-[#EFEFEc] dark:bg-[#20211D] text-xs font-bold text-[var(--text-main)] border border-black/10 dark:border-white/10"
              >
                Paste
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={isProcessing}
              className="w-full h-11 rounded-full bg-[var(--brand-lime)] hover:bg-[var(--brand-lime-hover)] text-[#0E0F0C] font-black text-xs flex items-center justify-center gap-2"
            >
              {isProcessing ? "Processing..." : "Summarize Video →"}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div
              onClick={() => !selectedFile && fileInputRef.current?.click()}
              className="relative flex items-center w-full h-11 pl-4 pr-20 text-xs rounded-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-main)] cursor-pointer select-none"
            >
              <span className="truncate text-[var(--text-muted)]">
                {selectedFile ? selectedFile.name : "Click to upload or drag & drop video/audio"}
              </span>
              {!selectedFile ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="absolute right-1.5 h-8 px-3 rounded-full bg-[#EFEFEc] dark:bg-[#20211D] text-xs font-bold text-[var(--text-main)] border border-black/10 dark:border-white/10"
                >
                  Browse
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="absolute right-1.5 h-8 px-2.5 rounded-full bg-red-500/10 text-red-500 text-xs font-bold"
                >
                  Clear
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={isProcessing}
              className="w-full h-11 rounded-full bg-[var(--brand-lime)] hover:bg-[var(--brand-lime-hover)] text-[#0E0F0C] font-black text-xs flex items-center justify-center gap-2"
            >
              {isProcessing ? "Uploading..." : "Summarize Video →"}
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
