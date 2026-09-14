import { forwardRef, useRef } from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "ink" | "outline" | "ghost";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ className = "", variant = "outline", ...props }, ref) {
    const base =
      "focusable inline-flex min-h-[40px] items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-40";
    const styles = {
      ink: "bg-mine text-paper-2 hover:opacity-90",
      outline: "border border-rule-strong text-ink hover:border-mine hover:text-mine",
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
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex gap-0.5 rounded-full border border-rule bg-paper p-1"
    >
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
            className={`focusable min-h-[32px] rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              checked ? "bg-paper-2 text-ink shadow-sm" : "text-graphite hover:text-ink"
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
        className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors ${
          checked ? "border-mine bg-mine" : "border-rule-strong bg-paper"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-paper-2 shadow-sm transition-all ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}

/** A labeled subsection within a card. */
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
        <div className="mb-4 flex items-center justify-between gap-4">
          {eyebrow && <h3 className="text-sm font-semibold text-ink">{eyebrow}</h3>}
          {aside}
        </div>
      )}
      {children}
    </section>
  );
}
