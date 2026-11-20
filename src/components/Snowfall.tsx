"use client";

import { useEffect, useRef } from "react";

interface Flake {
  sprite: HTMLCanvasElement;
  size: number;
  x: number;
  y: number;
  speedY: number;
  wind: number;
  flutterAmp: number;
  flutterFreq: number;
  phase: number;
  rotation: number;
  spin: number;
  tumbleFreq: number;
  alpha: number;
}

interface SnowfallProps {
  enabled?: boolean;
}

const MIN_SIZE = 2;
const MAX_SIZE = 10;
const VARIANTS = 4;

function createFlakeSprite(size: number, dpr: number): HTMLCanvasElement {
  const pad = 1.5;
  const dim = Math.ceil((size + pad * 2) * dpr);
  const c = document.createElement("canvas");
  c.width = dim;
  c.height = dim;
  const g = c.getContext("2d");
  if (!g) return c;

  g.scale(dim / (size + pad * 2), dim / (size + pad * 2));
  const center = size / 2 + pad;
  const r = size / 2;

  const lobes = [{ dx: 0, dy: 0, r: r * (size < 4 ? 1 : 0.78) }];
  if (size >= 4) {
    const n = size >= 7 ? 3 + Math.floor(Math.random() * 3) : 2;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = r * (0.3 + Math.random() * 0.25);
      lobes.push({ dx: Math.cos(a) * d, dy: Math.sin(a) * d, r: r * (0.38 + Math.random() * 0.22) });
    }
  }

  for (const l of lobes) {
    const x = center + l.dx;
    const y = center + l.dy;
    const grad = g.createRadialGradient(x, y, 0, x, y, l.r);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.5, "rgba(250,252,255,0.95)");
    grad.addColorStop(0.8, "rgba(244,248,255,0.4)");
    grad.addColorStop(1, "rgba(244,248,255,0)");
    g.fillStyle = grad;
    g.beginPath();
    g.arc(x, y, l.r, 0, Math.PI * 2);
    g.fill();
  }

  return c;
}

export function Snowfall({ enabled = true }: SnowfallProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!enabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let sprites: HTMLCanvasElement[][] = [];
    let flakes: Flake[] = [];
    let rafId = 0;
    let lastTime = performance.now();

    const makeFlake = (spawnInView: boolean): Flake => {
      const z = Math.random() ** 2;
      const size = Math.min(MAX_SIZE, Math.round(MIN_SIZE + z * (MAX_SIZE - MIN_SIZE) + Math.random() * 1.2));
      return {
        sprite: sprites[size - MIN_SIZE][Math.floor(Math.random() * VARIANTS)],
        size,
        x: Math.random() * width * 1.2 - width * 0.2,
        y: spawnInView ? Math.random() * height : -size - Math.random() * 60,
        speedY: 16 + z * 52 + Math.random() * 8,
        wind: 0.35 + z * 0.9,
        flutterAmp: 1.5 + Math.random() * 2.5,
        flutterFreq: 0.6 + Math.random() * 1.1,
        phase: Math.random() * Math.PI * 2,
        rotation: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 1.2,
        tumbleFreq: 0.5 + Math.random() * 1.2,
        alpha: 0.35 + z * 0.6,
      };
    };

    const resize = () => {
      const nextDpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * nextDpr);
      canvas.height = Math.floor(height * nextDpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      if (nextDpr !== dpr || sprites.length === 0) {
        dpr = nextDpr;
        sprites = Array.from({ length: MAX_SIZE - MIN_SIZE + 1 }, (_, i) =>
          Array.from({ length: VARIANTS }, () => createFlakeSprite(MIN_SIZE + i, dpr)),
        );
        flakes = [];
      }

      const count = Math.min(220, Math.max(60, Math.round((width * height) / 9000)));
      while (flakes.length < count) flakes.push(makeFlake(true));
      flakes.length = count;
    };

    resize();

    const tick = (now: number) => {
      rafId = requestAnimationFrame(tick);
      if (document.hidden) return;

      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      const t = now / 1000;

      const breeze = 16 + Math.sin(t * 0.07) * 7 + Math.sin(t * 0.19 + 1.3) * 3;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < flakes.length; i++) {
        let f = flakes[i];
        f.y += f.speedY * dt;
        f.x += breeze * f.wind * dt;
        f.rotation += f.spin * dt;

        if (f.y > height + f.size) f = flakes[i] = makeFlake(false);
        if (f.x > width + 20) f.x -= width + 40;

        const x = f.x + Math.sin(t * f.flutterFreq + f.phase) * f.flutterAmp;
        const half = (f.sprite.width / dpr) / 2;

        ctx.globalAlpha = f.alpha;
        ctx.setTransform(dpr, 0, 0, dpr, x * dpr, f.y * dpr);
        if (f.size >= 4) {
          ctx.rotate(f.rotation);
          ctx.scale(0.82 + 0.18 * Math.cos(t * f.tumbleFreq + f.phase), 1);
        }
        ctx.drawImage(f.sprite, -half, -half, half * 2, half * 2);
      }
    };

    const onVisibility = () => {
      lastTime = performance.now();
    };

    rafId = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled]);

  if (!enabled) return null;

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0" />;
}
