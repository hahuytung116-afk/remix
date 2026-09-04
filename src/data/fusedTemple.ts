import { Rarity, Animal } from '../types';
import { ANIMALS } from '../constants';

export interface TempleLevelInfo {
  level: number;
  title: string;
  dnaCost: number;
  essenceCost: number;
  unlockedPerk: string;
  perkDescription: string;
  icon: string;
  color: string;
}

export const TEMPLE_LEVELS: TempleLevelInfo[] = [
  {
    level: 1,
    title: 'Altar of Rebirth',
    dnaCost: 0,
    essenceCost: 0,
    unlockedPerk: 'Sacred Synthesis',
    perkDescription: 'Enables the sacrifice of matching tier constructs to synthesize divine Fused variants.',
    icon: 'Atom',
    color: '#38bdf8'
  },
  {
    level: 2,
    title: 'Sanctum of Essences',
    dnaCost: 2500,
    essenceCost: 10,
    unlockedPerk: 'Essence Conservation I',
    perkDescription: 'Reduces DNA cost for all Fused Temple syntheses by -15%.',
    icon: 'Sparkles',
    color: '#34d399'
  },
  {
    level: 3,
    title: 'Chamber of Resonance',
    dnaCost: 10000,
    essenceCost: 25,
    unlockedPerk: 'Fused Synergy Matrix',
    perkDescription: 'All deployed Fused units gain +15% bonus DMG for every other Fused unit on the battlefield.',
    icon: 'Zap',
    color: '#fbbf24'
  },
  {
    level: 4,
    title: 'Divine Crucible',
    dnaCost: 40000,
    essenceCost: 50,
    unlockedPerk: 'Divine Spark Initiation',
    perkDescription: 'Newly synthesized Fused constructs immediately spawn with +3 starting Master Levels.',
    icon: 'Flame',
    color: '#f97316'
  },
  {
    level: 5,
    title: 'Spire of Overdrive',
    dnaCost: 150000,
    essenceCost: 100,
    unlockedPerk: 'Fused Overdrive Aura',
    perkDescription: 'All Fused units gain +25% attack speed and +20% effective targeting range.',
    icon: 'Cpu',
    color: '#a855f7'
  },
  {
    level: 6,
    title: 'Hall of Auto-Rites',
    dnaCost: 500000,
    essenceCost: 200,
    unlockedPerk: 'Temple Auto-Rites',
    perkDescription: 'Unlocks 1-click Smart Bulk Synthesis to automatically fuse all available duplicate construct pairs in inventory.',
    icon: 'RefreshCw',
    color: '#06b6d4'
  },
  {
    level: 7,
    title: 'Vault of Ascension',
    dnaCost: 1800000,
    essenceCost: 400,
    unlockedPerk: 'Essence Conservation II',
    perkDescription: 'Increases DNA cost reduction to -35% and guarantees Godly or Swift traits on synthesis.',
    icon: 'Award',
    color: '#ec4899'
  },
  {
    level: 8,
    title: 'Cosmic Transmutation Well',
    dnaCost: 6000000,
    essenceCost: 800,
    unlockedPerk: 'Transmutation Echo',
    perkDescription: 'Fusing units grants a 30% chance to immediately refund 100% of the sacrificed sacrifice construct.',
    icon: 'Sparkle',
    color: '#f43f5e'
  },
  {
    level: 9,
    title: 'Sanctuary of the Void',
    dnaCost: 20000000,
    essenceCost: 1500,
    unlockedPerk: 'Arcane Fused Dominion',
    perkDescription: 'Fused units inflict +100% global critical strike damage and gain immunity to disable debuffs.',
    icon: 'ShieldAlert',
    color: '#c084fc'
  },
  {
    level: 10,
    title: 'Multiverse Pantheon',
    dnaCost: 75000000,
    essenceCost: 3000,
    unlockedPerk: 'Supreme Multiverse Apotheosis',
    perkDescription: 'All Fused units gain +300% global damage, generate +10,000 DNA per wave, and radiate cosmic disintegration pulses.',
    icon: 'Crown',
    color: '#ffd700'
  }
];

export interface FusionRecipe {
  inputRarity: Rarity;
  outputUnitId: string;
  outputRarity: Rarity;
  dnaCost: number;
  essenceReward: number;
  loreTitle: string;
}

export const FUSION_RECIPES: FusionRecipe[] = [
  {
    inputRarity: 'Common',
    outputUnitId: 'fused_chimera_pup',
    outputRarity: 'Rare',
    dnaCost: 150,
    essenceReward: 1,
    loreTitle: 'Genesis of the Chimera'
  },
  {
    inputRarity: 'Rare',
    outputUnitId: 'fused_dire_alpha',
    outputRarity: 'Epic',
    dnaCost: 500,
    essenceReward: 2,
    loreTitle: 'Alpha Predator Awakening'
  },
  {
    inputRarity: 'Epic',
    outputUnitId: 'fused_gryphon_sentinel',
    outputRarity: 'Legendary',
    dnaCost: 1800,
    essenceReward: 4,
    loreTitle: 'Aerial Sentinel Consecration'
  },
  {
    inputRarity: 'Legendary',
    outputUnitId: 'fused_megashark_rex',
    outputRarity: 'Mythic',
    dnaCost: 8000,
    essenceReward: 8,
    loreTitle: 'Abyssal Apex Manifestation'
  },
  {
    inputRarity: 'Mythic',
    outputUnitId: 'fused_cosmic_basilisk',
    outputRarity: 'Secret',
    dnaCost: 35000,
    essenceReward: 16,
    loreTitle: 'Stardust Basilisk Transmutation'
  },
  {
    inputRarity: 'Secret',
    outputUnitId: 'fused_unrivaled_tempest_hydra',
    outputRarity: 'Unrivaled',
    dnaCost: 120000,
    essenceReward: 32,
    loreTitle: 'Tempest Sovereign Awakening'
  },
  {
    inputRarity: 'Unrivaled',
    outputUnitId: 'fused_nebula_kaiser',
    outputRarity: 'Celestial',
    dnaCost: 450000,
    essenceReward: 64,
    loreTitle: 'Kaiser Nebula Convergence'
  },
  {
    inputRarity: 'Celestial',
    outputUnitId: 'fused_singularity_overlord',
    outputRarity: '???',
    dnaCost: 1500000,
    essenceReward: 128,
    loreTitle: 'Event Horizon Synthesis'
  },
  {
    inputRarity: '???',
    outputUnitId: 'fused_primal_omega',
    outputRarity: 'Original',
    dnaCost: 5000000,
    essenceReward: 256,
    loreTitle: 'Supernova Genesis Rites'
  },
  {
    inputRarity: 'Original',
    outputUnitId: 'fused_chrono_watcher',
    outputRarity: 'Overseer',
    dnaCost: 15000000,
    essenceReward: 512,
    loreTitle: 'Temporal Watcher Elevation'
  },
  {
    inputRarity: 'Overseer',
    outputUnitId: 'fused_twin_singularity',
    outputRarity: 'Arcane',
    dnaCost: 45000000,
    essenceReward: 1024,
    loreTitle: 'Supreme Multiverse Sovereign'
  }
];

export function getRecipeForRarity(rarity: Rarity): FusionRecipe | undefined {
  return FUSION_RECIPES.find(r => r.inputRarity === rarity);
}

export function getAllFusedAnimals(): Animal[] {
  return ANIMALS.filter(a => a.isFused || a.category === 'fused' || a.id.startsWith('fused_'));
}
