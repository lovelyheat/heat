"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight, Music } from "lucide-react";
import type {
  CustomStatusData,
  DiscordStatus,
  LanyardActivity,
  LanyardData,
  LanyardSpotify,
  RichPresenceItem,
} from "@/types";
import { extractCustomStatus, formatMmSs, getActivityAssetUrl } from "@/lib/lanyard";
import { useAppIcon, useNow } from "@/hooks";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { DiscordStatusGlyph } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { EqBars, SafeImg } from "./CardPrimitives";

const STATUS_LABEL: Record<DiscordStatus, string> = {
  online: "online",
  idle: "idle",
  dnd: "dnd",
  offline: "offline",
};

export function DiscordStatusPill({ lanyard }: { lanyard: LanyardData }) {
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

export function Presence({
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
