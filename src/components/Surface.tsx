"use client";

import { motion } from "framer-motion";
import { cardVariants, EASE_OUT_EXPO } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface SurfaceProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  interactive?: boolean;
  href?: string;
  ariaLabel?: string;
}

export function Surface({ children, className, delay = 0, interactive, href, ariaLabel }: SurfaceProps) {
  const shared = {
    className: cn(
      "group relative block h-full rounded-3xl border border-white/[0.08] bg-[#0a0a0b] text-left",
      "transition-[background-color,border-color] duration-300 ease-out",
      (interactive || href) && "cursor-pointer hover:border-white/[0.18] hover:bg-[#0f0f10]",
      "outline-none focus-visible:border-white/30 focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
      className,
    ),
    variants: cardVariants,
    initial: "hidden" as const,
    whileInView: "visible" as const,
    viewport: { once: true, amount: 0.12 },
    transition: { duration: 0.5, delay, ease: EASE_OUT_EXPO },
    "aria-label": ariaLabel,
  };

  if (href) {
    return (
      <motion.a {...shared} href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </motion.a>
    );
  }

  return (
    <motion.div {...shared} role={ariaLabel ? "group" : undefined}>
      {children}
    </motion.div>
  );
}
