import { Animal, EnemyType } from './types';

export const ANIMALS: Animal[] = [
  // Common
  { id: 'mouse', name: 'Field Mouse', rarity: 'Common', damage: 5, range: 100, fireRate: 500, cost: 50, color: '#94a3b8', emoji: '🐭' },
  { id: 'rabbit', name: 'Swift Rabbit', rarity: 'Common', damage: 8, range: 120, fireRate: 400, cost: 60, color: '#cbd5e1', emoji: '🐰' },
  { id: 'pigeon', name: 'Pigeon', rarity: 'Common', damage: 7, range: 150, fireRate: 600, cost: 55, color: '#64748b', emoji: '🐦', isFlying: true },
  { id: 'hedgehog', name: 'Spiky Hedgehog', rarity: 'Common', damage: 10, range: 110, fireRate: 450, cost: 55, color: '#a16207', emoji: '🦔' },
  { id: 'sparrow', name: 'Chirping Sparrow', rarity: 'Common', damage: 6, range: 160, fireRate: 350, cost: 50, color: '#f59e0b', emoji: '🐤', isFlying: true },
  
  // Rare
  { id: 'fox', name: 'Red Fox', rarity: 'Rare', damage: 20, range: 140, fireRate: 800, cost: 150, color: '#f97316', emoji: '🦊' },
  { id: 'wolf', name: 'Grey Wolf', rarity: 'Rare', damage: 25, range: 130, fireRate: 900, cost: 180, color: '#475569', emoji: '🐺' },
  { id: 'eagle', name: 'Golden Eagle', rarity: 'Rare', damage: 15, range: 250, fireRate: 1200, cost: 160, color: '#b45309', emoji: '🦅', isFlying: true },
  { id: 'cobra', name: 'Desert Cobra', rarity: 'Rare', damage: 22, range: 135, fireRate: 750, cost: 150, color: '#84cc16', emoji: '🐍' },
  { id: 'panther', name: 'Shadow Panther', rarity: 'Rare', damage: 28, range: 125, fireRate: 700, cost: 200, color: '#334155', emoji: '🐈‍⬛' },
  
  // Epic
  { id: 'lion', name: 'King Lion', rarity: 'Epic', damage: 60, range: 160, fireRate: 1500, cost: 600, color: '#eab308', emoji: '🦁' },
  { id: 'bear', name: 'Grizzly Bear', rarity: 'Epic', damage: 80, range: 120, fireRate: 2000, cost: 750, color: '#78350f', emoji: '🐻' },
  { id: 'croc', name: 'Nile Crocodile', rarity: 'Epic', damage: 70, range: 140, fireRate: 1800, cost: 700, color: '#166534', emoji: '🐊' },
  { id: 'rhino', name: 'Armored Rhino', rarity: 'Epic', damage: 95, range: 130, fireRate: 1900, cost: 800, color: '#64748b', emoji: '🦏' },
  { id: 'owl', name: 'Frost Owl', rarity: 'Epic', damage: 65, range: 280, fireRate: 1400, cost: 650, color: '#38bdf8', emoji: '🦉', isFlying: true },
  
  // Legendary (Extinct)
  { id: 'mammoth', name: 'Woolly Mammoth', rarity: 'Legendary', damage: 200, range: 180, fireRate: 3000, cost: 3000, color: '#a8a29e', isExtinct: true, emoji: '🦣' },
  { id: 'smilodon', name: 'Saber-toothed Tiger', rarity: 'Legendary', damage: 150, range: 130, fireRate: 1000, cost: 2500, color: '#d97706', isExtinct: true, emoji: '🐯' },
  { id: 'dodo', name: 'Battle Dodo', rarity: 'Legendary', damage: 120, range: 200, fireRate: 1200, cost: 2000, color: '#ec4899', isExtinct: true, emoji: '🦤' },
  { id: 'megalodon', name: 'Prehistoric Megalodon', rarity: 'Legendary', damage: 220, range: 160, fireRate: 2500, cost: 3500, color: '#0284c7', isExtinct: true, emoji: '🦈' },
  { id: 'terror_bird', name: 'Apex Terror Bird', rarity: 'Legendary', damage: 180, range: 210, fireRate: 950, cost: 2800, color: '#e11d48', isExtinct: true, emoji: '🦅', isFlying: true },
  
  // Money Maker
  { id: 'bee', name: 'Golden Bee', rarity: 'Rare', damage: 2, range: 80, fireRate: 1000, cost: 500, color: '#fbbf24', generationMeat: 250, emoji: '🐝', isFlying: true },

  // Mythic
  { id: 'trex', name: 'Tyrannosaurus Rex', rarity: 'Mythic', damage: 1000, range: 300, fireRate: 2000, cost: 15000, color: '#991b1b', isExtinct: true, aoeRange: 80, skillName: 'Tyrant Tremor', skillDesc: 'Every 5s, stomps the ground triggering a massive shockwave that damages and slows all enemies in range.', emoji: '🦖' },
  { id: 'phoenix', name: 'Fire Phoenix', rarity: 'Mythic', damage: 450, range: 350, fireRate: 1800, cost: 12000, color: '#ef4444', isExtinct: true, skillName: 'Solar Flare Ring', skillDesc: 'Every 4.5s, releases a ring of pure stellar energy, inflicting massive burn damage to all surrounding invaders.', emoji: '🔥', isFlying: true },
  { id: 'dragon', name: 'Ancient Dragon', rarity: 'Mythic', damage: 700, range: 250, fireRate: 4000, cost: 18000, color: '#b91c1c', isExtinct: true, skillName: 'Draconic Inferno', skillDesc: 'Every 6s, summons meteors from the heavens, dealing immense explosive damage in random areas on the map.', emoji: '🐉', isFlying: true },
  { id: 'basilisk', name: 'Stone Basilisk', rarity: 'Mythic', damage: 650, range: 240, fireRate: 3000, cost: 16000, color: '#16a34a', isExtinct: true, skillName: 'Stone Gaze', skillDesc: 'Every 5.5s, freezes enemies in place with petrification, dealing high damage over time.', emoji: '🦎' },
  { id: 'chimera', name: 'Manticore Chimera', rarity: 'Mythic', damage: 850, range: 220, fireRate: 1550, cost: 20000, color: '#dc2626', isExtinct: true, skillName: 'Triple Breath', skillDesc: 'Every 4s, fires a three-pronged elemental burst dealing massive AoE damage.', emoji: '🦁' },
  { id: 'griffin', name: 'Storm Griffin', rarity: 'Mythic', damage: 520, range: 320, fireRate: 1250, cost: 14000, color: '#eab308', isExtinct: true, skillName: 'Cyclone Screech', skillDesc: 'Every 4.2s, discharges a supersonic shockwave that pushes targets back on the path.', emoji: '🦅', isFlying: true },
  { id: 'kraken', name: 'Deep Sea Kraken', rarity: 'Mythic', damage: 900, range: 310, fireRate: 1600, cost: 22000, color: '#0d9488', isExtinct: true, aoeRange: 150, skillName: 'Tidal Crush', skillDesc: 'Every 4.5s, lashes huge tentacles causing massive splash waves and slow.', emoji: '🐙' },
  { id: 'hydra', name: 'Nine-Headed Hydra', rarity: 'Mythic', damage: 800, range: 280, fireRate: 1400, cost: 19000, color: '#15803d', isExtinct: true, aoeRange: 140, skillName: 'Toxic Spout', skillDesc: 'Every 5s, spits corrosive venom clouds across multiple paths.', emoji: '🐉' },

  // Secret (Super OP, ultra AOE, low cooldown)
  { id: 'mecha_rex', name: 'Mecha Cyber Rex', rarity: 'Secret', damage: 3200, range: 500, fireRate: 400, cost: 45000, color: '#06b6d4', isExtinct: true, aoeRange: 220, skillName: 'Cyber Overdrive', skillDesc: 'Every 3.5s, triggers active nano-lasers that fire hyper-velocity cross-beams across the battlefield.', emoji: '🤖' },
  { id: 'cthulhu', name: 'Cosmic Cthulhu', rarity: 'Secret', damage: 4500, range: 450, fireRate: 500, cost: 60000, color: '#10b981', isExtinct: true, aoeRange: 270, skillName: 'Void Singularity', skillDesc: 'Every 4s, spawns a dimensional vortex, dragging enemies together, pulling them down, and slowing them heavily.', emoji: '🦑' },
  { id: 'kaiju', name: 'Atomic Kaiju', rarity: 'Secret', damage: 6500, range: 380, fireRate: 800, cost: 80000, color: '#a855f7', isExtinct: true, aoeRange: 320, skillName: 'Thermonuclear Meltdown', skillDesc: 'Every 5s, releases a glowing radiation blast that dissolves enemy hunter hulls with extreme fallout damage.', emoji: '👾' },
  { id: 'secret_stardust', name: 'Stardust Chimera', rarity: 'Secret', damage: 5400, range: 420, fireRate: 650, cost: 65000, color: '#f472b6', isExtinct: true, aoeRange: 250, skillName: 'Starlight Shower', skillDesc: 'Every 4s, calls down sparkling cosmic arrows from outer space, burning and dazzling targeted zones.', emoji: '🌟' },
  { id: 'secret_nebula_kraken', name: 'Nebula Space Kraken', rarity: 'Secret', damage: 7200, range: 460, fireRate: 480, cost: 75000, color: '#2dd4bf', isExtinct: true, aoeRange: 300, skillName: 'Atmospheric Crush', skillDesc: 'Every 4.3s, constricts entire chunks of the battlefield, slowing targets on paths by 60% and dealing immense pressure damage.', emoji: '🌌' },
  { id: 'secret_quantum_glitch', name: 'Matrix Cyber Phoenix', rarity: 'Secret', damage: 8000, range: 480, fireRate: 380, cost: 85000, color: '#a855f7', isExtinct: true, aoeRange: 280, skillName: 'Code Overwrite', skillDesc: 'Every 3.6s, replaces local enemy units with highly unstable digitized copycat code blocks that pop for massive damage.', emoji: '💻' },
  { id: 'secret_cyber_viper', name: 'Hyper Cyber Viper', rarity: 'Secret', damage: 6000, range: 440, fireRate: 450, cost: 70000, color: '#10b981', isExtinct: true, aoeRange: 240, skillName: 'Neuro-Tech Overload', skillDesc: 'Every 3.8s, pulses a paralyzing electromagnetic surge that fries all electronic components in target range.', emoji: '🦾' },
  { id: 'secret_solar_lion', name: 'Solarium Apex Lion', rarity: 'Secret', damage: 7500, range: 410, fireRate: 550, cost: 78000, color: '#f59e0b', isExtinct: true, aoeRange: 260, skillName: 'Solar Roar', skillDesc: 'Every 4.0s, emits a blinding solar flare roar that disintegrates targets and ignites nearby ground.', emoji: '☀️' },

  // Celestial (The Ultimate Cosmic Gods, extreme stats and stunning galactic effects)
  { id: 'celestial_pegasus', name: 'Nebula Pegasus', rarity: 'Celestial', damage: 9500, range: 550, fireRate: 350, cost: 120000, color: '#38bdf8', isExtinct: true, aoeRange: 350, skillName: 'Supernova Pulse', skillDesc: 'Every 3s, triggers a stellar explosion of stardust that pulls enemies inwards, deals massive damage, and freezes them solid.', emoji: '🦄', isFlying: true },
  { id: 'celestial_kitsune', name: 'Void Kitsune', rarity: 'Celestial', damage: 13500, range: 600, fireRate: 500, cost: 160000, color: '#f43f5e', isExtinct: true, aoeRange: 400, skillName: 'Cosmic Foxfire', skillDesc: 'Every 4.5s, releases 9 homing celestial fireballs that vaporize groups of enemies in a vast radius.', emoji: '🦊' },
  { id: 'celestial_leviathan', name: 'Astra Leviathan', rarity: 'Celestial', damage: 18000, range: 650, fireRate: 450, cost: 200000, color: '#a855f7', isExtinct: true, aoeRange: 450, skillName: 'Galactic Maelstrom', skillDesc: 'Every 1.0s, summons a spatial cosmic storm that drags literally ALL enemies on the field towards the center and inflicts devastating dark-matter damage.', emoji: '🐋', isFlying: true },
  { id: 'celestial_chronos', name: 'Infinity Chronos', rarity: 'Celestial', damage: 25000, range: 700, fireRate: 600, cost: 280000, color: '#fb7185', isExtinct: true, aoeRange: 500, skillName: 'Temporal Shatter', skillDesc: 'Every 5s, completely sunders space-time, freezing all screen enemies in stasis for 2.5 seconds while unleashing chronal blast fire.', emoji: '⏳' },
  { id: 'celestial_seraph', name: 'Astra Seraph Dragon', rarity: 'Celestial', damage: 21000, range: 680, fireRate: 400, cost: 240000, color: '#e0e7ff', isExtinct: true, aoeRange: 460, skillName: 'Heavenly Eclipse', skillDesc: 'Every 3.8s, rains down divine light beams across the arena, obliterating enemy waves.', emoji: '👼', isFlying: true },
  { id: 'celestial_behemoth', name: 'Cosmic Behemoth', rarity: 'Celestial', damage: 28000, range: 620, fireRate: 520, cost: 300000, color: '#818cf8', isExtinct: true, aoeRange: 480, skillName: 'Supermassive Impact', skillDesc: 'Every 4.2s, slams the cosmic ground creating gravitation crush waves that shatter all nearby targets.', emoji: '🌋' },
  
  // ??? (An anomalous singularity of infinite power)
  { id: 'mystery_anomaly', name: '???', rarity: '???', damage: 99999, range: 800, fireRate: 150, cost: 1000000, color: '#ffffff', isExtinct: true, aoeRange: 600, skillName: 'Quantum Cataclysm', skillDesc: 'Every 2s, triggers an absolute rupture of the space fabric, vaporizing all moving targets with infinite dark matter beams.', emoji: '🌀' },
  { id: 'mystery_singularity', name: 'Singularity Prime', rarity: '???', damage: 135000, range: 850, fireRate: 120, cost: 1500000, color: '#e0f2fe', isExtinct: true, aoeRange: 700, skillName: 'Universal Eradication', skillDesc: 'Every 1.8s, projects a cosmic event horizon that collapses outer boundaries, tearing all active targets to atomic dust.', emoji: '🕳️', isFlying: true },
  { id: 'mystery_nullifier', name: 'System Nullifier', rarity: '???', damage: 160000, range: 900, fireRate: 180, cost: 1800000, color: '#3dd5f3', isExtinct: true, aoeRange: 750, skillName: 'Glitch Horizon', skillDesc: 'Every 2.2s, corrupts system code, rewriting enemy health variables down to absolute zero.', emoji: '🚫' },
  { id: 'mystery_eclipse', name: 'Eclipse Horizon Prime', rarity: '???', damage: 185000, range: 920, fireRate: 140, cost: 2000000, color: '#f43f5e', isExtinct: true, aoeRange: 800, skillName: 'Solar Devastation', skillDesc: 'Every 2.5s, blots out the sun and pulls space inward, instantly frying targets in extreme heatwaves.', emoji: '🌑', isFlying: true },
  { id: 'mystery_entropy', name: 'Entropy Devourer', rarity: '???', damage: 210000, range: 950, fireRate: 130, cost: 2200000, color: '#c084fc', isExtinct: true, aoeRange: 850, skillName: 'Thermal Collapse', skillDesc: 'Every 2s, completely strips kinetic energy from enemies, freezing and disintegrating their core matrices.', emoji: '⚡' },
  { id: 'mystery_supervoid', name: 'Supervoid Singularity', rarity: '???', damage: 250000, range: 980, fireRate: 110, cost: 2500000, color: '#38bdf8', isExtinct: true, aoeRange: 900, skillName: 'Infinite Vacuum', skillDesc: 'Every 1.5s, manifests an insurmountable cosmic pocket void that sweeps all non-boss entities directly to oblivion.', emoji: '🌌', isFlying: true },
  { id: 'mystery_continuum', name: 'Continuum Rift', rarity: '???', damage: 220000, range: 960, fireRate: 125, cost: 2300000, color: '#f43f5e', isExtinct: true, aoeRange: 860, skillName: 'Rift Collapse', skillDesc: 'Every 1.9s, opens a multidimensional rift that disintegrates enemy matter.', emoji: '🌀' },
  { id: 'mystery_darkstar', name: 'Darkstar Singularity', rarity: '???', damage: 240000, range: 970, fireRate: 115, cost: 2400000, color: '#a855f7', isExtinct: true, aoeRange: 880, skillName: 'Darkstar Detonation', skillDesc: 'Every 1.6s, unleashes anti-matter shocks that dissolve enemy armor.', emoji: '🌠', isFlying: true },

  // Original (Sacred anomalies with no traits, absolute stats, and supreme authority)
  { id: 'original_genesis', name: 'Genesis Primal Alpha', rarity: 'Original', damage: 4500000, range: 1000, fireRate: 100, cost: 3500000, color: '#f59e0b', isExtinct: true, aoeRange: 800, skillName: 'Origin Rupture', skillDesc: 'Every 1.2s, triggers a rupture of the absolute beginning, vaporizing even boss-level entities with infinite holy light.', emoji: '🪐' },
  { id: 'original_abyss', name: 'Abyssal Void Overlord', rarity: 'Original', damage: 6000000, range: 1100, fireRate: 80, cost: 4500000, color: '#ec4899', isExtinct: true, aoeRange: 950, skillName: 'Abyssal Obliteration', skillDesc: 'Every 1s, commands the true cosmic void to erase coordinates of all moving targets, inflicting ultimate atomic destruction.', emoji: '🕳️' },
  { id: 'blackhole_dwarf', name: 'Blackhole Dwarf', rarity: 'Original', damage: 8500000, range: 1200, fireRate: 90, cost: 6000000, color: '#ec4899', isExtinct: true, aoeRange: 1000, skillName: 'Event Horizon Detonation', skillDesc: 'Shoots a massive hyper-dense blackhole; after 5 seconds, it forcefully explodes and casts 2 giant reality-shattering laser beams for 3s. [PASSIVE: Gravitational Field - Boosts attack speeds of nearby towers by +150% and continuously shifts enemies into the center.]', emoji: '🌟' },
  { id: 'original_ragnarok', name: 'Ragnarok Endbringer', rarity: 'Original', damage: 7200000, range: 1150, fireRate: 85, cost: 5000000, color: '#ef4444', isExtinct: true, aoeRange: 1000, skillName: 'Doomsday Supernova', skillDesc: 'Every 2s, triggers a recursive absolute death-pulse sweeping outwards across 100% of the combat arena.', emoji: '💥' },
  { id: 'original_omega', name: 'Omega Star Devourer', rarity: 'Original', damage: 8000000, range: 1180, fireRate: 95, cost: 5500000, color: '#c084fc', isExtinct: true, aoeRange: 1000, skillName: 'Stellar Extermination', skillDesc: 'Every 1.5s, feeds upon stars of secondary grids to create a thermal plasma explosion of unparalleled range and force.', emoji: '☄️' },

  // Overseer (Ultra-rare supreme transcendental unit)
  { id: 'all_seeing_overseer', name: 'The Archon Overseer', rarity: 'Overseer', damage: 50000000, range: 1500, fireRate: 150, cost: 8000000, color: '#00ffcc', isExtinct: true, aoeRange: 1300, isFlying: true, skillName: 'Realm Expansion', skillDesc: 'Active Skill (10s Cooldown): Unfolds the layers of space-time, dealing 100x attack damage globally across the grid and freezing all active enemies in standard micro-stasis for 10.0 full seconds. Max limit constraint: 1 Overseer on the grid.', emoji: '👁️' },
  { id: 'elemental_god', name: 'The Elemental Deity', rarity: 'Overseer', damage: 45000000, range: 1200, fireRate: 120, cost: 8000000, color: '#ff7700', isExtinct: true, aoeRange: 1100, isFlying: true, skillName: 'Elemental Apocalypse', skillDesc: 'Active Skill (8s Cooldown): Unfolds a catastrophic elemental tempest across the entire grid across 12 distinct affinities (Fire, Poison, Water, Sand, Earth, Ice, Wind, Lightning, Light, Shadow, Magma, Cosmos). Switch elements anytime from the unit panel!', emoji: '🔱' },
  { id: 'titan_defender', name: 'The Armored Titan', rarity: 'Overseer', damage: 65000000, range: 1600, fireRate: 100, cost: 12000000, color: '#38bdf8', isExtinct: true, aoeRange: 1400, skillName: 'Ultra Laser & Multiverse Watcher', skillDesc: 'Titan Fortress Realm. Form 1: Shoots dual flank laser beams. Form 2 (Great Defender): Merges side lasers into a giant central hyper-beam. Form 3 (Multiverse Watcher): Transcends into a Cosmic Black Hole Singularity! Blasts massive energy that violently shakes the whole grid, bringing him to the 2nd Arcane tier with 0% energy loss, infinite power, and 100% global stun/EMP immunity for all allied animals! (Upgrades bypassed in 3rd Form). Active Skill: 30s Ultra Laser megabeam.', emoji: '🛡️' },
  { id: 'buffer', name: 'Nebula Overcharge Beacon', rarity: 'Original', damage: 0, range: 180, fireRate: 999999, cost: 3000000, color: '#00ffcc', isExtinct: true, skillName: 'Overcharge Emission', skillDesc: 'A passive amplification core. Boosts the damage output of ALL supporting towers in its aura range by +150% (2.5x base damage per beacon!). Max 8 instances can be placed.', emoji: '📡' },

  // Unrivaled (Primal gods capable of Overwriting Reality, high DPS, breathtaking speed)
  { id: 'unrivaled_solar_phoenix', name: 'Solara Unrivaled Phoenix', rarity: 'Unrivaled', damage: 250000, range: 420, fireRate: 300, cost: 300000, color: '#f59e0b', isExtinct: true, aoeRange: 200, isFlying: true, skillName: 'Cosmic Flare Overwrite', skillDesc: 'Every 3s, releases a radiant wave of orange solar flares that melt all standard resistance matrices with extreme AoE fire.', emoji: '🐦‍🔥' },
  { id: 'unrivaled_void_behemoth', name: 'Zenos Unrivaled Behemoth', rarity: 'Unrivaled', damage: 450000, range: 480, fireRate: 400, cost: 450000, color: '#ec4899', isExtinct: true, aoeRange: 250, skillName: 'Singularity Collapse', skillDesc: 'Every 2.5s, projects a dense event horizon pulling enemies to an atomic center and inflicting massive dark-matter damage.', emoji: '🕳️' },
  { id: 'unrivaled_frost_dragon', name: 'Glacia Unrivaled Dragon', rarity: 'Unrivaled', damage: 380000, range: 460, fireRate: 320, cost: 380000, color: '#06b6d4', isExtinct: true, aoeRange: 240, isFlying: true, skillName: 'Absolute Zero Shatter', skillDesc: 'Every 2.8s, triggers an instant perma-frost flash wave that freezes enemies into ice statues and shatters them.', emoji: '❄️' },
  { id: 'unrivaled_storm_wyvern', name: 'Zephyr Unrivaled Wyvern', rarity: 'Unrivaled', damage: 420000, range: 500, fireRate: 350, cost: 420000, color: '#eab308', isExtinct: true, aoeRange: 260, isFlying: true, skillName: 'Tempest Overwrite', skillDesc: 'Every 2.6s, summons hyper-tornadoes that sweep along enemy lines dealing catastrophic wind slash damage.', emoji: '🌀' },

  // Arcane (Supreme reality-warping entity - Undisputed strongest in the game)
  { id: 'arcane_warper', name: 'Warper', rarity: 'Arcane', damage: 999999999, range: 3000, fireRate: 40, cost: 15000000, color: '#c084fc', isExtinct: true, aoeRange: 400, skillName: 'World Crusher', skillDesc: 'Form 1 (Warper): Shoots concentrated dual purple aura lasers. Form 2 (False Warp Deity): Fires a colossal Titan Form 2-style giant purple aura megabeam and 4 outer lasers with 2,000x blast damage! Absolute Stun & Disable Immunity. Special Trait: Death of World (buffs EVERYTHING x100 times). Active Skill (World Crusher): Instantly obliterates all active enemies on screen.', emoji: '🧿' },

  // The Chillful (Supreme tranquil entity - 0 DMG, Huge Range, Hypnotizes bad animals & hunters to attack enemies)
  { id: 'capybara', name: 'Capybara', rarity: 'The Chillful', damage: 0, range: 850, fireRate: 350, cost: 5000000, color: '#84cc16', isExtinct: false, role: 'support', skillName: 'The Chill Hypnotize', skillDesc: '[SUPPORT UNIT - CANNOT BE PURGED] Radiates soothing zen waves of pure peace (0 Base Damage, 850 Range). In range, up to 10 bad animals and hunter operatives become Hypnotized and attack enemy monsters in turncoat combat! Permanent Locked Trait: Motivation (+19,900% / x200 DMG boost, -10% Ability Cooldown). Dynamic Chill Meter fills as enemies are successfully hypnotized in range.', emoji: '🍊' },

  // ==========================================
  // FUSED CONSTRUCTS (Obtained via Fused Temple)
  // ==========================================
  { 
    id: 'fused_chimera_pup', 
    name: '[FUSED] Chimera Pup', 
    rarity: 'Rare', 
    damage: 65, 
    range: 160, 
    fireRate: 480, 
    cost: 450, 
    color: '#fb923c', 
    emoji: '🦁', 
    category: 'fused',
    isFused: true,
    role: 'hybrid',
    description: 'A cute but fierce fusion of rodent and avian genetics. Moves with common agility but strikes with rare precision.' 
  },
  { 
    id: 'fused_dire_alpha', 
    name: '[FUSED] Dire Alpha', 
    rarity: 'Epic', 
    damage: 195, 
    range: 170, 
    fireRate: 700, 
    cost: 1600, 
    color: '#eab308', 
    emoji: '🐺', 
    category: 'fused',
    isFused: true,
    role: 'damage',
    description: 'A hyper-aggressive fused wolf-fox predator. Channels raw instinct to tear through elite hunter lines.' 
  },
  { 
    id: 'fused_gryphon_sentinel', 
    name: '[FUSED] Gryphon Sentinel', 
    rarity: 'Legendary', 
    damage: 380, 
    range: 310, 
    fireRate: 1000, 
    cost: 5500, 
    color: '#38bdf8', 
    emoji: '🦅', 
    isFlying: true, 
    category: 'fused',
    isFused: true,
    role: 'damage',
    description: 'An epic owl-lion aerial hybrid with razor-sharp lightning talons. Watches over the sanctuary from high altitudes.' 
  },
  { 
    id: 'fused_megashark_rex', 
    name: '[FUSED] Megashark Rex', 
    rarity: 'Mythic', 
    damage: 2200, 
    range: 360, 
    fireRate: 1400, 
    cost: 32000, 
    color: '#ef4444', 
    emoji: '🦈', 
    aoeRange: 120, 
    category: 'fused',
    isFused: true,
    role: 'damage',
    skillName: 'Abyssal Chomp', 
    skillDesc: 'Every 4.5s, releases a massive bite shockwave that crushes and bleeds all enemies in range.', 
    description: 'A terrifying land-shark prehistoric hybrid. Combines mammoth size and megalodon jaw power.' 
  },
  { 
    id: 'fused_cosmic_basilisk', 
    name: '[FUSED] Cosmic Basilisk', 
    rarity: 'Secret', 
    damage: 15000, 
    range: 510, 
    fireRate: 480, 
    cost: 125000, 
    color: '#2dd4bf', 
    emoji: '🦎', 
    aoeRange: 280, 
    category: 'fused',
    isFused: true,
    role: 'hybrid',
    skillName: 'Cosmic Stardust Glare', 
    skillDesc: 'Every 3s, releases a pulse of petrifying stardust that freezes all surrounding enemies and inflicts extreme damage over time.', 
    description: 'A cosmic space-lizard that turns entire waves into stardust. Fused from primordial mythic reptiles.' 
  },
  { 
    id: 'fused_unrivaled_tempest_hydra', 
    name: '[FUSED] Tempest Sovereign Hydra', 
    rarity: 'Unrivaled', 
    damage: 850000, 
    range: 580, 
    fireRate: 280, 
    cost: 550000, 
    color: '#fb7185', 
    emoji: '🐲', 
    aoeRange: 320, 
    isFlying: true, 
    category: 'fused',
    isFused: true,
    role: 'damage',
    skillName: 'Cataclysmic Storm Surge', 
    skillDesc: 'Passive: Summons 7 swirling lightning tempests that continuously shred all enemies on screen with permanent armor-pierce.', 
    description: 'A transcendent multi-headed draconic storm deity fused from Secret genetics. Rules the turbulent skies with unrivaled fury.' 
  },
  { 
    id: 'fused_nebula_kaiser', 
    name: '[FUSED] Nebula Kaiser', 
    rarity: 'Celestial', 
    damage: 2500000, 
    range: 720, 
    fireRate: 220, 
    cost: 1200000, 
    color: '#c084fc', 
    emoji: '🤖', 
    aoeRange: 480, 
    isFlying: true, 
    category: 'fused',
    isFused: true,
    role: 'damage',
    skillName: 'Kaiser Nebula Collapse', 
    skillDesc: 'Every 3.5s, collapses nearby gravitational fields to pull all screen enemies to a center point and deal catastrophic damage.', 
    description: 'A galactic warlord born from Unrivaled matrices. Bends the stars to defend the sanctuary.' 
  },
  { 
    id: 'fused_singularity_overlord', 
    name: '[FUSED] Singularity Overlord', 
    rarity: '???', 
    damage: 8000000, 
    range: 960, 
    fireRate: 110, 
    cost: 3000000, 
    color: '#ec4899', 
    emoji: '🕳️', 
    aoeRange: 780, 
    isFlying: true, 
    category: 'fused',
    isFused: true,
    role: 'damage',
    skillName: 'Absolute Event Horizon', 
    skillDesc: 'Every 2s, manifests a massive black hole vortex that sweeps all non-boss entities directly to outer oblivion.', 
    description: 'A space-time tearing deity of absolute void power. The perfect convergence of celestial constructs.' 
  },
  { 
    id: 'fused_primal_omega', 
    name: '[FUSED] Primal Omega', 
    rarity: 'Original', 
    damage: 25000000, 
    range: 1300, 
    fireRate: 65, 
    cost: 8500000, 
    color: '#f59e0b', 
    emoji: '🪐', 
    aoeRange: 1150, 
    category: 'fused',
    isFused: true,
    role: 'damage',
    skillName: 'Genesis Supernova Pulse', 
    skillDesc: 'Every 1.2s, triggers a recursive absolute death-pulse sweeping outwards across 100% of the combat arena with holy radiation.', 
    description: 'An absolute god-tier construct that bends the fabric of reality itself. Fused from anomalous ??? singularities.' 
  },
  { 
    id: 'fused_chrono_watcher', 
    name: '[FUSED] Chrono Watcher', 
    rarity: 'Overseer', 
    damage: 150000000, 
    range: 1750, 
    fireRate: 85, 
    cost: 18000000, 
    color: '#00ffcc', 
    emoji: '👁️', 
    aoeRange: 1600, 
    isFlying: true, 
    category: 'fused',
    isFused: true,
    role: 'damage',
    skillName: 'Temporal Watcher Expansion', 
    skillDesc: 'Active Skill (8s Cooldown): Unfolds the layers of time-space, dealing 150x damage globally across the grid and freezing all active enemies in standard micro-stasis for 12.0 seconds.', 
    description: 'Merges watchtower systems and primal genesis energy. Observes and commands all dimensions with supreme authority.' 
  },
  { 
    id: 'fused_twin_singularity', 
    name: '[FUSED] Twin Singularity Sovereign', 
    rarity: 'Arcane', 
    damage: 2500000000, 
    range: 3600, 
    fireRate: 25, 
    cost: 35000000, 
    color: '#c084fc', 
    emoji: '🧿', 
    aoeRange: 1100, 
    category: 'fused',
    isFused: true,
    role: 'damage',
    skillName: 'Absolute Multiverse Collapse', 
    skillDesc: 'Form 1 (Sovereign): Fires concentrated dual hyper aura lasers. Form 2 (Deity of World): Fires giant purple megabeam with absolute stun and disable immunity. Special Trait: Death of World (+10,000% damage boost to all allied units!).', 
    description: 'The undisputed strongest entity in the multiverse, born of twin Overseer cores. Erases hostile existence with absolute finality.' 
  },
];

