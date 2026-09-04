import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Dna, CheckCircle2, RefreshCw, X, Target, Zap, Flame, Shield, Sparkles } from 'lucide-react';
import { GameState } from '../types';

export interface DailyMission {
  id: string;
  type: 'summon' | 'win-wave' | 'use-overseer' | 'defeat-enemy' | 'spend-meat' | 'ascend-tower';
  text: string;
  target: number;
  current: number;
  rewardDna: number;
  claimed: boolean;
  completed: boolean;
}

const MISSION_POOL: Omit<DailyMission, 'current' | 'claimed' | 'completed'>[] = [
  { id: 'summon_5', type: 'summon', text: 'Summon 5 creatures from the Altar', target: 5, rewardDna: 350 },
  { id: 'win_2_waves', type: 'win-wave', text: 'Conquer 2 waves on the battlefield', target: 2, rewardDna: 300 },
  { id: 'use_overseer_1', type: 'use-overseer', text: 'Expand the Overseer\'s Spatial Void once', target: 1, rewardDna: 600 },
  { id: 'defeat_40_enemies', type: 'defeat-enemy', text: 'Vaporize 40 wave runner enemies', target: 40, rewardDna: 450 },
  { id: 'spend_10k_meat', type: 'spend-meat', text: 'Expend 10,000 meat on placements or upgrades', target: 10000, rewardDna: 500 },
  { id: 'ascend_tower_1', type: 'ascend-tower', text: 'Transcend any unit to an Absolute Pinnacle', target: 1, rewardDna: 750 },
];

