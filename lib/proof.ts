// Ape Proof — live, on-chain dev check for any pump.fun coin.
import { Connection, PublicKey, type ParsedTransactionWithMeta } from "@solana/web3.js";

export const PUMP_SUPPLY = 1_000_000_000;

export type Proof = {
  mint: string;
  name?: string;
  symbol?: string;
  image?: string;
  dev?: string;
  createdAt?: number; // ms
  createSig?: string;
  devInitial?: number; // tokens bought by dev in the creation tx
  devNow?: number;
  supply?: number; // current supply (burns reduce it)
  burnedAtBirth?: number;
  burnSig?: string;
  marketCap?: number;
  priceUsd?: number;
  dexUrl?: string;
  onCurve?: boolean;
  status: "HOLDING" | "ADDED" | "TRIMMED" | "SOLD" | "NO_DEV_BUY" | "UNKNOWN";
  notes: string[];
};

const num = (v: unknown) => Number(v ?? 0) || 0;

function uiBalance(tx: ParsedTransactionWithMeta, mint: string, owner: string, which: "pre" | "post") {
  const list = (which === "pre" ? tx.meta?.preTokenBalances : tx.meta?.postTokenBalances) ?? [];
  return list.filter((b) => b.mint === mint && b.owner === owner).reduce((s, b) => s + num(b.uiTokenAmount.uiAmount), 0);
}

/** Oldest signature for the mint = its creation transaction (scans up to `pages` × 1000 sigs). */
async function findCreation(conn: Connection, mint: PublicKey, pages = 4) {
  let before: string | undefined;
  let oldest: string | undefined;
  for (let i = 0; i < pages; i++) {
    const sigs = await conn.getSignaturesForAddress(mint, { before, limit: 1000 });
    if (!sigs.length) break;
    oldest = sigs[sigs.length - 1].signature;
    if (sigs.length < 1000) return oldest;
    before = oldest;
  }
  return undefined; // too much history to reach the start
}

export async function buildProof(conn: Connection, mintStr: string, txHint?: string | null, burnHint?: string | null): Promise<Proof> {
  const mint = new PublicKey(mintStr);
  const p: Proof = { mint: mintStr, status: "UNKNOWN", notes: [] };

  // Market snapshot (DexScreener, browser-friendly)
  const dex = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${mintStr}`).then((r) => r.json()).catch(() => null);
  const pairs = (dex?.pairs ?? []).filter((x: any) => x.chainId === "solana" && x.baseToken?.address === mintStr);
  pairs.sort((a: any, b: any) => num(b.liquidity?.usd) - num(a.liquidity?.usd) || num(b.volume?.h24) - num(a.volume?.h24));
  const pair = pairs[0];
  if (pair) {
    p.name = pair.baseToken?.name;
    p.symbol = pair.baseToken?.symbol;
    p.image = pair.info?.imageUrl;
    p.marketCap = num(pair.marketCap || pair.fdv);
    p.priceUsd = num(pair.priceUsd);
    p.dexUrl = pair.url;
    p.onCurve = pair.dexId === "pumpfun";
  }

  // Supply (burns lower it below 1B)
  const sup = await conn.getTokenSupply(mint).catch(() => null);
  if (sup) p.supply = num(sup.value.uiAmount);

  // Creation tx → dev + initial dev buy
  const createSig = txHint || (await findCreation(conn, mint).catch(() => undefined));
  if (createSig) {
    const tx = await conn.getParsedTransaction(createSig, { maxSupportedTransactionVersion: 1, commitment: "confirmed" }).catch(() => null);
    const keys = tx?.transaction.message.accountKeys ?? [];
    const createsMint = keys.some((k) => k.pubkey.toBase58() === mintStr && k.signer);
    if (tx && createsMint) {
      p.createSig = createSig;
      p.dev = keys[0].pubkey.toBase58();
      p.createdAt = tx.blockTime ? tx.blockTime * 1000 : undefined;
      p.devInitial = Math.max(0, uiBalance(tx, mintStr, p.dev, "post") - uiBalance(tx, mintStr, p.dev, "pre"));
    } else if (txHint) {
      p.notes.push("The creation transaction in this link doesn't match this coin.");
    }
  } else {
    p.notes.push("This coin has too much history to find its creation transaction. Showing live data only.");
  }

  // Burn at birth (verified from the burn tx)
  if (burnHint && p.dev) {
    const btx = await conn.getParsedTransaction(burnHint, { maxSupportedTransactionVersion: 1, commitment: "confirmed" }).catch(() => null);
    let burned = 0;
    for (const ix of (btx?.transaction.message.instructions ?? []) as any[]) {
      const t = ix?.parsed?.type;
      const info = ix?.parsed?.info;
      if ((t === "burnChecked" || t === "burn") && info?.mint === mintStr && info?.authority === p.dev) {
        burned += num(info.tokenAmount?.uiAmount ?? num(info.amount) / 1e6);
      }
    }
    if (burned > 0) {
      p.burnedAtBirth = burned;
      p.burnSig = burnHint;
    }
  }

  // Dev holdings now
  if (p.dev) {
    const accs = await conn.getParsedTokenAccountsByOwner(new PublicKey(p.dev), { mint }).catch(() => null);
    p.devNow = (accs?.value ?? []).reduce((s, a) => s + num((a.account.data as any).parsed?.info?.tokenAmount?.uiAmount), 0);

    const initial = p.devInitial ?? 0;
    const expected = Math.max(0, initial - (p.burnedAtBirth ?? 0));
    if (initial <= 0) p.status = p.devNow > 0 ? "ADDED" : "NO_DEV_BUY";
    else if (p.devNow > expected * 1.01) p.status = "ADDED";
    else if (p.devNow >= expected * 0.99) p.status = "HOLDING";
    else if (p.devNow >= expected * 0.25) p.status = "TRIMMED";
    else p.status = "SOLD";
  }
  return p;
}
