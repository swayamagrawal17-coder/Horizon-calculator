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
      <table className="w-full min-w-[560px] font-mono text-xs tnum">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-ink text-graphite">
            <th scope="col" className="py-2 pr-3 text-left font-normal uppercase tracking-wider">
              Period
            </th>
            {columns.map((c) => (
              <th
                key={c.header}
                scope="col"
                className="py-2 pl-3 text-right font-normal uppercase tracking-wider"
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
                <tr
                  className="cursor-pointer border-b border-rule-strong text-ink hover:text-accent"
                  onClick={() => toggle(year)}
                >
                  <th scope="row" className="py-2 pr-3 text-left font-normal">
                    <span className="inline-flex items-center gap-2">
                      <span className="text-graphite">{isOpen ? "–" : "+"}</span>
                      {yearLabel(year)}
                    </span>
                  </th>
                  {summary.map((value, i) => (
                    <td key={i} className="py-2 pl-3 text-right">
                      {value}
                    </td>
                  ))}
                </tr>
                {isOpen &&
                  yearRows.map((row) => (
                    <tr key={row.period} className="border-b border-rule text-ink-2">
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
