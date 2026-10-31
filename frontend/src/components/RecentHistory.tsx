"use client";

import React from "react";
import { History, Clock, ArrowUpRight } from "lucide-react";
import { HistoryItem } from "../lib/types";

interface RecentHistoryProps {
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
}

export function RecentHistory({ items, onSelect }: RecentHistoryProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 shadow-xl mb-12 transition-colors">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-4 h-4 text-[#0E0F0C] dark:text-[var(--brand-lime)]" />
        <h3 className="text-sm font-bold tracking-tight text-[var(--text-main)]">Recent Summaries</h3>
      </div>

      <div className="space-y-2.5">
        {items.map((item, idx) => (
          <div
            key={idx}
            onClick={() => onSelect(item)}
            className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--card-elevated)] border border-[var(--card-border)] hover:border-[var(--brand-lime)] cursor-pointer transition-all group shadow-sm"
          >
            <div className="flex items-center gap-3 truncate max-w-[80%]">
              <Clock className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
              <span className="text-xs font-bold truncate text-[var(--text-main)]">
                {item.title || "Video Summary"}
              </span>
            </div>

            <button
              type="button"
              className="px-2.5 py-1 rounded-lg bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--btn-secondary-text)] text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
