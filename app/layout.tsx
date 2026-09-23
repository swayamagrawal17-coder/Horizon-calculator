import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { Header } from "@/components/layout/Header";
import { RandomLetterSwap } from "@/components/ui/RandomLetterSwap";
import { LAST_UPDATED_ISO } from "@/lib/buildInfo";

const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

// Backs canonical URLs and Open Graph image/URL resolution.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://horizon-calc.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Horizon — EMI, Future Value, Present Value, Compare & Income Tax",
    template: "%s — Horizon",
  },
  description:
    "The time value of money over its full horizon: loan EMI and step-up EMI, future value and present value, side-by-side comparisons, and India income tax — drawn as balance-over-time plots with amortization schedules.",
  authors: [{ name: "Swayam Agrawal", url: "https://swayam-agrawal.vercel.app" }],
  creator: "Swayam Agrawal",
  openGraph: {
    siteName: "Horizon",
    type: "website",
    title: "Horizon — EMI, Future Value, Present Value, Compare & Income Tax",
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
  const lastUpdated = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(LAST_UPDATED_ISO));

  return (
    <html lang="en" suppressHydrationWarning className={sans.variable}>
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <SmoothScroll>
            <a
              href="#main-content"
              className="focusable fixed left-4 top-4 z-50 -translate-y-20 rounded-md bg-mine px-4 py-2 text-sm text-paper-2 transition-transform focus:translate-y-0"
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
                <p className="text-[0.75rem] tracking-wide text-graphite">
                  Indicative estimates · not financial advice ·{" "}
                  <Link
                    href="/disclaimer/"
                    className="focusable text-ink underline decoration-dotted underline-offset-4 transition-colors hover:text-mine hover:decoration-solid"
                  >
                    Disclaimer
                  </Link>
                </p>
                <p className="text-[0.75rem] tracking-wide text-graphite">
                  Prepared by ·{" "}
                  <a
                    href="https://swayam-agrawal.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="focusable text-ink underline decoration-dotted underline-offset-4 transition-colors hover:text-mine hover:decoration-solid"
                  >
                    <RandomLetterSwap label="Swayam Agrawal" />
                  </a>
                  <span className="mx-2 text-rule-strong">·</span>
                  <time dateTime={LAST_UPDATED_ISO} className="tnum">
                    Updated {lastUpdated}
                  </time>
                </p>
              </div>
            </footer>
          </SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  );
}
