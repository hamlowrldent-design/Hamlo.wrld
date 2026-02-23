"use client";

import React, { useEffect, useMemo, useRef } from "react";

type Column = {
  x: number;
  y: number;
  speed: number;
  size: number;
  drift: number;
};

export default function SignalBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const glyphs = useMemo(() => {
    // Mix: matrix digits + astrological + alchemical + sacred geometry-ish symbols
    const digits = "0123456789";
    const astro = "☉☽☿♀♂♃♄♅♆♇♈♉♊♋♌♍♎♏♐♑♒♓";
    const alchemy = "🜁🜂🜃🜄🜇🜈🜉🜊🜋🜌🜍🜎🜏🜐🜑🜒🜓🜔🜕🜖🜗🜘🜙🜚🜛";
    const geometry = "△▽◇◆○●◯◎◐◑◒◓◔◕◖◗✶✷✸✹✺✦✧✩✪✫✬✭✮✯";
    return (digits + astro + alchemy + geometry).split("");
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;

    const DPR = Math.min(2, window.devicePixelRatio || 1);

    const rand = (min: number, max: number): number =>
      min + Math.random() * (max - min);

    let columns: Column[] = [];
    let raf = 0;
    let last = performance.now();

    const resize = () => {
      w = Math.floor(window.innerWidth);
      h = Math.floor(window.innerHeight);
      canvas.width = Math.floor(w * DPR);
      canvas.height = Math.floor(h * DPR);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

      const colWidth = Math.max(14, Math.floor(w / 90));
      const count = Math.floor(w / colWidth);

      columns = new Array(count).fill(0).map((_, i) => ({
        x: i * colWidth + rand(-4, 4),
        y: rand(-h, h),
        speed: rand(30, 120), // pixels/sec
        size: rand(12, 18),
        drift: rand(-10, 10), // horizontal drift over time
      }));
    };

    const pickGlyph = (): string => glyphs[Math.floor(Math.random() * glyphs.length)] ?? "0";

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      // Gentle fade so trails remain
      ctx.fillStyle = "rgba(0,0,0,0.10)";
      ctx.fillRect(0, 0, w, h);

      // Time-based tint shift (subtle)
      const t = now * 0.00008;
      const glow = 0.35 + 0.15 * Math.sin(t * 3.1);
      const hue = 180 + 40 * Math.sin(t * 1.7); // cyan->violet-ish range

      ctx.textBaseline = "top";
      ctx.font = "16px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";

      for (const c of columns) {
        c.y += c.speed * dt;

        // Slow “cosmic drift”
        c.x += c.drift * dt * 0.15;

        // Wrap
        if (c.y > h + 40) {
          c.y = rand(-h * 0.5, -40);
          c.speed = rand(30, 120);
          c.size = rand(12, 18);
          c.drift = rand(-10, 10);
        }

        // Head glyph (brighter)
        const head = pickGlyph();
        ctx.font = `${Math.floor(c.size + 2)}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
        ctx.fillStyle = `hsla(${hue}, 85%, 75%, ${0.45 + glow})`;
        ctx.fillText(head, c.x, c.y);

        // Tail glyphs (dimmer)
        ctx.font = `${Math.floor(c.size)}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
        ctx.fillStyle = `hsla(${hue}, 90%, 55%, ${0.10 + glow * 0.35})`;
        for (let k = 1; k <= 10; k++) {
          const g = pickGlyph();
          ctx.fillText(g, c.x, c.y - k * (c.size + 6));
        }
      }

      raf = requestAnimationFrame(draw);
    };

    // Init
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 1, 1);
    resize();
    raf = requestAnimationFrame(draw);

    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, [glyphs]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <canvas ref={canvasRef} className="h-full w-full" />
      {/* Soft vignette + subtle overlay to keep it dark */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70" />
      <div className="absolute inset-0 [mask-image:radial-gradient(closest-side,transparent,black)] bg-black/40" />
    </div>
  );
}
