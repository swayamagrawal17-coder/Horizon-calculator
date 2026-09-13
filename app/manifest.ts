import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Horizon — EMI, Future Value & Present Value",
    short_name: "Horizon",
    description:
      "Loan EMI, step-up EMI, future value and present value calculators.",
    start_url: "/",
    display: "standalone",
    background_color: "#fcfbf8",
    theme_color: "#fcfbf8",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
