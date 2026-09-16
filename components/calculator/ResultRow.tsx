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
            className={`inline-block h-2 w-2 rounded-full ${
              tone === "mine" ? "bg-mine" : "bg-accent"
            }`}
          />
        )}
        {label}
      </span>
      <span
        className={`tnum ${
          strong ? "font-semibold text-ink" : "text-ink-2"
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
      <p className="field-label">{eyebrow}</p>
      <p
        aria-live="polite"
        className="text-[2.3rem] font-semibold leading-[1.05] tracking-tight text-ink tnum sm:text-[2.7rem]"
      >
        {value}
      </p>
      {note && <p className="mt-1.5 text-[0.8rem] text-graphite">{note}</p>}
    </div>
  );
}

/** Single bar: money that is yours (blue) vs what it costs (amber). */
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
        className="flex h-3 w-full overflow-hidden rounded-full"
        role="img"
        aria-label={`${mineLabel} ${minePct.toFixed(0)} percent, ${costLabel} ${(100 - minePct).toFixed(0)} percent`}
      >
        <div
          className="bg-mine transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ width: `${minePct}%` }}
        />
        <div
          className="bg-accent transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ width: `${100 - minePct}%` }}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[0.75rem] text-graphite">
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
