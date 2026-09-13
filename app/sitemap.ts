import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const SITE_URL = "https://horizon-calc.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/future-value/", "/present-value/"];
  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
  }));
}
