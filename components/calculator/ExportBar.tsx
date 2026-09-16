"use client";

import { useState } from "react";
import { Button } from "@/components/ui/primitives";

function Spinner() {
  return (
    <svg
      aria-hidden
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 12.5L9.5 18L20 6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ExportBar({
  getShareUrl,
  onExcel,
  onPdf,
  onReset,
}: {
  getShareUrl: () => string;
  onExcel: () => void | Promise<void>;
  onPdf: () => void | Promise<void>;
  onReset: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState<"excel" | "pdf" | null>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copy this link", getShareUrl());
    }
  };

  const run = async (which: "excel" | "pdf", fn: () => void | Promise<void>) => {
    setBusy(which);
    try {
      await fn();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button onClick={copy} variant="ink">
        <span
          aria-hidden
          className={`inline-flex shrink-0 overflow-hidden transition-all duration-200 ${copied ? "w-3.5 scale-100 opacity-100" : "w-0 scale-50 opacity-0"}`}
        >
          <CheckIcon />
        </span>
        {copied ? "Link copied" : "Copy link"}
      </Button>
      <Button onClick={() => run("excel", onExcel)} disabled={busy !== null}>
        {busy === "excel" && <Spinner />}
        Excel
      </Button>
      <Button onClick={() => run("pdf", onPdf)} disabled={busy !== null}>
        {busy === "pdf" && <Spinner />}
        PDF
      </Button>
      <Button onClick={onReset} variant="ghost" className="ml-auto">
        Reset
      </Button>
    </div>
  );
}
