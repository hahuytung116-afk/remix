import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Zap, Trophy, ShieldCheck, Swords, Star, Info, Crown, ChevronRight, ChevronDown, Sparkles } from 'lucide-react';
import { TowerInstance } from '../types';
import { ANIMAL_ELEMENTS } from '../constants';

interface ElementalBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  elementalDamage: Record<string, number>;
  towers: TowerInstance[];
  onChangeTowerElement?: (towerId: string, element: any) => void;
  onChangeAllDeitiesElement?: (element: any) => void;
}

export const ELEMENT_SPECS = {
  fire: {
    name: 'Fire / Pyro',
    icon: '🌋',
    colorClass: 'text-red-400',
    borderClass: 'border-red-500/30',
    bgClass: 'bg-red-500/10',
    barColor: 'bg-gradient-to-r from-red-500 to-orange-500',
    shadowColor: 'shadow-red-500/20',
    title: 'VOLCANIC TEMPEST & INFEL',
    desc: 'Unleashes explosive solar flares, meteors, and pyroclastic rings that slow-burn targets and vaporize clusters.',
    archetype: 'Pure Burn & AoE Destruct',
    colorHex: '#ef4444'
  },
  poison: {
    name: 'Acid / Poison',
    icon: '🤢',
    colorClass: 'text-emerald-400',
    borderClass: 'border-emerald-500/30',
    bgClass: 'bg-emerald-500/10',
    barColor: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    shadowColor: 'shadow-emerald-500/20',
    title: 'TOXIC STORM & CORROSION',
    desc: 'Deploys dense toxic clouds and highly corrosive acids that dissolve shields, armor ratings, and steadily decay health variables.',
    archetype: 'Armor Corroder & High Slow',
    colorHex: '#10b981'
  },
  water: {
    name: 'Tidal / Water',
    icon: '🌊',
    colorClass: 'text-blue-400',
    borderClass: 'border-blue-500/30',
    bgClass: 'bg-blue-500/10',
    barColor: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    shadowColor: 'shadow-blue-500/20',
    title: 'TIDAL SURGE & IMPACT',
    desc: 'Fires high-velocity hydraulic jets and tidal ring waves that wash back target entities on their path with heavy knockback force.',
    archetype: 'Crowd Control & Pushbacks',
    colorHex: '#3b82f6'
  },
  sand: {
    name: 'Sand / Dust',
    icon: '🌪️',
    colorClass: 'text-amber-400',
    borderClass: 'border-amber-500/30',
    bgClass: 'bg-amber-500/10',
    barColor: 'bg-gradient-to-r from-amber-400 to-yellow-600',
    shadowColor: 'shadow-amber-500/20',
    title: 'SAND WHIRLWIND & BLINDNESS',
    desc: 'Summons violent localized dust storms that blind and disorient targets, rendering them highly sluggish and vulnerable.',
    archetype: 'Target Blinding & Heavy Debuff',
    colorHex: '#f59e0b'
  },
  dirt: {
    name: 'Earth / Ground',
    icon: '💥',
    colorClass: 'text-amber-600',
    borderClass: 'border-amber-700/30',
    bgClass: 'bg-amber-800/10',
    barColor: 'bg-gradient-to-r from-amber-700 to-stone-600',
    shadowColor: 'shadow-amber-700/20',
    title: 'EARTH SHATTER & QUAKE',
    desc: 'Shatters continental sub-structures, inducing catastrophic physical ground tremors and locking targets in full physical stun stasis.',
    archetype: 'Maximum Raw Damage & Stun',
    colorHex: '#b45309'
  },
  ice: {
    name: 'Frost / Ice',
    icon: '🧊',
    colorClass: 'text-cyan-300',
    borderClass: 'border-cyan-500/30',
    bgClass: 'bg-cyan-500/10',
    barColor: 'bg-gradient-to-r from-cyan-400 to-blue-400',
    shadowColor: 'shadow-cyan-400/20',
    title: 'FROST STASIS & ZERO-K',
    desc: 'Emits cryogenic sub-zero blastwaves that freeze target elements solid in solid ice blocks, completely suspending their movement.',
    archetype: 'Absolute Stasis Lock & Freeze',
    colorHex: '#06b6d4'
  },
  wind: {
    name: 'Gale / Wind',
    icon: '🍃',
    colorClass: 'text-stone-300',
    borderClass: 'border-stone-500/20',
    bgClass: 'bg-stone-500/10',
    barColor: 'bg-gradient-to-r from-stone-400 to-slate-400',
    shadowColor: 'shadow-stone-300/20',
    title: 'CYCLONE GALE & VORTEX',
    desc: 'Channels localized supersonic gale-force winds that continuously lift and blow back target columns with highest repulsion distances.',
    archetype: 'Range Amplification & Repulsion',
    colorHex: '#a8a29e'
  },
  lightning: {
    name: 'Thunder / Lightning',
    icon: '⚡',
    colorClass: 'text-yellow-400',
    borderClass: 'border-yellow-500/30',
    bgClass: 'bg-yellow-500/10',
    barColor: 'bg-gradient-to-r from-yellow-400 to-amber-500',
    shadowColor: 'shadow-yellow-500/20',
    title: 'VOLTAGE SURGE & STUN',
    desc: 'Calls down 100M Volt plasma lightning strikes that shock and paralyze target columns for 2.5s.',
    archetype: 'High Burst Plasma & Stun',
    colorHex: '#eab308'
  },
  light: {
    name: 'Holy / Light',
    icon: '🌟',
    colorClass: 'text-amber-300',
    borderClass: 'border-amber-400/30',
    bgClass: 'bg-amber-400/10',
    barColor: 'bg-gradient-to-r from-amber-300 to-yellow-300',
    shadowColor: 'shadow-amber-300/20',
    title: 'DIVINE RADIANCE & HEAL',
    desc: 'Projects holy radiance across all lanes, obliterating targets with light beams while restoring Base Nexus Health.',
    archetype: 'Nexus Recovery & Holy Damage',
    colorHex: '#f59e0b'
  },
  shadow: {
    name: 'Abyssal / Shadow',
    icon: '🌌',
    colorClass: 'text-purple-400',
    borderClass: 'border-purple-500/30',
    bgClass: 'bg-purple-500/10',
    barColor: 'bg-gradient-to-r from-purple-500 to-indigo-600',
    shadowColor: 'shadow-purple-500/20',
    title: 'ABYSSAL VOID & VACUUM',
    desc: 'Pulls active targets into a dark singularity vacuum, inflicting massive damage and 90% heavy slow.',
    archetype: 'Singularity Void & Heavy Slow',
    colorHex: '#8b5cf6'
  },
  magma: {
    name: 'Molten / Magma',
    icon: '🌋',
    colorClass: 'text-orange-400',
    borderClass: 'border-orange-500/30',
    bgClass: 'bg-orange-500/10',
    barColor: 'bg-gradient-to-r from-orange-500 to-red-600',
    shadowColor: 'shadow-orange-500/20',
    title: 'MOLTEN CATACLYSM & MELT',
    desc: 'Erupts molten lava fields that completely melt enemy armor ratings and deal 115x damage cascades.',
    archetype: 'Armor Melt & Damage Cascade',
    colorHex: '#f97316'
  },
  cosmos: {
    name: 'Starlight / Cosmos',
    icon: '✨',
    colorClass: 'text-pink-400',
    borderClass: 'border-pink-500/30',
    bgClass: 'bg-pink-500/10',
    barColor: 'bg-gradient-to-r from-pink-400 to-purple-400',
    shadowColor: 'shadow-pink-400/20',
    title: 'STARLIGHT SUPERNOVA & STASIS',
    desc: 'Detonates a cosmic supernova burst across all space, dealing 130x damage and freezing time for 3.5s.',
    archetype: 'Cosmic Supernova & Time Freeze',
    colorHex: '#ec4899'
  }
};

