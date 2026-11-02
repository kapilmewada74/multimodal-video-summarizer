# Multimodal Video Summarizer — UI Design System & Product Specification

**Version:** 1.0  
**Application Type:** Utility-First AI Video Summarization & RAG Platform  
**Design Reference:** Modern Utility-First Architecture & Tool-Centric UX  
**Stack Target:** Next.js 15 / React 19 · Tailwind CSS v4 · Radix UI · Lucide React · KaTeX  
**Last Updated:** October 2026  

---

## 1. Product & Design Architecture

To build a **market-level, scalable, and professional** video summarization tool (resembling the clean, instantaneous utility of **iLovePDF** combined with the modern dark-first elegance of **Linear / Perplexity**), the user interface is structured around a utility-first design system with high-contrast organic tokens.

### 1.1 Core Design Foundations & Tokens
* **Invariant Signature Color Palette:** Brand Lime (`#D9EC95`) for CTAs, active states, and focus rings; Brand Black (`#0E0F0C`) and Brand Ivory (`#F2F2F0`) for warm, organic backgrounds.
* **Dark-First Layered Surfaces:** Background (`#0E0F0C`) ↔ Elevated Card (`oklch(0.22 0 0)`) with subtle ring borders (`rgba(242,242,240, 0.1)`).
* **Eyebrow Header Pattern:** Distinctive pill badge with brand-lime dot for section context (`● AI VIDEO SUMMARIZER`).
* **Pulsing Status Badges:** Dynamic feedback badges for pipeline states (`● Transcribing...`, `● Generating summary...`).
* **Shimmer Progress Bar:** Animated progress bar with lime glow shadow for 15–30s generation phases.
* **Component Primitives:** Button variant/size hierarchy, card anatomy, custom scrollbars, and Sonner toast notifications.

### 1.2 Video Summarization Features & Utility Architecture
* ✨ **Tool-First Action Card:** Central input card offering dual modes: instant YouTube URL paste input and drag-and-drop video/audio upload box (`.mp4`, `.mov`, `.mp3`, `.wav`).
* ✨ **Multi-Stage Processing Stepper:** Clear 3-step live pipeline visualization:
  1. Extraction (`yt-dlp` / `ffmpeg`)
  2. Speech-to-Text (`whisper`)
  3. AI Summarization (`Qwen2.5`)
* ✨ **Mathematical Formula & LaTeX Renderer:** Full KaTeX / math typesetting for machine learning formulas, physics, and statistics.
* ✨ **Dual-Pane Output Workspace:** Tabbed/split view switching between the AI Summary and the timestamped full transcript.
* ✨ **Export Utility Toolbar:** One-click Copy Markdown, Export PDF, and Download TXT.

---

## 2. Brand Identity & Product Persona

### 2.1 Name & Tagline
* **Brand Name:** `SUMMARIZE.AI` (or `Multimodal Video Summarizer`)
* **Tagline:** Instant AI-Powered Video Summaries & Transcripts
* **Value Proposition:** Transform hours of educational lectures, technical tutorials, and podcasts into structured notes, mathematical formulas, and searchable transcripts in seconds — completely local & private.

### 2.2 Logo & Navbar Specification
* **Navbar Height:** `h-14` (56px), sticky `top-0`, `z-50`, `bg-background/95 backdrop-blur-md`, `border-b border-border/50`.
* **Logo Mark:** 32×32px `rounded-md` container with Brand Lime accent waveform/sparkle icon.
* **Brand Label:** `text-base`, `font-bold`, uppercase, tracking-tight typography (`SUMMARIZE.AI`).

---

## 3. Color System

### 3.1 Brand Core Palette (Invariant Across Themes)
These colors do **NOT** invert between light and dark modes, providing consistent brand recognition.

| Token | Hex | CSS Variable | Tailwind Role | Usage |
|---|---|---|---|---|
| **Brand Lime** | `#D9EC95` | `--color-brand-lime` | `bg-brand-lime`, `text-brand-lime` | Primary CTAs, active tabs, progress fill, focus rings |
| **Brand Lime Hover** | `#C8DE65` | `--color-brand-lime-hover`| `bg-brand-lime-hover` | Button hover state |
| **Brand Black** | `#0E0F0C` | `--color-brand-black` | `bg-brand-black`, `text-brand-black` | Dark mode background, primary dark surface |
| **Brand Ivory** | `#F2F2F0` | `--color-brand-ivory` | `bg-brand-ivory`, `text-brand-ivory` | Light mode background, light text in dark mode |

