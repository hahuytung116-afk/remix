import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Zap, 
  Crown, 
  Volume2, 
  VolumeX, 
  FastForward,
  Play,
  Eye,
  Infinity as InfinityIcon,
  Award
} from 'lucide-react';
import { gameAudio } from '../utils/audio';
import { 
  TitanDefenderArtwork, 
  MultiverseWatcherArtwork 
} from './artworks/OriginalAndOverseerArtworks';

interface LoreTitanTransformationCutsceneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransformationComplete?: () => void;
  bossName?: string;
  isPreview?: boolean;
}

type CutsceneStep = 0 | 1 | 2;

export const LoreTitanTransformationCutsceneModal: React.FC<LoreTitanTransformationCutsceneModalProps> = ({
  isOpen,
  onClose,
  onTransformationComplete,
  isPreview = false
}) => {
  const [currentStep, setCurrentStep] = useState<CutsceneStep>(0);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [screenShake, setScreenShake] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Synthesized audio helper for intense cosmic and cinematic moments
  const playCosmicSFX = (type: 'dialogue' | 'thunder' | 'singularity' | 'ascension') => {
    if (isAudioMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      if (type === 'dialogue') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.1);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.11);
      } else if (type === 'thunder') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.6);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.65);
      } else if (type === 'singularity') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(60, now);
        osc.frequency.linearRampToValueAtTime(800, now + 1.2);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.45);
      } else if (type === 'ascension') {
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);
          gain.gain.setValueAtTime(0.25, now + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.12 + 0.5);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.55);
        });
      }
    } catch {
      // Ignore audio context errors if blocked
    }
  };

  // Dialogue steps definition
  const dialogueScripts = [
    {
      step: 0,
      speaker: 'TITAN DEFENDER',
      speakerRole: 'Ancient Sanctuary Colossus • Reaching Limit Break',
      unitId: 'titan_defender',
      color: '#38bdf8',
      side: 'left',
      line: 'you pushed my limits....... well its time',
      stageTitle: 'ACT I: THE LIMIT BREAK',
      caption: 'Having absorbed infinite cosmic pressure, the Titan Defender unlocks the dormant Singularity Core!'
    },
    {
      step: 1,
      speaker: 'COSMIC CHRONICLER',
      speakerRole: 'Dimensional Axis Voice',
      unitId: 'multiverse_watcher',
      color: '#c084fc',
      side: 'center',
      line: 'Space-time fractures across infinite dimensions! The Armored Titan awakens the Singularity Core, transcending into the MULTIVERSE WATCHER!',
      stageTitle: 'ACT II: THE MULTIVERSE ASCENSION',
      caption: 'The physical hull breaks away, revealing the 2nd Arcane Deity of absolute reality control!'
    },
    {
      step: 2,
      speaker: 'MULTIVERSE WATCHER',
      speakerRole: '2nd Arcane Tier God • Singularity Axis Sovereign',
      unitId: 'multiverse_watcher',
      color: '#a855f7',
      side: 'center',
      line: 'I TOLD YOU, IM YOUR DOOM',
      stageTitle: 'ACT III: THE ULTIMATE DECREE OF DOOM',
      caption: 'The Multiverse Watcher ascends to avenge his fallen brother and command the ultimate defense!'
    }
  ];

  const typingIntervalRef = useRef<any>(null);

  // Reset or start dialogue typing on step change
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setDisplayedText('');
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
      return;
    }

    const script = dialogueScripts[currentStep];
    if (!script) return;

    if (currentStep === 0) {
      setScreenShake(true);
      playCosmicSFX('thunder');
      setTimeout(() => setScreenShake(false), 500);
    } else if (currentStep === 1) {
      setScreenShake(true);
      playCosmicSFX('singularity');
      setTimeout(() => setScreenShake(false), 1200);
    } else if (currentStep === 2) {
      setScreenShake(true);
      playCosmicSFX('ascension');
      setTimeout(() => setScreenShake(false), 800);
    }

    // Clear previous interval if any
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    // Typewriter effect
    let charIndex = 0;
    setDisplayedText('');
    const fullText = script.line;
    typingIntervalRef.current = setInterval(() => {
      charIndex++;
      setDisplayedText(fullText.substring(0, charIndex));
      if (charIndex >= fullText.length) {
        if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
      }
    }, 24);

    return () => {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    };
  }, [currentStep, isOpen]);

  // Keyboard navigation (Space / Enter to proceed)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleNextStep();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep, displayedText]);

  // Background Cosmic Canvas Animation
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      pulse: number;
    }

    const particles: Particle[] = [];
    const colors = ['#38bdf8', '#818cf8', '#c084fc', '#a855f7', '#ffffff', '#00f0ff'];

    for (let i = 0; i < 180; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        size: Math.random() * 3.5 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.8 + 0.2,
        pulse: Math.random() * Math.PI * 2
      });
    }

    let frame = 0;
    const render = () => {
      frame++;
      ctx.fillStyle = 'rgba(5, 7, 18, 0.28)';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Draw Singularity Vortex in Steps 1 and 2
      if (currentStep >= 1) {
        const gradient = ctx.createRadialGradient(
          centerX,
          centerY,
          10,
          centerX,
          centerY,
          Math.min(width, height) * 0.5
        );
        gradient.addColorStop(0, 'rgba(192, 132, 252, 0.45)');
        gradient.addColorStop(0.3, 'rgba(56, 189, 248, 0.25)');
        gradient.addColorStop(0.7, 'rgba(129, 140, 248, 0.12)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, Math.min(width, height) * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Singularity event horizon lines
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(frame * 0.025);
        for (let i = 0; i < 16; i++) {
          const angle = (i * Math.PI * 2) / 16;
          ctx.strokeStyle = `hsla(${260 + i * 12}, 100%, 75%, 0.5)`;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(0, 0, 90 + Math.sin(frame * 0.05 + i) * 35, angle, angle + Math.PI / 2);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Draw and update particles with Singularity pull
      particles.forEach(p => {
        p.pulse += 0.05;
        const speedMultiplier = currentStep >= 1 ? 3.5 : 1.5;

        if (currentStep >= 1) {
          const dx = centerX - p.x;
          const dy = centerY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 15) {
            p.vx += (dx / dist) * 0.2;
            p.vy += (dy / dist) * 0.2;
          }
        }

        p.x += p.vx * speedMultiplier;
        p.y += p.vy * speedMultiplier;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.abs(Math.sin(p.pulse)) * p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1.0;
      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  const currentScript = dialogueScripts[currentStep];

  const handleNextStep = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    // If text hasn't finished typing, finish it immediately on click
    if (displayedText.length < currentScript.line.length) {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
      setDisplayedText(currentScript.line);
      return;
    }

    if (currentStep < 2) {
      setCurrentStep((prev) => (prev + 1) as CutsceneStep);
    } else {
      handleCompleteTransformation();
    }
  };

  const handleCompleteTransformation = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (onTransformationComplete) {
      onTransformationComplete();
    }
    gameAudio.playSFX('victory');
    onClose();
  };

  const isAscended = currentStep >= 1;

  return (
    <div 
      className={`fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-black/92 backdrop-blur-lg select-none overflow-hidden ${
        screenShake ? 'animate-bounce' : ''
      }`}
      onClick={(e) => handleNextStep(e)}
    >
      {/* Background Cosmic Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 pointer-events-none z-0"
      />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-5xl h-full max-h-[92vh] flex flex-col justify-between items-center text-white">
        {/* Top Header */}
        <div className="w-full flex items-center justify-between bg-slate-900/85 border border-purple-500/40 rounded-2xl p-3 sm:p-4 backdrop-blur-md shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-950/90 border border-purple-500/60 shadow-[0_0_20px_rgba(168,85,247,0.5)]">
              <Eye className="w-6 h-6 text-purple-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-mono font-bold tracking-widest text-indigo-300 uppercase">
                  ARCANE ASCENSION RITE • TITAN TRANSCENDENCE
                </span>
                <span className="px-2 py-0.5 rounded-full bg-purple-900/70 border border-purple-500/50 text-[9px] font-black text-purple-200">
                  ACT {currentStep + 1} / 3
                </span>
              </div>
              <h2 className="text-sm sm:text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-indigo-300">
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
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-white/10 text-slate-300 transition-all cursor-pointer"
              title={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isAudioMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            <button
              type="button"
              onClick={(e) => handleCompleteTransformation(e)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-300 text-xs font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.3)]"
            >
              <FastForward size={14} /> Skip Ascension
            </button>
          </div>
        </div>

        {/* Central Awakening Stage Visualizer */}
        <div className="relative w-full flex-1 flex items-center justify-center my-4 overflow-hidden">
          {/* Pulsing Singularity Aura */}
          <div 
            className={`absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full blur-3xl transition-all duration-1000 pointer-events-none ${
              isAscended 
                ? 'bg-purple-600/50 scale-150 animate-pulse' 
                : 'bg-cyan-500/30 scale-100'
            }`}
          />

          {/* Central Transcending Entity Box */}
          <motion.div 
            animate={
              isAscended 
                ? { scale: [1, 1.05, 1], y: [0, -10, 0] } 
                : { scale: [0.95, 1, 0.95], y: [0, -5, 0] }
            }
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="relative z-10 flex flex-col items-center"
          >
            {/* Crown / Singularity Eye Badge */}
            {isAscended && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-3 px-4 py-1 rounded-full bg-purple-900/90 border border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.8)] text-xs font-black uppercase tracking-widest text-purple-200 flex items-center gap-2 animate-bounce"
              >
                <Crown size={14} className="text-yellow-400" />
                <span>2ND ARCANE DEITY AWAKENED</span>
              </motion.div>
            )}

            {/* Model Artwork Box */}
            <div className={`relative w-56 h-56 sm:w-80 sm:h-80 rounded-3xl bg-slate-950/90 border-4 flex items-center justify-center p-4 backdrop-blur-xl transition-all duration-700 ${
              isAscended 
                ? 'border-purple-500 shadow-[0_0_50px_rgba(168,85,247,0.7)]' 
                : 'border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.4)]'
            }`}>
              <AnimatePresence mode="wait">
                {isAscended ? (
                  <motion.div
                    key="multiverse-art"
                    initial={{ opacity: 0, scale: 0.6, rotate: 10 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: 'spring', stiffness: 120, damping: 15 }}
                    className="w-full h-full"
                  >
                    <MultiverseWatcherArtwork size="xl" className="w-full h-full" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="titan-art"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.2 }}
                    className="w-full h-full"
                  >
                    <TitanDefenderArtwork size="xl" className="w-full h-full" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Subtitle Nameplate */}
            <div className="mt-4 text-center">
              <h3 className="text-base sm:text-xl font-black tracking-wider" style={{ color: currentScript.color }}>
                {isAscended ? 'MULTIVERSE WATCHER' : 'TITAN DEFENDER'}
              </h3>
              <p className="text-[10px] sm:text-xs font-mono text-slate-400">
                {isAscended ? 'Form 3: Singularity Core Reality Singularity' : 'Form 1: Sanctuary Colossus'}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Bottom Dialogue Box */}
        <div className="w-full bg-slate-900/95 border-2 rounded-2xl p-4 sm:p-5 backdrop-blur-lg shadow-2xl relative overflow-hidden" style={{ borderColor: currentScript.color + '99' }}>
          <div 
            className="absolute top-0 inset-x-0 h-1 transition-colors duration-500" 
            style={{ backgroundColor: currentScript.color }}
          />

          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span 
                className="px-3 py-1 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-950 shadow-md"
                style={{ backgroundColor: currentScript.color }}
              >
                {currentScript.speaker}
              </span>
              <span className="text-[9px] sm:text-xs font-mono text-slate-400">
                {currentScript.speakerRole}
              </span>
            </div>

            <span className="text-[9px] font-mono text-slate-400">
              Click anywhere / Press [SPACE] to advance
            </span>
          </div>

          {/* Dialogue Text Typewriter */}
          <div className="min-h-[52px] sm:min-h-[64px] flex items-center">
            <p className="text-sm sm:text-lg font-black tracking-wide text-white leading-relaxed">
              {displayedText}
              <span className="inline-block w-2 h-4 ml-1 bg-purple-400 animate-pulse" />
            </p>
          </div>

          {/* Progression Footer */}
          <div className="mt-3 pt-2 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[10px] text-purple-300 italic">
              <Sparkles size={12} className="text-purple-400 shrink-0" />
              <span>{currentScript.caption}</span>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {currentStep === 2 ? (
                <button
                  type="button"
                  onClick={(e) => handleCompleteTransformation(e)}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-black text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-[0_0_25px_rgba(168,85,247,0.7)] flex items-center gap-2 animate-pulse"
                >
                  <Crown size={14} className="text-yellow-300" />
                  <span>ASCEND & COMMAND MULTIVERSE WATCHER</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => handleNextStep(e)}
                  className="px-4 py-1.5 rounded-xl bg-purple-950 hover:bg-purple-900 text-purple-200 font-bold text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer border border-purple-500/40 flex items-center gap-1"
                >
                  <span>Next Act</span>
                  <Play size={12} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
