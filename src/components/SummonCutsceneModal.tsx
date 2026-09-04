import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Star, FastForward, Shield, Zap, ChevronRight, X, Eye, Flame, Crown, Music, Volume2, VolumeX, ExternalLink, Play, Pause } from 'lucide-react';
import { Animal, Rarity } from '../types';
import { gameAudio } from '../utils/audio';
import CapybaraAvatar from './CapybaraAvatar';
import AnimalAvatar from './AnimalAvatar';

interface SummonCutsceneModalProps {
  isOpen: boolean;
  onClose: () => void;
  summonedAnimals: Animal[];
  isOverseerCutscene?: boolean;
}

const OVERSEER_DIALOGUES = [
  "MORTAL... YOU HAVE BROKEN THE BOUNDARIES OF REALITY AND PIERCED THE ETERNAL CONTINUUM.",
  "WELCOME TO THE OVERSEER REALM — WHERE WORLDS ARE CONCEIVED, WEIGHED, AND ERASED IN A SINGLE BREATH.",
  "I AM THE ARCHON OVERSEER. FOR EONS UNCOUNTED, WE HAVE OBSERVED THE RISE AND FALL OF ENTIRE GALAXIES.",
  "YOUR SANCTUM HAS BEEN DEEMED WORTHY. I SHALL LEND MY OMNIPRESENT GAZE AND DEVASTATING COSMIC BEAMS TO ANNIHILATE ALL WHO OPPOSE US."
];

const ELEMENTAL_DEITY_DIALOGUES = [
  "MORTAL... YOU HAVE AWAKENED THE ANCIENT PRIMORDIAL CORE OF ALL ELEMENTAL FORCES.",
  "FIRE, ICE, LIGHTNING, EARTH, POISON, AND COSMIC VOID BOW BEFORE MY UNMATCHED DOMINION.",
  "I AM THE ELEMENTAL DEITY — MASTER OF CATACLYSMIC TEMPESTS AND CONTINENTAL DESTRUCTION.",
  "COMMAND MY SHIFTING ELEMENTAL FORMS AT WILL AND RAIN ANNIHILATION UPON ALL WHO STAND AGAINST US!"
];

const ARCANE_WARPER_DIALOGUES = [
  "DIMENSIONAL SINGULARITY DETECTED... THE FABRIC OF REALITY ITSELF SHATTERS AND DISSOLVES.",
  "I AM THE WARPER — THE SUPREME ARCANE DEITY BEYOND ALL TIME, SPACE, AND UNIVERSAL LAW.",
  "NO FORCE CAN RESTRAIN ME. NO ENEMY SHALL ESCAPE MY COSMIC TITAN PURPLE AURA MEGABEAM.",
  "BEHOLD THE ABSOLUTE DEATH OF WORLD. ALL OPPOSITION IS PERMANENTLY ERASED FROM EXISTENCE."
];

const CAPYBARA_ZEN_DIALOGUES = [
  "OK I PULL UP... HOP OUT AT THE AFTER PARTY.",
  "TRANQUIL VIBES DETECTED... ALL ANXIETY, STRESS, AND BATTLE CONFLICT DISSOLVE IN THE CITRUS SPRING.",
  "I AM THE CAPYBARA — THE SUPREME CHILL ENTITY. FRIEND TO ALL CREATURES, MASTER OF TRANQUIL HYPNOSIS.",
  "RELAX AMIDST FLOATING FLOWER PETALS AND ORANGES, VIBE TO THE THEME SONG, AND WATCH AS ENEMIES BECOME OUR CHILL ALLIES!"
];

// Pre-calculated particle positions for smooth consistent animation
const PETAL_PARTICLES = Array.from({ length: 26 }, (_, i) => ({
  id: `petal-${i}`,
  emoji: ['🌸', '🌺', '💮', '🌸', '🍃', '🌸', '🌷', '🌸'][i % 8],
  left: (i * 3.8 + 2) % 96,
  top: (i * 7.3) % 90,
  duration: 6 + (i % 6) * 1.5,
  delay: (i * 0.4) % 4,
  size: 18 + (i % 4) * 6,
  driftX: ((i % 5) - 2) * 60,
  rotStart: (i * 35) % 360,
  rotEnd: ((i * 35) + 360) % 720,
}));

const ORANGE_PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  id: `orange-${i}`,
  emoji: ['🍊', '🍊', '🍊', '🍋', '🍊'][i % 5],
  left: (i * 7.1 + 4) % 92,
  top: (i * 9.2 + 8) % 85,
  duration: 5 + (i % 5) * 1.8,
  delay: (i * 0.5) % 3.5,
  size: 24 + (i % 3) * 10,
  floatY: 25 + (i % 3) * 15,
  rot: ((i % 4) - 2) * 20,
}));

