import type { Metadata } from "next";
import { siteConfig } from "@/site.config";
import { ProofClient } from "./ProofClient";

export function generateMetadata({ params }: { params: { mint: string } }): Metadata {
  const title = `Ape Proof · ${params.mint.slice(0, 4)}…${params.mint.slice(-4)} | ${siteConfig.name}`;
  const description = "Live on-chain dev check: what the creator bought at launch, what they hold now, and what they burned.";
  return { title, description, openGraph: { title, description, images: [siteConfig.ogImage] }, twitter: { card: "summary_large_image", title, description, images: [siteConfig.ogImage] } };
}

export default function Page({ params, searchParams }: { params: { mint: string }; searchParams: { tx?: string; burn?: string } }) {
  return <ProofClient mint={params.mint} tx={searchParams.tx ?? null} burn={searchParams.burn ?? null} />;
}
