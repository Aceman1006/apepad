"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Connection } from "@solana/web3.js";
import { siteConfig } from "@/site.config";
import { ago, compact, price, shortAddr } from "@/lib/format";
import { buyLinks } from "@/lib/links";
import { buildProof, PUMP_SUPPLY, type Proof } from "@/lib/proof";
import { ProofSearch } from "./ProofSearch";
import { ICheck, ICopy, IExt } from "./Icons";

const SUFFIX = siteConfig.vanitySuffix;

const VERDICT: Record<Proof["status"], { label: string; emoji: string; line: string; cls: string }> = {
  HOLDING: { label: "DEV HOLDING", emoji: "💎", line: "The creator hasn't sold or moved a single token since launch.", cls: "border-buy/50 bg-buy/[.06] text-buy" },
  ADDED: { label: "DEV ADDED MORE", emoji: "🦍", line: "The creator holds more than they bought at launch.", cls: "border-buy/50 bg-buy/[.06] text-buy" },
  TRIMMED: { label: "DEV TRIMMED", emoji: "⚠️", line: "The creator sold or moved part of their launch bag.", cls: "border-fire/50 bg-fire/[.06] text-fire" },
  SOLD: { label: "DEV SOLD", emoji: "🚨", line: "The creator sold or moved most of their launch bag.", cls: "border-sell/50 bg-sell/[.06] text-sell" },
  NO_DEV_BUY: { label: "NO DEV BUY", emoji: "🫥", line: "The creator launched without buying any supply.", cls: "border-line bg-panel2 text-ink" },
  UNKNOWN: { label: "CHECKING", emoji: "🔍", line: "Reading the chain…", cls: "border-line bg-panel2 text-mute" },
};

