import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Zap, 
  Swords, 
  Crown, 
  Star, 
  Flame, 
  ShieldAlert, 
  ShieldCheck, 
  Skull, 
  Volume2, 
  VolumeX, 
  FastForward,
  Trophy,
  Cpu
} from 'lucide-react';
import { gameAudio } from '../utils/audio';

interface WarperBladeClashCutsceneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReward?: () => void;
  bossName?: string;
  isPreview?: boolean;
}

type CutsceneStage = 'intro' | 'blade_clash' | 'overdrive_flurry' | 'reality_cleave' | 'victory_aftermath';

interface SparkParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

interface FloatingCombatNumber {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  scale: number;
}

interface BladeSlashTrail {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width: number;
  duration: number;
}

// Synthesized sound helper for cutscene
function playClashSFX(type: 'clash' | 'laser' | 'charge' | 'slash' | 'boom' | 'victory') {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    if (type === 'clash') {
      // Metallic sword clash / spark impact
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800 + Math.random() * 600, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.18);

      filter.type = 'highpass';
      filter.frequency.setValueAtTime(500, now);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === 'laser') {
      // High-energy laser pulse
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.15);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (type === 'charge') {
      // Rising energy hum
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(950, now + 1.2);
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.9);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.35);
    } else if (type === 'slash') {
      // Reality cutting whoosh
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1600, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.35);
      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } else if (type === 'boom') {
      // Heavy cosmic explosion
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.8);
      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.0);
    }
  } catch (e) {
    // Ignore audio context block
  }
}

