export type RelicRarity = 'Ancient' | 'Mythic' | 'Cosmic' | 'Divine';
export type RelicCategory = 'Offense' | 'Cooldown' | 'Economy' | 'Range' | 'Cosmic' | 'Defense' | 'Critical';

export interface RelicDef {
  id: string;
  name: string;
  emoji: string;
  category: RelicCategory;
  rarity: RelicRarity;
  description: string;
  bonus: string;
  detailedEffect: string;
  mechanicsNotes: string[];
  bestSynergy: string;
  howToObtain: string;
  dropRateText: string;
  costType: 'capyCoins' | 'shardsOfGods' | 'dna';
  costAmount: number;
  color: string;
}

export const RELICS: RelicDef[] = [
  {
    id: 'primal_hearthstone',
    name: 'Primal Hearthstone',
    emoji: '🔥',
    category: 'Offense',
    rarity: 'Ancient',
    description: 'An ancient volcanic core radiating primordial heat, driving all defensive beasts into a frenzied rage.',
    bonus: '+30% Global Tower Damage',
    detailedEffect: 'Empowers all deployed animal towers with a flat +30% raw damage multiplier (1.30x). Multiplies with individual animal traits (Brutal, Cosmic, Titan), environmental hazard bonuses, and level scalings.',
    mechanicsNotes: [
      'Applies globally to all deployed units regardless of rarity or element.',
      'Stacks multiplicatively with badge attack titles and mastery titles.',
      'Amplifies normal basic hits, area-of-effect blasts, and offensive active skills.'
    ],
    bestSynergy: 'Titans, Apex Predators (T-Rex, Phoenix, Dragon), and rapid multi-hit attackers (Cheetah, Falcon, Wolf).',
    howToObtain: 'Defeat any Stage Boss at Wave 10+, clear Wave 10 milestone, or forge in the Relic Vault.',
    dropRateText: 'Guaranteed at Wave 10 Milestone • 35% on Stage Boss Kills',
    costType: 'dna',
    costAmount: 50000,
    color: '#ef4444'
  },
  {
    id: 'chrono_hourglass',
    name: 'Chrono Hourglass',
    emoji: '⏳',
    category: 'Cooldown',
    rarity: 'Cosmic',
    description: 'A pocket timepiece carved from collapsed hypernovas, bending the laws of chronological flow for all defenders.',
    bonus: '-30% Global Active Skill Cooldown',
    detailedEffect: 'Compresses spacetime around your towers, reducing the cooldown delay of all ultimate abilities and active skills by 30% (0.70x cooldown multiplier).',
    mechanicsNotes: [
      'Shortens Overseer, Celestial, Secret, and Mythic special skill intervals.',
      'Allows Titans to re-trigger ground trembles and laser sweeps significantly faster.',
      'Stacks with speed and cooldown modifiers from traits and quick-cast buffs.'
    ],
    bestSynergy: 'Celestial Seraph, Void Kitsune, Mecha Cyber Rex, Overseers, and Titan Defenders.',
    howToObtain: 'Defeat high-ranking Hunter Commanders (Wave 20+), Boss Rush mode, or forge in the Relic Vault.',
    dropRateText: 'Guaranteed at Wave 25 Milestone • 40% on Boss Rush Kills',
    costType: 'shardsOfGods',
    costAmount: 100,
    color: '#3b82f6'
  },
  {
    id: 'capy_citrus',
    name: "Capy's Golden Citrus",
    emoji: '🍊',
    category: 'Economy',
    rarity: 'Divine',
    description: 'A sovereign support fruit imbued with pure chill energy, dramatically enhancing resource generation and food production.',
    bonus: '+50% Support/Generator Meat Yield',
    detailedEffect: 'Infuses all resource generator and support units (e.g. Golden Bee, Capybara) with golden solar nutrients, increasing their Meat generation by a massive +50% on every production cycle.',
    mechanicsNotes: [
      'Scales with generator tower levels (e.g., Level 5+ Golden Bees yield huge bonus meat).',
      'Provides the necessary funding for early legendary deployments and pinnacle upgrades.',
      'Stacks with economic badge titles like "🥩 MEAT BARON" and "🍊 CHILL MASTER".'
    ],
    bestSynergy: 'Golden Bee, The Chillful Capybara, and high-economy farming setups.',
    howToObtain: 'Complete Capybara special missions, defeat Wave 15 Chill Bosses, or forge in Relic Vault.',
    dropRateText: 'Guaranteed at Wave 15 Milestone • 30% on Hunter Operative Defeats',
    costType: 'capyCoins',
    costAmount: 50,
    color: '#eab308'
  },
  {
    id: 'quantum_magnet',
    name: 'Quantum Magnet',
    emoji: '🧲',
    category: 'Range',
    rarity: 'Ancient',
    description: 'A synthesized magnetic array capable of warping localized spacetime boundaries inward toward the battlefield.',
    bonus: '+40% Global Tower Attack Range',
    detailedEffect: 'Expands the targeting radar and projectile velocity of all deployed animal towers by +40% (1.40x range radius). Towers can cover multiple roadway lanes from distant corners.',
    mechanicsNotes: [
      'Turns short-range brawlers into versatile mid-range threats.',
      'Allows snipers like Golden Eagle, Frost Owl, and Astra Leviathan to cover the entire arena map.',
      'Maximizes coverage from tactical S-Tier and Apex chokepoint positions.'
    ],
    bestSynergy: 'Sniper & Long-Range units (Eagle, Owl, Seraph Dragon, Kitsune) and AoE Crowd Controllers.',
    howToObtain: 'Defeat Mechagodzilla or Cyber Titan bosses, clear Wave 30, or forge in Relic Vault.',
    dropRateText: 'Guaranteed at Wave 30 Milestone • 35% on Cyber Enemy Kills',
    costType: 'dna',
    costAmount: 100000,
    color: '#06b6d4'
  },
  {
    id: 'double_helix',
    name: 'Double Helix Genome',
    emoji: '🧬',
    category: 'Economy',
    rarity: 'Mythic',
    description: 'A pure crystalline sequence mapping ancient evolutionary codes of prehistoric behemoths and genetic duplicates.',
    bonus: '+60% DNA Shard Recycling Boost',
    detailedEffect: 'Maximizes genetic salvage efficiency, granting +60% more DNA Shards whenever duplicate animals are summoned, recycled, or sold from your backpack inventory.',
    mechanicsNotes: [
      'Boosts DNA compensation on duplicate gacha draws across all rarities.',
      'Significantly accelerates DNA accumulation for trait rerolling and Vault forges.',
      'Pairs with auto-summon and giga-gacha mechanics for massive DNA dividends.'
    ],
    bestSynergy: 'Gacha summoners, inventory recyclers, and players hunting for ??? Mystery Traits.',
    howToObtain: 'Defeat Ultra World Boss, clear Wave 50, or forge in the Relic Vault.',
    dropRateText: 'Guaranteed at Wave 50 Milestone • 40% on True Hell Boss Kills',
    costType: 'capyCoins',
    costAmount: 30,
    color: '#10b981'
  },
  {
    id: 'cosmic_singularity',
    name: 'Cosmic Singularity',
    emoji: '🌌',
    category: 'Cosmic',
    rarity: 'Cosmic',
    description: 'A localized micro-singularity that collapses the dimensional matrix, instantly shredding massive HP from major threats.',
    bonus: 'Instantly drains 15% of Boss health on spawn',
    detailedEffect: 'The moment any Boss, Hunter Commander, or Ultra World Boss enters the battlefield, a dimensional gravity pulse triggers, instantly stripping 15% of their maximum health.',
    mechanicsNotes: [
      'Triggers once per spawned Boss before towers start firing.',
      'Works in Normal, Hardcore, Boss Rush, and True Hell difficulty modes.',
      'Saves millions to trillions of damage on end-game World Boss encounters.'
    ],
    bestSynergy: 'Boss Rush mode, True Hell difficulty, and Sudden Death trials.',
    howToObtain: 'Defeat the Ultra World Boss or achieve Wave 100 milestone, or forge in Relic Vault.',
    dropRateText: 'Guaranteed on Ultra World Boss Defeat • 100% on Wave 100 Clear',
    costType: 'shardsOfGods',
    costAmount: 250,
    color: '#8b5cf6'
  },
  {
    id: 'primal_aegis',
    name: 'Primal Aegis of Immortality',
    emoji: '🛡️',
    category: 'Defense',
    rarity: 'Divine',
    description: 'An ethereal crystalline bulwark forged by ancient guardians, restoring stronghold structural integrity after every wave.',
    bonus: 'Restores +20% Base HP per wave clear & -50% Boss Freeze/Stun duration',
    detailedEffect: 'Upon clearing each enemy wave, immediately repairs and heals your Base HP by 20% of its maximum threshold. Furthermore, cuts the duration of enemy freeze/stun missiles in half.',
    mechanicsNotes: [
      'Provides vital sustain during prolonged high-wave runs and Hardcore/True Hell trials.',
      'Protects defensive towers from being permanently locked down by cyber stuns.',
      'Heals up to 100% maximum Base HP cap.'
    ],
    bestSynergy: 'Hardcore difficulty, True Hell survival, and players facing Cyber Trappers & Stun Missiles.',
    howToObtain: 'Clear Wave 40 in Hardcore or Boss Rush mode, or forge in Relic Vault.',
    dropRateText: 'Guaranteed at Wave 40 Hardcore Milestone • 30% on Heavy Boss Kills',
    costType: 'shardsOfGods',
    costAmount: 180,
    color: '#38bdf8'
  },
  {
    id: 'void_core',
    name: 'Void Core of the Ancients',
    emoji: '⚡',
    category: 'Critical',
    rarity: 'Mythic',
    description: 'A crackling hyper-dense sphere of dark plasma that supercharges defensive projectile impacts with catastrophic critical force.',
    bonus: '+25% Critical Hit Chance & +50% Critical Damage',
    detailedEffect: 'Infuses all tower projectiles with devastating dark plasma, increasing base Critical Hit Chance by +25% and amplifying all Critical Hit damage multipliers by an additional +50%.',
    mechanicsNotes: [
      'Enables normal non-crit towers to frequently unleash high-tier yellow/red critical numbers.',
      'Stacks with animal innate crit rates and the "⚡ LIGHTNING CRIT" trait.',
      'Applies to single-target hits, piercing lasers, and AoE shockwaves.'
    ],
    bestSynergy: 'High-speed brawlers (Cheetah, Fox, Raptor) and single-target snipers.',
    howToObtain: 'Defeat Cyber Trapper or Mechagodzilla in Boss Rush, or forge in Relic Vault.',
    dropRateText: 'Guaranteed at Wave 35 Milestone • 35% on Mythic Boss Kills',
    costType: 'dna',
    costAmount: 75000,
    color: '#a855f7'
  },
  {
    id: 'ghost_vision_glasses',
    name: 'Ghost Vision Spectacles',
    emoji: '👓',
    category: 'Offense',
    rarity: 'Ancient',
    description: 'Quantum-polarized spectral goggles revealing the ethereal wavelength of Phantoms, Wraiths, and Banshees.',
    bonus: 'Reveals & Targets Ghost & Stealth Units',
    detailedEffect: 'Allows ALL deployed animal towers and titans to detect, target, and deal full damage to Ghost enemies (Phantoms, Wraiths, Banshees) and cloaked stealth Spectres.',
    mechanicsNotes: [
      'Removes ethereal untargetability from all ghost-class enemies.',
      'Allows snipers, ground beasts, and celestial deities to strike ghosts at full range.',
      'Active automatically across all waves and gamemodes once equipped or acquired.'
    ],
    bestSynergy: 'Essential against Ghost waves, Ethereal Phantoms, and Phantom Bosses.',
    howToObtain: 'Defeat Spectral Hunters at Wave 12+, acquire in Lore Mode, or forge in Relic Vault.',
    dropRateText: 'Guaranteed at Wave 12 Milestone • 40% on Ghost Boss Kills',
    costType: 'dna',
    costAmount: 1500,
    color: '#38bdf8'
  }
];

export function getRelicById(id: string): RelicDef | undefined {
  return RELICS.find(r => r.id === id);
}

export function getRandomLockedRelic(unlockedIds: string[] = []): RelicDef | null {
  const locked = RELICS.filter(r => !unlockedIds.includes(r.id));
  if (locked.length === 0) return null;
  const index = Math.floor(Math.random() * locked.length);
  return locked[index];
}

export function checkBossRelicDrop(
  wave: number, 
  isBoss: boolean, 
  unlockedIds: string[] = [], 
  isBossRush: boolean = false
): RelicDef | null {
  const locked = RELICS.filter(r => !unlockedIds.includes(r.id));
  if (locked.length === 0) return null;

  // 1. Guaranteed Milestones
  if (wave === 10 || wave === 15 || wave === 25 || wave === 30 || wave === 35 || wave === 40 || wave === 50 || wave === 100) {
    return locked[Math.floor(Math.random() * locked.length)];
  }

  // 2. Boss Kill Probability
  if (isBoss) {
    const chance = isBossRush ? 0.50 : 0.35;
    if (Math.random() < chance) {
      return locked[Math.floor(Math.random() * locked.length)];
    }
  }

  return null;
}
