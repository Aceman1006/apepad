import { Keypair } from "@solana/web3.js";

export async function vanitySupported() {
  try {
    await crypto.subtle.generateKey({ name: "Ed25519" } as any, true, ["sign"]);
    return typeof Worker !== "undefined";
  } catch {
    return false;
  }
}

/** Finds a keypair whose address ends with `suffix`. Resolves null on timeout/cancel. */
export function grindVanity(suffix: string, onProgress: (tries: number) => void, timeoutMs = 90_000): { promise: Promise<Keypair | null>; cancel: () => void } {
  const n = Math.max(1, Math.min(8, (navigator.hardwareConcurrency || 4) - 1));
  const workers: Worker[] = [];
  let tries = 0;
  let done = false;
  let resolveFn: (k: Keypair | null) => void = () => {};

  const finish = (k: Keypair | null) => {
    if (done) return;
    done = true;
    workers.forEach((w) => w.terminate());
    clearTimeout(timer);
    resolveFn(k);
  };

  const promise = new Promise<Keypair | null>((resolve) => {
    resolveFn = resolve;
    for (let i = 0; i < n; i++) {
      const w = new Worker(new URL("./vanity.worker.ts", import.meta.url));
      w.onmessage = (e) => {
        if (e.data.tries) {
          tries += e.data.tries;
          onProgress(tries);
        } else if (e.data.seed) {
          const kp = Keypair.fromSeed(Uint8Array.from(e.data.seed));
          if (kp.publicKey.toBase58().endsWith(suffix)) finish(kp);
        }
      };
      w.onerror = () => finish(null);
      w.postMessage({ suffix });
      workers.push(w);
    }
  });
  const timer = setTimeout(() => finish(null), timeoutMs);
  return { promise, cancel: () => finish(null) };
}
