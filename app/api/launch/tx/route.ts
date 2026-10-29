import { NextResponse } from "next/server";

// Builds the pump.fun create transaction via PumpPortal's Local Transaction API.
// The transaction is returned UNSIGNED; the user's wallet signs it in the browser.
export const dynamic = "force-dynamic";
const B58 = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b || !B58.test(b.publicKey) || !B58.test(b.mint) || !b.uri || !b.name || !b.symbol) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const amount = Math.max(0, Math.min(85, Number(b.amount) || 0));
  const r = await fetch("https://pumpportal.fun/api/trade-local", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      publicKey: b.publicKey,
      action: "create",
      tokenMetadata: { name: String(b.name).slice(0, 32), symbol: String(b.symbol).slice(0, 10), uri: b.uri },
      mint: b.mint,
      denominatedInSol: "true",
      amount,
      slippage: 10,
      priorityFee: 0.0005,
      pool: "pump",
    }),
  });
  if (r.status !== 200) {
    const t = await r.text().catch(() => "");
    return NextResponse.json({ error: `Could not build transaction (${r.status}) ${t.slice(0, 120)}` }, { status: 502 });
  }
  const buf = Buffer.from(await r.arrayBuffer());
  return NextResponse.json({ tx: buf.toString("base64") });
}
