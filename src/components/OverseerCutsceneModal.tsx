import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Star, ShieldAlert, Swords, Zap, RefreshCw, Layers, ShieldCheck, Flame, Cpu } from 'lucide-react';

interface OverseerCutsceneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReward: () => void; // Gives meat and DNA reward upon completion
}

type CutsceneStage = 'intro' | 'overseer_appears' | 'climax_charging' | 'obliteration' | 'aftermath';

interface CombatLogEntry {
  id: string;
  source: 'commander' | 'overseer' | 'system';
  text: string;
  color?: string;
}

interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
}

interface ShardParticle {
  id: string;
  text: string;
  color: string;
  x: number;
  y: number;
  tx: number;
  ty: number;
  scale: number;
  rotate: number;
  duration: number;
}

// Custom Celestial Overseer Eye HUD
function CelestialOverseerEye() {
  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      {/* Outer Rotating Ancient & Sci-Fi Dials */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 rounded-full border border-dashed border-cyan-500/30 flex items-center justify-center p-1"
      >
        <div className="w-full h-full rounded-full border border-teal-500/10 border-t-teal-400 border-b-cyan-400" />
      </motion.div>
      
      <motion.div
        animate={{ rotate: -365 }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-4 rounded-full border border-cyan-400/20 border-l-cyan-300 border-r-indigo-500 flex items-center justify-center"
      >
        <div className="w-[90%] h-[90%] rounded-full border border-dotted border-indigo-400/40" />
      </motion.div>

      {/* Hexagonal Laser Bracket Ring */}
      <motion.div
        animate={{ scale: [1, 1.05, 1], rotate: 45 }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-8 rounded-full border-2 border-teal-400/40 bg-cyan-950/20 backdrop-blur-md flex items-center justify-center ring-4 ring-cyan-500/10"
      >
        {/* SVG Pupil with radiating lashes and vertical alignment */}
        <svg className="w-full h-full p-3 text-cyan-400" viewBox="0 0 100 100" fill="none" stroke="currentColor">
          {/* Main Cyber Eye Arc */}
          <path d="M 10,50 Q 50,15 90,50 Q 50,85 10,50 Z" strokeWidth="2.5" strokeLinecap="round" className="opacity-90 shadow-lg" />
          {/* Inner rings */}
          <circle cx="50" cy="50" r="18" strokeWidth="1.5" strokeDasharray="4 4" />
          <circle cx="50" cy="50" r="24" strokeWidth="0.75" strokeDasharray="1 3" opacity="0.6" />
          {/* Scanning Reticle Lines */}
          <line x1="50" y1="5" x2="50" y2="22" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
          <line x1="50" y1="78" x2="50" y2="95" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
          <line x1="5" y1="50" x2="22" y2="50" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
          <line x1="78" y1="50" x2="95" y2="50" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
          
          <path d="M 35,50 Q 50,42 65,50 Q 50,58 35,50 Z" fill="rgba(34, 211, 238, 0.15)" strokeWidth="1" />
        </svg>
      </motion.div>

      {/* Pure Energy Core Pupil */}
      <motion.div
        animate={{ scale: [1, 1.25, 0.95, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute w-12 h-12 rounded-full bg-gradient-to-r from-white via-cyan-400 to-indigo-500 shadow-[0_0_35px_rgba(34,211,238,0.8)] flex items-center justify-center border border-sky-200"
      >
        <div className="w-4 h-4 rounded-full bg-white animate-ping opacity-75" />
      </motion.div>
    </div>
  );
}

// Custom Aegis Commander Armor Avatar representation
function ApexCommanderAvatar() {
  return (
    <div className="relative w-44 h-44 flex items-center justify-center select-none">
      {/* Red Defense brackets radiating power */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], rotate: -45 }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute inset-0 rounded-2xl border border-rose-500/20"
      />
      <div className="absolute inset-2 border-2 border-dashed border-rose-500/30 rounded-xl" />

      {/* Titanium Heavy Shield Bracket */}
      <div className="w-36 h-36 bg-slate-950 border-4 border-rose-600 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden shadow-[0_0_35px_rgba(244,63,94,0.3)]">
        <div className="absolute top-1 left-1 right-1 h-3 bg-rose-950/60 border-b border-rose-500/30 flex justify-between items-center px-1 text-[7px] font-mono text-rose-400">
          <span>HOSTILE ARMOR V2</span>
          <span className="animate-pulse">ONLINE</span>
        </div>

        {/* Commander Chestpiece/Core SVG Graphic instead of face emoji */}
        <svg className="w-24 h-24 text-rose-500 mt-2" viewBox="0 0 100 100" fill="none" stroke="currentColor">
          {/* Heavy angular helmet / armored shroud */}
          <path d="M 20,25 L 80,25 L 85,55 L 50,85 L 15,55 Z" strokeWidth="3" fill="rgba(244, 63, 94, 0.08)" />
          {/* Visual sensor visor strip */}
          <rect x="28" y="38" width="44" height="10" rx="2" strokeWidth="2.5" fill="rgba(244, 63, 94, 0.2)" />
          <motion.div
            animate={{ x: [-2, 2, -2] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="w-4 h-1 bg-red-400"
          />
          {/* Laser sight sensor line */}
          <line x1="50" y1="38" x2="50" y2="48" strokeWidth="2" />
          {/* Energy Core / exhaust plates */}
          <path d="M 35,62 L 50,52 L 65,62" strokeWidth="2" strokeLinecap="round" />
          <circle cx="50" cy="70" r="6" fill="#f43f5e" className="animate-pulse" />
          
          {/* Tactical warning nodes */}
          <circle cx="28" cy="30" r="2" fill="#ef4444" />
          <circle cx="72" cy="30" r="2" fill="#ef4444" />
        </svg>

        {/* Lower warning subtitle */}
        <div className="absolute bottom-1.5 inset-x-0 text-center">
          <span className="text-[7px] font-black tracking-widest text-rose-400 uppercase">
            AEGIS OVERLORD
          </span>
        </div>
      </div>
    </div>
  );
}

export function OverseerCutsceneModal({ isOpen, onClose, onReward }: OverseerCutsceneModalProps) {
  const [stage, setStage] = useState<CutsceneStage>('intro');
  const [typedCommanderText, setTypedCommanderText] = useState('');
  const [typedOverseerText, setTypedOverseerText] = useState('');
  
  // Localized subtle shake flags rather than violent window shaking
  const [shakeCommander, setShakeCommander] = useState(false);
  const [shakeOverseer, setShakeOverseer] = useState(false);

  // Timer refs to allow skips
  const timer1Ref = useRef<any>(null);
  const timer2Ref = useRef<any>(null);

  // Active Battle Simulation stats
  const maxCommanderHP = 1000000;
  const [commanderHP, setCommanderHP] = useState(maxCommanderHP);
  const [overseerCharge, setOverseerCharge] = useState(0);
  const [lasers, setLasers] = useState<{ id: string; dir: 'left-to-right' | 'right-to-left'; y: number; color: string }[]>([]);
  const [shards, setShards] = useState<ShardParticle[]>([]);

  // Action Cooldown & Shield States
  const [strikeCooldown, setStrikeCooldown] = useState(0); // remaining ms
  const [shieldCooldown, setShieldCooldown] = useState(0); // remaining ms
  const [commanderShieldActive, setCommanderShieldActive] = useState(false);

  // Dynamic lists of logs & floating damage numbers during combat phase
  const [combatLogs, setCombatLogs] = useState<CombatLogEntry[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  
  const consoleBottomRef = useRef<HTMLDivElement>(null);

  // Sound cues / logs text
  const [soundLogStr, setSoundLogStr] = useState('🚨 SYSTEM WARNING: HOSTILE SIGNAL OVERWRITE');

  // Trigger floating damage text helper
  const spawnFloatingText = (x: number, y: number, text: string, color: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setFloatingTexts(prev => [...prev, { id, x, y, text, color }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(f => f.id !== id));
    }, 2000);
  };

  // Add customized combat text logs
  const addCombatLog = (text: string, source: 'commander' | 'overseer' | 'system', color?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setCombatLogs(prev => [...prev, { id, source, text, color }]);
  };

  // Auto scroll interactive console feed
  useEffect(() => {
    if (consoleBottomRef.current) {
      consoleBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [combatLogs]);

  // Skip logic handlers
  const skipToBattle = () => {
    if (timer1Ref.current) clearTimeout(timer1Ref.current);
    if (timer2Ref.current) clearTimeout(timer2Ref.current);
    setStage('climax_charging');
    setSoundLogStr('⚡ ACTIVE CLIMAX CLASH INITIATED: FABRIC WARFARE');
    setCombatLogs(prev => [
      ...prev,
      { id: Math.random().toString(36).substring(2, 9), source: 'system', text: 'SYSTEM: BATTLE ROUTINE COMMENCED. REALM OF EVEN HORIZON OPENED.', color: 'text-yellow-400 font-extrabold' }
    ]);
  };

  // Advance stage timeline
  useEffect(() => {
    if (!isOpen) return;
    setStage('intro');
    setTypedCommanderText('');
    setTypedOverseerText('');
    setCommanderHP(maxCommanderHP);
    setOverseerCharge(0);
    setCommanderShieldActive(false);
    setStrikeCooldown(0);
    setShieldCooldown(0);
    setCombatLogs([
      { id: '1', source: 'system', text: 'ALERT: FIELD HUNTER DEFIANCE EMITTED BY SPECIAL APEX UNIT', color: 'text-red-400' },
      { id: '2', source: 'system', text: 'INITIATING TRANS-REALM FOCUS SEQUENCE...', color: 'text-slate-400' }
    ]);
    setSoundLogStr('🚨 SYSTEM WARNING: HOSTILE SIGNAL OVERWRITE IN PROGRESS');

    // Stage 1 -> 2: Overseer Appears (speed up from 6s to 2.5s)
    timer1Ref.current = setTimeout(() => {
      setStage('overseer_appears');
      setShakeOverseer(true);
      setSoundLogStr('🌌 ASTRONOMICAL ANOMALY DETECTED: FABRIC UNRAVELING');
      addCombatLog('SYSTEM: CELESTIAL DISTORTION DETECTED. CHRONO-COMPRESSION EXCEEDS 999%', 'system', 'text-cyan-400 animate-pulse');
      setTimeout(() => setShakeOverseer(false), 500);
    }, 2500);

    // Stage 2 -> 3: Climax Active Fighting Arena (speed up from 12.5s to 5s)
    timer2Ref.current = setTimeout(() => {
      setStage('climax_charging');
      setSoundLogStr('⚡ ACTIVE CLIMAX CLASH INITIATED: FABRIC WARFARE');
      addCombatLog('SYSTEM: ACTIVE BATTLE ROUTINE COMMENCED. REALM OF EVEN HORIZON OPENED.', 'system', 'text-yellow-400 font-extrabold');
    }, 5000);

    return () => {
      if (timer1Ref.current) clearTimeout(timer1Ref.current);
      if (timer2Ref.current) clearTimeout(timer2Ref.current);
    };
  }, [isOpen]);

  // Decrement active cooldown timers
  useEffect(() => {
    if (stage !== 'climax_charging') {
      setStrikeCooldown(0);
      setShieldCooldown(0);
      return;
    }
    const cdInterval = setInterval(() => {
      setStrikeCooldown(prev => Math.max(0, prev - 100));
      setShieldCooldown(prev => Math.max(0, prev - 100));
    }, 100);
    return () => clearInterval(cdInterval);
  }, [stage]);

  // Handle automatic transition from Obliteration phase to Aftermath scene
  useEffect(() => {
    if (stage !== 'obliteration') {
      setShards([]);
      return;
    }
    
    setShakeCommander(true);
    setSoundLogStr('💥 EVENT HORIZON DETONATION TRIGGERED: ABSOLUTE REWRITE');

    // Generate exploding UI fragments
    const textPool = [
      'CMD_REWRITE', 'SYSTEM_FAILURE', '0xAA77FF', 'NANO_DISSOLUTION', 'CORE_DEPLETED',
      '01001010', 'VOID_REWRITE', 'GRID_ERASURE', 'ERR: NO_REPAIR_ROUTE', 'OBLITERATING',
      'COGNITIVE_VOID', 'REACTIVE_SPLICER', 'OVERWRITE_TRUE', 'SOUL_DECAY', 'REBOOTING',
      'CRITICAL_OVERHEAT', 'SECTOR_ERASED', 'HARDWARE_TERMINAL', 'CODE_FATAL', 'CORE_SPLIT'
    ];
    const colors = ['#f43f5e', '#ef4444', '#f59e0b', '#22d3ee', '#10b981', '#38bdf8', '#c084fc'];
    const generated: ShardParticle[] = Array.from({ length: 45 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 120 + Math.random() * 450;
      return {
        id: `shard-${i}`,
        text: textPool[i % textPool.length],
        color: colors[Math.floor(Math.random() * colors.length)],
        x: 50 + (Math.random() * 8 - 4), // center starting point
        y: 45 + (Math.random() * 8 - 4),
        tx: Math.cos(angle) * distance,
        ty: Math.sin(angle) * distance,
        scale: 0.55 + Math.random() * 0.9,
        rotate: -360 + Math.random() * 720,
        duration: 1.2 + Math.random() * 3.5
      };
    });
    setShards(generated);
    
    const aftermathTimer = setTimeout(() => {
      setStage('aftermath');
      setShakeCommander(false);
      setShakeOverseer(false);
      setSoundLogStr('💎 SYNCHRONIZATION RESTORED: SOUL CORES SEGMENTED');
    }, 2500); // reduced from 6.5s to 2.5s to avoid lag and save time

    return () => clearTimeout(aftermathTimer);
  }, [stage]);

  // Commander speech typewriter effect
  useEffect(() => {
    if (stage !== 'intro') return;
    const fullText = "INSECT LIFEFORMS! YOUR EXPIRED GENETIC SEGMENTS ARE NOTHING BUT GARBAGE TO BE REWRITTEN. MY NANO-SYNTHESIS PLATES WILL VAPORIZE CODES OF YOUR ENTIRE ANCESTRY! I COMMAND THIS HUB-VERTEX!";
    let index = 0;
    const typing = setInterval(() => {
      setTypedCommanderText(fullText.slice(0, index + 1));
      index++;
      if (index >= fullText.length) {
        clearInterval(typing);
      }
    }, 8); // faster typing (8ms)
    return () => clearInterval(typing);
  }, [stage]);

  // Overseer speech typewriter effect
  useEffect(() => {
    if (stage !== 'overseer_appears') return;
    const fullText = "IRRELEVANT CONGNITIVE ENTITY. YOUR SUB-ROUTINES OPERATE ON REPETITIVE BINARY LOOPS. YOU STRUGGLE WITHIN AN INFINITESIMAL BUBBLE OF EXISTENCE. SUFFER ENTIRE MOLECULAR TERMINATION.";
    let index = 0;
    const typing = setInterval(() => {
      setTypedOverseerText(fullText.slice(0, index + 1));
      index++;
      if (index >= fullText.length) {
        clearInterval(typing);
      }
    }, 8); // faster typing (8ms)
    return () => clearInterval(typing);
  }, [stage]);

  // Active Real-Time Fighting Simulation Logic inside "climax_charging"
  useEffect(() => {
    if (stage !== 'climax_charging') {
      setLasers([]);
      return;
    }

    // Laser spawning interval for fighting visualization
    const laserSpawnInterval = setInterval(() => {
      const id = Math.random().toString(36).substring(2, 9);
      const dir = Math.random() < 0.5 ? 'left-to-right' : 'right-to-left';
      const y = 15 + Math.random() * 70; // arena y height percent
      const color = dir === 'left-to-right' ? '#f43f5e' : '#22d3ee';
      setLasers(prev => [...prev.slice(-10), { id, dir, y, color }]);
    }, 280);

    let tick = 0;
    const battleInterval = setInterval(() => {
      tick++;

      // Alternating attacks of Commander and Overseer with damage logs and floats
      if (tick % 2 === 1) {
        // Commander's Turn - Rotate between multiple unique high-tech tactical abilities
        const abilityIndex = Math.floor(tick / 2) % 4;

        if (abilityIndex === 0) {
          // Ability 1: Buster Railgun
          setShakeOverseer(true);
          setTimeout(() => setShakeOverseer(false), 200);
          spawnFloatingText(320 + Math.random() * 40, 180 + Math.random() * 40, 'RESISTED', '#38bdf8');
          addCombatLog('COMMANDER: Aggressive Buster Railgun fire! (Immune to Deflection)', 'commander', 'text-rose-400');
        } else if (abilityIndex === 1) {
          // Ability 2: Defragmentation Nanite Repair Core (significantly reduced heal for fast flow on 150k HP limit)
          const repairAmount = Math.floor(5000 + Math.random() * 2000); 
          setCommanderHP(prev => {
            const nextVal = Math.min(maxCommanderHP, prev + repairAmount);
            // Recompute charge to sync health increase
            setOverseerCharge(Math.max(0, Math.floor(((maxCommanderHP - nextVal) / maxCommanderHP) * 100)));
            return nextVal;
          });
          spawnFloatingText(120 + Math.random() * 40, 200 + Math.random() * 40, `+${repairAmount.toLocaleString()} REPAIRED`, '#10b981');
          addCombatLog(`COMMANDER: Deployed automated Nanite Repair Core swarm! Relinking compromised armored plates (+${repairAmount.toLocaleString()} HP)!`, 'commander', 'text-emerald-400 font-extrabold border border-emerald-500/15 px-2 py-0.5 rounded bg-emerald-950/20');
        } else if (abilityIndex === 2) {
          // Ability 3: Quantum Scramble Injection
          setOverseerCharge(c => Math.max(0, c - 6));
          spawnFloatingText(320 + Math.random() * 40, 180 + Math.random() * 40, 'STALL -6% CHARGE', '#f59e0b');
          addCombatLog('COMMANDER: Initiated binary malware malware injection "APEX_CORRUPT.EXE" directly into Archon gateway!', 'commander', 'text-amber-500 font-bold');
          addCombatLog('SYSTEM STATS: [CRITICAL FEED DISTORTION // RETRY BUFFERED SECTORS]', 'system', 'text-red-400/80 font-mono italic');
        } else if (abilityIndex === 3) {
          // Ability 4: Absolute Shield Matrix Layer
          setCommanderShieldActive(true);
          spawnFloatingText(120 + Math.random() * 40, 200 + Math.random() * 40, 'SHIELD ARMED', '#c084fc');
          addCombatLog('COMMANDER: Erected "Aegis Diamond Matrix". Next player Celestial Strike will be 60% absorbed!', 'commander', 'text-purple-400 font-black tracking-wide bg-purple-950/25 px-2.5 py-0.5 border border-purple-500/20 rounded-md animate-pulse');
        }
      } else {
        // Overseer channels high-level cosmic beam counters (HEAVILY buffed to defeat boss in 3-4 ticks)
        setShakeCommander(true);
        setTimeout(() => setShakeCommander(false), 200);

        const damage = Math.floor(45000 + Math.random() * 10000); // 45k - 55k damage per tick! Slices through the 150k health easily.
        setCommanderHP(prev => {
          const nextVal = prev - damage;
          const finalVal = nextVal < 0 ? 0 : nextVal;
          if (finalVal <= 0) {
            setStage('obliteration');
          }
          // Calculate incremental charge percentage of the Ultimate beam
          setOverseerCharge(prevCharge => {
            const basedOnHealth = Math.min(100, Math.floor(((maxCommanderHP - finalVal) / maxCommanderHP) * 100));
            return Math.max(prevCharge, basedOnHealth);
          });
          return finalVal;
        });

        spawnFloatingText(120 + Math.random() * 40, 200 + Math.random() * 40, `-${damage.toLocaleString()} HP`, '#ef4444');
        addCombatLog(`OVERSEER: "Quantum Sunder" strikes Commander for -${damage.toLocaleString()} damage!`, 'overseer', 'text-cyan-300 font-extrabold');
      }

      // Add atmospheric actions
      if (tick === 3) {
        addCombatLog('SYSTEM: Archon Overseer initiates Realm Singularity charge protocol.', 'system', 'text-yellow-400 animate-pulse');
      }
    }, 850);

    return () => {
      clearInterval(battleInterval);
      clearInterval(laserSpawnInterval);
    };
  }, [stage]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black overflow-hidden font-sans select-none">
        
        {/* Background glowing particles network */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.15),transparent_70%)]" />
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[linear-gradient(to_right,#0c4a6e_1px,transparent_1px),linear-gradient(to_bottom,#0c4a6e_1px,transparent_1px)] bg-[size:32px_32px]" />
        
        {/* Cinematic hud bars */}
        <div className="absolute top-0 inset-x-0 h-16 bg-slate-950 border-b border-rose-500/20 flex items-center justify-between px-6 z-20">
          <div className="flex items-center space-x-3">
            <ShieldAlert className="text-rose-500 animate-pulse" size={18} />
            <span className="text-[9px] font-black tracking-[0.25em] text-rose-400 uppercase hidden sm:inline">
              SECTOR 10 COGNITIVE THREAT // DETECTED TERMINAL SIGNAL
            </span>
            <span className="text-[9px] font-black tracking-[0.25em] text-rose-400 uppercase sm:hidden">
              COGNITIVE THREAT LOCKOFF
            </span>
          </div>

          {/* Quick skipping shortcuts */}
          {stage !== 'aftermath' && (
            <div className="flex items-center gap-2 select-none">
              {(stage === 'intro' || stage === 'overseer_appears') && (
                <button 
                  onClick={skipToBattle}
                  className="px-3 py-1.5 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/40 hover:border-indigo-400 text-indigo-300 hover:text-white font-black font-mono text-[9px] uppercase hover:scale-[1.03] active:scale-[0.97] transition-all rounded shadow-[0_0_10px_rgba(99,102,241,0.2)] cursor-pointer flex items-center gap-1 select-none"
                >
                  ⏩ Fast-Forward Dialogue
                </button>
              )}
            </div>
          )}

          <motion.div 
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-[9px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-500/20 px-2.5 py-0.5 rounded hidden md:block"
          >
            AUTO-REPAIR LOCKOFF // CRITICAL EXHAUST STATUS
          </motion.div>
        </div>

        <div className="absolute bottom-0 inset-x-0 h-16 bg-slate-950 border-t border-cyan-500/20 flex items-center justify-between px-6 z-20">
          <div className="text-[9px] font-mono text-cyan-300 flex items-center gap-1.5 font-bold uppercase tracking-widest">
            <Star size={10} className="animate-spin text-cyan-400" /> Archon Synthesis Reality Level: STABLE
          </div>
          <div className="text-[9px] font-mono text-slate-400 flex items-center gap-2 select-none uppercase">
            {soundLogStr}
          </div>
        </div>

        {/* MAIN CINEMATIC WORKSPACE */}
        <div className="w-full max-w-5xl px-4 flex flex-col items-center justify-center h-full relative">
          
          {/* STAGE 1: INTRO (COMMANDER BRAGGING) */}
          {stage === 'intro' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full text-center space-y-8 max-w-2xl"
            >
              <div className="relative inline-block">
                <motion.div
                  animate={{ 
                    y: shakeCommander ? [-1, 1, 0, -1, 0] : [0, -2, 0],
                    rotate: shakeCommander ? [-0.2, 0.2, 0] : [-0.5, 0.5, -0.5]
                  }}
                  transition={{ duration: shakeCommander ? 0.2 : 4, repeat: shakeCommander ? 0 : Infinity }}
                >
                  <ApexCommanderAvatar />
                </motion.div>
                
                <div className="absolute -bottom-3 inset-x-0 flex justify-center">
                  <span className="bg-gradient-to-r from-red-600 to-rose-600 text-white font-black tracking-widest text-[9px] uppercase px-3 py-1 rounded shadow-lg border border-red-500">
                    BOSS STAGE: COMMANDER
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-rose-400 text-xs font-black tracking-[0.3em] uppercase">
                  APEX COMMANDER ENCOUNTER RE-SYNC
                </h3>
                <h1 className="text-4xl font-extrabold text-white tracking-tighter uppercase font-serif select-none">
                  Aegis Apex Commander
                </h1>
                
                {/* Dialouge block */}
                <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-500/20 text-rose-100 text-xs font-mono min-h-[92px] text-center max-w-xl mx-auto leading-relaxed shadow-xl relative overflow-hidden backdrop-blur-sm">
                  <div className="absolute top-1 left-2 text-[7px] text-rose-500 font-bold uppercase">SIG_FEED // RECEIVED</div>
                  "{typedCommanderText}"
                </div>
              </div>

              {/* Progress metric */}
              <div className="w-48 h-1 bg-slate-900 mx-auto rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 6, ease: 'linear' }}
                  className="h-full bg-rose-500"
                />
              </div>
            </motion.div>
          )}

          {/* STAGE 2: OVERSEER APPEARS */}
          {stage === 'overseer_appears' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center justify-center text-center space-y-8 max-w-3xl"
            >
              {/* Eye Graphic Housing */}
              <motion.div
                animate={{ 
                  y: shakeOverseer ? [-1, 1, 0] : [0, -2, 0],
                  scale: [1, 1.01, 1]
                }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <CelestialOverseerEye />
              </motion.div>

              <div className="space-y-4">
                <h3 className="text-cyan-400 text-xs font-black tracking-[0.3em] uppercase animate-pulse">
                  TRANSCENDENTAL AUTHORITY RE-ACTIVATED
                </h3>
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-teal-200 tracking-tighter uppercase font-serif">
                  The Archon Overseer
                </h1>
                
                {/* Dialogue Bubble */}
                <div className="p-6 rounded-2xl bg-cyan-950/25 border border-cyan-500/25 text-cyan-100 text-xs font-mono min-h-[92px] text-center max-w-xl mx-auto leading-relaxed shadow-xl relative overflow-hidden backdrop-blur-sm">
                  <div className="absolute top-1 left-2 text-[7px] text-cyan-400 font-bold uppercase">TRANS_CORE // ACTIVE</div>
                  "{typedOverseerText}"
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-48 h-1 bg-slate-900 mx-auto rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 6.5, ease: 'linear' }}
                  className="h-full bg-cyan-400"
                />
              </div>
            </motion.div>
          )}

          {/* STAGE 3: CLIMAX CHARGING & FIGHTING AREA */}
          {stage === 'climax_charging' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col space-y-10"
            >
              {/* Header combat ticker */}
              <div className="text-center space-y-1 select-none">
                <span className="text-[10px] font-black tracking-[0.4em] text-yellow-400 uppercase animate-pulse block">
                  ⚠️ SECTOR SPACE COLLISION: SYSTEM INTERLOCK ACTIVE ⚠️
                </span>
                <h2 className="text-3xl font-black text-white uppercase tracking-tight font-serif">
                  Archon Overseer vs Apex Commander
                </h2>
              </div>

              {/* Main Combat Stage: Left unit, central energy beams, right unit */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-slate-950/50 p-6 rounded-3xl border border-white/5 relative min-h-[320px] shadow-2xl">
                
                {/* Floating combat values over the arena */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <AnimatePresence>
                    {floatingTexts.map((f) => (
                      <motion.div
                        key={`floating-text-${f.id}`}
                        initial={{ opacity: 1, y: f.y + 40, x: f.x }}
                        animate={{ opacity: 0, y: f.y - 100 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.6, ease: 'easeOut' }}
                        className="absolute text-xl font-black font-mono tracking-tight z-30 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                        style={{ color: f.color }}
                      >
                        {f.text}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Active fighting lasers flying back and forth */}
                <div className="absolute inset-x-20 inset-y-10 overflow-hidden pointer-events-none z-15">
                  <AnimatePresence>
                    {lasers.map((l) => (
                      <motion.div
                        key={`laser-${l.id}`}
                        initial={{ left: l.dir === 'left-to-right' ? '0%' : '100%', opacity: 1, top: `${l.y}%` }}
                        animate={{ left: l.dir === 'left-to-right' ? '100%' : '0%', opacity: [1, 1, 0] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.55, ease: 'linear' }}
                        className="absolute h-1.5 w-14 rounded-full shadow-[0_0_12px_currentColor]"
                        style={{ 
                          background: `linear-gradient(${l.dir === 'left-to-right' ? 'to right' : 'to left'}, ${l.color}, transparent)`,
                          color: l.color
                        }}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {/* COMBATANT A: Apex Commander */}
                <div className="flex flex-col items-center space-y-4">
                  <motion.div
                    animate={{ 
                      x: shakeCommander ? [-1, 1, -1, 1, 0] : [0, 0, 0],
                      y: shakeCommander ? [-1, 1, 0, -1, 0] : [0, -2, 0]
                    }}
                    transition={{ duration: shakeCommander ? 0.22 : 3, repeat: shakeCommander ? 0 : Infinity }}
                    className="relative"
                  >
                    <ApexCommanderAvatar />
                    
                    {/* Pulsing damage shield indicator */}
                    {shakeCommander && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 0.8, scale: 1.2 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 border-2 border-red-500 rounded-2xl blur-sm"
                      />
                    )}

                    {/* Glowing active Aegis shield indicator */}
                    {commanderShieldActive && (
                      <motion.div 
                        animate={{ 
                          scale: [1, 1.06, 1],
                        }}
                        transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                        className="absolute -inset-3 border-2 border-dashed border-purple-500 rounded-2xl bg-purple-950/25 flex items-center justify-center pointer-events-none z-10"
                      >
                        <span className="text-[7px] font-black tracking-widest text-purple-300 font-mono absolute -top-4 bg-purple-950 px-2 py-0.5 border border-purple-500 rounded-md uppercase">
                          BARRIER HIGH
                        </span>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Commander HP Bar */}
                  <div className="w-full space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-black text-rose-400 font-mono">
                      <span>COMMAND COMPILER HP</span>
                      <span>{commanderHP.toLocaleString()} / {maxCommanderHP.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-900 border border-rose-500/30 rounded-full overflow-hidden p-0.5">
                      <motion.div 
                        animate={{ width: `${(commanderHP / maxCommanderHP) * 100}%` }}
                        transition={{ duration: 0.3 }}
                        className="h-full bg-gradient-to-r from-red-600 to-rose-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>

                {/* CENTRAL ENERGY CLASH & PARTICLES */}
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    
                    {/* Energy Shockwave Ring */}
                    <motion.div
                      animate={{ 
                        scale: [1, 1.4, 0.9, 1.2, 1],
                        rotate: [0, 180, 360]
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute inset-2 rounded-full bg-gradient-to-tr from-cyan-400 via-fuchsia-600 to-red-500 opacity-30 blur-md"
                    />

                    {/* Vector lasers crossing */}
                    <svg className="absolute inset-0 w-full h-full text-indigo-400" viewBox="0 0 100 100" fill="none" stroke="currentColor">
                      <motion.line 
                        x1="10" y1="50" x2="90" y2="50" 
                        stroke="#f43f5e" 
                        strokeWidth="3" 
                        strokeDasharray="5 5"
                        animate={{ strokeDashoffset: [-20, 20] }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      />
                      <motion.line 
                        x1="90" y1="50" x2="10" y2="50" 
                        stroke="#22d3ee" 
                        strokeWidth="4" 
                        animate={{ strokeDashoffset: [20, -20] }}
                        transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}
                        strokeDasharray="8 2"
                      />
                      
                      {/* Splat stars */}
                      <circle cx="50" cy="50" r="12" fill="#fafafa" opacity="0.15" />
                    </svg>

                    <div className="z-10 flex flex-col items-center gap-1.5 bg-slate-950/95 border border-white/10 px-4 py-2.5 rounded-2xl shadow-xl">
                      <Swords size={20} className="text-red-500 animate-pulse" />
                      <span className="text-[8px] font-black tracking-widest text-slate-400 uppercase">Clash Velocity</span>
                      <span className="text-xs font-mono font-black text-cyan-300">TRANS-MATRIX</span>
                    </div>
                  </div>

                  {/* Ultimate Singularity Charge meter */}
                  <div className="w-full bg-slate-900 border border-cyan-500/20 rounded-xl p-2.5">
                    <div className="flex justify-between items-center text-[9px] font-black text-cyan-400 mb-1">
                      <span>CHRONO ERASURE STATUS</span>
                      <span className="animate-pulse">{overseerCharge}% CHARGED</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <motion.div 
                        animate={{ width: `${overseerCharge}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-teal-400 rounded-full shadow-[0_0_10px_#06b6d4]"
                      />
                    </div>
                  </div>
                </div>

                {/* COMBATANT B: The Archon Overseer */}
                <div className="flex flex-col items-center space-y-4">
                  <motion.div
                    animate={{ 
                      x: shakeOverseer ? [-1, 1, 0] : [0, 0, 0],
                      y: shakeOverseer ? [-1, 1, 0] : [-2, 0, -2]
                    }}
                    transition={{ duration: shakeOverseer ? 0.2 : 3, repeat: shakeOverseer ? 0 : Infinity }}
                    className="relative"
                  >
                    <CelestialOverseerEye />
                    
                    {/* Defensive spell shield aura */}
                    <motion.div 
                      animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 rounded-full border border-teal-500/40 blur-md pointer-events-none"
                    />
                  </motion.div>

                  {/* Overseer Realm Immunities display */}
                  <div className="w-full space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-black text-cyan-400 font-mono">
                      <span>OVERSEER INHERENT HYPER-HP</span>
                      <span>GENOME IMMUNE</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-900 border border-cyan-500/30 rounded-full overflow-hidden p-0.5">
                      <div className="w-full h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full animate-pulse" />
                    </div>
                  </div>
                </div>

              </div>

              {/* Combat log terminal ticker showing real fighting interactions */}
              <div className="space-y-4">
                {/* High action player fighting controller overrides */}
                <div className="flex flex-wrap justify-center gap-4 py-2">
                  <button
                    disabled={strikeCooldown > 0 || commanderHP <= 0}
                    onClick={() => {
                      if (commanderHP <= 0 || strikeCooldown > 0) return;

                      let damage = Math.floor(45000 + Math.random() * 10000); // Balanced to around 50k average so the player can feel the fight
                      let shielded = false;

                      if (commanderShieldActive) {
                        damage = Math.floor(damage * 0.4); // 60% absorbed, 40% goes through
                        shielded = true;
                        setCommanderShieldActive(false); // breaks shield
                      }

                      setCommanderHP(prev => {
                        const nextVal = prev - damage;
                        const finalVal = nextVal < 0 ? 0 : nextVal;
                        if (finalVal <= 0) {
                          setStage('obliteration');
                        }
                        // Recompute and update Overseer charge sync
                        setOverseerCharge(prevCharge => {
                          const basedOnHealth = Math.min(100, Math.floor(((maxCommanderHP - finalVal) / maxCommanderHP) * 100));
                          return Math.max(prevCharge, basedOnHealth);
                        });
                        return finalVal;
                      });

                      if (shielded) {
                        spawnFloatingText(120 + Math.random() * 40, 180 + Math.random() * 40, `ABSORBED -${damage.toLocaleString()}`, '#c084fc');
                        addCombatLog(`PLAYER STRIKE: Trans-Divine Ray executed! Commander Shield Matrix absorbed 60% damage! -${damage.toLocaleString()} damage direct!`, 'overseer', 'text-purple-400 font-extrabold animate-pulse');
                      } else {
                        spawnFloatingText(120 + Math.random() * 40, 180 + Math.random() * 40, `CELESTIAL CRIT -${damage.toLocaleString()}`, '#00ffcc');
                        addCombatLog(`PLAYER STRIKE: Leveraged Trans-Divine Ray energy direct burst for -${damage.toLocaleString()} damage!`, 'overseer', 'text-emerald-400 font-extrabold animate-pulse');
                      }

                      setShakeCommander(true);
                      setTimeout(() => setShakeCommander(false), 200);

                      // Set cooldown to 1.2s instead of 6s
                      setStrikeCooldown(1200);
                    }}
                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black tracking-wider uppercase transition-all flex items-center gap-1.5 ${
                      strikeCooldown > 0 || commanderHP <= 0
                        ? 'bg-zinc-900/60 border border-zinc-800 text-zinc-500 cursor-not-allowed opacity-75'
                        : 'bg-gradient-to-r from-cyan-950 to-indigo-950 border border-cyan-400 hover:bg-cyan-900/40 text-cyan-200 cursor-pointer hover:border-cyan-300 active:scale-95 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                    }`}
                  >
                    <Zap size={11} className={strikeCooldown > 0 ? "text-zinc-500" : "text-cyan-400 animate-pulse"} /> 
                    {strikeCooldown > 0 ? `STRIKE RECHARGE (${(strikeCooldown / 1000).toFixed(1)}s)` : 'Force Trans-Divine Strike'}
                  </button>

                  <button
                    disabled={shieldCooldown > 0 || commanderHP <= 0}
                    onClick={() => {
                      if (commanderHP <= 0 || shieldCooldown > 0) return;

                      // Boost Overseer ultimate charge by 15%
                      setOverseerCharge(prev => Math.min(100, prev + 15));
                      spawnFloatingText(320 + Math.random() * 40, 200 + Math.random() * 40, 'VOID SHIELD CHARGE +15%', '#38bdf8');
                      addCombatLog('PLAYER SHIELD: Reinforce Void Shields activated! Spatial focus field strengthened (+15% Ultimate Charge)!', 'system', 'text-cyan-300 font-bold');
                      
                      setShakeOverseer(true);
                      setTimeout(() => setShakeOverseer(false), 200);

                      // Set cooldown to 1.5s instead of 8s
                      setShieldCooldown(1500);
                    }}
                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black tracking-wider uppercase transition-all flex items-center gap-1.5 ${
                      shieldCooldown > 0 || commanderHP <= 0
                        ? 'bg-zinc-900/60 border border-zinc-800 text-zinc-500 cursor-not-allowed opacity-75'
                        : 'bg-gradient-to-r from-slate-950 to-teal-950 border border-teal-500 hover:bg-teal-900/40 text-teal-200 cursor-pointer hover:border-teal-400 active:scale-95 shadow-[0_0_15px_rgba(0,255,204,0.15)]'
                    }`}
                  >
                    <ShieldCheck size={11} className={shieldCooldown > 0 ? "text-zinc-500" : "text-teal-400"} /> 
                    {shieldCooldown > 0 ? `SHIELD RECHARGE (${(shieldCooldown / 1000).toFixed(1)}s)` : 'Reinforce Void Shields'}
                  </button>
                </div>

                <div className="space-y-2 select-none">
                  <div className="flex items-center justify-between text-[9px] font-black text-slate-500 uppercase px-2">
                    <span>🛰️ LIVE COGNITIVE FEED TERMINAL</span>
                    <span className="flex items-center gap-1"><RefreshCw size={9} className="animate-spin" /> RUNNING MATRIX REAL-TIME</span>
                  </div>
                  
                  <div className="h-28 bg-slate-950/90 border border-white/5 rounded-2xl p-4 overflow-y-auto font-mono text-[10px] space-y-2 leading-relaxed scrollbar-hide shadow-inner">
                    {combatLogs.map((log, idx) => (
                      <div key={`${log.id}-${idx}`} className="flex items-start gap-2 select-none">
                        <span className={`text-[8px] font-extrabold uppercase px-1.5 rounded py-0.5 ${
                          log.source === 'commander' 
                            ? 'bg-rose-950/80 text-rose-400 border border-rose-500/15' 
                            : log.source === 'overseer'
                              ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-500/15'
                              : 'bg-slate-900 text-slate-400 border border-white/5'
                        }`}>
                          {log.source === 'commander' ? 'HOST' : log.source === 'overseer' ? 'ARCH' : 'SYS'}
                        </span>
                        <span className={log.color || 'text-slate-300'}>{log.text}</span>
                      </div>
                    ))}
                    <div ref={consoleBottomRef} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STAGE 4: OBLITERATION BLAST */}
          {stage === 'obliteration' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 overflow-hidden z-[85]"
            >
              {/* Giant Flash Ring Backdrop */}
              <motion.div
                animate={{ 
                  scale: [1, 28], 
                  opacity: [1, 0.4, 0],
                  backgroundColor: ['#22d3ee', '#ec4899', '#ffffff']
                }}
                transition={{ duration: 3.5, ease: 'easeOut' }}
                className="absolute w-28 h-28 rounded-full pointer-events-none z-[87]"
              />

              {/* Exploding Shockwave Rings */}
              <motion.div
                initial={{ scale: 0.1, opacity: 1 }}
                animate={{ scale: 8, opacity: 0 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="absolute w-48 h-48 rounded-full border-[10px] border-cyan-400 z-[91] pointer-events-none"
              />
              <motion.div
                initial={{ scale: 0.1, opacity: 1 }}
                animate={{ scale: 10, opacity: 0 }}
                transition={{ duration: 2.2, ease: 'easeOut', delay: 0.25 }}
                className="absolute w-48 h-48 rounded-full border-[15px] border-rose-500 z-[91] pointer-events-none"
              />
              <motion.div
                initial={{ scale: 0.1, opacity: 1 }}
                animate={{ scale: 14, opacity: 0 }}
                transition={{ duration: 3.0, ease: 'easeOut', delay: 0.5 }}
                className="absolute w-40 h-40 rounded-full border-[20px] border-yellow-400 z-[91] pointer-events-none"
              />

              {/* Warnings flashes */}
              <motion.div
                animate={{ 
                  opacity: [0, 0.3, 0, 0.5, 0, 0.2, 0] 
                }}
                transition={{ duration: 3.5, repeat: Infinity }}
                className="absolute inset-0 bg-red-600/10 pointer-events-none z-[88]"
              />

              {/* Immersive digital space field */}
              <div className="absolute inset-0 opacity-20 pointer-events-none z-[86] bg-[linear-gradient(to_right,#0c4a6e_1px,transparent_1px),linear-gradient(to_bottom,#0c4a6e_1px,transparent_1px)] bg-[size:24px_24px]" />

              {/* UI Shards Exploding out */}
              {shards.map((s, idx) => (
                <motion.div
                  key={`${s.id}-${idx}`}
                  initial={{ 
                    x: 0, 
                    y: 0, 
                    scale: 1, 
                    opacity: 1, 
                    rotate: 0 
                  }}
                  animate={{ 
                    x: s.tx, 
                    y: s.ty, 
                    scale: s.scale, 
                    opacity: [1, 0.8, 0], 
                    rotate: s.rotate 
                  }}
                  transition={{ 
                    duration: s.duration, 
                    ease: 'easeOut' 
                  }}
                  className="absolute font-mono text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded bg-black/90 border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)] z-[90] whitespace-nowrap"
                  style={{ 
                    color: s.color, 
                    left: `${s.x}%`, 
                    top: `${s.y}%`,
                    borderColor: `${s.color}40`,
                    boxShadow: `0 0 12px ${s.color}25`
                  }}
                >
                  ⚠ {s.text}
                </motion.div>
              ))}

              <div className="text-center space-y-6 z-10 text-white select-none relative p-6 max-w-lg">
                <motion.div
                  animate={{ 
                    rotate: [0, -15, 15, -10, 10, 0],
                    scale: [1.2, 0],
                    opacity: [1, 0]
                  }}
                  transition={{ duration: 4.5, ease: 'easeIn' }}
                  className="w-48 h-48 border-4 border-cyan-500 rounded-full bg-slate-950 flex items-center justify-center shadow-2xl mx-auto overflow-hidden p-6 z-[89]"
                  style={{ boxShadow: '0 0 45px rgba(34,211,238,0.4)' }}
                >
                  <svg className="w-full h-full text-rose-500 animate-pulse" viewBox="0 0 100 100" fill="none" stroke="currentColor">
                    <path d="M 10,50 Q 50,15 90,50 Q 50,85 10,50 Z" strokeWidth="4.5" strokeLinecap="round" />
                    <line x1="15" y1="15" x2="85" y2="85" strokeWidth="6.0" strokeLinecap="round" />
                    <line x1="85" y1="15" x2="15" y2="85" strokeWidth="6.0" strokeLinecap="round" />
                    <circle cx="50" cy="50" r="15" strokeWidth="2.5" strokeDasharray="3 3" />
                  </svg>
                </motion.div>

                <div className="space-y-3 z-10">
                  <span className="text-[10px] font-black tracking-[0.3em] text-cyan-400 uppercase animate-pulse block">
                    ARCHON EVENT HORIZON EXECUTION SUCCESS
                  </span>
                  <motion.h1 
                    animate={{ scale: [1, 1.05, 1] }} 
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-400 to-rose-400"
                  >
                    "NO... COMPRESSION DETECTED!!"
                  </motion.h1>
                  <p className="text-slate-350 font-mono text-[10px] max-w-md mx-auto leading-relaxed select-none font-bold">
                    The tactical algorithms of the Aegis Commander are disintegrated into pristine quantum strands. Security system restore completed.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* STAGE 5: AFTERMATH */}
          {stage === 'aftermath' && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="w-full text-center space-y-8 max-w-xl p-8 rounded-3xl bg-slate-900/95 border border-cyan-500/25 shadow-[0_0_80px_rgba(34,211,238,0.2)] relative backdrop-blur-md"
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                <Sparkles className="animate-spin text-cyan-400" size={26} style={{ animationDuration: '6s' }} />
              </div>

              <div className="space-y-3">
                <span className="text-[9px] font-black tracking-[0.4em] text-cyan-400 uppercase">
                  TRANSCENDENTAL VICTORY SIGNAL LOGGED
                </span>
                <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-cyan-200 to-indigo-300 tracking-tight uppercase">
                  Apex Commander Erased!
                </h1>
                <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed select-none">
                  The deep hardware overrides established by the Aegis Legion have been dissolved by your **Archon Overseer**'s stellar blast. Standard wave protocol is restored.
                </p>
              </div>

              {/* Award summary */}
              <div className="bg-slate-950 border border-white/5 p-4 rounded-2xl flex justify-around items-center max-w-xs mx-auto text-sm font-bold shadow-inner">
                <div className="text-center">
                  <div className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-0.5">🧬 DNA REWARD</div>
                  <span className="text-cyan-300 text-lg font-mono font-black">+1,000</span>
                </div>
                <div className="w-[1px] h-8 bg-white/10" />
                <div className="text-center">
                  <div className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-0.5">🥩 MEAT REWARD</div>
                  <span className="text-yellow-400 text-lg font-mono font-black">+10,000</span>
                </div>
              </div>

              <div>
                <button
                  onClick={() => {
                    onReward(); 
                    onClose();
                  }}
                  className="px-10 py-3.5 bg-gradient-to-r from-cyan-400 to-emerald-500 hover:from-cyan-300 hover:to-emerald-400 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all hover:scale-[1.03] active:scale-[0.97] shadow-xl hover:shadow-cyan-400/10 cursor-pointer"
                >
                  INTEGRATE RECOVERED GENOME
                </button>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </AnimatePresence>
  );
}
