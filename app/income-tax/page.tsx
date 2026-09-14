import type { Metadata } from "next";
import { IncomeTaxPage } from "@/components/pages/IncomeTaxPage";

export const metadata: Metadata = {
  title: "Income Tax Calculator",
  description:
    "Old regime versus new regime, FY 2025-26 — enter your income and deductions once and see both totals side by side.",
  alternates: { canonical: "/income-tax/" },
  openGraph: {
    title: "Income Tax Calculator — Horizon",
    description:
      "Old regime versus new regime, FY 2025-26 — enter your income and deductions once and see both totals side by side.",
  },
};

export default function Page() {
  return <IncomeTaxPage />;
}
