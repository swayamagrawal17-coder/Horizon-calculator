import { jsPDF, GState } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCompactINR } from "./format";

/* ------------------------------------------------------------------ */
/* Brand tokens (mirrors app/globals.css light palette)                */
/* ------------------------------------------------------------------ */

type RGB = [number, number, number];
const PAPER: RGB = [252, 251, 248];
const PAPER_2: RGB = [246, 244, 238];
const INK: RGB = [25, 27, 25];
const INK_2: RGB = [82, 86, 79];
const GRAPHITE: RGB = [99, 103, 94];
const RULE: RGB = [220, 215, 204];
const RULE_STRONG: RGB = [178, 173, 159];
const ACCENT: RGB = [178, 59, 30];
const ACCENT_2: RGB = [122, 40, 20];

const MARGIN = 40;

/**
 * jsPDF's standard fonts (Helvetica/Times/Courier) only cover WinAnsi —
 * no rupee sign, no arrow. Swap the handful of characters the app's
 * formatters can produce for ASCII-safe equivalents before drawing.
 */
function pdfSafe(s: string): string {
  return s.replace(/₹/g, "Rs. ").replace(/→/g, "->");
}
function pdfSafeRow(row: [string, string]): [string, string] {
  return [pdfSafe(row[0]), pdfSafe(row[1])];
}
function pdfSafeCell(cell: string | number): string | number {
  return typeof cell === "string" ? pdfSafe(cell) : cell;
}

/* ------------------------------------------------------------------ */
/* Public shape                                                        */
/* ------------------------------------------------------------------ */

export interface PdfSection {
  title: string;
  rows: [string, string][];
}

export interface PdfTable {
  title?: string;
  head: string[];
  body: (string | number)[][];
}

export interface PdfChartSeries {
  key: string;
  label: string;
  values: number[];
  tone: "mine" | "accent";
  kind: "area" | "line";
  /** Key of another series in the same chart this one stacks on top of. */
  stackWith?: string;
}

export interface PdfChartConfig {
  title: string;
  xLabel: string;
  xValues: number[];
  series: PdfChartSeries[];
}

export interface PdfSplitBar {
  mineLabel: string;
  mineValue: number;
  costLabel: string;
  costValue: number;
}

export interface PdfReportOptions {
  filename: string;
  eyebrow: string;
  title: string;
  /** Input-summary lines. A "Generated <date>" line is appended automatically. */
  meta: string[];
  hero: { label: string; value: string; note?: string };
  metrics: PdfSection[];
  splitBar?: PdfSplitBar;
  chart?: PdfChartConfig;
  callout?: string;
  table?: PdfTable;
  shareUrl?: string;
}

/* ------------------------------------------------------------------ */
/* Low-level path helpers                                              */
/* ------------------------------------------------------------------ */

/** Draw (fill and/or stroke) a path through absolute points. */
function drawPath(
  doc: jsPDF,
  points: [number, number][],
  style: "F" | "S" | "FD",
  closed: boolean,
): void {
  if (points.length < 2) return;
  const [x0, y0] = points[0];
  const deltas = points.slice(1).map((p, i) => [p[0] - points[i][0], p[1] - points[i][1]]);
  doc.lines(deltas, x0, y0, [1, 1], style, closed);
}

function withOpacity(doc: jsPDF, opacity: number, fn: () => void): void {
  doc.setGState(new GState({ opacity }));
  fn();
  doc.setGState(new GState({ opacity: 1 }));
}

/** The half-sun-over-a-horizon mark, matching components/layout/Header.tsx. */
function drawMark(doc: jsPDF, cx: number, cy: number, r: number): void {
  doc.setDrawColor(...INK);
  doc.setLineWidth(2);
  doc.line(cx - r - 2, cy, cx + r + 2, cy);

  const steps = 24;
  const dome: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (Math.PI * i) / steps;
    dome.push([cx - r * Math.cos(t), cy - r * Math.sin(t)]);
  }
  doc.setFillColor(...ACCENT);
  drawPath(doc, dome, "F", true);
}

/* ------------------------------------------------------------------ */
/* Chart                                                                */
/* ------------------------------------------------------------------ */

function buildXTicks(min: number, max: number): number[] {
  const span = max - min || 1;
  const step = span <= 6 ? 1 : span <= 15 ? 2 : span <= 30 ? 5 : 10;
  const out: number[] = [];
  for (let t = Math.ceil(min); t <= Math.floor(max); t += step) out.push(t);
  return out.length ? out : [min, max];
}

