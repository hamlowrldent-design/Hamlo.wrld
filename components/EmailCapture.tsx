"use client";

import React, { useState } from "react";

export default function EmailCapture({ source = "homepage" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMsg("");

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setStatus("error");
        setMsg(data?.error ?? "Something went wrong");
        return;
      }

      setStatus("ok");
      setMsg("You’re in. Transmission received.");
      setEmail("");
    } catch {
      setStatus("error");
      setMsg("Network error");
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="w-full max-w-sm rounded-2xl border border-white/15 bg-black/55 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-white/20"
      />

      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90 disabled:opacity-60"
      >
        {status === "loading" ? "Sending…" : "Join"}
      </button>

      {msg ? (
        <div className={`text-sm ${status === "ok" ? "text-white/70" : "text-red-200/80"}`}>
          {msg}
        </div>
      ) : null}
    </form>
  );
}
