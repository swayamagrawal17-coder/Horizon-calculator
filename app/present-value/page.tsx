import type { Metadata } from "next";
import { PresentValuePage } from "@/components/pages/PresentValuePage";

export const metadata: Metadata = {
  title: "Present Value Calculator",
  description:
    "Find what a future amount, and any recurring future payments, are worth in today's money at a given discount rate.",
  alternates: { canonical: "/present-value/" },
  openGraph: {
    title: "Present Value Calculator — Horizon",
    description:
      "Find what a future amount, and any recurring future payments, are worth in today's money at a given discount rate.",
  },
};

export default function Page() {
  return <PresentValuePage />;
}