function formatX(v: number): string {
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

/** Draws the chart in the given box and returns the y-cursor after the legend. */
function drawChart(doc: jsPDF, x: number, y: number, w: number, h: number, config: PdfChartConfig): number {
  const xs = config.xValues;
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const span = xMax - xMin || 1;

  const byKey = new Map(config.series.map((s) => [s.key, s]));
  const topsCache = new Map<string, number[]>();
  const topsFor = (s: PdfChartSeries): number[] => {
    const cached = topsCache.get(s.key);
    if (cached) return cached;
    const base = s.stackWith ? topsFor(byKey.get(s.stackWith)!) : xs.map(() => 0);
    const tops = s.values.map((v, i) => base[i] + v);
    topsCache.set(s.key, tops);
    return tops;
  };
  const bottomsFor = (s: PdfChartSeries): number[] =>
    s.stackWith ? topsFor(byKey.get(s.stackWith)!) : xs.map(() => 0);

  let yMax = 1;
  for (const s of config.series) yMax = Math.max(yMax, ...topsFor(s));

  const mapX = (v: number) => x + ((v - xMin) / span) * w;
  const mapY = (v: number) => y + h - (v / yMax) * h;

  // Frame + gridlines
  doc.setDrawColor(...RULE_STRONG);
  doc.setLineWidth(0.75);
  doc.rect(x, y, w, h);

  doc.setFont("courier", "normal");
  doc.setFontSize(7);
  for (const frac of [0, 0.25, 0.5, 0.75, 1]) {
    const gy = y + h - frac * h;
    doc.setDrawColor(...RULE);
    doc.setLineWidth(0.5);
    if (frac > 0) doc.line(x, gy, x + w, gy);
    doc.setTextColor(...GRAPHITE);
    doc.text(pdfSafe(formatCompactINR(frac * yMax)), x - 4, gy + 2, { align: "right" });
  }

  for (const t of buildXTicks(xMin, xMax)) {
    const tx = mapX(t);
    doc.setDrawColor(...RULE_STRONG);
    doc.line(tx, y + h, tx, y + h + 3);
    doc.setTextColor(...GRAPHITE);
    doc.text(formatX(t), tx, y + h + 12, { align: "center" });
  }
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(...GRAPHITE);
  doc.text(config.xLabel, x + w, y + h + 25, { align: "right" });

  // Series
  for (const s of config.series) {
    const tone = s.tone === "mine" ? INK : ACCENT;
    const tops = topsFor(s);
    const topPoints: [number, number][] = xs.map((v, i) => [mapX(v), mapY(tops[i])]);

    if (s.kind === "area") {
      const bottoms = bottomsFor(s);
      const bottomPoints: [number, number][] = xs.map((v, i) => [mapX(v), mapY(bottoms[i])]);
      const band = [...topPoints, ...bottomPoints.reverse()];
      doc.setFillColor(...tone);
      withOpacity(doc, 0.18, () => drawPath(doc, band, "F", true));
      doc.setDrawColor(...tone);
      doc.setLineWidth(1.4);
      drawPath(doc, topPoints, "S", false);
    } else {
      doc.setDrawColor(...tone);
      doc.setLineWidth(1.2);
      doc.setLineDashPattern([4, 2.5], 0);
      drawPath(doc, topPoints, "S", false);
      doc.setLineDashPattern([], 0);
    }
  }

  // Legend
  let legendY = y + h + 42;
  let legendX = x;
  doc.setFontSize(8);
  for (const s of config.series) {
    const tone = s.tone === "mine" ? INK : ACCENT;
    if (s.kind === "area") {
      doc.setFillColor(...tone);
      doc.rect(legendX, legendY - 6, 10, 6, "F");
    } else {
      doc.setDrawColor(...tone);
      doc.setLineWidth(1.2);
      doc.setLineDashPattern([3, 2], 0);
      doc.line(legendX, legendY - 3, legendX + 10, legendY - 3);
      doc.setLineDashPattern([], 0);
    }
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...INK_2);
    doc.text(s.label, legendX + 14, legendY);
    legendX += 14 + doc.getTextWidth(s.label) + 20;
  }

  return legendY + 4;
}

/* ------------------------------------------------------------------ */
/* Split bar                                                           */
/* ------------------------------------------------------------------ */

function drawSplitBar(doc: jsPDF, x: number, y: number, w: number, bar: PdfSplitBar): number {
  const total = Math.max(1, bar.mineValue + bar.costValue);
  const minePct = (Math.max(0, bar.mineValue) / total) * 100;
  const mineW = (w * minePct) / 100;

  doc.setFillColor(...INK);
  doc.rect(x, y, mineW, 10, "F");
  doc.setFillColor(...ACCENT);
  doc.rect(x + mineW, y, w - mineW, 10, "F");
  doc.setDrawColor(...INK);
  doc.setLineWidth(0.75);
  doc.rect(x, y, w, 10);

  const capY = y + 22;
  doc.setFont("courier", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GRAPHITE);
  doc.text(`${bar.mineLabel.toUpperCase()} · ${minePct.toFixed(1)}%`, x, capY);
  doc.text(`${bar.costLabel.toUpperCase()} · ${(100 - minePct).toFixed(1)}%`, x + w, capY, {
    align: "right",
  });

  return capY + 10;
}

/* ------------------------------------------------------------------ */
/* Report                                                               */
/* ------------------------------------------------------------------ */

