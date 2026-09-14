import { ResultRow, HeroFigure } from "@/components/calculator/ResultRow";
import type { RegimeResult } from "@/lib/tax";
import { formatINR } from "@/lib/format";

export function RegimeColumn({
  eyebrow,
  result,
  highlight,
}: {
  eyebrow: string;
  result: RegimeResult;
  highlight: boolean;
}) {
  return (
    <div className={highlight ? "rounded-md border-2 border-mine bg-mine/5 p-4" : "p-4"}>
      <HeroFigure eyebrow={eyebrow} value={formatINR(result.totalTaxPayable)} note="tax payable, per year" />
      <div className="mt-4">
        <ResultRow label="Gross income" value={formatINR(result.grossIncome)} />
        {result.hraExemption > 0 && (
          <ResultRow label="HRA exemption" value={formatINR(result.hraExemption)} tone="mine" />
        )}
        <ResultRow label="Standard deduction" value={formatINR(result.standardDeduction)} tone="mine" />
        <ResultRow label="Total deductions" value={formatINR(result.totalDeductions)} tone="mine" />
        <ResultRow label="Taxable income" value={formatINR(result.taxableIncome)} strong />
        <ResultRow label="Tax before rebate" value={formatINR(result.taxBeforeRebate)} />
        {result.rebate87A > 0 && (
          <ResultRow label="Rebate (§87A)" value={`− ${formatINR(result.rebate87A)}`} tone="mine" />
        )}
        <ResultRow label="Cess (4%)" value={formatINR(result.cess)} tone="accent" />
        <ResultRow label="Total tax payable" value={formatINR(result.totalTaxPayable)} strong tone="accent" />
      </div>
    </div>
  );
}
