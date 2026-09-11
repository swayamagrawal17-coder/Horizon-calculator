/**
 * Pure financial math. No formatting, no framework code.
 * Rates are given as annual percentages unless a function says otherwise.
 */

export type Timing = "end" | "begin";

export interface AmortRow {
  period: number;
  emi: number;
  interestPaid: number;
  principalPaid: number;
  balance: number;
}

export interface EmiSummary {
  emi: number;
  principal: number;
  totalInterest: number;
  totalPayment: number;
  months: number;
}

const MAX_MONTHS = 600; // 50-year guard for iterative simulations

/** Monthly reducing-balance EMI. `annualRatePct` e.g. 6.5 -> 6.5%. */
export function monthlyEmi(
  principal: number,
  annualRatePct: number,
  months: number,
): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRatePct / 12 / 100;
  if (r === 0) return principal / months;
  const f = Math.pow(1 + r, months);
  return (principal * r * f) / (f - 1);
}

export function emiSummary(
  principal: number,
  annualRatePct: number,
  months: number,
): EmiSummary {
  const emi = monthlyEmi(principal, annualRatePct, months);
  const totalPayment = emi * months;
  return {
    emi,
    principal,
    totalInterest: totalPayment - principal,
    totalPayment,
    months,
  };
}

/** Standard reducing-balance schedule. Final balance is pinned to 0. */
export function amortizationSchedule(
  principal: number,
  annualRatePct: number,
  months: number,
): AmortRow[] {
  const rows: AmortRow[] = [];
  if (principal <= 0 || months <= 0) return rows;
  const r = annualRatePct / 12 / 100;
  const emi = monthlyEmi(principal, annualRatePct, months);
  let balance = principal;

  for (let period = 1; period <= months; period++) {
    const interestPaid = balance * r;
    let principalPaid = emi - interestPaid;
    const isLast = period === months;
    if (isLast || principalPaid > balance) principalPaid = balance;
    balance = Math.max(0, balance - principalPaid);
    rows.push({
      period,
      emi: interestPaid + principalPaid,
      interestPaid,
      principalPaid,
      balance,
    });
    if (balance <= 0) break;
  }
  return rows;
}

export interface StepUpInput {
  principal: number;
  annualRatePct: number;
  /** Starting EMI. Defaults to the standard EMI for the nominal tenure. */
  baseEmi: number;
  /** Percent the EMI rises by at each step, e.g. 10 -> +10%. */
  stepUpPct: number;
  /** Months between step-ups. Default 12. */
  stepEveryMonths?: number;
}

export interface StepUpPlan {
  schedule: AmortRow[];
  actualMonths: number;
  totalInterest: number;
  totalPayment: number;
  firstEmi: number;
  lastEmi: number;
  /** True if the starting EMI cannot cover the first month's interest. */
  underpaid: boolean;
}

/**
 * Simulate a loan where the EMI steps up by `stepUpPct` every `stepEveryMonths`.
 * The loan runs until the balance clears (or the 600-month guard trips).
 */
export function stepUpEmiPlan(input: StepUpInput): StepUpPlan {
  const { principal, annualRatePct, stepUpPct } = input;
  const stepEveryMonths = input.stepEveryMonths ?? 12;
  const r = annualRatePct / 12 / 100;
  const schedule: AmortRow[] = [];

  const firstInterest = principal * r;
  const underpaid = input.baseEmi <= firstInterest && r > 0;

  let balance = principal;
  let emi = input.baseEmi;
  let scheduledEmi = input.baseEmi; // the EMI due, before any final-payment shrink
  let totalInterest = 0;
  let totalPayment = 0;
  let period = 0;

  while (balance > 0.005 && period < MAX_MONTHS) {
    period++;
    if (period > 1 && stepEveryMonths > 0 && (period - 1) % stepEveryMonths === 0) {
      emi = emi * (1 + stepUpPct / 100);
    }
    scheduledEmi = emi;
    const interestPaid = balance * r;
    let principalPaid = emi - interestPaid;

    if (underpaid && principalPaid <= 0) {
      // Loan is not amortising yet; record the payment against interest only.
      totalInterest += interestPaid;
      totalPayment += emi;
      balance += interestPaid - emi; // negative amortisation
      schedule.push({
        period,
        emi,
        interestPaid,
        principalPaid: emi - interestPaid,
        balance,
      });
      continue;
    }

    if (principalPaid > balance) principalPaid = balance;
    const paid = interestPaid + principalPaid;
    balance = Math.max(0, balance - principalPaid);
    totalInterest += interestPaid;
    totalPayment += paid;
    schedule.push({ period, emi: paid, interestPaid, principalPaid, balance });
  }

  return {
    schedule,
    actualMonths: period,
    totalInterest,
    totalPayment,
    firstEmi: schedule[0]?.emi ?? input.baseEmi,
    lastEmi: scheduledEmi,
    underpaid,
  };
}

