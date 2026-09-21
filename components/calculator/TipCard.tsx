import Link from "next/link";
import { EducationNote } from "@/components/ui/EducationNote";

/** A quiet educational aside beside results, linked to a Learn guide. Blue,
 * so it reads as information, distinct from the amber warning Callout. */
export function TipCard({
  title,
  children,
  href,
  linkLabel,
}: {
  title: string;
  children: React.ReactNode;
  href: string;
  linkLabel: string;
}) {
  return (
    <aside className="max-w-2xl rounded-md border border-mine/25 bg-mine/5 px-4 py-3.5">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <div className="mt-1.5 space-y-2 text-[0.82rem] leading-relaxed text-ink-2">{children}</div>
      <Link
        href={href}
        className="focusable mt-2 inline-block text-[0.82rem] font-medium text-mine underline decoration-dotted underline-offset-4 hover:decoration-solid"
      >
        {linkLabel} →
      </Link>
      <EducationNote className="mt-2" />
    </aside>
  );
}
