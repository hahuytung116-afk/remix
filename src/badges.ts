import { Badge, GameState, TowerInstance } from './types';
import { ANIMALS } from './constants';

export const BADGES: Badge[] = [
  {
    id: 'god_slayer',
    name: 'God Slayer',
    title: '👑 GOD SLAYER',
    description: 'Annihilated the 100-Trillion Health Ultra World Boss inside True Hell mode.',
    category: 'boss',
    icon: '👑',
    rarity: 'Overseer',
    badgeColor: '#ec4899',
    gradientClass: 'from-amber-400 via-purple-500 to-cyan-400',
    borderClass: 'border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.5)]',
    requirement: 'Defeat the 100-Trillion HP Ultra World Boss inside True Hell mode.',
    bonusDescription: '+15% DNA gain & Godlike Astral title glow',
    perk: {
      dnaBonusPercent: 15,
      damageBonusPercent: 10,
    }
  },
  {
    id: 'hell_conqueror',
    name: 'Hell Conqueror',
    title: '🔥 HELL CONQUEROR',
    description: 'Endured the brutal -99% damage suppression and conquered True Hell Mode.',
    category: 'mode',
    icon: '🔥',
    rarity: 'Celestial',
    badgeColor: '#f97316',
    gradientClass: 'from-orange-500 via-red-600 to-amber-400',
    borderClass: 'border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]',
    requirement: 'Reach or survive Wave 15+ in True Hell Mode.',
    bonusDescription: '+12% Critical Hit Chance on all towers',
    perk: {
      critBonusPercent: 12,
    }
  },
  {
    id: 'boss_executioner',
    name: 'Boss Executioner',
    title: '☠️ BOSS EXECUTIONER',
    description: 'Crushed relentless boss swarms and reigned supreme over Boss Rush.',
    category: 'mode',
    icon: '☠️',
    rarity: 'Legendary',
    badgeColor: '#a855f7',
    gradientClass: 'from-violet-500 via-purple-600 to-indigo-400',
    borderClass: 'border-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.4)]',
    requirement: 'Clear Wave 25+ in Boss Rush Mode.',
    bonusDescription: '+15% bonus damage dealt to all Boss units',
    perk: {
      damageBonusPercent: 15,
    }
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    title: '⚡ SPEED DEMON',
    description: 'Fought on the razor edge of death with 1 Base HP and hypersonic enemies.',
    category: 'mode',
    icon: '⚡',
    rarity: 'Celestial',
    badgeColor: '#38bdf8',
    gradientClass: 'from-cyan-400 via-sky-500 to-blue-600',
    borderClass: 'border-cyan-400 shadow-[0_0_15px_rgba(56,189,248,0.5)]',
    requirement: 'Reach Wave 30+ with Sudden Death (1 HP) active.',
    bonusDescription: '+10% Attack Speed & Range boost',
    perk: {
      rangeBonusPercent: 10,
    }
  },
  {
    id: 'hardcore_survivor',
    name: 'Hardcore Survivor',
    title: '⚠️ HARDCORE SURVIVOR',
    description: 'Mastered unmerciful combat where mistakes permanently reset your journey.',
    category: 'mode',
    icon: '⚠️',
    rarity: 'Legendary',
    badgeColor: '#ef4444',
    gradientClass: 'from-red-500 via-rose-600 to-amber-500',
    borderClass: 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]',
    requirement: 'Reach Wave 50+ in Hardcore Mode.',
    bonusDescription: '+15% Meat harvested per wave',
    perk: {
      meatBonusPercent: 15,
    }
  },
  {
    id: 'sky_ace',
    name: 'Sky Ace',
    title: '✈️ SKY ACE',
    description: 'Mastered aerial combat and cleared high-altitude waves in Sky Game Mode.',
    category: 'mode',
    icon: '✈️',
    rarity: 'Legendary',
    badgeColor: '#38bdf8',
    gradientClass: 'from-cyan-400 via-sky-500 to-indigo-600',
    borderClass: 'border-cyan-400 shadow-[0_0_15px_rgba(56,189,248,0.4)]',
    requirement: 'Reach Wave 25+ in Sky Game Mode.',
    bonusDescription: '+20% Damage for all Airborne Towers',
    perk: {
      damageBonusPercent: 20,
    }
  },
  {
    id: 'dimension_walker',
    name: 'Dimension Walker',
    title: '🌌 DIMENSION WALKER',
    description: 'Traversed the astral veil and conquered both Cosmic and Abyssal realms.',
    category: 'dimension',
    icon: '🌌',
    rarity: 'Celestial',
    badgeColor: '#c084fc',
    gradientClass: 'from-fuchsia-500 via-purple-600 to-cyan-400',
    borderClass: 'border-purple-400 shadow-[0_0_15px_rgba(192,132,252,0.5)]',
    requirement: 'Deploy and fight across Cosmic Rift and Abyssal Void dimensions.',
    bonusDescription: '+15% Tower Range in all dimensions',
    perk: {
      rangeBonusPercent: 15,
    }
  },
  {
    id: 'cosmic_pioneer',
    name: 'Cosmic Pioneer',
    title: '🪐 COSMIC PIONEER',
    description: 'Harnessed Celestial resonance within the Cosmic Rift dimension.',
    category: 'dimension',
    icon: '🪐',
    rarity: 'Epic',
    badgeColor: '#818cf8',
    gradientClass: 'from-indigo-400 via-purple-500 to-pink-400',
    borderClass: 'border-indigo-400 shadow-[0_0_12px_rgba(129,140,248,0.4)]',
    requirement: 'Clear Wave 20+ while in the Cosmic Rift dimension.',
    bonusDescription: '+8% Tower Range & Starlight ticks',
    perk: {
      rangeBonusPercent: 8,
    }
  },
  {
    id: 'abyss_sovereign',
    name: 'Abyss Sovereign',
    title: '🌀 ABYSS SOVEREIGN',
    description: 'Mastered gravitational dark singularities in the Abyssal Void dimension.',
    category: 'dimension',
    icon: '🌀',
    rarity: 'Epic',
    badgeColor: '#fb7185',
    gradientClass: 'from-rose-500 via-pink-600 to-purple-600',
    borderClass: 'border-rose-400 shadow-[0_0_12px_rgba(251,113,133,0.4)]',
    requirement: 'Clear Wave 20+ while in the Abyssal Void dimension.',
    bonusDescription: '+10% Void Overcharge attack power',
    perk: {
      damageBonusPercent: 10,
    }
  },
  {
    id: 'grandmaster_mastery',
    name: 'Grandmaster',
    title: '🏆 GRANDMASTER',
    description: 'Ascended unit combat prowess beyond limits to Level 100 Mastery.',
    category: 'mastery',
    icon: '🏆',
    rarity: 'Legendary',
    badgeColor: '#eab308',
    gradientClass: 'from-yellow-400 via-amber-500 to-orange-400',
    borderClass: 'border-amber-400 shadow-[0_0_15px_rgba(234,179,8,0.4)]',
    requirement: 'Reach Mastery Level 100+ on any single Animal Unit.',
    bonusDescription: '+20% Mastery XP gain across all active units',
    perk: {
      damageBonusPercent: 8,
    }
  },
  {
    id: 'gene_sovereign',
    name: 'Gene Sovereign',
    title: '🧬 GENE SOVEREIGN',
    description: 'Synthesized godlike lifeforms belonging to the Overseer or Unrivaled tier.',
    category: 'special',
    icon: '🧬',
    rarity: 'Overseer',
    badgeColor: '#ec4899',
    gradientClass: 'from-pink-500 via-purple-600 to-indigo-500',
    borderClass: 'border-pink-500 shadow-[0_0_18px_rgba(236,72,153,0.5)]',
    requirement: 'Own at least 1 Overseer or Unrivaled rarity Beast in your roster.',
    bonusDescription: '+10% DNA & God Shards harvest efficiency',
    perk: {
      dnaBonusPercent: 10,
    }
  },
  {
    id: 'meat_tycoon',
    name: 'Meat Tycoon',
    title: '💰 MEAT TYCOON',
    description: 'Amassed an immense planetary meat reserve exceeding 1,000,000.',
    category: 'economy',
    icon: '💰',
    rarity: 'Epic',
    badgeColor: '#eab308',
    gradientClass: 'from-yellow-400 via-amber-500 to-lime-400',
    borderClass: 'border-yellow-400 shadow-[0_0_12px_rgba(234,179,8,0.3)]',
    requirement: 'Hold 1,000,000+ Meat in your vault simultaneously.',
    bonusDescription: '+10% Meat generated from defeating enemies',
    perk: {
      meatBonusPercent: 10,
    }
  },
  {
    id: 'dna_colossus',
    name: 'DNA Colossus',
    title: '🧪 DNA COLOSSUS',
    description: 'Collected overwhelming genetic strands exceeding 100,000 DNA.',
    category: 'economy',
    icon: '🧪',
    rarity: 'Legendary',
    badgeColor: '#6366f1',
    gradientClass: 'from-indigo-400 via-blue-500 to-cyan-400',
    borderClass: 'border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.4)]',
    requirement: 'Hold 100,000+ DNA in your genetic vault.',
    bonusDescription: '+12% DNA from recycling and wave clears',
    perk: {
      dnaBonusPercent: 12,
    }
  },
  {
    id: 'celestial_lord',
    name: 'Celestial Lord',
    title: '✨ CELESTIAL LORD',
    description: 'Forged a mountain of mystical divine shards exceeding 10,000.',
    category: 'economy',
    icon: '✨',
    rarity: 'Celestial',
    badgeColor: '#38bdf8',
    gradientClass: 'from-cyan-300 via-sky-400 to-purple-500',
    borderClass: 'border-cyan-300 shadow-[0_0_15px_rgba(56,189,248,0.5)]',
    requirement: 'Accumulate 10,000+ Shards of Gods in your balance.',
    bonusDescription: '+5% higher chance of rare God Shards drop',
    perk: {
      dnaBonusPercent: 8,
      critBonusPercent: 5,
    }
  },
  {
    id: 'untouched_defender',
    name: 'Iron Fortress',
    title: '🛡️ IRON FORTRESS',
    description: 'Maintained an impervious stronghold without suffering a single scratch.',
    category: 'wave',
    icon: '🛡️',
    rarity: 'Epic',
    badgeColor: '#10b981',
    gradientClass: 'from-emerald-400 via-teal-500 to-cyan-500',
    borderClass: 'border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]',
    requirement: 'Reach Wave 40+ with 100% full Base Health remaining.',
    bonusDescription: '+10 Maximum Base Health protection',
    perk: {
      damageBonusPercent: 5,
    }
  },
  {
    id: 'clash_gladiator',
    name: 'Clash Champion',
    title: '⚔️ CLASH CHAMPION',
    description: 'Triumphed in brutal 1v1 Animal Clash arena combat.',
    category: 'special',
    icon: '⚔️',
    rarity: 'Rare',
    badgeColor: '#f43f5e',
    gradientClass: 'from-rose-500 via-red-500 to-orange-400',
    borderClass: 'border-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.3)]',
    requirement: 'Win 3+ Animal Clash matches against opponents.',
    bonusDescription: '+10% Unit Damage inside Animal Clash arena',
    perk: {
      damageBonusPercent: 5,
    }
  },
  {
    id: 'reality_bender',
    name: 'Reality Bender',
    title: '🌟 REALITY BENDER',
    description: 'Triggered the reality-collapsing Arcane Warper ultimate screen annihilation.',
    category: 'special',
    icon: '🌟',
    rarity: 'Rare',
    badgeColor: '#a855f7',
    gradientClass: 'from-purple-400 via-violet-500 to-pink-500',
    borderClass: 'border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)]',
    requirement: 'Fire the Arcane Warper ultimate battlefield wipe skill.',
    bonusDescription: '+5% Arcane energy recharge rate',
    perk: {
      rangeBonusPercent: 5,
    }
  },
  {
    id: 'multiverse_watcher_ascendant',
    name: 'Multiverse Watcher',
    title: '🌌 MULTIVERSE WATCHER',
    description: 'Awakened the Titan Defender 3rd Form (Black Hole Singularity) to reach the 2nd Arcane tier.',
    category: 'special',
    icon: '🕳️',
    rarity: 'Overseer',
    badgeColor: '#c084fc',
    gradientClass: 'from-fuchsia-600 via-purple-700 to-cyan-400',
    borderClass: 'border-fuchsia-400 shadow-[0_0_20px_rgba(217,70,239,0.6)]',
    requirement: 'Transform Titan into 3rd Form (Multiverse Watcher) on the battlefield.',
    bonusDescription: '+35% Global Damage & 100% EMP/Stun Immunity for all towers',
    perk: {
      damageBonusPercent: 35,
    }
  },
  {
    id: 'lore_chronicles_master',
    name: 'Lore Chronicles Master',
    title: '📜 LORE MASTER',
    description: 'Conquered high-dimensional waves in Lore Campaign Mode and uncovered cosmic chronicles.',
    category: 'mode',
    icon: '📜',
    rarity: 'Overseer',
    badgeColor: '#00ffcc',
    gradientClass: 'from-emerald-400 via-cyan-500 to-indigo-600',
    borderClass: 'border-cyan-400 shadow-[0_0_18px_rgba(6,182,212,0.5)]',
    requirement: 'Survive to Wave 20+ in Lore Chronicles Mode.',
    bonusDescription: '+20% DNA Gain & +15% Meat Generation',
    perk: {
      dnaBonusPercent: 20,
      meatBonusPercent: 15,
    }
  },
];

