"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { motion } from "framer-motion";
import { siteConfig } from "@/config/site";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { getDiscordAvatarUrl, getDiscordDecorationUrl } from "@/lib/lanyard";
import type { LanyardData } from "@/types";

export function Hero({ lanyard }: { lanyard: LanyardData | null }) {
  const user = lanyard?.discord_user;
  const avatarUrl = user ? getDiscordAvatarUrl(user, 240) : null;
  const decorationUrl = user ? getDiscordDecorationUrl(user, 240) : null;
  const [brokenSrc, setBrokenSrc] = useState<string | null>(null);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
      className="pb-10 pt-14 sm:pb-14 sm:pt-20"
    >
      <div className="flex items-center gap-5 sm:gap-7">
        <div className="relative size-[clamp(3.5rem,13vw,7.25rem)] shrink-0">
          {avatarUrl && brokenSrc !== avatarUrl ? (
            <img
              src={avatarUrl}
              alt={siteConfig.name}
              decoding="async"
              onError={() => setBrokenSrc(avatarUrl)}
              className="size-full rounded-full bg-[#0f0f10] object-cover"
            />
          ) : (
            <div aria-hidden="true" className="size-full rounded-full bg-[#0f0f10]" />
          )}
          {decorationUrl && (
            <img
              key={decorationUrl}
              src={decorationUrl}
              alt=""
              aria-hidden="true"
              decoding="async"
              onError={(e) => (e.currentTarget.style.display = "none")}
              className="pointer-events-none absolute left-1/2 top-1/2 size-[120%] max-w-none -translate-x-1/2 -translate-y-1/2 select-none"
            />
          )}
        </div>
        <h1 className="text-[clamp(4.5rem,17vw,9.5rem)] font-semibold leading-[0.85] tracking-[-0.06em] text-white">
          {siteConfig.name}
        </h1>
      </div>
      {"tagline" in siteConfig && typeof siteConfig.tagline === "string" && siteConfig.tagline && (
        <p className="mt-6 text-[16px] text-zinc-400">{siteConfig.tagline}</p>
      )}
    </motion.section>
  );
}
