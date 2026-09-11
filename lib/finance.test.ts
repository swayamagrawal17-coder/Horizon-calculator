import { describe, expect, it } from "vitest";
import {
  amortizationSchedule,
  emiSummary,
  futureValue,
  futureValueLumpSum,
  monthlyEmi,
  presentValue,
  presentValueLumpSum,
  stepUpComparison,
  toPeriodParams,
} from "./finance";

describe("monthlyEmi / emiSummary", () => {
  it("matches the Groww reference (10L @ 6.5% for 5yr)", () => {
    const s = emiSummary(1_000_000, 6.5, 60);
    expect(Math.round(s.emi)).toBe(19_566);
    expect(Math.round(s.totalInterest)).toBe(173_969);
    expect(Math.round(s.totalPayment)).toBe(1_173_969);
  });

  it("handles a zero interest rate", () => {
    expect(monthlyEmi(120_000, 0, 12)).toBe(10_000);
  });
});

describe("amortizationSchedule", () => {
  it("repays exactly the principal and ends at zero", () => {
    const rows = amortizationSchedule(1_000_000, 9, 120);
    const principalPaid = rows.reduce((s, r) => s + r.principalPaid, 0);
    expect(Math.abs(principalPaid - 1_000_000)).toBeLessThan(1);
    expect(rows[rows.length - 1].balance).toBe(0);
    expect(rows).toHaveLength(120);
  });
});

describe("stepUpComparison", () => {
  it("with 0% step-up equals the standard plan", () => {
    const c = stepUpComparison(1_000_000, 8, 120, 0);
    expect(c.stepUp.actualMonths).toBe(120);
    expect(Math.abs(c.interestSaved)).toBeLessThan(1);
  });

  it("with a positive step-up shortens the loan and saves interest", () => {
    const c = stepUpComparison(2_000_000, 9, 240, 10, 12);
    expect(c.stepUp.actualMonths).toBeLessThan(240);
    expect(c.monthsSaved).toBeGreaterThan(0);
    expect(c.interestSaved).toBeGreaterThan(0);
    const principalPaid = c.stepUp.schedule.reduce(
      (s, r) => s + r.principalPaid,
      0,
    );
    expect(Math.abs(principalPaid - 2_000_000)).toBeLessThan(2);
    // EMI ratchets up over the life of the loan.
    expect(c.stepUp.lastEmi).toBeGreaterThan(c.stepUp.firstEmi);
  });

  it("flags an underpaid starting EMI", () => {
    const c = stepUpComparison(5_000_000, 12, 240, 10, 12, 20_000);
    expect(c.stepUp.underpaid).toBe(true);
  });
});

describe("future / present value", () => {
  it("lump sum round-trips", () => {
    const fv = futureValueLumpSum(1_000, 10, 2);
    expect(fv).toBeCloseTo(1_210, 6);
    expect(presentValueLumpSum(fv, 10, 2)).toBeCloseTo(1_000, 6);
  });

  it("annuity FV then PV of the same stream reconcile", () => {
    const { ratePerPeriodPct, periods } = toPeriodParams(12, 10, 12);
    const f = futureValue({ pv: 0, pmt: 5_000, ratePerPeriodPct, periods });
    const p = presentValue({
      fv: 0,
      pmt: 5_000,
      ratePerPeriodPct,
      periods,
    });
    // FV discounted back to today should equal the PV of the same annuity.
    const discounted = f.fv / Math.pow(1 + ratePerPeriodPct / 100, periods);
    expect(discounted).toBeCloseTo(p.pv, 2);
  });

  it("annuity-due exceeds an ordinary annuity by (1 + i)", () => {
    const ordinary = futureValue({
      pv: 0,
      pmt: 1_000,
      ratePerPeriodPct: 1,
      periods: 24,
      timing: "end",
    }).fv;
    const due = futureValue({
      pv: 0,
      pmt: 1_000,
      ratePerPeriodPct: 1,
      periods: 24,
      timing: "begin",
    }).fv;
    expect(due / ordinary).toBeCloseTo(1.01, 6);
  });

  it("zero rate: FV of contributions is just their sum", () => {
    const f = futureValue({ pv: 500, pmt: 100, ratePerPeriodPct: 0, periods: 10 });
    expect(f.fv).toBe(1_500);
    expect(f.totalGrowth).toBe(0);
  });
});