/**
 * Calculates current progress percentage towards earning a badge
 */
export function getBadgeProgress(badgeId: string, gameState: GameState, towers: TowerInstance[]): { current: number; max: number; text: string; isReady: boolean } {
  switch (badgeId) {
    case 'god_slayer': {
      const kills = gameState.ultraBossKills || (gameState.ultraBossSlayer ? 1 : 0);
      return {
        current: kills,
        max: 1,
        text: `${kills} / 1 Ultra Boss Slain`,
        isReady: kills >= 1
      };
    }
    case 'hell_conqueror': {
      const highest = gameState.highestTrueHellWave || (gameState.isTrueHell ? gameState.wave : 0);
      return {
        current: Math.min(highest, 15),
        max: 15,
        text: `Wave ${highest} / 15 in True Hell`,
        isReady: highest >= 15
      };
    }
    case 'boss_executioner': {
      const highest = gameState.highestBossRushWave || (gameState.isBossRush ? gameState.wave : 0);
      return {
        current: Math.min(highest, 25),
        max: 25,
        text: `Wave ${highest} / 25 in Boss Rush`,
        isReady: highest >= 25
      };
    }
    case 'speed_demon': {
      const highest = gameState.highestSuddenDeathWave || (gameState.isSuddenDeath ? gameState.wave : 0);
      return {
        current: Math.min(highest, 30),
        max: 30,
        text: `Wave ${highest} / 30 in Sudden Death`,
        isReady: highest >= 30
      };
    }
    case 'hardcore_survivor': {
      const wave = gameState.isHardcore ? gameState.wave : 0;
      return {
        current: Math.min(wave, 50),
        max: 50,
        text: `Wave ${wave} / 50 in Hardcore`,
        isReady: wave >= 50
      };
    }
    case 'sky_ace': {
      const highest = gameState.highestSkyModeWave || (gameState.isSkyMode ? gameState.wave : 0);
      return {
        current: Math.min(highest, 25),
        max: 25,
        text: `Wave ${highest} / 25 in Sky Mode`,
        isReady: highest >= 25
      };
    }
    case 'dimension_walker': {
      const isCosmic = gameState.currentStage === 'dimension_cosmic';
      const isAbyss = gameState.currentStage === 'dimension_abyss';
      const current = (isCosmic || isAbyss) ? 1 : 0;
      return {
        current: gameState.wave >= 10 && (isCosmic || isAbyss) ? 2 : current,
        max: 2,
        text: gameState.wave >= 10 && (isCosmic || isAbyss) ? '2 / 2 Realms Mastered' : 'Fight in Cosmic & Abyssal Realms',
        isReady: gameState.wave >= 10 && (isCosmic || isAbyss)
      };
    }
    case 'cosmic_pioneer': {
      const wave = gameState.currentStage === 'dimension_cosmic' ? gameState.wave : 0;
      return {
        current: Math.min(wave, 20),
        max: 20,
        text: `Wave ${wave} / 20 in Cosmic Rift`,
        isReady: wave >= 20
      };
    }
    case 'abyss_sovereign': {
      const wave = gameState.currentStage === 'dimension_abyss' ? gameState.wave : 0;
      return {
        current: Math.min(wave, 20),
        max: 20,
        text: `Wave ${wave} / 20 in Abyssal Void`,
        isReady: wave >= 20
      };
    }
    case 'grandmaster_mastery': {
      let maxMastery = 0;
      towers.forEach(t => {
        if (t.masteryLevel > maxMastery) maxMastery = t.masteryLevel;
      });
      return {
        current: Math.min(maxMastery, 100),
        max: 100,
        text: `Mastery Level ${maxMastery} / 100`,
        isReady: maxMastery >= 100
      };
    }
    case 'gene_sovereign': {
      const ownedIds = new Set<string>();
      if (Array.isArray(gameState.summonedAnimals)) {
        gameState.summonedAnimals.forEach((item: any) => {
          if (typeof item === 'string') ownedIds.add(item);
          else if (item && typeof item === 'object' && item.id) ownedIds.add(item.id);
        });
      }
      if (Array.isArray(towers)) {
        towers.forEach(t => {
          if (t && t.animalId) ownedIds.add(t.animalId);
        });
      }

      let matchedName = '';
      const hasGodUnit = Array.from(ownedIds).some(id => {
        const animal = ANIMALS.find(a => a.id === id);
        if (!animal) return false;
        if (['Overseer', 'Unrivaled', 'Arcane', 'Original'].includes(animal.rarity)) {
          matchedName = animal.name;
          return true;
        }
        return false;
      });

      return {
        current: hasGodUnit ? 1 : 0,
        max: 1,
        text: hasGodUnit ? `1 / 1 Owned (${matchedName})` : '0 / 1 Overseer or Unrivaled Beast',
        isReady: hasGodUnit
      };
    }
    case 'meat_tycoon': {
      return {
        current: Math.min(Math.floor(gameState.meat), 1000000),
        max: 1000000,
        text: `${Math.floor(gameState.meat).toLocaleString()} / 1,000,000 Meat`,
        isReady: gameState.meat >= 1000000
      };
    }
    case 'dna_colossus': {
      return {
        current: Math.min(Math.floor(gameState.dna), 100000),
        max: 100000,
        text: `${Math.floor(gameState.dna).toLocaleString()} / 100,000 DNA`,
        isReady: gameState.dna >= 100000
      };
    }
    case 'celestial_lord': {
      const shards = gameState.shardsOfGods || 0;
      return {
        current: Math.min(shards, 10000),
        max: 10000,
        text: `${shards.toLocaleString()} / 10,000 God Shards`,
        isReady: shards >= 10000
      };
    }
    case 'untouched_defender': {
      const hp = gameState.health;
      const wave = gameState.wave;
      const isUntouched = hp >= 100;
      return {
        current: isUntouched ? Math.min(wave, 40) : 0,
        max: 40,
        text: isUntouched ? `Wave ${wave} / 40 (100% HP)` : 'Base Damaged (Reset to retry)',
        isReady: isUntouched && wave >= 40
      };
    }
    case 'clash_gladiator': {
      const wins = gameState.clashWins || 0;
      return {
        current: Math.min(wins, 3),
        max: 3,
        text: `${wins} / 3 Clash Arena Wins`,
        isReady: wins >= 3
      };
    }
    case 'reality_bender': {
      const uses = gameState.arcaneWarperUses || 0;
      return {
        current: Math.min(uses, 1),
        max: 1,
        text: uses >= 1 ? '1 / 1 Arcane Warper Fired' : '0 / 1 Arcane Warper Fired',
        isReady: uses >= 1
      };
    }
    case 'multiverse_watcher_ascendant': {
      const hasForm3Titan = towers.some(t => t.animalId === 'titan_defender' && t.titanForm === 'form3_multiverse');
      return {
        current: hasForm3Titan ? 1 : 0,
        max: 1,
        text: hasForm3Titan ? '1 / 1 Multiverse Watcher Transformed' : '0 / 1 Multiverse Watcher Transformed',
        isReady: hasForm3Titan
      };
    }
    case 'lore_chronicles_master': {
      const loreWave = gameState.highestLoreWave || (gameState.isLoreMode ? gameState.wave : 0);
      return {
        current: Math.min(loreWave, 20),
        max: 20,
        text: `Wave ${loreWave} / 20 in Lore Mode`,
        isReady: loreWave >= 20
      };
    }
    default:
      return { current: 0, max: 1, text: '0 / 1', isReady: false };
  }
}