export interface StepUpComparison {
  standard: EmiSummary;
  stepUp: StepUpPlan;
  monthsSaved: number;
  interestSaved: number;
}

export function stepUpComparison(
  principal: number,
  annualRatePct: number,
  months: number,
  stepUpPct: number,
  stepEveryMonths = 12,
  baseEmi?: number,
): StepUpComparison {
  const standard = emiSummary(principal, annualRatePct, months);
  const stepUp = stepUpEmiPlan({
    principal,
    annualRatePct,
    baseEmi: baseEmi ?? standard.emi,
    stepUpPct,
    stepEveryMonths,
  });
  return {
    standard,
    stepUp,
    monthsSaved: standard.months - stepUp.actualMonths,
    interestSaved: standard.totalInterest - stepUp.totalInterest,
  };
}

export interface EmiSeriesPoint {
  year: number;
  month: number;
  balance: number;
  interestPaid: number;
  principalPaid: number;
}

/** Turn a schedule into plot points: outstanding balance + cumulative split. */
export function emiSeries(schedule: AmortRow[]): EmiSeriesPoint[] {
  if (schedule.length === 0) return [];
  const start = schedule[0].balance + schedule[0].principalPaid;
  const points: EmiSeriesPoint[] = [
    { year: 0, month: 0, balance: start, interestPaid: 0, principalPaid: 0 },
  ];
  let interest = 0;
  let principal = 0;
  for (const row of schedule) {
    interest += row.interestPaid;
    principal += row.principalPaid;
    points.push({
      year: row.period / 12,
      month: row.period,
      balance: row.balance,
      interestPaid: interest,
      principalPaid: principal,
    });
  }
  return points;
}

