"use client";

import { useMemo, useState } from "react";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { CompactField } from "@/components/calculator/CompactField";
import { RegimeColumn } from "@/components/calculator/RegimeColumn";
import { Callout } from "@/components/calculator/Callout";
import { ExportBar } from "@/components/calculator/ExportBar";
import { Reveal } from "@/components/ui/Reveal";
import { SegmentedControl, Toggle, Zone } from "@/components/ui/primitives";
import { useCalculatorState } from "@/hooks/useCalculatorState";
import type { Schema } from "@/lib/urlState";
import { compareTaxRegimes, type AgeBand, type CityType, type RegimeResult, type TaxInput } from "@/lib/tax";
import { formatINR } from "@/lib/format";

const schema = {
  ageBand: { key: "ab", default: "below60" },
  grossSalary: { key: "gs", default: 1_000_000, min: 0, max: 100_000_000 },
  basicSalary: { key: "bs", default: 500_000, min: 0, max: 50_000_000 },
  hraReceived: { key: "hra", default: 200_000, min: 0, max: 10_000_000 },
  rentPaid: { key: "rent", default: 180_000, min: 0, max: 10_000_000 },
  cityType: { key: "city", default: "metro" },
  otherIncome: { key: "oi", default: 0, min: 0, max: 50_000_000 },
  savingsInterest: { key: "si", default: 0, min: 0, max: 1_000_000 },
  deductions80C: { key: "c80", default: 0, min: 0, max: 1_500_000 },
  healthInsuranceSelf: { key: "d80s", default: 0, min: 0, max: 500_000 },
  healthInsuranceParents: { key: "d80p", default: 0, min: 0, max: 500_000 },
  parentsSenior: { key: "psr", default: false },
  nps80CCD1B: { key: "nps", default: 0, min: 0, max: 500_000 },
  educationLoanInterest80E: { key: "e80", default: 0, min: 0, max: 2_000_000 },
  donations80G: { key: "g80", default: 0, min: 0, max: 2_000_000 },
} satisfies Schema;

function breakdownRows(result: RegimeResult): [string, string][] {
  const rows: [string, string][] = [["Gross income", formatINR(result.grossIncome)]];
  if (result.hraExemption > 0) rows.push(["HRA exemption", formatINR(result.hraExemption)]);
  rows.push(
    ["Standard deduction", formatINR(result.standardDeduction)],
    ["Total deductions", formatINR(result.totalDeductions)],
    ["Taxable income", formatINR(result.taxableIncome)],
    ["Tax before rebate", formatINR(result.taxBeforeRebate)],
  );
  if (result.rebate87A > 0) rows.push(["Rebate (§87A)", formatINR(result.rebate87A)]);
  rows.push(["Cess (4%)", formatINR(result.cess)], ["Total tax payable", formatINR(result.totalTaxPayable)]);
  return rows;
}

