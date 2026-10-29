import { NextResponse } from "next/server";

// Solana RPC proxy for the launch studio + Ape Proof.
// Set RPC_URL in Vercel (free Helius URL recommended). Falls back to public endpoints.
export const dynamic = "force-dynamic";

const ENDPOINTS = [process.env.RPC_URL, "https://api.mainnet-beta.solana.com", "https://solana-rpc.publicnode.com"].filter(Boolean) as string[];

const ALLOWED = new Set([
  "getTransaction",
  "getSignaturesForAddress",
  "getTokenAccountsByOwner",
  "getTokenSupply",
  "getTokenAccountBalance",
  "getBalance",
  "getSignatureStatuses",
  "getLatestBlockhash",
  "sendTransaction",
  "getAccountInfo",
  "getMinimumBalanceForRentExemption",
  "getSlot",
  "getGenesisHash",
  "getVersion",
]);

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const calls = Array.isArray(body) ? body : [body];
  if (!body || calls.some((c) => !c || !ALLOWED.has(c.method))) {
    return NextResponse.json({ jsonrpc: "2.0", id: null, error: { code: -32601, message: "Method not allowed" } }, { status: 400 });
  }
  const payload = JSON.stringify(body);
  let last: Response | null = null;
  for (const url of ENDPOINTS) {
    try {
      const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: payload });
      const text = await r.text();
      // retry on rate-limit / forbidden / provider-specific refusals
      if (r.status === 403 || r.status === 429 || r.status >= 500 || /personal token|Access forbidden/i.test(text)) {
        last = r;
        continue;
      }
      return new NextResponse(text, { status: r.status, headers: { "Content-Type": "application/json" } });
    } catch {
      continue;
    }
  }
  return NextResponse.json({ jsonrpc: "2.0", id: (calls[0] as any)?.id ?? null, error: { code: -32000, message: "RPC unavailable. Set RPC_URL." } }, { status: last?.status ?? 502 });
}
