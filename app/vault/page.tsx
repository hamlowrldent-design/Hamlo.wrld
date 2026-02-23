"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Lock, Unlock, Sparkles } from "lucide-react";
import { VAULT, currentQuarterId } from "@/lib/vault";

type VaultItem = {
  id: string;
  title: string;
  note: string;
  url: string; // unlisted YouTube links
};

const VAULT_ITEMS: VaultItem[] = [
  {
    id: "v1",
    title: "Unreleased // Transmission 01",
    note: "Unlisted YouTube link goes here.",
    url: "#",
  },
  {
    id: "v2",
    title: "Unreleased // Transmission 02",
    note: "Unlisted YouTube link goes here.",
    url: "#",
  },
  {
    id: "v3",
    title: "Unreleased // Transmission 03",
    note: "Unlisted YouTube link goes here.",
    url: "#",
  },
];

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export default function VaultPage() {
  const [code, setCode] = useState("");
  const [open, setOpen] = useState(false);
  const [shake, setShake] = useState(false);

  const qid = useMemo(() => currentQuarterId(), []);

  useEffect(() => {
    const saved = window.localStorage.getItem("hamlo_vault_open");
    const savedQ = window.localStorage.getItem("hamlo_vault_quarter");
    if (saved === "1" && savedQ === qid) setOpen(true);
  }, [qid]);

  function attempt(e: React.FormEvent) {
    e.preventDefault();
    const ok = code.trim().toUpperCase() === VAULT.accessCode.toUpperCase();

    if (!ok) {
      setShake(true);
      setTimeout(() => setShake(false), 450);
      return;
    }

    setOpen(true);
    window.localStorage.setItem("hamlo_vault_open", "1");
    window.localStorage.setItem("hamlo_vault_quarter", qid);
  }

  function relock() {
    setOpen(false);
    window.localStorage.setItem("hamlo_vault_open", "0");
    window.localStorage.setItem("hamlo_vault_quarter", qid);
    setCode("");
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      {/* Atmosphere */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_20%_10%,rgba(255,255,255,0.09),transparent_60%),radial-gradient(900px_600px_at_80%_35%,rgba(255,255,255,0.06),transparent_65%),radial-gradient(1000px_700px_at_45%_90%,rgba(255,255,255,0.05),transparent_70%)] blur-2xl" />
        <div className="absolute inset-0 opacity-[0.08] mix-blend-overlay [background-image:url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22160%22 height=%22160%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22160%22 height=%22160%22 filter=%22url(%23n)%22 opacity=%220.55%22/%3E%3C/svg%3E')]"/>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-neutral-950" />
      </div>

      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
              <Sparkles className="h-3.5 w-3.5" />
              Interdimensional Chamber
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight">
              The Vault
            </h1>
            <p className="mt-3 max-w-2xl text-white/60">
              A sealed room between eras. Unreleased transmissions live here.
              Code rotates quarterly. Current cycle: <span className="text-white/80">{qid}</span>
            </p>
          </div>

          <a
            href="/"
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            Return
          </a>
        </div>

        <div className="mt-10 rounded-[2rem] border border-white/10 bg-black/35 p-6 backdrop-blur md:p-10">
          {!open ? (
            <div className="grid gap-8 md:grid-cols-[1.1fr_.9fr] md:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                  <Lock className="h-3.5 w-3.5" />
                  Locked
                </div>
                <div className="mt-4 text-lg font-semibold text-white">
                  Speak the seasonal word.
                </div>
                <p className="mt-2 text-sm text-white/60">
                  The chamber listens for the correct frequency.
                </p>
              </div>

              <motion.form
                onSubmit={attempt}
                animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
                transition={{ duration: 0.45 }}
                className="flex flex-col gap-3"
              >
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter code"
                  className="w-full rounded-2xl border border-white/15 bg-black/55 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-white/20"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90"
                >
                  Unlock <Unlock className="h-4 w-4 opacity-70" />
                </button>
                <div className="text-xs text-white/45">
                  This is a lightweight gate (vibe-first). We can upgrade to real auth later.
                </div>
              </motion.form>
            </div>
          ) : (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                  <Unlock className="h-3.5 w-3.5" />
                  Open
                </div>
                <button
                  onClick={relock}
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
                >
                  Relock
                </button>
              </div>

              <div className="mt-7 grid gap-4 md:grid-cols-2">
                {VAULT_ITEMS.map((x) => {
                  const disabled = x.url === "#";
                  return (
                    <a
                      key={x.id}
                      href={disabled ? undefined : x.url}
                      target={disabled ? undefined : "_blank"}
                      rel={disabled ? undefined : "noreferrer"}
                      className={classNames(
                        "rounded-3xl border border-white/10 bg-black/40 p-5 backdrop-blur transition",
                        disabled
                          ? "opacity-60 cursor-not-allowed"
                          : "hover:bg-black/35"
                      )}
                      onClick={(e) => {
                        if (disabled) e.preventDefault();
                      }}
                    >
                      <div className="text-xs uppercase tracking-[0.3em] text-white/40">
                        Unreleased
                      </div>
                      <div className="mt-2 text-lg font-semibold text-white">
                        {x.title}
                      </div>
                      <div className="mt-2 text-sm text-white/60">{x.note}</div>
                      <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white/80">
                        Open <ExternalLink className="h-4 w-4 opacity-70" />
                      </div>
                    </a>
                  );
                })}
              </div>

              <div className="mt-8 text-sm text-white/50">
                Tip: paste unlisted YouTube links into <span className="text-white/70">VAULT_ITEMS</span>.
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
