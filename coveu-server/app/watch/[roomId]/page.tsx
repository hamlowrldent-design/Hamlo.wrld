"use client";

import { use, useEffect, useRef, useState } from "react";

type ConnectionState = "offline" | "connecting" | "connected" | "error";

type Role = "host" | "viewer";

type ClientToServer =
  | { t: "hello"; roomId: string; role: Role; name?: string }
  | { t: "ping"; clientNowMs: number };

type ServerToClient =
  | { t: "welcome"; clientId: string; serverNowMs: number }
  | {
      t: "room.snapshot";
      roomId: string;
      you: { role: Role; verified: boolean };
      stats: {
        roomId: string;
        hostId: string | null;
        viewersTotal: number;
        viewersVerified: number;
      };
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
  | { t: "pong"; serverNowMs: number }
  | { t: "error"; message: string };

export default function WatchRoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = use(params);

  const wsRef = useRef<WebSocket | null>(null);

  const [role, setRole] = useState<Role>("viewer");
  const [mode, setMode] = useState<"url" | "local">("url");
  const [mediaKind, setMediaKind] = useState<"video" | "audio">("video");
  const [mediaUrl, setMediaUrl] = useState("");
  const [selectedSource, setSelectedSource] = useState<null | {
    mode: "url" | "local";
    kind: "video" | "audio";
    value: string;
  }>(null);

  const [connectionState, setConnectionState] =
    useState<ConnectionState>("offline");
  const [clientId, setClientId] = useState("");
  const [serverNow, setServerNow] = useState<number | null>(null);
  const [verified, setVerified] = useState(false);
  const [viewersTotal, setViewersTotal] = useState(0);
  const [viewersVerified, setViewersVerified] = useState(0);
  const [hostId, setHostId] = useState<string | null>(null);
  const [statusLog, setStatusLog] = useState<string[]>(["Room shell ready."]);

  function pushStatus(message: string) {
    setStatusLog((prev) => [message, ...prev].slice(0, 8));
  }

  function send(msg: ClientToServer) {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify(msg));
  }

  function applySource() {
    if (mode === "url") {
      if (!mediaUrl.trim()) return;
      setSelectedSource({
        mode: "url",
        kind: mediaKind,
        value: mediaUrl.trim(),
      });
      pushStatus(`Local UI source staged: ${mediaKind} URL applied.`);
      return;
    }

    setSelectedSource({
      mode: "local",
      kind: mediaKind,
      value: "Local file mode armed",
    });
    pushStatus(`Local UI source staged: ${mediaKind} local-file mode armed.`);
  }

  useEffect(() => {
    setConnectionState("connecting");
    pushStatus(`Connecting to CoVue server for room ${roomId}...`);

    const ws = new WebSocket("ws://localhost:4000/ws");
    wsRef.current = ws;

    ws.onopen = () => {
      setConnectionState("connected");
      pushStatus("WebSocket connected.");
      ws.send(JSON.stringify({ t: "hello", roomId, role }));
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

        if (msg.t === "pong") {
          setServerNow(msg.serverNowMs);
          pushStatus("Heartbeat acknowledged by server.");
          return;
        }

        if (msg.t === "error") {
          setConnectionState("error");
          pushStatus(`Server error: ${msg.message}`);
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
  }, [roomId, role]);

  useEffect(() => {
    if (connectionState !== "connected") return;

    const interval = window.setInterval(() => {
      send({ t: "ping", clientNowMs: Date.now() });
    }, 5000);

    return () => clearInterval(interval);
  }, [connectionState]);

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
              This room is now talking to the local CoVue backend. Host authority,
              source selection, synchronized playback, verification, and accounting
              will keep growing from here.
            </p>
          </div>

          <a
            href="/theater"
            className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
          >
            Back to Theater
          </a>
        </div>

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

            <div className="mt-4 grid gap-3 md:grid-cols-3">
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
                Backend Wired
              </div>
            </div>

            <div className="mt-4 aspect-video rounded-[1.5rem] border border-white/10 bg-black/40" />

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={() => pushStatus("Playback placeholder: play command queued.")}
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90"
              >
                Play
              </button>
              <button
                onClick={() => pushStatus("Playback placeholder: pause command queued.")}
                className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
              >
                Pause
              </button>
              <button
                onClick={() => pushStatus("Playback placeholder: seek requested.")}
                className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
              >
                Seek Placeholder
              </button>
            </div>

            <div className="mt-6 rounded-[1.25rem] border border-white/10 bg-black/30 p-4">
              <div className="text-xs uppercase tracking-[0.25em] text-white/40">
                Selected Source
              </div>

              {selectedSource ? (
                <div className="mt-3 space-y-2 text-sm text-white/60">
                  <p>Mode: {selectedSource.mode}</p>
                  <p>Kind: {selectedSource.kind}</p>
                  <p className="break-all">Value: {selectedSource.value}</p>
                </div>
              ) : (
                <div className="mt-3 text-sm text-white/45">
                  No source selected yet.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
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

              <div className="mt-5 rounded-[1.25rem] border border-white/10 bg-black/30 p-4 text-sm text-white/60">
                {mode === "url"
                  ? "Host will be able to provide a media URL here."
                  : "Participants will be able to select their own local file here."}
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
                        Set URL Source
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
                        Arm Local File Mode
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-black/30 p-4 text-sm text-white/50">
                  Only the host can set the source.
                </div>
              )}
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-black/30 p-6 backdrop-blur-xl">
              <div className="text-xs uppercase tracking-[0.25em] text-white/40">
                Room Stats
              </div>
              <div className="mt-4 space-y-2 text-sm text-white/60">
                <p>Role: {role}</p>
                <p>Mode: {mode}</p>
                <p>Media kind: {mediaKind}</p>
                <p>Connection: {connectionState}</p>
                <p>Host ID: {hostId || "none yet"}</p>
                <p>Viewers total: {viewersTotal}</p>
                <p>Verified viewers: {viewersVerified}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
