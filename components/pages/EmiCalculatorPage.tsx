"use client";

import { useEffect, useMemo, useState } from "react";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { SliderField } from "@/components/calculator/SliderField";
import { ResultRow, HeroFigure, SplitBar } from "@/components/calculator/ResultRow";
import { TimePlot } from "@/components/calculator/TimePlot";
import { ScheduleTable } from "@/components/calculator/ScheduleTable";
import { TipCard } from "@/components/calculator/TipCard";
import { ExportBar } from "@/components/calculator/ExportBar";
import { Callout } from "@/components/calculator/Callout";
import { Reveal } from "@/components/ui/Reveal";
import { SegmentedControl, Toggle, Zone } from "@/components/ui/primitives";
import { useCalculatorState } from "@/hooks/useCalculatorState";
import type { Schema } from "@/lib/urlState";
import {
  amortizationSchedule,
  emiSeries,
  emiSummary,
  stepUpComparison,
  type AmortRow,
} from "@/lib/finance";
import { formatINR, formatPercent, formatTenure } from "@/lib/format";

const schema = {
  principal: { key: "p", default: 1_000_000, min: 50_000, max: 50_000_000 },
  ratePct: { key: "r", default: 6.5, min: 1, max: 30 },
  months: { key: "n", default: 60, min: 3, max: 360 },
  stepUp: { key: "su", default: false },
  stepUpPct: { key: "sp", default: 10, min: 0, max: 20 },
  stepEvery: { key: "si", default: 12, min: 6, max: 24 },
  startEmi: { key: "se", default: 0, min: 0, max: 50_000_000 },
} satisfies Schema;

