import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login or Sign Up — VetAI",
  description:
    "Create your VetAI account or log in to access breed-aware dog disease diagnosis and treatment recommendations.",
  openGraph: {
    title: "Login or Sign Up — VetAI",
    description:
      "Create your VetAI account or log in to access breed-aware dog disease diagnosis and treatment recommendations.",
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
