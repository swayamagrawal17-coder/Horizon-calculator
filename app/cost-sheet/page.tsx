import type { Metadata } from "next";
import { CostSheetPage } from "@/components/pages/CostSheetPage";

export const metadata: Metadata = {
  title: "Cost Sheet & Break-Even Calculator",
  description:
    "Material, labour, overheads and selling price in — a live break-even chart and standard-costing variance analysis out. Compare up to four products side by side.",
  alternates: { canonical: "/cost-sheet/" },
  openGraph: {
    title: "Cost Sheet & Break-Even Calculator — Horizon",
    description:
      "Material, labour, overheads and selling price in — a live break-even chart and standard-costing variance analysis out.",
  },
};

export default function Page() {
  return <CostSheetPage />;
}
