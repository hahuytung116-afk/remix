import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Swords, Zap, Star, Shield, Play } from 'lucide-react';
import { WaveSummary, Rarity } from '../types';

interface WaveMVPPopupProps {
  summary: WaveSummary | null;
  onClose: () => void;
  onNextWave?: () => void;
  autoDeployActive?: boolean;
}

const RARITY_BADGE_CLASSES: Record<Rarity, string> = {
  'Arcane': 'bg-purple-500/20 text-purple-300 border-purple-400/50 shadow-[0_0_12px_rgba(168,85,247,0.4)] animate-pulse',
  'The Chillful': 'bg-lime-500/20 text-lime-300 border-lime-400/50 shadow-[0_0_12px_rgba(132,204,22,0.4)] animate-pulse',
  'Overseer': 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  'Unrivaled': 'bg-amber-400/15 text-amber-200 border-amber-400/30 animate-pulse',
  'Original': 'bg-red-500/10 text-red-400 border-red-500/30',
  '???': 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30',
  'Celestial': 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  'Secret': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  'Mythic': 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  'Legendary': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  'Epic': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  'Rare': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  'Common': 'bg-slate-500/10 text-slate-300 border-slate-500/30'
};

function formatDamage(dmg: number): string {
  if (dmg >= 1e12) return (dmg / 1e12).toFixed(2).replace(/\.00$/, '') + 'T';
  if (dmg >= 1e9) return (dmg / 1e9).toFixed(2).replace(/\.00$/, '') + 'B';
  if (dmg >= 1e6) return (dmg / 1e6).toFixed(2).replace(/\.00$/, '') + 'M';
  if (dmg >= 1e3) return (dmg / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  return Math.round(dmg).toLocaleString();
}

export const WaveMVPPopup: React.FC<WaveMVPPopupProps> = ({
  summary,
  onClose,
  onNextWave,
  autoDeployActive = false,
}) => {
  // Auto-dismiss after 6 seconds if auto deploy waves is active to keep screen clean
  useEffect(() => {
    if (summary && autoDeployActive) {
      const timer = setTimeout(() => {
        onClose();
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [summary, autoDeployActive, onClose]);

  if (!summary) return null;

  const badgeClass = RARITY_BADGE_CLASSES[summary.rarity] || RARITY_BADGE_CLASSES.Common;

  return (
    <AnimatePresence>
      <div className="fixed bottom-6 right-6 z-[80] flex flex-col items-end pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-80 bg-slate-900/95 border border-slate-800/80 rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] overflow-hidden backdrop-blur-md pointer-events-auto"
          style={{
            boxShadow: `0 0 30px ${summary.color}12, inset 0 0 12px ${summary.color}05`,
            borderColor: `${summary.color}25`
          }}
        >
          {/* Header Banner */}
          <div className="p-4 border-b border-slate-800/60 bg-slate-950/40 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div 
                className="p-1 rounded bg-slate-800/80 text-yellow-500 border border-slate-700/50"
                style={{ color: summary.color }}
              >
                <Trophy className="w-4 h-4" />
              </div>
              <span className="text-xs font-black tracking-widest text-slate-300 uppercase">
                Wave {summary.wave} Completed
              </span>
            </div>
            
            <button
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-white transition-colors duration-150 py-1 px-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-md font-medium"
            >
              Dismiss
            </button>
          </div>

          {/* Unit Info Body */}
          <div className="p-4 flex flex-col gap-3.5">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase font-extrabold tracking-wider ${badgeClass}`}>
                    {summary.rarity}
                  </span>
                  {summary.isPinnacle && (
                    <span className="text-[9px] bg-red-500/10 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded font-black tracking-widest uppercase">
                      Pinnacle
                    </span>
                  )}
                </div>
                <h3 
                  className="text-base font-black tracking-tight leading-tight uppercase transition-colors"
                  style={{ color: summary.color }}
                >
                  {summary.unitName}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5 font-medium flex items-center gap-1.5">
                  <span>Level {summary.level}</span>
                  {summary.trait && (
                    <>
                      <span className="text-slate-600">•</span>
                      <span className="text-cyan-400 font-semibold">{summary.trait}</span>
                    </>
                  )}
                </p>
              </div>

              {/* Big Wave MVP Trophy / Badge indicator */}
              <div className="relative">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center border bg-slate-950/60"
                  style={{ borderColor: `${summary.color}30` }}
                >
                  <Swords 
                    className="w-6 h-6"
                    style={{ color: summary.color }}
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-slate-950 rounded-full p-0.5 border border-slate-900">
                  <Star className="w-2.5 h-2.5 fill-current" />
                </div>
              </div>
            </div>

            {/* Damage Stats Panel */}
            <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800/80 flex flex-col gap-1.5 relative overflow-hidden">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                Wave Performance MVP
              </span>
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-black tracking-tight text-white font-mono">
                  {formatDamage(summary.damage)}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Total Damage
                </span>
              </div>
              <div 
                className="h-1 w-full bg-slate-800 rounded-full overflow-hidden"
              >
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: summary.color }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-500 mt-0.5">
                <span>Exact: {Math.round(summary.damage).toLocaleString()}</span>
                <span>Active Rank 1</span>
              </div>
            </div>

            {/* Next Wave Quick Action */}
            {!autoDeployActive && onNextWave && (
              <button
                onClick={() => {
                  onNextWave();
                  onClose();
                }}
                className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] border border-slate-700 hover:border-slate-600 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-2 transition-all duration-150 shadow-md shadow-black/30"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Deploy Wave {summary.wave + 1}</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
