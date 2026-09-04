import { Animal, TacticalPlan, TowerInstance, Rarity } from '../types';
import { ANIMALS } from '../constants';

export const TACTICAL_PLANS: TacticalPlan[] = [
  {
    id: 'balanced_matrix',
    name: 'Balanced Defense Matrix',
    subtitle: 'Standard Multiverse Doctrine',
    description: 'A scientifically calculated, all-rounder formation balancing high-priority single target boss shredders, wide-radius AoE wave-clear, stasis crowd control, and elite Fused anchors.',
    icon: 'ShieldAlert',
    tag: 'ALL-ROUNDER',
    color: '#38bdf8',
    gradientClass: 'from-sky-500/20 via-blue-500/10 to-indigo-950/40',
    borderClass: 'border-sky-400/40 text-sky-300',
    composition: {
      singleTargetDps: 35,
      aoeNuker: 25,
      crowdControl: 15,
      fusedBeast: 15,
      supportEconomy: 10
    },
    preferredRoleOrder: ['damage', 'hybrid', 'support', 'generator'],
    strategyNotes: 'Places single-target DPS at straightaways, AoE nukers at bends/clusters, crowd-control near entrance, and Fused anchors at choke points.',
    placementStyle: 'balanced_spread'
  },
  {
    id: 'fused_vanguard',
    name: 'Fused Sovereign Vanguard',
    subtitle: 'Temple of Fusion Specialization',
    description: 'Maximizes the tactical deployment of elite Fused units from the Fused Temple. Amplifies Fused Synergy blessings and overwhelming combined genetics.',
    icon: 'Atom',
    tag: 'FUSED SUPREMACY',
    color: '#f59e0b',
    gradientClass: 'from-amber-500/25 via-yellow-500/15 to-orange-950/40',
    borderClass: 'border-amber-400/40 text-amber-300',
    composition: {
      singleTargetDps: 20,
      aoeNuker: 20,
      crowdControl: 10,
      fusedBeast: 45,
      supportEconomy: 5
    },
    preferredRoleOrder: ['damage', 'hybrid', 'support', 'generator'],
    strategyNotes: 'Focuses deployment on Fused Chimera, Megashark, Kaiser, Chrono Watcher, and Twin Singularity to trigger cascading multi-tier abilities.',
    placementStyle: 'frontline_choke'
  },
  {
    id: 'stasis_lockdown',
    name: 'Crowd Control & Stasis Web',
    subtitle: 'Absolute Freeze & Turncoat Control',
    description: 'Prioritizes Capybara hypnotic field generators, Cosmic Basilisk freeze glares, and high-frequency stasis units to permanently halt enemy advancement.',
    icon: 'Sparkles',
    tag: 'SLOW & STUN',
    color: '#a855f7',
    gradientClass: 'from-purple-500/20 via-fuchsia-500/10 to-purple-950/40',
    borderClass: 'border-purple-400/40 text-purple-300',
    composition: {
      singleTargetDps: 20,
      aoeNuker: 20,
      crowdControl: 40,
      fusedBeast: 10,
      supportEconomy: 10
    },
    preferredRoleOrder: ['support', 'hybrid', 'damage', 'generator'],
    strategyNotes: 'Layers tranquil waves, stardust fields, and gravity pulses at the track origin so enemy swarms are frozen or converted before reaching core defenses.',
    placementStyle: 'cluster_aura'
  },
  {
    id: 'boss_slayer',
    name: 'Boss Slayer & Heavy Artillery',
    subtitle: 'Extreme Single-Target Pierce',
    description: 'Engineered specifically for World Bosses, Hunter Operatives, and Ultra Boss Rush. Deploys colossal damage beasts, armor-piercing snipers, and death rays.',
    icon: 'Crosshair',
    tag: 'TITAN KILLER',
    color: '#ef4444',
    gradientClass: 'from-rose-500/20 via-red-500/10 to-rose-950/40',
    borderClass: 'border-rose-400/40 text-rose-300',
    composition: {
      singleTargetDps: 50,
      aoeNuker: 15,
      crowdControl: 10,
      fusedBeast: 15,
      supportEconomy: 10
    },
    preferredRoleOrder: ['damage', 'hybrid', 'support', 'generator'],
    strategyNotes: 'Concentrates maximum kinetic DPS and active skill cannons along longest sightlines to burst bosses with millions of DPS per hit.',
    placementStyle: 'boss_kill_zone'
  },
  {
    id: 'sky_interceptors',
    name: 'Aerial & Swarm Interceptors',
    subtitle: 'Anti-Air & Velocity Cleansing',
    description: 'Tailored for airborne Sky Hunters, fast raptor scouts, and swarming drones. Prioritizes flying beasts (Gryphon Sentinel, Wyverns, Nebula Kaiser) and rapid multi-hitters.',
    icon: 'Zap',
    tag: 'ANTI-AIR & SPEED',
    color: '#06b6d4',
    gradientClass: 'from-cyan-500/20 via-teal-500/10 to-cyan-950/40',
    borderClass: 'border-cyan-400/40 text-cyan-300',
    composition: {
      singleTargetDps: 25,
      aoeNuker: 25,
      crowdControl: 10,
      fusedBeast: 20,
      supportEconomy: 20
    },
    preferredRoleOrder: ['hybrid', 'damage', 'support', 'generator'],
    strategyNotes: 'Stations high-altitude flying constructs with 360-degree intercept envelopes to eliminate fast units before they cross track thresholds.',
    placementStyle: 'perimeter_sniper'
  },
  {
    id: 'economic_blitz',
    name: 'Economic Blitz & Hyper-Scale',
    subtitle: 'Meat & DNA Harvester',
    description: 'Accelerates resource generation by placing early dividend generators and support units, rapidly snowballing income into God-tier and Arcane units.',
    icon: 'TrendingUp',
    tag: 'RAPID SCALING',
    color: '#10b981',
    gradientClass: 'from-emerald-500/20 via-green-500/10 to-emerald-950/40',
    borderClass: 'border-emerald-400/40 text-emerald-300',
    composition: {
      singleTargetDps: 25,
      aoeNuker: 20,
      crowdControl: 10,
      fusedBeast: 15,
      supportEconomy: 30
    },
    preferredRoleOrder: ['generator', 'support', 'damage', 'hybrid'],
    strategyNotes: 'Places generators safely behind defense lines while frontline meat shields stall enemy waves to maximize yield per second.',
    placementStyle: 'balanced_spread'
  }
];

