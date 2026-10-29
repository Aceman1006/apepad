// 🎲 Degen coin generator — random name / ticker / lore.
const A = ["Based", "Feral", "Sigma", "Turbo", "Cosmic", "Silly", "Giga", "Rich", "Angry", "Sleepy", "Golden", "Unemployed", "Diamond", "Chad", "Tiny", "Mega", "Lunar", "Wet", "Crying", "Jacked", "Haunted", "Rogue", "Bullish", "Sad"];
const N = ["Ape", "Banana", "Gorilla", "Monke", "Frog", "Hamster", "Cat", "Dog", "Pepe", "Whale", "Goblin", "Penguin", "Capybara", "Raccoon", "Shrimp", "Duck", "Toad", "Possum", "Otter", "Wizard", "Intern", "Trader", "Jeet", "Chimp", "Lemur"];
const LORE = [
  "Escaped the zoo with one goal: a billion market cap.",
  "Sold everything for bananas. Regrets nothing.",
  "Born on the curve, raised in the trenches.",
  "Not financial advice. Just vibes and a dream.",
  "The only coin your wife's boyfriend can't fade.",
  "Holders get absolutely nothing. Holding anyway.",
  "Started as a joke. Still a joke. Sending anyway.",
  "Apes together strong. Jeets together poor.",
];

const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

export function randomCoin() {
  const adj = pick(A);
  const noun = pick(N);
  const name = `${adj} ${noun}`;
  const styles = [
    () => noun.toUpperCase(),
    () => (adj.slice(0, 1) + noun).toUpperCase(),
    () => (adj + noun).toUpperCase(),
    () => (adj.slice(0, 3) + noun.slice(0, 4)).toUpperCase(),
  ];
  let symbol = pick(styles)();
  if (symbol.length > 10) symbol = noun.toUpperCase().slice(0, 10);
  return { name, symbol, description: pick(LORE) };
}
