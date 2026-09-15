"use client";

import { useMemo } from "react";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { ScenarioInputGroup } from "@/components/calculator/ScenarioInputGroup";
import { CompareTable, type CompareRow } from "@/components/calculator/CompareTable";
import { CompareChart, type CompareSeries, type ComparePoint } from "@/components/calculator/CompareChart";
import { ExportBar } from "@/components/calculator/ExportBar";
import { Reveal } from "@/components/ui/Reveal";
import { Button, SegmentedControl } from "@/components/ui/primitives";
import { useCalculatorState } from "@/hooks/useCalculatorState";
import type { Schema, ValuesOf } from "@/lib/urlState";
import {
  amortizationSchedule,
  emiSeries,
  emiSummary,
  futureValue,
  futureValueSeries,
  presentValue,
  presentValueSeries,
  toPeriodParams,
} from "@/lib/finance";
import { formatINR, formatTenure } from "@/lib/format";

export type Mode = "emi" | "fv" | "pv";

export interface ScenarioValues {
  amount: number;
  pmt: number;
  ratePct: number;
  years: number;
  freq: number;
  timing: "begin" | "end";
  label: string;
}

const schema = {
  mode: { key: "m", default: "emi" },
  n: { key: "n", default: 2, min: 2, max: 4 },

  s1Amount: { key: "s1a", default: 1_000_000, min: 0, max: 100_000_000 },
  s1Pmt: { key: "s1p", default: 0, min: 0, max: 2_000_000 },
  s1Rate: { key: "s1r", default: 8, min: 0, max: 30 },
  s1Years: { key: "s1y", default: 5, min: 1, max: 40 },
  s1Freq: { key: "s1f", default: 12, min: 1, max: 12 },
  s1Timing: { key: "s1tm", default: "end" },
  s1Label: { key: "s1l", default: "" },

  s2Amount: { key: "s2a", default: 1_000_000, min: 0, max: 100_000_000 },
  s2Pmt: { key: "s2p", default: 0, min: 0, max: 2_000_000 },
  s2Rate: { key: "s2r", default: 9.5, min: 0, max: 30 },
  s2Years: { key: "s2y", default: 5, min: 1, max: 40 },
  s2Freq: { key: "s2f", default: 12, min: 1, max: 12 },
  s2Timing: { key: "s2tm", default: "end" },
  s2Label: { key: "s2l", default: "" },

  s3Amount: { key: "s3a", default: 1_200_000, min: 0, max: 100_000_000 },
  s3Pmt: { key: "s3p", default: 0, min: 0, max: 2_000_000 },
  s3Rate: { key: "s3r", default: 8, min: 0, max: 30 },
  s3Years: { key: "s3y", default: 5, min: 1, max: 40 },
  s3Freq: { key: "s3f", default: 12, min: 1, max: 12 },
  s3Timing: { key: "s3tm", default: "end" },
  s3Label: { key: "s3l", default: "" },

  s4Amount: { key: "s4a", default: 1_000_000, min: 0, max: 100_000_000 },
  s4Pmt: { key: "s4p", default: 0, min: 0, max: 2_000_000 },
  s4Rate: { key: "s4r", default: 8, min: 0, max: 30 },
  s4Years: { key: "s4y", default: 7, min: 1, max: 40 },
  s4Freq: { key: "s4f", default: 12, min: 1, max: 12 },
  s4Timing: { key: "s4tm", default: "end" },
  s4Label: { key: "s4l", default: "" },
} satisfies Schema;

type Values = ValuesOf<typeof schema>;

const SCENARIO_KEYS = [1, 2, 3, 4] as const;
type Index = (typeof SCENARIO_KEYS)[number];

function fieldNames(i: Index) {
  const prefix = `s${i}` as const;
  return {
    amount: `${prefix}Amount`,
    pmt: `${prefix}Pmt`,
    ratePct: `${prefix}Rate`,
    years: `${prefix}Years`,
    freq: `${prefix}Freq`,
    timing: `${prefix}Timing`,
    label: `${prefix}Label`,
  } as const satisfies Record<keyof ScenarioValues, keyof Values>;
}

function getScenario(values: Values, i: Index): ScenarioValues {
  const f = fieldNames(i);
  return {
    amount: values[f.amount],
    pmt: values[f.pmt],
    ratePct: values[f.ratePct],
    years: values[f.years],
    freq: values[f.freq],
    timing: values[f.timing] === "begin" ? "begin" : "end",
    label: String(values[f.label]),
  };
}

function valueAtYear(series: ComparePoint[], year: number): number {
  if (series.length === 0) return 0;
  let closest = series[0];
  for (const p of series) {
    if (Math.abs(p.x - year) < Math.abs(closest.x - year)) closest = p;
  }
  return closest.y;
}

