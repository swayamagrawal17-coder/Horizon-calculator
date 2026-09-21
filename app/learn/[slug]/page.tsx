import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { articles, getArticle } from "@/lib/learn/articles";
import { EducationNote } from "@/components/ui/EducationNote";

export const dynamicParams = false;

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: `/learn/${article.slug}/` },
    openGraph: {
      title: `${article.title} — Horizon`,
      description: article.description,
    },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  return (
    <article className="max-w-2xl">
      <p className="text-sm">
        <Link
          href="/learn/"
          className="focusable text-mine underline decoration-dotted underline-offset-4 hover:decoration-solid"
        >
          ← All guides
        </Link>
      </p>
      <header className="mt-4">
        <p className="field-label">
          {article.topic}
          {article.asOf ? ` · Rules as of ${article.asOf}` : ""} · {article.minutes} min read
        </p>
        <h1 className="mt-2 text-3xl leading-tight tracking-tight sm:text-[2.4rem]">
          {article.title}
        </h1>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-2">{article.description}</p>
      </header>

      <div className="card mt-8 space-y-4">
        {article.body.map((b, i) => {
          switch (b.type) {
            case "h2":
              return (
                <h2 key={i} className="pt-2 text-lg font-semibold text-ink">
                  {b.text}
                </h2>
              );
            case "p":
              return (
                <p key={i} className="text-[0.95rem] leading-relaxed text-ink-2">
                  {b.text}
                </p>
              );
            case "ul":
              return (
                <ul key={i} className="list-disc space-y-1.5 pl-5 text-[0.95rem] leading-relaxed text-ink-2 marker:text-graphite">
                  {b.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              );
            case "facts":
              return (
                <dl key={i} className="divide-y divide-rule rounded-md border border-rule">
                  {b.rows.map(([k, v]) => (
                    <div key={k} className="grid gap-1 px-3 py-2.5 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-4">
                      <dt className="text-[0.82rem] font-medium text-ink">{k}</dt>
                      <dd className="text-[0.85rem] leading-relaxed text-ink-2">{v}</dd>
                    </div>
                  ))}
                </dl>
              );
          }
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
        <Link
          href={article.cta.href}
          className="focusable inline-flex min-h-[40px] items-center rounded-lg bg-mine px-4 py-2 text-sm font-medium text-paper-2 transition-[opacity,transform] duration-150 hover:opacity-90 active:scale-[0.97]"
        >
          {article.cta.label}
        </Link>
      </div>
      <EducationNote className="mt-5" />
    </article>
  );
}
