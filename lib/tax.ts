/**
 * India personal income tax, FY 2025-26 (AY 2026-27). Pure math, no formatting.
 * Scope: slabs, standard deduction, HRA exemption, the common Chapter VI-A
 * deductions (80C/80D/80CCD(1B)/80E/80G/80TTA-80TTB), and the §87A rebate.
 * Out of scope, deliberately: surcharge on income above ₹50L, marginal relief
 * at the §87A cliff, capital-gains special rates, and 80G's real tiered
 * (50%/100%, qualifying-limit) structure — 80G here is a flat pass-through.
 */

export type AgeBand = "below60" | "60to80" | "above80";
export type CityType = "metro" | "nonmetro";

export interface TaxInput {
  ageBand: AgeBand;
  grossSalary: number;
  basicSalary: number;
  hraReceived: number;
  rentPaid: number;
  cityType: CityType;
  otherIncome: number;
  savingsInterest: number;
  deductions80C: number;
  healthInsuranceSelf: number;
  healthInsuranceParents: number;
  parentsSenior: boolean;
  nps80CCD1B: number;
  educationLoanInterest80E: number;
  donations80G: number;
}

export interface RegimeResult {
  grossIncome: number;
  hraExemption: number;
  standardDeduction: number;
  totalDeductions: number;
  taxableIncome: number;
  taxBeforeRebate: number;
  rebate87A: number;
  taxAfterRebate: number;
  cess: number;
  totalTaxPayable: number;
}

export interface TaxComparison {
  oldRegime: RegimeResult;
  newRegime: RegimeResult;
  recommended: "old" | "new";
  savings: number;
}

const CESS_RATE = 0.04;

/** Slab bands as [upper bound (inclusive), rate]; the final band's upper bound is Infinity. */
type SlabBands = [number, number][];

function applySlabs(income: number, bands: SlabBands): number {
  let tax = 0;
  let lower = 0;
  for (const [upper, rate] of bands) {
    if (income <= lower) break;
    const taxableInBand = Math.min(income, upper) - lower;
    tax += taxableInBand * rate;
    lower = upper;
    if (income <= upper) break;
  }
  return tax;
}

export function slabTaxNew(taxableIncome: number): number {
  return applySlabs(taxableIncome, [
    [400_000, 0],
    [800_000, 0.05],
    [1_200_000, 0.1],
    [1_600_000, 0.15],
    [2_000_000, 0.2],
    [2_400_000, 0.25],
    [Infinity, 0.3],
  ]);
}

export function slabTaxOld(taxableIncome: number, ageBand: AgeBand): number {
  const bands: SlabBands =
    ageBand === "below60"
      ? [
          [250_000, 0],
          [500_000, 0.05],
          [1_000_000, 0.2],
          [Infinity, 0.3],
        ]
      : ageBand === "60to80"
        ? [
            [300_000, 0],
            [500_000, 0.05],
            [1_000_000, 0.2],
            [Infinity, 0.3],
          ]
        : [
            [500_000, 0],
            [1_000_000, 0.2],
            [Infinity, 0.3],
          ];
  return applySlabs(taxableIncome, bands);
}

/** min(HRA received, rent paid − 10% of basic, 50%/40% of basic for metro/non-metro). */
export function hraExemption(
  basic: number,
  hraReceived: number,
  rentPaid: number,
  cityType: CityType,
): number {
  const rentMinusBasic = Math.max(0, rentPaid - 0.1 * basic);
  const cityLimit = (cityType === "metro" ? 0.5 : 0.4) * basic;
  return Math.max(0, Math.min(hraReceived, rentMinusBasic, cityLimit));
}

export function computeNewRegime(input: TaxInput): RegimeResult {
  const grossIncome = input.grossSalary + input.otherIncome + input.savingsInterest;
  const standardDeduction = input.grossSalary > 0 ? 75_000 : 0;
  const totalDeductions = standardDeduction;
  const taxableIncome = Math.max(0, grossIncome - totalDeductions);
  const taxBeforeRebate = slabTaxNew(taxableIncome);
  const rebate87A = taxableIncome <= 1_200_000 ? taxBeforeRebate : 0;
  const taxAfterRebate = Math.max(0, taxBeforeRebate - rebate87A);
  const cess = taxAfterRebate * CESS_RATE;
  return {
    grossIncome,
    hraExemption: 0,
    standardDeduction,
    totalDeductions,
    taxableIncome,
    taxBeforeRebate,
    rebate87A,
    taxAfterRebate,
    cess,
    totalTaxPayable: taxAfterRebate + cess,
  };
}

