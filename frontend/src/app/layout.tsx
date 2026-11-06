import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
});

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
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const observer = new MutationObserver(function(mutations) {
                  for (let i = 0; i < mutations.length; i++) {
                    const m = mutations[i];
                    if (m.type === 'attributes') {
                      const name = m.attributeName;
                      if (name === 'bis_skin_checked' || name === 'bis_register' || (name && name.indexOf('__processed_') === 0)) {
                        m.target.removeAttribute(name);
                      }
                    }
                  }
                });
                observer.observe(document.documentElement, {
                  attributes: true,
                  subtree: true,
                  attributeFilter: ['bis_skin_checked', 'bis_register']
                });
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={`${ibmPlexSans.variable} antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
