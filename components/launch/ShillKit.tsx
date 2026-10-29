"use client";

import { useState } from "react";
import { siteConfig } from "@/site.config";
import { ICheck, ICopy, IExt } from "../Icons";
import type { Draft } from "./Studio";

export function proofUrl(mint: string, sig?: string, burnSig?: string) {
  const q = new URLSearchParams();
  if (sig) q.set("tx", sig);
  if (burnSig) q.set("burn", burnSig);
  const qs = q.toString();
  return `${siteConfig.siteUrl}/proof/${mint}${qs ? `?${qs}` : ""}`;
}

export function ShillKit({ draft, image, mint, sig, burnSig, burned, onReset }: { draft: Draft; image: string; mint: string; sig: string; burnSig?: string; burned?: number; onReset: () => void }) {
  const sym = draft.symbol.toUpperCase();
  const pump = `https://pump.fun/coin/${mint}`;
  const proof = proofUrl(mint, sig, burnSig);
  const burnLine = burned ? `\n🔥 Dev burned ${Math.round(burned).toLocaleString()} tokens at birth` : "";
  const xPost = `$${sym} just launched on ${siteConfig.siteUrl.replace("https://", "")} 🦍${burnLine}\n\nCA: ${mint}\n\n🔍 Ape Proof (live dev check): ${proof}\n\n${pump}`;
  const tgPost = `🦍 $${sym} IS LIVE\n\n${draft.name}${draft.description ? `\n${draft.description.slice(0, 160)}` : ""}${burnLine}\n\nCA: ${mint}\n\nBuy: ${pump}\nApe Proof: ${proof}${draft.twitter ? `\nX: ${draft.twitter}` : ""}${draft.website ? `\nWeb: ${draft.website}` : ""}`;

  return (
    <div className="min-w-0">
      <h3 className="font-display text-[26px] font-bold leading-tight">
        ${sym} is live on pump.fun.
      </h3>
      <p className="mt-1 text-[13.5px] text-mute">Your launch kit is ready. Post the Ape Proof link so traders can verify your dev bag live.{burned ? ` 🔥 ${Math.round(burned).toLocaleString()} tokens burned.` : ""}</p>

      <div className="mt-5">
        <div className="label">Contract address</div>
        <CopyRow text={mint} mono />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <a href={pump} target="_blank" rel="noreferrer" className="btn-fire">
          Open on pump.fun <IExt className="h-4 w-4" />
        </a>
        <a href={proof.replace(siteConfig.siteUrl, "")} target="_blank" rel="noreferrer" className="btn-ghost">
          🔍 Ape Proof page
        </a>
        <a href={`https://x.com/intent/post?text=${encodeURIComponent(xPost)}`} target="_blank" rel="noreferrer" className="btn-ghost">
          Post on X
        </a>
        <button onClick={() => downloadCard(draft, image, mint)} className="btn-ghost">
          Download share card
        </button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <Snippet title="X post" text={xPost} />
        <Snippet title="Telegram announcement" text={tgPost} />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4 font-mono text-[11px]">
        <a href={`https://solscan.io/tx/${sig}`} target="_blank" rel="noreferrer" className="text-mute underline underline-offset-4 hover:text-ink">
          View transaction
        </a>
        <a href={`https://dexscreener.com/solana/${mint}`} target="_blank" rel="noreferrer" className="text-mute underline underline-offset-4 hover:text-ink">
          DexScreener
        </a>
        <button onClick={onReset} className="text-fire underline underline-offset-4">
          Launch another →
        </button>
      </div>
    </div>
  );
}

function CopyRow({ text, mono }: { text: string; mono?: boolean }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).catch(() => {});
        setOk(true);
        setTimeout(() => setOk(false), 1400);
      }}
      className={`mt-1.5 flex w-full items-center gap-2 rounded-lg border border-line bg-bg px-3 py-2.5 text-left text-[12px] hover:border-fire/50 ${mono ? "font-mono" : ""}`}
    >
      <span className="min-w-0 flex-1 truncate">{text}</span>
      {ok ? <ICheck className="h-4 w-4 shrink-0 text-buy" /> : <ICopy className="h-4 w-4 shrink-0 text-mute" />}
    </button>
  );
}

