import type { Metadata } from "next";
import "@/styles/pnddrr.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "PNDDRR — Suivi DDR | République Centrafricaine",
  description:
    "Programme national de désarmement, démobilisation, réintégration et rapatriement (UEPNDDR)",
  applicationName: "PNDDRR",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
