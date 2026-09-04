import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plane, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  ShieldAlert, 
  Sparkles, 
  Crosshair, 
  Zap, 
  Film, 
  X,
  Target,
  ShieldCheck,
  Flame,
  Award
} from 'lucide-react';
import { GameState } from '../types';

interface SkyModeInfoBoxProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  onOpenHangar?: () => void;
  onTriggerChaseCutscene?: () => void;
}

export const SkyModeInfoBox: React.FC<SkyModeInfoBoxProps> = ({
  gameState,
  setGameState,
  onOpenHangar,
  onTriggerChaseCutscene
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showFullModal, setShowFullModal] = useState(false);

  if (!gameState.isSkyMode) return null;

  const currentKills = gameState.skyModeKills || 0;
  const progressPercent = Math.min(100, Math.floor((currentKills / 200) * 100));

  return (
    <>
      {/* Floating HUD Widget */}
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="fixed top-20 right-3 sm:right-6 z-30 max-w-[340px] w-full select-none"
      >
        <div className="bg-slate-950/90 backdrop-blur-xl border border-cyan-500/40 rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.3)] overflow-hidden transition-all duration-300">
          {/* Header Bar */}
          <div className="p-3 bg-gradient-to-r from-cyan-950/80 via-slate-900 to-indigo-950/80 border-b border-cyan-500/20 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.4)] animate-pulse">
                <Plane size={15} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-black tracking-wider text-cyan-200 uppercase">
                    SKY GAME MODE
                  </span>
                  <span className="text-[7.5px] font-mono font-black bg-cyan-500 text-slate-950 px-1.5 py-0.2 rounded uppercase">
                    ACTIVE
                  </span>
                </div>
                <span className="text-[8px] font-mono text-cyan-400/80 uppercase">
                  Flight-to-Attack Enforced
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowFullModal(true)}
                title="View Detailed Mechanics & Combat Guide"
                className="p-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/30 hover:text-white transition-all cursor-pointer"
              >
                <Info size={13} />
              </button>
              <button
                onClick={() => setIsExpanded(prev => !prev)}
                title={isExpanded ? "Collapse Sky HUD" : "Expand Sky HUD"}
                className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/10 transition-all cursor-pointer"
              >
                {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            </div>
          </div>

          {/* Collapsible Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="p-3 space-y-2.5"
              >
                {/* Core Rule Callout */}
                <div className="grid grid-cols-2 gap-2 text-[8.5px]">
                  <div className="bg-rose-950/40 p-2 rounded-xl border border-rose-500/30 flex flex-col justify-between">
                    <span className="font-extrabold text-rose-300 uppercase flex items-center gap-1">
                      <ShieldAlert size={11} className="text-rose-400 shrink-0" /> Ground Units
                    </span>
                    <span className="text-rose-200/80 mt-1 leading-tight">
                      ❌ Cannot lock on or attack flying hostiles
                    </span>
                  </div>

                  <div className="bg-cyan-950/40 p-2 rounded-xl border border-cyan-500/30 flex flex-col justify-between">
                    <span className="font-extrabold text-cyan-300 uppercase flex items-center gap-1">
                      <Plane size={11} className="text-cyan-400 shrink-0" /> Airborne Units
                    </span>
                    <span className="text-cyan-200/80 mt-1 leading-tight">
                      ✅ Full aerial combat & +25% elevation range
                    </span>
                  </div>
                </div>

                {/* 200 Kills Chasing Cutscene Tracker */}
                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between text-[9px]">
                    <span className="font-black text-amber-300 uppercase flex items-center gap-1">
                      <Film size={11} className="text-amber-400" /> Aerial Pursuit Cutscene
                    </span>
                    <span className="font-mono font-bold text-amber-400">
                      {currentKills} / 200 {currentKills >= 200 ? '⭐ UNLOCKED' : ''}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-white/10 relative">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-400 via-amber-400 to-indigo-500 transition-all duration-300 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-[7.5px] text-slate-400">
                    <span>Defeat 200 aerial hostiles in Sky Mode</span>
                    <span>{progressPercent}% Complete</span>
                  </div>

                  {/* Cutscene Action Button */}
                  {currentKills >= 200 && onTriggerChaseCutscene && (
                    <button
                      onClick={onTriggerChaseCutscene}
                      className="w-full mt-1 py-1.5 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 font-black uppercase text-[8.5px] tracking-wider rounded-lg transition-all shadow-[0_0_12px_rgba(245,158,11,0.4)] active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Film size={11} /> Play Aerial Pursuit Cutscene
                    </button>
                  )}
                </div>

                {/* Quick Action Footer */}
                <div className="flex items-center gap-2 pt-1">
                  {onOpenHangar && (
                    <button
                      onClick={onOpenHangar}
                      className="flex-1 py-1.5 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 rounded-lg text-[8.5px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-95"
                    >
                      <Plane size={11} /> Open Unit Hangar
                    </button>
                  )}
                  <button
                    onClick={() => setGameState(prev => ({ ...prev, isSkyMode: false }))}
                    className="py-1.5 px-3 bg-slate-900 hover:bg-rose-950/80 text-slate-400 hover:text-rose-300 border border-white/10 hover:border-rose-500/40 rounded-lg text-[8.5px] font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95"
                  >
                    Exit Mode
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Detailed Sky Mode Tactical Guide Modal */}
      <AnimatePresence>
        {showFullModal && (
          <div className="fixed inset-0 z-[140] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-5 sm:p-7 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(6,182,212,0.3)] space-y-5"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-cyan-500/20 border border-cyan-400/40 rounded-2xl text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                    <Plane size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                      <span>Sky Game Mode</span>
                      <span className="text-xs bg-cyan-500 text-slate-950 px-2 py-0.5 rounded-full font-black">
                        TACTICAL BRIEFING
                      </span>
                    </h2>
                    <p className="text-xs text-cyan-300/80 font-mono uppercase">
                      Atmospheric Airspace Combat & Flight Mechanics
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFullModal(false)}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Combat Mechanics Comparison Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Target size={14} className="text-cyan-400" /> Ground vs. Flight-Based Defense
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Ground Defense Card */}
                  <div className="bg-slate-950/80 border border-rose-500/30 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-rose-400 font-black text-xs uppercase">
                      <ShieldAlert size={16} /> Standard Ground Defenses
                    </div>
                    <ul className="text-[10px] text-slate-300 space-y-1.5 list-disc list-inside">
                      <li><strong className="text-rose-300">Grounded Lockout:</strong> Standard towers cannot target high-altitude invaders.</li>
                      <li><strong className="text-rose-300">Disabled Weapons:</strong> Normal attacks, beams, and basic skills remain offline while grounded.</li>
                      <li><strong className="text-rose-300">0% Interception:</strong> Grounded status causes units to be bypassed by the airborne fleet.</li>
                    </ul>
                  </div>

                  {/* Flight-Based Defense Card */}
                  <div className="bg-slate-950/80 border border-cyan-500/40 rounded-2xl p-4 space-y-2 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                    <div className="flex items-center gap-2 text-cyan-400 font-black text-xs uppercase">
                      <Plane size={16} /> Flight-Based Attacks
                    </div>
                    <ul className="text-[10px] text-slate-300 space-y-1.5 list-disc list-inside">
                      <li><strong className="text-cyan-300">Aerial Superiority:</strong> Equipping aircrafts elevates units to engage enemies in the skies.</li>
                      <li><strong className="text-cyan-300">+25% Elevation Range:</strong> Altitude gives increased targeting radius over the entire map.</li>
                      <li><strong className="text-cyan-300">Full Skill Arsenal:</strong> Ultimate abilities, elemental strikes, and lasers fire freely.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Special Aviator Units */}
              <div className="bg-slate-950/80 border border-purple-500/30 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-purple-400 font-black text-xs uppercase">
                  <Sparkles size={16} /> Innate Aviator Units (No Hangar Gear Required)
                </div>
                <p className="text-[10.5px] text-slate-300 leading-relaxed">
                  Certain units possess innate mystical levitation or aerodynamic wings and are naturally active in Sky Mode without needing hangar aircraft:
                </p>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div className="bg-purple-950/40 border border-purple-500/30 p-2 rounded-xl">
                    <span className="text-base block mb-0.5">🌌</span>
                    <strong className="text-purple-300 block">Arcane Warper</strong>
                    <span className="text-[8px] text-slate-400">Warp Levitation</span>
                  </div>
                  <div className="bg-purple-950/40 border border-purple-500/30 p-2 rounded-xl">
                    <span className="text-base block mb-0.5">🔥</span>
                    <strong className="text-amber-300 block">Phoenix</strong>
                    <span className="text-[8px] text-slate-400">Solar Flight</span>
                  </div>
                  <div className="bg-purple-950/40 border border-purple-500/30 p-2 rounded-xl">
                    <span className="text-base block mb-0.5">🐉</span>
                    <strong className="text-cyan-300 block">Wyvern</strong>
                    <span className="text-[8px] text-slate-400">Draconic Wings</span>
                  </div>
                </div>
              </div>

              {/* Rewards & Progression */}
              <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase">
                  <Award size={16} /> Mode Bonuses & Cutscene Milestone
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                  <div className="flex items-center gap-2 bg-slate-900/90 p-2 rounded-xl border border-white/5">
                    <span className="text-lg">🧬</span>
                    <div>
                      <strong className="text-green-300 block">+35% Wave DNA Bonus</strong>
                      <span className="text-[8px] text-slate-400">Awarded on all cleared Sky Mode waves</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-900/90 p-2 rounded-xl border border-white/5">
                    <span className="text-lg">🎬</span>
                    <div>
                      <strong className="text-amber-300 block">200 Kills Dogfight Cutscene</strong>
                      <span className="text-[8px] text-slate-400">Unlocks high-altitude chasing sequence</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {onOpenHangar && (
                  <button
                    onClick={() => {
                      setShowFullModal(false);
                      onOpenHangar();
                    }}
                    className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black uppercase text-xs tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Plane size={15} /> Open Aircraft Hangar
                  </button>
                )}
                {onTriggerChaseCutscene && (
                  <button
                    onClick={() => {
                      setShowFullModal(false);
                      onTriggerChaseCutscene();
                    }}
                    className="py-2.5 px-4 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/40 font-black uppercase text-xs tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Film size={15} /> Play Chasing Cutscene
                  </button>
                )}
                <button
                  onClick={() => setShowFullModal(false)}
                  className="py-2.5 px-5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold uppercase text-xs tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
