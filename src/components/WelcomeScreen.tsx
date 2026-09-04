import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Settings, 
  BookOpen, 
  Shield, 
  Dna, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Crown, 
  Cpu, 
  Grid, 
  Award,
  Terminal,
  Zap,
  X,
  CheckCircle2,
  Swords
} from 'lucide-react';
import { GameState } from '../types';
import { ANIMALS } from '../constants';
import CapybaraAvatar from './CapybaraAvatar';

export interface WelcomeScreenProps {
  onPlay: () => void;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
  onOpenAdminPrompt: () => void;
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onPlay,
  onOpenSettings,
  onOpenGuide,
  onOpenAdminPrompt,
  gameState,
  setGameState,
}) => {
  const [isRemixModalOpen, setIsRemixModalOpen] = useState(false);
  const isMuted = gameState.globalMute ?? false;

  const toggleMute = () => {
    setGameState(prev => ({
      ...prev,
      globalMute: !prev.globalMute
    }));
  };

  const unlockedCount = gameState.summonedAnimals?.length || 0;
  const currentWave = gameState.wave || 1;
  const currentDna = gameState.dna || 0;
  const currentMeat = gameState.meat || 0;

  return (
    <div 
      id="welcome-screen" 
      className="fixed inset-0 z-[150] flex flex-col items-center justify-center bg-slate-950 p-4 font-mono select-none overflow-y-auto text-center"
    >
      {/* Dynamic Background Cyber Grid */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(6, 182, 212, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6, 182, 212, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Ambient background glow orbs */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-xl w-full flex flex-col items-center space-y-6 my-auto py-6"
      >
        {/* Top Badge & Sound Toggle */}
        <div className="w-full flex items-center justify-between px-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            CYBER DEFENSE MATRIX ONLINE
          </div>

          <div className="flex items-center gap-2">
            <button
              id="welcome-sound-toggle-btn"
              onClick={toggleMute}
              title={isMuted ? "Unmute Audio" : "Mute Audio"}
              className="p-2 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-400/40 text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              {isMuted ? <VolumeX size={16} className="text-rose-400" /> : <Volume2 size={16} className="text-cyan-400" />}
            </button>

            <button
              id="welcome-admin-btn"
              onClick={onOpenAdminPrompt}
              title="Admin Security Clearance"
              className="p-2 rounded-xl bg-slate-900 border border-white/10 hover:border-red-400/40 text-slate-400 hover:text-red-400 transition-all cursor-pointer"
            >
              <Terminal size={16} />
            </button>
          </div>
        </div>

        {/* Hero Primal Emblem */}
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="relative cursor-pointer"
          onClick={onPlay}
        >
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-cyan-400 p-2 shadow-[0_0_50px_rgba(6,182,212,0.35)] flex items-center justify-center">
            <CapybaraAvatar size="lg" animated={true} />
          </div>
          <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px] uppercase tracking-wider border border-emerald-300 shadow-md">
            PRIMAL APEX
          </div>
        </motion.div>

        {/* Main Title Banner */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-emerald-300 to-amber-300 uppercase drop-shadow-md animate-pulse">
            PRIMAL DEFENSE
          </h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">
            ANIMAL KINGDOM • 2x2 TITAN PROTOCOL
          </p>
          
          {/* Remix Attribution Link */}
          <div className="pt-1 flex justify-center">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-amber-500/30 text-amber-300 text-[10px] font-black tracking-wider uppercase shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:border-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all cursor-pointer animate-bounce"
              onClick={() => setIsRemixModalOpen(true)}
            >
              <Award size={12} className="text-amber-400" />
              <span>REMIX OF</span>
              <span className="text-white underline">@thenewduckie</span>
              <span>'S ORIGINAL</span>
            </motion.div>
          </div>
        </div>

        {/* Active Game Stats Strip */}
        <div className="w-full grid grid-cols-3 gap-2.5 p-3.5 bg-slate-900/80 border border-white/10 rounded-2xl shadow-xl">
          <div className="p-2 bg-slate-950/80 rounded-xl border border-white/5 flex flex-col items-center justify-center">
            <span className="text-[9px] text-slate-400 uppercase font-bold">CURRENT WAVE</span>
            <span className="text-base font-black text-cyan-400 font-mono">#{currentWave}</span>
          </div>

          <div className="p-2 bg-slate-950/80 rounded-xl border border-white/5 flex flex-col items-center justify-center">
            <span className="text-[9px] text-slate-400 uppercase font-bold">SAVED DNA</span>
            <span className="text-base font-black text-purple-400 font-mono flex items-center gap-1">
              <Dna size={13} /> {currentDna.toLocaleString()}
            </span>
          </div>

          <div className="p-2 bg-slate-950/80 rounded-xl border border-white/5 flex flex-col items-center justify-center">
            <span className="text-[9px] text-slate-400 uppercase font-bold">SPECIES UNLOCKED</span>
            <span className="text-base font-black text-amber-400 font-mono">
              {unlockedCount} / {ANIMALS.length}
            </span>
          </div>
        </div>

        {/* Core Primary Action Buttons */}
        <div className="w-full space-y-3 pt-2">
          {/* PLAY BUTTON */}
          <motion.button
            id="welcome-play-button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onPlay}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-400 text-slate-950 font-black text-base uppercase tracking-widest flex items-center justify-center gap-3 shadow-[0_0_35px_rgba(16,185,129,0.4)] border-2 border-emerald-300 hover:brightness-110 transition-all cursor-pointer"
          >
            <Play size={22} className="fill-slate-950" />
            <span>PLAY NOW • ENTER COMBAT</span>
          </motion.button>

          {/* GLOBAL SETTINGS & GUIDE BUTTONS */}
          <div className="grid grid-cols-2 gap-3">
            <button
              id="welcome-settings-button"
              onClick={onOpenSettings}
              className="py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/15 hover:border-cyan-400/50 text-slate-200 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95"
            >
              <Settings size={16} className="text-cyan-400" />
              <span>GLOBAL SETTINGS</span>
            </button>

            <button
              id="welcome-guide-button"
              onClick={onOpenGuide}
              className="py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/15 hover:border-purple-400/50 text-slate-200 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95"
            >
              <BookOpen size={16} className="text-purple-400" />
              <span>TACTICAL GUIDE</span>
            </button>
          </div>
        </div>

        {/* Feature Highlights Footer */}
        <div className="w-full pt-4 border-t border-white/5 grid grid-cols-3 gap-2 text-[9px] text-slate-400 uppercase tracking-widest">
          <div className="flex items-center justify-center gap-1">
            <Grid size={11} className="text-cyan-400" />
            <span>Shining Placement Grid</span>
          </div>
          <div className="flex items-center justify-center gap-1">
            <Cpu size={11} className="text-amber-400" />
            <span>2x2 Armored Titans</span>
          </div>
          <div className="flex items-center justify-center gap-1">
            <Crown size={11} className="text-purple-400" />
            <span>12 Element Deities</span>
          </div>
        </div>
      </motion.div>

      {/* Remix Changelog / Feature Addition Modal */}
      <AnimatePresence>
        {isRemixModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md cursor-pointer"
            onClick={() => setIsRemixModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-xl bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-5 sm:p-6 shadow-[0_0_50px_rgba(245,158,11,0.25)] text-left cursor-default max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Award className="text-amber-400 w-5 h-5 animate-pulse" />
                  <span className="text-xs font-black tracking-widest text-amber-300 uppercase">
                    Primal Defense • Remix Edition
                  </span>
                </div>
                <button
                  onClick={() => setIsRemixModalOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-wider font-sans">
                    AUTHOR ATTRBUTION & CREDITS
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans mt-1">
                    This game is a feature-boosted and narrative-extended remix of <span className="text-amber-400 font-bold">Primal Defense</span>, originally designed, engineered, and balanced by the incredibly talented developer <span className="text-emerald-400 font-bold">@thenewduckie</span>. All original animal units, wave mechanics, grid logic, and species-mutation systems belong entirely to them.
                  </p>
                </div>

                <div className="border-t border-white/5 pt-3">
                  <h4 className="text-[11px] font-black text-amber-400 uppercase tracking-widest mb-2 font-mono">
                    ⚡ NEW ADDITIONS IN THIS REMIX:
                  </h4>
                  <div className="space-y-2.5">
                    <div className="flex gap-2.5 items-start">
                      <div className="p-1 rounded bg-rose-950/50 border border-rose-500/30 text-rose-400 shrink-0 mt-0.5">
                        <Terminal size={14} />
                      </div>
                      <div>
                        <span className="text-xs font-black text-rose-300 uppercase block font-sans">
                          W200: Warper Infection & Titan Escape
                        </span>
                        <span className="text-[11px] text-slate-400 font-sans leading-relaxed">
                          A custom-crafted story sequence showing the Syndicate's virus hijacking the 1st Arcane Deity (Warper), forcing Titan to defend him before executing an emergency TV Screen relocation.
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2.5 items-start">
                      <div className="p-1 rounded bg-purple-950/50 border border-purple-500/30 text-purple-400 shrink-0 mt-0.5">
                        <Zap size={14} />
                      </div>
                      <div>
                        <span className="text-xs font-black text-purple-300 uppercase block font-sans">
                          W355: Multiverse Watcher Awakening
                        </span>
                        <span className="text-[11px] text-slate-400 font-sans leading-relaxed">
                          A fully integrated cinematic transformation that triggers when Titan breaks past his physical limits to awaken his Ultimate Form 3 (Multiverse Watcher).
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2.5 items-start">
                      <div className="p-1 rounded bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 shrink-0 mt-0.5">
                        <Swords size={14} />
                      </div>
                      <div>
                        <span className="text-xs font-black text-cyan-300 uppercase block font-sans">
                          W399: Climax Cosmic Duel & Purification
                        </span>
                        <span className="text-[11px] text-slate-400 font-sans leading-relaxed">
                          An epic, high-intensity battle scene! Watch Multiverse Watcher duel the Corrupted Warper, complete with high-energy blade strikes, real-time laser clashes, stardust explosion visuals, and cleansing.
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2.5 items-start">
                      <div className="p-1 rounded bg-pink-950/50 border border-pink-500/30 text-pink-400 shrink-0 mt-0.5">
                        <Crown size={14} />
                      </div>
                      <div>
                        <span className="text-xs font-black text-pink-300 uppercase block font-sans">
                          Twin Arcane Singularities Stand
                        </span>
                        <span className="text-[11px] text-slate-400 font-sans leading-relaxed">
                          Once purified, the Arcane Warper permanently joins your combat list, fighting side-by-side with Multiverse Watcher to survive the legendary 10,000-enemy final wave!
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-3 flex justify-end">
                  <button
                    onClick={() => setIsRemixModalOpen(false)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg shadow-amber-500/20"
                  >
                    Close & Play
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WelcomeScreen;
