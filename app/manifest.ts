import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Horizon — EMI, Future Value, Present Value, Compare & Income Tax",
    short_name: "Horizon",
    description:
      "Loan EMI, step-up EMI, future value, present value, side-by-side comparisons and India income tax calculators.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f6f9",
    theme_color: "#f4f6f9",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
