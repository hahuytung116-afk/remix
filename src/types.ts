export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic' | 'Secret' | 'Celestial' | '???' | 'Original' | 'Overseer' | 'Unrivaled' | 'Arcane' | 'The Chillful';

export interface Animal {
  id: string;
  name: string;
  rarity: Rarity;
  damage: number;
  range: number;
  fireRate: number; // Attack speed in ms
  cost: number;
  color: string;
  isExtinct?: boolean;
  generationMeat?: number; // Meat generated per tick/second
  generationDna?: number; // DNA generated per wave
  aoeRange?: number; // Pulse/AOE damage radius
  skillName?: string; // Mythic/Secret special ability name
  skillDesc?: string; // Mythic/Secret special ability description
  emoji?: string; // Icon or Emoji representation of the animal
  role?: 'support' | 'damage' | 'hybrid' | 'generator'; // Unit classification role
  isFlying?: boolean; // Airborne unit capable of engaging flying enemies
  isGhost?: boolean; // Ghost spectral unit
  category?: 'standard' | 'fused' | 'celestial' | 'extinct' | 'divine';
  isFused?: boolean;
  description?: string;
}

export interface TowerInstance {
  id: string;
  animalId: string;
  x: number;
  y: number;
  rotation: number;
  lastFired: number;
  level: number;
  lastSkillUsed?: number; // Timestamp of the last skill trigger
  trait?: string; // Current gacha-rolled trait (e.g., 'Godly', 'Swift', 'Glitch')
  isPinnacle?: boolean; // Has undergone ultimate Transcendence in the Evolving Chamber
  pinnacleClass?: string; // Custom visual subtitle/class of their absolute performance
  disabledExpiry?: number;
  isDisabled?: boolean;
  integrity?: number;
  dps?: number; // Real-time damage per second output
  xp?: number; // Experience points accumulated for the current level
  masteryLevel?: number; // Tower mastery level (max 1000, boosts damage)
  element?: 'fire' | 'poison' | 'water' | 'sand' | 'dirt' | 'ice' | 'wind' | 'lightning' | 'light' | 'shadow' | 'magma' | 'cosmos'; // Custom chosen element for Elemental God
  titanForm?: 'form1_dual' | 'form2_merged' | 'form3_multiverse'; // Titan Form: Form 1 Dual Side Lasers, Form 2 Great Defender Merged Laser, or Form 3 Multiverse Watcher (Black Hole Singularity)
  titanSkin?: 'standard' | 'upgraded_titan_tv_man' | 'upgraded_titan_speakerman' | 'upgraded_titan_cameraman' | 'titan_drillman' | 'titan_clockman' | 'the_true_defender'; // Skin/Variant selection for Titan
  warperSkin?: 'standard' | 'void_lord' | 'cyber_matrix' | 'celestial_archon' | 'hypernova_eclipse'; // Custom skin selection for Arcane Warper
  ultraLaserActive?: boolean; // Active Skill: Ultra Laser active status (30s)
  ultraLaserEndTime?: number; // Timestamp when Ultra Laser ends
  titanEnergy?: number;
  titanIsCharging?: boolean;
  titanChargeStartTime?: number;
  titanChargeDuration?: number;
  titanShootTimeElapsed?: number;
  titanShootTimeLimit?: number;
  titanCoreUpgrade?: boolean;
  titanLaserCannonsUpgrade?: boolean;
  titanFrontShieldUpgrade?: boolean;
  titanSideShieldUpgrade?: boolean;
  titanHyperDriveUpgrade?: boolean;
  titanNaniteRepairUpgrade?: boolean;
  titanSeismicStompUpgrade?: boolean;
  titanPlasmaFieldUpgrade?: boolean;
  titanMagneticHarvesterUpgrade?: boolean;
  titanSingularityCoreUpgrade?: boolean;
  titanGammaRayUpgrade?: boolean;
  titanTVArrayUpgrade?: boolean;
  titanArmourOfDeathUpgrade?: boolean; // The True Defender Upgrade 1: 4 Cannons + 4 Astro Toilet Claws (+250% DMG & Claw strikes)
  titanFourShieldsUpgrade?: boolean; // The True Defender Upgrade 2: 4 Omni-Directional Shields in all places (360° Total Deflection)
  titanMechaHandsUpgrade?: boolean; // Dual Hydraulic Mecha Hands: 2nd range kinetic slam + crusher fists
  titanLeftHandPunch?: { active: boolean; startX: number; startY: number; targetX: number; targetY: number; startTime: number; duration: number };
  titanRightHandPunch?: { active: boolean; startX: number; startY: number; targetX: number; targetY: number; startTime: number; duration: number };
  lastTitanMechaPunch?: number;
  titanNextPunchHand?: 'left' | 'right';
  lastActiveSkillUsed?: number;
  warperKillsInTrueHell?: number;
  warperSecondForm?: boolean;
  warperBladeUpgrade?: boolean; // Dual-range mode: Range 1 (Outer laser) & Range 2 (Inner blade slash) + condensed high dmg
  warperArmouredTitanUpgrade?: boolean; // Armoured Titan mecha armor: Heavy armor plating + 2 additional laser cannons
  lastWarperBladeSlash?: number;
  chillMeter?: number; // Capybara Chill Meter (0-100%)
  hypnotizedCount?: number; // Real-time count of hypnotized targets
  aircraftId?: string; // Equipped aircraft ID
  isFlying?: boolean; // Whether currently in airborne flight
  isAlienTech?: boolean; // Has evolved to Alien Tech Tier
  alienTechTier?: number; // Alien Tech Evolution Level (1-3)
  alienTechShieldHp?: number; // Holographic shield integrity
  laserTargetEnemyId?: string; // Real-time laser-tracking lock-on target
  lastAlienPulse?: number; // Timestamp of the last Xenotech pulse burst
}

