import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Gamepad2, 
  Plane, 
  ShieldAlert, 
  Skull, 
  Flame, 
  Zap, 
  Sparkles, 
  Infinity as InfinityIcon, 
  CheckCircle2, 
  RotateCcw,
  Trophy,
  ArrowRight,
  HelpCircle,
  Swords,
  Radio,
  Bot,
  BookOpen
} from 'lucide-react';
import { GameState } from '../types';

interface GameModesModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  onOpenHangar?: () => void;
}

export const GameModesModal: React.FC<GameModesModalProps> = ({
  isOpen,
  onClose,
  gameState,
  setGameState,
}) => {
  const isSkyMode = gameState.isSkyMode ?? false;
  const isAlienMode = gameState.isAlienMode ?? false;
  const isLoreMode = gameState.isLoreMode ?? false;
  const isHardcore = gameState.isHardcore ?? false;
  const isBossRush = gameState.isBossRush ?? false;
  const isTrueHell = gameState.isTrueHell ?? false;
  const isSuddenDeath = gameState.isSuddenDeath ?? false;
  const isGigaGacha = gameState.isGigaGacha ?? false;
  const isSandbox = gameState.isSandbox ?? false;

  const isNormalMode = !isSkyMode && !isAlienMode && !isLoreMode && !isHardcore && !isBossRush && !isTrueHell && !isSuddenDeath && !isGigaGacha && !isSandbox;

  // Toggle Handlers
  const handleToggleLoreMode = () => {
    setGameState(prev => {
      const nextVal = !prev.isLoreMode;
      return {
        ...prev,
        isLoreMode: nextVal,
        loreChapter: nextVal ? (prev.loreChapter || 1) : prev.loreChapter,
        ...(nextVal ? { isTrueHell: false, isBossRush: false } : {})
      };
    });
  };

  const handleToggleSkyMode = () => {
    setGameState(prev => {
      const nextVal = !prev.isSkyMode;
      return {
        ...prev,
        isSkyMode: nextVal,
        skyFightEnabled: nextVal ? true : prev.skyFightEnabled
      };
    });
  };

  const handleToggleAlienMode = () => {
    setGameState(prev => {
      const nextVal = !prev.isAlienMode;
      return {
        ...prev,
        isAlienMode: nextVal,
        ...(nextVal ? { isTrueHell: false, isBossRush: false } : {})
      };
    });
  };

  const handleToggleHardcore = () => {
    setGameState(prev => ({
      ...prev,
      isHardcore: !prev.isHardcore,
    }));
  };

  const handleToggleBossRush = () => {
    setGameState(prev => {
      const nextVal = !prev.isBossRush;
      return {
        ...prev,
        isBossRush: nextVal,
        ...(nextVal ? { isTrueHell: false, isUltraBoss: false, isAlienMode: false } : {})
      };
    });
  };

  const handleToggleTrueHell = () => {
    setGameState(prev => {
      const nextVal = !prev.isTrueHell;
      return {
        ...prev,
        isTrueHell: nextVal,
        isUltraBoss: false,
        ...(nextVal ? { isBossRush: false, isAlienMode: false } : {})
      };
    });
  };

  const handleToggleSuddenDeath = () => {
    setGameState(prev => {
      const nextVal = !prev.isSuddenDeath;
      return {
        ...prev,
        isSuddenDeath: nextVal,
        health: nextVal ? 1 : prev.health,
      };
    });
  };

  const handleToggleGigaGacha = () => {
    setGameState(prev => ({
      ...prev,
      isGigaGacha: !prev.isGigaGacha,
    }));
  };

  const handleToggleSandbox = () => {
    setGameState(prev => {
      const nextVal = !prev.isSandbox;
      return {
        ...prev,
        isSandbox: nextVal,
        meat: nextVal ? 99999999 : prev.meat,
        dna: nextVal ? 99999999 : prev.dna,
      };
    });
  };

  const handleResetToNormal = () => {
    setGameState(prev => ({
      ...prev,
      isSkyMode: false,
      isAlienMode: false,
      isLoreMode: false,
      isHardcore: false,
      isBossRush: false,
      isTrueHell: false,
      isSuddenDeath: false,
      isGigaGacha: false,
      isSandbox: false,
      isUltraBoss: false
    }));
  };

  const gameModesList = [
    {
      id: 'lore_mode',
      name: 'Lore Chronicles Campaign',
      tag: '400 WAVES • FULL MULTIVERSE SAGA',
      icon: <BookOpen className="text-cyan-400 animate-pulse" size={22} />,
      active: isLoreMode,
      toggle: handleToggleLoreMode,
      accentColor: 'cyan',
      themeBorder: 'border-cyan-500/40',
      themeBg: 'from-cyan-950/40 via-slate-900 to-slate-950',
      badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      description: 'The definitive 400-wave campaign following the entire animal & multiverse lore across 10 sagas! Each wave features a unique lore chapter & character dialogue. Animals unlock progressively wave-by-wave (divine units like Titan Defender & Archon Overseer are locked early). Non-animal units can be stunned by Hunter EMPs, while biological defenders resist. Defeat all 400 waves and conquer the 1-Trillion HP Multiverse Prime Origin!',
      statsChips: [
        { label: '📜 400 UNIQUE LORE WAVES', color: 'text-cyan-300 bg-cyan-950/60 border-cyan-500/30' },
        { label: '🔓 WAVE-BY-WAVE UNLOCKS', color: 'text-amber-300 bg-amber-950/60 border-amber-500/30' },
        { label: '⚡ NON-ANIMAL EMP STUNS', color: 'text-rose-300 bg-rose-950/60 border-rose-500/30' },
        { label: '👑 400TH WAVE GRAND FINALE', color: 'text-fuchsia-300 bg-fuchsia-950/60 border-fuchsia-500/30' },
      ],
      bestWave: gameState.highestLoreWave || (gameState.isLoreMode ? gameState.wave : 0),
      highlight: true
    },
    {
      id: 'alien_mode',
      name: 'Alien Invasion Mode',
      tag: 'ARMADA • TITAN & MOTHERSHIP',
      icon: <Radio className="text-emerald-400 animate-pulse" size={22} />,
      active: isAlienMode,
      toggle: handleToggleAlienMode,
      accentColor: 'emerald',
      themeBorder: 'border-emerald-500/40',
      themeBg: 'from-emerald-950/40 via-slate-900 to-slate-950',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      description: 'An extraterrestrial armada invades! Battle relentless Xenomorph Crawlers, Acid Spitters, and Psionic Overminds. Confront the colossal 👑 Xenon Titan Colossus and orbital 🛸 Xenon Mothership Flagship on milestone waves. Yields +40% bonus DNA & drops Alien Tech tokens!',
      statsChips: [
        { label: '👾 XENON TITAN COLOSSUS', color: 'text-lime-300 bg-lime-950/60 border-lime-500/30' },
        { label: '🛸 MOTHERSHIP FLAGSHIP', color: 'text-cyan-300 bg-cyan-950/60 border-cyan-500/30' },
        { label: '🧪 CORROSIVE ACID & PSIONICS', color: 'text-emerald-300 bg-emerald-950/60 border-emerald-500/30' },
        { label: '🧬 +40% BONUS DNA', color: 'text-teal-300 bg-teal-950/60 border-teal-500/30' },
      ],
      bestWave: gameState.highestAlienModeWave || (gameState.isAlienMode ? gameState.wave : 0),
      highlight: true
    },
    {
      id: 'sky_mode',
      name: 'Sky Game Mode',
      tag: 'AERIAL REALM • FLIGHT MANDATORY',
      icon: <Plane className="text-cyan-400" size={22} />,
      active: isSkyMode,
      toggle: handleToggleSkyMode,
      accentColor: 'cyan',
      themeBorder: 'border-cyan-500/40',
      themeBg: 'from-cyan-950/40 via-slate-900 to-slate-950',
      badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      description: 'Flight is strictly required to attack! Ground defenses are completely ineffective against high-altitude invaders. Equip aircraft from the Hangar or deploy innate fliers (Arcane Warper). Neutralize 200 aerial hostiles to trigger the cinematic Supersonic Chasing Cutscene!',
      statsChips: [
        { label: '✈️ FLIGHT TO ATTACK', color: 'text-cyan-300 bg-cyan-950/60 border-cyan-500/30' },
        { label: '🛑 GROUND DEFENSE IDLE', color: 'text-rose-400 bg-rose-950/60 border-rose-500/30' },
        { label: '🎬 200 KILLS CHASE SCENE', color: 'text-amber-300 bg-amber-950/60 border-amber-500/30' },
        { label: '🧬 +35% DNA HARVEST', color: 'text-emerald-300 bg-emerald-950/60 border-emerald-500/30' },
      ],
      bestWave: gameState.highestSkyModeWave || 0,
      highlight: false
    },
    {
      id: 'hardcore',
      name: 'Hardcore Mode',
      tag: 'BRUTAL COMBAT',
      icon: <ShieldAlert className="text-red-400 animate-pulse" size={22} />,
      active: isHardcore,
      toggle: handleToggleHardcore,
      accentColor: 'red',
      themeBorder: 'border-red-500/40',
      themeBg: 'from-red-950/40 via-slate-900 to-slate-950',
      badgeBg: 'bg-red-500/20 text-red-300 border-red-500/40',
      description: 'Defenders suffer an 80% damage debuff (1/5 attack power) while enemy hordes spawn with 100x standard health. Demands optimal tactical synergies.',
      statsChips: [
        { label: '⚔️ -80% TOWER DMG', color: 'text-red-400 bg-red-950/60 border-red-500/30' },
        { label: '❤️ 100x ENEMY HP', color: 'text-rose-400 bg-rose-950/60 border-rose-500/30' },
      ],
      bestWave: gameState.isHardcore ? gameState.wave : 0
    },
    {
      id: 'boss_rush',
      name: 'Boss Rush Mode',
      tag: 'ENDLESS TITANS',
      icon: <Skull className="text-violet-400 animate-pulse" size={22} />,
      active: isBossRush,
      toggle: handleToggleBossRush,
      accentColor: 'violet',
      themeBorder: 'border-violet-500/40',
      themeBg: 'from-violet-950/40 via-slate-900 to-slate-950',
      badgeBg: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
      description: 'Non-stop sequence of mighty world bosses! Standard units suffer a 90% damage penalty and bosses arrive with 100x amplified toughness.',
      statsChips: [
        { label: '☠️ BOSSES ONLY', color: 'text-violet-300 bg-violet-950/60 border-violet-500/30' },
        { label: '⚔️ -90% TOWER DMG', color: 'text-violet-400 bg-violet-950/60 border-violet-500/30' },
      ],
      bestWave: gameState.highestBossRushWave || (gameState.isBossRush ? gameState.wave : 0)
    },
    {
      id: 'true_hell',
      name: 'True Hell Mode',
      tag: 'NIGHTMARE APOCALYPSE',
      icon: <Flame className="text-orange-400 animate-bounce" size={22} />,
      active: isTrueHell,
      toggle: handleToggleTrueHell,
      accentColor: 'orange',
      themeBorder: 'border-orange-500/40',
      themeBg: 'from-orange-950/40 via-slate-900 to-slate-950',
      badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
      description: '-99% damage penalty, 10x slower attack cadence, 100,000x enemy HP, and the mythical 100-Trillion HP Ultra World Boss on milestone waves.',
      statsChips: [
        { label: '🔥 -99% DMG & 10x DELAY', color: 'text-orange-400 bg-orange-950/60 border-orange-500/30' },
        { label: '👑 100T HP WORLD BOSS', color: 'text-amber-400 bg-amber-950/60 border-amber-500/30' },
      ],
      bestWave: gameState.highestTrueHellWave || (gameState.isTrueHell ? gameState.wave : 0)
    },
    {
      id: 'sudden_death',
      name: 'Sudden Death Mode',
      tag: '1 HP GLASS CANNON',
      icon: <Zap className="text-amber-400 animate-pulse" size={22} />,
      active: isSuddenDeath,
      toggle: handleToggleSuddenDeath,
      accentColor: 'amber',
      themeBorder: 'border-amber-500/40',
      themeBg: 'from-amber-950/40 via-slate-900 to-slate-950',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      description: 'Base HP is locked at exactly 1. Single leak is instant defeat! Towers gain 3x Damage and 2x Attack Speed, while enemies move 1.7x faster and spawn in rapid waves.',
      statsChips: [
        { label: '⚡ 1 BASE HP LOCK', color: 'text-amber-400 bg-amber-950/60 border-amber-500/30' },
        { label: '💥 3x DMG / 2x SPEED', color: 'text-lime-300 bg-lime-950/60 border-lime-500/30' },
      ],
      bestWave: gameState.highestSuddenDeathWave || (gameState.isSuddenDeath ? gameState.wave : 0)
    },
    {
      id: 'giga_gacha',
      name: 'Giga Gacha Fever',
      tag: 'SUMMONERS PARADISE',
      icon: <Sparkles className="text-pink-400" size={22} />,
      active: isGigaGacha,
      toggle: handleToggleGigaGacha,
      accentColor: 'pink',
      themeBorder: 'border-pink-500/40',
      themeBg: 'from-pink-950/40 via-slate-900 to-slate-950',
      badgeBg: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
      description: 'Multiplies wave DNA rewards by 10x and Shards by 5x with heavily increased odds for Secret & Celestial defenders. Enemies receive 15x health to compensate.',
      statsChips: [
        { label: '🧬 10x DNA & 5x SHARDS', color: 'text-pink-300 bg-pink-950/60 border-pink-500/30' },
        { label: '✨ SECRET DROP RATES', color: 'text-fuchsia-300 bg-fuchsia-950/60 border-fuchsia-500/30' },
      ],
      bestWave: 0
    },
    {
      id: 'sandbox',
      name: 'Creative Sandbox',
      tag: 'GOD MODE CHEATS',
      icon: <InfinityIcon className="text-emerald-400" size={22} />,
      active: isSandbox,
      toggle: handleToggleSandbox,
      accentColor: 'emerald',
      themeBorder: 'border-emerald-500/40',
      themeBg: 'from-emerald-950/40 via-slate-900 to-slate-950',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      description: 'Grants unlimited 99,999,999 Meat and DNA. All Altar gacha summons cost 0 DNA. Freely test defense setups, max upgrades, and test aviation gear.',
      statsChips: [
        { label: '💎 99,999,999 RESOURCES', color: 'text-emerald-300 bg-emerald-950/60 border-emerald-500/30' },
        { label: '🔮 FREE ALTA ROLLS', color: 'text-teal-300 bg-teal-950/60 border-teal-500/30' },
      ],
      bestWave: 0
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-3xl bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col z-10 max-h-[92vh]"
          >
            {/* Holographic Header Bar */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-500" />

            {/* Header */}
            <header className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-amber-500/20 to-purple-500/20 rounded-xl border border-amber-500/30 flex items-center justify-center">
                  <Gamepad2 className="text-amber-400" size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black uppercase text-white tracking-widest">Tactical Game Modes</h2>
                    <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300">
                      Unified Mode Hub
                    </span>
                  </div>
                  <p className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    SELECT SIMULATION DIFFICULTY • COMBAT RULES & REWARDS
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!isNormalMode && (
                  <button
                    onClick={handleResetToNormal}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95"
                    title="Disable all active challenge modifiers and return to default defense rules"
                  >
                    <RotateCcw size={12} />
                    <span>Reset to Standard</span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl bg-slate-950/50 text-slate-400 hover:text-white border border-white/10 hover:border-white/20 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </header>

            {/* Top Status Strip */}
            <div className="px-6 py-2.5 bg-slate-950/40 border-b border-white/5 flex flex-wrap items-center justify-between gap-2 text-[9px] font-mono">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-sans font-bold uppercase">Active Configuration:</span>
                {isNormalMode ? (
                  <span className="text-emerald-400 font-black bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <CheckCircle2 size={11} /> 🛡️ STANDARD COMBAT (BALANCED)
                  </span>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {isSkyMode && <span className="text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 rounded-md font-black">✈️ SKY MODE</span>}
                    {isHardcore && <span className="text-red-300 bg-red-500/15 border border-red-500/30 px-2 py-0.5 rounded-md font-black">⚠️ HARDCORE</span>}
                    {isBossRush && <span className="text-violet-300 bg-violet-500/15 border border-violet-500/30 px-2 py-0.5 rounded-md font-black">☠️ BOSS RUSH</span>}
                    {isTrueHell && <span className="text-orange-300 bg-orange-500/15 border border-orange-500/30 px-2 py-0.5 rounded-md font-black">🔥 TRUE HELL</span>}
                    {isSuddenDeath && <span className="text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md font-black">⚡ SUDDEN DEATH</span>}
                    {isGigaGacha && <span className="text-pink-300 bg-pink-500/15 border border-pink-500/30 px-2 py-0.5 rounded-md font-black">🎰 GIGA GACHA</span>}
                    {isSandbox && <span className="text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-md font-black">💎 SANDBOX</span>}
                  </div>
                )}
              </div>

              <div className="text-slate-400 text-[8.5px]">
                Current Wave: <span className="text-white font-bold">{gameState.wave}</span>
              </div>
            </div>

            {/* Modal Body: Cards List */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5 flex-1">
              
              {/* Quick Explanation Banner */}
              <div className="p-3 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 flex items-start gap-2.5 text-[9px] text-slate-300">
                <HelpCircle size={15} className="text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-indigo-300">Tactical Guidance:</span> You can toggle modes at any time. In <span className="text-cyan-300 font-bold">Sky Game Mode</span>, units MUST be equipped with aircraft in the Hangar tab (or be natural flyers like Arcane Warper) to attack elevated enemies!
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {gameModesList.map((mode) => {
                  return (
                    <div
                      key={`mode-card-${mode.id}`}
                      className={`p-4 rounded-2xl border transition-all relative flex flex-col justify-between overflow-hidden bg-gradient-to-br ${mode.themeBg} ${
                        mode.active
                          ? `${mode.themeBorder} shadow-[0_0_20px_rgba(0,0,0,0.5)] ring-1 ring-white/10`
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      {/* Top Header in Card */}
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-slate-950/60 border border-white/10 shadow-inner">
                              {mode.icon}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h3 className="text-xs font-black uppercase text-white tracking-wide">
                                  {mode.name}
                                </h3>
                                {mode.highlight && (
                                  <span className="text-[7px] font-black uppercase px-1.5 py-0.2 rounded bg-cyan-500 text-slate-950">
                                    NEW
                                  </span>
                                )}
                              </div>
                              <span className="text-[7.5px] font-mono text-slate-400 font-bold tracking-wider uppercase">
                                {mode.tag}
                              </span>
                            </div>
                          </div>

                          {/* Mode Toggle Switch */}
                          <button
                            onClick={mode.toggle}
                            className={`w-11 h-6 rounded-full p-0.5 transition-all duration-300 flex-shrink-0 cursor-pointer ${
                              mode.active 
                                ? (mode.accentColor === 'cyan' ? 'bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.6)]' :
                                   mode.accentColor === 'red' ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]' :
                                   mode.accentColor === 'violet' ? 'bg-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.6)]' :
                                   mode.accentColor === 'orange' ? 'bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.6)]' :
                                   mode.accentColor === 'amber' ? 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]' :
                                   mode.accentColor === 'pink' ? 'bg-pink-500 shadow-[0_0_12px_rgba(236,72,153,0.6)]' :
                                   'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]')
                                : 'bg-slate-800'
                            }`}
                            title={`Toggle ${mode.name}`}
                          >
                            <div
                              className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
                                mode.active ? 'transform translate-x-5' : 'transform translate-x-0'
                              }`}
                            />
                          </button>
                        </div>

                        {/* Description */}
                        <p className="text-[9px] text-slate-300 leading-relaxed mt-1">
                          {mode.description}
                        </p>
                      </div>

                      {/* Stat Badges and Best Wave Footer */}
                      <div className="mt-3 pt-2.5 border-t border-white/5 space-y-2">
                        <div className="flex flex-wrap gap-1.5">
                          {mode.statsChips.map((chip, cIdx) => (
                            <span
                              key={`chip-${mode.id}-${cIdx}`}
                              className={`text-[7.5px] font-black uppercase px-2 py-0.5 rounded-md border ${chip.color}`}
                            >
                              {chip.label}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-[8px] font-mono">
                          <span className="text-slate-500 uppercase">
                            Status: <strong className={mode.active ? 'text-white' : 'text-slate-500'}>{mode.active ? 'ACTIVE' : 'INACTIVE'}</strong>
                          </span>
                          {mode.bestWave > 0 && (
                            <span className="text-amber-400 font-bold flex items-center gap-1">
                              <Trophy size={10} /> Record: Wave {mode.bestWave}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Footer */}
            <footer className="p-4 sm:p-5 border-t border-white/10 bg-slate-950/60 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[8.5px] text-slate-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>REAL-TIME COMBAT ENGINE</span>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-xl border border-white/10 active:scale-95 transition-all uppercase text-[10px] tracking-widest cursor-pointer"
              >
                Close & Return to Fight
              </button>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
