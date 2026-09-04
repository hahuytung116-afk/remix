import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ShieldAlert, 
  Zap, 
  RefreshCw, 
  Flame, 
  ShieldCheck, 
  Swords, 
  Grid, 
  Skull, 
  ArrowRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { Animal } from '../types';

interface UnrivaledCutsceneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReward: () => void;
  bossName?: string;
}

type CutsceneStage = 'intro' | 'unrivaled_descends' | 'climax_charging' | 'reality_shatter' | 'annihilation' | 'victory_aftermath';

interface UnrivaledParticle {
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
}

export function UnrivaledCutsceneModal({ 
  isOpen, 
  onClose, 
  onReward,
  bossName = "The Unrivaled Original"
}: UnrivaledCutsceneModalProps) {
  const [stage, setStage] = useState<CutsceneStage>('intro');
  const [bossHP, setBossHP] = useState(100);
  const [typedBossText, setTypedBossText] = useState('');
  const [typedUnrivaledText, setTypedUnrivaledText] = useState('');
  const [chargeProgress, setChargeProgress] = useState(0);
  const [isFinisherFired, setIsFinisherFired] = useState(false);
  const [combatLogs, setCombatLogs] = useState<string[]>([]);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<UnrivaledParticle[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  // Typewriter effect for dialogue
  const bossDialogue = "Foolish carbon creations... I am the Unrivaled Original. The template of every beast. Your little mutations cannot supersede my supreme code blueprint!";
  const unrivaledDialogue = "Your reign of codes ends now, Original template. Witness the manifestation of absolute evolution: UNRIVALED REALITY OVERWRITE!";

  useEffect(() => {
    if (!isOpen) return;
    
    // Reset state
    setStage('intro');
    setBossHP(100);
    setTypedBossText('');
    setTypedUnrivaledText('');
    setChargeProgress(0);
    setIsFinisherFired(false);
    setCombatLogs(['SYSTEM: Primordial Anomaly Detected.', 'SYSTEM: Entering Reality-Overwrite boundary.']);

    // Typewriter for boss dialogue
    let bossIdx = 0;
    const bossTimer = setInterval(() => {
      if (bossIdx < bossDialogue.length) {
        setTypedBossText(prev => prev + bossDialogue.charAt(bossIdx));
        bossIdx++;
      } else {
        clearInterval(bossTimer);
      }
    }, 28);

    return () => {
      clearInterval(bossTimer);
    };
  }, [isOpen]);

  // Particle background canvas simulation
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Populate initial dust
    particlesRef.current = [];
    for (let i = 0; i < 40; i++) {
      particlesRef.current.push(createParticle(canvas.width / 2, canvas.height / 2, true));
    }

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1;
        p.alpha = p.life / p.maxLife;

        // Draw radial glowing particle
        ctx.save();
        ctx.globalAlpha = p.alpha;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
        grad.addColorStop(0, p.color);
        grad.addColorStop(0.3, p.color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (p.life <= 0) {
          particles.splice(i, 1);
        }
      }

      // Automatically spawn celestial sparkles
      if (particles.length < 150) {
        const pColor = stage === 'reality_shatter' || stage === 'annihilation' 
          ? (Math.random() > 0.5 ? '#f59e0b' : '#ec4899') 
          : '#38bdf8';
        particles.push(createParticle(Math.random() * canvas.width, Math.random() * canvas.height, false, pColor));
      }

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isOpen, stage]);

  const createParticle = (x: number, y: number, randomVelocity = false, customColor?: string): UnrivaledParticle => {
    const rColors = ['#f59e0b', '#ec4899', '#a855f7', '#10b981', '#ffffff'];
    const chosenColor = customColor || rColors[Math.floor(Math.random() * rColors.length)];
    return {
      id: Math.random().toString(),
      x,
      y,
      vx: randomVelocity ? (Math.random() - 0.5) * 8 : (Math.random() - 0.5) * 2,
      vy: randomVelocity ? (Math.random() - 0.5) * 8 : (Math.random() - 0.5) * 2 - 1,
      color: chosenColor,
      size: Math.random() * 4 + 2,
      maxLife: Math.random() * 80 + 40,
      life: Math.random() * 80 + 40,
      alpha: 1
    };
  };

  const handleNextToEnters = () => {
    setStage('unrivaled_descends');
    setCombatLogs(prev => [...prev, 'SYSTEM: Over-Dimensional Portal Opened.', 'UNRIVALED: Initiated Cosmic Override Protocol.']);
    
    // Type unrivaled dialogue
    let unrivIdx = 0;
    const unrivTimer = setInterval(() => {
      if (unrivIdx < unrivaledDialogue.length) {
        setTypedUnrivaledText(prev => prev + unrivaledDialogue.charAt(unrivIdx));
        unrivIdx++;
      } else {
        clearInterval(unrivTimer);
      }
    }, 28);
  };

  const handleNextToCharge = () => {
    setStage('climax_charging');
    setCombatLogs(prev => [...prev, 'SYSTEM: Gathering nuclear dark matter stars.', 'UNRIVALED: Loading reality-sifting matrices...']);

    // Simulate charging bar
    let progress = 0;
    const interval = setInterval(() => {
      progress += 4;
      if (progress >= 100) {
        setChargeProgress(100);
        clearInterval(interval);
        setCombatLogs(prev => [...prev, 'SYSTEM: EXTREME CONCENTRATION OF UNRIVALED ENERGY OBTAINED.', 'SYSTEM: FINISHER READY FOR REALITY INTEGRATION!']);
      } else {
        setChargeProgress(progress);
        if (progress % 20 === 0) {
          setCombatLogs(prev => [...prev, `UNRIVALED core charged to ${progress}%`]);
        }
      }
    }, 100);
  };

  const triggerRealityShatter = () => {
    setIsFinisherFired(true);
    setStage('reality_shatter');
    setCombatLogs(prev => [...prev, 'CRITICAL: COMMENCING REALITY SHATTER BLOCK!', 'UNRIVALED: Firing Zero-Point singularity spark!']);

    // Explode massive batch of gold and neon-rose particles at screen center
    const canvas = canvasRef.current;
    if (canvas) {
      for (let i = 0; i < 120; i++) {
        particlesRef.current.push(createParticle(canvas.width / 2, canvas.height / 2, true, Math.random() > 0.5 ? '#f59e0b' : '#ec4899'));
      }
    }

    setTimeout(() => {
      setStage('annihilation');
      // Deplete boss HP rapidly
      let currentBossHP = 100;
      const hpInterval = setInterval(() => {
        currentBossHP -= 8;
        if (currentBossHP <= 0) {
          setBossHP(0);
          clearInterval(hpInterval);
          setCombatLogs(prev => [...prev, 'THE UNRIVALED ORIGINAL: No... Impossible! My primal structure is collapsing!', 'SYSTEM: Anomaly extinguished. Matrix rebuilt successfully.']);
          
          setTimeout(() => {
            setStage('victory_aftermath');
          }, 1500);
        } else {
          setBossHP(currentBossHP);
        }
      }, 80);
    }, 1800);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black overflow-hidden font-sans select-none">
        
        {/* Canvas for cinematic particle rendering */}
        <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

        {/* Ambient grids, overlays, and color grading flares */}
        <div className={`absolute inset-0 transition-all duration-1000 z-0 pointer-events-none ${
          stage === 'reality_shatter' ? 'bg-amber-500/10' : stage === 'annihilation' ? 'bg-rose-500/10' : 'bg-transparent'
        }`} />
        
        {/* Aesthetic Tech Lines */}
        <div className="absolute inset-y-0 left-10 w-[1px] bg-white/5 border-l border-indigo-500/10 pointer-events-none hidden md:block" />
        <div className="absolute inset-y-0 right-10 w-[1px] bg-white/5 border-r border-indigo-500/10 pointer-events-none hidden md:block" />

        {/* Cinematic HUD Top Bar */}
        <div className="absolute top-0 inset-x-0 h-16 bg-slate-950/90 border-b border-amber-500/30 flex items-center justify-between px-6 z-20 backdrop-blur-md">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="text-amber-400 animate-pulse" size={16} />
            <span className="text-[10px] font-black tracking-[0.3em] text-amber-300 uppercase">
              REALITY THREAT ENVELOPE // ZONE INFINITY
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <motion.div 
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-[9px] font-mono text-amber-300 bg-amber-950/55 border border-amber-500/30 px-3 py-1 rounded font-black uppercase tracking-wider"
            >
              UNRIVALED LOCKOFF PROTOCOL: ACTIVE
            </motion.div>
          </div>
        </div>

        {/* Cinematic HUD Bottom Bar */}
        <div className="absolute bottom-0 inset-x-0 h-16 bg-slate-950/90 border-t border-indigo-500/30 flex items-center justify-between px-6 z-20 backdrop-blur-md">
          <div className="text-[10px] font-mono text-cyan-300 flex items-center gap-1.5 font-bold uppercase tracking-widest">
            <Sparkles size={11} className="text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
            REALITY STABILITY COGNITION: {stage === 'reality_shatter' ? 'SHATTERED' : 'ALIGNING'}
          </div>
          <div className="text-[9px] font-mono text-slate-500 hidden sm:block uppercase">
            COSMIC MATRIX RECONSTITUTOR // ALPHA 1.0.3
          </div>
        </div>

        {/* MAIN CINEMATIC WORKSPACE CONTAINER */}
        <div className="w-full max-w-4xl px-4 flex flex-col items-center justify-center h-full relative z-10 py-16">
          
          {/* STAGE 1: INTRO (THE UNRIVALED ORIGINAL BRAGS) */}
          {stage === 'intro' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full text-center space-y-6 max-w-xl flex flex-col items-center"
            >
              {/* Original Boss Avatar representation */}
              <div className="relative">
                <motion.div
                  animate={{ 
                    y: [0, -4, 0],
                    rotateY: [0, 180, 360]
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-36 h-36 rounded-full bg-gradient-to-tr from-red-600 via-amber-600 to-rose-700 border-4 border-amber-400 flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.5)] p-0.5"
                >
                  <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
                    <Grid size={44} className="text-red-500/30 absolute inset-0 m-auto animate-pulse" />
                    <Skull size={40} className="text-amber-400 animate-bounce" />
                    <span className="text-[8px] font-mono font-black text-rose-500 uppercase tracking-widest mt-1">ORIGINAL CORE</span>
                  </div>
                </motion.div>
                <div className="absolute -bottom-4 inset-x-0 flex justify-center">
                  <span className="bg-red-600 text-white font-extrabold tracking-widest text-[9px] uppercase px-3.5 py-1 rounded shadow-md border border-amber-300">
                    {bossName}
                  </span>
                </div>
              </div>

              <div className="space-y-4 pt-4 w-full">
                <h3 className="text-rose-400 text-xs font-black tracking-[0.4em] uppercase">
                  SUPREME ANOMALY ENCOUNTER
                </h3>
                
                {/* Dialogue Container */}
                <div className="p-6 rounded-2xl bg-red-950/15 border border-red-500/30 text-rose-200 text-xs font-mono min-h-[96px] text-center max-w-xl mx-auto leading-relaxed shadow-[0_0_20px_rgba(220,38,38,0.15)] relative overflow-hidden backdrop-blur-md">
                  <div className="absolute top-1 left-2 text-[7px] text-rose-500 font-bold uppercase tracking-widest">TRANSMISSION // PRIMARY</div>
                  "{typedBossText}"
                </div>
              </div>

              <button 
                onClick={handleNextToEnters}
                className="mt-6 px-6 py-2 px-8 bg-gradient-to-r from-red-600 to-rose-600 hover:from-amber-600 hover:to-red-700 text-white font-black rounded-lg transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] text-[10px] tracking-widest uppercase flex items-center gap-2 active:scale-95 cursor-pointer border border-amber-400/50"
              >
                Summon Savior Species <ArrowRight size={12} />
              </button>
            </motion.div>
          )}

          {/* STAGE 2: UNRIVALED DESCENDS */}
          {stage === 'unrivaled_descends' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full text-center space-y-6 max-w-xl flex flex-col items-center"
            >
              {/* Unrivaled Deity Avatar representation */}
              <div className="relative">
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                    boxShadow: ['0 0 30px rgba(245,158,11,0.3)', '0 0 60px rgba(245,158,11,0.6)', '0 0 30px rgba(245,158,11,0.3)']
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-40 h-40 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-pink-500 border-4 border-white flex items-center justify-center p-1"
                >
                  <div className="w-full h-full rounded-full bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
                    {/* Glowing rotating gears */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_60%)] border border-dashed border-amber-300/30 rounded-full"
                    />
                    <Sparkles size={48} className="text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
                    <span className="text-[9px] font-mono font-black text-amber-300 uppercase tracking-[0.2em] mt-2">UNRIVALED REALITY</span>
                  </div>
                </motion.div>
                <div className="absolute -bottom-4 inset-x-0 flex justify-center">
                  <span className="bg-gradient-to-r from-amber-500 to-pink-600 text-white font-extrabold tracking-widest text-[9px] uppercase px-4 py-1.5 rounded shadow-lg border-2 border-white animate-bounce">
                    UNRIVALED EMISSARY
                  </span>
                </div>
              </div>

              <div className="space-y-4 pt-4 w-full">
                <h3 className="text-amber-300 text-xs font-black tracking-[0.5em] uppercase">
                  THE GODS DISPATCH THEIR CHAMPION
                </h3>
                
                {/* Dialogue Container */}
                <div className="p-6 rounded-2xl bg-amber-950/20 border border-amber-500/40 text-amber-100 text-xs font-mono min-h-[96px] text-center max-w-xl mx-auto leading-relaxed shadow-[0_0_20px_rgba(245,158,11,0.2)] relative overflow-hidden backdrop-blur-md">
                  <div className="absolute top-1 left-2 text-[7px] text-amber-400 font-bold uppercase tracking-widest">TRANSMISSION // UNRIVALED SPECIES</div>
                  "{typedUnrivaledText}"
                </div>
              </div>

              <button 
                onClick={handleNextToCharge}
                className="mt-6 px-8 py-2.5 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500 hover:opacity-90 text-white font-black rounded-lg transition-all shadow-[0_0_30px_rgba(245,158,11,0.5)] text-[10px] tracking-widest uppercase flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                Initiate Star Shatter Charging <ArrowRight size={12} />
              </button>
            </motion.div>
          )}

          {/* STAGE 3: CLIMAX CHARGING */}
          {stage === 'climax_charging' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full text-center space-y-8 max-w-2xl"
            >
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.15, 1], rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-20 h-20 rounded-full bg-gradient-to-r from-amber-500 to-pink-500 flex items-center justify-center p-0.5 shadow-[0_0_40px_rgba(245,158,11,0.8)]"
                >
                  <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
                    <Zap className="text-amber-400 w-10 h-10 animate-pulse" />
                  </div>
                </motion.div>
                <h2 className="text-amber-300 font-black tracking-[0.4em] text-xs uppercase pt-2">
                  CONCENTRATING PRIMORDIAL GENOME FLUX
                </h2>
              </div>

              {/* Charging progress bar */}
              <div className="w-full max-w-md mx-auto space-y-2">
                <div className="flex justify-between items-center text-[10px] font-mono text-amber-300 font-bold uppercase tracking-wider">
                  <span>UNRIVALED PLASMA STARCHOKE</span>
                  <span>{chargeProgress}%</span>
                </div>
                <div className="w-full h-4 bg-slate-950 rounded-full border border-amber-500/30 overflow-hidden p-0.5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${chargeProgress}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-pink-400 shadow-[0_0_15px_rgba(245,158,11,0.8)]"
                  />
                </div>
              </div>

              {/* Live Combat Info Logging feed */}
              <div className="w-full max-w-md mx-auto h-32 bg-slate-950/70 border border-slate-800 rounded-xl p-3 font-mono text-[9px] text-left space-y-1.5 overflow-y-auto shadow-inner text-slate-400">
                {combatLogs.map((log, idx) => (
                  <div key={`log-${idx}-${log}`} className="flex gap-2">
                    <span className="text-amber-500 font-bold">&gt;</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-center pt-2">
                {chargeProgress >= 100 ? (
                  <motion.button
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.05 }}
                    onClick={triggerRealityShatter}
                    className="px-10 py-4 bg-gradient-to-r from-amber-500 via-red-600 to-pink-500 text-white font-black text-xs rounded-xl shadow-[0_0_40px_rgba(244,63,94,0.8)] hover:shadow-[0_0_60px_rgba(244,63,94,1)] transition-all uppercase tracking-widest animate-pulse border-2 border-white cursor-pointer"
                  >
                    💥 TRIGGER UNRIVALED FINISHER!
                  </motion.button>
                ) : (
                  <span className="text-[10px] font-mono text-slate-500 animate-pulse uppercase">Compressing singularity star cluster, please hold...</span>
                )}
              </div>
            </motion.div>
          )}

          {/* STAGE 4: REALITY SHATTER DENSE FLASH */}
          {stage === 'reality_shatter' && (
            <motion.div
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: [1, 1.2, 0.8, 1], opacity: 1 }}
              transition={{ duration: 1.2 }}
              className="text-center space-y-4"
            >
              <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-white to-pink-500 uppercase tracking-widest animate-pulse font-serif italic select-none">
                REALITY OVERWRITE!
              </h1>
              <p className="text-amber-300 font-mono tracking-[0.5em] text-xs uppercase animate-pulse">Sifting quantum boundaries. Original core structure: CRACKED.</p>
              
              <div className="w-full max-w-sm mx-auto h-2 bg-gradient-to-r from-amber-500 to-pink-500 rounded-full animate-ping mt-12" />
            </motion.div>
          )}

          {/* STAGE 5: ANNIHILATION BATTLE (BOSS DRAIN) */}
          {stage === 'annihilation' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full text-center space-y-8 max-w-lg"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] font-mono text-red-400 font-black tracking-wider">
                  <span>SYSTEM TARGET: {bossName.toUpperCase()}</span>
                  <span>HP: {bossHP}%</span>
                </div>
                <div className="w-full h-5 bg-slate-950 border border-red-500/30 rounded-full overflow-hidden p-0.5 shadow-[inset_0_0_10px_rgba(220,38,38,0.5)]">
                  <div 
                    style={{ width: `${bossHP}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-rose-700 via-red-500 to-amber-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] transition-all duration-75"
                  />
                </div>
              </div>

              {/* Two visual combatants trading massive orbital laser beams! */}
              <div className="grid grid-cols-2 gap-8 items-center pt-6 relative min-h-[160px]">
                {/* Emissary on Left */}
                <motion.div 
                  animate={{ x: [0, 8, -8, 0], y: [0, -4, 4, 0] }}
                  transition={{ duration: 0.15, repeat: Infinity }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 border border-white flex items-center justify-center p-0.5">
                    <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center font-black text-amber-400 text-xs">UNRIV</div>
                  </div>
                  <span className="text-[10px] font-bold text-amber-300 tracking-wide uppercase">UNRIVALED CORE</span>
                </motion.div>

                {/* Laser beam collision in center visualization */}
                <div className="absolute inset-y-0 left-[48%] w-4 bg-gradient-to-b from-amber-400 via-white to-pink-500 shadow-[0_0_30px_rgba(245,158,11,1)] rounded animate-pulse" />

                {/* Original Boss on Right */}
                <motion.div 
                  animate={{ x: [0, -8, 8, 0], y: [0, 4, -4, 0] }}
                  transition={{ duration: 0.1, repeat: Infinity }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-20 h-20 rounded-full bg-red-600 border border-amber-400 flex items-center justify-center p-0.5">
                    <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center font-black text-red-500 text-xs">ORIG</div>
                  </div>
                  <span className="text-[10px] font-bold text-red-400 tracking-wide uppercase">ORIGINAL BOSS</span>
                </motion.div>
              </div>

              <div className="text-amber-300 font-mono text-[10px] uppercase animate-pulse p-4 rounded bg-amber-950/10 border border-amber-500/20">
                ✨ EXTREME MULTI-DIMENSIONAL DESTRUCTION: ATOMIC SPLIT DETECTED ✨
              </div>
            </motion.div>
          )}

          {/* STAGE 6: VICTORY AND REWARDS */}
          {stage === 'victory_aftermath' && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full text-center space-y-6 max-w-md bg-slate-900/80 border-2 border-amber-500/40 rounded-3xl p-8 backdrop-blur-md shadow-[0_0_50px_rgba(245,158,11,0.25)] relative overflow-hidden"
            >
              {/* Inner glowing core representation */}
              <div className="absolute inset-x-0 -top-12 h-32 bg-amber-500/10 rounded-full blur-2xl" />

              <div className="relative z-10 flex flex-col items-center space-y-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="w-16 h-16 rounded-full border border-dashed border-amber-400 flex items-center justify-center"
                >
                  <Sparkles size={32} className="text-amber-400" />
                </motion.div>

                <h3 className="text-amber-400 font-black tracking-[0.5em] text-xs uppercase text-glow">
                  UNRIVALED COMPLETION RE-SYNC
                </h3>
                
                <h1 className="text-4xl font-extrabold text-white tracking-widest uppercase font-serif">
                  VICTORY ACHIEVED!
                </h1>

                <p className="text-xs text-slate-300 leading-relaxed font-mono px-4 max-w-sm">
                  The primordial boss template was entirely dissolved, rewriting local coordinates to celestial perfection. The council awards you absolute materials!
                </p>

                {/* Material rewards representation (Generous negative margin-free layout) */}
                <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 w-full grid grid-cols-3 gap-3">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">MEAT SECURED</span>
                    <span className="text-emerald-400 font-black text-sm tracking-wide">+100,000</span>
                  </div>
                  <div className="flex flex-col items-center border-x border-slate-850">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">DNA HARVEST</span>
                    <span className="text-indigo-400 font-black text-sm tracking-wide">+10,000</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">GOD SHARDS</span>
                    <span className="text-amber-400 font-black text-sm tracking-wide">+10</span>
                  </div>
                </div>

                <div className="pt-2 w-full">
                  <button
                    onClick={() => {
                      onReward(); 
                      onClose();
                    }}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500 hover:opacity-90 text-white font-extrabold rounded-xl shadow-lg hover:shadow-xl text-[11px] tracking-[0.2em] transition-all uppercase cursor-pointer border border-white/20 active:scale-95"
                  >
                    Secure Material Harvest
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </AnimatePresence>
  );
}
