import type { Metadata } from "next";
import { EmiCalculatorPage } from "@/components/pages/EmiCalculatorPage";

export const metadata: Metadata = {
  title: "EMI Calculator",
  description:
    "Work out the monthly instalment on a reducing-balance loan, model a step-up EMI, and see the full amortization schedule.",
  alternates: { canonical: "/emi/" },
  openGraph: {
    title: "EMI Calculator — Horizon",
    description:
      "Work out the monthly instalment on a reducing-balance loan, model a step-up EMI, and see the full amortization schedule.",
  },
};

export default function Page() {
  return <EmiCalculatorPage />;
}
