import katex from "katex";
import { marked } from "marked";

/**
 * Safely render a LaTeX math expression to HTML string using KaTeX.
 */
export function renderKatexToString(expr: string, displayMode: boolean = false): string {
  const trimmed = expr.trim();
  if (!trimmed) return "";
  try {
    return katex.renderToString(trimmed, {
      displayMode,
      throwOnError: false,
      output: "htmlAndMathml",
      strict: false,
      trust: true,
    });
  } catch {
    return displayMode
      ? `<div class="katex-error font-mono text-xs text-amber-600 bg-amber-500/10 p-2 rounded my-1">${trimmed}</div>`
      : `<code class="katex-error font-mono text-xs text-amber-600">${trimmed}</code>`;
  }
}

/**
 * Checks if a string contains mathematical formula delimiters ($$, \[, \(, or $).
 */
export function hasMathDelimiters(text: string): boolean {
  if (!text || typeof text !== "string") return false;
  return (
    text.includes("$$") ||
    text.includes("\\[") ||
    text.includes("\\(") ||
    /(?<![\$\\])\$(?!\s|\$|\d+(?:\.\d+)?(?:\s|$|,|\.))([^\$\n]+?)(?<!\s|\$)\$/.test(text)
  );
}

/**
 * Transform text containing math delimiters ($$, \[, \(, $) into HTML with KaTeX rendered spans.
 * Protects currency values like $10, $50, $100K from being mistaken for formulas.
 */
export function renderMathInHtml(text: string): string {
  if (!text || typeof text !== "string") return "";
  if (!hasMathDelimiters(text)) return text;

  let result = text;

  // 1. Display Math Blocks: $$...$$ or \[...\]
  result = result.replace(/\\\[([\s\S]*?)\\\]|\$\$([\s\S]*?)\$\$/g, (_, eq1, eq2) => {
    const eq = (eq1 || eq2 || "").trim();
    return renderKatexToString(eq, true);
  });

  // 2. Inline Math: \(...\)
  result = result.replace(/\\\(([\s\S]*?)\\\)/g, (_, eq) => {
    return renderKatexToString(eq, false);
  });

  // 3. Inline Math: $...$
  // Rule: Do not match currency amounts like $50, $10.99, $100, $ 20.
  // Must have non-space right after opening $ and non-space right before closing $.
  result = result.replace(
    /(?<![\$\\])\$(?!\s|\$|\d+(?:\.\d+)?(?:\s|$|,|\.|\)))([^\$\n]+?)(?<!\s|\$)\$/g,
    (_, eq) => {
      // Extra safety check: if it's purely digits and common currency units, skip
      if (/^\s*\d+(?:\.\d+)?\s*(?:k|m|b|usd|eur|gbp)?\s*$/i.test(eq)) {
        return `$${eq}$`;
      }
      return renderKatexToString(eq, false);
    }
  );

  return result;
}

/**
 * Multi-pass tokenized Markdown renderer with full KaTeX mathematical formula support.
 *
 * Prevents `marked` from corrupting math symbols (e.g. converting `_` to `<em>` or mangling KaTeX HTML).
 */
export function renderMarkdownWithMath(markdown: string): string {
  if (!markdown || typeof markdown !== "string") return "";

  const mathPlaceholders: { token: string; html: string }[] = [];
  let tokenCounter = 0;

  // 1. Temporarily extract fenced code blocks to protect their contents
  const codeBlocks: { token: string; content: string }[] = [];
  let processed = markdown.replace(/```[\s\S]*?```/g, (match) => {
    const token = `%%CODE_BLOCK_${tokenCounter++}%%`;
    codeBlocks.push({ token, content: match });
    return token;
  });

  // 2. Temporarily extract inline code
  processed = processed.replace(/`[^`\n]+?`/g, (match) => {
    const token = `%%INLINE_CODE_${tokenCounter++}%%`;
    codeBlocks.push({ token, content: match });
    return token;
  });

  // 3. Extract and render Display Math: $$ ... $$ or \[ ... \]
  processed = processed.replace(/\\\[([\s\S]*?)\\\]|\$\$([\s\S]*?)\$\$/g, (_, eq1, eq2) => {
    const eq = (eq1 || eq2 || "").trim();
    const token = `%%DISPLAY_MATH_${tokenCounter++}%%`;
    const rendered = renderKatexToString(eq, true);
    mathPlaceholders.push({ token, html: rendered });
    return `\n\n${token}\n\n`;
  });

  // 4. Extract and render Inline Math: \( ... \)
  processed = processed.replace(/\\\(([\s\S]*?)\\\)/g, (_, eq) => {
    const token = `%%INLINE_MATH_${tokenCounter++}%%`;
    const rendered = renderKatexToString(eq, false);
    mathPlaceholders.push({ token, html: rendered });
    return token;
  });

  // 5. Extract and render Inline Math: $ ... $
  processed = processed.replace(
    /(?<![\$\\])\$(?!\s|\$|\d+(?:\.\d+)?(?:\s|$|,|\.|\)))([^\$\n]+?)(?<!\s|\$)\$/g,
    (fullMatch, eq) => {
      if (/^\s*\d+(?:\.\d+)?\s*(?:k|m|b|usd|eur|gbp)?\s*$/i.test(eq)) {
        return fullMatch;
      }
      const token = `%%INLINE_MATH_${tokenCounter++}%%`;
      const rendered = renderKatexToString(eq, false);
      mathPlaceholders.push({ token, html: rendered });
      return token;
    }
  );

  // 6. Restore code blocks before marked parses markdown
  for (const item of codeBlocks) {
    processed = processed.replace(item.token, item.content);
  }

  // 7. Parse clean markdown with marked
  let html = (marked.parse(processed) as string) || "";

  // 8. Restore rendered KaTeX math placeholders into final HTML
  for (const item of mathPlaceholders) {
    // Also handle case where marked wrapped placeholder in <p>
    const pWrapped = `<p>${item.token}</p>`;
    if (html.includes(pWrapped)) {
      html = html.replace(pWrapped, `<div class="katex-display-wrap my-3 text-center overflow-x-auto py-1">${item.html}</div>`);
    } else {
      html = html.replace(item.token, item.html);
    }
  }

  return html;
}
