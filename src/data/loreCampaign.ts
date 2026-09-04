export interface LoreWaveData {
  wave: number;
  sagaNumber: number;
  sagaTitle: string;
  chapterTitle: string;
  speaker: string;
  speakerTitle: string;
  speakerEmoji: string;
  speakerColor: string;
  dialogue: string;
  lorePiece: string;
  unlockedAnimalId?: string;
  bossTitle?: string;
}

export interface LoreChapter {
  id: number;
  title: string;
  subtitle: string;
  minWave: number;
  speaker: string;
  speakerTitle: string;
  speakerEmoji: string;
  speakerColor: string;
  dialogue: string[];
  loreSnippet: string;
  unlockedReward?: string;
}

export const LORE_SAGAS = [
  { id: 1, name: 'Saga I: Primal Dawn & Sanctuary Genesis', waveRange: 'Waves 1 - 40', color: '#10b981' },
  { id: 2, name: 'Saga II: The Hunter Syndicate Incursion', waveRange: 'Waves 41 - 80', color: '#f59e0b' },
  { id: 3, name: 'Saga III: Extinct Megafauna & Fossil Resonance', waveRange: 'Waves 81 - 120', color: '#ef4444' },
  { id: 4, name: 'Saga IV: Mythic Behemoths & Draconic Rites', waveRange: 'Waves 121 - 160', color: '#dc2626' },
  { id: 5, name: 'Saga V: Cybernetic Anomaly & The Syndicate EMP', waveRange: 'Waves 161 - 200', color: '#06b6d4' },
  { id: 6, name: 'Saga VI: The Unrivaled Reality Overwriters', waveRange: 'Waves 201 - 250', color: '#ec4899' },
  { id: 7, name: 'Saga VII: Celestial Pantheon & Astral Horrors', waveRange: 'Waves 251 - 300', color: '#8b5cf6' },
  { id: 8, name: 'Saga VIII: The Anonymous ??? Event Horizon', waveRange: 'Waves 301 - 350', color: '#a855f7' },
  { id: 9, name: 'Saga IX: Primordial Genesis & Overseer Council', waveRange: 'Waves 351 - 380', color: '#00ffcc' },
  { id: 10, name: 'Saga X: The Armored Titan & Twin Arcane Singularity', waveRange: 'Waves 381 - 400', color: '#c084fc' }
];

// Mapping wave -> animalId unlocked in Lore Mode
export const ANIMAL_LORE_UNLOCKS: Record<number, string> = {
  1: 'mouse', // Starting starters
  2: 'rabbit',
  3: 'sparrow',
  4: 'hedgehog',
  5: 'pigeon',
  7: 'fox',
  10: 'wolf',
  14: 'cobra',
  18: 'eagle',
  22: 'panther',
  26: 'bee', // Money Maker
  30: 'lion',
  35: 'bear',
  40: 'croc',
  45: 'rhino',
  50: 'owl',
  60: 'mammoth', // 1st Extinct Legendary
  65: 'dodo',
  70: 'smilodon',
  75: 'megalodon',
  80: 'terror_bird',
  90: 'basilisk', // Mythic
  100: 'phoenix',
  110: 'griffin',
  120: 'hydra',
  130: 'kraken',
  140: 'dragon',
  150: 'chimera',
  160: 'trex',
  175: 'mecha_rex', // Secret
  190: 'secret_stardust',
  205: 'cthulhu',
  220: 'kaiju',
  235: 'secret_nebula_kraken',
  245: 'secret_solar_lion',
  255: 'secret_quantum_glitch',
  265: 'secret_cyber_viper',
  275: 'unrivaled_solar_phoenix', // Unrivaled
  285: 'unrivaled_frost_dragon',
  295: 'unrivaled_storm_wyvern',
  305: 'unrivaled_void_behemoth',
  315: 'celestial_pegasus', // Celestial
  325: 'celestial_kitsune',
  335: 'celestial_seraph',
  345: 'celestial_leviathan',
  350: 'celestial_chronos',
  355: 'titan_defender', // The Armored Titan & Multiverse Watcher - Unlocked at wave 355!
  360: 'mystery_anomaly', // ???
  365: 'mystery_singularity',
  370: 'mystery_nullifier',
  375: 'mystery_eclipse',
  378: 'mystery_entropy',
  380: 'mystery_supervoid',
  382: 'mystery_continuum',
  384: 'mystery_darkstar',
  385: 'buffer', // Original
  386: 'original_genesis',
  388: 'original_abyss',
  390: 'blackhole_dwarf',
  392: 'original_ragnarok',
  394: 'original_omega',
  395: 'all_seeing_overseer', // The Archon Overseer - Strong unit unlocked at wave 395!
  396: 'elemental_god', // The Elemental Deity - Overseer tier unlocked at wave 396!
  397: 'celestial_behemoth', // Extraterrestrial Alien Tech Singularity & Cosmic Behemoth at wave 397!
  398: 'capybara', // The Chillful Support Deity unlocked at wave 398!
  399: 'arcane_warper' // Warper - Supreme 1st Arcane Deity unlocked at wave 399!
};

