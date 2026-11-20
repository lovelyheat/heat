"use client";

import { Snowflake } from "lucide-react";
import { motion } from "framer-motion";
import { siteConfig } from "@/config/site";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { GitHubIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface FooterProps {
  snow: boolean;
  onToggleSnow: () => void;
}

export function Footer({ snow, onToggleSnow }: FooterProps) {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, ease: EASE_OUT_EXPO }}
      className="mt-10"
    >
      <Separator className="mx-auto bg-transparent bg-linear-to-r from-transparent via-white/[0.18] to-transparent data-[orientation=horizontal]:w-[82%]" />
      <div className="flex items-center justify-between gap-4 pt-6">
        <span className="text-sm text-zinc-400">
          <span className="font-medium text-zinc-200">© {siteConfig.name}</span>{" "}
          <span className="font-mono text-[13px]"> {siteConfig.year}</span>
        </span>

        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button asChild size="icon">
                <a
                  href={siteConfig.socials.github.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`GitHub — ${siteConfig.socials.github.handle}`}
                >
                  <GitHubIcon aria-hidden="true" />
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{siteConfig.socials.github.handle}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                onClick={onToggleSnow}
                aria-label={snow ? "Turn snow off" : "Turn snow on"}
                aria-pressed={snow}
                className={cn(!snow && "text-zinc-500")}
              >
                <Snowflake aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{snow ? "snow off" : "snow on"}</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </motion.footer>
  );
}
