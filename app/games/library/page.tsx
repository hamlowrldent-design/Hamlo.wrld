export default function GamesLibraryPage() {
  const games = [
    {
      name: "MUGEN",
      type: "Featured Build",
      status: "Crew Title",
      platform: "PC",
      description:
        "A customizable 2D fighting engine known for massive fan-built rosters and crossover battles. This is one of the key games in the Hamlo.wrld ecosystem.",
      sourceLabel: "Source / Setup",
      href: "#",
      notes:
        "Use official engine sources and your own lawful character/content setup. Community builds can vary heavily.",
      featured: true,
    },
    {
      name: "Future Arena 01",
      type: "Placeholder",
      status: "Planned",
      platform: "PC / Browser",
      description:
        "Reserved for another shared game the crew wants in rotation.",
      sourceLabel: "Coming Soon",
      href: "#",
      notes:
        "This slot can become a full game page later with install notes and play guidance.",
      featured: false,
    },
    {
      name: "Future Trial 02",
      type: "Placeholder",
      status: "Planned",
      platform: "Browser",
      description:
        "Reserved for a lighter game or experimental chamber trial.",
      sourceLabel: "Coming Soon",
      href: "#",
      notes:
        "Good place for a browser-native title or one of your own future builds.",
      featured: false,
    },
  ];

  const featuredGame = games[0];

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
              Games Library
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-6xl">
              Paths to Play
            </h1>
            <p className="mt-4 max-w-3xl text-white/60">
              A curated library of the games the crew plays, studies, and builds
              around. This page helps people find the path into the same shared
              game ecosystem.
            </p>
          </div>

          <a
            href="/games"
            className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
          >
            Back to Games
          </a>
        </div>

        <section className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/35 p-8 backdrop-blur-xl">
            <div className="absolute inset-0 bg-[radial-gradient(700px_260px_at_20%_0%,rgba(255,255,255,0.12),transparent_55%)]" />
            <div className="relative z-10">
              <div className="text-xs uppercase tracking-[0.3em] text-white/40">
                Featured Title
              </div>
              <h2 className="mt-4 text-3xl font-semibold text-white md:text-4xl">
                {featuredGame.name}
              </h2>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/55">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 uppercase tracking-[0.2em]">
                  {featuredGame.type}
                </span>
                <span>{featuredGame.platform}</span>
                <span>•</span>
                <span>{featuredGame.status}</span>
              </div>
              <p className="mt-5 max-w-2xl text-white/60">
                {featuredGame.description}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={featuredGame.href}
                  className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90"
                >
                  {featuredGame.sourceLabel}
                </a>
                <button className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10">
                  Build Notes
                </button>
              </div>

              <div className="mt-6 text-xs text-white/40">
                Source links can be replaced with the real game path, install page,
                or community setup guide later.
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-black/30 p-6 backdrop-blur-xl">
            <div className="text-xs uppercase tracking-[0.3em] text-white/40">
              Library Notes
            </div>
            <div className="mt-4 space-y-3 text-sm text-white/60">
              <p>Use this page to guide people to the same games your group plays.</p>
              <p>Keep source links official or otherwise clearly lawful.</p>
              <p>Game-specific pages can later include setup, controllers, and stream notes.</p>
            </div>
          </div>
        </section>

        <section className="mt-14">
          <div className="mb-5 flex items-center justify-between">
            <div className="text-xs uppercase tracking-[0.3em] text-white/40">
              Library
            </div>
            <div className="text-sm text-white/50">{games.length} titles</div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {games.map((game) => (
              <div
                key={game.name}
                className={`overflow-hidden rounded-[2rem] border bg-black/35 p-6 backdrop-blur-xl ${
                  game.featured
                    ? "border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.05)]"
                    : "border-white/10"
                }`}
              >
                <div className="aspect-[16/10] rounded-[1.5rem] border border-white/10 bg-black/30" />
                <div className="mt-5 text-xs uppercase tracking-[0.25em] text-white/40">
                  {game.type}
                </div>
                <div className="mt-2 text-2xl font-semibold text-white">
                  {game.name}
                </div>
                <div className="mt-2 text-sm text-white/50">
                  {game.platform} • {game.status}
                </div>
                <div className="mt-4 text-sm text-white/60">
                  {game.description}
                </div>
                <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-black/30 p-4 text-sm text-white/55">
                  {game.notes}
                </div>
                <div className="mt-5">
                  <a
                    href={game.href}
                    className="block w-full rounded-full border border-white/10 bg-white/5 px-4 py-2 text-center text-sm font-semibold text-white/80 hover:bg-white/10"
                  >
                    {game.sourceLabel}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
