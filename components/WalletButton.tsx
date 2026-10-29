"use client";

import { useEffect, useRef, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { shortAddr } from "@/lib/format";

export function WalletButton({ className = "", big = false }: { className?: string; big?: boolean }) {
  const { publicKey, wallet, connected, connecting, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const base = big ? "btn-fire" : "inline-flex items-center gap-2 rounded-lg bg-fire px-3 py-1.5 font-mono text-[11px] font-bold uppercase text-bg transition hover:brightness-110";

  if (!mounted || !connected || !publicKey)
    return (
      <button onClick={() => setVisible(true)} className={`${base} ${className}`} disabled={connecting}>
        <PhantomGlyph />
        {connecting ? "Connecting…" : "Connect wallet"}
      </button>
    );

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button onClick={() => setOpen((o) => !o)} className="inline-flex items-center gap-2 rounded-lg border border-line bg-panel2 px-3 py-1.5 font-mono text-[11px] text-ink hover:border-fire/60">
        {wallet?.adapter.icon && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={wallet.adapter.icon} alt="" className="h-4 w-4" />
        )}
        {shortAddr(publicKey.toBase58(), 4, 4)}
        <span className="h-1.5 w-1.5 rounded-full bg-buy" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-line bg-panel shadow-2xl">
          <button
            onClick={() => {
              navigator.clipboard.writeText(publicKey.toBase58()).catch(() => {});
              setOpen(false);
            }}
            className="block w-full px-4 py-2.5 text-left font-mono text-[11px] hover:bg-panel2"
          >
            Copy address
          </button>
          <a href="#my-launches" onClick={() => setOpen(false)} className="block px-4 py-2.5 font-mono text-[11px] hover:bg-panel2">
            My launches
          </a>
          <button
            onClick={() => {
              disconnect();
              setOpen(false);
            }}
            className="block w-full px-4 py-2.5 text-left font-mono text-[11px] text-sell hover:bg-panel2"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}

function PhantomGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <rect x="3" y="6" width="18" height="13" rx="2.5" />
      <path d="M16 12.5h2M3 9h15a3 3 0 0 0-3-3H6" />
    </svg>
  );
}