export function computeOldRegime(input: TaxInput): RegimeResult {
  const grossIncome = input.grossSalary + input.otherIncome + input.savingsInterest;
  const standardDeduction = input.grossSalary > 0 ? 50_000 : 0;
  const hra = hraExemption(input.basicSalary, input.hraReceived, input.rentPaid, input.cityType);

  const cap80C = Math.min(Math.max(0, input.deductions80C), 150_000);
  const selfCap = input.ageBand === "below60" ? 25_000 : 50_000;
  const parentsCap = input.parentsSenior ? 50_000 : 25_000;
  const cap80D =
    Math.min(Math.max(0, input.healthInsuranceSelf), selfCap) +
    Math.min(Math.max(0, input.healthInsuranceParents), parentsCap);
  const cap80CCD1B = Math.min(Math.max(0, input.nps80CCD1B), 50_000);
  const deduction80E = Math.max(0, input.educationLoanInterest80E);
  const deduction80G = Math.max(0, input.donations80G);
  const ttaCap = input.ageBand === "below60" ? 10_000 : 50_000;
  const deductionTTA = Math.min(Math.max(0, input.savingsInterest), ttaCap);

  const totalDeductions =
    standardDeduction + hra + cap80C + cap80D + cap80CCD1B + deduction80E + deduction80G + deductionTTA;
  const taxableIncome = Math.max(0, grossIncome - totalDeductions);
  const taxBeforeRebate = slabTaxOld(taxableIncome, input.ageBand);
  const rebate87A = taxableIncome <= 500_000 ? Math.min(taxBeforeRebate, 12_500) : 0;
  const taxAfterRebate = Math.max(0, taxBeforeRebate - rebate87A);
  const cess = taxAfterRebate * CESS_RATE;

  return {
    grossIncome,
    hraExemption: hra,
    standardDeduction,
    totalDeductions,
    taxableIncome,
    taxBeforeRebate,
    rebate87A,
    taxAfterRebate,
    cess,
    totalTaxPayable: taxAfterRebate + cess,
  };
}

export function compareTaxRegimes(input: TaxInput): TaxComparison {
  const oldRegime = computeOldRegime(input);
  const newRegime = computeNewRegime(input);
  const recommended = newRegime.totalTaxPayable <= oldRegime.totalTaxPayable ? "new" : "old";
  const savings = Math.abs(oldRegime.totalTaxPayable - newRegime.totalTaxPayable);
  return { oldRegime, newRegime, recommended, savings };
}

export interface DeductionHeadroom {
  /** Unused 80C room (limit ₹1.5L). */
  c80C: number;
  /** Unused 80CCD(1B) room (limit ₹50k). */
  nps: number;
  /** Unused 80D room across self and parents. */
  d80D: number;
  /** Old-regime tax saved if all three were fully used; 0 if it wouldn't help. */
  taxSaved: number;
}

/** How much old-regime deduction room is left, and roughly what filling it would save. */
export function deductionHeadroom(input: TaxInput): DeductionHeadroom {
  const selfCap = input.ageBand === "below60" ? 25_000 : 50_000;
  const parentsCap = input.parentsSenior ? 50_000 : 25_000;
  const c80C = Math.max(0, 150_000 - Math.max(0, input.deductions80C));
  const nps = Math.max(0, 50_000 - Math.max(0, input.nps80CCD1B));
  const d80D =
    Math.max(0, selfCap - Math.max(0, input.healthInsuranceSelf)) +
    Math.max(0, parentsCap - Math.max(0, input.healthInsuranceParents));

  const filled: TaxInput = {
    ...input,
    deductions80C: 150_000,
    nps80CCD1B: 50_000,
    healthInsuranceSelf: selfCap,
    healthInsuranceParents: parentsCap,
  };
  const taxSaved = Math.max(
    0,
    computeOldRegime(input).totalTaxPayable - computeOldRegime(filled).totalTaxPayable,
  );
  return { c80C, nps, d80D, taxSaved };
}
