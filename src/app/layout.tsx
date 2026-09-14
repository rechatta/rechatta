import type { Metadata } from "next";
import { Sora, Geist, IBM_Plex_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: "variable",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["500"],
});

export const metadata: Metadata = {
  title: "Rechatta",
  description: "Multi-agent AI chatbot workspace",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${geist.variable} ${plexMono.variable}`}
    >
      <body>
        <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
