"use client";

import Link from "next/link";
import { STREAM_MEMBERS, type StreamMember, type Platform } from "@/lib/streamers";
import { useEffect, useMemo, useRef, useState } from "react";

type LayoutMode = "auto" | "focus-1" | "focus-2" | "focus-3" | "quad";

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function StatusDot({ live }: { live: boolean }) {
  return (
    <span
      className={classNames(
        "relative inline-flex h-3 w-3 rounded-full",
        live ? "bg-emerald-400" : "bg-red-400"
      )}
    >
      <span
        className={classNames(
          "absolute inset-0 rounded-full animate-ping",
          live ? "bg-emerald-400/60" : "bg-red-400/50"
        )}
      />
    </span>
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
        "group relative overflow-hidden rounded-[2rem] border bg-black/35 backdrop-blur-xl transition duration-300",
        selected ? "border-white/25 shadow-[0_0_30px_rgba(255,255,255,0.06)]" : "border-white/10",
        featured ? "p-6" : "p-5"
      )}
    >
      <div className={classNames("absolute inset-0 bg-gradient-to-br opacity-70", streamer.color)} />
      <div className="absolute inset-0 bg-[radial-gradient(700px_260px_at_20%_0%,rgba(255,255,255,0.12),transparent_55%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.05),transparent_20%,transparent_80%,rgba(255,255,255,0.03))]" />
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
type StreamChatMessage = {
  id: string;
  streamerId: string;
  authorName: string;
  text: string;
  createdAtMs: number;
};

type StreamChatClientToServer =
  | {
      t: "stream.join";
      streamerId: string;
      displayName?: string;
    }
  | {
      t: "stream.chat.send";
      streamerId: string;
      text: string;
    };

type StreamChatServerToClient =
  | {
      t: "welcome";
      clientId: string;
      serverNowMs: number;
    }
  | {
      t: "stream.snapshot";
      streamerId: string;
      displayName?: string;
      chat: StreamChatMessage[];
      viewers: number;
    }
  | {
      t: "stream.chat";
      streamerId: string;
      chat: StreamChatMessage[];
    }
  | {
      t: "stream.viewers";
      streamerId: string;
      viewers: number;
    }
  | {
      t: "error";
      message: string;
    };

