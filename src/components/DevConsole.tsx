import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Minus, 
  Maximize2, 
  Coins, 
  Dna, 
  Sparkles, 
  ShieldAlert, 
  Gauge, 
  Skull, 
  Trophy, 
  Wand2, 
  BookOpen, 
  Film, 
  Swords, 
  Zap, 
  Search,
  Sliders,
  ChevronRight,
  ChevronLeft,
  MessageSquare,
  Volume2,
  Play,
  Scroll
} from 'lucide-react';
import { GameState, TowerInstance, Animal, EnemyInstance } from '../types';
import { ANIMALS, ENEMIES } from '../constants';
import CapybaraAvatar from './CapybaraAvatar';
import { getLoreWaveData, LORE_SAGAS } from '../data/loreCampaign';
import { gameAudio } from '../utils/audio';

interface DevConsoleProps {
  isOpen?: boolean;
  onClose?: () => void;
  isDevMode?: boolean;
  isDevPanelOpen?: boolean;
  setIsDevPanelOpen?: (open: boolean) => void;
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  devInvincible: boolean;
  setDevInvincible: (v: boolean) => void;
  devSpeed: number;
  setDevSpeed: (spd: number) => void;
  setEnemies: React.Dispatch<React.SetStateAction<EnemyInstance[]>> | ((enemies: any[]) => void);
  setProjectiles: (proj: any[]) => void;
  towersRef: React.MutableRefObject<TowerInstance[]>;
  setTowers: (towers: TowerInstance[]) => void;
  gameStateRef: React.MutableRefObject<GameState>;
  setDevSummonCutscene: (val: any) => void;
  shiftElementalHazards: () => void;
  spawnHunterCommander: () => void;
  setIsWarperClashCutsceneOpen: (v: boolean) => void;
  setIsUnrivaledCutsceneOpen: (v: boolean) => void;
  setIsOverseerCutsceneOpen: (v: boolean) => void;
  setIsSkyChasingCutsceneOpen?: (v: boolean) => void;
  setIsWarperInfectionCutsceneOpen?: (v: boolean) => void;
  setIsTitanBaseReturnCutsceneOpen?: (v: boolean) => void;
  setIsBaseAttackPart1CutsceneOpen?: (v: boolean) => void;
  setIsBaseAttackPart2CutsceneOpen?: (v: boolean) => void;
  setIsBaseAttackPart3CutsceneOpen?: (v: boolean) => void;
  setIsLoreTitanCutsceneOpen?: (v: boolean) => void;
  setIsWarperReturnCutsceneOpen?: (v: boolean) => void;
}

type TabType = 'resources' | 'combat' | 'wildlife' | 'cutscenes';

