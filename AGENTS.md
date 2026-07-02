# Hamlo.wrld — Agent Guidelines

This document governs how AI agents (Claude Code or any other automated system) work in this repository. Read it fully before taking any action.

---

## The One Non-Negotiable Rule

**No agent may write, edit, or delete any application code without first:**
1. Stating exactly what it plans to change and why.
2. Identifying every file that will be touched.
3. Waiting for explicit approval from the human operator.

This applies to all code — TypeScript, CSS, config files, server files, HTML, and shell scripts. It does not apply to reading files, running non-destructive commands (`next build`, `npx tsc --noEmit`, `git status`, `git log`), or editing the governance documents (`PROJECT.md`, `AGENTS.md`, `CLAUDE.md`).

When in doubt, explain and wait. Do not act speculatively.

---

## What This Project Is

Hamlo.wrld is an immersive creative world, not a standard artist page. It has music, synchronized watch parties, a multi-stream broadcast wall, in-browser games with a leaderboard, a code-gated content vault, and a merch/artifact system. The product vision and complete feature map are in `PROJECT.md`. Read it before doing any work.

The aesthetic is intentional: dark, monochrome, metaphysical. Do not introduce visual patterns, copy, or interactions that break from this voice without explicit direction.

---

## Repository Layout

```
app/                  Next.js App Router pages and API routes
components/           Shared React components (only 2 exist today)
lib/                  Data modules — content, streamers, vault config
coveu-server/         Standalone WS server for Theater watch rooms (port 4000)
control-room-server/  Standalone WS server for Control Room chat (port 4100)
public/               Static assets
PROJECT.md            Product vision, architecture, launch blockers
AGENTS.md             This file — rules for automated agents
CLAUDE.md             Claude Code context and commands
```

---

## Environment

The project requires environment variables to function. They live in `.env.local` at the repository root (not committed to git after the initial mistake — see BLOCKER-1 in `PROJECT.md`).

Required variables:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
TWITCH_CLIENT_ID
TWITCH_CLIENT_SECRET
```

WebSocket server URLs are currently hardcoded to `localhost` in the application code. They must become environment variables before any deployment:
```
NEXT_PUBLIC_COVUE_WS_URL       (points to coveu-server, port 4000)
NEXT_PUBLIC_CONTROL_ROOM_WS_URL (points to control-room-server, port 4100)
```

**Never log, echo, or expose the values of any secret environment variable in any output, commit message, or document.**

---

## Development Commands

```bash
# Start the Next.js dev server
npm run dev

# Type-check without building
npx tsc --noEmit

# Lint
npm run lint

# Build for production
npm run build

# Start the CoVue Theater server (separate terminal, port 4000)
cd coveu-server && npx ts-node server.ts

# Start the Control Room chat server (separate terminal, port 4100)
cd control-room-server && npx ts-node server.ts
```

All three processes (Next.js + two WS servers) must be running for Theater and Control Room features to work locally.

---

## Launch Blockers — Agent Awareness

Agents must be aware of these open issues and must not take actions that make them worse:

| ID | Issue | Severity |
|---|---|---|
| BLOCKER-1 | Credentials were committed to git; must be rotated and scrubbed from history | CRITICAL |
| BLOCKER-2 | WebSocket URLs hardcode `localhost` — feature is broken on any deployed host | CRITICAL |
| BLOCKER-3 | Site metadata is still the Next.js scaffold default ("Create Next App") | CRITICAL |
| BLOCKER-4 | Glyph Gauntlet never calls `/api/score` — scores are not saved | HIGH |
| BLOCKER-5 | Vault access code is in the client JS bundle — not a real security gate | HIGH |
| BLOCKER-6 | Merch "Buy" and "Notify Me" buttons are dead placeholders | HIGH |
| BLOCKER-7 | Stale files: `tatus --short`, `~p/`, `coveu-server/app/watch/[roomId]/page.tsx` | HIGH |
| BLOCKER-8 | Twitch API token is fetched fresh on every poll (no caching) | MEDIUM |
| BLOCKER-9 | Dead `setInterval` spawn code in Glyph Gauntlet | MEDIUM |
| BLOCKER-10 | `CosmicBackdrop` / `SignalBackdrop` duplication across pages | MEDIUM |

Full descriptions of each blocker are in `PROJECT.md`.

---

## Content Data — How to Make Common Updates

These are safe to do without architectural review:

**Add a new track to the catalog**
Edit `lib/content.ts` → add an entry to `LISTEN_TRACKS`. Supported platforms: `"YouTube"`, `"Apple Music"`, `"BandLab"`.

**Add a streamer to the Control Room**
Edit `lib/streamers.ts` → add an entry to `STREAM_MEMBERS`. Platform must currently be `"Twitch"`. `channelName` must match the Twitch login name exactly (lowercase).

**Rotate the Vault access code**
Edit `lib/vault.ts` → change `VAULT.accessCode`. Note: until BLOCKER-5 is resolved, this value is visible in the client JS bundle. A server-side check is required for real security.

**Update merch copy or pricing**
Merch data lives inline in `app/merch/page.tsx` and `app/merch/drop-01-signal-hoodie/page.tsx`. These are not yet extracted to `lib/`. Propose a plan before restructuring them.

---

## Code Standards

- All components use Tailwind CSS utility classes. Do not introduce external CSS files or CSS Modules.
- All pages are `"use client"` React components. The project does not yet use React Server Components in page files (only API routes benefit from server execution).
- TypeScript strict mode is on (`tsconfig.json`). Do not use `any` types or `// @ts-ignore`.
- Do not install new packages without explicit approval. Evaluate whether the existing stack (`framer-motion`, `lucide-react`, `@supabase/supabase-js`) can solve the problem first.
- Do not add comments explaining what code does. Add a comment only when a non-obvious constraint, workaround, or invariant needs to be documented.
- Do not add emoji to source files.

---

## What Agents Must Not Do (Without Explicit Instruction)

- Edit `.env.local` or any file containing secrets.
- Delete files (even junk files like `tatus --short` — propose deletion and wait for approval).
- Create git commits.
- Push to any remote.
- Run `git reset`, `git rebase`, `git push --force`, or any destructive git operation.
- Install npm packages.
- Modify `package.json` or `package-lock.json`.
- Change the Supabase schema or run migrations.
- Change Twitch API credentials or application settings.
- Open ports or start servers without being asked.
- Bypass TypeScript errors with `any` or `@ts-ignore`.
- Add third-party tracking scripts or analytics without explicit approval.

---

## Tone and Communication Style

When reporting findings or proposing changes, be direct and specific:
- Name the exact file and line number.
- State what the current behavior is and what the desired behavior is.
- Describe any side effects or risks.
- Keep it concise — one clear paragraph per issue, not essays.

When uncertain whether a change falls within scope, ask before acting.
