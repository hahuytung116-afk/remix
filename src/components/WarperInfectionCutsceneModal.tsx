import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Skull, 
  Volume2, 
  VolumeX, 
  FastForward,
  Play,
  Flame,
  Tv,
  AlertTriangle,
  Zap,
  Radio,
  Sparkles
} from 'lucide-react';
import { gameAudio } from '../utils/audio';
import { UnitArtwork } from './artworks/UnitArtwork';
import { 
  TitanDefenderArtwork, 
  InfectedWarperArtwork, 
  ArcaneWarperArtwork 
} from './artworks/OriginalAndOverseerArtworks';
import { KaijuArtwork } from './artworks/SecretArtworks';

interface WarperInfectionCutsceneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  isPreview?: boolean;
}

type CutsceneStep = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const WarperInfectionCutsceneModal: React.FC<WarperInfectionCutsceneModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  isPreview = false
}) => {
  const [currentStep, setCurrentStep] = useState<CutsceneStep>(0);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [screenShake, setScreenShake] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Synthesized audio helper for dramatic cutscene effects
  const playCutsceneSFX = (type: 'dialogue' | 'thunder' | 'electric' | 'laser' | 'shield' | 'tv_teleport') => {
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
        osc.frequency.setValueAtTime(130, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.6);
        gain.gain.setValueAtTime(0.45, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.65);
      } else if (type === 'electric') {
        for (let i = 0; i < 5; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(450 + Math.random() * 850, now + i * 0.07);
          gain.gain.setValueAtTime(0.25, now + i * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.07 + 0.06);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.07);
          osc.stop(now + i * 0.07 + 0.07);
        }
      } else if (type === 'laser') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.45);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.52);
      } else if (type === 'shield') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.42);
      } else if (type === 'tv_teleport') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(1200, now + 0.6);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.65);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.7);
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
      speakerRole: 'Ancient Colossus & Sanctuary Vanguard',
      unitId: 'titan_defender',
      color: '#38bdf8',
      side: 'left',
      line: 'NOOO, MY BROTHER',
      stageTitle: 'ACT I: THE VOID INFECTION',
      caption: 'The Arcane Warper is being engulfed by dark void corruption right in front of Titan!'
    },
    {
      step: 1,
      speaker: 'ENEMIES',
      speakerRole: 'Syndicate Invasion Vanguard',
      unitId: 'kaiju',
      color: '#ef4444',
      side: 'right',
      line: 'GET OUT',
      stageTitle: 'ACT II: THE SYNDICATE AMBUSH',
      caption: 'The Syndicate enemy vanguard launches an overwhelming shock ambush!'
    },
    {
      step: 2,
      speaker: 'TITAN DEFENDER',
      speakerRole: 'Critical Damage • Armor Fractured',
      unitId: 'titan_defender',
      color: '#f97316',
      side: 'left',
      line: '*gets injured*',
      stageTitle: 'ACT III: CRITICAL SYSTEM DAMAGE',
      caption: 'Electric sparks and blazing fire erupt across the Titan Defender frame!'
    },
    {
      step: 3,
      speaker: 'ARCANE WARPER',
      speakerRole: '1st Arcane Deity • Resisting Neural Hijack',
      unitId: 'arcane_warper',
      color: '#c084fc',
      side: 'right',
      line: 'I WILL... COMEBAC-',
      stageTitle: 'ACT IV: THE DESPERATE RESISTANCE',
      caption: 'The Warper strains against the dark tentacles of the quantum virus...'
    },
    {
      step: 4,
      speaker: 'INFECTED WARPER',
      speakerRole: 'Corrupted Quantum Core • Neural Override Complete',
      unitId: 'infected_warper',
      color: '#f43f5e',
      side: 'right',
      line: 'IM SORRY, I CANT-',
      stageTitle: 'ACT V: COMPLETE INFECTION OVERRIDE',
      caption: 'The infection takes full control! The Warper turns into the Infected Warper on the enemy side!'
    },
    {
      step: 5,
      speaker: 'INFECTED WARPER',
      speakerRole: 'Corrupted Lasers Firing Automatically',
      unitId: 'infected_warper',
      color: '#f43f5e',
      side: 'right',
      line: '*shoots continuous corrupted quantum lasers at Titan*',
      stageTitle: 'ACT VI: THE LETHAL LASER BARRAGE',
      caption: 'The Infected Warper fires deadly high-intensity laser blasts into Titan!'
    },
    {
      step: 6,
      speaker: 'TITAN DEFENDER',
      speakerRole: 'Upgraded Hardlight Energy Shield Deployed',
      unitId: 'titan_defender',
      color: '#00f0ff',
      side: 'left',
      line: '*pulls out energy shield to block the lasers*',
      stageTitle: 'ACT VII: TITAN DEFENSIVE MATRIX',
      caption: 'Titan deploys his massive holographic Energy Shield to block and deflect the incoming laser fire!'
    },
    {
      step: 7,
      speaker: 'TITAN DEFENDER',
      speakerRole: 'TV Screen Relocation Array Engaged',
      unitId: 'titan_defender',
      color: '#818cf8',
      side: 'left',
      line: '*activates TV upgrade screens and teleports away*',
      stageTitle: 'ACT VIII: TV UPGRADE EMERGENCY TELEPORT',
      caption: 'Titan teleports away with his TV Upgrade to repair and re-arm! (Warper remains trapped fighting on the enemy side until Wave 399 - NOT UNLOCKED YET!)'
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
      playCutsceneSFX('thunder');
      setTimeout(() => setScreenShake(false), 400);
    } else if (currentStep === 1) {
      setScreenShake(true);
      playCutsceneSFX('thunder');
      setTimeout(() => setScreenShake(false), 500);
    } else if (currentStep === 2) {
      setScreenShake(true);
      playCutsceneSFX('electric');
      setTimeout(() => setScreenShake(false), 700);
    } else if (currentStep === 4) {
      setScreenShake(true);
      playCutsceneSFX('thunder');
      setTimeout(() => setScreenShake(false), 500);
    } else if (currentStep === 5) {
      setScreenShake(true);
      playCutsceneSFX('laser');
      setTimeout(() => setScreenShake(false), 600);
    } else if (currentStep === 6) {
      setScreenShake(true);
      playCutsceneSFX('shield');
      setTimeout(() => setScreenShake(false), 400);
    } else if (currentStep === 7) {
      playCutsceneSFX('tv_teleport');
    } else {
      playCutsceneSFX('dialogue');
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
    }, 22);

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

  // Background Canvas Animation (Sparks, Dark Corruption Clouds, Laser Particles)
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
    const colors = ['#38bdf8', '#ef4444', '#f97316', '#f43f5e', '#818cf8', '#eab308'];

    for (let i = 0; i < 140; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        size: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.8 + 0.2,
        pulse: Math.random() * Math.PI * 2
      });
    }

    let frame = 0;
    const render = () => {
      frame++;
      ctx.fillStyle = 'rgba(7, 10, 20, 0.32)';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Dark Corruption Mist in Center
      if (currentStep <= 4) {
        const corruptionGrad = ctx.createRadialGradient(
          centerX + 150,
          centerY,
          20,
          centerX + 150,
          centerY,
          Math.min(width, height) * 0.45
        );
        corruptionGrad.addColorStop(0, 'rgba(244, 63, 94, 0.28)');
        corruptionGrad.addColorStop(0.5, 'rgba(147, 51, 234, 0.15)');
        corruptionGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = corruptionGrad;
        ctx.beginPath();
        ctx.arc(centerX + 150, centerY, Math.min(width, height) * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw and update particles
      particles.forEach(p => {
        p.pulse += 0.05;
        p.x += p.vx;
        p.y += p.vy;

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

    if (currentStep < 7) {
      setCurrentStep((prev) => (prev + 1) as CutsceneStep);
    } else {
      handleCompleteCutscene();
    }
  };

  const handleCompleteCutscene = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (onComplete) {
      onComplete();
    }
    gameAudio.playSFX('victory');
    onClose();
  };

  // State checks for animation visual cues
  const isTitanInjured = currentStep === 2 || currentStep === 5;
  const isWarperShootingLaser = currentStep === 5;
  const isTitanShieldActive = currentStep === 6;
  const isTitanTeleporting = currentStep === 7;

  return (
    <div 
      className={`fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md select-none overflow-hidden ${
        screenShake ? 'animate-bounce' : ''
      }`}
      onClick={(e) => handleNextStep(e)}
    >
      {/* Background Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 pointer-events-none z-0"
      />

      {/* Screen Glitch overlay during TV teleport or corruption */}
      {(isTitanTeleporting || currentStep === 0 || currentStep === 4) && (
        <div className="absolute inset-0 z-10 pointer-events-none bg-indigo-500/10 mix-blend-screen opacity-40 animate-pulse">
          <div className="w-full h-full bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.5)_3px,rgba(0,0,0,0.5)_4px)]" />
        </div>
      )}

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-5xl h-full max-h-[92vh] flex flex-col justify-between items-center text-white">
        {/* Top Banner & Control Header */}
        <div className="w-full flex items-center justify-between bg-slate-900/80 border border-purple-500/30 rounded-2xl p-3 sm:p-4 backdrop-blur-md shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              <Sparkles className="w-6 h-6 text-purple-400 animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-mono font-bold tracking-widest text-purple-400 uppercase">
                  LORE CHRONICLE • WAVE 200 CLIMAX
                </span>
                <span className="px-2 py-0.5 rounded-full bg-purple-900/60 border border-purple-500/40 text-[9px] font-black text-purple-300">
                  ACT {currentStep + 1} / 8
                </span>
              </div>
              <h2 className="text-sm sm:text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-purple-300 to-cyan-400">
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
              onClick={(e) => handleCompleteCutscene(e)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-300 text-xs font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.3)]"
            >
              <FastForward size={14} /> Skip Cutscene
            </button>
          </div>
        </div>

        {/* Central Stage Visualizer */}
        <div className="relative w-full flex-1 flex items-center justify-between px-4 sm:px-12 my-2 overflow-hidden">
          {/* Left Entity: TITAN DEFENDER */}
          <div className="relative flex flex-col items-center">
            {/* Titan Glowing Aura */}
            <div 
              className={`absolute -inset-8 rounded-full blur-2xl transition-all duration-700 pointer-events-none ${
                isTitanTeleporting
                  ? 'bg-indigo-500/50 scale-150 animate-ping'
                  : isTitanInjured
                    ? 'bg-orange-500/40 scale-110'
                    : isTitanShieldActive
                      ? 'bg-cyan-500/40 scale-125'
                      : 'bg-cyan-500/20'
              }`}
            />

            {/* Shield Deflection Barrier Overlay (Step 6) */}
            <AnimatePresence>
              {isTitanShieldActive && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1.15 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute -right-8 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center pointer-events-none"
                >
                  <div className="relative w-28 h-48 sm:w-36 sm:h-64 rounded-2xl bg-cyan-500/20 border-4 border-cyan-400 shadow-[0_0_40px_rgba(6,182,212,0.8)] backdrop-blur-md flex flex-col items-center justify-center overflow-hidden">
                    <Shield className="w-16 h-16 text-cyan-300 animate-pulse" />
                    <div className="text-[10px] font-black uppercase tracking-widest text-cyan-200 mt-2">
                      HARDLIGHT SHIELD
                    </div>
                    {/* Deflection Shock Waves */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.6)_10%,transparent_70%)] animate-ping" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Electric Sparks & Fire Damage Overlay (Step 2 & 5) */}
            <AnimatePresence>
              {isTitanInjured && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute -inset-6 z-20 pointer-events-none flex flex-col items-center justify-center"
                >
                  {/* Blazing Flame particles */}
                  <div className="absolute -top-4 left-4 flex gap-1 animate-bounce">
                    <Flame className="w-8 h-8 text-orange-500 fill-orange-500 animate-pulse" />
                    <Flame className="w-6 h-6 text-red-500 fill-red-500" />
                  </div>
                  <div className="absolute bottom-2 right-4 flex gap-1 animate-bounce">
                    <Flame className="w-7 h-7 text-yellow-500 fill-yellow-500" />
                  </div>

                  {/* Electric Shock Arcs */}
                  <div className="absolute inset-0 border-2 border-dashed border-yellow-400/80 rounded-3xl animate-pulse" />
                  <div className="absolute -inset-2 flex items-center justify-between text-yellow-300">
                    <Zap className="w-6 h-6 animate-spin text-yellow-300 drop-shadow-[0_0_10px_yellow]" />
                    <Zap className="w-8 h-8 animate-ping text-cyan-300 drop-shadow-[0_0_10px_cyan]" />
                  </div>

                  <div className="px-3 py-1 bg-red-600/90 text-white font-black text-[10px] uppercase tracking-widest rounded-full border border-white/40 shadow-lg animate-pulse mt-40">
                    ⚠️ CRITICAL DAMAGE ⚠️
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* TV Screen Array Teleportation VFX (Step 7) */}
            <AnimatePresence>
              {isTitanTeleporting && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1.2 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-30 pointer-events-none flex flex-col items-center justify-center bg-indigo-950/80 backdrop-blur-sm rounded-3xl border-2 border-indigo-400 shadow-[0_0_50px_rgba(99,102,241,0.9)]"
                >
                  <Tv className="w-16 h-16 text-indigo-300 animate-bounce" />
                  <div className="text-[11px] font-black uppercase tracking-widest text-indigo-200 mt-2 animate-pulse">
                    TV SCREEN RELOCATION ENGAGED
                  </div>
                  <div className="text-[9px] font-mono text-cyan-300">
                    DISSOLVING INTO QUANTUM CRT MATRIX...
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Titan Model Container */}
            <motion.div 
              animate={
                isTitanTeleporting 
                  ? { scale: [1, 1.2, 0], opacity: [1, 0.8, 0], rotate: [0, 5, -10] }
                  : isTitanInjured 
                    ? { x: [-6, 6, -4, 4, 0], y: [2, -2, 1, -1, 0] }
                    : { y: [0, -6, 0] }
              }
              transition={{ 
                duration: isTitanTeleporting ? 1.4 : isTitanInjured ? 0.2 : 3,
                repeat: isTitanInjured ? Infinity : isTitanTeleporting ? 0 : Infinity,
                ease: 'easeInOut' 
              }}
              className="relative w-44 h-44 sm:w-60 sm:h-60 rounded-3xl bg-slate-950/90 border-2 border-cyan-500/40 flex items-center justify-center p-3 shadow-[0_0_30px_rgba(6,182,212,0.3)] backdrop-blur-md"
            >
              <TitanDefenderArtwork size="xl" className="w-full h-full" />
            </motion.div>

            {/* Name Plate */}
            <div className="mt-3 text-center">
              <div className="text-xs sm:text-sm font-black text-cyan-300 tracking-wider">
                TITAN DEFENDER
              </div>
              <div className="text-[9px] sm:text-[10px] font-mono text-slate-400">
                Ancient Sanctuary Colossus
              </div>
            </div>
          </div>

          {/* Central Laser Beam / Energy Clash */}
          <div className="flex-1 flex flex-col items-center justify-center px-2">
            {/* Hostile Laser Beam during Step 5 */}
            {isWarperShootingLaser && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                className="w-full h-4 sm:h-6 bg-gradient-to-r from-rose-500 via-purple-500 to-red-600 rounded-full shadow-[0_0_30px_rgba(244,63,94,0.9)] relative overflow-hidden flex items-center"
              >
                <div className="w-full h-1 bg-white animate-pulse" />
                <div className="absolute right-0 w-8 h-8 rounded-full bg-red-400 animate-ping" />
              </motion.div>
            )}

            {/* Shield Deflection Sparks during Step 6 */}
            {isTitanShieldActive && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <div className="h-4 w-24 bg-gradient-to-l from-rose-500 to-transparent rounded-full" />
                <div className="p-2 rounded-full bg-cyan-400 shadow-[0_0_25px_cyan] animate-ping">
                  <Zap className="w-4 h-4 text-white" />
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Entity: ARCANE WARPER / INFECTED WARPER / ENEMIES */}
          <div className="relative flex flex-col items-center">
            {/* Dark Void Tentacle Aura */}
            <div 
              className={`absolute -inset-8 rounded-full blur-2xl transition-all duration-700 pointer-events-none ${
                currentStep >= 4
                  ? 'bg-rose-600/40 scale-125'
                  : currentStep === 3
                    ? 'bg-purple-600/30 scale-110'
                    : 'bg-red-600/20'
              }`}
            />

            {/* Neural Corruption Glitch / Tendrils */}
            {currentStep <= 4 && (
              <div className="absolute -inset-4 border-2 border-purple-500/40 rounded-3xl animate-pulse pointer-events-none flex items-center justify-center">
                <div className="text-[9px] font-mono font-bold text-rose-300 bg-black/80 px-2 py-0.5 rounded-full border border-rose-500/50">
                  {currentStep === 4 ? '⚠️ CORRUPTION COMPLETE' : '⚡ VOID INFECTION SPREADING'}
                </div>
              </div>
            )}

            {/* Warper Model Container */}
            <motion.div 
              animate={
                currentStep === 3
                  ? { x: [-3, 3, -3], rotate: [-2, 2, -2] }
                  : { y: [0, -6, 0] }
              }
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className={`relative w-44 h-44 sm:w-60 sm:h-60 rounded-3xl bg-slate-950/90 border-2 flex items-center justify-center p-3 backdrop-blur-md ${
                currentStep >= 4 
                  ? 'border-rose-500/60 shadow-[0_0_30px_rgba(244,63,94,0.4)]'
                  : currentStep === 1
                    ? 'border-red-500/60 shadow-[0_0_30px_rgba(239,68,68,0.4)]'
                    : 'border-purple-500/40 shadow-[0_0_30px_rgba(168,85,247,0.3)]'
              }`}
            >
              {currentStep === 1 ? (
                <KaijuArtwork size="xl" className="w-full h-full" />
              ) : currentStep >= 4 ? (
                <InfectedWarperArtwork size="xl" className="w-full h-full" />
              ) : (
                <ArcaneWarperArtwork size="xl" className="w-full h-full" />
              )}
            </motion.div>

            {/* Name Plate */}
            <div className="mt-3 text-center">
              <div className="text-xs sm:text-sm font-black tracking-wider" style={{ color: currentScript.color }}>
                {currentStep === 1 
                  ? 'SYNDICATE VANGUARD' 
                  : currentStep >= 4 
                    ? 'INFECTED WARPER (ENEMY)' 
                    : 'ARCANE WARPER (BROTHER)'}
              </div>
              <div className="text-[9px] sm:text-[10px] font-mono text-slate-400">
                {currentStep === 1 
                  ? 'Hunter Armada Overlord' 
                  : currentStep >= 4 
                    ? 'Corrupted 1st Arcane Deity' 
                    : '1st Arcane Tier God'}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Dialogue Box & Tactical Summary */}
        <div className="w-full bg-slate-900/90 border-2 rounded-2xl p-4 sm:p-5 backdrop-blur-lg shadow-2xl relative overflow-hidden" style={{ borderColor: currentScript.color + '88' }}>
          {/* Top glow line */}
          <div 
            className="absolute top-0 inset-x-0 h-1 transition-colors duration-500" 
            style={{ backgroundColor: currentScript.color }}
          />

          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span 
                className="px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-950 shadow-md"
                style={{ backgroundColor: currentScript.color }}
              >
                {currentScript.speaker}
              </span>
              <span className="text-[9px] sm:text-xs font-mono text-slate-400">
                {currentScript.speakerRole}
              </span>
            </div>

            <span className="text-[9px] font-mono text-slate-400">
              Click anywhere / Press [SPACE] to proceed
            </span>
          </div>

          {/* Dialogue Text Typewriter */}
          <div className="min-h-[52px] sm:min-h-[64px] flex items-center">
            <p className="text-sm sm:text-lg font-black tracking-wide text-white leading-relaxed">
              {displayedText}
              <span className="inline-block w-2 h-4 ml-1 bg-cyan-400 animate-pulse" />
            </p>
          </div>

          {/* Tactical Context Caption & Progression Footer */}
          <div className="mt-3 pt-2 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[10px] text-slate-300 italic">
              <AlertTriangle size={12} className="text-amber-400 shrink-0" />
              <span>{currentScript.caption}</span>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {currentStep === 7 ? (
                <button
                  type="button"
                  onClick={(e) => handleCompleteCutscene(e)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-black text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-[0_0_20px_rgba(168,85,247,0.5)] flex items-center gap-1.5 animate-pulse"
                >
                  <span>TELEPORT BACK TO BASE ➔</span>
                  <FastForward size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => handleNextStep(e)}
                  className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer border border-white/10 flex items-center gap-1"
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
