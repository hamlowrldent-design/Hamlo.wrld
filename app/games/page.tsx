"use client";

import React from "react";
import { motion } from "framer-motion";
import { Swords, Trophy, ExternalLink } from "lucide-react";

type Trial = {
  id: string;
  title: string;
  subtitle: string;
  status: "Live" | "Prototype" | "Coming";
  href: string;
};

const TRIALS: Trial[] = [
{
    id: "trial-glyph",
    title: "Trial I — Glyph Gauntlet",
    subtitle: "Accuracy + survival. Hit true glyphs. Avoid bait.",
    status: "Live",
    href: "/games/glyph-gauntlet",
  },
  {
    id: "trial-01",
    title: "Trial I — Reflex",
    subtitle: "Timing & precision under pressure.",
    status: "Prototype",
    href: "/games/reflex",
  },
  {
    id: "trial-02",
    title: "Trial II — Endurance",
    subtitle: "Hold the line as the signal degrades.",
    status: "Coming",
    href: "#",
  },
  {
    id: "trial-03",
    title: "Trial III — Duel",
    subtitle: "Competitive skill test (multiplayer later).",
    status: "Coming",
    href: "#",
  },
];

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export default function GamesPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_70%_25%,rgba(255,255,255,0.08),transparent_60%),radial-gradient(900px_600px_at_20%_60%,rgba(255,255,255,0.05),transparent_65%)] blur-2xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-neutral-950" />
      </div>

      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
              <Swords className="h-3.5 w-3.5" />
              Trials
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight">
              Chambers of Skill
            </h1>
            <p className="mt-3 max-w-2xl text-white/60">
              Competitive tests inside the Hamlo.wrld universe. Open to everyone.
              Built in-house for full control.
            </p>
          </div>

          <a
            href="/"
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            Return
          </a>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {TRIALS.map((t) => {
            const disabled = t.href === "#";
            return (
              <motion.a
                key={t.id}
                whileHover={disabled ? undefined : { y: -6 }}
                className={classNames(
                  "rounded-3xl border border-white/10 bg-black/35 p-6 backdrop-blur transition",
                  disabled ? "opacity-60 cursor-not-allowed" : "hover:bg-black/30"
                )}
                href={disabled ? undefined : t.href}
                onClick={(e) => {
                  if (disabled) e.preventDefault();
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="text-xs uppercase tracking-[0.3em] text-white/40">
                    {t.status}
                  </div>
                  <div className="inline-flex items-center gap-2 text-xs text-white/50">
                    <Trophy className="h-4 w-4" />
                    Leaderboards (soon)
                  </div>
                </div>

                <div className="mt-4 text-xl font-semibold text-white">
                  {t.title}
                </div>
                <div className="mt-2 text-sm text-white/60">{t.subtitle}</div>

                <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white/80">
                  Enter <ExternalLink className="h-4 w-4 opacity-70" />
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </main>
  );
}
