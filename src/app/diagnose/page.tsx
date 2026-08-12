"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Step = "dog" | "breed" | "lesion" | "diagnosing" | "result";

type Result = {
  breed: string;
  breedConfidence: number;
  lesion: string;
  lesionConfidence: number;
  lesionCategory: string;
  lowConfidence?: boolean;
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
  aiRecommendation?: string | null;
};

export default function DiagnosePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("dog");
  const [dogImage, setDogImage] = useState<string | null>(null);
  const [lesionImage, setLesionImage] = useState<string | null>(null);
  const [dogFile, setDogFile] = useState<File | null>(null);
  const [detectedBreed, setDetectedBreed] = useState<{ breed: string; confidence: number } | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auth states
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    });

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
    router.push("/");
  };

  const displayName = userEmail ? userEmail.split('@')[0] : "";

  const progress = useMemo(() => {
    return { dog: 20, breed: 45, lesion: 65, diagnosing: 85, result: 100 }[step];
  }, [step]);

  const handleDogUpload = async (file: File) => {
    setError(null);
    setDogImage(URL.createObjectURL(file));
    setDogFile(file);
    setStep("breed");
    try {
      const fd = new FormData();
      fd.append("dog_image", file);
      const res = await fetch(`${API_URL}/breed`, { method: "POST", body: fd });
      if (!res.ok) throw new Error(`Breed request failed (${res.status})`);
      const data = await res.json();
      setDetectedBreed({ breed: data.breed, confidence: data.breedConfidence });
      setStep("lesion");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not reach the VetAI server.");
      setStep("dog");
    }
  };

  const handleLesionUpload = async (file: File) => {
    setError(null);
    setLesionImage(URL.createObjectURL(file));
    if (!dogFile) {
      setError("Please upload the dog photo again.");
      setStep("dog");
      return;
    }
    setStep("diagnosing");
    try {
      const fd = new FormData();
      fd.append("dog_image", dogFile);
      fd.append("lesion_image", file);
      
      if (userEmail) {
        fd.append("user_email", userEmail);
      }

      const res = await fetch(`${API_URL}/diagnose`, { method: "POST", body: fd });
      if (!res.ok) throw new Error(`Diagnose request failed (${res.status})`);
      const data: Result = await res.json();
      setResult(data);
      setStep("result");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not reach the VetAI server.");
      setStep("lesion");
    }
  };

  const reset = () => {
    setDogImage(null);
    setLesionImage(null);
    setDogFile(null);
    setDetectedBreed(null);
    setResult(null);
    setError(null);
    setStep("dog");
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span
              className="grid h-9 w-9 place-items-center rounded-2xl bg-accent text-accent-foreground shadow-soft"
              aria-hidden
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <ellipse cx="6" cy="9" rx="2" ry="2.6" />
                <ellipse cx="10.5" cy="6" rx="2" ry="2.6" />
                <ellipse cx="15.5" cy="6" rx="2" ry="2.6" />
                <ellipse cx="20" cy="9" rx="2" ry="2.6" />
                <path d="M13 11c3.5 0 6 3 6 6a3 3 0 0 1-3 3c-1 0-1.6-.5-3-.5s-2 .5-3 .5a3 3 0 0 1-3-3c0-3 2.5-6 6-6z" />
              </svg>
            </span>
            <span className="font-display text-xl font-semibold">VetAI</span>
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
                    <button
                      onClick={() => {
                        reset();
                        setIsDropdownOpen(false);
                      }}
                      className="block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-foreground hover:bg-secondary"
                    >
                      New Diagnosis
                    </button>
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
            
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <span>Diagnosis flow</span>
            <span>{progress}%</span>
          </div>
          <ProgressPrimitive.Root
            value={progress}
            className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary"
          >
            <ProgressPrimitive.Indicator
              className="h-full rounded-full bg-accent transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </ProgressPrimitive.Root>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {step === "dog" && (
          <UploadCard
            title="Step 1 — Upload a photo of your dog"
            subtitle="Any clear, well-lit full-body photo works best. We'll identify the breed."
            onFile={handleDogUpload}
            cta="Choose dog photo"
          />
        )}

        {step === "breed" && (
          <AnalyzingCard
            title="Identifying breed…"
            subtitle="Our vision model is analysing the photo."
            preview={dogImage}
          />
        )}

        {step === "lesion" && (
          <div className="space-y-6">
            {detectedBreed && (
              <BreedBanner
                image={dogImage}
                breed={detectedBreed.breed}
                confidence={detectedBreed.confidence}
              />
            )}
            <UploadCard
              title="Step 2 — Upload the affected area"
              subtitle="A close-up of the lesion, rash, or hot spot. We'll classify it and match it to breed-aware guidance."
              onFile={handleLesionUpload}
              cta="Choose lesion photo"
            />
          </div>
        )}

        {step === "diagnosing" && (
          <AnalyzingCard
            title="Analysing lesion & building recommendation…"
            subtitle="Classifying the lesion and retrieving BSAVA-based guidance."
            preview={lesionImage}
          />
        )}

        {step === "result" && result && (
          <ResultView
            result={result}
            dogImage={dogImage}
            lesionImage={lesionImage}
            onReset={reset}
          />
        )}
      </main>
    </div>
  );
}

