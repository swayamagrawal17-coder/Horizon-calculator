function escapeCell(value: unknown): string {
  const s = value == null ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function rowLine(row: (string | number)[]): string {
  return row.map(escapeCell).join(",");
}

export interface CsvTable {
  head: string[];
  body: (string | number)[][];
}

export interface CsvReportOptions {
  filename: string;
  /** Report heading, e.g. "Loan EMI Report" — shown as "Horizon — <title>". */
  title: string;
  /** Ordered label/value pairs written above the table. A "Generated" row is added automatically. */
  meta: (readonly [string, string | number])[];
  table: CsvTable;
}

/**
 * A small metadata block (title, generated date, inputs and results) followed by
 * a blank row and the full data table — the CSV equivalent of the PDF report.
 */
export function exportCsv(opts: CsvReportOptions): void {
  const lines: string[] = [];
  lines.push(rowLine([`Horizon — ${opts.title}`]));
  lines.push(
    rowLine([
      "Generated",
      new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
    ]),
  );
  for (const [label, value] of opts.meta) lines.push(rowLine([label, value]));
  lines.push(""); // blank separator row before the table
  lines.push(rowLine(opts.table.head));
  for (const row of opts.table.body) lines.push(rowLine(row));

  const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, opts.filename.endsWith(".csv") ? opts.filename : `${opts.filename}.csv`);
}

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
