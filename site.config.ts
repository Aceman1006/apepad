// ============================================================================
//  APEPAD SITE CONFIG — the only file you edit.
// ============================================================================

export const siteConfig = {
  // ---- YOUR TOKEN ---------------------------------------------------------
  ca: "", // <-- PASTE YOUR COIN'S PUMP.FUN CA HERE (Buy button + CA copy)
  name: "APEPAD",
  ticker: "APEPAD",
  siteUrl: "https://apepad.fun",
  logo: "/mark.png", // small icon (nav)
  logoFull: "/logo.jpg", // full logo
  ogImage: "/og.jpg", // link preview image

  // ---- SOCIALS (leave "" to hide) -----------------------------------------
  socials: {
    x: "",
    telegram: "",
    discord: "",
  },

  // ---- LAUNCHPAD ----------------------------------------------------------
  // Every coin launched here gets a contract address ending in this.
  vanitySuffix: "ape",

  // Optional platform fee per launch, paid to your wallet (shown to users).
  platformFee: {
    wallet: "",
    sol: 0,
  },
};
