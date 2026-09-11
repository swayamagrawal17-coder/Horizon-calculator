"use client";

import { useId } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompactINR, formatINR } from "@/lib/format";

export interface PlotSeries {
  key: string;
  label: string;
  tone: "mine" | "accent";
  kind: "area" | "line";
  /** Stack areas together when true. */
  stackId?: string;
}

interface Props<Row extends object> {
  data: Row[];
  title: string;
  xKey: keyof Row & string;
  xUnit: string;
  series: PlotSeries[];
  scrub: number;
  onScrub: (x: number) => void;
  scrubMin: number;
  scrubMax: number;
  scrubStep: number;
  readout: React.ReactNode;
}

const toneVar = (t: PlotSeries["tone"]) =>
  t === "mine" ? "rgb(var(--mine))" : "rgb(var(--accent))";

export function TimePlot<Row extends object>({
  data,
  title,
  xKey,
  xUnit,
  series,
  scrub,
  onScrub,
  scrubMin,
  scrubMax,
  scrubStep,
  readout,
}: Props<Row>) {
  const gradId = useId().replace(/:/g, "");
  const xs = data.map((d) => d[xKey] as number);
  const xMax = Math.max(...xs);
  const xMin = Math.min(...xs);
  const ticks = buildTicks(xMin, xMax);
  const labelOf = Object.fromEntries(series.map((s) => [s.key, s.label]));

  return (
    <figure className="m-0">
      <figcaption className="flex items-center justify-between">
        <span className="eyebrow">{title}</span>
        <span className="font-mono text-[0.7rem] text-graphite">
          x · {xUnit}
        </span>
      </figcaption>

      <div className="mt-2 h-56 w-full sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: 4 }}>
            <defs>
              {series.map((s) => (
                <linearGradient
                  key={s.key}
                  id={`${gradId}-${s.key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={toneVar(s.tone)} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={toneVar(s.tone)} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid stroke="rgb(var(--grid) / 0.12)" strokeWidth={1} />
            <XAxis
              dataKey={xKey}
              type="number"
              domain={[xMin, xMax]}
              ticks={ticks}
              tickLine={false}
              axisLine={{ stroke: "rgb(var(--rule-strong))" }}
              tick={{
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                fill: "rgb(var(--graphite))",
              }}
            />
            <YAxis
              width={52}
              tickCount={4}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => formatCompactINR(v)}
              tick={{
                fontSize: 10,
                fontFamily: "var(--font-mono)",
                fill: "rgb(var(--graphite))",
              }}
            />

            <Tooltip
              cursor={{ stroke: "rgb(var(--rule-strong))" }}
              contentStyle={{
                background: "rgb(var(--paper))",
                border: "1px solid rgb(var(--ink))",
                borderRadius: 2,
                fontFamily: "var(--font-mono)",
                fontSize: 12,
              }}
              labelStyle={{ color: "rgb(var(--graphite))" }}
              labelFormatter={(v) => `${xUnit} — ${Number(v).toFixed(2)}`}
              formatter={(value: number, name: string) => [
                formatINR(value),
                labelOf[name] ?? name,
              ]}
            />

            {series.map((s) =>
              s.kind === "area" ? (
                <Area
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.key}
                  stackId={s.stackId}
                  stroke={toneVar(s.tone)}
                  strokeWidth={1.75}
                  fill={`url(#${gradId}-${s.key})`}
                  isAnimationActive={false}
                  dot={false}
                  activeDot={{ r: 3, strokeWidth: 0 }}
                />
              ) : (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.key}
                  stroke={toneVar(s.tone)}
                  strokeWidth={1.75}
                  strokeDasharray="5 3"
                  isAnimationActive={false}
                  dot={false}
                  activeDot={{ r: 3, strokeWidth: 0 }}
                />
              ),
            )}

            <ReferenceLine x={scrub} stroke="rgb(var(--ink))" strokeWidth={1.25} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <label className="mt-1 block">
        <span className="sr-only">
          Move the valuation point along the {xUnit} axis
        </span>
        <input
          type="range"
          min={scrubMin}
          max={scrubMax}
          step={scrubStep}
          value={scrub}
          onChange={(e) => onScrub(Number(e.target.value))}
        />
      </label>

      <p
        aria-live="polite"
        className="rule-t mt-2 flex flex-wrap items-baseline gap-x-6 gap-y-1 pt-2 font-mono text-[0.8rem] tnum"
      >
        {readout}
      </p>

      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
        {series.map((s) => (
          <li
            key={s.key}
            className="flex items-center gap-2 text-[0.78rem] text-graphite"
          >
            <span
              aria-hidden
              className="inline-block h-0.5 w-4"
              style={{
                background: toneVar(s.tone),
                ...(s.kind === "line"
                  ? {
                      height: 0,
                      borderTop: `2px dashed ${toneVar(s.tone)}`,
                    }
                  : { height: "10px" }),
              }}
            />
            {s.label}
          </li>
        ))}
      </ul>
    </figure>
  );
}

function buildTicks(min: number, max: number): number[] {
  const span = max - min;
  const step = span <= 6 ? 1 : span <= 15 ? 2 : span <= 30 ? 5 : 10;
  const out: number[] = [];
  for (let t = Math.ceil(min); t <= Math.floor(max); t += step) out.push(t);
  return out.length ? out : [Math.round(min), Math.round(max)];
}
