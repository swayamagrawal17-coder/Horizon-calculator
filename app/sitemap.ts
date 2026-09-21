import type { MetadataRoute } from "next";

import { articles } from "@/lib/learn/articles";

export const dynamic = "force-static";

const SITE_URL = "https://horizon-calc.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/emi/",
    "/future-value/",
    "/present-value/",
    "/compare/",
    "/income-tax/",
    "/learn/",
    ...articles.map((a) => `/learn/${a.slug}/`),
    "/disclaimer/",
  ];
  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
  }));
}
