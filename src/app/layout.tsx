import type { Metadata } from "next";
import { DM_Sans, IBM_Plex_Mono, Source_Serif_4 } from "next/font/google";
import { Suspense } from "react";
import { Toaster } from "@/components/toast";
import "./globals.css";

// Open substitutes for the design system's Sofia Pro, P22 Mackinac Pro and
// IBM Plex Mono. Swap these for the licensed fonts if they are ever purchased.
const sofiaSubstitute = DM_Sans({
  variable: "--font-sofia-pro",
  subsets: ["latin"],
});

const mackinacSubstitute = Source_Serif_4({
  variable: "--font-mackinac",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Exam Monitor",
  description:
    "Calm, teacher-led exam monitoring. Flags are possibilities for a human to review, never verdicts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sofiaSubstitute.variable} ${mackinacSubstitute.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Suspense fallback={null}>
          <Toaster />
        </Suspense>
      </body>
    </html>
  );
}
