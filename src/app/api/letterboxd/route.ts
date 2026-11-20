import { NextResponse } from "next/server";
import { siteConfig } from "@/config/site";
import { fetchLetterboxdFeed } from "@/lib/letterboxd";

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
};

const CURATED_RESPONSE = {
  films: siteConfig.socials.letterboxd.recentFilms,
  filmsLogged: siteConfig.socials.letterboxd.filmsLogged,
  source: "curated" as const,
};

export async function GET() {
  const username =
    process.env.LETTERBOXD_USERNAME?.trim() || siteConfig.socials.letterboxd.handle;

  try {
    const data = await fetchLetterboxdFeed(username);
    return NextResponse.json(data, { headers: CACHE_HEADERS });
  } catch {
    return NextResponse.json(CURATED_RESPONSE, { headers: CACHE_HEADERS });
  }
}
