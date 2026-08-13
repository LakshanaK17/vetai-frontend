import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Diagnose · VetAI",
  description:
    "Upload a photo of your dog and the affected area to get a breed-aware treatment and diet plan.",
};

export default function DiagnoseLayout({ children }: { children: React.ReactNode }) {
  return children;
}