export function IncomeTaxPage() {
  const { values, setField, reset, shareUrl } = useCalculatorState(schema);
  const [hraOpen, setHraOpen] = useState(false);
  const [deductionsOpen, setDeductionsOpen] = useState(false);
  const ageBand: AgeBand =
    values.ageBand === "60to80" || values.ageBand === "above80" ? values.ageBand : "below60";
  const cityType: CityType = values.cityType === "nonmetro" ? "nonmetro" : "metro";

  const input: TaxInput = useMemo(
    () => ({
      ageBand,
      cityType,
      grossSalary: values.grossSalary,
      basicSalary: values.basicSalary,
      hraReceived: values.hraReceived,
      rentPaid: values.rentPaid,
      otherIncome: values.otherIncome,
      savingsInterest: values.savingsInterest,
      deductions80C: values.deductions80C,
      healthInsuranceSelf: values.healthInsuranceSelf,
      healthInsuranceParents: values.healthInsuranceParents,
      parentsSenior: values.parentsSenior,
      nps80CCD1B: values.nps80CCD1B,
      educationLoanInterest80E: values.educationLoanInterest80E,
      donations80G: values.donations80G,
    }),
    [
      ageBand,
      cityType,
      values.grossSalary,
      values.basicSalary,
      values.hraReceived,
      values.rentPaid,
      values.otherIncome,
      values.savingsInterest,
      values.deductions80C,
      values.healthInsuranceSelf,
      values.healthInsuranceParents,
      values.parentsSenior,
      values.nps80CCD1B,
      values.educationLoanInterest80E,
      values.donations80G,
    ],
  );

  const comparison = useMemo(() => compareTaxRegimes(input), [input]);
  const recommendedLabel = comparison.recommended === "old" ? "Old regime" : "New regime";

  const csv = async () => {
    const { exportCsv } = await import("@/lib/csv");
    const oldRows = breakdownRows(comparison.oldRegime);
    const newRows = breakdownRows(comparison.newRegime);
    exportCsv({
      filename: "income-tax-comparison",
      title: "Income Tax Report",
      meta: [
        ["Recommended", recommendedLabel],
        ["Savings by choosing it", Math.round(comparison.savings)],
        ["Share link", shareUrl()],
      ],
      table: {
        head: ["Line item", "Old regime", "New regime"],
        body: oldRows.map((row, i) => [row[0], row[1], newRows[i]?.[1] ?? ""]),
      },
    });
  };

  const pdf = async () => {
    const { exportPdf } = await import("@/lib/pdf");
    const recommended = comparison.recommended === "old" ? comparison.oldRegime : comparison.newRegime;
    exportPdf({
      filename: "income-tax-comparison",
      eyebrow: "India · FY 2025-26",
      title: "Income Tax Report",
      meta: [`${recommendedLabel} saves you ${formatINR(comparison.savings)} versus the other regime`],
      hero: {
        label: `${recommendedLabel} — total tax payable`,
        value: formatINR(recommended.totalTaxPayable),
        note: `${formatINR(comparison.savings)} less than the other regime`,
      },
      splitBar: {
        mineLabel: "Take-home",
        mineValue: Math.max(0, recommended.grossIncome - recommended.totalTaxPayable),
        costLabel: "Tax paid",
        costValue: recommended.totalTaxPayable,
      },
      metrics: [
        { title: "Old regime", rows: breakdownRows(comparison.oldRegime) },
        { title: "New regime", rows: breakdownRows(comparison.newRegime) },
      ],
      shareUrl: shareUrl(),
    });
  };

  return (
    <CalculatorShell
      eyebrow="India · FY 2025-26"
      title="Old regime or new regime — which pays less"
      intro="Enter your income and deductions once, and see the tax payable under both regimes, side by side."
      inputs={
        <>
          <Zone eyebrow="About you">
            <SegmentedControl
              label="Age"
              value={ageBand}
              onChange={(v) => setField("ageBand", v)}
              options={[
                { value: "below60", label: "Below 60" },
                { value: "60to80", label: "60–80" },
                { value: "above80", label: "Above 80" },
              ]}
            />
          </Zone>

          <Zone eyebrow="Income" className="mt-6 border-t border-rule pt-6">
            <div className="-my-1.5">
              <CompactField
                label="Gross annual salary"
                value={values.grossSalary}
                onChange={(v) => setField("grossSalary", v)}
                prefix="₹"
              />
              <CompactField
                label="Basic salary"
                value={values.basicSalary}
                onChange={(v) => setField("basicSalary", v)}
                prefix="₹"
                hint="for the HRA formula"
              />
              <CompactField
                label="Other annual income"
                value={values.otherIncome}
                onChange={(v) => setField("otherIncome", v)}
                prefix="₹"
              />
            </div>
          </Zone>

          <Zone
            eyebrow="House rent (HRA)"
            className="mt-6 border-t border-rule pt-6"
            aside={
              <button
                type="button"
                className="focusable -m-1 inline-flex min-h-[40px] items-center p-1 text-xs text-mine underline decoration-dotted underline-offset-4 hover:decoration-solid"
                onClick={() => setHraOpen((s) => !s)}
                aria-expanded={hraOpen}
              >
                {hraOpen ? "Collapse" : "Claim HRA"}
              </button>
            }
          >
            {hraOpen ? (
              <>
                <div className="-my-1.5">
                  <CompactField
                    label="HRA received"
                    value={values.hraReceived}
                    onChange={(v) => setField("hraReceived", v)}
                    prefix="₹"
                  />
                  <CompactField
                    label="Rent paid"
                    value={values.rentPaid}
                    onChange={(v) => setField("rentPaid", v)}
                    prefix="₹"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-[0.82rem] font-medium text-graphite">City</span>
                  <SegmentedControl
                    label="City"
                    value={cityType}
                    onChange={(v) => setField("cityType", v)}
                    options={[
                      { value: "metro", label: "Metro" },
                      { value: "nonmetro", label: "Non-metro" },
                    ]}
                  />
                </div>
              </>
            ) : (
              <p className="text-xs text-graphite">
                If you pay rent and get a house-rent allowance, this can lower the old
                regime&rsquo;s taxable income.
              </p>
            )}
          </Zone>

          <Zone
            eyebrow="Deductions (optional)"
            className="mt-6 border-t border-rule pt-6"
            aside={
              <button
                type="button"
                className="focusable -m-1 inline-flex min-h-[40px] items-center p-1 text-xs text-mine underline decoration-dotted underline-offset-4 hover:decoration-solid"
                onClick={() => setDeductionsOpen((s) => !s)}
                aria-expanded={deductionsOpen}
              >
                {deductionsOpen ? "Collapse" : "Add deductions"}
              </button>
            }
          >
            {deductionsOpen ? (
              <div className="space-y-4">
                <div>
                  <p className="field-label">Investments — 80C</p>
                  <CompactField
                    label="80C investments"
                    value={values.deductions80C}
                    onChange={(v) => setField("deductions80C", v)}
                    prefix="₹"
                    hint="up to ₹1.5L"
                  />
                </div>

                <div className="rule-t pt-4">
                  <p className="field-label">Insurance — 80D</p>
                  <div className="-my-1.5">
                    <CompactField
                      label="Health insurance, self & family"
                      value={values.healthInsuranceSelf}
                      onChange={(v) => setField("healthInsuranceSelf", v)}
                      prefix="₹"
                    />
                    <CompactField
                      label="Health insurance, parents"
                      value={values.healthInsuranceParents}
                      onChange={(v) => setField("healthInsuranceParents", v)}
                      prefix="₹"
                    />
                  </div>
                  <div className="mt-2">
                    <Toggle
                      label="Parents are senior citizens"
                      checked={values.parentsSenior}
                      onChange={(v) => setField("parentsSenior", v)}
                    />
                  </div>
                </div>

                <div className="rule-t pt-4">
                  <p className="field-label">Retirement — 80CCD(1B)</p>
                  <CompactField
                    label="NPS contribution"
                    value={values.nps80CCD1B}
                    onChange={(v) => setField("nps80CCD1B", v)}
                    prefix="₹"
                    hint="up to ₹50k"
                  />
                </div>

                <div className="rule-t pt-4">
                  <p className="field-label">Other deductions</p>
                  <div className="-my-1.5">
                    <CompactField
                      label="Education loan interest — 80E"
                      value={values.educationLoanInterest80E}
                      onChange={(v) => setField("educationLoanInterest80E", v)}
                      prefix="₹"
                    />
                    <CompactField
                      label="Donations — 80G"
                      value={values.donations80G}
                      onChange={(v) => setField("donations80G", v)}
                      prefix="₹"
                    />
                    <CompactField
                      label="Savings account interest"
                      value={values.savingsInterest}
                      onChange={(v) => setField("savingsInterest", v)}
                      prefix="₹"
                      hint="80TTA/80TTB"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-graphite">
                80C, 80D, NPS, education loan interest, donations — only if you have
                them. These lower the old regime&rsquo;s tax only.
              </p>
            )}
          </Zone>
        </>
      }
      results={
        <Reveal className="space-y-7">
          <Callout>
            {recommendedLabel} saves you {formatINR(comparison.savings)} a year, compared with the other
            regime.
          </Callout>

          <div className="grid gap-6 sm:grid-cols-2">
            <RegimeColumn
              eyebrow="Old regime"
              result={comparison.oldRegime}
              highlight={comparison.recommended === "old"}
            />
            <RegimeColumn
              eyebrow="New regime"
              result={comparison.newRegime}
              highlight={comparison.recommended === "new"}
            />
          </div>

          <ExportBar getShareUrl={shareUrl} onCsv={csv} onPdf={pdf} onReset={reset} />
        </Reveal>
      }
      belowFold={
        <Zone eyebrow="Assumptions">
          <p className="max-w-xl text-sm leading-relaxed text-ink-2">
            Figures assume FY 2025-26 (AY 2026-27) slabs, the standard deduction for
            salaried income, and the common deductions above. They leave out the
            surcharge on income above ₹50L, marginal relief at the §87A rebate
            threshold, capital-gains income (taxed at special rates), and 80G&rsquo;s
            real tiered qualifying limits — 80G is treated here as fully deductible.
            This is an estimate, not tax advice; confirm your filing with a tax
            advisor.
          </p>
        </Zone>
      }
    />
  );
}
