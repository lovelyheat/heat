"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Check, ChevronLeft, ChevronRight, Copy, Music, SkipForward } from "lucide-react";
import { siteConfig, type FilmEntry, type TrackEntry } from "@/config/site";
import {
  extractCustomStatus,
  extractRichActivities,
  formatMmSs,
  getActivityAssetUrl,
  type CustomStatusData,
  type DiscordStatus,
  type LanyardActivity,
  type LanyardData,
  type LanyardSpotify,
  type RichPresenceItem,
  useAppIcon,
} from "@/lib/lanyard";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Surface } from "@/components/Surface";
import { DiscordIcon, LastfmIcon, LetterboxdIcon, XIcon } from "@/components/Icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface CardProps {
  delay?: number;
}

const meta = "font-mono text-[13px] tabular-nums text-zinc-400";
const glide = "transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]";

function CardLabel({ icon, name }: { icon: React.ReactNode; name: string }) {
  return (
    <span className="flex items-center gap-2.5 text-[15px] font-medium text-zinc-200">
      {icon}
      {name}
    </span>
  );
}

function GlideArrow() {
  return (
    <span aria-hidden="true" className="relative flex size-5 items-center justify-center overflow-hidden text-zinc-600 transition-colors duration-300 group-hover:text-white">
      <ArrowUpRight className={cn("h-3.5 w-3.5 group-hover:-translate-y-5 group-hover:translate-x-5", glide)} />
      <ArrowUpRight className={cn("absolute h-3.5 w-3.5 -translate-x-5 translate-y-5 group-hover:translate-x-0 group-hover:translate-y-0", glide)} />
    </span>
  );
}

function HeaderLink({ href, label, tip }: { href: string; label: string; tip: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button asChild size="icon-sm" className="group/link relative z-20 text-zinc-500">
          <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
            <ArrowUpRight className="transition-transform duration-300 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" aria-hidden="true" />
          </a>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tip}</TooltipContent>
    </Tooltip>
  );
}

function useNow(active: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [active]);
  return now;
}

function SafeImg({
  src,
  alt,
  fallback = null,
  ...props
}: Omit<React.ComponentProps<"img">, "src" | "alt" | "onError"> & {
  src?: string | null;
  alt: string;
  fallback?: React.ReactNode;
}) {
  const [brokenSrc, setBrokenSrc] = useState<string | null>(null);
  if (!src || brokenSrc === src) return <>{fallback}</>;
  return <img {...props} src={src} alt={alt} decoding="async" onError={() => setBrokenSrc(src)} />;
}

export function XCard({ delay = 0 }: CardProps) {
  const x = siteConfig.socials.x;
  return (
    <Surface delay={delay} href={x.href} ariaLabel={`${x.name} — ${x.handle}`}>
      <div className="flex h-full min-h-[220px] flex-col">
        <div className="relative min-h-28 flex-1 overflow-hidden rounded-t-[23px]">
          <SafeImg
            src={x.banner}
            alt=""
            className={cn(
              "absolute inset-0 size-full object-cover object-[70%_50%] opacity-85 [mask-image:linear-gradient(to_bottom,black_45%,transparent)] group-hover:scale-[1.03]",
              glide,
            )}
          />
          <div className="relative flex items-center justify-between p-6">
            <CardLabel icon={<XIcon className="size-4" />} name={x.name} />
            <GlideArrow />
          </div>
        </div>
        <div className="relative -mt-8 px-6 pb-6">
          <SafeImg
            src={x.avatar}
            alt=""
            className="size-16 rounded-full bg-[#121214] object-cover ring-4 ring-[#0a0a0b] transition-[box-shadow] duration-300 group-hover:ring-[#0f0f10]"
            fallback={<div className="size-16 rounded-full bg-[#121214] ring-4 ring-[#0a0a0b]" />}
          />
          <p className="mt-4 break-words text-[32px] font-semibold leading-none tracking-[-0.04em] text-white sm:text-[34px]">{x.displayName}</p>
          <p className="mt-2 break-words text-[15px] text-zinc-400">{x.handle}</p>
          {x.caption && <p className="mt-3 text-[15px] text-zinc-400">{x.caption}</p>}
        </div>
      </div>
    </Surface>
  );
}

