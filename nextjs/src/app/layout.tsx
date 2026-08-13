import type { Metadata } from "next";
import { Fraunces, Nunito } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VetAI — Real-Time Dog Disease Diagnosis & Care",
  description:
    "VetAI identifies your dog's breed and skin conditions from photos, then delivers breed-aware treatment and diet recommendations in seconds.",
  authors: [{ name: "VetAI" }],
  openGraph: {
    title: "VetAI — Real-Time Dog Disease Diagnosis & Care",
    description:
      "VetAI identifies your dog's breed and skin conditions from photos, then delivers breed-aware treatment and diet recommendations in seconds.",
    type: "website",
    images: [
      "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/069c3b81-a353-4c74-9af1-1abfa9c6e5a2/id-preview-9e0cdd72--69aa0d37-c859-4098-a8da-d38c398dca08.lovable.app-1784583740922.png",
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VetAI — Real-Time Dog Disease Diagnosis & Care",
    description:
      "VetAI identifies your dog's breed and skin conditions from photos, then delivers breed-aware treatment and diet recommendations in seconds.",
    images: [
      "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/069c3b81-a353-4c74-9af1-1abfa9c6e5a2/id-preview-9e0cdd72--69aa0d37-c859-4098-a8da-d38c398dca08.lovable.app-1784583740922.png",
    ],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${nunito.variable}`}>
      <body className="min-h-screen antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
