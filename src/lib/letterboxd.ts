import type { FilmEntry } from "@/types";

export interface LetterboxdLiveData {
  films: FilmEntry[];
  filmsLogged: null;
  source: "live";
}

export function decodeXml(input: string): string {
  return input
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .trim();
}

export function extractTag(block: string, tag: string): string | undefined {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return match ? decodeXml(match[1]) : undefined;
}

export function ratingToStars(raw?: string): string {
  if (!raw) return "";
  const num = Number(raw);
  if (!Number.isFinite(num) || num <= 0) return "";
  const full = Math.floor(num);
  const half = num - full >= 0.5;
  return "★".repeat(Math.min(full, 5)) + (half && full < 5 ? "½" : "");
}

export function parseLetterboxdRss(xml: string): FilmEntry[] {
  const items = xml.match(/<item>[\s\S]*?<\/item>/gi) ?? [];
  const films: FilmEntry[] = [];

  for (const item of items) {
    if (films.length >= 4) break;
    const title = extractTag(item, "letterboxd:filmTitle");
    if (!title) continue;

    const year = extractTag(item, "letterboxd:filmYear") ?? "";
    const rating = ratingToStars(extractTag(item, "letterboxd:memberRating"));
    const link = extractTag(item, "link");
    const desc = extractTag(item, "description") ?? "";
    const posterMatch = desc.match(/<img[^>]+src=["'](https:\/\/[^"']+)["']/i);

    films.push({
      title,
      year,
      rating,
      href: link && link.startsWith("https://") ? link : undefined,
      poster: posterMatch?.[1],
    });
  }

  return films;
}

export async function fetchLetterboxdFeed(username: string): Promise<LetterboxdLiveData> {
  const rssUrl = `https://letterboxd.com/${encodeURIComponent(username)}/rss/`;
  const res = await fetch(rssUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error(`Letterboxd RSS responded with ${res.status}`);
  }

  const xml = await res.text();
  const films = parseLetterboxdRss(xml);

  if (films.length === 0) {
    throw new Error("No films parsed from RSS");
  }

  return {
    films,
    filmsLogged: null,
    source: "live",
  };
}
