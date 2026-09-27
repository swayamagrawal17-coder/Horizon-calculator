"use client";

import { useEffect, useMemo, useState } from "react";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { CostSheetInputGroup } from "@/components/calculator/CostSheetInputGroup";
import { CompareTable, type CompareRow } from "@/components/calculator/CompareTable";
import { TimePlot } from "@/components/calculator/TimePlot";
import { Callout } from "@/components/calculator/Callout";
import { ExportBar } from "@/components/calculator/ExportBar";
import { Reveal } from "@/components/ui/Reveal";
import { Button, SegmentedControl, Zone } from "@/components/ui/primitives";
import { useCalculatorState } from "@/hooks/useCalculatorState";
import type { Schema, ValuesOf } from "@/lib/urlState";
import { breakEvenSeries, computeCostSheet, type CostSheetInput } from "@/lib/costSheet";
import { formatINR, formatPercent } from "@/lib/format";

export interface CostSheetScenario extends CostSheetInput {
  label: string;
}

/** Every product starts blank — pre-filled demo figures read as answers, not a form to fill in. */
const EMPTY: CostSheetScenario = {
  label: "",
  materialStdQtyPerUnit: 0,
  materialStdPricePerUnit: 0,
  materialActQtyPerUnit: 0,
  materialActPricePerUnit: 0,
  labourStdHoursPerUnit: 0,
  labourStdRatePerHour: 0,
  labourActHoursPerUnit: 0,
  labourActRatePerHour: 0,
  variableOverheadPerUnit: 0,
  budgetedFixedOverhead: 0,
  actualFixedOverhead: 0,
  budgetedUnits: 0,
  actualUnits: 0,
  sellingPricePerUnit: 0,
};

