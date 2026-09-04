export interface TraitDefinition {
  name: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic' | 'Secret' | 'Celestial' | '???' | 'Overseer' | 'Arcane' | 'The Chillful';
  description: string;
  color: string;
  weight: number; // For rolling logic
  damageMultiplier?: number;
  rangeMultiplier?: number;
  fireRateMultiplier?: number; // e.g. 0.7 means fires 30% faster (shorter delay)
  cooldownReduction?: number; // e.g. 0.10 means 10% shorter ability cooldown
}

export const TRAITS: Record<string, TraitDefinition> = {
  Normal: {
    name: "Normal",
    rarity: "Common",
    description: "Standard stats. No special modifications.",
    color: "#64748b",
    weight: 20,
  },
  Mighty: {
    name: "Mighty",
    rarity: "Rare",
    description: "+45% Attack Damage to vaporize targets.",
    color: "#22c55e",
    weight: 25,
    damageMultiplier: 1.45,
  },
  Swift: {
    name: "Swift",
    rarity: "Rare",
    description: "+40% Attacks Speed for rapid fire combat.",
    color: "#3b82f6",
    weight: 25,
    fireRateMultiplier: 0.71, // 1 / 1.4 ≈ 0.71
  },
  Deadeye: {
    name: "Deadeye",
    rarity: "Epic",
    description: "+45% Attack Range and +15% Damage.",
    color: "#ec4899",
    weight: 15,
    rangeMultiplier: 1.45,
    damageMultiplier: 1.15,
  },
  Demonic: {
    name: "Demonic",
    rarity: "Legendary",
    description: "+75% Damage, +45% Speed, but -10% Range.",
    color: "#ef4444",
    weight: 9,
    damageMultiplier: 1.75,
    rangeMultiplier: 0.90,
    fireRateMultiplier: 0.69,
  },
  Cosmic: {
    name: "Cosmic",
    rarity: "Mythic",
    description: "+95% Damage, +30% Speed, and +25% Range.",
    color: "#a855f7",
    weight: 4.5,
    damageMultiplier: 1.95,
    rangeMultiplier: 1.25,
    fireRateMultiplier: 0.77,
  },
  Glitch: {
    name: "Glitch",
    rarity: "Secret",
    description: "Deals extremely unstable damage (0.5x to 5x), with +30% speed.",
    color: "#06b6d4",
    weight: 1.2,
    damageMultiplier: 2.22, // average high multiplier
    fireRateMultiplier: 0.77,
  },
  Godly: {
    name: "Godly",
    rarity: "Celestial",
    description: "+250% Damage, +40% Range, and +25% Speed.",
    color: "#eab308",
    weight: 0.3,
    damageMultiplier: 3.50,
    rangeMultiplier: 1.40,
    fireRateMultiplier: 0.80,
  },
  CosmicDeity: {
    name: "Cosmic Deity",
    rarity: "Celestial",
    description: "+350% Damage, +50% Range, and +35% Speed.",
    color: "#38bdf8",
    weight: 0.2,
    damageMultiplier: 4.50,
    rangeMultiplier: 1.50,
    fireRateMultiplier: 0.74, // 1 / 1.35 ≈ 0.74
  },
  Genesis: {
    name: "Genesis",
    rarity: "Celestial",
    description: "+450% Damage, +60% Range, and +40% Speed.",
    color: "#f43f5e",
    weight: 0.15,
    damageMultiplier: 5.50,
    rangeMultiplier: 1.60,
    fireRateMultiplier: 0.71, // 1 / 1.40 ≈ 0.71
  },
  AstraDominus: {
    name: "Astra Dominus",
    rarity: "Celestial",
    description: "+600% Damage, +80% Range, and +50% Speed.",
    color: "#a855f7",
    weight: 0.1,
    damageMultiplier: 7.00,
    rangeMultiplier: 1.80,
    fireRateMultiplier: 0.67, // 1 / 1.50 ≈ 0.67
  },
  Infinity: {
    name: "Infinity",
    rarity: "Celestial",
    description: "+800% Damage, +100% Range, and +60% Speed.",
    color: "#fb7185",
    weight: 0.05,
    damageMultiplier: 9.00,
    rangeMultiplier: 2.00,
    fireRateMultiplier: 0.625, // 1 / 1.60 = 0.625
  },
  '???': {
    name: "???",
    rarity: "???",
    description: "Anomalous reality rupture. +2000% Attack Damage, +150% Attack Range, +200% Attack Speed.",
    color: "#ffffff",
    weight: 0.005,
    damageMultiplier: 21.00,
    rangeMultiplier: 2.50,
    fireRateMultiplier: 0.33,
  },
  EyeOfGod: {
    name: "Eye of God",
    rarity: "Overseer",
    description: "Witness of all dimensions. +2500% Attack Damage, +120% Attack Range, +150% Attack Speed.",
    color: "#00ffcc",
    weight: 0,
    damageMultiplier: 26.00,
    rangeMultiplier: 2.20,
    fireRateMultiplier: 0.40,
  },
  DeathOfWorld: {
    name: "Death of World",
    rarity: "Arcane",
    description: "Supreme Reality Rupture: Buffs EVERYTHING x100 times (+9900% Damage, +9900% Range, 100x Attack Speed, and 100x Global Power)!",
    color: "#c084fc",
    weight: 0.001,
    damageMultiplier: 100.0,
    rangeMultiplier: 100.0,
    fireRateMultiplier: 0.01,
  },
  TheChillHypnotize: {
    name: "The Chill Hypnotize",
    rarity: "The Chillful",
    description: "Serene Ultrasonic Vibes: Hypnotizes up to 10 bad beasts and hunters in range into turning against the enemy horde with +150% Aura Range.",
    color: "#84cc16",
    weight: 0.005,
    rangeMultiplier: 1.5,
  },
  Motivation: {
    name: "Motivation",
    rarity: "The Chillful",
    description: "Tranquil Motivation: Permanent locked trait of the Capybara that buffs damage by x200 (+19,900%) and reduces ability cooldowns by 10%.",
    color: "#84cc16",
    weight: 0,
    damageMultiplier: 200.0,
    cooldownReduction: 0.10,
  },
};

export function getRandomTrait(): string {
  const list = Object.keys(TRAITS);
  const totalWeight = list.reduce((sum, key) => sum + TRAITS[key].weight, 0);
  let roll = Math.random() * totalWeight;
  
  for (const key of list) {
    roll -= TRAITS[key].weight;
    if (roll <= 0) {
      return key;
    }
  }
  return "Normal";
}