export interface EnemyType {
  id: string;
  name: string;
  health: number;
  speed: number;
  bounty: number;
  color: string;
  size: number;
  isBoss?: boolean;
  isUltraArmored?: boolean;
  isHunter?: boolean;
  isAlien?: boolean;
  isFlying?: boolean;
  isGhost?: boolean; // Ethereal ghost enemy requiring Ghost Vision Glasses to attack
  category?: 'hunter' | 'bad_animal' | 'ultra_armored' | 'boss' | 'alien' | 'sky_hunter' | 'ghost';
  armorReduction?: number; // 0.0 - 0.999 (e.g. 0.99 = 99% flat damage reduction)
  maxDamagePerHit?: number; // Caps incoming damage per tick/hit so even trillion damage units cannot 1-shot
  description?: string;
  appearance?: string;
  abilities?: string[];
  weakpoint?: string;
  emoji?: string;
}

export interface EnemyInstance {
  id: string;
  typeId: string;
  x: number;
  y: number;
  pathX?: number;
  pathY?: number;
  health: number;
  maxHealth: number;
  pathIndex: number;
  distanceTravelled: number;
  rotation: number;
  slowMultiplier?: number; // Speed multiplier (e.g. 0.3 for 70% slow)
  slowExpiry?: number; // Timestamp when the slow expires
  isUltraArmored?: boolean;
  armorReduction?: number;
  maxDamagePerHit?: number;
  isHypnotized?: boolean;
  hypnotizedByTowerId?: string;
  hypnotizeExpiry?: number;
  lastHypnotizeAttackTime?: number;
  isFlying?: boolean; // True for sky enemies
  isGhost?: boolean; // True for ethereal ghost enemies
  skyX?: number; // Sky custom coordinates
  skyY?: number;
  skyTargetX?: number;
  skyTargetY?: number;
  skySpeed?: number;
}

export interface SkillEffect {
  id: string;
  type: 'shockwave' | 'firering' | 'meteor' | 'laser_cross' | 'vortex' | 'nuclear' | 'supernova' | 'foxfire' | 'blackhole' | 'custom_laser' | 'beams_beams' | 'cosmic_rupture' | 'glitch' | 'cosmic_genesis' | 'abyssal_obliteration' | 'ragnarok_supernova' | 'omega_extermination' | 'element_fire_blast' | 'element_poison_burst' | 'element_water_wave' | 'element_sand_whirl' | 'element_dirt_rupture' | 'element_ice_freeze' | 'element_wind_cyclone' | 'element_lightning_surge' | 'element_light_beam' | 'element_shadow_void' | 'element_magma_eruption' | 'element_cosmos_burst' | 'titan_side_lasers' | 'titan_merged_laser' | 'titan_ultra_laser' | 'titan_multiverse_blast' | 'multiverse_singularity_blast' | 'titan_seismic_stomp' | 'titan_plasma_burn' | 'titan_glitch_broadcast' | 'enemy_missile' | 'crit_text' | 'chill_hypnotize_aura';
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  duration: number; // in ms
  startTime: number;
  angle?: number; // For directional cyber lasers
  startX?: number;
  startY?: number;
  targetTowerId?: string;
  projectileSpeed?: number;
  text?: string;
  damageAmount?: number;
  element?: string;
  isCrit?: boolean;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  targetId: string;
  damage: number;
  speed: number;
  aoeRange?: number;
  color?: string;
  sourceTowerId?: string; // ID of the tower that shot this projectile
  isCrit?: boolean;
  element?: 'fire' | 'poison' | 'water' | 'sand' | 'dirt' | 'ice' | 'wind' | 'lightning' | 'light' | 'shadow' | 'magma' | 'cosmos';
  elementColor?: string;
}

