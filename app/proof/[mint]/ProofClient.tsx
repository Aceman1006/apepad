"use client";

import dynamic from "next/dynamic";
import { Frame } from "@/components/Frame";

const ProofView = dynamic(() => import("@/components/ProofView").then((m) => m.ProofView), {
  ssr: false,
  loading: () => <div className="mx-auto h-[600px] max-w-[1100px] animate-pulse px-4 py-10" />,
});

export function ProofClient({ mint, tx, burn }: { mint: string; tx: string | null; burn: string | null }) {
  return (
    <Frame>
      <ProofView mint={mint} tx={tx} burn={burn} />
    </Frame>
  );
}
