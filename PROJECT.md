# Hamlo.wrld — Project Document

## Product Vision

Hamlo.wrld is not a generic artist website. It is an immersive world — a digital universe built around the music, persona, and creative network of Hamlo.wrld.

The site is designed to feel like entering a dimension, not browsing a portfolio. Every section has a conceptual name, a distinct visual atmosphere, and a purpose that extends beyond the typical artist page:

- **Music** is called "Transmission" — released tracks and unreleased signals.
- **Merch** is called "Artifacts" — physical objects from the world, not generic merchandise.
- **The Vault** is a sealed chamber with seasonal code access for unreleased content.
- **Theater** (internally "CoVue") is a synchronized watch-party system — a shared screening chamber.
- **Control Room** is a multi-stream broadcast wall for the crew's live sessions.
- **Games** ("Trials") are competitive skill chambers built in-house, myth-coded with their own lore.
- **The Catalog** is the full transmission log — every released track across platforms.

Brand direction: intentional, metaphysical, disciplined. Dark aesthetic, monochrome palette, subtle animated light. Every feature should feel like it belongs to this world. Universe language: signals, transmissions, chambers, trials, artifacts, vaults, dormant/active states.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.1.6 (App Router) |
| Runtime | React 19 + TypeScript 5 |
| Styling | Tailwind CSS v4 (PostCSS plugin mode) |
| Animation | Framer Motion 12 |
| Icons | Lucide React |
| Database | Supabase (PostgreSQL via `@supabase/supabase-js`) |
| External APIs | Twitch Helix API (live stream status) |
| WebSocket servers | Two standalone Node.js / Express + `ws` servers |
| Fonts | Geist Sans + Geist Mono via `next/font/google` |

---

## Routing Structure

| URL | Purpose |
|---|---|
| `/` | Homepage — hero, manifesto, music embed, artifacts preview, email capture |
| `/vault` | Code-gated archive of unreleased transmissions |
| `/catalog` | Full music catalog (YouTube, Apple Music, BandLab) |
| `/theater` | Watch-party lobby — enter or create a room code |
| `/watch/[roomId]` | CoVue room — shared playback, presence, chat |
| `/control-room` | Multi-stream broadcast wall with viewer layout controls |
| `/merch` | Artifacts index — all drops |
| `/merch/drop-01-signal-hoodie` | Signal Hoodie product detail page |
| `/games` | Trials lobby — lists all chambers |
| `/games/glyph-gauntlet` | Live game — click true glyphs, avoid bait |
| `/games/reflex` | Stub — not yet built |
| `/games/library` | Games library — MUGEN and crew game ecosystem |
| `/api/signup` | POST — email capture → Supabase `email_signups` table |
| `/api/score` | POST score, GET leaderboard — Supabase `scores` table |
| `/api/twitch/live` | GET — Twitch Helix live status for all stream members |

---

## Key Source Files

### Data layer (`lib/`)
- **`lib/content.ts`** — `LISTEN_TRACKS`: all released music with platform links. Add new tracks here.
- **`lib/streamers.ts`** — `STREAM_MEMBERS`: Control Room crew roster. Add streamers here.
- **`lib/vault.ts`** — `VAULT.accessCode` (the seasonal gate code) + `currentQuarterId()`. Rotate the code here each quarter.

### Shared components (`components/`)
- **`components/EmailCapture.tsx`** — Reusable email signup form. Calls `/api/signup`.
- **`components/SignalBackdrop.tsx`** — Global animated canvas backdrop (matrix-style glyphs). Rendered in `app/layout.tsx` on every page.

### API routes (`app/api/`)
- **`app/api/signup/route.ts`** — Validates email, upserts into Supabase `email_signups`.
- **`app/api/score/route.ts`** — Validates and inserts game scores; leaderboard GET endpoint. Used by Glyph Gauntlet (not yet wired in the game UI).
- **`app/api/twitch/live/route.ts`** — Fetches fresh Twitch App Access Token, calls Helix `/streams`, returns live map.

---

## Backend Services

### Supabase
- `email_signups` table: `email`, `source`, timestamps. Upserts on `email`.
- `scores` table: `trial`, `score`, `accuracy`, `best_streak`, `time_survived_ms`, `created_at`.
- API routes use the **service role key** — full DB access, bypasses Row Level Security. This key must never appear in client-side code.

### Twitch Helix API
- Checks live status for all `STREAM_MEMBERS` where `platform === "Twitch"`.
- Currently fetches a new OAuth token on every call (not cached). Token lifetime is several hours.
- Control Room polls `/api/twitch/live` every 60 seconds while the page is open.

### CoVue WebSocket Server (`coveu-server/server.ts`, port 4000)
- Manages Theater watch rooms: presence tracking, shared media source, shared playback state, room chat (capped at 100 messages).
- Entirely in-memory. Rooms are created on demand and deleted when empty. A server restart wipes all state.

