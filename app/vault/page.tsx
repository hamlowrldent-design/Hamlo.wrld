export default function VaultPage() {
  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-semibold tracking-tight">The Vault</h1>
        <p className="mt-4 text-lg opacity-80">
          Artifacts, drops, trials, and locked rooms. Coming online.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl border p-6">
            <h2 className="text-xl font-medium">Artifacts</h2>
            <p className="mt-2 opacity-80">
              Curated releases, notes, and objects.
            </p>
          </section>

<a href="/vault" className="underline">Vault</a>

          <section className="rounded-2xl border p-6">
            <h2 className="text-xl font-medium">Trials</h2>
            <p className="mt-2 opacity-80">
              Skill-based challenges and prototypes.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
