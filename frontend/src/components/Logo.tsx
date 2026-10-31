"use client";

import React from "react";

interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 28, className = "" }: LogoProps) {
  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 transition-transform hover:scale-105 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Rounded Squircle Container */}
        <rect
          width="28"
          height="28"
          rx="8"
          fill="#141512"
          stroke="rgba(217, 236, 149, 0.35)"
          strokeWidth="1.2"
        />

        {/* Dynamic Forward Play Chevron (Video) */}
        <path
          d="M8.5 8L16.5 14L8.5 20V8Z"
          fill="#D9EC95"
        />

        {/* 3 Summary & Multimodal Waveform Synthesis Bars */}
        <path
          d="M18 9.5H21"
          stroke="#D9EC95"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M18 14H22.5"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M18 18.5H20"
          stroke="#D9EC95"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}