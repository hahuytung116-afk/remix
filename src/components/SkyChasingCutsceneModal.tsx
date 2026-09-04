import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plane, 
  Sparkles, 
  Zap, 
  Flame, 
  ShieldAlert, 
  Crosshair, 
  Target, 
  Film, 
  Award, 
  CheckCircle,
  X,
  Volume2
} from 'lucide-react';
import { gameAudio } from '../utils/audio';

interface SkyChasingCutsceneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReward: () => void;
}

type ChaseStage = 'intro_scramble' | 'intercept_launch' | 'high_speed_chase' | 'vortex_cleave' | 'victory_aftermath';

interface SkyParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  type: 'speed_line' | 'exhaust' | 'spark' | 'cloud' | 'laser';
}

export const SkyChasingCutsceneModal: React.FC<SkyChasingCutsceneModalProps> = ({
  isOpen,
  onClose,
  onReward
}) => {
  const [stage, setStage] = useState<ChaseStage>('intro_scramble');
  const [targetLock, setTargetLock] = useState(0);
  const [speedKnots, setSpeedKnots] = useState(1200);
  const [typedDialogue, setTypedDialogue] = useState('');
  const [combatLogs, setCombatLogs] = useState<string[]>([]);
  const [isFinisherTriggered, setIsFinisherTriggered] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<SkyParticle[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  const dialogueMap: Record<ChaseStage, string> = {
    intro_scramble: "RADAR LOCK: 200 Hostiles Neutralized! Sky Fleet Command reports Cyber Cruiser Flagship escaping at Mach 4.5 through the storm clouds!",
    intercept_launch: "AFTERBURNERS ENGAGED! Arcane Warper opens supersonic slipstream portal — Air Squadron scrambling for pursuit!",
    high_speed_chase: "INTERCEPT IN PROGRESS! Closing distance: 800m... 400m... Evading plasma flak cannons — locking missile vortex!",
    vortex_cleave: "WARP DRIVE OVERCHARGE! Arcane Blade Cleave & Solar Plasma Torpedoes fired — CORE BREACH IMMINENT!",
    victory_aftermath: "TARGET DESTROYED! The skies are cleared. Sky Fleet returns in victory formation with massive salvaged resources!"
  };

  // Stage Transitions & Progression
  useEffect(() => {
    if (!isOpen) return;

    setStage('intro_scramble');
    setTargetLock(0);
    setSpeedKnots(1200);
    setIsFinisherTriggered(false);
    setCombatLogs(['[RADAR]: Stratosphere anomaly identified.', '[SQUADRON]: Scramble orders confirmed.']);

    // Play Alert Sound
    try {
      gameAudio.playSFX('gacha');
    } catch {}

    // Stage timer sequence
    const timers: NodeJS.Timeout[] = [];

    timers.push(setTimeout(() => {
      setStage('intercept_launch');
      setSpeedKnots(2400);
      try { gameAudio.playSFX('wave_start'); } catch {}
    }, 4500));

    timers.push(setTimeout(() => {
      setStage('high_speed_chase');
      setSpeedKnots(4800);
      setTargetLock(45);
      try { gameAudio.playSFX('place'); } catch {}
    }, 9500));

    timers.push(setTimeout(() => {
      setTargetLock(100);
      try { gameAudio.playSFX('upgrade'); } catch {}
    }, 14000));

    timers.push(setTimeout(() => {
      setStage('vortex_cleave');
      setSpeedKnots(6200);
      setIsFinisherTriggered(true);
      try { gameAudio.playSFX('defeat'); } catch {}
    }, 16500));

    timers.push(setTimeout(() => {
      setStage('victory_aftermath');
      try { gameAudio.playSFX('victory'); } catch {}
    }, 21500));

    return () => {
      timers.forEach(t => clearTimeout(t));
    };
  }, [isOpen]);

  // Typewriter effect for active stage
  useEffect(() => {
    if (!isOpen) return;
    const text = dialogueMap[stage] || '';
    setTypedDialogue('');
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < text.length) {
        setTypedDialogue(prev => prev + text.charAt(idx));
        idx++;
      } else {
        clearInterval(interval);
      }
    }, 22);

    return () => clearInterval(interval);
  }, [stage, isOpen]);

  // Canvas Dynamic Particle & Dogfight Simulation
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    particlesRef.current = [];

    const createParticle = (type: SkyParticle['type']): SkyParticle => {
      const w = canvas.width;
      const h = canvas.height;
      if (type === 'speed_line') {
        return {
          id: Math.random().toString(),
          x: Math.random() * w,
          y: Math.random() * h,
          vx: -(Math.random() * 25 + 20),
          vy: (Math.random() - 0.5) * 3,
          color: 'rgba(56, 189, 248, 0.7)',
          size: Math.random() * 100 + 40,
          alpha: Math.random() * 0.8 + 0.2,
          life: 40,
          maxLife: 40,
          type
        };
      }
      if (type === 'exhaust') {
        return {
          id: Math.random().toString(),
          x: w * 0.28 + (Math.random() - 0.5) * 20,
          y: h * 0.52 + (Math.random() - 0.5) * 15,
          vx: -(Math.random() * 15 + 10),
          vy: (Math.random() - 0.5) * 4,
          color: Math.random() > 0.5 ? '#06b6d4' : '#f59e0b',
          size: Math.random() * 12 + 6,
          alpha: 1.0,
          life: 30,
          maxLife: 30,
          type
        };
      }
      // Spark/Explosion
      return {
        id: Math.random().toString(),
        x: w * 0.72 + (Math.random() - 0.5) * 80,
        y: h * 0.48 + (Math.random() - 0.5) * 80,
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.5) * 20,
        color: Math.random() > 0.5 ? '#f97316' : '#ef4444',
        size: Math.random() * 8 + 3,
        alpha: 1.0,
        life: 45,
        maxLife: 45,
        type: 'spark'
      };
    };

    let frame = 0;

    const tick = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Add speed lines
      if (particlesRef.current.length < 90) {
        particlesRef.current.push(createParticle('speed_line'));
        if (stage === 'intercept_launch' || stage === 'high_speed_chase' || stage === 'vortex_cleave') {
          particlesRef.current.push(createParticle('exhaust'));
          if (stage === 'vortex_cleave') {
            particlesRef.current.push(createParticle('spark'));
            particlesRef.current.push(createParticle('spark'));
          }
        }
      }

      // Update & Draw Particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        p.alpha = p.life / p.maxLife;

        if (p.life <= 0 || p.x < -150) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        if (p.type === 'speed_line') {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.size, p.y + p.vy * 2);
          ctx.stroke();
        } else {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isOpen, stage]);

  const handleFinishAndClaim = () => {
    onReward();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/90 backdrop-blur-md overflow-hidden select-none">
      {/* Background Simulation Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

      {/* Atmospheric Horizon Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/30 via-slate-950/80 to-indigo-950/90 pointer-events-none z-0" />

      {/* Top Telemetry HUD */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.5)] animate-pulse">
            <Plane size={22} />
          </div>
          <div>
            <div className="text-sm font-black text-cyan-300 uppercase tracking-widest flex items-center gap-2">
              <span>AIRBORNE PURSUIT SQUADRON</span>
              <span className="text-[9px] bg-red-600 text-white font-mono px-2 py-0.5 rounded font-black animate-pulse">
                MACH {((speedKnots || 1200) / 767).toFixed(1)}
              </span>
            </div>
            <div className="text-[10px] font-mono text-cyan-400/80">
              STRATOSPHERIC INTERCEPT • 200 HOSTILES DOWNED
            </div>
          </div>
        </div>

        {/* Skip Cutscene Button */}
        <button
          onClick={handleFinishAndClaim}
          className="px-4 py-2 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/20 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-95 flex items-center gap-1.5"
        >
          <span>Skip Cutscene</span>
          <X size={14} />
        </button>
      </div>

      {/* Center Cinematic Stage Frame */}
      <div className="relative z-10 max-w-4xl w-full mx-4 p-6 sm:p-8 bg-slate-900/80 backdrop-blur-xl border-2 border-cyan-500/50 rounded-3xl shadow-[0_0_60px_rgba(6,182,212,0.4)] flex flex-col gap-6">
        {/* Cockpit Reticle & Dogfight Visual Display */}
        <div className="relative h-64 sm:h-80 rounded-2xl bg-slate-950/90 border border-cyan-500/30 overflow-hidden flex items-center justify-center">
          {/* Target Reticle Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className={`w-40 h-40 sm:w-56 sm:h-56 rounded-full border-2 border-dashed transition-all duration-500 flex items-center justify-center ${
              targetLock >= 100 
                ? 'border-red-500 animate-spin shadow-[0_0_30px_rgba(239,68,68,0.6)]' 
                : 'border-cyan-400/50'
            }`}>
              <div className="w-16 h-16 rounded-full border border-cyan-400/80 flex items-center justify-center">
                <Crosshair size={28} className={targetLock >= 100 ? 'text-red-400 animate-ping' : 'text-cyan-400 animate-pulse'} />
              </div>
            </div>
          </div>

          {/* Jet Fighters & Warper Motion Presentation */}
          <div className="relative z-10 w-full h-full flex items-center justify-between px-8 sm:px-16 pointer-events-none">
            {/* Player's Jet / Arcane Interceptor */}
            <motion.div 
              animate={{ 
                x: stage === 'high_speed_chase' ? [0, 15, -10, 0] : [0, 8, 0],
                y: stage === 'high_speed_chase' ? [-10, 15, -5, -10] : [0, -10, 0]
              }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="flex flex-col items-center"
            >
              <div className="relative p-4 rounded-3xl bg-cyan-950/80 border-2 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.8)]">
                <span className="text-4xl sm:text-5xl block animate-pulse">✈️</span>
                <span className="absolute -bottom-2 -right-2 text-xl">🌌</span>
              </div>
              <span className="mt-2 text-[10px] font-black text-cyan-300 font-mono tracking-wider bg-slate-900/90 px-2 py-0.5 rounded border border-cyan-500/40">
                ARCANE INTERCEPTOR
              </span>
            </motion.div>

            {/* Beam & Laser Clash */}
            {(stage === 'high_speed_chase' || stage === 'vortex_cleave') && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: [0.8, 1.2, 0.9, 1.1] }}
                transition={{ repeat: Infinity, duration: 0.2 }}
                className="flex-1 mx-4 h-2 bg-gradient-to-r from-cyan-400 via-purple-500 to-red-500 rounded-full shadow-[0_0_25px_rgba(168,85,247,0.9)]"
              />
            )}

            {/* Enemy Flagship Dreadnought */}
            <motion.div 
              animate={{ 
                x: stage === 'vortex_cleave' ? [0, -20, 20, -10, 0] : [0, -10, 0],
                y: stage === 'vortex_cleave' ? [0, 20, -20, 10, 0] : [0, 10, 0],
                opacity: stage === 'victory_aftermath' ? 0 : 1,
                scale: stage === 'vortex_cleave' ? [1, 1.15, 0.9, 1.2] : 1
              }}
              transition={{ repeat: Infinity, duration: stage === 'vortex_cleave' ? 0.2 : 3 }}
              className="flex flex-col items-center"
            >
              <div className={`p-4 sm:p-5 rounded-3xl bg-slate-900 border-2 transition-all ${
                stage === 'vortex_cleave' 
                  ? 'border-red-500 bg-red-950/80 shadow-[0_0_40px_rgba(239,68,68,0.9)] animate-pulse' 
                  : 'border-purple-500/60 shadow-[0_0_30px_rgba(168,85,247,0.5)]'
              }`}>
                <span className="text-4xl sm:text-5xl block">🛸</span>
              </div>
              <span className="mt-2 text-[10px] font-black text-rose-300 font-mono tracking-wider bg-slate-900/90 px-2 py-0.5 rounded border border-rose-500/40">
                {stage === 'vortex_cleave' ? '💥 CORE BREACH!' : 'CYBER CRUISER FLAGSHIP'}
              </span>
            </motion.div>
          </div>

          {/* Victory Fireworks Explosion on Aftermath */}
          {stage === 'victory_aftermath' && (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none bg-cyan-950/40"
            >
              <span className="text-7xl animate-bounce">🎆</span>
            </motion.div>
          )}
        </div>

        {/* Telemetry & Subtitle Dialogue Box */}
        <div className="bg-slate-950/90 p-4 sm:p-5 rounded-2xl border border-cyan-500/30 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono border-b border-white/10 pb-2">
            <span className="text-cyan-400 font-black uppercase flex items-center gap-1.5">
              <Zap size={14} className="text-cyan-300 animate-pulse" /> SQUADRON COMM LINK
            </span>
            <span className="text-slate-400">
              TARGET LOCK: <strong className={targetLock >= 100 ? 'text-red-400' : 'text-cyan-300'}>{targetLock}%</strong>
            </span>
          </div>
          <p className="text-sm sm:text-base font-medium text-cyan-100 min-h-[48px] leading-relaxed">
            {typedDialogue}
          </p>
        </div>

        {/* Action / Reward Section */}
        {stage === 'victory_aftermath' ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 p-4 rounded-2xl border border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.4)]"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/20 border border-amber-400/50 rounded-2xl text-amber-300">
                <Award size={24} />
              </div>
              <div>
                <h4 className="text-sm font-black text-amber-300 uppercase tracking-wider">
                  Sky Ace Triumph: Dogfight Bounty Awarded
                </h4>
                <div className="flex flex-wrap gap-2 text-xs font-mono mt-1">
                  <span className="text-rose-300 font-bold">+100,000 🥩 Meat</span>
                  <span className="text-cyan-300 font-bold">+50,000 🧬 DNA</span>
                  <span className="text-amber-300 font-bold">+25 🔮 Shards of Gods</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleFinishAndClaim}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 via-cyan-400 to-indigo-500 hover:from-amber-400 hover:to-indigo-400 text-slate-950 font-black uppercase text-xs tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.5)] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle size={16} /> Claim Sky Rewards
            </button>
          </motion.div>
        ) : (
          <div className="flex items-center justify-between text-xs text-slate-400 px-2">
            <span className="flex items-center gap-1.5 font-mono">
              <Flame size={14} className="text-amber-400 animate-pulse" /> Supersonic Pursuit in progress...
            </span>
            <span className="font-mono text-cyan-400 font-bold">
              {speedKnots} KNOTS
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