function UploadCard({
  title,
  subtitle,
  onFile,
  cta,
}: {
  title: string;
  subtitle: string;
  onFile: (file: File) => void;
  cta: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  return (
    <div className="rounded-3xl border border-border bg-card p-8 shadow-lift">
      <h2 className="font-display text-2xl font-semibold">{title}</h2>
      <p className="mt-2 text-muted-foreground">{subtitle}</p>

      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) onFile(f);
        }}
        className={`mt-6 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition ${
          dragOver
            ? "border-accent bg-accent/5"
            : "border-border bg-secondary/40 hover:border-accent/60 hover:bg-accent/5"
        }`}
      >
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-accent/15 text-accent">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <p className="mt-4 font-display text-lg font-semibold">Drop image here</p>
        <p className="text-sm text-muted-foreground">or click to browse</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
          }}
        />
      </label>

      <button
        onClick={() => inputRef.current?.click()}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-95"
      >
        {cta}
      </button>
    </div>
  );
}

function AnalyzingCard({
  title,
  subtitle,
  preview,
}: {
  title: string;
  subtitle: string;
  preview: string | null;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-8 shadow-lift">
      <div className="flex items-center gap-4">
        {preview && (
          <Image
            src={preview}
            alt="Uploaded preview"
            width={80}
            height={80}
            unoptimized
            className="h-20 w-20 rounded-2xl object-cover ring-1 ring-border"
          />
        )}
        <div>
          <h2 className="font-display text-2xl font-semibold">{title}</h2>
          <p className="mt-1 text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
        <span className="inline-block h-3 w-3 animate-pulse rounded-full bg-accent" />
        <span className="inline-block h-3 w-3 animate-pulse rounded-full bg-accent/70 [animation-delay:150ms]" />
        <span className="inline-block h-3 w-3 animate-pulse rounded-full bg-accent/40 [animation-delay:300ms]" />
        Working…
      </div>
    </div>
  );
}

function BreedBanner({
  image,
  breed,
  confidence,
}: {
  image: string | null;
  breed: string;
  confidence: number;
}) {
  return (
    <div className="flex items-center gap-4 rounded-3xl border border-border bg-card p-5 shadow-soft">
      {image && (
        <Image
          src={image}
          alt="Your dog"
          width={64}
          height={64}
          unoptimized
          className="h-16 w-16 rounded-2xl object-cover ring-1 ring-border"
        />
      )}
      <div className="flex-1">
        <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Breed detected
        </div>
        <div className="mt-0.5 font-display text-lg font-semibold capitalize">
          {breed.replace(/_/g, " ")}
        </div>
      </div>
      <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
        {confidence.toFixed(1)}% confident
      </div>
    </div>
  );
}