### Control Room WebSocket Server (`control-room-server/server.ts`, port 4100)
- Manages per-streamer chat panels on the Control Room page.
- Entirely in-memory. Chat capped at 200 messages per stream room.

---

## Current Feature Status

| Feature | Status |
|---|---|
| Homepage (hero, manifesto, music embed, merch preview, email) | Working |
| Email capture → Supabase | Working |
| Music Catalog (18 tracks) | Working |
| Vault (code gate, localStorage unlock persistence) | Working — code is in client bundle (not truly secure) |
| Theater lobby (room entry/creation) | Working |
| CoVue watch room (source, playback, presence, chat) | Working locally only (localhost WebSocket) |
| Control Room (multi-stream wall, layout modes, Twitch sync) | Working locally only (localhost WebSocket) |
| Twitch live status sync | Working (uncached token, adds latency) |
| Glyph Gauntlet game | Playable — no score saving or leaderboard |
| `/api/score` endpoint | Built — not called by any game UI yet |
| Merch pages (Artifacts index, Hoodie PDP) | UI only — no checkout connected |
| Games Library | UI only — placeholder links |
| Reflex trial | Navigation stub only |

---

## Launch Blockers

### CRITICAL — Must be resolved before any public URL is shared

**[BLOCKER-1] Credentials exposed in the repository.**
`.env.local` contains live Supabase service role key, anon key, Twitch client ID, and Twitch client secret. These were committed to git history. All four must be rotated in their respective dashboards. The file must then be scrubbed from git history before the repo is made public or shared.

**[BLOCKER-2] WebSocket servers hardcode `localhost`.**
`/watch/[roomId]/page.tsx` connects to `ws://localhost:4000/ws`.
`/control-room/page.tsx` connects to `ws://localhost:4100/ws`.
Theater and Control Room chat are completely non-functional on any deployed host. These URLs must come from environment variables.

**[BLOCKER-3] Site metadata is still the Next.js scaffold default.**
`app/layout.tsx` has `title: "Create Next App"` and `description: "Generated by create next app"`. Every page inherits these. Search results and social link previews will show wrong content.

### HIGH — Before public launch

**[BLOCKER-4] Glyph Gauntlet never saves scores.**
`/api/score` is implemented and connected to Supabase. The game end screen says "Score saving + global leaderboard comes next" but never calls the API. The `POST /api/score` call must be wired into the game-over flow, and the leaderboard GET must be surfaced on the game page.

**[BLOCKER-5] Vault access code is readable in the browser.**
`lib/vault.ts` exports `VAULT.accessCode = "FROSTY"` — this is bundled into client-side JavaScript and visible to anyone who opens DevTools. The unlock check must move to a server-side API route that reads the code from an environment variable.

**[BLOCKER-6] Merch checkout is not connected.**
All "Buy" and "Notify Me" buttons on `/merch` and `/merch/drop-01-signal-hoodie` are inert placeholders. Stripe checkout or a waitlist/notify-me form must be connected before the drop is announced publicly.

**[BLOCKER-7] Stale and junk files in the repository.**
- `tatus --short` — a 26KB file at the repository root, created accidentally by a git command redirect. Should be deleted.
- `~p/` — an empty directory at the repository root, likely a shell expansion artifact. Should be deleted.
- `coveu-server/app/watch/[roomId]/page.tsx` — a stale duplicate of the CoVue room page from an earlier build phase, not served by Next.js. Should be deleted.

### MEDIUM — Quality improvements before launch

**[BLOCKER-8] Twitch token is fetched fresh on every API call.**
`/api/twitch/live` performs two HTTP requests per invocation (OAuth token + stream query). Token lifetime is hours. A module-level cache with an expiry check would reduce this to one request for most calls.

**[BLOCKER-9] Dead spawn code in Glyph Gauntlet.**
There is a `setInterval`-based spawn system in `glyph-gauntlet/page.tsx` (lines ~172–222) that starts and immediately clears itself twice, doing nothing. The real spawner is the `async spawnLoop` below it. The dead code should be removed to avoid confusion.

**[BLOCKER-10] CosmicBackdrop duplicates SignalBackdrop.**
The global layout renders `SignalBackdrop` on every page. The homepage then renders its own `CosmicBackdrop` — a 140-line near-duplicate — on top of it. The atmospheric gradient `div` pattern is also copy-pasted verbatim across Theater, Control Room, Watch Room, Merch, and Games Library pages. These should be unified into a shared component.

---

## Brand Reference

- Artist name: **Hamlo.wrld**
- Primary releases: **CAREFUL**, **MIDAS**
- Core tagline: *"Asked the devil what she'd take — told me more than I could make. Transmutation has a cost."*
- Visual language: dark near-black backgrounds, white type, glass-blur rounded cards, animated starfield/glyph backdrops, no loud color — only subtle tonal gradients.
- Conceptual frame: transformation under pressure, consequence, becoming what you feared you could not survive.
