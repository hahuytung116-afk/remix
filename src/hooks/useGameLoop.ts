import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, TowerInstance, EnemyInstance, Projectile, EnemyType, SkillEffect, WaveSummary, Rarity, Animal } from '../types';
import { ANIMALS, ENEMIES, CANVAS_WIDTH, CANVAS_HEIGHT, getFeaturedMythicsAtTime, ANIMAL_ELEMENTS, ELEMENT_COLORS, formatDamageNumber } from '../constants';
import { TRAITS, getRandomTrait } from '../traits';
import { gameAudio } from '../utils/audio';
import { BADGES, checkNewBadgeUnlocks, getActiveBadge, getUniqueUnlockedBadges } from '../badges';
import { ElementalHazardZone, generateElementalHazards, getTowerHazardAffinity } from '../elementalHazards';
import { checkBossRelicDrop, RELICS, RelicDef } from '../relics';
import { AIRCRAFTS, SKY_ENEMIES } from '../aircrafts';
import { getLoreWaveData, isAnimalUnlockedInLoreMode, getAnimalUnlockWave, ANIMAL_LORE_UNLOCKS, getUnlockedAnimalsForLoreWave } from '../data/loreCampaign';
import { getTacticalPlan, selectDiverseAnimalForTacticalPlan } from '../data/tacticalPlans';

export const NON_ANIMAL_IDS = new Set([
  'mecha_rex',
  'secret_quantum_glitch',
  'secret_cyber_viper',
  'buffer',
  'mystery_anomaly',
  'mystery_singularity',
  'mystery_nullifier',
  'mystery_eclipse',
  'mystery_entropy',
  'mystery_supervoid',
  'mystery_continuum',
  'mystery_darkstar',
]);

const ENEMY_MAP = new Map<string, any>([
  ...ENEMIES.map(e => [e.id, e] as [string, any]),
  ...SKY_ENEMIES.map(se => [se.id, {
    id: se.id,
    name: se.name,
    health: se.health,
    speed: se.speed,
    bounty: se.bounty,
    color: se.color,
    size: se.size,
    emoji: se.emoji,
    category: 'sky_hunter',
    isBoss: se.id === 'cyber_cruiser_boss',
    description: se.description,
    abilities: se.abilities
  }] as [string, any])
]);
const ANIMAL_MAP = new Map(ANIMALS.map(a => [a.id, a]));

// Dedicated Web Worker ticker for uninterrupted 60 FPS background tab execution
const createWorkerTicker = () => {
  if (typeof window === 'undefined' || typeof Worker === 'undefined' || typeof Blob === 'undefined') {
    return null;
  }
  try {
    const workerBlob = new Blob([`
      let timer = null;
      self.onmessage = function(e) {
        if (e.data === 'start') {
          if (!timer) {
            timer = setInterval(function() {
              self.postMessage('tick');
            }, 16.66);
          }
        } else if (e.data === 'stop') {
          if (timer) {
            clearInterval(timer);
            timer = null;
          }
        }
      };
    `], { type: 'application/javascript' });
    const url = URL.createObjectURL(workerBlob);
    const worker = new Worker(url);
    return { worker, url };
  } catch (e) {
    console.warn('Web Worker ticker initialization fallback', e);
    return null;
  }
};

function calculateCrit(
  tower: TowerInstance,
  baseDamage: number,
  extraCritChance: number = 0,
  extraCritMult: number = 0
): { isCrit: boolean; damage: number; element: 'fire' | 'poison' | 'water' | 'sand' | 'dirt' | 'ice' | 'wind' | 'lightning' | 'light' | 'shadow' | 'magma' | 'cosmos'; elementColor: string } {
  let critChance = 0.18 + extraCritChance; // 18% base critical rate + equipped title perk bonus
  if (tower.trait === 'Deadeye') critChance += 0.30;
  else if (tower.trait === 'Demonic') critChance += 0.20;
  else if (tower.trait === 'Cosmic') critChance += 0.25;
  else if (tower.trait === 'Glitch') critChance += 0.35;
  else if (tower.trait === 'Godly' || tower.trait === 'CosmicDeity') critChance += 0.30;
  else if (tower.trait === 'Genesis') critChance += 0.35;
  else if (tower.trait === 'Mighty' || tower.trait === 'Swift') critChance += 0.10;

  // Tower Mastery progression bonus (+0.05% per mastery level up to +20%)
  critChance += Math.min(0.20, ((tower.masteryLevel || 1) - 1) * 0.0005);
  if (tower.isPinnacle) critChance += 0.15;

  let critMultiplier = 2.2 + extraCritMult;
  if (tower.trait === 'Glitch') {
    critMultiplier = 2.5 + Math.random() * 2.5 + extraCritMult; // Unstable glitch critical (2.5x - 5.0x)
  } else if (tower.trait === 'Demonic' || tower.trait === 'Cosmic') {
    critMultiplier = 2.6 + extraCritMult;
  } else if (tower.trait === 'Godly' || tower.trait === 'Genesis') {
    critMultiplier = 3.0 + extraCritMult;
  }
  if (tower.isPinnacle) critMultiplier += 0.5;

  const isCrit = Math.random() < critChance;
  const finalDamage = isCrit ? baseDamage * critMultiplier : baseDamage;

  const defaultEl = (ANIMAL_ELEMENTS[tower.animalId] as any) || 'dirt';
  const element = (tower.element as any) || defaultEl;
  const elementColor = ELEMENT_COLORS[element] || '#ef4444';

  return {
    isCrit,
    damage: finalDamage,
    element,
    elementColor,
  };
}

export const STAGE_PATHS: Record<string, { x: number; y: number }[]> = {
  default: [
    { x: -50, y: 100 },
    { x: 700, y: 100 },
    { x: 700, y: 300 },
    { x: 100, y: 300 },
    { x: 100, y: 500 },
    { x: 850, y: 500 },
  ],
  jungle: [
    { x: -50, y: 300 },
    { x: 300, y: 300 },
    { x: 300, y: 150 },
    { x: 500, y: 150 },
    { x: 500, y: 450 },
    { x: 150, y: 450 },
    { x: 150, y: 550 },
    { x: 850, y: 550 },
  ],
  savanna: [
    { x: 400, y: -50 },
    { x: 400, y: 200 },
    { x: 150, y: 200 },
    { x: 150, y: 400 },
    { x: 650, y: 400 },
    { x: 650, y: 650 },
  ],
  prehistoric: [
    { x: -50, y: 500 },
    { x: 250, y: 500 },
    { x: 250, y: 100 },
    { x: 550, y: 100 },
    { x: 550, y: 500 },
    { x: 850, y: 500 },
  ],
  dimension_cosmic: [
    { x: -50, y: 180 },
    { x: 320, y: 180 },
    { x: 580, y: 320 },
    { x: 220, y: 420 },
    { x: 480, y: 560 },
    { x: 850, y: 560 },
  ],
  dimension_abyss: [
    { x: 400, y: -50 },
    { x: 400, y: 160 },
    { x: 640, y: 160 },
    { x: 640, y: 420 },
    { x: 160, y: 420 },
    { x: 160, y: 650 },
  ],
};

