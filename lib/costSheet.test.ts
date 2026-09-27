import { describe, expect, it } from "vitest";
import { breakEvenSeries, computeCostSheet, type CostSheetInput } from "./costSheet";

const base: CostSheetInput = {
  materialStdQtyPerUnit: 2,
  materialStdPricePerUnit: 50,
  materialActQtyPerUnit: 2,
  materialActPricePerUnit: 50,
  labourStdHoursPerUnit: 1,
  labourStdRatePerHour: 100,
  labourActHoursPerUnit: 1,
  labourActRatePerHour: 100,
  variableOverheadPerUnit: 20,
  budgetedFixedOverhead: 100_000,
  actualFixedOverhead: 100_000,
  budgetedUnits: 1_000,
  actualUnits: 1_000,
  sellingPricePerUnit: 350,
};

describe("computeCostSheet — break-even", () => {
  it("computes contribution and break-even from standard costs alone", () => {
    const r = computeCostSheet(base);
    // std variable cost = 2*50 + 1*100 + 20 = 220; contribution = 350-220 = 130
    expect(r.standardVariableCostPerUnit).toBe(220);
    expect(r.contributionPerUnit).toBe(130);
    expect(r.breakEvenUnits).toBeCloseTo(100_000 / 130, 5);
    expect(r.breakEvenRevenue).toBeCloseTo(r.breakEvenUnits * 350, 5);
  });

  it("reports margin of safety relative to actual units", () => {
    const r = computeCostSheet(base);
    expect(r.marginOfSafetyUnits).toBeCloseTo(1_000 - r.breakEvenUnits, 5);
    expect(r.marginOfSafetyPct).toBeCloseTo((r.marginOfSafetyUnits / 1_000) * 100, 5);
  });

  it("returns infinite break-even when contribution is zero or negative", () => {
    const r = computeCostSheet({ ...base, sellingPricePerUnit: 220 });
    expect(r.contributionPerUnit).toBe(0);
    expect(r.breakEvenUnits).toBe(Infinity);
    expect(r.breakEvenRevenue).toBe(Infinity);
  });
});

describe("computeCostSheet — material variance", () => {
  it("is favorable when actual price is below standard", () => {
    const r = computeCostSheet({ ...base, materialActPricePerUnit: 45 });
    // MPV = (50-45) * 2(actual qty) * 1000 units = 10,000 favorable
    expect(r.materialPriceVariance).toBeCloseTo(10_000, 5);
    expect(r.materialUsageVariance).toBe(0);
  });

  it("is adverse when actual quantity used exceeds standard", () => {
    const r = computeCostSheet({ ...base, materialActQtyPerUnit: 2.2 });
    // MUV = (2 - 2.2) * 50 * 1000 = -10,000 adverse
    expect(r.materialUsageVariance).toBeCloseTo(-10_000, 5);
    expect(r.materialPriceVariance).toBeCloseTo(0, 5);
  });
});

describe("computeCostSheet — labour variance", () => {
  it("splits into rate and efficiency variances", () => {
    const r = computeCostSheet({ ...base, labourActRatePerHour: 110, labourActHoursPerUnit: 0.9 });
    // LRV = (100-110)*0.9*1000 = -9,000 adverse
    // LEV = (1-0.9)*100*1000 = 10,000 favorable
    expect(r.labourRateVariance).toBeCloseTo(-9_000, 5);
    expect(r.labourEfficiencyVariance).toBeCloseTo(10_000, 5);
    expect(r.labourCostVariance).toBeCloseTo(1_000, 5);
  });
});

describe("computeCostSheet — fixed overhead variance", () => {
  it("splits expenditure and volume variances against budgeted output", () => {
    const r = computeCostSheet({
      ...base,
      actualFixedOverhead: 95_000,
      actualUnits: 1_100,
    });
    // Expenditure = 100,000 - 95,000 = 5,000 favorable
    expect(r.fixedOverheadExpenditureVariance).toBeCloseTo(5_000, 5);
    // Standard rate = 100,000/1,000 = 100/unit; Volume = (1100-1000)*100 = 10,000 favorable
    expect(r.fixedOverheadVolumeVariance).toBeCloseTo(10_000, 5);
    expect(r.fixedOverheadCostVariance).toBeCloseTo(15_000, 5);
  });
});

describe("breakEvenSeries", () => {
  it("starts at zero and ends beyond the break-even point", () => {
    const r = computeCostSheet(base);
    const series = breakEvenSeries(base, r, 20);
    expect(series[0]).toEqual({ units: 0, cost: base.budgetedFixedOverhead, revenue: 0 });
    expect(series[series.length - 1].units).toBeGreaterThan(r.breakEvenUnits);
    // revenue overtakes cost somewhere past the break-even point
    const last = series[series.length - 1];
    expect(last.revenue).toBeGreaterThan(last.cost);
  });
});
