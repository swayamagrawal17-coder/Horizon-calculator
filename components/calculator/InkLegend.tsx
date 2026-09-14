/** Explains the black/red ink color coding once, near the top of every calculator page. */
export function InkLegend() {
  return (
    <p className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-[0.75rem] text-graphite">
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden className="h-2 w-2 rounded-full bg-mine" />
        black ink — money that&rsquo;s yours
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden className="h-2 w-2 rounded-full bg-accent" />
        red ink — what it costs you
      </span>
    </p>
  );
}
