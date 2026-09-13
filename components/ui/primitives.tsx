import { forwardRef, useRef } from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "ink" | "outline" | "ghost";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ className = "", variant = "outline", ...props }, ref) {
    const base =
      "focusable inline-flex min-h-[40px] items-center justify-center gap-2 rounded-sm px-3.5 py-2 font-mono text-xs uppercase tracking-wider transition-colors disabled:opacity-40";
    const styles = {
      ink: "bg-ink text-paper hover:bg-accent",
      outline: "border border-rule-strong text-ink hover:border-ink",
      ghost: "text-graphite hover:text-ink",
    }[variant];
    return (
      <button ref={ref} className={`${base} ${styles} ${className}`} {...props} />
    );
  },
);

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: string;
  onChange: (v: T) => void;
  label: string;
}) {
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const move = (fromIndex: number, delta: number) => {
    const nextIndex = (fromIndex + delta + options.length) % options.length;
    onChange(options[nextIndex].value);
    buttonRefs.current[nextIndex]?.focus();
  };

  return (
    <div role="radiogroup" aria-label={label} className="flex">
      {options.map((opt, index) => {
        const checked = value === opt.value;
        return (
          <button
            key={opt.value}
            ref={(el) => {
              buttonRefs.current[index] = el;
            }}
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                e.preventDefault();
                move(index, 1);
              } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                e.preventDefault();
                move(index, -1);
              }
            }}
            className={`focusable min-h-[40px] border-y border-r border-rule-strong px-2.5 py-1 font-mono text-[0.72rem] uppercase tracking-wider transition-colors first:rounded-l-sm first:border-l last:rounded-r-sm ${
              checked ? "bg-ink text-paper" : "text-graphite hover:text-ink"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="focusable -mx-1 flex min-h-[44px] w-full items-center justify-between gap-3 px-1"
    >
      <span className="text-[0.82rem] font-medium text-ink">{label}</span>
      <span
        aria-hidden
        className={`relative h-5 w-9 shrink-0 rounded-sm border transition-colors ${
          checked ? "border-ink bg-ink" : "border-rule-strong bg-paper"
        }`}
      >
        <span
          className={`absolute top-0.5 h-3.5 w-3.5 rounded-[1px] transition-all ${
            checked ? "left-[18px] bg-paper" : "left-0.5 bg-rule-strong"
          }`}
        />
      </span>
    </button>
  );
}

/** A ruled block that separates a zone of the worksheet. */
export function Zone({
  eyebrow,
  aside,
  children,
  className = "",
}: {
  eyebrow?: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      {(eyebrow || aside) && (
        <div className="rule-b mb-5 flex items-center justify-between gap-4 pb-2">
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          {aside}
        </div>
      )}
      {children}
    </section>
  );
}
