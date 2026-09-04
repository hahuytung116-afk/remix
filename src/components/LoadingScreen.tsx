import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dna, Shield, Sparkles, Cpu, Zap, ChevronRight, Activity } from 'lucide-react';

export interface LoadingScreenProps {
  onComplete: () => void;
}

const BOOT_LOGS = [
  'BOOTING BIOLOGICAL DEFENSE MATRIX...',
  'CALIBRATING 20x15 TACTICAL COMBAT GRID...',
  'INITIALIZING 2x2 HYDRAULIC TITAN MATRIX...',
  'SYNTHESIZING GENETIC DNA TRAIT DATABASE...',
  'CONFIGURING 12-ELEMENTAL RESONANCE CORES...',
  'DEPLOYING QUANTUM ANTI-HUNTER SENSORS...',
  'SANCTUARY DEFENSE ONLINE • READY!'
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [logIndex, setLogIndex] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const completedCalledRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          if (!completedCalledRef.current) {
            completedCalledRef.current = true;
            setTimeout(() => {
              if (onCompleteRef.current) {
                onCompleteRef.current();
              }
            }, 300);
          }
          return 100;
        }
        // Random increment for realistic loading simulation
        const step = Math.floor(Math.random() * 10) + 8;
        const next = Math.min(100, prev + step);
        
        // Update log based on progress
        const calculatedIndex = Math.min(
          BOOT_LOGS.length - 1,
          Math.floor((next / 100) * BOOT_LOGS.length)
        );
        setLogIndex(calculatedIndex);

        if (next >= 100) {
          clearInterval(interval);
          if (!completedCalledRef.current) {
            completedCalledRef.current = true;
            setTimeout(() => {
              if (onCompleteRef.current) {
                onCompleteRef.current();
              }
            }, 300);
          }
          return 100;
        }

        return next;
      });
    }, 90);

    return () => clearInterval(interval);
  }, []);

  const handleSkip = () => {
    if (!completedCalledRef.current) {
      completedCalledRef.current = true;
      if (onCompleteRef.current) {
        onCompleteRef.current();
      }
    }
  };

  return (
    <div 
      id="loading-screen" 
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-slate-950 p-6 text-cyan-400 font-mono select-none overflow-hidden"
    >
      {/* Background Cyber Grid */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(6, 182, 212, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6, 182, 212, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Floating Radial Glow */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-3xl pointer-events-none animate-pulse" />

      {/* Central DNA Core */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center max-w-md w-full text-center space-y-6"
      >
        {/* Animated Icon Ring */}
        <div className="relative">
          <div className="w-24 h-24 rounded-2xl bg-slate-900 border-2 border-cyan-400/50 flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.4)]">
            <Dna size={48} className="text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div className="absolute -inset-2 rounded-2xl border border-cyan-500/30 animate-ping pointer-events-none opacity-40" />
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-emerald-300 to-amber-300 uppercase drop-shadow-md">
            PRIMAL DEFENSE
          </h1>
          <p className="text-xs text-slate-400 tracking-[0.25em] uppercase font-bold">
            ANIMAL KINGDOM • TACTICAL MATRIX
          </p>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
            <span className="flex items-center gap-1.5 text-cyan-300">
              <Activity size={12} className="animate-pulse text-emerald-400" />
              SYSTEM INITIALIZING
            </span>
            <span className="font-mono text-cyan-400">{progress}%</span>
          </div>

          <div className="w-full h-3 bg-slate-900 rounded-full border border-cyan-500/40 p-0.5 overflow-hidden shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-cyan-300 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.8)]"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut', duration: 0.1 }}
            />
          </div>
        </div>

        {/* Terminal diagnostic log */}
        <div className="w-full p-3 bg-slate-900/80 border border-white/10 rounded-xl text-left font-mono">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            CONSOLE TELEMETRY:
          </div>
          <div className="text-xs text-cyan-300 font-bold tracking-wide truncate">
            &gt; {BOOT_LOGS[logIndex]}
          </div>
        </div>

        {/* Skip button for quick developers */}
        <button
          onClick={handleSkip}
          className="text-[10px] text-slate-500 hover:text-cyan-300 transition-colors uppercase tracking-widest cursor-pointer underline underline-offset-4"
        >
          [ Skip Loading ]
        </button>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
