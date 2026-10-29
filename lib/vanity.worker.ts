/// <reference lib="webworker" />
// Grinds Ed25519 keypairs until the base58 address ends with `suffix`.
// Uses the browser's native WebCrypto Ed25519 (fast) and checks the suffix with
// modular math instead of encoding every key.
const A = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const ctx = self as unknown as DedicatedWorkerGlobalScope;

ctx.onmessage = async (e: MessageEvent<{ suffix: string }>) => {
  const suffix = e.data.suffix;
  let target = 0;
  for (const ch of suffix) target = target * 58 + A.indexOf(ch);
  const M = 58 ** suffix.length;
  const subtle = crypto.subtle;

  for (;;) {
    const keys = await Promise.all(
      Array.from({ length: 128 }, () => subtle.generateKey({ name: "Ed25519" } as any, true, ["sign"]) as Promise<CryptoKeyPair>),
    );
    const raws = await Promise.all(keys.map((k) => subtle.exportKey("raw", k.publicKey)));
    for (let i = 0; i < raws.length; i++) {
      const b = new Uint8Array(raws[i]);
      let r = 0;
      for (let j = 0; j < b.length; j++) r = (r * 256 + b[j]) % M;
      if (r === target) {
        const pkcs8 = new Uint8Array(await subtle.exportKey("pkcs8", keys[i].privateKey));
        ctx.postMessage({ seed: Array.from(pkcs8.slice(16, 48)) });
        return;
      }
    }
    ctx.postMessage({ tries: 128 });
  }
};

export {};
