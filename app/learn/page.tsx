import type { Metadata } from "next";
import Link from "next/link";
import { articles } from "@/lib/learn/articles";
import { EducationNote } from "@/components/ui/EducationNote";

export const metadata: Metadata = {
  title: "Learn",
  description:
    "Plain-language guides on saving tax, compounding, SIPs and loans, written to go with the Horizon calculators.",
  alternates: { canonical: "/learn/" },
  openGraph: {
    title: "Learn — Horizon",
    description:
      "Plain-language guides on saving tax, compounding, SIPs and loans, written to go with the Horizon calculators.",
  },
};

export default function Page() {
  return (
    <div>
      <header className="max-w-2xl">
        <h1 className="text-3xl leading-tight tracking-tight sm:text-[2.6rem]">
          Learn the money maths behind the numbers
        </h1>
        <p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-ink-2">
          Short guides on tax saving, compounding and loans. Each one links to the
          calculator that lets you try it with your own figures.
        </p>
        <EducationNote className="mt-3 max-w-md" />
      </header>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {articles.map((a) => (
          <li key={a.slug} className="flex">
            <Link
              href={`/learn/${a.slug}/`}
              className="focusable group card flex w-full flex-col transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-mine hover:shadow-md active:translate-y-0 active:scale-[0.99]"
            >
              <p className="field-label">
                {a.topic}
                {a.asOf ? ` · ${a.asOf}` : ""} · {a.minutes} min read
              </p>
              <h2 className="mt-1.5 text-lg font-semibold leading-snug text-ink">
                {a.title}
              </h2>
              <p className="mt-1.5 text-[0.85rem] leading-relaxed text-ink-2">
                {a.description}
              </p>
              <span className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-medium text-mine">
                Read
                <span aria-hidden className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
