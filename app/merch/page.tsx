import Link from "next/link";

export default function MerchPage() {
  const items = [
    {
      name: "Drop 01 Signal Hoodie",
      type: "Artifact 01",
      status: "Coming Soon",
      price: "$78",
      description:
        "Heavyweight black hoodie built around the Signal Crown Hybrid. A field uniform from the Control Room.",
      cta: "View Product",
      featured: true,
    },
    {
      name: "Control Room Tee",
      type: "Artifact 02",
      status: "Coming Soon",
      price: "—",
      description:
        "Clean front mark with a multi-panel back layout inspired by the live wall.",
      cta: "Coming Soon",
      featured: false,
    },
    {
      name: "Vault Hat",
      type: "Artifact 03",
      status: "Coming Soon",
      price: "—",
      description:
        "Minimal cap carrying a coded access mark from the chamber.",
      cta: "Coming Soon",
      featured: false,
    },
    {
      name: "Field Poster",
      type: "Artifact 04",
      status: "Concept",
      price: "—",
      description:
        "A collectible visual relic pulled from the Hamlo.wrld signal field.",
      cta: "Concept",
      featured: false,
    },
  ];

  const featuredItem = items[0];

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

          <Link
            href="/"
            className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
          >
            Return
          </Link>
        </div>

        <section className="mt-12 grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/35 p-8 backdrop-blur-xl">
            <div className="absolute inset-0 bg-[radial-gradient(700px_260px_at_20%_0%,rgba(255,255,255,0.12),transparent_55%)]" />
            <div className="relative z-10">
              <div className="text-xs uppercase tracking-[0.3em] text-white/40">
                Featured Artifact
              </div>
              <h2 className="mt-4 text-3xl font-semibold text-white md:text-4xl">
                {featuredItem.name}
              </h2>
              <div className="mt-3 text-sm uppercase tracking-[0.2em] text-white/45">
                {featuredItem.type}
              </div>
              <p className="mt-5 max-w-2xl text-white/60">
                {featuredItem.description}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-white/55">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 uppercase tracking-[0.2em]">
                  {featuredItem.status}
                </span>
                <span className="font-semibold text-white/70">{featuredItem.price}</span>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90">
                  {featuredItem.cta}
                </button>
                <button className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10">
                  Notify Me
                </button>
                <a
                  href="#collection"
                  className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
                >
                  View Collection
                </a>
              </div>

              <div className="mt-6 text-xs text-white/40">
                Stripe-ready product placeholder. We can connect this button to checkout next.
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-black/30 p-6 backdrop-blur-xl">
            <div className="text-xs uppercase tracking-[0.3em] text-white/40">
              Notes
            </div>
            <div className="mt-4 space-y-3 text-sm text-white/60">
              <p>Drop 01 is built around chamber uniforms and signal artifacts.</p>
              <p>The hoodie is the anchor piece for the first release.</p>
              <p>Checkout, billing, and release timing can be wired in next.</p>
            </div>
          </div>
        </section>

        <section id="collection" className="mt-14">
          <div className="mb-5 flex items-center justify-between">
            <div className="text-xs uppercase tracking-[0.3em] text-white/40">
              Collection
            </div>
            <div className="text-sm text-white/50">{items.length} items</div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {items.map((item) => (
              <div
                key={item.name}
                className={`group overflow-hidden rounded-[2rem] border bg-black/35 p-5 backdrop-blur-xl transition hover:border-white/20 ${
                  item.featured ? "border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.05)]" : "border-white/10"
                }`}
              >
                <div className="aspect-[4/5] rounded-[1.5rem] border border-white/10 bg-black/30" />
                <div className="mt-5 text-xs uppercase tracking-[0.25em] text-white/40">
                  {item.type}
                </div>
                <div className="mt-2 text-xl font-semibold text-white">
                  {item.name}
                </div>
                <div className="mt-2 text-sm text-white/60">
                  {item.description}
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/55">
                    {item.status}
                  </span>
                  <span className="text-sm font-semibold text-white/55">
                    {item.price}
                  </span>
                </div>
                <div className="mt-4">
<Link
  href={item.featured ? "/merch/drop-01-signal-hoodie" : "#"}
  className="block w-full rounded-full border border-white/10 bg-white/5 px-4 py-2 text-center text-sm font-semibold text-white/80 hover:bg-white/10"
>
  {item.cta}
</Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