export function ProofView({ mint, tx, burn }: { mint: string; tx?: string | null; burn?: string | null }) {
  const conn = useMemo(() => new Connection(`${window.location.origin}/api/rpc?network=https://api.mainnet-beta.solana.com`, "confirmed"), []);
  const [p, setP] = useState<Proof | null>(null);
  const [err, setErr] = useState("");
  const [updated, setUpdated] = useState(0);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await buildProof(conn, mint, tx, burn);
      setP(r);
      setErr("");
      setUpdated(Date.now());
    } catch (e: any) {
      setErr(/Invalid public key|Non-base58/i.test(String(e?.message)) ? "That isn't a valid Solana contract address." : "Couldn't read the chain right now. Retrying…");
    }
  }, [conn, mint, tx, burn]);

  useEffect(() => {
    load();
    const id = setInterval(() => document.visibilityState === "visible" && load(), 30_000);
    return () => clearInterval(id);
  }, [load]);

  const v = p && p.status === "UNKNOWN" ? { label: "DEV NOT FOUND", emoji: "❔", line: "Couldn't trace this coin's creator. Live market data is shown below.", cls: "border-line bg-panel2 text-ink" } : VERDICT[p?.status ?? "UNKNOWN"];
  const pct = (n?: number) => (n === undefined ? "—" : `${((n / PUMP_SUPPLY) * 100).toFixed(2)}%`);
  const supplyBurned = p?.supply !== undefined ? Math.max(0, PUMP_SUPPLY - p.supply) : undefined;
  const shareText = p
    ? `🔍 Ape Proof for $${p.symbol ?? shortAddr(mint)}\n\n${v.emoji} ${v.label}${p.devInitial ? `\nDev bought ${pct(p.devInitial)} at launch, holds ${pct(p.devNow)} now` : ""}${p.burnedAtBirth ? `\n🔥 ${pct(p.burnedAtBirth)} burned at birth` : ""}\n\n${typeof window !== "undefined" ? window.location.href : ""}`
    : "";

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="label text-fire">Ape Proof · live dev check</div>
        <ProofSearch compact />
      </div>

      {/* header */}
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <div className="h-16 w-16 overflow-hidden rounded-2xl border border-line bg-panel2">
          {p?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.image} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full place-items-center text-2xl">🦍</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-[30px] font-bold leading-tight sm:text-[38px]">
            {p?.name ?? (p ? "Unknown coin" : "Loading…")} {p?.symbol && <span className="fire-text">${p.symbol}</span>}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(mint).catch(() => {});
                setCopied(true);
                setTimeout(() => setCopied(false), 1400);
              }}
              className="inline-flex max-w-full items-center gap-2 rounded-lg border border-line bg-panel px-2.5 py-1 font-mono text-[11px] text-mute hover:text-ink"
            >
              <span className="truncate">{mint}</span>
              {copied ? <ICheck className="h-3.5 w-3.5 text-buy" /> : <ICopy className="h-3.5 w-3.5" />}
            </button>
            {mint.endsWith(SUFFIX) && <Badge cls="border-fire/50 text-fire">ENDS IN {SUFFIX.toUpperCase()} 🦍</Badge>}
            {p?.onCurve !== undefined && <Badge cls={p.onCurve ? "border-line text-mute" : "border-buy/50 text-buy"}>{p.onCurve ? "ON BONDING CURVE" : "GRADUATED"}</Badge>}
          </div>
        </div>
      </div>

      {err && <p className="mt-4 rounded-lg border border-sell/30 bg-sell/5 px-3 py-2 font-mono text-[12px] text-sell">{err}</p>}

      {/* verdict */}
      <div className={`mt-6 rounded-2xl border p-6 sm:p-8 ${v.cls}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="font-mono text-[11px] tracking-[0.2em] opacity-80">VERDICT</div>
            <div className="mt-1 font-display text-[34px] font-bold leading-none sm:text-[46px]">
              {v.emoji} {v.label}
            </div>
            <p className="mt-3 max-w-[560px] text-[14.5px] text-ink/80">{v.line}</p>
          </div>
          {p && (
            <a href={`https://x.com/intent/post?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noreferrer" className="btn-fire">
              Share proof on X
            </a>
          )}
        </div>
        {p?.devInitial !== undefined && p.devInitial > 0 && p.devNow !== undefined && (
          <div className="mt-6">
            <div className="mb-1.5 flex justify-between font-mono text-[11px] text-ink/70">
              <span>Dev bag remaining</span>
              <span>{Math.min(999, Math.round((p.devNow / Math.max(1, p.devInitial - (p.burnedAtBirth ?? 0))) * 100))}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-bg/60">
              <div className="h-full rounded-full bg-current" style={{ width: `${Math.min(100, (p.devNow / Math.max(1, p.devInitial - (p.burnedAtBirth ?? 0))) * 100)}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* stats */}
      <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-4">
        <Stat k="Dev wallet" v={p?.dev ? shortAddr(p.dev, 4, 4) : "—"} href={p?.dev ? `https://solscan.io/account/${p.dev}` : undefined} />
        <Stat k="Launched" v={p?.createdAt ? `${ago(p.createdAt)} ago` : "—"} href={p?.createSig ? `https://solscan.io/tx/${p.createSig}` : undefined} />
        <Stat k="Dev buy at launch" v={pct(p?.devInitial)} sub={p?.devInitial ? `${compact(p.devInitial, "")} tokens` : undefined} />
        <Stat k="Dev holds now" v={pct(p?.devNow)} sub={p?.devNow !== undefined ? `${compact(p.devNow, "")} tokens` : undefined} />
        <Stat k="Burned at birth" v={p?.burnedAtBirth ? pct(p.burnedAtBirth) : "—"} sub={p?.burnedAtBirth ? "verified ✓" : undefined} href={p?.burnSig ? `https://solscan.io/tx/${p.burnSig}` : undefined} />
        <Stat k="Total supply burned" v={supplyBurned !== undefined ? pct(supplyBurned) : "—"} />
        <Stat k="Market cap" v={p?.marketCap ? compact(p.marketCap) : "—"} />
        <Stat k="Price" v={p?.priceUsd ? price(p.priceUsd) : "—"} href={p?.dexUrl} />
      </div>

      {p?.notes.map((n) => (
        <p key={n} className="mt-3 font-mono text-[11px] text-fire">
          {n}
        </p>
      ))}

      {/* buy */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {buyLinks(mint).map((b) => (
          <a key={b.name} href={b.url} target="_blank" rel="noreferrer" className="group rounded-xl border border-line bg-panel px-4 py-3 transition hover:border-fire/60">
            <div className="flex items-center justify-between font-display text-[14px] font-bold">
              {b.name}
              <IExt className="h-3.5 w-3.5 text-mute group-hover:text-fire" />
            </div>
            <div className="font-mono text-[10.5px] text-mute">{b.note}</div>
          </a>
        ))}
      </div>

      <p className="mt-6 font-mono text-[10.5px] leading-relaxed text-mute">
        Live from Solana · refreshes every 30s{updated ? ` · updated ${ago(updated)} ago` : ""}. Dev status tracks the creator wallet only; moving tokens to another wallet counts as sold. Not financial advice.
      </p>
    </div>
  );
}

function Badge({ children, cls }: { children: React.ReactNode; cls: string }) {
  return <span className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] tracking-wider ${cls}`}>{children}</span>;
}

function Stat({ k, v, sub, href }: { k: string; v: string; sub?: string; href?: string }) {
  const body = (
    <>
      <div className="label">{k}</div>
      <div className="mt-1.5 font-display text-[20px] font-bold tnum">{v}</div>
      {sub && <div className="font-mono text-[10.5px] text-mute">{sub}</div>}
    </>
  );
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className="bg-panel px-4 py-4 transition hover:bg-panel2">
      {body}
    </a>
  ) : (
    <div className="bg-panel px-4 py-4">{body}</div>
  );
}