function getDistanceToSegment(x: number, y: number, x1: number, y1: number, x2: number, y2: number) {
  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  if (lenSq !== 0) param = dot / lenSq;

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = x - xx;
  const dy = y - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

export const isPositionValidForTower = (
  x: number,
  y: number,
  stagePath: { x: number; y: number }[],
  otherTowers: { x: number; y: number; animalId?: string }[],
  isUltraBoss?: boolean,
  minPathDist: number = 38,
  minTowerDist: number = 38
): boolean => {
  // 1. Boundary check (keep margin from canvas edge)
  if (x < 20 || x > CANVAS_WIDTH - 20 || y < 20 || y > CANVAS_HEIGHT - 20) {
    return false;
  }

  // 2. Boss core check
  if (isUltraBoss) {
    const distToCenter = Math.hypot(x - 400, y - 300);
    if (distToCenter < 110) return false;
  }

  // 3. Distance to path check (keep towers strictly off the roadway)
  if (!isUltraBoss && stagePath && stagePath.length > 1) {
    for (let i = 0; i < stagePath.length - 1; i++) {
      const d = getDistanceToSegment(x, y, stagePath[i].x, stagePath[i].y, stagePath[i + 1].x, stagePath[i + 1].y);
      if (d < minPathDist) {
        return false;
      }
    }
  }

  // 4. Overlap with other towers
  for (const t of otherTowers) {
    const isOtherTitan = t.animalId === 'titan_defender';
    const reqDist = isOtherTitan ? 54 : minTowerDist;
    const dist = Math.hypot(t.x - x, t.y - y);
    if (dist < reqDist) {
      return false;
    }
  }

  return true;
};

// 2x2 Grid Area Check for Armored Titan units
export const isPositionValidForTitan = (
  centerX: number,
  centerY: number,
  stagePath: { x: number; y: number }[],
  otherTowers: { x: number; y: number; animalId?: string }[],
  isUltraBoss?: boolean
): boolean => {
  // Titan requires 80x80 area (2x2 cells of 40px each)
  // Check outer bounding limits
  if (centerX - 40 < 10 || centerX + 40 > CANVAS_WIDTH - 10 || centerY - 40 < 10 || centerY + 40 > CANVAS_HEIGHT - 10) {
    return false;
  }

  // Check 4 sub-quadrant test points
  const offsets = [
    { dx: -20, dy: -20 },
    { dx: 20, dy: -20 },
    { dx: -20, dy: 20 },
    { dx: 20, dy: 20 },
    { dx: 0, dy: 0 }
  ];

  for (const off of offsets) {
    const px = centerX + off.dx;
    const py = centerY + off.dy;
    if (!isPositionValidForTower(px, py, stagePath, otherTowers, isUltraBoss, 34, 30)) {
      return false;
    }
  }

  // Overlap with other towers (titans require larger clearance)
  for (const t of otherTowers) {
    const isOtherTitan = t.animalId === 'titan_defender';
    const reqDist = isOtherTitan ? 75 : 52;
    const dist = Math.hypot(t.x - centerX, t.y - centerY);
    if (dist < reqDist) {
      return false;
    }
  }

  return true;
};

export const findNearestValidPosition = (
  origX: number,
  origY: number,
  stagePath: { x: number; y: number }[],
  occupiedPositions: { x: number; y: number }[],
  isUltraBoss?: boolean
): { x: number; y: number } => {
  if (isPositionValidForTower(origX, origY, stagePath, occupiedPositions, isUltraBoss)) {
    return { x: origX, y: origY };
  }

  // Search expanding concentric circles around original position
  for (let r = 12; r <= 420; r += 12) {
    const angleSteps = Math.max(16, Math.floor((2 * Math.PI * r) / 14));
    for (let i = 0; i < angleSteps; i++) {
      const angle = (i * 2 * Math.PI) / angleSteps;
      const testX = Math.round(origX + r * Math.cos(angle));
      const testY = Math.round(origY + r * Math.sin(angle));

      if (isPositionValidForTower(testX, testY, stagePath, occupiedPositions, isUltraBoss)) {
        return { x: testX, y: testY };
      }
    }
  }

  // Fallback: Use findBestAutoPlacement
  const fallback = findBestAutoPlacement(occupiedPositions as any, stagePath, isUltraBoss);
  if (fallback) {
    return { x: fallback.x, y: fallback.y };
  }

  return { x: origX, y: origY };
};

export const repositionTowersOffPath = (
  towers: TowerInstance[],
  stagePath: { x: number; y: number }[],
  isUltraBoss?: boolean
): { towers: TowerInstance[]; movedCount: number } => {
  const occupiedPositions: { x: number; y: number }[] = [];
  let movedCount = 0;

  const nextTowers = towers.map(tower => {
    // Check if this tower's current position is valid
    const isCurrentValid = isPositionValidForTower(
      tower.x,
      tower.y,
      stagePath,
      occupiedPositions,
      isUltraBoss
    );

    if (isCurrentValid) {
      occupiedPositions.push({ x: tower.x, y: tower.y });
      return tower;
    }

    // Reposition to nearest legal coordinates
    const validPos = findNearestValidPosition(
      tower.x,
      tower.y,
      stagePath,
      occupiedPositions,
      isUltraBoss
    );

    occupiedPositions.push({ x: validPos.x, y: validPos.y });
    if (validPos.x !== tower.x || validPos.y !== tower.y) {
      movedCount++;
    }

    return {
      ...tower,
      x: validPos.x,
      y: validPos.y
    };
  });

  return { towers: nextTowers, movedCount };
};

const findBestAutoPlacement = (existingTowers: TowerInstance[], stagePath: { x: number; y: number }[], isUltraBoss?: boolean) => {
  const candidates: { x: number, y: number, distToPath: number, index: number }[] = [];
  
  const stepX = 40;
  const stepY = 40;
  
  if (isUltraBoss) {
    for (let x = 60; x <= CANVAS_WIDTH - 60; x += stepX) {
      for (let y = 60; y <= CANVAS_HEIGHT - 60; y += stepY) {
        const distToCenter = Math.hypot(x - 400, y - 300);
        if (distToCenter < 110) continue; // Don't place inside central boss core

        let tooCloseToTower = false;
        for (const t of existingTowers) {
          const dx = t.x - x;
          const dy = t.y - y;
          if (Math.sqrt(dx * dx + dy * dy) < 45) {
            tooCloseToTower = true;
            break;
          }
        }
        if (tooCloseToTower) continue;

        candidates.push({ x, y, distToPath: distToCenter, index: 1 });
      }
    }
    if (candidates.length > 0) {
      return candidates[Math.floor(Math.random() * candidates.length)];
    }
  }

  for (let x = 60; x <= CANVAS_WIDTH - 60; x += stepX) {
    for (let y = 60; y <= CANVAS_HEIGHT - 60; y += stepY) {
      let tooCloseToTower = false;
      for (const t of existingTowers) {
        const dx = t.x - x;
        const dy = t.y - y;
        if (Math.sqrt(dx * dx + dy * dy) < 45) {
          tooCloseToTower = true;
          break;
        }
      }
      if (tooCloseToTower) continue;

      let minPathD = Infinity;
      let closestSegmentIndex = 1;
      
      for (let i = 0; i < stagePath.length - 1; i++) {
        const d = getDistanceToSegment(x, y, stagePath[i].x, stagePath[i].y, stagePath[i + 1].x, stagePath[i + 1].y);
        if (d < minPathD) {
          minPathD = d;
          closestSegmentIndex = i;
        }
      }

      if (minPathD >= 30 && minPathD <= 75) {
        candidates.push({ x, y, distToPath: minPathD, index: closestSegmentIndex });
      }
    }
  }

  if (candidates.length === 0) {
    for (let x = 60; x <= CANVAS_WIDTH - 60; x += stepX) {
      for (let y = 60; y <= CANVAS_HEIGHT - 60; y += stepY) {
        let tooCloseToTower = false;
        for (const t of existingTowers) {
          const dx = t.x - x;
          const dy = t.y - y;
          if (Math.sqrt(dx * dx + dy * dy) < 45) {
            tooCloseToTower = true;
            break;
          }
        }
        if (tooCloseToTower) continue;

        let minPathD = Infinity;
        let closestSegmentIndex = 1;
        for (let i = 0; i < stagePath.length - 1; i++) {
          const d = getDistanceToSegment(x, y, stagePath[i].x, stagePath[i].y, stagePath[i + 1].x, stagePath[i + 1].y);
          if (d < minPathD) {
            minPathD = d;
            closestSegmentIndex = i;
          }
        }

        if (minPathD >= 30 && minPathD <= 120) {
          candidates.push({ x, y, distToPath: minPathD, index: closestSegmentIndex });
        }
      }
    }
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => {
    if (a.index !== b.index) {
      return a.index - b.index;
    }
    return a.distToPath - b.distToPath;
  });

  return candidates[0];
};

export function useGameLoop(selectedAnimalId?: string | null, placeOnlyBest?: boolean) {
  const SAVE_KEY = 'primal_defense_v2';

  // State to hold the current active slot (1, 2, or 3)
  const [activeSlot, setActiveSlot] = useState<string>(() => {
    try {
      // Migrate legacy save if slot 1/2/3 are empty and legacy exists
      const legacySave = localStorage.getItem(SAVE_KEY);
      const slot1 = localStorage.getItem('primal_defense_slot_1');
      const slot2 = localStorage.getItem('primal_defense_slot_2');
      const slot3 = localStorage.getItem('primal_defense_slot_3');

      if (legacySave && !slot1 && !slot2 && !slot3) {
        localStorage.setItem('primal_defense_slot_1', legacySave);
      }
      
      const val = localStorage.getItem('primal_defense_active_slot');
      return val === '2' || val === '3' ? val : '1';
    } catch {
      return '1';
    }
  });

  // Helper load functions for sloted saves
  const loadGameState = useCallback((slot: string): GameState => {
    try {
      const slotKey = `primal_defense_slot_${slot}`;
      const saved = localStorage.getItem(slotKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        const loadedState = {
          ...parsed,
          isWaveActive: false,
          isGameOver: false,
          secretPity: parsed.secretPity ?? 0,
          celestialPity: parsed.celestialPity ?? 0,
          unrivaledPity: parsed.unrivaledPity ?? 0,
          celestialTraitPity: parsed.celestialTraitPity ?? 0,
          mysteryPity: parsed.mysteryPity ?? 0,
          mysteryTraitPity: parsed.mysteryTraitPity ?? 0,
          originalPity: parsed.originalPity ?? 0,
          overseerPity: parsed.overseerPity ?? 0,
          capyPity: parsed.capyPity ?? 0,
          shardsOfGods: parsed.shardsOfGods ?? 0,
          arcaneShards: parsed.arcaneShards ?? 0,
          capyCoins: parsed.capyCoins ?? 0,
          gameTokens: parsed.gameTokens ?? 5,
          bufferStock: parsed.bufferStock ?? 0,
          currentStage: parsed.currentStage ?? 'default',
          isHardcore: parsed.isHardcore ?? false,
          isBossRush: parsed.isBossRush ?? false,
          isTrueHell: parsed.isTrueHell ?? false,
          isSandbox: parsed.isSandbox ?? false,
          isGigaGacha: parsed.isGigaGacha ?? false,
          isSuddenDeath: parsed.isSuddenDeath ?? false,
          isSkyMode: parsed.isSkyMode ?? false,
          isAlienMode: parsed.isAlienMode ?? false,
          isUltraBoss: false,
          ultraBossSlayer: false,
          ultraBossKills: 0,
          unlockedBadges: (parsed.unlockedBadges || []).filter((b: string) => b !== 'god_slayer'),
          activeBadgeId: parsed.activeBadgeId === 'god_slayer' ? undefined : parsed.activeBadgeId,
          highestTrueHellWave: parsed.highestTrueHellWave ?? 0,
          highestSuddenDeathWave: parsed.highestSuddenDeathWave ?? 0,
          highestBossRushWave: parsed.highestBossRushWave ?? 0,
          highestSkyModeWave: parsed.highestSkyModeWave ?? 0,
          highestAlienModeWave: parsed.highestAlienModeWave ?? 0,
          skyModeKills: parsed.skyModeKills ?? 0,
          alienModeKills: parsed.alienModeKills ?? 0,
          skyChasingCutsceneTriggered: parsed.skyChasingCutsceneTriggered ?? false,
          warperInfectionCutsceneTriggered: parsed.warperInfectionCutsceneTriggered ?? false,
          clashWins: parsed.clashWins ?? 0,
          arcaneWarperUses: parsed.arcaneWarperUses ?? 0,
          autoSellDuplicates: parsed.autoSellDuplicates ?? true,
          autoSellCommons: parsed.autoSellCommons ?? false,
          autoSellRares: parsed.autoSellRares ?? false,
          autoSellEpics: parsed.autoSellEpics ?? false,
          autoSellLegendaries: parsed.autoSellLegendaries ?? false,
          autoDeployWaves: parsed.autoDeployWaves ?? false,
          autoDeployTowers: parsed.autoDeployTowers ?? false,
          autoDeployUnitId: parsed.autoDeployUnitId ?? 'best',
          autoUpgradeTowers: parsed.autoUpgradeTowers ?? false,
          autoSummon: parsed.autoSummon ?? false,
          autoSummonAltar: parsed.autoSummonAltar ?? 'standard',
          altarType: parsed.altarType ?? 'standard',
          gameSpeed: parsed.gameSpeed ?? 1,
          soundEffectsEnabled: parsed.soundEffectsEnabled ?? true,
          ambientAudioEnabled: parsed.ambientAudioEnabled ?? true,
          globalMute: parsed.globalMute ?? false,
          screenShakeEnabled: parsed.screenShakeEnabled ?? true,
          showGrid: parsed.showGrid ?? false,
          disableVFX: parsed.disableVFX ?? false,
          ultraLagReduce: parsed.ultraLagReduce ?? false,
          disableAllNotifications: parsed.disableAllNotifications ?? false,
          quickDeployUnitIds: parsed.quickDeployUnitIds,
          unlockedRelics: Array.isArray(parsed.unlockedRelics) ? parsed.unlockedRelics : [],
          equippedRelicIds: Array.isArray(parsed.equippedRelicIds) ? parsed.equippedRelicIds : [],
          skyFightEnabled: parsed.skyFightEnabled ?? false,
          skyFightScore: parsed.skyFightScore ?? 0,
        };
        if (loadedState.isSuddenDeath) {
          loadedState.health = 1;
        }
        if (loadedState.isSandbox) {
          loadedState.meat = 99999999;
          loadedState.dna = 99999999;
        }
        return loadedState;
      }
    } catch (e) {
      console.error("Failed to load slot save", e);
    }
    return {
      meat: 2500,
      dna: 1000,
      health: 20,
      wave: 0,
      isGameOver: false,
      isWaveActive: false,
      summonedAnimals: ['mouse'], 
      secretPity: 0,
      totalWaveEnemies: 0,
      waveEnemiesDefeated: 0,
      celestialPity: 0,
      unrivaledPity: 0,
      celestialTraitPity: 0,
      mysteryPity: 0,
      mysteryTraitPity: 0,
      originalPity: 0,
      overseerPity: 0,
      capyPity: 0,
      shardsOfGods: 20,
      arcaneShards: 0,
      capyCoins: 0,
      gameTokens: 5,
      bufferStock: 0,
      currentStage: 'default',
      isHardcore: false,
      isBossRush: false,
      isTrueHell: false,
      isSandbox: false,
      isGigaGacha: false,
      isSuddenDeath: false,
      isSkyMode: false,
      isAlienMode: false,
      isUltraBoss: false,
      ultraBossSlayer: false,
      ultraBossKills: 0,
      unlockedBadges: [],
      activeBadgeId: undefined,
      highestTrueHellWave: 0,
      highestSuddenDeathWave: 0,
      highestBossRushWave: 0,
      highestSkyModeWave: 0,
      highestAlienModeWave: 0,
      skyModeKills: 0,
      alienModeKills: 0,
      skyChasingCutsceneTriggered: false,
      clashWins: 0,
      arcaneWarperUses: 0,
      autoSellDuplicates: true,
      autoSellCommons: false,
      autoSellRares: false,
      autoSellEpics: false,
      autoSellLegendaries: false,
      autoDeployWaves: false,
      autoDeployTowers: false,
      autoDeployUnitId: 'best',
      autoUpgradeTowers: false,
      autoSummon: false,
      autoSummonAltar: 'standard',
      altarType: 'standard',
      gameSpeed: 1,
      soundEffectsEnabled: true,
      ambientAudioEnabled: true,
      globalMute: false,
      screenShakeEnabled: true,
      showGrid: false,
      disableVFX: false,
      ultraLagReduce: false,
      disableAllNotifications: false,
      unlockedRelics: [],
      equippedRelicIds: [],
      skyFightEnabled: false,
      skyFightScore: 0,
    };
  }, []);

  const loadTowers = useCallback((slot: string): TowerInstance[] => {
    try {
      const slotKey = `primal_defense_slot_${slot}`;
      const saved = localStorage.getItem(slotKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.towers && Array.isArray(parsed.towers)) {
          return parsed.towers;
        }
      }
    } catch (e) {
      console.error("Failed to load towers slot save", e);
    }
    return [];
  }, []);

  const [gameState, setGameState] = useState<GameState>(() => {
    const slot = localStorage.getItem('primal_defense_active_slot') || '1';
    return loadGameState(slot === '2' || slot === '3' ? slot : '1');
  });

  const [towers, setTowers] = useState<TowerInstance[]>(() => {
    const slot = localStorage.getItem('primal_defense_active_slot') || '1';
    const loadedTowers = loadTowers(slot === '2' || slot === '3' ? slot : '1');
    const slotState = loadGameState(slot === '2' || slot === '3' ? slot : '1');
    const activePath = STAGE_PATHS[slotState.currentStage || 'default'] || STAGE_PATHS.default;
    return repositionTowersOffPath(loadedTowers, activePath, slotState.isUltraBoss).towers;
  });
  const [enemies, setEnemies] = useState<EnemyInstance[]>(([]));
  const [waveSummary, setWaveSummary] = useState<WaveSummary | null>(null);
  const waveDamageRef = useRef<Record<string, number>>({});
  const towerDetailsHistoryRef = useRef<Record<string, { name: string, animalId: string, rarity: Rarity, trait?: string, level: number, color: string, isPinnacle?: boolean }>>({});
  const [isOverseerCutsceneOpen, setIsOverseerCutsceneOpen] = useState(false);
  const isCutsceneOpenRef = useRef(false);
  isCutsceneOpenRef.current = isOverseerCutsceneOpen;

  const [isUnrivaledCutsceneOpen, setIsUnrivaledCutsceneOpen] = useState(false);
  const isUnrivaledCutsceneOpenRef = useRef(false);
  isUnrivaledCutsceneOpenRef.current = isUnrivaledCutsceneOpen;

  const unrivaledCutsceneTriggeredRef = useRef(false);

  const [isWarperClashCutsceneOpen, setIsWarperClashCutsceneOpen] = useState(false);
  const isWarperClashCutsceneOpenRef = useRef(false);
  isWarperClashCutsceneOpenRef.current = isWarperClashCutsceneOpen;

  const warperClashCutsceneTriggeredRef = useRef(false);

  const [isSkyChasingCutsceneOpen, setIsSkyChasingCutsceneOpen] = useState(false);
  const isSkyChasingCutsceneOpenRef = useRef(false);
  isSkyChasingCutsceneOpenRef.current = isSkyChasingCutsceneOpen;

  const skyChasingCutsceneTriggeredRef = useRef(false);

  const [isWarperInfectionCutsceneOpen, setIsWarperInfectionCutsceneOpen] = useState(false);
  const isWarperInfectionCutsceneOpenRef = useRef(false);
  isWarperInfectionCutsceneOpenRef.current = isWarperInfectionCutsceneOpen;

  const warperInfectionCutsceneTriggeredRef = useRef(false);

  const [isTitanBaseReturnCutsceneOpen, setIsTitanBaseReturnCutsceneOpen] = useState(false);
  const isTitanBaseReturnCutsceneOpenRef = useRef(false);
  isTitanBaseReturnCutsceneOpenRef.current = isTitanBaseReturnCutsceneOpen;

  const titanBaseReturnCutsceneTriggeredRef = useRef(false);

  const [isBaseAttackPart1CutsceneOpen, setIsBaseAttackPart1CutsceneOpen] = useState(false);
  const isBaseAttackPart1CutsceneOpenRef = useRef(false);
  isBaseAttackPart1CutsceneOpenRef.current = isBaseAttackPart1CutsceneOpen;

  const baseAttackPart1CutsceneTriggeredRef = useRef(false);

  const [isBaseAttackPart2CutsceneOpen, setIsBaseAttackPart2CutsceneOpen] = useState(false);
  const isBaseAttackPart2CutsceneOpenRef = useRef(false);
  isBaseAttackPart2CutsceneOpenRef.current = isBaseAttackPart2CutsceneOpen;

  const baseAttackPart2CutsceneTriggeredRef = useRef(false);

  const [isBaseAttackPart3CutsceneOpen, setIsBaseAttackPart3CutsceneOpen] = useState(false);
  const isBaseAttackPart3CutsceneOpenRef = useRef(false);
  isBaseAttackPart3CutsceneOpenRef.current = isBaseAttackPart3CutsceneOpen;

  const baseAttackPart3CutsceneTriggeredRef = useRef(false);

  const [isLoreTitanCutsceneOpen, setIsLoreTitanCutsceneOpen] = useState(false);
  const isLoreTitanCutsceneOpenRef = useRef(false);
  isLoreTitanCutsceneOpenRef.current = isLoreTitanCutsceneOpen;

  const loreTitanCutsceneTriggeredRef = useRef(false);

  const [isWarperReturnCutsceneOpen, setIsWarperReturnCutsceneOpen] = useState(false);
  const isWarperReturnCutsceneOpenRef = useRef(false);
  isWarperReturnCutsceneOpenRef.current = isWarperReturnCutsceneOpen;

  const warperReturnCutsceneTriggeredRef = useRef(false);

  const handleWarperPurified = useCallback(() => {
    setGameState(gs => {
      const currentSummoned = gs.summonedAnimals || [];
      const nextSummoned = currentSummoned.includes('arcane_warper')
        ? currentSummoned
        : [...currentSummoned, 'arcane_warper'];

      return {
        ...gs,
        summonedAnimals: nextSummoned,
        warperPurifiedCutsceneTriggered: true,
        arcaneShards: (gs.arcaneShards || 0) + 5,
        meat: gs.meat + 10000000,
        dna: gs.dna + 1000000
      };
    });

    gameAudio.playSFX('victory');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('warper-purified-home', {
        detail: { unitId: 'arcane_warper' }
      }));
    }
  }, []);

  const customSetIsWarperReturnCutsceneOpen = useCallback((open: boolean | ((prev: boolean) => boolean)) => {
    setIsWarperReturnCutsceneOpen(prev => {
      const nextVal = typeof open === 'function' ? open(prev) : open;
      if (prev === true && nextVal === false) {
        handleWarperPurified();
      }
      return nextVal;
    });
  }, [handleWarperPurified]);

  const handleTransformTitanToMultiverse = useCallback(() => {
    // 1. Transform all Titan towers to Form 3 Multiverse Watcher
    setTowers(prevTowers => {
      const nextTowers = prevTowers.map(t => {
        if (t.animalId === 'titan_defender') {
          return {
            ...t,
            titanForm: 'form3_multiverse' as const,
            titanSingularityCoreUpgrade: true,
            titanTVArrayUpgrade: true,
            titanGammaRayUpgrade: true,
            titanCoreUpgrade: true,
            titanLaserCannonsUpgrade: true,
            titanFrontShieldUpgrade: true,
            titanSideShieldUpgrade: true,
            titanSkin: 'upgraded_titan_tv_man' as const
          };
        }
        return t;
      });
      towersRef.current = nextTowers;
      return nextTowers;
    });

    // 2. Update gameState loreTitanTransformed
    setGameState(gs => ({
      ...gs,
      loreTitanTransformed: true,
      arcaneShards: Math.max(gs.arcaneShards || 0, 3),
      meat: gs.meat + 5000000,
      dna: gs.dna + 500000
    }));

    // 3. Play sound and trigger cosmic particle shockwave
    gameAudio.playSFX('upgrade');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('titan-multiverse-transformed', {
        detail: { form: 'form3_multiverse' }
      }));
    }
  }, []);

  const customSetIsWarperInfectionCutsceneOpen = useCallback((open: boolean | ((prev: boolean) => boolean)) => {
    setIsWarperInfectionCutsceneOpen(prev => {
      const nextVal = typeof open === 'function' ? open(prev) : open;
      if (prev === true && nextVal === false) {
        // Wave 200 Warper Infection cutscene completed - award tactical survival bounty without transforming Titan
        setGameState(gs => ({
          ...gs,
          warperInfectionCutsceneTriggered: true,
          meat: gs.meat + 2000000,
          dna: gs.dna + 200000,
          arcaneShards: (gs.arcaneShards || 0) + 1
        }));
        // Trigger post-infection Base Return cutscene with Titan and Scientist Animals
        setIsTitanBaseReturnCutsceneOpen(true);
      }
      return nextVal;
    });
  }, []);

  const customSetIsTitanBaseReturnCutsceneOpen = useCallback((open: boolean | ((prev: boolean) => boolean)) => {
    setIsTitanBaseReturnCutsceneOpen(prev => {
      const nextVal = typeof open === 'function' ? open(prev) : open;
      if (prev === true && nextVal === false) {
        // Post-infection base return completed
        setGameState(gs => ({
          ...gs,
          titanBaseReturnCutsceneTriggered: true,
          meat: gs.meat + 1000000,
          dna: gs.dna + 100000
        }));
      }
      return nextVal;
    });
  }, []);

  const customSetIsBaseAttackPart1CutsceneOpen = useCallback((open: boolean | ((prev: boolean) => boolean)) => {
    setIsBaseAttackPart1CutsceneOpen(prev => {
      const nextVal = typeof open === 'function' ? open(prev) : open;
      if (prev === true && nextVal === false) {
        // Wave 240 Base Attack Part 1 completed
        setGameState(gs => ({
          ...gs,
          baseAttackPart1CutsceneTriggered: true,
          meat: gs.meat + 1000000,
          dna: gs.dna + 150000
        }));
      }
      return nextVal;
    });
  }, []);

  const customSetIsBaseAttackPart2CutsceneOpen = useCallback((open: boolean | ((prev: boolean) => boolean)) => {
    setIsBaseAttackPart2CutsceneOpen(prev => {
      const nextVal = typeof open === 'function' ? open(prev) : open;
      if (prev === true && nextVal === false) {
        // Wave 256 Base Attack Part 2 completed
        setGameState(gs => ({
          ...gs,
          baseAttackPart2CutsceneTriggered: true,
          meat: gs.meat + 2500000,
          dna: gs.dna + 300000,
          arcaneShards: (gs.arcaneShards || 0) + 1
        }));
      }
      return nextVal;
    });
  }, []);

  const customSetIsBaseAttackPart3CutsceneOpen = useCallback((open: boolean | ((prev: boolean) => boolean)) => {
    setIsBaseAttackPart3CutsceneOpen(prev => {
      const nextVal = typeof open === 'function' ? open(prev) : open;
      if (prev === true && nextVal === false) {
        // Wave 270 Base Attack Part 3 completed (Surviving Mothership Base Obliteration in Quantum Shield)
        setGameState(gs => ({
          ...gs,
          baseAttackPart3CutsceneTriggered: true,
          meat: gs.meat + 5000000,
          dna: gs.dna + 500000,
          arcaneShards: (gs.arcaneShards || 0) + 2
        }));
      }
      return nextVal;
    });
  }, []);

  const customSetIsLoreTitanCutsceneOpen = useCallback((open: boolean | ((prev: boolean) => boolean)) => {
    setIsLoreTitanCutsceneOpen(prev => {
      const nextVal = typeof open === 'function' ? open(prev) : open;
      if (prev === true && nextVal === false) {
        handleTransformTitanToMultiverse();
      }
      return nextVal;
    });
  }, [handleTransformTitanToMultiverse]);

  const customSetIsSkyChasingCutsceneOpen = useCallback((open: boolean | ((prev: boolean) => boolean)) => {
    setIsSkyChasingCutsceneOpen(prev => {
      const nextVal = typeof open === 'function' ? open(prev) : open;
      if (prev === true && nextVal === false) {
        // Cutscene is closing! Grant Sky Dogfight bounty
        setGameState(gs => ({
          ...gs,
          meat: gs.meat + 100000,
          dna: gs.dna + 50000,
          shardsOfGods: (gs.shardsOfGods || 0) + 25,
          skyFightScore: (gs.skyFightScore || 0) + 1000,
          skyChasingCutsceneTriggered: true,
        }));
      }
      return nextVal;
    });
  }, []);

  const customSetIsWarperClashCutsceneOpen = useCallback((open: boolean | ((prev: boolean) => boolean)) => {
    setIsWarperClashCutsceneOpen(prev => {
      const nextVal = typeof open === 'function' ? open(prev) : open;
      if (prev === true && nextVal === false) {
        // Cutscene is closing! Vaporize any remaining 1 HP Ultra Boss and grant rewards
        setEnemies(currentEnemies => {
          const filtered = currentEnemies.filter(e => e.typeId !== 'ultra_world_boss' && (!gameStateRef.current.isUltraBoss || !e.isBoss));
          enemiesRef.current = filtered;
          return filtered;
        });
        setGameState(gs => ({
          ...gs,
          ultraBossSlayer: true,
          ultraBossKills: (gs.ultraBossKills || 0) + 1,
          shardsOfGods: (gs.shardsOfGods || 0) + 50000,
          meat: gs.meat + 100000000,
          dna: gs.dna + 10000000,
        }));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('ultra-boss-defeated', {
            detail: {
              rewardShards: 50000,
              rewardMeat: 100000000,
              rewardDna: 10000000,
              killsCount: (gameStateRef.current.ultraBossKills || 0) + 1
            }
          }));
        }
      }
      return nextVal;
    });
  }, []);

  const customSetIsUnrivaledCutsceneOpen = useCallback((open: boolean | ((prev: boolean) => boolean)) => {
    setIsUnrivaledCutsceneOpen(prev => {
      const nextVal = typeof open === 'function' ? open(prev) : open;
      if (prev === true && nextVal === false) {
        // Cutscene is closing! Vaporize any remaining 1 HP unrivaled original boss
        setEnemies(currentEnemies => {
          const filtered = currentEnemies.filter(e => e.typeId !== 'unrivaled_original');
          enemiesRef.current = filtered;
          return filtered;
        });
      }
      return nextVal;
    });
  }, []);

  const customSetIsOverseerCutsceneOpen = useCallback((open: boolean | ((prev: boolean) => boolean)) => {
    setIsOverseerCutsceneOpen(prev => {
      const nextVal = typeof open === 'function' ? open(prev) : open;
      if (prev === true && nextVal === false) {
        // Cutscene is closing! Vaporize any remaining 1 HP hunter commander
        setEnemies(currentEnemies => {
          const filtered = currentEnemies.filter(e => e.typeId !== 'hunter_commander');
          enemiesRef.current = filtered;
          return filtered;
        });
      }
      return nextVal;
    });
  }, []);

  const cutsceneTriggeredRef = useRef(false);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [skillEffects, setSkillEffects] = useState<SkillEffect[]>([]);
  
  const requestRef = useRef<number>(null);
  const lastTimeRef = useRef<number>(0);
  const lastProcessedTimeRef = useRef<number>(0);
  const autoWaveTriggerTime = useRef<number>(0);
  const accumulatorRef = useRef<number>(0);
  const lastStateCommitTimeRef = useRef<number>(0);
  const virtualTimeRef = useRef<number>(0);
  const gameTimeRef = useRef<number>(0);
  const waveEnemyQueue = useRef<EnemyType[]>([]);
  const lastSpawnTime = useRef<number>(0);
  const lastGenerationTime = useRef<number>(0);
  const lastEruptTime = useRef<number>(0);
  const pendingDamageEvents = useRef<{ x: number, y: number, damage: number, radius: number, triggerTime: number, color: string, sourceTowerId?: string }[]>([]);

  // Real-time DPS tracking history storage
  const damageDealtHistoryRef = useRef<Record<string, { timestamp: number; damage: number }[]>>({});
  const accumulatedXpRef = useRef<Record<string, number>>({});

  const selectedAnimalIdRef = useRef<string | null>(null);
  const placeOnlyBestRef = useRef<boolean>(false);

  useEffect(() => {
    selectedAnimalIdRef.current = selectedAnimalId ?? null;
  }, [selectedAnimalId]);

  useEffect(() => {
    placeOnlyBestRef.current = placeOnlyBest ?? false;
  }, [placeOnlyBest]);

  const elementalDamageRef = useRef<Record<string, number>>({
    fire: 0,
    poison: 0,
    water: 0,
    sand: 0,
    dirt: 0,
    ice: 0,
    wind: 0,
  });

  const [elementalDamage, setElementalDamage] = useState<Record<string, number>>({
    fire: 0,
    poison: 0,
    water: 0,
    sand: 0,
    dirt: 0,
    ice: 0,
    wind: 0,
  });

  // Sync state periodically (every 500ms) from real-time ref
  useEffect(() => {
    const interval = setInterval(() => {
      setElementalDamage({ ...elementalDamageRef.current });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Sync real-time ref when a save slot loads or resets
  useEffect(() => {
    if (gameState.elementalDamage) {
      elementalDamageRef.current = {
        fire: gameState.elementalDamage.fire ?? 0,
        poison: gameState.elementalDamage.poison ?? 0,
        water: gameState.elementalDamage.water ?? 0,
        sand: gameState.elementalDamage.sand ?? 0,
        dirt: gameState.elementalDamage.dirt ?? 0,
        ice: gameState.elementalDamage.ice ?? 0,
        wind: gameState.elementalDamage.wind ?? 0,
      };
      setElementalDamage({ ...elementalDamageRef.current });
    } else {
      elementalDamageRef.current = {
        fire: 0,
        poison: 0,
        water: 0,
        sand: 0,
        dirt: 0,
        ice: 0,
        wind: 0,
      };
      setElementalDamage({ ...elementalDamageRef.current });
    }
  }, [gameState.elementalDamage]);

  // --- ELEMENTAL HAZARDS STATE & CONTROLLER ---
  const [elementalHazards, setElementalHazards] = useState<ElementalHazardZone[]>([]);
  const elementalHazardsRef = useRef<ElementalHazardZone[]>([]);
  const lastHazardShiftTimeRef = useRef<number>(Date.now());

  const shiftElementalHazards = useCallback(() => {
    const activePath = STAGE_PATHS[gameStateRef.current.currentStage || 'default'] || STAGE_PATHS.default;
    const newHazards = generateElementalHazards(activePath, elementalHazardsRef.current);
    elementalHazardsRef.current = newHazards;
    setElementalHazards(newHazards);
    lastHazardShiftTimeRef.current = Date.now();

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('elemental-hazard-shifted', { detail: { hazards: newHazards } }));
    }
  }, []);

  // Initialize or re-roll hazards and reposition towers when stage/realm changes
  useEffect(() => {
    const activePath = STAGE_PATHS[gameState.currentStage || 'default'] || STAGE_PATHS.default;
    const initialHazards = generateElementalHazards(activePath);
    elementalHazardsRef.current = initialHazards;
    setElementalHazards(initialHazards);
    lastHazardShiftTimeRef.current = Date.now();

    // Check if any existing towers collide with or sit on the new realm's path
    if (towersRef.current && towersRef.current.length > 0) {
      const { towers: adjustedTowers, movedCount } = repositionTowersOffPath(
        towersRef.current,
        activePath,
        gameStateRef.current.isUltraBoss
      );
      if (movedCount > 0) {
        towersRef.current = adjustedTowers;
        setTowers(adjustedTowers);
        gameAudio.playSFX('place');
      }
    }
  }, [gameState.currentStage]);

  const recordDamageDealt = useCallback((towerId: string, amount: number) => {
    if (!towerId || amount <= 0) return;
    const now = Date.now();
    if (!damageDealtHistoryRef.current[towerId]) {
      damageDealtHistoryRef.current[towerId] = [];
    }
    damageDealtHistoryRef.current[towerId].push({ timestamp: now, damage: amount });
    let xpGain = amount;
    if (gameStateRef.current && gameStateRef.current.isTrueHell && !gameStateRef.current.isUltraBoss) {
      xpGain = amount / 100000;
    }
    accumulatedXpRef.current[towerId] = (accumulatedXpRef.current[towerId] || 0) + xpGain;
    waveDamageRef.current[towerId] = (waveDamageRef.current[towerId] || 0) + amount;

    const tower = towersRef.current.find(t => t.id === towerId);
    if (tower) {
      // Attribute damage to element
      const element = tower.animalId === 'elemental_god' ? (tower.element || 'fire') : (ANIMAL_ELEMENTS[tower.animalId] || 'dirt');
      if (elementalDamageRef.current[element] !== undefined) {
        elementalDamageRef.current[element] += amount;
      }

      window.dispatchEvent(new CustomEvent('tower-dealt-damage', { detail: { towerId, amount } }));

      if (!towerDetailsHistoryRef.current[towerId]) {
        const animal = ANIMALS.find(a => a.id === tower.animalId);
        if (animal) {
          towerDetailsHistoryRef.current[towerId] = {
            name: animal.name,
            animalId: animal.id,
            rarity: animal.rarity,
            trait: tower.trait,
            level: tower.level,
            color: animal.color,
            isPinnacle: tower.isPinnacle,
          };
        }
      } else {
        towerDetailsHistoryRef.current[towerId].level = tower.level;
        towerDetailsHistoryRef.current[towerId].trait = tower.trait;
        towerDetailsHistoryRef.current[towerId].isPinnacle = tower.isPinnacle;
      }
    }
  }, []);

  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  const enemiesRef = useRef(enemies);
  enemiesRef.current = enemies;

  const towersRef = useRef(towers);
  towersRef.current = towers;

  const projectilesRef = useRef(projectiles);
  projectilesRef.current = projectiles;

  const skillEffectsRef = useRef(skillEffects);
  skillEffectsRef.current = skillEffects;

  // Persistence Effect
  useEffect(() => {
    const slotKey = `primal_defense_slot_${activeSlot}`;
    localStorage.setItem(slotKey, JSON.stringify({
      meat: gameState.meat,
      dna: gameState.dna,
      health: 20,
      wave: gameState.wave,
      summonedAnimals: gameState.summonedAnimals,
      secretPity: gameState.secretPity,
      celestialPity: gameState.celestialPity ?? 0,
      unrivaledPity: gameState.unrivaledPity ?? 0,
      celestialTraitPity: gameState.celestialTraitPity ?? 0,
      mysteryPity: gameState.mysteryPity ?? 0,
      mysteryTraitPity: gameState.mysteryTraitPity ?? 0,
      originalPity: gameState.originalPity ?? 0,
      overseerPity: gameState.overseerPity ?? 0,
      capyPity: gameState.capyPity ?? 0,
      shardsOfGods: gameState.shardsOfGods ?? 0,
      capyCoins: gameState.capyCoins ?? 0,
      bufferStock: gameState.bufferStock ?? 0,
      currentStage: gameState.currentStage ?? 'default',
      isHardcore: gameState.isHardcore ?? false,
      isBossRush: gameState.isBossRush ?? false,
      isTrueHell: gameState.isTrueHell ?? false,
      isSandbox: gameState.isSandbox ?? false,
      isGigaGacha: gameState.isGigaGacha ?? false,
      isSuddenDeath: gameState.isSuddenDeath ?? false,
      isSkyMode: gameState.isSkyMode ?? false,
      isAlienMode: gameState.isAlienMode ?? false,
      isUltraBoss: gameState.isUltraBoss ?? false,
      ultraBossSlayer: gameState.ultraBossSlayer ?? false,
      ultraBossKills: gameState.ultraBossKills ?? 0,
      unlockedBadges: getUniqueUnlockedBadges(gameState),
      activeBadgeId: gameState.activeBadgeId,
      highestTrueHellWave: gameState.highestTrueHellWave ?? 0,
      highestSuddenDeathWave: gameState.highestSuddenDeathWave ?? 0,
      highestBossRushWave: gameState.highestBossRushWave ?? 0,
      highestSkyModeWave: gameState.highestSkyModeWave ?? 0,
      highestAlienModeWave: gameState.highestAlienModeWave ?? 0,
      skyModeKills: gameState.skyModeKills ?? 0,
      alienModeKills: gameState.alienModeKills ?? 0,
      skyChasingCutsceneTriggered: gameState.skyChasingCutsceneTriggered ?? false,
      clashWins: gameState.clashWins ?? 0,
      arcaneWarperUses: gameState.arcaneWarperUses ?? 0,
      autoSellDuplicates: gameState.autoSellDuplicates,
      autoSellCommons: gameState.autoSellCommons,
      autoSellRares: gameState.autoSellRares,
      autoSellEpics: gameState.autoSellEpics ?? false,
      autoSellLegendaries: gameState.autoSellLegendaries ?? false,
      autoDeployWaves: gameState.autoDeployWaves ?? false,
      autoDeployTowers: gameState.autoDeployTowers ?? false,
      autoDeployUnitId: gameState.autoDeployUnitId ?? 'best',
      autoUpgradeTowers: gameState.autoUpgradeTowers ?? false,
      autoSummon: gameState.autoSummon ?? false,
      autoSummonAltar: gameState.autoSummonAltar ?? 'standard',
      altarType: gameState.altarType ?? 'standard',
      gameSpeed: gameState.gameSpeed ?? 1,
      soundEffectsEnabled: gameState.soundEffectsEnabled ?? true,
      ambientAudioEnabled: gameState.ambientAudioEnabled ?? true,
      globalMute: gameState.globalMute ?? false,
      screenShakeEnabled: gameState.screenShakeEnabled ?? true,
      showGrid: gameState.showGrid ?? false,
      disableVFX: gameState.disableVFX ?? false,
      ultraLagReduce: gameState.ultraLagReduce ?? false,
      towers: towers,
      elementalDamage: elementalDamageRef.current,
      savedAt: Date.now(),
    }));
  }, [
    activeSlot,
    gameState.meat,
    gameState.dna,
    gameState.wave,
    gameState.summonedAnimals,
    gameState.secretPity,
    gameState.celestialPity,
    gameState.unrivaledPity,
    gameState.celestialTraitPity,
    gameState.mysteryPity,
    gameState.mysteryTraitPity,
    gameState.originalPity,
    gameState.overseerPity,
    gameState.capyPity,
    gameState.shardsOfGods,
    gameState.capyCoins,
    gameState.bufferStock,
    gameState.currentStage,
    gameState.isHardcore,
    gameState.isBossRush,
    gameState.isTrueHell,
    gameState.isSandbox,
    gameState.isGigaGacha,
    gameState.isSuddenDeath,
    gameState.autoSellDuplicates,
    gameState.autoSellCommons,
    gameState.autoSellRares,
    gameState.autoSellEpics,
    gameState.autoSellLegendaries,
    gameState.autoDeployWaves,
    gameState.autoDeployTowers,
    gameState.autoDeployUnitId,
    gameState.autoUpgradeTowers,
    gameState.autoSummon,
    gameState.autoSummonAltar,
    gameState.altarType,
    gameState.gameSpeed,
    gameState.soundEffectsEnabled,
    gameState.ambientAudioEnabled,
    gameState.globalMute,
    gameState.screenShakeEnabled,
    gameState.showGrid,
    gameState.disableVFX,
    gameState.ultraLagReduce,
    towers,
    elementalDamage,
  ]);

  // Sync Audio Settings with Native Synthesizer Node Group
  useEffect(() => {
    gameAudio.updateSettings(
      gameState.soundEffectsEnabled !== false,
      gameState.ambientAudioEnabled !== false,
      gameState.globalMute === true
    );
  }, [gameState.soundEffectsEnabled, gameState.ambientAudioEnabled, gameState.globalMute]);

  const changeSlot = useCallback((slot: string) => {
    if (slot !== '1' && slot !== '2' && slot !== '3') return;
    
    // Save current slot before switching
    const currentSlotKey = `primal_defense_slot_${activeSlot}`;
    localStorage.setItem(currentSlotKey, JSON.stringify({
      meat: gameStateRef.current.meat,
      dna: gameStateRef.current.dna,
      health: 20,
      wave: gameStateRef.current.wave,
      summonedAnimals: gameStateRef.current.summonedAnimals,
      secretPity: gameStateRef.current.secretPity,
      celestialPity: gameStateRef.current.celestialPity ?? 0,
      unrivaledPity: gameStateRef.current.unrivaledPity ?? 0,
      celestialTraitPity: gameStateRef.current.celestialTraitPity ?? 0,
      mysteryPity: gameStateRef.current.mysteryPity ?? 0,
      mysteryTraitPity: gameStateRef.current.mysteryTraitPity ?? 0,
      originalPity: gameStateRef.current.originalPity ?? 0,
      overseerPity: gameStateRef.current.overseerPity ?? 0,
      capyPity: gameStateRef.current.capyPity ?? 0,
      shardsOfGods: gameStateRef.current.shardsOfGods ?? 0,
      capyCoins: gameStateRef.current.capyCoins ?? 0,
      bufferStock: gameStateRef.current.bufferStock ?? 0,
      currentStage: gameStateRef.current.currentStage ?? 'default',
      isHardcore: gameStateRef.current.isHardcore ?? false,
      isBossRush: gameStateRef.current.isBossRush ?? false,
      isTrueHell: gameStateRef.current.isTrueHell ?? false,
      isSandbox: gameStateRef.current.isSandbox ?? false,
      isGigaGacha: gameStateRef.current.isGigaGacha ?? false,
      isSuddenDeath: gameStateRef.current.isSuddenDeath ?? false,
      autoSellDuplicates: gameStateRef.current.autoSellDuplicates,
      autoSellCommons: gameStateRef.current.autoSellCommons,
      autoSellRares: gameStateRef.current.autoSellRares,
      autoSellEpics: gameStateRef.current.autoSellEpics ?? false,
      autoSellLegendaries: gameStateRef.current.autoSellLegendaries ?? false,
      autoDeployWaves: gameStateRef.current.autoDeployWaves ?? false,
      autoDeployTowers: gameStateRef.current.autoDeployTowers ?? false,
      autoDeployUnitId: gameStateRef.current.autoDeployUnitId ?? 'best',
      autoUpgradeTowers: gameStateRef.current.autoUpgradeTowers ?? false,
      autoSummon: gameStateRef.current.autoSummon ?? false,
      autoSummonAltar: gameStateRef.current.autoSummonAltar ?? 'standard',
      altarType: gameStateRef.current.altarType ?? 'standard',
      gameSpeed: gameStateRef.current.gameSpeed ?? 1,
      soundEffectsEnabled: gameStateRef.current.soundEffectsEnabled ?? true,
      ambientAudioEnabled: gameStateRef.current.ambientAudioEnabled ?? true,
      globalMute: gameStateRef.current.globalMute ?? false,
      screenShakeEnabled: gameStateRef.current.screenShakeEnabled ?? true,
      showGrid: gameStateRef.current.showGrid ?? false,
      towers: towersRef.current,
      elementalDamage: elementalDamageRef.current,
      savedAt: Date.now(),
    }));

    // Save selected active slot
    localStorage.setItem('primal_defense_active_slot', slot);
    setActiveSlot(slot);

    // Load new states
    const nextGame = loadGameState(slot);
    const nextTowers = loadTowers(slot);
    const stagePath = STAGE_PATHS[nextGame.currentStage || 'default'] || STAGE_PATHS.default;
    const { towers: validatedTowers } = repositionTowersOffPath(nextTowers, stagePath, nextGame.isUltraBoss);
    setGameState(nextGame);
    gameStateRef.current = nextGame;
    setTowers(validatedTowers);
    towersRef.current = validatedTowers;

    // Clear runtime objects to prevent leftover states between saves
    setEnemies([]);
    setProjectiles([]);
    setSkillEffects([]);
  }, [activeSlot, loadGameState, loadTowers]);

  const clearSlot = useCallback((slot: string) => {
    const slotKey = `primal_defense_slot_${slot}`;
    localStorage.removeItem(slotKey);
    
    // If clearing active slot, reset active state to default initialization
    if (slot === activeSlot) {
      const defaultState = loadGameState(slot);
      const defaultTowers = loadTowers(slot);
      setGameState(defaultState);
      setTowers(defaultTowers);
      setEnemies([]);
      setProjectiles([]);
      setSkillEffects([]);
    }
  }, [activeSlot, loadGameState, loadTowers]);

  const cloneSlot = useCallback((fromSlot: string, toSlot: string) => {
    if (fromSlot === toSlot) return;
    const fromKey = `primal_defense_slot_${fromSlot}`;
    const toKey = `primal_defense_slot_${toSlot}`;
    const data = localStorage.getItem(fromKey);
    if (data) {
      localStorage.setItem(toKey, data);
      
      // If we clone to current active slot, load it now!
      if (toSlot === activeSlot) {
        const loadedState = loadGameState(toSlot);
        const loadedTowers = loadTowers(toSlot);
        const activePath = STAGE_PATHS[loadedState.currentStage || 'default'] || STAGE_PATHS.default;
        const { towers: validatedTowers } = repositionTowersOffPath(loadedTowers, activePath, loadedState.isUltraBoss);
        setGameState(loadedState);
        gameStateRef.current = loadedState;
        setTowers(validatedTowers);
        towersRef.current = validatedTowers;
        setEnemies([]);
        setProjectiles([]);
        setSkillEffects([]);
      }
    }
  }, [activeSlot, loadGameState, loadTowers]);

  const resetGame = useCallback(() => {
    const slotKey = `primal_defense_slot_${activeSlot}`;
    localStorage.removeItem(slotKey);
    // Also clear general save key just in case
    localStorage.removeItem(SAVE_KEY);
    window.location.reload();
  }, [activeSlot]);

  const startWave = useCallback(() => {
    if (gameStateRef.current.isWaveActive) return;
    gameStateRef.current.isWaveActive = true;
    cutsceneTriggeredRef.current = false;
    warperClashCutsceneTriggeredRef.current = false;
    waveDamageRef.current = {};
    towerDetailsHistoryRef.current = {};
    setWaveSummary(null);

    // Dynamic shift of elemental hazards at wave start
    shiftElementalHazards();
    
    const newWave = gameStateRef.current.wave + 1;
    
    // Generate wave enemies
    const queue: EnemyType[] = [];
    
    if (gameStateRef.current.isLoreMode) {
      // 400-WAVE LORE CHRONICLES CAMPAIGN
      if (newWave > 400) {
        alert("👑 LORE VICTORY: You have conquered all 400 waves of the Lore Chronicles Campaign! Multiverse Equilibrium has been restored!");
        setGameState(prev => ({ ...prev, isWaveActive: false, loreCompleted: true }));
        return;
      }

      const loreData = getLoreWaveData(newWave);
      // Wave 400 Finale has 10,000 enemies invading the sanctuary!
      const intensity = newWave === 400 ? 10000 : Math.max(5, Math.min(25, Math.floor(newWave * 0.08) + 4));

      // Build thematic enemy pool based on current saga/wave
      let pool = ENEMIES.filter(e => !e.isBoss && e.id !== 'ultra_world_boss');
      if (newWave <= 40) {
        pool = pool.filter(e => ['scout', 'grunt', 'hunter_scout', 'hunter_poacher', 'hunter_sniper', 'hunter_trapper', 'hunter_drone_commander'].includes(e.id) || e.category === 'bad_animal');
      } else if (newWave <= 80) {
        pool = pool.filter(e => ['hunter_exosuit', 'hunter_drone_commander', 'hunter_cyber_ninja', 'hitech_trapper', 'hitech_nullifier'].includes(e.id) || e.category === 'bad_animal');
      } else if (newWave <= 160) {
        pool = pool.filter(e => ['hunter_mech_walker', 'hunter_cyber_ninja', 'hitech_spectre', 'hitech_nullifier', 'bio_hydra'].includes(e.id) || e.category === 'bad_animal');
      } else if (newWave <= 250) {
        pool = pool.filter(e => ['alien_crawler', 'alien_stalker', 'alien_acid_spitter', 'hitech_spectre', 'hunter_mech_walker'].includes(e.id));
      } else if (newWave <= 350) {
        pool = pool.filter(e => ['alien_bio_titan', 'alien_mothership', 'hunter_grand_inquisitor', 'hitech_nullifier'].includes(e.id) || e.isAlien);
      }
      if (pool.length === 0) pool = ENEMIES.filter(e => !e.isBoss);

      for (let i = 0; i < intensity; i++) {
        const type = pool[Math.floor(Math.random() * pool.length)] || ENEMIES[0];
        let enemyHealth = type.health * (1 + newWave * 0.15) * (1 + Math.pow(newWave / 90, 1.3));
        if (newWave === 400) {
          // Balance individual mob health in the 10,000 wave so towers can mow through them epicly!
          enemyHealth = Math.max(100000, enemyHealth * 0.25);
        }
        if (gameStateRef.current.isHardcore) {
          enemyHealth *= 10;
        }
        queue.push({ ...type, health: enemyHealth });
      }

      // Bosses in Lore Mode: Every 5 waves, and special 400th wave finale!
      if (newWave === 400) {
        // GRAND FINALE 400TH WAVE BOSS: The Multiverse Prime Origin!
        const grandFinaleBoss: EnemyType = {
          id: 'multiverse_prime_origin_boss',
          name: '🌌 THE MULTIVERSE PRIME ORIGIN (400TH WAVE FINALE)',
          health: 1000000000000, // 1 Trillion HP
          speed: 0.10,
          bounty: 1000000,
          color: '#ec4899',
          size: 95,
          isBoss: true,
          category: 'boss',
          emoji: '🌌',
          description: 'The primordial singularity of all 400 dimensions. Overcoming this entity secures eternal sanctuary.'
        };
        queue.push(grandFinaleBoss);
      } else if (newWave % 5 === 0 || loreData.bossTitle) {
        const bossesList = ENEMIES.filter(e => e.isBoss === true && e.id !== 'ultra_world_boss');
        const chosenBossType = bossesList[Math.floor(Math.random() * bossesList.length)] || ENEMIES.find(e => e.id === 'hitech')!;
        let bossHealth = chosenBossType.health * (1 + newWave * 0.22) * (1 + Math.pow(newWave / 80, 1.4));
        if (gameStateRef.current.isHardcore) {
          bossHealth *= 10;
        }
        queue.push({
          ...chosenBossType,
          name: loreData.bossTitle ? `👑 ${loreData.bossTitle.toUpperCase()}` : chosenBossType.name,
          health: bossHealth
        });
      }
    } else if (gameStateRef.current.isTrueHell) {
      // TRUE HELL LEVEL - Elite Bosses & Hunter Commanders with x100,000 health multipliers!
      const bossesList = ENEMIES.filter(e => e.isBoss === true && e.id !== 'ultra_world_boss');
      const intensity = Math.max(4, Math.floor(newWave * 1.6) + 2);
      for (let i = 0; i < intensity; i++) {
        const type = bossesList[Math.floor(Math.random() * bossesList.length)] || ENEMIES.find(e => e.id === 'hitech')!;
        let enemyHealth = type.health * (1 + newWave * 0.15) * 100; // base Boss Rush scaling
        if (gameStateRef.current.isHardcore) {
          enemyHealth *= 100; // Extra multiplication if hardcore is active
        }
        enemyHealth *= 100000; // x100,000 ULTRA BUFFED TRUE HELL HEALTH!
        queue.push({ ...type, health: enemyHealth });
      }

      // Note: Ultra Boss is explicitly forbidden from spawning in True Hell
    } else if (gameStateRef.current.isBossRush) {
      // BOSS RUSH LEVEL - Continuous Bosses and Heavy Hunter Commanders
      const bossesList = ENEMIES.filter(e => e.isBoss === true && e.id !== 'ultra_world_boss');
      const intensity = Math.max(3, Math.floor(newWave * 1.5) + 1);
      for (let i = 0; i < intensity; i++) {
        const type = bossesList[Math.floor(Math.random() * bossesList.length)] || ENEMIES.find(e => e.id === 'hitech')!;
        let enemyHealth = type.health * (1 + newWave * 0.15) * 100; // x100 tougher
        if (gameStateRef.current.isHardcore) {
          enemyHealth *= 100;
        }
        queue.push({ ...type, health: enemyHealth });
      }
    } else if (gameStateRef.current.isAlienMode) {
      // ALIEN INVASION MODE - Extraterrestrial Armada with Swarms, Acid Spitters, Alien Titans & Motherships!
      const alienSwarmPool = ENEMIES.filter(e => (e.isAlien || e.category === 'alien') && !e.isBoss);
      const intensity = Math.max(8, Math.floor(newWave * 2.4) + 4);
      
      for (let i = 0; i < intensity; i++) {
        let candidatePool = alienSwarmPool;
        if (newWave < 3) {
          candidatePool = alienSwarmPool.filter(e => e.id === 'alien_crawler');
        } else if (newWave < 6) {
          candidatePool = alienSwarmPool.filter(e => ['alien_crawler', 'alien_stalker', 'alien_acid_spitter'].includes(e.id));
        }
        if (candidatePool.length === 0) candidatePool = alienSwarmPool;
        const type = candidatePool[Math.floor(Math.random() * candidatePool.length)] || ENEMIES.find(e => e.id === 'alien_crawler')!;
        
        let enemyHealth = type.health * (1 + newWave * 0.16) * 1.3;
        if (gameStateRef.current.isHardcore) {
          enemyHealth *= 100;
        }
        queue.push({ ...type, health: enemyHealth });
      }

      // Alien Boss Waves every 5 waves
      if (newWave % 5 === 0) {
        if (newWave % 20 === 0) {
          // Dual Titan & Mothership Apocalypse!
          const titanType = ENEMIES.find(e => e.id === 'alien_bio_titan')!;
          const motherShipType = ENEMIES.find(e => e.id === 'alien_mothership')!;
          let tHp = titanType.health * (1 + newWave * 0.22);
          let mHp = motherShipType.health * (1 + newWave * 0.22);
          if (gameStateRef.current.isHardcore) {
            tHp *= 10;
            mHp *= 10;
          }
          queue.push({ ...titanType, health: tHp });
          queue.push({ ...motherShipType, health: mHp });
        } else if (newWave % 10 === 0) {
          // Alien Mothership Boss Wave
          const motherShipType = ENEMIES.find(e => e.id === 'alien_mothership') || ENEMIES.find(e => e.id === 'alien_bio_titan')!;
          let bossHealth = motherShipType.health * (1 + newWave * 0.25);
          if (gameStateRef.current.isHardcore) {
            bossHealth *= 10;
          }
          queue.push({ ...motherShipType, health: bossHealth });
        } else {
          // Alien Bio-Titan Boss Wave
          const titanType = ENEMIES.find(e => e.id === 'alien_bio_titan')!;
          let bossHealth = titanType.health * (1 + newWave * 0.25);
          if (gameStateRef.current.isHardcore) {
            bossHealth *= 10;
          }
          queue.push({ ...titanType, health: bossHealth });
        }
      }
    } else {
      // NORMAL LEVEL - Spawns a randomized mix of Hunter operatives & Corrupted Bad Animals in a random pattern
      const intensity = Math.max(6, Math.floor(newWave * 2.2) + 3);
      
      const hunterList = ENEMIES.filter(e => (e.category === 'hunter' || e.isHunter) && !e.isBoss);
      const badAnimalList = ENEMIES.filter(e => e.category === 'bad_animal' && !e.isBoss && e.id !== 'hitech_decoy_phantom');
      const allStandardEnemies = [...hunterList, ...badAnimalList];

      for (let i = 0; i < intensity; i++) {
        // Progressive pool unlocking with diverse random pattern
        let candidatePool = allStandardEnemies;
        if (newWave < 3) {
          candidatePool = allStandardEnemies.filter(e => ['scout', 'grunt', 'hunter_scout', 'hunter_poacher'].includes(e.id));
        } else if (newWave < 6) {
          candidatePool = allStandardEnemies.filter(e => !['ultra_hunter_warmachine', 'hunter_mech_walker', 'titan', 'reaper'].includes(e.id));
        }
        
        if (candidatePool.length === 0) candidatePool = allStandardEnemies;
        const type = candidatePool[Math.floor(Math.random() * candidatePool.length)];
        
        let enemyHealth = type.health * (1 + newWave * 0.12);
        if (gameStateRef.current.isHardcore) {
          enemyHealth *= 100;
        }
        queue.push({ ...type, health: enemyHealth });
      }
      
      // Boss milestone every 5 waves (cycles or randomizes unique boss types, hunters and beasts)
      if (newWave % 5 === 0) {
        const bossesList = ENEMIES.filter(e => e.isBoss === true && e.id !== 'ultra_world_boss');
        const chosenBossType = newWave === 100
          ? (ENEMIES.find(e => e.id === 'hunter_commander') || bossesList[0])
          : (newWave % 15 === 0 
              ? (ENEMIES.find(e => e.id === 'unrivaled_original') || bossesList[0])
              : (bossesList[Math.floor(Math.random() * bossesList.length)] || ENEMIES.find(e => e.id === 'hitech')!)
            );
        let bossHealth = chosenBossType.health * (1 + newWave * 0.25);
        if (gameStateRef.current.isHardcore) {
          bossHealth *= 100;
        }
        queue.push({ ...chosenBossType, health: bossHealth });
      }
    }

    // ULTRA WORLD BOSS ENCOUNTER (Allowed in Normal / Boss Rush or when Ultra Boss Mode is enabled, but NEVER in True Hell)
    if (!gameStateRef.current.isTrueHell && (gameStateRef.current.isUltraBoss || (newWave >= 25 && newWave % 10 === 0))) {
      const ultraType = ENEMIES.find(e => e.id === 'ultra_world_boss') || {
        id: 'ultra_world_boss',
        name: '👑 ULTRA WORLD BOSS - GOD OF DESTRUCTION',
        health: 100000000000000,
        speed: 0.12,
        bounty: 10000000,
        color: '#a855f7',
        size: 90,
        isBoss: true,
        category: 'boss',
        emoji: '👾'
      };
      queue.push({ ...ultraType, health: 100000000000000 });
    }

    if (gameStateRef.current.isGigaGacha) {
      queue.forEach(enemy => {
        enemy.health *= 15; // 15x health in Giga Gacha Fever mode to match high rarity towers!
      });
    }

    // Sky Fight Mode - Spawn Flying Hunters!
    if (gameStateRef.current.skyFightEnabled) {
      const skyCount = Math.min(10, Math.max(3, Math.floor(newWave * 0.8) + 2));
      for (let i = 0; i < skyCount; i++) {
        // Choose based on wave
        let candidateSky = SKY_ENEMIES.slice(0, 3); // Scout, Interceptor, Bomber
        if (newWave >= 10) {
          candidateSky = SKY_ENEMIES; // Unlocks Cyber Cruiser Boss
        } else if (newWave < 4) {
          candidateSky = [SKY_ENEMIES[0]]; // Only scouts
        }
        const baseSky = candidateSky[Math.floor(Math.random() * candidateSky.length)];
        let skyHealth = baseSky.health * (1 + newWave * 0.18);
        if (gameStateRef.current.isHardcore) {
          skyHealth *= 5;
        }
        if (gameStateRef.current.isTrueHell) {
          skyHealth *= 500;
        }
        
        // Inject into a random index in queue
        const skyEnemyType = {
          id: baseSky.id,
          name: baseSky.name,
          health: skyHealth,
          speed: baseSky.speed,
          bounty: baseSky.bounty,
          color: baseSky.color,
          size: baseSky.size,
          emoji: baseSky.emoji,
          category: 'sky_hunter' as any,
          isBoss: baseSky.id === 'cyber_cruiser_boss'
        };
        
        // Insert randomly
        const insertIdx = Math.floor(Math.random() * (queue.length + 1));
        queue.splice(insertIdx, 0, skyEnemyType as any);
      }
    }

    setGameState(prev => ({ 
      ...prev, 
      wave: newWave, 
      isWaveActive: true,
      totalWaveEnemies: queue.length,
      waveEnemiesDefeated: 0,
      highestTrueHellWave: prev.isTrueHell ? Math.max(prev.highestTrueHellWave || 0, newWave) : prev.highestTrueHellWave,
      highestBossRushWave: prev.isBossRush ? Math.max(prev.highestBossRushWave || 0, newWave) : prev.highestBossRushWave,
      highestSuddenDeathWave: prev.isSuddenDeath ? Math.max(prev.highestSuddenDeathWave || 0, newWave) : prev.highestSuddenDeathWave,
      highestSkyModeWave: prev.isSkyMode ? Math.max(prev.highestSkyModeWave || 0, newWave) : prev.highestSkyModeWave,
      highestAlienModeWave: prev.isAlienMode ? Math.max(prev.highestAlienModeWave || 0, newWave) : prev.highestAlienModeWave,
      highestLoreWave: prev.isLoreMode ? Math.max(prev.highestLoreWave || 0, newWave) : prev.highestLoreWave,
    }));

    waveEnemyQueue.current = queue;
    gameAudio.playSFX('wave_start');
  }, []);

  // Continuous Auto-Deploy Waves Manager
  useEffect(() => {
    if (!gameState.autoDeployWaves || gameState.isWaveActive || gameState.health <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      if (!gameStateRef.current.isWaveActive && gameStateRef.current.autoDeployWaves && gameStateRef.current.health > 0) {
        startWave();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [gameState.autoDeployWaves, gameState.isWaveActive, gameState.health, gameState.wave, startWave]);

  const placeTower = useCallback((animalId: string, x: number, y: number) => {
    const animal = ANIMALS.find(a => a.id === animalId);
    if (!animal || gameStateRef.current.meat < animal.cost) return false;

    // Lore Mode progressive unit restriction check
    if (gameStateRef.current.isLoreMode) {
      const currentLoreWave = gameStateRef.current.wave || 0;
      if (!isAnimalUnlockedInLoreMode(animalId, currentLoreWave)) {
        const unlockWave = getAnimalUnlockWave(animalId);
        skillEffectsRef.current.push({
          id: Math.random().toString(36).substr(2, 9),
          type: 'crit_text',
          x: x || 400,
          y: y || 300,
          radius: 0,
          maxRadius: 0,
          color: '#f43f5e',
          duration: 2500,
          startTime: performance.now(),
          text: `🔒 LORE LOCK: ${animal.name} UNLOCKS AT WAVE ${unlockWave}!`
        });
        return false;
      }
    }

    if (animalId === 'buffer') {
      const placedBuffersCount = towersRef.current.filter(t => t.animalId === 'buffer').length;
      const stock = gameStateRef.current.bufferStock || 0;
      if (placedBuffersCount >= stock) {
        return false;
      }
    }

    if (animalId === 'all_seeing_overseer') {
      const placedOverseerCount = towersRef.current.filter(t => t.animalId === 'all_seeing_overseer').length;
      if (placedOverseerCount >= 1) {
        return false;
      }
    }

    const isDeityUnit = animalId === 'elemental_god' || animalId.endsWith('_deity');
    if (isDeityUnit) {
      const placedCount = towersRef.current.filter(t => t.animalId === animalId).length;
      if (placedCount >= 1) {
        return false;
      }
    }

    const defaultDeityElement = ANIMAL_ELEMENTS[animalId] || 'fire';

    const isTitan = animalId === 'titan_defender';
    if (isTitan) {
      const placedTitanCount = towersRef.current.filter(t => t.animalId === 'titan_defender').length;
      if (placedTitanCount >= 3) {
        alert("⚠️ PLACEMENT LIMIT: You can only build a maximum of 3 Armored Titans on the combat map!");
        return false;
      }
    }

    const activePath = STAGE_PATHS[gameStateRef.current.currentStage || 'default'] || STAGE_PATHS.default;
    
    // Snap to grid coordinates for crisp tactical placement
    let targetX = x;
    let targetY = y;
    if (isTitan) {
      // 2x2 Titan snaps to 40px grid node boundaries
      targetX = Math.floor((x + 20) / 40) * 40;
      targetY = Math.floor((y + 20) / 40) * 40;
      targetX = Math.max(40, Math.min(CANVAS_WIDTH - 40, targetX));
      targetY = Math.max(40, Math.min(CANVAS_HEIGHT - 40, targetY));

      if (!isPositionValidForTitan(targetX, targetY, activePath, towersRef.current, gameStateRef.current.isUltraBoss)) {
        return false;
      }
    } else {
      // 1x1 standard tower snaps to cell centers (20, 60, 100...)
      targetX = Math.floor(x / 40) * 40 + 20;
      targetY = Math.floor(y / 40) * 40 + 20;
      targetX = Math.max(20, Math.min(CANVAS_WIDTH - 20, targetX));
      targetY = Math.max(20, Math.min(CANVAS_HEIGHT - 20, targetY));

      if (!isPositionValidForTower(targetX, targetY, activePath, towersRef.current, gameStateRef.current.isUltraBoss)) {
        // Search nearest fallback if direct click was slightly off
        const validPos = findNearestValidPosition(
          targetX,
          targetY,
          activePath,
          towersRef.current,
          gameStateRef.current.isUltraBoss
        );
        targetX = validPos.x;
        targetY = validPos.y;
      }
    }

    const validPos = { x: targetX, y: targetY };

    const newTower: TowerInstance = {
      id: Math.random().toString(36).substr(2, 9),
      animalId,
      x: validPos.x,
      y: validPos.y,
      rotation: 0,
      lastFired: 0,
      level: 1,
      xp: 0,
      masteryLevel: 1,
      trait: (animal.rarity === 'The Chillful' || animal.id === 'capybara') ? 'Motivation' : (animal.rarity === 'Original' ? 'None' : (animal.rarity === 'Overseer' ? 'EyeOfGod' : (animal.rarity === 'Arcane' || animal.id === 'arcane_warper' ? 'DeathOfWorld' : getRandomTrait()))),
      element: isDeityUnit ? (defaultDeityElement as any) : undefined,
      titanEnergy: isTitan ? 100 : undefined,
      titanIsCharging: isTitan ? false : undefined,
      titanChargeStartTime: isTitan ? 0 : undefined,
      titanChargeDuration: isTitan ? 4000 : undefined,
      titanShootTimeElapsed: isTitan ? 0 : undefined,
      titanShootTimeLimit: isTitan ? (6000 + Math.random() * 6000) : undefined,
      titanForm: (isTitan && gameStateRef.current.loreTitanTransformed) ? 'form3_multiverse' : undefined,
      titanSingularityCoreUpgrade: (isTitan && gameStateRef.current.loreTitanTransformed) ? true : undefined,
      titanTVArrayUpgrade: (isTitan && gameStateRef.current.loreTitanTransformed) ? true : undefined,
      titanGammaRayUpgrade: (isTitan && gameStateRef.current.loreTitanTransformed) ? true : undefined,
      titanCoreUpgrade: (isTitan && gameStateRef.current.loreTitanTransformed) ? true : undefined,
      titanLaserCannonsUpgrade: (isTitan && gameStateRef.current.loreTitanTransformed) ? true : undefined,
      titanFrontShieldUpgrade: (isTitan && gameStateRef.current.loreTitanTransformed) ? true : undefined,
      titanSideShieldUpgrade: (isTitan && gameStateRef.current.loreTitanTransformed) ? true : undefined,
      titanSkin: (isTitan && gameStateRef.current.loreTitanTransformed) ? 'upgraded_titan_tv_man' : undefined,
    };

    const updatedTowers = [...towersRef.current, newTower];
    towersRef.current = updatedTowers;
    setTowers(updatedTowers);

    const updatedGameState = {
      ...gameStateRef.current,
      meat: gameStateRef.current.meat - animal.cost
    };
    gameStateRef.current = updatedGameState;
    setGameState(updatedGameState);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('daily-mission-event', { detail: { type: 'spend-meat', amount: animal.cost } }));
    }
    gameAudio.playSFX('place', animal.rarity);
    return true;
  }, []);

  const upgradeTower = useCallback((towerId: string) => {
    let success = false;
    let upgradedRarity = 'Common';
    const next = towersRef.current.map(t => {
      if (t.id === towerId) {
        if (t.level >= 20) return t; // Standard cap at level 20
        const animal = ANIMALS.find(a => a.id === t.animalId)!;
        const upgradeCost = Math.floor(animal.cost * (t.level + 1) * 0.5);
        if (gameStateRef.current.meat >= upgradeCost) {
          upgradedRarity = animal.rarity;
          const updatedGameState = {
            ...gameStateRef.current,
            meat: gameStateRef.current.meat - upgradeCost
          };
          gameStateRef.current = updatedGameState;
          setGameState(updatedGameState);

          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('daily-mission-event', { detail: { type: 'spend-meat', amount: upgradeCost } }));
          }
          success = true;
          return { ...t, level: t.level + 1, xp: 0 };
        }
      }
      return t;
    });
    if (success) {
      towersRef.current = next;
      setTowers(next);
      gameAudio.playSFX('upgrade', upgradedRarity);
    }
  }, []);

  const bulkEvolveTowers = useCallback(() => {
    const eligibleTowers = towersRef.current.filter(t => t.level < 20);
    if (eligibleTowers.length === 0) {
      return { success: false, upgradedCount: 0, totalCost: 0, message: "No active units are below Level 20!" };
    }

    // Pair towers with their animal info and single level upgrade cost
    const items = eligibleTowers.map(t => {
      const animal = ANIMALS.find(a => a.id === t.animalId)!;
      const cost = Math.floor(animal.cost * (t.level + 1) * 0.5);
      return { tower: t, animal, cost };
    });

    // Rarity priority (just like auto-upgrade)
    const rarityPriority: Record<string, number> = {
      'Overseer': 11,
      'Original': 10,
      '???': 9,
      'Unrivaled': 8,
      'Celestial': 7,
      'Secret': 6,
      'Mythic': 5,
      'Legendary': 4,
      'Epic': 3,
      'Rare': 2,
      'Common': 1
    };

    // Sort by rarity priority descending, then cost/level
    items.sort((a, b) => {
      const rA = rarityPriority[a.animal.rarity] || 0;
      const rB = rarityPriority[b.animal.rarity] || 0;
      if (rA !== rB) {
        return rB - rA;
      }
      return a.cost - b.cost;
    });

    let currentMeat = gameStateRef.current.meat;
    let upgradedCount = 0;
    let totalCost = 0;
    const upgradedIds = new Set<string>();
    let highestRarity = 'Common';

    for (const item of items) {
      if (currentMeat >= item.cost) {
        currentMeat -= item.cost;
        totalCost += item.cost;
        upgradedIds.add(item.tower.id);
        upgradedCount++;
        const currentPriority = rarityPriority[item.animal.rarity] || 0;
        const highestPriority = rarityPriority[highestRarity] || 0;
        if (currentPriority > highestPriority) {
          highestRarity = item.animal.rarity;
        }
      }
    }

    if (upgradedCount === 0) {
      return { success: false, upgradedCount: 0, totalCost: 0, message: "Insufficient Meat to upgrade any units!" };
    }

    const next = towersRef.current.map(t => {
      if (upgradedIds.has(t.id)) {
        return { ...t, level: t.level + 1, xp: 0 };
      }
      return t;
    });

    const updatedGameState = {
      ...gameStateRef.current,
      meat: currentMeat
    };
    gameStateRef.current = updatedGameState;
    setGameState(updatedGameState);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('daily-mission-event', { detail: { type: 'spend-meat', amount: totalCost } }));
    }

    towersRef.current = next;
    setTowers(next);
    gameAudio.playSFX('upgrade', highestRarity);

    return {
      success: true,
      upgradedCount,
      totalCost,
      message: `Successfully bulk evolved ${upgradedCount} unit${upgradedCount > 1 ? 's' : ''} for ${totalCost.toLocaleString()} Meat!`
    };
  }, []);

  const maxUpgradeTower = useCallback((towerId: string) => {
    let success = false;
    let upgradedRarity = 'Common';
    const next = towersRef.current.map(t => {
      if (t.id === towerId) {
        if (t.level >= 20) return t; // Standard cap at level 20
        const animal = ANIMALS.find(a => a.id === t.animalId)!;
        upgradedRarity = animal.rarity;
        let currentLevel = t.level;
        let meatSpent = 0;
        let currentMeat = gameStateRef.current.meat;
        
        while (currentLevel < 20) {
          const nextCost = Math.floor(animal.cost * (currentLevel + 1) * 0.5);
          if (currentMeat >= nextCost) {
            currentMeat -= nextCost;
            meatSpent += nextCost;
            currentLevel += 1;
          } else {
            break;
          }
        }
        
        if (meatSpent > 0) {
          const updatedGameState = {
            ...gameStateRef.current,
            meat: gameStateRef.current.meat - meatSpent
          };
          gameStateRef.current = updatedGameState;
          setGameState(updatedGameState);

          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('daily-mission-event', { detail: { type: 'spend-meat', amount: meatSpent } }));
          }
          success = true;
          return { ...t, level: currentLevel, xp: 0 };
        }
      }
      return t;
    });
    if (success) {
      towersRef.current = next;
      setTowers(next);
      gameAudio.playSFX('upgrade', upgradedRarity);
    }
  }, []);

  const triggerOverseerActiveSkill = useCallback((towerId: string) => {
    let success = false;
    let message = '';
    const time = gameTimeRef.current;

    const activeOverseer = towersRef.current.find(p => p.id === towerId);
    if (!activeOverseer) return { success, message };

    const animal = ANIMALS.find(a => a.id === activeOverseer.animalId)!;
    if (animal.rarity !== 'Overseer' && animal.rarity !== 'Arcane') {
      message = 'Only Overseer or Arcane class can expand their spatial realm manually!';
      return { success, message };
    }

    const lastUsed = activeOverseer.lastActiveSkillUsed || 0;
    const isTitan = activeOverseer.animalId === 'titan_defender';
    const isDeity = activeOverseer.animalId === 'elemental_god' || activeOverseer.animalId.endsWith('_deity');
    const isWarper = activeOverseer.animalId === 'arcane_warper';
    const isCapybara = activeOverseer.animalId === 'capybara';

    if (isTitan && activeOverseer.titanIsCharging) {
      message = 'The Armored Titan is currently recharging his energy core! Wait until recharge finishes.';
      return { success, message };
    }

    if (isWarper) {
      if (gameStateRef.current.isTrueHell && !gameStateRef.current.isUltraBoss) {
        const currentKills = activeOverseer.warperKillsInTrueHell || 0;
        if (currentKills < 50) {
          message = `World Crusher requires 50 kills in True Hell mode to recharge! Current: ${currentKills}/50`;
          return { success, message };
        }
      } else {
        const cooldown = 10000;
        if (activeOverseer.lastActiveSkillUsed && (time - lastUsed < cooldown)) {
          const remainingSec = ((cooldown - (time - lastUsed)) / 1000).toFixed(1);
          message = `World Crusher is recharging. Cooldown remaining: ${remainingSec}s`;
          return { success, message };
        }
      }
    } else if (isCapybara) {
      let cooldown = 10000; // 10s cooldown for Capybara Serene Zen Hypnosis
      const capyTrait = TRAITS[activeOverseer.trait || 'Motivation'] || TRAITS['Motivation'];
      if (capyTrait.cooldownReduction) {
        cooldown *= (1 - capyTrait.cooldownReduction); // 9s (10% cooldown reduction from Motivation)
      }
      if (activeOverseer.lastActiveSkillUsed && (time - lastUsed < cooldown)) {
        const remainingSec = ((cooldown - (time - lastUsed)) / 1000).toFixed(1);
        message = `The Chill Hypnotize is recharging. Cooldown remaining: ${remainingSec}s`;
        return { success, message };
      }
    } else {
      const hasAllUpgrades = activeOverseer.titanCoreUpgrade && activeOverseer.titanLaserCannonsUpgrade && activeOverseer.titanFrontShieldUpgrade && activeOverseer.titanSideShieldUpgrade;
      const cooldown = isTitan ? (hasAllUpgrades ? 40000 : 60000) : (isDeity ? 8000 : 10000); // 60s for Titan (40s if fully upgraded), 8s for Elemental Deities, 10s for Archon Overseer
      if (activeOverseer.lastActiveSkillUsed && (time - lastUsed < cooldown)) {
        const remainingSec = ((cooldown - (time - lastUsed)) / 1000).toFixed(1);
        message = `${animal.skillName} is recharging. Cooldown remaining: ${remainingSec}s`;
        return { success, message };
      }
    }

    const next = towersRef.current.map(t => {
      if (t.id === towerId) {
        success = true;
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('daily-mission-event', { detail: { type: 'use-overseer', count: 1 } }));
        }

        if (t.animalId === 'capybara') {
          // Serene Zen Waves: Hypnotizes up to 10 bad enemies in huge range for 20 seconds
          setEnemies(prevEnemies => prevEnemies.map(enemy => {
            if (enemy.typeId === 'ultra_world_boss') return enemy;
            const dist = Math.hypot(enemy.x - t.x, enemy.y - t.y);
            if (dist <= 1200) {
              return {
                ...enemy,
                isHypnotized: true,
                hypnotizedByTowerId: t.id,
                hypnotizeExpiry: time + 20000,
                lastHypnotizeAttackTime: time
              };
            }
            return enemy;
          }));

          setSkillEffects(se => [
            ...se,
            {
              id: Math.random().toString(36).substr(2, 9),
              type: 'chill_hypnotize_aura',
              x: t.x,
              y: t.y,
              radius: 40,
              maxRadius: 1200,
              color: '#84cc16',
              duration: 1500,
              startTime: time
            }
          ]);

          gameAudio.playSFX('victory');

          return {
            ...t,
            lastActiveSkillUsed: time
          };
        }

        if (t.animalId === 'arcane_warper') {
          setGameState(gs => ({ ...gs, arcaneWarperUses: (gs.arcaneWarperUses || 0) + 1 }));
          // World Crusher: Wipes out all active enemies on the grid!
          setSkillEffects(se => [
            ...se,
            {
              id: Math.random().toString(36).substr(2, 9),
              type: 'ragnarok_supernova' as any,
              x: 400,
              y: 400,
              radius: 0,
              maxRadius: 2000,
              color: '#d946ef',
              duration: 2000,
              startTime: time
            },
            {
              id: Math.random().toString(36).substr(2, 9),
              type: 'abyssal_obliteration' as any,
              x: 800,
              y: 400,
              radius: 0,
              maxRadius: 2000,
              color: '#a855f7',
              duration: 2000,
              startTime: time
            }
          ]);

          gameAudio.playSFX('victory');

          setEnemies(prevEnemies => {
            let totalDmg = 0;
            const mapped = prevEnemies.map(e => {
              totalDmg += e.health;
              return { ...e, health: 0 };
            });

            if (totalDmg > 0) {
              recordDamageDealt(towerId, totalDmg);
            }

            if (gameStateRef.current.isTrueHell && !gameStateRef.current.isUltraBoss) {
              setTowers(prevTowers => prevTowers.map(ot => {
                if (ot.animalId === 'arcane_warper') {
                  const currentKills = ot.warperKillsInTrueHell || 0;
                  return { ...ot, warperKillsInTrueHell: currentKills + prevEnemies.length };
                }
                return ot;
              }));
            }

            return mapped.filter(e => {
              const type = ENEMIES.find(tDef => tDef.id === e.typeId);
              if (type) {
                const dropToken = Math.random() < 0.10;
                const dropArcane = Math.random() < 0.01;
                setGameState(gs => ({
                  ...gs,
                  meat: gs.meat + type.bounty,
                  ...(dropToken ? { gameTokens: (gs.gameTokens || 0) + 1 } : {}),
                  ...(dropArcane ? { arcaneShards: (gs.arcaneShards || 0) + 1 } : {})
                }));
              }
              return false;
            });
          });

          return {
            ...t,
            lastActiveSkillUsed: time,
            warperKillsInTrueHell: 0
          };
        }

        if (t.animalId === 'titan_defender') {
          // Activate Titan Ultra Laser skill for 30 or 45 seconds if fully upgraded!
          const hasAllUpgrades = t.titanCoreUpgrade && t.titanLaserCannonsUpgrade && t.titanFrontShieldUpgrade && t.titanSideShieldUpgrade;
          const ultraDuration = hasAllUpgrades ? 45000 : 30000;
          const ultraEndTime = time + ultraDuration;
          const isUpgradedTV = (t as any).titanSkin === 'upgraded_titan_tv_man';
          setSkillEffects(se => [
            ...se,
            {
              id: Math.random().toString(36).substr(2, 9),
              type: 'titan_ultra_laser' as any,
              x: t.x,
              y: t.y,
              radius: 0,
              maxRadius: 1600,
              color: isUpgradedTV ? '#e11d48' : '#38bdf8',
              duration: ultraDuration,
              startTime: time,
              angle: t.rotation
            }
          ]);
          gameAudio.playSFX('upgrade');
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('titan-ultra-laser-activated', { detail: { towerId: t.id, x: t.x, y: t.y } }));
          }
          return {
            ...t,
            ultraLaserActive: true,
            ultraLaserEndTime: ultraEndTime,
            lastActiveSkillUsed: time,
            titanEnergy: 0,
            titanIsCharging: false,
            titanShootTimeElapsed: 0
          };
        }

        const traitDef = TRAITS[t.trait || 'EyeOfGod'] || TRAITS['EyeOfGod'];
        const traitDmgMult = traitDef.damageMultiplier ?? 1.0;
        const masteryDmgMult = 1 + ((t.masteryLevel || 1) - 1) * 0.02;
        const baseDmg = animal.damage * (1 + (t.level - 1) * 0.2) * traitDmgMult * (t.isPinnacle ? 10 : 1) * masteryDmgMult;

        if (t.animalId === 'elemental_god' || t.animalId.endsWith('_deity')) {
          const defaultElement = ANIMAL_ELEMENTS[t.animalId] || 'fire';
          const element = t.element || defaultElement;
          const mult = element === 'shadow' ? 120 :
                       element === 'cosmos' ? 130 :
                       element === 'magma' ? 115 :
                       element === 'light' ? 110 :
                       element === 'lightning' ? 100 :
                       element === 'dirt' ? 100 :
                       element === 'fire' || element === 'poison' || element === 'sand' ? 80 : 60;
          const skillDmg = baseDmg * mult;

          // Light element heals nexus base
          if (element === 'light') {
            const newHealth = Math.min(2000000000, gameStateRef.current.health + 2000000);
            gameStateRef.current.health = newHealth;
            setGameState(prev => ({ ...prev, health: newHealth }));
          }

          setSkillEffects(se => {
            const effType = (element === 'fire' ? 'element_fire_blast' :
                             element === 'poison' ? 'element_poison_burst' :
                             element === 'water' ? 'element_water_wave' :
                             element === 'sand' ? 'element_sand_whirl' :
                             element === 'dirt' ? 'element_dirt_rupture' :
                             element === 'ice' ? 'element_ice_freeze' :
                             element === 'wind' ? 'element_wind_cyclone' :
                             element === 'lightning' ? 'element_lightning_surge' :
                             element === 'light' ? 'element_light_beam' :
                             element === 'shadow' ? 'element_shadow_void' :
                             element === 'magma' ? 'element_magma_eruption' : 'element_cosmos_burst') as any;
            const effColor = (element === 'fire' ? '#ef4444' :
                              element === 'poison' ? '#22c55e' :
                              element === 'water' ? '#3b82f6' :
                              element === 'sand' ? '#ebd2b0' :
                              element === 'dirt' ? '#7c2d12' :
                              element === 'ice' ? '#06b6d4' :
                              element === 'wind' ? '#e2e8f0' :
                              element === 'lightning' ? '#eab308' :
                              element === 'light' ? '#f59e0b' :
                              element === 'shadow' ? '#8b5cf6' :
                              element === 'magma' ? '#f97316' : '#ec4899');

            return [
              ...se,
              {
                id: Math.random().toString(36).substr(2, 9),
                type: effType,
                x: t.x,
                y: t.y,
                radius: 0,
                maxRadius: 1500,
                color: effColor,
                duration: 1500,
                startTime: time
              }
            ];
          });

          setEnemies(prevEnemies => {
            let totalDmg = 0;
            const mapped = prevEnemies.map(e => {
              const appliedDmg = Math.max(0, Math.min(e.health, skillDmg));
              totalDmg += appliedDmg;

              let slowMult = e.slowMultiplier || 1.0;
              let slowExp = e.slowExpiry || 0;
              let nextDist = e.distanceTravelled;

              if (element === 'fire') {
                slowMult = 0.5;
                slowExp = time + 6000;
              } else if (element === 'poison') {
                slowMult = 0.4;
                slowExp = time + 8000;
              } else if (element === 'water') {
                nextDist = Math.max(0, e.distanceTravelled - 120);
              } else if (element === 'sand') {
                slowMult = 0.3;
                slowExp = time + 6000;
              } else if (element === 'dirt') {
                slowMult = 0.01;
                slowExp = time + 3000; // 3 seconds stun
              } else if (element === 'ice') {
                slowMult = 0.01;
                slowExp = time + 4000; // 4 seconds freeze
              } else if (element === 'wind') {
                nextDist = Math.max(0, e.distanceTravelled - 220);
              } else if (element === 'lightning') {
                slowMult = 0.01;
                slowExp = time + 2500; // Shock stun
              } else if (element === 'light') {
                slowMult = 0.2;
                slowExp = time + 5000; // Radiant slow
              } else if (element === 'shadow') {
                slowMult = 0.1;
                slowExp = time + 6000; // Abyssal slow
              } else if (element === 'magma') {
                slowMult = 0.35;
                slowExp = time + 7000; // Molten slow
              } else if (element === 'cosmos') {
                slowMult = 0.01;
                slowExp = time + 3500; // Cosmic stasis freeze
              }

              return {
                ...e,
                health: e.health - skillDmg,
                slowMultiplier: slowMult,
                slowExpiry: slowExp,
                distanceTravelled: nextDist
              };
            });

            if (totalDmg > 0) {
              recordDamageDealt(towerId, totalDmg);
            }

            return mapped.filter(e => {
              if (e.health <= 0) {
                const type = ENEMIES.find(tDef => tDef.id === e.typeId);
                if (type) {
                  const dropToken = Math.random() < 0.10;
                  setGameState(gs => ({
                    ...gs,
                    meat: gs.meat + type.bounty,
                    ...(dropToken ? { gameTokens: (gs.gameTokens || 0) + 1 } : {})
                  }));
                }
                return false;
              }
              return true;
            });
          });

        } else {
          // Archon Overseer Logic
          setSkillEffects(se => {
            const filtered = se.filter(eff => 
              !(eff.type === 'cosmic_rupture' && Math.sqrt((eff.x - t.x) ** 2 + (eff.y - t.y) ** 2) < 50)
            );
            return [
              ...filtered,
              {
                id: Math.random().toString(36).substr(2, 9),
                type: 'cosmic_rupture' as any,
                x: t.x,
                y: t.y,
                radius: 0,
                maxRadius: 1500,
                color: '#00ffcc',
                duration: 1500,
                startTime: time
              }
            ];
          });

          const domainDmg = baseDmg * 100;

          setEnemies(prevEnemies => {
            let totalDmg = 0;
            const mapped = prevEnemies.map(e => {
              const appliedDmg = Math.max(0, Math.min(e.health, domainDmg));
              totalDmg += appliedDmg;
              return {
                ...e,
                health: e.health - domainDmg,
                slowMultiplier: 0.01,
                slowExpiry: time + 10000
              };
            });

            if (totalDmg > 0) {
              recordDamageDealt(towerId, totalDmg);
            }

            return mapped.filter(e => {
              if (e.health <= 0) {
                const type = ENEMIES.find(tDef => tDef.id === e.typeId);
                if (type) {
                  const dropToken = Math.random() < 0.10;
                  setGameState(gs => ({
                    ...gs,
                    meat: gs.meat + type.bounty,
                    ...(dropToken ? { gameTokens: (gs.gameTokens || 0) + 1 } : {})
                  }));
                }
                return false;
              }
              return true;
            });
          });
        }

        return { ...t, lastActiveSkillUsed: time };
      }
      return t;
    });

    towersRef.current = next;
    setTowers(next);

    return { success, message };
  }, []);

  const triggerUnrivaledFinisher = useCallback((towerId: string) => {
    let success = false;
    let message = '';
    const time = gameTimeRef.current;

    const activeTower = towersRef.current.find(t => t.id === towerId);
    if (!activeTower) return { success, message };

    const animal = ANIMALS.find(a => a.id === activeTower.animalId)!;
    if (animal.rarity !== 'Unrivaled') {
      message = 'Only Unrivaled class units can trigger the reality-overwrite finisher skills!';
      return { success, message };
    }
    const lastUsed = activeTower.lastActiveSkillUsed || 0;
    const cooldown = 2000; // fast 2s cooldown for extra fun!
    if (activeTower.lastActiveSkillUsed && (time - lastUsed < cooldown)) {
      const remainingSec = ((cooldown - (time - lastUsed)) / 1000).toFixed(1);
      message = `Finisher is recharging. Cooldown remaining: ${remainingSec}s`;
      return { success, message };
    }

    const next = towersRef.current.map(t => {
      if (t.id === towerId) {
        success = true;
        const masteryDmgMult = 1 + ((t.masteryLevel || 1) - 1) * 0.02;
        const skillDmg = animal.damage * (1 + (t.level - 1) * 0.2) * 250 * masteryDmgMult; // HUGE 250x damage pull!

        if (animal.id === 'unrivaled_void_behemoth') {
          // SPARK SPECTACULAR GRAVITY SINGULARITY COLLAPSE
          setSkillEffects(se => [
            ...se,
            {
              id: Math.random().toString(36).substr(2, 9),
              type: 'vortex',
              x: t.x,
              y: t.y,
              radius: 0,
              maxRadius: 800, // global pull radius!
              color: '#ec4899',
              duration: 2500,
              startTime: time
            },
            {
              id: Math.random().toString(36).substr(2, 9),
              type: 'supernova',
              x: t.x,
              y: t.y,
              radius: 0,
              maxRadius: 400,
              color: '#ec4899',
              duration: 1500,
              startTime: time
            }
          ]);

          setEnemies(prevEnemies => {
            let totalDmg = 0;
            const mapped = prevEnemies.map(e => {
              const tdx = t.x - e.x;
              const tdy = t.y - e.y;
              const tdist = Math.sqrt(tdx * tdx + tdy * tdy);
              
              let nextX = e.x;
              let nextY = e.y;
              if (tdist > 5) {
                // Drag almost all the way (e.g. 70%) to the center instantly! On-canvas physical pull!
                nextX = e.x + (tdx / tdist) * (tdist * 0.70);
                nextY = e.y + (tdy / tdist) * (tdist * 0.70);
              }

              const appliedDmg = Math.max(0, Math.min(e.health, skillDmg));
              totalDmg += appliedDmg;

              return {
                ...e,
                x: nextX,
                y: nextY,
                pathX: nextX,
                pathY: nextY,
                health: e.health - skillDmg,
                slowMultiplier: 0.01,
                slowExpiry: time + 6000
              };
            });
            if (totalDmg > 0) {
              recordDamageDealt(towerId, totalDmg);
            }
            return mapped.filter(e => {
              if (e.health <= 0) {
                const type = ENEMIES.find(tDef => tDef.id === e.typeId);
                if (type) {
                  const dropToken = Math.random() < 0.10;
                  setGameState(gs => ({
                    ...gs,
                    meat: gs.meat + type.bounty,
                    ...(dropToken ? { gameTokens: (gs.gameTokens || 0) + 1 } : {})
                  }));
                }
                return false;
              }
              return true;
            });
          });

          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('unrivaled-finisher-triggered', { detail: { type: 'void', x: t.x, y: t.y } }));
          }
        }
        else if (animal.id === 'unrivaled_solar_phoenix') {
          // SOLAR FLARE OVERWRITE - GLOBAL BOMBARDMENT
          setSkillEffects(se => [
            ...se,
            {
              id: Math.random().toString(36).substr(2, 9),
              type: 'cosmic_rupture',
              x: t.x,
              y: t.y,
              radius: 0,
              maxRadius: 1000,
              color: '#f59e0b',
              duration: 2000,
              startTime: time
            },
            {
              id: Math.random().toString(36).substr(2, 9),
              type: 'shockwave',
              x: t.x,
              y: t.y,
              radius: 0,
              maxRadius: 1000,
              color: '#f59e0b',
              duration: 1500,
              startTime: time
            }
          ]);

          setEnemies(prevEnemies => {
            let totalDmg = 0;
            const mapped = prevEnemies.map(e => {
              const appliedDmg = Math.max(0, Math.min(e.health, skillDmg));
              totalDmg += appliedDmg;
              return {
                ...e,
                health: e.health - skillDmg,
                slowMultiplier: 0.1,
                slowExpiry: time + 5000
              };
            });
            if (totalDmg > 0) {
              recordDamageDealt(towerId, totalDmg);
            }
            return mapped.filter(e => {
              if (e.health <= 0) {
                const type = ENEMIES.find(tDef => tDef.id === e.typeId);
                if (type) {
                  const dropToken = Math.random() < 0.10;
                  setGameState(gs => ({
                    ...gs,
                    meat: gs.meat + type.bounty,
                    ...(dropToken ? { gameTokens: (gs.gameTokens || 0) + 1 } : {})
                  }));
                }
                return false;
              }
              return true;
            });
          });

          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('unrivaled-finisher-triggered', { detail: { type: 'solar', x: t.x, y: t.y } }));
          }
        }

        return { ...t, lastActiveSkillUsed: time };
      }
      return t;
    });

    towersRef.current = next;
    setTowers(next);

    return { success, message };
  }, []);

  const toggleTitanForm = useCallback((towerId: string) => {
    let newForm: 'form1_dual' | 'form2_merged' | 'form3_multiverse' = 'form2_merged';
    const targetTower = towersRef.current.find(t => t.id === towerId);
    if (!targetTower) return { success: false, form: 'form1_dual', message: 'Tower not found' };

    const currentForm = targetTower.titanForm || 'form1_dual';
    let success = true;
    let message = '';

    if (currentForm === 'form1_dual') {
      newForm = 'form2_merged';
    } else if (currentForm === 'form2_merged') {
      const userShards = gameStateRef.current.arcaneShards ?? 0;
      if (userShards < 3) {
        return {
          success: false,
          form: currentForm,
          message: `⚠️ Multiverse Watcher requires 3 Arcane Shards! You currently have ${userShards}/3. Normal enemies have a 1% chance of dropping Arcane Shards, or click "+3 Arcane Shards" in the panel.`
        };
      }
      newForm = 'form3_multiverse';
      message = '🌌 Multiverse Watcher Awakened (2nd Arcane Tier)!';
    } else {
      newForm = 'form1_dual';
    }

    const next = towersRef.current.map(t => {
      if (t.id === towerId) {
        return { 
          ...t, 
          titanForm: newForm,
          titanEnergy: newForm === 'form3_multiverse' ? 100 : t.titanEnergy,
          titanIsCharging: newForm === 'form3_multiverse' ? false : t.titanIsCharging,
          titanShootTimeElapsed: newForm === 'form3_multiverse' ? 0 : t.titanShootTimeElapsed
        };
      }
      return t;
    });
    towersRef.current = next;
    setTowers(next);
    gameAudio.playSFX(newForm === 'form3_multiverse' ? 'victory' : 'upgrade');
    return { success, form: newForm, message };
  }, []);

  const upgradeTitanPart = useCallback((
    towerId: string, 
    part: 'core' | 'cannons' | 'frontShield' | 'sideShield' | 'hyperDrive' | 'naniteRepair' | 'seismicStomp' | 'plasmaField' | 'magneticHarvester' | 'singularityCore' | 'gammaRay' | 'tvArray' | 'armourOfDeath' | 'fourShields' | 'mechaHands', 
    cost: number
  ) => {
    let success = false;
    let message = "";
    if (gameStateRef.current.meat < cost) {
      return { success: false, message: `Insufficient Meat! Requires ${cost.toLocaleString()} Meat.` };
    }

    const next = towersRef.current.map(t => {
      if (t.id === towerId) {
        if (part === 'core') {
          if (t.titanCoreUpgrade) {
            message = "Core Upgrade already unlocked!";
            return t;
          }
          success = true;
          return { ...t, titanCoreUpgrade: true };
        }
        if (part === 'cannons') {
          if (t.titanLaserCannonsUpgrade) {
            message = "Add 2 More Laser Cannons already unlocked!";
            return t;
          }
          success = true;
          return { ...t, titanLaserCannonsUpgrade: true };
        }
        if (part === 'mechaHands') {
          if ((t as any).titanMechaHandsUpgrade) {
            message = "Dual Hydraulic Mecha Hands already unlocked!";
            return t;
          }
          success = true;
          return { ...t, titanMechaHandsUpgrade: true };
        }
        if (part === 'frontShield') {
          if (t.titanFrontShieldUpgrade) {
            message = "Front Shield already unlocked!";
            return t;
          }
          success = true;
          return { ...t, titanFrontShieldUpgrade: true };
        }
        if (part === 'sideShield') {
          if (t.titanSideShieldUpgrade) {
            message = "Side Shield already unlocked!";
            return t;
          }
          success = true;
          return { ...t, titanSideShieldUpgrade: true };
        }
        if (part === 'hyperDrive') {
          if ((t as any).titanHyperDriveUpgrade) {
            message = "Hyper-Drive already unlocked!";
            return t;
          }
          success = true;
          return { ...t, titanHyperDriveUpgrade: true };
        }
        if (part === 'naniteRepair') {
          if ((t as any).titanNaniteRepairUpgrade) {
            message = "Nanite Repair already unlocked!";
            return t;
          }
          success = true;
          return { ...t, titanNaniteRepairUpgrade: true };
        }
        if (part === 'seismicStomp') {
          if ((t as any).titanSeismicStompUpgrade) {
            message = "Seismic Stomp already unlocked!";
            return t;
          }
          success = true;
          return { ...t, titanSeismicStompUpgrade: true };
        }
        if (part === 'plasmaField') {
          if ((t as any).titanPlasmaFieldUpgrade) {
            message = "Plasma Field already unlocked!";
            return t;
          }
          success = true;
          return { ...t, titanPlasmaFieldUpgrade: true };
        }
        if (part === 'magneticHarvester') {
          if ((t as any).titanMagneticHarvesterUpgrade) {
            message = "Magnetic Harvester already unlocked!";
            return t;
          }
          success = true;
          return { ...t, titanMagneticHarvesterUpgrade: true };
        }
        if (part === 'singularityCore') {
          if ((t as any).titanSingularityCoreUpgrade) {
            message = "Singularity Core already unlocked!";
            return t;
          }
          success = true;
          return { ...t, titanSingularityCoreUpgrade: true };
        }
        if (part === 'gammaRay') {
          if ((t as any).titanGammaRayUpgrade) {
            message = "Gamma Ray already unlocked!";
            return t;
          }
          success = true;
          return { ...t, titanGammaRayUpgrade: true };
        }
        if (part === 'tvArray') {
          if ((t as any).titanTVArrayUpgrade) {
            message = "Triple TV Array already unlocked!";
            return t;
          }
          success = true;
          return { ...t, titanTVArrayUpgrade: true };
        }
        if (part === 'armourOfDeath') {
          if ((t as any).titanArmourOfDeathUpgrade) {
            message = "Armour of Death already unlocked!";
            return t;
          }
          success = true;
          return { ...t, titanArmourOfDeathUpgrade: true, titanLaserCannonsUpgrade: true };
        }
        if (part === 'fourShields') {
          if ((t as any).titanFourShieldsUpgrade) {
            message = "4 Omni-Shields already unlocked!";
            return t;
          }
          success = true;
          return { ...t, titanFourShieldsUpgrade: true, titanFrontShieldUpgrade: true, titanSideShieldUpgrade: true };
        }
      }
      return t;
    });

    if (success) {
      const updatedGameState = {
        ...gameStateRef.current,
        meat: gameStateRef.current.meat - cost
      };
      gameStateRef.current = updatedGameState;
      setGameState(updatedGameState);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('daily-mission-event', { detail: { type: 'spend-meat', amount: cost } }));
      }

      towersRef.current = next;
      setTowers(next);
      gameAudio.playSFX('upgrade');
      return { success: true, message: "Upgrade successful!" };
    }

    return { success: false, message: message || "Upgrade failed." };
  }, []);

  const upgradeWarperPart = useCallback((
    towerId: string,
    part: 'blade' | 'armoured_titan',
    cost: number
  ) => {
    let success = false;
    let message = "";
    if (gameStateRef.current.meat < cost) {
      return { success: false, message: `Insufficient Meat! Requires ${cost.toLocaleString()} Meat.` };
    }

    const next = towersRef.current.map(t => {
      if (t.id === towerId) {
        if (part === 'blade') {
          if (t.warperBladeUpgrade) {
            message = "Astral Blade Upgrade already unlocked!";
            return t;
          }
          success = true;
          return { ...t, warperBladeUpgrade: true };
        }
        if (part === 'armoured_titan') {
          if (t.warperArmouredTitanUpgrade) {
            message = "Armoured Titan Mecha Upgrade already unlocked!";
            return t;
          }
          success = true;
          return { ...t, warperArmouredTitanUpgrade: true };
        }
      }
      return t;
    });

    if (success) {
      const updatedGameState = {
        ...gameStateRef.current,
        meat: gameStateRef.current.meat - cost
      };
      gameStateRef.current = updatedGameState;
      setGameState(updatedGameState);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('daily-mission-event', { detail: { type: 'spend-meat', amount: cost } }));
      }

      towersRef.current = next;
      setTowers(next);
      gameAudio.playSFX('upgrade');
      return { success: true, message: "Warper Upgrade unlocked!" };
    }

    return { success: false, message: message || "Upgrade failed." };
  }, []);

  const spawnHunterCommander = useCallback(() => {
    cutsceneTriggeredRef.current = false;
    setGameState(prev => ({ ...prev, isWaveActive: true }));
    const commanderType = ENEMIES.find(e => e.id === 'hunter_commander');
    if (commanderType) {
      let bossHealth = commanderType.health;
      if (gameStateRef.current.isHardcore) {
        bossHealth *= 100;
      }
      const newQueueItem = {
        ...commanderType,
        health: bossHealth
      };
      waveEnemyQueue.current.unshift(newQueueItem);
      lastSpawnTime.current = 0;
    }
  }, []);

  const cheatMaxUpgradeTower = useCallback((towerId: string) => {
    const next = towersRef.current.map(t => {
      if (t.id === towerId) {
        return { ...t, level: 20 }; // Cheat directly sets to Level 20 cap
      }
      return t;
    });
    towersRef.current = next;
    setTowers(next);
  }, []);

  const ascendTowerToPinnacle = useCallback((towerId: string) => {
    const dnaCost = 2000;
    const meatCost = 15000;
    if (gameStateRef.current.dna >= dnaCost && gameStateRef.current.meat >= meatCost) {
      const updatedGameState = {
        ...gameStateRef.current,
        dna: gameStateRef.current.dna - dnaCost,
        meat: gameStateRef.current.meat - meatCost
      };
      gameStateRef.current = updatedGameState;
      setGameState(updatedGameState);

      const next = towersRef.current.map(t => {
        if (t.id === towerId) {
          return {
            ...t,
            isPinnacle: true,
            pinnacleClass: 'Absolute Pinnacle'
          };
        }
        return t;
      });
      towersRef.current = next;
      setTowers(next);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('daily-mission-event', { detail: { type: 'ascend-tower', count: 1 } }));
        window.dispatchEvent(new CustomEvent('daily-mission-event', { detail: { type: 'spend-meat', amount: meatCost } }));
      }
      return true;
    }
    return false;
  }, []);

  const upgradeTowerAlienTech = useCallback((towerId: string) => {
    const tower = towersRef.current.find(t => t.id === towerId);
    if (!tower) return false;

    const currentTier = tower.alienTechTier || 0;
    const nextTier = currentTier + 1;
    if (nextTier > 3) return false;

    const dnaCost = nextTier === 1 ? 500 : nextTier === 2 ? 1000 : 2000;
    const meatCost = nextTier === 1 ? 3500 : nextTier === 2 ? 7500 : 15000;

    if (gameStateRef.current.dna >= dnaCost && gameStateRef.current.meat >= meatCost) {
      const updatedGameState = {
        ...gameStateRef.current,
        dna: gameStateRef.current.dna - dnaCost,
        meat: gameStateRef.current.meat - meatCost
      };
      gameStateRef.current = updatedGameState;
      setGameState(updatedGameState);

      const maxShield = nextTier * 1200;
      const next = towersRef.current.map(t => {
        if (t.id === towerId) {
          return {
            ...t,
            isAlienTech: true,
            alienTechTier: nextTier,
            alienTechShieldHp: maxShield
          };
        }
        return t;
      });
      towersRef.current = next;
      setTowers(next);

      gameAudio.playSFX('upgrade');

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('daily-mission-event', { detail: { type: 'spend-meat', amount: meatCost } }));
      }
      return true;
    }
    return false;
  }, []);

  const sellTower = useCallback((towerId: string) => {
    const tower = towersRef.current.find(t => t.id === towerId);
    if (!tower) return;
    const animal = ANIMALS.find(a => a.id === tower.animalId);
    if (!animal) return;

    let totalUpgradeSpent = 0;
    for (let i = 1; i < tower.level; i++) {
      totalUpgradeSpent += Math.floor(animal.cost * i * 0.5);
    }
    const refundValue = Math.floor((animal.cost + totalUpgradeSpent) * 0.7);

    const next = towersRef.current.filter(t => t.id !== towerId);
    towersRef.current = next;
    setTowers(next);

    const updatedGameState = {
      ...gameStateRef.current,
      meat: gameStateRef.current.meat + refundValue
    };
    gameStateRef.current = updatedGameState;
    setGameState(updatedGameState);
  }, []);

  const sellAllTowers = useCallback(() => {
    if (towersRef.current.length === 0) return 0;
    
    let totalRefund = 0;
    towersRef.current.forEach(tower => {
      const animal = ANIMALS.find(a => a.id === tower.animalId);
      if (animal) {
        let totalUpgradeSpent = 0;
        for (let i = 1; i < tower.level; i++) {
          totalUpgradeSpent += Math.floor(animal.cost * i * 0.5);
        }
        const refundValue = Math.floor((animal.cost + totalUpgradeSpent) * 0.7);
        totalRefund += refundValue;
      }
    });

    towersRef.current = [];
    setTowers([]);

    const updatedGameState = {
      ...gameStateRef.current,
      meat: gameStateRef.current.meat + totalRefund
    };
    gameStateRef.current = updatedGameState;
    setGameState(updatedGameState);
    return totalRefund;
  }, []);

  const pinnacleAllTowers = useCallback(() => {
    const dnaCost = 2000;
    const meatCost = 15000;
    const eligibleTowers = towersRef.current.filter(t => t.level >= 20 && !t.isPinnacle);

    if (eligibleTowers.length === 0) {
      if (typeof window !== 'undefined') {
        alert("No active towers are at Level 20 and ready for Pinnacle Transcendence!");
      }
      return;
    }

    let upgradedCount = 0;
    let currentDna = gameStateRef.current.dna;
    let currentMeat = gameStateRef.current.meat;
    const updatedTowerIds = new Set<string>();

    for (const tower of eligibleTowers) {
      if (currentDna >= dnaCost && currentMeat >= meatCost) {
        currentDna -= dnaCost;
        currentMeat -= meatCost;
        updatedTowerIds.add(tower.id);
        upgradedCount++;
      } else {
        break;
      }
    }

    if (upgradedCount === 0) {
      if (typeof window !== 'undefined') {
        alert(`Insufficient resources! Each Pinnacle upgrade requires ${dnaCost} DNA Shards and ${meatCost.toLocaleString()} Meat.`);
      }
      return;
    }

    const updatedGameState = {
      ...gameStateRef.current,
      dna: currentDna,
      meat: currentMeat
    };
    gameStateRef.current = updatedGameState;
    setGameState(updatedGameState);

    const next = towersRef.current.map(t => {
      if (updatedTowerIds.has(t.id)) {
        return {
          ...t,
          isPinnacle: true,
          pinnacleClass: 'Absolute Pinnacle'
        };
      }
      return t;
    });
    towersRef.current = next;
    setTowers(next);
  }, []);

  const rerollTowerTrait = useCallback((towerId: string) => {
    const tower = towersRef.current.find(t => t.id === towerId);
    if (!tower) return "";
    const animal = ANIMALS.find(a => a.id === tower.animalId);
    if (animal?.rarity === 'Original') return "None";
    if (animal?.rarity === 'The Chillful' || animal?.id === 'capybara' || tower.trait === 'Motivation') return "Motivation";

    const cost = 200;
    if (gameStateRef.current.dna < cost) return "";

    const currentPity = (gameStateRef.current.celestialTraitPity ?? 0) + 1;
    const currentMysteryPity = (gameStateRef.current.mysteryTraitPity ?? 0) + 1;
    
    let nextTrait = "";
    let finalPity = currentPity;
    let finalMysteryPity = currentMysteryPity;

    if (currentMysteryPity >= 100) {
      nextTrait = "???";
      finalMysteryPity = 0;
      finalPity = currentPity; 
    } else if (currentPity >= 15) {
      // Force Celestial trait
      const celestials = ["Godly", "CosmicDeity", "Genesis", "AstraDominus", "Infinity"];
      const totalCelWeight = celestials.reduce((sum, k) => sum + TRAITS[k].weight, 0);
      let roll = Math.random() * totalCelWeight;
      for (const key of celestials) {
        roll -= TRAITS[key].weight;
        if (roll <= 0) {
          nextTrait = key;
          break;
        }
      }
      if (!nextTrait) nextTrait = "Godly";
      finalPity = 0;
    } else {
      nextTrait = getRandomTrait();
      const isCel = TRAITS[nextTrait]?.rarity === 'Celestial';
      const isMystery = nextTrait === '???';
      if (isCel) {
        finalPity = 0;
      }
      if (isMystery) {
        finalMysteryPity = 0;
      }
    }

    const updatedGameState = { 
      ...gameStateRef.current, 
      dna: gameStateRef.current.dna - cost,
      celestialTraitPity: finalPity,
      mysteryTraitPity: finalMysteryPity
    };
    gameStateRef.current = updatedGameState;
    setGameState(updatedGameState);

    const next = towersRef.current.map(t => {
      if (t.id === towerId) {
        return { ...t, trait: nextTrait };
      }
      return t;
    });
    towersRef.current = next;
    setTowers(next);
    return nextTrait;
  }, []);

  const autoTuneBestFitTrait = useCallback((towerId: string) => {
    const tower = towersRef.current.find(t => t.id === towerId);
    if (!tower) return null;

    const animal = ANIMALS.find(a => a.id === tower.animalId);
    if (!animal || animal.rarity === 'Original' || animal.rarity === 'The Chillful' || animal.id === 'capybara' || tower.trait === 'Motivation') return null;

    const cost = 500;
    if (gameStateRef.current.dna < cost) return null;

    // Determine archetype
    let archetype: 'MEAT' | 'HEAVY' | 'RAPID' = 'RAPID';
    if (animal.generationMeat && animal.generationMeat > 0) {
      archetype = 'MEAT';
    } else if (animal.damage >= 60 || animal.fireRate >= 1000) {
      archetype = 'HEAVY';
    }

    const updatedGameState = { 
      ...gameStateRef.current, 
      dna: gameStateRef.current.dna - cost,
      celestialTraitPity: 0
    };
    gameStateRef.current = updatedGameState;
    setGameState(updatedGameState);

    const next = towersRef.current.map(t => {
      if (t.id === towerId) {
        return { ...t, trait: '???' };
      }
      return t;
    });
    towersRef.current = next;
    setTowers(next);

    return {
      trait: '???',
      score: 150,
      archetype
    };
  }, []);

  const update = useCallback((rawTime: number) => {
    if (gameStateRef.current.isGameOver) return;

    // Pause the gameloop if any cutscene is currently showing!
    if (isCutsceneOpenRef.current || isUnrivaledCutsceneOpenRef.current || isWarperClashCutsceneOpenRef.current || isSkyChasingCutsceneOpenRef.current || isLoreTitanCutsceneOpenRef.current) {
      lastTimeRef.current = rawTime; // Reset timestamp reference to prevent delta jumps upon closing
      lastProcessedTimeRef.current = rawTime;
      if (typeof document === 'undefined' || !document.hidden) {
        requestRef.current = requestAnimationFrame(update);
      }
      return;
    }

    if (!lastTimeRef.current) {
      lastTimeRef.current = rawTime;
    }
    const rawDeltaTime = rawTime - lastTimeRef.current;
    if (rawDeltaTime < 3 && lastProcessedTimeRef.current !== 0) {
      return;
    }
    lastTimeRef.current = rawTime;
    lastProcessedTimeRef.current = rawTime;

    let speedMultiplier = 1.0;
    try {
      const storedSpeed = localStorage.getItem('df_dev_speed');
      if (storedSpeed) {
        speedMultiplier = parseFloat(storedSpeed);
      }
    } catch (e) {}

    // Fixed timestep sub-stepping to prevent lagging, clipping, and coordinate explosions under high-speed simulation
    if (!accumulatorRef.current) {
      accumulatorRef.current = 0;
    }
    const cappedRawDelta = Math.min(rawDeltaTime, 100); // Prevent game freeze on tab-out
    accumulatorRef.current += cappedRawDelta * speedMultiplier;

    const stepSize = 16.67;

    // Core Anti-Lag and Anti-Spiral-of-Death Panic Clause
    const isUltraLag = !!gameStateRef.current.ultraLagReduce;
    const isLowVFX = !!gameStateRef.current.disableVFX;
    const speedFactor = Math.max(1, speedMultiplier / 2);
    const maxAccumulatedValue = (isUltraLag ? (stepSize * 2) : (isLowVFX ? (stepSize * 4) : (stepSize * 6))) * speedFactor;
    if (accumulatorRef.current > maxAccumulatedValue) {
      accumulatorRef.current = maxAccumulatedValue; // Panic reset to prevent lag spiral crashes
    }

    const baseMaxSteps = isUltraLag ? 2 : (isLowVFX ? 4 : 8);
    const maxSteps = speedMultiplier > 10 ? Math.ceil(baseMaxSteps * (speedMultiplier / 5)) : baseMaxSteps;
    let stepsRun = 0;

    // Deep clones to prevent mutation issues and ensure reactivity
    const hasCommanderInEnemiesAtStart = enemiesRef.current.some(e => e.typeId === 'hunter_commander' && e.health > 0);
    const hasCommanderInQueueAtStart = waveEnemyQueue.current.some(e => e.id === 'hunter_commander');
    const wasCommanderPresentThisTick = hasCommanderInEnemiesAtStart || hasCommanderInQueueAtStart;

    const hasUnrivaledInEnemiesAtStart = enemiesRef.current.some(e => e.typeId === 'unrivaled_original' && e.health > 0);
    const hasUnrivaledInQueueAtStart = waveEnemyQueue.current.some(e => e.id === 'unrivaled_original');
    const wasUnrivaledPresentThisTick = hasUnrivaledInEnemiesAtStart || hasUnrivaledInQueueAtStart;

    const hasUltraBossInEnemiesAtStart = enemiesRef.current.some(e => (e.typeId === 'ultra_world_boss' || (gameStateRef.current.isUltraBoss && e.isBoss)) && e.health > 0);
    const hasUltraBossInQueueAtStart = waveEnemyQueue.current.some(e => e.id === 'ultra_world_boss' || (gameStateRef.current.isUltraBoss && e.isBoss));
    const wasUltraBossPresentThisTick = hasUltraBossInEnemiesAtStart || hasUltraBossInQueueAtStart;

    let nextEnemies = enemiesRef.current.map(e => ({ ...e }));
    let nextTowers = towersRef.current.map(t => ({ ...t }));
    let nextProjectiles = projectilesRef.current.map(p => ({ ...p }));
    let nextSkillEffects = skillEffectsRef.current.map(se => ({ ...se }));

    let nextMeat = gameStateRef.current.meat;
    const activeBadgeAtTick = getActiveBadge(gameStateRef.current);
    const badgePerkAtTick = activeBadgeAtTick?.perk;
    const badgeMeatMultiplier = 1 + ((badgePerkAtTick?.meatBonusPercent || 0) / 100);
    const badgeDnaMultiplier = 1 + ((badgePerkAtTick?.dnaBonusPercent || 0) / 100);

    const hasHarvester = nextTowers.some(t => t.animalId === 'titan_defender' && (t as any).titanMagneticHarvesterUpgrade);
    const bountyMultiplier = (hasHarvester ? 1.2 : 1.0) * badgeMeatMultiplier;
    let nextDna = gameStateRef.current.dna;
    let nextHealth = gameStateRef.current.health;
    let nextIsWaveActive = gameStateRef.current.isWaveActive;
    let nextIsGameOver = gameStateRef.current.isGameOver;

    let nextSummonedAnimals = gameStateRef.current.summonedAnimals;
    let nextSecretPity = gameStateRef.current.secretPity ?? 0;
    let nextCelestialPity = gameStateRef.current.celestialPity ?? 0;
    let nextUnrivaledPity = gameStateRef.current.unrivaledPity ?? 0;
    let nextMysteryPity = gameStateRef.current.mysteryPity ?? 0;
    let nextOriginalPity = gameStateRef.current.originalPity ?? 0;
    let nextOverseerPity = gameStateRef.current.overseerPity ?? 0;
    let nextShardsOfGods = gameStateRef.current.shardsOfGods ?? 0;
    let nextArcaneShards = gameStateRef.current.arcaneShards ?? 0;
    let nextGameTokens = gameStateRef.current.gameTokens ?? 0;
    let nextUltraBossSlayer = gameStateRef.current.ultraBossSlayer ?? false;
    let nextUltraBossKills = gameStateRef.current.ultraBossKills ?? 0;
    let nextSkyModeKills = gameStateRef.current.skyModeKills ?? 0;
    let nextAlienModeKills = gameStateRef.current.alienModeKills ?? 0;

    while (accumulatorRef.current >= stepSize && stepsRun < maxSteps) {
      accumulatorRef.current -= stepSize;
      stepsRun++;

      const deltaTime = stepSize;
      gameTimeRef.current = (gameTimeRef.current || 0) + deltaTime;
      const time = gameTimeRef.current;
      const gameTime = time;

    // Process pending deferred/delayed events from skills synchronously (reduces lag to zero)
    if (pendingDamageEvents.current.length > 0) {
      const activeEvents = pendingDamageEvents.current.filter(ev => time >= ev.triggerTime);
      pendingDamageEvents.current = pendingDamageEvents.current.filter(ev => time < ev.triggerTime);

      activeEvents.forEach(ev => {
        // Spawn the delayed flash/beams visual effect synchronously
        nextSkillEffects.push({
          id: Math.random().toString(36).substr(2, 9),
          type: 'beams_beams',
          x: ev.x,
          y: ev.y,
          radius: 0,
          maxRadius: 100,
          color: ev.color,
          duration: 100,
          startTime: time
        });

        // Apply explosion damage synchronously
        nextEnemies = nextEnemies.map(e => {
          const dx = e.x - ev.x;
          const dy = e.y - ev.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d <= ev.radius) {
            if (ev.sourceTowerId) {
              recordDamageDealt(ev.sourceTowerId, Math.min(e.health, ev.damage));
            }
            return {
              ...e,
              health: e.health - ev.damage
            };
          }
          return e;
        });
      });
    }

    // 1. Spawning
    const activePath = STAGE_PATHS[gameStateRef.current.currentStage || 'default'] || STAGE_PATHS.default;

    if (nextIsWaveActive && waveEnemyQueue.current.length > 0) {
      const isLargeHorde = waveEnemyQueue.current.length > 50 || gameStateRef.current.wave === 400;
      const spawnInterval = isLargeHorde ? 40 : (gameStateRef.current.isSuddenDeath ? 400 : 1000);
      if (gameTime - lastSpawnTime.current > spawnInterval) {
        const maxActiveCap = isLargeHorde ? 140 : 250;
        const spawnBatch = isLargeHorde ? Math.min(12, Math.max(1, maxActiveCap - nextEnemies.length), waveEnemyQueue.current.length) : 1;

        for (let s = 0; s < spawnBatch; s++) {
          if (waveEnemyQueue.current.length === 0) break;
          const nextEnemy = waveEnemyQueue.current.shift()!;
          
          // Cosmic Singularity Relic: Instantly drains 15% of Boss health on spawn
          const isBoss = nextEnemy.isBoss || nextEnemy.category === 'boss';
          const hasCosmicSingularity = gameStateRef.current.equippedRelicIds?.includes('cosmic_singularity');
          
          let initialHealth = nextEnemy.health;
          if (isBoss && hasCosmicSingularity) {
            initialHealth = Math.floor(initialHealth * 0.85);
          }

          const isSky = ['sky_vanguard', 'plasma_interceptor', 'doom_vulture', 'cyber_cruiser_boss', 'alien_mothership', 'alien_mind_flayer'].includes(nextEnemy.id) || (nextEnemy as any).isFlying || (nextEnemy as any).category === 'sky_hunter' || !!gameStateRef.current.isSkyMode;
          const newEnemy: EnemyInstance = {
            id: Math.random().toString(36).substr(2, 9),
            typeId: nextEnemy.id,
            x: activePath[0].x,
            y: activePath[0].y,
            health: initialHealth,
            maxHealth: nextEnemy.health,
            pathIndex: 0,
            distanceTravelled: 0,
            rotation: 0,
            isFlying: isSky,
          };
          nextEnemies.push(newEnemy);
        }
        lastSpawnTime.current = gameTime;
      }
    } else if (nextIsWaveActive && nextEnemies.length === 0 && waveEnemyQueue.current.length === 0) {
      nextIsWaveActive = false;
      gameStateRef.current.isWaveActive = false;
      let waveRewardDna = Math.floor((50 + (gameStateRef.current.wave * 10)) * badgeDnaMultiplier);
      if (gameStateRef.current.isGigaGacha) {
        waveRewardDna *= 10;
      }
      if (gameStateRef.current.isSkyMode) {
        waveRewardDna = Math.floor(waveRewardDna * 1.35); // +35% bonus DNA for clearing Sky Mode waves
      }
      if (gameStateRef.current.isAlienMode) {
        waveRewardDna = Math.floor(waveRewardDna * 1.40); // +40% bonus DNA for clearing Alien Invasion waves
        if (Math.random() < 0.35) {
          nextGameTokens += 1;
        }
      }
      if (gameStateRef.current.isLoreMode) {
        waveRewardDna = Math.floor(waveRewardDna * 1.50); // +50% bonus DNA for Lore Mode waves
        const currentWave = gameStateRef.current.wave;

        // Check if an animal was unlocked at this exact wave
        const unlockedAnimalId = ANIMAL_LORE_UNLOCKS[currentWave];
        if (unlockedAnimalId) {
          const animalDef = ANIMALS.find(a => a.id === unlockedAnimalId);
          if (animalDef) {
            const currentSummoned = gameStateRef.current.summonedAnimals || [];
            if (!currentSummoned.includes(unlockedAnimalId)) {
              gameStateRef.current.summonedAnimals = [...currentSummoned, unlockedAnimalId];
            }
            nextSkillEffects.push({
              id: Math.random().toString(36).substr(2, 9),
              type: 'crit_text',
              x: 400,
              y: 180,
              radius: 0,
              maxRadius: 0,
              color: '#00ffcc',
              duration: 3500,
              startTime: gameTime,
              text: `🔓 LORE UNLOCKED: ${animalDef.emoji} ${animalDef.name.toUpperCase()} AVAILABLE!`
            });
            gameAudio.playSFX('gacha', 'Legendary');
          }
        }

        // Guaranteed Arcane Shard on Lore Boss waves (every 10 waves)
        if (currentWave % 10 === 0) {
          nextArcaneShards += 1;
          nextSkillEffects.push({
            id: Math.random().toString(36).substr(2, 9),
            type: 'crit_text',
            x: 400,
            y: 220,
            radius: 0,
            maxRadius: 0,
            color: '#c084fc',
            duration: 3000,
            startTime: gameTime,
            text: `💎 +1 ARCANE SHARD (LORE WAVE ${currentWave} MILESTONE)`
          });
        }

        // Trigger Titan Transformation cutscene right after Wave 200 completes if not triggered yet
        if (currentWave >= 200 && !gameStateRef.current.loreTitanTransformed && !loreTitanCutsceneTriggeredRef.current) {
          loreTitanCutsceneTriggeredRef.current = true;
          setIsLoreTitanCutsceneOpen(true);
        }

        // Trigger Warper Return & Purification cutscene right after Wave 399 completes
        if (currentWave >= 399 && !gameStateRef.current.warperPurifiedCutsceneTriggered && !warperReturnCutsceneTriggeredRef.current) {
          warperReturnCutsceneTriggeredRef.current = true;
          setIsWarperReturnCutsceneOpen(true);
        }

        if (currentWave >= 400) {
          gameStateRef.current.loreCompleted = true;
          nextSkillEffects.push({
            id: Math.random().toString(36).substr(2, 9),
            type: 'crit_text',
            x: 400,
            y: 300,
            radius: 0,
            maxRadius: 0,
            color: '#f43f5e',
            duration: 6000,
            startTime: gameTime,
            text: `👑 CONGRATULATIONS! ALL 400 LORE WAVES CONQUERED! MULTIVERSE RESTORED!`
          });
        }
      }
      nextDna += waveRewardDna;
      gameAudio.playSFX('victory');

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('daily-mission-event', { detail: { type: 'win-wave', count: 1 } }));
      }

      // Primal Aegis Relic: Restores 20% Base HP upon clearing each wave!
      if (gameStateRef.current.equippedRelicIds?.includes('primal_aegis')) {
        nextHealth = Math.min(100, nextHealth + 20);
        nextSkillEffects.push({
          id: Math.random().toString(36).substr(2, 9),
          type: 'crit_text',
          x: 400,
          y: 200,
          radius: 0,
          maxRadius: 0,
          color: '#38bdf8',
          duration: 1400,
          startTime: gameTime,
          text: '🛡️ +20% BASE HP (AEGIS REPAIR)'
        });
      }

      // Award Shards of Gods: 1 for normal waves, 5 for Boss wave milestones (boosted 5x in Giga Gacha)
      const currentWave = gameStateRef.current.wave;
      let shardsAwarded = currentWave % 5 === 0 ? 5 : 1;
      if (gameStateRef.current.isGigaGacha) {
        shardsAwarded *= 5;
      }
      nextShardsOfGods += shardsAwarded;

      // Generous Wave Clear Meat Bonus for new and experienced players
      const waveMeatBonus = Math.floor(Math.max(500, currentWave * 250) * badgeMeatMultiplier);
      nextMeat += waveMeatBonus;

      // Check for Ancient Relic Drop on wave milestones and boss wave clears!
      const isBossWave = currentWave % 5 === 0;
      const droppedWaveRelic = checkBossRelicDrop(
        currentWave,
        isBossWave,
        gameStateRef.current.unlockedRelics || [],
        gameStateRef.current.isBossRush
      );

      if (droppedWaveRelic) {
        const nextUnlockedRelics = [...(gameStateRef.current.unlockedRelics || [])];
        if (!nextUnlockedRelics.includes(droppedWaveRelic.id)) {
          nextUnlockedRelics.push(droppedWaveRelic.id);
          gameStateRef.current.unlockedRelics = nextUnlockedRelics;

          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('relic-obtained', {
              detail: { relic: droppedWaveRelic }
            }));
          }

          nextSkillEffects.push({
            id: Math.random().toString(36).substr(2, 9),
            type: 'crit_text',
            x: 400,
            y: 250,
            radius: 0,
            maxRadius: 0,
            color: '#f59e0b',
            duration: 2200,
            startTime: gameTime,
            text: `🌌 RELIC UNEARTHED: ${droppedWaveRelic.name.toUpperCase()}!`
          });
        }
      }

      // Calculate MVP unit of the wave
      let maxDamage = 0;
      let mvpTowerId: string | null = null;
      Object.entries(waveDamageRef.current).forEach(([towerId, dmg]) => {
        const dmgNum = dmg as number;
        if (dmgNum > maxDamage) {
          maxDamage = dmgNum;
          mvpTowerId = towerId;
        }
      });

      if (mvpTowerId && maxDamage > 0) {
        const details = towerDetailsHistoryRef.current[mvpTowerId];
        if (details) {
          setWaveSummary({
            wave: currentWave,
            unitId: mvpTowerId,
            unitName: details.name,
            animalId: details.animalId,
            rarity: details.rarity,
            damage: maxDamage,
            trait: details.trait,
            level: details.level,
            color: details.color,
            isPinnacle: details.isPinnacle,
          });
        }
      }

      if (gameStateRef.current.autoDeployWaves) {
        autoWaveTriggerTime.current = gameTime + 600;
      }
    }

    // Auto-Wave Trigger Handler (independent of browser tab setTimeout throttling)
    if (gameStateRef.current.autoDeployWaves && !nextIsWaveActive && !gameStateRef.current.isGameOver && gameStateRef.current.health > 0) {
      if (autoWaveTriggerTime.current === 0) {
        autoWaveTriggerTime.current = gameTime + 600;
      } else if (gameTime >= autoWaveTriggerTime.current) {
        autoWaveTriggerTime.current = 0;
        startWave();
      }
    } else if (nextIsWaveActive || !gameStateRef.current.autoDeployWaves) {
      autoWaveTriggerTime.current = 0;
    }

    // 2. Systems Update - Money Generation & Cybernetic Auto-Deploy Protocol
    if (gameTime - lastGenerationTime.current > 1000) {
      let totalGen = 100; // Base +100 passive Meat/sec to eliminate meat grinding for new players
      nextTowers.forEach(t => {
        const animal = ANIMALS.find(a => a.id === t.animalId);
        if (animal?.generationMeat) {
          const isCurrentlyDisabled = t.disabledExpiry && gameTime < t.disabledExpiry;
          if (!isCurrentlyDisabled) {
            let genAmount = animal.generationMeat * (1 + (t.level - 1) * 0.5);
            // Capy's Golden Citrus Relic: +50% Support/Generator Meat Yield
            if (gameStateRef.current.equippedRelicIds?.includes('capy_citrus')) {
              genAmount = Math.floor(genAmount * 1.50);
            }
            totalGen += genAmount;
            // Grant XP for generating Meat
            const genXp = Math.round(genAmount * 1.5) + 15;
            accumulatedXpRef.current[t.id] = (accumulatedXpRef.current[t.id] || 0) + genXp;
          }
        }
      });
      if (totalGen > 0) {
        nextMeat += totalGen;
      }

      // --- AUTO DEPLOY TOWERS ---
      if (gameStateRef.current.autoDeployTowers) {
        const owned = ANIMALS.filter(a => gameStateRef.current.summonedAnimals.includes(a.id));
        
        let targetAnimal: Animal | null = null;
        
        // Check if there is a specific auto deploy unit setting
        const autoUnitId = gameStateRef.current.autoDeployUnitId;
        if (autoUnitId && autoUnitId !== 'best') {
          const specificAnimal = owned.find(a => a.id === autoUnitId);
          if (specificAnimal && nextMeat >= specificAnimal.cost) {
            targetAnimal = specificAnimal;
          }
        } else if (gameStateRef.current.tacticalAutoDiversify !== false) {
          // Tactical Plan Auto-Diversify: automatically selects the best construct to fulfill the active tactical plan's deficit role!
          const activePlan = getTacticalPlan(gameStateRef.current.activeTacticalPlanId);
          const diversePick = selectDiverseAnimalForTacticalPlan(activePlan, owned, nextTowers, nextMeat);
          if (diversePick) {
            targetAnimal = diversePick;
          }
        }
        
        if (!targetAnimal) {
          // 1. If there is a user-selected unit, attempt to deploy it first (if affordable and owned)
          if (selectedAnimalIdRef.current) {
            const selectedAnimal = owned.find(a => a.id === selectedAnimalIdRef.current);
            if (selectedAnimal && nextMeat >= selectedAnimal.cost) {
              targetAnimal = selectedAnimal;
            }
          }
          
          // 2. If no user-selected unit (or not affordable), or if placeOnlyBest is active, select the best-available owned unit
          if (!targetAnimal || placeOnlyBestRef.current) {
            if (owned.length > 0) {
              const rarityRank: Record<string, number> = {
                'Arcane': 12,
                'Overseer': 11,
                'Unrivaled': 10,
                'Original': 9,
                '???': 8,
                'Celestial': 7,
                'Secret': 6,
                'Divine': 6,
                'Mythic': 5,
                'Legendary': 4,
                'Epic': 3,
                'Rare': 2,
                'Uncommon': 2,
                'Common': 1
              };
              
              const sortedOwned = [...owned].sort((a, b) => {
                if (a.id === 'elemental_god') return -1;
                if (b.id === 'elemental_god') return 1;
                const rankA = rarityRank[a.rarity] || 0;
                const rankB = rarityRank[b.rarity] || 0;
                if (rankA !== rankB) return rankB - rankA;
                return (b.damage || 0) - (a.damage || 0);
              });
              
              const bestAvailable = sortedOwned[0];
              
              if (placeOnlyBestRef.current) {
                if (nextMeat >= bestAvailable.cost) {
                  targetAnimal = bestAvailable;
                }
              } else if (!targetAnimal) {
                // Fallback: If no user selection, select the best affordable owned unit
                const affordable = owned.filter(a => nextMeat >= a.cost);
                if (affordable.length > 0) {
                  const sortedAffordable = [...affordable].sort((a, b) => {
                    if (a.id === 'elemental_god') return -1;
                    if (b.id === 'elemental_god') return 1;
                    const rankA = rarityRank[a.rarity] || 0;
                    const rankB = rarityRank[b.rarity] || 0;
                    if (rankA !== rankB) return rankB - rankA;
                    return (b.damage || 0) - (a.damage || 0);
                  });
                  targetAnimal = sortedAffordable[0];
                }
              }
            }
          }
        }

        if (targetAnimal && nextMeat >= targetAnimal.cost) {
          const spot = findBestAutoPlacement(nextTowers, activePath);
          if (spot) {
            const animalId = targetAnimal.id;
            const newTower: TowerInstance = {
                id: Math.random().toString(36).substr(2, 9),
                animalId,
                x: spot.x,
                y: spot.y,
                rotation: 0,
                lastFired: 0,
                level: 1,
                trait: (targetAnimal.rarity === 'The Chillful' || targetAnimal.id === 'capybara') ? 'Motivation' : (targetAnimal.rarity === 'Original' ? 'None' : (targetAnimal.rarity === 'Overseer' ? 'EyeOfGod' : (targetAnimal.rarity === 'Arcane' || targetAnimal.id === 'arcane_warper' ? 'DeathOfWorld' : getRandomTrait()))),
            };
            nextTowers.push(newTower);
            nextMeat -= targetAnimal.cost;
          }
        }
      }

      // --- AUTO UPGRADE TOWERS ---
      if (gameStateRef.current.autoUpgradeTowers) {
        const upgradeableList = nextTowers.filter(t => t.level < 20).map(t => {
          const animal = ANIMALS.find(a => a.id === t.animalId)!;
          const cost = Math.floor(animal.cost * (t.level + 1) * 0.5);
          return {
            tower: t,
            animal,
            cost
          };
        }).filter(item => nextMeat >= item.cost);

        if (upgradeableList.length > 0) {
          const rarityPriority: Record<string, number> = {
            'Celestial': 7,
            'Secret': 6,
            'Mythic': 5,
            'Legendary': 4,
            'Epic': 3,
            'Rare': 2,
            'Common': 1
          };
          
          upgradeableList.sort((a, b) => {
            const rA = rarityPriority[a.animal.rarity] || 0;
            const rB = rarityPriority[b.animal.rarity] || 0;
            if (rA !== rB) {
              return rB - rA;
            }
            return a.cost - b.cost;
          });

          const bestUpgrade = upgradeableList[0];
          bestUpgrade.tower.level++;
          nextMeat -= bestUpgrade.cost;
        }
      }

      // --- AUTO SUMMON GENOMES ---
      if (gameStateRef.current.autoSummon) {
        const checkAltar = gameStateRef.current.autoSummonAltar || 'standard';
        let loopLimit = 0;
        
        while (loopLimit < 30) {
          // Check currency availability
          if (checkAltar === 'ultra') {
            if (nextShardsOfGods < 1) break;
          } else {
            const cost = checkAltar === 'quantum' ? 500 : 100;
            if (nextDna < cost) break;
          }
          
          loopLimit++;
          // Perform 1 roll sequence behind the scenes!
          let selectedRarity: any = 'Common';
          let wasPityTriggered = false;
          let wasCelestialPityTriggered = false;
          let wasMysteryPityTriggered = false;
          let wasOriginalPityTriggered = false;
          let wasOverseerPityTriggered = false;
          let wasUnrivaledPityTriggered = false;

          if (checkAltar === 'ultra') {
            // Ultra weights: Secret: 40, Unrivaled: 24.99999, Celestial: 20, ???: 15, Original: 0.000009, Overseer: 0.000001
            const weights = { Secret: 40, Unrivaled: 24.99999, Celestial: 20, '???': 15, Original: 0.000009, Overseer: 0.000001 };
            
            if (nextOverseerPity + 1 >= 20000) {
              selectedRarity = 'Overseer';
              wasOverseerPityTriggered = true;
            } else if (nextOriginalPity + 1 >= 15000) {
              selectedRarity = 'Original';
              wasOriginalPityTriggered = true;
            } else if (nextMysteryPity + 1 >= 1000) {
              selectedRarity = '???';
              wasMysteryPityTriggered = true;
            } else if (nextCelestialPity + 1 >= 100) {
              selectedRarity = 'Celestial';
              wasCelestialPityTriggered = true;
            } else if (nextUnrivaledPity + 1 >= 50) {
              selectedRarity = 'Unrivaled';
              wasUnrivaledPityTriggered = true;
            } else if (nextSecretPity + 1 >= 15) {
              selectedRarity = 'Secret';
              wasPityTriggered = true;
            } else {
              const totalWeight = 100;
              let random = Math.random() * totalWeight;
              for (const [rarity, weight] of Object.entries(weights)) {
                if (random < weight) {
                  selectedRarity = rarity;
                  break;
                }
                random -= weight;
              }
            }
          } else {
            // Standard/quantum weights
            const weights = checkAltar === 'quantum' 
              ? { Common: 0, Rare: 10, Epic: 30, Legendary: 35, Mythic: 15, Secret: 8.49, Unrivaled: 1.0, Celestial: 0.5, '???': 0.01 }
              : { Common: 40, Rare: 25, Epic: 14.894, Legendary: 10, Mythic: 5, Secret: 5, Unrivaled: 0.1, Celestial: 0.005, '???': 0.001 };
            
            const originalChance = checkAltar === 'quantum' ? 0.00002 : 0.000002;
            if (Math.random() < originalChance) {
              selectedRarity = 'Original';
            } else {
              if (nextMysteryPity + 1 >= 1000) {
                selectedRarity = '???';
                wasMysteryPityTriggered = true;
              } else if (nextCelestialPity + 1 >= 100) {
                selectedRarity = 'Celestial';
                wasCelestialPityTriggered = true;
              } else if (nextUnrivaledPity + 1 >= 50) {
                selectedRarity = 'Unrivaled';
                wasUnrivaledPityTriggered = true;
              } else if (nextSecretPity + 1 >= 15) {
                selectedRarity = 'Secret';
                wasPityTriggered = true;
              } else {
                const totalWeight = Object.values(weights).reduce((sum, wt) => sum + wt, 0);
                let random = Math.random() * totalWeight;
                for (const [rarity, weight] of Object.entries(weights)) {
                  if (random < weight) {
                    selectedRarity = rarity;
                    break;
                  }
                  random -= weight;
                }
              }
            }
          }

          let pool = ANIMALS.filter(a => a.rarity === selectedRarity);
          if (selectedRarity === 'Mythic') {
            const featuredList = getFeaturedMythicsAtTime(Date.now());
            if (Math.random() < 0.75) {
              pool = featuredList;
            }
          }
          const animal = pool[Math.floor(Math.random() * pool.length)] || ANIMALS[0];

          if (selectedRarity === 'Secret') wasPityTriggered = true;
          if (selectedRarity === 'Celestial') wasCelestialPityTriggered = true;
          if (selectedRarity === '???') wasMysteryPityTriggered = true;
          if (selectedRarity === 'Original') wasOriginalPityTriggered = true;
          if (selectedRarity === 'Overseer') wasOverseerPityTriggered = true;
          if (selectedRarity === 'Unrivaled') wasUnrivaledPityTriggered = true;

          nextSecretPity = wasPityTriggered ? 0 : nextSecretPity + 1;
          nextCelestialPity = wasCelestialPityTriggered ? 0 : nextCelestialPity + 1;
          nextMysteryPity = wasMysteryPityTriggered ? 0 : nextMysteryPity + 1;
          nextOriginalPity = wasOriginalPityTriggered ? 0 : nextOriginalPity + 1;
          nextOverseerPity = wasOverseerPityTriggered ? 0 : nextOverseerPity + 1;
          nextUnrivaledPity = wasUnrivaledPityTriggered ? 0 : nextUnrivaledPity + 1;

          // Check duplication and auto-selling rules
          const isDuplicate = nextSummonedAnimals.includes(animal.id);

          let autoSold = false;
          if (isDuplicate && (gameStateRef.current.autoSellDuplicates ?? true)) {
            autoSold = true;
          } else if (animal.rarity === 'Common' && gameStateRef.current.autoSellCommons) {
            autoSold = true;
          } else if (animal.rarity === 'Rare' && gameStateRef.current.autoSellRares) {
            autoSold = true;
          } else if (animal.rarity === 'Epic' && gameStateRef.current.autoSellEpics) {
            autoSold = true;
          } else if (animal.rarity === 'Legendary' && gameStateRef.current.autoSellLegendaries) {
            autoSold = true;
          }

          let dnaRefund = 0;
          if (autoSold) {
            const REFUND_VALUES: Record<string, number> = {
              Common: 45, Rare: 60, Epic: 80, Legendary: 100, Mythic: 150, Secret: 250, Celestial: 500, '???': 7777, Original: 15000, Overseer: 30000
            };
            dnaRefund = REFUND_VALUES[animal.rarity] || 0;
            
            // Double Helix Genome Relic: +60% DNA recycling/compensation boost
            if (gameStateRef.current.equippedRelicIds?.includes('double_helix')) {
              dnaRefund = Math.floor(dnaRefund * 1.60);
            }
          } else {
            nextSummonedAnimals = [...nextSummonedAnimals, animal.id];
          }

          if (checkAltar === 'ultra') {
            nextShardsOfGods -= 1;
            if (autoSold) {
              nextDna += dnaRefund;
            }
          } else {
            const cost = checkAltar === 'quantum' ? 500 : 100;
            const netCost = Math.max(1, cost - dnaRefund);
            nextDna = nextDna - netCost;
          }

          // Dispatch event if newly unlocked, or if it is a ??? or Original/Overseer rarity creature to guarantee cutscenes
          if ((!autoSold && isDuplicate === false) || animal.rarity === '???' || animal.rarity === 'Original' || animal.rarity === 'Overseer') {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('auto-summon-unlock', { 
                detail: { 
                  name: animal.name, 
                  rarity: animal.rarity, 
                  color: animal.color,
                  skillDesc: animal.skillDesc,
                  noCutscene: animal.rarity === '???'
                } 
              }));
            }
          }
        }
      }

      lastGenerationTime.current = gameTime;
    }

    // 3. Enemies Move & Environmental Hazards
    let updatedActiveEnemies: EnemyInstance[] = [];
    
    // Volcanic Eruptions in Prehistoric stage
    if (gameStateRef.current.currentStage === 'prehistoric' && nextIsWaveActive) {
      if (gameTime - lastEruptTime.current > 12000) {
        lastEruptTime.current = gameTime;
        if (nextEnemies.length > 0) {
          const targetEnemy = nextEnemies[Math.floor(Math.random() * nextEnemies.length)];
          const targetX = targetEnemy.x;
          const targetY = targetEnemy.y;
          
          nextSkillEffects.push({
            id: Math.random().toString(36).substr(2, 9),
            type: 'shockwave',
            x: targetX,
            y: targetY,
            radius: 0,
            maxRadius: 140,
            color: '#ef4444',
            duration: 700,
            startTime: gameTime
          });
          
          nextEnemies = nextEnemies.map(e => {
            const dx = e.x - targetX;
            const dy = e.y - targetY;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d <= 140) {
              return { ...e, health: e.health - (1000 + gameStateRef.current.wave * 350) };
            }
            return e;
          });
        }
      }
    }

    const dreadnoughts = nextEnemies.filter(e => e.typeId === 'hitech_hover_dreadnought');
    const blackholes = nextTowers.filter(t => t.animalId === 'blackhole_dwarf');
    const unrivaledBehemoths = nextTowers.filter(t => t.animalId === 'unrivaled_void_behemoth');
    const activeBlackholes = nextSkillEffects.filter(e => e.type === 'blackhole');
    const activeVortexes = nextSkillEffects.filter(e => e.type === 'vortex');

    nextEnemies.forEach(enemy => {
      const type = ENEMY_MAP.get(enemy.typeId) || {
        id: enemy.typeId,
        name: enemy.typeId.includes('origin') ? '🌌 THE MULTIVERSE PRIME ORIGIN (400TH WAVE FINALE)' : 'Syndicate Operative',
        color: enemy.typeId.includes('origin') ? '#ec4899' : '#f43f5e',
        size: enemy.typeId.includes('origin') ? 95 : 30,
        isBoss: enemy.typeId.includes('origin') || enemy.typeId.includes('boss'),
        emoji: enemy.typeId.includes('origin') ? '🌌' : '👾',
        category: enemy.typeId.includes('origin') ? 'boss' : 'standard',
        speed: 0.12,
        bounty: 1000000,
        description: 'A hostile syndicate entity.'
      };
      const targetNode = activePath[enemy.pathIndex + 1];

      // Ensure stable back-up path coordinates are initialized correctly
      if (enemy.pathX === undefined || enemy.pathY === undefined) {
        enemy.pathX = enemy.x;
        enemy.pathY = enemy.y;
      }

      // Check if enemy is currently under any gravitational pull force to let pull win over slide-back
      let isForcePulled = false;
      for (const t of blackholes) {
        if (Math.abs(t.x - enemy.x) <= 320 && Math.abs(t.y - enemy.y) <= 320) {
          isForcePulled = true;
          break;
        }
      }
      if (!isForcePulled) {
        for (const t of unrivaledBehemoths) {
          if (Math.abs(t.x - enemy.x) <= 480 && Math.abs(t.y - enemy.y) <= 480) {
            isForcePulled = true;
            break;
          }
        }
      }
      if (!isForcePulled) {
        for (const effect of activeBlackholes) {
          if (Math.abs(effect.x - enemy.x) <= 250 && Math.abs(effect.y - enemy.y) <= 250) {
            isForcePulled = true;
            break;
          }
        }
      }
      if (!isForcePulled) {
        for (const effect of activeVortexes) {
          if (Math.abs(effect.x - enemy.x) <= effect.maxRadius && Math.abs(effect.y - enemy.y) <= effect.maxRadius) {
            isForcePulled = true;
            break;
          }
        }
      }

      // Smoothly slide physical x, y back towards true path coordinates (pathX, pathY) to resolve active pulls gently
      const distToPath = Math.hypot(enemy.pathX - enemy.x, enemy.pathY - enemy.y);
      if (distToPath > 0.5) {
        const slideSpeed = isForcePulled ? 0.01 * (deltaTime / 16) : 0.15 * (deltaTime / 16);
        enemy.x += (enemy.pathX - enemy.x) * slideSpeed;
        enemy.y += (enemy.pathY - enemy.y) * slideSpeed;
      }

      if (targetNode) {
        const dx = targetNode.x - enemy.pathX;
        const dy = targetNode.y - enemy.pathY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Stage speed filters
        let stageSpeedMult = 1.0;
        if (gameStateRef.current.currentStage === 'jungle') {
          stageSpeedMult = 0.8; // Dense foliage slow-down
        } else if (gameStateRef.current.currentStage === 'savanna') {
          stageSpeedMult = 1.25; // Open plains speed-boost
        } else if (gameStateRef.current.currentStage === 'dimension_cosmic') {
          stageSpeedMult = 0.9; // Astral anti-gravity deceleration
        } else if (gameStateRef.current.currentStage === 'dimension_abyss') {
          stageSpeedMult = 1.15; // Abyssal dimensional surge
        }
        if (gameStateRef.current.isSuddenDeath) {
          stageSpeedMult *= 1.7; // Sudden Death 1.7x speed boost for enemies!
        }

        const isSlowed = enemy.slowExpiry && gameTime < enemy.slowExpiry;
        const baseSpeed = type.speed * stageSpeedMult;
        
        // Chrono Hover-Fortress Slipstream Propulsion Speed Boost (+50%)
        let speedBoost = 1.0;
        dreadnoughts.forEach(otherEnemy => {
          if (otherEnemy.id !== enemy.id) {
            const hdx = otherEnemy.x - enemy.x;
            const hdy = otherEnemy.y - enemy.y;
            const hdist = Math.sqrt(hdx * hdx + hdy * hdy);
            if (hdist <= 150) {
              speedBoost = 1.5;
            }
          }
        });

        const currentSpeed = isSlowed ? baseSpeed * (enemy.slowMultiplier ?? 1.0) * speedBoost : baseSpeed * speedBoost;
        const moveDist = currentSpeed * (deltaTime / 16);

        if (dist < moveDist) {
          enemy.pathX = targetNode.x;
          enemy.pathY = targetNode.y;
          enemy.pathIndex++;
        } else {
          const vx = (dx / dist) * moveDist;
          const vy = (dy / dist) * moveDist;
          enemy.pathX += vx;
          enemy.pathY += vy;
        }

        // --- SPECIAL HIGH-TECH HUNTER ABILITIES ---
        
        // 1. Cyber-Trapper EMP Shock Grenades
        if (type.id === 'hitech_trapper') {
          const lastTrapperShot = (enemy as any).lastActionTime || 0;
          if (gameTime - lastTrapperShot > 3000) {
            (enemy as any).lastActionTime = gameTime;
            
            // Spawn electric blue EMP surge shockwave
            nextSkillEffects.push({
              id: Math.random().toString(36).substr(2, 9),
              type: 'shockwave',
              x: enemy.x,
              y: enemy.y,
              radius: 0,
              maxRadius: 85,
              color: '#38bdf8',
              duration: 500,
              startTime: gameTime
            });

            nextTowers.forEach(t => {
              const tAnimal = ANIMAL_MAP.get(t.animalId);
              if (t.animalId === 'arcane_warper' || tAnimal?.rarity === 'Arcane' || t.trait === 'DeathOfWorld') {
                return; // Immune to stun
              }
              // In Lore Mode: Biological animals channel primal sanctuary leylines and resist EMP stuns; non-animals/machines get stunned!
              if (gameStateRef.current.isLoreMode) {
                const isNonAnimal = NON_ANIMAL_IDS.has(t.animalId);
                if (!isNonAnimal) {
                  return; // Biological animals resist stun in Lore Mode
                }
              }
              const tdx = t.x - enemy.x;
              const tdy = t.y - enemy.y;
              const distToTower = Math.sqrt(tdx * tdx + tdy * tdy);
              if (distToTower <= 85) {
                (t as any).disabledExpiry = gameTime + 3000;
                (t as any).isDisabled = true;
              }
            });
          }
        }

        // 3. Enemy Active Stun Missile Attack
        const isEliteOrBoss = type.isBoss || type.id.startsWith('hitech_') || type.id === 'cyber_trapper';
        if (isEliteOrBoss) {
          const lastMissileTime = (enemy as any).lastMissileTime || 0;
          if (gameTime - lastMissileTime > 6000 && nextTowers.length > 0) {
            (enemy as any).lastMissileTime = gameTime;
            
            // Pick a random tower to target
            const targetTower = nextTowers[Math.floor(Math.random() * nextTowers.length)];
            
            nextSkillEffects.push({
              id: Math.random().toString(36).substr(2, 9),
              type: 'enemy_missile',
              x: enemy.x,
              y: enemy.y,
              startX: enemy.x,
              startY: enemy.y,
              radius: 4,
              maxRadius: 4,
              color: '#f43f5e', // Hot pink-red stun missile
              duration: 3500, // moves for up to 3.5 seconds
              startTime: gameTime,
              targetTowerId: targetTower.id,
              projectileSpeed: 4.5
            } as any);
          }
        }

        // 2. Apex Decoy Hologragher Decoy Projections
        if (type.id === 'hitech_decoy') {
          const lastDecoyTime = (enemy as any).lastActionTime || 0;
          if (gameTime - lastDecoyTime > 4500) {
            (enemy as any).lastActionTime = gameTime;

            // Spawn illusory decoy 40 pixels ahead of its current track
            const nextNode = activePath[enemy.pathIndex + 1] || activePath[enemy.pathIndex];
            if (nextNode) {
              const pdx = nextNode.x - enemy.x;
              const pdy = nextNode.y - enemy.y;
              const pdist = Math.sqrt(pdx * pdx + pdy * pdy) || 1;
              const projX = enemy.x + (pdx / pdist) * 40;
              const projY = enemy.y + (pdy / pdist) * 40;

              nextSkillEffects.push({
                id: Math.random().toString(36).substr(2, 9),
                type: 'glitch' as any,
                x: projX,
                y: projY,
                radius: 0,
                maxRadius: 40,
                color: '#ec4899',
                duration: 600,
                startTime: gameTime
              });

              // Create decoy phantom
              const decoyPhantom: EnemyInstance = {
                id: Math.random().toString(36).substr(2, 9),
                typeId: 'hitech_decoy_phantom',
                x: projX,
                y: projY,
                health: 150,
                maxHealth: 150,
                pathIndex: enemy.pathIndex,
                distanceTravelled: enemy.distanceTravelled + 35,
                rotation: enemy.rotation,
              };
              (decoyPhantom as any).expiryTime = gameTime + 4500;
              
              updatedActiveEnemies.push(decoyPhantom);
            }
          }
        }

        // --- ALIEN ARMADA SPECIAL ABILITIES ---

        // 1. 👑 XENON TITAN COLOSSUS: Bio-Stomp Shockwave & Nanite Bio-Regen
        if (type.id === 'alien_bio_titan') {
          // Passive nanite bio-repair
          if (enemy.health < enemy.maxHealth) {
            enemy.health = Math.min(enemy.maxHealth, enemy.health + (enemy.maxHealth * 0.003 * (deltaTime / 16)));
          }

          const lastTitanStomp = (enemy as any).lastStompTime || 0;
          if (gameTime - lastTitanStomp > 6500) {
            (enemy as any).lastStompTime = gameTime;

            // Green bio-plasma seismic shockwave
            nextSkillEffects.push({
              id: Math.random().toString(36).substr(2, 9),
              type: 'shockwave',
              x: enemy.x,
              y: enemy.y,
              radius: 0,
              maxRadius: 120,
              color: '#84cc16', // Neon Lime bio-plasma
              duration: 700,
              startTime: gameTime
            });

            // Temporarily disable / slow ground towers in vicinity
            nextTowers.forEach(t => {
              const tAnimal = ANIMAL_MAP.get(t.animalId);
              if (t.animalId === 'arcane_warper' || tAnimal?.rarity === 'Arcane' || t.trait === 'DeathOfWorld') {
                return; // Immune
              }
              if (t.isAlienTech && (t.alienTechShieldHp || 0) > 0) {
                t.alienTechShieldHp = Math.max(0, (t.alienTechShieldHp || 0) - 300);
                return; // Holographic kinetic shield absorbed shockwave!
              }
              const tdx = t.x - enemy.x;
              const tdy = t.y - enemy.y;
              const distToTower = Math.sqrt(tdx * tdx + tdy * tdy);
              if (distToTower <= 120) {
                (t as any).disabledExpiry = gameTime + 2200;
                (t as any).isDisabled = true;
              }
            });
          }
        }

        // 2. 🛸 XENON MOTHERSHIP FLAGSHIP: Orbital Swarm Drop Pods & Plasma Barrage
        if (type.id === 'alien_mothership') {
          const lastDropPodTime = (enemy as any).lastDropPodTime || 0;
          if (gameTime - lastDropPodTime > 8000) {
            (enemy as any).lastDropPodTime = gameTime;

            // Orbital beam FX
            nextSkillEffects.push({
              id: Math.random().toString(36).substr(2, 9),
              type: 'glitch' as any,
              x: enemy.x,
              y: enemy.y,
              radius: 0,
              maxRadius: 60,
              color: '#06b6d4',
              duration: 800,
              startTime: gameTime
            });

            // Spawn 2 Xenomorph Crawlers as drop pods
            const crawlerType = ENEMIES.find(e => e.id === 'alien_crawler');
            if (crawlerType) {
              for (let pod = 0; pod < 2; pod++) {
                const offsetAngle = (pod * Math.PI) + (Math.random() * 0.5);
                const podEnemy: EnemyInstance = {
                  id: Math.random().toString(36).substr(2, 9),
                  typeId: 'alien_crawler',
                  x: enemy.x + Math.cos(offsetAngle) * 25,
                  y: enemy.y + Math.sin(offsetAngle) * 25,
                  health: crawlerType.health * (1 + (gameStateRef.current.wave || 1) * 0.15),
                  maxHealth: crawlerType.health * (1 + (gameStateRef.current.wave || 1) * 0.15),
                  pathIndex: Math.max(0, enemy.pathIndex - 1),
                  distanceTravelled: Math.max(0, enemy.distanceTravelled - 20),
                  rotation: enemy.rotation,
                  pathX: enemy.x,
                  pathY: enemy.y
                };
                updatedActiveEnemies.push(podEnemy);
              }
            }
          }
        }

        // 3. 🧠 PSIONIC OVERMIND LEECH: Psychic Disruption Wave
        if (type.id === 'alien_mind_flayer') {
          const lastMindPulse = (enemy as any).lastMindPulse || 0;
          if (gameTime - lastMindPulse > 4500) {
            (enemy as any).lastMindPulse = gameTime;

            nextSkillEffects.push({
              id: Math.random().toString(36).substr(2, 9),
              type: 'shockwave',
              x: enemy.x,
              y: enemy.y,
              radius: 0,
              maxRadius: 95,
              color: '#d946ef', // Neon Fuchsia psionic wave
              duration: 600,
              startTime: gameTime
            });
          }
        }

        // --- STAGE EXTRA HAZARDS & TICK DAMAGE ---
        const currentStage = gameStateRef.current.currentStage || 'default';
        if (currentStage === 'jungle') {
          // Jungle Poison Swamps
          const poisonSwamps = [
            { x: 300, y: 300, r: 80 },
            { x: 500, y: 450, r: 80 }
          ];
          let isInPoison = false;
          poisonSwamps.forEach(s => {
            const sdx = enemy.x - s.x;
            const sdy = enemy.y - s.y;
            if (Math.sqrt(sdx * sdx + sdy * sdy) < s.r) {
              isInPoison = true;
            }
          });
          if (isInPoison) {
            const poisonDmg = (enemy.maxHealth * 0.0003 + 0.3) * (deltaTime / 16);
            enemy.health -= poisonDmg;
          }
        } else if (currentStage === 'prehistoric') {
          // Constant lava ticking
          const lavaHeatDmg = (enemy.maxHealth * 0.0001 + 0.1) * (deltaTime / 16);
          enemy.health -= lavaHeatDmg;
        } else if (currentStage === 'dimension_cosmic') {
          // Stardust Celestial Flux ticking damage to enemies
          const stardustDmg = (enemy.maxHealth * 0.00015 + 0.25) * (deltaTime / 16);
          enemy.health -= stardustDmg;
        } else if (currentStage === 'dimension_abyss') {
          // Abyssal Singularity Dark Matter pull & tick
          const vdx = 400 - enemy.x;
          const vdy = 300 - enemy.y;
          const vdist = Math.sqrt(vdx * vdx + vdy * vdy);
          if (vdist > 10 && vdist < 350) {
            const pullForce = Math.min(0.2 * (deltaTime / 16), vdist, 3);
            enemy.x += (vdx / vdist) * pullForce;
            enemy.y += (vdy / vdist) * pullForce;
          }
          const abyssDmg = (enemy.maxHealth * 0.0002 + 0.35) * (deltaTime / 16);
          enemy.health -= abyssDmg;
        }

        // --- ELEMENTAL HAZARD OVERLAY ZONE ENEMY EFFECTS ---
        const activeHazards = elementalHazardsRef.current;
        if (activeHazards && activeHazards.length > 0) {
          activeHazards.forEach(zone => {
            const distToHazard = getDistanceToSegment(enemy.x, enemy.y, zone.startX, zone.startY, zone.endX, zone.endY);
            if (distToHazard <= 45) {
              if (zone.element === 'fire' || zone.element === 'magma') {
                const burnDmg = (enemy.maxHealth * 0.0004 + 0.5) * (deltaTime / 16);
                enemy.health -= burnDmg;
                enemy.slowMultiplier = Math.min(enemy.slowMultiplier ?? 1.0, 0.75);
                enemy.slowExpiry = Math.max(enemy.slowExpiry ?? 0, gameTime + 1000);
              } else if (zone.element === 'ice') {
                enemy.slowMultiplier = Math.min(enemy.slowMultiplier ?? 1.0, 0.55);
                enemy.slowExpiry = Math.max(enemy.slowExpiry ?? 0, gameTime + 1500);
              } else if (zone.element === 'poison') {
                const acidDmg = (enemy.maxHealth * 0.0003 + 0.3) * (deltaTime / 16);
                enemy.health -= acidDmg;
                if (enemy.armorReduction) {
                  enemy.armorReduction = Math.max(0, enemy.armorReduction * 0.99);
                }
              } else if (zone.element === 'sand') {
                enemy.slowMultiplier = Math.min(enemy.slowMultiplier ?? 1.0, 0.5);
                enemy.slowExpiry = Math.max(enemy.slowExpiry ?? 0, gameTime + 1000);
              } else if (zone.element === 'shadow') {
                enemy.slowMultiplier = Math.min(enemy.slowMultiplier ?? 1.0, 0.45);
                enemy.slowExpiry = Math.max(enemy.slowExpiry ?? 0, gameTime + 1200);
              } else if (zone.element === 'cosmos') {
                enemy.slowMultiplier = Math.min(enemy.slowMultiplier ?? 1.0, 0.6);
                enemy.slowExpiry = Math.max(enemy.slowExpiry ?? 0, gameTime + 1000);
              } else if (zone.element === 'lightning') {
                // Electrified tick
                const shockDmg = (enemy.maxHealth * 0.00025 + 0.4) * (deltaTime / 16);
                enemy.health -= shockDmg;
              }
            }
          });
        }

        // --- GRAVITATIONAL SINGULARITY PASSIVE & ACTIVE PHYSICAL PULLS ---
        blackholes.forEach(t => {
          const tdx = t.x - enemy.x;
          const tdy = t.y - enemy.y;
          const tdist = Math.sqrt(tdx * tdx + tdy * tdy);
          if (tdist <= 320 && tdist > 1.0) {
            const pullForce = Math.min(0.55 * (deltaTime / 16), tdist, 6);
            enemy.x += (tdx / tdist) * pullForce;
            enemy.y += (tdy / tdist) * pullForce;
          }
        });

        unrivaledBehemoths.forEach(t => {
          const tdx = t.x - enemy.x;
          const tdy = t.y - enemy.y;
          const tdist = Math.sqrt(tdx * tdx + tdy * tdy);
          if (tdist <= 480 && tdist > 1.0) {
            const pullForce = Math.min(1.25 * (deltaTime / 16), tdist, 10);
            enemy.x += (tdx / tdist) * pullForce;
            enemy.y += (tdy / tdist) * pullForce;
          }
        });

        activeBlackholes.forEach(effect => {
          const edx = effect.x - enemy.x;
          const edy = effect.y - enemy.y;
          const edist = Math.sqrt(edx * edx + edy * edy);
          if (edist <= 250 && edist > 1.0) {
            const pullForce = Math.min(3.20 * (deltaTime / 16), edist, 12);
            enemy.x += (edx / edist) * pullForce;
            enemy.y += (edy / edist) * pullForce;
          }
        });

        activeVortexes.forEach(effect => {
          const edx = effect.x - enemy.x;
          const edy = effect.y - enemy.y;
          const edist = Math.sqrt(edx * edx + edy * edy);
          if (edist <= effect.maxRadius && edist > 1.5) {
            // Cap maximum step displacement per frame from pull to prevent jumpy teleportation lag / clipping
            const pullForce = Math.min(6.20 * (deltaTime / 16), edist, 15);
            enemy.x += (edx / edist) * pullForce;
            enemy.y += (edy / edist) * pullForce;
          }
        });

        // Double check pull displacement limits to keep enemies perfectly within bounds of map layout and prevent shortcutting
        const curPullDist = Math.hypot(enemy.pathX - enemy.x, enemy.pathY - enemy.y);
        if (curPullDist > 220) {
          const ratio = 220 / curPullDist;
          enemy.x = enemy.pathX + (enemy.x - enemy.pathX) * ratio;
          enemy.y = enemy.pathY + (enemy.y - enemy.pathY) * ratio;
        }
        
        enemy.distanceTravelled += moveDist;
        enemy.rotation += 0.05 * (deltaTime / 16); // Spin!
        
        // --- HYPNOTIZED ALLY COMBAT SIMULATION (Capybara Trait: The Chill Hypnotize) ---
        if (enemy.isHypnotized) {
          if (enemy.hypnotizeExpiry && gameTime >= enemy.hypnotizeExpiry) {
            enemy.isHypnotized = false;
            enemy.hypnotizedByTowerId = undefined;
          } else {
            // Attack nearest unhypnotized bad animal or hunter operative in range
            const attackCooldown = 400; // Attack every 400ms
            if (!enemy.lastHypnotizeAttackTime || gameTime - enemy.lastHypnotizeAttackTime >= attackCooldown) {
              let targetBadEnemy: EnemyInstance | null = null;
              let minBadDist = 120; // 120px melee clash range
              nextEnemies.forEach(other => {
                if (other.id === enemy.id || other.isHypnotized || other.health <= 0) return;
                const dist = Math.hypot(other.x - enemy.x, other.y - enemy.y);
                if (dist < minBadDist) {
                  minBadDist = dist;
                  targetBadEnemy = other;
                }
              });

              if (targetBadEnemy) {
                // Calculate mutual combat damage: Hypnotized ally attacks enemy, and bad enemy retaliates
                const allyAtkDmg = Math.max(100, enemy.maxHealth * 0.12);
                const enemyCounterDmg = Math.max(50, (targetBadEnemy as EnemyInstance).maxHealth * 0.08);

                (targetBadEnemy as EnemyInstance).health -= allyAtkDmg;
                enemy.health -= enemyCounterDmg; // Hypnotized unit can die from bad enemies attacking!

                enemy.lastHypnotizeAttackTime = gameTime;

                // Visual clash spark
                nextSkillEffects.push({
                  id: Math.random().toString(36).substr(2, 9),
                  type: 'laser_cross',
                  x: ((targetBadEnemy as EnemyInstance).x + enemy.x) / 2,
                  y: ((targetBadEnemy as EnemyInstance).y + enemy.y) / 2,
                  radius: 12,
                  maxRadius: 24,
                  color: '#84cc16',
                  duration: 180,
                  startTime: gameTime
                });
              }
            }
          }
        }

        const expiryTime = (enemy as any).expiryTime;
        const isExpired = expiryTime && gameTime >= expiryTime;

        if (enemy.health > 0 && !isExpired) {
          updatedActiveEnemies.push(enemy);
        } else {
          // If the unit died naturally (and is not an expired decoy projection), reward bounty:
          if (!isExpired) {
            if (enemy.typeId === 'ultra_world_boss') {
              const shardsReward = 50000;
              const meatReward = 100000000;
              const dnaReward = 10000000;
              nextShardsOfGods += shardsReward;
              nextMeat += meatReward;
              nextDna += dnaReward;
              nextUltraBossSlayer = true;
              nextUltraBossKills += 1;
              
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('ultra-boss-defeated', {
                  detail: {
                    rewardShards: shardsReward,
                    rewardMeat: meatReward,
                    rewardDna: dnaReward,
                    killsCount: nextUltraBossKills
                  }
                }));
              }
            } else if (type.bounty > 0) {
              nextMeat += Math.floor(type.bounty * bountyMultiplier);
              nextDna += 2;
            }

            if (gameStateRef.current.isSkyMode) {
              nextSkyModeKills += 1;
              if (nextSkyModeKills >= 200 && !skyChasingCutsceneTriggeredRef.current) {
                skyChasingCutsceneTriggeredRef.current = true;
                setIsSkyChasingCutsceneOpen(true);
              }
            }
            if (gameStateRef.current.isAlienMode || type.isAlien) {
              nextAlienModeKills += 1;
            }

            // Boss Defeat Relic Drop Roll
            if (type.isBoss || enemy.typeId === 'ultra_world_boss' || enemy.typeId === 'hunter_commander') {
              const droppedBossRelic = checkBossRelicDrop(
                gameStateRef.current.wave,
                true,
                gameStateRef.current.unlockedRelics || [],
                gameStateRef.current.isBossRush
              );
              if (droppedBossRelic) {
                const nextUnlockedRelics = [...(gameStateRef.current.unlockedRelics || [])];
                if (!nextUnlockedRelics.includes(droppedBossRelic.id)) {
                  nextUnlockedRelics.push(droppedBossRelic.id);
                  gameStateRef.current.unlockedRelics = nextUnlockedRelics;
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('relic-obtained', {
                      detail: { relic: droppedBossRelic }
                    }));
                  }
                  nextSkillEffects.push({
                    id: Math.random().toString(36).substr(2, 9),
                    type: 'crit_text',
                    x: enemy.x,
                    y: enemy.y - 30,
                    radius: 0,
                    maxRadius: 0,
                    color: '#f59e0b',
                    duration: 2500,
                    startTime: gameTime,
                    text: `🌌 BOSS DROPPED RELIC: ${droppedBossRelic.name.toUpperCase()}!`
                  });
                }
              }
            }

            // 10% chance to drop a Game Token from defeated enemies
            if (Math.random() < 0.10) {
              nextGameTokens += 1;
              nextSkillEffects.push({
                id: Math.random().toString(36).substr(2, 9),
                type: 'crit_text',
                x: enemy.x,
                y: enemy.y,
                radius: 0,
                maxRadius: 0,
                color: '#f59e0b',
                duration: 900,
                startTime: gameTime,
                text: '+1 🎮 TOKEN'
              });
            }

            // 1% chance to drop an Arcane Shard from normal defeated enemies
            if (Math.random() < 0.01) {
              nextArcaneShards += 1;
              nextSkillEffects.push({
                id: Math.random().toString(36).substr(2, 9),
                type: 'crit_text',
                x: enemy.x,
                y: enemy.y - 18,
                radius: 0,
                maxRadius: 0,
                color: '#c084fc',
                duration: 1800,
                startTime: gameTime,
                text: '+1 🔮 ARCANE SHARD!'
              });
            }

            setGameState(gs => ({ ...gs, waveEnemiesDefeated: gs.waveEnemiesDefeated + 1 }));
            if (gameStateRef.current.isTrueHell && !gameStateRef.current.isUltraBoss) {
              nextTowers = nextTowers.map(t => {
                if (t.animalId === 'arcane_warper') {
                  const currentKills = t.warperKillsInTrueHell || 0;
                  return { ...t, warperKillsInTrueHell: currentKills + 1 };
                }
                return t;
              });
            }
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('daily-mission-event', { detail: { type: 'defeat-enemy', count: 1 } }));
            }
          }
        }
      } else {
        // Reached end of path
        if (enemy.isHypnotized) {
          // Hypnotized friendly units do not harm the base
        } else {
          let isInvincible = false;
          try {
            isInvincible = localStorage.getItem('df_dev_invincible') === 'true';
          } catch (e) {}

          if (!isInvincible) {
            if (gameStateRef.current.isSuddenDeath) {
              nextHealth = 0;
            } else {
              nextHealth = Math.max(0, nextHealth - 1);
            }
            if (nextHealth <= 0) {
              nextIsGameOver = true;
              gameAudio.playSFX('defeat');
            }
          }
        }
      }
    });
    nextEnemies = updatedActiveEnemies;

    const bufferTowers = nextTowers.filter(ot => ot.animalId === 'buffer');
    const blackholeDwarfs = nextTowers.filter(ot => ot.animalId === 'blackhole_dwarf');
    const bufferAnimal = ANIMAL_MAP.get('buffer')!;

    let nullifiers = nextEnemies.filter(e => e.typeId === 'hitech_nullifier');

    // Equipped Title Badge Perks & Relic Perks
    const activeBadge = getActiveBadge(gameStateRef.current);
    const badgePerk = activeBadge?.perk;
    const badgeDamageMult = 1 + ((badgePerk?.damageBonusPercent || 0) / 100);
    const badgeRangeMult = 1 + ((badgePerk?.rangeBonusPercent || 0) / 100);
    const badgeCritBonus = (badgePerk?.critBonusPercent || 0) / 100;
    const badgeMeatMult = 1 + ((badgePerk?.meatBonusPercent || 0) / 100);
    const badgeDnaMult = 1 + ((badgePerk?.dnaBonusPercent || 0) / 100);

    // Void Core Relic: +25% Critical Hit Chance and +50% Critical Damage
    const hasVoidCore = gameStateRef.current.equippedRelicIds?.includes('void_core');
    const totalCritChanceBonus = badgeCritBonus + (hasVoidCore ? 0.25 : 0);
    const totalCritMultBonus = hasVoidCore ? 0.50 : 0;

    // 4. Towers Attacks & Skill Triggers
    // Check if any tower is Titan Form 3 (Multiverse Watcher) granting field-wide stun immunity
    const isMultiverseWatcherActive = nextTowers.some(t => t.animalId === 'titan_defender' && t.titanForm === 'form3_multiverse');

    nextTowers.forEach(tower => {
      const animal = ANIMAL_MAP.get(tower.animalId)!;
      const traitDef = TRAITS[tower.trait || 'Normal'] || TRAITS['Normal'];
      
      // Check if this tower is Arcane / Death of World OR within range of a fully upgraded Titan OR Multiverse Watcher active
      let isImmuneToDisable = tower.animalId === 'arcane_warper' || 
                              animal?.rarity === 'Arcane' || 
                              tower.trait === 'DeathOfWorld' || 
                              tower.titanForm === 'form3_multiverse' || 
                              isMultiverseWatcherActive;

      if (!isImmuneToDisable) {
        nextTowers.forEach(other => {
          if (other.animalId === 'titan_defender') {
            const allUpgraded = other.titanCoreUpgrade && other.titanLaserCannonsUpgrade && other.titanFrontShieldUpgrade && other.titanSideShieldUpgrade;
            if (allUpgraded) {
              const tdx = tower.x - other.x;
              const tdy = tower.y - other.y;
              const dist = Math.sqrt(tdx * tdx + tdy * tdy);
              if (dist <= 1600) { // Within Titan's ultimate aura range
                isImmuneToDisable = true;
              }
            }
          }
        });
      }

      if (isImmuneToDisable) {
        tower.disabledExpiry = 0;
        tower.isDisabled = false;
      }

      // Update disabled status and countdown progress for integrity status bar
      const isCurrentlyDisabled = tower.disabledExpiry && gameTime < tower.disabledExpiry;
      tower.isDisabled = !!isCurrentlyDisabled;

      // Titan Energy: Handle charging & shooting duration limits (Form 3 Watcher has 0% energy loss & no charge needed)
      if (tower.animalId === 'titan_defender') {
        if (tower.titanForm === 'form3_multiverse') {
          tower.titanEnergy = 100;
          tower.titanIsCharging = false;
          tower.titanShootTimeElapsed = 0;
        } else {
          if (tower.titanEnergy === undefined) tower.titanEnergy = 100;
          if (tower.titanIsCharging === undefined) tower.titanIsCharging = false;
          if (tower.titanChargeStartTime === undefined) tower.titanChargeStartTime = 0;
          if (tower.titanChargeDuration === undefined) tower.titanChargeDuration = 4000;
          if (tower.titanShootTimeElapsed === undefined) tower.titanShootTimeElapsed = 0;
          if (tower.titanShootTimeLimit === undefined) tower.titanShootTimeLimit = 6000 + Math.random() * 6000;

          if (tower.ultraLaserActive && tower.ultraLaserEndTime && gameTime >= tower.ultraLaserEndTime) {
            // Active skill used/completed! Drain all energy and force recharge
            tower.ultraLaserActive = false;
            tower.titanEnergy = 0;
            tower.titanIsCharging = true;
            tower.titanChargeStartTime = gameTime;
            tower.titanChargeDuration = 3000 + Math.random() * 4000; // 3-7s recharge
            tower.titanShootTimeElapsed = 0;
          }

          if (tower.titanIsCharging) {
            if (!tower.ultraLaserActive) {
              const elapsed = gameTime - (tower.titanChargeStartTime || 0);
              const duration = tower.titanChargeDuration || 4000;
              tower.titanEnergy = Math.min(100, Math.floor((elapsed / duration) * 100));
              if (elapsed >= duration) {
                tower.titanIsCharging = false;
                tower.titanEnergy = 100;
                tower.titanShootTimeElapsed = 0;
                tower.titanShootTimeLimit = 6000 + Math.random() * 6000; // Roll new shoot limit
              }
            } else {
              // Ultra laser is active - cannot be charging, keep energy at 0
              tower.titanEnergy = 0;
            }
          } else if (nextIsWaveActive && !tower.ultraLaserActive) {
            // Shooting / Wave active consumes energy over time
            tower.titanShootTimeElapsed = (tower.titanShootTimeElapsed || 0) + deltaTime;
            const limit = tower.titanShootTimeLimit || 8000;
            tower.titanEnergy = Math.max(0, Math.floor((1 - (tower.titanShootTimeElapsed / limit)) * 100));
            if (tower.titanShootTimeElapsed >= limit) {
              tower.titanIsCharging = true;
              tower.titanEnergy = 0;
              tower.titanChargeStartTime = gameTime;
              tower.titanChargeDuration = 3000 + Math.random() * 4000; // 3 to 7 seconds charge duration
            }
          }
        }
      }

      const isCharging = tower.animalId === 'titan_defender' && !!tower.titanIsCharging;
      
      const isUltraActive = tower.animalId === 'titan_defender' && 
                            tower.ultraLaserActive && 
                            tower.ultraLaserEndTime && 
                            gameTime < tower.ultraLaserEndTime && 
                            !isCurrentlyDisabled;
      
      let integrity = 1.0;
      if (isCurrentlyDisabled) {
        const timeLeft = tower.disabledExpiry! - gameTime;
        // 3-second EMP duration default tracker
        integrity = Math.max(0, Math.min(1, (3000 - timeLeft) / 3000));
      }
      tower.integrity = integrity;

      const traitDmgMult = traitDef.damageMultiplier ?? 1.0;
      const traitRangeMult = traitDef.rangeMultiplier ?? 1.0;
      const traitFireRateMult = traitDef.fireRateMultiplier ?? 1.0;

      // Safely reset timestamp references if they are larger than the current elapsed time (from loaded saves)
      if (tower.lastFired > gameTime) {
        tower.lastFired = 0;
      }
      if (tower.lastSkillUsed && tower.lastSkillUsed > gameTime) {
        tower.lastSkillUsed = 0;
      }
      if (tower.lastActiveSkillUsed && tower.lastActiveSkillUsed > gameTime) {
        tower.lastActiveSkillUsed = 0;
      }

      const masteryDmgMult = 1 + ((tower.masteryLevel || 1) - 1) * 0.02;
      let damage = animal.damage * (1 + (tower.level - 1) * 0.2) * traitDmgMult * masteryDmgMult;

      // Apply Aircraft Damage Bonus
      if (tower.aircraftId && tower.aircraftId !== 'none') {
        const aircraft = AIRCRAFTS.find(a => a.id === tower.aircraftId);
        if (aircraft) {
          damage *= (1 + aircraft.damageBonus);
        }
      }

      if (tower.animalId === 'titan_defender') {
        if (tower.titanForm === 'form3_multiverse') {
          // 3rd Form: Multiverse Watcher (2nd Arcane Rarity) - Transcends mechanical upgrades
          damage = 500000000;
        } else {
          let titanMult = 1.0;
          if (tower.titanCoreUpgrade) titanMult += 0.5; // +50%
          if (tower.titanLaserCannonsUpgrade) titanMult += 1.0; // +100%
          if (tower.titanSideShieldUpgrade) titanMult += 0.5; // +50%
          if ((tower as any).titanGammaRayUpgrade) titanMult += 2.0; // +200% Gamma Ray damage supercharge!
          if ((tower as any).titanArmourOfDeathUpgrade) titanMult += 2.5; // +250% Armour of Death heavy firepower
          if ((tower as any).titanFourShieldsUpgrade) titanMult += 1.0; // +100% 4 Omni-Shields pulse power
          
          // Check "Unlock All" ability: All upgrades add damage and new abilities after unlocking all
          const allUpgrades = tower.titanCoreUpgrade && tower.titanLaserCannonsUpgrade && tower.titanFrontShieldUpgrade && tower.titanSideShieldUpgrade;
          if (allUpgrades) {
            titanMult += 2.0; // Extra +200% overall damage!
          }
          damage *= titanMult;
        }

        // --- TITAN RETRO ACTIVE/PASSIVE UPGRADES ENGINE (Form 1 & 2 only) ---
        if (tower.titanForm !== 'form3_multiverse') {
          // 1. Nanite Plating Repair (regenerates 1 health up to 30 max every 5 seconds)
        if ((tower as any).titanNaniteRepairUpgrade) {
          const lastRepair = (tower as any).lastNaniteRepair || 0;
          if (gameTime - lastRepair >= 5000) {
            (tower as any).lastNaniteRepair = gameTime;
            nextHealth = Math.min(30, nextHealth + 1);
          }
        }

        // 2. Seismic Stomp Shockwaves (stomps every 4 seconds dealing 10M area damage and slowing surrounding enemies by 60%)
        if ((tower as any).titanSeismicStompUpgrade && nextIsWaveActive) {
          const lastStomp = (tower as any).lastSeismicStomp || 0;
          if (gameTime - lastStomp >= 4000) {
            (tower as any).lastSeismicStomp = gameTime;
            
            // Spawn seismic shockwave visual
            nextSkillEffects.push({
              id: Math.random().toString(36).substr(2, 9),
              type: 'titan_seismic_stomp',
              x: tower.x,
              y: tower.y,
              radius: 10,
              maxRadius: 180,
              color: '#f97316',
              duration: 800,
              startTime: gameTime,
              titanSkin: (tower as any).titanSkin
            });

            // Deal 10M physical damage + 60% slow to all enemies within 180px
            const stompDmg = 10000000;
            nextEnemies = nextEnemies.map(e => {
              const dx = e.x - tower.x;
              const dy = e.y - tower.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist <= 180) {
                return {
                  ...e,
                  health: e.health - stompDmg,
                  slowMultiplier: Math.min(e.slowMultiplier ?? 1.0, 0.4), // 60% slow
                  slowExpiry: gameTime + 3000
                };
              }
              return e;
            });
          }
        }

        // 3. Plasma Disintegration Field (Automatically burns and slows nearby enemies within 150px range every tick)
        if ((tower as any).titanPlasmaFieldUpgrade && nextIsWaveActive) {
          const burnInterval = 400; // deal tick damage every 400ms
          const lastBurn = (tower as any).lastPlasmaBurn || 0;
          if (gameTime - lastBurn >= burnInterval) {
            (tower as any).lastPlasmaBurn = gameTime;
            
            // Render brief plasma tick visuals
            nextSkillEffects.push({
              id: Math.random().toString(36).substr(2, 9),
              type: 'titan_plasma_burn',
              x: tower.x,
              y: tower.y,
              radius: 10,
              maxRadius: 150,
              color: '#8b5cf6',
              duration: 400,
              startTime: gameTime,
              titanSkin: (tower as any).titanSkin
            });

            // Burn nearby enemies
            const burnDmg = 1500000; // 1.5M damage per tick
            nextEnemies = nextEnemies.map(e => {
              const dx = e.x - tower.x;
              const dy = e.y - tower.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist <= 150) {
                return {
                  ...e,
                  health: e.health - burnDmg,
                  slowMultiplier: Math.min(e.slowMultiplier ?? 1.0, 0.7), // 30% persistent slow
                  slowExpiry: gameTime + 1000
                };
              }
              return e;
            });
          }
        }

        // 4. Singularity Core (Pulls enemies toward the Titan, grouping them for easier targeting)
        if ((tower as any).titanSingularityCoreUpgrade && nextIsWaveActive) {
          nextEnemies = nextEnemies.map(e => {
            const dx = tower.x - e.x;
            const dy = tower.y - e.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 50 && dist <= 250) {
              // Pull speed scales with distance
              const pullStrength = 0.5 * (deltaTime / 16); // move 0.5px closer each frame
              return {
                ...e,
                x: e.x + (dx / dist) * pullStrength,
                y: e.y + (dy / dist) * pullStrength
              };
            }
            return e;
          });
        }

        // 5. Triple TV Screen Broadcasting CRT Array (Flashes hypnotic glitch wave that slows all enemies on screen by 90% and inflicts +50% damage vulnerability)
        if ((tower as any).titanTVArrayUpgrade && nextIsWaveActive) {
          const tvBroadcastInterval = 5000; // sweep screen every 5 seconds
          const lastTv = (tower as any).lastTvBroadcast || 0;
          if (gameTime - lastTv >= tvBroadcastInterval) {
            (tower as any).lastTvBroadcast = gameTime;

            // Spawn giant scan line effect radiating from center of map or tower
            nextSkillEffects.push({
              id: Math.random().toString(36).substr(2, 9),
              type: 'titan_glitch_broadcast',
              x: tower.x,
              y: tower.y,
              radius: 10,
              maxRadius: 800, // covers almost the entire screen!
              color: '#22c55e',
              duration: 1200,
              startTime: gameTime
            });

            // Inflict 90% slow and vulnerability on all enemies
            nextEnemies = nextEnemies.map(e => {
              return {
                ...e,
                slowMultiplier: Math.min(e.slowMultiplier ?? 1.0, 0.1), // 90% super slow!
                slowExpiry: gameTime + 4000,
                // Add custom vulnerability multiplier
                vulnerabilityMult: 1.5 // 1.5x damage taken
              };
            });
          }
        }

        // 6. Dual Hydraulic Mecha Hands (2nd Range Kinetic Smash & Punches)
        if (nextIsWaveActive) {
          const isUpgraded = Boolean((tower as any).titanMechaHandsUpgrade);
          const mechaHandsRange = isUpgraded ? 750 : 600;
          const punchCooldown = isUpgraded ? 350 : 600;
          const lastPunch = (tower as any).lastTitanMechaPunch || 0;

          // Clear expired punch animations
          let leftPunch = (tower as any).titanLeftHandPunch;
          let rightPunch = (tower as any).titanRightHandPunch;
          if (leftPunch && gameTime - leftPunch.startTime > leftPunch.duration) {
            leftPunch = undefined;
          }
          if (rightPunch && gameTime - rightPunch.startTime > rightPunch.duration) {
            rightPunch = undefined;
          }

          if (gameTime - lastPunch >= punchCooldown) {
            // Find enemies in 2nd Range (600px default / 750px upgraded)
            const enemiesInRange = nextEnemies.filter(e => {
              const dx = e.x - tower.x;
              const dy = e.y - tower.y;
              return Math.sqrt(dx * dx + dy * dy) <= mechaHandsRange;
            });

            if (enemiesInRange.length > 0) {
              const punchHand = (tower as any).titanNextPunchHand || 'left';
              (tower as any).lastTitanMechaPunch = gameTime;
              (tower as any).titanNextPunchHand = punchHand === 'left' ? 'right' : 'left';

              const punchDuration = isUpgraded ? 280 : 360;
              const punchDmg = (animal.damage * (1 + (tower.level - 1) * 0.2)) * (isUpgraded ? 3.5 : 1.2);

              // Target selection: left hand strikes enemies on left/top flank, right hand on right/bottom flank
              const leftCandidates = enemiesInRange.filter(e => e.x <= tower.x);
              const rightCandidates = enemiesInRange.filter(e => e.x > tower.x);
              const targetLeft = leftCandidates.length > 0 ? leftCandidates[0] : enemiesInRange[0];
              const targetRight = rightCandidates.length > 0 ? rightCandidates[0] : enemiesInRange[enemiesInRange.length - 1];

              const slamColor = (tower as any).titanSkin === 'the_true_defender' ? '#34d399' :
                                (tower as any).titanSkin === 'upgraded_titan_tv_man' ? '#a855f7' :
                                (tower as any).titanSkin === 'upgraded_titan_speakerman' ? '#ef4444' :
                                (tower as any).titanSkin === 'titan_clockman' ? '#eab308' :
                                (tower as any).titanSkin === 'titan_drillman' ? '#f97316' : '#00f0ff';

              if (punchHand === 'left' || isUpgraded) {
                leftPunch = {
                  active: true,
                  startX: tower.x - 32,
                  startY: tower.y - 4,
                  targetX: targetLeft.x,
                  targetY: targetLeft.y,
                  startTime: gameTime,
                  duration: punchDuration
                };

                // Deal real kinetic damage to primary target + area splash
                const splashRadius = isUpgraded ? 140 : 90;
                nextEnemies = nextEnemies.map(e => {
                  const dist = Math.hypot(e.x - targetLeft.x, e.y - targetLeft.y);
                  if (dist <= splashRadius) {
                    const dmg = e.id === targetLeft.id ? punchDmg : punchDmg * 0.65;
                    return {
                      ...e,
                      health: e.health - dmg,
                      slowMultiplier: Math.min(e.slowMultiplier ?? 1.0, isUpgraded ? 0.3 : 0.5),
                      slowExpiry: gameTime + 2200
                    };
                  }
                  return e;
                });

                // Spawn kinetic slam shockwave VFX
                nextSkillEffects.push({
                  id: Math.random().toString(36).substr(2, 9),
                  type: 'titan_mecha_slam',
                  x: targetLeft.x,
                  y: targetLeft.y,
                  radius: 12,
                  maxRadius: splashRadius,
                  color: slamColor,
                  duration: 400,
                  startTime: gameTime,
                  isUpgraded: isUpgraded
                });
              }

              if (punchHand === 'right' || isUpgraded) {
                rightPunch = {
                  active: true,
                  startX: tower.x + 32,
                  startY: tower.y - 4,
                  targetX: targetRight.x,
                  targetY: targetRight.y,
                  startTime: gameTime,
                  duration: punchDuration
                };

                if (punchHand === 'right' && !isUpgraded) {
                  const splashRadius = 90;
                  nextEnemies = nextEnemies.map(e => {
                    const dist = Math.hypot(e.x - targetRight.x, e.y - targetRight.y);
                    if (dist <= splashRadius) {
                      const dmg = e.id === targetRight.id ? punchDmg : punchDmg * 0.65;
                      return {
                        ...e,
                        health: e.health - dmg,
                        slowMultiplier: Math.min(e.slowMultiplier ?? 1.0, 0.5),
                        slowExpiry: gameTime + 2200
                      };
                    }
                    return e;
                  });

                  nextSkillEffects.push({
                    id: Math.random().toString(36).substr(2, 9),
                    type: 'titan_mecha_slam',
                    x: targetRight.x,
                    y: targetRight.y,
                    radius: 12,
                    maxRadius: splashRadius,
                    color: slamColor,
                    duration: 400,
                    startTime: gameTime,
                    isUpgraded: isUpgraded
                  });
                }
              }
            }
          }

          (tower as any).titanLeftHandPunch = leftPunch;
          (tower as any).titanRightHandPunch = rightPunch;
        }
      }
      }
      if (tower.isPinnacle) {
        damage *= 10; // Pinnacle units receive a massive 10x damage multiplier!
      }
      if (gameStateRef.current.isHardcore) {
        damage = damage / 5;
      }
      if (gameStateRef.current.isBossRush && !gameStateRef.current.isUltraBoss) {
        damage = damage * 0.1; // Towers suffer 90% damage reduction (deal 10% damage)
      }
      if (gameStateRef.current.isTrueHell && !gameStateRef.current.isUltraBoss) {
        damage = damage * 0.01; // -99% dmg (deal 1% damage)
      }
      if (gameStateRef.current.isSuddenDeath) {
        damage *= 3.0; // 3x (Glass Cannon) damage multiplier
      }

      // nebula overcharge buffer boost:
      let bufferDmgMultiplier = 1.0;
      bufferTowers.forEach(otherTower => {
        if (otherTower.id !== tower.id) {
          const dx = otherTower.x - tower.x;
          const dy = otherTower.y - tower.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          const isOtherDisabled = otherTower.disabledExpiry && gameTime < otherTower.disabledExpiry;
          const bufferRange = bufferAnimal.range * (1 + (otherTower.level - 1) * 0.1);
          if (dist <= bufferRange && !isOtherDisabled) {
            bufferDmgMultiplier += 1.5 * (1 + (otherTower.level - 1) * 0.05);
          }
        }
      });
      damage *= bufferDmgMultiplier;
      damage *= badgeDamageMult;

      // Primal Hearthstone Relic: +30% Global Tower Damage
      if (gameStateRef.current.equippedRelicIds?.includes('primal_hearthstone')) {
        damage *= 1.30;
      }

      // Dimension tower buffs
      if (gameStateRef.current.currentStage === 'dimension_abyss') {
        damage *= 1.25; // Abyssal Void Overcharge: +25% raw damage
      }

      // Elemental Hazard Overcharge / Resonance / Dampened Modifier
      const hazardAffinity = getTowerHazardAffinity(tower, elementalHazardsRef.current);
      if (hazardAffinity) {
        damage *= hazardAffinity.damageMult;
      }

      let range = animal.range * (1 + (tower.level - 1) * 0.1) * traitRangeMult * badgeRangeMult;

      // Apply Aircraft Range Bonus
      if (tower.aircraftId && tower.aircraftId !== 'none') {
        const aircraft = AIRCRAFTS.find(a => a.id === tower.aircraftId);
        if (aircraft) {
          range *= (1 + aircraft.rangeBonus);
        }
      }

      // Determine flight status dynamically
      const isWarper = tower.animalId === 'arcane_warper';
      if (isWarper) {
        tower.isFlying = true;
      } else if (tower.aircraftId && tower.aircraftId !== 'none') {
        tower.isFlying = true;
      } else {
        tower.isFlying = false;
      }

      if (hazardAffinity) {
        range *= hazardAffinity.rangeMult;
      }
      if (tower.isPinnacle) {
        range *= 1.5; // Pinnacle units receive a +50% range boost!
      }
      if (gameStateRef.current.currentStage === 'dimension_cosmic') {
        range *= 1.2; // Celestial Resonance: +20% range boost!
      }

      // Quantum Magnet Relic: +40% Global Tower Attack Range
      if (gameStateRef.current.equippedRelicIds?.includes('quantum_magnet')) {
        range *= 1.40;
      }
      
      // Arid Savanna Dust Storm range reduction
      if (gameStateRef.current.currentStage === 'savanna' && (gameTime % 20000) < 5000 && nextIsWaveActive) {
        range *= 0.65;
      }

      // --- ALIEN TECH EVOLUTION TIER BUFFS & LASER TRACKING ---
      if (tower.isAlienTech) {
        const aTier = tower.alienTechTier || 1;
        range *= (1 + 0.30 * aTier);
        damage *= (1 + 0.35 * aTier);

        // Regenerate holographic shield
        const maxShield = aTier * 1200;
        if ((tower.alienTechShieldHp || 0) < maxShield) {
          tower.alienTechShieldHp = Math.min(maxShield, (tower.alienTechShieldHp || 0) + (15 * aTier * (deltaTime / 16)));
        }

        // Alien Tech Laser-Tracking lock-on search
        let bestTarget: EnemyInstance | null = null;
        let minD = range;
        nextEnemies.forEach(e => {
          const dx = e.x - tower.x;
          const dy = e.y - tower.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d <= range && d < minD) {
            minD = d;
            bestTarget = e;
          }
        });

        if (bestTarget) {
          tower.laserTargetEnemyId = (bestTarget as EnemyInstance).id;
          tower.rotation = Math.atan2((bestTarget as EnemyInstance).y - tower.y, (bestTarget as EnemyInstance).x - tower.x);
          
          // Continuous high-precision laser-tracking burn damage
          const laserDps = (damage * 0.20 * aTier) * (deltaTime / 1000);
          (bestTarget as EnemyInstance).health -= laserDps;
          recordDamageDealt(tower.id, Math.min((bestTarget as EnemyInstance).health, laserDps));
        } else {
          tower.laserTargetEnemyId = undefined;
        }
      }
      
      tower.rotation += 0.02 * (deltaTime / 16); 

      if (isUltraActive && (!gameStateRef.current.isSkyMode || tower.isFlying)) {
        // Find closest enemy to aim/rotate towards
        let closest: EnemyInstance | null = null;
        let cDist = 9999;
        nextEnemies.forEach(e => {
          const dx = e.x - tower.x;
          const dy = e.y - tower.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < cDist) {
            cDist = d;
            closest = e;
          }
        });

        const targetAngle = closest ? Math.atan2(closest.y - tower.y, closest.x - tower.x) : tower.rotation;
        tower.rotation = targetAngle; // Rotate towards the target

        // Spawn visual continuous Ultra Laser effect for the current frame
        const isUpgradedTV = (tower as any).titanSkin === 'upgraded_titan_tv_man';
        nextSkillEffects.push({
          id: Math.random().toString(36).substr(2, 9),
          type: 'titan_ultra_laser' as any,
          x: tower.x,
          y: tower.y,
          radius: 0,
          maxRadius: 1600,
          color: isUpgradedTV ? '#e11d48' : '#38bdf8',
          duration: 100, // short duration so it gets redrawn nicely every frame
          startTime: gameTime,
          angle: targetAngle
        });

        // Calculate unbuffed & un-nerfed active skill damage (mode changes do NOT apply, no pinnacle/sudden death buffs)
        const masteryDmgMult = 1 + ((tower.masteryLevel || 1) - 1) * 0.02;
        const titanSkillDmg = animal.damage * (1 + (tower.level - 1) * 0.2) * traitDmgMult * 2.5 * masteryDmgMult;
        const tickDmg = titanSkillDmg * 150.0 * (deltaTime / 30000); // 150x scaling factor, divided over 30s duration

        // Record damage dealt and subtract health
        let totalDamageDealt = 0;
        nextEnemies = nextEnemies.map(e => {
          const applied = Math.max(0, Math.min(e.health, tickDmg));
          totalDamageDealt += applied;
          return {
            ...e,
            health: e.health - tickDmg,
            slowMultiplier: 0.1,
            slowExpiry: gameTime + 2000
          };
        }).filter(e => e.health > 0);

        if (totalDamageDealt > 0) {
          recordDamageDealt(tower.id, totalDamageDealt);
        }
      }

      // Mythic, Secret, Celestial, ???, Original, Overseer, and Unrivaled Skill Triggers (Requires flight in Sky Mode)
      if ((animal.rarity === 'Mythic' || animal.rarity === 'Secret' || animal.rarity === 'Celestial' || animal.rarity === '???' || animal.rarity === 'Original' || animal.rarity === 'Overseer' || animal.rarity === 'Unrivaled') && !isUltraActive && !isCharging && (!gameStateRef.current.isSkyMode || tower.isFlying)) {
        const lastUsed = tower.lastSkillUsed || 0;
        let cooldown = 5000;
        if (animal.id === 'phoenix') cooldown = 4500;
        if (animal.id === 'dragon') cooldown = 6000;
        if (animal.id === 'mecha_rex') cooldown = 3500;
        if (animal.id === 'cthulhu') cooldown = 4000;
        if (animal.id === 'kaiju') cooldown = 5000;
        if (animal.id === 'celestial_pegasus') cooldown = 3000;
        if (animal.id === 'celestial_kitsune') cooldown = 4500;

        // Custom new species cooldowns
        if (animal.id === 'celestial_leviathan') cooldown = 1000; // 1s speed of light cosmic execution!
        if (animal.id === 'secret_stardust') cooldown = 4000;
        if (animal.id === 'secret_nebula_kraken') cooldown = 4300;
        if (animal.id === 'secret_quantum_glitch') cooldown = 3600;
        if (animal.id === 'secret_cyber_viper') cooldown = 3800;
        if (animal.id === 'secret_solar_lion') cooldown = 4000;
        if (animal.id === 'celestial_seraph') cooldown = 3800;
        if (animal.id === 'celestial_behemoth') cooldown = 4200;
        if (animal.id === 'mystery_anomaly') cooldown = 2000;
        if (animal.id === 'mystery_singularity') cooldown = 1800;
        if (animal.id === 'mystery_nullifier') cooldown = 2200;
        if (animal.id === 'mystery_eclipse') cooldown = 2500;
        if (animal.id === 'mystery_entropy') cooldown = 2000;
        if (animal.id === 'mystery_supervoid') cooldown = 1500;
        if (animal.id === 'mystery_continuum') cooldown = 1900;
        if (animal.id === 'mystery_darkstar') cooldown = 1600;
        if (animal.id === 'original_genesis') cooldown = 1200;
        if (animal.id === 'original_abyss') cooldown = 1000;
        if (animal.id === 'blackhole_dwarf') cooldown = 20000; // Debuffed to 20 seconds!
        if (animal.id === 'original_ragnarok') cooldown = 2000;
        if (animal.id === 'original_omega') cooldown = 1500;
        if (animal.id === 'all_seeing_overseer') cooldown = 10000; // 10s cooldown
        if (animal.id === 'unrivaled_solar_phoenix') cooldown = 3000; // 3s cooldown
        if (animal.id === 'unrivaled_void_behemoth') cooldown = 2500; // 2.5s cooldown
        if (animal.id === 'unrivaled_frost_dragon') cooldown = 2800;
        if (animal.id === 'unrivaled_storm_wyvern') cooldown = 2600;

        if (traitDef.cooldownReduction) {
          cooldown *= (1 - traitDef.cooldownReduction);
        }

        if (gameStateRef.current.isTrueHell && !gameStateRef.current.isUltraBoss) {
          cooldown *= 10; // 10x longer cooldown (slower skills)
        }

        // Chrono Hourglass Relic: -30% Global Active Skill Cooldown
        if (gameStateRef.current.equippedRelicIds?.includes('chrono_hourglass')) {
          cooldown *= 0.70;
        }

        if (time - lastUsed > cooldown && nextIsWaveActive && !isCurrentlyDisabled) {
          const healthBeforeSkill = new Map<string, number>(nextEnemies.map(e => [e.id, e.health]));
          tower.lastSkillUsed = time;
          const skillDmg = damage * 2.5; // Skills deal 2.5x base damage!

          if (animal.id === 'trex') {
            nextSkillEffects.push({
              id: Math.random().toString(36).substr(2, 9),
              type: 'shockwave',
              x: tower.x,
              y: tower.y,
              radius: 0,
              maxRadius: range,
              color: animal.color,
              duration: 600,
              startTime: time
            });
            nextEnemies = nextEnemies.map(e => {
              const dx = e.x - tower.x;
              const dy = e.y - tower.y;
              const d = Math.sqrt(dx * dx + dy * dy);
              if (d <= range) {
                return {
                  ...e,
                  health: e.health - skillDmg,
                  slowMultiplier: 0.3,
                  slowExpiry: time + 3000
                };
              }
              return e;
            });
          }
          else if (animal.id === 'phoenix') {
            nextSkillEffects.push({
              id: Math.random().toString(36).substr(2, 9),
              type: 'firering',
              x: tower.x,
              y: tower.y,
              radius: 0,
              maxRadius: range * 1.2,
              color: animal.color,
              duration: 800,
              startTime: time
            });
            nextEnemies = nextEnemies.map(e => {
              const dx = e.x - tower.x;
              const dy = e.y - tower.y;
              const d = Math.sqrt(dx * dx + dy * dy);
              if (d <= range * 1.2) {
                return {
                  ...e,
                  health: e.health - skillDmg,
                  slowMultiplier: 0.5,
                  slowExpiry: time + 3000
                };
              }
              return e;
            });
          }
          else if (animal.id === 'dragon') {
            // Draconic Inferno - meteor showers (synchronous to avoid state de-sync and lag)
            const targetEnemies = [...nextEnemies].sort(() => 0.5 - Math.random()).slice(0, 3);
            targetEnemies.forEach((te, index) => {
              nextSkillEffects.push({
                id: Math.random().toString(36).substr(2, 9),
                type: 'meteor',
                x: te.x,
                y: te.y,
                radius: 0,
                maxRadius: 100,
                color: '#ef4444',
                duration: 650,
                startTime: time + index * 150
              });

              nextEnemies = nextEnemies.map(e => {
                const dx = e.x - te.x;
                const dy = e.y - te.y;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d <= 100) {
                  return { ...e, health: e.health - skillDmg };
                }
                return e;
              });
            });
          }
          else if (animal.id === 'mecha_rex') {
            nextSkillEffects.push({
              id: Math.random().toString(36).substr(2, 9),
              type: 'laser_cross',
              x: tower.x,
              y: tower.y,
              radius: 0,
              maxRadius: 600,
              color: '#06b6d4',
              duration: 500,
              startTime: time
            });
            nextEnemies = nextEnemies.map(e => {
              const onXAxis = Math.abs(e.y - tower.y) < 30 && Math.abs(e.x - tower.x) < 600;
              const onYAxis = Math.abs(e.x - tower.x) < 30 && Math.abs(e.y - tower.y) < 600;
              if (onXAxis || onYAxis) {
                return { ...e, health: e.health - skillDmg };
              }
              return e;
            });
          }
          else if (animal.id === 'cthulhu') {
            let closest: EnemyInstance | null = null;
            let cDist = 9999;
            nextEnemies.forEach(e => {
              const dx = e.x - tower.x;
              const dy = e.y - tower.y;
              const d = Math.sqrt(dx * dx + dy * dy);
              if (d < cDist) {
                cDist = d;
                closest = e;
              }
            });
            
            if (closest) {
              const centerEnemy = closest as EnemyInstance;
              nextSkillEffects.push({
                id: Math.random().toString(36).substr(2, 9),
                type: 'vortex',
                x: centerEnemy.x,
                y: centerEnemy.y,
                radius: 0,
                maxRadius: 160,
                color: '#10b981',
                duration: 900,
                startTime: time
              });
              nextEnemies = nextEnemies.map(e => {
                const dx = e.x - centerEnemy.x;
                const dy = e.y - centerEnemy.y;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d <= 160) {
                  const pullFactor = 0.55;
                  const newX = e.x + (centerEnemy.x - e.x) * pullFactor;
                  const newY = e.y + (centerEnemy.y - e.y) * pullFactor;
                  return {
                    ...e,
                    x: newX,
                    y: newY,
                    health: e.health - skillDmg,
                    slowMultiplier: 0.15,
                    slowExpiry: time + 2500
                  };
                }
                return e;
              });
            }
          }
          else if (animal.id === 'kaiju') {
            nextSkillEffects.push({
              id: Math.random().toString(36).substr(2, 9),
              type: 'nuclear',
              x: tower.x,
              y: tower.y,
              radius: 0,
              maxRadius: range * 1.3,
              color: '#a855f7',
              duration: 900,
              startTime: time
            });
            nextEnemies = nextEnemies.map(e => {
              const dx = e.x - tower.x;
              const dy = e.y - tower.y;
              const d = Math.sqrt(dx * dx + dy * dy);
              if (d <= range * 1.3) {
                return {
                  ...e,
                  health: e.health - skillDmg * 1.6,
                  slowMultiplier: 0.35,
                  slowExpiry: time + 3500
                };
              }
              return e;
            });
          }
          else if (animal.id === 'celestial_pegasus') {
            nextSkillEffects.push({
              id: Math.random().toString(36).substr(2, 9),
              type: 'supernova',
              x: tower.x,
              y: tower.y,
              radius: 0,
              maxRadius: range,
              color: '#38bdf8',
              duration: 1000,
              startTime: time
            });
            nextEnemies = nextEnemies.map(e => {
              const dx = e.x - tower.x;
              const dy = e.y - tower.y;
              const d = Math.sqrt(dx * dx + dy * dy);
              if (d <= range) {
                const pullFactor = 0.65;
                const newX = e.x + (tower.x - e.x) * pullFactor;
                const newY = e.y + (tower.y - e.y) * pullFactor;
                return {
                  ...e,
                  x: newX,
                  y: newY,
                  health: e.health - skillDmg * 1.8,
                  slowMultiplier: 0.05,
                  slowExpiry: time + 4000
                };
              }
              return e;
            });
          }
          else if (animal.id === 'celestial_kitsune') {
            nextSkillEffects.push({
              id: Math.random().toString(36).substr(2, 9),
              type: 'foxfire',
              x: tower.x,
              y: tower.y,
              radius: 0,
              maxRadius: range,
              color: '#f43f5e',
              duration: 1100,
              startTime: time
            });
            nextEnemies = nextEnemies.map(e => {
              const dx = e.x - tower.x;
              const dy = e.y - tower.y;
              const d = Math.sqrt(dx * dx + dy * dy);
              if (d <= range) {
                return {
                  ...e,
                  health: e.health - skillDmg * 2.8,
                  slowMultiplier: 0.2,
                  slowExpiry: time + 3000
                };
              }
              return e;
            });
          }
          else if (animal.id === 'celestial_leviathan') {
            nextSkillEffects.push({
              id: Math.random().toString(36).substr(2, 9),
              type: 'vortex',
              x: tower.x,
              y: tower.y,
              radius: 0,
              maxRadius: 9999, // Pulled dynamically from anywhere on the grid!
              color: '#a855f7',
              duration: 1500, // Epic 1.5s spatial cosmic storm!
              startTime: time
            });
            nextEnemies = nextEnemies.map(e => {
              return {
                ...e,
                health: e.health - skillDmg * 3.5, // Devastating dark-matter damage!
                slowMultiplier: 0.1,
                slowExpiry: time + 5000
              };
            });
          }
          else if (animal.id === 'celestial_chronos') {
            nextSkillEffects.push({
              id: Math.random().toString(36).substr(2, 9),
              type: 'supernova',
              x: tower.x,
              y: tower.y,
              radius: 0,
              maxRadius: range * 1.5,
              color: '#fb7185',
              duration: 1500,
              startTime: time
            });
            nextEnemies = nextEnemies.map(e => {
              const dx = e.x - tower.x;
              const dy = e.y - tower.y;
              const d = Math.sqrt(dx * dx + dy * dy);
              if (d <= range * 1.5) {
                return {
                  ...e,
                  health: e.health - skillDmg * 5.0,
                  slowMultiplier: 0.0, // Frozen solid (0% speed) in time-stop
                  slowExpiry: time + 2500 // 2.5 seconds stasis
                };
              }
              return e;
            });
          }
          else if (animal.id === 'secret_stardust') {
            nextSkillEffects.push({
              id: Math.random().toString(36).substr(2, 9),
              type: 'firering',
              x: tower.x,
              y: tower.y,
              radius: 0,
              maxRadius: range,
              color: '#f472b6',
              duration: 800,
              startTime: time
            });
            nextEnemies = nextEnemies.map(e => {
              const dx = e.x - tower.x;
              const dy = e.y - tower.y;
              if (Math.sqrt(dx * dx + dy * dy) <= range) {
                return { ...e, health: e.health - skillDmg * 1.5 };
              }
              return e;
            });
          }
          else if (animal.id === 'secret_nebula_kraken') {
            nextSkillEffects.push({
              id: Math.random().toString(36).substr(2, 9),
              type: 'vortex',
              x: tower.x,
              y: tower.y,
              radius: 0,
              maxRadius: range,
              color: '#2dd4bf',
              duration: 1000,
              startTime: time
            });
            nextEnemies = nextEnemies.map(e => {
              const dx = e.x - tower.x;
              const dy = e.y - tower.y;
              if (Math.sqrt(dx * dx + dy * dy) <= range) {
                return { ...e, health: e.health - skillDmg * 2.0, slowMultiplier: 0.4, slowExpiry: time + 3000 };
              }
              return e;
            });
          }
          else if (animal.id === 'secret_quantum_glitch') {
            nextSkillEffects.push({
              id: Math.random().toString(36).substr(2, 9),
              type: 'glitch',
              x: tower.x,
              y: tower.y,
              radius: 100,
              maxRadius: range,
              color: '#a855f7',
              duration: 600,
              startTime: time
            });
            nextEnemies = nextEnemies.map(e => {
              const dx = e.x - tower.x;
              const dy = e.y - tower.y;
              if (Math.sqrt(dx * dx + dy * dy) <= range) {
                return { ...e, health: e.health - skillDmg * 2.5 };
              }
              return e;
            });
          }
          else if (animal.id === 'mystery_anomaly' || animal.id === 'mystery_singularity' || animal.id === 'mystery_nullifier' || animal.id === 'mystery_eclipse' || animal.id === 'mystery_entropy' || animal.id === 'mystery_supervoid') {
            const typesMap: Record<string, string> = {
              mystery_anomaly: 'laser_cross',
              mystery_singularity: 'vortex',
              mystery_nullifier: 'glitch',
              mystery_eclipse: 'firering',
              mystery_entropy: 'nuclear',
              mystery_supervoid: 'supernova'
            };
            const effType = typesMap[animal.id] || 'laser_cross';
            nextSkillEffects.push({
              id: Math.random().toString(36).substr(2, 9),
              type: effType as any,
              x: tower.x,
              y: tower.y,
              radius: 0,
              maxRadius: range * 1.5,
              color: animal.color,
              duration: 1200,
              startTime: time
            });
            const mysteryMult = animal.id === 'mystery_supervoid' ? 12.0 : 8.0;
            nextEnemies = nextEnemies.map(e => {
              const dx = e.x - tower.x;
              const dy = e.y - tower.y;
              if (Math.sqrt(dx * dx + dy * dy) <= range * 1.5) {
                return {
                  ...e,
                  health: e.health - skillDmg * mysteryMult,
                  slowMultiplier: 0.1,
                  slowExpiry: time + 3000
                };
              }
              return e;
            });
          }
          else if (animal.id === 'original_genesis') {
            nextSkillEffects.push({
              id: Math.random().toString(36).substr(2, 9),
              type: 'cosmic_genesis',
              x: tower.x,
              y: tower.y,
              radius: 0,
              maxRadius: range * 1.8,
              color: animal.color,
              duration: 1500,
              startTime: time
            });
            nextEnemies = nextEnemies.map(e => {
              const dx = e.x - tower.x;
              const dy = e.y - tower.y;
              if (Math.sqrt(dx * dx + dy * dy) <= range * 1.8) {
                return { ...e, health: e.health - skillDmg * 52.0 };
              }
              return e;
            });
          }
          else if (animal.id === 'original_abyss') {
            nextSkillEffects.push({
              id: Math.random().toString(36).substr(2, 9),
              type: 'abyssal_obliteration',
              x: tower.x,
              y: tower.y,
              radius: 0,
              maxRadius: range * 1.9,
              color: animal.color,
              duration: 1500,
              startTime: time
            });
            nextEnemies = nextEnemies.map(e => {
              const dx = e.x - tower.x;
              const dy = e.y - tower.y;
              if (Math.sqrt(dx * dx + dy * dy) <= range * 1.9) {
                return { ...e, health: e.health - skillDmg * 75.0 };
              }
              return e;
            });
          }
          else if (animal.id === 'original_ragnarok') {
            nextSkillEffects.push({
              id: Math.random().toString(36).substr(2, 9),
              type: 'ragnarok_supernova',
              x: tower.x,
              y: tower.y,
              radius: 0,
              maxRadius: range * 2.0,
              color: animal.color,
              duration: 1800,
              startTime: time
            });
            nextEnemies = nextEnemies.map(e => {
              const dx = e.x - tower.x;
              const dy = e.y - tower.y;
              if (Math.sqrt(dx * dx + dy * dy) <= range * 2.0) {
                return { ...e, health: e.health - skillDmg * 88.0 };
              }
              return e;
            });
          }
          else if (animal.id === 'original_omega') {
            nextSkillEffects.push({
              id: Math.random().toString(36).substr(2, 9),
              type: 'omega_extermination',
              x: tower.x,
              y: tower.y,
              radius: 0,
              maxRadius: range * 2.2,
              color: animal.color,
              duration: 1600,
              startTime: time
            });
            nextEnemies = nextEnemies.map(e => {
              const dx = e.x - tower.x;
              const dy = e.y - tower.y;
              if (Math.sqrt(dx * dx + dy * dy) <= range * 2.2) {
                return { ...e, health: e.health - skillDmg * 105.0 };
              }
              return e;
            });
          }
          else if (animal.id === 'all_seeing_overseer') {
            const firstOverseer = nextTowers.find(t => t.animalId === 'all_seeing_overseer');
            if (firstOverseer && firstOverseer.id !== tower.id) {
              return;
            }

            // Dedup visual effects to prevent stacking & keep render frames ultra smooth
            nextSkillEffects = nextSkillEffects.filter(eff => 
              !(eff.type === 'cosmic_rupture' && Math.sqrt((eff.x - tower.x) ** 2 + (eff.y - tower.y) ** 2) < 50)
            );

            nextSkillEffects.push({
              id: Math.random().toString(36).substr(2, 9),
              type: 'cosmic_rupture' as any,
              x: tower.x,
              y: tower.y,
              radius: 0,
              maxRadius: 1500,
              color: '#00ffcc',
              duration: 1500,
              startTime: time
            });
            nextEnemies = nextEnemies.map(e => {
              // Freeze in realm stasis & inflict massive global domain expansion damage!
              return {
                ...e,
                health: e.health - skillDmg * 100,
                slowMultiplier: 0.01,
                slowExpiry: time + 10000
              };
            });
          }
          else if (animal.id === 'titan_defender') {
            const isForm3 = tower.titanForm === 'form3_multiverse';
            const isForm2 = tower.titanForm === 'form2_merged';

            let closest: EnemyInstance | null = null;
            let cDist = 9999;
            nextEnemies.forEach(e => {
              const dx = e.x - tower.x;
              const dy = e.y - tower.y;
              const d = Math.sqrt(dx * dx + dy * dy);
              if (d < cDist) {
                cDist = d;
                closest = e;
              }
            });

            const targetAngle = closest ? Math.atan2(closest.y - tower.y, closest.x - tower.x) : tower.rotation;
            const isUpgradedTV = (tower as any).titanSkin === 'upgraded_titan_tv_man';
            const laserColor = isUpgradedTV ? '#a855f7' : '#38bdf8';

            if (isForm3) {
              // 3RD FORM: MULTIVERSE WATCHER - SIMULTANEOUS COSMIC SINGULARITY BEAMS TO EVERY SINGLE ENEMY!
              const targetableEnemies = nextEnemies.filter(e => !e.isHypnotized);
              if (targetableEnemies.length > 0) {
                targetableEnemies.forEach((e, idx) => {
                  const beamAngle = Math.atan2(e.y - tower.y, e.x - tower.x);
                  nextSkillEffects.push({
                    id: Math.random().toString(36).substr(2, 9),
                    type: 'titan_multiverse_blast' as any,
                    x: tower.x,
                    y: tower.y,
                    radius: 0,
                    maxRadius: 2200,
                    color: '#c084fc',
                    duration: 380,
                    startTime: time,
                    angle: beamAngle,
                    targetX: e.x,
                    targetY: e.y,
                    shakeGrid: idx === 0
                  } as any);

                  nextSkillEffects.push({
                    id: Math.random().toString(36).substr(2, 9),
                    type: 'laser_cross',
                    x: e.x,
                    y: e.y,
                    radius: 0,
                    maxRadius: 35,
                    color: '#ec4899',
                    duration: 300,
                    startTime: time
                  });
                });
              } else {
                nextSkillEffects.push({
                  id: Math.random().toString(36).substr(2, 9),
                  type: 'titan_multiverse_blast' as any,
                  x: tower.x,
                  y: tower.y,
                  radius: 0,
                  maxRadius: 2200,
                  color: '#c084fc',
                  duration: 350,
                  startTime: time,
                  angle: targetAngle,
                  targetX: tower.x + 1200 * Math.cos(targetAngle),
                  targetY: tower.y + 1200 * Math.sin(targetAngle),
                  shakeGrid: true
                } as any);
              }

              nextEnemies = nextEnemies.map(e => {
                if (e.isHypnotized) return e;
                return {
                  ...e,
                  health: e.health - 2500000000, // 2.5 Billion Singularity Blast Damage to ALL enemies
                  slowMultiplier: 0.05,
                  slowExpiry: time + 3500
                };
              });
            } else if (isForm2) {
              // 2ND FORM: GREAT DEFENDER (MERGED GIANT LASER)
              nextSkillEffects.push({
                id: Math.random().toString(36).substr(2, 9),
                type: 'titan_merged_laser' as any,
                x: tower.x,
                y: tower.y,
                radius: 0,
                maxRadius: 1400,
                color: laserColor,
                duration: 250,
                startTime: time,
                angle: targetAngle,
                targetX: closest ? closest.x : tower.x + 1000 * Math.cos(targetAngle),
                targetY: closest ? closest.y : tower.y + 1000 * Math.sin(targetAngle),
                titanLaserCannonsUpgrade: tower.titanLaserCannonsUpgrade
              } as any);

              nextEnemies = nextEnemies.map(e => {
                const dx = e.x - tower.x;
                const dy = e.y - tower.y;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d <= range * 1.2) {
                  return {
                    ...e,
                    health: e.health - skillDmg * 15.0,
                    slowMultiplier: 0.25,
                    slowExpiry: time + 1500
                  };
                }
                return e;
              });
            } else {
              // FORM 1: DUAL SIDE LASERS (2 Lasers shooting out from left & right flanks)
              nextSkillEffects.push({
                id: Math.random().toString(36).substr(2, 9),
                type: 'titan_side_lasers' as any,
                x: tower.x,
                y: tower.y,
                radius: 0,
                maxRadius: 1200,
                color: laserColor,
                duration: 250,
                startTime: time,
                angle: targetAngle,
                targetX: closest ? closest.x : tower.x + 800 * Math.cos(targetAngle),
                targetY: closest ? closest.y : tower.y + 800 * Math.sin(targetAngle),
                titanLaserCannonsUpgrade: tower.titanLaserCannonsUpgrade
              } as any);

              nextEnemies = nextEnemies.map(e => {
                const dx = e.x - tower.x;
                const dy = e.y - tower.y;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d <= range) {
                  return {
                    ...e,
                    health: e.health - skillDmg * 8.0
                  };
                }
                return e;
              });
            }
          }
          else if (animal.id === 'blackhole_dwarf') {
            let closest: EnemyInstance | null = null;
            let cDist = 9999;
            nextEnemies.forEach(e => {
              const dx = e.x - tower.x;
              const dy = e.y - tower.y;
              const d = Math.sqrt(dx * dx + dy * dy);
              if (d < cDist) {
                cDist = d;
                closest = e;
              }
            });
            
            const targetX = closest ? closest.x : tower.x + 150;
            const targetY = closest ? closest.y : tower.y;

            nextSkillEffects.push({
              id: Math.random().toString(36).substr(2, 9),
              type: 'blackhole',
              x: targetX,
              y: targetY,
              radius: 120,
              maxRadius: range,
              color: '#d946ef',
              duration: 5000,
              startTime: time
            });

            // Enqueue synchronous damage event to run in 5.0 seconds
            pendingDamageEvents.current.push({
              x: targetX,
              y: targetY,
              damage: skillDmg * 150.0,
              radius: range * 1.3,
              triggerTime: time + 5000,
              color: '#f472b6',
              sourceTowerId: tower.id
            });
          }
          else if (animal.id === 'unrivaled_solar_phoenix') {
            nextSkillEffects.push({
              id: Math.random().toString(36).substr(2, 9),
              type: 'firering',
              x: tower.x,
              y: tower.y,
              radius: 0,
              maxRadius: range * 1.3,
              color: animal.color,
              duration: 1200,
              startTime: time
            });
            nextEnemies = nextEnemies.map(e => {
              const dx = e.x - tower.x;
              const dy = e.y - tower.y;
              if (Math.sqrt(dx * dx + dy * dy) <= range * 1.3) {
                return {
                  ...e,
                  health: e.health - skillDmg * 15.0,
                  slowMultiplier: 0.2,
                  slowExpiry: time + 3000
                };
              }
              return e;
            });
          }
          else if (animal.id === 'unrivaled_void_behemoth') {
            nextSkillEffects.push({
              id: Math.random().toString(36).substr(2, 9),
              type: 'vortex',
              x: tower.x,
              y: tower.y,
              radius: 0,
              maxRadius: range,
              color: '#ec4899',
              duration: 1500,
              startTime: time
            });
            nextEnemies = nextEnemies.map(e => {
              const dx = e.x - tower.x;
              const dy = e.y - tower.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist <= range) {
                let pullX = e.x;
                let pullY = e.y;
                if (dist > 5) {
                  pullX = e.x + (dx / dist) * (dist * 0.45);
                  pullY = e.y + (dy / dist) * (dist * 0.45);
                }
                return {
                  ...e,
                  x: pullX,
                  y: pullY,
                  pathX: pullX,
                  pathY: pullY,
                  health: e.health - skillDmg * 18.0,
                  slowMultiplier: 0.1,
                  slowExpiry: time + 3000
                };
              }
              return e;
            });
          }
          else if (animal.id === 'unrivaled_frost_dragon') {
            nextSkillEffects.push({
              id: Math.random().toString(36).substr(2, 9),
              type: 'supernova',
              x: tower.x,
              y: tower.y,
              radius: 0,
              maxRadius: range * 1.2,
              color: '#06b6d4',
              duration: 1200,
              startTime: time
            });
            nextEnemies = nextEnemies.map(e => {
              const dx = e.x - tower.x;
              const dy = e.y - tower.y;
              if (Math.sqrt(dx * dx + dy * dy) <= range * 1.2) {
                return { ...e, health: e.health - skillDmg * 20.0, slowMultiplier: 0.0, slowExpiry: time + 2500 };
              }
              return e;
            });
          }
          else if (animal.id === 'unrivaled_storm_wyvern') {
            nextSkillEffects.push({
              id: Math.random().toString(36).substr(2, 9),
              type: 'shockwave',
              x: tower.x,
              y: tower.y,
              radius: 0,
              maxRadius: range * 1.4,
              color: '#eab308',
              duration: 1000,
              startTime: time
            });
            nextEnemies = nextEnemies.map(e => {
              const dx = e.x - tower.x;
              const dy = e.y - tower.y;
              if (Math.sqrt(dx * dx + dy * dy) <= range * 1.4) {
                return { ...e, health: e.health - skillDmg * 22.0, slowMultiplier: 0.3, slowExpiry: time + 2000 };
              }
              return e;
            });
          }
          else {
            // General skill pulse fallback for any other Mythic / Secret / Celestial / ??? units
            nextSkillEffects.push({
              id: Math.random().toString(36).substr(2, 9),
              type: 'shockwave',
              x: tower.x,
              y: tower.y,
              radius: 0,
              maxRadius: range * 1.2,
              color: animal.color,
              duration: 1000,
              startTime: time
            });
            nextEnemies = nextEnemies.map(e => {
              const dx = e.x - tower.x;
              const dy = e.y - tower.y;
              if (Math.sqrt(dx * dx + dy * dy) <= range * 1.2) {
                return { ...e, health: e.health - skillDmg * 5.0 };
              }
              return e;
            });
          }

          // Filter out enemies that were killed by AOE/skills instantly
          nextEnemies = nextEnemies.filter(e => {
            if (e.health <= 0) {
              const type = ENEMY_MAP.get(e.typeId) || {
                id: e.typeId,
                name: e.typeId.includes('origin') ? '🌌 THE MULTIVERSE PRIME ORIGIN (400TH WAVE FINALE)' : 'Syndicate Operative',
                color: e.typeId.includes('origin') ? '#ec4899' : '#f43f5e',
                size: e.typeId.includes('origin') ? 95 : 30,
                isBoss: e.typeId.includes('origin') || e.typeId.includes('boss'),
                emoji: e.typeId.includes('origin') ? '🌌' : '👾',
                category: e.typeId.includes('origin') ? 'boss' : 'standard',
                speed: 0.12,
                bounty: 1000000,
                description: 'A hostile syndicate entity.'
              };
              nextMeat += Math.floor(type.bounty * bountyMultiplier);
              if (gameStateRef.current.isSkyMode) {
                nextSkyModeKills += 1;
                if (nextSkyModeKills >= 200 && !skyChasingCutsceneTriggeredRef.current) {
                  skyChasingCutsceneTriggeredRef.current = true;
                  setIsSkyChasingCutsceneOpen(true);
                }
              }
              if (gameStateRef.current.isAlienMode || type?.isAlien) {
                nextAlienModeKills += 1;
              }
              if (Math.random() < 0.10) {
                nextGameTokens += 1;
                nextSkillEffects.push({
                  id: Math.random().toString(36).substr(2, 9),
                  type: 'crit_text',
                  x: e.x,
                  y: e.y,
                  radius: 0,
                  maxRadius: 0,
                  color: '#f59e0b',
                  duration: 900,
                  startTime: time,
                  text: '+1 🎮 TOKEN'
                });
              }
              // 1% chance to drop an Arcane Shard from normal defeated enemies
              if (Math.random() < 0.01) {
                nextArcaneShards += 1;
                nextSkillEffects.push({
                  id: Math.random().toString(36).substr(2, 9),
                  type: 'crit_text',
                  x: e.x,
                  y: e.y - 18,
                  radius: 0,
                  maxRadius: 0,
                  color: '#c084fc',
                  duration: 1800,
                  startTime: time,
                  text: '+1 🔮 ARCANE SHARD!'
                });
              }
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('daily-mission-event', { detail: { type: 'defeat-enemy', count: 1 } }));
              }
              return false;
            }
            return true;
          });

          // Measure skill damage dealt using the health delta snapshot
          let skillDmgDealt = 0;
          nextEnemies.forEach(e => {
            const bh = healthBeforeSkill.get(e.id);
            if (bh !== undefined && e.health < bh) {
              skillDmgDealt += bh - e.health;
            }
          });
          const activeEnemyIds = new Set(nextEnemies.map(e => e.id));
          healthBeforeSkill.forEach((health, id) => {
            if (!activeEnemyIds.has(id)) {
              skillDmgDealt += health; // Dispatched/eliminated enemy's remaining health prior to blow
            }
          });
          if (skillDmgDealt > 0) {
            recordDamageDealt(tower.id, skillDmgDealt);
          }
        }
      }

      // 5. Normal Attacks
      let blackholeDwarfSpeedBuff = 1.0;
      blackholeDwarfs.forEach(otherTower => {
        if (otherTower.id !== tower.id) {
          const dx = otherTower.x - tower.x;
          const dy = otherTower.y - tower.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          const isOtherDisabled = otherTower.disabledExpiry && gameTime < otherTower.disabledExpiry;
          if (dist <= 300 && !isOtherDisabled) { 
            blackholeDwarfSpeedBuff = 2.5; // 150% attack speed boost decreases attack cooldowns
          }
        }
      });

      let customDelay = (animal.fireRate * traitFireRateMult) / blackholeDwarfSpeedBuff;

      // Apply Aircraft Attack Speed Bonus (reduces cooldown)
      if (tower.aircraftId && tower.aircraftId !== 'none') {
        const aircraft = AIRCRAFTS.find(a => a.id === tower.aircraftId);
        if (aircraft) {
          customDelay *= (1 - aircraft.speedBonus);
        }
      }

      if (hazardAffinity) {
        customDelay /= hazardAffinity.speedMult;
      }
      if (tower.animalId === 'titan_defender' && (tower as any).titanHyperDriveUpgrade) {
        customDelay *= 0.6; // Hyper-Drive: 40% faster fire rate!
      }
      if (tower.isPinnacle) {
        customDelay *= 0.6; // 40% faster attack rate (firing cooldown reduced by 40%)!
      }
      if (gameStateRef.current.isTrueHell && !gameStateRef.current.isUltraBoss) {
        customDelay *= 10; // 10x longer fire cooldown/delay between attacks
      }
      if (gameStateRef.current.isSuddenDeath) {
        customDelay *= 0.5; // Halve attack delay (2x faster firing speed)
      }
      if (time - tower.lastFired > customDelay && !isCurrentlyDisabled && !isUltraActive && !isCharging && (!gameStateRef.current.isSkyMode || tower.isFlying)) {
        // --- 🍊 CAPYBARA (THE CHILLFUL): The Chill Hypnotize ---
        if (tower.animalId === 'capybara') {
          // Count all active hypnotized enemies currently within range
          const activeHypnotizedInRange = nextEnemies.filter(enemy => {
            if (!enemy.isHypnotized || enemy.health <= 0) return false;
            const dx = enemy.x - tower.x;
            const dy = enemy.y - tower.y;
            return Math.hypot(dx, dy) <= range;
          }).length;

          // Find unhypnotized bad animals and hunters within range
          const candidates = nextEnemies.filter(enemy => {
            if (enemy.isHypnotized || enemy.health <= 0) return false;
            if (enemy.typeId === 'ultra_world_boss') return false; // Ultra World Boss cannot be hypnotized
            const dx = enemy.x - tower.x;
            const dy = enemy.y - tower.y;
            return Math.hypot(dx, dy) <= range;
          });

          if (candidates.length > 0) {
            // Hypnotize up to 10 bad animals/hunters in range
            const toHypnotize = candidates.slice(0, 10);
            toHypnotize.forEach(target => {
              target.isHypnotized = true;
              target.hypnotizedByTowerId = tower.id;
              target.hypnotizeExpiry = time + 14000; // 14s hypnotize duration
              target.lastHypnotizeAttackTime = time;
            });

            // Update real-time Chill Meter (0-100%) and Hypnotized Count
            const totalActive = Math.min(10, activeHypnotizedInRange + toHypnotize.length);
            tower.hypnotizedCount = totalActive;
            tower.chillMeter = Math.min(100, Math.round((totalActive / 10) * 100));

            // Emit serene expanding zen lime wave
            nextSkillEffects.push({
              id: Math.random().toString(36).substr(2, 9),
              type: 'chill_hypnotize_aura',
              x: tower.x,
              y: tower.y,
              radius: 20,
              maxRadius: range,
              color: '#84cc16',
              duration: 750,
              startTime: time
            });

            tower.lastFired = time;
          } else {
            tower.hypnotizedCount = activeHypnotizedInRange;
            tower.chillMeter = Math.min(100, Math.round((activeHypnotizedInRange / 10) * 100));
          }
          return; // Capybara deals 0 direct damage
        }

        const isTitanForm3 = tower.animalId === 'titan_defender' && tower.titanForm === 'form3_multiverse';

        if (isTitanForm3) {
          // 3RD FORM: MULTIVERSE WATCHER - SHOOTS EVERY SINGLE ENEMY SIMULTANEOUSLY WITH COSMIC SINGULARITY LASERS!
          const targetableEnemies = nextEnemies.filter(e => !e.isHypnotized);
          if (targetableEnemies.length > 0) {
            tower.lastAttack = time;
            tower.lastFired = time;
            tower.rotation = Math.atan2(targetableEnemies[0].y - tower.y, targetableEnemies[0].x - tower.x);

            const critInfo = calculateCrit(tower, damage, totalCritChanceBonus, totalCritMultBonus);
            const isUpgradedTV = (tower as any).titanSkin === 'upgraded_titan_tv_man';
            const laserColor = isUpgradedTV ? '#a855f7' : '#c084fc';

            targetableEnemies.forEach((enemy, idx) => {
              const targetX = enemy.x;
              const targetY = enemy.y;
              const angle = Math.atan2(targetY - tower.y, targetX - tower.x);

              // Singularity Laser to this specific enemy
              nextSkillEffects.push({
                id: Math.random().toString(36).substr(2, 9),
                type: 'titan_multiverse_blast' as any,
                x: tower.x,
                y: tower.y,
                radius: 0,
                maxRadius: 0,
                color: laserColor,
                duration: 250,
                startTime: time,
                angle,
                targetX,
                targetY,
                shakeGrid: idx === 0
              } as any);

              // Laser blast cross on each enemy
              nextSkillEffects.push({
                id: Math.random().toString(36).substr(2, 9),
                type: 'laser_cross',
                x: targetX,
                y: targetY,
                radius: 0,
                maxRadius: 28,
                color: '#ec4899',
                duration: 200,
                startTime: time
              });

              let enemyDmg = critInfo.damage;
              if (enemy.typeId === 'hitech_nullifier') {
                enemyDmg *= 0.25;
              }

              if (critInfo.isCrit && (idx < 6 || Math.random() < 0.25)) {
                nextSkillEffects.push({
                  id: Math.random().toString(36).substr(2, 9),
                  type: 'crit_text',
                  x: targetX + (Math.random() * 12 - 6),
                  y: targetY - 12,
                  radius: 0,
                  maxRadius: 25,
                  color: critInfo.elementColor,
                  duration: 750,
                  startTime: time,
                  damageAmount: enemyDmg,
                  element: critInfo.element,
                  isCrit: true,
                });
              }

              recordDamageDealt(tower.id, Math.min(enemy.health, enemyDmg));
            });

            // Apply damage & slow to all targetable enemies
            nextEnemies = nextEnemies.map(enemy => {
              if (enemy.isHypnotized) return enemy;
              let dmg = critInfo.damage;
              if (enemy.typeId === 'hitech_nullifier') {
                dmg *= 0.25;
              }
              return {
                ...enemy,
                health: enemy.health - dmg,
                slowMultiplier: 0.1,
                slowExpiry: time + 2000
              };
            }).filter(e => e.health > 0);

            return; // Finished Form 3 attack
          }
        }

        let closestEnemy: EnemyInstance | null = null;
        let minDist = range;

        const hasGhostVision = gameStateRef.current.hasGhostVisionGlasses || 
          gameStateRef.current.equippedRelicIds?.includes('ghost_vision_glasses') ||
          gameStateRef.current.unlockedRelics?.includes('ghost_vision_glasses');

        const towerCanHitFlying = tower.isFlying || 
          (tower.aircraftId && tower.aircraftId !== 'none') || 
          (tower as any).titanForm === 'form3_multiverse' ||
          animal.rarity === 'Celestial' || 
          animal.rarity === 'Unrivaled' || 
          animal.rarity === 'Overseer' ||
          animal.rarity === 'Original' ||
          animal.id === 'eagle' ||
          animal.id === 'falcon' ||
          animal.id === 'owl' ||
          animal.id === 'phoenix' ||
          animal.id === 'dragon';

        nextEnemies.forEach(enemy => {
          // Defense towers will NOT attack hypnotized friendly enemies!
          if (enemy.isHypnotized) return;

          // Ghost & Spectre checks: Requires Ghost Vision Glasses upgrade!
          const isGhostEnemy = enemy.isGhost || enemy.typeId.startsWith('ghost_') || (enemy.typeId === 'hitech_spectre' && !(enemy.slowExpiry && time < enemy.slowExpiry));
          if (isGhostEnemy && !hasGhostVision) {
            return; // Cannot target ethereal ghost without Ghost Vision Glasses!
          }

          // Grounded towers cannot target flying sky-enemies
          if (enemy.isFlying && !towerCanHitFlying) return;

          const dx = enemy.x - tower.x;
          const dy = enemy.y - tower.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minDist) {
            minDist = dist;
            closestEnemy = enemy;
          }
        });

        if (closestEnemy) {
          if (tower.animalId === 'titan_defender') {
            const targetX = closestEnemy.x;
            const targetY = closestEnemy.y;
            const isForm3 = (tower as any).titanForm === 'form3_multiverse';
            const isForm2 = (tower as any).titanForm === 'form2_merged';
            const isUpgradedTV = (tower as any).titanSkin === 'upgraded_titan_tv_man';
            const laserColor = isUpgradedTV ? '#a855f7' : '#38bdf8'; // Purple for TV Man, Cyan for Titan
            const crossColor = isUpgradedTV ? '#ec4899' : '#38bdf8'; // Pink for TV Man, Cyan for Titan
            
            if (isForm3) {
              // 3RD FORM: MULTIVERSE WATCHER - COSMIC SINGULARITY GRID-SHAKING BLAST
              nextSkillEffects.push({
                id: Math.random().toString(36).substr(2, 9),
                type: 'titan_multiverse_blast' as any,
                x: tower.x,
                y: tower.y,
                radius: 0,
                maxRadius: 0,
                color: '#c084fc',
                duration: 250,
                startTime: time,
                angle: Math.atan2(targetY - tower.y, targetX - tower.x),
                targetX,
                targetY,
                shakeGrid: true
              } as any);
            } else if (isForm2) {
              // Thick central laser from the head/cannon
              nextSkillEffects.push({
                id: Math.random().toString(36).substr(2, 9),
                type: 'titan_merged_laser' as any,
                x: tower.x,
                y: tower.y,
                radius: 0,
                maxRadius: 0,
                color: laserColor,
                duration: 200,
                startTime: time,
                angle: Math.atan2(targetY - tower.y, targetX - tower.x),
                targetX,
                targetY
              } as any);
            } else {
              // Dual lasers from left and right side cannons
              const angle = Math.atan2(targetY - tower.y, targetX - tower.x);
              nextSkillEffects.push({
                id: Math.random().toString(36).substr(2, 9),
                type: 'titan_side_lasers' as any,
                x: tower.x,
                y: tower.y,
                radius: 0,
                maxRadius: 0,
                color: laserColor,
                duration: 200,
                startTime: time,
                angle,
                targetX,
                targetY
              } as any);
            }

            // Spawn smaller laser blast/cross visual at target
            nextSkillEffects.push({
              id: Math.random().toString(36).substr(2, 9),
              type: 'laser_cross',
              x: targetX,
              y: targetY,
              radius: 0,
              maxRadius: 25,
              color: crossColor,
              duration: 200,
              startTime: time
            });

            // Instant hitscan damage (no projectile travel delay!)
            const critInfo = calculateCrit(tower, damage, totalCritChanceBonus, totalCritMultBonus);
            let finalDmg = critInfo.damage;
            if (closestEnemy.typeId === 'hitech_nullifier') {
              finalDmg *= 0.25;
            } else {
              const nearNullifier = nullifiers.some(e => 
                e.id !== closestEnemy!.id && ((e.x - closestEnemy!.x) ** 2 + (e.y - closestEnemy!.y) ** 2) <= 6400
              );
              if (nearNullifier) {
                finalDmg *= 0.8;
              }
            }

            if (critInfo.isCrit) {
              nextSkillEffects.push({
                id: Math.random().toString(36).substr(2, 9),
                type: 'crit_text',
                x: targetX + (Math.random() * 12 - 6),
                y: targetY - 12,
                radius: 0,
                maxRadius: 25,
                color: critInfo.elementColor,
                duration: 750,
                startTime: time,
                damageAmount: finalDmg,
                element: critInfo.element,
                isCrit: true,
              });
            }

            const appliedDmg = Math.max(0, Math.min(closestEnemy.health, finalDmg));
            recordDamageDealt(tower.id, appliedDmg);

            // Apply direct damage immediately (and apply AOE if defined, e.g., if titan has an aoe range)
            nextEnemies = nextEnemies.map(enemy => {
              if (enemy.id === closestEnemy!.id) {
                return { ...enemy, health: enemy.health - finalDmg };
              }
              if (animal.aoeRange) {
                const dx = enemy.x - targetX;
                const dy = enemy.y - targetY;
                if ((dx * dx + dy * dy) <= animal.aoeRange * animal.aoeRange) {
                  let aoeDmg = damage;
                  if (enemy.typeId === 'hitech_nullifier') {
                    aoeDmg *= 0.25;
                  } else {
                    const nearNull = nullifiers.some(nullE => 
                      nullE.id !== enemy.id && ((nullE.x - enemy.x) ** 2 + (nullE.y - enemy.y) ** 2) <= 6400
                    );
                    if (nearNull) {
                      aoeDmg *= 0.8;
                    }
                  }
                  recordDamageDealt(tower.id, Math.min(enemy.health, aoeDmg));
                  return { ...enemy, health: enemy.health - aoeDmg };
                }
              }
              return enemy;
            }).filter(e => e.health > 0);

            tower.lastFired = time;
          } else if (tower.animalId === 'arcane_warper') {
            const targetX = closestEnemy.x;
            const targetY = closestEnemy.y;
            const isSecondForm = !!tower.warperSecondForm;
            const hasBlade = !!tower.warperBladeUpgrade;
            const hasArmouredTitan = !!tower.warperArmouredTitanUpgrade;

            // Damage multipliers
            let damageMultiplier = isSecondForm ? 2000.0 : 1.0;
            if (hasArmouredTitan) damageMultiplier *= 2.5; // Armoured Titan: +150% base damage boost
            if (hasBlade) damageMultiplier *= 3.5; // Blade Upgrade: condensed hyper-concentrated damage

            const angle = Math.atan2(targetY - tower.y, targetX - tower.x);
            const warperSkin = (tower as any).warperSkin || 'standard';

            // --- 1. ASTRAL BLADE UPGRADE (RANGE 2: INNER MELEE BLADE CLEAVE) ---
            if (hasBlade) {
              const bladeRange = 260;
              const enemiesInBladeRange = nextEnemies.filter(e => {
                const d = Math.hypot(e.x - tower.x, e.y - tower.y);
                return d <= bladeRange;
              });

              // Trigger cosmic razor blade slashing visual effect
              nextSkillEffects.push({
                id: Math.random().toString(36).substr(2, 9),
                type: 'warper_blade_slash' as any,
                x: tower.x,
                y: tower.y,
                radius: 0,
                maxRadius: bladeRange,
                color: '#d946ef',
                duration: 240,
                startTime: time,
                angle: angle,
                warperSkin: warperSkin
              } as any);

              // Deal lethal cleaving blade damage to all enemies inside the blade range
              if (enemiesInBladeRange.length > 0) {
                const bladeSlashDmg = (damage * damageMultiplier * 1.5);
                enemiesInBladeRange.forEach(bEnemy => {
                  recordDamageDealt(tower.id, Math.min(bEnemy.health, bladeSlashDmg));
                  bEnemy.health -= bladeSlashDmg;
                });
              }
            }

            // --- 2. LASER CANNONS (RANGE 1: OUTER LASER FIRING) ---
            // If Blade Upgrade is equipped: "reduce lasers but still deals alot of damage"
            if (isSecondForm) {
              // 1. Colossal Titan Form 2 Big Purple/Custom Aura Laser
              nextSkillEffects.push({
                id: Math.random().toString(36).substr(2, 9),
                type: 'warper_merged_laser' as any,
                x: tower.x,
                y: tower.y,
                radius: 0,
                maxRadius: 0,
                color: '#a855f7',
                duration: 250,
                startTime: time,
                angle: angle,
                targetX: tower.x + 1600 * Math.cos(angle),
                targetY: tower.y + 1600 * Math.sin(angle),
                warperSkin: warperSkin
              } as any);

              // If NOT condensed by blade upgrade, fire 4 outer quad aura lasers
              if (!hasBlade) {
                for (let i = 0; i < 4; i++) {
                  const angleOffset = -0.35 + i * 0.23;
                  nextSkillEffects.push({
                    id: Math.random().toString(36).substr(2, 9),
                    type: 'warper_lasers' as any,
                    x: tower.x,
                    y: tower.y,
                    radius: 0,
                    maxRadius: 0,
                    color: '#c084fc',
                    duration: 220,
                    startTime: time,
                    angle: angle + angleOffset,
                    targetX: tower.x + 1400 * Math.cos(angle + angleOffset),
                    targetY: tower.y + 1400 * Math.sin(angle + angleOffset),
                    warperSkin: warperSkin
                  } as any);
                }
              }
            } else {
              // Form 1:
              if (hasBlade) {
                // Condensed into 1 single ultra-concentrated singularity beam
                nextSkillEffects.push({
                  id: Math.random().toString(36).substr(2, 9),
                  type: 'warper_lasers' as any,
                  x: tower.x,
                  y: tower.y,
                  radius: 0,
                  maxRadius: 0,
                  color: '#c084fc',
                  duration: 220,
                  startTime: time,
                  angle: angle,
                  targetX: tower.x + 1400 * Math.cos(angle),
                  targetY: tower.y + 1400 * Math.sin(angle),
                  warperSkin: warperSkin
                } as any);
              } else {
                // Dual aura lasers
                for (let i = 0; i < 2; i++) {
                  const angleOffset = (i === 0 ? -0.15 : 0.15);
                  nextSkillEffects.push({
                    id: Math.random().toString(36).substr(2, 9),
                    type: 'warper_lasers' as any,
                    x: tower.x,
                    y: tower.y,
                    radius: 0,
                    maxRadius: 0,
                    color: '#a855f7',
                    duration: 200,
                    startTime: time,
                    angle: angle + angleOffset,
                    targetX: tower.x + 1400 * Math.cos(angle + angleOffset),
                    targetY: tower.y + 1400 * Math.sin(angle + angleOffset),
                    warperSkin: warperSkin
                  } as any);
                }
              }
            }

            // --- 3. ARMOURED TITAN MECHA UPGRADE: 2 MORE HEAVY LASER CANNONS ---
            if (hasArmouredTitan) {
              for (let c = 0; c < 2; c++) {
                const cannonOffset = c === 0 ? -0.32 : 0.32;
                const cannonAngle = angle + cannonOffset;
                nextSkillEffects.push({
                  id: Math.random().toString(36).substr(2, 9),
                  type: 'warper_lasers' as any,
                  x: tower.x,
                  y: tower.y,
                  radius: 0,
                  maxRadius: 0,
                  color: '#38bdf8',
                  duration: 230,
                  startTime: time,
                  angle: cannonAngle,
                  targetX: tower.x + 1450 * Math.cos(cannonAngle),
                  targetY: tower.y + 1450 * Math.sin(cannonAngle),
                  warperSkin: warperSkin,
                  isHeavyCannon: true
                } as any);
              }
            }

            nextSkillEffects.push({
              id: Math.random().toString(36).substr(2, 9),
              type: 'shockwave',
              x: targetX,
              y: targetY,
              radius: 0,
              maxRadius: isSecondForm ? 250 : 100,
              color: '#d946ef',
              duration: 300,
              startTime: time
            });

            const critInfo = calculateCrit(tower, damage * damageMultiplier, totalCritChanceBonus, totalCritMultBonus);
            const baseDamage = critInfo.damage;
            if (critInfo.isCrit) {
              nextSkillEffects.push({
                id: Math.random().toString(36).substr(2, 9),
                type: 'crit_text',
                x: targetX + (Math.random() * 12 - 6),
                y: targetY - 12,
                radius: 0,
                maxRadius: 25,
                color: ELEMENT_COLORS['cosmos'] || '#ec4899',
                duration: 750,
                startTime: time,
                damageAmount: baseDamage,
                element: 'cosmos',
                isCrit: true,
              });
            }

            nextEnemies = nextEnemies.map(enemy => {
              const dx = enemy.x - targetX;
              const dy = enemy.y - targetY;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (enemy.id === closestEnemy!.id) {
                const finalDmg = baseDamage;
                recordDamageDealt(tower.id, Math.min(enemy.health, finalDmg));
                return { ...enemy, health: enemy.health - finalDmg };
              }

              const blastRadius = isSecondForm ? 400 : 150;
              if (dist <= blastRadius) {
                const finalDmg = baseDamage;
                recordDamageDealt(tower.id, Math.min(enemy.health, finalDmg));
                return { ...enemy, health: enemy.health - finalDmg };
              }

              return enemy;
            }).filter(e => e.health > 0);

            tower.lastFired = time;
          } else if (tower.animalId === 'elemental_god' || tower.animalId.endsWith('_deity')) {
            const defaultElement = ANIMAL_ELEMENTS[tower.animalId] || 'fire';
            const element = tower.element || defaultElement;
            const splashRange = animal.aoeRange || 1100;
            const targetX = closestEnemy.x;
            const targetY = closestEnemy.y;

            // Visual effects
            let effectType: any = 'element_fire_blast';
            let effectColor = '#ff7700';
            let effectRadius = 150;

            if (element === 'fire') {
              effectType = 'element_fire_blast';
              effectColor = '#ef4444';
            } else if (element === 'poison') {
              effectType = 'element_poison_burst';
              effectColor = '#10b981';
            } else if (element === 'water') {
              effectType = 'element_water_wave';
              effectColor = '#3b82f6';
            } else if (element === 'sand') {
              effectType = 'element_sand_whirl';
              effectColor = '#ebd2b0';
            } else if (element === 'dirt') {
              effectType = 'element_dirt_rupture';
              effectColor = '#7c2d12';
            } else if (element === 'ice') {
              effectType = 'element_ice_freeze';
              effectColor = '#06b6d4';
              effectRadius = 100;
            } else if (element === 'wind') {
              effectType = 'element_wind_cyclone';
              effectColor = '#a8a29e';
            } else if (element === 'lightning') {
              effectType = 'element_lightning_surge';
              effectColor = '#eab308';
            } else if (element === 'light') {
              effectType = 'element_light_beam';
              effectColor = '#f59e0b';
            } else if (element === 'shadow') {
              effectType = 'element_shadow_void';
              effectColor = '#8b5cf6';
            } else if (element === 'magma') {
              effectType = 'element_magma_eruption';
              effectColor = '#f97316';
            } else if (element === 'cosmos') {
              effectType = 'element_cosmos_burst';
              effectColor = '#ec4899';
            }

            // Spawn visual splash effect
            nextSkillEffects.push({
              id: Math.random().toString(36).substr(2, 9),
              type: effectType,
              x: targetX,
              y: targetY,
              radius: 0,
              maxRadius: effectRadius,
              color: effectColor,
              duration: 400,
              startTime: time
            });

            // Draw connecting beam from deity to target
            nextSkillEffects.push({
              id: Math.random().toString(36).substr(2, 9),
              type: 'custom_laser' as any,
              x: tower.x,
              y: tower.y,
              radius: 0,
              maxRadius: 0,
              color: effectColor,
              duration: 300,
              startTime: time,
              angle: Math.atan2(targetY - tower.y, targetX - tower.x),
              ...({ targetX, targetY } as any)
            });

            // Apply direct damage & elementals immediately
            const critInfo = calculateCrit(tower, damage, totalCritChanceBonus, totalCritMultBonus);
            const appliedDeityDmg = critInfo.damage;
            if (critInfo.isCrit) {
              nextSkillEffects.push({
                id: Math.random().toString(36).substr(2, 9),
                type: 'crit_text',
                x: targetX + (Math.random() * 12 - 6),
                y: targetY - 14,
                radius: 0,
                maxRadius: 25,
                color: effectColor,
                duration: 750,
                startTime: time,
                damageAmount: appliedDeityDmg,
                element: element,
                isCrit: true,
              });
            }

            let totalDmg = 0;
            nextEnemies = nextEnemies.map(enemy => {
              const dx = enemy.x - targetX;
              const dy = enemy.y - targetY;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist <= splashRange) {
                const effectiveDmg = Math.max(0, Math.min(enemy.health, appliedDeityDmg));
                totalDmg += effectiveDmg;

                let slowMult = enemy.slowMultiplier || 1.0;
                let slowExp = enemy.slowExpiry || 0;
                let nextDist = enemy.distanceTravelled;

                if (element === 'fire') {
                  slowMult = 0.4;
                  slowExp = Math.max(slowExp, time + 4000);
                } else if (element === 'poison') {
                  slowMult = 0.5;
                  slowExp = Math.max(slowExp, time + 6000);
                } else if (element === 'water') {
                  nextDist = Math.max(0, enemy.distanceTravelled - 30);
                } else if (element === 'sand') {
                  slowMult = 0.3;
                  slowExp = Math.max(slowExp, time + 4000);
                } else if (element === 'dirt') {
                  slowMult = 0.01;
                  slowExp = Math.max(slowExp, time + 1000);
                } else if (element === 'ice') {
                  slowMult = 0.01;
                  slowExp = Math.max(slowExp, time + 2000);
                } else if (element === 'wind') {
                  nextDist = Math.max(0, enemy.distanceTravelled - 60);
                } else if (element === 'lightning') {
                  slowMult = 0.01;
                  slowExp = Math.max(slowExp, time + 1200);
                } else if (element === 'light') {
                  slowMult = 0.4;
                  slowExp = Math.max(slowExp, time + 3000);
                } else if (element === 'shadow') {
                  slowMult = 0.2;
                  slowExp = Math.max(slowExp, time + 4000);
                } else if (element === 'magma') {
                  slowMult = 0.45;
                  slowExp = Math.max(slowExp, time + 5000);
                } else if (element === 'cosmos') {
                  slowMult = 0.01;
                  slowExp = Math.max(slowExp, time + 1800);
                }

                return {
                  ...enemy,
                  health: enemy.health - appliedDeityDmg,
                  slowMultiplier: slowMult,
                  slowExpiry: slowExp,
                  distanceTravelled: nextDist
                };
              }
              return enemy;
            });

            if (totalDmg > 0) {
              recordDamageDealt(tower.id, totalDmg);
            }

            tower.lastFired = time;
          } else if (isUltraLag || nextProjectiles.length > 120) {
            // HITSCAN / ULTRA PERFORMANCE MODE: deal damage instantly!
            const critInfo = calculateCrit(tower, damage, totalCritChanceBonus, totalCritMultBonus);
            let finalDmg = critInfo.damage;
            const targetId = closestEnemy.id;
            
            if (closestEnemy.typeId === 'hitech_nullifier') {
              finalDmg *= 0.25;
            } else {
              const nearNullifier = nullifiers.some(e => 
                e.id !== targetId && ((e.x - closestEnemy.x) ** 2 + (e.y - closestEnemy.y) ** 2) <= 6400
              );
              if (nearNullifier) {
                finalDmg *= 0.8;
              }
            }
            
            if (critInfo.isCrit) {
              nextSkillEffects.push({
                id: Math.random().toString(36).substr(2, 9),
                type: 'crit_text',
                x: closestEnemy.x + (Math.random() * 12 - 6),
                y: closestEnemy.y - 12,
                radius: 0,
                maxRadius: 25,
                color: critInfo.elementColor,
                duration: 750,
                startTime: time,
                damageAmount: finalDmg,
                element: critInfo.element,
                isCrit: true,
              });
            }

            recordDamageDealt(tower.id, Math.min(closestEnemy.health, finalDmg));

            nextEnemies = nextEnemies.map(e => {
              if (e.id === targetId) {
                return { ...e, health: e.health - finalDmg };
              }
              if (animal.aoeRange) {
                const dx = e.x - closestEnemy.x;
                const dy = e.y - closestEnemy.y;
                if ((dx * dx + dy * dy) <= animal.aoeRange * animal.aoeRange) {
                  let aoeDmg = finalDmg;
                  if (e.typeId === 'hitech_nullifier') {
                    aoeDmg *= 0.25;
                  } else {
                    const nearNull = nullifiers.some(nullE => 
                      nullE.id !== e.id && ((nullE.x - e.x) ** 2 + (nullE.y - e.y) ** 2) <= 6400
                    );
                    if (nearNull) {
                      aoeDmg *= 0.8;
                    }
                  }
                  recordDamageDealt(tower.id, Math.min(e.health, aoeDmg));
                  return { ...e, health: e.health - aoeDmg };
                }
              }
              return e;
            }).filter(e => e.health > 0);

            // Spawn a simple non-laggy mini visual indicator ONLY if not in absolute lowest mode
            if (!isUltraLag) {
              nextSkillEffects.push({
                id: Math.random().toString(36).substr(2, 9),
                type: 'laser_cross',
                x: closestEnemy.x,
                y: closestEnemy.y,
                radius: 0,
                maxRadius: 15,
                color: animal.color,
                duration: 150,
                startTime: time
              });
            }
            tower.lastFired = time;
          } else {
            const critInfo = calculateCrit(tower, damage, totalCritChanceBonus, totalCritMultBonus);
            nextProjectiles.push({
              id: Math.random().toString(36).substr(2, 9),
              x: tower.x,
              y: tower.y,
              targetId: closestEnemy.id,
              damage: critInfo.damage,
              speed: 16,
              aoeRange: animal.aoeRange,
              color: animal.color,
              sourceTowerId: tower.id,
              isCrit: critInfo.isCrit,
              element: critInfo.element,
              elementColor: critInfo.elementColor,
            });
            tower.lastFired = time;
          }
        }
      }
    });

    // 6. Projectiles update (Optimized linear-time damage accumulator)
    let updatedActiveProjectiles: Projectile[] = [];
    const damageAccumulator = new Map<string, number>();
    const nextEnemiesMap = new Map<string, EnemyInstance>(nextEnemies.map(e => [e.id, e]));
    nullifiers = nextEnemies.filter(e => e.typeId === 'hitech_nullifier');

    nextProjectiles.forEach(p => {
      const target = nextEnemiesMap.get(p.targetId);
      if (!target) return; // Target destroyed

      const dx = target.x - p.x;
      const dy = target.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const hitRadius = target.typeId === 'ultra_world_boss' ? 75 : 12;
      if (dist < hitRadius) {
        // Hit!
        let finalDmg = p.damage;
        
        if (target.typeId === 'hitech_nullifier') {
          // Nullification Aegis deflects 75% of incoming physical projectiles
          finalDmg *= 0.25;
          if (Math.random() < 0.25) {
            nextSkillEffects.push({
              id: Math.random().toString(36).substr(2, 9),
              type: 'laser_cross',
              x: target.x,
              y: target.y,
              radius: 0,
              maxRadius: 40,
              color: '#38bdf8',
              duration: 300,
              startTime: time
            });
          }
        } else {
          // Check for nearby Quantum Aegis Vanguard (hitech_nullifier) within 80 coordinate pixels
          const nearNullifier = nullifiers.some(e => 
            e.id !== target.id && ((e.x - target.x) ** 2 + (e.y - target.y) ** 2) <= 6400
          );
          if (nearNullifier) {
            finalDmg *= 0.8; // 20% damage resistance under Defensive Flux!
          }
        }

        if (p.isCrit) {
          const element = p.element || 'fire';
          const critColor = p.elementColor || ELEMENT_COLORS[element] || '#ef4444';
          nextSkillEffects.push({
            id: Math.random().toString(36).substr(2, 9),
            type: 'crit_text',
            x: target.x + (Math.random() * 12 - 6),
            y: target.y - 12,
            radius: 0,
            maxRadius: 25,
            color: critColor,
            duration: 750,
            startTime: time,
            damageAmount: finalDmg,
            element: element,
            isCrit: true,
          });
        }

        // Chrono Hover-Fortress (hitech_hover_dreadnought) reactive shockwave spark feedback
        if (target.typeId === 'hitech_hover_dreadnought') {
          if (Math.random() < 0.15) {
            nextSkillEffects.push({
              id: Math.random().toString(36).substr(2, 9),
              type: 'shockwave',
              x: target.x,
              y: target.y,
              radius: 0,
              maxRadius: 100,
              color: '#10b981',
              duration: 500,
              startTime: time
            });
          }
        }

        if (p.sourceTowerId) {
          recordDamageDealt(p.sourceTowerId, Math.min(target.health, finalDmg));
        }
        damageAccumulator.set(target.id, (damageAccumulator.get(target.id) || 0) + finalDmg);

        if (p.aoeRange) {
          nextEnemies.forEach(e => {
            if (e.id !== target.id) {
              const dx_e = e.x - p.x;
              const dy_e = e.y - p.y;
              const dist_e = Math.sqrt(dx_e * dx_e + dy_e * dy_e);
              if (dist_e <= p.aoeRange) {
                let aoeDmg = p.damage;
                if (e.typeId === 'hitech_nullifier') {
                  aoeDmg *= 0.25;
                } else {
                  const nearNull = nullifiers.some(nullE => 
                    nullE.id !== e.id && ((nullE.x - e.x) ** 2 + (nullE.y - e.y) ** 2) <= 6400
                  );
                  if (nearNull) {
                    aoeDmg *= 0.8;
                  }
                }
                if (p.sourceTowerId) {
                  recordDamageDealt(p.sourceTowerId, Math.min(e.health, aoeDmg));
                }
                damageAccumulator.set(e.id, (damageAccumulator.get(e.id) || 0) + aoeDmg);
              }
            }
          });
        }
      } else {
        p.x += (dx / dist) * p.speed * (deltaTime / 16);
        p.y += (dy / dist) * p.speed * (deltaTime / 16);
        updatedActiveProjectiles.push(p);
      }
    });
    nextProjectiles = updatedActiveProjectiles;

    // Apply accumulated damages in a single pass
    if (damageAccumulator.size > 0) {
      nextEnemies = nextEnemies.map(e => {
        let dmg = damageAccumulator.get(e.id);
        if (dmg) {
          if ((e as any).vulnerabilityMult) {
            dmg *= (e as any).vulnerabilityMult;
          }
          let newHealth = e.health - dmg;

          // Intercept fatal damage to the Aegis Apex Commander if there is an Overseer on the grid
          if (e.typeId === 'hunter_commander' && newHealth <= 0) {
            const hasOverseer = nextTowers.some(t => t.animalId === 'all_seeing_overseer');
            if (hasOverseer) {
              newHealth = 1; // Hold back the killing blow for the cutscene arena!
              if (!cutsceneTriggeredRef.current) {
                cutsceneTriggeredRef.current = true;
                setIsOverseerCutsceneOpen(true);
              }
            }
          }

          // Intercept fatal damage to Ultra World Boss if there is an Arcane Warper on the grid
          if ((e.typeId === 'ultra_world_boss' || (gameStateRef.current.isUltraBoss && e.isBoss)) && newHealth <= 0) {
            const hasWarper = nextTowers.some(t => t.animalId === 'arcane_warper');
            if (hasWarper) {
              newHealth = 1; // Hold back the killing blow for the epic Warper Blade Clash cutscene!
              if (!warperClashCutsceneTriggeredRef.current) {
                warperClashCutsceneTriggeredRef.current = true;
                setIsWarperClashCutsceneOpen(true);
              }
            }
          }

          if (newHealth <= 0) {
            const type = ENEMY_MAP.get(e.typeId);
            if (type) {
              nextMeat += Math.floor(type.bounty * bountyMultiplier);
              if (gameStateRef.current.isSkyMode) {
                nextSkyModeKills += 1;
                if (nextSkyModeKills >= 200 && !skyChasingCutsceneTriggeredRef.current) {
                  skyChasingCutsceneTriggeredRef.current = true;
                  setIsSkyChasingCutsceneOpen(true);
                }
              }
              if (gameStateRef.current.isAlienMode || type?.isAlien) {
                nextAlienModeKills += 1;
              }
              if (Math.random() < 0.10) {
                nextGameTokens += 1;
                nextSkillEffects.push({
                  id: Math.random().toString(36).substr(2, 9),
                  type: 'crit_text',
                  x: e.x,
                  y: e.y,
                  radius: 0,
                  maxRadius: 0,
                  color: '#f59e0b',
                  duration: 900,
                  startTime: time,
                  text: '+1 🎮 TOKEN'
                });
              }
              // 1% chance to drop an Arcane Shard from normal defeated enemies
              if (Math.random() < 0.01) {
                nextArcaneShards += 1;
                nextSkillEffects.push({
                  id: Math.random().toString(36).substr(2, 9),
                  type: 'crit_text',
                  x: e.x,
                  y: e.y - 18,
                  radius: 0,
                  maxRadius: 0,
                  color: '#c084fc',
                  duration: 1800,
                  startTime: time,
                  text: '+1 🔮 ARCANE SHARD!'
                });
              }
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('daily-mission-event', { detail: { type: 'defeat-enemy', count: 1 } }));
              }
            }
          }
          return { ...e, health: newHealth };
        }
        return e;
      }).filter(e => e.health > 0);
    }

    // 7. Tick and clean Skill Visual Effects (Includes enemy missile motion & shield deflection tracking)
    nextSkillEffects = nextSkillEffects.map(effect => {
      if (effect.type === 'enemy_missile') {
        const targetTower = nextTowers.find(t => t.id === effect.targetTowerId);
        if (!targetTower) {
          // Target tower was sold or is gone, expire missile
          return { ...effect, startTime: -999999 };
        }

        const speed = effect.projectileSpeed || 5;
        const dx = targetTower.x - effect.x;
        const dy = targetTower.y - effect.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Check blocking by any nearby upgraded Titan's shield!
        let isBlocked = false;
        nextTowers.forEach(t => {
          if (t.animalId === 'titan_defender') {
            const tdx = effect.x - t.x;
            const tdy = effect.y - t.y;
            const tdist = Math.sqrt(tdx * tdx + tdy * tdy);
            
            // Front Shield blocks within 120px; Side Shield blocks within 160px
            const shieldRadius = t.titanSideShieldUpgrade ? 160 : (t.titanFrontShieldUpgrade ? 120 : 0);
            if (shieldRadius > 0 && tdist <= shieldRadius) {
              isBlocked = true;
            }
          }
        });

        if (isBlocked) {
          // Blocked! Expire immediately
          return {
            ...effect,
            startTime: -999999,
          };
        }

        if (dist <= 15) {
          // HIT! Apply stun disable unless tower is immune
          const targetAnimal = ANIMAL_MAP.get(targetTower.animalId);
          if (targetTower.animalId !== 'arcane_warper' && targetAnimal?.rarity !== 'Arcane' && targetTower.trait !== 'DeathOfWorld') {
            let canStun = true;
            // In Lore Mode, pure biological animals resist EMP stuns; non-animals/machines get stunned!
            if (gameStateRef.current.isLoreMode) {
              const isNonAnimal = NON_ANIMAL_IDS.has(targetTower.animalId);
              if (!isNonAnimal) {
                canStun = false;
              }
            }
            if (canStun) {
              targetTower.disabledExpiry = time + 5000; // 5 seconds stun
              targetTower.isDisabled = true;
            }
          }
          return { ...effect, startTime: -999999 }; // Expire
        } else {
          const moveDist = Math.min(dist, speed * (deltaTime / 16));
          const angle = Math.atan2(dy, dx);
          return {
            ...effect,
            x: effect.x + Math.cos(angle) * moveDist,
            y: effect.y + Math.sin(angle) * moveDist,
            angle: angle
          };
        }
      }

      const elapsed = time - effect.startTime;
      const progress = Math.min(1, elapsed / effect.duration);
      return {
        ...effect,
        radius: effect.maxRadius * progress,
      };
    }).filter(effect => time - effect.startTime < effect.duration);

    const maxActiveVFX = isUltraLag ? 25 : (isLowVFX ? 50 : 100);
    if (nextSkillEffects.length > maxActiveVFX) {
      nextSkillEffects = nextSkillEffects.slice(-maxActiveVFX);
    }
    }

    // Detect commander death when Archon Overseer is on the grid
    const isCommanderAliveNow = nextEnemies.some(e => e.typeId === 'hunter_commander' && e.health > 0);
    const isCommanderInQueueNow = waveEnemyQueue.current.some(e => e.id === 'hunter_commander');

    if (wasCommanderPresentThisTick && !isCommanderAliveNow && !isCommanderInQueueNow && !cutsceneTriggeredRef.current) {
      if (nextTowers.some(t => t.animalId === 'all_seeing_overseer')) {
        cutsceneTriggeredRef.current = true;
        setIsOverseerCutsceneOpen(true);
      }
    }

    // Detect Unrivaled Original death when an Unrivaled unit is on the grid
    const isUnrivaledAliveNow = nextEnemies.some(e => e.typeId === 'unrivaled_original' && e.health > 0);
    const isUnrivaledInQueueNow = waveEnemyQueue.current.some(e => e.id === 'unrivaled_original');

    if (wasUnrivaledPresentThisTick && !isUnrivaledAliveNow && !isUnrivaledInQueueNow && !unrivaledCutsceneTriggeredRef.current) {
      if (nextTowers.some(t => t.animalId === 'unrivaled_solar_phoenix' || t.animalId === 'unrivaled_void_behemoth')) {
        unrivaledCutsceneTriggeredRef.current = true;
        setIsUnrivaledCutsceneOpen(true);
      }
    }

    // Detect Ultra Boss death when Arcane Warper is on the grid
    const isUltraBossAliveNow = nextEnemies.some(e => (e.typeId === 'ultra_world_boss' || (gameStateRef.current.isUltraBoss && e.isBoss)) && e.health > 0);
    const isUltraBossInQueueNow = waveEnemyQueue.current.some(e => e.id === 'ultra_world_boss' || (gameStateRef.current.isUltraBoss && e.isBoss));

    if (wasUltraBossPresentThisTick && !isUltraBossAliveNow && !isUltraBossInQueueNow && !warperClashCutsceneTriggeredRef.current) {
      if (nextTowers.some(t => t.animalId === 'arcane_warper')) {
        warperClashCutsceneTriggeredRef.current = true;
        setIsWarperClashCutsceneOpen(true);
      }
    }

    // Detect Lore Mode Wave 200 Warper Infection & Titan Escape Trigger:
    if (gameStateRef.current.isLoreMode && 
        gameStateRef.current.wave >= 200 && 
        !gameStateRef.current.warperInfectionCutsceneTriggered && 
        !warperInfectionCutsceneTriggeredRef.current && 
        (waveEnemyQueue.current.length === 0 || nextEnemies.some(e => e.isBoss))) {
      warperInfectionCutsceneTriggeredRef.current = true;
      setIsWarperInfectionCutsceneOpen(true);
    }

    // Detect Lore Mode Post-Infection Base Return & Scientist Repair Trigger:
    if (gameStateRef.current.isLoreMode && 
        gameStateRef.current.warperInfectionCutsceneTriggered && 
        !gameStateRef.current.titanBaseReturnCutsceneTriggered && 
        !titanBaseReturnCutsceneTriggeredRef.current && 
        !isWarperInfectionCutsceneOpenRef.current && 
        !isTitanBaseReturnCutsceneOpenRef.current) {
      titanBaseReturnCutsceneTriggeredRef.current = true;
      setIsTitanBaseReturnCutsceneOpen(true);
    }

    // Detect Lore Mode Wave 240 Base Attack Part 1 Trigger:
    if (gameStateRef.current.isLoreMode && 
        gameStateRef.current.wave >= 240 && 
        !gameStateRef.current.baseAttackPart1CutsceneTriggered && 
        !baseAttackPart1CutsceneTriggeredRef.current && 
        !isBaseAttackPart1CutsceneOpenRef.current && 
        (waveEnemyQueue.current.length === 0 || nextEnemies.some(e => e.isBoss))) {
      baseAttackPart1CutsceneTriggeredRef.current = true;
      setIsBaseAttackPart1CutsceneOpen(true);
    }

    // Detect Lore Mode Wave 256 Base Attack Part 2 Trigger:
    if (gameStateRef.current.isLoreMode && 
        gameStateRef.current.wave >= 256 && 
        !gameStateRef.current.baseAttackPart2CutsceneTriggered && 
        !baseAttackPart2CutsceneTriggeredRef.current && 
        !isBaseAttackPart2CutsceneOpenRef.current && 
        (waveEnemyQueue.current.length === 0 || nextEnemies.some(e => e.isBoss))) {
      baseAttackPart2CutsceneTriggeredRef.current = true;
      setIsBaseAttackPart2CutsceneOpen(true);
    }

    // Detect Lore Mode Wave 270 Base Attack Part 3 Trigger:
    if (gameStateRef.current.isLoreMode && 
        gameStateRef.current.wave >= 270 && 
        !gameStateRef.current.baseAttackPart3CutsceneTriggered && 
        !baseAttackPart3CutsceneTriggeredRef.current && 
        !isBaseAttackPart3CutsceneOpenRef.current && 
        (waveEnemyQueue.current.length === 0 || nextEnemies.some(e => e.isBoss))) {
      baseAttackPart3CutsceneTriggeredRef.current = true;
      setIsBaseAttackPart3CutsceneOpen(true);
    }

    // Detect Lore Mode Wave 355 Titan Multiverse Transcendence Trigger:
    if (gameStateRef.current.isLoreMode && 
        gameStateRef.current.wave >= 355 && 
        !gameStateRef.current.loreTitanTransformed && 
        !loreTitanCutsceneTriggeredRef.current && 
        (waveEnemyQueue.current.length === 0 || nextEnemies.some(e => e.isBoss))) {
      loreTitanCutsceneTriggeredRef.current = true;
      setIsLoreTitanCutsceneOpen(true);
    }

    // Detect Lore Mode Warper Return / Homecoming Purification Trigger:
    // Wave >= 399 in Lore Mode, queue finished or boss cleared
    if (gameStateRef.current.isLoreMode && 
        gameStateRef.current.wave >= 399 && 
        !gameStateRef.current.warperPurifiedCutsceneTriggered && 
        !warperReturnCutsceneTriggeredRef.current) {
      warperReturnCutsceneTriggeredRef.current = true;
      setIsWarperReturnCutsceneOpen(true);
    }

    // Calculate sliding-window real-time DPS and apply combat XP for all placed towers (5-second window)
    const nowRealTime = Date.now();
    nextTowers.forEach(t => {
      if (damageDealtHistoryRef.current[t.id]) {
        damageDealtHistoryRef.current[t.id] = damageDealtHistoryRef.current[t.id].filter(
          ev => nowRealTime - ev.timestamp <= 5000
        );
        const sumDmg = damageDealtHistoryRef.current[t.id].reduce((acc, ev) => acc + ev.damage, 0);
        t.dps = Math.round(sumDmg / 5.0);
      } else {
        t.dps = 0;
      }

      // Initialize or retrieve tower XP and masteryLevel
      if (t.xp === undefined) {
        t.xp = 0;
      }
      if (t.masteryLevel === undefined) {
        t.masteryLevel = 1;
      }

      // Add accumulated combat/yield XP
      const combatXp = accumulatedXpRef.current[t.id] || 0;
      if (combatXp > 0) {
        t.xp += combatXp;
        accumulatedXpRef.current[t.id] = 0; // Reset after consuming
      }

      // Calculate XP needed for next mastery level
      // "the more mastery level, the harder to get to new mastery, max mastery will be 1000"
      const getMasteryXpNeeded = (masteryLvl: number) => {
        const animal = ANIMALS.find(a => a.id === t.animalId);
        const baseCost = animal ? animal.cost : 100;
        return Math.floor(Math.max(100, baseCost * 0.2) * Math.pow(masteryLvl, 1.5)) + 100;
      };

      if (t.masteryLevel < 1000) {
        const startMastery = t.masteryLevel;
        let xpReq = getMasteryXpNeeded(t.masteryLevel);
        while (t.xp >= xpReq && t.masteryLevel < 1000) {
          t.xp -= xpReq;
          t.masteryLevel += 1;
          xpReq = getMasteryXpNeeded(t.masteryLevel);
        }

        // Check for milestones reached
        if (t.masteryLevel > startMastery) {
          for (let lvl = startMastery + 1; lvl <= t.masteryLevel; lvl++) {
            if (lvl % 100 === 0) {
              window.dispatchEvent(new CustomEvent('mastery-milestone', {
                detail: {
                  towerId: t.id,
                  animalId: t.animalId,
                  level: lvl,
                  isMajor: true
                }
              }));
            } else if (lvl % 50 === 0) {
              window.dispatchEvent(new CustomEvent('mastery-milestone', {
                detail: {
                  towerId: t.id,
                  animalId: t.animalId,
                  level: lvl,
                  isMajor: false
                }
              }));
            }
          }
        }
      } else {
        t.masteryLevel = 1000;
        t.xp = 0; // Cap
      }
    });

    // 8. Single-pass State Commits - this reduces lag to ZERO!
    enemiesRef.current = nextEnemies;
    towersRef.current = nextTowers;
    projectilesRef.current = nextProjectiles;
    skillEffectsRef.current = nextSkillEffects;

    const isHidden = typeof document !== 'undefined' && document.hidden;
    const throttleInterval = isHidden ? 80 : (isUltraLag ? 66 : (isLowVFX ? 33 : 16));
    if (nowRealTime - lastStateCommitTimeRef.current >= throttleInterval) {
      lastStateCommitTimeRef.current = nowRealTime;
      setEnemies(nextEnemies);
      setTowers(nextTowers);
      setProjectiles(nextProjectiles);
      setSkillEffects(nextSkillEffects);
    }
    
    const nextTotalWaveEnemies = gameStateRef.current.totalWaveEnemies || 0;
    const nextEnemiesDefeated = nextIsWaveActive 
      ? Math.max(0, nextTotalWaveEnemies - waveEnemyQueue.current.length - nextEnemies.length) 
      : 0;

    if (gameStateRef.current.meat !== nextMeat || 
        gameStateRef.current.dna !== nextDna || 
        gameStateRef.current.health !== nextHealth || 
        gameStateRef.current.isWaveActive !== nextIsWaveActive || 
        gameStateRef.current.isGameOver !== nextIsGameOver ||
        gameStateRef.current.secretPity !== nextSecretPity ||
        (gameStateRef.current.celestialPity ?? 0) !== nextCelestialPity ||
        (gameStateRef.current.mysteryPity ?? 0) !== nextMysteryPity ||
        (gameStateRef.current.originalPity ?? 0) !== nextOriginalPity ||
        (gameStateRef.current.overseerPity ?? 0) !== nextOverseerPity ||
        (gameStateRef.current.shardsOfGods ?? 0) !== nextShardsOfGods ||
        (gameStateRef.current.arcaneShards ?? 0) !== nextArcaneShards ||
        (gameStateRef.current.gameTokens ?? 0) !== nextGameTokens ||
        (gameStateRef.current.ultraBossSlayer ?? false) !== nextUltraBossSlayer ||
        (gameStateRef.current.ultraBossKills ?? 0) !== nextUltraBossKills ||
        (gameStateRef.current.skyModeKills ?? 0) !== nextSkyModeKills ||
        (gameStateRef.current.alienModeKills ?? 0) !== nextAlienModeKills ||
        gameStateRef.current.summonedAnimals.length !== nextSummonedAnimals.length ||
        gameStateRef.current.totalWaveEnemies !== nextTotalWaveEnemies ||
        gameStateRef.current.waveEnemiesDefeated !== nextEnemiesDefeated) {
      setGameState(prev => ({
        ...prev,
        meat: nextMeat,
        dna: nextDna,
        health: nextHealth,
        isWaveActive: nextIsWaveActive,
        isGameOver: nextIsGameOver,
        secretPity: nextSecretPity,
        celestialPity: nextCelestialPity,
        mysteryPity: nextMysteryPity,
        originalPity: nextOriginalPity,
        overseerPity: nextOverseerPity,
        shardsOfGods: nextShardsOfGods,
        arcaneShards: nextArcaneShards,
        gameTokens: nextGameTokens,
        ultraBossSlayer: nextUltraBossSlayer,
        ultraBossKills: nextUltraBossKills,
        skyModeKills: nextSkyModeKills,
        alienModeKills: nextAlienModeKills,
        summonedAnimals: nextSummonedAnimals,
        totalWaveEnemies: nextTotalWaveEnemies,
        waveEnemiesDefeated: nextEnemiesDefeated,
      }));
    }

    if (typeof document === 'undefined' || !document.hidden) {
      requestRef.current = requestAnimationFrame(update);
    }
  }, []);

  // Continuous Dual-Drive Lifecycle (Foreground rAF + Dedicated Background Web Worker Ticker)
  useEffect(() => {
    let workerHandle: { worker: Worker; url: string } | null = null;
    let backupInterval: any = null;

    const onTick = () => {
      const now = performance.now();
      const isHidden = typeof document !== 'undefined' && document.hidden;
      const timeSinceLastFrame = now - lastProcessedTimeRef.current;
      
      // If the tab is in background (hidden) or rAF has stalled/throttled for > 28ms, trigger tick from Worker
      if (isHidden || timeSinceLastFrame >= 28) {
        update(now);
      }
    };

    try {
      workerHandle = createWorkerTicker();
      if (workerHandle && workerHandle.worker) {
        workerHandle.worker.onmessage = onTick;
        workerHandle.worker.postMessage('start');
      } else {
        backupInterval = setInterval(onTick, 16.66);
      }
    } catch (e) {
      backupInterval = setInterval(onTick, 16.66);
    }

    const onVisibilityChange = () => {
      const now = performance.now();
      lastTimeRef.current = now;
      lastProcessedTimeRef.current = now;
      if (typeof document !== 'undefined' && !document.hidden) {
        // Tab restored to focus: immediately force push latest state to UI and restart rAF
        setEnemies([...enemiesRef.current]);
        setTowers([...towersRef.current]);
        setProjectiles([...projectilesRef.current]);
        setSkillEffects([...skillEffectsRef.current]);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        requestRef.current = requestAnimationFrame(update);
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', onVisibilityChange);
      window.addEventListener('focus', onVisibilityChange);
    }

    // Start initial rAF loop
    requestRef.current = requestAnimationFrame(update);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (workerHandle) {
        try {
          workerHandle.worker.postMessage('stop');
          workerHandle.worker.terminate();
          URL.revokeObjectURL(workerHandle.url);
        } catch (e) {}
      }
      if (backupInterval) clearInterval(backupInterval);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', onVisibilityChange);
        window.removeEventListener('focus', onVisibilityChange);
      }
    };
  }, [update]);

  return {
    gameState,
    setGameState,
    towers,
    setTowers,
    enemies,
    setEnemies,
    projectiles,
    setProjectiles,
    skillEffects,
    isOverseerCutsceneOpen,
    setIsOverseerCutsceneOpen: customSetIsOverseerCutsceneOpen,
    isUnrivaledCutsceneOpen,
    setIsUnrivaledCutsceneOpen: customSetIsUnrivaledCutsceneOpen,
    isWarperClashCutsceneOpen,
    setIsWarperClashCutsceneOpen: customSetIsWarperClashCutsceneOpen,
    isSkyChasingCutsceneOpen,
    setIsSkyChasingCutsceneOpen: customSetIsSkyChasingCutsceneOpen,
    isWarperInfectionCutsceneOpen,
    setIsWarperInfectionCutsceneOpen: customSetIsWarperInfectionCutsceneOpen,
    isTitanBaseReturnCutsceneOpen,
    setIsTitanBaseReturnCutsceneOpen: customSetIsTitanBaseReturnCutsceneOpen,
    isBaseAttackPart1CutsceneOpen,
    setIsBaseAttackPart1CutsceneOpen: customSetIsBaseAttackPart1CutsceneOpen,
    isBaseAttackPart2CutsceneOpen,
    setIsBaseAttackPart2CutsceneOpen: customSetIsBaseAttackPart2CutsceneOpen,
    isBaseAttackPart3CutsceneOpen,
    setIsBaseAttackPart3CutsceneOpen: customSetIsBaseAttackPart3CutsceneOpen,
    isLoreTitanCutsceneOpen,
    setIsLoreTitanCutsceneOpen: customSetIsLoreTitanCutsceneOpen,
    handleTransformTitanToMultiverse,
    isWarperReturnCutsceneOpen,
    setIsWarperReturnCutsceneOpen: customSetIsWarperReturnCutsceneOpen,
    handleWarperPurified,
    spawnHunterCommander,
    placeTower,
    upgradeTower,
    bulkEvolveTowers,
    maxUpgradeTower,
    cheatMaxUpgradeTower,
    triggerOverseerActiveSkill,
    toggleTitanForm,
    upgradeTitanPart,
    upgradeWarperPart,
    triggerUnrivaledFinisher,
    ascendTowerToPinnacle,
    upgradeTowerAlienTech,
    sellTower,
    sellAllTowers,
    pinnacleAllTowers,
    rerollTowerTrait,
    autoTuneBestFitTrait,
    resetGame,
    startWave,
    waveSummary,
    setWaveSummary,
    towersRef,
    gameStateRef,
    activeSlot,
    changeSlot,
    clearSlot,
    cloneSlot,
    elementalDamage,
    setElementalDamage,
    elementalHazards,
    shiftElementalHazards,
    PATH: STAGE_PATHS[gameState.currentStage || 'default'] || STAGE_PATHS.default
  };
}
