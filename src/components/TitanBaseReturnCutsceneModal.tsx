import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Wrench, 
  Volume2, 
  VolumeX, 
  FastForward, 
  Play, 
  Flame, 
  Zap, 
  Radio, 
  Sparkles, 
  AlertTriangle,
  HeartCrack,
  Cpu,
  Tv,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { gameAudio } from '../utils/audio';
import { TitanDefenderArtwork } from './artworks/OriginalAndOverseerArtworks';
import { ScientistAnimalsArtwork } from './artworks/ScientistArtwork';

interface TitanBaseReturnCutsceneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  isPreview?: boolean;
}

type CutsceneStep = 0 | 1 | 2 | 3 | 4;

export const TitanBaseReturnCutsceneModal: React.FC<TitanBaseReturnCutsceneModalProps> = ({
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
  const typingIntervalRef = useRef<any>(null);

  // Synthesized audio helper for lab ambience, alarms, and repair hum
  const playCutsceneSFX = (type: 'teleport_impact' | 'alarm' | 'scan' | 'sad_beep' | 'upgrade_hum' | 'dialogue') => {
    if (isAudioMuted || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      if (type === 'teleport_impact') {
        // Heavy teleport landing with metallic crash
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.5);
        gain.gain.setValueAtTime(0.45, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.62);

        // Sub bass thump
        const subOsc = ctx.createOscillator();
        const subGain = ctx.createGain();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(140, now);
        subOsc.frequency.exponentialRampToValueAtTime(30, now + 0.4);
        subGain.gain.setValueAtTime(0.5, now);
        subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
        subOsc.connect(subGain);
        subGain.connect(ctx.destination);
        subOsc.start(now);
        subOsc.stop(now + 0.48);
      } else if (type === 'alarm') {
        // Red alert alternating warble
        for (let i = 0; i < 3; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(880, now + i * 0.15);
          osc.frequency.linearRampToValueAtTime(660, now + i * 0.15 + 0.12);
          gain.gain.setValueAtTime(0.25, now + i * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.14);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.15);
          osc.stop(now + i * 0.15 + 0.14);
        }
      } else if (type === 'scan') {
        // High-tech holographic scanning chirps
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.linearRampToValueAtTime(1400, now + 0.35);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.42);
      } else if (type === 'sad_beep') {
        // Somber, descending low tone for Titan's sorrow
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(330, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.6);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.65);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.68);
      } else if (type === 'upgrade_hum') {
        // Ascending harmonic chords representing repair & upgrade initialization
        [330, 440, 550, 660].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          osc.frequency.linearRampToValueAtTime(freq * 1.5, now + idx * 0.08 + 0.4);
          gain.gain.setValueAtTime(0.2, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.45);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.48);
        });
      } else if (type === 'dialogue') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.08);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
      }
    } catch {
      // Ignore audio context autoplay errors
    }
  };

  // Dialogue steps definition matching exact user requirements:
  // TITAN: "TELEPORT BACK TO BASE"
  // SCIENTIST ANIMALS: "WHAT HAVE YOU DONE"
  // SCIENTIST ANIMALS: " HES GONE NOW AND UR INJURED"
  // TITAN: "SORRY"
  // SCIENTIST ANIMALS: "TIME FOR REPAIR AND UPGRADE...."
  const dialogueScripts = [
    {
      step: 0,
      speaker: 'TITAN DEFENDER',
      speakerRole: 'Critically Injured Colossus • Emerging from Quantum Relocation',
      side: 'left',
      color: '#38bdf8',
      line: 'TELEPORT BACK TO BASE',
      stageTitle: 'ACT I: EMERGENCY RECALL TO BASE',
      caption: 'Having taken critical damage defending against the infected Warper, Titan materializes inside Sanctuary Command!'
    },
    {
      step: 1,
      speaker: 'SCIENTIST ANIMALS',
      speakerRole: 'Chief Animal Cyber-Biologists & Engineering Squad',
      side: 'right',
      color: '#06b6d4',
      line: 'WHAT HAVE YOU DONE',
      stageTitle: 'ACT II: ALARM IN THE SANCTUARY LAB',
      caption: 'The Scientist Animals rush to the quarantine repair pad in shock as warning sirens blare across the facility!'
    },
    {
      step: 2,
      speaker: 'SCIENTIST ANIMALS',
      speakerRole: 'Diagnostic Telemetry Overload • Quantum Core at 3%',
      side: 'right',
      color: '#06b6d4',
      line: 'HES GONE NOW AND UR INJURED',
      stageTitle: 'ACT III: THE TRAGIC DIAGNOSIS',
      caption: 'Bio-scanners confirm Arcane Warper has been completely corrupted by the Syndicate, while Titan is barely functioning!'
    },
    {
      step: 3,
      speaker: 'TITAN DEFENDER',
      speakerRole: 'Optics Dimming • Overwhelmed by Remorse',
      side: 'left',
      color: '#f97316',
      line: 'SORRY',
      stageTitle: "ACT IV: A WARRIOR'S GRIEF",
      caption: 'Titan bows his armored head with cracked visors, mourning his inability to save his Arcane brother...'
    },
    {
      step: 4,
      speaker: 'SCIENTIST ANIMALS',
      speakerRole: 'Initiating Quantum Nanite Reconstruction & TV Protocols',
      side: 'right',
      color: '#a855f7',
      line: 'TIME FOR REPAIR AND UPGRADE....',
      stageTitle: 'ACT V: REPAIR & MULTIVERSE UPGRADE',
      caption: 'The animal scientists activate the heavy repair gantries and forge the blueprint for Titan’s ultimate TV Multiverse transcendence!'
    }
  ];

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
      playCutsceneSFX('teleport_impact');
      setTimeout(() => setScreenShake(false), 500);
    } else if (currentStep === 1) {
      setScreenShake(true);
      playCutsceneSFX('alarm');
      setTimeout(() => setScreenShake(false), 400);
    } else if (currentStep === 2) {
      playCutsceneSFX('scan');
    } else if (currentStep === 3) {
      playCutsceneSFX('sad_beep');
    } else if (currentStep === 4) {
      playCutsceneSFX('upgrade_hum');
    } else {
      playCutsceneSFX('dialogue');
    }

    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    let charIndex = 0;
    setDisplayedText('');
    const fullText = script.line;
    typingIntervalRef.current = setInterval(() => {
      charIndex++;
      setDisplayedText(fullText.substring(0, charIndex));
      if (charIndex >= fullText.length) {
        if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
      }
    }, 28);

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

  // Background Canvas: Laboratory Holo-Matrix, Nanites, and Smoke
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
    const colors = ['#06b6d4', '#38bdf8', '#a855f7', '#f59e0b', '#ef4444', '#10b981'];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: -Math.random() * 1.2 - 0.2, // Drifting upward like repair smoke / nanites
        size: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.6 + 0.2,
        pulse: Math.random() * Math.PI
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Tech Grid Lines
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.07)';
      ctx.lineWidth = 1;
      const gridSize = 50;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Repair Pad Circle on the floor
      const centerX = width * 0.3;
      const centerY = height * 0.65;
      const padGrad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, 200);
      padGrad.addColorStop(0, 'rgba(56, 189, 248, 0.22)');
      padGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.08)');
      padGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = padGrad;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, 220, 70, 0, 0, Math.PI * 2);
      ctx.fill();

      // Lab Workstation Glow on the right
      const labX = width * 0.75;
      const labY = height * 0.55;
      const labGrad = ctx.createRadialGradient(labX, labY, 20, labX, labY, 220);
      labGrad.addColorStop(0, 'rgba(168, 85, 247, 0.2)');
      labGrad.addColorStop(0.6, 'rgba(6, 182, 212, 0.06)');
      labGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = labGrad;
      ctx.beginPath();
      ctx.arc(labX, labY, 220, 0, Math.PI * 2);
      ctx.fill();

      // Update and draw floating particles
      particles.forEach(p => {
        p.pulse += 0.04;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;

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
  }, [isOpen]);

  if (!isOpen) return null;

  const currentScript = dialogueScripts[currentStep];

  const handleNextStep = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    // If text hasn't finished typing, complete it immediately
    if (displayedText.length < currentScript.line.length) {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
      setDisplayedText(currentScript.line);
      return;
    }

    if (currentStep < 4) {
      setCurrentStep(prev => (prev + 1) as CutsceneStep);
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

  const isTitanInjured = currentStep <= 3;
  const isRepairing = currentStep === 4;

  return (
    <div 
      className={`fixed inset-0 z-[125] flex items-center justify-center p-3 sm:p-6 bg-black/92 backdrop-blur-md select-none overflow-hidden ${
        screenShake ? 'animate-bounce' : ''
      }`}
      onClick={(e) => handleNextStep(e)}
    >
      {/* Background Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 pointer-events-none z-0" 
      />

      {/* Red Alert Strobe Overlay during Step 1 & 2 */}
      {(currentStep === 1 || currentStep === 2) && (
        <div className="absolute inset-0 z-10 pointer-events-none bg-red-600/10 mix-blend-screen opacity-50 animate-pulse">
          <div className="w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(239,68,68,0.1)_10px,rgba(239,68,68,0.1)_20px)]" />
        </div>
      )}

      {/* Quantum Nanite / Blue Grid Overlay during Step 4 Repair */}
      {isRepairing && (
        <div className="absolute inset-0 z-10 pointer-events-none bg-purple-600/10 mix-blend-screen opacity-60 animate-pulse">
          <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.25)_0%,transparent_70%)]" />
        </div>
      )}

      {/* Main Container */}
      <div className="relative z-20 w-full max-w-5xl h-full max-h-[92vh] flex flex-col justify-between items-center text-white">
        {/* Top Banner & Control Header */}
        <div className="w-full flex items-center justify-between bg-slate-900/85 border border-cyan-500/30 rounded-2xl p-3 sm:p-4 backdrop-blur-md shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <Wrench className="w-6 h-6 text-cyan-300 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] sm:text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
                  LORE CHRONICLE • POST-INFECTION REPAIR BAY
                </span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-900/60 border border-cyan-500/40 text-[9px] font-black text-cyan-300">
                  ACT {currentStep + 1} / 5
                </span>
              </div>
              <h2 className="text-sm sm:text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-amber-200 to-purple-400">
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
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              <FastForward size={14} /> Skip Cutscene
            </button>
          </div>
        </div>

        {/* Central Stage Visualizer */}
        <div className="relative w-full flex-1 flex items-center justify-between px-3 sm:px-10 my-2 overflow-hidden">
          {/* Left Entity: TITAN DEFENDER (Smoked, Fractured, Teleporting in) */}
          <div className="relative flex flex-col items-center">
            {/* Ambient Aura */}
            <div 
              className={`absolute -inset-8 rounded-full blur-2xl transition-all duration-700 pointer-events-none ${
                currentStep === 0
                  ? 'bg-cyan-400/40 scale-125 animate-ping'
                  : isRepairing
                    ? 'bg-purple-500/40 scale-125 animate-pulse'
                    : 'bg-orange-500/30 scale-110'
              }`}
            />

            {/* Critical Damage Overlays for Titan */}
            <AnimatePresence>
              {isTitanInjured && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute -inset-4 z-20 pointer-events-none flex flex-col items-center justify-center"
                >
                  {/* Smoke & Fire Eruption */}
                  <div className="absolute -top-6 left-2 flex gap-1 animate-bounce">
                    <Flame className="w-7 h-7 text-orange-500 fill-orange-500 animate-pulse" />
                    <Flame className="w-5 h-5 text-red-500 fill-red-500" />
                  </div>
                  <div className="absolute bottom-3 right-2 flex gap-1 animate-bounce">
                    <Flame className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                  </div>

                  {/* High Voltage Fault Sparks */}
                  <div className="absolute inset-0 border-2 border-dashed border-red-500/60 rounded-3xl animate-pulse" />
                  <div className="absolute -inset-2 flex items-center justify-between text-yellow-300">
                    <Zap className="w-6 h-6 animate-ping text-yellow-300" />
                    <Zap className="w-6 h-6 animate-spin text-cyan-300" />
                  </div>

                  {/* Warning Status Badge */}
                  <div className="px-3 py-1 bg-red-600/90 text-white font-black text-[9px] uppercase tracking-widest rounded-full border border-white/40 shadow-lg animate-pulse mt-44">
                    ⚠️ QUANTUM CORE: 3% • HULL BREACHED ⚠️
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Repair Gantry Nanite Laser Beams during Step 4 */}
            <AnimatePresence>
              {isRepairing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute -inset-8 z-30 pointer-events-none flex flex-col items-center justify-center"
                >
                  <div className="absolute inset-0 border-2 border-cyan-400/80 rounded-3xl animate-pulse shadow-[0_0_30px_rgba(6,182,212,0.8)]" />
                  <div className="p-3 rounded-2xl bg-purple-950/80 border border-purple-400 text-center shadow-xl">
                    <div className="flex items-center justify-center gap-1 text-purple-300 text-xs font-black uppercase">
                      <Tv size={14} className="animate-bounce" />
                      <span>NANITE FORGE ENGAGED</span>
                    </div>
                    <div className="text-[9px] font-mono text-cyan-300 mt-0.5">
                      INITIALIZING MULTIVERSE REPAIR ARRAY...
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Titan Model Container */}
            <motion.div 
              animate={
                currentStep === 0
                  ? { scale: [0.6, 1.15, 1], opacity: [0, 1, 1], y: [-30, 10, 0] }
                  : currentStep === 3
                    ? { y: [0, 8, 4], rotate: [0, -3, -1] }
                    : isTitanInjured
                      ? { x: [-3, 3, -2, 2, 0], y: [1, -1, 0] }
                      : { y: [0, -6, 0] }
              }
              transition={{ 
                duration: currentStep === 0 ? 0.7 : currentStep === 3 ? 1.5 : 0.3, 
                repeat: currentStep === 3 ? 0 : isTitanInjured ? Infinity : 0, 
                ease: 'easeInOut' 
              }}
              className="relative w-44 h-44 sm:w-60 sm:h-60 rounded-3xl bg-slate-950/90 border-2 border-cyan-500/40 flex items-center justify-center p-3 shadow-[0_0_30px_rgba(6,182,212,0.3)] backdrop-blur-md"
            >
              <TitanDefenderArtwork className="w-full h-full" />
            </motion.div>

            {/* Name Plate */}
            <div className="mt-3 text-center">
              <div className="text-xs sm:text-sm font-black text-cyan-300 tracking-wider">
                TITAN DEFENDER
              </div>
              <div className="text-[9px] sm:text-[10px] font-mono text-slate-400">
                {currentStep === 3 ? 'Bowing Head in Remorse' : 'Injured Colossus Vanguard'}
              </div>
            </div>
          </div>

          {/* Central Conduit / Diagnostic Connection / Laser Sparks */}
          <div className="flex-1 flex flex-col items-center justify-center px-2 z-10">
            {/* Holographic Diagnostic Stream connecting Titan to Scientists */}
            <div className="w-full flex flex-col items-center gap-2">
              <div className="w-full h-1 bg-gradient-to-r from-cyan-500 via-amber-400 to-purple-500 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.8)] relative overflow-hidden">
                <div className="w-12 h-full bg-white animate-bounce-x" />
              </div>

              {/* Status readout badge in middle */}
              <div className="px-3 py-1 rounded-xl bg-slate-950/85 border border-cyan-500/40 shadow-lg text-center backdrop-blur-md">
                <div className="text-[9px] font-mono font-bold text-amber-300 flex items-center gap-1.5 justify-center">
                  <Cpu size={12} className="text-cyan-400" />
                  <span>
                    {currentStep === 0 && 'QUANTUM RELOCATION: COMPLETED'}
                    {currentStep === 1 && 'BIO-SCAN: CRITICAL TRAUMA DETECTED'}
                    {currentStep === 2 && 'WARPER QUANTUM LINK: SEVERED'}
                    {currentStep === 3 && 'NEURAL FREQUENCY: REMORSE/SORROW'}
                    {currentStep === 4 && 'UPGRADE BLUEPRINT: TV TRANSCENDENCE'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Entity: SCIENTIST ANIMALS (Custom Artwork!) */}
          <div className="relative flex flex-col items-center">
            {/* Laboratory Holo-Aura */}
            <div 
              className={`absolute -inset-8 rounded-full blur-2xl transition-all duration-700 pointer-events-none ${
                currentStep === 4
                  ? 'bg-purple-500/40 scale-130 animate-pulse'
                  : currentStep === 1 || currentStep === 2
                    ? 'bg-cyan-500/35 scale-115'
                    : 'bg-cyan-500/20'
              }`}
            />

            {/* Diagnostic Scanner Overlay */}
            {(currentStep === 1 || currentStep === 2) && (
              <div className="absolute -top-3 -right-3 z-30 px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-400 text-[9px] font-mono font-black text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.6)] animate-pulse">
                SCIENTIFIC GUILD SCANNING
              </div>
            )}

            {/* Custom Scientist Animals Model Container */}
            <motion.div 
              animate={
                currentStep === 1 || currentStep === 2
                  ? { y: [-4, 4, -4], scale: [1, 1.02, 1] }
                  : currentStep === 4
                    ? { y: [0, -6, 0] }
                    : { y: [0, -3, 0] }
              }
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="relative w-44 h-44 sm:w-60 sm:h-60 rounded-3xl bg-slate-950/90 border-2 border-cyan-500/60 flex items-center justify-center p-3 shadow-[0_0_35px_rgba(6,182,212,0.35)] backdrop-blur-md"
            >
              <ScientistAnimalsArtwork className="w-full h-full" />
            </motion.div>

            {/* Name Plate */}
            <div className="mt-3 text-center">
              <div className="text-xs sm:text-sm font-black text-cyan-300 tracking-wider">
                SCIENTIST ANIMALS
              </div>
              <div className="text-[9px] sm:text-[10px] font-mono text-slate-400">
                Cyber-Biologist & Engineering Guild
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Dialogue Box & Tactical Narrative */}
        <div 
          className="w-full bg-slate-900/90 border-2 rounded-2xl p-4 sm:p-5 backdrop-blur-lg shadow-2xl relative overflow-hidden transition-colors duration-500" 
          style={{ borderColor: currentScript.color + '88' }}
        >
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
            <p className="text-base sm:text-2xl font-black tracking-wide text-white leading-relaxed font-sans">
              “{displayedText}”
              <span className="inline-block w-2 h-5 ml-1 bg-cyan-400 animate-pulse" />
            </p>
          </div>

          {/* Tactical Context Caption & Progression Footer */}
          <div className="mt-3 pt-2 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[10px] text-slate-300 italic">
              <AlertTriangle size={12} className="text-cyan-400 shrink-0" />
              <span>{currentScript.caption}</span>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {currentStep === 4 ? (
                <button
                  type="button"
                  onClick={(e) => handleCompleteCutscene(e)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-purple-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.5)] flex items-center gap-1.5 animate-pulse"
                >
                  <span>COMMENCE UPGRADE (CONTINUE LORE)</span>
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