// Compute reverse mapping animalId -> unlockWave
export const ANIMAL_UNLOCK_WAVE_MAP: Record<string, number> = Object.entries(ANIMAL_LORE_UNLOCKS).reduce((acc, [wStr, id]) => {
  acc[id] = parseInt(wStr, 10);
  return acc;
}, {} as Record<string, number>);

export function getAnimalUnlockWave(animalId: string): number {
  return ANIMAL_UNLOCK_WAVE_MAP[animalId] || 1;
}

export function isAnimalUnlockedInLoreMode(animalId: string, currentLoreWave: number): boolean {
  const reqWave = ANIMAL_UNLOCK_WAVE_MAP[animalId] || 1;
  return currentLoreWave >= reqWave;
}

export function getUnlockedAnimalsForLoreWave(currentLoreWave: number): string[] {
  const unlocked: string[] = [];
  for (const [wStr, animalId] of Object.entries(ANIMAL_LORE_UNLOCKS)) {
    if (currentLoreWave >= parseInt(wStr, 10)) {
      unlocked.push(animalId);
    }
  }
  return unlocked;
}

// Handcrafted pivotal narrative milestones across the 400 waves
const HANDCRAFTED_LORE_MILESTONES: Record<number, Partial<LoreWaveData>> = {
  1: {
    sagaNumber: 1,
    sagaTitle: 'Saga I: Primal Dawn & Sanctuary Genesis',
    chapterTitle: 'Chapter 1: The First Scent of Danger',
    speaker: 'Elder Field Mouse',
    speakerTitle: 'Sanctuary Pathfinder',
    speakerEmoji: '🐭',
    speakerColor: '#94a3b8',
    dialogue: 'The ground trembles with heavy industrial boots. The Syndicate is here... We must defend the burrows!',
    lorePiece: 'Long before human poachers constructed mechanized cages, the animal kingdoms lived in pristine balance under the protection of the Gaia Leylines.'
  },
  5: {
    sagaNumber: 1,
    sagaTitle: 'Saga I: Primal Dawn & Sanctuary Genesis',
    chapterTitle: 'Chapter 5: Whispers of the Red Fox',
    speaker: 'Red Fox',
    speakerTitle: 'Trickster Scout',
    speakerEmoji: '🦊',
    speakerColor: '#f97316',
    dialogue: 'I smelled motor oil and ozone on the northern perimeter. The poachers are setting electro-nets!',
    lorePiece: 'Syndicate scouts deployed early cybernetic tracking tags across the forest floor, attempting to map animal migration corridors.'
  },
  10: {
    sagaNumber: 1,
    sagaTitle: 'Saga I: Primal Dawn & Sanctuary Genesis',
    chapterTitle: 'Chapter 10: Pack of the Silver Moon',
    speaker: 'Grey Wolf Alpha',
    speakerTitle: 'Pack Lord',
    speakerEmoji: '🐺',
    speakerColor: '#475569',
    dialogue: 'Our howling echoes across the valley. No hunter shall breach our sacred glade!',
    lorePiece: 'Wolves were the first to recognize the synthetic scent of cyborg infiltrators, training young pups to sever pneumatic control cables.',
    bossTitle: 'Syndicate Outpost Overseer'
  },
  25: {
    sagaNumber: 1,
    sagaTitle: 'Saga I: Primal Dawn & Sanctuary Genesis',
    chapterTitle: 'Chapter 25: The Golden Hive Resonance',
    speaker: 'Queen Golden Bee',
    speakerTitle: 'Hive Sovereign',
    speakerEmoji: '🐝',
    speakerColor: '#fbbf24',
    dialogue: 'Our pollen vibrates with divine meat generation! Feed the defenders, for a great darkness approaches.',
    lorePiece: 'Golden bees produce crystallized bio-meat through solar photosynthesis, funding the fortification of animal redoubts across the map.'
  },
  30: {
    sagaNumber: 1,
    sagaTitle: 'Saga I: Primal Dawn & Sanctuary Genesis',
    chapterTitle: 'Chapter 30: Roar of the Golden Plains',
    speaker: 'King Lion',
    speakerTitle: 'Savanna Monarch',
    speakerEmoji: '🦁',
    speakerColor: '#eab308',
    dialogue: 'The plains shall not become their slaughterhouse! Bow before the sovereign pride of nature!',
    lorePiece: 'King Lion unified the predatory carnivores and grazing herds under the Great Pact of the Watering Hole to repel poacher gunships.'
  },
  50: {
    sagaNumber: 2,
    sagaTitle: 'Saga II: The Hunter Syndicate Incursion',
    chapterTitle: 'Chapter 50: The EMP Deployment Protocol',
    speaker: 'Syndicate High Inquisitor Gideon',
    speakerTitle: 'Hunter Legion Commander',
    speakerEmoji: '🤖',
    speakerColor: '#ef4444',
    dialogue: 'Deploy the electromagnetic disruption coils! Any non-organic machine they build will freeze on our signal!',
    lorePiece: 'The Syndicate developed specialized EMP waves designed to cripple synthetic weapons. However, pure biological primal animals remain untouched by electromagnetic stuns.',
    bossTitle: 'Grand Inquisitor Gideon'
  },
  60: {
    sagaNumber: 3,
    sagaTitle: 'Saga III: Extinct Megafauna & Fossil Resonance',
    chapterTitle: 'Chapter 60: Awakening of the Tundra Colossus',
    speaker: 'Woolly Mammoth',
    speakerTitle: 'Prehistoric Vanguard',
    speakerEmoji: '🦣',
    speakerColor: '#a8a29e',
    dialogue: 'Ten thousand years beneath permafrost... yet the pulse of the Earth calls me once more!',
    lorePiece: 'Deep seismic drilling by Syndicate miners cracked open the glacial vaults of the Pleistocene epoch, releasing ancient titans that were thought lost to time.'
  },
  80: {
    sagaNumber: 3,
    sagaTitle: 'Saga III: Extinct Megafauna & Fossil Resonance',
    chapterTitle: 'Chapter 80: The Apex Terror from the Skies',
    speaker: 'Apex Terror Bird',
    speakerTitle: 'Cenozoic Raptor',
    speakerEmoji: '🦅',
    speakerColor: '#e11d48',
    dialogue: 'Our talons crushed ancient steel long before humanity invented gunpowder!',
    lorePiece: 'Terror Birds ruled the prehistoric savanna with bone-shattering beak strikes, providing high-velocity aerial defense.'
  },
  100: {
    sagaNumber: 4,
    sagaTitle: 'Saga IV: Mythic Behemoths & Draconic Rites',
    chapterTitle: 'Chapter 100: Solar Rebirth of the Phoenix',
    speaker: 'Fire Phoenix',
    speakerTitle: 'Immortal Solar Deity',
    speakerEmoji: '🔥',
    speakerColor: '#ef4444',
    dialogue: 'From atomic ashes we ignite the celestial flame! Burn their war engines into slag!',
    lorePiece: 'When Syndicate incendiary rounds razed the Redwood Canopy, a mystical combustion ignited the soul of the First Phoenix.',
    bossTitle: 'Syndicate Siege Dreadnought Alpha'
  },
  140: {
    sagaNumber: 4,
    sagaTitle: 'Saga IV: Mythic Behemoths & Draconic Rites',
    chapterTitle: 'Chapter 140: Draconic Wrath of the Ancient World',
    speaker: 'Ancient Dragon',
    speakerTitle: 'Primordial Wyrm',
    speakerEmoji: '🐉',
    speakerColor: '#b91c1c',
    dialogue: 'Meteors answer my command. Let the heavens descend upon their mechanical blight!',
    lorePiece: 'The Ancient Dragon slept within magma veins beneath the continental crust, awakening only when planetary leylines suffered critical ruptures.'
  },
  160: {
    sagaNumber: 4,
    sagaTitle: 'Saga IV: Mythic Behemoths & Draconic Rites',
    chapterTitle: 'Chapter 160: Tyrant of the Cretaceous',
    speaker: 'Tyrannosaurus Rex',
    speakerTitle: 'Apex Sovereign',
    speakerEmoji: '🦖',
    speakerColor: '#991b1b',
    dialogue: 'NOTHING STANDS BEFORE THE JAWS OF THE APEX TYRANT!',
    lorePiece: 'The Tyrannosaurus Rex possesses a kinetic bite force exceeding 120,000 PSI, capable of cleaving reinforced titanium exosuits in half.'
  },
  175: {
    sagaNumber: 5,
    sagaTitle: 'Saga V: Cybernetic Anomaly & The Syndicate EMP',
    chapterTitle: 'Chapter 175: The Nano-Laser Overdrive',
    speaker: 'Mecha Cyber Rex',
    speakerTitle: 'Synthetic War Engine',
    speakerEmoji: '🤖',
    speakerColor: '#06b6d4',
    dialogue: 'NANO-PROTOCOL OVERRIDE: TARGETING CORRUPTED SYNDICATE CARRIERS WITH CROSS-BEAMS!',
    lorePiece: 'Built from scavenged hunter scrap and primal dinosaur fossils, Mecha Rex combines ancient ferocity with devastating nano-lasers, but remains vulnerable to EMP interference.'
  },
  200: {
    sagaNumber: 6,
    sagaTitle: 'Saga VI: The Arcane Infection & Titan Retreat',
    chapterTitle: 'Chapter 200: The Tragic Warper Infection & Titan Escape',
    speaker: 'Titan Defender & Infected Warper',
    speakerTitle: 'The Tragic Fracture',
    speakerEmoji: '⚡',
    speakerColor: '#f43f5e',
    dialogue: 'TITAN: "NOOO, MY BROTHER!" • INFECTED WARPER: "IM SORRY, I CANT-" (The Warper falls to the Syndicate infection; Titan escapes with TV Upgrade!)',
    lorePiece: 'At Wave 200, the 1st Arcane Deity (Warper) is corrupted in front of Titan. Taking heavy laser fire before deploying his holographic energy shield, Titan executes an emergency TV screen relocation to regroup, overhaul his armor, and prepare his limit break for Wave 355.',
    bossTitle: 'Infected Warper (1st Arcane Fallen)'
  },
  240: {
    sagaNumber: 6,
    sagaTitle: 'Saga VI: The Arcane Infection & Base Siege',
    chapterTitle: 'Chapter 240: Siege on Sanctuary Base (Part 1)',
    speaker: 'Infected Warper & Acron Overseer',
    speakerTitle: 'The Corrupted Incursion',
    speakerEmoji: '⚡',
    speakerColor: '#f43f5e',
    dialogue: 'WARPER (INFECTED): "IM SORRY, I CANT..." • ACRON OVERSEER: "OH HELL NAW" (The animal defenders unite with massive bullet fire & lasers to defend the base!)',
    lorePiece: 'At Wave 240, the corrupted Arcane Warper breaches Sanctuary perimeter. Acron Overseer rallies the animals, unleashing a relentless storm of lasers, bullets, and plasma to repel the infected deity.',
    bossTitle: 'Infected Warper (Base Infiltrator)'
  },
  250: {
    sagaNumber: 7,
    sagaTitle: 'Saga VII: Celestial Pantheon & Astral Horrors',
    chapterTitle: 'Chapter 250: The Galactic Maelstrom',
    speaker: 'Astra Leviathan',
    speakerTitle: 'Cosmic Ocean Deity',
    speakerEmoji: '🐋',
    speakerColor: '#a855f7',
    dialogue: 'The dark matter tides are rising. All moving invaders shall be pulled into the astral abyss!',
    lorePiece: 'The Celestial Pantheon watches over the multiverse from the Astral Axis, intervening only when dimensional tears threaten total reality collapse.'
  },
  256: {
    sagaNumber: 7,
    sagaTitle: 'Saga VII: Celestial Pantheon & Astral Horrors',
    chapterTitle: 'Chapter 256: Siege on Sanctuary Base (Part 2) - Wrath of Upgraded Titan',
    speaker: 'Infected Warper & Upgraded Titan',
    speakerTitle: 'Cataclysmic Rage',
    speakerEmoji: '🤖',
    speakerColor: '#00f0ff',
    dialogue: 'WARPER (INFECTED): "...ALL GOES DOWN TO GRAVE" • UPGRADED TITAN EMERGES IN FULL RAGE! (Warper flees as Titan unleashes berserk fury, devastating a wing of the base!)',
    lorePiece: 'At Wave 256, Warper prepares to wipe the Sanctuary into oblivion. Just as all hope fades, Titan bursts out with his new TV/Quantum upgrade, roaring in uncontrollable fury. Warper flees the cataclysm as Titan’s raw power tears through enemy waves and structural blast walls.',
    bossTitle: 'Infected Warper (Cataclysmic Herald)'
  },
  270: {
    sagaNumber: 7,
    sagaTitle: 'Saga VII: Celestial Pantheon & Astral Horrors',
    chapterTitle: 'Chapter 270: Siege on Sanctuary Base (Part 3) - The Alien Mothership',
    speaker: 'Acron, Elemental, Titan & Alien Mothership',
    speakerTitle: 'The Extinction Incursion',
    speakerEmoji: '🛸',
    speakerColor: '#10b981',
    dialogue: 'ACRON & ELEMENTAL: "DEFEND AT ALL COST!" • TITAN: "I WILL REVENGE.. FOR WARPER" • TITAN: "COME NEAR ME AND I WILL SAVE YOU GUYS, GO" (The Alien Mothership vaporizes the entire base into ash; Titan evacuates everyone into the quantum rift!)',
    lorePiece: 'At Wave 270, a swarm of alien UFOs darkens the sky. Elemental switches to the Galaxy Element and fires a stellar beam while animal defenders unleash bullets and lasers. Titan swears vengeance for Warper. But when the colossal Alien Mothership charges its planetary death cannon, Titan shields all the animals in a quantum warp bubble just as the entire base is completely obliterated!',
    bossTitle: 'Alien Dread Mothership (Base Extinction Class)'
  },
  300: {
    sagaNumber: 8,
    sagaTitle: 'Saga VIII: The Anonymous ??? Event Horizon',
    chapterTitle: 'Chapter 300: The Event Horizon of Non-Existence',
    speaker: '??? Singularity Prime',
    speakerTitle: 'Anomalous Horizon',
    speakerEmoji: '🕳️',
    speakerColor: '#e0f2fe',
    dialogue: '01000101 01010010 01010010 01001111 01010010: REALITY EXCEEDS DEFINED PARAMETERS.',
    lorePiece: 'Entities of the ??? Rarity represent unclassified singularities where mathematics breaks down completely. Matter that enters their perimeter is wiped from the universal ledger.',
    bossTitle: 'Supervoid Singularity Core'
  },
  350: {
    sagaNumber: 8,
    sagaTitle: 'Saga VIII: The Anonymous ??? Event Horizon',
    chapterTitle: 'Chapter 350: The False Warp Revelation',
    speaker: 'Abyssal Void Overlord',
    speakerTitle: 'Master of the True Deep',
    speakerEmoji: '🕳️',
    speakerColor: '#ec4899',
    dialogue: 'A false deity masquerades in the warp currents... Prepare for the arrival of the True Pantheon!',
    lorePiece: 'Before the Archon Overseer opened his eyes, the Abyssal Void Overlord held the boundaries of existence against the encroaching chaos of Dimension Zero.',
    bossTitle: 'False Warp Overlord'
  },
  355: {
    sagaNumber: 9,
    sagaTitle: 'Saga IX: Primordial Genesis & Overseer Council',
    chapterTitle: 'Chapter 355: The Armored Titan Transcends to Multiverse Watcher',
    speaker: 'Multiverse Watcher',
    speakerTitle: '2nd Arcane Deity • Singularity Core',
    speakerEmoji: '👁️',
    speakerColor: '#a855f7',
    dialogue: 'MULTIVERSE WATCHER: "I TOLD YOU, IM YOUR DOOM! The dimensional rifts obey my singularity. Now awaken the Armored Titan to shatter the multiverse!"',
    lorePiece: 'Ascended from the Titan Defender, the Multiverse Watcher breaks into the dimensional timeline at Wave 355, granting supreme defense capabilities and unlocking the Armored Titan unit.',
    unlockedAnimalId: 'titan_defender'
  },
  380: {
    sagaNumber: 9,
    sagaTitle: 'Saga IX: Primordial Genesis & Overseer Council',
    chapterTitle: 'Chapter 380: Unfolding of the Divine Council',
    speaker: 'The Archon Overseer',
    speakerTitle: 'Celestial Observer • Prime Axis',
    speakerEmoji: '👁️',
    speakerColor: '#00ffcc',
    dialogue: 'I see all 400 timelines simultaneously. Defenders of the Sanctuary: The final convergence is at hand!',
    lorePiece: 'The Archon Overseer exists outside linear time. His realm expansion ability unifies defender attacks across parallel dimensions.'
  },
  390: {
    sagaNumber: 10,
    sagaTitle: 'Saga X: The Armored Titan & Twin Arcane Singularity',
    chapterTitle: 'Chapter 390: The Zen Equilibrium of the Capybara',
    speaker: 'The Chillful Capybara',
    speakerTitle: 'Supreme Tranquil Sovereign',
    speakerEmoji: '🍊',
    speakerColor: '#84cc16',
    dialogue: 'Why fight when we can chill? Even the fiercest cyber-ninjas find peace in the hot spring.',
    lorePiece: 'The Capybara emits a tranquil field so potent that corrupted beasts and syndicate hunters abandon their weapons and turn to fight for the sanctuary.'
  },
  395: {
    sagaNumber: 10,
    sagaTitle: 'Saga X: The Armored Titan & Twin Arcane Singularity',
    chapterTitle: 'Chapter 395: The Corrupted Arcane Warper',
    speaker: 'INFECTED WARPER',
    speakerTitle: 'Infected 1st Arcane Deity • Fighting for Enemies',
    speakerEmoji: '🧿',
    speakerColor: '#f43f5e',
    dialogue: 'hel-hel-help me-e-e-e... The Syndicate singularity infection controls my quantum blades... Stop me before it is too late!',
    lorePiece: 'Infected by the dimensional shockwave when the Multiverse Watcher shattered spacetime, the Warper has been forced to fight on the enemy side across hundreds of waves, awaiting salvation at Wave 399.',
    bossTitle: 'Corrupted Arcane Warper (Infected Deity)'
  },
  397: {
    sagaNumber: 10,
    sagaTitle: 'Saga X: The Armored Titan & Twin Arcane Singularity',
    chapterTitle: 'Chapter 397: Extraterrestrial Alien Tech Singularity',
    speaker: 'Xenotech Archon Engineer',
    speakerTitle: 'Extraterrestrial Alien Tech Matrix',
    speakerEmoji: '👽',
    speakerColor: '#00ffcc',
    dialogue: 'Extraterrestrial alien technology detected and synchronized! Harness advanced alien plasma shielding and hyper-matter modifications to fortify our defenders before the final wave convergence!',
    lorePiece: 'At Wave 397, advanced extraterrestrial alien tech matrices fuse with sanctuary leylines, supercharging towers with alien tech shields, hyper-velocity plasma rays, and alien tech augmentations to prepare for the massive 10,000-enemy horde.',
    bossTitle: 'Extraterrestrial Xenotech Dreadnought'
  },
  399: {
    sagaNumber: 10,
    sagaTitle: 'Saga X: The Armored Titan & Twin Arcane Singularity',
    chapterTitle: 'Chapter 399: Purification of the Arcane Warper',
    speaker: 'Arcane Warper (Purified)',
    speakerTitle: '1st Arcane Deity • Space Weaver',
    speakerEmoji: '🧿',
    speakerColor: '#c084fc',
    dialogue: 'The infection is broken! I am finally on your side! Deploy my reality blades quickly: THE 10,000 ENEMY HORDE ARRIVES IN WAVE 400!',
    lorePiece: 'Rescued from the Syndicate void infection at wave 399, the Arcane Warper joins the sanctuary arsenal right in time to defend against the colossal 10,000-enemy multiverse invasion.',
    unlockedAnimalId: 'arcane_warper'
  },
  400: {
    sagaNumber: 10,
    sagaTitle: 'Saga X: The Armored Titan & Twin Arcane Singularity',
    chapterTitle: 'Chapter 400: The 10,000 Enemy Multiverse Swarm',
    speaker: 'Multiverse Watcher & Purified Warper',
    speakerTitle: 'Twin Arcane Singularities',
    speakerEmoji: '🌌',
    speakerColor: '#ec4899',
    dialogue: '10,000 ENEMIES ENTER THE FRAY! MULTIVERSE WATCHER LASERS AND PURIFIED WARPER BLADES READY: TOTAL OBLITERATION!',
    lorePiece: 'Wave 400 unleashes the full 10,000-enemy Syndicate armada. Overcoming this unprecedented horde with the Multiverse Watcher and purified Warper solidifies absolute multiverse peace.',
    bossTitle: 'The Multiverse Prime Origin (10,000 Swarm Sovereign)'
  }
};

