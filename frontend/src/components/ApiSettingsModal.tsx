"use client";

import React, { useState, useEffect } from "react";
import { Key, ExternalLink, X, Check, ShieldCheck } from "lucide-react";

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onToast: (msg: string, type?: "success" | "info" | "error") => void;
}

export function ApiSettingsModal({ isOpen, onClose, onSave, onToast }: ApiSettingsModalProps) {
  const [geminiKey, setGeminiKey] = useState("");
  const [grokKey, setGrokKey] = useState("");

  useEffect(() => {
    if (isOpen) {
      setGeminiKey(localStorage.getItem("GEMINI_API_KEY") || "");
      setGrokKey(localStorage.getItem("GROK_API_KEY") || "");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (geminiKey.trim()) {
      localStorage.setItem("GEMINI_API_KEY", geminiKey.trim());
    } else {
      localStorage.removeItem("GEMINI_API_KEY");
    }

    if (grokKey.trim()) {
      localStorage.setItem("GROK_API_KEY", grokKey.trim());
    } else {
      localStorage.removeItem("GROK_API_KEY");
    }

    onToast("API Keys saved successfully!", "success");
    onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl w-full max-w-lg p-6 shadow-2xl relative text-[var(--text-main)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--card-border)] mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--brand-lime)]/15 text-[var(--brand-lime)] flex items-center justify-center font-bold">
              <Key className="w-4 h-4 text-[#0E0F0C] dark:text-[var(--brand-lime)]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[var(--text-main)]">API Management & Keys</h3>
              <p className="text-xs text-[var(--text-muted)]">Configure Cloud AI APIs with automated local fallback</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--btn-secondary-bg)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Informational Callout */}
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[var(--btn-secondary-bg)] border border-[var(--card-border)] mb-5 text-xs text-[var(--text-muted)] leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-[var(--color-success)] shrink-0 mt-0.5" />
          <div>
            <strong className="text-[var(--text-main)]">Automated Local Fallback:</strong> If keys are not provided or reach rate limits, the system automatically uses your local Qwen2.5 engine. Your app will always work.
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          {/* Gemini */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[var(--text-main)]">
                Gemini API Key <span className="font-normal text-[var(--text-muted)]">(for PPT & Flashcards)</span>
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-[var(--brand-lime-hover)] dark:text-[var(--brand-lime)] hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Get Free Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-lime)]"
            />
            <p className="text-[10px] text-[var(--text-muted)] mt-1">Google AI Studio provides 15 free requests per minute.</p>
          </div>

          {/* Grok */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[var(--text-main)]">
                Grok (xAI) API Key <span className="font-normal text-[var(--text-muted)]">(for Quizzes)</span>
              </label>
              <a
                href="https://console.x.ai/"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-[var(--brand-lime-hover)] dark:text-[var(--brand-lime)] hover:underline flex items-center gap-1 font-semibold"
              >
                <span>xAI Console</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              value={grokKey}
              onChange={(e) => setGrokKey(e.target.value)}
              placeholder="xai-..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-lime)]"
            />
            <p className="text-[10px] text-[var(--text-muted)] mt-1">Powers high-accuracy quiz and distractor question generation.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-[var(--card-border)]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--btn-secondary-text)] text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-[var(--brand-lime)] hover:bg-[var(--brand-lime-hover)] text-[#0E0F0C] text-xs font-black transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save Keys</span>
          </button>
        </div>
      </div>
    </div>
  );
}
