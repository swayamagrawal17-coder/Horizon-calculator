interface Props {
  eyebrow: string;
  title: string;
  intro: string;
  inputs: React.ReactNode;
  results: React.ReactNode;
  belowFold?: React.ReactNode;
  legend?: boolean;
}

const card = "rounded-md border border-rule bg-paper-2 p-5 shadow-sm sm:p-6";

export function CalculatorShell({
  title,
  intro,
  inputs,
  results,
  belowFold,
}: Props) {
  return (
    <div>
      <header className="max-w-2xl">
        <h1 className="text-3xl leading-tight tracking-tight sm:text-[2.6rem]">
          {title}
        </h1>
        <p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-ink-2">{intro}</p>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[19rem_minmax(0,1fr)]">
        <form
          aria-label="Inputs"
          className={`${card} space-y-5`}
          onSubmit={(e) => e.preventDefault()}
        >
          {inputs}
        </form>
        <div aria-label="Results" className={card}>
          {results}
        </div>
      </div>

      {belowFold && <div className={`mt-6 ${card}`}>{belowFold}</div>}
    </div>
  );
}