export interface FusionRecord {
  id: string;
  timestamp: number;
  component1: { id: string; name: string; rarity: Rarity; color: string; emoji: string };
  component2: { id: string; name: string; rarity: Rarity; color: string; emoji: string };
  result: { id: string; name: string; rarity: Rarity; color: string; emoji: string; damage: number };
  dnaCost: number;
  essenceGain: number;
}

export interface GameState {
  meat: number;
  dna: number;
  health: number;
  wave: number;
  isGameOver: boolean;
  isWaveActive: boolean;
  summonedAnimals: string[]; // List of animal IDs owned
  secretPity: number; // Counter towards guaranteed Secret beast
  celestialPity?: number; // Counter towards guaranteed Celestial beast
  unrivaledPity?: number; // Counter towards guaranteed Unrivaled beast
  celestialTraitPity?: number; // Counter towards guaranteed Celestial trait reroll (0/15)
  mysteryPity?: number; // Counter towards guaranteed ??? unit (0/777)
  mysteryTraitPity?: number; // Counter towards guaranteed ??? trait (0/500)
  autoSellDuplicates?: boolean;
  autoSellCommons?: boolean;
  autoSellRares?: boolean;
  autoSellEpics?: boolean;
  autoSellLegendaries?: boolean;
  autoDeployWaves?: boolean;
  autoDeployTowers?: boolean;
  autoUpgradeTowers?: boolean;
  gameSpeed?: number; // 1 | 1.5 | 2 | 3
  soundEffectsEnabled?: boolean;
  ambientAudioEnabled?: boolean;
  globalMute?: boolean;
  screenShakeEnabled?: boolean;
  showGrid?: boolean;
  tacticalMode?: boolean;
  isHardcore?: boolean;
  isBossRush?: boolean;
  isTrueHell?: boolean;
  isSandbox?: boolean;
  isGigaGacha?: boolean;
  isSuddenDeath?: boolean;
  isSkyMode?: boolean; // Dedicated Sky Game Mode where flight is required to attack
  isAlienMode?: boolean; // Dedicated Alien Invasion Mode with Alien Swarms, Xenon Titan, and Mothership
  isLoreMode?: boolean; // Dedicated Lore Chronicles Mode with story chapters, multiverse dialogues, and cosmic lore bosses
  loreChapter?: number; // Active Lore Story Chapter (1-5)
  loreStoryViewed?: number[]; // Array of chapter IDs already read/cleared
  highestLoreWave?: number; // Highest wave reached in Lore Mode
  loreCompleted?: boolean; // True when all 400 waves of Lore Mode are cleared
  loreTitanTransformed?: boolean; // Form 3 Multiverse Watcher transformation completed in Lore Mode
  warperInfectionCutsceneTriggered?: boolean; // Wave 200 Warper infection and Titan tactical retreat cutscene in Lore Mode
  titanBaseReturnCutsceneTriggered?: boolean; // Post-infection Base Teleport and Scientist Repair cutscene in Lore Mode
  baseAttackPart1CutsceneTriggered?: boolean; // Wave 240 Lore Mode: Base Attack Part 1 (Infected Warper attack vs Acron Overseer & Animals)
  baseAttackPart2CutsceneTriggered?: boolean; // Wave 256 Lore Mode: Base Attack Part 2 (Infected Warper "...ALL GOES DOWN TO GRAVE", Upgraded Titan Full Rage)
  baseAttackPart3CutsceneTriggered?: boolean; // Wave 270 Lore Mode: Base Attack Part 3 (Alien UFO Armada & Mothership Obliterates Base, Titan Saves Animals)
  warperPurifiedCutsceneTriggered?: boolean; // Purified Arcane Warper homecoming cutscene completed at Wave 399 in Lore Mode
  hasGhostVisionGlasses?: boolean; // Tactical spectral visors allowing towers to target Ghost enemies
  isUltraBoss?: boolean;
  ultraBossSlayer?: boolean; // Badge for defeating the 100-Trillion Ultra World Boss
  ultraBossKills?: number; // Total Ultra Bosses defeated
  altarType?: 'standard' | 'quantum' | 'ultra' | 'capy';
  autoSummon?: boolean; // Instantly summons behind-the-scenes as DNA is gained
  autoSummonAltar?: 'standard' | 'quantum' | 'ultra' | 'capy'; // Chosen altar for autoloop summoning
  shardsOfGods?: number;
  arcaneShards?: number; // 2nd Arcane tier Shards (1% drop rate from normal enemies; 3 required for Multiverse Watcher)
  capyCoins?: number; // Special currency minted from divine shards (10 Shards -> 5 Capy Coins)
  gameTokens?: number; // Arcade currency for playing minigames (10% drop chance from defeated enemies)
  originalPity?: number;
  overseerPity?: number;
  capyPity?: number; // Pity counter for guaranteed The Chillful / Capybara summon on Capy Altar
  totalWaveEnemies?: number;
  waveEnemiesDefeated?: number;
  bufferStock?: number;
  currentStage?: 'default' | 'jungle' | 'savanna' | 'prehistoric' | 'dimension_cosmic' | 'dimension_abyss';
  disableVFX?: boolean;
  ultraLagReduce?: boolean;
  disableSummonCutscene?: boolean;
  disableAllNotifications?: boolean; // Suppresses all in-game toast notifications, badge alerts, and milestone banners
  elementalDamage?: Record<string, number>;
  autoDeployUnitId?: string;
  unlockedBadges?: string[]; // Array of badge IDs unlocked by the player
  activeBadgeId?: string; // Currently equipped badge title ID
  highestTrueHellWave?: number;
  highestSuddenDeathWave?: number;
  highestBossRushWave?: number;
  highestSkyModeWave?: number;
  highestAlienModeWave?: number;
  clashWins?: number;
  arcaneWarperUses?: number;
  elementalHazardsEnabled?: boolean;
  unlockedRelics?: string[]; // list of relic ids owned/unlocked
  equippedRelicIds?: string[]; // list of relic ids currently active (max 2)
  quickDeployUnitIds?: string[]; // list of up to 4 custom assigned animal ids for quick deployment
  skyFightEnabled?: boolean; // Toggle for sky fight mode
  skyFightScore?: number; // Sky fight total score or kills
  skyModeKills?: number; // Total enemies shot down in Sky Game Mode
  skyChasingCutsceneTriggered?: boolean; // Tracking for 200 kills chasing cutscene
  alienModeKills?: number; // Total alien invaders neutralized in Alien Mode
  activeTacticalPlanId?: string; // Currently active tactical doctrine / deployment plan
  tacticalAutoDiversify?: boolean; // When auto-deploy is on, automatically diversifies units to fulfill tactical plan quotas
  fusedTempleLevel?: number; // Level of the Fused Temple sanctuary (1-10)
  fusedTempleBlessings?: string[]; // Unlocked permanent temple blessings
  fusedTempleEssence?: number; // Essence currency accumulated from temple rites
  totalFusionsCompleted?: number; // Lifetime count of fusions performed in the Fused Temple
  fusionHistory?: FusionRecord[]; // Last successful unit syntheses in Fused Temple
}

