import type { Metadata } from "next";
import { ComparePage } from "@/components/pages/ComparePage";

export const metadata: Metadata = {
  title: "Compare Calculator",
  description:
    "Line up two to four loans, savings plans, or payouts at different amounts and rates, side by side.",
  alternates: { canonical: "/compare/" },
  openGraph: {
    title: "Compare Calculator — Horizon",
    description:
      "Line up two to four loans, savings plans, or payouts at different amounts and rates, side by side.",
  },
};

export default function Page() {
  return <ComparePage />;
}
