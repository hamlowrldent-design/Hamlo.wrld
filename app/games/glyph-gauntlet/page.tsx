"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type GlyphKind = "true" | "bait";

type Glyph = {
  id: string;
  kind: GlyphKind;
  char: string;
  x: number; // 0..1
  y: number; // 0..1
  r: number; // px
  bornAt: number;
  ttl: number; // ms
  vx: number; // normalized per second
  vy: number;
};

type Summary = {
  score: number;
  hits: number;
  baitHits: number;
  misses: number;
  accuracy: number; // 0..1
  bestStreak: number;
  timeSurvivedMs: number;
};

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function nowMs() {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

function uid() {
  return Math.random().toString(16).slice(2) + "-" + Math.random().toString(16).slice(2);
}

export default function GlyphGauntletPage() {
  const arenaRef = useRef<HTMLDivElement | null>(null);

  // Game state
  const [running, setRunning] = useState(false);
  const [ended, setEnded] = useState(false);

  // Stats
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [baitHits, setBaitHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const [startAt, setStartAt] = useState<number | null>(null);
  const [endAt, setEndAt] = useState<number | null>(null);

  const [glyphs, setGlyphs] = useState<Glyph[]>([]);

  // Tone: glyph sets
  const glyphTrueSet = useMemo(() => "☉☽☿♀♂♃♄♅♆♇♈♉♊♋♌♍♎♏♐♑♒♓".split(""), []);
  const glyphBaitSet = useMemo(() => "0123456789△▽◇◆○●◯◎◐◑◒◓✶✷✸✹✺✦✧".split(""), []);

  const difficulty = useRef(0); // ramps over time
  const rafRef = useRef<number | null>(null);
  const spawnTimerRef = useRef<number | null>(null);

  const summary: Summary | null = useMemo(() => {
    if (!ended || startAt == null || endAt == null) return null;
    const totalClicks = hits + baitHits;
    const accuracy = totalClicks > 0 ? hits / totalClicks : 0;
    return {
      score,
      hits,
      baitHits,
      misses,
      accuracy,
      bestStreak,
      timeSurvivedMs: Math.max(0, endAt - startAt),
    };
  }, [ended, startAt, endAt, score, hits, baitHits, misses, bestStreak]);

  function reset() {
    setRunning(false);
    setEnded(false);
    setScore(0);
    setHits(0);
    setBaitHits(0);
    setMisses(0);
    setStreak(0);
    setBestStreak(0);
    setStartAt(null);
    setEndAt(null);
    setGlyphs([]);
    difficulty.current = 0;
  }

  function stopAllTimers() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (spawnTimerRef.current) window.clearInterval(spawnTimerRef.current);
    spawnTimerRef.current = null;
  }

  function endGame() {
    setRunning(false);
    setEnded(true);
    setEndAt(nowMs());
    stopAllTimers();
  }

  function startGame() {
    reset();
    setRunning(true);
    setStartAt(nowMs());
  }

  // Spawn + animate loop
  useEffect(() => {
    if (!running) return;

    const arena = arenaRef.current;
    if (!arena) return;

    const tick = (t: number) => {
      const elapsed = startAt ? t - startAt : 0;
      difficulty.current = clamp(elapsed / 45000, 0, 1); // ramps over ~45s

      // Move glyphs + expire
      setGlyphs((prev) => {
        const dt = 1 / 60; // approx
        const next: Glyph[] = [];
        for (const g of prev) {
          const age = t - g.bornAt;
          if (age > g.ttl) continue;

          // subtle drift
          let nx = g.x + g.vx * dt;
          let ny = g.y + g.vy * dt;

          // bounce within [0,1]
          if (nx < 0.06 || nx > 0.94) g.vx *= -1;
          if (ny < 0.10 || ny > 0.90) g.vy *= -1;

          nx = clamp(nx, 0.06, 0.94);
          ny = clamp(ny, 0.10, 0.90);

          next.push({ ...g, x: nx, y: ny });
        }

        return next;
      });

      // Miss logic: if too many glyphs expired without being clicked, it “feels” like failing.
      // We approximate misses by limiting max glyph count — if you let it overflow, you accumulate misses.
      setMisses((m) => {
        const maxAllowed = 9 + Math.floor(difficulty.current * 6); // 9..15
        const overflow = Math.max(0, glyphs.length - maxAllowed);
        if (overflow > 0) return m + overflow;
        return m;
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    // Spawn cadence ramps with difficulty
    const spawnEveryMs = () => 820 - Math.floor(difficulty.current * 360); // ~820 -> ~460
    spawnTimerRef.current = window.setInterval(() => {
      setGlyphs((prev) => {
        const d = difficulty.current;

        // spawn 1 or 2 sometimes
        const spawnCount = Math.random() < 0.18 + d * 0.20 ? 2 : 1;

        const next = [...prev];
        for (let i = 0; i < spawnCount; i++) {
          const kind: GlyphKind = Math.random() < 0.62 - d * 0.12 ? "true" : "bait"; // more bait over time
          const char =
            kind === "true"
              ? glyphTrueSet[Math.floor(Math.random() * glyphTrueSet.length)] ?? "☉"
              : glyphBaitSet[Math.floor(Math.random() * glyphBaitSet.length)] ?? "0";

          const ttl = 1500 - Math.floor(d * 500); // 1500 -> 1000
          const r = 20 - Math.floor(d * 6); // 20 -> 14

          // velocity increases with difficulty
          const vBase = 0.12 + d * 0.22;
          const vx = (Math.random() < 0.5 ? -1 : 1) * (vBase * (0.6 + Math.random() * 0.9));
          const vy = (Math.random() < 0.5 ? -1 : 1) * (vBase * (0.6 + Math.random() * 0.9));

          next.push({
            id: uid(),
            kind,
            char,
            x: 0.10 + Math.random() * 0.80,
            y: 0.14 + Math.random() * 0.74,
            r,
            bornAt: nowMs(),
            ttl,
            vx,
            vy,
          });
        }

        // cap total glyphs to avoid DOM explosion
        const cap = 28;
        return next.slice(-cap);
      });

      // re-tune interval dynamically by clearing/restarting (cheap + stable)
      if (spawnTimerRef.current) {
        window.clearInterval(spawnTimerRef.current);
      }
      spawnTimerRef.current = window.setInterval(() => {}, 999999); // placeholder; immediately replaced below
      // Immediately replace with fresh cadence
      if (spawnTimerRef.current) window.clearInterval(spawnTimerRef.current);
      spawnTimerRef.current = window.setInterval(() => {}, 999999);
    }, 680);

    // Better dynamic interval: use a lightweight loop
    let spawnLoopAlive = true;
    const spawnLoop = async () => {
      while (spawnLoopAlive) {
        setGlyphs((prev) => {
          const d = difficulty.current;
          const spawnCount = Math.random() < 0.18 + d * 0.20 ? 2 : 1;
          const next = [...prev];

          for (let i = 0; i < spawnCount; i++) {
            const kind: GlyphKind = Math.random() < 0.62 - d * 0.12 ? "true" : "bait";
            const char =
              kind === "true"
                ? glyphTrueSet[Math.floor(Math.random() * glyphTrueSet.length)] ?? "☉"
                : glyphBaitSet[Math.floor(Math.random() * glyphBaitSet.length)] ?? "0";

            const ttl = 1500 - Math.floor(d * 520);
            const r = 20 - Math.floor(d * 6);

            const vBase = 0.12 + d * 0.22;
            const vx = (Math.random() < 0.5 ? -1 : 1) * (vBase * (0.6 + Math.random() * 0.9));
            const vy = (Math.random() < 0.5 ? -1 : 1) * (vBase * (0.6 + Math.random() * 0.9));

            next.push({
              id: uid(),
              kind,
              char,
              x: 0.10 + Math.random() * 0.80,
              y: 0.14 + Math.random() * 0.74,
              r,
              bornAt: nowMs(),
              ttl,
              vx,
              vy,
            });
          }

          return next.slice(-28);
        });

        const wait = spawnEveryMs();
        await new Promise((r) => setTimeout(r, wait));
      }
    };
    spawnLoop();

    return () => {
      spawnLoopAlive = false;
      stopAllTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  // Failure condition
  useEffect(() => {
    if (!running) return;
    // If you hit bait too many times or miss too many, collapse
    if (baitHits >= 3 || misses >= 12) {
      endGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baitHits, misses, running]);

  function clickGlyph(g: Glyph) {
    if (!running) return;

    setGlyphs((prev) => prev.filter((x) => x.id !== g.id));

    if (g.kind === "true") {
      setHits((h) => h + 1);
      setStreak((s) => {
        const ns = s + 1;
        setBestStreak((b) => Math.max(b, ns));
        return ns;
      });

      // score scales with difficulty and streak
      const d = difficulty.current;
      const base = 10;
      const mult = 1 + d * 1.2 + Math.min(2.5, streak * 0.08);
      setScore((sc) => sc + Math.floor(base * mult));
    } else {
      setBaitHits((b) => b + 1);
      setStreak(0);
      setScore((sc) => Math.max(0, sc - 35));
    }
  }

  function clickMiss() {
    if (!running) return;
    setMisses((m) => m + 1);
    setStreak(0);
  }

  const timeSurvived = useMemo(() => {
    if (!startAt) return 0;
    const end = ended && endAt ? endAt : nowMs();
    return Math.max(0, end - startAt);
  }, [startAt, endAt, ended]);

  const headerTag = ended ? "Chamber Collapsed" : running ? "Trial Live" : "Trial Idle";

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
              {headerTag}
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight">
              Trial I — Glyph Gauntlet
            </h1>
            <p className="mt-3 max-w-2xl text-white/60">
              Click true glyphs. Avoid bait. Stay sharp as the chamber accelerates.
            </p>
          </div>

          <a
            href="/games"
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            Return
          </a>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
          {/* Arena */}
          <div className="rounded-[2rem] border border-white/10 bg-black/35 backdrop-blur">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-4">
              <div className="text-sm text-white/60">Arena</div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-white/50">
                <span>Score: <span className="text-white/80">{score}</span></span>
                <span className="opacity-40">•</span>
                <span>Streak: <span className="text-white/80">{streak}</span></span>
                <span className="opacity-40">•</span>
                <span>Strikes: <span className="text-white/80">{baitHits}/3</span></span>
                <span className="opacity-40">•</span>
                <span>Misses: <span className="text-white/80">{misses}/12</span></span>
              </div>
            </div>

            <div
              ref={arenaRef}
              onClick={clickMiss}
              className="relative h-[420px] w-full overflow-hidden rounded-b-[2rem]"
            >
              {/* subtle vignette */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_420px_at_50%_40%,rgba(255,255,255,0.07),transparent_65%)]" />

              {/* glyphs */}
              {glyphs.map((g) => (
                <button
                  key={g.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    clickGlyph(g);
                  }}
                  className={[
                    "absolute grid place-items-center rounded-full border backdrop-blur",
                    g.kind === "true"
                      ? "border-white/20 bg-white/5 text-white/90 hover:bg-white/10"
                      : "border-white/10 bg-black/40 text-white/40 hover:bg-black/30",
                  ].join(" ")}
                  style={{
                    left: `calc(${(g.x * 100).toFixed(2)}% - ${g.r}px)`,
                    top: `calc(${(g.y * 100).toFixed(2)}% - ${g.r}px)`,
                    width: `${g.r * 2}px`,
                    height: `${g.r * 2}px`,
                    fontSize: `${Math.max(12, Math.floor(g.r * 0.9))}px`,
                  }}
                  aria-label={g.kind === "true" ? "True glyph" : "Bait glyph"}
                >
                  {g.char}
                </button>
              ))}

              {/* overlay state */}
              {!running && !ended ? (
                <div className="absolute inset-0 grid place-items-center px-6">
                  <div className="max-w-md rounded-3xl border border-white/10 bg-black/45 p-6 text-center backdrop-blur">
                    <div className="text-xs uppercase tracking-[0.3em] text-white/40">
                      Initiation
                    </div>
                    <div className="mt-3 text-2xl font-semibold">Enter the Gauntlet</div>
                    <p className="mt-2 text-sm text-white/60">
                      True glyphs reward. Bait glyphs punish. Click empty space counts as a miss.
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startGame();
                      }}
                      className="mt-5 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90"
                    >
                      Start Trial
                    </button>
                  </div>
                </div>
              ) : null}

              {ended && summary ? (
                <div className="absolute inset-0 grid place-items-center px-6">
                  <div className="max-w-md rounded-3xl border border-white/10 bg-black/55 p-6 text-center backdrop-blur">
                    <div className="text-xs uppercase tracking-[0.3em] text-white/40">
                      Collapse Report
                    </div>
                    <div className="mt-3 text-2xl font-semibold">Trial Ended</div>

                    <div className="mt-4 grid gap-2 text-sm text-white/70">
                      <div>Score: <span className="text-white/90 font-semibold">{summary.score}</span></div>
                      <div>
                        Accuracy:{" "}
                        <span className="text-white/90 font-semibold">
                          {(summary.accuracy * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div>Best streak: <span className="text-white/90 font-semibold">{summary.bestStreak}</span></div>
                      <div>Time survived: <span className="text-white/90 font-semibold">{(summary.timeSurvivedMs / 1000).toFixed(1)}s</span></div>
                    </div>

                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startGame();
                        }}
                        className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90"
                      >
                        Retry
                      </button>
                      <a
                        href="/games"
                        className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
                      >
                        Back to Trials
                      </a>
                    </div>

                    <div className="mt-4 text-xs text-white/40">
                      Score saving + global leaderboard comes next.
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* HUD */}
          <div className="rounded-[2rem] border border-white/10 bg-black/35 p-6 backdrop-blur">
            <div className="text-xs uppercase tracking-[0.3em] text-white/40">Rules</div>
            <div className="mt-4 space-y-3 text-sm text-white/70">
              <div>
                <span className="text-white/85 font-semibold">True glyphs</span> increase score and streak.
              </div>
              <div>
                <span className="text-white/85 font-semibold">Bait glyphs</span> cause strikes. 3 strikes = collapse.
              </div>
              <div>
                Clicking empty space counts as a <span className="text-white/85 font-semibold">miss</span>. 12 misses = collapse.
              </div>
              <div>
                The chamber accelerates over time.
              </div>
            </div>

            <div className="mt-8 text-xs uppercase tracking-[0.3em] text-white/40">Status</div>
            <div className="mt-4 grid gap-2 text-sm text-white/70">
              <div>Hits: <span className="text-white/90 font-semibold">{hits}</span></div>
              <div>Bait hits: <span className="text-white/90 font-semibold">{baitHits}</span></div>
              <div>Misses: <span className="text-white/90 font-semibold">{misses}</span></div>
              <div>
                Time:{" "}
                <span className="text-white/90 font-semibold">
                  {(timeSurvived / 1000).toFixed(1)}s
                </span>
              </div>
              <div>
                Best streak: <span className="text-white/90 font-semibold">{bestStreak}</span>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {!running && !ended ? (
                <button
                  onClick={startGame}
                  className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90"
                >
                  Start
                </button>
              ) : null}

              {running ? (
                <button
                  onClick={endGame}
                  className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
                >
                  End Trial
                </button>
              ) : null}

              {ended ? (
                <button
                  onClick={reset}
                  className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
                >
                  Reset
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
