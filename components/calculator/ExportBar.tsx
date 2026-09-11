"use client";

import { useState } from "react";
import { Button } from "@/components/ui/primitives";

export function ExportBar({
  getShareUrl,
  onCsv,
  onPdf,
  onReset,
}: {
  getShareUrl: () => string;
  onCsv: () => void;
  onPdf: () => void;
  onReset: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copy this link", getShareUrl());
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button onClick={copy} variant="ink">
        {copied ? "Link copied" : "Copy link"}
      </Button>
      <Button onClick={onCsv}>CSV</Button>
      <Button onClick={onPdf}>PDF</Button>
      <Button onClick={onReset} variant="ghost" className="ml-auto">
        Reset
      </Button>
    </div>
  );
}
