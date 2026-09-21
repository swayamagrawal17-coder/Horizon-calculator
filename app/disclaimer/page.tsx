import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Disclaimer",
  description:
    "Horizon is an educational tool. The author is not a SEBI-registered investment adviser or a tax professional.",
  alternates: { canonical: "/disclaimer/" },
  openGraph: {
    title: "Terms & Disclaimer — Horizon",
    description:
      "Horizon is an educational tool. The author is not a SEBI-registered investment adviser or a tax professional.",
  },
};

const sections: { title: string; body: string[] }[] = [
  {
    title: "Who is behind Horizon",
    body: [
      "Horizon is built and maintained by Swayam Agrawal as an independent educational project. The author is not registered with the Securities and Exchange Board of India (SEBI) as an investment adviser or research analyst, and is not a chartered accountant, tax practitioner or licensed financial planner.",
    ],
  },
  {
    title: "Education only, not advice",
    body: [
      "Everything on this site, including the calculators, the tips shown beside your results and the Learn articles, is general information meant to help you understand how money maths and tax rules work. None of it is investment advice, tax advice, legal advice or a recommendation to buy, sell or hold any security, product or scheme.",
      "Nothing here takes your personal circumstances, goals or risk appetite into account. Horizon does not recommend specific funds, schemes, insurers or other products.",
    ],
  },
  {
    title: "Figures are indicative",
    body: [
      "Calculators give estimates from the numbers you enter and simplified assumptions. The income tax calculator follows FY 2025-26 (AY 2026-27) rules and leaves out items such as surcharge, marginal relief and capital-gains rates. Tax laws, limits and rates change, and real outcomes will differ.",
      "Investment returns are never guaranteed. Any rate you enter, or any example in an article, is an assumption and not a forecast or promise.",
    ],
  },
  {
    title: "Please verify and consult a professional",
    body: [
      "Before you act on anything you read here, check it against the official sources (the Income Tax Department, the Finance Act, your lender or the scheme's own documents) and speak to a qualified, registered professional about your own situation.",
    ],
  },
  {
    title: "No liability",
    body: [
      "The site is provided as is, without warranties of any kind. To the fullest extent permitted by law, the author is not liable for any loss or damage arising from the use of, or reliance on, this site or its content.",
    ],
  },
  {
    title: "Your data",
    body: [
      "Horizon runs in your browser. The figures you enter stay on your device unless you choose to share a link, which encodes them in the address. There are no accounts and no server-side storage of your inputs.",
    ],
  },
];

export default function Page() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl leading-tight tracking-tight sm:text-[2.6rem]">
        Terms &amp; disclaimer
      </h1>
      <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-2">
        Horizon is a learning tool. Please read this once before relying on any
        number or tip on the site.
      </p>

      <div className="card mt-8 space-y-7">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="text-base font-semibold text-ink">{s.title}</h2>
            <div className="mt-2 space-y-3 text-sm leading-relaxed text-ink-2">
              {s.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-6 text-sm text-graphite">
        <Link
          href="/"
          className="focusable text-mine underline decoration-dotted underline-offset-4 hover:decoration-solid"
        >
          Back to the calculators
        </Link>
      </p>
    </div>
  );
}
