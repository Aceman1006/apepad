"use client";

import { useState } from "react";
import { siteConfig } from "@/site.config";
import { buyLinks, solscan } from "@/lib/links";
import { Frame } from "./Frame";
import { CopyCA } from "./CopyCA";
import { SectionHead } from "./SectionHead";
import { ProofSearch } from "./ProofSearch";
import { Studio } from "./launch/Studio";
import { MyLaunches } from "./launch/MyLaunches";
import { IArrow, IExt } from "./Icons";

const SUFFIX = siteConfig.vanitySuffix;
const WRAP = "mx-auto max-w-[1280px] px-4 sm:px-6";

export function App() {
  const [refresh, setRefresh] = useState(0);
  return (
    <Frame>
      <Hero />
      <Marquee />
      <section id="launch" className="border-b border-line">
        <div className={`${WRAP} py-16`}>
          <SectionHead kicker="Launch Studio" title={<>Three steps. <span className="fire-text">One signature.</span></>} sub="Design your coin, set your dev buy, choose a burn, sign once. Your wallet is the creator on pump.fun." />
          <div className="mt-8">
            <Studio onLaunched={() => setRefresh((r) => r + 1)} />
          </div>
        </div>
      </section>
      <MyLaunches refresh={refresh} />
      <ProofSection />
      <Features />
      <HowItWorks />
      <TokenSection />
      <FAQ />
    </Frame>
  );
}