export function DevConsole({
  isOpen,
  onClose,
  isDevMode,
  isDevPanelOpen,
  setIsDevPanelOpen,
  gameState,
  setGameState,
  devInvincible,
  setDevInvincible,
  devSpeed,
  setDevSpeed,
  setEnemies,
  setProjectiles,
  towersRef,
  setTowers,
  gameStateRef,
  setDevSummonCutscene,
  shiftElementalHazards,
  spawnHunterCommander,
  setIsWarperClashCutsceneOpen,
  setIsUnrivaledCutsceneOpen,
  setIsOverseerCutsceneOpen,
  setIsSkyChasingCutsceneOpen,
  setIsWarperInfectionCutsceneOpen,
  setIsTitanBaseReturnCutsceneOpen,
  setIsBaseAttackPart1CutsceneOpen,
  setIsBaseAttackPart2CutsceneOpen,
  setIsBaseAttackPart3CutsceneOpen,
  setIsLoreTitanCutsceneOpen,
  setIsWarperReturnCutsceneOpen
}: DevConsoleProps) {
  const visible = (isOpen !== undefined ? isOpen : (isDevPanelOpen ?? false)) && (isDevMode !== undefined ? isDevMode : true);
  const handleClose = () => {
    if (onClose) onClose();
    if (setIsDevPanelOpen) setIsDevPanelOpen(false);
  };
  const [activeTab, setActiveTab] = useState<TabType>('resources');
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [customAmount, setCustomAmount] = useState<string>('100000');
  const [customResource, setCustomResource] = useState<'meat' | 'dna' | 'shardsOfGods' | 'arcaneShards' | 'capyCoins' | 'gameTokens'>('meat');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isPreviewDialogueOpen, setIsPreviewDialogueOpen] = useState<boolean>(false);
  const [previewWave, setPreviewWave] = useState<number>(() => Math.max(1, gameState.wave || 1));

  if (!visible) return null;

  const currentPreviewData = getLoreWaveData(previewWave);

  const handleInfAll = () => {
    setGameState(prev => ({
      ...prev,
      meat: 999999999999,
      dna: 999999999999,
      shardsOfGods: 999999999,
      arcaneShards: 999,
      capyCoins: 999999999,
      gameTokens: 9999
    }));
  };

  const handleCustomInject = () => {
    const amount = parseInt(customAmount) || 0;
    if (amount <= 0) return;
    setGameState(prev => ({
      ...prev,
      [customResource]: ((prev[customResource] as number) || 0) + amount
    }));
  };

  const handleMaxLevelAll = () => {
    const nextTowers = towersRef.current.map(t => ({ ...t, level: 20 }));
    towersRef.current = nextTowers;
    setTowers(nextTowers);
  };

  const handleUnlockCodex = () => {
    const nextState = {
      ...gameStateRef.current,
      summonedAnimals: ANIMALS.map(a => a.id)
    };
    gameStateRef.current = nextState;
    setGameState(nextState);
  };

  const handleSummonSpecific = (animalId: string) => {
    const animal = ANIMALS.find(a => a.id === animalId);
    if (!animal) return;
    const nextState = {
      ...gameStateRef.current,
      summonedAnimals: [...new Set([...gameStateRef.current.summonedAnimals, animal.id])]
    };
    gameStateRef.current = nextState;
    setGameState(nextState);
    setDevSummonCutscene({
      isOpen: true,
      animals: [animal]
    });
  };

  const handleSpawnAlien = (enemyId: string) => {
    const enemyType = ENEMIES.find(e => e.id === enemyId);
    if (!enemyType) return;
    const isSky = ['alien_mothership', 'alien_mind_flayer', 'sky_vanguard'].includes(enemyId) || !!enemyType.isFlying;
    const newEnemy: EnemyInstance = {
      id: Math.random().toString(36).substr(2, 9),
      typeId: enemyId,
      x: 30,
      y: 300,
      health: enemyType.health * (1 + (gameState.wave || 1) * 0.2),
      maxHealth: enemyType.health * (1 + (gameState.wave || 1) * 0.2),
      pathIndex: 0,
      distanceTravelled: 0,
      rotation: 0,
      isFlying: isSky
    };
    setEnemies(prev => [...prev, newEnemy]);
    setGameState(prev => ({ ...prev, isWaveActive: true }));
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'resources', label: 'Resources', icon: <Coins size={12} />, color: 'text-amber-400' },
    { id: 'combat', label: 'Pace & Wave', icon: <Gauge size={12} />, color: 'text-pink-400' },
    { id: 'wildlife', label: 'Wildlife', icon: <Sparkles size={12} />, color: 'text-cyan-400' },
    { id: 'cutscenes', label: 'Cinematics', icon: <Film size={12} />, color: 'text-purple-400' },
  ];

  return (
    <div className="fixed bottom-4 left-4 z-50 select-none">
      {isMinimized ? (
        <motion.button
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={() => setIsMinimized(false)}
          className="bg-slate-900/95 backdrop-blur-xl border border-pink-500/50 rounded-xl px-3.5 py-2 text-white shadow-[0_0_20px_rgba(236,72,153,0.35)] flex items-center gap-2 hover:bg-slate-800 transition-all cursor-pointer group hover:scale-105"
        >
          <span className="animate-pulse">🎬</span>
          <span className="text-[11px] font-black uppercase text-pink-400 tracking-wider">Dev Console & Cutscene Previews</span>
          <Maximize2 size={12} className="text-slate-400 group-hover:text-white" />
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-80 bg-slate-900/95 backdrop-blur-2xl border border-pink-500/40 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.8),0_0_20px_rgba(236,72,153,0.25)] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-3.5 py-2.5 bg-slate-950/80 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs">🛠️</span>
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-pink-400 flex items-center gap-1.5 leading-none">
                  Authority Dev Console
                </h3>
                <div className="text-[8px] text-slate-400 font-mono mt-0.5">
                  W:{gameState.wave} • M:{gameState.meat >= 1e6 ? `${(gameState.meat / 1e6).toFixed(1)}M` : gameState.meat} • DNA:{gameState.dna}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-all cursor-pointer"
                title="Minimize console"
              >
                <Minus size={13} />
              </button>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-red-500/20 hover:text-red-400 rounded text-slate-400 transition-all cursor-pointer"
                title="Close console"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="grid grid-cols-4 bg-slate-950/50 p-1 border-b border-white/5 gap-0.5">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-1.5 px-1 rounded-lg text-[8.5px] font-black uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-slate-800 text-white shadow-sm border border-white/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <span className={activeTab === tab.id ? tab.color : 'text-slate-500'}>{tab.icon}</span>
                <span className="truncate">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Contents */}
          <div className="p-3 max-h-[340px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 space-y-2.5">
            {/* RESOURCES TAB */}
            {activeTab === 'resources' && (
              <div className="space-y-2.5">
                {/* Inf cheat master banner */}
                <button
                  onClick={handleInfAll}
                  className="w-full py-2 px-3 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-400 hover:to-amber-400 text-slate-950 font-black rounded-xl text-[10px] uppercase tracking-wider shadow-[0_0_15px_rgba(244,63,94,0.4)] transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 border border-white/20"
                >
                  <span>💀</span> INF ALL CURRENCIES (MAX 999B)
                </button>

                {/* Meat Tier */}
                <div className="bg-slate-950/60 p-2 rounded-xl border border-yellow-500/20 space-y-1.5">
                  <div className="text-[9px] font-black uppercase tracking-wider text-yellow-400 flex items-center gap-1">
                    <Coins size={10} /> Meat Supplies
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      onClick={() => setGameState(prev => ({ ...prev, meat: prev.meat + 10000 }))}
                      className="py-1 px-1.5 bg-yellow-950/60 hover:bg-yellow-900/60 text-yellow-300 border border-yellow-500/30 rounded-lg text-[9px] font-bold uppercase transition-all active:scale-95 cursor-pointer text-center"
                    >
                      +10k
                    </button>
                    <button
                      onClick={() => setGameState(prev => ({ ...prev, meat: prev.meat + 100000 }))}
                      className="py-1 px-1.5 bg-yellow-950/80 hover:bg-yellow-900/80 text-yellow-300 border border-yellow-500/40 rounded-lg text-[9px] font-bold uppercase transition-all active:scale-95 cursor-pointer text-center"
                    >
                      +100k
                    </button>
                    <button
                      onClick={() => setGameState(prev => ({ ...prev, meat: prev.meat + 10000000 }))}
                      className="py-1 px-1.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black rounded-lg text-[9px] uppercase transition-all active:scale-95 cursor-pointer text-center shadow-sm"
                    >
                      +10M
                    </button>
                  </div>
                </div>

                {/* DNA Shards */}
                <div className="bg-slate-950/60 p-2 rounded-xl border border-indigo-500/20 space-y-1.5">
                  <div className="text-[9px] font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                    <Dna size={10} /> DNA Shards
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      onClick={() => setGameState(prev => ({ ...prev, dna: prev.dna + 5000 }))}
                      className="py-1 px-1.5 bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-500/30 rounded-lg text-[9px] font-bold uppercase transition-all active:scale-95 cursor-pointer text-center"
                    >
                      +5k
                    </button>
                    <button
                      onClick={() => setGameState(prev => ({ ...prev, dna: prev.dna + 50000 }))}
                      className="py-1 px-1.5 bg-indigo-950/80 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-500/40 rounded-lg text-[9px] font-bold uppercase transition-all active:scale-95 cursor-pointer text-center"
                    >
                      +50k
                    </button>
                    <button
                      onClick={() => setGameState(prev => ({ ...prev, dna: prev.dna + 1000000 }))}
                      className="py-1 px-1.5 bg-indigo-500 hover:bg-indigo-400 text-white font-black rounded-lg text-[9px] uppercase transition-all active:scale-95 cursor-pointer text-center shadow-sm"
                    >
                      +1M
                    </button>
                  </div>
                </div>

                {/* Shards of Gods, Arcane Shards, Capy Coins & Game Tokens */}
                <div className="grid grid-cols-4 gap-1">
                  <button
                    onClick={() => setGameState(prev => ({ ...prev, shardsOfGods: (prev.shardsOfGods || 0) + 500 }))}
                    className="p-1.5 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 rounded-xl text-[8px] font-black uppercase transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center gap-0.5 text-center"
                  >
                    <span>✨ +500</span>
                    <span className="text-[6.5px] text-slate-400 font-normal">Gods</span>
                  </button>
                  <button
                    onClick={() => setGameState(prev => ({ ...prev, arcaneShards: (prev.arcaneShards || 0) + 3 }))}
                    className="p-1.5 bg-purple-950/70 hover:bg-purple-900/70 border border-purple-500/40 text-purple-300 rounded-xl text-[8px] font-black uppercase transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center gap-0.5 text-center shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                    title="Give 3 Arcane Shards for Titan 3rd Form"
                  >
                    <span>🔮 +3</span>
                    <span className="text-[6.5px] text-purple-200 font-bold">Arcane</span>
                  </button>
                  <button
                    onClick={() => setGameState(prev => ({ ...prev, capyCoins: (prev.capyCoins || 0) + 100 }))}
                    className="p-1.5 bg-lime-950/60 hover:bg-lime-900/60 border border-lime-500/30 text-lime-300 rounded-xl text-[8px] font-black uppercase transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center gap-0.5 text-center"
                  >
                    <span>🪙 +100</span>
                    <span className="text-[6.5px] text-slate-400 font-normal">Coins</span>
                  </button>
                  <button
                    onClick={() => setGameState(prev => ({ ...prev, gameTokens: (prev.gameTokens || 0) + 20 }))}
                    className="p-1.5 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-500/40 text-amber-300 rounded-xl text-[8px] font-black uppercase transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center gap-0.5 text-center"
                  >
                    <span>🎮 +20</span>
                    <span className="text-[6.5px] text-slate-400 font-normal">Tokens</span>
                  </button>
                </div>

                {/* Custom Resource Injector */}
                <div className="bg-slate-950/40 p-2 rounded-xl border border-white/5 space-y-1.5">
                  <div className="text-[8.5px] font-black uppercase text-slate-400">Custom Injector</div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={customAmount}
                      onChange={e => setCustomAmount(e.target.value)}
                      className="flex-1 bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-[10px] font-mono text-white focus:outline-none focus:border-pink-500"
                      placeholder="Amount"
                    />
                    <select
                      value={customResource}
                      onChange={e => setCustomResource(e.target.value as any)}
                      className="bg-slate-900 border border-white/10 rounded-lg px-1.5 py-1 text-[9px] font-bold text-white focus:outline-none focus:border-pink-500 uppercase"
                    >
                      <option value="meat">Meat</option>
                      <option value="dna">DNA</option>
                      <option value="shardsOfGods">Gods</option>
                      <option value="arcaneShards">Arcane</option>
                      <option value="capyCoins">Capy</option>
                      <option value="gameTokens">Tokens</option>
                    </select>
                    <button
                      onClick={handleCustomInject}
                      className="px-2.5 py-1 bg-pink-600 hover:bg-pink-500 text-white font-black text-[9px] uppercase rounded-lg active:scale-95 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* COMBAT & PACE TAB */}
            {activeTab === 'combat' && (
              <div className="space-y-2.5">
                {/* God mode toggle */}
                <label className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-xl border border-white/5 cursor-pointer hover:border-pink-500/20 transition-all">
                  <div className="flex items-center gap-2">
                    <ShieldAlert size={14} className={devInvincible ? 'text-pink-400 animate-pulse' : 'text-slate-500'} />
                    <div>
                      <div className="text-[9.5px] font-black uppercase text-white tracking-wide">God Mode / Safe Base</div>
                      <div className="text-[7.5px] text-slate-400">Base takes 0 damage from incoming threats</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={devInvincible}
                    onChange={e => {
                      setDevInvincible(e.target.checked);
                      localStorage.setItem('df_dev_invincible', e.target.checked ? 'true' : 'false');
                    }}
                    className="w-4 h-4 rounded text-pink-500 accent-pink-500 focus:ring-0 cursor-pointer"
                  />
                </label>

                {/* Speed selector */}
                <div className="bg-slate-950/60 p-2 rounded-xl border border-white/5 space-y-1.5">
                  <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-400">
                    <span className="flex items-center gap-1"><Zap size={10} className="text-amber-400" /> Simulation Speed</span>
                    <span className="font-mono text-pink-400">{devSpeed}x</span>
                  </div>
                  <div className="grid grid-cols-6 gap-1">
                    {[1.0, 2.0, 5.0, 10.0, 100.0, 1000.0].map((spd, idx) => (
                      <button
                        key={`dev-spd-${spd}-${idx}`}
                        onClick={() => {
                          setDevSpeed(spd);
                          localStorage.setItem('df_dev_speed', spd.toString());
                        }}
                        className={`py-1 rounded text-[8.5px] font-black tracking-tight cursor-pointer transition-all active:scale-95 ${
                          devSpeed === spd
                            ? 'bg-pink-500 text-slate-950 shadow-[0_0_8px_rgba(236,72,153,0.5)] font-extrabold'
                            : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Combat Instant Actions */}
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => {
                      setEnemies([]);
                      setProjectiles([]);
                      setGameState(prev => ({ ...prev, isWaveActive: false }));
                    }}
                    className="p-2 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 rounded-xl text-[9px] font-black uppercase transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Skull size={11} /> Wipe Enemies
                  </button>
                  <button
                    onClick={() => {
                      setGameState(prev => ({
                        ...prev,
                        wave: prev.wave + 1,
                        dna: prev.dna + 50 + (prev.wave * 10),
                        isWaveActive: false
                      }));
                      setEnemies([]);
                      setProjectiles([]);
                    }}
                    className="p-2 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 rounded-xl text-[9px] font-black uppercase transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Trophy size={11} /> Skip Wave (+DNA)
                  </button>
                </div>

                {/* Wave Controller */}
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-[9px] font-black uppercase text-slate-400">
                    <span>Wave Level Selector</span>
                    <span className="font-mono text-cyan-400 font-bold text-xs">Wave {gameState.wave}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="150"
                    value={gameState.wave}
                    onChange={e => {
                      const waveVal = parseInt(e.target.value);
                      setGameState(prev => ({ ...prev, wave: waveVal }));
                    }}
                    className="w-full accent-pink-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                  />
                  <div className="grid grid-cols-4 gap-1 pt-1">
                    {[10, 25, 50, 100].map(w => (
                      <button
                        key={`jump-wave-${w}`}
                        onClick={() => setGameState(prev => ({ ...prev, wave: w }))}
                        className="py-0.5 bg-slate-900 hover:bg-slate-800 border border-white/5 rounded text-[8px] font-mono font-bold text-slate-300 hover:text-cyan-300 cursor-pointer"
                      >
                        W:{w}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* WILDLIFE TAB */}
            {activeTab === 'wildlife' && (
              <div className="space-y-2">
                {/* Global Upgrades */}
                <button
                  onClick={handleMaxLevelAll}
                  className="w-full p-2 bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/30 text-purple-300 rounded-xl text-[9px] font-black uppercase transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Zap size={11} className="text-purple-400" /> Max Level All Towers (Lvl 20)
                </button>

                <button
                  onClick={handleUnlockCodex}
                  className="w-full p-2 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 rounded-xl text-[9px] font-black uppercase transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <BookOpen size={11} className="text-cyan-400" /> Full Wildlife Unlock (All Animals)
                </button>

                {/* Instant Mythic / God Summon Cheats */}
                <div className="bg-slate-950/40 p-2 rounded-xl border border-white/5 space-y-1.5">
                  <div className="text-[8.5px] font-black uppercase text-slate-400">Direct Summons</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => handleSummonSpecific('capybara')}
                      className="p-1.5 bg-lime-950/60 hover:bg-lime-900/60 border border-lime-500/30 text-lime-300 rounded-lg text-[8.5px] font-bold uppercase transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                    >
                      <CapybaraAvatar size="xs" withYuzu={false} />
                      <span className="truncate">Chill Capybara</span>
                    </button>
                    <button
                      onClick={() => handleSummonSpecific('all_seeing_overseer')}
                      className="p-1.5 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/30 text-indigo-300 rounded-lg text-[8.5px] font-bold uppercase transition-all active:scale-95 cursor-pointer text-center"
                    >
                      🔮 Overseer
                    </button>
                    <button
                      onClick={() => handleSummonSpecific('elemental_god')}
                      className="p-1.5 bg-orange-950/60 hover:bg-orange-900/60 border border-orange-500/30 text-orange-300 rounded-lg text-[8.5px] font-bold uppercase transition-all active:scale-95 cursor-pointer text-center"
                    >
                      🔥 Elemental God
                    </button>
                    <button
                      onClick={() => handleSummonSpecific('arcane_warper')}
                      className="p-1.5 bg-fuchsia-950/60 hover:bg-fuchsia-900/60 border border-fuchsia-500/30 text-fuchsia-300 rounded-lg text-[8.5px] font-bold uppercase transition-all active:scale-95 cursor-pointer text-center"
                    >
                      🧿 Arcane Warper
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* CUTSCENES & CINEMATICS TAB */}
            {activeTab === 'cutscenes' && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={spawnHunterCommander}
                    className="p-2 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 rounded-xl text-[8.5px] font-black uppercase transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1 text-center"
                  >
                    <Swords size={11} /> Spawn Commander
                  </button>
                  <button
                    onClick={shiftElementalHazards}
                    className="p-2 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-500/30 text-amber-300 rounded-xl text-[8.5px] font-black uppercase transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1 text-center"
                  >
                    <Zap size={11} /> Shift Hazards
                  </button>
                </div>

                <div className="bg-slate-950/40 p-2 rounded-xl border border-white/5 space-y-1.5">
                  <div className="text-[8.5px] font-black uppercase text-lime-400">👽 Direct Alien Armada Invasions</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => handleSpawnAlien('alien_bio_titan')}
                      className="p-1.5 bg-lime-950/60 hover:bg-lime-900/60 border border-lime-500/30 text-lime-300 rounded-lg text-[8.5px] font-bold uppercase transition-all active:scale-95 cursor-pointer text-center"
                    >
                      👑 Spawn Bio-Titan
                    </button>
                    <button
                      onClick={() => handleSpawnAlien('alien_mothership')}
                      className="p-1.5 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 rounded-lg text-[8.5px] font-bold uppercase transition-all active:scale-95 cursor-pointer text-center"
                    >
                      🛸 Spawn Mothership
                    </button>
                    <button
                      onClick={() => handleSpawnAlien('alien_mind_flayer')}
                      className="p-1.5 bg-fuchsia-950/60 hover:bg-fuchsia-900/60 border border-fuchsia-500/30 text-fuchsia-300 rounded-lg text-[8.5px] font-bold uppercase transition-all active:scale-95 cursor-pointer text-center"
                    >
                      🧠 Spawn Mind Flayer
                    </button>
                    <button
                      onClick={() => handleSpawnAlien('alien_acid_spitter')}
                      className="p-1.5 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 rounded-lg text-[8.5px] font-bold uppercase transition-all active:scale-95 cursor-pointer text-center"
                    >
                      🧪 Spawn Acid Spitter
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950/40 p-2 rounded-xl border border-white/5 space-y-1.5">
                  <div className="text-[8.5px] font-black uppercase text-slate-400">Cinematic Previews & Story Dialogue</div>
                  <div className="flex flex-col gap-1">
                    {/* Story Dialogue & Cutscene Previewer Modal Launcher */}
                    <button
                      onClick={() => setIsPreviewDialogueOpen(true)}
                      className="p-2 bg-gradient-to-r from-indigo-950 via-purple-950 to-pink-950 hover:from-indigo-900 hover:to-pink-900 border border-indigo-400/50 text-indigo-100 rounded-xl text-[9px] font-black uppercase transition-all active:scale-95 cursor-pointer text-left flex items-center justify-between shadow-[0_0_15px_rgba(99,102,241,0.35)]"
                    >
                      <span className="flex items-center gap-1.5">
                        <MessageSquare size={13} className="text-pink-400 animate-pulse" />
                        <span>🎬 PREVIEW STORY DIALOGUES & CUTSCENES (Waves 1 - 400)</span>
                      </span>
                      <ChevronRight size={11} className="text-pink-400" />
                    </button>
                    <button
                      onClick={() => {
                        const capy = ANIMALS.find(a => a.id === 'capybara') || ANIMALS[0];
                        setDevSummonCutscene({ isOpen: true, animals: [capy] });
                      }}
                      className="p-1.5 bg-lime-950/50 hover:bg-lime-900/50 border border-lime-500/30 text-lime-300 rounded-lg text-[8.5px] font-bold uppercase transition-all active:scale-95 cursor-pointer text-left flex items-center justify-between"
                    >
                      <span>🍊 Capybara Zen Cutscene</span>
                      <ChevronRight size={10} />
                    </button>
                    <button
                      onClick={() => setIsSkyChasingCutsceneOpen && setIsSkyChasingCutsceneOpen(true)}
                      className="p-1.5 bg-cyan-950/70 hover:bg-cyan-900/70 border border-cyan-500/40 text-cyan-200 rounded-lg text-[8.5px] font-bold uppercase transition-all active:scale-95 cursor-pointer text-left flex items-center justify-between"
                    >
                      <span>✈️ Sky Chasing Dogfight Cutscene</span>
                      <ChevronRight size={10} />
                    </button>
                    <button
                      onClick={() => setIsWarperInfectionCutsceneOpen && setIsWarperInfectionCutsceneOpen(true)}
                      className="p-1.5 bg-rose-950/70 hover:bg-rose-900/70 border border-rose-500/40 text-rose-200 rounded-lg text-[8.5px] font-bold uppercase transition-all active:scale-95 cursor-pointer text-left flex items-center justify-between shadow-[0_0_10px_rgba(244,63,94,0.2)]"
                    >
                      <span>🔮 W200: Warper Infection & Titan Escape</span>
                      <ChevronRight size={10} />
                    </button>
                    <button
                      onClick={() => setIsTitanBaseReturnCutsceneOpen && setIsTitanBaseReturnCutsceneOpen(true)}
                      className="p-1.5 bg-cyan-950/70 hover:bg-cyan-900/70 border border-cyan-500/40 text-cyan-200 rounded-lg text-[8.5px] font-bold uppercase transition-all active:scale-95 cursor-pointer text-left flex items-center justify-between shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                    >
                      <span>🔬 Post-Infection: Titan Base Teleport & Scientist Repair</span>
                      <ChevronRight size={10} />
                    </button>
                    <button
                      onClick={() => setIsBaseAttackPart1CutsceneOpen && setIsBaseAttackPart1CutsceneOpen(true)}
                      className="p-1.5 bg-amber-950/70 hover:bg-amber-900/70 border border-amber-500/40 text-amber-200 rounded-lg text-[8.5px] font-bold uppercase transition-all active:scale-95 cursor-pointer text-left flex items-center justify-between shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                    >
                      <span>⚡ W240: Base Attack Part 1 ("OH HELL NAW" ➔ Animal Defense)</span>
                      <ChevronRight size={10} />
                    </button>
                    <button
                      onClick={() => setIsBaseAttackPart2CutsceneOpen && setIsBaseAttackPart2CutsceneOpen(true)}
                      className="p-1.5 bg-red-950/70 hover:bg-red-900/70 border border-red-500/40 text-red-200 rounded-lg text-[8.5px] font-bold uppercase transition-all active:scale-95 cursor-pointer text-left flex items-center justify-between shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                    >
                      <span>💥 W256: Base Attack Part 2 ("...ALL GOES DOWN TO GRAVE" ➔ Upgraded Titan Full Rage)</span>
                      <ChevronRight size={10} />
                    </button>
                    <button
                      onClick={() => setIsBaseAttackPart3CutsceneOpen && setIsBaseAttackPart3CutsceneOpen(true)}
                      className="p-1.5 bg-emerald-950/70 hover:bg-emerald-900/70 border border-emerald-500/40 text-emerald-200 rounded-lg text-[8.5px] font-bold uppercase transition-all active:scale-95 cursor-pointer text-left flex items-center justify-between shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                    >
                      <span>🛸 W270: Base Attack Part 3 ("DEFEND AT ALL COST" ➔ Mothership Obliterates Base)</span>
                      <ChevronRight size={10} />
                    </button>
                    <button
                      onClick={() => setIsLoreTitanCutsceneOpen && setIsLoreTitanCutsceneOpen(true)}
                      className="p-1.5 bg-purple-950/70 hover:bg-purple-900/70 border border-purple-500/40 text-purple-200 rounded-lg text-[8.5px] font-bold uppercase transition-all active:scale-95 cursor-pointer text-left flex items-center justify-between shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                    >
                      <span>👁️ W355: Titan Transcends to Multiverse Watcher</span>
                      <ChevronRight size={10} />
                    </button>
                    <button
                      onClick={() => setIsWarperReturnCutsceneOpen && setIsWarperReturnCutsceneOpen(true)}
                      className="p-1.5 bg-indigo-950/70 hover:bg-indigo-900/70 border border-indigo-500/40 text-indigo-200 rounded-lg text-[8.5px] font-bold uppercase transition-all active:scale-95 cursor-pointer text-left flex items-center justify-between shadow-[0_0_10px_rgba(99,102,241,0.2)]"
                    >
                      <span>🌌 W399: Warper Homecoming ("im... home")</span>
                      <ChevronRight size={10} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* DIALOGUE PREVIEWER MODAL FOR ADMIN CONSOLE */}
      <AnimatePresence>
        {isPreviewDialogueOpen && (
          <div className="fixed inset-0 z-[100000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 select-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              className="bg-slate-900 border border-cyan-500/40 rounded-2xl w-full max-w-lg shadow-[0_0_50px_rgba(6,182,212,0.3)] overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-3.5 border-b border-cyan-500/20 bg-slate-950/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    <MessageSquare size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white tracking-wide flex items-center gap-2">
                      Admin Story Dialogue Previewer
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono">
                        Wave {previewWave} / 400
                      </span>
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Inspect, audition, and trigger dialogue from all 400 Lore Waves
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPreviewDialogueOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 space-y-3 overflow-y-auto custom-scrollbar">
                {/* Wave Selector & Slider */}
                <div className="bg-slate-950/70 p-3 rounded-xl border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Scroll size={13} className="text-cyan-400" />
                      Select Lore Wave:
                    </span>
                    <div className="flex items-center gap-1.5 font-mono">
                      <button
                        onClick={() => setPreviewWave(w => Math.max(1, w - 1))}
                        disabled={previewWave <= 1}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 cursor-pointer"
                      >
                        <ChevronLeft size={13} />
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="400"
                        value={previewWave}
                        onChange={(e) => setPreviewWave(Math.min(400, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                        className="w-14 px-1.5 py-0.5 bg-slate-900 border border-cyan-500/40 rounded text-center text-cyan-300 font-black text-xs"
                      />
                      <button
                        onClick={() => setPreviewWave(w => Math.min(400, w + 1))}
                        disabled={previewWave >= 400}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 cursor-pointer"
                      >
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="400"
                    value={previewWave}
                    onChange={(e) => setPreviewWave(parseInt(e.target.value, 10))}
                    className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
                  />

                  {/* Preset quick jump buttons */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {[
                      { w: 1, label: 'W1: Genesis' },
                      { w: 40, label: 'W40: Croc Apex' },
                      { w: 80, label: 'W80: Syndicate' },
                      { w: 120, label: 'W120: T-Rex' },
                      { w: 200, label: 'W200: Titan Climax' },
                      { w: 350, label: 'W350: Reality' },
                      { w: 355, label: 'W355: Titan/Watcher' },
                      { w: 395, label: 'W395: Infected Warper' },
                      { w: 397, label: 'W397: Alien Tech' },
                      { w: 399, label: 'W399: Purified Warper' },
                      { w: 400, label: 'W400: 10K Swarm' }
                    ].map(p => (
                      <button
                        key={`jump-lore-${p.w}`}
                        onClick={() => setPreviewWave(p.w)}
                        className={`px-2 py-0.5 rounded text-[8.5px] font-mono font-bold cursor-pointer transition-all ${
                          previewWave === p.w
                            ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-white/5'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Speaker & Dialogue Card */}
                <div 
                  className="bg-slate-950 p-4 rounded-xl border relative overflow-hidden shadow-inner space-y-2.5"
                  style={{ borderColor: `${currentPreviewData.speakerColor}55` }}
                >
                  <div 
                    className="absolute -top-8 -right-8 w-28 h-28 rounded-full blur-2xl opacity-20 pointer-events-none"
                    style={{ backgroundColor: currentPreviewData.speakerColor }}
                  />

                  {/* Saga tag */}
                  <div className="flex items-center justify-between">
                    <span 
                      className="px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider border"
                      style={{ 
                        backgroundColor: `${currentPreviewData.speakerColor}15`, 
                        borderColor: `${currentPreviewData.speakerColor}40`,
                        color: currentPreviewData.speakerColor 
                      }}
                    >
                      {currentPreviewData.sagaTitle}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono font-bold">
                      Chapter: {currentPreviewData.chapterTitle}
                    </span>
                  </div>

                  {/* Speaker profile */}
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl border shadow-md"
                      style={{ 
                        backgroundColor: `${currentPreviewData.speakerColor}22`,
                        borderColor: `${currentPreviewData.speakerColor}60`
                      }}
                    >
                      {currentPreviewData.speakerEmoji}
                    </div>
                    <div>
                      <div className="text-sm font-black text-white" style={{ color: currentPreviewData.speakerColor }}>
                        {currentPreviewData.speaker}
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        {currentPreviewData.speakerTitle}
                      </div>
                    </div>
                  </div>

                  {/* Dialogue quote bubble */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 italic font-medium leading-relaxed shadow-sm">
                    "{currentPreviewData.dialogue}"
                  </div>

                  {/* Lore piece snippet */}
                  <div className="bg-black/40 border border-white/5 rounded-lg p-2 text-[10.5px] text-slate-300 leading-snug">
                    <span className="text-cyan-400 font-bold uppercase text-[9.5px] block mb-0.5">Chronicle Archive:</span>
                    {currentPreviewData.lorePiece}
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => {
                      gameAudio.playSFX('upgrade');
                    }}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-200 rounded-xl text-xs font-bold uppercase transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Volume2 size={14} className="text-cyan-400" />
                    Audition Voice SFX
                  </button>

                  <button
                    onClick={() => {
                      setGameState(prev => ({
                        ...prev,
                        wave: previewWave,
                        isLoreMode: true
                      }));
                      setIsPreviewDialogueOpen(false);
                      gameAudio.playSFX('wave_start');
                    }}
                    className="p-2.5 bg-cyan-600 hover:bg-cyan-500 border border-cyan-400/50 text-slate-950 rounded-xl text-xs font-black uppercase transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-900/40"
                  >
                    <Play size={14} />
                    Set Game To Wave {previewWave}
                  </button>
                </div>

                {/* Quick Link to Wave 200 Warper Infection Cutscene */}
                <button
                  onClick={() => {
                    setIsPreviewDialogueOpen(false);
                    if (setIsWarperInfectionCutsceneOpen) {
                      setIsWarperInfectionCutsceneOpen(true);
                    }
                  }}
                  className="w-full p-2.5 bg-rose-950/80 hover:bg-rose-900/80 border border-rose-500/40 text-rose-200 rounded-xl text-xs font-black uppercase transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                >
                  <Sparkles size={14} className="text-rose-400 animate-spin" />
                  Play Wave 200 Cutscene ("NOOO, MY BROTHER" ➔ Titan Escape)
                </button>

                {/* Quick Link to Post-Infection Base Return & Scientist Repair Cutscene */}
                <button
                  onClick={() => {
                    setIsPreviewDialogueOpen(false);
                    if (setIsTitanBaseReturnCutsceneOpen) {
                      setIsTitanBaseReturnCutsceneOpen(true);
                    }
                  }}
                  className="w-full p-2.5 bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-200 rounded-xl text-xs font-black uppercase transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                >
                  <Sparkles size={14} className="text-cyan-400 animate-spin" />
                  Play Post-Infection Cutscene ("TELEPORT BACK TO BASE" ➔ Scientist Animals)
                </button>

                {/* Quick Link to Wave 240 Base Attack Part 1 Cutscene */}
                <button
                  onClick={() => {
                    setIsPreviewDialogueOpen(false);
                    if (setIsBaseAttackPart1CutsceneOpen) {
                      setIsBaseAttackPart1CutsceneOpen(true);
                    }
                  }}
                  className="w-full p-2.5 bg-amber-950/80 hover:bg-amber-900/80 border border-amber-500/40 text-amber-200 rounded-xl text-xs font-black uppercase transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                >
                  <Sparkles size={14} className="text-amber-400 animate-spin" />
                  Play Wave 240 Base Attack Part 1 ("OH HELL NAW" ➔ Animal Bullet & Laser Defense)
                </button>

                {/* Quick Link to Wave 256 Base Attack Part 2 Cutscene */}
                <button
                  onClick={() => {
                    setIsPreviewDialogueOpen(false);
                    if (setIsBaseAttackPart2CutsceneOpen) {
                      setIsBaseAttackPart2CutsceneOpen(true);
                    }
                  }}
                  className="w-full p-2.5 bg-red-950/80 hover:bg-red-900/80 border border-red-500/40 text-red-200 rounded-xl text-xs font-black uppercase transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                >
                  <Sparkles size={14} className="text-red-400 animate-spin" />
                  Play Wave 256 Base Attack Part 2 ("...ALL GOES DOWN TO GRAVE" ➔ Upgraded Titan Full Rage)
                </button>

                {/* Quick Link to Wave 270 Base Attack Part 3 Cutscene */}
                <button
                  onClick={() => {
                    setIsPreviewDialogueOpen(false);
                    if (setIsBaseAttackPart3CutsceneOpen) {
                      setIsBaseAttackPart3CutsceneOpen(true);
                    }
                  }}
                  className="w-full p-2.5 bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-200 rounded-xl text-xs font-black uppercase transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                >
                  <Sparkles size={14} className="text-emerald-400 animate-spin" />
                  Play Wave 270 Base Attack Part 3 ("DEFEND AT ALL COST" ➔ Mothership Obliterates Base)
                </button>

                {/* Quick Link to Titan Multiverse Climax Cutscene */}
                <button
                  onClick={() => {
                    setIsPreviewDialogueOpen(false);
                    if (setIsLoreTitanCutsceneOpen) {
                      setIsLoreTitanCutsceneOpen(true);
                    }
                  }}
                  className="w-full p-2.5 bg-purple-950/80 hover:bg-purple-900/80 border border-purple-500/40 text-purple-200 rounded-xl text-xs font-black uppercase transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                >
                  <Sparkles size={14} className="text-purple-400 animate-spin" />
                  Play Wave 355 Ascension Cutscene ("well its time..." ➔ Multiverse Watcher)
                </button>

                {/* Quick Link to Warper Homecoming Cutscene */}
                <button
                  onClick={() => {
                    setIsPreviewDialogueOpen(false);
                    if (setIsWarperReturnCutsceneOpen) {
                      setIsWarperReturnCutsceneOpen(true);
                    }
                  }}
                  className="w-full p-2.5 bg-indigo-950/80 hover:bg-indigo-900/80 border border-indigo-500/40 text-indigo-200 rounded-xl text-xs font-black uppercase transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                >
                  <Sparkles size={14} className="text-indigo-400 animate-spin" />
                  Play Wave 399 Cutscene ("im... home" ➔ Arcane Warper Purified)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