export const FEATURED_MYTHICS = ['trex', 'phoenix', 'dragon', 'mecha_rex', 'cthulhu', 'kaiju', 'celestial_pegasus', 'celestial_kitsune', 'celestial_leviathan', 'celestial_chronos', 'mystery_anomaly', 'mystery_singularity', 'mystery_nullifier', 'original_genesis', 'original_abyss'];

export const ENEMIES: EnemyType[] = [
  // ==========================================
  // 1. HUNTER SYNDICATE CORPS (HUMANS & CYBORG OPERATIVES)
  // ==========================================
  { 
    id: 'hunter_scout', 
    name: 'Syndicate Recon Scout', 
    health: 95, 
    speed: 1.8, 
    bounty: 65, 
    color: '#0284c7', 
    size: 16,
    isHunter: true,
    category: 'hunter',
    description: 'A nimble frontline hunter outfitted with recon radar goggles and tracking spikes.',
    appearance: 'Kevlar desert camo with glowing blue cybernetic eyepieces and rapid-dash hover boots.',
    abilities: ['Recon Ping: Marks closest defender towers, temporarily reducing defense priority.'],
    weakpoint: 'Light Armor: Standard physical projectiles and elemental splashes tear through their vests quickly.',
    emoji: '🤠'
  },
  { 
    id: 'hunter_poacher', 
    name: 'Heavy Net Trapper', 
    health: 180, 
    speed: 1.25, 
    bounty: 90, 
    color: '#d97706', 
    size: 19,
    isHunter: true,
    category: 'hunter',
    description: 'A seasoned poacher deploying electrified capture nets and reinforced body plating.',
    appearance: 'Rugged leather armor with steel shoulder plates and a heavy shoulder-mounted net cannon.',
    abilities: ['Electrified Trap: Launches capture nets that slow nearby towers attack rate by 20% for 3s.'],
    weakpoint: 'Heavy Payload: Slow walking speed makes them vulnerable to continuous laser beams.',
    emoji: '🪤'
  },
  { 
    id: 'hunter_sniper', 
    name: 'High-Caliber Marksman', 
    health: 120, 
    speed: 1.1, 
    bounty: 140, 
    color: '#4338ca', 
    size: 15,
    isHunter: true,
    category: 'hunter',
    description: 'An elite sharpshooter firing armor-piercing depleted uranium rounds from extreme range.',
    appearance: 'Thermal cloaked ghillie combat suit with a glowing violet target scope on its rifle.',
    abilities: ['Piercing Sight: Evades 25% of single-target direct attacks through reflex camouflage.'],
    weakpoint: 'Glass Cannon: Very low structural HP. Global AoE bursts eliminate them immediately.',
    emoji: '🎯'
  },
  { 
    id: 'hunter_exosuit', 
    name: 'Exosuit Vanguard Enforcer', 
    health: 650, 
    speed: 0.9, 
    bounty: 220, 
    color: '#334155', 
    size: 24,
    isHunter: true,
    category: 'hunter',
    description: 'Heavy hydraulic exosuit infantry carrying ballistic riot shields and shock batons.',
    appearance: 'Dark matte carbon-fiber power suit with hydraulic pistons and glowing yellow warning stripes.',
    abilities: ['Ballistic Shield: Frontal 40% damage resistance against kinetic bullet towers.'],
    weakpoint: 'Electrical Overload: Highly weak to lightning and stasis freeze attacks.',
    emoji: '🛡️'
  },
  { 
    id: 'hunter_drone_commander', 
    name: 'Syndicate Drone Coordinator', 
    health: 480, 
    speed: 1.35, 
    bounty: 280, 
    color: '#0d9488', 
    size: 20,
    isHunter: true,
    category: 'hunter',
    description: 'A tactical officer controlling combat micro-drones that scramble defender target systems.',
    appearance: 'Cybernetic headset with holographic HUD and miniature quadcopter drones buzzing overhead.',
    abilities: ['Drone Screen: Deploys 2 decoy target signals that absorb projectile hits.'],
    weakpoint: 'Signal Disruptor: Freezing or stunning the commander destroys its drone swarm.',
    emoji: '🛸'
  },
  { 
    id: 'hunter_cyber_ninja', 
    name: 'Cyber-Ninja Shadow Operative', 
    health: 320, 
    speed: 2.3, 
    bounty: 210, 
    color: '#6b21a8', 
    size: 17,
    isHunter: true,
    category: 'hunter',
    description: 'A cybernetically enhanced assassin phasing through reality with high-frequency blades.',
    appearance: 'Sleek obsidian-chrome stealth armor leaving holographic purple displacement clones.',
    abilities: ['Phase Shift: Dashes forward instantly over short distances when taking heavy damage.'],
    weakpoint: 'Area Stasis: Gravity wells and elemental freezing completely shut down their phase engines.',
    emoji: '🥷'
  },
  { 
    id: 'hunter_mech_walker', 
    name: 'Assault Mech-Strider', 
    health: 1950, 
    speed: 0.75, 
    bounty: 450, 
    color: '#b45309', 
    size: 28,
    isHunter: true,
    category: 'hunter',
    description: 'A two-legged mechanized combat walker mounted with dual rotary cannons and missile racks.',
    appearance: 'Desert-camo armored chassis walking on reinforced hydraulic legs with rotating Gatling pods.',
    abilities: ['Hydraulic Stride: Shakes the ground, clearing slow debuffs every 4 seconds.'],
    weakpoint: 'Joint Servos: Sustained multi-tower focus fire breaks down its leg hydraulics.',
    emoji: '🤖'
  },
  { 
    id: 'hunter_grand_inquisitor', 
    name: 'Grand Syndicate Inquisitor', 
    health: 125000, 
    speed: 0.65, 
    bounty: 6000, 
    color: '#e11d48', 
    size: 40, 
    isBoss: true,
    isHunter: true,
    category: 'hunter',
    description: 'The supreme commander of the poaching syndicate directing global animal containment ops.',
    appearance: 'Ornate crimson-gold command exo-armor with a glowing quantum barrier generator on its back.',
    abilities: [
      'Command Directive: Grants all surrounding hunters and bad beasts +25% speed and +20% HP.',
      'Barrier Matrix: Projects a pulsing 50,000 HP energy shield that absorbs incoming laser fire.'
    ],
    weakpoint: 'Shield Overload: Continuous barrage from Archon Overseer or Mythic towers punctures the barrier.',
    emoji: '👑'
  },
  { 
    id: 'hunter_dread_carrier', 
    name: 'Syndicate Siege Dreadnought', 
    health: 850000, 
    speed: 0.35, 
    bounty: 35000, 
    color: '#0f172a', 
    size: 50, 
    isBoss: true,
    isHunter: true,
    category: 'hunter',
    description: 'A massive floating fortress hover-carrier bristling with heavy artillery batteries and radar dishes.',
    appearance: 'Battleship-class hover hull with burning blue plasma engines and flashing warning beacons.',
    abilities: [
      'Heavy Bombardment: Fires EMP artillery shells that periodically stun defender towers.',
      'Reinforced Bulkhead: Reduces all incoming damage by 40% while above 50% HP.'
    ],
    weakpoint: 'Reactor Core: Suffers double damage when attacked by cosmic or magma elementals.',
    emoji: '🚢'
  },

  // ==========================================
  // 2. CORRUPTED BAD ANIMALS (INFECTED BEASTS)
  // ==========================================
  { 
    id: 'scout', 
    name: 'Infected Scout Rat', 
    health: 40, 
    speed: 1.5, 
    bounty: 50, 
    color: '#a8a29e', 
    size: 15,
    category: 'bad_animal',
    description: 'A swift, corrupted rodent carrying high-toxicity viral strains.',
    appearance: 'Rabid grey fur pulsing with neon red bio-sparks and hyper-mobility jump thrusts.',
    abilities: ['Swift Scurry: Innately immune to basic environmental slow-downs.'],
    weakpoint: 'Frail Bones: Low armor plating makes them simple targets for fast towers.',
    emoji: '🐀'
  },
  { 
    id: 'grunt', 
    name: 'Infected Grunt Badger', 
    health: 80, 
    speed: 1.2, 
    bounty: 75, 
    color: '#15803d', 
    size: 18,
    category: 'bad_animal',
    description: 'A vicious forest predator corrupted by bio-chemical fallout.',
    appearance: 'Plague-green thick hide with carbon-plated shoulder armor and high-frequency biting jaws.',
    abilities: ['Pack Instigation: Moves 10% faster when within 50 units of other Badgers.'],
    weakpoint: 'Exposed Hide: Vulnerable to Area-of-Effect (AoE) elemental magic (fire/water).',
    emoji: '🦡'
  },
  { 
    id: 'biker', 
    name: 'Mutant Swift Cobra', 
    health: 60, 
    speed: 2.5, 
    bounty: 100, 
    color: '#ea580c', 
    size: 14,
    category: 'bad_animal',
    description: 'An engineered desert reptile slithering at terrifying supersonic velocities.',
    appearance: 'Sleek copper-orange cyber-scales leaving a trail of high-voltage electric sparks.',
    abilities: ['Lightning Dash: Extremely high movement speed at the start of a wave.'],
    weakpoint: 'Ground Traction: Highly susceptible to absolute freezes and gravitational stasis.',
    emoji: '🐍'
  },
  { 
    id: 'tank', 
    name: 'Plague Heavy Rhino', 
    health: 300, 
    speed: 0.6, 
    bounty: 250, 
    color: '#78350f', 
    size: 25,
    category: 'bad_animal',
    description: 'An ancient heavyweight beast reinforced with thick organic iron-hide.',
    appearance: 'Deep brown armored plating with dual pneumatic tusk blasters and thick mud-wells.',
    abilities: ['Colossal Bulwark: Reduces incoming direct bullet damage by a flat 25%.'],
    weakpoint: 'Gigantic Mass: Extremely slow movement speed. Easy target for focused lasers and poison fields.',
    emoji: '🦏'
  },
  { 
    id: 'sniper', 
    name: 'Corrupted Laser Owl', 
    health: 50, 
    speed: 1.0, 
    bounty: 150, 
    color: '#2563eb', 
    size: 12,
    category: 'bad_animal',
    description: 'A genetically altered nocturnal bird focusing electromagnetic sniper beams.',
    appearance: 'Deep blue cybernetic feathers with active cloaking down and a glowing visor lens.',
    abilities: ['Disruptive Vision: Targets defenders, temporarily reducing their range by 15%.'],
    weakpoint: 'Hollow Bones: Extremely low health pool. Vulnerable to fast projectiles.',
    emoji: '🦉'
  },
  { 
    id: 'raider', 
    name: 'Bio-Acidic Mutant Toad', 
    health: 110, 
    speed: 1.7, 
    bounty: 90, 
    color: '#65a30d', 
    size: 17,
    category: 'bad_animal',
    description: 'A swamp-dwelling amphibian bloated with highly toxic radioactive bile.',
    appearance: 'Neon lime skin carrying high-pressure toxic poison bladders on its back.',
    abilities: ['Acid Blast: Explodes on death in an acid spray, causing minor splash damage.'],
    weakpoint: 'Volatile Sacs: Detonating adjacent units can cause their acid reserves to ignite.',
    emoji: '🐸'
  },
  { 
    id: 'shield', 
    name: 'Cyber-Shield Gorilla', 
    health: 450, 
    speed: 0.8, 
    bounty: 175, 
    color: '#0369a1', 
    size: 22,
    category: 'bad_animal',
    description: 'A heavily armored silverback ape equipped with experimental force shields.',
    appearance: 'Thick ocean-blue chest guard radiating a dynamic kinetic deflector shield.',
    abilities: ['Primal Deflector: Gains a kinetic shield equal to 20% max HP at wave start.'],
    weakpoint: 'Circuit Breaker: Takes double damage from high-frequency laser towers.',
    emoji: '🦍'
  },
  { 
    id: 'phantom', 
    name: 'Shadow Phantom Panther', 
    health: 90, 
    speed: 2.1, 
    bounty: 125, 
    color: '#4f46e5', 
    size: 15,
    category: 'bad_animal',
    description: 'An elusive, stealthy big cat infused with dark matter particles.',
    appearance: 'Pulsing indigo aura that periodically bends light to become semi-transparent.',
    abilities: ['Abyssal Camo: Becomes fully invisible every 4s, evading single-target locks.'],
    weakpoint: 'Luminance Shock: Stun, freeze, or stasis forced onto them instantly breaks camo.',
    emoji: '🐈‍⬛'
  },
  { 
    id: 'elite', 
    name: 'Elite Infected Lion', 
    health: 600, 
    speed: 1.1, 
    bounty: 350, 
    color: '#be123c', 
    size: 21,
    category: 'bad_animal',
    description: 'An alpha infected feline wearing ceremonial military exo-armor.',
    appearance: 'Blood-red steel mane with cybernetic claw extensions and crimson battle flags.',
    abilities: ['Primal Command: Emits a bloodlust roar granting nearby allies +15% movement speed.'],
    weakpoint: 'Apex Pride: Easily distracted. Susceptible to gravity vortexes and temporal blackholes.',
    emoji: '🦁'
  },
  { 
    id: 'reaper', 
    name: 'Robotic Reaper Falcon', 
    health: 200, 
    speed: 2.0, 
    bounty: 200, 
    color: '#334155', 
    size: 16,
    category: 'bad_animal',
    description: 'A mechanized aerial predator programmed to slice through defenders.',
    appearance: 'Grit-grey steel wings with rotating carbon-fiber blades mounted on its chassis.',
    abilities: ['Jet Thrust: Movement speed is doubled if health drops below 35%.'],
    weakpoint: 'Rotor Joints: Susceptible to high damage bursts which shatter their rotors.',
    emoji: '🦅'
  },
  { 
    id: 'mutant_armored_pangolin', 
    name: 'Obsidian Armored Pangolin', 
    health: 950, 
    speed: 1.6, 
    bounty: 300, 
    color: '#374151', 
    size: 20,
    category: 'bad_animal',
    description: 'A dense mutant beast curled into an impenetrable rolling sphere of obsidian scales.',
    appearance: 'Overlapping dark volcanic scales glowing with deep orange magma cracks.',
    abilities: ['Roll Charge: Gains 50% bonus movement speed and deflects 30% of projectiles.'],
    weakpoint: 'Unfurling: Slowing or freezing forces it out of its shell, exposing soft underbelly.',
    emoji: '🦔'
  },
  { 
    id: 'corrupted_thunder_stag', 
    name: 'Corrupted Thunder Stag', 
    health: 800, 
    speed: 2.0, 
    bounty: 320, 
    color: '#ca8a04', 
    size: 22,
    category: 'bad_animal',
    description: 'A mutant horned beast charging with crackling electric arc horns.',
    appearance: 'Golden-brown hide with electric blue neon antlers arcing high-voltage lightning bolts.',
    abilities: ['Static EMP: Discharges lightning bursts when hit, reducing tower fire rates.'],
    weakpoint: 'Grounding: Heavy dirt or water attacks discharge its electrical reserves.',
    emoji: '🦌'
  },
  { 
    id: 'bio_hydra_colossus', 
    name: 'Colossal Bio-Plague Hydra', 
    health: 4500, 
    speed: 0.75, 
    bounty: 1100, 
    color: '#047857', 
    size: 32,
    category: 'bad_animal',
    description: 'A multi-headed reptilian horror that regenerates tissue at horrifying speed.',
    appearance: 'Three snarling serpent heads with acidic green bio-sludge dripping from their fangs.',
    abilities: ['Regenerative Slime: Regenerates 2% of maximum HP every second while moving.'],
    weakpoint: 'Cauterization: Direct fire and magma damage negates all health regeneration.',
    emoji: '🐍'
  },
  { 
    id: 'doom_cruiser', 
    name: 'Doom Crusader Mammoth', 
    health: 3000, 
    speed: 1.0, 
    bounty: 750, 
    color: '#9f1239', 
    size: 26,
    category: 'bad_animal',
    description: 'A colossal ancient behemoth converted into a walking fortress.',
    appearance: 'Thick obsidian armor plating over heavy cybernetic walking pistons.',
    abilities: ['Cataclysmic Stomp: Emits shockwaves that slow and damage adjacent defenders.'],
    weakpoint: 'Piston Hydraulics: Freezing or stunning their mechanical limbs cuts move speed by 90%.',
    emoji: '🦣'
  },
  { 
    id: 'celestial_destroyer', 
    name: 'Void Titan Behemoth', 
    health: 8000, 
    speed: 0.85, 
    bounty: 1500, 
    color: '#1d4ed8', 
    size: 28,
    category: 'bad_animal',
    description: 'A massive dragon-like entity forged in the fires of an active supernova.',
    appearance: 'Cobalt scales overflowing with dark matter flames and stellar lightning surges.',
    abilities: ['Nebula Aura: Automatically reflects 10% of standard physical projectile damage.'],
    weakpoint: 'Aether Overwrite: Extremely vulnerable to transcendental entities (like Archon Overseer).',
    emoji: '🦕'
  },

  // High-Tech Specialist Variants
  {
    id: 'hitech_spectre',
    name: 'Spectre Camo Cobra',
    health: 750,
    speed: 1.7,
    bounty: 140,
    color: '#a855f7',
    size: 16,
    category: 'bad_animal',
    description: 'An elite serpentine bio-weapon utilizing active thermo-optic camouflage.',
    appearance: 'Translucent violet scales pulsing with faint ultraviolet fiber-optics.',
    abilities: [
      'Active Camouflage: Fully invisible to standard targeting unless frozen, slowed, or stunned.',
      'Reflex Weave: Evades 30% of incoming physical projectiles while moving.'
    ],
    weakpoint: 'Thermal Scanners: Stasis fields or temporal freezes fully disable their stealth grid.',
    emoji: '🐍'
  },
  {
    id: 'hitech_nullifier',
    name: 'Aegis Shield Armadillo',
    health: 2200,
    speed: 0.85,
    bounty: 240,
    color: '#38bdf8',
    size: 24,
    category: 'bad_animal',
    description: 'A heavily armored mammal projecting a rotating defensive energy shield.',
    appearance: 'Hexagonal chrome plates surrounded by a brilliant rotating translucent cobalt deflection bubble.',
    abilities: [
      'Aegis Shell: Deflects and negates 75% of physical bullet projectiles targeting its front.',
      'Shield Battery: Buffs armor resistance of smaller trailing units nearby by +20%.'
    ],
    weakpoint: 'Exposed Rear: Deflection bubble only covers its front face. Highly weak to global AoE spells.',
    emoji: '🦔'
  },
  {
    id: 'hitech_trapper',
    name: 'EMP Cyber-Spider',
    health: 1250,
    speed: 1.15,
    bounty: 180,
    color: '#f59e0b',
    size: 18,
    category: 'bad_animal',
    description: 'A mechanized arachnid specialist dropping electromagnetic web traps.',
    appearance: 'Grit-orange lightweight hazard gear integrated with active metallic spinnerets.',
    abilities: [
      'EMP Webbing: Periodically launches magnetic stun nets, disabling the closest tower for 3.0 seconds.',
      'Adrenaline Surge: Movement speed increases by +40% if its shield partners are defeated.'
    ],
    weakpoint: 'Acid Vulnerability: Suffers double damage from fire-based or poison-based damage.',
    emoji: '🕷️'
  },
  {
    id: 'hitech_decoy',
    name: 'Decoy Illusionist Kitsune',
    health: 1850,
    speed: 1.3,
    bounty: 220,
    color: '#ec4899',
    size: 20,
    category: 'bad_animal',
    description: 'A mythical multi-tailed fox capable of projecting realistic decoy illusions.',
    appearance: 'Pulsing hot pink holographic tails trailing a glowing spherical projection pod.',
    abilities: [
      'Illusion Matrix: Spawns fake replicas of high threat units to draw tower firepower.',
      'Discharge Aura: Reductes nearby tower precision and ranges by 15% using EMP fields.'
    ],
    weakpoint: 'Projection Array: Decoys collapse instantly if the Kitsune is frozen in stasis or hit directly.',
    emoji: '🦊'
  },
  {
    id: 'hitech_hover_dreadnought',
    name: 'Chrono Hover-Fortress Whale',
    health: 85000,
    speed: 0.45,
    bounty: 4500,
    color: '#10b981',
    size: 36,
    isBoss: true,
    category: 'bad_animal',
    description: 'A colossal levitating killer whale equipped with quantum space engines.',
    appearance: 'Gigantic cybernetic whale hull floating on green plasma thrusters and shielded by scanners.',
    abilities: [
      'Temporal Slipstream: Speeds up all trailing bad animals by +50% using gravity warp.',
      'Kinetic Feedback: Returns 15% of direct bullet projectile impacts back to defenders.'
    ],
    weakpoint: 'Exhaust Heat Pipes: Suffers a massive 3x damage multiplier if struck with high DPS lasers while in stasis.',
    emoji: '🐋'
  },
  {
    id: 'hitech_decoy_phantom',
    name: 'Holo-Decoy Spirit',
    health: 150,
    speed: 0.0,
    bounty: 0,
    color: '#f43f5e',
    size: 15,
    category: 'bad_animal',
    description: 'A phantom projection designed to draw tower fire away from the pack.',
    appearance: 'Translucent glowing magenta spirit shape that glitches in place.',
    abilities: ['Taunt Protocols: Forces nearby towers to lock onto its holographic signature.'],
    weakpoint: 'Unstable Core: Collapses immediately upon taking any damage or after 4.5 seconds.',
    emoji: '👻'
  },

  // ==========================================
  // 3. ULTRA-ARMORED COLOSSI (ULTRA HARD TO KILL, SURVIVES MASSIVE WARPER STRIKES)
  // ==========================================
  {
    id: 'ultra_adamantine_juggernaut',
    name: 'Adamantine Dreadnought Juggernaut',
    health: 500000000000, // 500 Billion HP
    speed: 0.45,
    bounty: 250000,
    color: '#475569',
    size: 52,
    isBoss: true,
    isUltraArmored: true,
    category: 'ultra_armored',
    armorReduction: 0.99, // 99% flat damage reduction
    maxDamagePerHit: 5000000000, // Max 5 Billion damage per single hit (Warper takes ~100 direct hits!)
    description: 'A monolithic mechanized dreadnought forged from ultra-dense adamantine alloy plates and active nanite barriers.',
    appearance: 'Impenetrable gunmetal plating surrounded by a shimmering geometric hex-nanite force field and glowing plasma vents.',
    abilities: [
      'Adamantine Nanite Matrix: Absorbs 99% of incoming damage; caps all single-hit damage to 5 Billion max.',
      'Unstoppable Fortress: Immune to absolute freezes, knockbacks, and instant-kill execution skills.'
    ],
    weakpoint: 'Sustained Laser Overheat: Continuous concentrated laser fire from high-tier towers slowly burns through its nanite shields.',
    emoji: '🛡️'
  },
  {
    id: 'ultra_titanium_goliath',
    name: 'Titanium Bastion Colossus',
    health: 250000000000, // 250 Billion HP
    speed: 0.55,
    bounty: 150000,
    color: '#64748b',
    size: 48,
    isBoss: true,
    isUltraArmored: true,
    category: 'ultra_armored',
    armorReduction: 0.985, // 98.5% damage reduction
    maxDamagePerHit: 3000000000, // Max 3 Billion damage per hit
    description: 'A towering bipedal fortress mech built with high-density titanium-carbide alloys and anti-matter dissipation plates.',
    appearance: 'Brushed titanium chassis with heavy hydraulic shock absorbers, glowing blue reactor core, and shoulder deflection bulwarks.',
    abilities: [
      'Kinetic Dispersion: Dissipates 98.5% of kinetic, elemental, and cosmic weapon damage.',
      'Thermal Surge Venting: Discharges absorbed laser energy as defensive shockwave pulses every 5 seconds.'
    ],
    weakpoint: 'Core Heat Exhaustion: Multi-elemental elemental combos (Fire + Ice + Cosmos) overload its cooling radiators.',
    emoji: '🦾'
  },
  {
    id: 'ultra_cyber_leviathan',
    name: 'Ultra-Armored Bio-Fortress Leviathan',
    health: 800000000000, // 800 Billion HP
    speed: 0.38,
    bounty: 400000,
    color: '#0284c7',
    size: 58,
    isBoss: true,
    isUltraArmored: true,
    category: 'ultra_armored',
    armorReduction: 0.992, // 99.2% damage reduction
    maxDamagePerHit: 8000000000, // Max 8 Billion per hit
    description: 'A prehistoric ocean leviathan encased in depleted uranium shell plating and multi-layer magnetic deflector shields.',
    appearance: 'Massive deep-blue armored carapace with glowing neon-cyan ion gills, heavy missile silos, and an impenetrable crest.',
    abilities: [
      'Depleted Uranium Shell: Absorbs 99.2% of cosmic, laser, and projectile damage with an 8B hit cap.',
      'Aegis Fleet Aura: Grants +40% armor and damage reduction to all trailing hostile units on the path.'
    ],
    weakpoint: 'Singularity Overwrite: Gravitational blackhole vortexes pull away its outer shell plating.',
    emoji: '🐋'
  },
  {
    id: 'ultra_hunter_warmachine',
    name: 'Syndicate Apex War-Biped',
    health: 1200000000000, // 1.2 Trillion HP
    speed: 0.4,
    bounty: 1000000,
    color: '#dc2626',
    size: 64,
    isBoss: true,
    isUltraArmored: true,
    isHunter: true,
    category: 'ultra_armored',
    armorReduction: 0.995, // 99.5% damage reduction
    maxDamagePerHit: 10000000000, // Max 10 Billion per hit
    description: 'The Hunter Syndicate’s crowning warmachine engineered specifically to hunt mythical, celestial, and divine beasts.',
    appearance: 'Colossal crimson-black heavy walking titan bristling with multi-railgun arrays, quantum energy shields, and heavy spiked adamantine treadplates.',
    abilities: [
      'Apex Adaptive Hull: Analyzes incoming attack vectors, mitigating 99.5% of damage with a strict 10B hit ceiling.',
      'EMP Pulse Wave: Periodically emits an electromagnetic shockwave that temporarily disrupts nearby defender firing arrays.'
    ],
    weakpoint: 'Overloaded Heatsinks: Prolonged barrage from multiple Pinnacle / Unrivaled defenders eventually burns through its core.',
    emoji: '🤖'
  },

  // ==========================================
  // 4. BOSS RUSH / WAVE BOSSES
  // ==========================================
  { id: 'hitech', name: 'Infected Warlord Gorilla', health: 1500, speed: 1.0, bounty: 1000, color: '#a21caf', size: 30, isBoss: true, category: 'boss', emoji: '🦍' },
  { id: 'mech_goliath', name: 'Cyber Goliath Grizzly', health: 3500, speed: 0.7, bounty: 1800, color: '#ca8a04', size: 35, isBoss: true, category: 'boss', emoji: '🐻' },
  { id: 'alien_empress', name: 'Queen Empress Scorpion', health: 7000, speed: 0.9, bounty: 3000, color: '#ec4899', size: 32, isBoss: true, category: 'boss', emoji: '🦂' },
  { id: 'void_devourer', name: 'Astra Void Devourer Hydra', health: 15000, speed: 0.8, bounty: 5000, color: '#2563eb', size: 38, isBoss: true, category: 'boss', emoji: '🐉' },
  { id: 'mutant_abomination', name: 'Alpha Bio-Chimera', health: 32000, speed: 0.5, bounty: 9000, color: '#10b981', size: 42, isBoss: true, category: 'boss', emoji: '🦁' },
  { id: 'chronos_harbinger', name: 'Temporal Basilisk Overlord', health: 75000, speed: 0.6, bounty: 18000, color: '#f43f5e', size: 45, isBoss: true, category: 'boss', emoji: '🦎' },
  { id: 'singularity_core', name: 'Singularity Core Kraken', health: 180000, speed: 0.4, bounty: 35000, color: '#8b5cf6', size: 48, isBoss: true, category: 'boss', emoji: '🐙' },
  { id: 'omega_titan_annihilator', name: 'Omega Titan Cyber-Rex', health: 450000, speed: 0.35, bounty: 75000, color: '#991b1b', size: 52, isBoss: true, category: 'boss', emoji: '🦖' },
  { id: 'multiverse_dreadnought', name: 'Multiverse Dreadnought Dragon', health: 1200000, speed: 0.3, bounty: 150000, color: '#dc2626', size: 56, isBoss: true, category: 'boss', emoji: '🐉' },
  { id: 'ultimate_overseer_hunter', name: 'Transcendence Void Pegasus', health: 4500000, speed: 0.25, bounty: 500000, color: '#00ffcc', size: 60, isBoss: true, category: 'boss', emoji: '🦄' },
  
  // Custom Special Hunter Commander enemy
  { 
    id: 'hunter_commander', 
    name: 'Aegis Apex Sabertooth', 
    health: 15000000, 
    speed: 0.75, 
    bounty: 800, 
    color: '#f43f5e', 
    size: 38, 
    isBoss: true,
    category: 'boss',
    description: 'An ultimate prehistoric predator enhanced with glowing titanium battle rigs.',
    appearance: 'Exquisite titanium armor plating over colossal cybernetic claws, pulsing with red overlays.',
    abilities: [
      'Beast Lord Presence: Emits an alpha howl boosting the health and speed of all trailing bad animals.',
      'Saber Guard: Shielding renders them temporarily immune to standard field traps.'
    ],
    weakpoint: 'Overseer Execution: Highly weak to the reality-erasure laser beams of an Archon Overseer.',
    emoji: '🐯'
  },
  { 
    id: 'unrivaled_original', 
    name: 'The Unrivaled Dark Phoenix', 
    health: 40000000, 
    speed: 0.5, 
    bounty: 5000, 
    color: '#fb7185', 
    size: 55, 
    isBoss: true,
    category: 'boss',
    description: 'A reality-corrupting primordial bird. It commands all species blueprints to bend reality.',
    appearance: 'A magnificent black hole core cloaked in solar flames, rotating golden armor plates.',
    abilities: [
      'Void Rebirth: Possesses celestial grade health pool and absolute resistance to passive slows.',
      'Quantum Rewind: Rewrites active damage logs, regenerating health when targeted standardly.'
    ],
    weakpoint: 'Unrivaled Overwrite: Vulnerable only to the reality-overwrite finish skills of an Unrivaled allied unit.',
    emoji: '🐦‍🔥'
  },
  {
    id: 'ultra_world_boss',
    name: '👑 ULTRA WORLD BOSS - GOD OF DESTRUCTION',
    health: 100000000000000,
    speed: 0,
    bounty: 10000000,
    color: '#a855f7',
    size: 150,
    isBoss: true,
    category: 'boss',
    emoji: '👾',
    description: 'The supreme omnipotent sovereign entity of cosmic destruction. Stationary raid boss.',
    appearance: 'Dark matter sovereign star with rotating runic energy halos and orbiting celestial shields.',
    abilities: ['Omnipresent Stasis: Immobile, but projects global reality distortions across the entire board.'],
    weakpoint: 'Collective Firepower: Overcome only by fully upgraded Pinnacle deities and Unrivaled titans.'
  },

  // ==========================================
  // 5. EXTRATERRESTRIAL ALIEN ARMADA & COLOSSI
  // ==========================================
  {
    id: 'alien_crawler',
    name: 'Xenomorph Bio-Crawler',
    health: 550,
    speed: 1.85,
    bounty: 150,
    color: '#84cc16',
    size: 18,
    isAlien: true,
    category: 'alien',
    description: 'A rapid predatory extraterrestrial larva that scuttles across the defense lanes in swarms.',
    appearance: 'Bioluminescent toxic-green chitinous exoskeleton with razor-sharp mandibles and acidic saliva.',
    abilities: ['Swarm Scuttle: Moves 20% faster when clustered with other alien units.'],
    weakpoint: 'Concussive Blasts: Highly vulnerable to area-of-effect elemental explosions.',
    emoji: '🐛'
  },
  {
    id: 'alien_stalker',
    name: 'Chitinous Warp Stalker',
    health: 2200,
    speed: 1.6,
    bounty: 380,
    color: '#a855f7',
    size: 24,
    isAlien: true,
    category: 'alien',
    description: 'A stealthy alien assassin capable of micro-warping through space to evade direct projectile trajectories.',
    appearance: 'Translucent violet carapace flickering with temporal phase-shift distortion rings.',
    abilities: ['Phase Shifter: Periodically phases out of reality to ignore 35% of incoming bullet impacts.'],
    weakpoint: 'Temporal Stasis: Slowing or freezing fields completely disable its phase drive organs.',
    emoji: '🦗'
  },
  {
    id: 'alien_acid_spitter',
    name: 'Corrosive Plasma Spitter',
    health: 4200,
    speed: 1.05,
    bounty: 650,
    color: '#10b981',
    size: 28,
    isAlien: true,
    category: 'alien',
    description: 'Heavy bio-artillery alien creature with an enlarged chemical dorsal sac that sprays concentrated acid.',
    appearance: 'Bulbous pulsating lime-emerald toxic sac mounted on a tripod chitin walker.',
    abilities: ['Acid Vapor: Discharges a corrosive fog that slightly reduces the attack range of nearby towers.'],
    weakpoint: 'Dorsal Sac Rupture: Sustained laser fire ignites its acid bladder, triggering an internal explosion.',
    emoji: '🧪'
  },
  {
    id: 'alien_mind_flayer',
    name: 'Psionic Overmind Leech',
    health: 7500,
    speed: 0.8,
    bounty: 1400,
    color: '#ec4899',
    size: 32,
    isAlien: true,
    category: 'alien',
    description: 'A floating psionic entity capable of broadcasting telepathic distortion waves across the battlefield.',
    appearance: 'Hovering magenta-purple cerebral core surrounded by undulating psionic neural tendrils.',
    abilities: ['Psionic Jammer: Emits electromagnetic psychic waves that periodically delay tower attack cooldowns.'],
    weakpoint: 'Synaptic Overload: Extremely weak to high-tier cosmic and transcendental energy bursts.',
    emoji: '🐙'
  },
  {
    id: 'alien_plasma_centurion',
    name: 'Xenon Bio-Mech Centurion',
    health: 18000,
    speed: 0.65,
    bounty: 3000,
    color: '#06b6d4',
    size: 38,
    isAlien: true,
    category: 'alien',
    description: 'An elite cybernetic shock trooper fused with living extraterrestrial war alloy and plasma blades.',
    appearance: 'Armored obsidian battle chassis energized by pulsing cyan plasma conduits and dual energy cleavers.',
    abilities: ['Living Alloy Barrier: Mitigates 45% of incoming damage and deflects 15% of kinetic projectiles.'],
    weakpoint: 'Plasma Joint Seals: Magma and lightning elements overheat and melt its hydraulic chassis.',
    emoji: '🤖'
  },
  {
    id: 'alien_bio_titan',
    name: '👑 XENON TITAN COLOSSUS',
    health: 4500000000, // 4.5 Billion HP
    speed: 0.35,
    bounty: 600000,
    color: '#84cc16',
    size: 72,
    isBoss: true,
    isUltraArmored: true,
    isAlien: true,
    category: 'alien',
    armorReduction: 0.985, // 98.5% damage reduction
    maxDamagePerHit: 1500000000, // Max 1.5 Billion damage per single hit
    description: 'The supreme walking ground titan of the extraterrestrial invasion. A towering bio-mechanical colossus wielding dual bio-plasma shoulder cannons, nanite self-regeneration, and cataclysmic seismic stomps.',
    appearance: 'Colossal biped titan chassis forged of dark biomechanical chitin and glowing radioactive green plasma conduits, topped with a psionic crystal crown.',
    abilities: [
      'Twin Bio-Plasma Cannons: Channels twin heavy acid-plasma laser beams that suppress defensive lines.',
      'Cataclysmic Bio-Stomp: Slams the terrain, sending out kinetic shockwaves that disrupt defender targeting.',
      'Nanite Bio-Regeneration: Living cellular armor regenerates 0.5% max HP every 4 seconds.'
    ],
    weakpoint: 'Plasma Core Meltdown: Prolonged focus from fully upgraded Pinnacle/Overseer/Titan laser arrays breaks its core shield.',
    emoji: '👾'
  },
  {
    id: 'alien_mothership',
    name: '🛸 XENON MOTHERSHIP FLAGSHIP',
    health: 12000000000, // 12 Billion HP
    speed: 0.25,
    bounty: 1500000,
    color: '#00f0ff',
    size: 110,
    isBoss: true,
    isUltraArmored: true,
    isAlien: true,
    isFlying: true,
    category: 'alien',
    armorReduction: 0.992, // 99.2% damage reduction
    maxDamagePerHit: 2500000000, // Max 2.5 Billion per hit
    description: 'The catastrophic command flagship of the alien armada hovering in high orbit. Projects a multi-layered anti-gravity deflection shield, fires orbital death rays, and teleports alien invasion pods onto the path.',
    appearance: 'Gigantic saucer-shaped orbital dreadnought with counter-rotating neon energy rings, ventral tractor-beam core, and heavy plasma turrets.',
    abilities: [
      'Orbital Annihilation Beam: Fires an immense orbital death ray down from the clouds.',
      'Alien Swarm Pod Teleport: Warps in squads of Xenomorph Bio-Crawlers and Warp Stalkers directly into battle.',
      'Anti-Gravity Deflector Grid: 99.2% damage reduction deflector field with high-altitude aerial flight.'
    ],
    weakpoint: 'Ventral Tractor Reactor: Air-to-air dogfights and direct high-altitude hyper-beams shatter its anti-gravity generator.',
    emoji: '🛸'
  },

  // ==========================================
  // 6. GHOST & ETHEREAL SPECTRES (REQUIRE GHOST VISION GLASSES TO ATTACK)
  // ==========================================
  {
    id: 'ghost_phantom',
    name: 'Ethereal Phantom Ghost',
    health: 3500,
    speed: 1.6,
    bounty: 300,
    color: '#a78bfa',
    size: 20,
    isGhost: true,
    category: 'ghost',
    description: 'An ethereal specter wandering between the physical and spirit planes. Completely untargetable without Ghost Vision Glasses.',
    appearance: 'Pulsing violet and cyan spectral mist floating gracefully above the ground.',
    abilities: [
      'Ethereal Phase: Immune to all physical and energy targeting unless defenders are equipped with Ghost Vision Glasses.',
      'Spirit Wail: Chills nearby animals, reducing their attack rate slightly.'
    ],
    weakpoint: 'Ghost Vision: Once spectral visors are equipped, ghosts take 50% bonus damage from light-based and cosmic attacks.',
    emoji: '👻'
  },
  {
    id: 'ghost_wraith',
    name: 'Shadow Wraith Stalker',
    health: 8500,
    speed: 2.1,
    bounty: 650,
    color: '#818cf8',
    size: 24,
    isGhost: true,
    category: 'ghost',
    description: 'A swift, aggressive wraith that glides swiftly across the terrain with complete phase invisibility.',
    appearance: 'Dark shadow-flame shroud with piercing glowing white spirit eyes.',
    abilities: [
      'Spectral Shift: Untargetable without Ghost Vision Glasses. Accelerates as health decreases.'
    ],
    weakpoint: 'Spectral Visors & Magic Beams: Pierced instantly when Ghost Vision Glasses are active.',
    emoji: '🌫️'
  },
  {
    id: 'ghost_banshee',
    name: '👑 Spectral Banshee Empress',
    health: 450000,
    speed: 0.8,
    bounty: 25000,
    color: '#c084fc',
    size: 48,
    isBoss: true,
    isGhost: true,
    category: 'ghost',
    description: 'A terrifying supreme ghost sovereign. Haunts the battlefield and demands spectral visors to be perceived.',
    appearance: 'Crown of ghostly blue starlight floating amidst swirling astral spirits and ethereal vortexes.',
    abilities: [
      'Astral Shroud: Requires Ghost Vision Glasses to target and attack.',
      'Screech of the Damned: Periodically projects sonic spirit rings.'
    ],
    weakpoint: 'Ghost Vision Glasses: Grants all towers full lock-on accuracy.',
    emoji: '👤'
  }
];

