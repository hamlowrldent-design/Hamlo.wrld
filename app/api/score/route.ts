import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error(
    "Missing env vars: NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY"
  );
}

const supabase = createClient(url, serviceKey);

function asNumber(x: unknown): number | null {
  const n = typeof x === "number" ? x : Number(x);
  return Number.isFinite(n) ? n : null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const trial = typeof body.trial === "string" ? body.trial.trim() : "";
    const score = asNumber(body.score);
    const accuracy = asNumber(body.accuracy);
    const bestStreak = asNumber(body.bestStreak);
    const timeSurvivedMs = asNumber(body.timeSurvivedMs);

    if (!trial) {
      return NextResponse.json({ ok: false, error: "trial required" }, { status: 400 });
    }
    if (score == null || score < 0) {
      return NextResponse.json({ ok: false, error: "score invalid" }, { status: 400 });
    }
    if (accuracy == null || accuracy < 0 || accuracy > 1) {
      return NextResponse.json({ ok: false, error: "accuracy invalid" }, { status: 400 });
    }
    if (bestStreak == null || bestStreak < 0) {
      return NextResponse.json({ ok: false, error: "bestStreak invalid" }, { status: 400 });
    }
    if (timeSurvivedMs == null || timeSurvivedMs < 0) {
      return NextResponse.json({ ok: false, error: "timeSurvivedMs invalid" }, { status: 400 });
    }

    const { error } = await supabase.from("scores").insert({
      trial,
      score: Math.floor(score),
      accuracy,
      best_streak: Math.floor(bestStreak),
      time_survived_ms: Math.floor(timeSurvivedMs),
    });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
}

export async function GET(req: Request) {
  // Optional: simple leaderboard fetch (server-side) using query params
  const { searchParams } = new URL(req.url);
  const trial = (searchParams.get("trial") || "glyph-gauntlet").trim();
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || 25)));

  const { data, error } = await supabase
    .from("scores")
    .select("id, trial, score, accuracy, best_streak, time_survived_ms, created_at")
    .eq("trial", trial)
    .order("score", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, data });
}