function ResultView({
  result,
  dogImage,
  lesionImage,
  onReset,
}: {
  result: Result;
  dogImage: string | null;
  lesionImage: string | null;
  onReset: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-3xl border border-border bg-primary text-primary-foreground shadow-lift">
        <div className="border-b border-primary-foreground/10 px-8 py-6">
          <div className="text-xs font-semibold uppercase tracking-[0.3em] text-terracotta-soft">
            VetAI — Diagnosis Report
          </div>
          <h2 className="mt-2 font-display text-3xl font-semibold">
            Treatment & Diet Recommendation
          </h2>
        </div>
        <div className="grid gap-4 px-8 py-6 md:grid-cols-3">
          <IdentifiedCard
            label="Breed"
            value={result.breed.replace(/_/g, " ")}
            confidence={result.breedConfidence}
            image={dogImage}
          />
          <IdentifiedCard
            label="Lesion"
            value={result.lesion.replace(/_/g, " ")}
            confidence={result.lesionConfidence}
            image={lesionImage}
          />
          <div className="rounded-2xl bg-primary-foreground/5 p-4 ring-1 ring-primary-foreground/10">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-primary-foreground/60">
              Lesion category
            </div>
            <div className="mt-2 font-display text-lg font-semibold capitalize">
              {result.lesionCategory}
            </div>
          </div>
        </div>
      </div>

      {result.lowConfidence && (
        <div className="rounded-3xl border border-amber-400/40 bg-amber-50 px-6 py-4 text-sm text-amber-800">
          <strong className="font-semibold">Low confidence:</strong> one or both predictions were
          below the confidence threshold. Treat this result as indicative only and confirm with a
          veterinarian.
        </div>
      )}

      <div className="rounded-3xl border border-border bg-card p-8 shadow-soft">
        <SectionHeader eyebrow="Recommended action" title="Treatment (rule-based)" />
        <div className="mt-4 space-y-4">
          <Row label="Recommendation" value={result.treatment.recommendation} strong />
          <Row label="Source" value={result.treatment.source} />
          <Row label="Rule trigger" value={result.treatment.ruleTrigger} muted />
          <Row label="Exact-rule hit" value={result.treatment.exactRuleHit} muted />
        </div>
      </div>

      {result.aiRecommendation && (
        <div className="rounded-3xl border border-accent/30 bg-accent/5 p-8 shadow-soft">
          <SectionHeader eyebrow="AI decision layer" title="Grounded recommendation" />
          <p className="mt-2 text-xs text-muted-foreground">
            Generated by the language model, grounded on the rule above (drug kept fixed).
          </p>
          <div className="mt-4 whitespace-pre-line text-sm leading-relaxed text-foreground">
            {result.aiRecommendation.replace(/\*\*/g, "")}
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-border bg-card p-8 shadow-soft">
        <SectionHeader eyebrow="Nutrition guidance" title="Breed-aware diet plan" />
        <div className="mt-4 space-y-4">
          <Row label="Profile" value={result.diet.profile} />
          <div>
            <Label>Recommended</Label>
            <ul className="mt-2 flex flex-wrap gap-2">
              {result.diet.recommended.map((r) => (
                <li
                  key={r}
                  className="rounded-full bg-sage/40 px-3 py-1.5 text-sm font-medium text-sage-deep"
                >
                  {r}
                </li>
              ))}
            </ul>
          </div>
          <Row label="Quantity" value={result.diet.quantity} />
          <div>
            <Label>Avoid</Label>
            <ul className="mt-2 flex flex-wrap gap-2">
              {result.diet.avoid.map((a) => (
                <li
                  key={a}
                  className="rounded-full bg-destructive/10 px-3 py-1.5 text-sm font-medium text-destructive"
                >
                  {a}
                </li>
              ))}
            </ul>
          </div>
          {result.diet.conditionTip && (
            <Row label="Condition tip" value={result.diet.conditionTip} strong />
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-accent/10 p-6 text-sm text-foreground/80">
        <strong className="font-semibold text-foreground">Note:</strong> VetAI provides
        informational guidance based on visible signs and referenced formularies. For
        confirmation, dosing, and any prescription medication, please consult a licensed
        veterinarian.
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-95"
        >
          New diagnosis
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-secondary"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}

function IdentifiedCard({
  label,
  value,
  confidence,
  image,
}: {
  label: string;
  value: string;
  confidence: number;
  image: string | null;
}) {
  return (
    <div className="flex gap-3 rounded-2xl bg-primary-foreground/5 p-4 ring-1 ring-primary-foreground/10">
      {image && (
        <Image
          src={image}
          alt={label}
          width={56}
          height={56}
          unoptimized
          className="h-14 w-14 rounded-xl object-cover ring-1 ring-primary-foreground/20"
        />
      )}
      <div className="min-w-0">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-primary-foreground/60">
          {label}
        </div>
        <div className="mt-1 truncate font-display text-lg font-semibold capitalize">
          {value}
        </div>
        <div className="text-xs text-terracotta-soft">{confidence.toFixed(1)}% confidence</div>
      </div>
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

function Row({
  label,
  value,
  strong,
  muted,
}: {
  label: string;
  value: string;
  strong?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="grid gap-1 border-t border-border pt-3 first:border-t-0 first:pt-0 md:grid-cols-[160px_1fr] md:gap-4">
      <Label>{label}</Label>
      <div
        className={
          strong
            ? "font-display text-lg font-semibold text-foreground"
            : muted
              ? "text-sm text-muted-foreground"
              : "text-foreground"
        }
      >
        {value}
      </div>
    </div>
  );
}