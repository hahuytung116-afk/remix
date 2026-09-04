import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Play, 
  Volume2, 
  VolumeX, 
  FastForward, 
  Zap,
  Heart,
  Swords,
  Shield,
  Eye,
  Crown,
  Flame,
  AlertTriangle
} from 'lucide-react';
import { gameAudio } from '../utils/audio';
import { UnitArtwork } from './artworks/UnitArtwork';
import { 
  MultiverseWatcherArtwork, 
  InfectedWarperArtwork, 
  ArcaneWarperArtwork 
} from './artworks/OriginalAndOverseerArtworks';

interface WarperReturnCutsceneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWarperPurified?: () => void;
  isPreview?: boolean;
}

type CutsceneStep = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const WarperReturnCutsceneModal: React.FC<WarperReturnCutsceneModalProps> = ({
  isOpen,
  onClose,
  onWarperPurified,
}) => {
  const [currentStep, setCurrentStep] = useState<CutsceneStep>(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [screenShake, setScreenShake] = useState(false);
  const [beamClashPosition, setBeamClashPosition] = useState(50); // 0-100%

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const typingIntervalRef = useRef<any>(null);

  // Sound effects generator for fight, laser clash, shattering, and cosmic purification
  const playCosmicSFX = (type: 'dialogue' | 'clash' | 'laser_beam' | 'shatter' | 'purification' | 'homecoming') => {
    if (isAudioMuted || typeof window === 'undefined') return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;

      if (type === 'dialogue') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440 + Math.random() * 80, now);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'clash') {
        // High impact metallic and energy blade clash
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = 'sawtooth';
        osc2.type = 'square';
        osc1.frequency.setValueAtTime(800, now);
        osc1.frequency.exponentialRampToValueAtTime(120, now + 0.35);
        osc2.frequency.setValueAtTime(1200, now);
        osc2.frequency.exponentialRampToValueAtTime(80, now + 0.35);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.42);
        osc2.stop(now + 0.42);
      } else if (type === 'laser_beam') {
        // Dual laser beam humming collision
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.linearRampToValueAtTime(880, now + 0.5);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.62);
      } else if (type === 'shatter') {
        // Void crystal glass shatter effect
        for (let i = 0; i < 6; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(1200 + Math.random() * 1600, now + i * 0.04);
          gain.gain.setValueAtTime(0.25, now + i * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.04);
          osc.stop(now + i * 0.04 + 0.22);
        }
      } else if (type === 'purification') {
        // Multi-oscillator celestial chord
        [528, 660, 792, 1056, 1320].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.06);
          gain.gain.setValueAtTime(0.1, now + i * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.06);
          osc.stop(now + 1.4);
        });
      } else if (type === 'homecoming') {
        // Deep warm harmonic resolution (F major to C major)
        [349.23, 440.0, 523.25, 698.46, 880.0, 1046.5].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.12, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 2.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + 2.4);
        });
      }
    } catch {
      // Audio fallback
    }
  };

  const dialogueScripts = [
    {
      step: 0,
      speaker: 'MULTIVERSE WATCHER',
      speakerRole: '2nd Arcane Deity • Interdimensional Tracking',
      unitId: 'multiverse_watcher',
      color: '#c084fc',
      side: 'right',
      line: 'Brother... I traversed 1,000 dimensions to find you. Break free from the Syndicate void!',
      stageTitle: 'ACT I: THE INTERDIMENSIONAL ENCOUNTER',
      actionState: 'standoff',
      caption: 'Multiverse Watcher tracks down the infected Arcane Warper across fractured space-time.'
    },
    {
      step: 1,
      speaker: 'INFECTED WARPER',
      speakerRole: 'Corrupted Quantum Core • Syndicate Void Thrall',
      unitId: 'infected_warper',
      color: '#f43f5e',
      side: 'left',
      line: '*roars in corrupted agony* YOU CANNOT SAVE ME... DIE IN THE VOID!',
      stageTitle: 'ACT II: THE CORRUPTED BLADE ASSAULT',
      actionState: 'warper_strike',
      caption: 'Infected Warper strikes with high-velocity corrupted quantum blades!'
    },
    {
      step: 2,
      speaker: 'COSMIC CHRONICLER',
      speakerRole: 'Universal Battlefield Telemetry',
      unitId: 'multiverse_watcher',
      color: '#38bdf8',
      side: 'center',
      line: 'DUEL OF THE ARCANE GODS! Crimson Void Lasers clash head-on against Singularity Cosmic Beams!',
      stageTitle: 'ACT III: DUAL ARCANE BEAM STRUGGLE',
      actionState: 'beam_clash',
      caption: 'A colossal energy beam clash shakes the foundations of reality!'
    },
    {
      step: 3,
      speaker: 'MULTIVERSE WATCHER',
      speakerRole: 'Singularity Overdrive • Dimensional Cleansing',
      unitId: 'multiverse_watcher',
      color: '#a855f7',
      side: 'right',
      line: 'I WILL NOT LET THEM TAKE YOU! CONTINUUM PURIFICATION... MAXIMUM OVERDRIVE!',
      stageTitle: 'ACT IV: THE SINGULARITY STRIKE',
      actionState: 'watcher_overdrive',
      caption: 'Multiverse Watcher pierces the void shield, striking directly at the infection parasite!'
    },
    {
      step: 4,
      speaker: 'INFECTED WARPER',
      speakerRole: 'Void Armor Shattering • Neural Core Restoring',
      unitId: 'infected_warper',
      color: '#fb7185',
      side: 'left',
      line: '*the dark void armor cracks and shatters into stardust* The voices... they are fading... brother...?',
      stageTitle: 'ACT V: THE SHATTERING OF VOID CHAINS',
      actionState: 'shattering',
      caption: 'The dark Syndicate corruption shatters into fragments of celestial stardust!'
    },
    {
      step: 5,
      speaker: 'WARPER',
      speakerRole: '1st Arcane Deity • Purified & Awakened',
      unitId: 'arcane_warper',
      color: '#ec4899',
      side: 'left',
      line: 'im... home',
      stageTitle: 'ACT VI: REUNION OF THE TWIN ARCANE DEITIES',
      actionState: 'purified_reunion',
      caption: 'The 1st Arcane Deity is freed from the infection and returns to his true brotherly bond.'
    },
    {
      step: 6,
      speaker: 'WARPER & MULTIVERSE WATCHER',
      speakerRole: 'Twin Arcane Singularities • Ready for Wave 400',
      unitId: 'arcane_warper',
      color: '#e879f9',
      side: 'center',
      line: 'The Dual Arcane Deities stand united! Together, we shall annihilate the 10,000 ENEMY INVASION in Wave 400!',
      stageTitle: 'ACT VII: THE ULTIMATE STAND DECREE',
      actionState: 'twin_stand',
      caption: 'Wave 399 Cleared! The Arcane Warper joins your permanent roster for the Wave 400 climax!'
    }
  ];

  // Dynamic beam struggle animation in Step 2
  useEffect(() => {
    if (currentStep === 2) {
      const interval = setInterval(() => {
        setBeamClashPosition(prev => {
          const shift = (Math.random() - 0.45) * 8;
          return Math.max(30, Math.min(70, prev + shift));
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [currentStep]);

  // Reset or start dialogue typing on step change
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setDisplayedText('');
      return;
    }

    const script = dialogueScripts[currentStep];
    if (!script) return;

    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    setDisplayedText('');
    let charIdx = 0;
    const fullText = script.line;

    if (currentStep === 1) {
      setScreenShake(true);
      playCosmicSFX('clash');
      setTimeout(() => setScreenShake(false), 500);
    } else if (currentStep === 2) {
      setScreenShake(true);
      playCosmicSFX('laser_beam');
      setTimeout(() => setScreenShake(false), 800);
    } else if (currentStep === 3) {
      setScreenShake(true);
      playCosmicSFX('clash');
      setTimeout(() => setScreenShake(false), 600);
    } else if (currentStep === 4) {
      setScreenShake(true);
      playCosmicSFX('shatter');
      setTimeout(() => setScreenShake(false), 700);
    } else if (currentStep === 5) {
      setScreenShake(true);
      playCosmicSFX('homecoming');
      setTimeout(() => setScreenShake(false), 900);
    } else if (currentStep === 6) {
      playCosmicSFX('purification');
    }

    typingIntervalRef.current = setInterval(() => {
      if (charIdx < fullText.length) {
        setDisplayedText(fullText.slice(0, charIdx + 1));
        if (charIdx % 3 === 0) {
          playCosmicSFX('dialogue');
        }
        charIdx++;
      } else {
        clearInterval(typingIntervalRef.current);
      }
    }, 24);

    return () => {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    };
  }, [isOpen, currentStep]);

  // Canvas background fx: Clash shockwaves, lasers, and stardust
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      life: number;
    }> = [];

    const colors = ['#f43f5e', '#a855f7', '#38bdf8', '#fbbf24', '#ffffff', '#ec4899', '#00f0ff'];

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        size: Math.random() * 3.5 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.8 + 0.2,
        life: Math.random() * 100
      });
    }

    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      angle += 0.03;

      // Draw background clash battlefield aura
      const grad = ctx.createRadialGradient(cx, cy, 30, cx, cy, Math.max(canvas.width, canvas.height) * 0.7);
      if (currentStep >= 5) {
        // Celestial Homecoming Palette
        grad.addColorStop(0, 'rgba(236, 72, 153, 0.35)');
        grad.addColorStop(0.4, 'rgba(168, 85, 247, 0.25)');
        grad.addColorStop(1, 'rgba(7, 5, 20, 0.96)');
      } else if (currentStep === 2 || currentStep === 3) {
        // High Intensity Clash Palette
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        grad.addColorStop(0.3, 'rgba(244, 63, 94, 0.35)');
        grad.addColorStop(0.6, 'rgba(168, 85, 247, 0.3)');
        grad.addColorStop(1, 'rgba(5, 5, 15, 0.96)');
      } else {
        // Dark Corrupted Void Encounter
        grad.addColorStop(0, 'rgba(244, 63, 94, 0.25)');
        grad.addColorStop(0.5, 'rgba(99, 102, 241, 0.2)');
        grad.addColorStop(1, 'rgba(5, 5, 12, 0.96)');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Expanding Shockwaves during Clash steps
      if (currentStep === 1 || currentStep === 2 || currentStep === 3) {
        ctx.save();
        ctx.translate(cx, cy);
        for (let r = 1; r <= 3; r++) {
          ctx.beginPath();
          ctx.arc(0, 0, (angle * 90 * r) % (canvas.width * 0.5), 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 255, 255, ${Math.max(0, 0.6 - (r * 0.15))})`;
          ctx.lineWidth = 3;
          ctx.stroke();
        }
        ctx.restore();
      }

      // Render flying stardust & energy sparks
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * (0.6 + Math.sin(p.life * 0.05) * 0.4);
        ctx.shadowBlur = 12;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.restore();
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, currentStep]);

  const currentScript = dialogueScripts[currentStep] || dialogueScripts[0];

  const handleCompletePurification = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (onWarperPurified) {
      onWarperPurified();
    }
    gameAudio.playSFX('victory');
    onClose();
  };

  const handleNextStep = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const fullLine = currentScript?.line || '';
    if (displayedText.length < fullLine.length) {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
      setDisplayedText(fullLine);
      return;
    }

    if (currentStep < dialogueScripts.length - 1) {
      setCurrentStep((prev) => (prev + 1) as CutsceneStep);
    } else {
      handleCompletePurification();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter' || e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextStep();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep, displayedText]);

  if (!isOpen) return null;

  const isFightActive = currentStep >= 1 && currentStep <= 3;
  const isPurified = currentStep >= 5;
  const isShattering = currentStep === 4;

  return (
    <AnimatePresence>
      <div 
        id="warper-return-modal"
        onClick={handleNextStep}
        className={`fixed inset-0 z-[200] flex flex-col items-center justify-between p-3 sm:p-6 bg-slate-950/95 backdrop-blur-md select-none overflow-hidden cursor-pointer ${
          screenShake ? 'animate-shake' : ''
        }`}
      >
        {/* Background Canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

        {/* Top Header Bar */}
        <div 
          onClick={(e) => e.stopPropagation()} 
          className="relative z-10 w-full max-w-5xl flex items-center justify-between border-b border-purple-500/30 pb-3 cursor-default"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border shadow-lg transition-all ${
              isFightActive 
                ? 'bg-rose-950/80 border-rose-500/60 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.5)]'
                : 'bg-purple-950/80 border-purple-400/50 text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.4)]'
            }`}>
              {isFightActive ? (
                <Swords className="w-6 h-6 animate-pulse text-rose-400" />
              ) : (
                <Heart className="w-6 h-6 animate-pulse text-pink-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-purple-400 font-mono">
                  LORE CHRONICLES • CLIMAX PURIFICATION
                </span>
                <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-pink-500/30 text-pink-200 border border-pink-400/40">
                  ACT {currentStep + 1} / 7
                </span>
                {isFightActive && (
                  <span className="px-2 py-0.5 text-[9px] font-black rounded-full bg-rose-600 text-white animate-pulse">
                    ⚔️ ARCANE DUEL IN PROGRESS
                  </span>
                )}
              </div>
              <h2 className="text-sm sm:text-xl font-black text-white tracking-wide">
                {currentScript.stageTitle}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsAudioMuted(!isAudioMuted);
              }}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-600 transition-colors cursor-pointer"
              title={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isAudioMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCompletePurification(e);
              }}
              className="px-3 py-1.5 rounded-lg bg-purple-600/80 hover:bg-purple-500 text-xs font-bold text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95"
            >
              <FastForward className="w-4 h-4" /> Skip Battle
            </button>
          </div>
        </div>

        {/* Central Visual Arena: The Epic Fight / Reunion */}
        <div className="relative z-10 w-full max-w-5xl flex-1 flex items-center justify-center py-2 sm:py-4">
          <div className="w-full flex items-center justify-between gap-2 sm:gap-6 relative">
            
            {/* Left Entity: The Warper (Infected -> Purified) */}
            <motion.div
              animate={
                currentStep === 1 
                  ? { x: [0, 40, -10, 0], y: [-10, 10, 0], scale: 1.15 } 
                  : currentStep === 2 
                    ? { x: [-15, -5, -15], rotate: [-2, 2, -2] }
                    : currentStep === 3 
                      ? { x: [-30, -50, -30], rotate: [-5, -10, -5] }
                      : isShattering 
                        ? { scale: [1, 1.2, 0.9, 1.1], rotate: [0, 5, -5, 0] }
                        : isPurified 
                          ? { scale: [1, 1.05, 1], y: [0, -6, 0] }
                          : { y: [0, -4, 0] }
              }
              transition={{ 
                duration: isFightActive ? 0.35 : isShattering ? 0.4 : 2.5, 
                repeat: isFightActive || isPurified ? Infinity : 0, 
                ease: 'easeInOut' 
              }}
              className={`relative z-20 flex flex-col items-center gap-2 sm:gap-3 p-4 sm:p-6 rounded-3xl border-2 transition-all ${
                isPurified
                  ? 'bg-gradient-to-b from-purple-950/90 to-pink-950/70 border-pink-400 shadow-[0_0_50px_rgba(236,72,153,0.7)]'
                  : isFightActive
                    ? 'bg-rose-950/80 border-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.6)]'
                    : 'bg-rose-950/60 border-rose-500/80 shadow-[0_0_30px_rgba(244,63,94,0.4)]'
              }`}
            >
              {/* Corrupted Void Blades slash overlay (Step 1) */}
              <AnimatePresence>
                {currentStep === 1 && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1.4 }}
                    exit={{ opacity: 0 }}
                    className="absolute -right-8 top-1/2 -translate-y-1/2 z-30 pointer-events-none text-rose-500 animate-spin"
                  >
                    <Swords className="w-12 h-12 drop-shadow-[0_0_20px_#f43f5e]" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Shattering Void Shards FX (Step 4) */}
              <AnimatePresence>
                {isShattering && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center"
                  >
                    <div className="absolute inset-0 border-4 border-dashed border-white rounded-3xl animate-ping" />
                    <div className="px-3 py-1 bg-white text-rose-600 font-black text-xs uppercase tracking-widest rounded-full shadow-2xl animate-bounce">
                      💥 CORRUPTION SHATTERED!
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative">
                <div className={`w-28 h-28 sm:w-36 sm:h-36 rounded-2xl flex items-center justify-center p-2.5 border-4 transition-all duration-700 ${
                  isPurified 
                    ? 'border-pink-400 bg-gradient-to-tr from-purple-950 via-pink-950 to-slate-950 shadow-[0_0_50px_#ec4899]' 
                    : 'border-rose-500 bg-gradient-to-tr from-rose-950 via-slate-900 to-slate-950 shadow-[0_0_30px_#f43f5e]'
                }`}>
                  {isPurified ? (
                    <ArcaneWarperArtwork className="w-full h-full drop-shadow-[0_0_20px_#ec4899]" />
                  ) : (
                    <InfectedWarperArtwork className="w-full h-full drop-shadow-[0_0_15px_#f43f5e]" />
                  )}
                </div>

                {isPurified && (
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
                    className="absolute -inset-3 rounded-2xl border-2 border-dashed border-pink-300 pointer-events-none"
                  />
                )}
              </div>

              <div className="text-center">
                <div className="text-[10px] sm:text-xs font-semibold text-pink-300 uppercase tracking-widest">
                  {isPurified ? '1st Arcane Tier • Purified' : 'Corrupted Arcane Deity'}
                </div>
                <div className="text-sm sm:text-lg font-black text-white font-mono">
                  {isPurified ? 'THE ARCANE WARPER' : 'INFECTED WARPER'}
                </div>
                <div className="text-[10px] text-purple-200">
                  {isPurified ? 'Returned to Sanctuary • Ready for W400' : 'Shattering Syndicate Infection...'}
                </div>
              </div>
            </motion.div>

            {/* Center Duel / Beam Clash / Reunion Matrix */}
            <div className="flex-1 flex flex-col items-center justify-center px-1 sm:px-4 relative z-10">
              {/* Step 2: DUAL BEAM CLASH */}
              {currentStep === 2 && (
                <div className="w-full flex flex-col items-center">
                  <div className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-yellow-300 mb-2 animate-pulse flex items-center gap-1">
                    <Zap size={14} className="text-yellow-400" />
                    <span>DIMENSIONAL ENERGY COLLISION</span>
                    <Zap size={14} className="text-yellow-400" />
                  </div>

                  {/* Collision Beam Bar */}
                  <div className="w-full h-6 sm:h-8 rounded-full bg-slate-950 border-2 border-white/40 relative overflow-hidden flex items-center shadow-[0_0_30px_rgba(255,255,255,0.5)]">
                    {/* Left Beam (Infected Warper Crimson) */}
                    <div 
                      className="h-full bg-gradient-to-r from-rose-600 via-red-500 to-rose-300 transition-all duration-100 relative"
                      style={{ width: `${beamClashPosition}%` }}
                    >
                      <div className="absolute inset-0 bg-white/30 animate-pulse" />
                    </div>

                    {/* Clash Spark Center */}
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-30 w-8 h-8 rounded-full bg-white shadow-[0_0_30px_#ffffff] flex items-center justify-center animate-ping"
                      style={{ left: `${beamClashPosition}%` }}
                    />

                    {/* Right Beam (Multiverse Watcher Cosmic) */}
                    <div 
                      className="h-full bg-gradient-to-l from-purple-600 via-cyan-400 to-white transition-all duration-100 flex-1 relative"
                    >
                      <div className="absolute inset-0 bg-white/30 animate-pulse" />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: MULTIVERSE OVERDRIVE STRIKE */}
              {currentStep === 3 && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: [1, 1.2, 1], opacity: 1 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 blur-md animate-ping absolute" />
                  <Zap className="w-14 h-14 text-cyan-300 relative z-10 animate-bounce" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-cyan-200 mt-2 font-mono">
                    SINGULARITY OVERDRIVE STRIKE!
                  </span>
                </motion.div>
              )}

              {/* Steps 5 & 6: REUNITED BROTHERLY HARMONY */}
              {isPurified && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex flex-col items-center justify-center text-center"
                >
                  <div className="relative flex items-center justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.4, 1], rotate: [0, 180, 360] }}
                      transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 blur-lg opacity-80"
                    />
                    <Crown className="w-8 h-8 text-yellow-300 absolute z-10 drop-shadow-[0_0_15px_gold]" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-mono text-purple-200 mt-2 font-black uppercase tracking-wider">
                    DUAL ARCANE HARMONY
                  </span>
                </motion.div>
              )}
            </div>

            {/* Right Entity: The Multiverse Watcher */}
            <motion.div
              animate={
                currentStep === 1 
                  ? { x: [10, -30, 0], scale: 1.1 } 
                  : currentStep === 2 
                    ? { x: [15, 5, 15], rotate: [2, -2, 2] }
                    : currentStep === 3 
                      ? { x: [-40, -70, -20], scale: 1.25 }
                      : { y: [0, -6, 0] }
              }
              transition={{ 
                duration: isFightActive ? 0.35 : 3, 
                repeat: isFightActive ? Infinity : Infinity, 
                ease: 'easeInOut' 
              }}
              className={`relative z-20 flex flex-col items-center gap-2 sm:gap-3 p-4 sm:p-6 rounded-3xl border-2 transition-all ${
                isFightActive
                  ? 'bg-purple-950/90 border-cyan-400 shadow-[0_0_45px_rgba(6,182,212,0.6)]'
                  : 'bg-indigo-950/70 border-purple-400/80 shadow-[0_0_40px_rgba(168,85,247,0.4)]'
              }`}
            >
              <div className="relative">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl flex items-center justify-center p-2.5 border-4 border-purple-400 bg-gradient-to-tr from-purple-950 via-indigo-950 to-slate-950 shadow-[0_0_40px_#a855f7]">
                  <MultiverseWatcherArtwork className="w-full h-full drop-shadow-[0_0_15px_#a855f7]" />
                </div>
              </div>

              <div className="text-center">
                <div className="text-[10px] sm:text-xs font-semibold text-cyan-400 uppercase tracking-widest">
                  2nd Arcane Tier
                </div>
                <div className="text-sm sm:text-lg font-black text-white font-mono">
                  MULTIVERSE WATCHER
                </div>
                <div className="text-[10px] text-indigo-300">
                  {isFightActive ? 'Channeling Singularity Purification' : 'Twin Arcane Deity • Welcomes Warper'}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Dialogue Box */}
        <div className="relative z-10 w-full max-w-5xl bg-slate-900/90 border-2 border-purple-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl">
          {/* Speaker Header */}
          <div className="flex items-center justify-between mb-2 border-b border-purple-500/20 pb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-pink-400/60 bg-slate-950 p-1 flex items-center justify-center shadow-[0_0_12px_rgba(236,72,153,0.4)] overflow-hidden shrink-0">
                <UnitArtwork 
                  animalId={currentScript.unitId || 'arcane_warper'} 
                  className="w-full h-full drop-shadow" 
                />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-black tracking-wider uppercase font-mono" style={{ color: currentScript.color }}>
                  {currentScript.speaker}
                </span>
                <p className="text-[10px] sm:text-xs text-slate-400 font-mono">{currentScript.speakerRole}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {dialogueScripts.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    idx === currentStep
                      ? 'bg-pink-400 w-6'
                      : idx < currentStep
                      ? 'bg-purple-400'
                      : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Dialogue Message */}
          <div className="min-h-[60px] sm:min-h-[72px] flex items-center">
            <p className="text-sm sm:text-xl font-black text-slate-100 leading-relaxed font-sans italic">
              "{displayedText}"
              <span className="inline-block w-2 h-4 sm:h-5 ml-1 bg-pink-400 animate-pulse" />
            </p>
          </div>

          {/* Action Button */}
          <div className="mt-3 flex items-center justify-between gap-3 pt-2 border-t border-white/10">
            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-bold text-[9px]">SPACE / ENTER</span>
              <span>or click anywhere to proceed</span>
            </div>

            <div className="flex items-center gap-3">
              {currentStep < dialogueScripts.length - 1 ? (
                <button
                  type="button"
                  onClick={(e) => handleNextStep(e)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-black text-xs tracking-wider uppercase shadow-lg shadow-pink-500/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <span>Continue</span>
                  <Play className="w-3.5 h-3.5 fill-white" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => handleCompletePurification(e)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-500 hover:opacity-90 text-white font-black text-xs sm:text-sm tracking-wider uppercase shadow-2xl shadow-pink-500/50 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 animate-pulse cursor-pointer"
                >
                  <span>Welcome Back Warper!</span>
                  <Sparkles className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
};