/* ================================== HERO ================================== */

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div className="grid-bg pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="pointer-events-none absolute left-1/2 top-[-220px] h-[620px] w-[900px] -translate-x-1/2 rounded-full bg-flame/20 blur-[140px]" />
      <div className={`${WRAP} relative py-16 text-center sm:py-24`}>
        <div className="relative mx-auto h-[150px] w-[150px] sm:h-[180px] sm:w-[180px]">
          <div className="orbit absolute inset-[-14px] rounded-full border border-dashed border-fire/30" />
          <div className="absolute inset-0 rounded-full bg-fire/10 blur-2xl" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={siteConfig.logo} alt={siteConfig.name} className="relative h-full w-full rounded-[32px] border border-fire/30 object-cover shadow-[0_0_80px_-10px_#ff7a18]" />
        </div>

        <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-line bg-panel/80 px-3 py-1 font-mono text-[10.5px] tracking-wider text-mute">
          <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-buy" /> TOKEN LAUNCHPAD · SOLANA · PUMP.FUN
        </div>

        <h1 className="mx-auto mt-5 max-w-[900px] font-display text-[48px] font-bold uppercase leading-[0.95] tracking-tight sm:text-[76px] xl:text-[92px]">
          Launch it.
          <br />
          <span className="fire-text">Prove it.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-[620px] text-[16px] leading-relaxed text-mute sm:text-[17px]">
          Launch a pump.fun coin in one signature. Every CA ends in <span className="font-mono text-fire">{SUFFIX}</span>. Every coin gets a live{" "}
          <span className="text-ink">Ape Proof</span> page that shows exactly what the dev bought, burned and still holds.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href="#launch" className="btn-fire">
            🦍 Launch a coin <IArrow className="h-4 w-4" />
          </a>
          <a href="#proof" className="btn-ghost">
            Check a dev
          </a>
        </div>

        <div className="mx-auto mt-12 grid max-w-[880px] gap-3 text-left sm:grid-cols-3">
          {[
            { k: `…${SUFFIX}`, v: "Vanity CA on every launch" },
            { k: "1 tx", v: "Create + dev buy, no snipers first" },
            { k: "Live", v: "Ape Proof dev check for any coin" },
          ].map((x) => (
            <div key={x.k} className="rounded-2xl border border-line bg-panel/70 px-5 py-4 backdrop-blur">
              <div className="font-display text-[26px] font-bold text-fire">{x.k}</div>
              <div className="mt-0.5 text-[13px] text-mute">{x.v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const items = [`EVERY CA ENDS IN ${SUFFIX.toUpperCase()}`, "APE PROOF FOR ANY COIN", "BURN AT BIRTH", "SNIPER-PROOF DEV BUY", "DEGEN DICE", "TICKER RADAR", "LAUNCH KIT", "NON-CUSTODIAL"];
  const row = (
    <div className="flex shrink-0 gap-10 pr-10">
      {items.map((t) => (
        <span key={t} className="flex items-center gap-10">
          <span>{t}</span>
          <span className="text-fire">🦍</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className="overflow-hidden border-b border-line bg-gradient-to-r from-[#ffd45e] to-[#ff8a1f] py-3 text-bg">
      <div className="flex w-max animate-tape whitespace-nowrap font-display text-[15px] font-bold tracking-widest">
        {row}
        {row}
      </div>
    </div>
  );
}

/* =============================== APE PROOF ================================ */

function ProofSection() {
  return (
    <section id="proof" className="overflow-hidden border-b border-line">
      <div className={`${WRAP} grid items-center gap-10 py-16 lg:grid-cols-[1fr_1fr]`}>
        <div>
          <SectionHead kicker="Ape Proof" title={<>The dev check <span className="fire-text">CT needs.</span></>} sub="Paste any pump.fun CA. Ape Proof reads the creation transaction and the dev's wallet straight from Solana and gives a verdict in seconds. No screenshots, no trust me bro." />
          <ul className="mt-6 space-y-2.5 text-[14px]">
            {["What the dev bought at launch", "What the dev holds right now", "Burns verified on-chain", "Live market cap and one-click buy links"].map((t) => (
              <li key={t} className="flex items-center gap-2.5">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-buy/15 text-[11px] text-buy">✓</span>
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-7">
            <ProofSearch />
          </div>
          <p className="mt-2 font-mono text-[10.5px] text-mute">Works on any pump.fun coin, not just {siteConfig.name} launches.</p>
        </div>

        {/* example card */}
        <div className="relative">
          <div className="absolute -inset-2 rounded-[32px] bg-buy/5 blur-2xl sm:-inset-6" />
          <div className="relative rounded-2xl border border-line bg-panel p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-panel2 text-xl">🍌</div>
                <div>
                  <div className="font-display text-[18px] font-bold">Banana Republic</div>
                  <div className="font-mono text-[11px] text-mute">7xKp…Qm{SUFFIX}</div>
                </div>
              </div>
              <span className="rounded-full border border-line px-2 py-0.5 font-mono text-[9.5px] text-mute">EXAMPLE</span>
            </div>
            <div className="mt-5 rounded-xl border border-buy/50 bg-buy/[.06] p-5 text-buy">
              <div className="font-mono text-[10px] tracking-[0.2em] opacity-80">VERDICT</div>
              <div className="mt-1 font-display text-[32px] font-bold leading-none">💎 DEV HOLDING</div>
              <div className="mt-4 h-2 rounded-full bg-bg/60">
                <div className="h-full w-full rounded-full bg-current" />
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-[11.5px]">
              {[
                ["Dev buy at launch", "3.46%"],
                ["Dev holds now", "1.73%"],
                ["Burned at birth", "1.73% ✓"],
                ["Launched", "2h ago"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg border border-line bg-bg px-3 py-2.5">
                  <div className="text-[10px] uppercase text-mute">{k}</div>
                  <div className="mt-0.5 text-[14px] font-bold text-ink">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================ FEATURES ================================ */

function Features() {
  const f = [
    { e: "🦍", t: `…${SUFFIX} vanity CA`, d: `Forged in your browser so every launch ends in "${SUFFIX}". Traders know where it came from at a glance.`, big: true },
    { e: "🔍", t: "Ape Proof", d: "A live dev-check page for every coin. Share it, and holders can verify the dev bag themselves.", big: true },
    { e: "🔥", t: "Burn at birth", d: "Burn 10–100% of your dev buy right after launch. Verified on your Ape Proof page." },
    { e: "🛡️", t: "Sniper-proof dev buy", d: "Your buy lands in the creation transaction. Nobody gets in before you." },
    { e: "🎲", t: "Degen dice", d: "Out of ideas? Roll a random name, ticker and lore in one click." },
    { e: "📡", t: "Ticker radar", d: "See instantly if your ticker already trades on Solana." },
    { e: "📣", t: "Launch kit", d: "X post, Telegram announcement, share card and proof link, ready to copy.", big: true },
    { e: "🔐", t: "Non-custodial", d: "You sign in your own wallet. The mint key never leaves your browser.", big: true },
  ];
  return (
    <section id="features" className="border-b border-line">
      <div className={`${WRAP} py-16`}>
        <SectionHead kicker="Why ApePad" title={<>Built for <span className="fire-text">the trenches.</span></>} sub="Everything a dev needs on launch day, and everything a trader needs to trust it." />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {f.map((x) => (
            <div key={x.t} className={`group relative overflow-hidden rounded-2xl border border-line bg-panel p-6 transition hover:border-fire/50 ${x.big ? "lg:col-span-2" : ""}`}>
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-fire/0 blur-2xl transition group-hover:bg-fire/15" />
              <div className="text-3xl">{x.e}</div>
              <div className={`mt-4 font-display font-bold uppercase ${x.big ? "text-[24px]" : "text-[18px]"}`}>{x.t}</div>
              <p className="mt-2 text-[13.5px] leading-relaxed text-mute">{x.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================== HOW IT WORKS ============================== */

function HowItWorks() {
  const steps = [
    { n: "01", t: "Connect", d: "Phantom, Solflare or Backpack. Your wallet becomes the creator." },
    { n: "02", t: "Design", d: "Image, name, ticker and lore, or roll the dice. Ticker radar checks for duplicates." },
    { n: "03", t: "Ape in", d: `Set your dev buy and burn, sign once. You get a …${SUFFIX} CA, a live coin and your Ape Proof link.` },
  ];
  return (
    <section className="border-b border-line">
      <div className={`${WRAP} py-16`}>
        <SectionHead kicker="How it works" title="Idea to live coin in 60 seconds." center />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.n} className="relative rounded-2xl border border-line bg-panel p-6">
              <div className="font-display text-[56px] font-bold leading-none text-fire/20">{s.n}</div>
              <div className="mt-3 font-display text-[22px] font-bold uppercase">{s.t}</div>
              <p className="mt-2 text-[14px] leading-relaxed text-mute">{s.d}</p>
              {i < 2 && <div className="absolute -right-3 top-1/2 hidden h-px w-6 bg-fire/40 md:block" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================= TOKEN ================================== */

function TokenSection() {
  const ca = siteConfig.ca.trim();
  return (
    <section id="token" className="border-b border-line">
      <div className={`${WRAP} py-16`}>
        <div className="relative overflow-hidden rounded-3xl border border-fire/30 bg-gradient-to-br from-[#1a1206] via-panel to-panel p-6 sm:p-10">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-flame/25 blur-[100px]" />
          <div className="relative grid items-center gap-8 lg:grid-cols-[auto_1fr_auto]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={siteConfig.logoFull} alt={siteConfig.name} className="h-36 w-36 rounded-2xl border border-line object-cover sm:h-44 sm:w-44" />
            <div className="min-w-0">
              <div className="label text-fire">The pad has a token</div>
              <h2 className="mt-2 font-display text-[40px] font-bold uppercase leading-none sm:text-[54px]">${siteConfig.ticker}</h2>
              <p className="mt-3 max-w-[520px] text-[15px] leading-relaxed text-mute">The token behind {siteConfig.name}. Every coin launched here carries the ape.</p>
              {ca && <CopyCA full className="mt-4 max-w-full" />}
            </div>
            {ca && (
              <div className="flex flex-col gap-2">
                <a href={buyLinks(ca)[0].url} target="_blank" rel="noreferrer" className="btn-fire">
                  Buy ${siteConfig.ticker}
                </a>
                <a href={`/proof/${ca}`} className="btn-ghost">
                  🔍 Our Ape Proof
                </a>
                <a href={solscan(ca)} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1 font-mono text-[11px] text-mute hover:text-fire">
                  Solscan <IExt className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* =================================== FAQ ================================== */

function FAQ() {
  const fee = siteConfig.platformFee;
  const items = [
    { q: "What does it cost to launch?", a: `About 0.02 SOL in network and rent fees, plus your optional dev buy. PumpPortal, which builds the pump.fun transaction, takes 0.5% of the dev buy.${fee.wallet && fee.sol > 0 ? ` ${siteConfig.name} charges ${fee.sol} SOL per launch.` : ` ${siteConfig.name} charges nothing.`}` },
    { q: "What is Ape Proof?", a: "A live page for any pump.fun coin. It finds the creation transaction, reads how much the dev bought, checks the dev wallet's current balance and verifies burns, all straight from Solana." },
    { q: "Can a dev fake their Ape Proof?", a: "The numbers come from the blockchain, not from us or the dev. One limit: it tracks the creator wallet, so moving tokens to another wallet shows as sold." },
    { q: "How does burn at birth work?", a: "After your coin is live, you approve a second small transaction that permanently burns the % you chose. The burn is linked and verified on your Ape Proof page." },
    { q: `How does the …${SUFFIX} address work?`, a: `Your browser generates keypairs until one ends in "${SUFFIX}". Usually a few seconds; you can skip it anytime. The key never leaves your device.` },
    { q: "Who owns the coin?", a: "You do. Your wallet signs the creation transaction and is the creator on pump.fun, so creator rewards go to you." },
  ];
  const [open, setOpen] = useState(0);
  return (
    <section id="faq">
      <div className="mx-auto max-w-[900px] px-4 py-16 sm:px-6">
        <SectionHead kicker="FAQ" title="Before you ape." center />
        <div className="mt-10 space-y-2">
          {items.map((it, i) => (
            <div key={it.q} className={`overflow-hidden rounded-2xl border bg-panel transition ${open === i ? "border-fire/40" : "border-line"}`}>
              <button onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
                <span className="font-display text-[16px] font-bold">{it.q}</span>
                <span className={`font-mono text-lg text-fire transition ${open === i ? "rotate-45" : ""}`}>+</span>
              </button>
              {open === i && <p className="px-5 pb-5 text-[14px] leading-relaxed text-mute">{it.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
