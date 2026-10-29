# APEPAD — apepad.fun

Token launchpad on Solana. Launch it. Prove it.

- **Launch Studio** (wallet-gated): launch a pump.fun coin in one signature
- **…ape vanity CA** on every launch
- **Burn at birth**: burn 10–100% of the dev buy right after launch
- **Ape Proof** (`/proof/<CA>`): live on-chain dev check for ANY pump.fun coin
- Degen dice, ticker radar, launch kit (X/TG posts, share card, proof link), my launches

## Setup (~5 min, all free)
1. **CA**: in `site.config.ts`, paste your coin's CA into `ca: ""` and add your X / Telegram links.
2. **GitHub → Vercel**: push this folder, import it in Vercel, Deploy.
3. **Environment variables** (Vercel → Project → Settings → Environment Variables), then Redeploy:
   - `PINATA_JWT`: **required for launches**. pinata.cloud → API Keys → New Key (Admin) → copy JWT.
   - `RPC_URL`: **required for reliable Ape Proof + launches**. helius.dev → free account → copy your mainnet RPC URL.
4. **Domain**: Vercel → Settings → Domains → add `apepad.fun`.

## Earn per launch (optional)
`site.config.ts` → `platformFee.wallet` = your SOL address, `platformFee.sol` = e.g. 0.05.
Added to the same transaction the user signs and shown in their cost breakdown.

## Branding
`public/mark.png` (icon), `public/logo.jpg` (full logo), `public/og.jpg` (link preview), `app/icon.png` (favicon).
