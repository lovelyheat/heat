"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export interface CardProps {
  delay?: number;
}

export const metaClass = "font-mono text-[13px] tabular-nums text-zinc-400";
export const glideClass = "transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]";

export function CardLabel({ icon, name }: { icon: React.ReactNode; name: string }) {
  return (
    <span className="flex items-center gap-2.5 text-[15px] font-medium text-zinc-200">
      {icon}
      {name}
    </span>
  );
}

export function GlideArrow() {
  return (
    <span aria-hidden="true" className="relative flex size-5 items-center justify-center overflow-hidden text-zinc-600 transition-colors duration-300 group-hover:text-white">
      <ArrowUpRight className={cn("h-3.5 w-3.5 group-hover:-translate-y-5 group-hover:translate-x-5", glideClass)} />
      <ArrowUpRight className={cn("absolute h-3.5 w-3.5 -translate-x-5 translate-y-5 group-hover:translate-x-0 group-hover:translate-y-0", glideClass)} />
    </span>
  );
}

export function HeaderLink({ href, label, tip }: { href: string; label: string; tip: string }) {
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

export function SafeImg({
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

export function EqBars() {
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
