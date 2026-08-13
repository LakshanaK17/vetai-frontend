"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PawLogo } from "@/components/paw-logo";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      // Changed from "/diagnose" to "/"
      if (session) router.push("/"); 
    });
    supabase.auth.getSession().then(({ data }) => {
      // Changed from "/diagnose" to "/"
      if (data.session) router.push("/"); 
    });
    return () => sub.subscription.unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2">
          <PawLogo />
          <span className="font-display text-xl font-semibold tracking-tight">VetAI</span>
        </Link>
        <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
          ← Back to home
        </Link>
      </header>

      <main className="mx-auto flex max-w-md flex-col px-6 pb-24 pt-6">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-lift">
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "login"
              ? "Log in to continue diagnosing and caring for your dog."
              : "Sign up to save diagnoses and get breed-aware care plans."}
          </p>

          <div className="mt-6">
            {mode === "login" ? <LoginForm /> : <SignupForm onDone={() => setMode("login")} />}
          </div>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>

          <GoogleButton />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "login" ? "New to VetAI?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="font-semibold text-primary hover:underline"
            >
              {mode === "login" ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}

function GoogleButton() {
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // Changed from "/diagnose" to "/"
        redirectTo: `${window.location.origin}/`,
        queryParams: {
          prompt: "select_account", 
        },
      },
    });

    if (error) {
      setLoading(false);
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
    // Note: We don't need to manually redirect on success here, 
    // Supabase OAuth handles navigating the window to the provider.
  };
  return (
    <Button type="button" variant="outline" className="w-full" onClick={onClick} disabled={loading}>
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="#4285F4"
          d="M21.6 12.2c0-.7-.06-1.4-.18-2.05H12v3.9h5.4a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.9-1.74 2.97-4.3 2.97-7.37z"
        />
        <path
          fill="#34A853"
          d="M12 22c2.7 0 4.96-.9 6.62-2.43l-3.23-2.5c-.9.6-2.05.96-3.39.96-2.6 0-4.8-1.76-5.6-4.12H3.07v2.58A10 10 0 0 0 12 22z"
        />
        <path fill="#FBBC05" d="M6.4 13.91a6 6 0 0 1 0-3.82V7.51H3.07a10 10 0 0 0 0 8.98l3.33-2.58z" />
        <path
          fill="#EA4335"
          d="M12 5.98c1.47 0 2.79.5 3.83 1.5l2.86-2.86C16.95 2.99 14.7 2 12 2a10 10 0 0 0-8.93 5.51L6.4 10.1C7.2 7.74 9.4 5.98 12 5.98z"
        />
      </svg>
      Continue with Google
    </Button>
  );
}

function LoginForm() {
  // Initialize the router here
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    setLoading(false);
    
    if (error) {
      toast.error(error.message);
      return;
    }
    
    toast.success("Welcome back!");
    // Redirect to the home page
    router.push("/");
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-password">Password</Label>
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Logging in…" : "Log in"}
      </Button>
    </form>
  );
}

function SignupForm({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (!terms) {
      toast.error("Please accept the terms and conditions.");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { phone },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (!data.session) {
      toast.success("Check your email to confirm your account.");
      onDone();
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-phone">Phone number</Label>
        <Input
          id="signup-phone"
          type="tel"
          autoComplete="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1 555 000 1234"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-confirm">Confirm password</Label>
        <Input
          id="signup-confirm"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Re-enter your password"
        />
      </div>
      <div className="flex items-start gap-3 pt-1">
        <Checkbox
          id="signup-terms"
          checked={terms}
          onCheckedChange={(v) => setTerms(v === true)}
          className="mt-0.5"
        />
        <Label
          htmlFor="signup-terms"
          className="text-sm font-normal leading-relaxed text-muted-foreground"
        >
          I agree to the Terms and Conditions and Privacy Policy.
        </Label>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
