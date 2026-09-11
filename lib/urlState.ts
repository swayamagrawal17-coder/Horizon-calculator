export type FieldValue = number | string | boolean;

export interface FieldConfig<V extends FieldValue = FieldValue> {
  default: V;
  /** URL query key. Keep short. */
  key: string;
  min?: number;
  max?: number;
  step?: number;
}

export type Schema = Record<string, FieldConfig>;

type Widen<T> = T extends boolean
  ? boolean
  : T extends number
    ? number
    : T extends string
      ? string
      : T;

export type ValuesOf<S extends Schema> = {
  [K in keyof S]: Widen<S[K]["default"]>;
};

function coerce(raw: string, sample: FieldValue): FieldValue {
  if (typeof sample === "number") {
    const n = Number(raw);
    return Number.isFinite(n) ? n : sample;
  }
  if (typeof sample === "boolean") return raw === "1" || raw === "true";
  return raw;
}

export function decodeValues<S extends Schema>(
  schema: S,
  params: URLSearchParams,
): ValuesOf<S> {
  const out = {} as ValuesOf<S>;
  for (const name in schema) {
    const field = schema[name];
    const raw = params.get(field.key);
    let value: FieldValue =
      raw === null ? field.default : coerce(raw, field.default);
    if (typeof value === "number") {
      if (field.min !== undefined && value < field.min) value = field.min;
      if (field.max !== undefined && value > field.max) value = field.max;
    }
    out[name] = value as ValuesOf<S>[typeof name];
  }
  return out;
}

export function encodeValues<S extends Schema>(
  schema: S,
  values: ValuesOf<S>,
): URLSearchParams {
  const params = new URLSearchParams();
  for (const name in schema) {
    const field = schema[name];
    const value = values[name];
    if (value === field.default) continue; // keep URLs clean
    if (typeof value === "boolean") params.set(field.key, value ? "1" : "0");
    else params.set(field.key, String(value));
  }
  return params;
}