/**
 * Returns a deduplicated array of unique unlocked badge IDs for the given state.
 * Prevents owning multiple duplicates of the same single badge.
 */
export function getUniqueUnlockedBadges(gameState: GameState): string[] {
  const set = new Set<string>();
  if (Array.isArray(gameState.unlockedBadges)) {
    gameState.unlockedBadges.forEach(id => {
      if (BADGES.some(b => b.id === id)) {
        set.add(id);
      }
    });
  }
  if (gameState.ultraBossSlayer) {
    set.add('god_slayer');
  }
  return Array.from(set);
}

/**
 * Checks all badges and returns list of newly unlocked badge IDs
 */
export function checkNewBadgeUnlocks(gameState: GameState, towers: TowerInstance[]): string[] {
  const currentUnlocked = new Set(getUniqueUnlockedBadges(gameState));

  const newlyUnlocked: string[] = [];

  BADGES.forEach(badge => {
    if (!currentUnlocked.has(badge.id)) {
      const progress = getBadgeProgress(badge.id, gameState, towers);
      if (progress.isReady) {
        newlyUnlocked.push(badge.id);
      }
    }
  });

  return Array.from(new Set(newlyUnlocked));
}

/**
 * Returns the currently active badge object if explicitly equipped
 */
export function getActiveBadge(gameState: GameState): Badge | null {
  if (!gameState.activeBadgeId) return null;
  const uniqueUnlocked = getUniqueUnlockedBadges(gameState);
  if (!uniqueUnlocked.includes(gameState.activeBadgeId)) return null;
  return BADGES.find(b => b.id === gameState.activeBadgeId) || null;
}
