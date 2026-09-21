import Link from "next/link";

/** Short standing reminder that tips and guides are education, not advice. */
export function EducationNote({ className = "" }: { className?: string }) {
  return (
    <p className={`text-[0.75rem] leading-relaxed text-graphite ${className}`}>
      For education only. I am not a SEBI-registered investment adviser or a tax
      professional.{" "}
      <Link
        href="/disclaimer/"
        className="focusable text-ink underline decoration-dotted underline-offset-4 hover:text-mine hover:decoration-solid"
      >
        Read the full disclaimer
      </Link>
      .
    </p>
  );
}
