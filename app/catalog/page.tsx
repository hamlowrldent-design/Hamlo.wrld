import { LISTEN_TRACKS, type Platform } from "@/lib/content";

function platformPill(platform: Platform) {
  switch (platform) {
    case "YouTube":
      return "border-red-500/30 bg-red-500/10 text-red-100/90";
    case "Apple Music":
      return "border-white/20 bg-white/10 text-white/80";
    case "BandLab":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-100/90";
  }
}

export default function ListenPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_20%_10%,rgba(255,255,255,0.08),transparent_60%),radial-gradient(900px_600px_at_80%_35%,rgba(255,255,255,0.05),transparent_65%)] blur-2xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-neutral-950" />
      </div>

      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
              Transmission Log
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight">Listen</h1>
            <p className="mt-3 max-w-2xl text-white/60">
              First batch. Public transmissions across platforms.
            </p>
          </div>

          <a
            href="/"
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            Return
          </a>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {LISTEN_TRACKS.map((t) => (
            <div
              key={t.title}
              className="rounded-3xl border border-white/10 bg-black/35 p-6 backdrop-blur"
            >
              <div className="text-xl font-semibold">{t.title}</div>

              <div className="mt-4 flex flex-wrap gap-2">
                {t.links.map((l) => (
                  <a
                    key={`${t.title}-${l.platform}-${l.url}`}
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold hover:opacity-90 ${platformPill(
                      l.platform
                    )}`}
                  >
                    {l.platform}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
