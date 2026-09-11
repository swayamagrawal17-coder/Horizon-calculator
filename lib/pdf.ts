import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export interface PdfSection {
  title: string;
  rows: [string, string][];
}

export interface PdfTable {
  title?: string;
  head: string[];
  body: (string | number)[][];
}

const ACCENT: [number, number, number] = [16, 122, 87];

export function exportPdf(opts: {
  filename: string;
  heading: string;
  subheading?: string;
  sections: PdfSection[];
  table?: PdfTable;
}): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 48;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(20, 20, 20);
  doc.text(opts.heading, 40, y);
  y += 18;

  if (opts.subheading) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text(opts.subheading, 40, y);
    y += 16;
  }

  doc.setDrawColor(...ACCENT);
  doc.setLineWidth(2);
  doc.line(40, y, pageWidth - 40, y);
  y += 22;

  for (const section of opts.sections) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.text(section.title, 40, y);
    y += 6;
    autoTable(doc, {
      startY: y,
      theme: "plain",
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: {
        0: { textColor: [110, 110, 110] },
        1: { halign: "right", fontStyle: "bold" },
      },
      body: section.rows,
    });
    // @ts-expect-error lastAutoTable is added by the plugin
    y = doc.lastAutoTable.finalY + 22;
  }

  if (opts.table) {
    if (opts.table.title) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(30, 30, 30);
      doc.text(opts.table.title, 40, y);
      y += 6;
    }
    autoTable(doc, {
      startY: y,
      head: [opts.table.head],
      body: opts.table.body,
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: ACCENT, textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [244, 247, 245] },
    });
  }

  doc.save(opts.filename.endsWith(".pdf") ? opts.filename : `${opts.filename}.pdf`);
}
