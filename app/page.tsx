"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Music2,
  ShoppingBag,
  ExternalLink,
  Mail,
  Instagram,
  Youtube,
  Twitter,
  Sparkles,
} from "lucide-react";

import EmailCapture from "@/components/EmailCapture";

// Cosmic / Abstract / Layered / Dark version
// Brand direction: intentional, metaphysical, disciplined.

const CONFIG = {
  artistName: "Hamlo.wrld",
  dropTitle: "CAREFUL",
  dropTagline:
    "Asked the devil what she’d take — told me more than I could make. Transmutation has a cost.",

  heroImage:
    "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=2400&q=80",

  coverArt:
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",

  links: {
    spotify: "#",
    appleMusic: "https://music.apple.com/us/album/careful-single/1871918849",
    youtube: "#",
    soundcloud: "#",
  },

  embeds: {
    spotifyEmbed: "",
    youtubeEmbed: "https://www.youtube.com/embed/ybA7XhVSMjw",
  },

  merch: [
    {
      id: "uniform-01",
      name: "Uniform // Black",
      price: "$",
      note: "Manual fulfillment",
      image:
        "https://images.unsplash.com/photo-1520975869875-9d3ee8a859ab?auto=format&fit=crop&w=1200&q=80",
      url: "#",
    },
    {
      id: "artifact-01",
      name: "Artifact // Hoodie",
      price: "$",
      note: "Limited run",
      image:
        "https://images.unsplash.com/photo-1520975940175-6c2b0f0d7db1?auto=format&fit=crop&w=1200&q=80",
      url: "#",
    },
  ],

  emailCapture: {
    enabled: true,
  },

  social: {
    instagram: "#",
    youtube: "#",
    twitter: "#",
  },
};

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

const FadeIn = ({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.85, delay }}
  >
    {children}
  </motion.div>
);

type MerchItem = {
  id: string;
  name: string;
  price: string;
  note: string;
  image: string;
  url: string;
};


function MerchCard({ item }: { item: MerchItem }) {
  return (
    <motion.a
      href={item.url}
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur"
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="space-y-1 p-5">
        <h3 className="text-base font-semibold tracking-wide text-white">
          {item.name}
        </h3>
        <p className="text-sm text-white/60">{item.note}</p>
        <div className="pt-2 text-sm font-semibold text-white/90">
          {item.price}
        </div>
      </div>
    </motion.a>
  );
}

