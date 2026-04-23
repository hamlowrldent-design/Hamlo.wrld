"use client";

import { STREAM_MEMBERS, type StreamMember, type Platform } from "@/lib/streamers";
import React, { useMemo, useState } from "react";

type LayoutMode = "auto" | "focus-1" | "focus-2" | "focus-3" | "quad";

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function StatusDot({ live }: { live: boolean }) {
  return (
    <span
      className={classNames(
        "inline-block h-3 w-3 rounded-full ring-4",
        live
          ? "bg-emerald-400 ring-emerald-400/20 shadow-[0_0_18px_rgba(74,222,128,0.75)]"
          : "bg-red-400 ring-red-400/20 shadow-[0_0_16px_rgba(248,113,113,0.45)]"
      )}
    />
  );
}

function PlatformPill({ platform }: { platform: Platform }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-white/55">
      {platform}
    </span>
  );
}

function StreamCard({
  streamer,
  selected,
  onSelect,
  onFocus,
  featured = false,
}: {
  streamer: StreamMember;
  selected?: boolean;
  onSelect?: () => void;
  onFocus?: () => void;
  featured?: boolean;
}) {
  return (
    <div
      className={classNames(
        "group relative overflow-hidden rounded-[2rem] border bg-black/35 backdrop-blur transition",
        selected ? "border-white/25" : "border-white/10",
        featured ? "p-6" : "p-5"
      )}
    >
      <div
        className={classNames(
          "absolute inset-0 bg-gradient-to-br opacity-70",
          streamer.color
        )}
      />
      <div className="absolute inset-0 bg-[radial-gradient(500px_220px_at_20%_10%,rgba(255,255,255,0.14),transparent_55%)]" />
      <div className="relative z-10 flex h-full flex-col justify-between gap-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <StatusDot live={streamer.live} />
              <div className="text-xs uppercase tracking-[0.3em] text-white/45">
                {streamer.live ? "Active Signal" : "Dormant"}
              </div>
            </div>
            <div
              className={classNames(
                "mt-4 font-semibold text-white",
                featured ? "text-3xl" : "text-xl"
              )}
            >
              {streamer.name}
            </div>
            <div className="mt-1 text-sm text-white/55">{streamer.handle}</div>
          </div>
          <PlatformPill platform={streamer.platform} />
        </div>

        <div>
          <div className={classNames("text-white/80", featured ? "text-base" : "text-sm")}>
            {streamer.title}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {onSelect ? (
              <button
                onClick={onSelect}
                className={classNames(
                  "rounded-full border px-4 py-2 text-xs font-semibold transition",
                  selected
                    ? "border-white/20 bg-white/15 text-white"
                    : "border-white/10 bg-black/30 text-white/70 hover:bg-white/10"
                )}
              >
                {selected ? "Selected" : "Select"}
              </button>
            ) : null}

            {onFocus ? (
              <button
                onClick={onFocus}
                className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs font-semibold text-white/70 hover:bg-white/10"
              >
                Focus
              </button>
            ) : null}

            <a
              href={streamer.channelUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs font-semibold text-white/70 hover:bg-white/10"
            >
              Open Channel
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeedPane({
  streamer,
  large = false,
}: {
  streamer: StreamMember;
  large?: boolean;
}) {
  const parents = ["localhost", "hamlowrld.com", "www.hamlowrld.com"];
  const parentQuery = parents.map((p) => `parent=${encodeURIComponent(p)}`).join("&");

  const twitchSrc = `https://player.twitch.tv/?channel=${encodeURIComponent(
    streamer.channelName
  )}&${parentQuery}&muted=true`;

  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/40 backdrop-blur">
      <div
        className={classNames(
          "absolute inset-0 bg-gradient-to-br opacity-40",
          streamer.color
        )}
      />
      <div className="absolute inset-0 bg-black/20" />

      <div
        className={classNames(
          "relative z-10 flex h-full flex-col justify-between",
          large ? "min-h-[420px] p-4" : "min-h-[240px] p-4"
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <StatusDot live={streamer.live} />
            <div>
              <div
                className={classNames(
                  "font-semibold text-white",
                  large ? "text-2xl" : "text-lg"
                )}
              >
                {streamer.name}
              </div>
              <div className="text-sm text-white/55">{streamer.handle}</div>
            </div>
          </div>
          <PlatformPill platform={streamer.platform} />
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-black/30 p-3">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs uppercase tracking-[0.25em] text-white/40">
              Live Feed
            </div>
            <a
              href={streamer.channelUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-white/55 hover:text-white"
            >
              Open on Twitch →
            </a>
          </div>

          <div
            className={classNames(
              "overflow-hidden rounded-[1.25rem] border border-white/10 bg-black/30",
              large ? "aspect-video" : "aspect-[16/10]"
            )}
          >
            {streamer.platform === "Twitch" ? (
              <iframe
                src={twitchSrc}
                height="100%"
                width="100%"
                allowFullScreen
                scrolling="no"
                className="h-full w-full"
                title={`${streamer.name} Twitch Stream`}
              />
            ) : (
              <div className="grid h-full w-full place-items-center text-sm text-white/50">
                Unsupported platform embed
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BroadcastWall({
  feeds,
  mode,
}: {
  feeds: StreamMember[];
  mode: LayoutMode;
}) {
  const count = feeds.length;

  if (count === 0) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-black/30 p-8 text-white/50 backdrop-blur">
        No active feeds.
      </div>
    );
  }

  if (mode === "focus-1" || (mode === "auto" && count === 1)) {
    return <FeedPane streamer={feeds[0]} large />;
  }

  if (mode === "focus-2" || (mode === "auto" && count === 2)) {
    const visible = feeds.slice(0, 2);
    return (
      <div className="grid gap-5 md:grid-cols-2">
        {visible.map((f) => (
          <FeedPane key={f.id} streamer={f} large />
        ))}
      </div>
    );
  }

  if (mode === "focus-3" || (mode === "auto" && count === 3)) {
    const visible = feeds.slice(0, 3);
    return (
      <div className="grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
        <FeedPane streamer={visible[0]} large />
        <div className="grid gap-5">
          {visible.slice(1).map((f) => (
            <FeedPane key={f.id} streamer={f} />
          ))}
        </div>
      </div>
    );
  }

  if (mode === "quad" || (mode === "auto" && count === 4)) {
    const visible = feeds.slice(0, 4);
    return (
      <div className="grid gap-5 md:grid-cols-2">
        {visible.map((f) => (
          <FeedPane key={f.id} streamer={f} />
        ))}
      </div>
    );
  }

  const visible = feeds.slice(0, 5);
  return (
    <div className="grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
      <FeedPane streamer={visible[0]} large />
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-1">
        {visible.slice(1, 5).map((f) => (
          <FeedPane key={f.id} streamer={f} />
        ))}
      </div>
    </div>
  );
}

export default function ControlRoomPage() {
  const [streamers, setStreamers] = useState<StreamMember[]>(STREAM_MEMBERS);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("auto");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [focusedId, setFocusedId] = useState<string>("hamlo");

  const active = useMemo(() => streamers.filter((s) => s.live), [streamers]);
  const dormant = useMemo(() => streamers.filter((s) => !s.live), [streamers]);

  const activeIds = new Set(active.map((s) => s.id));

  const cleanedSelectedIds = selectedIds.filter((id) => activeIds.has(id));

  const selectedFeeds = cleanedSelectedIds
    .map((id) => active.find((s) => s.id === id))
    .filter(Boolean) as StreamMember[];

  const autoFeeds = useMemo(() => {
    const focus = active.find((s) => s.id === focusedId);
    const rest = active.filter((s) => s.id !== focusedId);
    return focus ? [focus, ...rest] : active;
  }, [active, focusedId]);

  const visibleFeeds =
    layoutMode === "auto"
      ? autoFeeds
      : selectedFeeds.length > 0
      ? selectedFeeds
      : autoFeeds;

  function toggleLive(id: string) {
    setStreamers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, live: !s.live } : s))
    );

    setSelectedIds((prev) => prev.filter((x) => x !== id));
  }

  function toggleSelected(id: string) {
    const streamer = streamers.find((s) => s.id === id);
    if (!streamer || !streamer.live) return;

    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);

      const next = [...prev, id];
      const limit =
        layoutMode === "focus-1"
          ? 1
          : layoutMode === "focus-2"
          ? 2
          : layoutMode === "focus-3"
          ? 3
          : layoutMode === "quad"
          ? 4
          : 5;

      return next.slice(-limit);
    });
  }

  function setMode(mode: LayoutMode) {
    setLayoutMode(mode);

    if (mode === "auto") return;

    const limit =
      mode === "focus-1"
        ? 1
        : mode === "focus-2"
        ? 2
        : mode === "focus-3"
        ? 3
        : mode === "quad"
        ? 4
        : 5;

    setSelectedIds((prev) => prev.slice(0, limit));
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_20%_10%,rgba(255,255,255,0.08),transparent_60%),radial-gradient(900px_600px_at_80%_30%,rgba(255,255,255,0.05),transparent_65%),radial-gradient(1000px_700px_at_50%_90%,rgba(255,255,255,0.06),transparent_70%)] blur-2xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/55 to-neutral-950" />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.25em] text-white/50">
              Control Room
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-6xl">
              One Room. Multiple Signals.
            </h1>
            <p className="mt-4 max-w-3xl text-white/60">
              View multiple live perspectives at once. The wall reshapes itself by who is on,
              and viewers can override the layout to build their own best perspective.
            </p>
          </div>

          <a
            href="/"
            className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
          >
            Return
          </a>
        </div>

        <section className="mt-10 rounded-[2rem] border border-white/10 bg-black/30 p-5 backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-white/40">
                Layout Brain
              </div>
              <div className="mt-2 text-sm text-white/55">
                Auto adapts to who is live. Override it with manual viewer focus.
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {[
                { id: "auto", label: "Auto" },
                { id: "focus-1", label: "Focus 1" },
                { id: "focus-2", label: "Split 2" },
                { id: "focus-3", label: "Tri 3" },
                { id: "quad", label: "Quad" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id as LayoutMode)}
                  className={classNames(
                    "rounded-full border px-4 py-2 text-sm font-semibold transition",
                    layoutMode === m.id
                      ? "border-white/20 bg-white/15 text-white"
                      : "border-white/10 bg-black/30 text-white/70 hover:bg-white/10"
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-xs uppercase tracking-[0.3em] text-white/40">
              Broadcast Wall
            </div>
            <div className="text-sm text-white/50">
              {active.length} active • {visibleFeeds.length} visible
            </div>
          </div>

          <BroadcastWall feeds={visibleFeeds} mode={layoutMode} />
        </section>

        <section className="mt-14">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-xs uppercase tracking-[0.3em] text-white/40">
              Active Signals
            </div>
            <div className="text-sm text-white/50">
              click to focus or select
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {active.map((s) => (
              <StreamCard
                key={s.id}
                streamer={s}
                selected={cleanedSelectedIds.includes(s.id)}
                onSelect={() => toggleSelected(s.id)}
                onFocus={() => setFocusedId(s.id)}
              />
            ))}
          </div>
        </section>

        <section className="mt-14">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-xs uppercase tracking-[0.3em] text-white/40">
              Dormant Bank
            </div>
            <div className="text-sm text-white/50">
              {dormant.length} offline
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {dormant.map((s) => (
              <StreamCard
                key={s.id}
                streamer={s}
                onFocus={() => toggleLive(s.id)}
              />
            ))}
          </div>
        </section>

        <section className="mt-14 rounded-[2rem] border border-white/10 bg-black/30 p-6 backdrop-blur">
          <div className="text-xs uppercase tracking-[0.3em] text-white/40">
            Prototype Controls
          </div>
          <p className="mt-3 max-w-3xl text-sm text-white/55">
            Click dormant people to activate them. In manual modes, use Select to build your own
            wall. In auto mode, the room reshapes itself around whoever is live and focused.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            {streamers.map((s) => (
              <button
                key={s.id}
                onClick={() => toggleLive(s.id)}
                className={classNames(
                  "rounded-full border px-4 py-2 text-sm font-semibold transition",
                  s.live
                    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"
                    : "border-red-400/20 bg-red-400/10 text-red-100/80"
                )}
              >
                {s.live ? "Deactivate" : "Activate"} {s.name}
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
