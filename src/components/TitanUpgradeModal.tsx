import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, Zap, Info, Cpu, RefreshCw, Layers, Radio, Award } from 'lucide-react';
import { TowerInstance } from '../types';

interface TitanUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  towers: TowerInstance[];
  meat: number;
  upgradeTitanPart: (
    towerId: string,
    part: 'core' | 'cannons' | 'frontShield' | 'sideShield' | 'hyperDrive' | 'naniteRepair' | 'seismicStomp' | 'plasmaField' | 'magneticHarvester' | 'singularityCore' | 'gammaRay' | 'tvArray' | 'armourOfDeath' | 'fourShields' | 'mechaHands',
    cost: number
  ) => { success: boolean; message: string };
  selectedTowerId: string | null;
  setIsLoreTitanCutsceneOpen?: (open: boolean) => void;
}

interface UpgradeItem {
  key: 'core' | 'cannons' | 'frontShield' | 'sideShield' | 'hyperDrive' | 'naniteRepair' | 'seismicStomp' | 'plasmaField' | 'magneticHarvester' | 'singularityCore' | 'gammaRay' | 'tvArray' | 'armourOfDeath' | 'fourShields' | 'mechaHands';
  name: string;
  cost: number;
  icon: string;
  description: string;
  buff: string;
  category: 'Defense' | 'Offense' | 'Utility' | 'Ultimate';
  connectionId: string; // Used for schematic linking
}

