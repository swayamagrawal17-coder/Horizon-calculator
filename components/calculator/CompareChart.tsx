"use client";

import {
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompactINR, formatINR } from "@/lib/format";

export interface ComparePoint {
  x: number;
  y: number;
}

export interface CompareSeries {
  label: string;
  data: ComparePoint[];
}

/** Every scenario draws in the primary blue, told apart by dash pattern rather than a new hue. */
const DASH_PATTERNS = ["0", "6 3", "2 2", "1 4"];

export function CompareChart({
  title,
  xLabel,
  series,
}: {
  title: string;
  xLabel: string;
  series: CompareSeries[];
}) {
  const maxX = Math.max(1, ...series.flatMap((s) => s.data.map((p) => p.x)));

  return (
    <figure className="m-0">
      <figcaption className="flex items-center justify-between">
        <span className="field-label">{title}</span>
        <span className="text-[0.75rem] text-graphite">x · {xLabel}</span>
      </figcaption>

      <div className="mt-2 h-56 w-full sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart margin={{ top: 8, right: 8, bottom: 4, left: 4 }}>
            <CartesianGrid stroke="rgb(var(--grid) / 0.12)" strokeWidth={1} />
            <XAxis
              type="number"
              dataKey="x"
              domain={[0, maxX]}
              tickLine={false}
              axisLine={{ stroke: "rgb(var(--rule-strong))" }}
              tick={{ fontSize: 11, fontFamily: "var(--font-sans)", fill: "rgb(var(--graphite))" }}
            />
            <YAxis
              width={52}
              tickCount={4}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => formatCompactINR(v)}
              tick={{ fontSize: 10, fontFamily: "var(--font-sans)", fill: "rgb(var(--graphite))" }}
            />
            <Tooltip
              cursor={{ stroke: "rgb(var(--rule-strong))" }}
              contentStyle={{
                background: "rgb(var(--paper-2))",
                border: "1px solid rgb(var(--rule-strong))",
                borderRadius: 10,
                fontFamily: "var(--font-sans)",
                fontSize: 12,
              }}
              labelStyle={{ color: "rgb(var(--graphite))" }}
              labelFormatter={(v) => `${xLabel} — ${Number(v).toFixed(2)}`}
              formatter={(value: number, name: string) => [formatINR(value), name]}
            />
            {series.map((s, i) => (
              <Line
                key={s.label}
                data={s.data}
                dataKey="y"
                name={s.label}
                type="monotone"
                stroke="rgb(var(--mine))"
                strokeWidth={1.75}
                strokeDasharray={DASH_PATTERNS[i % DASH_PATTERNS.length]}
                isAnimationActive={false}
                dot={false}
                activeDot={{ r: 3, strokeWidth: 0 }}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
        {series.map((s, i) => (
          <li key={s.label} className="flex items-center gap-2 text-[0.78rem] text-graphite">
            <svg width="18" height="8" aria-hidden>
              <line
                x1="0"
                y1="4"
                x2="18"
                y2="4"
                stroke="rgb(var(--mine))"
                strokeWidth="1.75"
                strokeDasharray={DASH_PATTERNS[i % DASH_PATTERNS.length]}
              />
            </svg>
            {s.label}
          </li>
        ))}
      </ul>
    </figure>
  );
}
