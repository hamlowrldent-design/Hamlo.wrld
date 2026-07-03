import Link from "next/link";

export default function ReflexTrialPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight">Trial I — Reflex</h1>
        <p className="mt-4 text-white/70">
          Prototype chamber. We’ll build the accuracy + survival mechanics here next.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/games"
            className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
          >
            Back to Trials
          </Link>
          <Link
            href="/"
            className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
          >
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
