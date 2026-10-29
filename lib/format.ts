export function compact(n: number | undefined, prefix = "$"): string {
  if (n === undefined || !isFinite(n)) return "—";
  const a = Math.abs(n);
  const s =
    a >= 1e9 ? (n / 1e9).toFixed(2) + "B" :
    a >= 1e6 ? (n / 1e6).toFixed(2) + "M" :
    a >= 1e3 ? (n / 1e3).toFixed(1) + "K" :
    n.toFixed(a < 10 ? 2 : 0);
  return prefix + s;
}

/** Tiny prices like 0.0000412 → $0.0₄412 */
export function price(n: number | undefined): string {
  if (n === undefined || !isFinite(n) || n === 0) return "—";
  if (n >= 1) return "$" + n.toFixed(4);
  if (n >= 0.001) return "$" + n.toFixed(6);
  const str = n.toFixed(20);
  const m = str.match(/^0\.(0+)(\d{4})/);
  if (!m) return "$" + n.toPrecision(4);
  const sub = "₀₁₂₃₄₅₆₇₈₉";
  const zeros = String(m[1].length).split("").map((d) => sub[+d]).join("");
  return `$0.0${zeros}${m[2]}`;
}

export function pct(n: number | undefined): string {
  if (n === undefined || !isFinite(n)) return "—";
  return (n >= 0 ? "+" : "") + n.toFixed(Math.abs(n) >= 100 ? 0 : 1) + "%";
}

export function shortAddr(a: string, l = 4, r = 4): string {
  if (!a) return "";
  return a.length <= l + r + 1 ? a : `${a.slice(0, l)}…${a.slice(-r)}`;
}

export function ago(ts: number): string {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return s + "s";
  const m = Math.floor(s / 60);
  if (m < 60) return m + "m";
  const h = Math.floor(m / 60);
  if (h < 48) return h + "h";
  return Math.floor(h / 24) + "d";
}

export function tokens(n: number): string {
  return compact(n, "");
}
