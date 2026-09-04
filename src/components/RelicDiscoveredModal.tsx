import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Zap, Award, Check, Eye, ChevronRight } from 'lucide-react';
import { RelicDef } from '../relics';
import { GameState } from '../types';

interface RelicDiscoveredModalProps {
  relic: RelicDef | null;
  isOpen: boolean;
  onClose: () => void;
  onInspect?: (relic: RelicDef) => void;
  gameState?: GameState;
  setGameState?: React.Dispatch<React.SetStateAction<GameState>>;
}

export const RelicDiscoveredModal: React.FC<RelicDiscoveredModalProps> = ({
  relic,
  isOpen,
  onClose,
  onInspect,
  gameState,
  setGameState
}) => {
  if (!relic) return null;

  const equipped = gameState?.equippedRelicIds || [];
  const isEquipped = equipped.includes(relic.id);

  const handleEquipNow = () => {
    if (setGameState) {
      setGameState(prev => {
        let nextEquipped = [...(prev.equippedRelicIds || [])];
        if (!nextEquipped.includes(relic.id)) {
          if (nextEquipped.length >= 2) {
            // Replace second slot if full
            nextEquipped = [nextEquipped[0], relic.id];
          } else {
            nextEquipped.push(relic.id);
          }
        }
        return {
          ...prev,
          equippedRelicIds: nextEquipped
        };
      });
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 30 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
            className="w-full max-w-md bg-slate-900 border-2 rounded-3xl p-6 shadow-[0_0_80px_rgba(245,158,11,0.25)] flex flex-col items-center text-center gap-4 relative overflow-hidden"
            style={{ borderColor: `${relic.color}80` }}
          >
            {/* Spinning Aura Glow */}
            <div 
              className="absolute -top-32 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl opacity-30 pointer-events-none animate-pulse"
              style={{ backgroundColor: relic.color }}
            />

            {/* Banner Eyebrow */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-black uppercase tracking-widest relative z-10 shadow-lg">
              <Sparkles size={12} className="animate-spin" style={{ animationDuration: '6s' }} />
              <span>PRIMORDIAL RELIC UNEARTHED!</span>
            </div>

            {/* Relic Emblem */}
            <div 
              className="w-24 h-24 rounded-3xl flex items-center justify-center text-6xl border-2 shadow-2xl relative my-1 z-10"
              style={{ 
                backgroundColor: `${relic.color}20`, 
                borderColor: `${relic.color}90`,
                boxShadow: `0 0 40px ${relic.color}50`
              }}
            >
              <span className="animate-bounce" style={{ animationDuration: '2s' }}>{relic.emoji}</span>
            </div>

            {/* Title & Rarity */}
            <div className="relative z-10 space-y-1">
              <h2 className="text-xl font-black text-white font-mono tracking-wider">
                {relic.name}
              </h2>
              <div className="flex items-center justify-center gap-2">
                <span 
                  className="text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full font-mono border"
                  style={{ 
                    backgroundColor: `${relic.color}20`, 
                    color: relic.color,
                    borderColor: `${relic.color}50`
                  }}
                >
                  {relic.rarity} RELIC • {relic.category}
                </span>
              </div>
            </div>

            {/* What it does callout */}
            <div 
              className="w-full p-3.5 rounded-2xl border text-left space-y-1.5 relative z-10"
              style={{ 
                backgroundColor: `${relic.color}15`, 
                borderColor: `${relic.color}40`
              }}
            >
              <div className="flex items-center gap-1.5 text-[9.5px] font-black uppercase font-mono" style={{ color: relic.color }}>
                <Zap size={13} /> COMBAT MULTIPLIER GRANTED:
              </div>
              <p className="text-sm font-black text-white font-sans">
                {relic.bonus}
              </p>
              <p className="text-[10px] text-slate-300 leading-relaxed font-sans line-clamp-2">
                {relic.detailedEffect}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="w-full grid grid-cols-2 gap-3 pt-2 relative z-10">
              <button
                onClick={() => {
                  onClose();
                  onInspect(relic);
                }}
                className="py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-white/10 text-slate-200 hover:text-white text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Eye size={14} />
                <span>INSPECT DETAILS</span>
              </button>

              <button
                onClick={handleEquipNow}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-400 hover:from-amber-500 hover:to-orange-600 text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <Check size={15} />
                <span>{isEquipped ? 'CONTINUE' : 'EQUIP NOW'}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
