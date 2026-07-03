"use client";

import { use, useEffect, useRef, useState } from "react";

type ConnectionState = "offline" | "connecting" | "connected" | "error";
type Role = "host" | "viewer";
type SourceMode = "url" | "local";
type MediaKind = "video" | "audio";

type SharedSource = {
  mode: SourceMode;
  kind: MediaKind;
  value: string;
  updatedBy: string;
  updatedAtMs: number;
};

type SharedPlayback = {
  isPlaying: boolean;
  positionSec: number;
  updatedAtMs: number;
  updatedBy: string;
};

type PresenceEntry = {
  id: string;
  role: Role;
  name?: string;
  verified: boolean;
};

type ChatMessage = {
  id: string;
  authorId: string;
  authorName?: string;
  authorRole: Role;
  text: string;
  createdAtMs: number;
};

type ClientToServer =
  | { t: "hello"; roomId: string; role: Role; name?: string }
  | { t: "ping"; clientNowMs: number }
  | {
      t: "source.set";
      roomId: string;
      source: {
        mode: SourceMode;
        kind: MediaKind;
        value: string;
      };
    }
  | {
      t: "playback.set";
      roomId: string;
      playback: {
        isPlaying: boolean;
        positionSec: number;
      };
    }
  | {
      t: "profile.set";
      roomId: string;
      name: string;
    }
  | {
      t: "chat.send";
      roomId: string;
      text: string;
    };

type ServerToClient =
  | { t: "welcome"; clientId: string; serverNowMs: number }
  | {
      t: "room.snapshot";
      roomId: string;
      you: { role: Role; verified: boolean; name?: string };
      stats: {
        roomId: string;
        hostId: string | null;
        viewersTotal: number;
        viewersVerified: number;
      };
      source: SharedSource | null;
      playback: SharedPlayback | null;
      participants: PresenceEntry[];
      chat: ChatMessage[];
    }
  | {
      t: "room.stats";
      stats: {
        roomId: string;
        hostId: string | null;
        viewersTotal: number;
        viewersVerified: number;
      };
    }
  | { t: "room.source"; roomId: string; source: SharedSource | null }
  | { t: "room.playback"; roomId: string; playback: SharedPlayback | null }
  | { t: "room.presence"; roomId: string; participants: PresenceEntry[] }
  | { t: "room.chat"; roomId: string; chat: ChatMessage[] }
  | { t: "pong"; serverNowMs: number }
  | { t: "error"; message: string };

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "").trim();
      return id ? `https://www.youtube.com/embed/${id}?enablejsapi=1` : null;
    }

    if (
      parsed.hostname.includes("youtube.com") ||
      parsed.hostname.includes("www.youtube.com")
    ) {
      const id = parsed.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}?enablejsapi=1`;

      const parts = parsed.pathname.split("/").filter(Boolean);
      const embedIndex = parts.indexOf("embed");
      if (embedIndex >= 0 && parts[embedIndex + 1]) {
        return `https://www.youtube.com/embed/${parts[embedIndex + 1]}?enablejsapi=1`;
      }
    }

    return null;
  } catch {
    return null;
  }
}

function isDirectVideo(url: string) {
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
}

function isDirectAudio(url: string) {
  return /\.(mp3|wav|ogg|m4a|aac)(\?.*)?$/i.test(url);
}

function computeRoomTime(playback: SharedPlayback | null): number {
  if (!playback) return 0;
  if (!playback.isPlaying) return playback.positionSec;

  const dt = (Date.now() - playback.updatedAtMs) / 1000;
  return Math.max(0, playback.positionSec + dt);
}

