# Hamlo.wrld — Claude Code Context

This file is auto-loaded by Claude Code at the start of every session. It provides the context needed to work effectively on this repository without re-deriving it from scratch.

Read `PROJECT.md` for the full product vision, architecture, and launch blockers. Read `AGENTS.md` for the rules that govern all automated work in this repo.

---

## The Safety Rule

**Do not write, edit, or delete any application code without first explaining the exact plan and receiving explicit approval.** Name every file you will touch, describe what changes and why, and wait. This is non-negotiable.

---

## What This Project Is

Hamlo.wrld is an immersive digital world for artist Hamlo.wrld — not a generic portfolio site. It has: a music catalog, a code-gated content vault, a synchronized watch-party system (Theater / CoVue), a multi-stream broadcast wall (Control Room), in-browser skill games (Trials), a merchandise system (Artifacts), and email capture. The visual language is dark, monochrome, and metaphysical.

---

## Development Commands

```bash
npm run dev          # Start Next.js on http://localhost:3000
npm run build        # Production build
npm run lint         # ESLint
npx tsc --noEmit     # Type-check only (no build output)
```

The two WebSocket servers must be started separately for Theater and Control Room chat to work:
```bash
cd coveu-server && npx ts-node server.ts          # port 4000 (Theater rooms)
cd control-room-server && npx ts-node server.ts   # port 4100 (stream chat)
```

---

## Key Files to Know

| File | What it is |
|---|---|
| `app/page.tsx` | Homepage — the main drop page, all content inline |
| `app/layout.tsx` | Global HTML shell — renders `SignalBackdrop`, sets metadata (STILL PLACEHOLDER) |
| `app/globals.css` | Only file: Tailwind import + CSS variables |
| `lib/content.ts` | Music catalog data (`LISTEN_TRACKS`) |
| `lib/streamers.ts` | Control Room crew roster (`STREAM_MEMBERS`) |
| `lib/vault.ts` | Vault access code + quarter ID helper |
| `components/EmailCapture.tsx` | Reusable email form → `/api/signup` |
| `components/SignalBackdrop.tsx` | Animated canvas backdrop (global, on every page) |
| `app/api/signup/route.ts` | Email capture → Supabase `email_signups` |
| `app/api/score/route.ts` | Game score POST + leaderboard GET (Supabase `scores`) |
| `app/api/twitch/live/route.ts` | Twitch live status (Helix API, uncached token) |
| `coveu-server/server.ts` | CoVue WS server — Theater room logic |
| `control-room-server/server.ts` | Control Room WS server — stream chat logic |

---

## Open Launch Blockers (Priority Order)

1. **[CRITICAL] Credentials committed to git** — `.env.local` with live Supabase + Twitch secrets is in git history. Rotate all four credentials before any public access.
2. **[CRITICAL] WebSocket URLs hardcode `localhost`** — Theater (`ws://localhost:4000/ws`) and Control Room chat (`ws://localhost:4100/ws`) are broken on any deployed host. Must become env vars.
3. **[CRITICAL] Site metadata is the Next.js scaffold default** — `app/layout.tsx` still says "Create Next App". Every page has wrong title + description.
4. **[HIGH] Glyph Gauntlet never saves scores** — `/api/score` is built but the game never calls it. Wire the POST on game over; show leaderboard on the page.
5. **[HIGH] Vault code is in the client bundle** — `lib/vault.ts` exports the plaintext code. Move the check to a server-side API route reading from an env var.
6. **[HIGH] Merch checkout is not connected** — All buy/notify buttons are dead placeholders.
7. **[HIGH] Stale junk files** — `tatus --short` (26KB root file), `~p/` (empty root dir), `coveu-server/app/watch/[roomId]/page.tsx` (stale duplicate page).
8. **[MEDIUM] Twitch token not cached** — fetches a fresh OAuth token on every poll.
9. **[MEDIUM] Dead spawn code in Glyph Gauntlet** — `setInterval` block at lines ~172–222 clears itself immediately and does nothing. The real spawner is `async spawnLoop`.
10. **[MEDIUM] CosmicBackdrop / SignalBackdrop duplication** — Homepage has its own inline canvas backdrop on top of the global one. The gradient div pattern is copy-pasted across 5+ pages.

---

## Content Update Shortcuts

These are low-risk and can proceed without architectural review:

- **New track in catalog**: add to `LISTEN_TRACKS` in `lib/content.ts`
- **New streamer in Control Room**: add to `STREAM_MEMBERS` in `lib/streamers.ts` (platform must be `"Twitch"`)
- **Rotate vault code**: change `VAULT.accessCode` in `lib/vault.ts` (note: still client-visible until BLOCKER-5 is fixed)

---

## Code Conventions

- All pages are `"use client"` React components. No RSC in pages yet.
- Tailwind CSS only — no separate CSS files, no CSS Modules.
- TypeScript strict mode is on. No `any`, no `@ts-ignore`.
- No new packages without approval.
- No comments that describe what code does — only comments for non-obvious WHY.
- No emoji in source files.

---

## Architecture Notes (Things That Will Surprise You)

- **Two WebSocket servers run independently** from the Next.js process. They are not Next.js API routes. They must be deployed and kept running separately.
- **`SignalBackdrop` is in `layout.tsx`** and renders on every page. Some pages also render their own backdrop — the homepage has `CosmicBackdrop` inline, which means two canvas layers are active on that page.
- **The homepage `CONFIG` object** (in `app/page.tsx`) is the content source for the hero, tagline, merch preview items, and streaming links. It is not in `lib/` — it lives inside the component.
- **Role switching in CoVue rooms is unauthenticated.** Any visitor can click "Host" and gain control of the shared room source and playback. This is a known prototype limitation.
- **All rooms and chat are in-memory.** Restarting either WebSocket server wipes all active rooms, playback state, and chat history.
- **The Twitch parent domains** for the embed iframe are hardcoded in `control-room/page.tsx` as `["localhost", "hamlowrld.com", "www.hamlowrld.com"]`. If the domain changes, this array must be updated.

---

## Memory Notes

- The lead engineer has done a full architecture audit of this repo. The audit findings are the source of truth for `PROJECT.md`.
- The credential exposure in `.env.local` is a known critical issue documented in BLOCKER-1. Do not re-surface it as a new finding — it is tracked.
- The project owner understands the vault code is not truly secure (it's described in the UI as "vibe-first"). Any proposal to fix it should follow BLOCKER-5 guidance.
