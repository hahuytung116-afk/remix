import { TowerInstance, EnemyInstance } from './types';
import { ANIMAL_ELEMENTS, ELEMENT_COLORS, ELEMENT_ICONS } from './constants';

export type ElementType = 
  | 'fire' 
  | 'poison' 
  | 'water' 
  | 'sand' 
  | 'dirt' 
  | 'ice' 
  | 'wind' 
  | 'lightning' 
  | 'light' 
  | 'shadow' 
  | 'magma' 
  | 'cosmos';

export interface ElementalHazardZone {
  id: string;
  segmentIndex: number;
  element: ElementType;
  name: string;
  title: string;
  icon: string;
  color: string;
  glowColor: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  hazardRadius: number; // Pixels surrounding the path segment
  buffElements: ElementType[];
  resonanceElements: ElementType[];
  debuffElements: ElementType[];
  buffDesc: string;
  debuffDesc: string;
  enemyEffectDesc: string;
  createdAt: number;
}

export interface TowerHazardAffinity {
  status: 'overcharged' | 'resonating' | 'dampened' | 'neutral';
  damageMult: number;
  speedMult: number;
  rangeMult: number;
  zone: ElementalHazardZone;
  element: ElementType;
}

export const HAZARD_INFO: Record<ElementType, {
  name: string;
  title: string;
  color: string;
  glowColor: string;
  buffElements: ElementType[];
  resonanceElements: ElementType[];
  debuffElements: ElementType[];
  buffDesc: string;
  debuffDesc: string;
  enemyEffectDesc: string;
}> = {
  fire: {
    name: 'Volcanic Fissure',
    title: '🔥 VOLCANIC FISSURE',
    color: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.45)',
    buffElements: ['fire', 'magma'],
    resonanceElements: ['lightning', 'light'],
    debuffElements: ['water', 'ice'],
    buffDesc: '+75% DMG & +25% Atk Speed for Fire/Magma units',
    debuffDesc: '-25% DMG for Water/Ice units',
    enemyEffectDesc: 'Thermal Burn: Inflicts 3.5% Max HP/s DoT and 25% slow',
  },
  ice: {
    name: 'Glacial Permafrost',
    title: '❄️ GLACIAL PERMAFROST',
    color: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.45)',
    buffElements: ['ice', 'water'],
    resonanceElements: ['wind', 'cosmos'],
    debuffElements: ['fire', 'magma'],
    buffDesc: '+75% DMG & +25% Atk Speed for Ice/Water units',
    debuffDesc: '-25% DMG for Fire/Magma units',
    enemyEffectDesc: 'Frostbite: Chills enemies with 45% slow',
  },
  lightning: {
    name: 'Hyper-Voltage Arc',
    title: '⚡ HYPER-VOLTAGE ARC',
    color: '#eab308',
    glowColor: 'rgba(234, 179, 8, 0.45)',
    buffElements: ['lightning', 'wind'],
    resonanceElements: ['light', 'fire'],
    debuffElements: ['dirt', 'sand'],
    buffDesc: '+75% DMG & +25% Atk Speed for Lightning/Wind units',
    debuffDesc: '-25% DMG for Earth/Sand units',
    enemyEffectDesc: 'Overload: Electrifies targets for +30% damage vulnerability',
  },
  poison: {
    name: 'Toxic Miasma',
    title: '☣️ TOXIC MIASMA',
    color: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.45)',
    buffElements: ['poison', 'dirt'],
    resonanceElements: ['shadow', 'water'],
    debuffElements: ['light', 'cosmos'],
    buffDesc: '+75% DMG & +25% Atk Speed for Poison/Earth units',
    debuffDesc: '-25% DMG for Light/Cosmos units',
    enemyEffectDesc: 'Acid Corrosion: Strips 45% of enemy armor reduction',
  },
  water: {
    name: 'Tidal Cascade',
    title: '🌊 TIDAL CASCADE',
    color: '#3b82f6',
    glowColor: 'rgba(59, 130, 246, 0.45)',
    buffElements: ['water', 'ice'],
    resonanceElements: ['poison', 'wind'],
    debuffElements: ['magma', 'lightning'],
    buffDesc: '+75% DMG & +25% Atk Speed for Water/Ice units',
    debuffDesc: '-25% DMG for Magma/Lightning units',
    enemyEffectDesc: 'Riptide: Washes back enemies along their lane',
  },
  wind: {
    name: 'Gale Vortex',
    title: '🍃 GALE VORTEX',
    color: '#94a3b8',
    glowColor: 'rgba(148, 163, 184, 0.45)',
    buffElements: ['wind', 'lightning'],
    resonanceElements: ['sand', 'cosmos'],
    debuffElements: ['dirt', 'shadow'],
    buffDesc: '+75% DMG & +25% Atk Speed for Wind/Lightning units',
    debuffDesc: '-25% DMG for Earth/Shadow units',
    enemyEffectDesc: 'Turbulence: Pushes enemies back with high-speed gusts',
  },
  dirt: {
    name: 'Tectonic Fault',
    title: '⛰️ TECTONIC FAULT',
    color: '#b45309',
    glowColor: 'rgba(180, 83, 9, 0.45)',
    buffElements: ['dirt', 'sand'],
    resonanceElements: ['magma', 'poison'],
    debuffElements: ['wind', 'water'],
    buffDesc: '+75% DMG & +25% Atk Speed for Earth/Sand units',
    debuffDesc: '-25% DMG for Wind/Water units',
    enemyEffectDesc: 'Tremor: Ground vibrations stun enemies periodically',
  },
  sand: {
    name: 'Desert Sandstorm',
    title: '🌪️ DESERT SANDSTORM',
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    buffElements: ['sand', 'dirt'],
    resonanceElements: ['wind', 'fire'],
    debuffElements: ['water', 'ice'],
    buffDesc: '+75% DMG & +25% Atk Speed for Sand/Earth units',
    debuffDesc: '-25% DMG for Water/Ice units',
    enemyEffectDesc: 'Blindness: Dense sand clouds slow enemy march by 50%',
  },
  light: {
    name: 'Solar Radiance',
    title: '✨ SOLAR RADIANCE',
    color: '#facc15',
    glowColor: 'rgba(250, 204, 21, 0.45)',
    buffElements: ['light', 'cosmos'],
    resonanceElements: ['fire', 'lightning'],
    debuffElements: ['shadow', 'poison'],
    buffDesc: '+75% DMG & +25% Atk Speed for Light/Cosmos units',
    debuffDesc: '-25% DMG for Shadow/Poison units',
    enemyEffectDesc: 'Divine Smite: Holy beams amplify damage taken by 35%',
  },
  shadow: {
    name: 'Abyssal Void Rift',
    title: '🔮 ABYSSAL VOID RIFT',
    color: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.45)',
    buffElements: ['shadow', 'cosmos'],
    resonanceElements: ['poison', 'magma'],
    debuffElements: ['light', 'lightning'],
    buffDesc: '+75% DMG & +25% Atk Speed for Shadow/Cosmos units',
    debuffDesc: '-25% DMG for Light/Lightning units',
    enemyEffectDesc: 'Gravity Well: Heavy gravitational distortion slows enemies by 55%',
  },
  magma: {
    name: 'Molten Caldera',
    title: '🌋 MOLTEN CALDERA',
    color: '#f97316',
    glowColor: 'rgba(249, 115, 22, 0.45)',
    buffElements: ['magma', 'fire'],
    resonanceElements: ['dirt', 'lightning'],
    debuffElements: ['water', 'ice'],
    buffDesc: '+75% DMG & +25% Atk Speed for Magma/Fire units',
    debuffDesc: '-25% DMG for Water/Ice units',
    enemyEffectDesc: 'Magma Sear: Melts armor plating with 5% Max HP DoT',
  },
  cosmos: {
    name: 'Astral Singularity',
    title: '🌌 ASTRAL SINGULARITY',
    color: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.45)',
    buffElements: ['cosmos', 'light'],
    resonanceElements: ['shadow', 'wind', 'ice'],
    debuffElements: ['dirt', 'poison'],
    buffDesc: '+75% DMG & +25% Atk Speed for Cosmos/Light units',
    debuffDesc: '-25% DMG for Earth/Poison units',
    enemyEffectDesc: 'Spacetime Warp: Dilates time, reducing enemy travel speed',
  },
};

