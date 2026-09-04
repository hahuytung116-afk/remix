import React from 'react';
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
  ShieldAlert, 
  Layers, 
  Target, 
  HelpCircle,
  Award,
  Swords,
  HeartPulse,
  Info
} from 'lucide-react';
import { RelicDef } from '../relics';
import { GameState } from '../types';

interface RelicDetailModalProps {
  relic: RelicDef | null;
  isOpen: boolean;
  onClose: () => void;
  gameState?: GameState;
  setGameState?: React.Dispatch<React.SetStateAction<GameState>>;
}

export const RelicDetailModal: React.FC<RelicDetailModalProps> = ({
  relic,
  isOpen,
  onClose,
  gameState,
  setGameState
}) => {
  if (!relic) return null;

  const unlocked = gameState?.unlockedRelics || [];
  const equipped = gameState?.equippedRelicIds || [];
  const isUnlocked = unlocked.includes(relic.id);
  const isEquipped = equipped.includes(relic.id);

  const formattedCostType = relic.costType === 'dna' ? 'DNA Shards' : relic.costType === 'shardsOfGods' ? 'God Shards' : 'Capy Coins';
  const costColorClass = relic.costType === 'dna' ? 'text-indigo-400' : relic.costType === 'shardsOfGods' ? 'text-cyan-400' : 'text-yellow-400';

  const handleUnlock = () => {
    if (!gameState || !setGameState) return;
    let affordable = false;
    let currencyName = '';
    
    if (relic.costType === 'dna') {
      affordable = (gameState.dna || 0) >= relic.costAmount;
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

    setGameState(prev => {
      const nextUnlocked = [...(prev.unlockedRelics || [])];
      if (!nextUnlocked.includes(relic.id)) {
        nextUnlocked.push(relic.id);
      }

      let nextDna = prev.dna || 0;
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

  const handleToggleEquip = () => {
    if (!setGameState) return;
    setGameState(prev => {
      let nextEquipped = [...(prev.equippedRelicIds || [])];
      
      if (nextEquipped.includes(relic.id)) {
        // Unequip
        nextEquipped = nextEquipped.filter(id => id !== relic.id);
      } else {
        // Equip - enforce max 2 active relics limit
        if (nextEquipped.length >= 2) {
          alert("Maximum active relic capacity reached (2/2)! Unequip a relic first before equipping this one.");
          return prev;
        }
        nextEquipped.push(relic.id);
      }

      return {
        ...prev,
        equippedRelicIds: nextEquipped
      };
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', duration: 0.35 }}
            className="w-full max-w-xl bg-slate-900 border rounded-2xl p-6 shadow-2xl flex flex-col gap-4 overflow-hidden max-h-[90vh] relative"
            style={{ borderColor: `${relic.color}50` }}
          >
            {/* Ambient Background Glow */}
            <div 
              className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ backgroundColor: relic.color }}
            />

            {/* Header / Relic Showcase */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4 relative z-10">
              <div className="flex items-center gap-4">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl border shadow-xl relative shrink-0"
                  style={{ 
                    backgroundColor: `${relic.color}15`, 
                    borderColor: `${relic.color}60`,
                    boxShadow: `0 0 25px ${relic.color}30`
                  }}
                >
                  <span className="animate-pulse">{relic.emoji}</span>
                  {!isUnlocked && (
                    <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center rounded-2xl">
                      <Lock size={18} className="text-slate-400" />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-black text-white font-mono tracking-wide">
                      {relic.name}
                    </h2>
                    <span 
                      className="text-[8.5px] font-black uppercase px-2 py-0.5 rounded-full font-mono border"
                      style={{ 
                        backgroundColor: `${relic.color}20`, 
                        color: relic.color,
                        borderColor: `${relic.color}40`
                      }}
                    >
                      {relic.rarity} • {relic.category}
                    </span>
                    {isEquipped && (
                      <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full font-mono bg-amber-500 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                        ⚡ EQUIPPED
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 italic mt-1 font-sans leading-snug">
                    "{relic.description}"
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-slate-200 relative z-10 text-left">
              {/* Primary Passive Bonus Banner */}
              <div 
                className="p-3.5 rounded-xl border flex items-center gap-3"
                style={{ 
                  backgroundColor: `${relic.color}12`, 
                  borderColor: `${relic.color}40`
                }}
              >
                <div 
                  className="p-2 rounded-lg text-white font-bold"
                  style={{ backgroundColor: `${relic.color}30` }}
                >
                  <Zap size={18} style={{ color: relic.color }} />
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-wider opacity-70 block font-mono">
                    ACTIVE STAT MODIFIER
                  </span>
                  <span className="text-sm font-black tracking-wide" style={{ color: relic.color }}>
                    {relic.bonus}
                  </span>
                </div>
              </div>

              {/* Detailed Operational Mechanics */}
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-white/5 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-cyan-400 font-mono">
                  <Activity size={14} /> WHAT THIS RELIC DOES & HOW IT WORKS
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                  {relic.detailedEffect}
                </p>
                
                <div className="pt-1.5 border-t border-white/5 space-y-1">
                  {relic.mechanicsNotes.map((note, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[10px] text-slate-400">
                      <span className="text-cyan-400 font-bold mt-0.5">•</span>
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Synergies */}
              <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5 flex items-start gap-2.5">
                <Swords size={15} className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[9px] font-black uppercase text-amber-400 font-mono tracking-wider block">
                    RECOMMENDED TEAM SYNERGY
                  </span>
                  <span className="text-[10.5px] text-slate-300 leading-snug">
                    {relic.bestSynergy}
                  </span>
                </div>
              </div>

              {/* Obtainability & Drop Guide */}
              <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5 flex items-start gap-2.5">
                <Target size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[9px] font-black uppercase text-emerald-400 font-mono tracking-wider block">
                    HOW TO OBTAIN & LOOT SOURCES
                  </span>
                  <p className="text-[10.5px] text-slate-300 leading-snug">
                    {relic.howToObtain}
                  </p>
                  <span className="text-[9px] font-mono text-emerald-300/80 font-bold mt-1 block">
                    🎯 Drop Probability: {relic.dropRateText}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between relative z-10">
              <div className="text-[10px] font-mono text-slate-400">
                STATUS: {isEquipped ? (
                  <span className="text-amber-400 font-black">ACTIVE (1/2 Slots)</span>
                ) : isUnlocked ? (
                  <span className="text-emerald-400 font-bold">UNLOCKED IN VAULT</span>
                ) : (
                  <span className="text-rose-400 font-bold">LOCKED</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!isUnlocked ? (
                  <button
                    onClick={handleUnlock}
                    className="px-5 py-2 bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-400 hover:from-amber-500 hover:to-orange-600 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>FORGE IN VAULT ({relic.costAmount.toLocaleString()} {formattedCostType})</span>
                  </button>
                ) : (
                  <button
                    onClick={handleToggleEquip}
                    className={`px-5 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                      isEquipped 
                        ? 'bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300' 
                        : 'bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white shadow-lg shadow-indigo-950/50'
                    }`}
                  >
                    <Check size={14} />
                    <span>{isEquipped ? 'UNEQUIP RELIC' : 'EQUIP ACTIVE RELIC'}</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