export const DEFAULT_TACTICAL_PLAN_ID = 'balanced_matrix';

export function getTacticalPlan(planId?: string): TacticalPlan {
  const found = TACTICAL_PLANS.find(p => p.id === planId);
  return found || TACTICAL_PLANS[0];
}

// Rarity ranking weight
const RARITY_WEIGHT: Record<Rarity, number> = {
  'Arcane': 1300,
  'The Chillful': 1200,
  'Overseer': 1100,
  'Original': 1000,
  '???': 900,
  'Celestial': 800,
  'Unrivaled': 700,
  'Secret': 600,
  'Mythic': 500,
  'Legendary': 400,
  'Epic': 300,
  'Rare': 200,
  'Common': 100
};

// Categorize any animal into its primary tactical role
export function getAnimalTacticalRole(animal: Animal): 'singleTargetDps' | 'aoeNuker' | 'crowdControl' | 'fusedBeast' | 'supportEconomy' {
  if (animal.isFused || animal.category === 'fused' || animal.id.startsWith('fused_')) {
    return 'fusedBeast';
  }
  if (animal.role === 'support' || animal.id === 'capybara' || (animal.skillDesc && (animal.skillDesc.includes('freeze') || animal.skillDesc.includes('stasis') || animal.skillDesc.includes('Hypnotize')))) {
    if (animal.id === 'capybara' || animal.skillDesc?.includes('Hypnotize') || animal.skillDesc?.includes('freeze')) {
      return 'crowdControl';
    }
    return 'supportEconomy';
  }
  if (animal.generationMeat || animal.generationDna || animal.role === 'generator') {
    return 'supportEconomy';
  }
  if (animal.aoeRange && animal.aoeRange >= 150) {
    return 'aoeNuker';
  }
  return 'singleTargetDps';
}