export const ALIEN_ENEMIES: EnemyType[] = ENEMIES.filter(e => e.isAlien || e.category === 'alien');

export const RARITY_WEIGHTS = {
  Common: 40,
  Rare: 25,
  Epic: 14.993999,
  Legendary: 10,
  Mythic: 5,
  Secret: 5,
  Unrivaled: 0.1,
  Celestial: 0.005,
  '???': 0.001,
  Arcane: 0.000001,
};

export const GRID_SIZE = 40;
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export function getFeaturedMythicsAtTime(timeMs: number): Animal[] {
  const mythicPool = ANIMALS.filter(a => a.rarity === 'Mythic');
  if (mythicPool.length <= 3) return mythicPool;
  
  const twentyMinIndex = Math.floor(timeMs / (20 * 60 * 1000));
  const selected: Animal[] = [];
  let seed = twentyMinIndex;
  const poolCopy = [...mythicPool];
  
  for (let i = 0; i < 3; i++) {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    const index = Math.abs(seed) % poolCopy.length;
    selected.push(poolCopy[index]);
    poolCopy.splice(index, 1);
  }
  return selected;
}

export const ANIMAL_ELEMENTS: Record<string, 'fire' | 'poison' | 'water' | 'sand' | 'dirt' | 'ice' | 'wind' | 'lightning' | 'light' | 'shadow' | 'magma' | 'cosmos'> = {
  // Common
  mouse: 'dirt',
  rabbit: 'ice',
  pigeon: 'wind',
  hedgehog: 'dirt',
  sparrow: 'wind',
  
  // Rare
  fox: 'fire',
  wolf: 'dirt',
  eagle: 'wind',
  bee: 'poison',
  cobra: 'poison',
  panther: 'fire',
  
  // Epic
  lion: 'fire',
  bear: 'dirt',
  croc: 'water',
  rhino: 'dirt',
  owl: 'ice',
  
  // Legendary
  mammoth: 'ice',
  smilodon: 'wind',
  dodo: 'wind',
  megalodon: 'water',
  terror_bird: 'wind',
  
  // Mythic
  trex: 'dirt',
  phoenix: 'fire',
  dragon: 'fire',
  basilisk: 'poison',
  chimera: 'fire',
  griffin: 'wind',
  kraken: 'water',
  hydra: 'poison',
  
  // Secret
  mecha_rex: 'fire',
  cthulhu: 'poison',
  kaiju: 'poison',
  secret_stardust: 'wind',
  secret_nebula_kraken: 'water',
  secret_quantum_glitch: 'wind',
  secret_cyber_viper: 'poison',
  secret_solar_lion: 'fire',
  
  // Celestial
  celestial_pegasus: 'wind',
  celestial_kitsune: 'fire',
  celestial_leviathan: 'water',
  celestial_chronos: 'ice',
  celestial_seraph: 'wind',
  celestial_behemoth: 'dirt',
  
  // ???
  mystery_anomaly: 'wind',
  mystery_singularity: 'fire',
  mystery_nullifier: 'poison',
  mystery_eclipse: 'fire',
  mystery_entropy: 'ice',
  mystery_supervoid: 'ice',
  mystery_continuum: 'sand',
  mystery_darkstar: 'fire',
  
  // Original
  original_genesis: 'dirt',
  original_abyss: 'dirt',
  blackhole_dwarf: 'dirt',
  original_ragnarok: 'fire',
  original_omega: 'fire',
  
  // Overseer
  all_seeing_overseer: 'dirt',
  elemental_god: 'fire', // Custom handled dynamically as well
  buffer: 'dirt',

  // Unrivaled
  unrivaled_solar_phoenix: 'fire',
  unrivaled_void_behemoth: 'dirt',
  unrivaled_frost_dragon: 'ice',
  unrivaled_storm_wyvern: 'wind',
  arcane_warper: 'cosmos',
  capybara: 'dirt'
};