const UPGRADES: UpgradeItem[] = [
  {
    key: 'core',
    name: 'Quantum Core Overhaul',
    cost: 3000000,
    icon: '🔋',
    description: 'Optimizes thermal dissipation and base power output of the main central reactor core.',
    buff: '+50% Base Weapon Damage',
    category: 'Offense',
    connectionId: 'core-line',
  },
  {
    key: 'cannons',
    name: 'Quad Laser Cannons',
    cost: 5000000,
    icon: '🔫',
    description: 'Deploys 2 additional side cannons, upgrading standard dual lasers to quad laser firepower.',
    buff: '+100% Weapon Damage',
    category: 'Offense',
    connectionId: 'cannons-line',
  },
  {
    key: 'mechaHands',
    name: 'Dual Hydraulic Mecha Hands (2nd Range)',
    cost: 20000000,
    icon: '🦾',
    description: 'Mounts 2 heavy articulated cybernetic Mecha Hands with hydraulic knuckles. Attacks targets within a dedicated secondary close-mid range (600px -> 750px) with devastating crushing slams, kinetic shockwaves, and stun impacts.',
    buff: 'Deploys 2 Mecha Hands with independent 2nd range (750px) + 3.5x Kinetic Slam DMG & Stun Shockwaves',
    category: 'Offense',
    connectionId: 'mecha-hands-line',
  },
  {
    key: 'frontShield',
    name: 'Front Deflection Aegis',
    cost: 4000000,
    icon: '🛡️',
    description: 'Calibrates tactical front deflection fields to intercept and absorb elite stun missiles.',
    buff: 'Blocks Stun Missiles (120px range)',
    category: 'Defense',
    connectionId: 'fshield-line',
  },
  {
    key: 'sideShield',
    name: 'Auxiliary Side Shields',
    cost: 4000000,
    icon: '🔋',
    description: 'Expands spatial shield nodes to defend flanks. Overloads baseline laser core output.',
    buff: 'Shield range to 160px & +50% DMG',
    category: 'Defense',
    connectionId: 'sshield-line',
  },
  {
    key: 'hyperDrive',
    name: 'Hyper-Drive Accelerator',
    cost: 6000000,
    icon: '⚡',
    description: 'Supercharges weapon rotation gears and power coolant loops to decrease reloading time.',
    buff: '+40% Firing Rate (40% faster attacks)',
    category: 'Offense',
    connectionId: 'hyperdrive-line',
  },
  {
    key: 'naniteRepair',
    name: 'Nanite Plating Repair',
    cost: 8000000,
    icon: '🔧',
    description: 'Floods the baseline structure frame with self-assembling regenerative defensive micro-bots.',
    buff: 'Regenerates 1 Base HP every 5s (Max 30)',
    category: 'Defense',
    connectionId: 'nanite-line',
  },
  {
    key: 'seismicStomp',
    name: 'Tectonic Seismic Stomp',
    cost: 10000000,
    icon: '📯',
    description: 'Periodically stomps the ground with immense kinetic force, shattering surrounding physical armor.',
    buff: 'Deals 10M AoE Damage + 60% slow (180px range) every 4s',
    category: 'Offense',
    connectionId: 'seismic-line',
  },
  {
    key: 'plasmaField',
    name: 'Dark Plasma Field',
    cost: 12000000,
    icon: '💜',
    description: 'Generates a localized super-heated cloud of radioactive dark plasma molecules around the hull.',
    buff: 'Deals 1.5M continuous ticks + 30% passive slow (150px)',
    category: 'Offense',
    connectionId: 'plasma-line',
  },
  {
    key: 'magneticHarvester',
    name: 'Magnetic Meat Harvester',
    cost: 15000000,
    icon: '🧲',
    description: 'Calibrates high-strength magnetic collectors to capture and salvage residual organic meat on kill.',
    buff: '+20% Extra Meat bounty from all defeated enemies',
    category: 'Utility',
    connectionId: 'harvester-line',
  },
  {
    key: 'singularityCore',
    name: 'Singularity Core Pull',
    cost: 18000000,
    icon: '🌀',
    description: 'Embeds microscopic singularity vortex emitters into core thruster ports.',
    buff: 'Steadily pulls all enemies within 250px towards Titan',
    category: 'Utility',
    connectionId: 'singularity-line',
  },
  {
    key: 'gammaRay',
    name: 'Gamma Ray Blast',
    cost: 25000000,
    icon: '💚',
    description: 'Infuses core fusion fuel lines with high-frequency cosmic gamma radiation isotopes.',
    buff: 'Massive +200% Base Weapon Damage bonus',
    category: 'Offense',
    connectionId: 'gammaray-line',
  },
  {
    key: 'tvArray',
    name: 'Retro CRT TV Array',
    cost: 30000000,
    icon: '📺',
    description: 'Installs twin high-voltage CRT cathode monitors on shoulders and custom matrix face screen.',
    buff: 'Triggers giant scanning wave every 5s: 90% slow & +50% vulnerability',
    category: 'Ultimate',
    connectionId: 'tvarray-line',
  },
  {
    key: 'armourOfDeath',
    name: 'Armour of Death (4 Cannons + 4 Astro Claws)',
    cost: 35000000,
    icon: '☠️',
    description: 'The True Defender core armor: reinforced battle plates mounted with 4 heavy energy cannons and 4 mechanical Astro Toilet claws.',
    buff: '+250% Base DMG, 4 Heavy Cannons & Astro Claw strikes',
    category: 'Ultimate',
    connectionId: 'armour-line',
  },
  {
    key: 'fourShields',
    name: '4 Omni-Shields (Shields In All Places)',
    cost: 40000000,
    icon: '🛡️',
    description: 'Deploys 4 omni-directional tactical energy shield projectors covering North, South, East, and West completely.',
    buff: '360° Total Stun Deflection & +100% Forcefield Power',
    category: 'Defense',
    connectionId: '4shields-line',
  },
];

