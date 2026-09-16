/** A warning/notice strip, used wherever a plan needs a heads-up. */
export function Callout({ children }: { children: React.ReactNode }) {
  return (
    <p className="animate-rise-in max-w-2xl rounded-md border border-accent/25 bg-accent/10 px-3 py-2.5 text-[0.8rem] leading-relaxed text-accent-2">
      {children}
    </p>
  );
}