export interface TacticalPlan {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  icon: string;
  tag: string;
  color: string;
  gradientClass: string;
  borderClass: string;
  composition: {
    singleTargetDps: number; // percentage e.g. 35
    aoeNuker: number; // percentage e.g. 25
    crowdControl: number; // percentage e.g. 15
    fusedBeast: number; // percentage e.g. 15
    supportEconomy: number; // percentage e.g. 10
  };
  preferredRoleOrder: ('damage' | 'support' | 'hybrid' | 'generator')[];
  strategyNotes: string;
  placementStyle: 'balanced_spread' | 'frontline_choke' | 'perimeter_sniper' | 'cluster_aura' | 'boss_kill_zone';
}

export interface Badge {
  id: string;
  name: string;
  title: string; // The display title when equipped, e.g. "👑 GOD SLAYER"
  description: string;
  category: 'boss' | 'wave' | 'mode' | 'economy' | 'mastery' | 'dimension' | 'special';
  icon: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Celestial' | 'Overseer';
  badgeColor: string;
  gradientClass: string;
  borderClass: string;
  requirement: string;
  bonusDescription: string;
  perk?: {
    dnaBonusPercent?: number;
    meatBonusPercent?: number;
    critBonusPercent?: number;
    rangeBonusPercent?: number;
    damageBonusPercent?: number;
  };
}

export interface WaveSummary {
  wave: number;
  unitId: string;
  unitName: string;
  animalId: string;
  rarity: Rarity;
  damage: number;
  trait?: string;
  level: number;
  color: string;
  isPinnacle?: boolean;
}

