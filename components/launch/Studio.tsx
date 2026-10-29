"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { siteConfig } from "@/site.config";
import { compact } from "@/lib/format";
import { devBuyPct, devBuyTokens } from "@/lib/pump";
import { grindVanity, vanitySupported } from "@/lib/vanity";
import { addLaunch } from "@/lib/launches";
import { buildBurnTx } from "@/lib/burn";
import { randomCoin } from "@/lib/names";
import { WalletButton } from "../WalletButton";
import { ICheck } from "../Icons";
import { ShillKit } from "./ShillKit";

type Phase = "grind" | "upload" | "build" | "sign" | "confirm" | "burn";
const PHASES: { id: Phase; label: string }[] = [
  { id: "grind", label: "Forging your …" },
  { id: "upload", label: "Pinning image + metadata to IPFS" },
  { id: "build", label: "Building pump.fun transaction" },
  { id: "sign", label: "Approve in your wallet" },
  { id: "confirm", label: "Confirming on Solana" },
  { id: "burn", label: "Burning dev tokens (approve in wallet)" },
];

const SUFFIX = siteConfig.vanitySuffix;
const FEE = siteConfig.platformFee;
const FEE_ON = !!FEE.wallet && FEE.sol > 0;

export type Draft = {
  name: string;
  symbol: string;
  description: string;
  twitter: string;
  telegram: string;
  website: string;
};