function PlaybackSurface({
  source,
  playback,
  role,
  onHostPlayPause,
  onSyncToRoom,
}: {
  source: SharedSource | null;
  playback: SharedPlayback | null;
  role: Role;
  onHostPlayPause: (nextPlaying: boolean, currentPositionSec: number) => void;
  onSyncToRoom: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!playback) return;

    const target = computeRoomTime(playback);

    if (videoRef.current) {
      const el = videoRef.current;
      const drift = Math.abs((el.currentTime || 0) - target);

      if (drift > 1.5) {
        el.currentTime = target;
      }

      if (playback.isPlaying) {
        void el.play().catch(() => {});
      } else {
        el.pause();
      }
    }

    if (audioRef.current) {
      const el = audioRef.current;
      const drift = Math.abs((el.currentTime || 0) - target);

      if (drift > 1.5) {
        el.currentTime = target;
      }

      if (playback.isPlaying) {
        void el.play().catch(() => {});
      } else {
        el.pause();
      }
    }
  }, [playback, source]);

  if (!source) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-white/40">
        No shared source selected yet.
      </div>
    );
  }

  if (source.mode === "local") {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <div className="text-sm uppercase tracking-[0.25em] text-white/40">
          Local File Mode
        </div>
        <div className="mt-4 max-w-md text-sm text-white/60">
          Shared local-file mode is active. Later, each participant will load the
          same file on their own device.
        </div>
      </div>
    );
  }

  const embedUrl = getYouTubeEmbedUrl(source.value);

  if (embedUrl && source.kind === "video") {
    return (
      <div className="relative h-full w-full">
        <iframe
          src={embedUrl}
          title="Shared playback"
          className="h-full w-full rounded-[1.5rem]"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
        <div className="absolute bottom-3 right-3 flex flex-wrap gap-2">
          {role === "host" ? (
            <button
              onClick={() =>
                onHostPlayPause(!(playback?.isPlaying ?? false), computeRoomTime(playback))
              }
              className="rounded-full border border-white/15 bg-black/70 px-4 py-2 text-xs font-semibold text-white/85"
            >
              {playback?.isPlaying ? "Pause Room" : "Play Room"}
            </button>
          ) : null}
          <button
            onClick={onSyncToRoom}
            className="rounded-full border border-white/15 bg-black/70 px-4 py-2 text-xs font-semibold text-white/85"
          >
            Sync to Room
          </button>
        </div>
      </div>
    );
  }

  if (source.kind === "video" && isDirectVideo(source.value)) {
    return (
      <div className="relative h-full w-full">
        <video
          ref={videoRef}
          src={source.value}
          controls
          className="h-full w-full rounded-[1.5rem]"
        />
        <div className="absolute bottom-3 right-3 flex flex-wrap gap-2">
          {role === "host" ? (
            <button
              onClick={() => {
                const current = videoRef.current?.currentTime ?? computeRoomTime(playback);
                onHostPlayPause(!(playback?.isPlaying ?? false), current);
              }}
              className="rounded-full border border-white/15 bg-black/70 px-4 py-2 text-xs font-semibold text-white/85"
            >
              {playback?.isPlaying ? "Pause Room" : "Play Room"}
            </button>
          ) : null}
          <button
            onClick={onSyncToRoom}
            className="rounded-full border border-white/15 bg-black/70 px-4 py-2 text-xs font-semibold text-white/85"
          >
            Sync to Room
          </button>
        </div>
      </div>
    );
  }

  if (source.kind === "audio" && isDirectAudio(source.value)) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6">
        <audio ref={audioRef} src={source.value} controls className="w-full max-w-xl" />
        <div className="mt-5 flex flex-wrap gap-2">
          {role === "host" ? (
            <button
              onClick={() => {
                const current = audioRef.current?.currentTime ?? computeRoomTime(playback);
                onHostPlayPause(!(playback?.isPlaying ?? false), current);
              }}
              className="rounded-full border border-white/15 bg-black/70 px-4 py-2 text-xs font-semibold text-white/85"
            >
              {playback?.isPlaying ? "Pause Room" : "Play Room"}
            </button>
          ) : null}
          <button
            onClick={onSyncToRoom}
            className="rounded-full border border-white/15 bg-black/70 px-4 py-2 text-xs font-semibold text-white/85"
          >
            Sync to Room
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="text-sm uppercase tracking-[0.25em] text-white/40">
        Source Loaded
      </div>
      <div className="mt-4 max-w-xl text-sm text-white/60">
        This source is shared in room state, but this player does not yet know how
        to render it directly.
      </div>
      <div className="mt-4 break-all text-xs text-white/45">{source.value}</div>
    </div>
  );
}

