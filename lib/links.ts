export function buyLinks(ca: string) {
  return [
    { name: "pump.fun", url: `https://pump.fun/coin/${ca}`, note: "Curve / PumpSwap" },
    { name: "Jupiter", url: `https://jup.ag/swap/SOL-${ca}`, note: "Best route" },
    { name: "Axiom", url: `https://axiom.trade/t/${ca}`, note: "Trench terminal" },
    { name: "GMGN", url: `https://gmgn.ai/sol/token/${ca}`, note: "Smart money" },
    { name: "Photon", url: `https://photon-sol.tinyastro.io/en/lp/${ca}`, note: "Fast fills" },
    { name: "DexScreener", url: `https://dexscreener.com/solana/${ca}`, note: "Chart" },
  ];
}
export const solscan = (ca: string) => `https://solscan.io/token/${ca}`;
export const txUrl = (tx: string) => `https://solscan.io/tx/${tx}`;
export const walletUrl = (w: string) => `https://solscan.io/account/${w}`;
