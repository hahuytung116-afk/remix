import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  Zap, 
  Volume2, 
  VolumeX, 
  FastForward, 
  Crosshair,
  Flame,
  ChevronRight,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { 
  AllSeeingOverseerArtwork, 
  InfectedWarperArtwork, 
  CapybaraArtwork,
  ElementalGodArtwork
} from './artworks/OriginalAndOverseerArtworks';
import { ScientistAnimalsArtwork } from './artworks/ScientistArtwork';

interface BaseAttackPart1CutsceneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  isPreview?: boolean;
}

type CutsceneStep = 0 | 1 | 2 | 3;

interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'bullet' | 'laser' | 'plasma' | 'missile';
  color: string;
  size: number;
  length: number;
  life: number;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

export const BaseAttackPart1CutsceneModal: React.FC<BaseAttackPart1CutsceneModalProps> = ({
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
  const projectilesRef = useRef<Projectile[]>([]);
  const sparksRef = useRef<Spark[]>([]);

  // Synthesized audio helper for gunfire, lasers, and cinematic voice
  const playSFX = (type: 'siren' | 'gunfire' | 'laser' | 'hit' | 'dialogue' | 'overseer') => {
    if (isAudioMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      if (type === 'dialogue') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.08);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (type === 'overseer') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.32);
      } else if (type === 'siren') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(900, now + 0.25);
        osc.frequency.linearRampToValueAtTime(600, now + 0.5);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.56);
      } else if (type === 'gunfire') {
        // High speed rapid rattle
        for (let i = 0; i < 3; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(220 + Math.random() * 80, now + i * 0.05);
          osc.frequency.exponentialRampToValueAtTime(40, now + i * 0.05 + 0.04);
          gain.gain.setValueAtTime(0.18, now + i * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.04);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.05);
          osc.stop(now + i * 0.05 + 0.05);
        }
      } else if (type === 'laser') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.15);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'hit') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.15);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.17);
      }
    } catch {
      // Audio fallback
    }
  };

  const stepsData = [
    {
      speaker: 'WARPER (INFECTED)',
      role: 'Corrupted Arcane Deity • Mind Override Active',
      color: '#f43f5e',
      text: 'IM SORRY, I CANT...',
      subText: 'The corrupted Warper hovers above Sanctuary Base gate, crying in agony as dark red viral tendrils override his free will!',
      stage: 'warper_breach'
    },
    {
      speaker: 'ACRON OVERSEER',
      role: 'Celestial Guardian • Commander of Sanctuary Defense',
      color: '#00f0ff',
      text: 'OH HELL NAW',
      subText: 'Acron Overseer’s All-Seeing Iris blazes into maximum combat lock! His floating rings align into hyper-velocity tactical turrets!',
      stage: 'overseer_reaction'
    },
    {
      speaker: 'SANCTUARY ANIMAL DEFENSE GUILD',
      role: 'All Units Fire At Will! • Base Perimeter Defense',
      color: '#fbbf24',
      text: 'FIRE EVERYTHING! DEFEND THE BASE! DONT LET HIM TOUCH THE CORE!',
      subText: 'Capybaras man plasma cannons, Scientist Animals activate high-intensity ion lasers, and all animal defenders unleash a non-stop hail of bullets!',
      stage: 'full_barrage'
    },
    {
      speaker: 'WARPER (INFECTED)',
      role: 'Temporary Strategic Withdrawal',
      color: '#f43f5e',
      text: 'MY BODY... CONTROLS ITSELF... YOU CANNOT RESIST THE COMING OBLIVION...',
      subText: 'Shattered by the staggering storm of animal bullets and high-energy lasers, Warper’s corrupted shield flickers as he warps away temporarily!',
      stage: 'repelled'
    }
  ];

  // Initialize and advance typewriter text
  useEffect(() => {
    if (!isOpen) return;
    const fullText = stepsData[currentStep].text;
    setDisplayedText('');
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < fullText.length) {
        setDisplayedText(fullText.slice(0, idx + 1));
        if (idx % 3 === 0) {
          if (currentStep === 1) playSFX('overseer');
          else playSFX('dialogue');
        }
        idx++;
      } else {
        clearInterval(interval);
      }
    }, 28);

    if (currentStep === 0) playSFX('siren');
    if (currentStep === 1) {
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 500);
      playSFX('overseer');
    }
    if (currentStep === 2) {
      setScreenShake(true);
      playSFX('laser');
      playSFX('gunfire');
    }

    return () => clearInterval(interval);
  }, [isOpen, currentStep]);

  // Projectile and laser canvas simulation for the battle
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    let lastFireTime = 0;
    let frameId = 0;

    const render = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      // Warper Target Position (Right-Center)
      const targetX = width * 0.78;
      const targetY = height * 0.46;

      // In Step 2 (Full Barrage) and Step 1, fire massive streams of bullets and lasers
      const isBarrage = currentStep === 2 || currentStep === 1;
      const spawnRate = currentStep === 2 ? 8 : 2; // Projectiles per frame

      if (isBarrage) {
        for (let i = 0; i < spawnRate; i++) {
          // Fire from animal base line (Left side: x: 80 - 240, y: random height)
          const startX = 60 + Math.random() * 180;
          const startY = height * 0.25 + Math.random() * (height * 0.55);
          
          const angle = Math.atan2(targetY + (Math.random() * 80 - 40) - startY, targetX + (Math.random() * 60 - 30) - startX);
          const speed = 14 + Math.random() * 12;

          const pType: 'bullet' | 'laser' | 'plasma' | 'missile' = 
            Math.random() < 0.45 ? 'bullet' :
            Math.random() < 0.75 ? 'laser' :
            Math.random() < 0.9 ? 'plasma' : 'missile';

          const colors = ['#f59e0b', '#00f0ff', '#ef4444', '#10b981', '#ffffff', '#eab308', '#38bdf8'];
          const color = pType === 'laser' ? (Math.random() < 0.5 ? '#00f0ff' : '#10b981') : colors[Math.floor(Math.random() * colors.length)];

          projectilesRef.current.push({
            x: startX,
            y: startY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            type: pType,
            color,
            size: pType === 'bullet' ? 3.5 : pType === 'laser' ? 5 : pType === 'plasma' ? 7 : 4.5,
            length: pType === 'laser' ? 35 : pType === 'bullet' ? 14 : 10,
            life: 0
          });
        }

        // Trigger occasional audio rattle
        if (time - lastFireTime > 140) {
          lastFireTime = time;
          if (Math.random() < 0.6) playSFX('gunfire');
          if (Math.random() < 0.4) playSFX('laser');
        }
      }

      // Update and draw projectiles
      const activeProjectiles: Projectile[] = [];
      for (const p of projectilesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        // Draw projectile
        ctx.save();
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.strokeStyle = p.color;
        ctx.fillStyle = p.color;

        if (p.type === 'laser') {
          // Thick intense laser beam line
          ctx.lineWidth = p.size;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 1.6, p.y - p.vy * 1.6);
          ctx.stroke();

          // White hot core
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = p.size * 0.4;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 1.6, p.y - p.vy * 1.6);
          ctx.stroke();
        } else if (p.type === 'bullet') {
          // Tracer bullet with glowing tail
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 0.8, p.y - p.vy * 0.8);
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.7, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'plasma') {
          // Plasma energy orb
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Micro missile with smoke spark
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 0.9, p.y - p.vy * 0.9);
          ctx.stroke();
        }
        ctx.restore();

        // Check collision with Warper's dark energy shield
        const dx = p.x - targetX;
        const dy = p.y - targetY;
        const dist = Math.hypot(dx, dy);

        if (dist < 85) {
          // Hit! Spawn sparks & shield ripple
          const sparkCount = p.type === 'laser' ? 5 : 3;
          for (let s = 0; s < sparkCount; s++) {
            const spAngle = Math.random() * Math.PI * 2;
            const spSpeed = 2 + Math.random() * 6;
            sparksRef.current.push({
              x: p.x,
              y: p.y,
              vx: Math.cos(spAngle) * spSpeed,
              vy: Math.sin(spAngle) * spSpeed,
              color: Math.random() < 0.5 ? p.color : '#f43f5e',
              size: 2 + Math.random() * 3,
              life: 0,
              maxLife: 15 + Math.random() * 15
            });
          }
          continue; // Consumed
        }

        // Keep inside bounds
        if (p.x < width + 100 && p.y > -50 && p.y < height + 50 && p.life < 80) {
          activeProjectiles.push(p);
        }
      }
      projectilesRef.current = activeProjectiles;

      // Update and draw sparks
      const activeSparks: Spark[] = [];
      for (const sp of sparksRef.current) {
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.life++;

        const alpha = 1 - sp.life / sp.maxLife;
        if (alpha > 0) {
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = sp.color;
          ctx.shadowColor = sp.color;
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.size * alpha, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          activeSparks.push(sp);
        }
      }
      sparksRef.current = activeSparks;

      // Draw Warper's Corrupted Kinetic Shield around Warper
      if (isBarrage) {
        ctx.save();
        ctx.strokeStyle = '#f43f5e';
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 18;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(targetX, targetY, 82 + Math.sin(time * 0.01) * 6, -Math.PI * 0.7, Math.PI * 0.7);
        ctx.stroke();
        ctx.restore();
      }

      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
    };
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as CutsceneStep);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    if (onComplete) onComplete();
    onClose();
  };

  const currentStepData = stepsData[currentStep];

  return (
    <AnimatePresence>
      <div 
        id="base-attack-part1-modal"
        className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 select-none overflow-hidden"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`relative w-full max-w-5xl h-[88vh] max-h-[720px] bg-gradient-to-b from-slate-950 via-zinc-950 to-black border-2 border-rose-600/40 rounded-3xl shadow-[0_0_80px_rgba(244,63,94,0.3)] flex flex-col overflow-hidden ${
            screenShake ? 'animate-bounce' : ''
          }`}
        >
          {/* Top Header Bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-rose-900/40 bg-zinc-950/80 z-20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-950/80 border border-rose-500/50 flex items-center justify-center text-rose-400">
                <ShieldAlert size={18} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black tracking-widest text-rose-400 uppercase">
                    LORE CHRONICLES • WAVE 240
                  </span>
                  <span className="px-2 py-0.5 text-[9px] font-extrabold bg-rose-950 border border-rose-500/40 text-rose-300 rounded-full">
                    BASE SIEGE PART 1
                  </span>
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Siege on Sanctuary Base: Animal Guild Defense
                </h3>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAudioMuted(!isAudioMuted)}
                className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-700/50 text-zinc-300 hover:text-white transition-all active:scale-95 cursor-pointer"
                title={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
              >
                {isAudioMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>

              <button
                type="button"
                onClick={handleComplete}
                className="px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-700/50 text-xs font-bold text-zinc-400 hover:text-white hover:border-zinc-500 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <span>SKIP</span>
                <FastForward size={14} />
              </button>
            </div>
          </div>

          {/* Cinematic Battlefield Stage */}
          <div className="relative flex-1 w-full bg-gradient-to-b from-slate-900/70 via-black to-zinc-950 flex items-center justify-between px-6 sm:px-12 overflow-hidden">
            {/* Background Red Warning Alarm Flashing */}
            <div className="absolute inset-0 bg-rose-600/5 animate-pulse pointer-events-none" />

            {/* Canvas for High Density Bullets, Lasers, and Particle Explosions */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
            />

            {/* Base Defense Wall Line Grid */}
            <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-gradient-to-r from-cyan-950/20 to-transparent border-r border-cyan-500/10 pointer-events-none" />

            {/* LEFT SIDE: Animal Defense Forces led by Acron Overseer */}
            <div className="relative z-10 flex flex-col items-center max-w-[280px] sm:max-w-[340px]">
              {/* Defense Beacon HUD */}
              <div className="mb-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[10px] font-black text-cyan-300 uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <Crosshair size={12} className="text-cyan-400 animate-spin" />
                <span>SANCTUARY PERIMETER DEFENSE</span>
              </div>

              {/* Main Defender: Acron Overseer */}
              <motion.div
                animate={{
                  scale: currentStep === 1 || currentStep === 2 ? [1, 1.08, 1] : 1,
                  y: [0, -6, 0]
                }}
                transition={{
                  scale: { duration: 0.3, repeat: currentStep === 2 ? Infinity : 0 },
                  y: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
                }}
                className={`relative w-36 h-36 sm:w-44 sm:h-44 rounded-3xl p-3 border-2 ${
                  currentStep === 1 || currentStep === 2
                    ? 'border-cyan-400 shadow-[0_0_40px_rgba(0,240,255,0.6)] bg-cyan-950/60'
                    : 'border-cyan-500/40 bg-zinc-900/60'
                } transition-all duration-300`}
              >
                <AllSeeingOverseerArtwork className="w-full h-full drop-shadow-[0_0_25px_rgba(0,240,255,0.5)]" />
                
                {/* Overseer Iris Charging Flash */}
                {(currentStep === 1 || currentStep === 2) && (
                  <div className="absolute inset-0 rounded-3xl bg-cyan-400/10 animate-ping pointer-events-none" />
                )}
              </motion.div>

              {/* Defender Animals Line (Flanking Allies) */}
              <div className="flex items-center gap-2 mt-3">
                {/* Capybara Turret Operator */}
                <div className="w-12 h-12 rounded-xl bg-amber-950/60 border border-amber-500/40 p-1 relative shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                  <CapybaraArtwork className="w-full h-full" />
                  <span className="absolute -bottom-1 -right-1 px-1 bg-amber-600 text-white text-[7px] font-black rounded">DEF</span>
                </div>
                {/* Scientist Animal Support */}
                <div className="w-12 h-12 rounded-xl bg-cyan-950/60 border border-cyan-500/40 p-1 relative shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                  <ScientistAnimalsArtwork className="w-full h-full" />
                  <span className="absolute -bottom-1 -right-1 px-1 bg-cyan-600 text-white text-[7px] font-black rounded">SCI</span>
                </div>
                {/* Elemental Deity Support */}
                <div className="w-12 h-12 rounded-xl bg-purple-950/60 border border-purple-500/40 p-1 relative shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                  <ElementalGodArtwork className="w-full h-full" />
                  <span className="absolute -bottom-1 -right-1 px-1 bg-purple-600 text-white text-[7px] font-black rounded">ARC</span>
                </div>
              </div>

              <div className="mt-2 text-center">
                <span className="text-xs font-black text-cyan-300 uppercase tracking-widest">
                  ACRON OVERSEER & ANIMAL GUILD
                </span>
                <p className="text-[10px] text-zinc-400">
                  Defending Sanctuary Gates with concentrated bullet & laser storms
                </p>
              </div>
            </div>

            {/* VS Shockwave Divider */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="px-3 py-1 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 font-black text-xs tracking-widest uppercase shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse">
                SIEGE BREACH
              </div>
              <div className="w-0.5 h-16 bg-gradient-to-b from-transparent via-red-500 to-transparent my-2" />
            </div>

            {/* RIGHT SIDE: Corrupted Arcane Warper Assaulting */}
            <div className="relative z-10 flex flex-col items-center max-w-[280px] sm:max-w-[340px]">
              {/* Boss Warning Indicator */}
              <div className="mb-2 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/40 text-[10px] font-black text-rose-300 uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                <AlertTriangle size={12} className="text-rose-400 animate-bounce" />
                <span>CORRUPTED APEX INFILTRATOR</span>
              </div>

              {/* Warper Artwork with Glitch Aura */}
              <motion.div
                animate={{
                  x: currentStep === 2 ? [-4, 6, -6, 4] : [0, 4, 0],
                  y: [0, -8, 0],
                  filter: currentStep === 2 ? 'brightness(1.3) contrast(1.2)' : 'brightness(1)'
                }}
                transition={{
                  x: { duration: 0.15, repeat: currentStep === 2 ? Infinity : 0 },
                  y: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
                }}
                className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-3xl p-3 border-2 border-rose-500/60 bg-rose-950/40 shadow-[0_0_50px_rgba(244,63,94,0.5)] transition-all duration-300"
              >
                <InfectedWarperArtwork className="w-full h-full drop-shadow-[0_0_30px_rgba(244,63,94,0.8)]" />

                {/* Glitch Overlay Effect */}
                <div className="absolute inset-0 rounded-3xl border border-rose-400/30 pointer-events-none animate-pulse" />
              </motion.div>

              <div className="mt-4 text-center">
                <span className="text-xs font-black text-rose-400 uppercase tracking-widest">
                  WARPER (INFECTED)
                </span>
                <p className="text-[10px] text-zinc-400">
                  1st Arcane Fallen • Syndicate Mind Parasite Level 99
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Dialogue Box & Narrative Controls */}
          <div className="relative z-20 p-4 sm:p-6 bg-gradient-to-t from-black via-zinc-950 to-zinc-950/90 border-t border-rose-900/40 flex flex-col gap-3">
            {/* Speaker Tag */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider border"
                  style={{
                    color: currentStepData.color,
                    borderColor: `${currentStepData.color}55`,
                    backgroundColor: `${currentStepData.color}15`,
                    boxShadow: `0 0 12px ${currentStepData.color}33`
                  }}
                >
                  {currentStepData.speaker}
                </span>
                <span className="text-[11px] text-zinc-400 font-medium hidden sm:inline">
                  {currentStepData.role}
                </span>
              </div>

              {/* Step dots */}
              <div className="flex items-center gap-1.5">
                {stepsData.map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === currentStep
                        ? 'w-6 bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)]'
                        : i < currentStep
                        ? 'w-2 bg-rose-800'
                        : 'w-2 bg-zinc-800'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Dialogue Text Typewriter */}
            <div className="min-h-[58px] flex flex-col justify-center">
              <p
                className="text-base sm:text-lg font-black tracking-wide drop-shadow-md"
                style={{ color: currentStepData.color }}
              >
                "{displayedText}"
              </p>
              <p className="text-xs text-zinc-400 mt-1 italic">
                {currentStepData.subText}
              </p>
            </div>

            {/* Bottom Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
              <span className="text-[10px] text-zinc-500 font-mono">
                PRESS [SPACE] OR CLICK NEXT TO PROCEED
              </span>

              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-[0_0_20px_rgba(244,63,94,0.4)] flex items-center gap-2"
              >
                <span>{currentStep === 3 ? 'REPEL INVASION (COMPLETE)' : 'NEXT ACT'}</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
