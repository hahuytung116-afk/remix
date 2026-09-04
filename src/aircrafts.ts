import { Rarity } from './types';

export interface AircraftDef {
  id: string;
  name: string;
  description: string;
  costMeat: number;
  costDna: number;
  damageBonus: number; // e.g. 0.30 for +30%
  rangeBonus: number;  // e.g. 0.20 for +20%
  speedBonus: number;  // e.g. 0.15 for +15% attack speed (fireRate multiplier: 1 - speedBonus)
  emoji: string;
  color: string;
  isExclusiveTo?: string[]; // Only specific animals can equip this
}

export const AIRCRAFTS: AircraftDef[] = [
  {
    id: 'propeller_plane',
    name: 'Propeller Biplane',
    description: 'A retro canvas-and-wood biplane with spinning twin propellers. Unlocks high-altitude targeting and grants +15% Attack Range.',
    costMeat: 15000,
    costDna: 0,
    damageBonus: 0.0,
    rangeBonus: 0.15,
    speedBonus: 0.05,
    emoji: '🛩️',
    color: '#38bdf8'
  },
  {
    id: 'jetpack',
    name: 'Quantum Thruster Jetpack',
    description: 'High-energy fusion jet thruster strapped to the beast’s back. Unleashes flight and provides +20% Attack Speed.',
    costMeat: 45000,
    costDna: 0,
    damageBonus: 0.10,
    rangeBonus: 0.10,
    speedBonus: 0.20,
    emoji: '🎒',
    color: '#eab308'
  },
  {
    id: 'stealth_jet',
    name: 'Void Stealth Interceptor',
    description: 'High-speed tactical supersonic airframe. Grants +35% Damage, +20% Attack Range, and +15% Attack Speed.',
    costMeat: 120000,
    costDna: 400,
    damageBonus: 0.35,
    rangeBonus: 0.20,
    speedBonus: 0.15,
    emoji: '✈️',
    color: '#a855f7'
  },
  {
    id: 'cosmic_carrier',
    name: 'Celestial Battle Dreadnought',
    description: 'An ultimate star-faring planetary mothership wrapping the animal. Bestows +55% Damage, +30% Range, and +30% Attack Speed.',
    costMeat: 300000,
    costDna: 1000,
    damageBonus: 0.55,
    rangeBonus: 0.30,
    speedBonus: 0.30,
    emoji: '🛰️',
    color: '#f43f5e'
  },
  // Exclusive aircrafts / Flight cores for the elite flyable ones
  {
    id: 'titan_giga_thruster',
    name: 'Titan Giga-Thruster Wing',
    description: 'EXCLUSIVE TO ARMORED TITAN. Heavily shielded mecha thruster wing structure. Free flight. Grants +100% Damage, +50% Range, and +50% Attack Speed.',
    costMeat: 0,
    costDna: 0,
    damageBonus: 1.00,
    rangeBonus: 0.50,
    speedBonus: 0.50,
    emoji: '🪽',
    color: '#06b6d4',
    isExclusiveTo: ['titan_defender']
  },
  {
    id: 'elemental_solar_wings',
    name: 'Elemental Solar-Sail Wings',
    description: 'EXCLUSIVE TO ELEMENTAL DEITY. A set of pure stellar fire-sails that float on solar winds. Free flight. Grants +100% Damage, +50% Range, and +50% Attack Speed.',
    costMeat: 0,
    costDna: 0,
    damageBonus: 1.00,
    rangeBonus: 0.50,
    speedBonus: 0.50,
    emoji: '🔥',
    color: '#ff7700',
    isExclusiveTo: ['elemental_god', 'elemental_god_fire', 'elemental_god_poison', 'elemental_god_water', 'elemental_god_sand', 'elemental_god_dirt', 'elemental_god_ice', 'elemental_god_wind', 'elemental_god_lightning', 'elemental_god_light', 'elemental_god_shadow', 'elemental_god_magma', 'elemental_god_cosmos']
  },
  {
    id: 'overseer_anti_gravity_drive',
    name: 'Archon Anti-Gravity Star-Core',
    description: 'EXCLUSIVE TO ARCHON OVERSEER. A floating spatial distortion core bypassing standard physics. Free flight. Grants +100% Damage, +50% Range, and +50% Attack Speed.',
    costMeat: 0,
    costDna: 0,
    damageBonus: 1.00,
    rangeBonus: 0.50,
    speedBonus: 0.50,
    emoji: '🌀',
    color: '#00ffcc',
    isExclusiveTo: ['all_seeing_overseer']
  }
];

export interface SkyEnemyType {
  id: string;
  name: string;
  health: number;
  speed: number;
  bounty: number;
  color: string;
  size: number;
  emoji: string;
  description: string;
  abilities: string[];
}

export const SKY_ENEMIES: SkyEnemyType[] = [
  {
    id: 'sky_vanguard',
    name: 'Hunter Sky-Vanguard Drone',
    health: 600,
    speed: 1.4,
    bounty: 300,
    color: '#38bdf8',
    size: 35,
    emoji: '🛸',
    description: 'A rapid sky surveillance fighter sent to scout defensive installations from above.',
    abilities: ['Supersonic Dash']
  },
  {
    id: 'plasma_interceptor',
    name: 'Hunter Plasma Interceptor',
    health: 2200,
    speed: 1.1,
    bounty: 800,
    color: '#f59e0b',
    size: 42,
    emoji: '🚀',
    description: 'A heavier air interceptor armed with rapid-fire plasma blasters targeting ground installations.',
    abilities: ['Plasma Barrage']
  },
  {
    id: 'doom_vulture',
    name: 'Hunter Doom Bomber Vulture',
    health: 8500,
    speed: 0.7,
    bounty: 2500,
    color: '#ef4444',
    size: 55,
    emoji: '🦅',
    description: 'A high-altitude heavy bomber carrying nuclear gravity warheads.',
    abilities: ['Tactical Nuke Drop']
  },
  {
    id: 'cyber_cruiser_boss',
    name: '🛸 SKY CLASH DREADNOUGHT',
    health: 75000,
    speed: 0.4,
    bounty: 15000,
    color: '#a855f7',
    size: 80,
    emoji: '🛰️',
    description: 'A massive sky carrier boss that coordinates aerial hunter squadrons and shields lower-altitude grunts.',
    abilities: ['Aero Shields', 'Aviation Swarm Recall', 'Orbital Laser Strike']
  }
];
