"use client";

import { useState } from "react";
import { siteConfig } from "@/site.config";
import { shortAddr } from "@/lib/format";
import { ICheck, ICopy } from "./Icons";

export function CopyCA({ full = false, className = "" }: { full?: boolean; className?: string }) {
  const ca = siteConfig.ca.trim();
  const [done, setDone] = useState(false);

  if (!ca)
    return (
      <span className={`inline-flex items-center gap-2 rounded-lg border border-line bg-panel2 px-3 py-1.5 font-mono text-[11px] text-mute ${className}`}>
        CA: <span className="text-fire">not set</span>
      </span>
    );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(ca);
    } catch {
      const t = document.createElement("textarea");
      t.value = ca;
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      t.remove();
    }
    setDone(true);
    setTimeout(() => setDone(false), 1600);
  };

  return (
    <button
      onClick={copy}
      title="Copy contract address"
      className={`group inline-flex min-w-0 items-center gap-2 rounded-lg border border-line bg-panel2 px-3 py-1.5 font-mono text-[11px] text-mute transition hover:border-fire/60 hover:text-ink ${className}`}
    >
      <span className="shrink-0">CA:</span>
      <span className={`truncate ${full ? "" : ""} text-ink`}>{full ? ca : shortAddr(ca, 5, 4)}</span>
      {done ? <ICheck className="h-3.5 w-3.5 shrink-0 text-buy" /> : <ICopy className="h-3.5 w-3.5 shrink-0 group-hover:text-fire" />}
      <span className="sr-only">{done ? "Copied" : "Copy"}</span>
    </button>
  );
}
