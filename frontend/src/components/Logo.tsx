"use client";

import React from "react";

interface LogoProps {
  size?: number;
  className?: string;
  variant?: "space-black" | "lime";
}

export function Logo({ size = 28, className = "", variant = "space-black" }: LogoProps) {
  const isLime = variant === "lime";

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 transition-transform hover:scale-105 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Outer Circular Disc */}
        <circle
          cx="50"
          cy="50"
          r="46"
          fill={isLime ? "#D9EC95" : "#0E0F0C"}
          stroke={isLime ? "#0E0F0C" : "#D9EC95"}
          strokeWidth="4"
        />

        {/* Concentric Inner Ring */}
        <circle
          cx="50"
          cy="50"
          r="34.5"
          fill="none"
          stroke={isLime ? "#0E0F0C" : "rgba(217, 236, 149, 0.4)"}
          strokeWidth="3.2"
        />

        {/* Central Void Backing */}
        <path
          d="M 31.06 22.73 L 28.79 23.67 L 27.65 25.00 L 27.08 26.52 L 27.08 73.30 L 27.84 75.19 L 28.98 76.33 L 30.68 77.08 L 32.58 77.08 L 35.04 75.95 L 73.30 53.79 L 75.00 51.89 L 75.38 49.24 L 74.62 47.35 L 72.92 45.83 L 33.90 23.30 Z"
          fill={isLime ? "#D9EC95" : "#0E0F0C"}
        />

        {/* 3D Overlapping Rounded Ribbon */}
        <path
          d="M 43.94 15.72 L 37.31 17.42 L 32.39 19.89 L 35.80 21.02 L 75.38 43.94 L 76.89 45.45 L 78.03 47.54 L 78.41 49.43 L 78.22 51.70 L 77.08 54.17 L 74.62 56.44 L 35.61 78.98 L 32.20 80.11 L 28.79 79.55 L 27.08 78.60 L 25.57 77.08 L 24.43 75.00 L 24.05 73.30 L 24.05 26.70 L 20.08 32.01 L 17.99 35.98 L 16.29 40.72 L 15.53 44.13 L 15.53 74.81 L 16.86 79.36 L 19.13 82.95 L 21.40 85.23 L 23.30 86.55 L 28.03 88.45 L 32.95 88.83 L 38.07 87.50 L 78.98 64.02 L 82.01 61.74 L 85.04 57.77 L 86.55 53.98 L 86.93 47.92 L 86.36 45.27 L 84.66 41.48 L 81.25 37.50 Z"
          fill={isLime ? "#0E0F0C" : "#D9EC95"}
          stroke="#0E0F0C"
          strokeWidth="3.4"
          strokeLinejoin="round"
        />

        {/* Diagonal Overlap Fold Seam */}
        <line
          x1="36.55"
          y1="22.73"
          x2="49.05"
          y2="30.30"
          stroke={isLime ? "#D9EC95" : "#0E0F0C"}
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* Center Play Button Triangle */}
        <path
          d="M 38.64 39.39 L 38.26 39.77 L 38.26 60.04 L 38.45 60.42 L 39.20 60.61 L 56.25 50.76 L 56.82 50.19 L 56.82 49.62 L 39.39 39.39 Z"
          fill={isLime ? "#0E0F0C" : "#D9EC95"}
          stroke="#0E0F0C"
          strokeWidth="2.8"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
