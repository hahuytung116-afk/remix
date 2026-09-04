import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, Sparkles, Trophy, Zap, ShieldCheck, Flame, Star } from 'lucide-react';
import { gameAudio } from '../utils/audio';

interface UltraBossVictoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  rewardShards: number;
  rewardMeat: number;
  rewardDna: number;
  killsCount?: number;
}

export const UltraBossVictoryModal: React.FC<UltraBossVictoryModalProps> = ({
  isOpen,
  onClose,
  rewardShards,
  rewardMeat,
  rewardDna,
  killsCount = 1
}) => {
  useEffect(() => {
    if (isOpen) {
      gameAudio.playSFX('victory');
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
          {/* Radiant Cosmic Backdrop Aura */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/40 via-slate-950/80 to-slate-950 pointer-events-none animate-pulse" />

          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className="relative w-full max-w-lg bg-slate-900/90 border-2 border-purple-500/60 rounded-3xl p-6 sm:p-8 shadow-[0_0_80px_rgba(168,85,247,0.5)] text-white text-center overflow-hidden"
          >
            {/* Animated Crown Header Icon */}
            <div className="relative mx-auto mb-4 w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-xl animate-ping" />
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 via-purple-600 to-indigo-600 p-0.5 shadow-2xl flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Crown size={44} className="text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)] animate-bounce" />
                </div>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-purple-300 to-cyan-300 mb-1">
              GOD OF DESTRUCTION FALLEN!
            </h2>
            <p className="text-xs uppercase tracking-widest text-purple-300 font-bold mb-6">
              100 TRILLION HP ULTRA WORLD BOSS DEFEATED
            </p>

            {/* Commemorative Badge Showcase */}
            <div className="mb-6 p-4 bg-gradient-to-r from-amber-950/40 via-purple-950/60 to-slate-950 border border-purple-500/40 rounded-2xl shadow-inner flex flex-col items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1">
                <Star size={12} className="fill-amber-400" /> Commemorative Badge Unlocked
              </span>
              <div className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-purple-600 to-cyan-500 p-[2px] shadow-[0_0_20px_rgba(168,85,247,0.8)]">
                <div className="bg-slate-950 px-5 py-1.5 rounded-[10px] flex items-center gap-2">
                  <Crown size={18} className="text-amber-400 animate-pulse" />
                  <span className="text-sm font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-purple-200 to-cyan-200">
                    👑 GOD SLAYER {killsCount > 1 ? `x${killsCount}` : ''}
                  </span>
                </div>
              </div>
              <p className="text-[9.5px] text-slate-400 uppercase tracking-tight max-w-xs">
                Permanent badge displayed in your stats bar celebrating victory over the ultimate sovereign entity!
              </p>
            </div>

            {/* Reward Grid */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="p-3 bg-purple-950/40 border border-purple-500/30 rounded-xl flex flex-col items-center">
                <Sparkles size={20} className="text-purple-400 mb-1 animate-pulse" />
                <span className="text-[9px] uppercase font-bold text-purple-300">God Shards</span>
                <span className="text-base font-black font-mono text-purple-200">+{(rewardShards).toLocaleString()}</span>
              </div>
              <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl flex flex-col items-center">
                <Zap size={20} className="text-amber-400 mb-1 animate-bounce" />
                <span className="text-[9px] uppercase font-bold text-amber-300">Prime Meat</span>
                <span className="text-base font-black font-mono text-amber-200">+{(rewardMeat).toLocaleString()}</span>
              </div>
              <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl flex flex-col items-center">
                <Trophy size={20} className="text-indigo-400 mb-1" />
                <span className="text-[9px] uppercase font-bold text-indigo-300">Gene DNA</span>
                <span className="text-base font-black font-mono text-indigo-200">+{(rewardDna).toLocaleString()}</span>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 font-black uppercase text-sm tracking-widest shadow-[0_0_25px_rgba(168,85,247,0.6)] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck size={18} /> CLAIM GODLIKE POWER & BADGE
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
