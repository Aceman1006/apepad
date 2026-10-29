// "My launches" — stored in this browser, keyed by wallet.
export type Launch = { mint: string; name: string; symbol: string; image?: string; sig: string; burnSig?: string; ts: number };

const key = (wallet: string) => `apepad:launches:${wallet}`;

export function getLaunches(wallet: string): Launch[] {
  try {
    return JSON.parse(localStorage.getItem(key(wallet)) || "[]");
  } catch {
    return [];
  }
}

export function addLaunch(wallet: string, l: Launch) {
  try {
    const list = [l, ...getLaunches(wallet).filter((x) => x.mint !== l.mint)].slice(0, 50);
    localStorage.setItem(key(wallet), JSON.stringify(list));
  } catch {}
}