export function getDistanceToSegment(x: number, y: number, x1: number, y1: number, x2: number, y2: number) {
  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  if (lenSq !== 0) param = dot / lenSq;

  let xx: number, yy: number;

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

export const ALL_ELEMENTS: ElementType[] = [
  'fire', 'poison', 'water', 'sand', 'dirt', 'ice', 
  'wind', 'lightning', 'light', 'shadow', 'magma', 'cosmos'
];

/**
 * Generates randomly shifting Elemental Hazard zones along the active map path.
 */
export function generateElementalHazards(
  path: { x: number; y: number }[],
  previousZones?: ElementalHazardZone[]
): ElementalHazardZone[] {
  if (!path || path.length < 2) return [];

  const totalSegments = path.length - 1;
  // Choose 2 to 3 distinct segments to apply hazards
  const hazardCount = Math.min(totalSegments, Math.max(2, Math.floor(totalSegments * 0.6)));
  
  // Pick distinct segment indices
  const availableIndices = Array.from({ length: totalSegments }, (_, i) => i);
  // Shuffle indices
  for (let i = availableIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availableIndices[i], availableIndices[j]] = [availableIndices[j], availableIndices[i]];
  }

  const chosenIndices = availableIndices.slice(0, hazardCount).sort((a, b) => a - b);
  
  // Pick diverse elements avoiding immediate duplicates
  const shuffledElements = [...ALL_ELEMENTS].sort(() => Math.random() - 0.5);
  const now = Date.now();

  return chosenIndices.map((segIdx, i) => {
    const element = shuffledElements[i % shuffledElements.length];
    const info = HAZARD_INFO[element];
    const p1 = path[segIdx];
    const p2 = path[segIdx + 1];

    return {
      id: `hazard_${segIdx}_${element}_${now}_${i}`,
      segmentIndex: segIdx,
      element,
      name: info.name,
      title: info.title,
      icon: ELEMENT_ICONS[element] || '✨',
      color: info.color,
      glowColor: info.glowColor,
      startX: p1.x,
      startY: p1.y,
      endX: p2.x,
      endY: p2.y,
      hazardRadius: 90, // Covers towers placed near this lane segment
      buffElements: info.buffElements,
      resonanceElements: info.resonanceElements,
      debuffElements: info.debuffElements,
      buffDesc: info.buffDesc,
      debuffDesc: info.debuffDesc,
      enemyEffectDesc: info.enemyEffectDesc,
      createdAt: now,
    };
  });
}

