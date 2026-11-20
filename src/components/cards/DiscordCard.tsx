"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import { siteConfig } from "@/config/site";
import type { LanyardData } from "@/types";
import { extractRichActivities, getActivityAssetUrl } from "@/lib/lanyard";
import { useAppIcon } from "@/hooks";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Surface } from "@/components/layout/Surface";
import { DiscordIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { CardLabel, HeaderLink, type CardProps } from "./CardPrimitives";
import { DiscordStatusPill, Presence } from "./DiscordPresence";

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