export const ELEMENT_COLORS: Record<string, string> = {
  fire: '#ef4444',
  poison: '#10b981',
  water: '#3b82f6',
  sand: '#f59e0b',
  dirt: '#b45309',
  ice: '#06b6d4',
  wind: '#94a3b8',
  lightning: '#eab308',
  light: '#facc15',
  shadow: '#a855f7',
  magma: '#f97316',
  cosmos: '#ec4899',
};

export const ELEMENT_ICONS: Record<string, string> = {
  fire: '🔥',
  poison: '☣️',
  water: '💧',
  sand: '🌪️',
  dirt: '⛰️',
  ice: '❄️',
  wind: '🍃',
  lightning: '⚡',
  light: '✨',
  shadow: '🔮',
  magma: '🌋',
  cosmos: '🌌',
};

export function formatDamageNumber(dmg: number): string {
  if (dmg >= 1e15) return (dmg / 1e15).toFixed(1).replace(/\.0$/, '') + 'Q';
  if (dmg >= 1e12) return (dmg / 1e12).toFixed(1).replace(/\.0$/, '') + 'T';
  if (dmg >= 1e9) return (dmg / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
  if (dmg >= 1e6) return (dmg / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (dmg >= 1e3) return (dmg / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  return Math.round(dmg).toString();
}