export function ComparePage() {
  const { values, setField, reset, shareUrl } = useCalculatorState(schema);
  const mode: Mode = values.mode === "fv" || values.mode === "pv" ? values.mode : "emi";
  const n = Math.min(4, Math.max(2, values.n)) as 2 | 3 | 4;

  const setScenario = <K extends keyof ScenarioValues>(
    i: Index,
    field: K,
    value: ScenarioValues[K],
  ) => {
    const name = fieldNames(i)[field];
    (setField as unknown as (name: keyof Values, value: unknown) => void)(name, value);
  };

  const active = SCENARIO_KEYS.slice(0, n);
  const scenarios = useMemo(
    () => active.map((i) => ({ index: i, values: getScenario(values, i) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values, n],
  );

  const results = useMemo(
    () =>
      scenarios.map(({ index, values: s }) => {
        const label = s.label || `Scenario ${index}`;
        if (mode === "emi") {
          const months = Math.round(s.years * 12);
          const summary = emiSummary(s.amount, s.ratePct, months);
          const schedule = amortizationSchedule(s.amount, s.ratePct, months);
          const series = emiSeries(schedule);
          return {
            index,
            label,
            primary: summary.emi,
            timeSeries: series.map((p) => ({ x: p.year, y: p.balance })) as ComparePoint[],
            row: {
              instalment: summary.emi,
              interest: summary.totalInterest,
              payment: summary.totalPayment,
              months: summary.months,
            },
          };
        }
        const { ratePerPeriodPct, periods } = toPeriodParams(s.ratePct, s.years, s.freq);
        if (mode === "fv") {
          const result = futureValue({ pv: s.amount, pmt: s.pmt, ratePerPeriodPct, periods, timing: s.timing });
          const series = futureValueSeries({
            pv: s.amount,
            pmt: s.pmt,
            ratePerPeriodPct,
            periods,
            timing: s.timing,
            periodsPerYear: s.freq,
          });
          return {
            index,
            label,
            primary: result.fv,
            timeSeries: series.map((p) => ({ x: p.year, y: p.value })) as ComparePoint[],
            row: { fv: result.fv, invested: result.totalContributions, growth: result.totalGrowth },
          };
        }
        const result = presentValue({ fv: s.amount, pmt: s.pmt, ratePerPeriodPct, periods, timing: s.timing });
        const series = presentValueSeries({
          fv: s.amount,
          pmt: s.pmt,
          ratePerPeriodPct,
          periods,
          timing: s.timing,
          periodsPerYear: s.freq,
        });
        return {
          index,
          label,
          primary: result.pv,
          timeSeries: series.map((p) => ({ x: p.year, y: p.worthToday })) as ComparePoint[],
          row: { pv: result.pv, nominal: result.nominalTotal, discount: result.discountAmount },
        };
      }),
    [scenarios, mode],
  );

  const columnLabels = results.map((r) => r.label);

  const tableRows: CompareRow[] = useMemo(() => {
    if (mode === "emi") {
      return [
        {
          label: "Monthly instalment",
          tone: "mine",
          better: "min",
          values: results.map((r) => (r.row as { instalment: number }).instalment),
          format: formatINR,
        },
        {
          label: "Total interest",
          tone: "accent",
          better: "min",
          values: results.map((r) => (r.row as { interest: number }).interest),
          format: formatINR,
        },
        {
          label: "Total repayment",
          strong: true,
          better: "min",
          values: results.map((r) => (r.row as { payment: number }).payment),
          format: formatINR,
        },
        {
          label: "Loan length",
          values: results.map((r) => (r.row as { months: number }).months),
          format: formatTenure,
        },
      ];
    }
    if (mode === "fv") {
      return [
        {
          label: "Future value",
          strong: true,
          better: "max",
          values: results.map((r) => (r.row as { fv: number }).fv),
          format: formatINR,
        },
        {
          label: "Total invested",
          tone: "mine",
          values: results.map((r) => (r.row as { invested: number }).invested),
          format: formatINR,
        },
        {
          label: "Estimated growth",
          tone: "accent",
          better: "max",
          values: results.map((r) => (r.row as { growth: number }).growth),
          format: formatINR,
        },
      ];
    }
    return [
      {
        label: "Present value",
        strong: true,
        tone: "mine",
        better: "max",
        values: results.map((r) => (r.row as { pv: number }).pv),
        format: formatINR,
      },
      {
        label: "Nominal total",
        values: results.map((r) => (r.row as { nominal: number }).nominal),
        format: formatINR,
      },
      {
        label: "Discount",
        tone: "accent",
        better: "min",
        values: results.map((r) => (r.row as { discount: number }).discount),
        format: formatINR,
      },
    ];
  }, [mode, results]);

  const chartSeries: CompareSeries[] = results.map((r) => ({ label: r.label, data: r.timeSeries }));
  const chartTitle = mode === "emi" ? "Outstanding balance" : mode === "fv" ? "Projected value" : "Worth today, by delay";

  const excel = async () => {
    const { exportXlsx } = await import("@/lib/xlsx");
    exportXlsx({
      filename: "comparison",
      title: "Comparison Report",
      meta: [["Calculator", mode === "emi" ? "EMI" : mode === "fv" ? "Future value" : "Present value"], ["Share link", shareUrl()]],
      table: {
        head: ["Metric", ...columnLabels],
        body: tableRows.map((row) => [row.label, ...row.values.map((v) => row.format(v))]),
      },
    });
  };

  const pdf = async () => {
    const { exportPdf } = await import("@/lib/pdf");
    const chart =
      n === 2
        ? (() => {
            const sharedMaxYear = Math.min(
              ...results.map((r) => Math.max(0, ...r.timeSeries.map((p) => p.x))),
            );
            const xValues = Array.from({ length: Math.floor(sharedMaxYear) + 1 }, (_, k) => k);
            return {
              title: chartTitle,
              xLabel: "years",
              xValues,
              series: [
                {
                  key: "s1",
                  label: results[0].label,
                  tone: "mine" as const,
                  kind: "area" as const,
                  values: xValues.map((y) => valueAtYear(results[0].timeSeries, y)),
                },
                {
                  key: "s2",
                  label: results[1].label,
                  tone: "accent" as const,
                  kind: "line" as const,
                  values: xValues.map((y) => valueAtYear(results[1].timeSeries, y)),
                },
              ],
            };
          })()
        : undefined;

    exportPdf({
      filename: "comparison",
      eyebrow: "Side by side",
      title: "Comparison Report",
      meta: [
        `${n} scenarios compared · ${mode === "emi" ? "EMI" : mode === "fv" ? "Future value" : "Present value"}`,
        ...(n > 2 ? ["Chart shown on-screen only — download compares more than 2 scenarios."] : []),
      ],
      hero: {
        label: mode === "emi" ? "Cheapest monthly instalment" : mode === "fv" ? "Highest future value" : "Highest present value",
        value: (() => {
          const best =
            mode === "emi"
              ? results.reduce((a, b) => (a.primary < b.primary ? a : b))
              : results.reduce((a, b) => (a.primary > b.primary ? a : b));
          return `${best.label} — ${formatINR(best.primary)}`;
        })(),
      },
      chart,
      metrics: [
        {
          title: "Scenarios",
          rows: tableRows.map(
            (row): [string, string] => [
              row.label,
              row.values.map((v) => row.format(v)).join(" · "),
            ],
          ),
        },
      ],
      table: {
        title: "Full comparison",
        head: ["Metric", ...columnLabels],
        body: tableRows.map((row) => [row.label, ...row.values.map((v) => row.format(v))]),
      },
      shareUrl: shareUrl(),
    });
  };

  return (
    <CalculatorShell
      title="Compare loans, savings, or payouts"
      intro="Line up two to four scenarios of the same calculator — different amounts, different rates, different terms — and see which one comes out ahead."
      inputs={
        <>
          <div>
            <p className="text-[0.82rem] font-medium text-graphite">Calculator</p>
            <div className="mt-1.5">
              <SegmentedControl
                label="Calculator"
                value={mode}
                onChange={(v) => setField("mode", v)}
                options={[
                  { value: "emi", label: "EMI" },
                  { value: "fv", label: "Future value" },
                  { value: "pv", label: "Present value" },
                ]}
              />
            </div>
          </div>

          <div className="space-y-6">
            {active.map((i) => (
              <ScenarioInputGroup
                key={i}
                index={i}
                mode={mode}
                values={getScenario(values, i)}
                onAmount={(v) => setScenario(i, "amount", v)}
                onPmt={(v) => setScenario(i, "pmt", v)}
                onRate={(v) => setScenario(i, "ratePct", v)}
                onYears={(v) => setScenario(i, "years", v)}
                onFreq={(v) => setScenario(i, "freq", v)}
                onTiming={(v) => setScenario(i, "timing", v)}
                onLabel={(v) => setScenario(i, "label", v)}
                onRemove={() => setField("n", Math.max(2, n - 1))}
                canRemove={n > 2 && i === n}
              />
            ))}
          </div>

          <Button
            type="button"
            variant="ghost"
            onClick={() => setField("n", Math.min(4, n + 1))}
            disabled={n >= 4}
          >
            + Add scenario
          </Button>
        </>
      }
      results={
        <Reveal className="space-y-7">
          <div>
            <h3 className="text-sm font-semibold text-ink">Comparison</h3>
            <div className="mt-3">
              <CompareTable columnLabels={columnLabels} rows={tableRows} />
            </div>
          </div>

          <CompareChart title={chartTitle} xLabel="years" series={chartSeries} />

          <ExportBar getShareUrl={shareUrl} onExcel={excel} onPdf={pdf} onReset={reset} />
        </Reveal>
      }
    />
  );
}
