export default function Drop01SignalHoodiePage() {
  const sizes = ["S", "M", "L", "XL", "XXL"];

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1000px_700px_at_15%_10%,rgba(255,255,255,0.09),transparent_60%),radial-gradient(900px_600px_at_80%_25%,rgba(255,255,255,0.05),transparent_65%),radial-gradient(1100px_800px_at_50%_95%,rgba(255,255,255,0.06),transparent_70%)] blur-3xl" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:52px_52px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-neutral-950" />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-white/40">
              Artifacts / Drop 01
            </div>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
              Drop 01 Signal Hoodie
            </h1>
          </div>

          <a
            href="/merch"
            className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
          >
            Back to Artifacts
          </a>
        </div>

        <section className="mt-10 grid gap-8 lg:grid-cols-[1.05fr_.95fr]">
          <div className="rounded-[2rem] border border-white/10 bg-black/35 p-5 backdrop-blur-xl">
            <div className="aspect-[4/5] rounded-[1.5rem] border border-white/10 bg-black/30" />
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="aspect-square rounded-[1rem] border border-white/10 bg-black/30" />
              <div className="aspect-square rounded-[1rem] border border-white/10 bg-black/30" />
              <div className="aspect-square rounded-[1rem] border border-white/10 bg-black/30" />
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-black/30 p-7 backdrop-blur-xl">
            <div className="text-xs uppercase tracking-[0.25em] text-white/40">
              Artifact 01
            </div>

            <div className="mt-4 flex items-center gap-4">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/55">
                Coming Soon
              </span>
              <span className="text-2xl font-semibold text-white/80">$78</span>
            </div>

            <p className="mt-6 text-base leading-relaxed text-white/65">
              Heavyweight black hoodie built around the Signal Crown Hybrid.
              Designed as a field uniform from the Control Room.
            </p>

            <div className="mt-8">
              <div className="text-xs uppercase tracking-[0.25em] text-white/40">
                Sizes
              </div>
              <div className="mt-3 flex flex-wrap gap-3">
                {sizes.map((size) => (
                  <button
                    key={size}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/75 hover:bg-white/10"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <div className="text-xs uppercase tracking-[0.25em] text-white/40">
                Details
              </div>
              <div className="mt-3 space-y-2 text-sm text-white/60">
                <p>Color: Washed Black</p>
                <p>Print: Faded Silver / Bone</p>
                <p>Fit: Oversized</p>
                <p>Category: Heavyweight Hoodie</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90">
                Buy Placeholder
              </button>
              <button className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10">
                Notify Me
              </button>
            </div>

            <div className="mt-5 text-xs text-white/40">
              Stripe-ready product page placeholder. Checkout can connect here next.
            </div>
          </div>
        </section>

        <section className="mt-12 rounded-[2rem] border border-white/10 bg-black/30 p-7 backdrop-blur-xl">
          <div className="text-xs uppercase tracking-[0.3em] text-white/40">
            Product Story
          </div>
          <div className="mt-4 max-w-4xl space-y-4 text-sm leading-relaxed text-white/60">
            <p>
              Drop 01 starts with the hoodie as the anchor artifact. The front carries
              a quiet access sigil. The back expands into a larger evolved signal mark
              shaped by celestial structure and control-room language.
            </p>
            <p>
              Built to feel more like a chamber uniform than standard merch, this piece
              is meant to carry the Hamlo.wrld atmosphere into the physical world.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
