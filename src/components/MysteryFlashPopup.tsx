import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy, Award, Star } from 'lucide-react';

interface MysteryFlashPopupProps {
  isOpen: boolean;
  type: 'unit' | 'trait' | 'original' | 'overseer';
  name: string;
  description: string;
  onClose: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

export const MysteryFlashPopup: React.FC<MysteryFlashPopupProps> = ({
  isOpen,
  type,
  name,
  description,
  onClose,
}) => {
  const [flashCount, setFlashCount] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);

  // Trigger visual strobe flashes when opened to "flash" the user mystically
  useEffect(() => {
    if (isOpen) {
      // If original or overseer, make strobe longer and more epic
      const isSuperRarity = type === 'original' || type === 'overseer';
      setFlashCount(isSuperRarity ? 18 : 7);
      
      // Generate some glowing space dust particles
      const count = type === 'overseer' ? 70 : (type === 'original' ? 55 : 40);
      const newParticles: Particle[] = Array.from({ length: count }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * (type === 'overseer' ? 4 : 3) + 1,
        delay: Math.random() * 3,
        duration: Math.random() * 4 + (type === 'overseer' ? 3 : 4),
      }));
      setParticles(newParticles);

      const interval = setInterval(() => {
        setFlashCount((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, isSuperRarity ? 110 : 80);
      return () => clearInterval(interval);
    }
  }, [isOpen, type]);

  const isFlashing = flashCount > 0;
  const isOriginal = type === 'original';
  const isOverseer = type === 'overseer';

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment>
          {/* STROBE SCREEN FLASH - Completely blocks and strobe flashes the viewport */}
          {isFlashing && (
            <div 
              className={`fixed inset-0 z-[100] transition-colors duration-75 pointer-events-none ${
                isOverseer
                  ? (flashCount % 2 === 0 ? 'bg-cyan-400 opacity-95' : 'bg-slate-950')
                  : isOriginal
                    ? (flashCount % 2 === 0 ? 'bg-amber-400 opacity-95' : 'bg-slate-950')
                    : (flashCount % 2 === 0 ? 'bg-white' : 'bg-black')
              }`}
            />
          )}

          {/* MAIN DISPLAY CONTROLLERS */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[90] flex items-center justify-center overflow-hidden font-sans ${
              isOverseer
                ? 'bg-gradient-to-b from-slate-950 via-cyan-950/30 to-slate-950'
                : isOriginal 
                  ? 'bg-gradient-to-b from-slate-950 via-amber-950/20 to-slate-950' 
                  : 'bg-slate-950'
            } ${
              isFlashing ? 'scale-105' : 'scale-100'
            } transition-all duration-300`}
            id="mystery-anomaly-popup"
          >
            {/* Background Glitch Canvas & Scanning Grid */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/30 via-slate-950 to-black pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000001f_1px,transparent_1px),linear-gradient(to_bottom,#0000001f_1px,transparent_1px)] bg-[size:14px_24px] opacity-15 pointer-events-none" />

            {/* Hyper-glowing floating space dust particles */}
            {particles.map((p, idx) => (
              <motion.div
                key={`${p.id}-${idx}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 0.8, 0],
                  scale: [0, 1.5, 0],
                  y: ['0vh', type === 'overseer' ? '-40vh' : '-30vh']
                }}
                transition={{
                  repeat: Infinity,
                  duration: p.duration,
                  delay: p.delay,
                  ease: 'easeInOut'
                }}
                className={`absolute rounded-full pointer-events-none ${
                  isOverseer
                    ? 'bg-cyan-300 shadow-[0_0_8px_#22d3ee]'
                    : isOriginal 
                      ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]' 
                      : 'bg-indigo-300 shadow-[0_0_8px_#a5b4fc]'
                }`}
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                }}
              />
            ))}

            {/* DRAMATIC SWEEPING COSMIC LASER BEAMS FOR THE CUTSCENE */}
            <motion.div 
              animate={{ 
                x: ['-100%', '200%'],
                rotate: [35, 35],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'linear',
              }}
              className={`absolute top-0 w-[450px] h-[55px] opacity-25 pointer-events-none blur-md ${
                isOverseer
                  ? 'bg-gradient-to-r from-transparent via-cyan-400 to-transparent'
                  : isOriginal 
                    ? 'bg-gradient-to-r from-transparent via-amber-500 to-transparent' 
                    : 'bg-gradient-to-r from-transparent via-cyan-400 to-transparent'
              }`}
            />
            <motion.div 
              animate={{ 
                x: ['200%', '-100%'],
                rotate: [-35, -35],
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: 'linear',
              }}
              className={`absolute bottom-0 w-[450px] h-[55px] opacity-25 pointer-events-none blur-md ${
                isOverseer
                  ? 'bg-gradient-to-r from-transparent via-teal-400 to-transparent'
                  : isOriginal 
                    ? 'bg-gradient-to-r from-transparent via-rose-500 to-transparent' 
                    : 'bg-gradient-to-r from-transparent via-indigo-500 to-transparent'
              }`}
            />

            {/* Glowing floating blobs in background */}
            <div className={`absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[140px] animate-pulse ${isOverseer ? 'bg-cyan-500/15' : 'bg-amber-500/10'}`} style={{ animationDuration: '4s' }} />
            <div className={`absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[120px] animate-pulse ${isOverseer ? 'bg-teal-500/15' : 'bg-red-500/10'}`} style={{ animationDuration: '6s' }} />

            {/* Content Card with violent screen shake entrance and thick premium styling */}
            <motion.div
              initial={{ scale: 0.3, rotate: -25 }}
              animate={{ 
                scale: 1, 
                rotate: 0,
                // Ultra intense Screen shake sequences:
                x: (isOriginal || isOverseer) 
                  ? [0, -24, 24, -18, 18, -12, 12, -6, 6, -3, 3, 0] 
                  : [0, -16, 16, -10, 10, -5, 5, 0],
                y: (isOriginal || isOverseer) 
                  ? [0, 18, -18, 14, -14, 9, -9, 4, -4, 0] 
                  : [0, 10, -10, 7, -7, 4, -4, 0]
              }}
              transition={{ 
                duration: (isOriginal || isOverseer) ? 1.4 : 0.9, 
                ease: 'easeOut',
                scale: { duration: 0.7 },
                rotate: { duration: 0.7 }
              }}
              className={`relative w-full max-w-xl mx-4 p-8 bg-[rgba(6,7,14,0.99)] rounded-[40px] text-center space-y-6 overflow-hidden border-2 shadow-2xl ${
                isOverseer
                  ? 'border-cyan-400 shadow-[0_0_120px_rgba(6,182,212,0.65)]'
                  : isOriginal 
                    ? 'border-yellow-400 shadow-[0_0_120px_rgba(245,158,11,0.65)]' 
                    : 'border-fuchsia-500/40 shadow-[0_0_100px_rgba(217,70,239,0.4)]'
              }`}
            >
              {/* Top Warning Ribbons */}
              <div 
                className={`absolute inset-x-0 top-0 h-2 animate-pulse ${
                  isOverseer
                    ? 'bg-gradient-to-r from-cyan-500 via-teal-300 to-emerald-600'
                    : isOriginal 
                      ? 'bg-gradient-to-r from-yellow-500 via-amber-300 to-yellow-600' 
                      : 'bg-gradient-to-r from-fuchsia-600 via-pink-400 to-indigo-600'
                }`} 
              />

              {/* Rarity / Shield Tag */}
              <div 
                className={`mx-auto inline-flex items-center gap-2 px-5 py-1.5 rounded-full border shadow-lg text-[10px] font-black uppercase tracking-[0.3em] leading-none animate-pulse ${
                  isOverseer
                    ? 'bg-cyan-950/60 border-cyan-500/55 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                    : isOriginal 
                      ? 'bg-amber-950/60 border-amber-500/55 text-yellow-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                      : 'bg-purple-950/60 border-fuchsia-500/40 text-fuchsia-300 shadow-[0_0_20px_rgba(217,70,239,0.3)]'
                }`}
              >
                {isOverseer ? (
                  <>
                    <Star size={12} className="text-cyan-400 fill-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
                    🌌 TRANSCENDENTAL OVERSEER WITNESS
                    <Star size={12} className="text-cyan-400 fill-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
                  </>
                ) : isOriginal ? (
                  <>
                    <Star size={12} className="text-yellow-400 fill-yellow-400 animate-spin" style={{ animationDuration: '4s' }} />
                    SACRED ORIGINAL RE-SPAWN
                    <Star size={12} className="text-yellow-400 fill-yellow-400 animate-spin" style={{ animationDuration: '4s' }} />
                  </>
                ) : (
                  <>
                    <Sparkles size={12} className="text-fuchsia-400" />
                    ANOMALOUS STABILIZER ENTRANCE
                    <Sparkles size={12} className="text-fuchsia-400" />
                  </>
                )}
              </div>

              {/* Central Visual Showcase resembling a real dimensional implosion portal */}
              <div className="relative group my-4 flex items-center justify-center">
                {/* Rotating Halos */}
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
                    className={`absolute inset-0 rounded-full border-4 border-dashed opacity-80 blur-[1px] ${
                      isOverseer
                        ? 'border-cyan-500/50'
                        : isOriginal 
                          ? 'border-yellow-500/50' 
                          : 'border-fuchsia-500/50'
                    }`}
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                    className={`absolute inset-2 rounded-full border-2 border-double opacity-60 ${
                      isOverseer
                        ? 'border-teal-400/45'
                        : isOriginal 
                          ? 'border-amber-400/45' 
                          : 'border-indigo-400/45'
                    }`}
                  />
                  {/* Vortex Implosion Wave effect */}
                  <motion.div
                    animate={{ scale: [0.85, 1.15, 0.85], opacity: [0.4, 0.9, 0.4] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className={`absolute inset-4 rounded-full bg-gradient-to-tr blur-2xl ${
                      isOverseer
                        ? 'from-cyan-500/25 to-emerald-500/25'
                        : isOriginal 
                          ? 'from-yellow-500/20 to-red-500/25' 
                          : 'from-indigo-500/25 to-pink-500/25'
                    }`}
                  />

                  {/* Core Blackhole Ring */}
                  <motion.div
                    animate={{ rotate: (isOriginal || isOverseer) ? -360 : 360, scale: [0.95, 1.05, 0.95] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className={`w-36 h-36 rounded-full border-4 flex items-center justify-center bg-black shadow-[0_0_35px_rgba(0,0,0,0.8)] relative z-10 ${
                      isOverseer
                        ? 'border-cyan-400 shadow-[0_0_40px_rgba(6,182,212,0.5)]'
                        : isOriginal 
                          ? 'border-yellow-400 shadow-[0_0_40px_rgba(245,158,11,0.5)]' 
                          : 'border-fuchsia-400 shadow-[0_0_35px_rgba(217,70,239,0.5)]'
                    }`}
                  >
                    {/* Inner glowing singularity center */}
                    <div className="w-24 h-24 rounded-full bg-slate-950 flex items-center justify-center relative overflow-hidden">
                      <div className={`absolute inset-0 opacity-40 animate-pulse ${
                        isOverseer
                          ? 'bg-cyan-600'
                          : isOriginal 
                            ? 'bg-amber-600' 
                            : 'bg-fuchsia-600'
                      }`} />
                      
                      {/* Swirling lines inside core */}
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                        className="w-16 h-16 rounded-full border border-dashed border-white/35"
                      />
                    </div>
                  </motion.div>

                  {/* Center Symbol Floating */}
                  <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                    <motion.div
                      animate={
                        isOverseer
                          ? { scale: [1, 1.3, 0.8, 1.25, 1], rotate: [0, -12, 12, -6, 0] }
                          : isOriginal 
                            ? { scale: [1, 1.25, 0.85, 1.15, 1], rotate: [0, 8, -8, 4, 0] }
                            : { scale: [1, 1.18, 0.9, 1.1, 1], rotate: [0, -4, 4, -2, 0] }
                      }
                      transition={{ duration: 2.2, repeat: Infinity }}
                      className={`font-black italic tracking-tighter filter select-none text-8xl line-none flex items-center justify-center h-24 w-24 ${
                        isOverseer
                          ? 'text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 via-teal-400 to-cyan-600 drop-shadow-[0_0_35px_rgba(6,182,212,0.95)]'
                          : isOriginal 
                            ? 'text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-amber-400 to-yellow-600 drop-shadow-[0_0_35px_rgba(245,158,11,0.95)]' 
                            : 'text-transparent bg-clip-text bg-gradient-to-br from-fuchsia-200 via-indigo-300 to-pink-500 drop-shadow-[0_0_30px_rgba(217,70,239,0.9)]'
                      }`}
                    >
                      {isOverseer ? (
                        <svg className="w-20 h-20 text-cyan-400 drop-shadow-[0_0_25px_rgba(34,211,238,0.9)] animate-pulse" viewBox="0 0 100 100" fill="none" stroke="currentColor">
                          <path d="M 10,50 Q 50,15 90,50 Q 50,85 10,50 Z" strokeWidth="2.5" strokeLinecap="round" />
                          <circle cx="50" cy="50" r="16" strokeWidth="1.25" strokeDasharray="3 3" />
                          <circle cx="50" cy="50" r="8" fill="currentColor" />
                          <line x1="50" y1="5" x2="50" y2="18" strokeWidth="1.5" strokeLinecap="round" />
                          <line x1="50" y1="82" x2="50" y2="95" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      ) : (isOriginal ? '👑' : '?')}
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Title Announcement */}
              <div className="space-y-1">
                <h2 className={`font-bold uppercase tracking-[0.25em] text-[10px] ${isOverseer ? 'text-cyan-400 animate-pulse' : (isOriginal ? 'text-yellow-400' : 'text-fuchsia-400')}`}>
                  {isOverseer
                    ? '🌌 TRANSCENDENTAL OVERSEER DEPLOYED'
                    : isOriginal 
                      ? '⚡ SUPREME PRIMORDIAL FORCE DETECTED' 
                      : '🧬 ANOMALOUS DIMENSIONAL BEAST SPLICED'}
                </h2>
                <h1 className={`text-4xl sm:text-5xl font-black italic tracking-tighter uppercase leading-none drop-shadow-lg ${
                  isOverseer
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-teal-300 to-indigo-300 font-serif'
                    : isOriginal 
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-600 font-serif' 
                      : 'text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-200 via-white to-indigo-300 font-serif'
                }`}>
                  {name}
                </h1>
              </div>

              {/* Rarity Bar Badge with glowing pulse shimmer strip */}
              <div className={`relative overflow-hidden inline-block px-10 py-3 rounded-2xl border select-none shadow-xl my-2 ${
                isOverseer
                  ? 'bg-gradient-to-r from-cyan-600/30 via-slate-900/95 to-teal-600/30 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.2)]'
                  : isOriginal 
                    ? 'bg-gradient-to-r from-yellow-600/30 via-slate-900/95 to-amber-600/30 border-yellow-500/50 shadow-[0_0_30px_rgba(245,158,11,0.2)]'
                    : 'bg-gradient-to-r from-fuchsia-600/30 via-slate-900/95 to-indigo-600/30 border-fuchsia-500/50 shadow-[0_0_30px_rgba(217,70,239,0.2)]'
              }`}>
                <div className="absolute inset-x-0 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_1.8s_infinite] pointer-events-none" />
                <span className={`text-xl font-extrabold italic tracking-widest flex items-center justify-center gap-2 uppercase animate-pulse ${
                  isOverseer
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-teal-300'
                    : isOriginal 
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-white to-amber-400' 
                      : 'text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 via-white to-indigo-300'
                }`}>
                  RARITY: {isOverseer ? 'OVERSEER' : (isOriginal ? 'ORIGINAL' : '???')}
                </span>
              </div>

              {/* Custom Description Details with dynamic ability box */}
              <div className="max-w-md mx-auto p-4 rounded-2xl bg-white/5 border border-white/10 text-slate-300 text-xs tracking-wide leading-relaxed font-semibold">
                <div className={`text-[10px] font-black uppercase tracking-wider mb-1 flex items-center justify-center gap-1.5 ${
                  isOverseer ? 'text-cyan-400' : (isOriginal ? 'text-yellow-400' : 'text-fuchsia-400')
                }`}>
                  <Sparkles size={11} className="animate-spin" />
                  {isOverseer ? 'EYE OF GOD SUPREME TRAIT' : (isOriginal ? 'SUPREME AUTHORITY ACTIVE SKILL' : 'ANOMALOUS SPECIAL ABILITY')}
                </div>
                <div className="text-slate-200 leading-relaxed uppercase select-none text-[10px] sm:text-xs">
                  {description}
                </div>
              </div>

              {/* Claim Button */}
              <div className="pt-4">
                <motion.button
                  whileHover={{ 
                    scale: 1.05, 
                    boxShadow: isOverseer ? '0 0 40px rgba(6, 182, 212, 0.8)' : (isOriginal ? '0 0 40px rgba(245, 158, 11, 0.8)' : '0 0 35px rgba(217, 70, 239, 0.6)') 
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className={`w-full sm:w-64 px-8 py-4 font-black rounded-2xl text-xs uppercase tracking-[0.25em] transition-all shadow-md ${
                    isOverseer
                      ? 'bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-500 text-slate-950 font-black'
                      : isOriginal 
                        ? 'bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 text-slate-950 font-black' 
                        : 'bg-gradient-to-r from-fuchsia-500 via-pink-400 to-indigo-600 text-slate-950 font-black'
                  }`}
                >
                  {isOverseer ? 'INTEGRATE OMNIPOTENCE CORE' : (isOriginal ? 'CLAIM PRIMAL HYPERCODE' : 'STABILIZE REALITY HORIZON')}
                </motion.button>
              </div>

            </motion.div>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
};
