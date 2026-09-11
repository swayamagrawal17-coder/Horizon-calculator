interface RowProps {
  label: string;
  value: string;
  tone?: "mine" | "accent";
  strong?: boolean;
}

export function ResultRow({ label, value, tone, strong }: RowProps) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-rule py-2 last:border-b-0">
      <span className="flex items-center gap-2 text-[0.8rem] text-graphite">
        {tone && (
          <span
            aria-hidden
            className={`inline-block h-2 w-2 ${
              tone === "mine" ? "bg-mine" : "bg-accent"
            }`}
          />
        )}
        {label}
      </span>
      <span
        className={`font-mono tnum ${
          strong ? "text-ink" : "text-ink-2"
        } text-sm`}
      >
        {value}
      </span>
    </div>
  );
}

export function HeroFigure({
  eyebrow,
  value,
  note,
}: {
  eyebrow: string;
  value: string;
  note?: string;
}) {
  return (
    <div>
      <p className="eyebrow">{eyebrow}</p>
      <p
        aria-live="polite"
        className="font-figure text-[2.9rem] leading-[1.05] tracking-tight text-ink tnum sm:text-[3.4rem]"
      >
        {value}
      </p>
      {note && <p className="mt-1.5 font-mono text-[0.8rem] text-graphite">{note}</p>}
    </div>
  );
}

/** Single ruled bar: money that is yours (ink) vs what it costs (accent). */
export function SplitBar({
  mine,
  cost,
  mineLabel,
  costLabel,
}: {
  mine: number;
  cost: number;
  mineLabel: string;
  costLabel: string;
}) {
  const total = Math.max(1, mine + cost);
  const minePct = (Math.max(0, mine) / total) * 100;
  return (
    <div>
      <div
        className="flex h-3 w-full overflow-hidden rounded-sm border border-ink"
        role="img"
        aria-label={`${mineLabel} ${minePct.toFixed(0)} percent, ${costLabel} ${(100 - minePct).toFixed(0)} percent`}
      >
        <div className="bg-mine" style={{ width: `${minePct}%` }} />
        <div className="bg-accent" style={{ width: `${100 - minePct}%` }} />
      </div>
      <div className="mt-1.5 flex justify-between font-mono text-[0.72rem] uppercase tracking-wider text-graphite">
        <span>
          {mineLabel} · {minePct.toFixed(1)}%
        </span>
        <span>
          {costLabel} · {(100 - minePct).toFixed(1)}%
        </span>
      </div>
    </div>
  );
}
