"use client";

import { useState } from "react";

export function ProofSearch({ compact = false }: { compact?: boolean }) {
  const [v, setV] = useState("");
  const [bad, setBad] = useState(false);
  const go = () => {
    const ca = v.trim();
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(ca)) return setBad(true);
    window.location.href = `/proof/${ca}`;
  };
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        go();
      }}
      className={`flex w-full items-center gap-2 ${compact ? "max-w-[460px]" : ""}`}
    >
      <div className={`flex flex-1 items-center rounded-xl border bg-bg px-4 focus-within:border-fire/60 ${bad ? "border-sell/60" : "border-line"}`}>
        <span className="mr-2 text-mute">🔍</span>
        <input
          value={v}
          onChange={(e) => {
            setV(e.target.value);
            setBad(false);
          }}
          placeholder="Paste any pump.fun CA"
          className={`w-full bg-transparent font-mono outline-none placeholder:text-mute/60 ${compact ? "py-2.5 text-[12px]" : "py-4 text-[13.5px]"}`}
        />
      </div>
      <button type="submit" className={compact ? "rounded-xl bg-fire px-4 py-2.5 font-mono text-[11px] font-bold uppercase text-bg" : "btn-fire !py-4"}>
        Check dev
      </button>
    </form>
  );
}