function StreamChatPanel({
  streamerId,
  streamerName,
}: {
  streamerId: string;
  streamerName: string;
}) {
  const wsRef = useRef<WebSocket | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [savedName, setSavedName] = useState("");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<StreamChatMessage[]>([]);
  const [viewers, setViewers] = useState(0);
  const [connected, setConnected] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  function send(msg: StreamChatClientToServer) {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify(msg));
  }

  function saveName() {
    setSavedName(displayName.trim());
  }

  function sendMessage() {
    const text = message.trim();
    if (!text) return;

    send({
      t: "stream.chat.send",
      streamerId,
      text,
    });

    setMessage("");
  }

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4100/ws");
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      ws.send(
        JSON.stringify({
          t: "stream.join",
          streamerId,
          displayName: savedName || undefined,
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as StreamChatServerToClient;

        if (msg.t === "stream.snapshot" && msg.streamerId === streamerId) {
          setChat(msg.chat);
          setViewers(msg.viewers);
          if (msg.displayName && !savedName) {
            setDisplayName(msg.displayName);
            setSavedName(msg.displayName);
          }
          return;
        }

        if (msg.t === "stream.chat" && msg.streamerId === streamerId) {
          setChat(msg.chat);
          return;
        }

        if (msg.t === "stream.viewers" && msg.streamerId === streamerId) {
          setViewers(msg.viewers);
          return;
        }
      } catch {
        // ignore parse errors
      }
    };

    ws.onclose = () => {
      setConnected(false);
    };

    ws.onerror = () => {
      setConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [streamerId, savedName]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  return (
    <div className="relative z-20">
      <div className="flex justify-end">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="rounded-full border border-white/15 bg-black/70 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10"
        >
          {isOpen ? "Close Chat" : `Chat • ${viewers}`}
        </button>
      </div>

      {isOpen ? (
        <div className="absolute right-0 top-12 z-30 w-[22rem] max-w-[calc(100vw-3rem)] rounded-[1.5rem] border border-white/10 bg-black/90 p-4 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-white/40">
                Stream Chat
              </div>
              <div className="mt-1 text-sm text-white/70">{streamerName}</div>
            </div>

            <div className="text-right text-xs text-white/45">
              {connected ? "Connected" : "Offline"}<br />
              {viewers} viewer(s)
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="your display name"
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm text-white outline-none placeholder:text-white/30"
            />
            <button
              onClick={saveName}
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10"
            >
              Save
            </button>
          </div>

          <div className="mt-4 h-64 overflow-y-auto rounded-[1.25rem] border border-white/10 bg-black/30 p-3">
            <div className="space-y-3">
              {chat.length > 0 ? (
                chat.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-[1rem] border border-white/10 bg-black/30 p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-white/80">
                        {entry.authorName}
                      </div>
                      <div className="text-xs text-white/40">
                        {new Date(entry.createdAtMs).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-white/70">{entry.text}</div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-white/45">No stream comments yet.</div>
              )}
              <div ref={endRef} />
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="comment on the stream"
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30"
            />
            <button
              onClick={sendMessage}
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90"
            >
              Send
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FeedPanel({
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
    <div className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/45 backdrop-blur-xl shadow-[0_40px_90px_rgba(0,0,0,0.35)]">
      <div
        className={classNames(
          "absolute inset-0 bg-gradient-to-br opacity-55",
          streamer.color
        )}
      />
      <div className="absolute inset-0 bg-[radial-gradient(900px_320px_at_15%_0%,rgba(255,255,255,0.12),transparent_55%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.05),transparent_18%,transparent_82%,rgba(255,255,255,0.03))]" />
      <div className="absolute inset-0 ring-1 ring-white/5 rounded-[2rem]" />

      <div
        className={classNames(
          "relative z-10 flex h-full flex-col justify-between gap-4",
          large ? "min-h-[460px] p-4" : "min-h-[260px] p-4"
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <StatusDot live={streamer.live} />
              <div
                className={classNames(
                  "font-semibold text-white",
                  large ? "text-3xl" : "text-xl"
                )}
              >
                {streamer.name}
              </div>
              <PlatformPill platform={streamer.platform} />
            </div>

            <div className="mt-1 text-sm text-white/55">{streamer.handle}</div>
          </div>

          <a
            href={streamer.channelUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs uppercase tracking-[0.2em] text-white/55 hover:text-white/80"
          >
            Open on Twitch →
          </a>
        </div>

        <div className="relative">
          <div
            className={classNames(
              "relative overflow-hidden rounded-[1.25rem] border border-white/10 bg-black/40",
              large ? "aspect-video" : "aspect-[16/10]"
            )}
          >
            <div className="pointer-events-none absolute inset-0 z-10 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.10)_1px,transparent_1px)] [background-size:28px_28px]" />
            <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.03),transparent_25%,transparent_75%,rgba(255,255,255,0.03))]" />
            <div className="absolute left-4 top-4 z-20 rounded-full border border-white/10 bg-black/45 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-white/50">
              active perspective
            </div>
            <div className="absolute bottom-4 left-4 z-20 text-sm text-white/70">
              {streamer.title}
            </div>

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
              <div className="grid h-full w-full place-items-center text-white/50">
                Unsupported platform embed
              </div>
            )}
          </div>

          <div className="absolute right-3 top-3">
            <StreamChatPanel
              streamerId={streamer.channelName}
              streamerName={streamer.name}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-white/60">
            {streamer.live ? "Active Signal" : "Dormant"}
          </div>
          <div className="text-sm text-white/45">
            {streamer.title || "Main Signal"}
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
      <div className="rounded-[2rem] border border-white/10 bg-black/30 p-8 text-white/50 backdrop-blur-xl">
        No active feeds.
      </div>
    );
  }

  if (mode === "focus-1" || (mode === "auto" && count === 1)) {
    return <FeedPanel streamer={feeds[0]} large />;
  }

  if (mode === "focus-2" || (mode === "auto" && count === 2)) {
    const visible = feeds.slice(0, 2);
    return (
      <div className="grid gap-5 md:grid-cols-2">
        {visible.map((f) => (
          <FeedPanel key={f.id} streamer={f} large />
        ))}
      </div>
    );
  }

  if (mode === "focus-3" || (mode === "auto" && count === 3)) {
    const visible = feeds.slice(0, 3);
    return (
      <div className="grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
        <FeedPanel streamer={visible[0]} large />
        <div className="grid gap-5">
          {visible.slice(1).map((f) => (
            <FeedPanel key={f.id} streamer={f} />
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
          <FeedPanel key={f.id} streamer={f} />
        ))}
      </div>
    );
  }

  const visible = feeds.slice(0, 5);
  return (
    <div className="grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
      <FeedPanel streamer={visible[0]} large />
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-1">
        {visible.slice(1, 5).map((f) => (
          <FeedPanel key={f.id} streamer={f} />
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
  const [liveSyncState, setLiveSyncState] = useState<"idle" | "loading" | "ok" | "error">("idle");

  useEffect(() => {
    let cancelled = false;

    async function syncTwitchLiveStatus() {
      try {
        setLiveSyncState("loading");

        const res = await fetch("/api/twitch/live", { cache: "no-store" });
        const data = await res.json();

        if (!res.ok || !data.ok) {
          throw new Error(data?.error || "Failed to sync Twitch live status");
        }

        if (cancelled) return;

        const liveMap = new Map<string, boolean>();
        for (const item of data.live as Array<{ id: string; live: boolean }>) {
          liveMap.set(item.id, item.live);
        }

        setStreamers((prev) =>
          prev.map((s) =>
            s.platform === "Twitch"
              ? { ...s, live: liveMap.get(s.id) ?? false }
              : s
          )
        );

        setLiveSyncState("ok");
      } catch {
        if (!cancelled) setLiveSyncState("error");
      }
    }

    syncTwitchLiveStatus();
    const interval = setInterval(syncTwitchLiveStatus, 60000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

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
        <div className="absolute inset-0 bg-[radial-gradient(1000px_700px_at_15%_10%,rgba(255,255,255,0.09),transparent_60%),radial-gradient(900px_600px_at_80%_25%,rgba(255,255,255,0.05),transparent_65%),radial-gradient(1100px_800px_at_50%_95%,rgba(255,255,255,0.06),transparent_70%)] blur-3xl" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:52px_52px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-neutral-950" />
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
            <div className="mt-4 text-xs text-white/45">
              Twitch sync: {liveSyncState}
            </div>
          </div>

          <Link
            href="/"
            className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
          >
            Return
          </Link>
        </div>

        <section className="mt-10 rounded-[2rem] border border-white/10 bg-black/30 p-5 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.25)]">
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

        <section className="mt-14 rounded-[2rem] border border-white/10 bg-black/30 p-6 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.25)]">
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