export function EmiCalculatorPage() {
  const { values, setField, reset, shareUrl } = useCalculatorState(schema);
  const [unit, setUnit] = useState<"yr" | "mo">("yr");
  const [showSchedule, setShowSchedule] = useState(false);
  const { principal, ratePct, months } = values;

  const summary = useMemo(
    () => emiSummary(principal, ratePct, months),
    [principal, ratePct, months],
  );
  const standardEmi = summary.emi;

  const comparison = useMemo(
    () =>
      values.stepUp
        ? stepUpComparison(
            principal,
            ratePct,
            months,
            values.stepUpPct,
            values.stepEvery,
            values.startEmi > 0 ? values.startEmi : undefined,
          )
        : null,
    [principal, ratePct, months, values.stepUp, values.stepUpPct, values.stepEvery, values.startEmi],
  );

  const schedule: AmortRow[] = useMemo(
    () =>
      comparison
        ? comparison.stepUp.schedule
        : amortizationSchedule(principal, ratePct, months),
    [comparison, principal, ratePct, months],
  );

  const series = useMemo(() => emiSeries(schedule), [schedule]);
  const lastYear = series.length ? series[series.length - 1].year : 1;

  const [scrub, setScrub] = useState(lastYear);
  useEffect(() => setScrub(lastYear), [lastYear]);
  const point =
    series.find((d) => d.year >= scrub - 1e-9) ?? series[series.length - 1];

  const totals = comparison
    ? {
        interest: comparison.stepUp.totalInterest,
        payment: comparison.stepUp.totalPayment,
        heroValue: formatINR(comparison.stepUp.firstEmi),
        heroNote: `steps up to ${formatINR(comparison.stepUp.lastEmi)} by the final year`,
        tenure: formatTenure(comparison.stepUp.actualMonths),
      }
    : {
        interest: summary.totalInterest,
        payment: summary.totalPayment,
        heroValue: formatINR(standardEmi),
        heroNote: `${formatINR(principal)} · ${formatPercent(ratePct)} p.a. · ${formatTenure(months)}`,
        tenure: formatTenure(months),
      };

  const excel = async () => {
    const { exportXlsx } = await import("@/lib/xlsx");
    exportXlsx({
      filename: "emi-schedule",
      title: comparison ? "Step-up EMI Report" : "Loan EMI Report",
      meta: [
        ["Loan amount", principal],
        ["Interest rate (% p.a.)", ratePct],
        ["Tenure (months)", months],
        ...(comparison
          ? ([
              ["Starting monthly EMI", Math.round(comparison.stepUp.firstEmi)],
              ["Final monthly EMI", Math.round(comparison.stepUp.lastEmi)],
              ["Step-up (%)", values.stepUpPct],
              ["Step every (months)", values.stepEvery],
            ] as const)
          : ([["Monthly EMI", Math.round(standardEmi)]] as const)),
        ["Principal", principal],
        ["Total interest", Math.round(totals.interest)],
        ["Total payable", Math.round(totals.payment)],
        ["Effective tenure", totals.tenure],
        ...(comparison
          ? ([
              ["Standard EMI", Math.round(comparison.standard.emi)],
              ["Standard total interest", Math.round(comparison.standard.totalInterest)],
              ["Months saved", Math.max(0, comparison.monthsSaved)],
              ["Interest saved", Math.max(0, Math.round(comparison.interestSaved))],
            ] as const)
          : []),
        ["Share link", shareUrl()],
      ],
      table: {
        head: ["Month", "EMI", "Principal", "Interest", "Balance"],
        body: schedule.map((r) => [
          r.period,
          Math.round(r.emi),
          Math.round(r.principalPaid),
          Math.round(r.interestPaid),
          Math.round(r.balance),
        ]),
      },
    });
  };

  const pdf = async () => {
    const { exportPdf } = await import("@/lib/pdf");
    exportPdf({
      filename: "emi-summary",
      eyebrow: "Loan · reducing balance",
      title: comparison ? "Step-up EMI Report" : "Loan EMI Report",
      meta: [`${formatINR(principal)} at ${formatPercent(ratePct)} p.a. for ${formatTenure(months)}`],
      hero: {
        label: comparison ? "Starting monthly EMI" : "Monthly EMI",
        value: totals.heroValue,
        note: totals.heroNote,
      },
      chart: {
        title: "Outstanding balance",
        xLabel: "years",
        xValues: series.map((p) => p.year),
        series: [
          { key: "balance", label: "Outstanding balance", tone: "mine", kind: "area", values: series.map((p) => p.balance) },
          { key: "interestPaid", label: "Interest paid so far", tone: "accent", kind: "line", values: series.map((p) => p.interestPaid) },
        ],
      },
      splitBar: {
        mineLabel: "Principal",
        mineValue: principal,
        costLabel: "Interest",
        costValue: totals.interest,
      },
      callout: comparison?.stepUp.underpaid
        ? "The starting EMI doesn't cover the first month's interest, so the balance grows until the step-ups catch up."
        : undefined,
      metrics: [
        {
          title: "Plan",
          rows: [
            ["Monthly EMI", comparison ? `${formatINR(comparison.stepUp.firstEmi)} → ${formatINR(comparison.stepUp.lastEmi)}` : formatINR(standardEmi)],
            ["Principal", formatINR(principal)],
            ["Total interest", formatINR(totals.interest)],
            ["Total payable", formatINR(totals.payment)],
            ["Effective tenure", totals.tenure],
          ],
        },
        ...(comparison
          ? [
              {
                title: "Versus a standard EMI",
                rows: [
                  ["Standard EMI", formatINR(comparison.standard.emi)],
                  ["Standard interest", formatINR(comparison.standard.totalInterest)],
                  ["Months saved", String(Math.max(0, comparison.monthsSaved))],
                  ["Interest saved", formatINR(Math.max(0, comparison.interestSaved))],
                ] as [string, string][],
              },
            ]
          : []),
      ],
      table: {
        title: "Amortization schedule",
        head: ["Month", "EMI", "Principal", "Interest", "Balance"],
        body: schedule.map((r) => [
          r.period,
          formatINR(r.emi),
          formatINR(r.principalPaid),
          formatINR(r.interestPaid),
          formatINR(r.balance),
        ]),
      },
      shareUrl: shareUrl(),
    });
  };

  return (
    <CalculatorShell
      title="What a loan costs, month by month"
      intro="EMI — your equated monthly instalment — is the fixed sum you repay each month on a reducing-balance loan. See what it costs, and how step-up EMI can clear it sooner."
      inputs={
        <>
          <SliderField
            label="Loan amount"
            value={principal}
            onChange={(v) => setField("principal", v)}
            min={schema.principal.min}
            max={schema.principal.max}
            step={10_000}
            prefix="₹"
          />
          <SliderField
            label="Interest rate, per year"
            value={ratePct}
            onChange={(v) => setField("ratePct", v)}
            min={schema.ratePct.min}
            max={schema.ratePct.max}
            step={0.05}
            suffix="%"
          />
          <SliderField
            label="Loan length"
            value={unit === "yr" ? Math.round(months / 12) : months}
            onChange={(v) =>
              setField("months", unit === "yr" ? Math.round(v) * 12 : Math.round(v))
            }
            min={unit === "yr" ? 1 : schema.months.min}
            max={unit === "yr" ? 30 : schema.months.max}
            step={1}
            suffix={unit === "yr" ? "yr" : "mo"}
            labelAside={
              <SegmentedControl
                label="Tenure unit"
                value={unit}
                onChange={setUnit}
                options={[
                  { value: "yr", label: "Yr" },
                  { value: "mo", label: "Mo" },
                ]}
              />
            }
          />

          <Zone eyebrow="Step-up EMI (optional)" className="mt-6 border-t border-rule pt-6">
            <div className="space-y-4">
              <Toggle
                label="Raise my instalment over time"
                checked={values.stepUp}
                onChange={(v) => setField("stepUp", v)}
              />

              {values.stepUp && (
                <div className="space-y-4">
                  <p className="text-[0.8rem] leading-relaxed text-graphite">
                    The instalment rises on a fixed schedule, so the loan clears
                    sooner and costs less in interest.
                  </p>
                  <SliderField
                    label="Raise the EMI by"
                    value={values.stepUpPct}
                    onChange={(v) => setField("stepUpPct", v)}
                    min={0}
                    max={20}
                    step={1}
                    suffix="%"
                    hint="at each step"
                  />
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[0.82rem] font-medium text-graphite">Step every</span>
                    <SegmentedControl
                      label="Step-up interval"
                      value={String(values.stepEvery)}
                      onChange={(v) => setField("stepEvery", Number(v))}
                      options={[
                        { value: "6", label: "6 mo" },
                        { value: "12", label: "12 mo" },
                        { value: "24", label: "24 mo" },
                      ]}
                    />
                  </div>
                  <SliderField
                    label="Starting EMI"
                    value={values.startEmi > 0 ? values.startEmi : Math.round(standardEmi)}
                    onChange={(v) =>
                      setField(
                        "startEmi",
                        Math.abs(v - standardEmi) < 1 ? 0 : Math.round(v),
                      )
                    }
                    min={Math.round(standardEmi * 0.4)}
                    max={Math.round(standardEmi * 1.5)}
                    step={500}
                    prefix="₹"
                    hint={`standard ${formatINR(standardEmi)}`}
                  />
                  {comparison?.stepUp.underpaid && (
                    <Callout>
                      The starting EMI doesn&apos;t cover the first month&apos;s interest,
                      so the balance grows until the step-ups catch up.
                    </Callout>
                  )}
                </div>
              )}
            </div>
          </Zone>
        </>
      }
      results={
        <Reveal className="space-y-7">
          <HeroFigure
            eyebrow={comparison ? "Starting monthly EMI" : "Monthly EMI"}
            value={totals.heroValue}
            note={totals.heroNote}
          />

          <TimePlot
            title="Outstanding balance"
            data={series}
            xKey="year"
            xUnit="years"
            series={[
              { key: "balance", label: "Outstanding balance", tone: "mine", kind: "area" },
              { key: "interestPaid", label: "Interest paid so far", tone: "accent", kind: "line" },
            ]}
            scrub={scrub}
            onScrub={setScrub}
            scrubMin={0}
            scrubMax={lastYear}
            scrubStep={1 / 12}
            readout={
              <>
                <span className="text-graphite">
                  month {String(point?.month ?? 0).padStart(3, "0")}
                </span>
                <span>balance {formatINR(point?.balance ?? 0)}</span>
                <span className="text-accent-2">
                  interest {formatINR(point?.interestPaid ?? 0)}
                </span>
                <span>principal cleared {formatINR(point?.principalPaid ?? 0)}</span>
              </>
            }
          />

          <div className="space-y-3">
            <SplitBar
              mine={principal}
              cost={totals.interest}
              mineLabel="Principal"
              costLabel="Interest"
            />
            <div>
              <ResultRow label="Principal borrowed" value={formatINR(principal)} tone="mine" />
              <ResultRow label="Total interest" value={formatINR(totals.interest)} tone="accent" />
              <ResultRow label="Total repayment" value={formatINR(totals.payment)} strong />
              <ResultRow label="Effective tenure" value={totals.tenure} />
            </div>
          </div>

          {comparison && (
            <div className="rounded-md border border-rule bg-paper px-4 py-3">
              <p className="field-label mb-2">Step-up vs standard</p>
              <div className="flex flex-wrap gap-x-8 gap-y-1 text-xs">
                <span>
                  <span className="text-graphite">months saved </span>
                  {Math.max(0, comparison.monthsSaved)}
                </span>
                <span>
                  <span className="text-graphite">interest saved </span>
                  {formatINR(Math.max(0, comparison.interestSaved))}
                </span>
              </div>
            </div>
          )}

          <TipCard title="Prepay, or step up your EMI?" href="/learn/prepay-loan-or-invest/" linkLabel="Prepay a loan or invest the money?">

            <p>Paying a bit extra early cuts the most interest, because early instalments are mostly interest. Step-up EMI does something similar by raising your payment as your income grows. Whether to prepay or invest the money instead is a personal trade-off.</p>

          </TipCard>


          <ExportBar
            getShareUrl={shareUrl}
            onExcel={excel}
            onPdf={pdf}
            onReset={() => {
              reset();
              setShowSchedule(false);
            }}
          />
        </Reveal>
      }
      belowFold={
        <Zone
          eyebrow="Amortization schedule"
          aside={
            <button
              className="focusable -m-1 inline-flex min-h-[40px] items-center p-1 text-xs text-mine underline decoration-dotted underline-offset-4 hover:decoration-solid"
              onClick={() => setShowSchedule((s) => !s)}
              aria-expanded={showSchedule}
            >
              {showSchedule ? "Collapse" : `Show ${schedule.length} months`}
            </button>
          }
        >
          {showSchedule ? (
            <ScheduleTable<AmortRow>
              caption="Month-by-month principal, interest and outstanding balance"
              rows={schedule}
              columns={[
                { header: "EMI", cell: (r) => formatINR(r.emi) },
                { header: "Principal", cell: (r) => formatINR(r.principalPaid) },
                { header: "Interest", cell: (r) => formatINR(r.interestPaid) },
                { header: "Balance", cell: (r) => formatINR(r.balance) },
              ]}
              summariseYear={(rows) => {
                const sum = (f: (r: AmortRow) => number) =>
                  rows.reduce((s, r) => s + f(r), 0);
                return [
                  formatINR(sum((r) => r.emi)),
                  formatINR(sum((r) => r.principalPaid)),
                  formatINR(sum((r) => r.interestPaid)),
                  formatINR(rows[rows.length - 1].balance),
                ];
              }}
            />
          ) : (
            <p className="max-w-2xl text-xs text-graphite">
              Expand to read every instalment — principal, interest and the
              balance carried forward.
            </p>
          )}
        </Zone>
      }
    />
  );
}
