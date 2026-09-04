import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, 
  Zap, 
  Volume2, 
  VolumeX, 
  FastForward, 
  ChevronRight,
  Sparkles,
  AlertOctagon,
  Skull,
  Shield,
  Activity
} from 'lucide-react';
import { 
  InfectedWarperArtwork 
} from './artworks/OriginalAndOverseerArtworks';
import { UpgradedRageTitanArtwork } from './artworks/UpgradedTitanArtwork';
import { ScientistAnimalsArtwork } from './artworks/ScientistArtwork';

interface BaseAttackPart2CutsceneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  isPreview?: boolean;
}

type CutsceneStep = 0 | 1 | 2 | 3 | 4;

interface Debris {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vRot: number;
  size: number;
  color: string;
  type: 'rock' | 'metal' | 'spark';
  life: number;
  maxLife: number;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
  lineWidth: number;
}

export const BaseAttackPart2CutsceneModal: React.FC<BaseAttackPart2CutsceneModalProps> = ({
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
  const debrisRef = useRef<Debris[]>([]);
  const shockwavesRef = useRef<Shockwave[]>([]);

  // Synthesized audio helper for seismic slams, metal tearing, and dramatic screams
  const playSFX = (type: 'grave' | 'entrance' | 'escape' | 'rage_slam' | 'debris' | 'dialogue') => {
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
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.08);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (type === 'grave') {
        // Low ominous void death toll
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.linearRampToValueAtTime(45, now + 0.8);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.85);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.9);
      } else if (type === 'entrance') {
        // Vault door explosion & hydraulic powerup
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(180, now);
        osc1.frequency.exponentialRampToValueAtTime(50, now + 0.4);
        gain1.gain.setValueAtTime(0.4, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.46);

        // Rising quantum synth
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(220, now + 0.2);
        osc2.frequency.exponentialRampToValueAtTime(880, now + 0.65);
        gain2.gain.setValueAtTime(0.3, now + 0.2);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.7);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.2);
        osc2.stop(now + 0.72);
      } else if (type === 'escape') {
        // High speed dimensional wormhole zoom
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.45);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.48);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === 'rage_slam') {
        // Massive seismic floor-shattering shockwave
        for (let i = 0; i < 4; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = i % 2 === 0 ? 'sawtooth' : 'triangle';
          osc.frequency.setValueAtTime(110 - i * 15, now + i * 0.08);
          osc.frequency.exponentialRampToValueAtTime(25, now + i * 0.08 + 0.5);
          gain.gain.setValueAtTime(0.45, now + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.55);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.56);
        }
      } else if (type === 'debris') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.2);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.23);
      }
    } catch {
      // Audio fallback
    }
  };

  const stepsData = [
    {
      speaker: 'WARPER (INFECTED)',
      role: 'Breached Command Deck • Cataclysmic Doom',
      color: '#f43f5e',
      text: '...ALL GOES DOWN TO GRAVE',
      subText: 'Warper charges a colossal dark singularity above the command core. Defense shields are failing and all seems lost!',
      stage: 'grave_threat'
    },
    {
      speaker: 'TITAN DEFENDER (UPGRADED)',
      role: 'Heavy Armored Vanguard • New TV/Quantum System Active',
      color: '#00f0ff',
      text: 'ROOOAAAR! TARGET LOCKED: CORRUPTED PURGE!',
      subText: 'The reinforced containment doors blow completely off their hinges! Upgraded Titan emerges in gleaming titanium-quantum armor and dual railcannons!',
      stage: 'titan_appearance'
    },
    {
      speaker: 'WARPER (INFECTED)',
      role: 'Overwhelmed in Terror • Emergency Rift Evasion',
      color: '#fb7185',
      text: 'NO... WHAT IS THAT POWER...?! RETREAT! RETREAT!',
      subText: 'Gazing at Titan’s terrifying upgrade, Warper breaks into frantic panic and flees through an emergency wormhole rift into the dark void!',
      stage: 'warper_flees'
    },
    {
      speaker: 'TITAN (FULL RAGE)',
      role: 'Cataclysmic Berserk Overdrive • Base Destruction',
      color: '#ef4444',
      text: 'GRAAAAHHHHH! DONT RUN, YOU COWARD! UNFORGIVABLE!',
      subText: 'In absolute berserk rage and with his quantum reactor overclocked at 500%, Titan strikes the command deck floor with apocalyptic fury, demolishing Sector 4 of the base!',
      stage: 'titan_full_rage'
    },
    {
      speaker: 'SCIENTIST ANIMALS & TITAN',
      role: 'Post-Rage Cool Down • Sector 4 Casualties Cleared',
      color: '#38bdf8',
      text: 'TITAN: "He escaped... but I will hunt him down." • SCIENTISTS: "Base wing 4 is totaled, but the upgrade saved us all!"',
      subText: 'Titan’s TV visor flashes amber as steam exhausts from his shoulders. The Sanctuary stands, battle-scarred but undefeated!',
      stage: 'aftermath'
    }
  ];

  // Advance typewriter text
  useEffect(() => {
    if (!isOpen) return;
    const fullText = stepsData[currentStep].text;
    setDisplayedText('');
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < fullText.length) {
        setDisplayedText(fullText.slice(0, idx + 1));
        if (idx % 3 === 0) {
          playSFX('dialogue');
        }
        idx++;
      } else {
        clearInterval(interval);
      }
    }, 28);

    if (currentStep === 0) {
      playSFX('grave');
    } else if (currentStep === 1) {
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 600);
      playSFX('entrance');
    } else if (currentStep === 2) {
      playSFX('escape');
    } else if (currentStep === 3) {
      // Violent screen shaking for full rage base destruction
      setScreenShake(true);
      playSFX('rage_slam');
      setTimeout(() => {
        playSFX('debris');
      }, 350);
      setTimeout(() => setScreenShake(false), 1200);
    }

    return () => clearInterval(interval);
  }, [isOpen, currentStep]);

  // Canvas simulation for base destruction, rubble, electrical arcs & shockwaves
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

    let frameId = 0;

    const render = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      const titanX = width * 0.45;
      const titanY = height * 0.52;

      // In Step 3 (Titan Full Rage), generate massive base destruction debris, dust, sparks and shockwaves
      if (currentStep === 3) {
        // Periodic ground shockwaves
        if (Math.random() < 0.15) {
          shockwavesRef.current.push({
            x: titanX,
            y: height * 0.75,
            radius: 10,
            maxRadius: width * 0.6,
            color: Math.random() < 0.5 ? '#ef4444' : '#00f0ff',
            alpha: 1,
            lineWidth: 4
          });
        }

        // Spawn shattered concrete & metal rebar chunks
        for (let i = 0; i < 6; i++) {
          const angle = -Math.PI * 0.1 - Math.random() * Math.PI * 0.8;
          const speed = 6 + Math.random() * 12;
          debrisRef.current.push({
            x: titanX + (Math.random() * 120 - 60),
            y: height * 0.72 + (Math.random() * 30 - 15),
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            rot: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 0.3,
            size: 4 + Math.random() * 9,
            color: Math.random() < 0.4 ? '#475569' : Math.random() < 0.7 ? '#1e293b' : '#ea580c',
            type: Math.random() < 0.6 ? 'rock' : Math.random() < 0.85 ? 'metal' : 'spark',
            life: 0,
            maxLife: 40 + Math.random() * 30
          });
        }
      }

      // In Step 2 (Warper Flees), draw warping distortion rings
      if (currentStep === 2) {
        ctx.save();
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 3;
        ctx.beginPath();
        const riftRadius = 30 + (time * 0.1) % 60;
        ctx.arc(width * 0.82, height * 0.45, riftRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Update and draw shockwaves
      const activeShockwaves: Shockwave[] = [];
      for (const sw of shockwavesRef.current) {
        sw.radius += 12;
        sw.alpha = 1 - sw.radius / sw.maxRadius;

        if (sw.alpha > 0) {
          ctx.save();
          ctx.globalAlpha = sw.alpha;
          ctx.strokeStyle = sw.color;
          ctx.lineWidth = sw.lineWidth;
          ctx.shadowColor = sw.color;
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.ellipse(sw.x, sw.y, sw.radius, sw.radius * 0.35, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
          activeShockwaves.push(sw);
        }
      }
      shockwavesRef.current = activeShockwaves;

      // Update and draw shattered base debris
      const activeDebris: Debris[] = [];
      for (const d of debrisRef.current) {
        d.x += d.vx;
        d.y += d.vy;
        d.vy += 0.35; // Gravity
        d.rot += d.vRot;
        d.life++;

        const alpha = 1 - d.life / d.maxLife;
        if (alpha > 0 && d.y < height + 50) {
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = d.color;
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 1;

          ctx.translate(d.x, d.y);
          ctx.rotate(d.rot);

          if (d.type === 'rock') {
            // Irregular chunk
            ctx.beginPath();
            ctx.moveTo(-d.size, -d.size * 0.6);
            ctx.lineTo(d.size * 0.8, -d.size);
            ctx.lineTo(d.size, d.size * 0.8);
            ctx.lineTo(-d.size * 0.7, d.size);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          } else if (d.type === 'metal') {
            // Twisted rebar piece
            ctx.fillRect(-d.size * 1.2, -2, d.size * 2.4, 4);
          } else {
            // Fiery spark
            ctx.fillStyle = '#f59e0b';
            ctx.shadowColor = '#ea580c';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(0, 0, d.size * 0.5, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
          activeDebris.push(d);
        }
      }
      debrisRef.current = activeDebris;

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
    if (currentStep < 4) {
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
        id="base-attack-part2-modal"
        className="fixed inset-0 z-[120] flex items-center justify-center bg-black/92 backdrop-blur-md p-2 sm:p-4 select-none overflow-hidden"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`relative w-full max-w-5xl h-[88vh] max-h-[720px] bg-gradient-to-b from-zinc-950 via-slate-950 to-black border-2 border-red-600/50 rounded-3xl shadow-[0_0_90px_rgba(239,68,68,0.35)] flex flex-col overflow-hidden ${
            screenShake ? 'animate-ping' : ''
          }`}
        >
          {/* Top Header Bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-red-900/40 bg-zinc-950/90 z-20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-500/50 flex items-center justify-center text-red-400">
                <AlertOctagon size={18} className="animate-spin" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black tracking-widest text-red-400 uppercase">
                    LORE CHRONICLES • WAVE 256
                  </span>
                  <span className="px-2 py-0.5 text-[9px] font-extrabold bg-red-950 border border-red-500/40 text-red-300 rounded-full">
                    BASE SIEGE PART 2
                  </span>
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Cataclysmic Fury: The Wrath of Upgraded Titan
                </h3>
              </div>
            </div>

            {/* Controls */}
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
          <div className="relative flex-1 w-full bg-gradient-to-b from-red-950/20 via-black to-zinc-950 flex items-center justify-between px-6 sm:px-12 overflow-hidden">
            {/* Canvas for Shattered Rubble, Electrical Arcs, and Seismic Rings */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
            />

            {/* Visual Base Destruction Damage Overlays */}
            {currentStep >= 3 && (
              <>
                {/* Cracked Pillar Overlay on Left */}
                <div className="absolute left-6 top-8 bottom-8 w-16 border-r-4 border-dashed border-red-500/40 opacity-70 pointer-events-none rotate-6" />
                {/* Burning Base Wing Label */}
                <div className="absolute top-4 left-8 px-3 py-1 bg-red-950/90 border border-red-500/60 rounded text-[9px] font-black text-red-300 uppercase tracking-widest shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                  ⚠️ SECTOR 4 BULKHEAD COMPROMISED
                </div>
              </>
            )}

            {/* LEFT / CENTER: UPGRADED TITAN DEFENDER */}
            <div className={`relative z-10 flex flex-col items-center transition-all duration-700 ${
              currentStep === 0 ? 'opacity-30 scale-90 translate-x-[-40px]' : 'opacity-100 scale-100 translate-x-0'
            }`}>
              {/* Upgrade Badge HUD */}
              <div className="mb-2 px-3 py-1 rounded-full bg-cyan-950/90 border border-cyan-400/60 text-[10px] font-black text-cyan-300 uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_20px_rgba(0,240,255,0.4)]">
                <Sparkles size={12} className="text-cyan-400 animate-spin" />
                <span>{currentStep === 3 ? 'OVERCLOCK 500% • FULL BERSERK RAGE' : 'OVERHAULED QUANTUM TITAN UPGRADE'}</span>
              </div>

              {/* Upgraded Titan Artwork */}
              <motion.div
                animate={{
                  scale: currentStep === 3 ? [1.05, 1.15, 1.05] : [1, 1.03, 1],
                  y: currentStep === 3 ? [0, -10, 0] : [0, -4, 0]
                }}
                transition={{
                  scale: { duration: currentStep === 3 ? 0.2 : 2.5, repeat: Infinity },
                  y: { duration: currentStep === 3 ? 0.15 : 3, repeat: Infinity, ease: 'easeInOut' }
                }}
                className={`relative w-44 h-44 sm:w-56 sm:h-56 rounded-3xl p-3 border-2 ${
                  currentStep === 3
                    ? 'border-red-500 bg-red-950/60 shadow-[0_0_60px_rgba(239,68,68,0.7)]'
                    : 'border-cyan-400/80 bg-slate-950/70 shadow-[0_0_50px_rgba(0,240,255,0.5)]'
                } transition-all duration-300`}
              >
                <UpgradedRageTitanArtwork className="w-full h-full drop-shadow-[0_0_35px_rgba(0,240,255,0.6)]" />

                {/* Violent Red Rage Halo during step 3 */}
                {currentStep === 3 && (
                  <div className="absolute inset-0 rounded-3xl bg-red-600/20 animate-ping pointer-events-none" />
                )}
              </motion.div>

              <div className="mt-3 text-center">
                <span className="text-xs font-black text-cyan-300 uppercase tracking-widest">
                  {currentStep === 3 ? 'TITAN (FULL RAGE MODE)' : 'TITAN DEFENDER (NEW UPGRADE)'}
                </span>
                <p className="text-[10px] text-zinc-400">
                  {currentStep === 3 ? 'Apocalyptic Ground Slams Shattering Sector 4' : 'Equipped with Heavy Shoulder Railcannons & TV HUD'}
                </p>
              </div>
            </div>

            {/* RIGHT SIDE: CORRUPTED WARPER (Grave Threat -> Panic Escape) */}
            <div className="relative z-10 flex flex-col items-center max-w-[280px]">
              {/* Status Header */}
              <div className="mb-2 px-3 py-1 rounded-full bg-rose-950/90 border border-rose-500/50 text-[10px] font-black text-rose-300 uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                {currentStep >= 2 ? (
                  <>
                    <Activity size={12} className="text-amber-400 animate-spin" />
                    <span>EMERGENCY ESCAPE: FLEEING BASE!</span>
                  </>
                ) : (
                  <>
                    <Skull size={12} className="text-rose-400 animate-bounce" />
                    <span>CATACLYSMIC INVASION</span>
                  </>
                )}
              </div>

              {/* Warper Container with Flee Animation */}
              <motion.div
                animate={{
                  x: currentStep >= 2 ? [0, 80, 200] : [0, -5, 0],
                  opacity: currentStep >= 2 ? [1, 0.4, 0] : 1,
                  scale: currentStep >= 2 ? [1, 0.7, 0.2] : [1, 1.05, 1]
                }}
                transition={{
                  x: { duration: currentStep >= 2 ? 0.8 : 2, ease: 'easeIn' },
                  opacity: { duration: currentStep >= 2 ? 0.8 : 2 },
                  scale: { duration: currentStep >= 2 ? 0.8 : 2 }
                }}
                className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-3xl p-3 border-2 border-rose-500/60 bg-rose-950/40 shadow-[0_0_50px_rgba(244,63,94,0.5)] transition-all duration-300"
              >
                <InfectedWarperArtwork className="w-full h-full drop-shadow-[0_0_30px_rgba(244,63,94,0.8)]" />

                {/* Spatial Rift Warp Trail when fleeing */}
                {currentStep >= 2 && (
                  <div className="absolute inset-0 rounded-3xl bg-purple-600/30 animate-pulse pointer-events-none" />
                )}
              </motion.div>

              <div className="mt-3 text-center">
                <span className="text-xs font-black text-rose-400 uppercase tracking-widest">
                  WARPER (INFECTED)
                </span>
                <p className="text-[10px] text-zinc-400">
                  {currentStep >= 2 ? 'Retreating into dimensional tear in terror!' : 'Ready to annihilate the entire base core'}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Dialogue Box & Narrative Controls */}
          <div className="relative z-20 p-4 sm:p-6 bg-gradient-to-t from-black via-zinc-950 to-zinc-950/90 border-t border-red-900/40 flex flex-col gap-3">
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
                        ? 'w-6 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]'
                        : i < currentStep
                        ? 'w-2 bg-red-800'
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
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-cyan-600 hover:from-red-500 hover:to-cyan-500 text-white font-black text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center gap-2"
              >
                <span>{currentStep === 4 ? 'BASE DEFENSE SECURED (CLAIM REWARD)' : 'NEXT ACT'}</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
