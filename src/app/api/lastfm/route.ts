import { NextResponse } from "next/server";
import { siteConfig } from "@/config/site";
import { fetchLastfmData } from "@/lib/lastfm";

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=20, stale-while-revalidate=60",
};

const CURATED_RESPONSE = {
  track: siteConfig.socials.lastfm.fallbackTrack,
  recent: siteConfig.socials.lastfm.recentRotation,
  scrobbles: siteConfig.socials.lastfm.scrobbles,
  source: "curated" as const,
};

export async function GET() {
  const apiKey = process.env.LASTFM_API_KEY?.trim();
  const username =
    process.env.LASTFM_USERNAME?.trim() || siteConfig.socials.lastfm.handle;

  if (!apiKey || !username) {
    return NextResponse.json(CURATED_RESPONSE, { headers: CACHE_HEADERS });
  }

  try {
    const data = await fetchLastfmData(apiKey, username);
    return NextResponse.json(data, { headers: CACHE_HEADERS });
  } catch {
    return NextResponse.json(CURATED_RESPONSE, { headers: CACHE_HEADERS });
  }
}
