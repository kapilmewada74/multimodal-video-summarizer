import type { Metadata } from "next";
import "katex/dist/katex.min.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "SUMMARIZE.AI — Multimodal Video Summarizer",
  description: "AI-powered video summarizer that generates structured study notes, complete transcripts, flashcards, slide presentations, and interactive quizzes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className="antialiased">{children}</body>
    </html>
  );
}
