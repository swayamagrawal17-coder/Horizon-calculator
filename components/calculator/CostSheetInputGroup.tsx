"use client";

import { useId, useState } from "react";
import { CompactField } from "@/components/calculator/CompactField";
import { Zone } from "@/components/ui/primitives";
import type { CostSheetScenario } from "@/components/pages/CostSheetPage";

export function CostSheetInputGroup({
  index,
  values,
  onChange,
  onRemove,
  canRemove,
}: {
  index: number;
  values: CostSheetScenario;
  onChange: <K extends keyof CostSheetScenario>(
    field: K,
    value: CostSheetScenario[K],
  ) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const labelId = useId();
  const [showActual, setShowActual] = useState(false);

  return (
    <Zone
      eyebrow={values.label || `Product ${index}`}
      className={index > 1 ? "border-t border-rule pt-6" : ""}
      aside={
        canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="focusable -m-1 inline-flex min-h-[40px] items-center p-1 text-xs text-graphite underline decoration-dotted underline-offset-4 hover:text-mine hover:decoration-solid"
          >
            Remove
          </button>
        )
      }
    >
      <div className="space-y-1">
        <div className="pb-2">
          <label htmlFor={labelId} className="text-[0.82rem] font-medium text-graphite">
            Name (optional)
          </label>
          <input
            id={labelId}
            type="text"
            value={values.label}
            onChange={(e) => onChange("label", e.target.value)}
            placeholder={`Product ${index}`}
            className="focusable mt-1 w-full border-b border-dashed border-rule-strong bg-transparent py-1 text-sm text-ink outline-none transition-colors placeholder:text-graphite focus:border-solid focus:border-mine hover:border-solid hover:border-mine"
          />
        </div>

        <p className="field-label pt-2">Material · standard</p>
        <CompactField
          label="Quantity per unit"
          value={values.materialStdQtyPerUnit}
          onChange={(v) => onChange("materialStdQtyPerUnit", v)}
          max={1_000}
          suffix="kg"
        />
        <CompactField
          label="Price per kg"
          value={values.materialStdPricePerUnit}
          onChange={(v) => onChange("materialStdPricePerUnit", v)}
          prefix="₹"
        />

        <p className="field-label pt-3">Labour · standard</p>
        <CompactField
          label="Hours per unit"
          value={values.labourStdHoursPerUnit}
          onChange={(v) => onChange("labourStdHoursPerUnit", v)}
          max={1_000}
          suffix="hr"
        />
        <CompactField
          label="Rate per hour"
          value={values.labourStdRatePerHour}
          onChange={(v) => onChange("labourStdRatePerHour", v)}
          prefix="₹"
        />

        <p className="field-label pt-3">Overheads &amp; volume</p>
        <CompactField
          label="Variable overhead / unit"
          value={values.variableOverheadPerUnit}
          onChange={(v) => onChange("variableOverheadPerUnit", v)}
          prefix="₹"
        />
        <CompactField
          label="Budgeted fixed overhead"
          value={values.budgetedFixedOverhead}
          onChange={(v) => onChange("budgetedFixedOverhead", v)}
          prefix="₹"
          max={1_000_000_000}
        />
        <CompactField
          label="Budgeted output"
          value={values.budgetedUnits}
          onChange={(v) => onChange("budgetedUnits", Math.round(v))}
          max={10_000_000}
          suffix="units"
        />

        <p className="field-label pt-3">Selling price</p>
        <CompactField
          label="Selling price / unit"
          value={values.sellingPricePerUnit}
          onChange={(v) => onChange("sellingPricePerUnit", v)}
          prefix="₹"
        />

        <div className="rule-t pt-3">
          <button
            type="button"
            onClick={() => setShowActual((s) => !s)}
            aria-expanded={showActual}
            className="focusable -m-1 inline-flex min-h-[40px] items-center p-1 text-xs text-mine underline decoration-dotted underline-offset-4 hover:decoration-solid"
          >
            {showActual ? "Hide actual figures" : "Actual figures (for variance)"}
          </button>

          {showActual && (
            <div className="mt-3 space-y-1">
              <p className="field-label">Material · actual</p>
              <CompactField
                label="Quantity per unit"
                value={values.materialActQtyPerUnit}
                onChange={(v) => onChange("materialActQtyPerUnit", v)}
                max={1_000}
                suffix="kg"
              />
              <CompactField
                label="Price per kg"
                value={values.materialActPricePerUnit}
                onChange={(v) => onChange("materialActPricePerUnit", v)}
                prefix="₹"
              />

              <p className="field-label pt-3">Labour · actual</p>
              <CompactField
                label="Hours per unit"
                value={values.labourActHoursPerUnit}
                onChange={(v) => onChange("labourActHoursPerUnit", v)}
                max={1_000}
                suffix="hr"
              />
              <CompactField
                label="Rate per hour"
                value={values.labourActRatePerHour}
                onChange={(v) => onChange("labourActRatePerHour", v)}
                prefix="₹"
              />

              <p className="field-label pt-3">Overheads &amp; output · actual</p>
              <CompactField
                label="Actual fixed overhead"
                value={values.actualFixedOverhead}
                onChange={(v) => onChange("actualFixedOverhead", v)}
                prefix="₹"
                max={1_000_000_000}
              />
              <CompactField
                label="Actual output"
                value={values.actualUnits}
                onChange={(v) => onChange("actualUnits", Math.round(v))}
                max={10_000_000}
                suffix="units"
              />
            </div>
          )}
        </div>
      </div>
    </Zone>
  );
}