export const SummonCutsceneModal: React.FC<SummonCutsceneModalProps> = ({
  isOpen,
  onClose,
  summonedAnimals,
  isOverseerCutscene = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [inSpecialPhase, setInSpecialPhase] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [themeVolume, setThemeVolume] = useState(0.85);
  const [showVideoPlayer, setShowVideoPlayer] = useState(true);
  const [isThemePlaying, setIsThemePlaying] = useState(true);
  const [audioMode, setAudioMode] = useState<'youtube' | 'synth'>('youtube');

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const currentAnimal = summonedAnimals[currentIndex] || summonedAnimals[0];
  const isCapybara = currentAnimal?.id === 'capybara' || currentAnimal?.rarity === 'The Chillful';
  const isArcane = currentAnimal?.rarity === 'Arcane' || currentAnimal?.id === 'arcane_warper';
  const isDeity = currentAnimal?.id === 'elemental_god';

  useEffect(() => {
    if (isOpen && summonedAnimals.length > 0) {
      setCurrentIndex(0);
      setDialogueIndex(0);
      setShowVideoPlayer(true);
      const firstAnimal = summonedAnimals[0];
      const hasSpecial = isOverseerCutscene || (firstAnimal && (
        firstAnimal.rarity === 'Overseer' || 
        firstAnimal.rarity === 'Arcane' || 
        firstAnimal.rarity === 'The Chillful' ||
        firstAnimal.id === 'capybara' ||
        firstAnimal.id === 'elemental_god'
      ));
      setInSpecialPhase(Boolean(hasSpecial));
      
      // Play gacha SFX
      if (firstAnimal) {
        try {
          gameAudio.playSFX('gacha', firstAnimal.rarity);
        } catch (e) {
          // audio ctx safe
        }
      }
    }
  }, [isOpen, isOverseerCutscene, summonedAnimals]);

  // Manage Capybara Theme Song Web Audio synthesis lifecycle (only when in synth mode)
  useEffect(() => {
    if (isOpen && isCapybara && audioMode === 'synth') {
      setIsThemePlaying(true);
      if (!isAudioMuted) {
        gameAudio.setCapybaraThemeVolume(themeVolume);
        gameAudio.startCapybaraTheme();
      }
    } else {
      gameAudio.stopCapybaraTheme();
    }

    return () => {
      gameAudio.stopCapybaraTheme();
    };
  }, [isOpen, isCapybara, isAudioMuted, themeVolume, audioMode]);

  const handleToggleThemeAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioMode === 'synth') {
      if (isThemePlaying) {
        gameAudio.stopCapybaraTheme();
        setIsThemePlaying(false);
      } else {
        setIsAudioMuted(false);
        gameAudio.setCapybaraThemeVolume(themeVolume);
        gameAudio.startCapybaraTheme();
        setIsThemePlaying(true);
      }
    } else {
      setIsThemePlaying(prev => !prev);
    }
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAudioMuted(prev => {
      const next = !prev;
      if (next) {
        gameAudio.setCapybaraThemeVolume(0);
      } else {
        gameAudio.setCapybaraThemeVolume(themeVolume);
        if (audioMode === 'synth' && !gameAudio.isCapybaraThemePlaying()) {
          gameAudio.startCapybaraTheme();
          setIsThemePlaying(true);
        }
      }
      return next;
    });
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const val = parseFloat(e.target.value);
    setThemeVolume(val);
    if (val > 0 && isAudioMuted) {
      setIsAudioMuted(false);
    }
    gameAudio.setCapybaraThemeVolume(val);
    if (audioMode === 'synth' && !gameAudio.isCapybaraThemePlaying() && val > 0) {
      gameAudio.startCapybaraTheme();
      setIsThemePlaying(true);
    }
  };

  if (!isOpen || summonedAnimals.length === 0) return null;
  
  const dialogues = isCapybara 
    ? CAPYBARA_ZEN_DIALOGUES 
    : (isArcane 
      ? ARCANE_WARPER_DIALOGUES 
      : (isDeity ? ELEMENTAL_DEITY_DIALOGUES : OVERSEER_DIALOGUES));

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // If currently in Special dialogue phase, advance dialogue
    if (inSpecialPhase) {
      if (dialogueIndex < dialogues.length - 1) {
        setDialogueIndex(prev => prev + 1);
      } else {
        // Dialogue finished, show animal card profile
        setInSpecialPhase(false);
      }
      return;
    }

    // Otherwise advance to next animal card profile in batch
    if (currentIndex < summonedAnimals.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setDialogueIndex(0);
      const nextAnimal = summonedAnimals[nextIdx];
      const hasSpecialNext = nextAnimal && (
        nextAnimal.rarity === 'Overseer' || 
        nextAnimal.rarity === 'Arcane' || 
        nextAnimal.rarity === 'The Chillful' ||
        nextAnimal.id === 'capybara' ||
        nextAnimal.id === 'elemental_god'
      );
      if (hasSpecialNext) {
        setInSpecialPhase(true);
      }
    } else {
      onClose();
    }
  };

  const handleSkipAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  const getRarityTheme = (rarity: Rarity) => {
    switch (rarity) {
      case 'Rare':
        return {
          border: 'border-blue-500/50',
          glow: 'shadow-[0_0_50px_rgba(59,130,246,0.3)]',
          text: 'text-blue-400',
          bgGradient: 'from-blue-950/80 via-slate-950 to-slate-950',
          badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        };
      case 'Epic':
        return {
          border: 'border-purple-500/50',
          glow: 'shadow-[0_0_50px_rgba(168,85,247,0.3)]',
          text: 'text-purple-400',
          bgGradient: 'from-purple-950/80 via-slate-950 to-slate-950',
          badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        };
      case 'Legendary':
        return {
          border: 'border-amber-500/50',
          glow: 'shadow-[0_0_60px_rgba(245,158,11,0.35)]',
          text: 'text-amber-400',
          bgGradient: 'from-amber-950/80 via-slate-950 to-slate-950',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        };
      case 'Mythic':
        return {
          border: 'border-red-500/60',
          glow: 'shadow-[0_0_70px_rgba(239,68,68,0.4)]',
          text: 'text-red-400',
          bgGradient: 'from-red-950/85 via-slate-950 to-slate-950',
          badgeBg: 'bg-red-500/20 text-red-300 border-red-500/40',
        };
      case 'Secret':
        return {
          border: 'border-cyan-400',
          glow: 'shadow-[0_0_80px_rgba(34,211,238,0.5)]',
          text: 'text-cyan-300',
          bgGradient: 'from-cyan-950/90 via-slate-950 to-slate-950',
          badgeBg: 'bg-cyan-500/25 text-cyan-300 border-cyan-400/50',
        };
      case 'Celestial':
        return {
          border: 'border-rose-400/80',
          glow: 'shadow-[0_0_90px_rgba(244,63,94,0.55)]',
          text: 'text-rose-300',
          bgGradient: 'from-rose-950/90 via-slate-950 to-black',
          badgeBg: 'bg-rose-500/30 text-rose-200 border-rose-400/60',
        };
      case 'Unrivaled':
        return {
          border: 'border-amber-400',
          glow: 'shadow-[0_0_100px_rgba(251,191,36,0.6)]',
          text: 'text-amber-300',
          bgGradient: 'from-amber-950/90 via-purple-950/50 to-black',
          badgeBg: 'bg-amber-500/30 text-amber-200 border-amber-400/60',
        };
      case '???':
        return {
          border: 'border-fuchsia-400',
          glow: 'shadow-[0_0_100px_rgba(217,70,239,0.6)]',
          text: 'text-fuchsia-300',
          bgGradient: 'from-fuchsia-950/90 via-indigo-950/50 to-black',
          badgeBg: 'bg-fuchsia-500/30 text-fuchsia-200 border-fuchsia-400/60',
        };
      case 'Original':
        return {
          border: 'border-yellow-400',
          glow: 'shadow-[0_0_110px_rgba(234,179,8,0.7)]',
          text: 'text-yellow-300',
          bgGradient: 'from-yellow-950/90 via-amber-950/60 to-black',
          badgeBg: 'bg-yellow-500/30 text-yellow-200 border-yellow-400/70',
        };
      case 'The Chillful':
        return {
          border: 'border-lime-400',
          glow: 'shadow-[0_0_120px_rgba(132,204,22,0.8)]',
          text: 'text-lime-300',
          bgGradient: 'from-lime-950/95 via-emerald-950/70 to-slate-950',
          badgeBg: 'bg-lime-500/30 text-lime-200 border-lime-400/70',
        };
      case 'Overseer':
        return {
          border: 'border-cyan-300',
          glow: 'shadow-[0_0_120px_rgba(6,182,212,0.8)]',
          text: 'text-cyan-200',
          bgGradient: 'from-cyan-950/95 via-teal-950/80 to-slate-950',
          badgeBg: 'bg-cyan-500/35 text-cyan-100 border-cyan-300/80',
        };
      case 'Arcane':
        return {
          border: 'border-purple-400',
          glow: 'shadow-[0_0_130px_rgba(168,85,247,0.85)]',
          text: 'text-purple-200',
          bgGradient: 'from-purple-950/95 via-fuchsia-950/80 to-slate-950',
          badgeBg: 'bg-purple-500/35 text-purple-100 border-purple-400/80',
        };
      default:
        return {
          border: 'border-slate-700',
          glow: 'shadow-lg',
          text: 'text-slate-300',
          bgGradient: 'from-slate-900 via-slate-950 to-slate-950',
          badgeBg: 'bg-slate-800 text-slate-300 border-slate-700',
        };
    }
  };

  const theme = getRarityTheme(currentAnimal.rarity);

  return (
    <AnimatePresence>
      <div 
        onClick={handleNext}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl select-none cursor-pointer overflow-hidden"
      >
        {/* Animated Background Stardust & Cosmic / Zen Grids */}
        <div className={`absolute inset-0 pointer-events-none ${
          isCapybara 
            ? 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-lime-950/40 via-emerald-950/30 to-black' 
            : 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/20 via-slate-950 to-black'
        }`} />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* 🌸🍊 FLOATING FLOWER PETALS & ORANGES (EXCLUSIVELY FOR CAPYBARA) 🍊🌸 */}
        {isCapybara && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {/* Drifting Flower Petals */}
            {PETAL_PARTICLES.map((petal) => (
              <motion.div
                key={`capy-petal-${petal.id}`}
                initial={{
                  y: -60,
                  x: 0,
                  rotate: petal.rotStart,
                  opacity: 0,
                }}
                animate={{
                  y: ['0vh', '110vh'],
                  x: [0, petal.driftX, 0, -petal.driftX],
                  rotate: petal.rotEnd,
                  opacity: [0, 0.9, 0.9, 0],
                }}
                transition={{
                  duration: petal.duration,
                  delay: petal.delay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{
                  position: 'absolute',
                  left: `${petal.left}%`,
                  fontSize: `${petal.size}px`,
                  filter: 'drop-shadow(0 2px 8px rgba(244,114,182,0.4))',
                }}
              >
                {petal.emoji}
              </motion.div>
            ))}

            {/* Floating Oranges & Citrus Slices */}
            {ORANGE_PARTICLES.map((orange) => (
              <motion.div
                key={`capy-orange-${orange.id}`}
                initial={{
                  y: 0,
                  rotate: orange.rot,
                  scale: 0.8,
                  opacity: 0,
                }}
                animate={{
                  y: [-orange.floatY, orange.floatY, -orange.floatY],
                  rotate: [orange.rot - 15, orange.rot + 15, orange.rot - 15],
                  scale: [0.95, 1.08, 0.95],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: orange.duration,
                  delay: orange.delay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{
                  position: 'absolute',
                  left: `${orange.left}%`,
                  top: `${orange.top}%`,
                  fontSize: `${orange.size}px`,
                  filter: 'drop-shadow(0 4px 12px rgba(249,115,22,0.5))',
                }}
              >
                {orange.emoji}
              </motion.div>
            ))}

            {/* Rising Warm Hot-Spring Steam Wisps */}
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-lime-950/30 via-emerald-950/15 to-transparent flex items-end justify-around pb-4 opacity-75">
              <span className="text-3xl animate-bounce">♨️</span>
              <span className="text-2xl animate-bounce delay-300">♨️</span>
              <span className="text-4xl animate-bounce delay-700">♨️</span>
              <span className="text-2xl animate-bounce delay-150">♨️</span>
              <span className="text-3xl animate-bounce delay-500">♨️</span>
            </div>
          </div>
        )}

        {/* TOP CONTROLS BAR */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20 pointer-events-auto">
          {/* Progress / Title */}
          <div className="flex items-center gap-3">
            <span className={`px-3.5 py-1.5 border rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl ${
              isCapybara
                ? 'bg-lime-950/90 border-lime-400/50 text-lime-300 shadow-[0_0_20px_rgba(132,204,22,0.3)]'
                : 'bg-slate-900/80 border-white/10 text-slate-300'
            }`}>
              {isCapybara ? (
                <>
                  <CapybaraAvatar size="xs" withYuzu={false} className="mr-0.5" />
                  <span>THE CHILLFUL ZEN REVEAL</span>
                  <span className="text-sm">🍊</span>
                </>
              ) : inSpecialPhase ? (
                <>
                  <Sparkles size={12} className="text-cyan-400 animate-pulse" />
                  <span>SPECIAL REALM TRANSMISSION</span>
                </>
              ) : (
                <>
                  <Sparkles size={12} className="text-amber-400 animate-pulse" />
                  <span>GENOME REVEAL {currentIndex + 1} / {summonedAnimals.length}</span>
                </>
              )}
            </span>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Skip All Button */}
            <button
              onClick={handleSkipAll}
              className="px-4 py-2 bg-slate-900/90 hover:bg-slate-800 border border-white/20 hover:border-white/40 text-slate-200 font-extrabold rounded-xl text-xs uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-2xl cursor-pointer"
            >
              <FastForward size={14} className="text-amber-400" /> SKIP ALL
            </button>
          </div>
        </div>

        {/* SPECIAL REALM / ZEN TELEPORT DIALOGUE PHASE */}
        {inSpecialPhase ? (
          <motion.div
            key={`special-dialogue-${dialogueIndex}`}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5 }}
            className={`relative w-full max-w-2xl mx-4 p-8 bg-gradient-to-b ${
              isCapybara
                ? 'from-lime-950/95 via-emerald-950/80 to-slate-950 border-2 border-lime-400 shadow-[0_0_120px_rgba(132,204,22,0.8)]'
                : isArcane
                  ? 'from-purple-950/95 via-fuchsia-950/80 to-slate-950 border-2 border-purple-400 shadow-[0_0_120px_rgba(168,85,247,0.7)]'
                  : isDeity 
                    ? 'from-amber-950/90 via-slate-950 to-slate-950 border-2 border-amber-500 shadow-[0_0_100px_rgba(245,158,11,0.6)]' 
                    : 'from-cyan-950/90 via-slate-950 to-slate-950 border-2 border-cyan-400 shadow-[0_0_100px_rgba(6,182,212,0.6)]'
            } rounded-3xl text-center space-y-6 z-10`}
          >
            {/* Top Teleport Indicator */}
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-[0.3em] animate-pulse ${
              isCapybara
                ? 'bg-lime-950/90 border-lime-400/60 text-lime-300'
                : isArcane
                  ? 'bg-purple-950/90 border-purple-400/60 text-purple-200'
                  : isDeity 
                    ? 'bg-amber-950/80 border-amber-500/50 text-amber-300' 
                    : 'bg-cyan-950/80 border-cyan-400/50 text-cyan-300'
            }`}>
              {isCapybara ? (
                <>
                  <span>🍊</span>
                  <span>CITRUS ONSEN // SUPREME CHILLFUL REALM</span>
                  <span>🌸</span>
                </>
              ) : isArcane ? (
                <>
                  <Zap size={14} className="text-purple-400" />
                  <span>DIMENSIONAL WARP // ARCANE DEITY CONVERGENCE</span>
                </>
              ) : isDeity ? (
                <>
                  <Flame size={14} className="text-amber-400" />
                  <span>TELEPORTED TO ELEMENTAL SANCTUARY</span>
                </>
              ) : (
                <>
                  <Eye size={14} className="text-cyan-400" />
                  <span>TELEPORTED TO OVERSEER REALM</span>
                </>
              )}
            </div>

            {/* Glowing Avatar */}
            <div className="relative w-32 h-32 mx-auto flex items-center justify-center my-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                className={`absolute inset-0 rounded-full border-2 border-dashed ${
                  isCapybara ? 'border-lime-400/60' : isArcane ? 'border-purple-400/60' : isDeity ? 'border-amber-500/50' : 'border-cyan-400/50'
                }`}
              />
              <motion.div
                animate={{ scale: [0.95, 1.1, 0.95] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className={`w-24 h-24 rounded-full p-1 flex items-center justify-center relative ${
                  isCapybara
                    ? 'bg-gradient-to-r from-lime-400 via-emerald-400 to-amber-300 shadow-[0_0_50px_rgba(132,204,22,0.9)]'
                    : isArcane
                      ? 'bg-gradient-to-r from-purple-500 via-fuchsia-400 to-pink-500 shadow-[0_0_50px_rgba(168,85,247,0.9)]'
                      : isDeity 
                        ? 'bg-gradient-to-r from-amber-500 via-orange-400 to-red-500 shadow-[0_0_40px_rgba(245,158,11,0.8)]' 
                        : 'bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-600 shadow-[0_0_40px_rgba(34,211,238,0.8)]'
                }`}
              >
                {/* Cute Orange On Top of Capybara */}
                {isCapybara && (
                  <motion.div 
                    animate={{ y: [-3, 3, -3], rotate: [-6, 6, -6] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -top-4 text-2xl z-20"
                  >
                    🍊
                  </motion.div>
                )}

                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center p-2">
                  {isCapybara ? (
                    <CapybaraAvatar size="xl" withYuzu={false} animated={true} />
                  ) : isArcane ? (
                    <Zap className="w-12 h-12 text-purple-300 animate-pulse" />
                  ) : isDeity ? (
                    <Flame className="w-12 h-12 text-amber-300 animate-bounce" />
                  ) : (
                    <svg className="w-full h-full text-cyan-300 animate-pulse" viewBox="0 0 100 100" fill="none" stroke="currentColor">
                      <path d="M 10,50 Q 50,15 90,50 Q 50,85 10,50 Z" strokeWidth="3" />
                      <circle cx="50" cy="50" r="14" strokeWidth="2" strokeDasharray="3 3" />
                      <circle cx="50" cy="50" r="7" fill="currentColor" />
                    </svg>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Spoken Dialogue Text */}
            <div className="min-h-[100px] flex items-center justify-center px-4">
              <p className={`text-base sm:text-lg font-mono font-extrabold tracking-wide leading-relaxed uppercase drop-shadow-md ${
                isCapybara ? 'text-lime-200' : isArcane ? 'text-purple-200' : isDeity ? 'text-amber-200' : 'text-cyan-200'
              }`}>
                "{dialogues[dialogueIndex]}"
              </p>
            </div>

            {/* 🎵 CAPYBARA THEME CONTROLLER DURING DIALOGUE PHASE 🎵 */}
            {isCapybara && (
              <div 
                onClick={e => e.stopPropagation()} 
                className="mt-4 p-4 bg-slate-950/95 rounded-2xl border-2 border-lime-400 text-left space-y-3 shadow-[0_0_35px_rgba(132,204,22,0.45)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-lime-500 text-slate-950 flex items-center justify-center text-lg font-black shadow-lg shadow-lime-500/30 animate-pulse p-1">
                      <CapybaraAvatar size="xs" withYuzu={false} />
                    </div>
                    <div>
                      <div className="text-[11px] font-black uppercase text-lime-300 flex items-center gap-1.5">
                        <span>🎶 Capybara Viral Anthem</span>
                        <span className="text-[8px] bg-lime-500/20 text-lime-300 border border-lime-400/40 px-1.5 py-0.2 rounded font-bold">
                          VIRAL MEME
                        </span>
                      </div>
                      <div className="text-[9px] text-slate-400 font-sans">
                        {audioMode === 'youtube' ? 'Playing from Official YouTube Stream' : 'Playing WebAudio 128 BPM Synth'}
                      </div>
                    </div>
                  </div>

                  {/* Mode Selector & External YouTube link */}
                  <div className="flex items-center gap-1.5">
                    <div className="flex bg-slate-900 p-0.5 rounded-lg border border-white/10 text-[9px] font-bold">
                      <button
                        onClick={() => setAudioMode('youtube')}
                        className={`px-2 py-1 rounded transition-all cursor-pointer ${
                          audioMode === 'youtube'
                            ? 'bg-lime-500 text-slate-950 font-black shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        🎬 YouTube
                      </button>
                      <button
                        onClick={() => setAudioMode('synth')}
                        className={`px-2 py-1 rounded transition-all cursor-pointer ${
                          audioMode === 'synth'
                            ? 'bg-lime-500 text-slate-950 font-black shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        🎹 Synth
                      </button>
                    </div>

                    <a
                      href="https://www.youtube.com/watch?v=8Pj-YEQbojk"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/40 border border-red-500/40 text-red-300 transition-all cursor-pointer flex items-center gap-1 text-[9px] font-bold"
                      title="Open Official Song on YouTube"
                    >
                      <span>8Pj-YEQbojk</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                </div>

                {/* Embedded YouTube video */}
                {showVideoPlayer && (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-lime-400/50 bg-black shadow-2xl">
                    <iframe
                      ref={iframeRef}
                      className="w-full h-full"
                      src="https://www.youtube.com/embed/8Pj-YEQbojk?autoplay=1&mute=0&controls=1&loop=1&playlist=8Pj-YEQbojk&playsinline=1&enablejsapi=1"
                      title="Capybara Theme Song Video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                      allowFullScreen
                    />
                  </div>
                )}

                {/* Synth controls (if in synth mode) */}
                {audioMode === 'synth' && (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/90 border border-lime-400/30">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleToggleThemeAudio}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black transition-all cursor-pointer ${
                          isThemePlaying && !isAudioMuted
                            ? 'bg-lime-400 text-slate-950'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isThemePlaying && !isAudioMuted ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
                      </button>
                      <span className="text-[9.5px] font-bold text-lime-300">
                        {isThemePlaying && !isAudioMuted ? 'Synth Chant Playing' : 'Synth Chant Paused'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleToggleMute}
                        className="p-1 text-lime-300 hover:text-white transition-all cursor-pointer"
                      >
                        {isAudioMuted ? <VolumeX size={14} className="text-red-400" /> : <Volume2 size={14} />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={isAudioMuted ? 0 : themeVolume}
                        onChange={handleVolumeChange}
                        className="w-16 h-1.5 bg-slate-800 accent-lime-400 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* Synced Chant Lyric Bar */}
                <div className="px-3 py-1.5 rounded-lg bg-lime-950/60 border border-lime-400/30 flex items-center justify-between text-[10px] text-lime-200 font-mono">
                  <span className="font-extrabold tracking-wider animate-pulse flex items-center gap-1.5">
                    "Капибара, капибара, капибара, капибара-бара-бара капибара!" <CapybaraAvatar size="xs" withYuzu={false} />
                  </span>
                  <span className="text-amber-300 font-bold">🌸 🍊 ♨️</span>
                </div>
              </div>
            )}

            {/* Hint to click */}
            <div className={`text-[10px] font-black uppercase tracking-[0.2em] animate-bounce pt-2 ${
              isCapybara ? 'text-lime-400/90' : isArcane ? 'text-purple-400/90' : isDeity ? 'text-amber-400/80' : 'text-cyan-400/80'
            }`}>
              CLICK ANYWHERE TO CONTINUE ({dialogueIndex + 1} / {dialogues.length}) ➔
            </div>
          </motion.div>
        ) : (
          /* ANIMAL CARD PROFILE DISPLAY */
          <motion.div
            key={`card-profile-${currentIndex}`}
            initial={{ scale: 0.8, opacity: 0, rotateY: -30 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            exit={{ scale: 0.8, opacity: 0, rotateY: 30 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className={`relative w-full max-w-md mx-4 p-6 sm:p-7 bg-gradient-to-b ${theme.bgGradient} border-2 ${theme.border} ${theme.glow} rounded-3xl text-center space-y-4 z-10 overflow-hidden`}
          >
            {/* Holographic Top Border Accent */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" />

            {/* Rarity Header Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-[0.3em] shadow-lg animate-pulse" style={{ borderColor: currentAnimal.color }}>
              <Star size={12} fill="currentColor" className={theme.text} />
              <span className={theme.text}>{currentAnimal.rarity} GENOME</span>
              <Star size={12} fill="currentColor" className={theme.text} />
            </div>

            {/* Animal Avatar Showcase */}
            <div className="relative my-2 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.08, 1], rotate: [0, 3, -3, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="w-32 h-32 rounded-3xl border-4 flex items-center justify-center text-6xl font-black shadow-2xl relative overflow-hidden"
                style={{
                  backgroundColor: `${currentAnimal.color}20`,
                  borderColor: currentAnimal.color,
                  boxShadow: `0 0 50px ${currentAnimal.color}60`,
                }}
              >
                {/* Background glow circle inside card avatar */}
                <div 
                  className="absolute inset-0 opacity-30 blur-md animate-pulse" 
                  style={{ backgroundColor: currentAnimal.color }} 
                />

                {isCapybara ? (
                  <div className="relative z-10 flex items-center justify-center p-2">
                    <CapybaraAvatar size="2xl" withYuzu={true} animated={true} />
                  </div>
                ) : (
                  <div className="relative z-10 flex items-center justify-center p-2 w-full h-full">
                    <AnimalAvatar animal={currentAnimal} size="2xl" animated={true} />
                  </div>
                )}
              </motion.div>
            </div>

            {/* Animal Name */}
            <div>
              <h2 className="text-3xl sm:text-4xl font-black italic uppercase tracking-tight text-white drop-shadow-md flex items-center justify-center gap-2">
                <span>{currentAnimal.name}</span>
                {isCapybara && <span className="text-2xl animate-bounce">🍊</span>}
              </h2>
              {currentAnimal.isExtinct && (
                <span className="inline-block mt-1 px-2.5 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-[9px] font-black uppercase tracking-widest">
                  ANCIENT EXTINCT CREATURE
                </span>
              )}
              {isCapybara && (
                <span className="inline-block mt-1 px-2.5 py-0.5 bg-lime-500/20 text-lime-300 border border-lime-500/40 rounded text-[9px] font-black uppercase tracking-widest animate-pulse">
                  ✨ SUPREME CHILL ENTITY • ZERO STRESS
                </span>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 bg-slate-950/70 p-2.5 rounded-2xl border border-white/10 text-left font-mono text-[10px]">
              <div className="bg-slate-900/60 p-2 rounded-xl border border-white/5">
                <div className="text-[8px] uppercase text-slate-500 font-bold mb-0.5">⚔️ Damage</div>
                <div className="font-extrabold text-red-400 text-xs">{currentAnimal.damage}</div>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-xl border border-white/5">
                <div className="text-[8px] uppercase text-slate-500 font-bold mb-0.5">🎯 Range</div>
                <div className="font-extrabold text-cyan-400 text-xs">{currentAnimal.range}m</div>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-xl border border-white/5">
                <div className="text-[8px] uppercase text-slate-500 font-bold mb-0.5">⚡ ASPD</div>
                <div className="font-extrabold text-amber-400 text-xs">{(1000 / currentAnimal.fireRate).toFixed(1)}/s</div>
              </div>
            </div>

            {/* Skill Box if available */}
            {currentAnimal.skillName && (
              <div className="p-3 bg-slate-950/80 rounded-2xl border border-white/10 text-left space-y-1">
                <div className="text-[9px] font-black uppercase tracking-wider text-lime-400 flex items-center gap-1.5">
                  <Zap size={11} className="text-lime-400" />
                  {currentAnimal.skillName}
                </div>
                <p className="text-[9.5px] text-slate-300 font-sans leading-snug uppercase">
                  {currentAnimal.skillDesc || 'Deals massive area damage across the field.'}
                </p>
              </div>
            )}

            {/* 🎵 CAPYBARA THEME SONG CONTROLLER & VIDEO PLAYER (FOR CAPYBARA) 🎵 */}
            {isCapybara && (
              <div 
                onClick={e => e.stopPropagation()} 
                className="p-4 bg-gradient-to-r from-lime-950/95 via-emerald-950/90 to-slate-950 rounded-2xl border-2 border-lime-400 text-left space-y-3 shadow-[0_0_35px_rgba(132,204,22,0.4)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-lime-500 text-slate-950 flex items-center justify-center text-base font-black shadow-lg shadow-lime-500/30 p-1">
                      <CapybaraAvatar size="xs" withYuzu={false} />
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase text-lime-300 flex items-center gap-1.5">
                        <span>🎵 Capybara Viral Anthem</span>
                        <span className="text-[7.5px] bg-lime-500/20 text-lime-300 border border-lime-400/40 px-1.5 py-0.2 rounded font-bold">
                          {audioMode === 'youtube' ? 'YOUTUBE' : 'SYNTH'}
                        </span>
                      </div>
                      <div className="text-[8.5px] text-slate-400">Viral Chill Anthem • 8Pj-YEQbojk</div>
                    </div>
                  </div>

                  {/* Mode switcher & external link */}
                  <div className="flex items-center gap-1.5">
                    <div className="flex bg-slate-900 p-0.5 rounded-lg border border-white/10 text-[8.5px] font-bold">
                      <button
                        onClick={() => setAudioMode('youtube')}
                        className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                          audioMode === 'youtube'
                            ? 'bg-lime-500 text-slate-950 font-black shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        🎬 Video
                      </button>
                      <button
                        onClick={() => setAudioMode('synth')}
                        className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                          audioMode === 'synth'
                            ? 'bg-lime-500 text-slate-950 font-black shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        🎹 Synth
                      </button>
                    </div>

                    <a
                      href="https://www.youtube.com/watch?v=8Pj-YEQbojk"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded-lg bg-red-600/20 hover:bg-red-600/40 border border-red-500/40 text-red-300 transition-all cursor-pointer"
                      title="Open on YouTube"
                    >
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>

                {/* Embedded YouTube Player */}
                {showVideoPlayer && (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-lime-400/50 bg-black shadow-2xl">
                    <iframe
                      ref={iframeRef}
                      className="w-full h-full"
                      src="https://www.youtube.com/embed/8Pj-YEQbojk?autoplay=1&mute=0&controls=1&loop=1&playlist=8Pj-YEQbojk&playsinline=1&enablejsapi=1"
                      title="Capybara Theme Song"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                      allowFullScreen
                    />
                  </div>
                )}

                {/* Synth controls (if in synth mode) */}
                {audioMode === 'synth' && (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/90 border border-lime-400/30">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleToggleThemeAudio}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black transition-all cursor-pointer ${
                          isThemePlaying && !isAudioMuted
                            ? 'bg-lime-400 text-slate-950'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isThemePlaying && !isAudioMuted ? <Pause size={10} /> : <Play size={10} className="ml-0.5" />}
                      </button>
                      <span className="text-[9px] font-bold text-lime-300">
                        {isThemePlaying && !isAudioMuted ? 'Synth Playing' : 'Synth Paused'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleToggleMute}
                        className="p-1 text-lime-300 hover:text-white transition-all cursor-pointer"
                      >
                        {isAudioMuted ? <VolumeX size={12} className="text-red-400" /> : <Volume2 size={12} />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={isAudioMuted ? 0 : themeVolume}
                        onChange={handleVolumeChange}
                        className="w-14 h-1.5 bg-slate-800 accent-lime-400 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* Synced Chant Lyric Bar */}
                <div className="px-3 py-1.5 rounded-lg bg-lime-950/60 border border-lime-400/30 flex items-center justify-between text-[9.5px] text-lime-200 font-mono">
                  <span className="font-extrabold tracking-wider animate-pulse flex items-center gap-1.5">
                    "Капибара, капибара, капибара, капибара-бара-бара капибара!" <CapybaraAvatar size="xs" withYuzu={false} />
                  </span>
                  <span className="text-amber-300 font-bold">🌸 🍊 ♨️</span>
                </div>
              </div>
            )}

            {/* Click to Next Hint */}
            <div className="pt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 animate-pulse flex items-center justify-center gap-1">
              CLICK ANYWHERE TO {currentIndex < summonedAnimals.length - 1 ? 'NEXT CARD' : 'CONTINUE'} <ChevronRight size={14} />
            </div>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
};