// Calculate the current live role distribution on the battlefield
export function analyzeBattlefieldComposition(towers: TowerInstance[]): {
  singleTargetDps: number;
  aoeNuker: number;
  crowdControl: number;
  fusedBeast: number;
  supportEconomy: number;
  totalTowers: number;
} {
  const counts = {
    singleTargetDps: 0,
    aoeNuker: 0,
    crowdControl: 0,
    fusedBeast: 0,
    supportEconomy: 0,
    totalTowers: towers.length
  };

  towers.forEach(t => {
    const animal = ANIMALS.find(a => a.id === t.animalId);
    if (!animal) return;
    const role = getAnimalTacticalRole(animal);
    counts[role]++;
  });

  return counts;
}

// Automatically selects the best diversified construct matching the plan's deficit role
export function selectDiverseAnimalForTacticalPlan(
  plan: TacticalPlan,
  ownedAnimals: Animal[],
  currentTowers: TowerInstance[],
  currentMeat: number
): Animal | null {
  if (ownedAnimals.length === 0) return null;

  const affordableOwned = ownedAnimals.filter(a => currentMeat >= a.cost);
  if (affordableOwned.length === 0) return null;

  // Calculate current counts and quotas
  const currentComposition = analyzeBattlefieldComposition(currentTowers);
  const totalTowers = Math.max(1, currentTowers.length);

  // Measure current percentages
  const currentPercentages = {
    singleTargetDps: (currentComposition.singleTargetDps / totalTowers) * 100,
    aoeNuker: (currentComposition.aoeNuker / totalTowers) * 100,
    crowdControl: (currentComposition.crowdControl / totalTowers) * 100,
    fusedBeast: (currentComposition.fusedBeast / totalTowers) * 100,
    supportEconomy: (currentComposition.supportEconomy / totalTowers) * 100
  };

  // Find which role has the greatest deficit relative to target plan quotas
  const deficits: { role: 'singleTargetDps' | 'aoeNuker' | 'crowdControl' | 'fusedBeast' | 'supportEconomy'; deficit: number }[] = [
    { role: 'fusedBeast', deficit: plan.composition.fusedBeast - currentPercentages.fusedBeast },
    { role: 'singleTargetDps', deficit: plan.composition.singleTargetDps - currentPercentages.singleTargetDps },
    { role: 'aoeNuker', deficit: plan.composition.aoeNuker - currentPercentages.aoeNuker },
    { role: 'crowdControl', deficit: plan.composition.crowdControl - currentPercentages.crowdControl },
    { role: 'supportEconomy', deficit: plan.composition.supportEconomy - currentPercentages.supportEconomy }
  ];

  // Sort by highest deficit first
  deficits.sort((a, b) => b.deficit - a.deficit);

  // Look for candidates matching the top deficit roles in priority order
  for (const item of deficits) {
    const roleCandidates = affordableOwned.filter(a => getAnimalTacticalRole(a) === item.role);
    if (roleCandidates.length > 0) {
      // Pick highest power/rarity candidate in this role
      roleCandidates.sort((a, b) => {
        const scoreA = (RARITY_WEIGHT[a.rarity] || 0) + (a.damage || 0) / 1000;
        const scoreB = (RARITY_WEIGHT[b.rarity] || 0) + (b.damage || 0) / 1000;
        return scoreB - scoreA;
      });
      return roleCandidates[0];
    }
  }

  // If no matching deficit candidate is affordable, fallback to overall highest tier affordable unit
  const sortedAffordable = [...affordableOwned].sort((a, b) => {
    const scoreA = (RARITY_WEIGHT[a.rarity] || 0) + (a.damage || 0) / 1000;
    const scoreB = (RARITY_WEIGHT[b.rarity] || 0) + (b.damage || 0) / 1000;
    return scoreB - scoreA;
  });

  return sortedAffordable[0] || null;
}
