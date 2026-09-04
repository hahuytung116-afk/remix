import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Lock, 
  Unlock, 
  ShieldAlert, 
  Zap, 
  Target,
  Trophy,
  Scroll
} from 'lucide-react';
import { GameState } from '../types';
import { getLoreWaveData, ANIMAL_LORE_UNLOCKS, getAnimalUnlockWave } from '../data/loreCampaign';
import { ANIMALS } from '../constants';
import { AnimalAvatar } from './AnimalAvatar';
import { UnitArtwork } from './artworks/UnitArtwork';

interface LoreChronicleHUDProps {
  gameState: GameState;
  onOpenCodex: () => void;
}

export const LoreChronicleHUD: React.FC<LoreChronicleHUDProps> = ({
  gameState,
  onOpenCodex
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const currentWave = Math.max(1, Math.min(400, gameState.wave || 1));
  const loreData = getLoreWaveData(currentWave);

  // Find next upcoming animal unlock
  const nextUnlockEntry = Object.entries(ANIMAL_LORE_UNLOCKS).find(([wStr]) => parseInt(wStr, 10) > currentWave);
  const nextUnlockWave = nextUnlockEntry ? parseInt(nextUnlockEntry[0], 10) : null;
  const nextUnlockAnimal = nextUnlockEntry ? ANIMALS.find(a => a.id === nextUnlockEntry[1]) : null;

  // Lore Campaign 400 Waves Progress Calculation
  const completedWaves = Math.max(0, currentWave - 1);
  const progressPercent = Math.min(100, Math.max(0, (completedWaves / 400) * 100));

  const getSpeakerUnitId = (): string | null => {
    if (loreData.unlockedAnimalId) return loreData.unlockedAnimalId;
    const nameLower = loreData.speaker.toLowerCase();
    if (nameLower.includes('titan')) return 'titan_defender';
    if (nameLower.includes('watcher')) return 'multiverse_watcher';
    if (nameLower.includes('infected') || nameLower.includes('corrupted')) return 'infected_warper';
    if (nameLower.includes('warper')) return 'arcane_warper';
    if (nameLower.includes('capybara')) return 'capybara';
    if (nameLower.includes('overseer')) return 'all_seeing_overseer';
    if (nameLower.includes('genesis')) return 'original_genesis';
    if (nameLower.includes('abyss')) return 'original_abyss';
    if (nameLower.includes('ragnarok')) return 'original_ragnarok';
    if (nameLower.includes('omega')) return 'original_omega';
    if (nameLower.includes('phoenix')) return 'phoenix';
    if (nameLower.includes('dragon')) return 'dragon';
    if (nameLower.includes('kraken')) return 'kraken';
    if (nameLower.includes('rex')) return 'trex';
    const foundAnimal = ANIMALS.find(a => nameLower.includes(a.name.toLowerCase()) || nameLower.includes(a.id.toLowerCase()));
    if (foundAnimal) return foundAnimal.id;
    return null;
  };

  const speakerUnitId = getSpeakerUnitId();

  return (
    <div className="w-full max-w-5xl mx-auto mb-2 transition-all select-none">
      <div className="bg-slate-900/90 backdrop-blur-md border border-cyan-500/30 rounded-xl p-3 shadow-[0_0_20px_rgba(6,182,212,0.15)] relative overflow-hidden">
        {/* Glow accent */}
        <div 
          className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: loreData.speakerColor || '#00ffcc' }}
        />

        {/* Top Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-500/20 pb-2">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-950 border border-cyan-400/40 text-cyan-300">
              <Scroll size={12} className="text-cyan-400 animate-pulse" />
              {loreData.sagaTitle}
            </span>
            <span className="text-xs font-black text-white tracking-wide">
              WAVE <span className="text-cyan-400">{currentWave}</span> <span className="text-slate-400 text-[10px]">/ 400</span>
            </span>
            {loreData.bossTitle && (
              <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-tight bg-red-950/80 border border-red-500/50 text-red-300 flex items-center gap-1 animate-pulse">
                <ShieldAlert size={11} className="text-red-400" />
                BOSS: {loreData.bossTitle}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {nextUnlockAnimal && nextUnlockWave && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-950/80 border border-amber-500/30 text-amber-300 text-[10.5px] font-bold">
                <Unlock size={11} className="text-amber-400" />
                <span>Next:</span>
                <AnimalAvatar animal={nextUnlockAnimal} size="xs" />
                <span className="text-white font-extrabold">{nextUnlockAnimal.name}</span>
                <span className="text-amber-400 font-mono text-[9.5px]">W{nextUnlockWave}</span>
              </div>
            )}

            <button
              onClick={onOpenCodex}
              className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 text-xs font-black uppercase tracking-wide flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <BookOpen size={13} className="text-cyan-400" />
              Lore Codex
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700 text-slate-300 text-xs transition-all cursor-pointer"
              title={isExpanded ? 'Collapse Chronicle' : 'Expand Lore Details'}
            >
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        {/* LORE CAMPAIGN PROGRESS BAR (400 WAVES TOTAL) */}
        <div className="pt-2 pb-1">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider mb-1.5">
            <div className="flex items-center gap-1.5 text-cyan-300">
              <Trophy size={12} className="text-amber-400" />
              <span>Campaign Progress</span>
              <span className="text-slate-400 font-mono text-[9px]">({completedWaves}/400 Completed)</span>
            </div>
            <div className="flex items-center gap-1.5">
              {completedWaves >= 400 ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-extrabold text-[9.5px] flex items-center gap-1 animate-pulse">
                  <Sparkles size={10} /> MULTIVERSE CONQUERED!
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono font-black text-[9.5px]">
                  {progressPercent.toFixed(1)}%
                </span>
              )}
            </div>
          </div>

          {/* Progress Track */}
          <div className="relative w-full h-2.5 bg-slate-950 rounded-full border border-cyan-500/30 overflow-hidden shadow-inner p-[1px]">
            {/* Animated Gradient Bar Fill */}
            <motion.div
              className="h-full rounded-full relative overflow-hidden"
              style={{
                width: `${Math.max(1, progressPercent)}%`,
                background: 'linear-gradient(90deg, #06b6d4 0%, #3b82f6 35%, #8b5cf6 70%, #ec4899 100%)',
                boxShadow: '0 0 10px rgba(6,182,212,0.5)'
              }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(1, progressPercent)}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-pulse" />
            </motion.div>
          </div>

          {/* Saga Key Checkpoint Milestones */}
          <div className="flex justify-between items-center text-[8px] font-mono text-slate-500 mt-1 px-0.5">
            <span className="text-emerald-400 font-bold">W1 Genesis</span>
            <span className="hidden sm:inline">W200 Climax</span>
            <span className="text-purple-400 font-bold">W355 Titan/Watcher</span>
            <span className="hidden md:inline text-cyan-400 font-bold">W397 Alien Tech</span>
            <span className="text-fuchsia-400 font-bold">W399 Warper</span>
            <span className="text-pink-400 font-bold">W400 Multiverse 👑</span>
          </div>
        </div>

        {/* Primary Speaker & Dialogue Row */}
        <div className="pt-2 flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center p-1 shadow-md border border-white/20 overflow-hidden shrink-0"
              style={{ backgroundColor: `${loreData.speakerColor}22` }}
            >
              {speakerUnitId ? (
                <UnitArtwork animalId={speakerUnitId} className="w-full h-full drop-shadow-sm" fallbackEmoji={loreData.speakerEmoji} />
              ) : (
                <span className="text-xl">{loreData.speakerEmoji}</span>
              )}
            </div>
            <div>
              <div className="text-xs font-black text-white flex items-center gap-1.5" style={{ color: loreData.speakerColor }}>
                {loreData.speaker}
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                {loreData.speakerTitle}
              </div>
            </div>
          </div>

          {/* Dialogue bubble */}
          <div className="flex-1 bg-slate-950/60 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-medium italic relative">
            "{loreData.dialogue}"
          </div>
        </div>

        {/* Expandable Lore Deep Dive */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-cyan-500/20 mt-2.5 pt-2.5 space-y-2 text-xs"
            >
              <div className="bg-cyan-950/30 border border-cyan-500/20 rounded-lg p-2.5 text-cyan-100/90 leading-relaxed font-sans">
                <span className="font-bold text-cyan-300 uppercase text-[10px] tracking-widest block mb-1">
                  📜 SANCTUARY LORE CHRONICLE • CHAPTER {currentWave}
                </span>
                {loreData.lorePiece}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2 flex items-center gap-2">
                  <Zap size={14} className="text-amber-400 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-white block text-[10.5px]">Lore Stun Rules</span>
                    <span className="text-slate-400 text-[10px]">Pure animals resist EMP stuns; non-animal machines can be disabled by Hunter EMP pulses!</span>
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2 flex items-center gap-2">
                  <Sparkles size={14} className="text-cyan-400 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-white block text-[10.5px]">Campaign Progression</span>
                    <span className="text-slate-400 text-[10px]">Clearing waves unlocks advanced animal species and Arcane milestone shards!</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
