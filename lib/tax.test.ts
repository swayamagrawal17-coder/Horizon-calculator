import { describe, expect, it } from "vitest";
import {
  compareTaxRegimes,
  computeNewRegime,
  computeOldRegime,
  hraExemption,
  slabTaxNew,
  slabTaxOld,
  type TaxInput,
} from "./tax";

function baseInput(overrides: Partial<TaxInput> = {}): TaxInput {
  return {
    ageBand: "below60",
    grossSalary: 0,
    basicSalary: 0,
    hraReceived: 0,
    rentPaid: 0,
    cityType: "metro",
    otherIncome: 0,
    savingsInterest: 0,
    deductions80C: 0,
    healthInsuranceSelf: 0,
    healthInsuranceParents: 0,
    parentsSenior: false,
    nps80CCD1B: 0,
    educationLoanInterest80E: 0,
    donations80G: 0,
    ...overrides,
  };
}

describe("slabTaxOld / slabTaxNew", () => {
  it("matches hand-computed tax at 10L for a below-60 taxpayer", () => {
    expect(slabTaxOld(1_000_000, "below60")).toBe(112_500);
  });

  it("matches hand-computed tax at 12L under the new regime", () => {
    expect(slabTaxNew(1_200_000)).toBe(60_000);
  });

  it("senior citizens get a higher nil band than below-60 taxpayers", () => {
    expect(slabTaxOld(300_000, "below60")).toBeGreaterThan(0);
    expect(slabTaxOld(300_000, "60to80")).toBe(0);
  });
});

describe("hraExemption", () => {
  it("is the least of the three formula legs", () => {
    expect(hraExemption(600_000, 300_000, 240_000, "metro")).toBe(180_000);
  });

  it("floors at zero when rent doesn't clear 10% of basic", () => {
    expect(hraExemption(600_000, 300_000, 50_000, "metro")).toBe(0);
  });
});

describe("§87A rebate", () => {
  it("zeroes new-regime tax exactly at ₹12L taxable income", () => {
    const r = computeNewRegime(baseInput({ grossSalary: 1_275_000 }));
    expect(r.taxableIncome).toBe(1_200_000);
    expect(r.totalTaxPayable).toBe(0);
  });

  it("new-regime tax is positive just above the ₹12L threshold", () => {
    const r = computeNewRegime(baseInput({ grossSalary: 1_275_001 }));
    expect(r.totalTaxPayable).toBeGreaterThan(0);
  });

  it("zeroes old-regime tax exactly at ₹5L taxable income", () => {
    const r = computeOldRegime(baseInput({ grossSalary: 550_000 }));
    expect(r.taxableIncome).toBe(500_000);
    expect(r.totalTaxPayable).toBe(0);
  });
});

describe("computeOldRegime / computeNewRegime", () => {
  it("applies the 4% cess on top of tax after rebate", () => {
    const r = computeNewRegime(baseInput({ grossSalary: 2_000_000 }));
    expect(r.cess).toBeCloseTo(r.taxAfterRebate * 0.04, 6);
    expect(r.totalTaxPayable).toBeCloseTo(r.taxAfterRebate * 1.04, 6);
  });

  it("zero income means zero tax under both regimes", () => {
    const input = baseInput();
    expect(computeOldRegime(input).totalTaxPayable).toBe(0);
    expect(computeNewRegime(input).totalTaxPayable).toBe(0);
  });

  it("caps 80C at ₹1.5L even when more is entered", () => {
    const over = computeOldRegime(baseInput({ grossSalary: 2_000_000, deductions80C: 300_000 }));
    const atCap = computeOldRegime(baseInput({ grossSalary: 2_000_000, deductions80C: 150_000 }));
    expect(over.totalDeductions).toBe(atCap.totalDeductions);
  });
});

describe("compareTaxRegimes", () => {
  it("recommends the old regime when deductions are large relative to income", () => {
    const c = compareTaxRegimes(
      baseInput({
        ageBand: "below60",
        grossSalary: 1_800_000,
        basicSalary: 1_200_000,
        hraReceived: 600_000,
        rentPaid: 550_000,
        cityType: "metro",
        deductions80C: 150_000,
        nps80CCD1B: 50_000,
        healthInsuranceSelf: 25_000,
        healthInsuranceParents: 50_000,
        parentsSenior: true,
        educationLoanInterest80E: 80_000,
        donations80G: 40_000,
        savingsInterest: 10_000,
      }),
    );
    expect(c.oldRegime.totalTaxPayable).toBeCloseTo(101_400, 0);
    expect(c.newRegime.totalTaxPayable).toBeCloseTo(152_880, 0);
    expect(c.recommended).toBe("old");
    expect(c.savings).toBeCloseTo(c.newRegime.totalTaxPayable - c.oldRegime.totalTaxPayable, 6);
  });

  it("recommends the new regime when there are few deductions to claim", () => {
    const c = compareTaxRegimes(baseInput({ grossSalary: 1_600_000 }));
    expect(c.newRegime.totalTaxPayable).toBeLessThan(c.oldRegime.totalTaxPayable);
    expect(c.recommended).toBe("new");
  });
});