const schema = {
  n: { key: "n", default: 2, min: 2, max: 4 },

  s1Label: { key: "s1l", default: EMPTY.label },
  s1Msq: { key: "s1msq", default: EMPTY.materialStdQtyPerUnit, min: 0, max: 1_000 },
  s1Msp: { key: "s1msp", default: EMPTY.materialStdPricePerUnit, min: 0, max: 100_000_000 },
  s1Maq: { key: "s1maq", default: EMPTY.materialActQtyPerUnit, min: 0, max: 1_000 },
  s1Map: { key: "s1map", default: EMPTY.materialActPricePerUnit, min: 0, max: 100_000_000 },
  s1Lsh: { key: "s1lsh", default: EMPTY.labourStdHoursPerUnit, min: 0, max: 1_000 },
  s1Lsr: { key: "s1lsr", default: EMPTY.labourStdRatePerHour, min: 0, max: 100_000_000 },
  s1Lah: { key: "s1lah", default: EMPTY.labourActHoursPerUnit, min: 0, max: 1_000 },
  s1Lar: { key: "s1lar", default: EMPTY.labourActRatePerHour, min: 0, max: 100_000_000 },
  s1Voh: { key: "s1voh", default: EMPTY.variableOverheadPerUnit, min: 0, max: 100_000_000 },
  s1Bfoh: { key: "s1bfoh", default: EMPTY.budgetedFixedOverhead, min: 0, max: 1_000_000_000 },
  s1Afoh: { key: "s1afoh", default: EMPTY.actualFixedOverhead, min: 0, max: 1_000_000_000 },
  s1Bu: { key: "s1bu", default: EMPTY.budgetedUnits, min: 0, max: 10_000_000 },
  s1Au: { key: "s1au", default: EMPTY.actualUnits, min: 0, max: 10_000_000 },
  s1Sp: { key: "s1sp", default: EMPTY.sellingPricePerUnit, min: 0, max: 100_000_000 },

  s2Label: { key: "s2l", default: EMPTY.label },
  s2Msq: { key: "s2msq", default: EMPTY.materialStdQtyPerUnit, min: 0, max: 1_000 },
  s2Msp: { key: "s2msp", default: EMPTY.materialStdPricePerUnit, min: 0, max: 100_000_000 },
  s2Maq: { key: "s2maq", default: EMPTY.materialActQtyPerUnit, min: 0, max: 1_000 },
  s2Map: { key: "s2map", default: EMPTY.materialActPricePerUnit, min: 0, max: 100_000_000 },
  s2Lsh: { key: "s2lsh", default: EMPTY.labourStdHoursPerUnit, min: 0, max: 1_000 },
  s2Lsr: { key: "s2lsr", default: EMPTY.labourStdRatePerHour, min: 0, max: 100_000_000 },
  s2Lah: { key: "s2lah", default: EMPTY.labourActHoursPerUnit, min: 0, max: 1_000 },
  s2Lar: { key: "s2lar", default: EMPTY.labourActRatePerHour, min: 0, max: 100_000_000 },
  s2Voh: { key: "s2voh", default: EMPTY.variableOverheadPerUnit, min: 0, max: 100_000_000 },
  s2Bfoh: { key: "s2bfoh", default: EMPTY.budgetedFixedOverhead, min: 0, max: 1_000_000_000 },
  s2Afoh: { key: "s2afoh", default: EMPTY.actualFixedOverhead, min: 0, max: 1_000_000_000 },
  s2Bu: { key: "s2bu", default: EMPTY.budgetedUnits, min: 0, max: 10_000_000 },
  s2Au: { key: "s2au", default: EMPTY.actualUnits, min: 0, max: 10_000_000 },
  s2Sp: { key: "s2sp", default: EMPTY.sellingPricePerUnit, min: 0, max: 100_000_000 },

  s3Label: { key: "s3l", default: EMPTY.label },
  s3Msq: { key: "s3msq", default: EMPTY.materialStdQtyPerUnit, min: 0, max: 1_000 },
  s3Msp: { key: "s3msp", default: EMPTY.materialStdPricePerUnit, min: 0, max: 100_000_000 },
  s3Maq: { key: "s3maq", default: EMPTY.materialActQtyPerUnit, min: 0, max: 1_000 },
  s3Map: { key: "s3map", default: EMPTY.materialActPricePerUnit, min: 0, max: 100_000_000 },
  s3Lsh: { key: "s3lsh", default: EMPTY.labourStdHoursPerUnit, min: 0, max: 1_000 },
  s3Lsr: { key: "s3lsr", default: EMPTY.labourStdRatePerHour, min: 0, max: 100_000_000 },
  s3Lah: { key: "s3lah", default: EMPTY.labourActHoursPerUnit, min: 0, max: 1_000 },
  s3Lar: { key: "s3lar", default: EMPTY.labourActRatePerHour, min: 0, max: 100_000_000 },
  s3Voh: { key: "s3voh", default: EMPTY.variableOverheadPerUnit, min: 0, max: 100_000_000 },
  s3Bfoh: { key: "s3bfoh", default: EMPTY.budgetedFixedOverhead, min: 0, max: 1_000_000_000 },
  s3Afoh: { key: "s3afoh", default: EMPTY.actualFixedOverhead, min: 0, max: 1_000_000_000 },
  s3Bu: { key: "s3bu", default: EMPTY.budgetedUnits, min: 0, max: 10_000_000 },
  s3Au: { key: "s3au", default: EMPTY.actualUnits, min: 0, max: 10_000_000 },
  s3Sp: { key: "s3sp", default: EMPTY.sellingPricePerUnit, min: 0, max: 100_000_000 },

  s4Label: { key: "s4l", default: EMPTY.label },
  s4Msq: { key: "s4msq", default: EMPTY.materialStdQtyPerUnit, min: 0, max: 1_000 },
  s4Msp: { key: "s4msp", default: EMPTY.materialStdPricePerUnit, min: 0, max: 100_000_000 },
  s4Maq: { key: "s4maq", default: EMPTY.materialActQtyPerUnit, min: 0, max: 1_000 },
  s4Map: { key: "s4map", default: EMPTY.materialActPricePerUnit, min: 0, max: 100_000_000 },
  s4Lsh: { key: "s4lsh", default: EMPTY.labourStdHoursPerUnit, min: 0, max: 1_000 },
  s4Lsr: { key: "s4lsr", default: EMPTY.labourStdRatePerHour, min: 0, max: 100_000_000 },
  s4Lah: { key: "s4lah", default: EMPTY.labourActHoursPerUnit, min: 0, max: 1_000 },
  s4Lar: { key: "s4lar", default: EMPTY.labourActRatePerHour, min: 0, max: 100_000_000 },
  s4Voh: { key: "s4voh", default: EMPTY.variableOverheadPerUnit, min: 0, max: 100_000_000 },
  s4Bfoh: { key: "s4bfoh", default: EMPTY.budgetedFixedOverhead, min: 0, max: 1_000_000_000 },
  s4Afoh: { key: "s4afoh", default: EMPTY.actualFixedOverhead, min: 0, max: 1_000_000_000 },
  s4Bu: { key: "s4bu", default: EMPTY.budgetedUnits, min: 0, max: 10_000_000 },
  s4Au: { key: "s4au", default: EMPTY.actualUnits, min: 0, max: 10_000_000 },
  s4Sp: { key: "s4sp", default: EMPTY.sellingPricePerUnit, min: 0, max: 100_000_000 },
} satisfies Schema;