export function exportPdf(opts: PdfReportOptions): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const PAGE_W = doc.internal.pageSize.getWidth();
  const PAGE_H = doc.internal.pageSize.getHeight();
  const CONTENT_W = PAGE_W - MARGIN * 2;
  const BOTTOM = PAGE_H - 62;

  let y = MARGIN;
  const ensure = (needed: number) => {
    if (y + needed > BOTTOM) {
      doc.addPage();
      y = MARGIN;
    }
  };

  // Masthead
  drawMark(doc, MARGIN + 8, y + 8, 7);
  doc.setFont("times", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...INK);
  doc.text("Horizon", MARGIN + 24, y + 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GRAPHITE);
  doc.text(opts.eyebrow.toUpperCase(), PAGE_W - MARGIN, y + 12, { align: "right" });
  y += 26;
  doc.setDrawColor(...RULE_STRONG);
  doc.setLineWidth(1);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 24;

  // Title + meta
  doc.setFont("times", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...INK);
  doc.text(opts.title, MARGIN, y);
  y += 16;

  const generated = `Generated ${new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  })}`;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GRAPHITE);
  for (const line of [...opts.meta, generated]) {
    doc.text(pdfSafe(line), MARGIN, y);
    y += 12;
  }
  y += 12;

  // Hero
  ensure(64);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GRAPHITE);
  doc.text(opts.hero.label.toUpperCase(), MARGIN, y);
  y += 30;
  doc.setFont("times", "bold");
  doc.setFontSize(28);
  doc.setTextColor(...INK);
  doc.text(pdfSafe(opts.hero.value), MARGIN, y);
  if (opts.hero.note) {
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...GRAPHITE);
    doc.text(pdfSafe(opts.hero.note), MARGIN, y);
  }
  y += 26;

  // Chart
  if (opts.chart) {
    const chartH = 190;
    ensure(chartH + 60);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...INK);
    doc.text(opts.chart.title.toUpperCase(), MARGIN, y);
    y += 16;
    const gutter = 56; // room for "Rs. NN.NNCr"-width y-axis labels
    y = drawChart(doc, MARGIN + gutter, y, CONTENT_W - gutter, chartH, opts.chart);
    y += 18;
  }

  // Split bar
  if (opts.splitBar) {
    ensure(44);
    y = drawSplitBar(doc, MARGIN, y, CONTENT_W, opts.splitBar);
    y += 20;
  }

  // Callout
  if (opts.callout) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.5);
    const lines = doc.splitTextToSize(pdfSafe(opts.callout), CONTENT_W - 16) as string[];
    ensure(lines.length * 11 + 18);
    doc.setFillColor(...ACCENT);
    doc.rect(MARGIN, y - 8, 2.5, lines.length * 11 + 4, "F");
    doc.setTextColor(...ACCENT_2);
    doc.text(lines, MARGIN + 12, y);
    y += lines.length * 11 + 18;
  }

  // Metric sections
  for (const section of opts.metrics) {
    ensure(22 + section.rows.length * 16);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(...INK);
    doc.text(section.title, MARGIN, y);
    y += 8;
    autoTable(doc, {
      startY: y,
      margin: { left: MARGIN, right: MARGIN },
      theme: "plain",
      styles: { fontSize: 9, cellPadding: { top: 3, bottom: 3, left: 0, right: 0 } },
      columnStyles: {
        0: { textColor: GRAPHITE },
        1: { halign: "right", fontStyle: "bold", font: "courier", textColor: INK },
      },
      body: section.rows.map(pdfSafeRow),
    });
    // @ts-expect-error lastAutoTable is added by the plugin
    y = doc.lastAutoTable.finalY + 18;
  }

  // Table
  if (opts.table) {
    if (opts.table.title) {
      ensure(30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(...INK);
      doc.text(opts.table.title, MARGIN, y);
      y += 8;
    }
    autoTable(doc, {
      startY: y,
      margin: { left: MARGIN, right: MARGIN, bottom: 60 },
      head: [opts.table.head.map(pdfSafe)],
      body: opts.table.body.map((row) => row.map(pdfSafeCell)),
      styles: { fontSize: 8.5, cellPadding: 4, font: "courier" },
      headStyles: { fillColor: INK, textColor: PAPER, font: "helvetica", fontStyle: "bold" },
      alternateRowStyles: { fillColor: PAPER_2 },
    });
  }

  // Footer — final pass over every page produced above
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setDrawColor(...RULE);
    doc.setLineWidth(0.75);
    doc.line(MARGIN, PAGE_H - 46, PAGE_W - MARGIN, PAGE_H - 46);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...GRAPHITE);
    doc.text(`Prepared by Swayam Agrawal — Horizon`, MARGIN, PAGE_H - 33);
    if (opts.shareUrl) doc.text(opts.shareUrl, MARGIN, PAGE_H - 22);

    doc.text(`Page ${i} of ${total}`, PAGE_W - MARGIN, PAGE_H - 33, { align: "right" });
    doc.text("Indicative estimates · not financial advice", PAGE_W - MARGIN, PAGE_H - 22, {
      align: "right",
    });
  }

  doc.save(opts.filename.endsWith(".pdf") ? opts.filename : `${opts.filename}.pdf`);
}
