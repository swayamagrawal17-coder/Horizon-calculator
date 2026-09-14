import Link from "next/link";
import { HorizonMark } from "./HorizonMark";

const entries = [
  {
    href: "/emi",
    eyebrow: "Loan · reducing balance",
    title: "EMI calculator",
    description:
      "What a loan costs, month by month — including step-up EMI, and a full amortization schedule.",
  },
  {
    href: "/future-value",
    eyebrow: "Savings · compound growth",
    title: "Future value calculator",
    description:
      "What today's money becomes — a lump sum plus regular contributions, compounded over time.",
  },
  {
    href: "/present-value",
    eyebrow: "Discount · time value",
    title: "Present value calculator",
    description:
      "What future money is worth now — a sum due later, discounted back to today.",
  },
  {
    href: "/compare",
    eyebrow: "Side by side",
    title: "Compare",
    description:
      "Line up two to four loans, savings plans, or payouts at different amounts and rates.",
  },
  {
    href: "/income-tax",
    eyebrow: "India · FY 2025-26",
    title: "Income tax calculator",
    description:
      "Old regime versus new regime, worked out side by side so you can see which pays less.",
  },
] as const;

export function HomePage() {
  return (
    <div>
      <header className="relative max-w-2xl">
        <HorizonMark />
        <h1 className="text-3xl leading-tight tracking-tight sm:text-[2.6rem]">
          Five worksheets for the time value of money
        </h1>
        <p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-ink-2">
          Pick a calculator below. Every figure updates live, every page can be
          shared by its URL, and every result can be downloaded as a CSV or a
          PDF report.
        </p>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {entries.map((entry) => (
          <Link
            key={entry.href}
            href={entry.href}
            className="focusable group rounded-md border border-rule bg-paper-2 p-5 shadow-sm transition-colors hover:border-mine sm:p-6"
          >
            <p className="field-label">{entry.eyebrow}</p>
            <p className="mt-1.5 text-xl font-semibold text-ink">{entry.title}</p>
            <p className="mt-1.5 text-[0.85rem] leading-relaxed text-ink-2">
              {entry.description}
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-mine">
              Open
              <span
                aria-hidden
                className="transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
