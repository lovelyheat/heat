"use client";

import { useState } from "react";
import { MotionConfig } from "framer-motion";
import { Hero } from "@/components/Hero";
import {
  DiscordCard,
  LastfmCard,
  LetterboxdCard,
  XCard,
} from "@/components/SocialCards";
import { Footer } from "@/components/Footer";
import { Snowfall } from "@/components/Snowfall";
import { siteConfig } from "@/config/site";
import { useLanyard } from "@/lib/lanyard";

export function HomeClient() {
  const [snow, setSnow] = useState(true);
  const lanyard = useLanyard(siteConfig.discordUserId);

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-dvh bg-background text-foreground">
        <Snowfall enabled={snow} />
        <div className="relative z-10 mx-auto max-w-[960px] px-4 pb-16 sm:px-6">
          <main>
            <Hero lanyard={lanyard} />

            <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
              <div className="md:col-span-7">
                <LastfmCard delay={0.12} />
              </div>
              <div className="md:col-span-5">
                <XCard delay={0.16} />
              </div>
              <div className="md:col-span-5">
                <DiscordCard delay={0.2} lanyard={lanyard} />
              </div>
              <div className="md:col-span-7">
                <LetterboxdCard delay={0.24} />
              </div>
            </div>
          </main>

          <Footer snow={snow} onToggleSnow={() => setSnow((s) => !s)} />
        </div>
      </div>
    </MotionConfig>
  );
}
