export interface CostSheetInput {
  materialStdQtyPerUnit: number;
  materialStdPricePerUnit: number;
  materialActQtyPerUnit: number;
  materialActPricePerUnit: number;
  labourStdHoursPerUnit: number;
  labourStdRatePerHour: number;
  labourActHoursPerUnit: number;
  labourActRatePerHour: number;
  variableOverheadPerUnit: number;
  budgetedFixedOverhead: number;
  actualFixedOverhead: number;
  budgetedUnits: number;
  actualUnits: number;
  sellingPricePerUnit: number;
}

export interface CostSheetResult {
  standardVariableCostPerUnit: number;
  actualVariableCostPerUnit: number;
  contributionPerUnit: number;
  breakEvenUnits: number;
  breakEvenRevenue: number;
  marginOfSafetyUnits: number;
  marginOfSafetyPct: number;
  budgetedProfit: number;
  actualProfit: number;
  materialPriceVariance: number;
  materialUsageVariance: number;
  materialCostVariance: number;
  labourRateVariance: number;
  labourEfficiencyVariance: number;
  labourCostVariance: number;
  fixedOverheadExpenditureVariance: number;
  fixedOverheadVolumeVariance: number;
  fixedOverheadCostVariance: number;
  totalCostVariance: number;
}

/**
 * Standard-costing formulas (CMA syllabus): every variance is signed so that
 * positive = favorable (actual cost lower, or absorption higher, than plan)
 * and negative = adverse — variances are conventionally computed against the
 * actual output achieved, not the budgeted output.
 */
export function computeCostSheet(input: CostSheetInput): CostSheetResult {
  const {
    materialStdQtyPerUnit,
    materialStdPricePerUnit,
    materialActQtyPerUnit,
    materialActPricePerUnit,
    labourStdHoursPerUnit,
    labourStdRatePerHour,
    labourActHoursPerUnit,
    labourActRatePerHour,
    variableOverheadPerUnit,
    budgetedFixedOverhead,
    actualFixedOverhead,
    budgetedUnits,
    actualUnits,
    sellingPricePerUnit,
  } = input;

  const standardVariableCostPerUnit =
    materialStdQtyPerUnit * materialStdPricePerUnit +
    labourStdHoursPerUnit * labourStdRatePerHour +
    variableOverheadPerUnit;
  const actualVariableCostPerUnit =
    materialActQtyPerUnit * materialActPricePerUnit +
    labourActHoursPerUnit * labourActRatePerHour +
    variableOverheadPerUnit;

  const contributionPerUnit = sellingPricePerUnit - standardVariableCostPerUnit;
  const breakEvenUnits =
    contributionPerUnit > 0 ? budgetedFixedOverhead / contributionPerUnit : Infinity;
  const breakEvenRevenue = Number.isFinite(breakEvenUnits)
    ? breakEvenUnits * sellingPricePerUnit
    : Infinity;

  const marginOfSafetyUnits = Number.isFinite(breakEvenUnits)
    ? actualUnits - breakEvenUnits
    : -Infinity;
  const marginOfSafetyPct =
    actualUnits > 0 && Number.isFinite(marginOfSafetyUnits)
      ? (marginOfSafetyUnits / actualUnits) * 100
      : 0;

  const budgetedProfit = budgetedUnits * contributionPerUnit - budgetedFixedOverhead;
  const actualProfit =
    actualUnits * (sellingPricePerUnit - actualVariableCostPerUnit) - actualFixedOverhead;

  const materialPriceVariance =
    (materialStdPricePerUnit - materialActPricePerUnit) * materialActQtyPerUnit * actualUnits;
  const materialUsageVariance =
    (materialStdQtyPerUnit - materialActQtyPerUnit) * materialStdPricePerUnit * actualUnits;
  const materialCostVariance = materialPriceVariance + materialUsageVariance;

  const labourRateVariance =
    (labourStdRatePerHour - labourActRatePerHour) * labourActHoursPerUnit * actualUnits;
  const labourEfficiencyVariance =
    (labourStdHoursPerUnit - labourActHoursPerUnit) * labourStdRatePerHour * actualUnits;
  const labourCostVariance = labourRateVariance + labourEfficiencyVariance;

  const fixedOverheadExpenditureVariance = budgetedFixedOverhead - actualFixedOverhead;
  const standardFOHRatePerUnit = budgetedUnits > 0 ? budgetedFixedOverhead / budgetedUnits : 0;
  const fixedOverheadVolumeVariance = (actualUnits - budgetedUnits) * standardFOHRatePerUnit;
  const fixedOverheadCostVariance = fixedOverheadExpenditureVariance + fixedOverheadVolumeVariance;

  const totalCostVariance = materialCostVariance + labourCostVariance + fixedOverheadCostVariance;

  return {
    standardVariableCostPerUnit,
    actualVariableCostPerUnit,
    contributionPerUnit,
    breakEvenUnits,
    breakEvenRevenue,
    marginOfSafetyUnits,
    marginOfSafetyPct,
    budgetedProfit,
    actualProfit,
    materialPriceVariance,
    materialUsageVariance,
    materialCostVariance,
    labourRateVariance,
    labourEfficiencyVariance,
    labourCostVariance,
    fixedOverheadExpenditureVariance,
    fixedOverheadVolumeVariance,
    fixedOverheadCostVariance,
    totalCostVariance,
  };
}

export interface BreakEvenPoint {
  units: number;
  cost: number;
  revenue: number;
}

/** Cost/revenue lines for the break-even chart, from 0 up to a sensible ceiling. */
export function breakEvenSeries(
  input: CostSheetInput,
  result: CostSheetResult,
  points = 40,
): BreakEvenPoint[] {
  const candidates = [input.budgetedUnits, input.actualUnits];
  if (Number.isFinite(result.breakEvenUnits)) candidates.push(result.breakEvenUnits);
  const ceiling = Math.max(10, ...candidates) * 1.5;
  const step = ceiling / points;

  return Array.from({ length: points + 1 }, (_, i) => {
    const units = i * step;
    return {
      units,
      cost: input.budgetedFixedOverhead + result.standardVariableCostPerUnit * units,
      revenue: input.sellingPricePerUnit * units,
    };
  });
}
