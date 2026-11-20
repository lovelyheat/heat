"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, SkipForward } from "lucide-react";
import { siteConfig } from "@/config/site";
import type { TrackEntry } from "@/types";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Surface } from "@/components/layout/Surface";
import { LastfmIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CardLabel, EqBars, SafeImg, metaClass, type CardProps } from "./CardPrimitives";

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
          {scrobbles !== null && <span className={metaClass}>{scrobbles} plays</span>}
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