/**
 * Calculates the elemental hazard affinity, buffs, and debuffs for a placed tower.
 */
export function getTowerHazardAffinity(
  tower: TowerInstance,
  hazards: ElementalHazardZone[]
): TowerHazardAffinity | null {
  if (!hazards || hazards.length === 0) return null;

  const defaultElement = (ANIMAL_ELEMENTS[tower.animalId] as ElementType) || 'dirt';
  const towerElement = (tower.animalId === 'elemental_god' ? (tower.element || defaultElement) : defaultElement) as ElementType;

  // Find the closest active hazard zone within radius
  let bestZone: ElementalHazardZone | null = null;
  let minDistance = Infinity;

  for (const zone of hazards) {
    const dist = getDistanceToSegment(tower.x, tower.y, zone.startX, zone.startY, zone.endX, zone.endY);
    if (dist <= zone.hazardRadius && dist < minDistance) {
      minDistance = dist;
      bestZone = zone;
    }
  }

  if (!bestZone) return null;

  // Check matching / resonance / clash
  if (bestZone.buffElements.includes(towerElement)) {
    // 👑 OVERCHARGED BUFF: Direct Element Synergy
    return {
      status: 'overcharged',
      damageMult: 1.75, // +75% Massive Damage Boost
      speedMult: 1.25, // +25% Attack Rate / Faster Cooldowns
      rangeMult: 1.15, // +15% Range
      zone: bestZone,
      element: towerElement,
    };
  }

  if (bestZone.resonanceElements.includes(towerElement)) {
    // ⚡ RESONATING BUFF: Harmonic Secondary Element Synergy
    return {
      status: 'resonating',
      damageMult: 1.35, // +35% Damage Boost
      speedMult: 1.15, // +15% Attack Rate
      rangeMult: 1.10, // +10% Range
      zone: bestZone,
      element: towerElement,
    };
  }

  if (bestZone.debuffElements.includes(towerElement)) {
    // ⚠️ DAMPENED DEBUFF: Clashing Elemental Resistance
    return {
      status: 'dampened',
      damageMult: 0.75, // -25% Damage reduction
      speedMult: 0.85, // -15% Attack Rate reduction
      rangeMult: 0.90, // -10% Range reduction
      zone: bestZone,
      element: towerElement,
    };
  }

  // Neutral placement in hazard zone
  return {
    status: 'neutral',
    damageMult: 1.08, // +8% ambient baseline
    speedMult: 1.0,
    rangeMult: 1.0,
    zone: bestZone,
    element: towerElement,
  };
}