// Procedural generator that fills in all 400 waves with rich, lore-rich narratives
export function getLoreWaveData(wave: number): LoreWaveData {
  const clampedWave = Math.max(1, Math.min(400, wave));
  const unlock = ANIMAL_LORE_UNLOCKS[clampedWave];
  const custom = HANDCRAFTED_LORE_MILESTONES[clampedWave];

  // Determine Saga
  let sagaNumber = 1;
  let sagaTitle = LORE_SAGAS[0].name;
  if (clampedWave <= 40) {
    sagaNumber = 1;
    sagaTitle = LORE_SAGAS[0].name;
  } else if (clampedWave <= 80) {
    sagaNumber = 2;
    sagaTitle = LORE_SAGAS[1].name;
  } else if (clampedWave <= 120) {
    sagaNumber = 3;
    sagaTitle = LORE_SAGAS[2].name;
  } else if (clampedWave <= 160) {
    sagaNumber = 4;
    sagaTitle = LORE_SAGAS[3].name;
  } else if (clampedWave <= 200) {
    sagaNumber = 5;
    sagaTitle = LORE_SAGAS[4].name;
  } else if (clampedWave <= 250) {
    sagaNumber = 6;
    sagaTitle = LORE_SAGAS[5].name;
  } else if (clampedWave <= 300) {
    sagaNumber = 7;
    sagaTitle = LORE_SAGAS[6].name;
  } else if (clampedWave <= 350) {
    sagaNumber = 8;
    sagaTitle = LORE_SAGAS[7].name;
  } else if (clampedWave <= 380) {
    sagaNumber = 9;
    sagaTitle = LORE_SAGAS[8].name;
  } else {
    sagaNumber = 10;
    sagaTitle = LORE_SAGAS[9].name;
  }

  if (custom) {
    return {
      wave: clampedWave,
      sagaNumber,
      sagaTitle,
      chapterTitle: custom.chapterTitle || `Chapter ${clampedWave}: The Lore Chronicle`,
      speaker: custom.speaker || 'Sanctuary Chronicler',
      speakerTitle: custom.speakerTitle || 'Ancient Lore Keeper',
      speakerEmoji: custom.speakerEmoji || '📜',
      speakerColor: custom.speakerColor || '#38bdf8',
      dialogue: custom.dialogue || `Wave ${clampedWave} begins. Hold the defensive perimeter!`,
      lorePiece: custom.lorePiece || `The archives record wave ${clampedWave} as a crucial moment in the defense of the Animal Sanctuary.`,
      unlockedAnimalId: unlock,
      bossTitle: custom.bossTitle
    };
  }

  // Dynamic thematic generation based on saga & wave
  const sagaSpeakers = [
    { name: 'Forest Ranger Fox', title: 'Sanctuary Sentry', emoji: '🦊', color: '#f97316' },
    { name: 'Alpha Timber Wolf', title: 'Frontline Pack Leader', emoji: '🐺', color: '#64748b' },
    { name: 'Desert Cobra', title: 'Venom Vanguard', emoji: '🐍', color: '#84cc16' },
    { name: 'Storm Owl', title: 'Aerial Watcher', emoji: '🦉', color: '#38bdf8' },
    { name: 'Grizzly Guardian', title: 'Boreal Protector', emoji: '🐻', color: '#78350f' },
    { name: 'Saber-tooth Smilodon', title: 'Extinct Predator', emoji: '🐯', color: '#d97706' },
    { name: 'Ancient Mammoth', title: 'Pleistocene Behemoth', emoji: '🦣', color: '#a8a29e' },
    { name: 'Storm Griffin', title: 'Tempest Raptor', emoji: '🦅', color: '#eab308' },
    { name: 'Deep Sea Kraken', title: 'Abyssal Sovereign', emoji: '🐙', color: '#0d9488' },
    { name: 'Nine-Headed Hydra', title: 'Venom Wyrm', emoji: '🐉', color: '#15803d' },
    { name: 'Solara Phoenix', title: 'Unrivaled Luminary', emoji: '🐦‍🔥', color: '#f59e0b' },
    { name: 'Astra Leviathan', title: 'Celestial Star-Whale', emoji: '🐋', color: '#a855f7' },
    { name: 'The Archon Overseer', title: 'Omniscient Eye', emoji: '👁️', color: '#00ffcc' },
    { name: 'Armored Titan', title: 'Fortress Singularity', emoji: '🛡️', color: '#38bdf8' },
    { name: 'Arcane Warper', title: 'Cosmic Weaver', emoji: '🧿', color: '#c084fc' }
  ];

  const speakerObj = sagaSpeakers[(clampedWave * 7) % sagaSpeakers.length];
  const isBossWave = clampedWave % 5 === 0;

  let bossTitle: string | undefined = undefined;
  if (isBossWave) {
    const bossTitles = [
      'Syndicate Recon Platoon Leader',
      'Heavy Net Trapper Chieftain',
      'Marksman Sharpshooter Squad',
      'Exosuit Vanguard Enforcer',
      'Syndicate Drone Coordinator Prime',
      'Cyber-Ninja Shadow Assassin',
      'Assault Mech-Strider Colossus',
      'Grand Inquisitor Vanguard',
      'Syndicate Siege Dreadnought',
      'Infected Plague Hydra Colossus',
      'Obsidian Armored Pangolin Behemoth',
      'Corrupted Thunder Stag Lord',
      'Doom Crusader Mammoth Alpha',
      'Void Titan Behemoth',
      'High-Tech Nullifier Core',
      'Supervoid Singularity Stalker',
      'Cosmic Infiltration Dreadnought',
      'False Warp Inquisitor',
      'Reality Collapse Anomaly'
    ];
    bossTitle = bossTitles[(clampedWave / 5) % bossTitles.length];
  }

  // Dynamic dialogue & lore piece
  const dialogueThemes = [
    `Syndicate wave ${clampedWave} is advancing across sector ${((clampedWave * 3) % 12) + 1}! Coordinate all defensive emplacements!`,
    `Our animal instincts detect electromagnetic spikes! Primal beasts, stand firm against their artificial weapons!`,
    `The leylines of Dimension Zero are pulsating with energy. Hold this line to unlock deeper animal genetic codes!`,
    `Their mechanized armor cannot withstand the pure elemental fury of the Sanctuary! Focus fire on their weakpoints!`,
    `A new frequency resonates across the battlefield! Prepare your towers for tactical deployment!`,
    `The poachers brought heavy disruptor artillery. Protect our frontlines and unleash coordinated counter-attacks!`
  ];

  const loreThemes = [
    `Wave ${clampedWave} marks an escalating conflict in the 400-wave campaign where the Hunter Syndicate attempted to deploy advanced cyber-operatives against the sanctuary's ancient defensive perimeter.`,
    `Ancient animal chronicles record that during Wave ${clampedWave}, the leylines of Earth resonated with cosmic frequencies, granting biological defenders increased resistance to poacher weaponry.`,
    `Syndicate tactical records indicate heavy resistance at Wave ${clampedWave}, noting that primal animal cooperation surpassed all mechanized predictive combat models.`,
    `As wave ${clampedWave} unfolded, ancient stone tablets scattered throughout the sanctuary began glowing, unsealing deeper genetic archives for future reinforcements.`,
    `During the defense of Wave ${clampedWave}, the synergy between earth, flame, venom, and frost proved decisive against incoming cybernetic armored divisions.`
  ];

  const dialogue = dialogueThemes[clampedWave % dialogueThemes.length];
  const lorePiece = loreThemes[clampedWave % loreThemes.length];

  return {
    wave: clampedWave,
    sagaNumber,
    sagaTitle,
    chapterTitle: `Chapter ${clampedWave}: The ${isBossWave ? 'Trial of the ' + (bossTitle || 'Boss') : 'Vanguard of Sector ' + clampedWave}`,
    speaker: speakerObj.name,
    speakerTitle: speakerObj.title,
    speakerEmoji: speakerObj.emoji,
    speakerColor: speakerObj.color,
    dialogue,
    lorePiece,
    unlockedAnimalId: unlock,
    bossTitle
  };
}

