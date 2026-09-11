"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  decodeValues,
  encodeValues,
  type Schema,
  type ValuesOf,
} from "@/lib/urlState";

/**
 * Holds calculator inputs and keeps them mirrored in the URL query string so
 * every result view is shareable. URL writes are debounced; state updates are
 * immediate so the UI never lags.
 */
export function useCalculatorState<S extends Schema>(schema: S) {
  const [values, setValues] = useState<ValuesOf<S>>(() => {
    if (typeof window === "undefined") {
      return decodeValues(schema, new URLSearchParams());
    }
    return decodeValues(schema, new URLSearchParams(window.location.search));
  });

  // Re-read once on mount in case of hydration with a different URL.
  const hydrated = useRef(false);
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    setValues(decodeValues(schema, new URLSearchParams(window.location.search)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!hydrated.current) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const qs = encodeValues(schema, values).toString();
      const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
      window.history.replaceState(null, "", url);
    }, 300);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  const setField = useCallback(
    <K extends keyof S>(name: K, value: ValuesOf<S>[K]) => {
      setValues((prev) => ({ ...prev, [name]: value }));
    },
    [],
  );

  const reset = useCallback(() => {
    setValues(decodeValues(schema, new URLSearchParams()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shareUrl = useCallback(() => {
    const qs = encodeValues(schema, values).toString();
    return `${window.location.origin}${window.location.pathname}${qs ? `?${qs}` : ""}`;
  }, [schema, values]);

  return { values, setField, reset, shareUrl };
}