export default function WatchRoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = use(params);

  const wsRef = useRef<WebSocket | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const [role, setRole] = useState<Role>("viewer");
  const [displayName, setDisplayName] = useState("");
  const [savedName, setSavedName] = useState("");
  const [mode, setMode] = useState<SourceMode>("url");
  const [mediaKind, setMediaKind] = useState<MediaKind>("video");
  const [mediaUrl, setMediaUrl] = useState("");
  const [chatInput, setChatInput] = useState("");

  const [connectionState, setConnectionState] =
    useState<ConnectionState>("offline");
  const [clientId, setClientId] = useState("");
  const [serverNow, setServerNow] = useState<number | null>(null);
  const [verified, setVerified] = useState(false);
  const [viewersTotal, setViewersTotal] = useState(0);
  const [viewersVerified, setViewersVerified] = useState(0);
  const [hostId, setHostId] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<SharedSource | null>(
    null
  );
  const [playback, setPlayback] = useState<SharedPlayback | null>(null);
  const [participants, setParticipants] = useState<PresenceEntry[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [statusLog, setStatusLog] = useState<string[]>(["Room shell ready."]);

  function pushStatus(message: string) {
    setStatusLog((prev) => [message, ...prev].slice(0, 10));
  }

  function send(msg: ClientToServer) {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify(msg));
  }

  function applyProfile() {
    const clean = displayName.trim();
    send({
      t: "profile.set",
      roomId,
      name: clean,
    });
    setSavedName(clean);
    pushStatus(clean ? `Display name saved as "${clean}".` : "Display name cleared.");
  }

  function sendChat() {
    const text = chatInput.trim();
    if (!text) return;

    send({
      t: "chat.send",
      roomId,
      text,
    });

    setChatInput("");
  }

  function applySource() {
    if (role !== "host") {
      pushStatus("Only the host can set the room source.");
      return;
    }

    if (mode === "url") {
      const value = mediaUrl.trim();
      if (!value) {
        pushStatus("Paste a media URL first.");
        return;
      }

      send({
        t: "source.set",
        roomId,
        source: {
          mode: "url",
          kind: mediaKind,
          value,
        },
      });

      pushStatus(`Source sent to backend: ${mediaKind} URL.`);
      return;
    }

    send({
      t: "source.set",
      roomId,
      source: {
        mode: "local",
        kind: mediaKind,
        value: "Local file mode armed",
      },
    });

    pushStatus(`Source sent to backend: ${mediaKind} local-file mode.`);
  }

  function sendPlayback(nextPlaying: boolean, currentPositionSec: number) {
    if (role !== "host") {
      pushStatus("Only the host can control room playback.");
      return;
    }

    send({
      t: "playback.set",
      roomId,
      playback: {
        isPlaying: nextPlaying,
        positionSec: currentPositionSec,
      },
    });

    pushStatus(
      `Playback sent to backend: ${nextPlaying ? "play" : "pause"} at ${currentPositionSec.toFixed(2)}s.`
    );
  }

  function syncToRoom() {
    if (!playback) {
      pushStatus("No room playback state to sync to yet.");
      return;
    }

    pushStatus(`Sync requested to room time ${computeRoomTime(playback).toFixed(2)}s.`);
    setPlayback({ ...playback });
  }

  useEffect(() => {
    queueMicrotask(() => setConnectionState("connecting"));
    pushStatus(`Connecting to CoVue server for room ${roomId}...`);

    const ws = new WebSocket("ws://localhost:4000/ws");
    wsRef.current = ws;

    ws.onopen = () => {
      setConnectionState("connected");
      pushStatus("WebSocket connected.");
      ws.send(
        JSON.stringify({
          t: "hello",
          roomId,
          role,
          name: savedName || undefined,
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as ServerToClient;

        if (msg.t === "welcome") {
          setClientId(msg.clientId);
          setServerNow(msg.serverNowMs);
          pushStatus(`Server welcomed client ${msg.clientId.slice(0, 8)}...`);
          return;
        }

        if (msg.t === "room.snapshot") {
          setVerified(msg.you.verified);
          setHostId(msg.stats.hostId);
          setViewersTotal(msg.stats.viewersTotal);
          setViewersVerified(msg.stats.viewersVerified);
          setSelectedSource(msg.source);
          setPlayback(msg.playback);
          setParticipants(msg.participants);
          setChatMessages(msg.chat);
          if (msg.you.name) {
            setDisplayName(msg.you.name);
            setSavedName(msg.you.name);
          }
          pushStatus(`Room snapshot received for ${msg.roomId}.`);
          return;
        }

        if (msg.t === "room.stats") {
          setHostId(msg.stats.hostId);
          setViewersTotal(msg.stats.viewersTotal);
          setViewersVerified(msg.stats.viewersVerified);
          pushStatus(
            `Room stats updated: ${msg.stats.viewersVerified}/${msg.stats.viewersTotal} verified viewers.`
          );
          return;
        }

        if (msg.t === "room.source") {
          setSelectedSource(msg.source);
          pushStatus("Shared room source updated.");
          return;
        }

        if (msg.t === "room.playback") {
          setPlayback(msg.playback);
          pushStatus("Shared room playback updated.");
          return;
        }

        if (msg.t === "room.presence") {
          setParticipants(msg.participants);
          pushStatus(`Presence updated: ${msg.participants.length} participant(s).`);
          return;
        }

        if (msg.t === "room.chat") {
          setChatMessages(msg.chat);
          pushStatus(`Chat updated: ${msg.chat.length} message(s).`);
          return;
        }

        if (msg.t === "pong") {
          setServerNow(msg.serverNowMs);
          return;
        }

        if (msg.t === "error") {
          setConnectionState("error");
          pushStatus(`Server error: ${msg.message}`);
          return;
        }
      } catch {
        setConnectionState("error");
        pushStatus("Failed to parse server message.");
      }
    };

    ws.onerror = () => {
      setConnectionState("error");
      pushStatus("WebSocket error.");
    };

    ws.onclose = () => {
      setConnectionState("offline");
      pushStatus("WebSocket disconnected.");
    };

    return () => {
      ws.close();
    };
  }, [roomId, role, savedName]);

  useEffect(() => {
    if (connectionState !== "connected") return;

    const interval = window.setInterval(() => {
      send({ t: "ping", clientNowMs: Date.now() });
    }, 5000);

    return () => clearInterval(interval);
  }, [connectionState]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const connectionTone =
    connectionState === "connected"
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
      : connectionState === "connecting"
      ? "border-yellow-400/20 bg-yellow-400/10 text-yellow-100"
      : connectionState === "error"
      ? "border-red-400/20 bg-red-400/10 text-red-100"
      : "border-white/10 bg-white/5 text-white/70";

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
            <div className="text-xs uppercase tracking-[0.3em] text-white/40">
              Theater / Room
            </div>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
              Room {roomId}
            </h1>
            <p className="mt-4 max-w-3xl text-white/60">
              This room now shares source, presence, playback, participant identity,
              and live room chat through the local CoVue backend.
            </p>
          </div>

          <a
            href="/theater"
            className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
          >
            Back to Theater
          </a>
        </div>

        <section className="mt-6 rounded-[2rem] border border-white/10 bg-black/30 p-6 backdrop-blur-xl">
          <div className="text-xs uppercase tracking-[0.25em] text-white/40">
            Participant Identity
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="enter display name"
              className="w-full rounded-[1.25rem] border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30"
            />
            <button
              onClick={applyProfile}
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90"
            >
              Save Name
            </button>
          </div>
          <div className="mt-3 text-sm text-white/45">
            Current name: {savedName || "not set"}
          </div>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
          <div className="rounded-[2rem] border border-white/10 bg-black/30 p-5 backdrop-blur-xl">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.22em] ${connectionTone}`}
              >
                {connectionState}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.22em] text-white/60">
                {role}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.22em] text-white/60">
                {mode}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.22em] text-white/60">
                {mediaKind}
              </span>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <div className="rounded-[1.25rem] border border-white/10 bg-black/30 p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-white/40">
                  Client ID
                </div>
                <div className="mt-2 break-all text-sm text-white/70">
                  {clientId || "pending..."}
                </div>
              </div>

              <div className="rounded-[1.25rem] border border-white/10 bg-black/30 p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-white/40">
                  Verified
                </div>
                <div className="mt-2 text-sm text-white/70">
                  {verified ? "yes" : "not yet"}
                </div>
              </div>

              <div className="rounded-[1.25rem] border border-white/10 bg-black/30 p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-white/40">
                  Server Clock
                </div>
                <div className="mt-2 text-sm text-white/70">
                  {serverNow ? new Date(serverNow).toLocaleTimeString() : "syncing..."}
                </div>
              </div>

              <div className="rounded-[1.25rem] border border-white/10 bg-black/30 p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-white/40">
                  Room Time
                </div>
                <div className="mt-2 text-sm text-white/70">
                  {computeRoomTime(playback).toFixed(2)}s
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-black/30 p-5 backdrop-blur-xl">
            <div className="text-xs uppercase tracking-[0.25em] text-white/40">
              Room Activity
            </div>
            <div className="mt-4 space-y-2">
              {statusLog.map((line, idx) => (
                <div
                  key={`${line}-${idx}`}
                  className="rounded-[1rem] border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/60"
                >
                  {line}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
          <div className="rounded-[2rem] border border-white/10 bg-black/35 p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div className="text-xs uppercase tracking-[0.25em] text-white/40">
                Playback Chamber
              </div>
              <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-emerald-100">
                Shared Playback Wired
              </div>
            </div>

            <div className="mt-4 aspect-video overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/40">
              <PlaybackSurface
                source={selectedSource}
                playback={playback}
                role={role}
                onHostPlayPause={sendPlayback}
                onSyncToRoom={syncToRoom}
              />
            </div>

            <div className="mt-6 rounded-[1.25rem] border border-white/10 bg-black/30 p-4">
              <div className="text-xs uppercase tracking-[0.25em] text-white/40">
                Shared Selected Source
              </div>

              {selectedSource ? (
                <div className="mt-3 space-y-2 text-sm text-white/60">
                  <p>Mode: {selectedSource.mode}</p>
                  <p>Kind: {selectedSource.kind}</p>
                  <p className="break-all">Value: {selectedSource.value}</p>
                  <p>Updated By: {selectedSource.updatedBy}</p>
                  <p>
                    Updated At:{" "}
                    {new Date(selectedSource.updatedAtMs).toLocaleTimeString()}
                  </p>
                </div>
              ) : (
                <div className="mt-3 text-sm text-white/45">
                  No shared source selected yet.
                </div>
              )}
            </div>

            <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-black/30 p-4">
              <div className="text-xs uppercase tracking-[0.25em] text-white/40">
                Shared Playback State
              </div>

              {playback ? (
                <div className="mt-3 space-y-2 text-sm text-white/60">
                  <p>Playing: {playback.isPlaying ? "yes" : "no"}</p>
                  <p>Position: {playback.positionSec.toFixed(2)}s</p>
                  <p>Updated By: {playback.updatedBy}</p>
                  <p>
                    Updated At: {new Date(playback.updatedAtMs).toLocaleTimeString()}
                  </p>
                </div>
              ) : (
                <div className="mt-3 text-sm text-white/45">
                  No shared playback state yet.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-black/30 p-6 backdrop-blur-xl">
              <div className="text-xs uppercase tracking-[0.25em] text-white/40">
                Room Chat
              </div>

              <div className="mt-4 h-72 overflow-y-auto rounded-[1.25rem] border border-white/10 bg-black/30 p-4">
                <div className="space-y-3">
                  {chatMessages.length > 0 ? (
                    chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className="rounded-[1rem] border border-white/10 bg-black/30 p-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-semibold text-white/80">
                            {message.authorName || message.authorId.slice(0, 8)}
                          </div>
                          <div className="text-xs uppercase tracking-[0.2em] text-white/45">
                            {message.authorRole}
                          </div>
                        </div>
                        <div className="mt-1 text-xs text-white/40">
                          {new Date(message.createdAtMs).toLocaleTimeString()}
                        </div>
                        <div className="mt-2 text-sm text-white/70">
                          {message.text}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-white/45">
                      No room messages yet.
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      sendChat();
                    }
                  }}
                  placeholder="comment from the room"
                  className="w-full rounded-[1.25rem] border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30"
                />
                <button
                  onClick={sendChat}
                  className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90"
                >
                  Send
                </button>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-black/30 p-6 backdrop-blur-xl">
              <div className="text-xs uppercase tracking-[0.25em] text-white/40">
                Presence
              </div>
              <div className="mt-4 space-y-3">
                {participants.length > 0 ? (
                  participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="rounded-[1.25rem] border border-white/10 bg-black/30 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-white/80">
                          {participant.name || participant.id.slice(0, 8)}
                        </div>
                        <div className="text-xs uppercase tracking-[0.2em] text-white/45">
                          {participant.role}
                        </div>
                      </div>
                      <div className="mt-2 break-all text-xs text-white/45">
                        {participant.id}
                      </div>
                      <div className="mt-2 text-xs text-white/55">
                        Verified: {participant.verified ? "yes" : "no"}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[1.25rem] border border-white/10 bg-black/30 p-4 text-sm text-white/45">
                    No participants visible yet.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-black/30 p-6 backdrop-blur-xl">
              <div className="text-xs uppercase tracking-[0.25em] text-white/40">
                Role
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => {
                    setRole("viewer");
                    pushStatus("Role switched to viewer.");
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    role === "viewer"
                      ? "bg-white text-black"
                      : "border border-white/10 bg-white/5 text-white/80"
                  }`}
                >
                  Viewer
                </button>
                <button
                  onClick={() => {
                    setRole("host");
                    pushStatus("Role switched to host.");
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    role === "host"
                      ? "bg-white text-black"
                      : "border border-white/10 bg-white/5 text-white/80"
                  }`}
                >
                  Host
                </button>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-black/30 p-6 backdrop-blur-xl">
              <div className="text-xs uppercase tracking-[0.25em] text-white/40">
                Source Mode
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => {
                    setMode("url");
                    pushStatus("Source mode set to URL.");
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    mode === "url"
                      ? "bg-white text-black"
                      : "border border-white/10 bg-white/5 text-white/80"
                  }`}
                >
                  URL
                </button>
                <button
                  onClick={() => {
                    setMode("local");
                    pushStatus("Source mode set to local file.");
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    mode === "local"
                      ? "bg-white text-black"
                      : "border border-white/10 bg-white/5 text-white/80"
                  }`}
                >
                  Local File
                </button>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-black/30 p-6 backdrop-blur-xl">
              <div className="text-xs uppercase tracking-[0.25em] text-white/40">
                Host Source Panel
              </div>

              {role === "host" ? (
                <>
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => {
                        setMediaKind("video");
                        pushStatus("Media kind set to video.");
                      }}
                      className={`rounded-full px-4 py-2 text-sm font-semibold ${
                        mediaKind === "video"
                          ? "bg-white text-black"
                          : "border border-white/10 bg-white/5 text-white/80"
                      }`}
                    >
                      Video
                    </button>
                    <button
                      onClick={() => {
                        setMediaKind("audio");
                        pushStatus("Media kind set to audio.");
                      }}
                      className={`rounded-full px-4 py-2 text-sm font-semibold ${
                        mediaKind === "audio"
                          ? "bg-white text-black"
                          : "border border-white/10 bg-white/5 text-white/80"
                      }`}
                    >
                      Audio
                    </button>
                  </div>

                  {mode === "url" ? (
                    <div className="mt-5 space-y-3">
                      <input
                        value={mediaUrl}
                        onChange={(e) => setMediaUrl(e.target.value)}
                        placeholder="paste media url"
                        className="w-full rounded-[1.25rem] border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30"
                      />
                      <button
                        onClick={applySource}
                        className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90"
                      >
                        Set Shared URL Source
                      </button>
                    </div>
                  ) : (
                    <div className="mt-5 space-y-3">
                      <div className="rounded-[1.25rem] border border-white/10 bg-black/30 p-4 text-sm text-white/60">
                        Local file mode selected. Later, each participant will choose
                        the same file on their own device.
                      </div>
                      <button
                        onClick={applySource}
                        className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90"
                      >
                        Arm Shared Local File Mode
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-black/30 p-4 text-sm text-white/50">
                  Only the host can set the room source.
                </div>
              )}
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-black/30 p-6 backdrop-blur-xl">
              <div className="text-xs uppercase tracking-[0.25em] text-white/40">
                Room Stats
              </div>
              <div className="mt-4 space-y-2 text-sm text-white/60">
                <p>Role: {role}</p>
                <p>Name: {savedName || "not set"}</p>
                <p>Mode: {mode}</p>
                <p>Media kind: {mediaKind}</p>
                <p>Connection: {connectionState}</p>
                <p>Host ID: {hostId || "none yet"}</p>
                <p>Viewers total: {viewersTotal}</p>
                <p>Verified viewers: {viewersVerified}</p>
                <p>Participants: {participants.length}</p>
                <p>Chat messages: {chatMessages.length}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