export const LORE_CHAPTERS: LoreChapter[] = [
  {
    id: 1,
    title: 'Chapter I: The Rupture of Dimension Zero',
    subtitle: 'Space-time fractures across the Animal Sanctuary (Waves 1-40)',
    minWave: 1,
    speaker: 'The Archon Overseer',
    speakerTitle: 'Celestial Observer • Prime Axis',
    speakerEmoji: '👁️',
    speakerColor: '#00ffcc',
    dialogue: [
      'Warning: The boundary between dimensions has been compromised.',
      'The Hunter Syndicate opened a forbidden rift into Dimension Zero, seeking to extract our primal animal genetic codes.',
      'Hold the defensive grid! We must gather primal energy to stabilize the dimensional anchor.'
    ],
    loreSnippet: 'Long before the Syndicate built their cyborg armies, the Animal Gods maintained equilibrium across infinite realities. Now, that delicate balance hangs by a thread.',
    unlockedReward: '+10% Base Meat Generation & Field Mouse Unlocked'
  },
  {
    id: 2,
    title: 'Chapter II: The Hunter Legion Awakening',
    subtitle: 'Cyborg EMP operatives enter the fray (Waves 41-80)',
    minWave: 41,
    speaker: 'Syndicate High Inquisitor Gideon',
    speakerTitle: 'Hunter Legion Commander',
    speakerEmoji: '🤖',
    speakerColor: '#ef4444',
    dialogue: [
      'Deploying EMP dampeners across all sanctuary sectors!',
      'Their non-animal machines rely on electrical synapses and digital currents. Once our disruption waves hit, mechanical units will freeze.',
      'Prepare the containment cages for the Arcane specimens!'
    ],
    loreSnippet: 'The Syndicate developed specialized EMP technology to suppress synthetic weapons. Only pure biological animals or hyper-dense gravitational black holes resist these fields.',
    unlockedReward: '+15% Tower Attack Speed & Extinct Megafauna Unlocked'
  },
  {
    id: 3,
    title: 'Chapter III: Convergence of the Mythic Beasts',
    subtitle: 'Dragons, Phoenixes, and Hydras join the fray (Waves 81-160)',
    minWave: 81,
    speaker: 'Fire Phoenix',
    speakerTitle: 'Solar Deity',
    speakerEmoji: '🔥',
    speakerColor: '#ef4444',
    dialogue: [
      'The sky burns with divine solar fire!',
      'No poacher exosuit can withstand the pure heat of the sun.',
      'Defenders of the Sanctuary, summon the Mythic pantheon!'
    ],
    loreSnippet: 'Ancient beasts thought extinct for eons rise from magma, ocean depths, and solar winds to defend the primal leylines.',
    unlockedReward: '+20% Critical Hit Chance & Mythic Beasts Unlocked'
  },
  {
    id: 4,
    title: 'Chapter IV: Awakening of the Multiverse Watcher',
    subtitle: 'The Armored Titan collapses into a Cosmic Black Hole (Waves 161-380)',
    minWave: 161,
    speaker: 'Multiverse Watcher Titan',
    speakerTitle: '2nd Arcane Deity • Singularity Core',
    speakerEmoji: '🕳️',
    speakerColor: '#38bdf8',
    dialogue: [
      'I have shed my mortal armored plating.',
      'Within my core burns a supermassive singularity that bends light, time, and destiny itself.',
      'My energy is infinite. No EMP can drain me. While I watch over this realm, NO ALLIED ANIMAL SHALL BE STUNNED OR LOSE ENERGY!',
      'BEHOLD: THE MULTIVERSE SINGULARITY BLAST!'
    ],
    loreSnippet: 'When the Titan Defender achieved perfect resonance with the cosmic rift, his heavy armor collapsed into a hyper-dense black hole singularity, elevating him to the 2nd Arcane Rarity.',
    unlockedReward: '2nd Arcane Transcendence & Global Stun Immunity'
  },
  {
    id: 5,
    title: 'Chapter V: The 400-Wave Singularity of All Realities',
    subtitle: 'Absolute Multiverse Stabilization (Waves 381-400)',
    minWave: 381,
    speaker: 'Twin Arcane Pantheon',
    speakerTitle: 'Warper & Multiverse Watcher',
    speakerEmoji: '🌌',
    speakerColor: '#ec4899',
    dialogue: [
      'The cosmic weave has stabilized across all 400 waves.',
      'Together, the Warper and the Multiverse Watcher have sealed the Void Rupture.',
      'The Animal Sanctuary stands eternal across all infinite timelines and dimensions!'
    ],
    loreSnippet: 'With both Arcane Deities awakened and 400 waves conquered, the multiverse reaches supreme equilibrium. Players who reach this milestone are recognized as true Multiverse Lore Masters.',
    unlockedReward: 'Multiverse Lore Master Badge & 400-Wave Victory Trophy'
  }
];
