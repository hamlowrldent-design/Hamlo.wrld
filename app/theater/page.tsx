"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

function makeRoomCode() {
  return Math.random().toString(36).slice(2, 8);
}

export default function TheaterPage() {
  const [roomCode, setRoomCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const suggestedRoom = useMemo(() => makeRoomCode(), []);

  const normalizedRoom = roomCode.trim().toLowerCase() || suggestedRoom;
  const normalizedName = displayName.trim();

  const roomHref = normalizedName
    ? `/watch/${normalizedRoom}?name=${encodeURIComponent(normalizedName)}`
    : `/watch/${normalizedRoom}`;

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1000px_700px_at_15%_10%,rgba(255,255,255,0.09),transparent_60%),radial-gradient(900px_600px_at_80%_25%,rgba(255,255,255,0.05),transparent_65%),radial-gradient(1100px_800px_at_50%_95%,rgba(255,255,255,0.06),transparent_70%)] blur-3xl" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:52px_52px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-neutral-950" />
      </div>

      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-white/40">
              Theater
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
              Screening Entry
            </h1>
            <p className="mt-4 max-w-3xl text-white/60">
              Enter CoVue through a named room. Create a code, choose your display
              identity, and step into a shared screening chamber.
            </p>
          </div>

          <Link
            href="/"
            className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
          >
            Return
          </Link>
        </div>

        <section className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <div className="rounded-[2rem] border border-white/10 bg-black/30 p-6 backdrop-blur-xl">
            <div className="text-xs uppercase tracking-[0.25em] text-white/40">
              Join or Create Room
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/40">
                  Room Code
                </label>
                <input
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  placeholder={suggestedRoom}
                  className="w-full rounded-[1.25rem] border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30"
                />
                <div className="mt-2 text-sm text-white/45">
                  Leave blank to use suggested room: {suggestedRoom}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/40">
                  Display Name
                </label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="enter your room name"
                  className="w-full rounded-[1.25rem] border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={roomHref}
                  className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-white/90"
                >
                  Enter Room
                </Link>

                <button
                  onClick={() => setRoomCode(makeRoomCode())}
                  className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
                >
                  New Room Code
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-black/30 p-6 backdrop-blur-xl">
            <div className="text-xs uppercase tracking-[0.25em] text-white/40">
              Current Path
            </div>

            <div className="mt-5 rounded-[1.25rem] border border-white/10 bg-black/30 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-white/35">
                Destination
              </div>
              <div className="mt-2 break-all text-sm text-white/70">
                {roomHref}
              </div>
            </div>

            <div className="mt-5 space-y-3 text-sm text-white/55">
              <p>Room code becomes the shared chamber identity.</p>
              <p>Display name gives presence a human-readable label.</p>
              <p>Next we can make Theater launches prefill room metadata more deeply.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
