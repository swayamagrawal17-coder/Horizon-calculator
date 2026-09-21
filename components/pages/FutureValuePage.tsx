"use client";

import { useEffect, useMemo, useState } from "react";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { SliderField } from "@/components/calculator/SliderField";
import { ResultRow, HeroFigure, SplitBar } from "@/components/calculator/ResultRow";
import { TimePlot } from "@/components/calculator/TimePlot";
import { TipCard } from "@/components/calculator/TipCard";
import { ExportBar } from "@/components/calculator/ExportBar";
import { Reveal } from "@/components/ui/Reveal";
import { FrequencySelect, FREQUENCIES } from "@/components/calculator/FrequencySelect";
import { SegmentedControl, Zone } from "@/components/ui/primitives";
import { useCalculatorState } from "@/hooks/useCalculatorState";
import type { Schema } from "@/lib/urlState";
import { futureValue, futureValueSeries, toPeriodParams } from "@/lib/finance";
import { formatINR, formatPercent } from "@/lib/format";

const schema = {
  pv: { key: "pv", default: 100_000, min: 0, max: 50_000_000 },
  pmt: { key: "c", default: 10_000, min: 0, max: 2_000_000 },
  ratePct: { key: "r", default: 12, min: 0, max: 30 },
  years: { key: "y", default: 10, min: 1, max: 40 },
  freq: { key: "f", default: 12, min: 1, max: 12 },
  timing: { key: "tm", default: "end", min: 0, max: 0 },
} satisfies Schema;

