import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#07080a",
        panel: "#0e1013",
        panel2: "#14171b",
        line: "#1f2329",
        ink: "#f4f4f2",
        mute: "#878d96",
        fire: "#ffc83d",
        flame: "#ff7a18",
        buy: "#a3ff47",
        sell: "#ff4d5e",
      },
      fontFamily: {
        display: ["'Chakra Petch'", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      keyframes: {
        tape: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
        flicker: { "0%,100%": { opacity: "1", transform: "scaleY(1)" }, "50%": { opacity: ".75", transform: "scaleY(1.25)" } },
        rise: { "0%": { transform: "translateY(0)" }, "100%": { transform: "translateY(-140vh)" } },
        pulseDot: { "0%,100%": { opacity: "1" }, "50%": { opacity: ".3" } },
        slideIn: { "0%": { opacity: "0", transform: "translateY(-6px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
      },
      animation: {
        tape: "tape 40s linear infinite",
        flicker: "flicker .12s ease-in-out infinite",
        rise: "rise 2.4s cubic-bezier(.5,0,.75,0) forwards",
        pulseDot: "pulseDot 1.4s ease-in-out infinite",
        slideIn: "slideIn .35s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
