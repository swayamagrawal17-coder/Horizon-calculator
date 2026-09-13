import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { RandomLetterSwap } from "@/components/ui/RandomLetterSwap";

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-sans",
  display: "swap",
});
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});
const figure = Newsreader({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-figure",
  display: "swap",
});

// TODO: point this at the real deployed domain once it's known — it backs
// canonical URLs and Open Graph image/URL resolution.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://horizon-calculator.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Horizon — EMI, Future Value & Present Value",
    template: "%s — Horizon",
  },
  description:
    "The time value of money over its full horizon: loan EMI and step-up EMI, future value and present value, drawn as balance-over-time plots with amortization schedules.",
  authors: [{ name: "Swayam Agrawal", url: "https://swayam-agrawal.vercel.app" }],
  creator: "Swayam Agrawal",
  openGraph: {
    siteName: "Horizon",
    type: "website",
    title: "Horizon — EMI, Future Value & Present Value",
    description:
      "The time value of money over its full horizon, drawn as balance-over-time plots with amortization schedules.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sans.variable} ${mono.variable} ${figure.variable}`}
    >
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <a
            href="#main-content"
            className="focusable fixed left-4 top-4 z-50 -translate-y-20 rounded-sm bg-ink px-4 py-2 text-sm text-paper transition-transform focus:translate-y-0"
          >
            Skip to content
          </a>
          <Header />
          <main
            id="main-content"
            className="mx-auto w-full max-w-work px-4 pb-24 pt-8 sm:px-8"
          >
            {children}
          </main>
          <footer className="rule-t">
            <div className="mx-auto flex max-w-work flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-5 sm:px-8">
              <p className="eyebrow">
                Indicative estimates · not financial advice
              </p>
              <p className="eyebrow">
                Prepared by ·{" "}
                <a
                  href="https://swayam-agrawal.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focusable text-ink underline decoration-dotted underline-offset-4 transition-colors hover:text-accent hover:decoration-solid"
                >
                  <RandomLetterSwap label="Swayam Agrawal" />
                </a>
              </p>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