export function FutureValuePage() {
  const { values, setField, reset, shareUrl } = useCalculatorState(schema);
  const [showTable, setShowTable] = useState(false);
  const timing = values.timing === "begin" ? "begin" : "end";
  const freqLabel =
    FREQUENCIES.find((f) => f.value === values.freq)?.label ?? "Monthly";
  const perLabel = freqLabel.toLowerCase();

  const { ratePerPeriodPct, periods } = toPeriodParams(
    values.ratePct,
    values.years,
    values.freq,
  );

  const result = useMemo(
    () =>
      futureValue({ pv: values.pv, pmt: values.pmt, ratePerPeriodPct, periods, timing }),
    [values.pv, values.pmt, ratePerPeriodPct, periods, timing],
  );

  const series = useMemo(
    () =>
      futureValueSeries({
        pv: values.pv,
        pmt: values.pmt,
        ratePerPeriodPct,
        periods,
        timing,
        periodsPerYear: values.freq,
      }),
    [values.pv, values.pmt, ratePerPeriodPct, periods, timing, values.freq],
  );

  const [scrub, setScrub] = useState(values.years);
  useEffect(() => setScrub(values.years), [values.years]);
  const point = series.find((d) => d.year >= scrub - 1e-9) ?? series[series.length - 1];

  const excel = async () => {
    const { exportXlsx } = await import("@/lib/xlsx");
    exportXlsx({
      filename: "future-value-projection",
      title: "Future Value Report",
      meta: [
        ["Amount today", values.pv],
        ["Added each period", values.pmt],
        ["Compounding", freqLabel],
        ["Expected return (% p.a.)", values.ratePct],
        ["Time (years)", values.years],
        ["Contribution timing", timing === "begin" ? "Start of period" : "End of period"],
        ["Future value", Math.round(result.fv)],
        ["Total invested", Math.round(result.totalContributions)],
        ["Estimated growth", Math.round(result.totalGrowth)],
        ["Periods", periods],
        ["Share link", shareUrl()],
      ],
      table: {
        head: ["Year", "Invested", "Growth", "Projected value"],
        body: series.slice(1).map((r) => [
          r.year,
          Math.round(r.invested),
          Math.round(r.growth),
          Math.round(r.value),
        ]),
      },
    });
  };

  const pdf = async () => {
    const { exportPdf } = await import("@/lib/pdf");
    exportPdf({
      filename: "future-value",
      eyebrow: "Savings · compound growth",
      title: "Future Value Report",
      meta: [`${formatINR(values.pv)} today plus ${formatINR(values.pmt)} ${perLabel} at ${formatPercent(values.ratePct)} p.a. for ${values.years} years`],
      hero: {
        label: `Future value in ${values.years} years`,
        value: formatINR(result.fv),
        note: `${formatINR(result.totalContributions)} invested · ${formatINR(result.totalGrowth)} growth`,
      },
      chart: {
        title: "Projected value",
        xLabel: "years",
        xValues: series.map((p) => p.year),
        series: [
          { key: "invested", label: "Invested", tone: "mine", kind: "area", values: series.map((p) => p.invested) },
          { key: "growth", label: "Growth", tone: "accent", kind: "area", stackWith: "invested", values: series.map((p) => p.growth) },
        ],
      },
      splitBar: {
        mineLabel: "Invested",
        mineValue: result.totalContributions,
        costLabel: "Growth",
        costValue: result.totalGrowth,
      },
      metrics: [
        {
          title: "Result",
          rows: [
            ["Future value", formatINR(result.fv)],
            ["Total invested", formatINR(result.totalContributions)],
            ["Estimated growth", formatINR(result.totalGrowth)],
            ["Compounding", freqLabel],
            ["Contribution timing", timing === "begin" ? "Start of period" : "End of period"],
            ["Periods", `${periods} · ${perLabel}`],
          ],
        },
      ],
      table: {
        title: "Year by year",
        head: ["Year", "Invested", "Growth", "Value"],
        body: series.slice(1).map((r) => [
          r.year,
          formatINR(r.invested),
          formatINR(r.growth),
          formatINR(r.value),
        ]),
      },
      shareUrl: shareUrl(),
    });
  };

  return (
    <CalculatorShell
      title="What today's money becomes"
      intro="A lump sum now plus regular contributions, compounded at your chosen frequency. The plot separates the money you put in from the growth it earns."
      inputs={
        <>
          <SliderField
            label="Amount today"
            value={values.pv}
            onChange={(v) => setField("pv", v)}
            min={0}
            max={schema.pv.max}
            step={10_000}
            prefix="₹"
          />
          <SliderField
            label="Added each period"
            value={values.pmt}
            onChange={(v) => setField("pmt", v)}
            min={0}
            max={schema.pmt.max}
            step={1_000}
            prefix="₹"
            hint={`${perLabel} · 0 for lump sum only`}
          />
          <SliderField
            label="Expected return, per year"
            value={values.ratePct}
            onChange={(v) => setField("ratePct", v)}
            min={0}
            max={30}
            step={0.5}
            suffix="%"
          />
          <SliderField
            label="Time"
            value={values.years}
            onChange={(v) => setField("years", Math.round(v))}
            min={1}
            max={40}
            step={1}
            suffix="yr"
          />
          <Zone eyebrow="Compounding" className="mt-6 border-t border-rule pt-6">
            <div className="space-y-4">
              <FrequencySelect
                label="Compounding"
                value={values.freq}
                onChange={(v) => setField("freq", v)}
              />
              <div className="flex items-center justify-between gap-3">
                <span className="text-[0.82rem] font-medium text-graphite">Contribution timing</span>
                <SegmentedControl
                  label="Contribution timing"
                  value={timing}
                  onChange={(v) => setField("timing", v)}
                  options={[
                    { value: "end", label: "End" },
                    { value: "begin", label: "Start" },
                  ]}
                />
              </div>
            </div>
          </Zone>
        </>
      }
      results={
        <Reveal className="space-y-7">
          <HeroFigure
            eyebrow={`Future value in ${values.years} years`}
            value={formatINR(result.fv)}
            note={`${formatINR(result.totalContributions)} invested · ${formatINR(result.totalGrowth)} growth`}
          />

          <TimePlot
            title="Projected value"
            data={series}
            xKey="year"
            xUnit="years"
            series={[
              { key: "invested", label: "Invested", tone: "mine", kind: "area", stackId: "v" },
              { key: "growth", label: "Growth", tone: "accent", kind: "area", stackId: "v" },
            ]}
            scrub={scrub}
            onScrub={(x) => setScrub(Math.round(x))}
            scrubMin={0}
            scrubMax={values.years}
            scrubStep={1}
            readout={
              <>
                <span className="text-graphite">year {String(point?.year ?? 0).padStart(2, "0")}</span>
                <span>invested {formatINR(point?.invested ?? 0)}</span>
                <span className="text-accent-2">growth {formatINR(point?.growth ?? 0)}</span>
                <span>value {formatINR(point?.value ?? 0)}</span>
              </>
            }
          />

          <div className="space-y-3">
            <SplitBar
              mine={result.totalContributions}
              cost={result.totalGrowth}
              mineLabel="Invested"
              costLabel="Growth"
            />
            <div>
              <ResultRow label="Total invested" value={formatINR(result.totalContributions)} tone="mine" />
              <ResultRow label="Estimated growth" value={formatINR(result.totalGrowth)} tone="accent" />
              <ResultRow label="Future value" value={formatINR(result.fv)} strong />
              <ResultRow label="Periods" value={`${periods} · ${perLabel}`} />
            </div>
          </div>

          <TipCard title="Why starting early matters" href="/learn/power-of-compounding/" linkLabel="The power of compounding">

            <p>Try lowering the time by 5 years and see how much the projected value drops. Most of the growth comes late, so extra years usually matter more than a slightly larger deposit. The rate here is an assumption, not a promise.</p>

          </TipCard>


          <ExportBar
            getShareUrl={shareUrl}
            onExcel={excel}
            onPdf={pdf}
            onReset={() => {
              reset();
              setShowTable(false);
            }}
          />
        </Reveal>
      }
      belowFold={
        <Zone
          eyebrow="Year by year"
          aside={
            <button
              className="focusable -m-1 inline-flex min-h-[40px] items-center p-1 text-xs text-mine underline decoration-dotted underline-offset-4 hover:decoration-solid"
              onClick={() => setShowTable((s) => !s)}
              aria-expanded={showTable}
            >
              {showTable ? "Collapse" : `Show ${values.years} years`}
            </button>
          }
        >
          {showTable ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[440px] text-xs tnum">
                <caption className="sr-only">Projected value at the end of each year</caption>
                <thead>
                  <tr className="border-b border-rule-strong text-graphite">
                    <th scope="col" className="py-2 pr-3 text-left font-medium">Year</th>
                    <th scope="col" className="py-2 pl-3 text-right font-medium">Invested</th>
                    <th scope="col" className="py-2 pl-3 text-right font-medium">Growth</th>
                    <th scope="col" className="py-2 pl-3 text-right font-medium">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {series.slice(1).map((r) => (
                    <tr key={r.year} className="border-b border-rule text-ink-2">
                      <td className="py-1.5 pr-3 text-left text-graphite">{String(r.year).padStart(2, "0")}</td>
                      <td className="py-1.5 pl-3 text-right">{formatINR(r.invested)}</td>
                      <td className="py-1.5 pl-3 text-right text-accent-2">{formatINR(r.growth)}</td>
                      <td className="py-1.5 pl-3 text-right text-ink">{formatINR(r.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="max-w-2xl text-xs text-graphite">
              Expand for the running split of contributions and growth at each year end.
            </p>
          )}
        </Zone>
      }
    />
  );
}
