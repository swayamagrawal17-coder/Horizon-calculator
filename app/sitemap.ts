import type { MetadataRoute } from "next";

export const dynamic = "force-static";

// TODO: replace with the real deployed domain once it's known.
const SITE_URL = "https://horizon-calculator.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/future-value/", "/present-value/"];
  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
  }));
}
