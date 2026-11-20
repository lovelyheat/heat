import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Instrument_Sans } from "next/font/google";
import { siteConfig } from "@/config/site";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const sans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

const title = siteConfig.name;
const description =
  "tagline" in siteConfig && typeof siteConfig.tagline === "string" && siteConfig.tagline
    ? siteConfig.tagline
    : undefined;

export const metadata: Metadata = {
  title,
  ...(description ? { description } : {}),
  openGraph: { title, ...(description ? { description } : {}), type: "website" },
  twitter: { card: "summary", title, ...(description ? { description } : {}) },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} dark`}>
      <body className="bg-background font-sans text-foreground antialiased selection:bg-white/20 selection:text-white">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
