import type { Metadata } from "next";
import { HomePage } from "@/components/pages/HomePage";

export const metadata: Metadata = {
  title: { absolute: "Horizon — Financial calculators" },
  description:
    "EMI, Future Value, Present Value, Compare, and Income Tax — five calculators for the time value of money, in one place.",
  alternates: { canonical: "/" },
  openGraph: {
    siteName: "Horizon",
    title: "Horizon — Financial calculators",
    description:
      "EMI, Future Value, Present Value, Compare, and Income Tax — five calculators for the time value of money, in one place.",
  },
};

export default function Page() {
  return <HomePage />;
}
