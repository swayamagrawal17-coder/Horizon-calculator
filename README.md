# Horizon — EMI, Future Value & Present Value

A static Next.js app with three linked financial calculators, built around one idea:
money changes value over its horizon. Each calculator draws that movement as a
balance-over-time plot with a draggable valuation point, alongside an amortization
schedule, a black/red split of principal vs cost, dark mode, and shareable result URLs
with CSV / PDF export.

**Identity:** a double-entry ledger — warm paper, black ink for money that is yours,
red ink for what it costs you. Figures set in Newsreader; columns and controls in
IBM Plex Mono.

## Calculators

| Route | What it does |
| --- | --- |
| `/` | **EMI** on a reducing-balance loan, plus an optional **step-up EMI** plan that raises the instalment on a schedule and shows the tenure / interest saved versus a standard EMI. |
| `/future-value` | **Future value** of a lump sum plus recurring contributions (annuity), with a compounding-frequency selector and end/start-of-period timing. |
| `/present-value` | **Present value** of a future amount plus recurring future payments, discounted at a chosen rate. |

## Formulas (`lib/finance.ts`)

- EMI: `E = P·r·(1+r)^n / ((1+r)^n − 1)`, `r` = monthly rate, `n` = months (`r = 0 → P/n`).
- Step-up EMI: month-by-month simulation; EMI × `(1 + stepUpPct/100)` every `stepEveryMonths`, run until the balance clears.
- Future value: `PV·(1+i)^n` + `PMT·[((1+i)^n − 1)/i]` (× `(1+i)` for start-of-period).
- Present value: `FV/(1+i)^n` + `PMT·[1 − (1+i)^−n]/i` (× `(1+i)` for start-of-period).

Results are indicative estimates, not financial advice.

## Commands

```bash
npm install
npm run dev        # dev server on :3000
npm test           # Vitest unit tests for lib/finance.ts
npm run build      # static export to ./out
npx serve out      # preview the production export
```

## Stack

Next.js 15 (App Router, `output: "export"`) · TypeScript · Tailwind CSS · Recharts ·
next-themes · jsPDF. Fonts: Newsreader / IBM Plex Sans / IBM Plex Mono via `next/font`.
No backend — all input state lives in the URL query string.

## Structure

- `lib/finance.ts` — pure, unit-tested calculation core (EMI, step-up, TVM, plot series)
- `lib/format.ts` — Indian-format currency / tenure helpers
- `lib/urlState.ts` + `hooks/useCalculatorState.ts` — inputs ⇄ URL sync (debounced)
- `lib/csv.ts`, `lib/pdf.ts` — exports
- `components/calculator/*` — shared kit: `SliderField`, `TimePlot` (the scrubbable
  hero chart), `ScheduleTable`, `ResultRow` / `HeroFigure` / `SplitBar`, `ExportBar`
- `app/*/page.tsx` — one thin client page per calculator

## Brand assets

Mark: a half-sun rising over a horizon rule — red sun, ink rule, one symbol at every size.

- `app/icon.svg` — favicon (theme-aware via `prefers-color-scheme`)
- `app/apple-icon.tsx` — 180×180 apple-touch-icon, generated at build from the same mark
- `public/horizon-logo.svg` / `-dark.svg` — full wordmark lockup (needs Newsreader; falls back to Georgia)
- `public/horizon-logo-arc.svg` / `-arc-dark.svg` — the earlier growth-curve mark, kept as an alternate
