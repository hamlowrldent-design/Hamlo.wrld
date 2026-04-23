export default function MerchPage() {
  const items = [
    {
      name: "Signal Hoodie",
      type: "Artifact 01",
      status: "Coming Soon",
      description: "Heavyweight black hoodie designed for late-night transmissions.",
    },
    {
      name: "Control Room Tee",
      type: "Artifact 02",
      status: "Coming Soon",
      description: "Clean front mark, signal language on the back.",
    },
    {
      name: "Vault Hat",
      type: "Artifact 03",
      status: "Coming Soon",
      description: "Minimal cap for those carrying the code.",
    },
    {
      name: "Field Poster",
      type: "Artifact 04",
      status: "Concept",
      description: "Visual relic from the Hamlo.wrld chamber.",
    },
  ];

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
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.25em] text-white/50">
              Artifacts
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-6xl">
              Wear the Signal
            </h1>
            <p className="mt-4 max-w-3xl text-white/60">
              Garments, objects, and relics from the Hamlo.wrld universe.
              Built as extensions of the vision, not just merchandise.
            </p>
          </div>

          <a
            href="/"
            className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
          >
            Return
          </a>
        </div>

        <section className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/35 p-8 backdrop-blur-xl">
            <div className="absolute inset-0 bg-[radial-gradient(700px_260px_at_20%_0%,rgba(255,255,255,0.12),transparent_55%)]" />
            <div className="relative z-10">
              <div className="text-xs uppercase tracking-[0.3em] text-white/40">
                Featured Drop
              </div>
              <h2 className="mt-4 text-3xl font-semibold text-white">
                Drop 01 — Signalwear
              </h2>
              <p className="mt-4 max-w-2xl text-white/60">
                First-wave wearable artifacts designed around the transmission,
                the chamber, and the vault. Dark, intentional, cosmic.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90">
                  Coming Soon
                </button>
                <a
                  href="#collection"
                  className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
                >
                  View Collection
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-black/30 p-6 backdrop-blur-xl">
            <div className="text-xs uppercase tracking-[0.3em] text-white/40">
              Notes
            </div>
            <div className="mt-4 space-y-3 text-sm text-white/60">
              <p>Artifacts will release in controlled drops.</p>
              <p>Some pieces may remain limited or vault-exclusive.</p>
              <p>Merch can evolve into uniforms, relics, and collector items.</p>
            </div>
          </div>
        </section>

        <section id="collection" className="mt-14">
          <div className="mb-5 flex items-center justify-between">
            <div className="text-xs uppercase tracking-[0.3em] text-white/40">
              Collection
            </div>
            <div className="text-sm text-white/50">4 items</div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {items.map((item) => (
              <div
                key={item.name}
                className="group overflow-hidden rounded-[2rem] border border-white/10 bg-black/35 p-5 backdrop-blur-xl transition hover:border-white/20"
              >
                <div className="aspect-[4/5] rounded-[1.5rem] border border-white/10 bg-black/30" />
                <div className="mt-5 text-xs uppercase tracking-[0.25em] text-white/40">
                  {item.type}
                </div>
                <div className="mt-2 text-xl font-semibold text-white">{item.name}</div>
                <div className="mt-2 text-sm text-white/60">{item.description}</div>
                <div className="mt-5 flex items-center justify-between">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/55">
                    {item.status}
                  </span>
                  <span className="text-sm text-white/40">—</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
