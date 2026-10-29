"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { getLaunches, type Launch } from "@/lib/launches";
import { ago, compact, shortAddr } from "@/lib/format";
import { IExt } from "../Icons";

export function MyLaunches({ refresh }: { refresh: number }) {
  const { publicKey } = useWallet();
  const [list, setList] = useState<Launch[]>([]);
  const [mc, setMc] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!publicKey) return setList([]);
    setList(getLaunches(publicKey.toBase58()));
  }, [publicKey, refresh]);

  useEffect(() => {
    if (!list.length) return;
    const mints = list.slice(0, 30).map((l) => l.mint).join(",");
    fetch(`https://api.dexscreener.com/latest/dex/tokens/${mints}`)
      .then((r) => r.json())
      .then((j) => {
        const out: Record<string, number> = {};
        for (const p of j?.pairs ?? []) {
          const m = p.baseToken?.address;
          const v = Number(p.marketCap || p.fdv || 0);
          if (m && v > (out[m] ?? 0)) out[m] = v;
        }
        setMc(out);
      })
      .catch(() => {});
  }, [list]);

  if (!publicKey) return null;

  return (
    <section id="my-launches" className="border-b border-line">
      <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="label text-fire">Your jungle</div>
            <h2 className="mt-2 font-display text-[26px] font-bold">My launches</h2>
          </div>
          <span className="font-mono text-[11px] text-mute">{shortAddr(publicKey.toBase58(), 4, 4)}</span>
        </div>
        {list.length === 0 ? (
          <div className="panel mt-6 p-8 text-center font-mono text-[12px] text-mute">No launches from this wallet yet. Your coins show up here after liftoff.</div>
        ) : (
          <div className="panel mt-6 overflow-hidden">
            {list.map((l) => (
              <div key={l.mint} className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-line/60 px-5 py-4 last:border-0 sm:grid-cols-[1.4fr_1fr_.8fr_auto]">
                <div className="min-w-0">
                  <div className="truncate font-display text-[15px] font-bold">
                    {l.name} <span className="font-mono text-[12px] text-fire">${l.symbol}</span>
                  </div>
                  <div className="font-mono text-[10.5px] text-mute">{shortAddr(l.mint, 6, 4)}</div>
                </div>
                <div className="hidden font-mono text-[12px] sm:block">{mc[l.mint] ? compact(mc[l.mint]) : <span className="text-mute">indexing…</span>}</div>
                <div className="hidden font-mono text-[11px] text-mute sm:block">{ago(l.ts)} ago</div>
                <div className="flex items-center gap-3">
                  <a href={`/proof/${l.mint}?tx=${l.sig}${l.burnSig ? `&burn=${l.burnSig}` : ""}`} className="font-mono text-[11px] text-buy">
                    Ape Proof
                  </a>
                  <a href={`https://pump.fun/coin/${l.mint}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 font-mono text-[11px] text-fire">
                    pump.fun <IExt className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