function Snippet({ title, text }: { title: string; text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <div className="rounded-xl border border-line bg-bg p-3">
      <div className="flex items-center justify-between">
        <span className="label">{title}</span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(text).catch(() => {});
            setOk(true);
            setTimeout(() => setOk(false), 1400);
          }}
          className="font-mono text-[10.5px] text-fire"
        >
          {ok ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-mute">{text}</pre>
    </div>
  );
}

async function loadImg(src: string) {
  return new Promise<HTMLImageElement | null>((res) => {
    if (!src) return res(null);
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = () => res(null);
    i.src = src;
  });
}

async function downloadCard(d: Draft, image: string, mint: string) {
  const W = 1200, H = 675;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const x = c.getContext("2d")!;
  const g = x.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "#0b0b0d");
  g.addColorStop(1, "#1a0f08");
  x.fillStyle = g;
  x.fillRect(0, 0, W, H);
  // glow
  const r = x.createRadialGradient(W - 200, 100, 10, W - 200, 100, 500);
  r.addColorStop(0, "rgba(255,90,31,.35)");
  r.addColorStop(1, "rgba(255,90,31,0)");
  x.fillStyle = r;
  x.fillRect(0, 0, W, H);

  const img = await loadImg(image);
  const S = 360, X0 = 80, Y0 = 150;
  x.save();
  roundRect(x, X0, Y0, S, S, 36);
  x.clip();
  if (img) {
    const k = Math.max(S / img.width, S / img.height);
    x.drawImage(img, X0 + (S - img.width * k) / 2, Y0 + (S - img.height * k) / 2, img.width * k, img.height * k);
  } else {
    x.fillStyle = "#16161a";
    x.fillRect(X0, Y0, S, S);
  }
  x.restore();
  x.strokeStyle = "#ffb81c";
  x.lineWidth = 4;
  roundRect(x, X0, Y0, S, S, 36);
  x.stroke();

  const tx = 500;
  x.fillStyle = "#ffb81c";
  x.font = "bold 26px ui-monospace, monospace";
  x.fillText("JUST APED IN 🦍", tx, 200);
  x.fillStyle = "#f5f5f4";
  x.font = "800 76px system-ui, sans-serif";
  wrap(x, d.name, tx, 290, 640, 82, 2);
  x.fillStyle = "#ff8a3d";
  x.font = "bold 54px ui-monospace, monospace";
  x.fillText(`$${d.symbol.toUpperCase()}`, tx, 430);
  x.fillStyle = "#8b8b94";
  x.font = "24px ui-monospace, monospace";
  x.fillText(`CA ${mint.slice(0, 10)}…${mint.slice(-6)}`, tx, 490);

  x.fillStyle = "#f5f5f4";
  x.font = "bold 28px system-ui, sans-serif";
  x.fillText(`Launched on ${siteConfig.siteUrl.replace("https://", "")}`, 80, 610);
  const logo = await loadImg(siteConfig.logo);
  if (logo) x.drawImage(logo, W - 140, H - 140, 80, 80);

  const a = document.createElement("a");
  a.download = `${d.symbol.toUpperCase()}-launch.png`;
  a.href = c.toDataURL("image/png");
  a.click();
}

function roundRect(x: CanvasRenderingContext2D, X: number, Y: number, w: number, h: number, r: number) {
  x.beginPath();
  x.moveTo(X + r, Y);
  x.arcTo(X + w, Y, X + w, Y + h, r);
  x.arcTo(X + w, Y + h, X, Y + h, r);
  x.arcTo(X, Y + h, X, Y, r);
  x.arcTo(X, Y, X + w, Y, r);
  x.closePath();
}

function wrap(x: CanvasRenderingContext2D, text: string, X: number, Y: number, max: number, lh: number, lines: number) {
  const words = text.split(" ");
  let line = "";
  let n = 0;
  for (const w of words) {
    const t = line ? `${line} ${w}` : w;
    if (x.measureText(t).width > max && line) {
      x.fillText(line, X, Y + n * lh);
      line = w;
      if (++n >= lines) return;
    } else line = t;
  }
  x.fillText(line, X, Y + n * lh);
}
