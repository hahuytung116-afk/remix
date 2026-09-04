import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Dna, CheckCircle2, Flame, Zap, Shield, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import { GameState } from '../types';

interface DailyMission {
  id: string;
  type: 'summon' | 'win-wave' | 'use-overseer' | 'defeat-enemy' | 'spend-meat' | 'ascend-tower';
  text: string;
  target: number;
  current: number;
  rewardDna: number;
  claimed: boolean;
  completed: boolean;
}

interface DailyMissionsHUDProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export const DailyMissionsHUD: React.FC<DailyMissionsHUDProps> = ({
  gameState,
  setGameState,
}) => {
  const [missions, setMissions] = useState<DailyMission[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  // Load missions from localStorage
  const loadMissions = () => {
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
      console.error('Error loading daily missions for HUD', e);
    }
  };

  useEffect(() => {
    loadMissions();

    // Listen to real-time updates when missions change inside the modal or loop
    const handleSync = () => {
      loadMissions();
    };

    window.addEventListener('daily-missions-updated', handleSync);
    return () => window.removeEventListener('daily-missions-updated', handleSync);
  }, []);

  const handleClaim = (missionId: string, dnaReward: number) => {
    setClaimingId(missionId);
    setTimeout(() => {
      try {
        const savedMissionsJson = localStorage.getItem('primal_defense_daily_missions');
        if (savedMissionsJson) {
          const currentMissions: DailyMission[] = JSON.parse(savedMissionsJson);
          const updated = currentMissions.map(m => m.id === missionId ? { ...m, claimed: true } : m);
          localStorage.setItem('primal_defense_daily_missions', JSON.stringify(updated));
          setMissions(updated);
          
          // Sync with the modal and other components
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('daily-missions-updated'));
          }, 0);
        }

        setGameState(prev => ({
          ...prev,
          dna: prev.dna + dnaReward,
        }));
      } catch (err) {
        console.error('Error claiming mission DNA in HUD', err);
      } finally {
        setClaimingId(null);
      }
    }, 400);
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'summon':
        return <Flame size={11} className="text-amber-400" />;
      case 'win-wave':
        return <Trophy size={11} className="text-emerald-400" />;
      case 'use-overseer':
        return <Zap size={11} className="text-cyan-400" />;
      case 'defeat-enemy':
        return <Shield size={11} className="text-rose-400" />;
      case 'spend-meat':
        return <Sparkles size={11} className="text-yellow-400" />;
      case 'ascend-tower':
        return <Flame size={11} className="text-purple-400" />;
      default:
        return <Trophy size={11} className="text-slate-400" />;
    }
  };

  // Count active unclaimed completed missions to show on HUD badge
  const completedUnclaimedCount = missions.filter(m => m.completed && !m.claimed).length;
  const activeCount = missions.filter(m => !m.claimed).length;

  if (missions.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-40 flex flex-col items-end select-none font-sans">
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          /* Collapsed HUD Button Badge */
          <motion.button
            key="collapsed"
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setIsExpanded(true)}
            className="p-3 bg-slate-900/90 hover:bg-slate-800/95 border border-indigo-500/30 rounded-xl shadow-[0_4px_20px_rgba(99,102,241,0.25)] flex items-center justify-center relative cursor-pointer group backdrop-blur-md"
            title="Expand Daily Missions Tracker"
          >
            <Trophy size={18} className="text-indigo-400 group-hover:text-indigo-300 animate-pulse" />
            
            {/* Pulsating badge if there's any unclaimed completed objective */}
            {completedUnclaimedCount > 0 ? (
              <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-rose-500 rounded-full flex items-center justify-center text-[8px] font-black leading-none text-white shadow-[0_0_10px_#f43f5e] animate-bounce">
                {completedUnclaimedCount}
              </span>
            ) : activeCount > 0 ? (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-indigo-500/80 rounded-full flex items-center justify-center text-[7.5px] font-bold leading-none text-white border border-slate-900">
                {activeCount}
              </span>
            ) : null}
          </motion.button>
        ) : (
          /* Expanded HUD Panel */
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.95, y: -10, x: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10, x: 10 }}
            className="w-68 bg-slate-900/85 backdrop-blur-md border border-indigo-500/25 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-3.5 flex flex-col gap-2.5 overflow-hidden text-slate-200"
          >
            {/* Header section */}
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-1.5">
                <Trophy size={13} className="text-indigo-400 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">
                  Splicer Status
                </span>
                {completedUnclaimedCount > 0 && (
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
                )}
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-0.5 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Collapse Panel"
              >
                <ChevronRight size={14} />
              </button>
            </div>

            {/* List of active/completed objectives */}
            <div className="space-y-2">
              {missions.every(m => m.claimed) ? (
                <div className="text-center py-2 text-slate-500 text-[9px] uppercase tracking-wider font-extrabold">
                  🎉 All daily objectives claimed!
                </div>
              ) : (
                missions.filter(m => !m.claimed).map((m, idx) => {
                  const progressPct = Math.min(100, (m.current / m.target) * 100);

                  return (
                    <div 
                      key={`mission-hud-${m.id}-${idx}`} 
                      className={`p-2 rounded-lg bg-slate-950/40 border text-[9.5px]/tight transition-all relative ${
                        m.completed 
                          ? 'border-indigo-500/40 bg-slate-950/60 shadow-[0_0_10px_rgba(99,102,241,0.05)]' 
                          : 'border-white/5'
                      }`}
                    >
                      {/* Name and icon */}
                      <div className="flex items-start gap-1.5">
                        <div className={`p-1 rounded bg-slate-900 border ${
                          m.completed ? 'border-indigo-500/20' : 'border-white/5'
                        }`}>
                          {getIconForType(m.type)}
                        </div>
                        <div className="flex-1 min-w-0 pr-1">
                          <p className="font-bold text-slate-200 truncate-2-lines text-[9px]" title={m.text}>
                            {m.text}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar & Numeric Indicator */}
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between items-center text-[7.5px] font-mono select-none">
                          <span className="text-slate-400 uppercase">Progress</span>
                          <span className={m.completed ? 'text-indigo-400 font-extrabold' : 'text-slate-300'}>
                            {m.current.toLocaleString()} / {m.target.toLocaleString()}
                          </span>
                        </div>
                        
                        {/* Compact bar */}
                        <div className="h-1 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              m.completed 
                                ? 'bg-gradient-to-r from-indigo-500 to-cyan-400 shadow-[0_0_4px_#6366f1]' 
                                : 'bg-indigo-500'
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Bottom action panel */}
                      <div className="flex justify-between items-center mt-2 pt-1 border-t border-white/5 text-[8px] font-mono">
                        <div className="flex items-center gap-0.5 font-bold text-cyan-300">
                          <Dna size={10} className="text-cyan-400 animate-pulse" />
                          <span>+{m.rewardDna}</span>
                        </div>

                        {m.completed ? (
                          <motion.button
                            onClick={() => handleClaim(m.id, m.rewardDna)}
                            disabled={claimingId !== null}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white font-extrabold text-[8px] px-2 py-0.5 rounded border border-indigo-400 uppercase tracking-wider cursor-pointer shadow-[0_0_8px_rgba(99,102,241,0.3)] select-none"
                          >
                            {claimingId === m.id ? 'Saving...' : 'Claim'}
                          </motion.button>
                        ) : (
                          <span className="text-slate-500 uppercase tracking-tighter text-[7.5px]">Active</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