export const ElementalBoardModal: React.FC<ElementalBoardModalProps> = ({
  isOpen,
  onClose,
  elementalDamage,
  towers,
  onChangeTowerElement,
  onChangeAllDeitiesElement
}) => {
  const [expandedElement, setExpandedElement] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [activeParticleEvent, setActiveParticleEvent] = useState<{
    id: number;
    element: string;
    originX: number;
    originY: number;
  } | null>(null);

  const [activeBanner, setActiveBanner] = useState<{
    element: string;
    spec: typeof ELEMENT_SPECS['fire'];
  } | null>(null);

  // Compute placed deity towers
  const deityTowers = useMemo(() => {
    return towers.filter(t => t.animalId === 'elemental_god' || t.animalId.endsWith('_deity'));
  }, [towers]);

  const currentDeityElement = useMemo(() => {
    if (deityTowers.length > 0) {
      return deityTowers[0].element || 'fire';
    }
    return 'fire';
  }, [deityTowers]);

  const prevDeityElementRef = useRef<string>(currentDeityElement);

  // Track deity element changes from game state
  useEffect(() => {
    if (prevDeityElementRef.current !== currentDeityElement) {
      const spec = ELEMENT_SPECS[currentDeityElement as keyof typeof ELEMENT_SPECS] || ELEMENT_SPECS.fire;
      const x = modalRef.current ? modalRef.current.clientWidth / 2 : window.innerWidth / 2;
      const y = modalRef.current ? modalRef.current.clientHeight / 2 : window.innerHeight / 2;

      setActiveParticleEvent({
        id: Date.now(),
        element: currentDeityElement,
        originX: x,
        originY: y
      });

      setActiveBanner({
        element: currentDeityElement,
        spec
      });

      prevDeityElementRef.current = currentDeityElement;
    }
  }, [currentDeityElement]);

  // Handle direct user interaction inside ElementalBoardModal
  const handleSwitchElement = (elementId: string, e?: React.MouseEvent) => {
    let x = modalRef.current ? modalRef.current.clientWidth / 2 : window.innerWidth / 2;
    let y = modalRef.current ? modalRef.current.clientHeight / 2 : window.innerHeight / 2;

    if (e && modalRef.current) {
      const rect = modalRef.current.getBoundingClientRect();
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    if (onChangeAllDeitiesElement) {
      onChangeAllDeitiesElement(elementId);
    }

    const spec = ELEMENT_SPECS[elementId as keyof typeof ELEMENT_SPECS] || ELEMENT_SPECS.fire;

    setActiveParticleEvent({
      id: Date.now(),
      element: elementId,
      originX: x,
      originY: y
    });

    setActiveBanner({
      element: elementId,
      spec
    });

    prevDeityElementRef.current = elementId;
  };

  // Particle Canvas Effect Loop
  useEffect(() => {
    if (!activeParticleEvent || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;

    const { element, originX, originY } = activeParticleEvent;

    // Palette per element
    const colorPalettes: Record<string, string[]> = {
      fire: ['#ef4444', '#f97316', '#fde047', '#dc2626', '#ffedd5'],
      poison: ['#10b981', '#34d399', '#059669', '#a7f3d0', '#064e3b'],
      water: ['#3b82f6', '#06b6d4', '#60a5fa', '#38bdf8', '#e0f2fe'],
      sand: ['#f59e0b', '#d97706', '#fbbf24', '#fef3c7', '#78350f'],
      dirt: ['#b45309', '#d97706', '#92400e', '#f59e0b', '#78350f'],
      ice: ['#06b6d4', '#38bdf8', '#a5f3fc', '#ffffff', '#e0f2fe'],
      wind: ['#a8a29e', '#cbd5e1', '#e2e8f0', '#ffffff', '#64748b'],
      lightning: ['#eab308', '#facc15', '#fef08a', '#ffffff', '#ca8a04'],
      light: ['#f59e0b', '#fbbf24', '#fef08a', '#ffffff', '#fde047'],
      shadow: ['#8b5cf6', '#a855f7', '#c084fc', '#3b0764', '#1e1b4b'],
      magma: ['#f97316', '#ef4444', '#b91c1c', '#fde047', '#ffedd5'],
      cosmos: ['#ec4899', '#c084fc', '#f472b6', '#ffffff', '#818cf8'],
    };

    const palette = colorPalettes[element] || colorPalettes.fire;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      maxLife: number;
      life: number;
      shape: string;
      rotation: number;
      rotSpeed: number;
    }

    const particles: Particle[] = [];
    const particleCount = 120;

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8.5 + 2.5;
      const size = Math.random() * 8 + 3;
      const maxLife = Math.random() * 45 + 45; // ~1.5s duration

      let shape = 'circle';
      if (element === 'ice') shape = 'shard';
      else if (element === 'lightning') shape = 'spark';
      else if (element === 'light' || element === 'cosmos') shape = 'star';
      else if (element === 'poison' || element === 'water') shape = 'bubble';
      else if (element === 'dirt') shape = 'rock';

      particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size,
        color: palette[Math.floor(Math.random() * palette.length)],
        alpha: 1.0,
        maxLife,
        life: maxLife,
        shape,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.25
      });
    }

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      let aliveCount = 0;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.life <= 0) continue;

        aliveCount++;
        p.life--;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;

        // Element-specific physics
        if (element === 'fire' || element === 'magma') {
          p.vy -= 0.18; // Upward flame acceleration
          p.vx += (Math.random() - 0.5) * 0.5;
        } else if (element === 'poison' || element === 'water') {
          p.vy -= 0.09;
          p.vx += Math.sin(p.life * 0.12) * 0.6;
        } else if (element === 'sand' || element === 'wind') {
          const dx = p.x - originX;
          const dy = p.y - originY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          p.vx += (-dy / (dist || 1)) * 0.35;
          p.vy += (dx / (dist || 1)) * 0.35;
        } else if (element === 'dirt') {
          p.vy += 0.22; // Gravity crumble
        } else if (element === 'shadow') {
          if (p.life > p.maxLife * 0.6) {
            p.vx *= 0.92;
            p.vy *= 0.92;
          } else {
            p.vx *= 1.06;
            p.vy *= 1.06;
          }
        }

        const lifeRatio = p.life / p.maxLife;
        p.alpha = Math.sin(lifeRatio * Math.PI);

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
        ctx.fillStyle = p.color;
        ctx.strokeStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;

        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * lifeRatio, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'bubble') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * lifeRatio, 0, Math.PI * 2);
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(-p.size * 0.3, -p.size * 0.3, p.size * 0.2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'shard' || p.shape === 'rock') {
          ctx.beginPath();
          ctx.moveTo(0, -p.size * 1.5);
          ctx.lineTo(p.size * 0.8, p.size * 0.8);
          ctx.lineTo(-p.size * 0.8, p.size * 0.8);
          ctx.closePath();
          ctx.fill();
        } else if (p.shape === 'spark') {
          ctx.beginPath();
          ctx.moveTo(-p.size * 1.5, 0);
          ctx.lineTo(0, -p.size * 0.4);
          ctx.lineTo(p.size * 1.5, 0);
          ctx.lineTo(0, p.size * 0.4);
          ctx.closePath();
          ctx.fill();
        } else if (p.shape === 'star') {
          ctx.beginPath();
          for (let s = 0; s < 5; s++) {
            const rot = (Math.PI / 2) * 3 + (s * Math.PI * 2) / 5;
            const sx = Math.cos(rot) * p.size * 1.2;
            const sy = Math.sin(rot) * p.size * 1.2;
            if (s === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);

            const rotInner = rot + Math.PI / 5;
            const ix = Math.cos(rotInner) * (p.size * 0.5);
            const iy = Math.sin(rotInner) * (p.size * 0.5);
            ctx.lineTo(ix, iy);
          }
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      }

      if (aliveCount > 0) {
        animId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    render();

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [activeParticleEvent]);

  // Format big numbers cleanly
  const formatDamage = (num: number): string => {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return Math.floor(num).toLocaleString();
  };

  // Compute elemental stats in real-time
  const stats = useMemo(() => {
    const counts = { fire: 0, poison: 0, water: 0, sand: 0, dirt: 0, ice: 0, wind: 0, lightning: 0, light: 0, shadow: 0, magma: 0, cosmos: 0 } as Record<string, number>;
    towers.forEach(t => {
      const isDeity = t.animalId === 'elemental_god' || t.animalId.endsWith('_deity');
      const defaultEl = ANIMAL_ELEMENTS[t.animalId] || 'fire';
      const element = isDeity ? (t.element || defaultEl) : (ANIMAL_ELEMENTS[t.animalId] || 'dirt');
      counts[element] = (counts[element] || 0) + 1;
    });

    const damages = {
      fire: elementalDamage.fire ?? 0,
      poison: elementalDamage.poison ?? 0,
      water: elementalDamage.water ?? 0,
      sand: elementalDamage.sand ?? 0,
      dirt: elementalDamage.dirt ?? 0,
      ice: elementalDamage.ice ?? 0,
      wind: elementalDamage.wind ?? 0,
      lightning: elementalDamage.lightning ?? 0,
      light: elementalDamage.light ?? 0,
      shadow: elementalDamage.shadow ?? 0,
      magma: elementalDamage.magma ?? 0,
      cosmos: elementalDamage.cosmos ?? 0,
    } as Record<string, number>;

    const totalDamage = Object.values(damages).reduce((acc, d) => acc + d, 0);

    const list = Object.entries(damages).map(([id, dmg]) => {
      const spec = ELEMENT_SPECS[id as keyof typeof ELEMENT_SPECS];
      const percent = totalDamage > 0 ? (dmg / totalDamage) * 100 : 0;
      const unitCount = counts[id] || 0;

      let synergyTier = 0;
      let synergyBonus = 'No Active Resonance';
      if (unitCount >= 6) {
        synergyTier = 3;
        synergyBonus = 'Tier III Resonance (+50% Ultimate Range, +50% Damage, +25% Speed)';
      } else if (unitCount >= 4) {
        synergyTier = 2;
        synergyBonus = 'Tier II Resonance (+30% Damage, +15% Speed)';
      } else if (unitCount >= 2) {
        synergyTier = 1;
        synergyBonus = 'Tier I Resonance (+15% Attack Speed)';
      }

      return {
        id,
        name: spec.name,
        icon: spec.icon,
        dmg,
        percent,
        unitCount,
        synergyTier,
        synergyBonus,
        ...spec
      };
    }).sort((a, b) => b.dmg - a.dmg);

    return {
      list,
      totalDamage,
      maxDmgId: list[0]?.id || 'fire'
    };
  }, [elementalDamage, towers]);

  const toggleExpand = (id: string) => {
    setExpandedElement(expandedElement === id ? null : id);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-4xl max-h-[85vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 font-sans z-10"
          >
            {/* Particle Overlay Canvas */}
            <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-30 rounded-2xl w-full h-full" />

            {/* Shockwave Transition Animations */}
            <AnimatePresence>
              {activeParticleEvent && (
                <motion.div
                  key={`particle-group-${activeParticleEvent.id}`}
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 pointer-events-none rounded-2xl z-20 overflow-hidden"
                >
                  <motion.div
                    key={`wave-${activeParticleEvent.id}`}
                    initial={{ scale: 0.1, opacity: 0.85 }}
                    animate={{ scale: 3.5, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.0, ease: 'easeOut' }}
                    className="absolute pointer-events-none rounded-full"
                    style={{
                      left: activeParticleEvent.originX,
                      top: activeParticleEvent.originY,
                      width: '320px',
                      height: '320px',
                      marginLeft: '-160px',
                      marginTop: '-160px',
                      background: `radial-gradient(circle, ${ELEMENT_SPECS[activeParticleEvent.element as keyof typeof ELEMENT_SPECS]?.colorHex}cc 0%, ${ELEMENT_SPECS[activeParticleEvent.element as keyof typeof ELEMENT_SPECS]?.colorHex}44 50%, transparent 80%)`,
                      boxShadow: `0 0 120px ${ELEMENT_SPECS[activeParticleEvent.element as keyof typeof ELEMENT_SPECS]?.colorHex}`
                    }}
                  />

                  <motion.div
                    key={`border-${activeParticleEvent.id}`}
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 1.3, ease: 'easeOut' }}
                    className="absolute inset-0 rounded-2xl pointer-events-none border-2"
                    style={{
                      borderColor: ELEMENT_SPECS[activeParticleEvent.element as keyof typeof ELEMENT_SPECS]?.colorHex,
                      boxShadow: `inset 0 0 90px ${ELEMENT_SPECS[activeParticleEvent.element as keyof typeof ELEMENT_SPECS]?.colorHex}55, 0 0 70px ${ELEMENT_SPECS[activeParticleEvent.element as keyof typeof ELEMENT_SPECS]?.colorHex}77`
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header */}
            <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                  <Zap className="text-amber-400 animate-pulse" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-200">
                    Elemental Board & Deity Synergy
                  </h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">
                    Real-time Cumulative Damage, Deployment Ratios, & Deity Element Tuner
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 bg-slate-850 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white rounded-lg transition-all active:scale-95 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Active Alignment Flash Banner */}
            <AnimatePresence>
              {activeBanner && (
                <motion.div
                  initial={{ y: -25, opacity: 0, scale: 0.95 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: -20, opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="mx-6 mt-4 p-3 rounded-xl border flex items-center justify-between shadow-2xl backdrop-blur-md relative z-20"
                  style={{
                    backgroundColor: `${activeBanner.spec.colorHex}18`,
                    borderColor: `${activeBanner.spec.colorHex}70`,
                    boxShadow: `0 0 30px ${activeBanner.spec.colorHex}35`
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl animate-bounce" style={{ animationDuration: '2s' }}>
                      {activeBanner.spec.icon}
                    </div>
                    <div>
                      <div className="text-[11px] font-black uppercase tracking-wider text-white flex items-center gap-2">
                        <span>🌀 GAME WORLD DEITY ALIGNED:</span>
                        <span className="text-[9.5px] px-2 py-0.5 rounded font-mono font-black shadow-md" style={{ backgroundColor: activeBanner.spec.colorHex, color: '#090d16' }}>
                          {activeBanner.spec.name.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-300 mt-0.5 leading-snug">
                        {activeBanner.spec.title} — Synergy field recalibrated across all combat coordinates!
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveBanner(null)}
                    className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 bg-slate-900/60 rounded border border-white/10"
                  >
                    ✕
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Content Area */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 relative z-10">

              {/* Deity Element Quick Switch & Alignment Station */}
              <div className="p-4 bg-slate-950/70 border border-indigo-500/30 rounded-xl space-y-3 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                      <Sparkles size={16} className="text-indigo-400 animate-spin" style={{ animationDuration: '6s' }} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                        <span>🌟 Deity Element Alignment Station</span>
                        <span className="text-[8.5px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-1.5 py-0.5 rounded font-mono font-black">
                          12 AFFINITIES
                        </span>
                      </h4>
                      <p className="text-[9.5px] text-slate-400 mt-0.5">
                        {deityTowers.length > 0 
                          ? `${deityTowers.length} Deity unit(s) deployed on combat map. Click any element to align world affinity with visual particle feedback.`
                          : "Select an elemental affinity to align deity resonance before or during combat."}
                      </p>
                    </div>
                  </div>
                  
                  {deityTowers.length > 0 && (
                    <div className="text-right hidden sm:block">
                      <span className="text-[8.5px] text-slate-400 uppercase font-bold block">Current Active Deity</span>
                      <span className="text-xs font-black text-amber-300 flex items-center justify-end gap-1">
                        {ELEMENT_SPECS[currentDeityElement as keyof typeof ELEMENT_SPECS]?.icon}
                        {ELEMENT_SPECS[currentDeityElement as keyof typeof ELEMENT_SPECS]?.name.split(' ')[0]}
                      </span>
                    </div>
                  )}
                </div>

                {/* 12 Element Selector Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-1">
                  {Object.entries(ELEMENT_SPECS).map(([key, spec], idx) => {
                    const isCurrent = currentDeityElement === key;
                    return (
                      <button
                        key={`deity-elem-${key}-${idx}`}
                        onClick={(e) => handleSwitchElement(key, e)}
                        className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer active:scale-95 group relative overflow-hidden ${
                          isCurrent
                            ? 'bg-slate-900 border-2 scale-105 shadow-lg'
                            : 'bg-slate-950/40 border-slate-800 hover:border-slate-600 hover:bg-slate-900/60'
                        }`}
                        style={{
                          borderColor: isCurrent ? spec.colorHex : undefined,
                          boxShadow: isCurrent ? `0 0 16px ${spec.colorHex}66` : undefined
                        }}
                      >
                        {isCurrent && (
                          <motion.div
                            layoutId="activeDeityBorder"
                            className="absolute inset-0 rounded-xl border-2 pointer-events-none"
                            style={{ borderColor: spec.colorHex }}
                          />
                        )}
                        <span className="text-xl group-hover:scale-125 transition-transform duration-200">{spec.icon}</span>
                        <span className={`text-[8.5px] font-black uppercase tracking-wider text-center ${spec.colorClass}`}>
                          {key}
                        </span>
                        {isCurrent && (
                          <span className="text-[7px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1 rounded-full">
                            ACTIVE
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grand Total Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Total Elemental Damage</span>
                    <div className="text-2xl font-black text-cyan-400 mt-1">{formatDamage(stats.totalDamage)}</div>
                  </div>
                  <Swords size={28} className="text-cyan-500/20" />
                </div>

                <div className="p-4 bg-slate-950/50 border border-amber-500/20 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-amber-400 uppercase tracking-wider font-bold">Dominant Element</span>
                    <div className="text-lg font-black text-amber-300 mt-1 flex items-center gap-1.5">
                      <span>{ELEMENT_SPECS[stats.maxDmgId as keyof typeof ELEMENT_SPECS]?.icon}</span>
                      <span>{ELEMENT_SPECS[stats.maxDmgId as keyof typeof ELEMENT_SPECS]?.name.split(' ')[0]}</span>
                    </div>
                  </div>
                  <Crown size={28} className="text-amber-400/20 animate-bounce" style={{ animationDuration: '4s' }} />
                </div>

                <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Active Resonance Units</span>
                    <div className="text-2xl font-black text-emerald-400 mt-1">
                      {towers.length} <span className="text-xs text-slate-500 font-medium">Placed</span>
                    </div>
                  </div>
                  <ShieldCheck size={28} className="text-emerald-500/20" />
                </div>
              </div>

              {/* Leaderboard Table Header */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
                    <Trophy size={13} className="text-yellow-500" /> Current Strength Standings
                  </h4>
                  <span className="text-[8.5px] text-slate-500 uppercase">Click on any row to view synergies & natural units</span>
                </div>

                {/* Leaderboard Entries */}
                <div className="space-y-2.5">
                  {stats.list.map((el, idx) => {
                    const isExpanded = expandedElement === el.id;
                    const rankSuffix = idx === 0 ? '🏆' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
                    const isHighest = idx === 0 && el.dmg > 0;
                    const isDeityActive = currentDeityElement === el.id;

                    return (
                      <div
                        key={`${el.id}-${idx}`}
                        className={`border rounded-xl transition-all duration-350 overflow-hidden ${
                          isExpanded 
                            ? 'border-slate-600 bg-slate-950/70 shadow-lg' 
                            : 'border-slate-800/80 bg-slate-950/20 hover:border-slate-700 hover:bg-slate-950/40'
                        }`}
                      >
                        {/* Summary Clickable Row */}
                        <div
                          onClick={() => toggleExpand(el.id)}
                          className="px-4 py-3 flex items-center justify-between cursor-pointer select-none"
                        >
                          {/* Rank & Name */}
                          <div className="flex items-center gap-3.5 min-w-[200px]">
                            <span className="text-xs font-black text-slate-500 w-6 text-center">{rankSuffix}</span>
                            <span className="text-lg">{el.icon}</span>
                            <div>
                              <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                                {el.name}
                                {isHighest && (
                                  <span className="text-[7.5px] bg-amber-500/10 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded uppercase font-black tracking-wider animate-pulse">
                                    Strongest
                                  </span>
                                )}
                                {isDeityActive && (
                                  <span className="text-[7.5px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-1.5 py-0.5 rounded uppercase font-black tracking-wider">
                                    Deity Aligned
                                  </span>
                                )}
                              </div>
                              <div className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">
                                {el.archetype}
                              </div>
                            </div>
                          </div>

                          {/* Real-time bar graph block */}
                          <div className="flex-1 max-w-sm px-4 hidden md:block">
                            <div className="flex justify-between text-[8px] text-slate-400 font-bold mb-1">
                              <span>DAMAGE SHARE</span>
                              <span>{el.percent.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${el.percent}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                className={`h-full ${el.barColor}`}
                              />
                            </div>
                          </div>

                          {/* Deployed Count & Damage */}
                          <div className="flex items-center gap-6 text-right">
                            <div className="text-right">
                              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Dealt</div>
                              <div className="text-xs font-black text-slate-200">{formatDamage(el.dmg)}</div>
                            </div>

                            <div className="text-right min-w-[70px]">
                              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Deployed</div>
                              <span className={`inline-flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                                el.unitCount > 0 
                                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' 
                                  : 'bg-slate-900 text-slate-500'
                              }`}>
                                {el.unitCount}
                              </span>
                            </div>

                            <div className="text-slate-500">
                              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </div>
                          </div>
                        </div>

                        {/* Expanded details container */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="border-t border-slate-800/80 bg-slate-950/40 p-4 space-y-4 text-xs text-slate-300 leading-relaxed"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Left column: Ability description & lore */}
                                <div className="space-y-2">
                                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                                    <Star size={11} className="text-yellow-400" /> Elemental Overlord Skill
                                  </div>
                                  <div className={`p-2.5 rounded-lg border bg-slate-950/60 ${el.borderClass}`}>
                                    <div className={`font-black text-[10px] tracking-wider uppercase ${el.colorClass}`}>
                                      {el.title}
                                    </div>
                                    <p className="text-[10.5px] text-slate-300 mt-1">
                                      {el.desc}
                                    </p>
                                  </div>
                                </div>

                                {/* Right column: Resonance & Buff statuses + Deity Switcher button */}
                                <div className="space-y-2">
                                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                                    <Zap size={11} className="text-amber-400" /> Resonance & Synergy Buff
                                  </div>
                                  <div className={`p-2.5 rounded-lg border bg-slate-950/60 ${
                                    el.unitCount >= 2 ? 'border-emerald-500/30 bg-emerald-950/10' : 'border-slate-800 bg-slate-950/60'
                                  }`}>
                                    <div className="flex items-center justify-between">
                                      <span className="font-extrabold uppercase text-[9px] text-slate-300">Resonance Status</span>
                                      <span className={`text-[8.5px] px-1.5 py-0.2 rounded font-black uppercase tracking-wider ${
                                        el.unitCount >= 2 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                                      }`}>
                                        {el.unitCount >= 6 ? 'Tier III Active' : el.unitCount >= 4 ? 'Tier II Active' : el.unitCount >= 2 ? 'Tier I Active' : 'Inactive'}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-slate-300 mt-1.5 italic">
                                      {el.synergyBonus}
                                    </p>
                                    
                                    <button
                                      onClick={(e) => handleSwitchElement(el.id, e)}
                                      className={`mt-2.5 w-full py-1.5 rounded-lg font-black uppercase text-[9.5px] tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                                        isDeityActive
                                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600'
                                      }`}
                                    >
                                      <span>🌀 ALIGN DEITY TO {el.name.split(' ')[0].toUpperCase()}</span>
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Natural Beasts Table for this Element */}
                              <div className="pt-2">
                                <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1 mb-1.5">
                                  🐾 Associated Beasts Codex
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {el.id === 'fire' && (
                                    <>
                                      <span className="px-2 py-1 bg-red-950/40 border border-red-500/20 text-red-300 rounded font-bold text-[9px]">🌋 The Elemental Deity</span>
                                      <span className="px-2 py-1 bg-red-950/40 border border-red-500/20 text-red-300 rounded font-bold text-[9px]">🦊 Red Fox</span>
                                      <span className="px-2 py-1 bg-red-950/40 border border-red-500/20 text-red-300 rounded font-bold text-[9px]">🦁 King Lion</span>
                                      <span className="px-2 py-1 bg-red-950/40 border border-red-500/20 text-red-300 rounded font-bold text-[9px]">🦅 Fire Phoenix</span>
                                      <span className="px-2 py-1 bg-red-950/40 border border-red-500/20 text-red-300 rounded font-bold text-[9px]">🦖 Ancient Dragon</span>
                                      <span className="px-2 py-1 bg-red-950/40 border border-red-500/20 text-red-300 rounded font-bold text-[9px]">🐆 Manticore Chimera</span>
                                    </>
                                  )}
                                  {el.id === 'poison' && (
                                    <>
                                      <span className="px-2 py-1 bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 rounded font-bold text-[9px]">🐝 Golden Bee</span>
                                      <span className="px-2 py-1 bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 rounded font-bold text-[9px]">🐍 Stone Basilisk</span>
                                      <span className="px-2 py-1 bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 rounded font-bold text-[9px]">🐙 Cosmic Cthulhu</span>
                                      <span className="px-2 py-1 bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 rounded font-bold text-[9px]">🦎 Atomic Kaiju</span>
                                    </>
                                  )}
                                  {el.id === 'water' && (
                                    <>
                                      <span className="px-2 py-1 bg-blue-950/40 border border-blue-500/20 text-blue-300 rounded font-bold text-[9px]">🐊 Nile Crocodile</span>
                                      <span className="px-2 py-1 bg-blue-950/40 border border-blue-500/20 text-blue-300 rounded font-bold text-[9px]">🐋 Astra Leviathan</span>
                                      <span className="px-2 py-1 bg-blue-950/40 border border-blue-500/20 text-blue-300 rounded font-bold text-[9px]">🦑 Nebula Space Kraken</span>
                                    </>
                                  )}
                                  {el.id === 'sand' && (
                                    <>
                                      <span className="px-2 py-1 bg-amber-950/20 border border-amber-500/20 text-amber-300 rounded font-bold text-[9px]">🦊 Red Fox</span>
                                      <span className="px-2 py-1 bg-amber-950/20 border border-amber-500/20 text-amber-300 rounded font-bold text-[9px]">🐆 Manticore Chimera</span>
                                      <span className="px-2 py-1 bg-amber-950/20 border border-amber-500/20 text-amber-300 rounded font-bold text-[9px]">🌌 Solara Unrivaled Phoenix</span>
                                      <span className="px-2 py-1 bg-amber-950/20 border border-amber-500/20 text-amber-300 rounded font-bold text-[9px]">👾 Zenos Unrivaled Behemoth</span>
                                    </>
                                  )}
                                  {el.id === 'dirt' && (
                                    <>
                                      <span className="px-2 py-1 bg-orange-950/20 border border-orange-500/20 text-orange-300 rounded font-bold text-[9px]">🐭 Field Mouse</span>
                                      <span className="px-2 py-1 bg-orange-950/20 border border-orange-500/20 text-orange-300 rounded font-bold text-[9px]">🐺 Grey Wolf</span>
                                      <span className="px-2 py-1 bg-orange-950/20 border border-orange-500/20 text-orange-300 rounded font-bold text-[9px]">🐻 Grizzly Bear</span>
                                      <span className="px-2 py-1 bg-orange-950/20 border border-orange-500/20 text-orange-300 rounded font-bold text-[9px]">🦖 Tyrannosaurus Rex</span>
                                      <span className="px-2 py-1 bg-orange-950/20 border border-orange-500/20 text-orange-300 rounded font-bold text-[9px]">🏛️ The Archon Overseer</span>
                                      <span className="px-2 py-1 bg-orange-950/20 border border-orange-500/20 text-orange-300 rounded font-bold text-[9px]">💎 Nebula Overcharge Beacon</span>
                                    </>
                                  )}
                                  {el.id === 'ice' && (
                                    <>
                                      <span className="px-2 py-1 bg-cyan-950/40 border border-cyan-500/20 text-cyan-300 rounded font-bold text-[9px]">🐰 Swift Rabbit</span>
                                      <span className="px-2 py-1 bg-cyan-950/40 border border-cyan-500/20 text-cyan-300 rounded font-bold text-[9px]">🐘 Woolly Mammoth</span>
                                      <span className="px-2 py-1 bg-cyan-950/40 border border-cyan-500/20 text-cyan-300 rounded font-bold text-[9px]">⏳ Infinity Chronos</span>
                                      <span className="px-2 py-1 bg-cyan-950/40 border border-cyan-500/20 text-cyan-300 rounded font-bold text-[9px]">🥶 Entropy Devourer</span>
                                    </>
                                  )}
                                  {el.id === 'wind' && (
                                    <>
                                      <span className="px-2 py-1 bg-slate-800/40 border border-slate-500/20 text-slate-300 rounded font-bold text-[9px]">🐦 Pigeon</span>
                                      <span className="px-2 py-1 bg-slate-800/40 border border-slate-500/20 text-slate-300 rounded font-bold text-[9px]">🦅 Golden Eagle</span>
                                      <span className="px-2 py-1 bg-slate-800/40 border border-slate-500/20 text-slate-300 rounded font-bold text-[9px]">🦤 Battle Dodo</span>
                                      <span className="px-2 py-1 bg-slate-800/40 border border-slate-500/20 text-slate-300 rounded font-bold text-[9px]">🦁 saber-toothed Tiger</span>
                                      <span className="px-2 py-1 bg-slate-800/40 border border-slate-500/20 text-slate-300 rounded font-bold text-[9px]">🦅 Storm Griffin</span>
                                      <span className="px-2 py-1 bg-slate-800/40 border border-slate-500/20 text-slate-300 rounded font-bold text-[9px]">🐎 Nebula Pegasus</span>
                                    </>
                                  )}
                                  {el.id === 'lightning' && (
                                    <>
                                      <span className="px-2 py-1 bg-yellow-950/40 border border-yellow-500/20 text-yellow-300 rounded font-bold text-[9px]">⚡ The Elemental Deity (Thunder)</span>
                                    </>
                                  )}
                                  {el.id === 'light' && (
                                    <>
                                      <span className="px-2 py-1 bg-amber-950/40 border border-amber-400/20 text-amber-300 rounded font-bold text-[9px]">🌟 The Elemental Deity (Light)</span>
                                    </>
                                  )}
                                  {el.id === 'shadow' && (
                                    <>
                                      <span className="px-2 py-1 bg-purple-950/40 border border-purple-500/20 text-purple-300 rounded font-bold text-[9px]">🌌 The Elemental Deity (Shadow)</span>
                                    </>
                                  )}
                                  {el.id === 'magma' && (
                                    <>
                                      <span className="px-2 py-1 bg-orange-950/40 border border-orange-500/20 text-orange-300 rounded font-bold text-[9px]">🌋 The Elemental Deity (Magma)</span>
                                    </>
                                  )}
                                  {el.id === 'cosmos' && (
                                    <>
                                      <span className="px-2 py-1 bg-pink-950/40 border border-pink-500/20 text-pink-300 rounded font-bold text-[9px]">✨ The Elemental Deity (Cosmos)</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Resonance Guide Banner */}
              <div className="p-4 bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-indigo-500/20 rounded-xl space-y-2">
                <h5 className="text-xs font-black text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Info size={13} className="text-indigo-400" /> Mastery of Resonance Mechanics
                </h5>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Resonance Synergy tiers are calculated dynamically based on dispatch ratios. Aligning identical natural elements on the field boosts their intrinsic active speeds and multipliers. You can also deploy the <span className="text-amber-400 font-extrabold">Elemental Deity (The Elemental God)</span> and switch its element dynamically on the unit panel or directly in this modal to fill synergy gaps!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-[10px]">
                  <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
                    <span className="text-emerald-400 font-extrabold block">Tier I (2+ Units)</span>
                    <span className="text-slate-400">Deploy 2+ units of the same element to receive +15% Base Attack Speed.</span>
                  </div>
                  <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
                    <span className="text-yellow-400 font-extrabold block">Tier II (4+ Units)</span>
                    <span className="text-slate-400">Deploy 4+ units of the same element to receive +30% Base Damage.</span>
                  </div>
                  <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
                    <span className="text-fuchsia-400 font-extrabold block">Tier III (6+ Units)</span>
                    <span className="text-slate-400">Deploy 6+ units of the same element to receive +50% Ultimate skill range & duration.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-400 relative z-10">
              <span className="uppercase tracking-widest flex items-center gap-1">
                <Sparkles size={11} className="text-amber-400" /> Primal Force Elements Panel
              </span>
              <span>All element damages accumulate in real-time. Standings automatically update.</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