export const TitanUpgradeModal: React.FC<TitanUpgradeModalProps> = ({
  isOpen,
  onClose,
  towers,
  meat,
  upgradeTitanPart,
  selectedTowerId,
  setIsLoreTitanCutsceneOpen,
}) => {
  const [hoveredUpgrade, setHoveredUpgrade] = useState<UpgradeItem | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Auto-find active Titan Defender: either selected, or first placed one
  const titanDefenders = towers.filter((t) => t.animalId === 'titan_defender');
  const activeTitan =
    selectedTowerId && towers.find((t) => t.id === selectedTowerId)?.animalId === 'titan_defender'
      ? towers.find((t) => t.id === selectedTowerId)
      : titanDefenders[0];

  const handleUpgrade = (item: UpgradeItem) => {
    if (!activeTitan) {
      triggerWarning('Telemetry offline: No placed Titan Defender detected!');
      return;
    }
    if (meat < item.cost) {
      triggerWarning(`Insufficient meat reserves! Requires ${item.cost.toLocaleString()} Meat.`);
      return;
    }

    const res = upgradeTitanPart(activeTitan.id, item.key, item.cost);
    if (res.success) {
      setSuccessMessage(`System synchronized: ${item.name} unlocked!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      triggerWarning(res.message);
    }
  };

  const triggerWarning = (msg: string) => {
    setWarningMessage(msg);
    setTimeout(() => setWarningMessage(null), 3500);
  };

  // Check which upgrades are unlocked
  const isUnlocked = (key: string) => {
    if (!activeTitan) return false;
    const t = activeTitan as any;
    if (key === 'core') return !!t.titanCoreUpgrade;
    if (key === 'cannons') return !!t.titanLaserCannonsUpgrade;
    if (key === 'frontShield') return !!t.titanFrontShieldUpgrade;
    if (key === 'sideShield') return !!t.titanSideShieldUpgrade;
    if (key === 'hyperDrive') return !!t.titanHyperDriveUpgrade;
    if (key === 'naniteRepair') return !!t.titanNaniteRepairUpgrade;
    if (key === 'seismicStomp') return !!t.titanSeismicStompUpgrade;
    if (key === 'plasmaField') return !!t.titanPlasmaFieldUpgrade;
    if (key === 'magneticHarvester') return !!t.titanMagneticHarvesterUpgrade;
    if (key === 'singularityCore') return !!t.titanSingularityCoreUpgrade;
    if (key === 'gammaRay') return !!t.titanGammaRayUpgrade;
    if (key === 'tvArray') return !!t.titanTVArrayUpgrade;
    if (key === 'armourOfDeath') return !!t.titanArmourOfDeathUpgrade;
    if (key === 'fourShields') return !!t.titanFourShieldsUpgrade;
    if (key === 'mechaHands') return !!t.titanMechaHandsUpgrade;
    return false;
  };

  const unlockedCount = activeTitan ? UPGRADES.filter((u) => isUnlocked(u.key)).length : 0;
  const isPinnacleMastered = unlockedCount === UPGRADES.length;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/85 backdrop-blur-md">
        {/* Backdrop click close */}
        <div className="absolute inset-0 cursor-default" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: 'spring', damping: 20 }}
          className="relative w-[95%] max-w-5xl h-[88vh] bg-slate-950 border-2 border-cyan-500/40 rounded-2xl overflow-hidden shadow-2xl shadow-cyan-950/50 flex flex-col z-[130]"
        >
          {/* Cyber scanner animation background */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-cyan-500/20 overflow-hidden">
            <div className="w-1/3 h-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-[marquee_2.5s_linear_infinite]" />
          </div>

          {/* Modal Header */}
          <div className="p-4 border-b border-cyan-500/20 bg-slate-900/60 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-2xl animate-pulse">🤖</span>
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] font-mono flex items-center gap-2">
                  Titan-Defender: Cockpit Modular Interface
                  <span className="text-[10px] text-cyan-400 px-1.5 py-0.5 bg-cyan-950/50 rounded border border-cyan-500/30 font-bold">
                    v4.2 PROTOTYPE
                  </span>
                </h2>
                <p className="text-[10px] text-slate-400">
                  Calibrate bio-mechanical and electrical parameters for maximum terrestrial protection.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {setIsLoreTitanCutsceneOpen && (
                <button
                  type="button"
                  onClick={() => {
                    setIsLoreTitanCutsceneOpen(true);
                  }}
                  className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg text-[10px] font-black uppercase tracking-wider active:scale-95 transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)] cursor-pointer font-mono flex items-center gap-1.5 border border-purple-300/30"
                  title="Watch the Multiverse Watcher Awakening Transformation Cutscene"
                >
                  <span>🎬</span>
                  <span className="hidden sm:inline">WATCH</span> CUTSCENE
                </button>
              )}

              {/* Meat counter display */}
              <div className="bg-slate-950 border border-emerald-500/30 px-3 py-1 rounded-lg flex items-center gap-2 shadow-inner">
                <span className="text-[9px] uppercase font-bold text-emerald-400 tracking-wider font-mono">
                  MEAT FUEL:
                </span>
                <span className="text-xs font-black text-emerald-300 font-mono">
                  {meat.toLocaleString()}
                </span>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer border border-transparent hover:border-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Modal Layout: Schematic + Grid */}
          <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 bg-gradient-to-b from-slate-950 to-slate-900">
            {/* Left Side: Animated Holographic Blueprint Schematic (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4 bg-slate-950/70 p-4 rounded-xl border border-white/5 relative">
              <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" /> SYSTEM SCHEMATIC
                </h3>
                <span className="text-[9px] text-slate-400 font-mono uppercase">
                  ACTIVE NODES: <strong className="text-cyan-400">{unlockedCount}/{UPGRADES.length}</strong>
                </span>
              </div>

              {/* Graphical Holographic Visualizer */}
              <div className="flex-1 min-h-[220px] lg:min-h-[300px] bg-slate-950 rounded-lg border border-cyan-500/10 flex items-center justify-center relative overflow-hidden group">
                {/* HUD Scan Grid background */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle, rgba(34,211,238,0.03) 1px, transparent 1px)',
                    backgroundSize: '16px 16px',
                  }}
                />

                {/* Radar radar radial pulse */}
                <div className="absolute w-44 h-44 border border-cyan-500/5 rounded-full animate-ping pointer-events-none" />

                {/* Schematics Overlay HUD Data */}
                <div className="absolute top-2 left-2 text-[8px] text-cyan-500/60 font-mono space-y-0.5 pointer-events-none">
                  <div>SYS_STATUS: {activeTitan ? 'OK_SYNCHRONIZED' : 'TELEMETRY_OFFLINE'}</div>
                  <div>LEVEL: {activeTitan ? activeTitan.level : 'N/A'}</div>
                  <div>PINNACLE: {activeTitan?.isPinnacle ? 'TRUE_OVERRIDE' : 'FALSE'}</div>
                  <div>THERMAL_CAP: 98.4%</div>
                </div>

                {/* Central Robot Chassis Render */}
                <div className="relative w-40 h-40 flex items-center justify-center">
                  {/* Outer mechanical aura */}
                  <div
                    className={`absolute inset-0 rounded-full border border-dashed transition-all duration-700 ${
                      isPinnacleMastered
                        ? 'border-emerald-400/30 animate-[spin_20s_linear_infinite]'
                        : 'border-cyan-500/10 animate-[spin_40s_linear_infinite]'
                    }`}
                  />

                  {/* SVG Holographic Connections overlay */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                    {/* Laser pathways linking core, screens, weapons */}
                    <line
                      x1="80"
                      y1="80"
                      x2="80"
                      y2="40"
                      stroke={
                        hoveredUpgrade?.key === 'tvArray'
                          ? '#22c55e'
                          : isUnlocked('tvArray')
                          ? '#10b981'
                          : '#1e293b'
                      }
                      strokeWidth={hoveredUpgrade?.key === 'tvArray' ? '2' : '1'}
                      className={
                        hoveredUpgrade?.key === 'tvArray' ? 'animate-[dash_1s_infinite]' : ''
                      }
                    />
                    <line
                      x1="80"
                      y1="80"
                      x2="35"
                      y2="80"
                      stroke={
                        hoveredUpgrade?.key === 'cannons'
                          ? '#3b82f6'
                          : isUnlocked('cannons')
                          ? '#10b981'
                          : '#1e293b'
                      }
                      strokeWidth={hoveredUpgrade?.key === 'cannons' ? '2' : '1'}
                    />
                    <line
                      x1="80"
                      y1="80"
                      x2="125"
                      y2="80"
                      stroke={
                        hoveredUpgrade?.key === 'hyperDrive'
                          ? '#f59e0b'
                          : isUnlocked('hyperDrive')
                          ? '#10b981'
                          : '#1e293b'
                      }
                      strokeWidth={hoveredUpgrade?.key === 'hyperDrive' ? '2' : '1'}
                    />
                    <line
                      x1="80"
                      y1="80"
                      x2="80"
                      y2="120"
                      stroke={
                        hoveredUpgrade?.key === 'seismicStomp'
                          ? '#f97316'
                          : isUnlocked('seismicStomp')
                          ? '#10b981'
                          : '#1e293b'
                      }
                      strokeWidth={hoveredUpgrade?.key === 'seismicStomp' ? '2' : '1'}
                    />
                  </svg>

                  {/* Robot Blueprint Schematic Chassis Icon */}
                  <div className="relative z-20 w-24 h-24 flex items-center justify-center bg-slate-900/80 rounded-2xl border border-cyan-500/20 shadow-lg shadow-cyan-950">
                    <span
                      className={`text-6xl transition-all duration-300 ${
                        isPinnacleMastered
                          ? 'drop-shadow-[0_0_12px_#34d399] saturate-150 scale-110'
                          : 'drop-shadow-[0_0_10px_#22d3ee]'
                      }`}
                    >
                      🤖
                    </span>

                    {/* TV Array Screens Hover overlay */}
                    {hoveredUpgrade?.key === 'tvArray' && (
                      <div className="absolute top-1 left-1 right-1 h-5 bg-green-500/20 rounded border border-green-400 flex items-center justify-center text-[7px] text-green-300 font-bold uppercase animate-pulse">
                        📺 BROADCAST ACTIVE
                      </div>
                    )}
                    {/* Core Upgrade Core Glow */}
                    {isUnlocked('core') && (
                      <div className="absolute w-3 h-3 bg-cyan-400 rounded-full animate-ping opacity-60 shadow-[0_0_8px_#22d3ee] top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2" />
                    )}
                  </div>

                  {/* HUD Labeled Connector Node Sockets */}
                  <div className="absolute top-4 left-[50%] -translate-x-1/2 w-8 h-8 rounded-full bg-slate-900 border border-green-500/30 flex items-center justify-center text-xs shadow z-30">
                    📺
                  </div>
                  <div className="absolute left-2 top-[50%] -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900 border border-blue-500/30 flex items-center justify-center text-xs shadow z-30">
                    🔫
                  </div>
                  <div className="absolute right-2 top-[50%] -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900 border border-amber-500/30 flex items-center justify-center text-xs shadow z-30">
                    ⚡
                  </div>
                  <div className="absolute bottom-4 left-[50%] -translate-x-1/2 w-8 h-8 rounded-full bg-slate-900 border border-orange-500/30 flex items-center justify-center text-xs shadow z-30">
                    📯
                  </div>
                </div>

                {/* Telemetry fallback instruction */}
                {!activeTitan && (
                  <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm p-4 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl text-rose-500 animate-bounce mb-3">⚠️</span>
                    <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider font-mono">
                      Telemetry Offline: No Titan Detected
                    </h4>
                    <p className="text-[9.5px] text-slate-400 max-w-[240px] mt-1 leading-normal">
                      Modular upgrades require an active Titan Defender on the field. Please purchase and
                      place one in the Wildlife Shop.
                    </p>
                  </div>
                )}
              </div>

              {/* Dynamic HUD Upgrade Inspection Details Box */}
              <div className="bg-slate-900/60 border border-white/5 p-3 rounded-lg min-h-[95px] flex flex-col justify-center">
                {hoveredUpgrade ? (
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-sm">{hoveredUpgrade.icon}</span>
                      <h4 className="text-[11px] font-bold text-white font-mono uppercase tracking-wide">
                        {hoveredUpgrade.name}
                      </h4>
                      <span className="text-[7.5px] font-mono px-1 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30 uppercase">
                        {hoveredUpgrade.category}
                      </span>
                    </div>
                    <p className="text-[9.5px] text-slate-300 leading-snug">
                      {hoveredUpgrade.description}
                    </p>
                    <div className="text-[9px] font-black text-cyan-400 uppercase font-mono mt-1 flex items-center gap-1">
                      <span>EFFECT:</span>
                      <span className="text-emerald-400">{hoveredUpgrade.buff}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-slate-500 text-[10px] italic flex flex-col items-center gap-1">
                    <Info className="w-4 h-4 text-slate-600 animate-pulse" />
                    <span>Hover over any modular socket grid on the right to read active telemetry.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side: 12-Item Grid of Engineering Upgrade Cards (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" /> ASSEMBLY UPGRADES GRID
                </h3>
                <span className="text-[9.5px] text-slate-400 italic">
                  *Unlock all upgrades to trigger Pinnacle Overdrive bonus
                </span>
              </div>

              {/* Warnings and Alarms Banner */}
              {warningMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-rose-950/60 border border-rose-500/40 p-2 rounded-lg text-rose-300 text-[9px] font-mono font-bold uppercase tracking-wider text-center animate-bounce shadow-lg shadow-rose-950/50"
                >
                  🚨 WARNING: {warningMessage}
                </motion.div>
              )}

              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-emerald-950/60 border border-emerald-500/40 p-2 rounded-lg text-emerald-300 text-[9px] font-mono font-bold uppercase tracking-wider text-center shadow-lg shadow-emerald-950/50"
                >
                  📡 SYSTEM: {successMessage}
                </motion.div>
              )}

              {/* Cards Grid Container */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-1">
                {UPGRADES.map((item, idx) => {
                  const unlocked = isUnlocked(item.key);
                  const canAfford = meat >= item.cost;

                  return (
                    <div
                      key={`titan-upg-${item.key}-${idx}`}
                      onMouseEnter={() => setHoveredUpgrade(item)}
                      onMouseLeave={() => setHoveredUpgrade(null)}
                      className={`p-3 rounded-xl border flex flex-col justify-between transition-all duration-300 relative overflow-hidden group ${
                        unlocked
                          ? 'bg-cyan-950/30 border-cyan-500/40 shadow-inner'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      {/* Categorized Corner Tab Glow */}
                      <div
                        className={`absolute top-0 right-0 w-8 h-8 opacity-20 pointer-events-none transition-all duration-300 ${
                          unlocked ? 'bg-gradient-to-bl from-cyan-400 to-transparent' : ''
                        }`}
                      />

                      {/* Header row */}
                      <div className="flex gap-2.5 items-start">
                        <span className="text-xl bg-slate-950 p-1.5 rounded-lg border border-white/5 shadow">
                          {item.icon}
                        </span>

                        <div className="flex-1">
                          <h4 className="text-[10px] font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1">
                            {item.name}
                          </h4>
                          <span className="text-[8px] text-slate-400 font-medium">
                            {item.category}
                          </span>
                        </div>
                      </div>

                      {/* Stat Buff Box */}
                      <div className="my-2 p-1 px-1.5 rounded bg-slate-950/70 border border-white/5 text-[8.5px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                        <Zap className="w-3 h-3 text-cyan-400" />
                        {item.buff}
                      </div>

                      {/* Buy / Lock Button Footer */}
                      <div className="mt-2 flex justify-between items-center gap-1.5 border-t border-white/5 pt-2">
                        {unlocked ? (
                          <div className="w-full text-center py-1 bg-cyan-950/50 border border-cyan-500/30 text-[9px] font-bold uppercase tracking-wider text-cyan-400 rounded-lg shadow-inner">
                            🟢 Synchronized
                          </div>
                        ) : (
                          <button
                            onClick={() => handleUpgrade(item)}
                            className={`w-full py-1 text-[9px] font-black uppercase rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 ${
                              canAfford
                                ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-950 shadow-md shadow-cyan-950/30 font-bold border border-cyan-400/20'
                                : 'bg-slate-800 text-slate-500 border border-transparent cursor-not-allowed'
                            }`}
                          >
                            🛠️ {item.cost === 0 ? 'FREE' : item.cost >= 1000000 ? `${item.cost / 1000000}M Meat` : `${item.cost.toLocaleString()} Meat`}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Ultimate Mastered Pinnacle Buff Summary Panel */}
              <div className="mt-auto p-3 rounded-xl bg-slate-950 border border-cyan-500/20 shadow flex items-center gap-3">
                <span className="text-3xl animate-pulse">🌟</span>
                <div className="flex-1 text-left">
                  <h4 className="text-[10px] font-bold text-cyan-300 uppercase tracking-widest font-mono flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" /> PINNACLE OVERDRIVE BONUS
                  </h4>
                  <p className="text-[8.5px] text-slate-400 leading-normal">
                    Synchronize all 12 modules of the Titan Defender cockpit to unlock a massive{' '}
                    <strong className="text-cyan-200">+200% overall Damage multiplier</strong>, extend
                    Ultra Laser skill to <strong className="text-cyan-200">45s</strong> (reduced 40s CD),
                    and gain a passive integration field granting{' '}
                    <strong className="text-cyan-200">complete stun & disable immunity</strong> to all allied
                    wildlife towers within 1600px range!
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`text-[9px] font-bold px-2 py-1 rounded-md uppercase border ${
                      isPinnacleMastered
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30 font-black tracking-widest animate-pulse'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    {isPinnacleMastered ? '🔥 MASTERED' : `${unlockedCount}/12 NODES`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
