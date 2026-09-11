const inr0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const inr2 = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** ₹1,73,969 */
export function formatINR(n: number): string {
  if (!Number.isFinite(n)) return "₹0";
  return "₹" + inr0.format(Math.round(n));
}

/** ₹1,73,968.55 — used where the extra precision matters (schedule rows). */
export function formatINRPrecise(n: number): string {
  if (!Number.isFinite(n)) return "₹0.00";
  return "₹" + inr2.format(n);
}

/** 12.5L / 1.17Cr style short labels for chart legends. */
export function formatCompactINR(n: number): string {
  if (!Number.isFinite(n)) return "₹0";
  const abs = Math.abs(n);
  if (abs >= 1e7) return `₹${(n / 1e7).toFixed(2)}Cr`;
  if (abs >= 1e5) return `₹${(n / 1e5).toFixed(2)}L`;
  if (abs >= 1e3) return `₹${(n / 1e3).toFixed(1)}K`;
  return "₹" + inr0.format(Math.round(n));
}

export function formatPercent(n: number, digits = 2): string {
  return `${n.toFixed(digits)}%`;
}

/** 5 yr / 5 yr 6 mo / 8 mo */
export function formatTenure(months: number): string {
  const y = Math.floor(months / 12);
  const m = Math.round(months % 12);
  const parts: string[] = [];
  if (y) parts.push(`${y} yr`);
  if (m) parts.push(`${m} mo`);
  return parts.join(" ") || "0 mo";
}

export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}
