import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SUMMARIZE.AI — Multimodal Video Summarizer",
  description: "AI-powered video summarization and RAG assistant that preserves mathematical formulas and generates searchable transcripts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