function FilmTile({ film, fallbackHref }: { film: FilmEntry; fallbackHref: string }) {
  return (
    <a
      href={film.href ?? fallbackHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${film.title}${film.year ? ` (${film.year})` : ""}${film.rating ? `, rated ${film.rating}` : ""}`}
      className="group/film flex h-full flex-col rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0b]"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-white/[0.08] bg-[#121214] shadow-[0_14px_30px_-14px_rgba(0,0,0,0.9)] transition-colors duration-300 group-hover/film:border-white/[0.22]">
        <SafeImg
          src={film.poster}
          alt=""
          loading="lazy"
          className={cn("size-full object-cover group-hover/film:scale-[1.04]", glide)}
          fallback={
            <div className="flex size-full flex-col justify-end bg-[linear-gradient(180deg,#141416,#0d0d0f)] p-3">
              <p className="line-clamp-4 text-[14px] font-medium leading-tight tracking-[-0.01em] text-zinc-200">{film.title}</p>
              {film.year && <p className="mt-1 font-mono text-[12px] text-zinc-400">{film.year}</p>}
            </div>
          }
        />
      </div>
      <p className="mt-2.5 line-clamp-2 text-[14px] font-medium leading-snug tracking-[-0.01em] text-zinc-100 transition-colors group-hover/film:text-white">{film.title}</p>
      <p className="mt-auto flex items-center justify-between gap-2 pt-1">
        <span className="font-mono text-[12.5px] tabular-nums text-zinc-400">{film.year}</span>
        {film.rating && <span className="truncate text-[13px] tracking-[0.04em] text-zinc-300">{film.rating}</span>}
      </p>
    </a>
  );
}

export function LetterboxdCard({ delay = 0 }: CardProps) {
  const lb = siteConfig.socials.letterboxd;
  const [films, setFilms] = useState<readonly FilmEntry[]>(lb.recentFilms);
  const [filmsLogged, setFilmsLogged] = useState<number | null>(lb.filmsLogged);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/letterboxd", { signal: ctrl.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { films?: FilmEntry[]; filmsLogged?: number | null } | null) => {
        if (!Array.isArray(data?.films) || data.films.length === 0) return;
        setFilms(data.films);
        setFilmsLogged(typeof data.filmsLogged === "number" ? data.filmsLogged : null);
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, []);

  return (
    <Surface delay={delay} ariaLabel={`${lb.name} film diary — ${lb.handle}`}>
      <div className="flex h-full flex-col gap-5 p-6">
        <div className="flex items-center justify-between gap-4">
          <CardLabel icon={<LetterboxdIcon className="size-4" />} name={lb.name} />
          <div className="flex items-center gap-3">
            <span className={meta}>{filmsLogged !== null ? `${filmsLogged} films` : "recent"}</span>
            <HeaderLink href={lb.href} label="Open Letterboxd profile" tip="letterboxd" />
          </div>
        </div>

        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {films.slice(0, 4).map((film, i) => (
            <li key={`${film.title}-${i}`} className="min-w-0">
              <FilmTile film={film} fallbackHref={lb.href} />
            </li>
          ))}
        </ul>
      </div>
    </Surface>
  );
}

function isTrack(v: unknown): v is TrackEntry {
  if (typeof v !== "object" || v === null) return false;
  const t = v as Record<string, unknown>;
  return typeof t.title === "string" && typeof t.artist === "string" && t.title.length > 0;
}

function parseTrack(data: unknown): TrackEntry | null {
  const candidate = typeof data === "object" && data !== null && "track" in data ? (data as { track: unknown }).track : data;
  if (!isTrack(candidate)) return null;
  const t = candidate as TrackEntry & Record<string, unknown>;
  return {
    title: t.title,
    artist: t.artist,
    album: typeof t.album === "string" ? t.album : "",
    duration: typeof t.duration === "string" ? t.duration : "",
    isPlaying: t.isPlaying === true,
    url: typeof t.url === "string" && t.url.startsWith("https://") ? t.url : undefined,
    image: typeof t.image === "string" && t.image.startsWith("https://") ? t.image : undefined,
  };
}

function EqBars() {
  return (
    <span aria-hidden="true" className="flex h-3 items-end gap-[2px]">
      {[1, 2, 3, 4].map((n) => (
        <span
          key={n}
          className={`animate-eq-${n} h-full w-[2px] origin-bottom rounded-full bg-white`}
        />
      ))}
    </span>
  );
}

function Disc({ spinning }: { spinning: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative size-full rounded-full border border-white/[0.08] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.9)]",
        spinning && "animate-disc-spin",
      )}
      style={{
        background:
          "conic-gradient(from 20deg, rgba(255,255,255,0.09), transparent 18%, transparent 48%, rgba(255,255,255,0.06) 58%, transparent 72%), repeating-radial-gradient(circle, #0a0a0c 0 1px, #121215 1px 2.5px)",
      }}
    >
      <span className="absolute inset-[34%] rounded-full border border-white/10 bg-[#18181b]" />
      <span className="absolute inset-[46%] rounded-full bg-black" />
    </div>
  );
}

export function LastfmCard({ delay = 0 }: CardProps) {
  const fm = siteConfig.socials.lastfm;
  const [live, setLive] = useState<TrackEntry>(fm.fallbackTrack);
  const [recent, setRecent] = useState<readonly TrackEntry[]>(fm.recentRotation);
  const [scrobbles, setScrobbles] = useState<string | null>(fm.scrobbles);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const ctrl = new AbortController();
    const load = () => {
      if (document.visibilityState !== "visible") return;
      fetch("/api/lastfm", { signal: ctrl.signal })
        .then((res) => (res.ok ? res.json() : null))
        .then((data: { recent?: unknown; scrobbles?: unknown } | null) => {
          const track = parseTrack(data);
          if (!track) return;
          setLive(track);
          if (Array.isArray(data?.recent)) {
            setRecent(data.recent.map(parseTrack).filter((t): t is TrackEntry => t !== null));
          }
          if (typeof data?.scrobbles === "string") setScrobbles(data.scrobbles);
        })
        .catch(() => {});
    };
    load();
    const timer = setInterval(load, 30_000);
    document.addEventListener("visibilitychange", load);
    return () => {
      ctrl.abort();
      clearInterval(timer);
      document.removeEventListener("visibilitychange", load);
    };
  }, []);

  const queue: readonly TrackEntry[] = [live, ...recent];
  const position = index % queue.length;
  const track = queue[position];
  const isLive = position === 0;
  const playing = isLive && live.isPlaying === true;

  return (
    <Surface delay={delay} ariaLabel={`${fm.name} listening activity`}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] [mask-image:radial-gradient(120%_100%_at_0%_45%,black,transparent_72%)]">
        <AnimatePresence initial={false}>
          {track.image && (
            <motion.img
              key={track.image}
              src={track.image}
              alt=""
              decoding="async"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.14 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
              onError={(e) => (e.currentTarget.style.visibility = "hidden")}
              className="absolute inset-0 size-full scale-125 object-cover blur-2xl"
            />
          )}
        </AnimatePresence>
      </div>

      <div className="relative flex h-full min-h-[220px] flex-col justify-between gap-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="flex items-center gap-3">
            <CardLabel icon={<LastfmIcon className="size-4" />} name={fm.name} />
            {playing && <EqBars />}
            <span className="text-[13px] text-zinc-400">
              {playing ? "now playing" : isLive ? "last played" : "recent"}
            </span>
          </div>
          {scrobbles !== null && <span className={meta}>{scrobbles} plays</span>}
        </div>

        <div className="flex items-center gap-5">
          <div className="relative size-[76px] shrink-0">
            <AnimatePresence initial={false}>
              <motion.div
                key={track.image ?? `disc-${track.title}`}
                initial={{ opacity: 0, scale: 0.94, x: 8 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.97, x: -8 }}
                transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
                className="absolute inset-0"
              >
                <SafeImg
                  src={track.image}
                  alt={track.album ? `${track.album} cover` : ""}
                  className="size-full rounded-2xl border border-white/[0.1] bg-[#0f0f10] object-cover shadow-[0_14px_34px_-12px_rgba(0,0,0,0.95)]"
                  fallback={<Disc spinning={playing} />}
                />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="min-w-0 flex-1" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`${track.title}-${track.artist}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
              >
                <p className="truncate text-[22px] font-semibold leading-tight tracking-[-0.03em] text-white">{track.title}</p>
                <p className="mt-1 truncate text-[15px] text-zinc-300">
                  {track.artist}
                  {track.album && <span className="text-zinc-400"> — {track.album}</span>}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
          {track.duration && <span className="hidden font-mono text-[13px] tabular-nums text-zinc-400 sm:block">{track.duration}</span>}
        </div>

        <div>
          <Separator />
          <div className="flex items-center justify-between gap-3 pt-4">
            <div className="flex items-center gap-3">
              <Button size="sm" className="h-8 px-3 text-[13px]" onClick={() => setIndex((position + 1) % queue.length)}>
                <SkipForward className="size-3.5" aria-hidden="true" />
                {position === queue.length - 1 ? "live" : "next"}
              </Button>
              <div className="flex items-center" role="group" aria-label="Tracks">
                {queue.map((t, i) => (
                  <button
                    key={`${t.title}-${i}`}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`${i === 0 ? "Latest" : "Recent"}: ${t.title} by ${t.artist}`}
                    aria-current={i === position ? "true" : undefined}
                    className="group/dot flex h-6 cursor-pointer items-center px-[3px] outline-none"
                  >
                    <span
                      className={cn(
                        "block h-1.5 rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-focus-visible/dot:ring-2 group-focus-visible/dot:ring-white/30",
                        i === position ? "w-4 bg-zinc-200" : "w-1.5 bg-white/[0.16] group-hover/dot:bg-white/40",
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button asChild variant="ghost" size="icon-sm" className="group/link">
                  <a href={live.url ?? fm.href} target="_blank" rel="noopener noreferrer" aria-label="Open Last.fm">
                    <ArrowUpRight className="transition-transform duration-300 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" aria-hidden="true" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>last.fm</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </Surface>
  );
}

const STATUS_LABEL: Record<DiscordStatus, string> = {
  online: "online",
  idle: "idle",
  dnd: "dnd",
  offline: "offline",
};

function DiscordStatusGlyph({ status, mobileOnly }: { status: DiscordStatus; mobileOnly: boolean }) {
  if (status === "online" && mobileOnly) {
    return (
      <svg viewBox="0 0 12 16" aria-hidden="true" className="h-[11px] w-[8.5px] shrink-0 fill-[#23a55a]">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M3 0.5h6a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2Zm0 2.5a0.5 0.5 0 0 0-0.5 0.5v7.5a0.5 0.5 0 0 0 0.5 0.5h6a0.5 0.5 0 0 0 0.5-0.5V3.5A0.5 0.5 0 0 0 9 3H3Zm3 11.4a0.9 0.9 0 1 0 0-1.8 0.9 0.9 0 0 0 0 1.8Z"
        />
      </svg>
    );
  }
  if (status === "online") {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true" className="size-2.5 shrink-0 fill-[#23a55a]">
        <circle cx="8" cy="8" r="7" />
      </svg>
    );
  }
  if (status === "idle") {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true" className="size-2.5 shrink-0 fill-[#f0b232]">
        <path d="M8.78 1.04A7 7 0 1 1 1.04 8.78A5.5 5.5 0 0 0 8.78 1.04Z" />
      </svg>
    );
  }
  if (status === "dnd") {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true" className="size-2.5 shrink-0 fill-[#f23f43]">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1ZM4.7 6.6h6.6a1.4 1.4 0 1 1 0 2.8H4.7a1.4 1.4 0 1 1 0-2.8Z"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="size-2.5 shrink-0 fill-[#80848e]">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm0 3.4a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2Z"
      />
    </svg>
  );
}

function DiscordStatusPill({ lanyard }: { lanyard: LanyardData }) {
  const status = lanyard.discord_status;
  const mobileOnly = Boolean(
    status === "online" &&
      lanyard.active_on_discord_mobile &&
      !lanyard.active_on_discord_desktop &&
      !lanyard.active_on_discord_web,
  );
  const label = STATUS_LABEL[status] ?? status;
  const tip = status === "dnd" ? "do not disturb" : mobileOnly ? "online on mobile" : null;

  const pill = (
    <span
      tabIndex={tip ? 0 : undefined}
      aria-label={tip ?? label}
      className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.035] px-2.5 py-0.5 text-[12.5px] leading-5 text-zinc-300 outline-none focus-visible:ring-2 focus-visible:ring-white/25"
    >
      <DiscordStatusGlyph status={status} mobileOnly={mobileOnly} />
      <span>{label}</span>
    </span>
  );

  if (!tip) return pill;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{pill}</TooltipTrigger>
      <TooltipContent>{tip}</TooltipContent>
    </Tooltip>
  );
}

const ACTIVITY_VERB: Record<number, string> = {
  0: "playing",
  1: "streaming",
  2: "listening to",
  3: "watching",
  5: "competing in",
};

const inset = "rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3";
const insetLink =
  "group/act relative z-20 outline-none transition-colors duration-300 hover:border-white/[0.14] hover:bg-white/[0.05] focus-visible:ring-2 focus-visible:ring-white/30";
const eyebrow = "flex h-6 items-center gap-2 text-[12.5px] text-zinc-400";
const artTile =
  "flex size-full items-center justify-center rounded-lg border border-white/[0.08] bg-[#121214] text-zinc-400";
const quietLine = "rounded-2xl border border-white/[0.05] px-3 py-2.5 text-[13.5px] text-zinc-500";
const tsText = "font-mono text-[12px] tabular-nums text-zinc-400";

const isTimestamp = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n) && n > 0;

function Timeline({ start, end }: { start?: number; end?: number }) {
  const s = isTimestamp(start) ? start : undefined;
  const e = isTimestamp(end) ? end : undefined;
  const now = useNow(s !== undefined || e !== undefined);

  if (s !== undefined && e !== undefined && e > s) {
    const total = e - s;
    const elapsed = Math.min(Math.max(0, now - s), total);
    return (
      <div className={cn("mt-2 flex items-center gap-2", tsText)}>
        <span>{formatMmSs(elapsed)}</span>
        <span className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/[0.1]">
          <span
            className="absolute inset-y-0 left-0 rounded-full bg-zinc-200 transition-[width] duration-1000 ease-linear"
            style={{ width: `${(elapsed / total) * 100}%` }}
          />
        </span>
        <span>{formatMmSs(total)}</span>
      </div>
    );
  }
  if (s !== undefined) return <p className={cn("mt-1", tsText)}>{formatMmSs(now - s)} elapsed</p>;
  if (e !== undefined) return <p className={cn("mt-1", tsText)}>{formatMmSs(e - now)} left</p>;
  return null;
}

function PreviewBox({ href, label, children }: { href?: string; label?: string; children: React.ReactNode }) {
  const className = cn(inset, "flex items-center gap-3");
  if (!href) return <div className={className}>{children}</div>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={cn(className, insetLink)}>
      {children}
    </a>
  );
}

function LinkHint({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <ArrowUpRight
      className="size-3.5 shrink-0 text-zinc-400 opacity-0 transition-opacity duration-300 group-hover/act:opacity-100 group-focus-visible/act:opacity-100"
      aria-hidden="true"
    />
  );
}

function SpotifyPreview({ spotify }: { spotify: LanyardSpotify }) {
  const artists = spotify.artist?.replaceAll("; ", ", ") ?? "";
  const href = spotify.track_id ? `https://open.spotify.com/track/${encodeURIComponent(spotify.track_id)}` : undefined;

  return (
    <PreviewBox href={href} label={`${spotify.song}${artists ? ` by ${artists}` : ""} on Spotify`}>
      <div className="size-14 shrink-0">
        <SafeImg
          src={spotify.album_art_url}
          alt=""
          className="size-full rounded-lg border border-white/[0.08] bg-[#121214] object-cover"
          fallback={
            <span aria-hidden="true" className={artTile}>
              <Music className="size-5" />
            </span>
          }
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-[15px] font-medium tracking-[-0.01em] text-white">{spotify.song}</p>
          <LinkHint show={Boolean(href)} />
        </div>
        {(artists || spotify.album) && (
          <p className="truncate text-[13.5px] text-zinc-300">
            {artists}
            {spotify.album && <span className="text-zinc-400">{artists ? " — " : ""}{spotify.album}</span>}
          </p>
        )}
        <Timeline start={spotify.timestamps?.start} end={spotify.timestamps?.end} />
      </div>
    </PreviewBox>
  );
}

function ActivityPreview({ activity }: { activity: LanyardActivity }) {
  const assetArt = getActivityAssetUrl(activity, "large");
  const appIcon = useAppIcon(assetArt ? null : activity.application_id);
  const large = assetArt ?? appIcon;
  const small = getActivityAssetUrl(activity, "small");
  const href = activity.type === 1 && activity.url?.startsWith("https://") ? activity.url : undefined;
  const [cur, max] = activity.party?.size ?? [];
  const party = typeof cur === "number" && typeof max === "number" && max > 0 ? `(${cur} of ${max})` : null;
  const stateLine = [activity.state, party].filter(Boolean).join(" ");

  return (
    <PreviewBox href={href} label={href ? `Watch ${activity.name} stream` : undefined}>
      <div className="relative size-14 shrink-0">
        <SafeImg
          src={large}
          alt={activity.assets?.large_text ?? ""}
          title={activity.assets?.large_text}
          className="size-full rounded-lg border border-white/[0.08] bg-[#121214] object-cover"
          fallback={
            <span aria-hidden="true" className={cn(artTile, "text-[20px] font-semibold")}>
              {activity.name.charAt(0).toUpperCase()}
            </span>
          }
        />
        <SafeImg
          src={small}
          alt={activity.assets?.small_text ?? ""}
          title={activity.assets?.small_text}
          className="absolute -bottom-1 -right-1 size-5 rounded-full border-2 border-[#0e0e0f] bg-[#121214] object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-[15px] font-medium tracking-[-0.01em] text-white">{activity.name}</p>
          <LinkHint show={Boolean(href)} />
        </div>
        {activity.details && <p className="truncate text-[13.5px] text-zinc-300">{activity.details}</p>}
        {stateLine && <p className="truncate text-[13.5px] text-zinc-400">{stateLine}</p>}
        <Timeline start={activity.timestamps?.start} end={activity.timestamps?.end} />
      </div>
    </PreviewBox>
  );
}

function CustomStatusLine({ status }: { status: CustomStatusData }) {
  return (
    <p className="flex min-w-0 items-center gap-2 rounded-2xl border border-white/[0.05] px-3 py-2.5 text-[14px] text-zinc-300">
      <SafeImg src={status.customEmojiUrl} alt={status.customEmojiAlt ? `:${status.customEmojiAlt}:` : ""} className="size-4 shrink-0 object-contain" />
      {status.unicodeEmoji && <span className="shrink-0 text-[15px] leading-none">{status.unicodeEmoji}</span>}
      {status.text && <span className="truncate">{status.text}</span>}
    </p>
  );
}

function ItemEyebrow({ item }: { item: RichPresenceItem }) {
  if (item.kind === "spotify") {
    return (
      <>
        <EqBars />
        listening on spotify
      </>
    );
  }
  const live = item.activity.type === 1;
  return (
    <>
      {live && <span aria-hidden="true" className="size-1.5 rounded-full bg-rose-500" />}
      {ACTIVITY_VERB[item.activity.type] ?? "playing"}
    </>
  );
}

function Presence({
  lanyard,
  activities,
  idx,
  onSelect,
}: {
  lanyard: LanyardData | null;
  activities: RichPresenceItem[];
  idx: number;
  onSelect: (id: string) => void;
}) {
  if (!lanyard) {
    return <div aria-hidden="true" className="h-[46px] rounded-2xl border border-white/[0.05] bg-white/[0.02] motion-safe:animate-pulse" />;
  }
  if (lanyard.discord_status === "offline") return <p className={quietLine}>offline</p>;

  const custom = extractCustomStatus(lanyard);
  if (activities.length === 0 && !custom) return <p className={quietLine}>no active presence</p>;

  const item = activities[idx];
  const count = activities.length;
  const go = (step: number) => onSelect(activities[(idx + step + count) % count].id);

  return (
    <div className="flex flex-col gap-3">
      {custom && <CustomStatusLine status={custom} />}
      {item && (
        <div className="relative">
          {count > 1 && (
            <div className="absolute right-0 top-0 z-20 flex h-6 items-center gap-0.5" role="group" aria-label="Discord activities">
              <Button variant="ghost" size="icon-sm" className="size-6" onClick={() => go(-1)} aria-label="Previous activity">
                <ChevronLeft className="size-4" aria-hidden="true" />
              </Button>
              <span className="min-w-[2.75rem] text-center font-mono text-[12.5px] tabular-nums text-zinc-400" aria-live="polite">
                {idx + 1} / {count}
              </span>
              <Button variant="ghost" size="icon-sm" className="size-6" onClick={() => go(1)} aria-label="Next activity">
                <ChevronRight className="size-4" aria-hidden="true" />
              </Button>
            </div>
          )}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
            >
              <p className={cn(eyebrow, "mb-2", count > 1 && "pr-28")}>
                <ItemEyebrow item={item} />
              </p>
              {item.kind === "spotify" ? (
                <SpotifyPreview spotify={item.spotify} />
              ) : (
                <ActivityPreview activity={item.activity} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export function DiscordCard({ delay = 0, lanyard }: CardProps & { lanyard: LanyardData | null }) {
  const dc = siteConfig.socials.discord;
  const handle = lanyard?.discord_user.username ?? dc.handle;
  const displayName = lanyard?.discord_user.display_name || lanyard?.discord_user.global_name || siteConfig.name;
  const [copied, setCopied] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [brokenArt, setBrokenArt] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(handle);
    } catch {
      return;
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1800);
  };

  const activities = extractRichActivities(lanyard);
  const found = activities.findIndex((a) => a.id === selectedId);
  const idx = found === -1 ? 0 : found;
  const item = activities[idx];
  const activityArt = item?.kind === "activity" ? getActivityAssetUrl(item.activity, "large") : null;
  const appIcon = useAppIcon(item?.kind === "activity" && !activityArt ? item.activity.application_id : null);
  const activeArt = item?.kind === "spotify" ? item.spotify.album_art_url || null : (activityArt ?? appIcon);
  const bleed = activeArt && activeArt !== brokenArt ? activeArt : null;

  return (
    <Surface delay={delay} ariaLabel={`Discord — @${handle}`} className={cn(copied && "border-white/35")}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] [mask-image:radial-gradient(120%_95%_at_50%_100%,black,transparent_72%)]">
        <AnimatePresence initial={false}>
          {bleed && (
            <motion.img
              key={bleed}
              src={bleed}
              alt=""
              decoding="async"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.13 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
              onError={() => setBrokenArt(bleed)}
              className="absolute inset-0 size-full scale-125 object-cover blur-2xl"
            />
          )}
        </AnimatePresence>
      </div>

      <div className="relative flex h-full min-h-[220px] flex-col justify-between gap-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CardLabel icon={<DiscordIcon className="size-4" />} name={dc.name} />
            {lanyard && <DiscordStatusPill lanyard={lanyard} />}
          </div>
          <HeaderLink href={dc.href} label="Open Discord profile" tip="profile" />
        </div>

        <div>
          <p className="break-words text-[30px] sm:text-[32px] font-semibold leading-none tracking-[-0.04em] text-white">{displayName}</p>
          <button
            type="button"
            onClick={copy}
            aria-label={`Copy Discord handle @${handle}`}
            className="-mx-2 mt-1 inline-flex h-7 max-w-[calc(100%+1rem)] cursor-pointer items-center gap-2 rounded-full px-2 text-[15px] text-zinc-400 outline-none transition-colors duration-300 hover:bg-white/[0.06] hover:text-zinc-200 focus-visible:ring-2 focus-visible:ring-white/25"
          >
            <span className="truncate">@{handle}</span>
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <Badge asChild variant="default" key="copied" className="py-0.5 text-[12px]">
                  <motion.span
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
                  >
                    <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                    copied
                  </motion.span>
                </Badge>
              ) : (
                <motion.span
                  key="idle"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
                  className="flex"
                >
                  <Copy className="size-3.5" aria-hidden="true" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          <span className="sr-only" aria-live="polite">
            {copied ? "Discord handle copied to clipboard" : ""}
          </span>
        </div>

        <Presence lanyard={lanyard} activities={activities} idx={idx} onSelect={setSelectedId} />
      </div>
    </Surface>
  );
}
