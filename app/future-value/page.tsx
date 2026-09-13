import type { Metadata } from "next";
import { FutureValuePage } from "@/components/pages/FutureValuePage";

export const metadata: Metadata = {
  title: "Future Value Calculator",
  description:
    "Project what a lump sum today plus regular contributions could grow to, compounded at your chosen frequency.",
  alternates: { canonical: "/future-value/" },
  openGraph: {
    title: "Future Value Calculator — Horizon",
    description:
      "Project what a lump sum today plus regular contributions could grow to, compounded at your chosen frequency.",
  },
};

export default function Page() {
  return <FutureValuePage />;
}