function CosmicBackdrop() {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [variant, setVariant] = useState(0);

  // Background variants: subtle changes in blob positions + intensity.
  const variants = useMemo(
    () => [
      { a: "20% 10%", b: "80% 30%", c: "30% 85%", o: 0.38 },
      { a: "15% 35%", b: "85% 15%", c: "60% 85%", o: 0.32 },
      { a: "35% 15%", b: "70% 45%", c: "20% 80%", o: 0.36 },
      { a: "25% 25%", b: "90% 40%", c: "45% 90%", o: 0.34 },
      { a: "10% 20%", b: "75% 20%", c: "70% 85%", o: 0.30 },
    ],
    []
  );

  // Cycle variants slowly.
  useEffect(() => {
    const t = setInterval(() => {
      setVariant((v) => (v + 1) % variants.length);
    }, 14000);
    return () => clearInterval(t);
  }, [variants.length]);

  // Starfield canvas (subtle drift, regenerates on resize).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
if (!ctx) return;


    let w = 0;
    let h = 0;
    let raf = 0;

    const DPR = Math.min(2, window.devicePixelRatio || 1);

    const rand = (min: number, max: number): number =>
  min + Math.random() * (max - min);

type Star = {
  x: number;
  y: number;
  r: number;
  a: number;
  vx: number;
  vy: number;
};


let stars: Star[] = [];


    const resize = () => {
      w = Math.floor(window.innerWidth);
      h = Math.floor(window.innerHeight);
      canvas.width = Math.floor(w * DPR);
      canvas.height = Math.floor(h * DPR);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

      const count = Math.floor((w * h) / 18000); // density
      stars = new Array(count).fill(0).map(() => ({
        x: rand(0, w),
        y: rand(0, h),
        r: rand(0.6, 1.6),
        a: rand(0.05, 0.22),
        vx: rand(-0.02, 0.02),
        vy: rand(0.01, 0.05),
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // faint vignette
      const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7);
      g.addColorStop(0, "rgba(255,255,255,0.02)");
      g.addColorStop(1, "rgba(0,0,0,0.0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      for (const s of stars) {
        s.x += s.vx;
        s.y += s.vy;
        if (s.y > h + 10) s.y = -10;
        if (s.x < -10) s.x = w + 10;
        if (s.x > w + 10) s.x = -10;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.a})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();

    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  const v = variants[variant];

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 opacity-70" />

      {/* drifting cosmic gradients */}
      <motion.div
        key={variant}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.8 }}
        className="absolute inset-0"
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(900px 600px at ${v.a}, rgba(255,255,255,${v.o}), transparent 65%),
              radial-gradient(800px 500px at ${v.b}, rgba(255,255,255,${v.o * 0.75}), transparent 60%),
              radial-gradient(1000px 700px at ${v.c}, rgba(255,255,255,${v.o * 0.6}), transparent 70%)
            `,
            filter: "blur(12px)",
            opacity: 0.12,
          }}
        />
      </motion.div>

      {/* subtle film grain */}
      <div
        className="absolute inset-0 opacity-[0.08] mix-blend-overlay"
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22160%22 height=%22160%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22160%22 height=%22160%22 filter=%22url(%23n)%22 opacity=%220.5%22/%3E%3C/svg%3E')",
        }}
      />

      {/* overall darkening to keep it intentional */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/55 to-neutral-950" />
    </div>
  );
}

export default function DropMerchPage() {
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-white selection:text-black font-light tracking-wide">
      <CosmicBackdrop />
      {/* HERO */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={CONFIG.heroImage}
            alt=""
            className="h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-neutral-950" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 py-28">
          <FadeIn>
            <div className="space-y-8 text-center">
              <div className="text-sm uppercase tracking-[0.3em] text-white/50">
                {CONFIG.artistName}
              </div>

              <h1 className="text-5xl font-semibold tracking-tight md:text-7xl">
                {CONFIG.dropTitle}
              </h1>

              <p className="mx-auto max-w-2xl text-base text-white/60 md:text-lg">
                {CONFIG.dropTagline}
              </p>

              <div className="flex flex-wrap justify-center gap-4 pt-6">
                <a
                  href="#music"
                  className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-white/90"
                >
                  Listen
                </a>
                <a
                  href="#merch"
                  className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
                >
                  Enter the Signal
                </a>
<a
  href="/vault"
  className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
>
  Vault
</a>

<a
  href="/catalog"
  className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
>
  Catalog
</a>

<a
  href="/control-room"
  className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
>
  Control Room
</a>

<a
  href="/games"
  className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
>
  Trials
</a>

              </div>
            </div>
          </FadeIn>
        </div>
      </header>
{/* PORTALS */}
<section className="relative z-10">
  <div className="mx-auto -mt-10 grid max-w-4xl gap-6 px-6 md:grid-cols-2">
    <a
      href="/vault"
      className="group rounded-3xl border border-white/10 bg-black/35 p-8 backdrop-blur transition hover:bg-black/30"
    >
      <div className="text-xs uppercase tracking-[0.3em] text-white/40">
        Interdimensional Lock
      </div>
      <div className="mt-3 text-2xl font-semibold text-white">Vault</div>
      <div className="mt-2 text-sm text-white/60">
        Seasonal code. Unreleased transmissions. Sealed chamber between eras.
      </div>
      <div className="mt-6 text-sm font-semibold text-white/80">
        Enter <span className="opacity-70">→</span>
      </div>
    </a>

    <a
      href="/games"
      className="group rounded-3xl border border-white/10 bg-black/35 p-8 backdrop-blur transition hover:bg-black/30"
    >
      <div className="text-xs uppercase tracking-[0.3em] text-white/40">
        Skill Chambers
      </div>
      <div className="mt-3 text-2xl font-semibold text-white">Trials</div>
      <div className="mt-2 text-sm text-white/60">
        Competitive tests. Myth-coded. Built in-house for full control.
      </div>
      <div className="mt-6 text-sm font-semibold text-white/80">
        Enter <span className="opacity-70">→</span>
      </div>
    </a>
  </div>
</section>

      {/* MANIFESTO */}
      <section className="mx-auto max-w-4xl px-6 py-32 text-center">
        <FadeIn>
          <p className="text-xl leading-relaxed tracking-wide text-white/60">
            Asked the devil what she’d take — told me more than I could make.
            <br />
            Started living out a nightmare.
            <br /><br />
            Midas is not about gold.
            <br />
            It is about consequence.
            <br />
            It is about transformation under pressure.
            <br />
            It is about becoming what you feared you could not survive.
          </p>
        </FadeIn>
      </section>

      {/* MUSIC */}
      <section id="music" className="mx-auto max-w-6xl px-6 py-20">
        <FadeIn>
          <h2 className="text-2xl font-semibold tracking-wide text-white/80">
            Transmission
          </h2>
        </FadeIn>

        <div className="mt-10 grid gap-10 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur">
            <div className="text-sm uppercase tracking-[0.3em] text-white/40">
              MIDAS
            </div>
            <div className="mt-4 text-sm text-white/60">
              Replace Spotify embed with your main release (CARE FUL or MIDAS).
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur">
            <div className="text-sm uppercase tracking-[0.3em] text-white/40">
              Careful
            </div>
            <div className="mt-6 aspect-video overflow-hidden rounded-2xl border border-white/10">
              <iframe
                className="h-full w-full"
                src="https://www.youtube.com/embed/ybA7XhVSMjw"
                title="Careful - Hamlo.wrld"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      {/* MERCH */}
      <section id="merch" className="mx-auto max-w-6xl px-6 pb-24">
        <FadeIn>
          <h2 className="text-2xl font-semibold tracking-wide text-white/80">
            Artifacts
          </h2>
        </FadeIn>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {CONFIG.merch.map((item, idx) => (
            <FadeIn key={item.id} delay={0.05 * idx}>
              <MerchCard item={item} />
            </FadeIn>
          ))}
        </div>
      </section>

      {/* EMAIL */}
      <section className="mx-auto max-w-4xl px-6 pb-28 text-center">
        <FadeIn>
          <div className="rounded-3xl border border-white/10 bg-black/40 p-10">
            <div className="text-sm uppercase tracking-[0.3em] text-white/40">
              Join the Transmission
            </div>
            <p className="mt-4 text-white/60">
              Direct drops. Essays. Signals. No noise.
            </p>

<EmailCapture source="homepage" />

          </div>
        </FadeIn>
      </section>

      <footer className="border-t border-white/10 py-10 text-center text-sm text-white/40">
        © {new Date().getFullYear()} Hamlo.wrld
      </footer>
    </div>
  );
}
