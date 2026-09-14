export interface CompareRow {
  label: string;
  tone?: "mine" | "accent";
  strong?: boolean;
  /** Which extreme counts as "best" for this row. Omit to skip highlighting. */
  better?: "min" | "max";
  values: number[];
  format: (n: number) => string;
}

export function CompareTable({
  columnLabels,
  rows,
}: {
  columnLabels: string[];
  rows: CompareRow[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] text-xs tnum">
        <caption className="sr-only">Scenario comparison</caption>
        <thead>
          <tr className="border-b border-rule-strong text-graphite">
            <th scope="col" className="py-2 pr-3 text-left font-medium">
              Metric
            </th>
            {columnLabels.map((label) => (
              <th
                key={label}
                scope="col"
                className="py-2 pl-3 text-right font-medium"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const bestIndex =
              row.better &&
              row.values.reduce(
                (best, v, i) =>
                  row.better === "min"
                    ? v < row.values[best]
                      ? i
                      : best
                    : v > row.values[best]
                      ? i
                      : best,
                0,
              );
            return (
              <tr key={row.label} className="border-b border-rule text-ink-2">
                <td className="flex items-center gap-2 py-1.5 pr-3 text-left text-graphite">
                  {row.tone && (
                    <span
                      aria-hidden
                      className={`inline-block h-2 w-2 rounded-full ${row.tone === "mine" ? "bg-mine" : "bg-accent"}`}
                    />
                  )}
                  {row.label}
                </td>
                {row.values.map((v, i) => (
                  <td
                    key={i}
                    className={`py-1.5 pl-3 text-right ${
                      row.strong || i === bestIndex ? "text-ink" : ""
                    }`}
                  >
                    {row.format(v)}
                    {i === bestIndex && <span className="ml-1 text-mine">●</span>}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
