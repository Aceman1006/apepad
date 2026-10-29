import type { Metadata, Viewport } from "next";
import "@solana/wallet-adapter-react-ui/styles.css";
import "./globals.css";
import { siteConfig } from "@/site.config";

const title = `${siteConfig.name} — Launch it. Prove it.`;
const description = `Token launchpad on Solana. Launch on pump.fun in one signature, every CA ends in "${siteConfig.vanitySuffix}", and every coin gets a live Ape Proof dev check.`;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl || "http://localhost:3000"),
  title,
  description,
  openGraph: { title, description, images: [siteConfig.ogImage] },
  twitter: { card: "summary_large_image", title, description, images: [siteConfig.ogImage] },
};
export const viewport: Viewport = { themeColor: "#07080a", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}