### 3.2 Semantic Pipeline Status Colors
Dynamic status indicators during video processing:

| Status Token | Light Mode | Dark Mode | Pipeline State |
|---|---|---|---|
| **Success** | `#15803D` | `#8ED081` | Completed transcription / Generated summary |
| **Warning / Processing** | `#D97706` | `#F4C95D` | Video downloading / Audio extracting / Whisper running |
| **Danger** | `#E11D48` | `#FF6B6B` | Invalid URL, unsupported codec, FFmpeg error |

### 3.3 Surface & Card Tokens (Dark-First Hierarchy)

```css
:root {
  /* Light Mode */
  --background: #F2F2F0;
  --foreground: #0E0F0C;
  --card: #FFFFFF;
  --card-foreground: #0E0F0C;
  --border: rgba(14, 15, 12, 0.1);
  --muted: rgba(14, 15, 12, 0.05);
  --muted-foreground: rgba(14, 15, 12, 0.6);
  --ring: #D9EC95;
}

.dark {
  /* Dark Mode (Default) */
  --background: #0E0F0C;
  --foreground: #F2F2F0;
  --card: oklch(0.22 0 0);           /* Elevated dark surface */
  --card-foreground: oklch(0.985 0 0);
  --border: rgba(242, 242, 240, 0.1);
  --muted: rgba(242, 242, 240, 0.06);
  --muted-foreground: rgba(242, 242, 240, 0.6);
  --ring: #D9EC95;
}
```

---

## 4. Typography & Mathematical Typesetting

### 4.1 Type Hierarchy

| Level | Classes | Weight | Purpose |
|---|---|---|---|
| **Eyebrow** | `text-xs font-bold uppercase tracking-[0.18em]` | 700 | Section context chip (`● YOUTUBE SUMMARIZER`) |
| **Hero Title** | `text-4xl sm:text-5xl md:text-6xl font-black tracking-[-0.03em] leading-[1.05]` | 900 | Main hero claim |
| **Section Title** | `text-2xl sm:text-3xl font-extrabold` | 800 | Output headers, card section titles |
| **Card Header** | `text-base font-semibold leading-snug` | 600 | Tool card titles, summary topics |
| **Body Text** | `text-base leading-7 font-normal text-foreground/90` | 400 | Generated summaries, explanations |
| **Meta / Small** | `text-sm font-medium text-muted-foreground` | 500 | Video duration, timestamp, token counts |
| **Math / Code** | `font-mono text-sm` | 400 | Mathematical equations, LaTeX formulas |

### 4.2 Formula & Equation Rule (KaTeX Integration)
All mathematical formulas generated by the summarizer must render with KaTeX:
- Inline expressions: e.g., `\( f(x) = ax^2 + bx + c \)`
- Display Blocks:
  ```latex
  \[ \int_{a}^{b} f(x) \, dx \]
  ```
Formula blocks use an elevated card background (`bg-muted/40 p-4 rounded-lg border border-border/50`) with an explicit "Copy LaTeX" micro-button.

---

## 5. Screen Layout & UX Architecture (iLovePDF Pattern)