type Values = ValuesOf<typeof schema>;

const SCENARIO_KEYS = [1, 2, 3, 4] as const;
type Index = (typeof SCENARIO_KEYS)[number];

function fieldNames(i: Index) {
  const p = `s${i}` as const;
  return {
    label: `${p}Label`,
    materialStdQtyPerUnit: `${p}Msq`,
    materialStdPricePerUnit: `${p}Msp`,
    materialActQtyPerUnit: `${p}Maq`,
    materialActPricePerUnit: `${p}Map`,
    labourStdHoursPerUnit: `${p}Lsh`,
    labourStdRatePerHour: `${p}Lsr`,
    labourActHoursPerUnit: `${p}Lah`,
    labourActRatePerHour: `${p}Lar`,
    variableOverheadPerUnit: `${p}Voh`,
    budgetedFixedOverhead: `${p}Bfoh`,
    actualFixedOverhead: `${p}Afoh`,
    budgetedUnits: `${p}Bu`,
    actualUnits: `${p}Au`,
    sellingPricePerUnit: `${p}Sp`,
  } as const satisfies Record<keyof CostSheetScenario, keyof Values>;
}

function getScenario(values: Values, i: Index): CostSheetScenario {
  const f = fieldNames(i);
  return {
    label: String(values[f.label]),
    materialStdQtyPerUnit: values[f.materialStdQtyPerUnit],
    materialStdPricePerUnit: values[f.materialStdPricePerUnit],
    materialActQtyPerUnit: values[f.materialActQtyPerUnit],
    materialActPricePerUnit: values[f.materialActPricePerUnit],
    labourStdHoursPerUnit: values[f.labourStdHoursPerUnit],
    labourStdRatePerHour: values[f.labourStdRatePerHour],
    labourActHoursPerUnit: values[f.labourActHoursPerUnit],
    labourActRatePerHour: values[f.labourActRatePerHour],
    variableOverheadPerUnit: values[f.variableOverheadPerUnit],
    budgetedFixedOverhead: values[f.budgetedFixedOverhead],
    actualFixedOverhead: values[f.actualFixedOverhead],
    budgetedUnits: values[f.budgetedUnits],
    actualUnits: values[f.actualUnits],
    sellingPricePerUnit: values[f.sellingPricePerUnit],
  };
}

function formatUnits(n: number, fallback = "—"): string {
  if (!Number.isFinite(n)) return fallback;
  return Math.round(n).toLocaleString("en-IN");
}

function formatBreakEvenRevenue(n: number): string {
  if (!Number.isFinite(n)) return "Not reachable";
  return formatINR(n);
}

function formatVariance(n: number): string {
  if (!Number.isFinite(n) || n === 0) return `${formatINR(n)}`;
  return `${formatINR(Math.abs(n))} ${n > 0 ? "F" : "A"}`;
}

