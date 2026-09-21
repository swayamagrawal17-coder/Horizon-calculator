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
import { presentValue, presentValueSeries, toPeriodParams } from "@/lib/finance";
import { formatINR, formatPercent } from "@/lib/format";

const schema = {
  fv: { key: "fv", default: 1_000_000, min: 0, max: 100_000_000 },
  pmt: { key: "c", default: 0, min: 0, max: 2_000_000 },
  ratePct: { key: "r", default: 8, min: 0, max: 30 },
  years: { key: "y", default: 10, min: 1, max: 40 },
  freq: { key: "f", default: 12, min: 1, max: 12 },
  timing: { key: "tm", default: "end", min: 0, max: 0 },
} satisfies Schema;

export function PresentValuePage() {
  const { values, setField, reset, shareUrl } = useCalculatorState(schema);
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
      presentValue({ fv: values.fv, pmt: values.pmt, ratePerPeriodPct, periods, timing }),
    [values.fv, values.pmt, ratePerPeriodPct, periods, timing],
  );

  const series = useMemo(
    () =>
      presentValueSeries({
        fv: values.fv,
        pmt: values.pmt,
        ratePerPeriodPct,
        periods,
        timing,
        periodsPerYear: values.freq,
      }),
    [values.fv, values.pmt, ratePerPeriodPct, periods, timing, values.freq],
  );

  const [scrub, setScrub] = useState(values.years);
  useEffect(() => setScrub(values.years), [values.years]);
  const point = series.find((d) => d.year >= scrub - 1e-9) ?? series[series.length - 1];

  const excel = async () => {
    const { exportXlsx } = await import("@/lib/xlsx");
    exportXlsx({
      filename: "present-value",
      title: "Present Value Report",
      meta: [
        ["Amount due later", values.fv],
        ["Recurring future payment", values.pmt],
        ["Compounding", freqLabel],
        ["Discount rate (% p.a.)", values.ratePct],
        ["Time until due (years)", values.years],
        ["Payment timing", timing === "begin" ? "Start of period" : "End of period"],
        ["Present value", Math.round(result.pv)],
        ["Nominal total", Math.round(result.nominalTotal)],
        ["Discount", Math.round(result.discountAmount)],
        ["Periods", periods],
        ["Share link", shareUrl()],
      ],
      table: {
        head: ["Received in year", "Worth today"],
        body: series.map((r) => [r.year, Math.round(r.worthToday)]),
      },
    });
  };

  const pdf = async () => {
    const { exportPdf } = await import("@/lib/pdf");
    exportPdf({
      filename: "present-value",
      eyebrow: "Discount · time value",
      title: "Present Value Report",
      meta: [`${formatINR(values.fv)} plus ${formatINR(values.pmt)} ${perLabel} discounted at ${formatPercent(values.ratePct)} p.a. over ${values.years} years`],
      hero: {
        label: "Present value",
        value: formatINR(result.pv),
        note: `${formatINR(result.nominalTotal)} nominal · ${formatINR(result.discountAmount)} lost to waiting`,
      },
      chart: {
        title: "Worth today, by delay",
        xLabel: "years of delay",
        xValues: series.map((p) => p.year),
        series: [
          { key: "worthToday", label: "Value in today's money", tone: "mine", kind: "area", values: series.map((p) => p.worthToday) },
        ],
      },
      splitBar: {
        mineLabel: "Present value",
        mineValue: result.pv,
        costLabel: "Discount",
        costValue: result.discountAmount,
      },
      metrics: [
        {
          title: "Result",
          rows: [
            ["Present value", formatINR(result.pv)],
            ["Nominal total", formatINR(result.nominalTotal)],
            ["Discount", formatINR(result.discountAmount)],
            ["Compounding", freqLabel],
            ["Payment timing", timing === "begin" ? "Start of period" : "End of period"],
            ["Periods", `${periods} · ${perLabel}`],
          ],
        },
      ],
      table: {
        title: "Worth today, by delay",
        head: ["Received in year", "Worth today"],
        body: series.map((r) => [r.year, formatINR(r.worthToday)]),
      },
      shareUrl: shareUrl(),
    });
  };

  return (
    <CalculatorShell
      title="What future money is worth now"
      intro="A sum due later — plus any recurring future payments — discounted back to today. The plot shows how the same amount is worth less the longer you wait for it."
      inputs={
        <>
          <SliderField
            label="Amount due later"
            value={values.fv}
            onChange={(v) => setField("fv", v)}
            min={0}
            max={schema.fv.max}
            step={50_000}
            prefix="₹"
          />
          <SliderField
            label="Recurring future payment"
            value={values.pmt}
            onChange={(v) => setField("pmt", v)}
            min={0}
            max={schema.pmt.max}
            step={1_000}
            prefix="₹"
            hint={`${perLabel} · 0 for a single sum`}
          />
          <SliderField
            label="Discount rate, per year"
            value={values.ratePct}
            onChange={(v) => setField("ratePct", v)}
            min={0}
            max={30}
            step={0.5}
            suffix="%"
          />
          <SliderField
            label="Time until due"
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
                <span className="text-[0.82rem] font-medium text-graphite">Payment timing</span>
                <SegmentedControl
                  label="Payment timing"
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
            eyebrow="Present value"
            value={formatINR(result.pv)}
            note={`${formatINR(result.nominalTotal)} nominal · ${formatINR(result.discountAmount)} lost to waiting`}
          />

          <TimePlot
            title="Worth today, by delay"
            data={series}
            xKey="year"
            xUnit="years of delay"
            series={[
              { key: "worthToday", label: "Value in today's money", tone: "mine", kind: "area" },
            ]}
            scrub={scrub}
            onScrub={(x) => setScrub(Math.round(x))}
            scrubMin={0}
            scrubMax={values.years}
            scrubStep={1}
            readout={
              <>
                <span className="text-graphite">
                  received in year {String(point?.year ?? 0).padStart(2, "0")}
                </span>
                <span>worth {formatINR(point?.worthToday ?? 0)} today</span>
              </>
            }
          />

          <div className="space-y-3">
            <SplitBar
              mine={result.pv}
              cost={result.discountAmount}
              mineLabel="Present value"
              costLabel="Discount"
            />
            <div>
              <ResultRow label="Nominal total" value={formatINR(result.nominalTotal)} />
              <ResultRow label="Lost to discounting" value={formatINR(result.discountAmount)} tone="accent" />
              <ResultRow label="Present value" value={formatINR(result.pv)} strong tone="mine" />
              <ResultRow label="Periods" value={`${periods} · ${perLabel}`} />
            </div>
          </div>

          <TipCard title="Why a future rupee is worth less" href="/learn/power-of-compounding/" linkLabel="How compounding and time work">

            <p>The discount rate stands in for inflation and the return you could earn elsewhere. Raise it and watch the present value fall. Picking a realistic rate matters more than the arithmetic.</p>

          </TipCard>


          <ExportBar getShareUrl={shareUrl} onExcel={excel} onPdf={pdf} onReset={reset} />
        </Reveal>
      }
      belowFold={
        <Zone eyebrow="The formula">
          <p className="max-w-xl text-sm leading-relaxed text-ink-2">
            The lump sum is discounted with{" "}
            <span className="font-semibold text-ink">PV = FV / (1 + i)ⁿ</span>, and each
            recurring payment with the annuity factor{" "}
            <span className="font-semibold text-ink">PMT · [1 − (1 + i)⁻ⁿ] / i</span>. Here{" "}
            <span className="font-semibold text-ink">i</span> is the per-period rate (
            {formatPercent(ratePerPeriodPct)}) and{" "}
            <span className="font-semibold text-ink">n</span> the number of periods (
            {periods}). Choosing &ldquo;start&rdquo; multiplies the annuity term by
            (1 + i).
          </p>
        </Zone>
      }
    />
  );
}
