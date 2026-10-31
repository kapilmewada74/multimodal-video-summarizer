"use client";

import React, { useState, useRef } from "react";
import { Link2, UploadCloud, Clipboard, FileVideo, X, ArrowRight } from "lucide-react";

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
      onError("Clipboard access denied. Please paste manually.");
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[18px] p-6 mb-8 transition-colors">
      {/* Pill Tab Switcher */}
      <div className="flex gap-2 border-b border-[var(--card-border)] pb-3 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("url")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all cursor-pointer active:scale-95 ${
            activeTab === "url"
              ? "bg-[#0066cc] text-white font-semibold"
              : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--btn-secondary-bg)] font-normal"
          }`}
        >
          <Link2 className="w-4 h-4" />
          <span>YouTube URL</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("upload")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all cursor-pointer active:scale-95 ${
            activeTab === "upload"
              ? "bg-[#0066cc] text-white font-semibold"
              : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--btn-secondary-bg)] font-normal"
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload File</span>
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* URL Input Tab */}
        {activeTab === "url" ? (
          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] tracking-[-0.12px] uppercase mb-2">
              Paste YouTube Video Link
            </label>
            <div className="flex gap-2.5">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="https://www.youtube.com/watch?v=..."
                disabled={isProcessing}
                className="flex-1 h-[44px] px-5 text-base rounded-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition-all"
              />
              <button
                type="button"
                onClick={handlePaste}
                disabled={isProcessing}
                className="h-[44px] px-5 rounded-full bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] border border-[var(--card-border)] text-[var(--btn-secondary-text)] text-sm font-normal flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                title="Paste from clipboard"
              >
                <Clipboard className="w-4 h-4" />
                <span className="hidden sm:inline">Paste</span>
              </button>
            </div>
          </div>
        ) : (
          /* File Upload Dropzone */
          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] tracking-[-0.12px] uppercase mb-2">
              Drop Media File
            </label>
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

            {!selectedFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileChange(e.dataTransfer.files[0]);
                  }
                }}
                className={`border border-dashed rounded-[18px] p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-[#0066cc] bg-[#0066cc]/5"
                    : "border-[var(--input-border)] hover:border-[#0066cc] bg-[var(--input-bg)]"
                }`}
              >
                <div className="w-11 h-11 rounded-full bg-[#0066cc]/10 text-[#0066cc] flex items-center justify-center mx-auto mb-3">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div className="text-sm font-semibold text-[var(--text-main)] mb-1">Click to upload or drag & drop</div>
                <div className="text-xs text-[var(--text-muted)]">Supports MP4, MOV, MKV, MP3, WAV, M4A</div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3.5 bg-[var(--card-elevated)] border border-[var(--card-border)] rounded-[11px]">
                <div className="flex items-center gap-3">
                  <FileVideo className="w-5 h-5 text-[#0066cc]" />
                  <span className="text-sm font-normal truncate max-w-[280px] sm:max-w-[400px] text-[var(--text-main)]">
                    {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="p-1.5 rounded-full hover:bg-red-500/10 text-[var(--color-danger)] transition-colors cursor-pointer active:scale-95"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Clean Action Footer */}
        <div className="mt-6 pt-5 border-t border-[var(--card-border)] flex items-center justify-end">
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#0066cc] hover:bg-[#0071e3] text-white font-normal text-base flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>{isProcessing ? "Processing..." : "Summarize Video"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