export function Studio({ onLaunched }: { onLaunched?: () => void }) {
  const { connection } = useConnection();
  const { publicKey, connected, sendTransaction } = useWallet();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [step, setStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [d, setD] = useState<Draft>({ name: "", symbol: "", description: "", twitter: "", telegram: "", website: "" });
  const [devBuy, setDevBuy] = useState("0.5");
  const [vanity, setVanity] = useState(true);
  const [burnPct, setBurnPct] = useState(0);
  const [canVanity, setCanVanity] = useState(true);
  const [balance, setBalance] = useState<number | null>(null);

  const [phase, setPhase] = useState<Phase | null>(null);
  const [tries, setTries] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ mint: string; sig: string; burnSig?: string; burned?: number } | null>(null);
  const cancelRef = useRef<() => void>(() => {});
  const fileRef = useRef<HTMLInputElement>(null);

  const preview = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  useEffect(() => { vanitySupported().then(setCanVanity); }, []);
  useEffect(() => {
    if (!publicKey) return setBalance(null);
    let on = true;
    connection.getBalance(publicKey).then((b) => on && setBalance(b / LAMPORTS_PER_SOL)).catch(() => on && setBalance(null));
    return () => { on = false; };
  }, [publicKey, connection, result]);

  const set = (k: keyof Draft) => (v: string) => setD((x) => ({ ...x, [k]: v }));
  const buy = Math.max(0, parseFloat(devBuy) || 0);
  const needed = buy + 0.025 + (FEE_ON ? FEE.sol : 0);
  const ticker = useTickerCheck(d.symbol);
  const step1ok = !!file && d.name.trim().length > 0 && d.symbol.trim().length > 0;
  const busy = phase !== null;

  if (!mounted) return <div className="h-[520px] animate-pulse rounded-2xl border border-line bg-panel" />;

  /* ---------------------------- locked state ---------------------------- */
  if (!connected || !publicKey) {
    return (
      <div className="panel relative overflow-hidden">
        <div className="grid-bg absolute inset-0 opacity-60" />
        <div className="relative grid gap-8 p-8 sm:p-12 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-fire/40 bg-fire/10 px-3 py-1 font-mono text-[10.5px] text-fire">
              <LockIcon /> STUDIO LOCKED
            </div>
            <h3 className="mt-4 font-display text-[28px] font-bold leading-tight sm:text-[34px]">Connect your wallet to open the Launch Studio.</h3>
            <p className="mt-3 max-w-[520px] text-[14.5px] leading-relaxed text-mute">
              You sign every launch yourself. Your wallet becomes the coin&apos;s creator on pump.fun. {siteConfig.name} never sees your keys.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <WalletButton big />
              <span className="font-mono text-[11px] text-mute">Phantom · Solflare · Backpack</span>
            </div>
          </div>
          <PreviewCard draft={{ ...d, name: d.name || "Your Coin", symbol: d.symbol || "TICKER" }} image="" mint={`••••••••••${SUFFIX}`} dim />
        </div>
      </div>
    );
  }

  /* ------------------------------ success ------------------------------- */
  if (result) {
    return (
      <div className="panel p-6 sm:p-8">
        <div className="flex items-center gap-2 font-mono text-[12px] text-buy">
          <ICheck className="h-4 w-4" /> APED IN · LAUNCH CONFIRMED
        </div>
        <div className="mt-5 grid gap-8 lg:grid-cols-[auto_1fr]">
          <PreviewCard draft={d} image={preview} mint={result.mint} />
          <ShillKit draft={d} image={preview} mint={result.mint} sig={result.sig} burnSig={result.burnSig} burned={result.burned} onReset={reset} />
        </div>
      </div>
    );
  }

  /* ------------------------------- wizard ------------------------------- */
  async function launch() {
    if (!publicKey || busy) return;
    setError("");
    try {
      // 1 — vanity mint
      let mint: Keypair = Keypair.generate();
      if (vanity && canVanity && SUFFIX) {
        setPhase("grind");
        setTries(0);
        const g = grindVanity(SUFFIX, setTries);
        cancelRef.current = g.cancel;
        const kp = await g.promise;
        if (kp) mint = kp;
      }

      // 2 — metadata
      setPhase("upload");
      const fd = new FormData();
      fd.append("file", file!);
      (Object.keys(d) as (keyof Draft)[]).forEach((k) => fd.append(k, k === "symbol" ? d[k].trim().toUpperCase() : d[k].trim()));
      const up = await fetch("/api/launch/ipfs", { method: "POST", body: fd }).then((r) => r.json()).catch(() => null);
      if (!up?.metadataUri) throw new Error(up?.error || "Metadata upload failed");

      // 3 — build
      setPhase("build");
      const built = await fetch("/api/launch/tx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicKey: publicKey.toBase58(), mint: mint.publicKey.toBase58(), uri: up.metadataUri, name: d.name.trim(), symbol: d.symbol.trim().toUpperCase(), amount: buy }),
      }).then((r) => r.json()).catch(() => null);
      if (!built?.tx) throw new Error(built?.error || "Could not build transaction");

      let tx = VersionedTransaction.deserialize(Uint8Array.from(atob(built.tx), (c) => c.charCodeAt(0)));
      if (FEE_ON) {
        // PumpPortal transactions use address lookup tables; load them so the fee can be added in the same tx.
        const lookups = await Promise.all(tx.message.addressTableLookups.map((l) => connection.getAddressLookupTable(l.accountKey).then((r) => r.value)));
        if (lookups.some((x) => !x)) throw new Error("Couldn't load transaction data. Try again.");
        const alts = lookups as NonNullable<(typeof lookups)[number]>[];
        const msg = TransactionMessage.decompile(tx.message, { addressLookupTableAccounts: alts });
        msg.instructions.push(SystemProgram.transfer({ fromPubkey: publicKey, toPubkey: new PublicKey(FEE.wallet), lamports: Math.round(FEE.sol * LAMPORTS_PER_SOL) }));
        tx = new VersionedTransaction(tx.version === "legacy" ? msg.compileToLegacyMessage() : msg.compileToV0Message(alts));
      }
      tx.sign([mint]);

      // 4 — sign + send
      setPhase("sign");
      const sig = await sendTransaction(tx, connection, { maxRetries: 3 });

      // 5 — confirm
      setPhase("confirm");
      await confirm(sig);
      const m = mint.publicKey.toBase58();

      // 6 — optional burn at birth (separate signature, after tokens land)
      let burnSig: string | undefined;
      let burned: number | undefined;
      if (burnPct > 0 && buy > 0) {
        setPhase("burn");
        try {
          const b = await buildBurnTx(connection, publicKey, mint.publicKey, burnPct);
          if (b) {
            burnSig = await sendTransaction(b.tx, connection, { maxRetries: 3 });
            await confirm(burnSig);
            burned = b.ui;
          }
        } catch {
          burnSig = undefined; // launch already succeeded; burn skipped
        }
      }
      addLaunch(publicKey.toBase58(), { mint: m, name: d.name.trim(), symbol: d.symbol.trim().toUpperCase(), sig, burnSig, ts: Date.now() });
      setResult({ mint: m, sig, burnSig, burned });
      setPhase(null);
      onLaunched?.();
    } catch (e: any) {
      const msg = String(e?.message || e);
      setError(/reject|declin|cancel/i.test(msg) ? "Cancelled in wallet." : msg);
      setPhase(null);
    }
  }

  async function confirm(sig: string) {
    for (let i = 0; i < 45; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      const { value } = await connection.getSignatureStatuses([sig]).catch(() => ({ value: [null] as any[] }));
      const s = value[0];
      if (s?.err) throw new Error("Transaction failed on-chain.");
      if (s?.confirmationStatus === "confirmed" || s?.confirmationStatus === "finalized") return;
    }
    throw new Error("Still confirming. Check your wallet activity in a minute.");
  }

  function reset() {
    setResult(null);
    setStep(0);
    setFile(null);
    setD({ name: "", symbol: "", description: "", twitter: "", telegram: "", website: "" });
    setDevBuy("0.5");
  }

  const pct = devBuyPct(buy);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <div className="panel relative overflow-hidden">
        {/* step tabs */}
        <div className="grid grid-cols-3 border-b border-line">
          {["Identity", "Story", "Ignition"].map((s, i) => (
            <button
              key={s}
              onClick={() => !busy && (i === 0 || step1ok) && setStep(i)}
              className={`flex items-center gap-2 px-4 py-3.5 text-left font-mono text-[11px] uppercase tracking-wider transition ${step === i ? "bg-panel2 text-ink shadow-[inset_0_-2px_0_#ffb81c]" : "text-mute hover:text-ink"}`}
            >
              <span className={`grid h-5 w-5 place-items-center rounded-full text-[10px] ${i < step ? "bg-fire text-bg" : step === i ? "border border-fire text-fire" : "border border-line"}`}>{i < step ? "✓" : i + 1}</span>
              <span className="hidden sm:inline">{s}</span>
            </button>
          ))}
        </div>

        <div className="p-5 sm:p-6">
          {step === 0 && (
            <div className="grid gap-5 sm:grid-cols-[170px_1fr]">
              <button type="button" onClick={() => fileRef.current?.click()} className="group relative grid aspect-square place-items-center overflow-hidden rounded-2xl border border-dashed border-line bg-bg text-center transition hover:border-fire/60">
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="Coin image" className="h-full w-full object-cover" />
                ) : (
                  <span className="px-3 font-mono text-[11px] text-mute">
                    <span className="mb-2 block text-2xl text-fire">＋</span>Drop image
                    <br />
                    <span className="text-[10px]">PNG · JPG · GIF · 4MB</span>
                  </span>
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f && f.size > 4 * 1024 * 1024) return setError("Image must be under 4MB");
                  setError("");
                  setFile(f ?? null);
                }}
              />
              <div className="grid content-start gap-4">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Field label="Coin name" value={d.name} onChange={set("name")} max={32} placeholder="e.g. Banana Republic" />
                  </div>
                  <button
                    type="button"
                    title="Roll a random degen coin"
                    onClick={() => {
                      const c = randomCoin();
                      setD((x) => ({ ...x, name: c.name, symbol: c.symbol, description: x.description || c.description }));
                    }}
                    className="mb-[1px] grid h-[46px] w-[46px] shrink-0 place-items-center rounded-xl border border-line bg-bg text-xl transition hover:rotate-12 hover:border-fire/60"
                  >
                    🎲
                  </button>
                </div>
                <div>
                  <Field label="Ticker" value={d.symbol} onChange={(v) => set("symbol")(v.replace(/[^A-Za-z0-9]/g, ""))} max={10} placeholder="BANANA" upper prefix="$" />
                  <TickerNote state={ticker} symbol={d.symbol} />
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-4">
              <div>
                <label className="label">Description</label>
                <textarea value={d.description} onChange={(e) => set("description")(e.target.value.slice(0, 500))} rows={4} placeholder="The lore. Why it exists. Why it sends." className="mt-1.5 w-full resize-none rounded-xl border border-line bg-bg px-4 py-3 text-[14px] outline-none placeholder:text-mute/50 focus:border-fire/60" />
                <div className="mt-1 text-right font-mono text-[10px] text-mute">{d.description.length}/500</div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="X" value={d.twitter} onChange={set("twitter")} placeholder="https://x.com/…" />
                <Field label="Telegram" value={d.telegram} onChange={set("telegram")} placeholder="https://t.me/…" />
                <Field label="Website" value={d.website} onChange={set("website")} placeholder="https://…" />
              </div>
              <p className="font-mono text-[10.5px] text-mute">All optional. These appear on your pump.fun page.</p>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-5">
              <div>
                <label className="label">Dev buy</label>
                <div className="mt-1.5 flex items-center rounded-xl border border-line bg-bg px-4 focus-within:border-fire/60">
                  <input inputMode="decimal" value={devBuy} onChange={(e) => setDevBuy(e.target.value.replace(/[^0-9.]/g, ""))} className="w-full bg-transparent py-3 font-display text-2xl font-bold outline-none tnum" />
                  <span className="font-mono text-sm text-mute">SOL</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {[0, 0.25, 0.5, 1, 2, 5].map((v) => (
                    <button key={v} onClick={() => setDevBuy(String(v))} className={`rounded-lg border px-3 py-1 font-mono text-[11px] ${buy === v ? "border-fire bg-fire/10 text-fire" : "border-line text-mute hover:text-ink"}`}>
                      {v === 0 ? "None" : v}
                    </button>
                  ))}
                </div>
                <div className="mt-3 rounded-xl border border-line bg-bg p-3">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-mute">You&apos;ll hold</span>
                    <span className="text-fire">{buy > 0 ? `${compact(devBuyTokens(buy), "")} · ${pct.toFixed(2)}% of supply` : "0%"}</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
                    <div className="h-full rounded-full bg-gradient-to-r from-fire to-flame" style={{ width: `${Math.min(100, pct * 4)}%` }} />
                  </div>
                  <p className="mt-2 text-[11.5px] text-mute">Bought in the same transaction as creation. No sniper can get in before you.</p>
                </div>
              </div>

              <div className={`rounded-xl border p-4 ${burnPct > 0 ? "border-sell/40 bg-sell/5" : "border-line bg-bg"}`}>
                <div className="flex items-center justify-between">
                  <span className="font-display text-[15px] font-bold">🔥 Burn at birth</span>
                  <span className="font-mono text-[11px] text-mute">{buy > 0 ? (burnPct ? `${burnPct}% of dev buy` : "Off") : "Needs a dev buy"}</span>
                </div>
                <p className="mt-1 text-[12.5px] text-mute">Burn part of your dev bag right after launch. Shows on your Ape Proof page as verified on-chain.</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {[0, 10, 25, 50, 100].map((v) => (
                    <button key={v} disabled={buy <= 0} onClick={() => setBurnPct(v)} className={`rounded-lg border px-3 py-1 font-mono text-[11px] disabled:opacity-40 ${burnPct === v ? "border-sell bg-sell/10 text-sell" : "border-line text-mute hover:text-ink"}`}>
                      {v === 0 ? "Off" : `${v}%`}
                    </button>
                  ))}
                </div>
              </div>

              {SUFFIX && (
                <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${vanity && canVanity ? "border-fire/50 bg-fire/5" : "border-line bg-bg"}`}>
                  <input type="checkbox" checked={vanity && canVanity} disabled={!canVanity} onChange={(e) => setVanity(e.target.checked)} className="mt-1 accent-[#ffb81c]" />
                  <span>
                    <span className="block font-display text-[15px] font-bold">
                      Vanity CA ending in <span className="fire-text">{SUFFIX}</span>
                    </span>
                    <span className="mt-0.5 block text-[12.5px] text-mute">
                      {canVanity ? `Forged right in your browser, usually in seconds. Instantly recognizable as an ${siteConfig.name} launch.` : "Your browser doesn't support fast key generation. A normal CA will be used."}
                    </span>
                  </span>
                </label>
              )}
            </div>
          )}

          {/* nav */}
          <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
            <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0 || busy} className="font-mono text-[12px] text-mute hover:text-ink disabled:opacity-0">
              ← Back
            </button>
            {step < 2 ? (
              <button onClick={() => setStep((s) => s + 1)} disabled={!step1ok} className="btn-fire disabled:cursor-not-allowed disabled:opacity-40">
                Next →
              </button>
            ) : (
              <button onClick={launch} disabled={!step1ok || busy || (balance !== null && balance < needed)} className="btn-fire disabled:cursor-not-allowed disabled:opacity-40">
                🚀 Launch ${d.symbol.toUpperCase() || "COIN"}
              </button>
            )}
          </div>
          {!step1ok && step === 0 && <p className="mt-2 text-right font-mono text-[10.5px] text-mute">Image, name and ticker required</p>}
          {balance !== null && balance < needed && step === 2 && <p className="mt-2 text-right font-mono text-[11px] text-sell">Need ~{needed.toFixed(3)} SOL · wallet has {balance.toFixed(3)}</p>}
          {error && <p className="mt-3 break-words rounded-lg border border-sell/30 bg-sell/5 px-3 py-2 font-mono text-[11.5px] text-sell">{error}</p>}
        </div>

        {/* progress overlay */}
        {busy && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-bg/90 p-6 backdrop-blur-sm">
            <div className="w-full max-w-[380px]">
              <div className="label text-fire">Launch sequence</div>
              <ol className="mt-4 space-y-3">
                {PHASES.filter((p) => (p.id !== "grind" || (vanity && canVanity)) && (p.id !== "burn" || (burnPct > 0 && buy > 0))).map((p) => {
                  const order = PHASES.findIndex((x) => x.id === p.id);
                  const cur = PHASES.findIndex((x) => x.id === phase);
                  const st = order < cur ? "done" : order === cur ? "now" : "todo";
                  return (
                    <li key={p.id} className="flex items-center gap-3 font-mono text-[12.5px]">
                      <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border ${st === "done" ? "border-buy bg-buy text-bg" : st === "now" ? "border-fire text-fire" : "border-line text-mute"}`}>
                        {st === "done" ? "✓" : st === "now" ? <span className="h-2 w-2 animate-pulseDot rounded-full bg-fire" /> : ""}
                      </span>
                      <span className={st === "todo" ? "text-mute" : ""}>
                        {p.id === "grind" ? <>Forging your …<span className="text-fire">{SUFFIX}</span> address</> : p.label}
                        {p.id === "grind" && st === "now" && <span className="ml-2 text-mute">{compact(tries, "")} tries</span>}
                      </span>
                    </li>
                  );
                })}
              </ol>
              {phase === "grind" && (
                <button onClick={() => cancelRef.current()} className="mt-5 font-mono text-[11px] text-mute underline underline-offset-4 hover:text-ink">
                  Skip vanity, use a normal CA
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* right column: live preview + summary */}
      <div className="flex flex-col gap-4">
        <div className="panel p-5">
          <div className="label mb-3">Live preview</div>
          <PreviewCard draft={d} image={preview} mint={`••••••••${vanity && canVanity ? SUFFIX : "••••"}`} />
        </div>
        <div className="panel p-5 font-mono text-[11.5px]">
          <div className="label mb-3">Launch cost</div>
          <div className="space-y-2">
            <Line k="Dev buy" v={`${buy} SOL`} />
            <Line k="PumpPortal fee" v="0.5% of dev buy" />
            {FEE_ON && <Line k={`${siteConfig.name} fee`} v={`${FEE.sol} SOL`} />}
            <Line k="Network + rent" v="~0.02 SOL" />
            <div className="my-2 border-t border-line" />
            <Line k="Total" v={`~${needed.toFixed(3)} SOL`} hl />
            {balance !== null && <Line k="Wallet" v={`${balance.toFixed(3)} SOL`} warn={balance < needed} />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------- */

export function PreviewCard({ draft, image, mint, dim }: { draft: Draft; image: string; mint: string; dim?: boolean }) {
  return (
    <div className={`w-full max-w-[320px] overflow-hidden rounded-2xl border border-line bg-bg ${dim ? "opacity-70" : ""}`}>
      <div className="relative aspect-[16/10] overflow-hidden bg-panel2">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="grid-bg grid h-full place-items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={siteConfig.logo} alt="" className="h-14 w-14 rounded-xl opacity-40" />
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-bg/80 px-2 py-0.5 font-mono text-[9.5px] text-fire backdrop-blur">LAUNCHED ON {siteConfig.name}</span>
      </div>
      <div className="p-4">
        <div className="flex items-baseline justify-between gap-2">
          <div className="truncate font-display text-[17px] font-bold">{draft.name || "Coin name"}</div>
          <div className="shrink-0 font-mono text-[12px] text-fire">${(draft.symbol || "TICKER").toUpperCase()}</div>
        </div>
        <p className="mt-1.5 line-clamp-2 min-h-[34px] text-[12px] leading-snug text-mute">{draft.description || "Your description shows here."}</p>
        <div className="mt-3 flex items-center justify-between rounded-lg border border-line px-2.5 py-1.5 font-mono text-[10.5px]">
          <span className="text-mute">CA</span>
          <span>
            {mint.includes("•") ? "••••••" : mint.slice(0, 6)}…<span className="text-fire">{mint.slice(-(SUFFIX.length || 4))}</span>
          </span>
        </div>
        <div className="mt-3">
          <div className="mb-1 flex justify-between font-mono text-[9.5px] text-mute">
            <span>BONDING CURVE</span>
            <span>0%</span>
          </div>
          <div className="h-1 rounded-full bg-line" />
        </div>
      </div>
    </div>
  );
}

type TickerState = "idle" | "checking" | "fresh" | { count: number };

function useTickerCheck(symbol: string): TickerState {
  const [st, setSt] = useState<TickerState>("idle");
  useEffect(() => {
    const s = symbol.trim().toUpperCase();
    if (s.length < 2) return setSt("idle");
    setSt("checking");
    const id = setTimeout(async () => {
      try {
        const j = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(s)}`).then((r) => r.json());
        const mints = new Set<string>();
        for (const p of j?.pairs ?? []) if (p.chainId === "solana" && String(p.baseToken?.symbol).toUpperCase() === s) mints.add(p.baseToken.address);
        setSt(mints.size ? { count: mints.size } : "fresh");
      } catch {
        setSt("idle");
      }
    }, 600);
    return () => clearTimeout(id);
  }, [symbol]);
  return st;
}

function TickerNote({ state, symbol }: { state: TickerState; symbol: string }) {
  if (state === "idle") return null;
  if (state === "checking") return <p className="mt-1.5 font-mono text-[10.5px] text-mute">Checking ${symbol.toUpperCase()} on Solana…</p>;
  if (state === "fresh") return <p className="mt-1.5 font-mono text-[10.5px] text-buy">✓ Fresh ticker. No Solana coin trading as ${symbol.toUpperCase()}.</p>;
  return (
    <p className="mt-1.5 font-mono text-[10.5px] text-fire">
      {state.count}
      {state.count >= 30 ? "+" : ""} Solana coin{state.count === 1 ? "" : "s"} already trade as ${symbol.toUpperCase()}. Still allowed, just less unique.
    </p>
  );
}

function Field({ label, value, onChange, placeholder, max, upper, prefix }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; max?: number; upper?: boolean; prefix?: string }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="mt-1.5 flex items-center rounded-xl border border-line bg-bg px-4 focus-within:border-fire/60">
        {prefix && <span className="mr-1 font-mono text-mute">{prefix}</span>}
        <input value={value} onChange={(e) => onChange(max ? e.target.value.slice(0, max) : e.target.value)} placeholder={placeholder} className={`w-full bg-transparent py-3 text-[14px] outline-none placeholder:text-mute/50 ${upper ? "uppercase" : ""}`} />
        {max && <span className="ml-2 font-mono text-[10px] text-mute">{value.length}/{max}</span>}
      </div>
    </div>
  );
}

function Line({ k, v, hl, warn }: { k: string; v: string; hl?: boolean; warn?: boolean }) {
  return (
    <div className={`flex justify-between gap-3 ${warn ? "text-sell" : ""}`}>
      <span className="text-mute">{k}</span>
      <span className={hl ? "font-bold text-fire" : ""}>{v}</span>
    </div>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
