import { NextResponse } from "next/server";

// Uploads the token image + metadata JSON to IPFS (Pinata) and returns { metadataUri }.
// Requires PINATA_JWT (free at pinata.cloud) in your Vercel environment variables.
export const dynamic = "force-dynamic";

async function pin(jwt: string, file: Blob, name: string) {
  const fd = new FormData();
  fd.append("network", "public");
  fd.append("name", name);
  fd.append("file", file, name);
  const r = await fetch("https://uploads.pinata.cloud/v3/files", { method: "POST", headers: { Authorization: `Bearer ${jwt}` }, body: fd });
  const j = await r.json().catch(() => null);
  const cid = j?.data?.cid;
  if (!r.ok || !cid) throw new Error(`IPFS upload failed (${r.status})`);
  return `https://ipfs.io/ipfs/${cid}`;
}

export async function POST(req: Request) {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) return NextResponse.json({ error: "Launch setup incomplete: PINATA_JWT is not set on the server" }, { status: 503 });
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof Blob) || file.size === 0) return NextResponse.json({ error: "Image required" }, { status: 400 });
    if (file.size > 4 * 1024 * 1024) return NextResponse.json({ error: "Image must be under 4MB" }, { status: 400 });
    if (!/^image\//.test(file.type)) return NextResponse.json({ error: "File must be an image" }, { status: 400 });

    const s = (k: string, max: number) => String(form.get(k) ?? "").trim().slice(0, max);
    const name = s("name", 32);
    const symbol = s("symbol", 10);
    if (!name || !symbol) return NextResponse.json({ error: "Name and ticker required" }, { status: 400 });

    const ext = (file.type.split("/")[1] || "png").replace("jpeg", "jpg");
    const image = await pin(jwt, file, `${symbol}.${ext}`);
    const meta = {
      name,
      symbol,
      description: s("description", 500),
      image,
      showName: true,
      createdOn: "https://pump.fun",
      twitter: s("twitter", 200),
      telegram: s("telegram", 200),
      website: s("website", 200),
    };
    const metadataUri = await pin(jwt, new Blob([JSON.stringify(meta)], { type: "application/json" }), `${symbol}.json`);
    return NextResponse.json({ metadataUri });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Metadata upload failed" }, { status: 502 });
  }
}
