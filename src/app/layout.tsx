import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Instrument_Sans } from "next/font/google";
import { siteConfig } from "@/config/site";
import { buildDiscordComponentEmbedJson, getLanyardAvatarProxyUrl } from "@/lib/link-preview";
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

const avatarUrl = getLanyardAvatarProxyUrl(siteConfig.discordUserId);
const ogTitle = `${siteConfig.name} (@${siteConfig.socials.discord.handle})`;
const discordEmbedJson = buildDiscordComponentEmbedJson();

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: siteConfig.name,
  openGraph: {
    siteName: new URL(siteConfig.url).host,
    title: ogTitle,
    url: siteConfig.url,
    type: "website",
    images: [{ url: avatarUrl, width: 1024, height: 1024 }],
  },
  twitter: {
    card: "summary",
    title: ogTitle,
    images: [avatarUrl],
  },
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
      <head>
        <script
          id="discord:component-embed"
          type="application/vnd.discord.component-embed+json"
          dangerouslySetInnerHTML={{ __html: discordEmbedJson }}
        />
      </head>
      <body className="bg-background font-sans text-foreground antialiased selection:bg-white/20 selection:text-white">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