The user journey is structured into three continuous states within a single focused page:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ NAVBAR: [Logo] SUMMARIZE.AI                     [Github] [ThemeToggle ☀️/🌙] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                     ● AI VIDEO SUMMARIZER (Eyebrow)                         │
│               Summarize Any Video in Seconds                                │
│       Educational notes, formulas, and transcripts powered by local AI.      │
│                                                                             │
│   ┌── Core Utility Card (iLovePDF Tool Pattern) ─────────────────────────┐  │
│   │                                                                      │  │
│   │   [ YouTube URL Tab ]       [ Upload Video/Audio File Tab ]          │  │
│   │                                                                      │  │
│   │   ┌──────────────────────────────────────────────────────────────┐   │  │
│   │   │ 🔗 https://www.youtube.com/watch?v=...          [ Paste ]   │   │  │
│   │   └──────────────────────────────────────────────────────────────┘   │  │
│   │                                                                      │  │
│   │   Mode: (•) Educational & Formulas  ( ) Quick Bullet  ( ) Deep Notes │  │
│   │                                                                      │  │
│   │   [ Summarize Video → (Large Brand Lime Button) ]                    │  │
│   │                                                                      │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│   ┌── Live Processing Stepper (Visible during generation) ───────────────┐  │
│   │  ✓ 1. Download & Audio Extraction   [ Completed ]                   │  │
│   │  ● 2. Whisper Speech-to-Text        [ 65% Transcribing... ]          │  │
│   │  ○ 3. Local AI Summarization        [ Pending ]                      │  │
│   │                                                                      │  │
│   │  [██████████████████████████░░░░░░░░░░░░] Brand Lime Shimmer Bar     │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│   ┌── Output Workspace (Appears upon completion) ────────────────────────┐  │
│   │                                                                      │  │
│   │   Title: [Video / Lecture Title Here]                                │  │
│   │   Duration: 14:20  •  Words: 2,450  •  Model: Qwen2.5 Local          │  │
│   │                                                                      │  │
│   │   [ Tab: Summary Notes ]    [ Tab: Full Transcript ]                 │  │
│   │   [ Copy Markdown ]  [ Export PDF ]  [ Download TXT ]               │  │
│   │  ──────────────────────────────────────────────────────────────────  │  │
│   │   # Summary                                                          │  │
│   │   ## 1. Main Topic ...                                               │  │
│   │   ## 2. Mathematical Formulas                                        │  │
│   │      Formula: [Formula from transcript]                              │  │
│   │                                                                      │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Component Specifications

### 6.1 Buttons
* **Primary (Brand Lime CTA):**
  * `bg-brand-lime text-brand-black font-semibold rounded-lg px-6 py-2.5 hover:bg-brand-lime-hover hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 shadow-[0_0_20px_rgba(217,236,149,0.2)]`
* **Outline / Secondary:**
  * `border border-border/80 bg-card/50 text-foreground hover:bg-muted rounded-lg px-4 py-2 text-sm font-medium`
* **Icon Buttons:**
  * `size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted`

### 6.2 Status Badge (Pill Pattern)
* `inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold`
* **Processing:** `bg-warning/15 text-warning border border-warning/20` with a 2px pulsing dot.
* **Complete:** `bg-success/15 text-success border border-success/20` with a solid dot.
* **Error:** `bg-danger/15 text-danger border border-danger/20`.

### 6.3 Shimmer Progress Bar
* **Track:** `h-2 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden`
* **Fill:** `bg-brand-lime h-full rounded-full transition-all duration-300 relative shadow-[0_0_14px_rgba(217,236,149,0.4)]`
* **Shimmer Animation:**
  ```css
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  .animate-shimmer {
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    animation: shimmer 2.2s infinite;
  }
  ```

### 6.4 Custom Brand Scrollbars
* Applied to transcript viewer and long summary panes:
  ```css
  .scrollbar-brand::-webkit-scrollbar {
    width: 8px;
  }
  .scrollbar-brand::-webkit-scrollbar-track {
    background: transparent;
  }
  .scrollbar-brand::-webkit-scrollbar-thumb {
    background: #D9EC95;
    border-radius: 9999px;
  }
  .scrollbar-brand::-webkit-scrollbar-thumb:hover {
    background: #C8DE65;
  }
  ```

---

## 7. Scalability & Implementation Roadmap

| Phase | Milestone | Deliverable |
|---|---|---|
| **Phase 1** | **Design System & Architecture** (Current) | Formal UI specification, component tokens, wireframe plans. |
| **Phase 2** | **Frontend Prototype (Next.js 15 / Tailwind v4)** | Clean single-page application with responsive URL input card, file dropzone, and mock pipeline stepper. |
| **Phase 3** | **Local API Bridge** | Lightweight FastAPI / Flask server exposing endpoints: `/api/transcribe`, `/api/summarize`, `/api/status` (Server-Sent Events for real-time progress). |
| **Phase 4** | **Rich Export & History** | Local SQLite / IndexedDB cache of previous summaries, PDF export via `@react-pdf/renderer`, and KaTeX rendering. |

---
*Created for Multimodal Video Summarizer repository. Maintained on branch `first-ui-changes`.*