export function CostSheetPage() {
  const { values, setField, reset, shareUrl } = useCalculatorState(schema);
  const n = Math.min(4, Math.max(2, values.n)) as 2 | 3 | 4;

  const setScenario = <K extends keyof CostSheetScenario>(
    i: Index,
    field: K,
    value: CostSheetScenario[K],
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
      scenarios.map(({ index, values: s }) => ({
        index,
        label: s.label || `Product ${index}`,
        input: s,
        result: computeCostSheet(s),
      })),
    [scenarios],
  );

  const columnLabels = results.map((r) => r.label);

  const beRows: CompareRow[] = [
    {
      label: "Contribution / unit",
      tone: "mine",
      better: "max",
      values: results.map((r) => r.result.contributionPerUnit),
      format: formatINR,
    },
    {
      label: "Break-even output",
      better: "min",
      values: results.map((r) => r.result.breakEvenUnits),
      format: (v) => formatUnits(v, "Not reachable"),
    },
    {
      label: "Break-even revenue",
      better: "min",
      values: results.map((r) => r.result.breakEvenRevenue),
      format: formatBreakEvenRevenue,
    },
    {
      label: "Margin of safety",
      values: results.map((r) => r.result.marginOfSafetyUnits),
      format: formatUnits,
    },
    {
      label: "Margin of safety, %",
      better: "max",
      values: results.map((r) => r.result.marginOfSafetyPct),
      format: (v) => formatPercent(v, 1),
    },
    {
      label: "Profit at budgeted output",
      tone: "accent",
      values: results.map((r) => r.result.budgetedProfit),
      format: formatINR,
    },
    {
      label: "Profit at actual output",
      strong: true,
      better: "max",
      values: results.map((r) => r.result.actualProfit),
      format: formatINR,
    },
  ];

  const varianceRows: CompareRow[] = [
    {
      label: "Material price variance",
      values: results.map((r) => r.result.materialPriceVariance),
      format: formatVariance,
    },
    {
      label: "Material usage variance",
      values: results.map((r) => r.result.materialUsageVariance),
      format: formatVariance,
    },
    {
      label: "Material cost variance",
      strong: true,
      values: results.map((r) => r.result.materialCostVariance),
      format: formatVariance,
    },
    {
      label: "Labour rate variance",
      values: results.map((r) => r.result.labourRateVariance),
      format: formatVariance,
    },
    {
      label: "Labour efficiency variance",
      values: results.map((r) => r.result.labourEfficiencyVariance),
      format: formatVariance,
    },
    {
      label: "Labour cost variance",
      strong: true,
      values: results.map((r) => r.result.labourCostVariance),
      format: formatVariance,
    },
    {
      label: "Fixed OH expenditure variance",
      values: results.map((r) => r.result.fixedOverheadExpenditureVariance),
      format: formatVariance,
    },
    {
      label: "Fixed OH volume variance",
      values: results.map((r) => r.result.fixedOverheadVolumeVariance),
      format: formatVariance,
    },
    {
      label: "Fixed OH cost variance",
      strong: true,
      values: results.map((r) => r.result.fixedOverheadCostVariance),
      format: formatVariance,
    },
    {
      label: "Total cost variance",
      strong: true,
      tone: "mine",
      better: "max",
      values: results.map((r) => r.result.totalCostVariance),
      format: formatVariance,
    },
  ];

  const [chartKey, setChartKey] = useState<string>("1");
  useEffect(() => {
    if (Number(chartKey) > n) setChartKey("1");
  }, [n, chartKey]);
  const chartIndex = Math.min(n, Math.max(1, Number(chartKey) || 1));
  const selected =
    results.find((r) => r.index === chartIndex) ?? results[0];

  const series = useMemo(
    () => breakEvenSeries(selected.input, selected.result, 48),
    [selected.input, selected.result],
  );
  const seriesMax = series[series.length - 1]?.units ?? 1;

  const [scrub, setScrub] = useState(() =>
    Number.isFinite(selected.result.breakEvenUnits) ? Math.round(selected.result.breakEvenUnits) : 0,
  );
  useEffect(() => {
    setScrub(
      Number.isFinite(selected.result.breakEvenUnits)
        ? Math.round(selected.result.breakEvenUnits)
        : 0,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected.index, selected.result.breakEvenUnits]);

  const point =
    series.reduce(
      (closest, p) => (Math.abs(p.units - scrub) < Math.abs(closest.units - scrub) ? p : closest),
      series[0],
    ) ?? { units: 0, cost: 0, revenue: 0 };
  const profitAtScrub = point.revenue - point.cost;

  const excel = async () => {
    const { exportXlsx } = await import("@/lib/xlsx");
    exportXlsx({
      filename: "cost-sheet",
      title: "Cost Sheet & Break-Even Report",
      meta: [
        ["Products compared", n],
        ["Share link", shareUrl()],
      ],
      table: {
        head: ["Metric", ...columnLabels],
        body: [...beRows, ...varianceRows].map((row) => [
          row.label,
          ...row.values.map((v) => row.format(v)),
        ]),
      },
    });
  };

  const pdf = async () => {
    const { exportPdf } = await import("@/lib/pdf");
    const best = results.reduce((a, b) => (a.result.actualProfit > b.result.actualProfit ? a : b));
    exportPdf({
      filename: "cost-sheet",
      eyebrow: "Costing · break-even",
      title: "Cost Sheet & Break-Even Report",
      meta: [`${n} product${n > 1 ? "s" : ""} compared · standard-costing variance analysis`],
      hero: {
        label: "Highest profit at actual output",
        value: `${best.label} — ${formatINR(best.result.actualProfit)}`,
      },
      chart: {
        title: `Break-even — ${selected.label}`,
        xLabel: "units",
        xValues: series.map((p) => p.units),
        series: [
          {
            key: "cost",
            label: "Total cost",
            tone: "accent",
            kind: "line",
            values: series.map((p) => p.cost),
          },
          {
            key: "revenue",
            label: "Total revenue",
            tone: "mine",
            kind: "area",
            values: series.map((p) => p.revenue),
          },
        ],
      },
      metrics: [
        {
          title: "Break-even & profitability",
          rows: beRows.map((row): [string, string] => [
            row.label,
            row.values.map((v) => row.format(v)).join(" · "),
          ]),
        },
        {
          title: "Variance analysis",
          rows: varianceRows.map((row): [string, string] => [
            row.label,
            row.values.map((v) => row.format(v)).join(" · "),
          ]),
        },
      ],
      table: {
        title: "Full comparison",
        head: ["Metric", ...columnLabels],
        body: [...beRows, ...varianceRows].map((row) => [
          row.label,
          ...row.values.map((v) => row.format(v)),
        ]),
      },
      shareUrl: shareUrl(),
    });
  };

  return (
    <CalculatorShell
      title="Cost sheet & break-even"
      intro="Material, labour and overheads in, and a standard-costing break-even chart and variance analysis come out — line up up to four products side by side."
      inputs={
        <>
          <div className="space-y-6">
            {active.map((i) => (
              <CostSheetInputGroup
                key={i}
                index={i}
                values={getScenario(values, i)}
                onChange={(field, value) => setScenario(i, field, value)}
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
            + Add product
          </Button>
        </>
      }
      results={
        <Reveal className="space-y-7">
          <Zone eyebrow="Break-even & profitability">
            <CompareTable columnLabels={columnLabels} rows={beRows} />
          </Zone>

          <Zone eyebrow="Variance analysis" aside={<span className="text-[0.75rem] text-graphite">F = favorable · A = adverse</span>}>
            <CompareTable columnLabels={columnLabels} rows={varianceRows} />
          </Zone>

          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-ink">Break-even chart</h3>
              {n > 1 && (
                <SegmentedControl
                  label="Chart for"
                  value={chartKey}
                  onChange={setChartKey}
                  options={active.map((i) => ({ value: String(i), label: columnLabels[i - 1] }))}
                />
              )}
            </div>
            <TimePlot
              title={`Cost vs revenue — ${selected.label}`}
              data={series}
              xKey="units"
              xUnit="units produced / sold"
              series={[
                { key: "cost", label: "Total cost", tone: "accent", kind: "line" },
                { key: "revenue", label: "Total revenue", tone: "mine", kind: "area" },
              ]}
              scrub={scrub}
              onScrub={setScrub}
              scrubMin={0}
              scrubMax={seriesMax}
              scrubStep={Math.max(1, Math.round(seriesMax / 200))}
              readout={
                <>
                  <span className="text-graphite">{formatUnits(point.units)} units</span>
                  <span>cost {formatINR(point.cost)}</span>
                  <span>revenue {formatINR(point.revenue)}</span>
                  <span className={profitAtScrub >= 0 ? "text-mine" : "text-accent-2"}>
                    {profitAtScrub >= 0 ? "profit" : "loss"} {formatINR(Math.abs(profitAtScrub))}
                  </span>
                </>
              }
            />
          </div>

          <Callout>
            Variable overhead is assumed identical between standard and actual, so only
            material, labour and fixed overhead carry a price/rate-and-usage split. Break-even
            uses standard (planned) costs; profit at actual output uses the actual figures.
          </Callout>

          <ExportBar getShareUrl={shareUrl} onExcel={excel} onPdf={pdf} onReset={reset} />
        </Reveal>
      }
      belowFold={
        <Zone eyebrow="The formulas">
          <div className="max-w-2xl space-y-3 text-sm leading-relaxed text-ink-2">
            <p>
              <span className="font-semibold text-ink">Contribution per unit</span> = selling
              price − standard variable cost per unit (material + labour + variable overhead).{" "}
              <span className="font-semibold text-ink">Break-even units</span> = budgeted fixed
              overhead ÷ contribution per unit.
            </p>
            <p>
              <span className="font-semibold text-ink">Material price variance</span> = (standard
              price − actual price) × actual quantity ×  output; the{" "}
              <span className="font-semibold text-ink">usage variance</span> = (standard quantity
              − actual quantity) × standard price × output. Labour splits the same way into rate
              and efficiency variances. Positive is favorable, negative is adverse — all computed
              against the actual output achieved, per CMA standard-costing convention.
            </p>
            <p>
              <span className="font-semibold text-ink">Fixed overhead expenditure variance</span>{" "}
              = budgeted overhead − actual overhead. The{" "}
              <span className="font-semibold text-ink">volume variance</span> = (actual output −
              budgeted output) × standard overhead rate per unit.
            </p>
          </div>
        </Zone>
      }
    />
  );
}
