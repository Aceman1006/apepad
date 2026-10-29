// pump.fun bonding-curve math (initial virtual reserves: 30 SOL / 1.073B tokens).
const V_SOL = 30;
const V_TOKENS = 1_073_000_000;
const TOTAL_SUPPLY = 1_000_000_000;

/** Tokens received for a dev buy of `sol` (before fees). */
export function devBuyTokens(sol: number) {
  if (!(sol > 0)) return 0;
  const k = V_SOL * V_TOKENS;
  return V_TOKENS - k / (V_SOL + sol);
}

export function devBuyPct(sol: number) {
  return (devBuyTokens(sol) / TOTAL_SUPPLY) * 100;
}
