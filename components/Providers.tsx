"use client";

import { useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

// The ?network= hint makes wallets treat our RPC proxy as mainnet (also on localhost).
// Phantom, Solflare, Backpack and every Wallet-Standard wallet are detected automatically.
export function Providers({ children }: { children: React.ReactNode }) {
  const endpoint = useMemo(
    () => (typeof window === "undefined" ? "https://api.mainnet-beta.solana.com" : `${window.location.origin}/api/rpc?network=https://api.mainnet-beta.solana.com`),
    [],
  );
  return (
    <ConnectionProvider endpoint={endpoint} config={{ commitment: "confirmed" }}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