interface DailyMissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export const DailyMissionsModal: React.FC<DailyMissionsModalProps> = ({
  isOpen,
  onClose,
  gameState,
  setGameState,
}) => {
  const [missions, setMissions] = useState<DailyMission[]>([]);
  const [timeUntilReset, setTimeUntilReset] = useState('');
  const [glowingClaimId, setGlowingClaimId] = useState<string | null>(null);

  // Load or generate missions
  useEffect(() => {
    loadOrGenerateDailyMissions();
  }, []);

  // Format countdown timer until local midnight
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diffMs = midnight.getTime() - now.getTime();
      
      const h = Math.floor(diffMs / (1000 * 60 * 60));
      const m = Math.floor((diffMs / (1000 * 60)) % 60);
      const s = Math.floor((diffMs / 1000) % 60);
      
      setTimeUntilReset(
        `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadOrGenerateDailyMissions = (forceReset = false) => {
    try {
      const savedMissionsJson = localStorage.getItem('primal_defense_daily_missions');
      const savedDate = localStorage.getItem('primal_defense_daily_missions_date');
      const todayStr = new Date().toDateString();

      if (savedMissionsJson && savedDate === todayStr && !forceReset) {
        setMissions(JSON.parse(savedMissionsJson));
      } else {
        // Pick 3 random missions from the pool
        const shuffled = [...MISSION_POOL].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3).map(m => ({
          ...m,
          current: 0,
          claimed: false,
          completed: false,
        }));
        setMissions(selected);
        localStorage.setItem('primal_defense_daily_missions', JSON.stringify(selected));
        localStorage.setItem('primal_defense_daily_missions_date', todayStr);
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('daily-missions-updated'));
        }, 0);
      }
    } catch (e) {
      console.error("Failed handling daily missions persistence", e);
    }
  };

  // Sync across different components/HUDs
  useEffect(() => {
    const handleSync = () => {
      try {
        const savedMissionsJson = localStorage.getItem('primal_defense_daily_missions');
        if (savedMissionsJson) {
          const parsed = JSON.parse(savedMissionsJson);
          setMissions(prev => {
            if (JSON.stringify(prev) === savedMissionsJson) return prev;
            return parsed;
          });
        }
      } catch (e) {
        console.error("Failed syncing daily missions on custom event", e);
      }
    };
    window.addEventListener('daily-missions-updated', handleSync);
    return () => window.removeEventListener('daily-missions-updated', handleSync);
  }, []);

  // Handle incoming real-time game events
  useEffect(() => {
    const handleMissionEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ type: string; count?: number; amount?: number }>;
      const { type, count = 1, amount = 0 } = customEvent.detail;

      setMissions(prev => {
        let changed = false;
        const updated = prev.map(m => {
          if (m.type === type && !m.claimed && !m.completed) {
            const increment = type === 'spend-meat' ? amount : count;
            const nextCurrent = Math.min(m.target, m.current + increment);
            const nextCompleted = nextCurrent >= m.target;
            
            if (nextCurrent !== m.current || nextCompleted !== m.completed) {
              changed = true;
              return {
                ...m,
                current: nextCurrent,
                completed: nextCompleted,
              };
            }
          }
          return m;
        });

        if (changed) {
          localStorage.setItem('primal_defense_daily_missions', JSON.stringify(updated));
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('daily-missions-updated'));
          }, 0);
          return updated;
        }
        return prev;
      });
    };

    window.addEventListener('daily-mission-event', handleMissionEvent);
    return () => window.removeEventListener('daily-mission-event', handleMissionEvent);
  }, []);

  const handleClaim = (missionId: string, dnaReward: number) => {
    setGlowingClaimId(missionId);
    setTimeout(() => {
      setMissions(prev => {
        const updated = prev.map(m => m.id === missionId ? { ...m, claimed: true } : m);
        localStorage.setItem('primal_defense_daily_missions', JSON.stringify(updated));
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('daily-missions-updated'));
        }, 0);
        return updated;
      });
      
      setGameState(prev => ({
        ...prev,
        dna: prev.dna + dnaReward,
      }));
      setGlowingClaimId(null);
    }, 450);
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'summon':
        return <Flame size={14} className="text-amber-400" />;
      case 'win-wave':
        return <Trophy size={14} className="text-emerald-400" />;
      case 'use-overseer':
        return <Zap size={14} className="text-cyan-400" />;
      case 'defeat-enemy':
        return <Shield size={14} className="text-rose-400" />;
      case 'spend-meat':
        return <Sparkles size={14} className="text-yellow-400" />;
      case 'ascend-tower':
        return <Flame size={14} className="text-purple-400" />;
      default:
        return <Target size={14} className="text-slate-400" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      {/* Immersive backdrop filter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm"
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="relative w-full max-w-lg bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 shadow-[0_0_50px_rgba(99,102,241,0.15)] flex flex-col overflow-hidden leading-normal text-slate-200 z-10"
      >
        {/* Futuristic layout grids */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4.5 mb-5 relative">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/15 rounded-xl border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
              <Trophy size={18} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-widest text-indigo-400 uppercase leading-none">
                Splicer Pathway
              </h2>
              <p className="text-[10px] text-slate-450 uppercase tracking-tighter mt-1 font-bold">
                Daily Objectives
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Timer ticker & Resets option */}
        <div className="flex justify-between items-center text-[10px] bg-slate-950/50 rounded-2xl px-4 py-2.5 border border-white/5 mb-5 font-mono">
          <div className="flex items-center gap-1.5 text-slate-450">
            <RefreshCw size={11} className="animate-spin text-indigo-400/50" />
            <span>OBJECTIVES CYCLE RESETS IN:</span>
          </div>
          <span className="text-indigo-400 font-extrabold tracking-wider">{timeUntilReset}</span>
        </div>

        {/* Missions Stack */}
        <div className="space-y-3">
          {missions.map((mission, idx) => {
            const pct = Math.min(100, (mission.current / mission.target) * 100);
            return (
              <div 
                key={`mission-modal-${mission.id}-${idx}`}
                className={`p-4 bg-slate-950/60 border rounded-2xl transition-all relative ${
                  mission.claimed 
                    ? 'border-white/5 opacity-50 bg-slate-950/20' 
                    : mission.completed 
                      ? 'border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.05)] bg-slate-950/80 hover:border-indigo-400'
                      : 'border-white/5 hover:border-white/10'
                }`}
              >
                {/* Visual Accent */}
                {mission.completed && !mission.claimed && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-indigo-500/10 text-indigo-300 text-[8px] font-black tracking-wider uppercase px-2 py-0.5 rounded border border-indigo-500/25 animate-pulse">
                    <CheckCircle2 size={9} /> Completed
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl mt-0.5 border ${
                    mission.claimed 
                      ? 'bg-slate-900 border-white/5' 
                      : mission.completed 
                        ? 'bg-indigo-950/40 border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.15)] animate-pulse'
                        : 'bg-slate-900 border-white/10'
                  }`}>
                    {getIconForType(mission.type)}
                  </div>
                  
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <p className={`text-[11px] font-bold leading-tight select-none flex items-center gap-1.5 flex-wrap ${mission.claimed ? 'text-slate-500 line-through' : 'text-slate-100'}`}>
                      {mission.text}
                    </p>
                    
                    {/* Progress details */}
                    <div className="flex justify-between items-center text-[9px] font-mono select-none">
                      <span className="text-slate-400">PROGRESS</span>
                      <span className={`${mission.completed ? 'text-indigo-400 font-black' : 'text-slate-300'}`}>
                        {mission.current.toLocaleString()} / {mission.target.toLocaleString()}
                      </span>
                    </div>

                    {/* Progress Slider */}
                    <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className={`h-full rounded-full ${
                          mission.claimed 
                            ? 'bg-slate-650' 
                            : mission.completed 
                              ? 'bg-gradient-to-r from-indigo-500 to-cyan-400 shadow-[0_0_5px_#6366f1]'
                              : 'bg-indigo-500/80'
                        }`}
                      />
                    </div>

                    {/* Footer Rewards & Action Trigger */}
                    <div className="flex justify-between items-center pt-1.5 select-none md:gap-3">
                      <div className="flex items-center gap-1">
                        <Dna size={12} className="text-cyan-400 animate-pulse" />
                        <span className="text-[9px] font-mono text-cyan-300 font-extrabold uppercase">
                          +{mission.rewardDna} DNA SPUDS
                        </span>
                      </div>

                      {mission.claimed ? (
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-white/5">
                          CLAIMED ✓
                        </span>
                      ) : mission.completed ? (
                        <motion.button
                          onClick={() => handleClaim(mission.id, mission.rewardDna)}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className={`px-3 py-1 bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-550 hover:to-fuchsia-550 border border-indigo-400 text-white font-black text-[9px] uppercase rounded-lg tracking-wider transition-all cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.4)] ${
                            glowingClaimId === mission.id ? 'animate-bounce opacity-80' : ''
                          }`}
                        >
                          Claim Objective
                        </motion.button>
                      ) : (
                        <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 px-2 py-0.5 bg-slate-950 rounded-lg border border-white/5 opacity-60">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dev / Playtest resets widget block with subtle divider */}
        <div className="border-t border-white/5 pt-4 mt-6 flex justify-between items-center bg-slate-950/20 rounded-2xl p-2.5 border border-white/5 text-[9px]">
          <span className="text-slate-450 uppercase font-bold tracking-tight">Need to test other missions?</span>
          <button
            onClick={() => loadOrGenerateDailyMissions(true)}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50 transition-all font-mono font-bold flex items-center gap-1 active:scale-95 cursor-pointer leading-none"
            title="Dev bypass to immediately replace your current mission layout with newly randomized entries."
          >
            <RefreshCw size={10} /> FORCE REROLL MISSIONS
          </button>
        </div>
      </motion.div>
    </div>
  );
};
