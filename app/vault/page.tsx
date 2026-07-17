"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type VaultTrack = {
  title: string;
  subtitle: string;
  src: string;
  note: string;
  tag: string;
};

type CollectionKey = "vault" | "bandlab";

const VAULT_TRACKS: VaultTrack[] = [
  {
    title: "See The Fire",
    subtitle: "kaine monni anime",
    src: "/audio/kaine-monni-anime.wav",
    note: "Cinematic, emotional, and built for the first public archive pass.",
    tag: "Vault Master",
  },
  {
    title: "80's Pop",
    subtitle: "retro glow",
    src: "/audio/80s-pop.wav",
    note: "Bright, nostalgic energy for the archive and future public rollout.",
    tag: "Vault Master",
  },
  {
    title: "We Smoke Our Weed",
    subtitle: "late-night drift",
    src: "/audio/we-smoke-our-weed.wav",
    note: "Floating, loose, and meant to sit deep in the catalog later.",
    tag: "Vault Master",
  },
  {
    title: "Right Plan",
    subtitle: "forward motion",
    src: "/audio/right-plan.wav",
    note: "Focused motion track. Good candidate for catalog rotation later.",
    tag: "Vault Master",
  },
  {
    title: "Wont Say",
    subtitle: "quiet pressure",
    src: "/audio/wont-say.wav",
    note: "Minimal and moody. Keep here now, move to catalog when ready.",
    tag: "Vault Master",
  },
];

const BANDLAB_TRACKS: VaultTrack[] = [
  {
    title: "Questions",
    subtitle: "featured Bandlab cut",
    src: "/audio/library/bandlab/featured/questions.mp3",
    note: "A featured Bandlab track for the public-facing vault shortlist.",
    tag: "Featured",
  },
  {
    title: "Leanin",
    subtitle: "featured Bandlab cut",
    src: "/audio/library/bandlab/featured/leanin.mp3",
    note: "A second featured cut kept light and ready for rotation.",
    tag: "Featured",
  },
  {
    title: "Without U",
    subtitle: "featured Bandlab cut",
    src: "/audio/library/bandlab/featured/without-u.mp3",
    note: "A featured entry for the smaller curated Bandlab vault set.",
    tag: "Featured",
  },
  {
    title: "Growth",
    subtitle: "featured Bandlab cut",
    src: "/audio/library/bandlab/featured/growth.mp3",
    note: "A featured cut from the Bandlab archive batch.",
    tag: "Featured",
  },
  {
    title: "Cita",
    subtitle: "featured Bandlab cut",
    src: "/audio/library/bandlab/featured/cita.mp3",
    note: "A featured cut from the Bandlab archive batch.",
    tag: "Featured",
  },
  {
    title: "Storytime",
    subtitle: "featured Bandlab cut",
    src: "/audio/library/bandlab/featured/storytime.mp3",
    note: "A featured cut from the Bandlab archive batch.",
    tag: "Featured",
  },
  {
    title: "Speed Fast",
    subtitle: "featured Bandlab cut",
    src: "/audio/library/bandlab/featured/speed-fast.mp3",
    note: "A featured cut from the Bandlab archive batch.",
    tag: "Featured",
  },
  {
    title: "Stack It Up",
    subtitle: "featured Bandlab cut",
    src: "/audio/library/bandlab/featured/stack-it-up.mp3",
    note: "A featured cut from the Bandlab archive batch.",
    tag: "Featured",
  },
];

const VAULT_ROTATION_START = new Date("2026-07-01T00:00:00");
const VAULT_CODES = ["Frosty", "Glacier", "Thaw", "Aurora"];

function getSeasonalVaultCode(now = new Date()) {
  const monthsSinceStart =
    (now.getFullYear() - VAULT_ROTATION_START.getFullYear()) * 12 +
    (now.getMonth() - VAULT_ROTATION_START.getMonth());

  const rotationStep = Math.floor(monthsSinceStart / 3);
  const idx =
    ((rotationStep % VAULT_CODES.length) + VAULT_CODES.length) %
    VAULT_CODES.length;

  return VAULT_CODES[idx];
}

