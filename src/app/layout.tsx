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
  metadataBase: new URL("https://www.complycheck.dk"),
  title: "NIS2 Screening | ComplyCheck",
  description:
    "Få et nøgternt første billede af virksomhedens NIS2-parathed med en kort screening, vægtet score og de mest oplagte næste skridt.",
  applicationName: "ComplyCheck",
  keywords: [
    "NIS2",
    "NIS2 scan",
    "NIS2 compliance scan",
    "cybersikkerhed",
    "gapanalyse",
    "NIS2 krav Danmark",
    "NIS2 compliance",
  ],
  creator: "ComplyCheck",
  publisher: "ComplyCheck",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "NIS2 Screening | ComplyCheck",
    description:
      "Få et nøgternt første billede af virksomhedens NIS2-parathed, de største gaps og de næste prioriterede skridt.",
    type: "website",
    url: "https://www.complycheck.dk",
    locale: "da_DK",
    siteName: "ComplyCheck",
  },
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  themeColor: "#073832",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="da"
      className={`${manrope.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-page font-sans text-ink">{children}</body>
    </html>
  );
}