// Arcane Warper Cosmic Avatar Component
function WarperAvatar({ 
  hasBlades = true, 
  hasCannons = true,
  isSlashing = false,
  isCharging = false 
}: { 
  hasBlades?: boolean; 
  hasCannons?: boolean;
  isSlashing?: boolean;
  isCharging?: boolean;
}) {
  return (
    <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center select-none">
      {/* Outer Cosmic Singularity Aura */}
      <motion.div
        animate={{ 
          rotate: 360,
          scale: isCharging ? [1, 1.25, 1.1] : [1, 1.06, 1] 
        }}
        transition={{ 
          rotate: { duration: 18, repeat: Infinity, ease: 'linear' },
          scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
        }}
        className="absolute inset-0 rounded-full border border-dashed border-fuchsia-400/40 flex items-center justify-center p-2"
      >
        <div className="w-full h-full rounded-full border border-purple-500/20 border-t-fuchsia-400 border-b-cyan-400" />
      </motion.div>

      {/* Pulsing Void Ring */}
      <motion.div
        animate={{ rotate: -360, scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-4 rounded-full border-2 border-fuchsia-500/30 border-l-cyan-400 border-r-purple-600"
      />

      {/* Astral Blades (Mounted on sides with sharp energy glow) */}
      {hasBlades && (
        <>
          {/* Left Astral Blade */}
          <motion.div
            animate={isSlashing ? {
              rotate: [-25, 65, -25],
              x: [-10, 25, -10],
              y: [-5, 15, -5]
            } : {
              rotate: [-15, -20, -15],
              y: [-3, 3, -3]
            }}
            transition={{ duration: isSlashing ? 0.25 : 2, repeat: Infinity }}
            className="absolute -left-6 top-8 w-10 h-36 origin-bottom z-20 pointer-events-none"
          >
            <svg viewBox="0 0 50 160" className="w-full h-full drop-shadow-[0_0_15px_rgba(217,70,239,0.9)]">
              <defs>
                <linearGradient id="bladeGradL" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="35%" stopColor="#e879f9" />
                  <stop offset="75%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
              {/* Curved scythe blade */}
              <path d="M 30,150 L 35,60 Q 40,10 5,0 Q 25,35 22,80 L 20,150 Z" fill="url(#bladeGradL)" />
              {/* Core energy line */}
              <path d="M 28,140 Q 32,55 12,12" stroke="#ffffff" strokeWidth="2.5" fill="none" />
              {/* Blade hilt */}
              <rect x="16" y="142" width="16" height="18" rx="2" fill="#0f172a" stroke="#d946ef" strokeWidth="2" />
            </svg>
          </motion.div>

          {/* Right Astral Blade */}
          <motion.div
            animate={isSlashing ? {
              rotate: [25, -65, 25],
              x: [10, -25, 10],
              y: [5, -15, 5]
            } : {
              rotate: [15, 20, 15],
              y: [3, -3, 3]
            }}
            transition={{ duration: isSlashing ? 0.25 : 2, repeat: Infinity, delay: 0.12 }}
            className="absolute -right-6 top-8 w-10 h-36 origin-bottom z-20 pointer-events-none"
          >
            <svg viewBox="0 0 50 160" className="w-full h-full drop-shadow-[0_0_15px_rgba(217,70,239,0.9)] scale-x-[-1]">
              <defs>
                <linearGradient id="bladeGradR" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="35%" stopColor="#e879f9" />
                  <stop offset="75%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
              <path d="M 30,150 L 35,60 Q 40,10 5,0 Q 25,35 22,80 L 20,150 Z" fill="url(#bladeGradR)" />
              <path d="M 28,140 Q 32,55 12,12" stroke="#ffffff" strokeWidth="2.5" fill="none" />
              <rect x="16" y="142" width="16" height="18" rx="2" fill="#0f172a" stroke="#d946ef" strokeWidth="2" />
            </svg>
          </motion.div>
        </>
      )}

      {/* Shoulder Cannon Turrets (Armoured Titan Upgrade) */}
      {hasCannons && (
        <>
          <motion.div 
            animate={{ scale: isCharging ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="absolute -top-3 left-4 w-7 h-10 bg-slate-900 border-2 border-cyan-400 rounded-t-md z-15 flex flex-col items-center shadow-[0_0_15px_rgba(6,182,212,0.8)]"
          >
            <div className="w-2.5 h-4 bg-cyan-400 rounded-t-sm animate-pulse" />
            <div className="w-full h-1 bg-cyan-300 mt-1" />
          </motion.div>
          <motion.div 
            animate={{ scale: isCharging ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
            className="absolute -top-3 right-4 w-7 h-10 bg-slate-900 border-2 border-cyan-400 rounded-t-md z-15 flex flex-col items-center shadow-[0_0_15px_rgba(6,182,212,0.8)]"
          >
            <div className="w-2.5 h-4 bg-cyan-400 rounded-t-sm animate-pulse" />
            <div className="w-full h-1 bg-cyan-300 mt-1" />
          </motion.div>
        </>
      )}

      {/* Warper Main Chassis (Cube Shape + Cosmic Relic Inscriptions) */}
      <motion.div
        animate={isSlashing ? {
          x: [-4, 4, -4],
          rotate: [-3, 3, -3]
        } : {
          y: [-4, 4, -4]
        }}
        transition={{ duration: isSlashing ? 0.15 : 2.5, repeat: Infinity }}
        className="relative w-28 h-28 sm:w-32 sm:h-32 bg-slate-950 border-4 border-fuchsia-500 rounded-3xl flex flex-col items-center justify-center shadow-[0_0_45px_rgba(217,70,239,0.6)] overflow-hidden z-10"
      >
        {/* Core glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-950/70 via-purple-950/40 to-cyan-950/80" />
        
        {/* Armoured plating lines */}
        <div className="absolute inset-1.5 border border-dashed border-fuchsia-400/40 rounded-2xl" />
        
        {/* Singularity Core Eye / Reactor */}
        <div className="relative w-14 h-14 rounded-full bg-slate-950 border-2 border-fuchsia-400 flex items-center justify-center shadow-[0_0_25px_rgba(232,121,249,0.8)]">
          <motion.div
            animate={{ scale: isCharging ? [1, 1.4, 0.9, 1.3, 1] : [1, 1.2, 1] }}
            transition={{ duration: isCharging ? 0.8 : 1.8, repeat: Infinity }}
            className="w-8 h-8 rounded-full bg-gradient-to-r from-white via-fuchsia-400 to-cyan-400 flex items-center justify-center"
          >
            <div className="w-3 h-3 rounded-full bg-white shadow-inner animate-ping" />
          </motion.div>
        </div>

        {/* Chassis Badge */}
        <div className="absolute bottom-1.5 px-2 py-0.5 rounded bg-fuchsia-950/80 border border-fuchsia-400/40 text-[7px] font-mono font-black text-fuchsia-300 uppercase tracking-widest">
          ARCANE WARPER
        </div>
      </motion.div>
    </div>
  );
}

// Ultra Boss (God of Destruction Sovereign) Avatar Component
function UltraBossAvatar({ 
  isDamaged = false, 
  isCleaved = false,
  bossHP = 100 
}: { 
  isDamaged?: boolean; 
  isCleaved?: boolean;
  bossHP?: number;
}) {
  return (
    <div className="relative w-52 h-52 sm:w-64 sm:h-64 flex items-center justify-center select-none">
      {/* Dark Matter Gravitational Halo */}
      <motion.div
        animate={{ rotate: -360, scale: [1, 1.08, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 rounded-full border-2 border-dashed border-purple-600/40 flex items-center justify-center p-3"
      >
        <div className="w-full h-full rounded-full border border-purple-500/20 border-t-rose-500 border-b-purple-400" />
      </motion.div>

      {/* Orbiting Adamantine Shield Plates */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-2 flex items-center justify-between pointer-events-none"
      >
        <div className="w-6 h-12 bg-slate-900 border-2 border-purple-400 rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.8)] -ml-3" />
        <div className="w-6 h-12 bg-slate-900 border-2 border-purple-400 rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.8)] -mr-3" />
      </motion.div>

      {/* Giant Sovereign Armament / Horns */}
      <div className="absolute -top-4 inset-x-6 flex justify-between pointer-events-none">
        <div className="w-8 h-12 bg-gradient-to-t from-slate-900 to-purple-600 rounded-tl-full border-l-2 border-t-2 border-purple-400 -rotate-12" />
        <div className="w-8 h-12 bg-gradient-to-t from-slate-900 to-purple-600 rounded-tr-full border-r-2 border-t-2 border-purple-400 rotate-12" />
      </div>

      {/* Main Boss Entity Body */}
      <motion.div
        animate={isCleaved ? {
          scale: [1, 1.1, 0.4],
          opacity: [1, 0.8, 0],
          filter: ['brightness(1)', 'brightness(3)', 'brightness(0)']
        } : isDamaged ? {
          x: [6, -6, 4, -4, 0],
          y: [-3, 3, -2, 2, 0],
          filter: ['brightness(1)', 'brightness(2)', 'brightness(1)']
        } : {
          y: [-5, 5, -5]
        }}
        transition={{ 
          duration: isCleaved ? 1.5 : (isDamaged ? 0.2 : 3), 
          repeat: isCleaved ? 0 : Infinity 
        }}
        className="relative w-36 h-36 sm:w-44 sm:h-44 bg-slate-950 border-4 border-purple-500 rounded-3xl flex flex-col items-center justify-center shadow-[0_0_60px_rgba(168,85,247,0.7)] overflow-hidden z-10"
      >
        {/* Internal Dark Matter Matrix */}
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-950 via-slate-950 to-rose-950" />
        
        {/* Adamantine Hex Grid lines */}
        <div className="absolute inset-2 border border-purple-400/30 rounded-2xl flex flex-col justify-around p-1">
          <div className="w-full h-px bg-purple-500/30" />
          <div className="w-full h-px bg-purple-500/30" />
          <div className="w-full h-px bg-purple-500/30" />
        </div>

        {/* Diagonal Cleave Crack Visual (if cleaved) */}
        {isCleaved && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '140%' }}
            transition={{ duration: 0.2 }}
            className="absolute h-2 bg-white shadow-[0_0_25px_#ffffff] rotate-45 z-30 pointer-events-none"
          />
        )}

        {/* God of Destruction Core Eye */}
        <div className="relative w-18 h-18 rounded-full bg-slate-950 border-2 border-rose-500 flex items-center justify-center shadow-[0_0_30px_rgba(244,63,94,0.9)]">
          <motion.div
            animate={{ scale: [1, 1.25, 0.95, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-rose-500 via-purple-600 to-amber-400 flex items-center justify-center"
          >
            <div className="w-3.5 h-3.5 rounded-full bg-white shadow-lg animate-pulse" />
          </motion.div>
        </div>

        {/* Boss Title Label */}
        <div className="absolute bottom-2 px-2 py-0.5 rounded bg-purple-950/90 border border-purple-400/50 text-[7px] sm:text-[8px] font-mono font-black text-purple-200 uppercase tracking-widest">
          GOD OF DESTRUCTION (100T HP)
        </div>
      </motion.div>
    </div>
  );
}

export const WarperBladeClashCutsceneModal: React.FC<WarperBladeClashCutsceneModalProps> = ({
  isOpen,
  onClose,
  onReward,
  bossName = "God of Destruction",
  isPreview = false
}) => {
  const [stage, setStage] = useState<CutsceneStage>('intro');
  const [bossHP, setBossHP] = useState(100);
  const [clashProgress, setClashProgress] = useState(35); // 0 to 100
  const [typedBossText, setTypedBossText] = useState('');
  const [typedWarperText, setTypedWarperText] = useState('');
  const [combatLogs, setCombatLogs] = useState<string[]>([]);
  const [floatingNumbers, setFloatingNumbers] = useState<FloatingCombatNumber[]>([]);
  const [bladeSlashes, setBladeSlashes] = useState<BladeSlashTrail[]>([]);
  const [isScreenShaking, setIsScreenShaking] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<SparkParticle[]>([]);
  const canvasSlashesRef = useRef<{ x1: number; y1: number; x2: number; y2: number; color: string; width: number; life: number; maxLife: number }[]>([]);
  const shockwavesRef = useRef<{ x: number; y: number; radius: number; maxRadius: number; color: string; life: number }[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  const fullBossDialogue = "IMPUDENT WARPER... YOU HAVE CROSSED TIME AND SPACE ONLY TO PERISH! MY ADAMANTINE SHELL HAS WITHSTOOD SUPERNOVAS!";
  const fullWarperDialogue = "YOUR ADAMANTINE ARMOR MEANS NOTHING BEFORE SINGULARITY. ASTRAL BLADES DRAWN. TIME TO SEVER THIS REALITY!";

  // Reset and initialize on open
  useEffect(() => {
    if (!isOpen) return;

    setStage('intro');
    setBossHP(100);
    setClashProgress(35);
    setTypedBossText('');
    setTypedWarperText('');
    setCombatLogs([
      '🚨 COSMIC EMERGENCY: ULTRA WORLD BOSS DETECTED',
      '⚡ ARCANE WARPER: ENGAGING SINGULARITY OVERDRIVE'
    ]);
    setFloatingNumbers([]);
    setBladeSlashes([]);

    playClashSFX('charge');

    // Typewriter for boss dialogue
    let bossIdx = 0;
    const bossTimer = setInterval(() => {
      if (bossIdx < fullBossDialogue.length) {
        setTypedBossText(fullBossDialogue.slice(0, bossIdx + 1));
        bossIdx++;
      } else {
        clearInterval(bossTimer);
      }
    }, 18);

    // Typewriter for warper dialogue (staggered)
    const warperTimer = setTimeout(() => {
      let warperIdx = 0;
      const wTyping = setInterval(() => {
        if (warperIdx < fullWarperDialogue.length) {
          setTypedWarperText(fullWarperDialogue.slice(0, warperIdx + 1));
          warperIdx++;
        } else {
          clearInterval(wTyping);
        }
      }, 16);
    }, 1400);

    // Auto transition from intro to blade clash after 4.2 seconds
    const introTimer = setTimeout(() => {
      startBladeClash();
    }, 4200);

    return () => {
      clearInterval(bossTimer);
      clearTimeout(warperTimer);
      clearTimeout(introTimer);
    };
  }, [isOpen]);

  // High-performance Particle & Shockwave canvas animation (zero DOM layout overhead)
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Pre-seed ambient cosmic stardust particles
    particlesRef.current = [];
    canvasSlashesRef.current = [];
    shockwavesRef.current = [];

    const colors = ['#f43f5e', '#d946ef', '#a855f7', '#38bdf8', '#ffffff', '#fbbf24', '#00f0ff'];
    for (let i = 0; i < 75; i++) {
      particlesRef.current.push({
        id: `p-${i}`,
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        color: colors[i % colors.length],
        size: 1.2 + Math.random() * 3.5,
        life: 40 + Math.random() * 60,
        maxLife: 100
      });
    }

    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(33, now - lastTime) / 16.66;
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw subtle pulsing dimensional rift grid in the center
      const centerX = width / 2;
      const centerY = height / 2;
      const pulseTime = now * 0.002;

      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      // Concentric ethereal astral rings
      ctx.strokeStyle = 'rgba(217, 70, 239, 0.12)';
      ctx.lineWidth = 1.5;
      for (let r = 1; r <= 3; r++) {
        const ringRad = 80 * r + Math.sin(pulseTime + r) * 15;
        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRad, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 2. Draw active shockwaves
      const shockwaves = shockwavesRef.current;
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += (sw.maxRadius - sw.radius) * 0.18 * dt + 2;
        sw.life -= 0.045 * dt;

        if (sw.life <= 0 || sw.radius >= sw.maxRadius) {
          shockwaves.splice(i, 1);
          continue;
        }

        ctx.strokeStyle = sw.color;
        ctx.lineWidth = Math.max(1, sw.life * 6);
        ctx.globalAlpha = Math.max(0, sw.life);
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Inner glowing secondary ring
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(0.5, sw.life * 2);
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, Math.max(0, sw.radius - 12), 0, Math.PI * 2);
        ctx.stroke();
      }

      // 3. Draw fast-moving particle sparks
      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= 1 * dt;

        const alpha = Math.max(0, p.life / p.maxLife);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        
        // Fast square/circle particle rendering
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Respawn at clash center or random position
        if (p.life <= 0) {
          p.x = centerX + (Math.random() - 0.5) * 160;
          p.y = centerY + (Math.random() - 0.5) * 140;
          const angle = Math.random() * Math.PI * 2;
          const spd = 2 + Math.random() * 8;
          p.vx = Math.cos(angle) * spd;
          p.vy = Math.sin(angle) * spd;
          p.life = 35 + Math.random() * 55;
          p.maxLife = 90;
          p.color = colors[Math.floor(Math.random() * colors.length)];
        }
      }

      // 4. Draw high-energy dynamic canvas sword slashes
      const slashes = canvasSlashesRef.current;
      for (let i = slashes.length - 1; i >= 0; i--) {
        const s = slashes[i];
        s.life -= 0.08 * dt;

        if (s.life <= 0) {
          slashes.splice(i, 1);
          continue;
        }

        const alpha = Math.max(0, s.life / s.maxLife);
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = s.color;
        ctx.lineWidth = s.width * alpha;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(s.x1, s.y1);
        ctx.lineTo(s.x2, s.y2);
        ctx.stroke();

        // White hot center slash filament
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(1, s.width * 0.4 * alpha);
        ctx.beginPath();
        ctx.moveTo(s.x1, s.y1);
        ctx.lineTo(s.x2, s.y2);
        ctx.stroke();
      }

      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isOpen]);

  // Helper to spawn floating damage numbers
  const spawnDamageText = (text: string, color: string = '#f43f5e', scale: number = 1.2) => {
    const id = Math.random().toString(36).substr(2, 9);
    const x = window.innerWidth / 2 + (Math.random() - 0.5) * 240;
    const y = window.innerHeight / 2 + (Math.random() - 0.5) * 160;
    setFloatingNumbers(prev => [...prev.slice(-8), { id, x, y, text, color, scale }]);
    setTimeout(() => {
      setFloatingNumbers(prev => prev.filter(item => item.id !== id));
    }, 1200);
  };

  // Helper to spawn lightning-fast canvas slash trail and shockwave (zero React state latency)
  const spawnSlashTrail = (color: string = '#d946ef') => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const angle = Math.random() * Math.PI * 2;
    const len = 220 + Math.random() * 260;
    const x1 = cx - Math.cos(angle) * len;
    const y1 = cy - Math.sin(angle) * len;
    const x2 = cx + Math.cos(angle) * len;
    const y2 = cy + Math.sin(angle) * len;

    // Push directly to canvas refs for instant 60fps rendering without React re-renders!
    if (canvasSlashesRef.current.length < 12) {
      canvasSlashesRef.current.push({
        x1, y1, x2, y2,
        color,
        width: 6 + Math.random() * 8,
        life: 1,
        maxLife: 1
      });
    }

    if (shockwavesRef.current.length < 6) {
      shockwavesRef.current.push({
        x: cx + (Math.random() - 0.5) * 40,
        y: cy + (Math.random() - 0.5) * 40,
        radius: 10,
        maxRadius: 180 + Math.random() * 80,
        color,
        life: 1
      });
    }
  };

  // Start Blade Clash Stage
  const startBladeClash = () => {
    setStage('blade_clash');
    playClashSFX('clash');
    spawnSlashTrail('#00f0ff');
    setIsScreenShaking(true);
    setTimeout(() => setIsScreenShaking(false), 260);

    setCombatLogs(prev => [
      ...prev,
      '⚔️ CLASH COMMENCED: ASTRAL BLADES VS SOVEREIGN VOID CANNON',
      '💥 TENSION SURGE: MASH TO OVERPOWER SOVEREIGN SHIELD!'
    ]);
  };

  // Handle Player Click / Mash during Blade Clash
  const handleClashClick = () => {
    if (stage !== 'blade_clash') return;

    playClashSFX('clash');
    spawnSlashTrail('#d946ef');
    spawnDamageText(`-${(Math.floor(Math.random() * 50) + 50)}B CRIT!`, '#f43f5e', 1.3);

    // Shake screen
    setIsScreenShaking(true);
    setTimeout(() => setIsScreenShaking(false), 120);

    // Increment progress
    setClashProgress(prev => {
      const next = prev + 15;
      if (next >= 100) {
        // Trigger Stage 3: Overdrive Blade Flurry!
        setTimeout(() => triggerOverdriveFlurry(), 100);
        return 100;
      }
      return next;
    });
  };

  // Auto-trigger Overdrive Flurry
  const triggerOverdriveFlurry = () => {
    setStage('overdrive_flurry');
    playClashSFX('laser');

    setCombatLogs(prev => [
      ...prev,
      '⚡ SHIELD SHATTERED! WARPER ENGAGES HYPER-SPEED BLADE FLURRY!',
      '🔥 DUAL SHOULDER CANNONS FIRING POINT-BLANK CONCENTRATED BEAMS!'
    ]);

    // Flurry animation sequence
    let count = 0;
    const flurryInterval = setInterval(() => {
      count++;
      playClashSFX(count % 2 === 0 ? 'clash' : 'laser');
      spawnSlashTrail(count % 2 === 0 ? '#e879f9' : '#06b6d4');
      spawnDamageText(`-${(count * 8 + 120)}B COMBO!`, '#e879f9', 1.4);
      
      setBossHP(prev => Math.max(5, prev - 15));

      if (count >= 6) {
        clearInterval(flurryInterval);
        setTimeout(() => triggerRealityCleave(), 600);
      }
    }, 240);
  };

  // Stage 4: Reality Cleave Finisher
  const triggerRealityCleave = () => {
    setStage('reality_cleave');
    playClashSFX('charge');

    setCombatLogs(prev => [
      ...prev,
      '🌌 100% SINGULARITY CONCENTRATED INTO TWIN ASTRAL BLADES',
      '⚔️ EXECUTING: ASTRAL REALITY CLEAVE - VOID SEVERANCE!'
    ]);

    // Dramatic pause then reality slash
    setTimeout(() => {
      playClashSFX('slash');
      playClashSFX('boom');
      setBossHP(0);
      setIsScreenShaking(true);
      setTimeout(() => setIsScreenShaking(false), 600);

      // Transition to victory aftermath
      setTimeout(() => {
        setStage('victory_aftermath');
        playClashSFX('victory');
        gameAudio.playSFX('victory');
        if (onReward) {
          onReward();
        }
      }, 1600);
    }, 1200);
  };

  // Skip cutscene straight to aftermath/victory
  const handleSkip = () => {
    setStage('victory_aftermath');
    setBossHP(0);
    playClashSFX('victory');
    gameAudio.playSFX('victory');
    if (onReward) {
      onReward();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 overflow-hidden bg-slate-950 text-white select-none">
          {/* Background Canvas for Particle Sparks & Energy Dust */}
          <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

          {/* Dynamic Screen Flash / Shake Wrap */}
          <motion.div 
            animate={isScreenShaking ? {
              x: [-12, 12, -8, 8, -4, 4, 0],
              y: [8, -8, 6, -6, 2, -2, 0]
            } : { x: 0, y: 0 }}
            transition={{ duration: 0.25 }}
            className="relative w-full h-full flex flex-col justify-between items-center z-10"
          >
            {/* Top Cinematic Letterbox Bar */}
            <div className="w-full h-16 sm:h-20 bg-slate-950/95 border-b-2 border-fuchsia-500/40 backdrop-blur-md flex items-center justify-between px-4 sm:px-8 z-30 shadow-[0_4px_30px_rgba(217,70,239,0.3)]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-fuchsia-950/80 border border-fuchsia-400 shadow-[0_0_15px_rgba(217,70,239,0.6)]">
                  <Swords size={20} className="text-fuchsia-300 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 via-purple-200 to-cyan-300">
                    ASTRAL BLADE CLASH: WARPER VS {bossName.toUpperCase()}
                  </h2>
                  <span className="text-[9px] font-mono text-fuchsia-400 font-bold uppercase tracking-widest">
                    {stage === 'intro' && 'STAGE 1/4: COSMIC STANDOFF'}
                    {stage === 'blade_clash' && 'STAGE 2/4: ACTIVE BLADE CLASH'}
                    {stage === 'overdrive_flurry' && 'STAGE 3/4: HYPER OVERDRIVE FLURRY'}
                    {stage === 'reality_cleave' && 'STAGE 4/4: ASTRAL REALITY SEVERANCE'}
                    {stage === 'victory_aftermath' && 'VICTORY: GOD OF DESTRUCTION ANNIHILATED'}
                  </span>
                </div>
              </div>

              {/* Controls (Skip, Mute, Close) */}
              <div className="flex items-center gap-2">
                {stage !== 'victory_aftermath' && (
                  <button
                    onClick={handleSkip}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-white/20 hover:border-fuchsia-400 text-[10px] font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-all cursor-pointer shadow-md"
                  >
                    <FastForward size={14} className="text-fuchsia-400" />
                    Skip Cutscene
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-lg bg-rose-950/80 border border-rose-500/40 hover:bg-rose-900 text-[10px] font-bold uppercase tracking-wider text-rose-300 transition-all cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>
            </div>

            {/* Main Stage Arena Center */}
            <div className="relative flex-1 w-full max-w-6xl flex flex-col items-center justify-center px-4 py-2">
              {/* Dynamic Slashes Rendering Overlay */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-25">
                {bladeSlashes.map((s) => (
                  <line 
                    key={`blade-slash-${s.id}`} 
                    x1={s.x1} 
                    y1={s.y1} 
                    x2={s.x2} 
                    y2={s.y2} 
                    stroke={s.color} 
                    strokeWidth={s.width}
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_20px_#ffffff] animate-pulse"
                  />
                ))}
              </svg>

              {/* Floating Combat Damage Numbers */}
              {floatingNumbers.map((n) => (
                <motion.div
                  key={`floating-dmg-${n.id}`}
                  initial={{ opacity: 1, scale: 0.8, y: n.y, x: n.x }}
                  animate={{ opacity: 0, scale: n.scale * 1.3, y: n.y - 80 }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  className="fixed z-40 pointer-events-none font-black font-mono text-xl sm:text-2xl drop-shadow-[0_0_12px_rgba(0,0,0,0.9)]"
                  style={{ color: n.color }}
                >
                  {n.text}
                </motion.div>
              ))}

              {/* STAGE 1: INTRO & DIALOGUE */}
              {stage === 'intro' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full flex flex-col items-center space-y-6 max-w-4xl"
                >
                  {/* Face-off avatars */}
                  <div className="w-full flex items-center justify-around">
                    <div className="flex flex-col items-center">
                      <WarperAvatar hasBlades={true} hasCannons={true} isCharging={true} />
                      <span className="mt-2 text-xs font-black uppercase tracking-widest text-fuchsia-300 font-mono">
                        ARCANE WARPER
                      </span>
                    </div>

                    {/* VS Badge */}
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-fuchsia-600 via-purple-600 to-rose-600 p-0.5 flex items-center justify-center shadow-[0_0_35px_rgba(217,70,239,0.8)]">
                        <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                          <span className="text-xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-rose-300">
                            VS
                          </span>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono text-purple-400 font-bold uppercase mt-1">SOVEREIGN CLASH</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <UltraBossAvatar bossHP={100} />
                      <span className="mt-2 text-xs font-black uppercase tracking-widest text-rose-300 font-mono">
                        {bossName.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Dialogue Subtitle Boxes */}
                  <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Boss Subtitle */}
                    <div className="p-3.5 rounded-2xl bg-purple-950/60 border border-purple-500/40 shadow-inner text-left">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Skull size={14} className="text-rose-400" />
                        <span className="text-[10px] font-mono font-black text-rose-400 uppercase">
                          {bossName}:
                        </span>
                      </div>
                      <p className="text-xs font-mono text-purple-200 leading-relaxed min-h-[3.5rem]">
                        "{typedBossText}"
                      </p>
                    </div>

                    {/* Warper Subtitle */}
                    <div className="p-3.5 rounded-2xl bg-fuchsia-950/60 border border-fuchsia-500/40 shadow-inner text-left">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Zap size={14} className="text-fuchsia-400" />
                        <span className="text-[10px] font-mono font-black text-fuchsia-300 uppercase">
                          ARCANE WARPER:
                        </span>
                      </div>
                      <p className="text-xs font-mono text-fuchsia-100 leading-relaxed min-h-[3.5rem]">
                        "{typedWarperText}"
                      </p>
                    </div>
                  </div>

                  {/* Advance to clash button */}
                  <button
                    onClick={startBladeClash}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-cyan-600 hover:from-fuchsia-500 hover:to-cyan-500 text-white font-black text-xs uppercase tracking-widest shadow-[0_0_30px_rgba(217,70,239,0.7)] hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Swords size={16} />
                    Engage Astral Blade Clash!
                  </button>
                </motion.div>
              )}

              {/* STAGE 2: ACTIVE BLADE CLASH & POWER STRUGGLE */}
              {stage === 'blade_clash' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full flex flex-col items-center space-y-6 max-w-4xl"
                >
                  {/* Dynamic Close-Quarter Blade Clash Animation */}
                  <div className="relative w-full flex items-center justify-center">
                    {/* Warper Clashing forward */}
                    <motion.div 
                      animate={{ x: [0, 45, 10, 40, 0] }}
                      transition={{ duration: 0.35, repeat: Infinity }}
                      className="mr-2 sm:mr-6"
                    >
                      <WarperAvatar hasBlades={true} hasCannons={true} isSlashing={true} />
                    </motion.div>

                    {/* Central Blade Clash Spark Nexus */}
                    <div className="relative w-20 h-20 flex items-center justify-center">
                      <motion.div
                        animate={{ scale: [1, 1.8, 1.2, 1.6, 1], rotate: 180 }}
                        transition={{ duration: 0.3, repeat: Infinity }}
                        className="absolute w-16 h-16 rounded-full bg-gradient-to-tr from-fuchsia-400 via-white to-cyan-400 blur-md opacity-90"
                      />
                      <Swords size={42} className="relative z-10 text-white drop-shadow-[0_0_20px_#ffffff] animate-spin" />
                    </div>

                    {/* Ultra Boss Blocking/Parrying */}
                    <motion.div 
                      animate={{ x: [0, -45, -10, -40, 0] }}
                      transition={{ duration: 0.35, repeat: Infinity, delay: 0.08 }}
                      className="ml-2 sm:ml-6"
                    >
                      <UltraBossAvatar isDamaged={true} bossHP={bossHP} />
                    </motion.div>
                  </div>

                  {/* Clash Tension Meter & Interactive Mash Button */}
                  <div className="w-full max-w-lg bg-slate-900/90 border-2 border-fuchsia-500/50 rounded-2xl p-4 shadow-[0_0_40px_rgba(217,70,239,0.4)] flex flex-col items-center gap-3">
                    <div className="w-full flex justify-between items-center text-xs font-mono font-black uppercase">
                      <span className="text-fuchsia-300 flex items-center gap-1">
                        <Zap size={14} className="text-fuchsia-400" /> ASTRAL BLADE FORCE: {clashProgress}%
                      </span>
                      <span className="text-rose-400 flex items-center gap-1">
                        <ShieldAlert size={14} className="text-rose-400" /> SOVEREIGN SHIELD: {100 - clashProgress}%
                      </span>
                    </div>

                    {/* Power Struggle Gauge */}
                    <div className="w-full h-4 bg-slate-950 rounded-full border border-fuchsia-400/40 p-0.5 overflow-hidden shadow-inner">
                      <motion.div 
                        animate={{ width: `${clashProgress}%` }}
                        transition={{ type: 'spring', damping: 15 }}
                        className="h-full bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-purple-400 rounded-full shadow-[0_0_15px_#e879f9]"
                      />
                    </div>

                    {/* Mash Button */}
                    <button
                      onClick={handleClashClick}
                      className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-cyan-500 hover:from-fuchsia-500 hover:to-cyan-400 text-white font-black text-sm sm:text-base uppercase tracking-widest shadow-[0_0_35px_rgba(217,70,239,0.8)] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 border-2 border-white/20 hover:brightness-125"
                    >
                      <Zap size={20} className="animate-bounce" />
                      ⚡ CLASH! MASH TO OVERPOWER VOID SHIELD! ⚡
                    </button>
                    <span className="text-[9px] font-mono text-slate-400 uppercase">
                      Click repeatedly or wait for auto-overdrive
                    </span>
                  </div>
                </motion.div>
              )}

              {/* STAGE 3: HYPER OVERDRIVE BLADE FLURRY */}
              {stage === 'overdrive_flurry' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full flex flex-col items-center space-y-6 max-w-4xl"
                >
                  <div className="relative w-full flex items-center justify-center">
                    <motion.div 
                      animate={{ scale: [1, 1.15, 1], x: [0, 20, -10, 0] }}
                      transition={{ duration: 0.2, repeat: Infinity }}
                    >
                      <WarperAvatar hasBlades={true} hasCannons={true} isSlashing={true} isCharging={true} />
                    </motion.div>

                    <div className="mx-6">
                      <UltraBossAvatar isDamaged={true} bossHP={bossHP} />
                    </div>
                  </div>

                  <div className="p-3 bg-fuchsia-950/80 border border-fuchsia-400 rounded-xl text-center shadow-[0_0_30px_rgba(217,70,239,0.5)]">
                    <h3 className="text-sm font-black uppercase tracking-widest text-fuchsia-200 font-mono animate-pulse">
                      ⚔️ HYPER-DIMENSIONAL BLADE FLURRY & DUAL TITAN LASERS TEARING CORE! ⚔️
                    </h3>
                    <p className="text-[10px] text-fuchsia-300/80 font-mono mt-0.5">
                      Condensing Singularity to 100% — Preparing Reality Severance Strike...
                    </p>
                  </div>
                </motion.div>
              )}

              {/* STAGE 4: ASTRAL REALITY CLEAVE FINISHER */}
              {stage === 'reality_cleave' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full flex flex-col items-center justify-center space-y-6"
                >
                  {/* Dramatic Freeze Frame Cut */}
                  <div className="relative flex flex-col items-center">
                    <h1 className="text-4xl sm:text-6xl font-black italic tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-fuchsia-300 to-cyan-300 drop-shadow-[0_0_40px_rgba(217,70,239,0.9)] animate-pulse">
                      ASTRAL REALITY CLEAVE
                    </h1>
                    <span className="text-xs font-mono font-black text-fuchsia-400 uppercase tracking-[0.3em] mt-1">
                      ⚔️ VOID SEVERANCE: OBLITERATION OF THE GOD OF DESTRUCTION ⚔️
                    </span>

                    <div className="mt-8">
                      <UltraBossAvatar isCleaved={true} bossHP={0} />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STAGE 5: VICTORY AFTERMATH & SPOILS */}
              {stage === 'victory_aftermath' && (
                <motion.div 
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-full max-w-xl bg-slate-900/95 border-2 border-fuchsia-500/80 rounded-3xl p-6 sm:p-8 shadow-[0_0_80px_rgba(217,70,239,0.7)] text-center relative overflow-hidden"
                >
                  {/* Radiant cosmic back-aura */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-950/40 via-purple-950/50 to-cyan-950/40 pointer-events-none" />

                  {/* Header Crown Icon */}
                  <div className="relative mx-auto mb-4 w-20 h-20 flex items-center justify-center">
                    <div className="absolute inset-0 bg-fuchsia-500/30 rounded-full blur-xl animate-ping" />
                    <div className="relative w-18 h-18 rounded-2xl bg-gradient-to-tr from-fuchsia-500 via-purple-600 to-cyan-500 p-0.5 shadow-2xl flex items-center justify-center">
                      <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                        <Crown size={38} className="text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.9)] animate-bounce" />
                      </div>
                    </div>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 via-purple-200 to-amber-300 mb-1">
                    ULTRA WORLD BOSS SLAIN!
                  </h2>
                  <p className="text-[11px] uppercase tracking-widest text-fuchsia-300 font-bold mb-5 font-mono">
                    WARPER'S ASTRAL BLADE CLEAVE OBLITERATES 100 TRILLION HP SOVEREIGN
                  </p>

                  {/* God Slayer Badge Showcase */}
                  <div className="mb-5 p-3.5 bg-gradient-to-r from-fuchsia-950/50 via-purple-950/70 to-slate-950 border border-fuchsia-500/40 rounded-2xl shadow-inner flex flex-col items-center gap-1.5">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1">
                      <Star size={12} className="fill-amber-400" /> Commemorative Badge Acknowledged
                    </span>
                    <div className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-fuchsia-600 to-cyan-500 p-[2px] shadow-[0_0_20px_rgba(217,70,239,0.8)]">
                      <div className="bg-slate-950 px-4 py-1 rounded-[10px] flex items-center gap-2">
                        <Crown size={16} className="text-amber-400 animate-pulse" />
                        <span className="text-xs font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-fuchsia-200 to-cyan-200">
                          👑 GOD SLAYER
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rewards Grid */}
                  <div className="grid grid-cols-3 gap-2.5 mb-6">
                    <div className="p-2.5 bg-purple-950/60 border border-purple-500/40 rounded-xl flex flex-col items-center">
                      <Sparkles size={18} className="text-purple-400 mb-0.5 animate-pulse" />
                      <span className="text-[8px] uppercase font-bold text-purple-300">God Shards</span>
                      <span className="text-sm font-black font-mono text-purple-200">+50,000</span>
                    </div>
                    <div className="p-2.5 bg-amber-950/60 border border-amber-500/40 rounded-xl flex flex-col items-center">
                      <Zap size={18} className="text-amber-400 mb-0.5 animate-bounce" />
                      <span className="text-[8px] uppercase font-bold text-amber-300">Prime Meat</span>
                      <span className="text-sm font-black font-mono text-amber-200">+100,000,000</span>
                    </div>
                    <div className="p-2.5 bg-cyan-950/60 border border-cyan-500/40 rounded-xl flex flex-col items-center">
                      <Trophy size={18} className="text-cyan-400 mb-0.5" />
                      <span className="text-[8px] uppercase font-bold text-cyan-300">Gene DNA</span>
                      <span className="text-sm font-black font-mono text-cyan-200">+10,000,000</span>
                    </div>
                  </div>

                  {/* Claim Button */}
                  <button
                    onClick={onClose}
                    className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-cyan-600 hover:from-fuchsia-500 hover:to-cyan-500 text-white font-black text-xs uppercase tracking-widest shadow-[0_0_30px_rgba(217,70,239,0.8)] hover:brightness-110 active:scale-95 transition-all cursor-pointer border border-white/20"
                  >
                    👑 Claim Victory & Return to Battlefield
                  </button>
                </motion.div>
              )}
            </div>

            {/* Bottom Cinematic Letterbox Bar: Live Combat Log Console */}
            <div className="w-full h-16 sm:h-20 bg-slate-950/95 border-t-2 border-fuchsia-500/40 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between z-30 shadow-[0_-4px_30px_rgba(217,70,239,0.3)]">
              <div className="flex items-center gap-2 overflow-hidden flex-1 mr-4">
                <div className="w-2 h-2 rounded-full bg-fuchsia-400 animate-ping" />
                <div className="font-mono text-[9px] sm:text-[10px] text-fuchsia-200/90 truncate flex gap-3">
                  {combatLogs.slice(-2).map((log, idx) => (
                    <span key={`blade-combat-log-${idx}-${log.slice(0, 10)}`} className="tracking-tight">
                      {log}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest hidden sm:block">
                WARPER ENGINE V2.5 // ASTRAL BLADE SYNCHRONIZER
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