/** Group any period-indexed schedule into calendar years (12 periods each). */
export function groupScheduleByYear<T extends { period: number }>(
  rows: T[],
): { year: number; rows: T[] }[] {
  const out: { year: number; rows: T[] }[] = [];
  for (const row of rows) {
    const year = Math.ceil(row.period / 12);
    let bucket = out[out.length - 1];
    if (!bucket || bucket.year !== year) {
      bucket = { year, rows: [] };
      out.push(bucket);
    }
    bucket.rows.push(row);
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Time value of money                                                */
/* ------------------------------------------------------------------ */

/** Convert an annual rate + tenure in years into per-period terms. */
export function toPeriodParams(
  annualRatePct: number,
  years: number,
  periodsPerYear: number,
): { ratePerPeriodPct: number; periods: number } {
  return {
    ratePerPeriodPct: annualRatePct / periodsPerYear,
    periods: Math.round(years * periodsPerYear),
  };
}

export function futureValueLumpSum(
  pv: number,
  ratePerPeriodPct: number,
  periods: number,
): number {
  return pv * Math.pow(1 + ratePerPeriodPct / 100, periods);
}

export function futureValueAnnuity(
  pmt: number,
  ratePerPeriodPct: number,
  periods: number,
  timing: Timing = "end",
): number {
  if (pmt === 0 || periods === 0) return 0;
  const i = ratePerPeriodPct / 100;
  if (i === 0) return pmt * periods;
  const base = (pmt * (Math.pow(1 + i, periods) - 1)) / i;
  return timing === "begin" ? base * (1 + i) : base;
}

export interface FutureValueInput {
  pv: number;
  pmt: number;
  ratePerPeriodPct: number;
  periods: number;
  timing?: Timing;
}

export interface FutureValueResult {
  fv: number;
  totalContributions: number;
  totalGrowth: number;
}

export function futureValue(input: FutureValueInput): FutureValueResult {
  const timing = input.timing ?? "end";
  const fromLump = futureValueLumpSum(input.pv, input.ratePerPeriodPct, input.periods);
  const fromPmt = futureValueAnnuity(
    input.pmt,
    input.ratePerPeriodPct,
    input.periods,
    timing,
  );
  const fv = fromLump + fromPmt;
  const totalContributions = input.pv + input.pmt * input.periods;
  return { fv, totalContributions, totalGrowth: fv - totalContributions };
}

export function presentValueLumpSum(
  fv: number,
  ratePerPeriodPct: number,
  periods: number,
): number {
  return fv / Math.pow(1 + ratePerPeriodPct / 100, periods);
}

export function presentValueAnnuity(
  pmt: number,
  ratePerPeriodPct: number,
  periods: number,
  timing: Timing = "end",
): number {
  if (pmt === 0 || periods === 0) return 0;
  const i = ratePerPeriodPct / 100;
  if (i === 0) return pmt * periods;
  const base = (pmt * (1 - Math.pow(1 + i, -periods))) / i;
  return timing === "begin" ? base * (1 + i) : base;
}

export interface PresentValueInput {
  fv: number;
  pmt: number;
  ratePerPeriodPct: number;
  periods: number;
  timing?: Timing;
}

export interface PresentValueResult {
  pv: number;
  nominalTotal: number;
  discountAmount: number;
}

export function presentValue(input: PresentValueInput): PresentValueResult {
  const timing = input.timing ?? "end";
  const fromLump = presentValueLumpSum(input.fv, input.ratePerPeriodPct, input.periods);
  const fromPmt = presentValueAnnuity(
    input.pmt,
    input.ratePerPeriodPct,
    input.periods,
    timing,
  );
  const pv = fromLump + fromPmt;
  const nominalTotal = input.fv + input.pmt * input.periods;
  return { pv, nominalTotal, discountAmount: nominalTotal - pv };
}

/** Year-by-year accumulation table for the FV screen. */
export interface FvYearRow {
  period: number; // year index, 1-based
  invested: number; // cumulative contributions (incl. starting pv)
  balance: number; // projected value at year end
  growth: number; // balance - invested
}

export interface FvSeriesPoint {
  year: number;
  invested: number;
  growth: number;
  value: number;
}

/** Plot points for the FV screen: stacked contributions + growth by year. */
export function futureValueSeries(
  input: FutureValueInput & { periodsPerYear: number },
): FvSeriesPoint[] {
  const points: FvSeriesPoint[] = [
    { year: 0, invested: input.pv, growth: 0, value: input.pv },
  ];
  for (const row of futureValueYearly(input)) {
    points.push({
      year: row.period,
      invested: row.invested,
      growth: Math.max(0, row.growth),
      value: row.balance,
    });
  }
  return points;
}

/** Plot points for the PV screen: what the goal is worth if received in year k. */
export function presentValueSeries(
  input: PresentValueInput & { periodsPerYear: number },
): { year: number; worthToday: number }[] {
  const years = Math.round(input.periods / input.periodsPerYear);
  const timing = input.timing ?? "end";
  const out: { year: number; worthToday: number }[] = [];
  for (let k = 0; k <= years; k++) {
    const p = k * input.periodsPerYear;
    const lump = presentValueLumpSum(input.fv, input.ratePerPeriodPct, p);
    const annuity = presentValueAnnuity(
      input.pmt,
      input.ratePerPeriodPct,
      Math.min(p, input.periods),
      timing,
    );
    out.push({ year: k, worthToday: lump + annuity });
  }
  return out;
}

export function futureValueYearly(
  input: FutureValueInput & { periodsPerYear: number },
): FvYearRow[] {
  const { pv, pmt, ratePerPeriodPct, periods, periodsPerYear } = input;
  const timing = input.timing ?? "end";
  const i = ratePerPeriodPct / 100;
  const rows: FvYearRow[] = [];
  let balance = pv;
  let invested = pv;

  for (let p = 1; p <= periods; p++) {
    if (timing === "begin") balance += pmt;
    balance *= 1 + i;
    if (timing === "end") balance += pmt;
    invested += pmt;

    if (p % periodsPerYear === 0 || p === periods) {
      rows.push({
        period: Math.ceil(p / periodsPerYear),
        invested,
        balance,
        growth: balance - invested,
      });
    }
  }
  return rows;
}
