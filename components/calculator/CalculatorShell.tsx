interface Props {
  title: string;
  intro: string;
  inputs: React.ReactNode;
  results: React.ReactNode;
  belowFold?: React.ReactNode;
}

const card = "card";

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

      <div className="mt-8 grid min-w-0 gap-6 lg:grid-cols-[19rem_minmax(0,1fr)]">
        <form
          aria-label="Inputs"
          className={`${card} min-w-0 space-y-5`}
          onSubmit={(e) => e.preventDefault()}
        >
          <h2 className="sr-only">Inputs</h2>
          {inputs}
        </form>
        <div aria-label="Results" className={`${card} min-w-0`}>
          <h2 className="sr-only">Results</h2>
          {results}
        </div>
      </div>

      {belowFold && (
        <div className={`mt-6 ${card}`}>
          <h2 className="sr-only">More detail</h2>
          {belowFold}
        </div>
      )}
    </div>
  );
}
