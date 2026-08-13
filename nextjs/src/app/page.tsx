"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { PawLogo } from "@/components/paw-logo";
import { supabase } from "@/integrations/supabase/client";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <Stats />
      <WhyNeeded />
      <HowItWorks />
      <Benefits />
      <Impact />
      <FinalCta />
      <Footer />
    </div>
  );
}

function Nav() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    });

    // Listen for auth changes (e.g. login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      } else {
        setUserEmail(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserEmail(null);
    setIsDropdownOpen(false);
  };

  // Extract the name before the '@' symbol
  const displayName = userEmail ? userEmail.split('@')[0] : "";

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <PawLogo />
          <span className="font-display text-xl font-semibold tracking-tight">VetAI</span>
        </Link>
        <nav className="hidden gap-8 text-sm font-medium text-muted-foreground md:flex">
          <a href="#why" className="hover:text-foreground">
            Why VetAI
          </a>
          <a href="#how" className="hover:text-foreground">
            How it works
          </a>
          <a href="#impact" className="hover:text-foreground">
            Impact
          </a>
        </nav>
        
        {userEmail ? (
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm transition hover:bg-secondary"
            >
              {displayName}
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-card p-2 shadow-lift z-50">
                    <Link
                      href="/diagnose"
                      className="block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-foreground hover:bg-secondary"
                    >
                      New Diagnosis
                    </Link>
                    <Link
                      href="/history"
                      className="block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-foreground hover:bg-secondary"
                    >
                      Past Diagnoses
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-destructive hover:bg-destructive/10"
                    >
                      Log out
                    </button>
                  </div>
                )}
          </div>
        ) : (
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-95"
          >
            Login
            <span aria-hidden>→</span>
          </Link>
        )}
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="bg-gradient-hero relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Computer vision for canine care
          </span>
          <h1 className="mt-6 font-display text-5xl leading-[1.05] font-semibold tracking-tight text-foreground md:text-6xl">
            Diagnose your dog in
            <span className="italic text-accent"> under a minute.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg text-muted-foreground">
            VetAI reads your dog&apos;s photo, identifies the breed, spots visible skin
            conditions, and returns breed‑aware treatment and diet guidance — grounded
            in trusted veterinary formularies.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/diagnose"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lift transition hover:opacity-95"
            >
              Start free diagnosis →
            </Link>
            <a
              href="#how"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-secondary"
            >
              See how it works
            </a>
          </div>
          <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              120+ breeds
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent" />
              Vet‑referenced sources
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-sage-deep" />
              Real‑time results
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-warm blur-2xl opacity-70" />
          <Image
            src="/hero-dogs.jpg"
            alt="A golden retriever and a small brown dog sitting side by side"
            width={1600}
            height={1200}
            priority
            className="rounded-[2rem] shadow-lift ring-1 ring-border/60"
          />
          <div className="absolute -bottom-6 -left-6 hidden max-w-[220px] rounded-2xl bg-card p-4 shadow-lift md:block">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Breed detected
            </div>
            <div className="mt-1 font-display text-lg font-semibold">Golden Retriever</div>
            <div className="text-xs text-primary">Confidence 99.0%</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const items = [
    { k: "1 in 4", v: "dogs develop a skin condition each year" },
    { k: "48 hrs", v: "average wait for a vet appointment" },
    { k: "70%", v: "of pet parents Google symptoms first" },
    { k: "<60s", v: "VetAI time to a grounded recommendation" },
  ];
  return (
    <section className="border-y border-border/60 bg-card">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-12 md:grid-cols-4">
        {items.map((i) => (
          <div key={i.k}>
            <div className="font-display text-3xl font-semibold text-primary">{i.k}</div>
            <div className="mt-1 text-sm text-muted-foreground">{i.v}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function WhyNeeded() {
  const cards = [
    {
      title: "Vet access is limited",
      body: "Rural regions and busy cities alike face vet shortages. Owners often wait days for a consult while conditions worsen and become painful.",
    },
    {
      title: "Symptoms are hard to name",
      body: "Redness, hair loss, hot spots — most owners can describe what they see but not what it is. VetAI turns a photo into a clear starting point.",
    },
    {
      title: "Breed changes everything",
      body: "A Golden Retriever's skin isn't a Bulldog's. Dosage, diet, and predisposed conditions all vary by breed — generic advice misses the mark.",
    },
  ];
  return (
    <section id="why" className="mx-auto max-w-6xl px-6 py-24">
      <div className="max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-widest text-accent">
          Why VetAI exists
        </span>
        <h2 className="mt-3 font-display text-4xl font-semibold md:text-5xl">
          Every hour without answers is an hour of discomfort.
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Skin and coat problems are the #1 reason dogs visit the vet — yet most owners
          have no confident way to triage what they&apos;re seeing at home.
        </p>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {cards.map((c) => (
          <div
            key={c.title}
            className="rounded-3xl border border-border bg-card p-8 shadow-soft transition hover:shadow-lift"
          >
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-accent/15 text-accent">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" opacity="0.15" />
                <circle cx="12" cy="12" r="4" />
              </svg>
            </div>
            <h3 className="mt-5 font-display text-xl font-semibold">{c.title}</h3>
            <p className="mt-2 text-muted-foreground">{c.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Snap the dog",
      body: "Upload any clear photo. Our vision model classifies from 120+ breeds with high confidence.",
    },
    {
      n: "02",
      title: "Show the spot",
      body: "Upload a close-up of the affected area. VetAI detects common visible lesions and categorises them.",
    },
    {
      n: "03",
      title: "Get a plan",
      body: "Receive breed‑aware treatment guidance and a diet plan — sourced, transparent, and easy to share with your vet.",
    },
  ];
  return (
    <section id="how" className="bg-secondary/40">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 md:grid-cols-[1.1fr_1fr]">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            How it works
          </span>
          <h2 className="mt-3 font-display text-4xl font-semibold md:text-5xl">
            Two photos. One plan. Zero guesswork.
          </h2>
          <div className="mt-10 space-y-6">
            {steps.map((s) => (
              <div key={s.n} className="flex gap-5">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary font-display text-lg font-semibold text-primary-foreground shadow-soft">
                  {s.n}
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold">{s.title}</h3>
                  <p className="mt-1 text-muted-foreground">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/diagnose"
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-soft transition hover:opacity-95"
          >
            Try it with your dog →
          </Link>
        </div>
        <div className="relative">
          <Image
            src="/care-illustration.jpg"
            alt="Stethoscope and paw print illustration"
            width={1200}
            height={900}
            className="rounded-[2rem] shadow-lift"
          />
        </div>
      </div>
    </section>
  );
}

function Benefits() {
  const rows = [
    {
      t: "Faster relief for your dog",
      d: "Point-of-care triage means treatment starts sooner — before a small rash becomes a serious infection.",
    },
    {
      t: "Sourced, not hallucinated",
      d: "Recommendations cite trusted references like the BSAVA Small Animal Formulary. You see the source, not a black box.",
    },
    {
      t: "Breed‑aware nutrition",
      d: "Diet plans account for breed size, coat, and predispositions — with a clear 'avoid' list for common toxins.",
    },
    {
      t: "A better vet conversation",
      d: "Bring your VetAI report to the clinic. Your vet gets a structured summary, saving time and improving outcomes.",
    },
    {
      t: "Accessible everywhere",
      d: "No app to install. Works on any phone, from a rural home to a shelter — where vet access is scarcest.",
    },
    {
      t: "Private by design",
      d: "Photos are processed to give you results, not to profile your pet. You stay in control.",
    },
  ];
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-widest text-accent">
          The benefits
        </span>
        <h2 className="mt-3 font-display text-4xl font-semibold md:text-5xl">
          Better outcomes for pets, calmer decisions for owners.
        </h2>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rows.map((r) => (
          <div key={r.t} className="rounded-3xl border border-border bg-card p-7 shadow-soft">
            <div className="flex items-center gap-2 text-accent">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span className="text-xs font-semibold uppercase tracking-widest">Benefit</span>
            </div>
            <h3 className="mt-3 font-display text-xl font-semibold">{r.t}</h3>
            <p className="mt-2 text-muted-foreground">{r.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Impact() {
  const risks = [
    "Untreated skin infections spread and become chronic, requiring aggressive antibiotics.",
    "Well-meaning owners give the wrong food or dose, worsening allergies or causing toxicity.",
    "Emergency vet costs climb — a $40 early intervention becomes a $400 crisis visit.",
    "Shelters and rescues, already stretched thin, absorb the burden of preventable illness.",
  ];
  return (
    <section id="impact" className="bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 md:grid-cols-[1fr_1.2fr]">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-terracotta-soft">
            Without VetAI
          </span>
          <h2 className="mt-3 font-display text-4xl font-semibold md:text-5xl">
            The cost of doing nothing is paid by the pet.
          </h2>
          <p className="mt-4 text-primary-foreground/80">
            When early triage isn&apos;t available, small problems escalate — quietly, at
            home, until they become emergencies. This is the gap VetAI closes.
          </p>
        </div>
        <ul className="space-y-4">
          {risks.map((r) => (
            <li
              key={r}
              className="flex gap-4 rounded-2xl bg-primary-foreground/5 p-5 ring-1 ring-primary-foreground/10"
            >
              <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground text-sm font-bold">
                !
              </span>
              <p className="text-primary-foreground/90">{r}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-24 text-center">
      <h2 className="font-display text-4xl font-semibold md:text-5xl">
        Your dog deserves an answer today.
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
        Upload a photo and get a breed‑aware treatment and diet plan in seconds —
        completely free to try.
      </p>
      <div className="mt-8">
        <Link
          href="/diagnose"
          className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-base font-semibold text-accent-foreground shadow-lift transition hover:opacity-95"
        >
          Start diagnosis →
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-10 text-sm text-muted-foreground md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <PawLogo />
          <span className="font-display text-base font-semibold text-foreground">VetAI</span>
        </div>
        <p>
          VetAI provides informational guidance and does not replace professional
          veterinary care.
        </p>
        <p>© {new Date().getFullYear()} VetAI</p>
      </div>
    </footer>
  );
}