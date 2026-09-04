import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Sparkles, 
  Check, 
  Lock, 
  Activity, 
  Flame, 
  Zap, 
  Coins, 
  Atom, 
  Compass, 
  ShieldAlert,
  Info,
  Eye,
  Target,
  Swords
} from 'lucide-react';
import { GameState } from '../types';
import { RELICS, RelicDef } from '../relics';
import { RelicDetailModal } from './RelicDetailModal';

interface RelicVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export function RelicVaultModal({
  isOpen,
  onClose,
  gameState,
  setGameState
}: RelicVaultModalProps) {
  const [selectedInspectRelic, setSelectedInspectRelic] = useState<RelicDef | null>(null);

  const unlocked = useMemo(() => gameState.unlockedRelics || [], [gameState.unlockedRelics]);
  const equipped = useMemo(() => gameState.equippedRelicIds || [], [gameState.equippedRelicIds]);

  const handleUnlock = (relic: RelicDef, e?: React.MouseEvent) => {
    e?.stopPropagation();
    let affordable = false;
    let currencyName = '';
    
    if (relic.costType === 'dna') {
      affordable = gameState.dna >= relic.costAmount;
      currencyName = 'DNA Shards';
    } else if (relic.costType === 'shardsOfGods') {
      affordable = (gameState.shardsOfGods || 0) >= relic.costAmount;
      currencyName = 'God Shards';
    } else if (relic.costType === 'capyCoins') {
      affordable = (gameState.capyCoins || 0) >= relic.costAmount;
      currencyName = 'Capy Coins';
    }

    if (!affordable) {
      alert(`Insufficient resources! Unlocking "${relic.name}" requires ${relic.costAmount.toLocaleString()} ${currencyName}.`);
      return;
    }

    // Deduct cost and unlock
    setGameState(prev => {
      const nextUnlocked = [...(prev.unlockedRelics || [])];
      if (!nextUnlocked.includes(relic.id)) {
        nextUnlocked.push(relic.id);
      }

      let nextDna = prev.dna;
      let nextGodShards = prev.shardsOfGods || 0;
      let nextCapyCoins = prev.capyCoins || 0;

      if (relic.costType === 'dna') nextDna -= relic.costAmount;
      else if (relic.costType === 'shardsOfGods') nextGodShards -= relic.costAmount;
      else if (relic.costType === 'capyCoins') nextCapyCoins -= relic.costAmount;

      return {
        ...prev,
        dna: nextDna,
        shardsOfGods: nextGodShards,
        capyCoins: nextCapyCoins,
        unlockedRelics: nextUnlocked
      };
    });
  };

  const handleToggleEquip = (relicId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setGameState(prev => {
      let nextEquipped = [...(prev.equippedRelicIds || [])];
      
      if (nextEquipped.includes(relicId)) {
        // Unequip
        nextEquipped = nextEquipped.filter(id => id !== relicId);
      } else {
        // Equip - enforce max 2 active relics limit
        if (nextEquipped.length >= 2) {
          alert("Maximum active relic capacity reached (2/2)! Unequip a relic first before equipping this one.");
          return prev;
        }
        nextEquipped.push(relicId);
      }

      return {
        ...prev,
        equippedRelicIds: nextEquipped
      };
    });
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="w-full max-w-4xl bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-[0_0_50px_rgba(245,158,11,0.15)] flex flex-col gap-5 overflow-hidden max-h-[85vh] relative"
            >
              {/* Background energy pattern */}
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <Compass size={240} className="text-amber-500 animate-spin-slow" style={{ animationDuration: '40s' }} />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500/15 rounded-xl border border-amber-500/30 text-amber-400">
                    <Sparkles size={22} className="animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300 font-mono">
                      🌌 Primal Relic Vault
                    </h2>
                    <p className="text-[10px] text-slate-400 font-medium tracking-wide mt-0.5">
                      Equip ancient cosmic remnants and divine artifacts. <strong className="text-amber-300">Click / tap any relic to inspect exact mechanics & synergies!</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Active Equipped Slot Indicator */}
                  <div className="bg-slate-950/80 px-4 py-2 rounded-xl border border-white/5 flex items-center gap-2 text-[10px] font-mono">
                    <span className="text-slate-500">ACTIVE RELICS:</span>
                    <div className="flex gap-1.5">
                      {[0, 1].map((idx) => {
                        const reqRelicId = equipped[idx];
                        const reqRelic = reqRelicId ? RELICS.find(r => r.id === reqRelicId) : null;
                        return (
                          <button 
                            key={idx} 
                            onClick={() => {
                              if (reqRelic) setSelectedInspectRelic(reqRelic);
                            }}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-[12px] border transition-all cursor-pointer ${
                              reqRelic 
                                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:scale-110 shadow-[0_0_10px_rgba(245,158,11,0.2)]' 
                                : 'bg-slate-900 border-white/5 text-slate-600'
                            }`}
                            title={reqRelic ? `Click to inspect: ${reqRelic.name}` : 'Empty Active Relic Slot'}
                          >
                            {reqRelic ? reqRelic.emoji : '🔒'}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Live Wallet Bar */}
              <div className="grid grid-cols-3 gap-3 bg-slate-950/60 p-3 rounded-xl border border-white/5 text-[10px] font-mono relative z-10">
                <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/50 rounded-lg border border-white/5">
                  <span className="text-slate-500">🧬 DNA:</span>
                  <span className="text-indigo-400 font-black tracking-wide">
                    {gameState.dna.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/50 rounded-lg border border-white/5">
                  <span className="text-slate-500">✨ GOD SHARDS:</span>
                  <span className="text-cyan-400 font-black tracking-wide">
                    {(gameState.shardsOfGods || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/50 rounded-lg border border-white/5">
                  <span className="text-slate-500">🍊 CAPY COINS:</span>
                  <span className="text-yellow-400 font-black tracking-wide">
                    {(gameState.capyCoins || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Relics List Grid */}
              <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                {RELICS.map((relic) => {
                  const isUnlocked = unlocked.includes(relic.id);
                  const isEquipped = equipped.includes(relic.id);
                  
                  const formattedCostType = relic.costType === 'dna' ? 'DNA' : relic.costType === 'shardsOfGods' ? 'God Shards' : 'Capy Coins';
                  const costColorClass = relic.costType === 'dna' ? 'text-indigo-400' : relic.costType === 'shardsOfGods' ? 'text-cyan-400' : 'text-yellow-400';

                  return (
                    <div
                      key={relic.id}
                      onClick={() => setSelectedInspectRelic(relic)}
                      className={`p-4 rounded-xl border flex gap-4 transition-all relative overflow-hidden cursor-pointer group ${
                        isEquipped 
                          ? 'bg-slate-900 border-amber-500/50 shadow-[0_4px_25px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/30' 
                          : isUnlocked 
                          ? 'bg-slate-900/70 border-white/10 hover:border-amber-500/40 hover:bg-slate-900' 
                          : 'bg-slate-950/40 border-white/5 opacity-75 hover:opacity-100 hover:border-white/20'
                      }`}
                    >
                      {/* Active Relic Neon Border Flash */}
                      {isEquipped && (
                        <div 
                          className="absolute top-0 bottom-0 left-0 w-[4px]" 
                          style={{ backgroundColor: relic.color }} 
                        />
                      )}

                      {/* Relic Symbol / Icon */}
                      <div 
                        className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl shrink-0 border shadow-lg relative group-hover:scale-105 transition-transform"
                        style={{ 
                          backgroundColor: `${relic.color}15`, 
                          borderColor: isUnlocked ? `${relic.color}50` : '#334155'
                        }}
                      >
                        <span>{relic.emoji}</span>
                        {!isUnlocked && (
                          <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center rounded-xl">
                            <Lock size={14} className="text-slate-400" />
                          </div>
                        )}
                      </div>

                      {/* Description & Action */}
                      <div className="flex-1 flex flex-col justify-between text-left">
                        <div>
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-white flex items-center gap-1.5 font-sans group-hover:text-amber-300 transition-colors">
                              {relic.name}
                              {isEquipped && (
                                <span className="text-[7.5px] font-black uppercase font-mono bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded shadow">
                                  ACTIVE
                                </span>
                              )}
                            </h3>
                            <span className="text-[8px] font-mono text-slate-500 flex items-center gap-0.5 group-hover:text-cyan-400 transition-colors">
                              <Eye size={10} /> Inspect
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed font-sans line-clamp-2">
                            {relic.description}
                          </p>
                          
                          {/* Passive Bonus pill */}
                          <div 
                            className="inline-block mt-2 px-2 py-0.5 rounded text-[9.5px] font-mono font-black uppercase"
                            style={{ 
                              backgroundColor: `${relic.color}12`, 
                              color: relic.color,
                              border: `1px solid ${relic.color}30`
                            }}
                          >
                            ⚡ {relic.bonus}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2.5">
                          {!isUnlocked ? (
                            <div className="flex items-center justify-between w-full">
                              <div className="text-[9px] font-mono text-slate-400">
                                COST: <span className={`font-extrabold ${costColorClass}`}>{relic.costAmount.toLocaleString()} {formattedCostType}</span>
                              </div>
                              <button
                                onClick={(e) => handleUnlock(relic, e)}
                                className="px-3.5 py-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-400 hover:from-amber-500 hover:to-orange-600 text-slate-950 text-[9.5px] font-black uppercase tracking-wider rounded-lg active:scale-95 hover:shadow-[0_0_12px_rgba(245,158,11,0.4)] transition-all cursor-pointer flex items-center gap-1 border border-amber-300/30"
                              >
                                🛒 UNLOCK
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between w-full">
                              <span className="text-[9px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                                <Check size={11} /> Unlocked
                              </span>
                              <button
                                onClick={(e) => handleToggleEquip(relic.id, e)}
                                className={`px-3.5 py-1.5 text-[9.5px] font-black uppercase tracking-wider rounded-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1 ${
                                  isEquipped 
                                    ? 'bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300' 
                                    : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-950/40'
                                }`}
                              >
                                {isEquipped ? 'Unequip' : 'Equip Relic'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Hint message */}
              <div className="flex items-start gap-2 text-slate-400 text-[9.5px] leading-relaxed p-3 bg-slate-950/40 rounded-xl border border-white/5 font-sans">
                <ShieldAlert size={14} className="text-amber-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Loot & Forge Calibration:</strong> Relics can be obtained by defeating Stage Bosses (Wave 10+), Ultra World Bosses, clearing milestone waves, or forging in this Vault. Click any relic card to inspect its exact mathematical formulas, drop probabilities, and recommended unit synergies.
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Relic Detail Inspector */}
      <RelicDetailModal
        relic={selectedInspectRelic}
        isOpen={Boolean(selectedInspectRelic)}
        onClose={() => setSelectedInspectRelic(null)}
        gameState={gameState}
        setGameState={setGameState}
      />
    </>
  );
}
export { RELICS } from '../relics';
export type { RelicDef } from '../relics';
