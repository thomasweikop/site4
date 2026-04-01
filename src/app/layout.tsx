import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nis.weikop.me"),
  title: "Gratis NIS2 Compliance Scan | Weikop",
  description:
    "Er din virksomhed klar til NIS2? Få et hurtigt første billede af score, gaps og næste skridt med Weikops gratis NIS2 compliance scan.",
  applicationName: "Weikop NIS2",
  keywords: [
    "NIS2",
    "NIS2 scan",
    "NIS2 compliance scan",
    "cybersikkerhed",
    "gapanalyse",
    "NIS2 krav Danmark",
    "NIS2 compliance",
  ],
  creator: "Weikop",
  publisher: "Weikop",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Gratis NIS2 Compliance Scan | Weikop",
    description:
      "Få et hurtigt første billede af jeres NIS2-score, de største gaps og de næste prioriterede skridt.",
    type: "website",
    url: "https://nis.weikop.me",
    locale: "da_DK",
    siteName: "Weikop NIS2",
  },
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  themeColor: "#efe7db",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="da" className={`${manrope.variable} ${cormorant.variable} h-full antialiased`}>
      <body className="min-h-full bg-page font-sans text-ink">{children}</body>
    </html>
  );
}
