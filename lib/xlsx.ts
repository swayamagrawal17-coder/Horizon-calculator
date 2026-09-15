import ExcelJS from "exceljs";

/* ------------------------------------------------------------------ */
/* Brand tokens (mirrors app/globals.css light palette and lib/pdf.ts) */
/* ------------------------------------------------------------------ */

const INK = "FF111827";
const INK_2 = "FF3F4859";
const GRAPHITE = "FF5B6472";
const RULE = "FFE2E5EA";
const RULE_STRONG = "FFC7CCD6";
const PAPER = "FFF4F6F9";
const PAPER_2 = "FFFFFFFF";
const MINE = "FF1D4ED8"; // trustworthy blue — money that is yours

const FONT = "Arial";

function thinBorder(argb: string) {
  const side = { style: "thin" as const, color: { argb } };
  return { top: side, left: side, bottom: side, right: side };
}

/* ------------------------------------------------------------------ */
/* Public shape — mirrors the PDF report's inputs                      */
/* ------------------------------------------------------------------ */

export interface XlsxTable {
  head: string[];
  body: (string | number)[][];
}

export interface XlsxReportOptions {
  filename: string;
  /** Report heading, e.g. "Loan EMI Report" — shown as "Horizon — <title>". */
  title: string;
  /** Ordered label/value pairs written above the table. A "Generated" row is added automatically. */
  meta: (readonly [string, string | number])[];
  table: XlsxTable;
}

/**
 * A branded, styled workbook — a masthead, a summary block (inputs and
 * results), and the full data table with a colored header row and
 * alternating row shading. The spreadsheet equivalent of the PDF report.
 */
export async function exportXlsx(opts: XlsxReportOptions): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Horizon";
  workbook.created = new Date();

  const sheetName = opts.title.replace(/[:\\/?*[\]]/g, "").slice(0, 31) || "Report";
  const sheet = workbook.addWorksheet(sheetName, {
    views: [{ showGridLines: false }],
  });

  const colCount = Math.max(2, opts.table.head.length);
  sheet.columns = Array.from({ length: colCount }, (_, i) => ({
    width: i === 0 ? 26 : 18,
  }));

  let r = 1;

  // Masthead
  sheet.mergeCells(r, 1, r, colCount);
  const titleCell = sheet.getCell(r, 1);
  titleCell.value = `Horizon — ${opts.title}`;
  titleCell.font = { name: FONT, size: 16, bold: true, color: { argb: INK } };
  titleCell.alignment = { vertical: "middle" };
  sheet.getRow(r).height = 28;
  r++;

  sheet.mergeCells(r, 1, r, colCount);
  const genCell = sheet.getCell(r, 1);
  genCell.value = `Generated ${new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  })}`;
  genCell.font = { name: FONT, size: 9, italic: true, color: { argb: GRAPHITE } };
  for (let c = 1; c <= colCount; c++) {
    sheet.getCell(r, c).border = { bottom: { style: "thin", color: { argb: RULE_STRONG } } };
  }
  r += 2; // blank spacer row after the rule

  // Meta block — label (gray) | value (bold, right-aligned), like the PDF's metric sections
  for (const [label, value] of opts.meta) {
    const labelCell = sheet.getCell(r, 1);
    labelCell.value = label;
    labelCell.font = { name: FONT, size: 10, color: { argb: GRAPHITE } };

    if (colCount > 2) sheet.mergeCells(r, 2, r, colCount);
    const valueCell = sheet.getCell(r, 2);
    if (typeof value === "number") {
      valueCell.value = value;
      valueCell.numFmt = "#,##0";
    } else {
      valueCell.value = value;
    }
    valueCell.font = { name: FONT, size: 10, bold: true, color: { argb: INK } };
    valueCell.alignment = { horizontal: "right" };
    r++;
  }
  r++; // blank spacer before the table

  // Data table
  const tableHeaderRow = r;
  opts.table.head.forEach((h, i) => {
    const cell = sheet.getCell(r, i + 1);
    cell.value = h;
    cell.font = { name: FONT, size: 10, bold: true, color: { argb: PAPER_2 } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: MINE } };
    cell.alignment = { horizontal: i === 0 ? "left" : "right", vertical: "middle" };
    cell.border = thinBorder(RULE_STRONG);
  });
  sheet.getRow(r).height = 22;
  r++;

  opts.table.body.forEach((row, rowIndex) => {
    row.forEach((value, i) => {
      const cell = sheet.getCell(r, i + 1);
      if (typeof value === "number") {
        cell.value = value;
        cell.numFmt = "#,##0";
      } else {
        cell.value = value;
      }
      cell.font = { name: FONT, size: 10, color: { argb: i === 0 ? GRAPHITE : INK_2 } };
      cell.alignment = { horizontal: i === 0 ? "left" : "right" };
      cell.border = thinBorder(RULE);
      if (rowIndex % 2 === 1) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: PAPER } };
      }
    });
    r++;
  });

  sheet.views = [{ state: "frozen", ySplit: tableHeaderRow, showGridLines: false }];

  // Footer disclaimer
  r++;
  sheet.mergeCells(r, 1, r, colCount);
  const footerCell = sheet.getCell(r, 1);
  footerCell.value = "Indicative estimates · not financial advice — Prepared by Horizon";
  footerCell.font = { name: FONT, size: 8, italic: true, color: { argb: GRAPHITE } };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  triggerDownload(blob, opts.filename.endsWith(".xlsx") ? opts.filename : `${opts.filename}.xlsx`);
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
