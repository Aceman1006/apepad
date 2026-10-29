"use client";

import { useState } from "react";
import { siteConfig } from "@/site.config";
import { buyLinks } from "@/lib/links";
import { Providers } from "./Providers";
import { CopyCA } from "./CopyCA";
import { WalletButton } from "./WalletButton";
import { IDiscord, ITg, IX } from "./Icons";

const LINKS = [
  { href: "/#launch", label: "Launch" },
  { href: "/#proof", label: "Ape Proof" },
  { href: "/#features", label: "Features" },
  { href: "/#token", label: `$${siteConfig.ticker}` },
  { href: "/#faq", label: "FAQ" },
];

export function Socials({ className = "" }: { className?: string }) {
  const s = siteConfig.socials;
  const items = [
    { url: s.x, Icon: IX, label: "X" },
    { url: s.telegram, Icon: ITg, label: "Telegram" },
    { url: s.discord, Icon: IDiscord, label: "Discord" },
  ].filter((i) => i.url);
  if (!items.length) return null;
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {items.map(({ url, Icon, label }) => (
        <a key={label} href={url} target="_blank" rel="noreferrer" aria-label={label} className="grid h-9 w-9 place-items-center rounded-lg text-mute transition hover:bg-panel2 hover:text-fire">
          <Icon className="h-4 w-4" />
        </a>
      ))}
    </div>
  );
}

export function Frame({ children }: { children: React.ReactNode }) {
  const ca = siteConfig.ca.trim();
  const [open, setOpen] = useState(false);
  return (
    <Providers>
      <div className="min-h-screen">
        <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-3 px-4 sm:px-6">
            <a href="/" className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={siteConfig.logo} alt="" className="h-9 w-9 rounded-xl" />
              <span className="font-display text-[19px] font-bold tracking-wide">
                APE<span className="fire-text">PAD</span>
              </span>
            </a>
            <nav className="ml-6 hidden items-center gap-1 lg:flex">
              {LINKS.map((l) => (
                <a key={l.href} href={l.href} className="rounded-lg px-3 py-2 font-mono text-[11.5px] uppercase tracking-wider text-mute transition hover:bg-panel2 hover:text-ink">
                  {l.label}
                </a>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-2">
              {ca && <CopyCA className="hidden xl:inline-flex" />}
              {ca && (
                <a href={buyLinks(ca)[0].url} target="_blank" rel="noreferrer" className="hidden rounded-lg border border-fire/50 px-3 py-1.5 font-mono text-[11px] font-bold uppercase text-fire transition hover:bg-fire/10 sm:inline-flex">
                  Buy ${siteConfig.ticker}
                </a>
              )}
              <WalletButton />
              <button onClick={() => setOpen((o) => !o)} aria-label="Menu" className="grid h-9 w-9 place-items-center rounded-lg border border-line lg:hidden">
                <span className="font-mono text-sm">{open ? "✕" : "☰"}</span>
              </button>
            </div>
          </div>
          {open && (
            <nav className="border-t border-line px-4 py-3 lg:hidden">
              {LINKS.map((l) => (
                <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 font-mono text-[12px] uppercase tracking-wider text-mute hover:bg-panel2 hover:text-ink">
                  {l.label}
                </a>
              ))}
              {ca && <CopyCA full className="mt-2 max-w-full" />}
            </nav>
          )}
        </header>

        <main>{children}</main>

        <footer className="border-t border-line">
          <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={siteConfig.logo} alt="" className="h-9 w-9 rounded-lg" />
                <div>
                  <div className="font-display text-[16px] font-bold">
                    APE<span className="fire-text">PAD</span>
                  </div>
                  <div className="font-mono text-[10.5px] text-mute">Token launchpad on Solana</div>
                </div>
              </div>
              <Socials />
            </div>
            <p className="mt-6 max-w-[820px] font-mono text-[10.5px] leading-relaxed text-mute/80">
              Coins are created on pump.fun via PumpPortal and signed in your own wallet. {siteConfig.name} never holds funds or keys. Ape Proof shows public on-chain data for the creator wallet only. Meme coins are extremely volatile and have no intrinsic value. Nothing here is financial advice.
            </p>
          </div>
        </footer>
      </div>
    </Providers>
  );
}
