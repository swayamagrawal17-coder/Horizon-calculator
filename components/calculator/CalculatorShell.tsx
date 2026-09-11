interface Props {
  eyebrow: string;
  title: string;
  intro: string;
  inputs: React.ReactNode;
  results: React.ReactNode;
  belowFold?: React.ReactNode;
}

export function CalculatorShell({
  eyebrow,
  title,
  intro,
  inputs,
  results,
  belowFold,
}: Props) {
  return (
    <div>
      <header className="max-w-2xl">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-2 font-figure text-3xl leading-tight tracking-tight sm:text-[2.6rem]">
          {title}
        </h1>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-2">{intro}</p>
      </header>

      <div className="rule-t mt-8 grid gap-x-10 gap-y-8 pt-8 lg:grid-cols-[19rem_minmax(0,1fr)]">
        <form
          aria-label="Inputs"
          className="space-y-5"
          onSubmit={(e) => e.preventDefault()}
        >
          {inputs}
        </form>
        <div
          aria-label="Results"
          className="lg:border-l lg:border-rule lg:pl-10"
        >
          {results}
        </div>
      </div>

      {belowFold && <div className="mt-10">{belowFold}</div>}
    </div>
  );
}
