"use client";

import React, { useMemo } from "react";
import { renderMathInHtml, hasMathDelimiters } from "../lib/mathUtils";

interface MathTextProps {
  text: string;
  className?: string;
  as?: "span" | "div" | "p" | "h2" | "h3" | "h4";
}

/**
 * Renders plain text with automatic LaTeX KaTeX formatting for equations and formulas.
 * Falls back to normal text if no math delimiters exist.
 */
export function MathText({ text, className = "", as = "span" }: MathTextProps) {
  const containsMath = useMemo(() => hasMathDelimiters(text), [text]);

  const html = useMemo(() => {
    if (!containsMath) return null;
    return renderMathInHtml(text);
  }, [text, containsMath]);

  const Component = as;

  if (!containsMath || !html) {
    return <Component className={className}>{text}</Component>;
  }

  return (
    <Component
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
