import { NextResponse } from "next/server";
import { siteConfig, type TrackEntry } from "@/config/site";

interface LastFmImage {
  "#text"?: string;
  size?: string;
}

interface LastFmApiTrack {
  name?: string;
  artist?: { "#text"?: string };
  album?: { "#text"?: string };
  url?: string;
  image?: LastFmImage[];
  "@attr"?: { nowplaying?: string };
}

interface LastFmRecentResponse {
  recenttracks?: {
    track?: LastFmApiTrack | LastFmApiTrack[];
    "@attr"?: { total?: string };
  };
}

interface LastFmUserInfoResponse {
  user?: {
    playcount?: string;
  };
}

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=20, stale-while-revalidate=60",
};

function pickImage(images?: LastFmImage[]): string | undefined {
  if (!Array.isArray(images)) return undefined;
  const preferred =
    images.find((i) => i.size === "extralarge")?.["#text"] ||
    images.find((i) => i.size === "large")?.["#text"] ||
    images[images.length - 1]?.["#text"];
  if (
    typeof preferred === "string" &&
    preferred.startsWith("https://") &&
    !preferred.includes("2a96cbd8b46e442fc41c2b86b821562f")
  ) {
    return preferred;
  }
  return undefined;
}

function toTrackEntry(raw: LastFmApiTrack): TrackEntry | null {
  if (!raw.name || !raw.artist?.["#text"]) return null;
  return {
    title: raw.name,
    artist: raw.artist["#text"],
    album: raw.album?.["#text"] ?? "",
    duration: "",
    isPlaying: raw["@attr"]?.nowplaying === "true",
    url:
      typeof raw.url === "string" && raw.url.startsWith("https://")
        ? raw.url
        : siteConfig.socials.lastfm.href,
    image: pickImage(raw.image),
  };
}

export async function GET() {
  const apiKey = process.env.LASTFM_API_KEY?.trim();
  const username =
    process.env.LASTFM_USERNAME?.trim() || siteConfig.socials.lastfm.handle;

  if (!apiKey || !username) {
    return NextResponse.json(
      {
        track: siteConfig.socials.lastfm.fallbackTrack,
        recent: siteConfig.socials.lastfm.recentRotation,
        scrobbles: siteConfig.socials.lastfm.scrobbles,
        source: "curated" as const,
      },
      { headers: CACHE_HEADERS },
    );
  }

  try {
    const recentUrl = new URL("https://ws.audioscrobbler.com/2.0/");
    recentUrl.searchParams.set("method", "user.getrecenttracks");
    recentUrl.searchParams.set("user", username);
    recentUrl.searchParams.set("api_key", apiKey);
    recentUrl.searchParams.set("format", "json");
    recentUrl.searchParams.set("limit", "4");

    const infoUrl = new URL("https://ws.audioscrobbler.com/2.0/");
    infoUrl.searchParams.set("method", "user.getinfo");
    infoUrl.searchParams.set("user", username);
    infoUrl.searchParams.set("api_key", apiKey);
    infoUrl.searchParams.set("format", "json");

    const [recentRes, infoRes] = await Promise.all([
      fetch(recentUrl.toString(), { next: { revalidate: 20 } }),
      fetch(infoUrl.toString(), { next: { revalidate: 60 } }),
    ]);

    if (!recentRes.ok) {
      throw new Error(`Last.fm responded with ${recentRes.status}`);
    }

    const recentPayload = (await recentRes.json()) as LastFmRecentResponse;
    const rawTracks = recentPayload.recenttracks?.track;
    const list = (Array.isArray(rawTracks) ? rawTracks : rawTracks ? [rawTracks] : [])
      .map(toTrackEntry)
      .filter((t): t is TrackEntry => t !== null);

    if (list.length === 0) {
      throw new Error("No tracks returned");
    }

    let scrobbles: string | null = siteConfig.socials.lastfm.scrobbles;
    const totalFromRecent = recentPayload.recenttracks?.["@attr"]?.total;
    if (infoRes.ok) {
      const infoPayload = (await infoRes.json()) as LastFmUserInfoResponse;
      const playcount = Number(infoPayload.user?.playcount ?? totalFromRecent);
      if (Number.isFinite(playcount) && playcount > 0) {
        scrobbles = playcount.toLocaleString("en-US");
      }
    } else if (totalFromRecent && Number.isFinite(Number(totalFromRecent))) {
      scrobbles = Number(totalFromRecent).toLocaleString("en-US");
    }

    return NextResponse.json(
      {
        track: list[0],
        recent: list.slice(1),
        scrobbles,
        source: "live" as const,
      },
      { headers: CACHE_HEADERS },
    );
  } catch {
    return NextResponse.json(
      {
        track: siteConfig.socials.lastfm.fallbackTrack,
        recent: siteConfig.socials.lastfm.recentRotation,
        scrobbles: siteConfig.socials.lastfm.scrobbles,
        source: "curated" as const,
      },
      { headers: CACHE_HEADERS },
    );
  }
}
