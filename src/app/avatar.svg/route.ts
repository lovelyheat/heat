import { siteConfig } from "@/config/site";
import { getDiscordAvatarUrl } from "@/lib/lanyard";
import { getLanyardAvatarProxyUrl } from "@/lib/link-preview";
import type { LanyardDiscordUser } from "@/types";

export const dynamic = "force-dynamic";

const FALLBACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="32" fill="#050505"/><path d="M21 19V45M43 19V45M21 32H43" stroke="#FAFAFA" stroke-width="3.2" stroke-linecap="round"/></svg>`;

const HEADERS = {
  "Content-Type": "image/svg+xml; charset=utf-8",
  "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=3600",
};

async function resolveSmallAvatarUrl(): Promise<string> {
  try {
    const res = await fetch(
      `https://api.lanyard.rest/v1/users/${encodeURIComponent(siteConfig.discordUserId)}`,
      { next: { revalidate: 300 } },
    );
    if (res.ok) {
      const json = (await res.json()) as {
        success?: boolean;
        data?: { discord_user?: LanyardDiscordUser };
      };
      const user = json.data?.discord_user;
      if (json.success && user) {
        return getDiscordAvatarUrl(user, 128).replace(/\.gif(?=\?)/, ".png");
      }
    }
  } catch {
  }
  return getLanyardAvatarProxyUrl(siteConfig.discordUserId);
}

export async function GET() {
  try {
    const avatarUrl = await resolveSmallAvatarUrl();
    const res = await fetch(avatarUrl, { next: { revalidate: 300 } });

    if (!res.ok) {
      return new Response(FALLBACK_SVG, { headers: HEADERS });
    }

    const contentType = res.headers.get("content-type")?.split(";")[0]?.trim() || "image/png";
    const base64 = Buffer.from(await res.arrayBuffer()).toString("base64");
    const dataUri = `data:${contentType};base64,${base64}`;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><clipPath id="c"><circle cx="32" cy="32" r="32"/></clipPath></defs><image href="${dataUri}" width="64" height="64" preserveAspectRatio="xMidYMid slice" clip-path="url(#c)"/></svg>`;

    return new Response(svg, { headers: HEADERS });
  } catch {
    return new Response(FALLBACK_SVG, { headers: HEADERS });
  }
}