function shuffleIndices(length: number) {
  const arr = Array.from({ length }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
}

export default function VaultPage() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const autoPlayRef = useRef(false);

  const [mounted, setMounted] = useState(false);
  const [vaultCode, setVaultCode] = useState("Frosty");
  const [entryCode, setEntryCode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [collection, setCollection] = useState<CollectionKey>("vault");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [isScrubbing, setIsScrubbing] = useState(false);

  const currentTracks = collection === "vault" ? VAULT_TRACKS : BANDLAB_TRACKS;
  const activeTrack = useMemo(
    () => currentTracks[activeIndex] ?? currentTracks[0],
    [activeIndex, currentTracks]
  );

  const queue = useMemo(
    () =>
      shuffle
        ? shuffleIndices(currentTracks.length)
        : currentTracks.map((_, i) => i),
    [shuffle, currentTracks.length]
  );

  useEffect(() => {
    setMounted(true);
    setVaultCode(getSeasonalVaultCode(new Date()));
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const saved = window.localStorage.getItem("hamlo-vault-unlocked");
    if (saved && saved.toLowerCase() === vaultCode.toLowerCase()) {
      setUnlocked(true);
    }
  }, [mounted, vaultCode]);

  useEffect(() => {
    setActiveIndex(0);
    setProgress(0);
    setDuration(0);
    setIsPlaying(false);
    autoPlayRef.current = false;

    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.load();
    }
  }, [collection]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const shouldResume = autoPlayRef.current;

    audio.pause();
    audio.currentTime = 0;
    setProgress(0);
    setDuration(0);
    setIsPlaying(false);
    audio.load();

    if (!shouldResume) return;

    const onCanPlay = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    };

    audio.addEventListener("canplay", onCanPlay, { once: true });

    return () => {
      audio.removeEventListener("canplay", onCanPlay);
    };
  }, [activeTrack.src]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      if (!isScrubbing) {
        setProgress(audio.currentTime);
      }
    };

    const onLoadedMetadata = () => setDuration(audio.duration || 0);

    const onEnded = () => {
      if (!autoAdvance) {
        autoPlayRef.current = false;
        setIsPlaying(false);
        return;
      }

      autoPlayRef.current = true;
      setActiveIndex((current) => {
        const position = queue.indexOf(current);
        const nextPosition = (position + 1) % queue.length;
        return queue[nextPosition];
      });
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [autoAdvance, queue, isScrubbing]);

  const unlockVault = () => {
    const clean = entryCode.trim();
    if (!clean) return;

    if (clean.toLowerCase() === vaultCode.toLowerCase()) {
      window.localStorage.setItem("hamlo-vault-unlocked", vaultCode);
      setUnlocked(true);
      setEntryCode("");
    }
  };

  const relockVault = () => {
    window.localStorage.removeItem("hamlo-vault-unlocked");
    setUnlocked(false);
    setEntryCode("");
    setIsPlaying(false);
    autoPlayRef.current = false;
  };

  const playPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      autoPlayRef.current = false;
      return;
    }

    try {
      autoPlayRef.current = true;
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const seek = (value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setProgress(value);
  };

  const nextTrack = () => {
    autoPlayRef.current = isPlaying;
    setActiveIndex((current) => {
      const position = queue.indexOf(current);
      const nextPosition = (position + 1) % queue.length;
      return queue[nextPosition];
    });
  };

  const prevTrack = () => {
    autoPlayRef.current = isPlaying;
    setActiveIndex((current) => {
      const position = queue.indexOf(current);
      const prevPosition = (position - 1 + queue.length) % queue.length;
      return queue[prevPosition];
    });
  };

  const selectTrack = (index: number) => {
    autoPlayRef.current = isPlaying;
    setActiveIndex(index);
  };

  if (!mounted) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white">
        <div className="mx-auto flex min-h-screen max-w-5xl items-center px-6 py-14">
          <div className="w-full rounded-[2rem] border border-white/10 bg-black/35 p-8 backdrop-blur-xl md:p-12">
            <div className="text-xs uppercase tracking-[0.35em] text-white/40">
              Hamlo.wrld Vault
            </div>
            <h1 className="mt-4 text-5xl font-semibold tracking-tight md:text-7xl">
              Vault
            </h1>
          </div>
        </div>
      </main>
    );
  }

  if (!unlocked) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white">
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_20%_10%,rgba(255,255,255,0.08),transparent_55%),radial-gradient(700px_500px_at_80%_20%,rgba(255,255,255,0.05),transparent_60%),radial-gradient(900px_700px_at_50%_95%,rgba(255,255,255,0.05),transparent_70%)] blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-neutral-950" />
        </div>

        <div className="mx-auto flex min-h-screen max-w-5xl items-center px-6 py-14">
          <div className="w-full rounded-[2rem] border border-white/10 bg-black/35 p-8 backdrop-blur-xl md:p-12">
            <div className="text-xs uppercase tracking-[0.35em] text-white/40">
              Hamlo.wrld Vault
            </div>
            <h1 className="mt-4 text-5xl font-semibold tracking-tight md:text-7xl">
              Locked Archive
            </h1>
            <p className="mt-4 max-w-2xl text-white/60">
              Enter the seasonal vault code to access the private listening room.
            </p>

            <div className="mt-8 max-w-md">
              <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-white/40">
                Vault Code
              </label>
              <input
                value={entryCode}
                onChange={(e) => setEntryCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") unlockVault();
                }}
                placeholder="enter the code"
                className="w-full rounded-[1.25rem] border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30"
              />
              <button
                onClick={unlockVault}
                className="mt-4 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-white/90"
              >
                Enter Vault
              </button>
            </div>

            <div className="mt-6 text-sm text-white/45">
              Seasonal code rotates every few seasons. Current rotation slot is active
              for trusted users.
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_20%_10%,rgba(255,255,255,0.08),transparent_55%),radial-gradient(700px_500px_at_80%_20%,rgba(255,255,255,0.05),transparent_60%),radial-gradient(900px_700px_at_50%_95%,rgba(255,255,255,0.05),transparent_70%)] blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-neutral-950" />
      </div>

      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.35em] text-white/40">
              Hamlo.wrld Vault
            </div>
            <h1 className="mt-4 text-5xl font-semibold tracking-tight md:text-7xl">
              Vault
            </h1>
            <p className="mt-4 max-w-3xl text-white/60">
              A private listening archive for the first songs. These tracks stay here
              for now and can move into the public catalog later.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
            >
              Home
            </Link>
            <Link
              href="/catalog"
              className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
            >
              Catalog
            </Link>
            <Link
              href="/music"
              className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
            >
              Music
            </Link>
            <button
              onClick={relockVault}
              className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
            >
              Relock
            </button>
          </div>
        </div>

        <section className="mt-6 rounded-[2rem] border border-white/10 bg-black/35 p-5 backdrop-blur-xl">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setCollection("vault")}
              className={`rounded-full px-5 py-3 text-sm font-semibold ${
                collection === "vault"
                  ? "bg-white text-black"
                  : "border border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
              }`}
            >
              Vault Archive
            </button>
            <button
              onClick={() => setCollection("bandlab")}
              className={`rounded-full px-5 py-3 text-sm font-semibold ${
                collection === "bandlab"
                  ? "bg-white text-black"
                  : "border border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
              }`}
            >
              Bandlab Featured
            </button>
          </div>
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
          <div className="rounded-[2rem] border border-white/10 bg-black/35 p-6 backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.25em] text-white/40">
                  Now Playing
                </div>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                  {activeTrack.title}
                </h2>
                <div className="mt-2 text-white/55">{activeTrack.subtitle}</div>
              </div>

              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.25em] text-white/60">
                {activeTrack.tag}
              </div>
            </div>

            <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-black/45 p-5">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={prevTrack}
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10"
                >
                  Prev
                </button>
                <button
                  onClick={playPause}
                  className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-white/90"
                >
                  {isPlaying ? "Pause" : "Play"}
                </button>
                <button
                  onClick={nextTrack}
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10"
                >
                  Next
                </button>

                <label className="ml-auto flex items-center gap-2 text-sm text-white/60">
                  <input
                    type="checkbox"
                    checked={shuffle}
                    onChange={(e) => setShuffle(e.target.checked)}
                  />
                  Shuffle
                </label>

                <label className="flex items-center gap-2 text-sm text-white/60">
                  <input
                    type="checkbox"
                    checked={autoAdvance}
                    onChange={(e) => setAutoAdvance(e.target.checked)}
                  />
                  Auto-next
                </label>

                <div className="w-full text-sm text-white/50 md:w-auto">
                  {formatTime(progress)} / {formatTime(duration)}
                </div>
              </div>

              <div className="mt-5">
                <input
                  type="range"
                  min={0}
                  max={Math.max(duration, 0)}
                  step="0.01"
                  value={progress}
                  onPointerDown={() => setIsScrubbing(true)}
                  onPointerUp={() => setIsScrubbing(false)}
                  onTouchStart={() => setIsScrubbing(true)}
                  onTouchEnd={() => setIsScrubbing(false)}
                  onInput={(e) => {
                    const value = Number((e.target as HTMLInputElement).value);
                    const audio = audioRef.current;
                    if (audio) audio.currentTime = value;
                    setProgress(value);
                  }}
                  onChange={(e) => {
                    const value = Number((e.target as HTMLInputElement).value);
                    const audio = audioRef.current;
                    if (audio) audio.currentTime = value;
                    setProgress(value);
                  }}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10"
                />
              </div>

              <div className="mt-4 text-sm text-white/45">
                This vault version plays the WAV and MP3 files from the public audio folder.
              </div>

              <audio ref={audioRef} src={activeTrack.src} preload="metadata" />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {currentTracks.map((track, index) => {
                const selected = index === activeIndex;
                return (
                  <button
                    key={track.src}
                    onClick={() => selectTrack(index)}
                    className={`rounded-[1.5rem] border p-4 text-left transition ${
                      selected
                        ? "border-white/25 bg-white/10"
                        : "border-white/10 bg-black/30 hover:bg-white/5"
                    }`}
                  >
                    <div className="text-xs uppercase tracking-[0.25em] text-white/40">
                      Track {index + 1}
                    </div>
                    <div className="mt-2 text-lg font-semibold text-white">
                      {track.title}
                    </div>
                    <div className="mt-1 text-sm text-white/55">{track.subtitle}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-black/35 p-6 backdrop-blur-xl">
            <div className="text-xs uppercase tracking-[0.25em] text-white/40">
              Vault Notes
            </div>

            <div className="mt-5 space-y-4 text-sm leading-6 text-white/60">
              <p>
                This is the private archive home. Songs live here first before they
                graduate into the public catalog.
              </p>
              <p>
                Later, we can add cover art, lyrics, credits, and a more illustrated
                release presentation.
              </p>
              <p>
                For now, the listening experience stays clean and focused.
              </p>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-black/30 p-4">
              <div className="text-xs uppercase tracking-[0.25em] text-white/40">
                Current File
              </div>
              <div className="mt-2 break-all text-sm text-white/65">
                {activeTrack.src}
              </div>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-black/30 p-4">
              <div className="text-xs uppercase tracking-[0.25em] text-white/40">
                Seasonal Vault Code
              </div>
              <div className="mt-2 text-sm text-white/60">
                Rotation is active for trusted users. Current slot is seasonal.
              </div>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-black/30 p-4">
              <div className="text-xs uppercase tracking-[0.25em] text-white/40">
                Public Move Later
              </div>
              <div className="mt-2 text-sm text-white/60">
                Use Catalog later for featured releases. The Vault is the staging room.
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
