"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@/config/site";
import type { FilmEntry } from "@/types";
import { cn } from "@/lib/utils";
import { Surface } from "@/components/layout/Surface";
import { LetterboxdIcon } from "@/components/icons";
import { CardLabel, HeaderLink, SafeImg, glideClass, metaClass, type CardProps } from "./CardPrimitives";

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
          className={cn("size-full object-cover group-hover/film:scale-[1.04]", glideClass)}
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
            <span className={metaClass}>{filmsLogged !== null ? `${filmsLogged} films` : "recent"}</span>
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
