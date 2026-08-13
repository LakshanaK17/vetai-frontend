"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { PawLogo } from "@/components/paw-logo";
import { supabase } from "@/integrations/supabase/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type DiagnosisRecord = {
  id: number;
  created_at: string;
  breed: string;
  breed_confidence: number;
  lesion: string;
  lesion_confidence: number;
  lesion_category: string;
  low_confidence: boolean;
  image_url?: string | null;
  lesion_image_url?: string | null;
  treatment: {
    recommendation: string;
    source: string;
    ruleTrigger: string;
    exactRuleHit: string;
  };
  diet: {
    profile: string;
    recommended: string[];
    quantity: string;
    avoid: string[];
    conditionTip: string;
  };
  ai_recommendation: string | null;
};

export default function HistoryPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [history, setHistory] = useState<DiagnosisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<DiagnosisRecord | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/auth"); 
      } else if (session.user?.email) {
        setUserEmail(session.user.email);
        fetchHistory(session.user.email);
      }
    });
  }, [router]);

  const fetchHistory = async (email: string) => {
    try {
      const res = await fetch(`${API_URL}/history?email=${encodeURIComponent(email)}`);
      if (!res.ok) throw new Error("Failed to fetch history");
      const data = await res.json();
      setHistory(data.items || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const displayName = userEmail ? userEmail.split("@")[0] : "";

  return (
    <div className="min-h-screen bg-gradient-hero text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <PawLogo />
            <span className="font-display text-xl font-semibold tracking-tight">VetAI</span>
          </Link>

          <div className="flex items-center gap-6">
            {userEmail && (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:bg-secondary"
                >
                  {displayName}
                </button>

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
            )}
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              ← Back to home
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-10">
          <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Past Diagnoses
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Review your previous analyses, treatment plans, and diet recommendations.
          </p>
        </div>

        {loading ? (
          <div className="flex animate-pulse gap-6">
            <div className="h-48 w-full rounded-3xl bg-secondary md:w-1/3"></div>
            <div className="h-48 w-full rounded-3xl bg-secondary md:w-1/3"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card p-12 text-center shadow-soft">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-secondary text-muted-foreground">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <h2 className="mt-4 font-display text-2xl font-semibold">No diagnoses yet</h2>
            <p className="mt-2 text-muted-foreground">Start your first analysis to see it here.</p>
            <Link
              href="/diagnose"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lift transition hover:opacity-95"
            >
              Start diagnosis →
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {history.map((record) => (
              <button
                key={record.id}
                onClick={() => setSelectedRecord(record)}
                className="group flex flex-col items-start overflow-hidden rounded-3xl border border-border bg-card text-left shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift"
              >
                {record.image_url ? (
                  <div className="relative h-40 w-full bg-[#1a1a1a]">
                    <Image
                      src={record.image_url}
                      alt={record.breed}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="flex h-40 w-full items-center justify-center bg-accent/10">
                    <span className="font-display text-4xl font-bold uppercase tracking-widest text-accent/30">
                      {record.breed.slice(0, 2)}
                    </span>
                  </div>
                )}
                <div className="p-6 w-full">
                  <div className="flex w-full items-center justify-between gap-4">
                    <h3 className="truncate font-display text-xl font-semibold capitalize">
                      {record.breed.replace(/_/g, " ")}
                    </h3>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-secondary/80 px-3 py-1 text-xs font-semibold text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-terracotta-soft" />
                    {record.lesion.replace(/_/g, " ")}
                  </div>
                  <div className="mt-4 text-xs text-muted-foreground">
                    {new Date(record.created_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-border bg-background shadow-2xl">
            <button
              onClick={() => setSelectedRecord(null)}
              className="absolute right-6 top-6 z-10 grid h-10 w-10 place-items-center rounded-full bg-secondary text-foreground hover:bg-border transition"
            >
              ✕
            </button>
            <div className="p-6 md:p-10">
              
              <div className="mb-5 flex items-center gap-3">
                {selectedRecord.image_url && (
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-1 ring-border shadow-sm bg-secondary">
                    <Image
                      src={selectedRecord.image_url}
                      alt={selectedRecord.breed}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
                {selectedRecord.lesion_image_url && (
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-1 ring-border shadow-sm bg-secondary">
                    <Image
                      src={selectedRecord.lesion_image_url}
                      alt={selectedRecord.lesion}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
              </div>

              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
                Diagnosis Report
              </div>
              <h2 className="mt-2 font-display text-3xl font-semibold capitalize">
                {selectedRecord.breed.replace(/_/g, " ")} &middot; {selectedRecord.lesion.replace(/_/g, " ")}
              </h2>
              
              <div className="mt-8 space-y-8">
                <div className="rounded-3xl border border-border bg-card p-6 shadow-soft md:p-8">
                  <SectionHeader eyebrow="Recommended action" title="Treatment (rule-based)" />
                  <div className="mt-4 space-y-4">
                    <Row label="Recommendation" value={selectedRecord.treatment?.recommendation || "N/A"} strong />
                    <Row label="Source" value={selectedRecord.treatment?.source || "N/A"} />
                  </div>
                </div>

                {selectedRecord.ai_recommendation && (
                  <div className="rounded-3xl border border-accent/30 bg-accent/5 p-6 shadow-soft md:p-8">
                    <SectionHeader eyebrow="AI decision layer" title="Grounded recommendation" />
                    <div className="mt-4 whitespace-pre-line text-sm leading-relaxed text-foreground">
                      {selectedRecord.ai_recommendation.replace(/\*\*/g, "")}
                    </div>
                  </div>
                )}

                <div className="rounded-3xl border border-border bg-card p-6 shadow-soft md:p-8">
                  <SectionHeader eyebrow="Nutrition guidance" title="Breed-aware diet plan" />
                  <div className="mt-4 space-y-4">
                    <Row label="Profile" value={selectedRecord.diet?.profile || "N/A"} />
                    {selectedRecord.diet?.recommended && (
                      <div>
                        <Label>Recommended</Label>
                        <ul className="mt-2 flex flex-wrap gap-2">
                          {selectedRecord.diet.recommended.map((r: string) => (
                            <li key={r} className="rounded-full bg-sage/40 px-3 py-1.5 text-sm font-medium text-sage-deep">
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {selectedRecord.diet?.avoid && (
                      <div>
                        <Label>Avoid</Label>
                        <ul className="mt-2 flex flex-wrap gap-2">
                          {selectedRecord.diet.avoid.map((a: string) => (
                            <li key={a} className="rounded-full bg-destructive/10 px-3 py-1.5 text-sm font-medium text-destructive">
                              {a}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-widest text-accent">{eyebrow}</div>
      <h3 className="mt-1 font-display text-2xl font-semibold">{title}</h3>
    </div>
  );
}

function Label({ children }: { children: ReactNode }) {
  return (
    <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
      {children}
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="grid gap-1 border-t border-border pt-3 first:border-t-0 first:pt-0 md:grid-cols-[160px_1fr] md:gap-4">
      <Label>{label}</Label>
      <div className={strong ? "font-display text-lg font-semibold text-foreground" : "text-foreground"}>
        {value}
      </div>
    </div>
  );
}