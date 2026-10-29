import { Buffer } from "buffer";
import { Connection, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";

/**
 * Builds a BurnChecked transaction for `pct` % of the owner's balance of `mint`.
 * Works for both SPL Token and Token-2022 (uses the token account's owning program).
 */
export async function buildBurnTx(connection: Connection, owner: PublicKey, mint: PublicKey, pct: number) {
  for (let i = 0; i < 8; i++) {
    const res = await connection.getParsedTokenAccountsByOwner(owner, { mint }).catch(() => null);
    const acc = res?.value?.[0];
    const info = (acc?.account.data as any)?.parsed?.info;
    if (acc && info) {
      const raw = BigInt(info.tokenAmount.amount);
      const decimals: number = info.tokenAmount.decimals;
      if (raw > BigInt(0)) {
        const amount = (raw * BigInt(Math.round(pct * 100))) / BigInt(10000);
        const data = Buffer.alloc(10);
        data.writeUInt8(15, 0); // BurnChecked
        data.writeBigUInt64LE(amount, 1);
        data.writeUInt8(decimals, 9);
        const ix = new TransactionInstruction({
          programId: acc.account.owner,
          keys: [
            { pubkey: acc.pubkey, isSigner: false, isWritable: true },
            { pubkey: mint, isSigner: false, isWritable: true },
            { pubkey: owner, isSigner: true, isWritable: false },
          ],
          data,
        });
        const tx = new Transaction().add(ix);
        tx.feePayer = owner;
        return { tx, ui: Number(amount) / 10 ** decimals };
      }
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  return null;
}
