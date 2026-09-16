"use client";

import { Fragment, useState } from "react";

export interface ScheduleColumn<Row> {
  header: string;
  cell: (row: Row) => string;
}

interface Props<Row extends { period: number }> {
  caption: string;
  rows: Row[];
  columns: ScheduleColumn<Row>[];
  summariseYear: (rows: Row[]) => string[];
  yearLabel?: (year: number) => string;
}

export function ScheduleTable<Row extends { period: number }>({
  caption,
  rows,
  columns,
  summariseYear,
  yearLabel = (y) => `Year ${String(y).padStart(2, "0")}`,
}: Props<Row>) {
  const years: { year: number; rows: Row[] }[] = [];
  for (const row of rows) {
    const year = Math.ceil(row.period / 12);
    let bucket = years[years.length - 1];
    if (!bucket || bucket.year !== year) years.push((bucket = { year, rows: [] }));
    bucket.rows.push(row);
  }

  const [open, setOpen] = useState<Set<number>>(new Set());
  const toggle = (year: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(year) ? next.delete(year) : next.add(year);
      return next;
    });

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-xs tnum">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-rule-strong text-graphite">
            <th scope="col" className="py-2 pr-3 text-left font-medium">
              Period
            </th>
            {columns.map((c) => (
              <th
                key={c.header}
                scope="col"
                className="py-2 pl-3 text-right font-medium"
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {years.map(({ year, rows: yearRows }) => {
            const isOpen = open.has(year);
            const summary = summariseYear(yearRows);
            return (
              <Fragment key={year}>
                <tr className="border-b border-rule-strong text-ink">
                  <th scope="row" className="p-0 text-left font-normal">
                    <button
                      type="button"
                      onClick={() => toggle(year)}
                      aria-expanded={isOpen}
                      className="focusable flex min-h-[40px] w-full items-center gap-2 py-2 pr-3 text-left hover:text-mine"
                    >
                      <span className="text-graphite" aria-hidden>
                        {isOpen ? "–" : "+"}
                      </span>
                      {yearLabel(year)}
                    </button>
                  </th>
                  {summary.map((value, i) => (
                    <td key={i} className="py-2 pl-3 text-right">
                      {value}
                    </td>
                  ))}
                </tr>
                {isOpen &&
                  yearRows.map((row, i) => (
                    <tr
                      key={row.period}
                      className="animate-rise-in border-b border-rule text-ink-2"
                      style={{ animationDelay: `${Math.min(i, 8) * 12}ms` }}
                    >
                      <td className="py-1.5 pr-3 pl-4 text-left text-graphite">
                        {String(row.period).padStart(3, "0")}
                      </td>
                      {columns.map((c) => (
                        <td key={c.header} className="py-1.5 pl-3 text-right">
                          {c.cell(row)}
                        </td>
                      ))}
                    </tr>
                  ))}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
