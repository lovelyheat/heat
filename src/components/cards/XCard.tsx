"use client";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Surface } from "@/components/layout/Surface";
import { XIcon } from "@/components/icons";
import { CardLabel, GlideArrow, SafeImg, glideClass, type CardProps } from "./CardPrimitives";

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
              glideClass,
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
