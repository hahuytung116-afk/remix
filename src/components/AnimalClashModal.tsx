import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Swords, Trophy, Crown, Zap, Sparkles, Timer, Users, Bot, Play, Flame, ShieldAlert, X, RefreshCw, Award, ChevronRight } from 'lucide-react';
import { Animal } from '../types';
import { ANIMALS } from '../constants';
import { gameAudio } from '../utils/audio';
import AnimalAvatar from './AnimalAvatar';
import CapybaraAvatar from './CapybaraAvatar';

interface AnimalClashModalProps {
  isOpen: boolean;
  onClose: () => void;
  summonedAnimals: (string | Animal)[];
  onReward: (shards: number, meat: number, dna: number) => void;
}

export type AnimalLook = 'default' | 'infernal' | 'cyber' | 'cosmic' | 'void';

export const LOOK_OPTIONS = [
  { id: 'default', name: 'Default Look', color: '#94a3b8', emoji: '✨' },
  { id: 'infernal', name: '🔥 Infernal Flame', color: '#f97316', emoji: '🔥' },
  { id: 'cyber', name: '⚡ Cyber Overdrive', color: '#06b6d4', emoji: '⚡' },
  { id: 'cosmic', name: '🌌 Cosmic Stardust', color: '#a855f7', emoji: '🌌' },
  { id: 'void', name: '💀 Void Corruption', color: '#ec4899', emoji: '💀' },
];

export const getAttackSpeed = (unit: Animal): number => {
  if ('attackSpeed' in unit && typeof (unit as any).attackSpeed === 'number') {
    return (unit as any).attackSpeed;
  }
  if (unit.fireRate && unit.fireRate > 0) {
    return 1000 / unit.fireRate;
  }
  return 1;
};

export const getBaseDamage = (unit: Animal): number => {
  if ('baseDamage' in unit && typeof (unit as any).baseDamage === 'number') {
    return (unit as any).baseDamage;
  }
  return unit.damage || 10;
};

export const getLevel = (unit: any): number => {
  return unit.level || 1;
};

export const drawUnitLook = (ctx: CanvasRenderingContext2D, look: AnimalLook, now: number) => {
  const pulse = Math.sin(now / 150) * 5;
  if (look === 'infernal') {
    // Fire aura glow
    const grad = ctx.createRadialGradient(0, -10, 10, 0, -10, 35 + pulse);
    grad.addColorStop(0, 'rgba(249, 115, 22, 0.45)');
    grad.addColorStop(1, 'rgba(249, 115, 22, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, -10, 35 + pulse, 0, Math.PI * 2);
    ctx.fill();

    // Floating fire sparks
    ctx.fillStyle = '#f97316';
    for (let i = 0; i < 5; i++) {
      const angle = (now / 500 + i * (Math.PI / 2.5)) % (Math.PI * 2);
      const r = 20 + Math.sin(now / 200 + i) * 6;
      const sx = Math.cos(angle) * r;
      const sy = Math.sin(angle) * r - 10;
      ctx.beginPath();
      ctx.arc(sx, sy, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (look === 'cyber') {
    // Cyber cyan glow
    const grad = ctx.createRadialGradient(0, -10, 10, 0, -10, 30 + pulse);
    grad.addColorStop(0, 'rgba(6, 182, 212, 0.4)');
    grad.addColorStop(1, 'rgba(6, 182, 212, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, -10, 30 + pulse, 0, Math.PI * 2);
    ctx.fill();

    // Cyber target crosshair/ring
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, -10, 24, now / 1000, now / 1000 + Math.PI * 1.5);
    ctx.stroke();

    // Scanlines
    ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
    const scanY = ((now / 10) % 30) - 25;
    ctx.fillRect(-20, scanY, 40, 2);
  } else if (look === 'cosmic') {
    // Cosmic purple glow
    const grad = ctx.createRadialGradient(0, -10, 10, 0, -10, 35 + pulse);
    grad.addColorStop(0, 'rgba(168, 85, 247, 0.45)');
    grad.addColorStop(1, 'rgba(168, 85, 247, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, -10, 35 + pulse, 0, Math.PI * 2);
    ctx.fill();

    // Sparkling stars orbiting
    ctx.fillStyle = '#fbbf24';
    for (let i = 0; i < 3; i++) {
      const angle = (now / 400 + i * (Math.PI * 2 / 3)) % (Math.PI * 2);
      const sx = Math.cos(angle) * 28;
      const sy = Math.sin(angle) * 12 - 10;
      ctx.beginPath();
      ctx.arc(sx, sy, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (look === 'void') {
    // Dark void glow
    const grad = ctx.createRadialGradient(0, -10, 10, 0, -10, 32 + pulse);
    grad.addColorStop(0, 'rgba(236, 72, 153, 0.45)');
    grad.addColorStop(0.5, 'rgba(15, 23, 42, 0.8)');
    grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, -10, 32 + pulse, 0, Math.PI * 2);
    ctx.fill();

    // Void orbiting dark circles
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, -10, 26, -now / 800, -now / 800 + Math.PI * 0.8);
    ctx.stroke();
  }
};

const AI_PRESETS: any[] = [
  {
    id: 'ai_chrono',
    name: '👑 Chrono Overlord (AI)',
    rarity: 'Mythic',
    level: 10,
    damage: 850,
    fireRate: 450, // approx 2.2 attacks/sec
    range: 300,
    cost: 5000,
    color: '#38bdf8',
    emoji: '⌛',
    description: 'Master of temporal distortion.',
  },
  {
    id: 'ai_titan',
    name: '⚡ Apex Sovereign (AI)',
    rarity: 'Ultimate' as any,
    level: 12,
    damage: 1200,
    fireRate: 550, // approx 1.8 attacks/sec
    range: 350,
    cost: 10000,
    color: '#a855f7',
    emoji: '👾',
    description: 'Ancient titan forged in dark energy.',
  },
  {
    id: 'ai_phoenix',
    name: '🔥 Solar Phoenix (AI)',
    rarity: 'Legendary',
    level: 8,
    damage: 650,
    fireRate: 400, // approx 2.5 attacks/sec
    range: 280,
    cost: 3000,
    color: '#f97316',
    emoji: '🦅',
    description: 'Infernal firebird with endless solar rays.',
  }
];

export const AnimalClashModal: React.FC<AnimalClashModalProps> = ({
  isOpen,
  onClose,
  summonedAnimals,
  onReward,
}) => {
  const [vsMode, setVsMode] = useState<'ai' | 'p2'>('ai');
  const [p1Unit, setP1Unit] = useState<Animal | null>(null);
  const [p2Unit, setP2Unit] = useState<Animal | null>(null);
  const [p1Name, setP1Name] = useState<string>('Player 1');
  const [p2Name, setP2Name] = useState<string>('Rival AI');
  const [botDifficulty, setBotDifficulty] = useState<'novice' | 'adept' | 'expert' | 'deity' | 'unbeatable'>('expert');
  const [duration, setDuration] = useState<number>(45);

  // Cosmetic looks state
  const [p1Look, setP1Look] = useState<AnimalLook>('default');
  const [p2Look, setP2Look] = useState<AnimalLook>('default');

  // Battle Phase state
  const [inBattle, setInBattle] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(45);
  const [p1Damage, setP1Damage] = useState<number>(0);
  const [p2Damage, setP2Damage] = useState<number>(0);
  const [p1Dps, setP1Dps] = useState<number>(0);
  const [p2Dps, setP2Dps] = useState<number>(0);
  const [winner, setWinner] = useState<'p1' | 'p2' | 'draw' | null>(null);
  const [battleFinished, setBattleFinished] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Default candidate animals memoized
  const defaultFallbackAnimals = React.useMemo(() => ANIMALS.slice(0, 6), []);

  // Map summonedAnimals (which are string IDs or actual Animal objects) to actual Animal objects from ANIMALS
  const mappedUserAnimals = React.useMemo(() => {
    return summonedAnimals
      .map(item => {
        if (typeof item === 'string') {
          return ANIMALS.find(a => a.id === item);
        }
        return item;
      })
      .filter((a): a is Animal => !!a);
  }, [summonedAnimals]);

  // Available candidate animals for selection
  const userAnimals = mappedUserAnimals.length > 0 ? mappedUserAnimals : defaultFallbackAnimals;

  // Initialize selections when modal opens or mode changes
  useEffect(() => {
    if (isOpen) {
      setP1Unit(prev => prev || userAnimals[0] || null);
      if (vsMode === 'ai') {
        setP2Unit(prev => prev || AI_PRESETS[0]);
        setP2Name(prev => prev === 'Rival AI (Chrono)' ? prev : 'Rival AI (Chrono)');
      } else {
        setP2Unit(prev => prev || userAnimals[1] || userAnimals[0] || null);
        setP2Name(prev => prev === 'Player 2' ? prev : 'Player 2');
      }
    }
  }, [isOpen, vsMode, userAnimals]);

  // Handle Mode Toggle
  const handleModeChange = (mode: 'ai' | 'p2') => {
    setVsMode(mode);
    if (mode === 'ai') {
      setP2Unit(AI_PRESETS[0]);
      setP2Name('Rival AI (Chrono)');
    } else {
      setP2Unit(userAnimals[1] || userAnimals[0]);
      setP2Name('Player 2');
    }
  };

  // Start Clash Battle
  const handleStartClash = () => {
    if (!p1Unit || !p2Unit) return;
    setP1Damage(0);
    setP2Damage(0);
    setP1Dps(0);
    setP2Dps(0);
    setTimeLeft(duration);
    setWinner(null);
    setBattleFinished(false);
    setInBattle(true);
    gameAudio.playSFX('wave_start');
  };

  // Battle Simulation Engine (Canvas + Animation loop)
  useEffect(() => {
    if (!inBattle || !canvasRef.current || !p1Unit || !p2Unit) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();
    let elapsedBattleTime = 0;

    let totalP1Dmg = 0;
    let totalP2Dmg = 0;

    let p1Cooldown = 0;
    let p2Cooldown = 0;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
      life: number;
      maxLife: number;
      text?: string;
    }

    interface Projectile {
      x: number;
      y: number;
      tx: number;
      ty: number;
      color: string;
      speed: number;
      damage: number;
      fromP1: boolean;
      size: number;
    }

    const particles: Particle[] = [];
    const projectiles: Projectile[] = [];

    const bossX = canvas.width / 2;
    const bossY = canvas.height / 2 + 10;
    const p1X = 100;
    const p1Y = canvas.height / 2 + 30;
    const p2X = canvas.width - 100;
    const p2Y = canvas.height / 2 + 30;

    const renderLoop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      elapsedBattleTime += dt;
      const currentRemaining = Math.max(0, duration - elapsedBattleTime);
      setTimeLeft(Math.ceil(currentRemaining));

      // Calculate base damage
      const p1BaseDmg = getBaseDamage(p1Unit) * getLevel(p1Unit);
      let p2BaseDmg = getBaseDamage(p2Unit) * getLevel(p2Unit);

      let p2SpeedMultiplier = 1.0;
      if (vsMode === 'ai') {
        const difficultyMods = {
          novice: { dmg: 1.0, speed: 1.0 },
          adept: { dmg: 2.2, speed: 1.4 },
          expert: { dmg: 4.5, speed: 1.8 },
          deity: { dmg: 9.8, speed: 2.4 },
          unbeatable: { dmg: 24.0, speed: 3.5 }
        }[botDifficulty];

        p2BaseDmg = Math.floor(p2BaseDmg * difficultyMods.dmg);
        p2SpeedMultiplier = difficultyMods.speed;
      }

      p1Cooldown -= dt;
      p2Cooldown -= dt;

      // P1 Attack
      if (p1Cooldown <= 0) {
        const speed = getAttackSpeed(p1Unit);
        const interval = 1 / Math.max(0.1, speed);
        p1Cooldown = interval;

        const isCrit = Math.random() < 0.25;
        const dmg = Math.floor(p1BaseDmg * (isCrit ? 2.2 : 1.0) * (0.9 + Math.random() * 0.2));

        let projColor = p1Unit.color || '#38bdf8';
        if (p1Look === 'infernal') projColor = '#f97316';
        else if (p1Look === 'cyber') projColor = '#06b6d4';
        else if (p1Look === 'cosmic') projColor = '#a855f7';
        else if (p1Look === 'void') projColor = '#ec4899';

        projectiles.push({
          x: p1X,
          y: p1Y - 20,
          tx: bossX - 20,
          ty: bossY - 10,
          color: projColor,
          speed: 450,
          damage: dmg,
          fromP1: true,
          size: isCrit ? 10 : 6
        });
      }

      // P2 Attack
      if (p2Cooldown <= 0) {
        const speed = getAttackSpeed(p2Unit) * p2SpeedMultiplier;
        const interval = 1 / Math.max(0.1, speed);
        p2Cooldown = interval;

        const isCrit = Math.random() < 0.25;
        const dmg = Math.floor(p2BaseDmg * (isCrit ? 2.2 : 1.0) * (0.9 + Math.random() * 0.2));

        let projColor = p2Unit.color || '#f43f5e';
        if (p2Look === 'infernal') projColor = '#f97316';
        else if (p2Look === 'cyber') projColor = '#06b6d4';
        else if (p2Look === 'cosmic') projColor = '#a855f7';
        else if (p2Look === 'void') projColor = '#ec4899';

        projectiles.push({
          x: p2X,
          y: p2Y - 20,
          tx: bossX + 20,
          ty: bossY - 10,
          color: projColor,
          speed: 450,
          damage: dmg,
          fromP1: false,
          size: isCrit ? 10 : 6
        });
      }

      // Clear Canvas & Draw Background
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Arena Mesh Floor
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.1)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y <= canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Platforms
      // P1 Platform
      ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(p1X, p1Y + 20, 50, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // P2 Platform
      ctx.fillStyle = 'rgba(244, 63, 94, 0.15)';
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(p2X, p2Y + 20, 50, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Infinite Boss Platform
      ctx.fillStyle = 'rgba(168, 85, 247, 0.2)';
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(bossX, bossY + 40, 80, 30, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Render P1 Look Aura
      ctx.save();
      ctx.translate(p1X, p1Y - 10);
      drawUnitLook(ctx, p1Look, now);
      ctx.restore();

      // Render P1 Unit
      ctx.save();
      ctx.translate(p1X, p1Y - 10);
      if (p1Unit.id === 'capybara' || p1Unit.rarity === 'The Chillful') {
        // Authentic Capybara Canvas Rendering
        ctx.fillStyle = '#92400e';
        ctx.fillRect(-18, -14, 36, 30); // Head
        // Ears
        ctx.fillStyle = '#78350f';
        ctx.beginPath(); ctx.arc(-14, -16, 5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(14, -16, 5, 0, Math.PI * 2); ctx.fill();
        // Snout
        ctx.fillStyle = '#451a03';
        ctx.fillRect(-14, 0, 28, 16);
        // Nostrils
        ctx.fillStyle = '#000000';
        ctx.fillRect(-6, 8, 3, 3);
        ctx.fillRect(3, 8, 3, 3);
        // Zen Closed Eyes
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(-14, -3); ctx.lineTo(-6, -3); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(6, -3); ctx.lineTo(14, -3); ctx.stroke();
        // Yuzu Orange On Head
        ctx.fillStyle = '#f97316';
        ctx.beginPath(); ctx.arc(0, -20, 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#22c55e';
        ctx.beginPath(); ctx.ellipse(3, -26, 3, 1.5, Math.PI / 4, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.font = '36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(p1Unit.emoji || '🦁', 0, 0);
      }
      ctx.restore();

      // Render P2 Look Aura
      ctx.save();
      ctx.translate(p2X, p2Y - 10);
      drawUnitLook(ctx, p2Look, now);
      ctx.restore();

      // Render P2 Unit
      ctx.save();
      ctx.translate(p2X, p2Y - 10);
      if (p2Unit.id === 'capybara' || p2Unit.rarity === 'The Chillful') {
        // Authentic Capybara Canvas Rendering
        ctx.fillStyle = '#92400e';
        ctx.fillRect(-18, -14, 36, 30); // Head
        // Ears
        ctx.fillStyle = '#78350f';
        ctx.beginPath(); ctx.arc(-14, -16, 5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(14, -16, 5, 0, Math.PI * 2); ctx.fill();
        // Snout
        ctx.fillStyle = '#451a03';
        ctx.fillRect(-14, 0, 28, 16);
        // Nostrils
        ctx.fillStyle = '#000000';
        ctx.fillRect(-6, 8, 3, 3);
        ctx.fillRect(3, 8, 3, 3);
        // Zen Closed Eyes
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(-14, -3); ctx.lineTo(-6, -3); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(6, -3); ctx.lineTo(14, -3); ctx.stroke();
        // Yuzu Orange On Head
        ctx.fillStyle = '#f97316';
        ctx.beginPath(); ctx.arc(0, -20, 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#22c55e';
        ctx.beginPath(); ctx.ellipse(3, -26, 3, 1.5, Math.PI / 4, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.font = '36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(p2Unit.emoji || '🐯', 0, 0);
      }
      ctx.restore();

      // Render Infinite Colossus Titan Boss
      ctx.save();
      ctx.translate(bossX, bossY - 20);
      const bossPulse = Math.sin(now / 200) * 8;

      // Boss Aura
      ctx.fillStyle = 'rgba(168, 85, 247, 0.25)';
      ctx.beginPath();
      ctx.arc(0, 0, 60 + bossPulse, 0, Math.PI * 2);
      ctx.fill();

      // Boss Core Emoji / Icon
      ctx.font = '64px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('👾', 0, 10);

      // Boss Label
      ctx.fillStyle = '#f3e8ff';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('INFINITY COLOSSUS TITAN', 0, -55);
      ctx.fillStyle = '#c084fc';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`TOTAL DMG TAKEN: ${(totalP1Dmg + totalP2Dmg).toLocaleString()}`, 0, -42);

      ctx.restore();

      // Update & Draw Projectiles
      for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        const dx = p.tx - p.x;
        const dy = p.ty - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 15) {
          // Hit Titan!
          if (p.fromP1) {
            totalP1Dmg += p.damage;
          } else {
            totalP2Dmg += p.damage;
          }

          // Spawn hit particle / damage float
          particles.push({
            x: p.tx + (Math.random() - 0.5) * 40,
            y: p.ty + (Math.random() - 0.5) * 40,
            vx: (Math.random() - 0.5) * 40,
            vy: -80 - Math.random() * 40,
            color: p.color,
            size: 12,
            life: 0,
            maxLife: 0.8,
            text: `+${p.damage.toLocaleString()}`
          });

          projectiles.splice(i, 1);
        } else {
          p.x += (dx / dist) * p.speed * dt;
          p.y += (dy / dist) * p.speed * dt;

          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      // Update & Draw Particles (Damage Numbers)
      for (let i = particles.length - 1; i >= 0; i--) {
        const pt = particles[i];
        pt.life += dt;
        if (pt.life >= pt.maxLife) {
          particles.splice(i, 1);
        } else {
          pt.x += pt.vx * dt;
          pt.y += pt.vy * dt;
          const alpha = 1 - pt.life / pt.maxLife;

          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = pt.color;
          ctx.font = 'bold 12px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(pt.text || '', pt.x, pt.y);
          ctx.restore();
        }
      }

      // Sync React state for live meters
      setP1Damage(totalP1Dmg);
      setP2Damage(totalP2Dmg);
      setP1Dps(Math.floor(totalP1Dmg / Math.max(1, elapsedBattleTime)));
      setP2Dps(Math.floor(totalP2Dmg / Math.max(1, elapsedBattleTime)));

      if (currentRemaining <= 0) {
        // Battle Over!
        setInBattle(false);
        setBattleFinished(true);

        let finalWinner: 'p1' | 'p2' | 'draw' = 'draw';
        if (totalP1Dmg > totalP2Dmg) {
          finalWinner = 'p1';
          onReward(100, 50000, 20000);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('clash-win'));
          }
        } else if (totalP2Dmg > totalP1Dmg) {
          finalWinner = 'p2';
        }
        setWinner(finalWinner);
        gameAudio.playSFX('victory');
        return;
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [inBattle, p1Unit, p2Unit, p1Look, p2Look]);

  if (!isOpen) return null;

  const totalDmgSum = Math.max(1, p1Damage + p2Damage);
  const p1Percent = Math.round((p1Damage / totalDmgSum) * 100);
  const p2Percent = Math.round((p2Damage / totalDmgSum) * 100);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-950/80 to-slate-950 pointer-events-none" />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-4xl bg-slate-900/90 border-2 border-indigo-500/50 rounded-3xl p-4 sm:p-6 shadow-[0_0_80px_rgba(99,102,241,0.4)] text-white overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-indigo-500/20 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-rose-600 p-0.5 shadow-lg flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Swords size={20} className="text-cyan-400 animate-pulse" />
                </div>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-rose-300">
                  ANIMAL CLASH ARENA
                </h2>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                  <ShieldAlert size={12} className="text-amber-400" />
                  CONSTRAINT: ONLY 1 UNIT ALLOWED PER PLAYER • INFINITE HEALTH BOSS RAID
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* MAIN CONTENT AREA */}
          {!inBattle && !battleFinished ? (
            /* LOBBY / SETUP PHASE */
            <div className="space-y-6 overflow-y-auto pr-1">
              {/* MODE SELECTOR */}
              <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800">
                <button
                  onClick={() => handleModeChange('ai')}
                  className={`py-3 px-4 rounded-xl font-bold uppercase text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    vsMode === 'ai'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                      : 'bg-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <Bot size={16} /> 1-PLAYER VS CPU RIVAL
                </button>
                <button
                  onClick={() => handleModeChange('p2')}
                  className={`py-3 px-4 rounded-xl font-bold uppercase text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    vsMode === 'p2'
                      ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-lg shadow-rose-500/30'
                      : 'bg-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <Users size={16} /> 2-PLAYER LOCAL CLASH
                </button>
              </div>

              {/* BOT DIFFICULTY SELECTOR */}
              {vsMode === 'ai' && (
                <div className="p-3 bg-slate-950/60 rounded-2xl border border-indigo-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-indigo-400 tracking-wider flex items-center gap-1.5">
                      <Bot size={14} className="animate-pulse text-indigo-400" /> BOT DIFFICULTY RATING
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      High-tier bot boosts both attack frequency & projectile force!
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { id: 'novice', name: 'Novice', color: 'border-slate-700 hover:border-slate-500 text-slate-300', active: 'bg-slate-700/30 border-slate-500 text-slate-100', desc: '1.0x Stats' },
                      { id: 'adept', name: 'Adept', color: 'border-blue-800 hover:border-blue-600 text-blue-300', active: 'bg-blue-500/20 border-blue-400 text-blue-200', desc: '2.2x Stats' },
                      { id: 'expert', name: 'Expert', color: 'border-purple-800 hover:border-purple-600 text-purple-300', active: 'bg-purple-500/20 border-purple-400 text-purple-200', desc: '4.5x Stats' },
                      { id: 'deity', name: 'Deity', color: 'border-rose-800 hover:border-rose-600 text-rose-300', active: 'bg-rose-500/20 border-rose-400 text-rose-200', desc: '9.8x Stats' },
                      { id: 'unbeatable', name: 'Unbeatable', color: 'border-amber-800 hover:border-amber-600 text-amber-300', active: 'bg-amber-500/20 border-amber-400 text-amber-200', desc: '24x Stats 🔥' }
                    ].map((diff, idx) => (
                      <button
                        key={`diff-${diff.id}-${idx}`}
                        onClick={() => setBotDifficulty(diff.id as any)}
                        className={`py-2 px-1 rounded-xl text-center border cursor-pointer transition-all ${
                          botDifficulty === diff.id
                            ? diff.active
                            : `bg-slate-900/40 ${diff.color}`
                        }`}
                      >
                        <div className="text-[10px] font-black uppercase tracking-wider">{diff.name}</div>
                        <div className="text-[8px] font-mono opacity-80 mt-0.5">{diff.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* UNIT SELECTION GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* PLAYER 1 SELECTION */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-cyan-500/30 space-y-3">
                  <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                    <span className="text-xs font-black uppercase text-cyan-400 tracking-wider flex items-center gap-1.5">
                      <Crown size={14} /> PLAYER 1 UNIT (1 SLOT MAX)
                    </span>
                    <input
                      type="text"
                      value={p1Name}
                      onChange={e => setP1Name(e.target.value)}
                      className="bg-slate-900 border border-slate-700 text-xs px-2 py-1 rounded text-cyan-300 font-bold max-w-[120px] text-right"
                    />
                  </div>

                  {p1Unit ? (
                    <div className="p-3 bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-400/50 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center">
                          <AnimalAvatar animal={p1Unit} size="md" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-cyan-200">{p1Unit.name}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            LV.{getLevel(p1Unit)} • DMG: {(getBaseDamage(p1Unit) * getLevel(p1Unit)).toLocaleString()} • SPD: {getAttackSpeed(p1Unit).toFixed(1)}/s
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-cyan-400 uppercase bg-cyan-950 px-2 py-1 rounded border border-cyan-500/30">
                        {(p1Unit as any).type || p1Unit.rarity}
                      </span>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-500">Select a unit below</div>
                  )}

                  {/* Skin / Look Customizer */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-cyan-400 tracking-wider flex items-center gap-1">
                      🎨 Select Animal Look:
                    </label>
                    <div className="grid grid-cols-5 gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
                      {LOOK_OPTIONS.map((opt, idx) => (
                        <button
                          key={`p1-look-${opt.id}-${idx}`}
                          onClick={() => setP1Look(opt.id as any)}
                          title={opt.name}
                          className={`py-1 rounded-lg text-xs flex flex-col items-center justify-center border transition-all cursor-pointer ${
                            p1Look === opt.id
                              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                              : 'bg-transparent border-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span className="text-sm">{opt.emoji}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Animal Pick List */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 bg-slate-900/50 rounded-xl">
                    {userAnimals.map((animal, idx) => (
                      <button
                        key={`${animal.id}-${idx}`}
                        onClick={() => setP1Unit(animal)}
                        className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                          p1Unit?.id === animal.id
                            ? 'bg-cyan-500/30 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-xl flex items-center justify-center min-h-[28px]">
                          <AnimalAvatar animal={animal} size="sm" />
                        </div>
                        <div className="text-[9px] font-bold truncate text-slate-300">{animal.name}</div>
                        <div className="text-[8px] font-mono text-cyan-400">DMG {getBaseDamage(animal).toLocaleString()}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* PLAYER 2 / RIVAL SELECTION */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-rose-500/30 space-y-3">
                  <div className="flex items-center justify-between border-b border-rose-500/20 pb-2">
                    <span className="text-xs font-black uppercase text-rose-400 tracking-wider flex items-center gap-1.5">
                      <Swords size={14} /> {vsMode === 'ai' ? 'RIVAL AI PRESET' : 'PLAYER 2 UNIT (1 SLOT MAX)'}
                    </span>
                    <input
                      type="text"
                      value={p2Name}
                      onChange={e => setP2Name(e.target.value)}
                      className="bg-slate-900 border border-slate-700 text-xs px-2 py-1 rounded text-rose-300 font-bold max-w-[130px] text-right"
                    />
                  </div>

                  {p2Unit ? (
                    <div className="p-3 bg-gradient-to-r from-rose-950/40 to-slate-900 border border-rose-400/50 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center">
                          <AnimalAvatar animal={p2Unit} size="md" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-rose-200">{p2Unit.name}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            LV.{getLevel(p2Unit)} • DMG: {(getBaseDamage(p2Unit) * getLevel(p2Unit)).toLocaleString()} • SPD: {getAttackSpeed(p2Unit).toFixed(1)}/s
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-rose-400 uppercase bg-rose-950 px-2 py-1 rounded border border-rose-500/30">
                        {(p2Unit as any).type || p2Unit.rarity}
                      </span>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-500">Select a unit below</div>
                  )}

                  {/* Skin / Look Customizer */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-rose-400 tracking-wider flex items-center gap-1">
                      🎨 Select Animal Look:
                    </label>
                    <div className="grid grid-cols-5 gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
                      {LOOK_OPTIONS.map((opt, idx) => (
                        <button
                          key={`p2-look-${opt.id}-${idx}`}
                          onClick={() => setP2Look(opt.id as any)}
                          title={opt.name}
                          className={`py-1 rounded-lg text-xs flex flex-col items-center justify-center border transition-all cursor-pointer ${
                            p2Look === opt.id
                              ? 'bg-rose-500/20 border-rose-400 text-rose-300'
                              : 'bg-transparent border-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span className="text-sm">{opt.emoji}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pick List */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 bg-slate-900/50 rounded-xl">
                    {(vsMode === 'ai' ? AI_PRESETS : userAnimals).map((animal, idx) => (
                      <button
                        key={`${animal.id}-${idx}`}
                        onClick={() => setP2Unit(animal)}
                        className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                          p2Unit?.id === animal.id
                            ? 'bg-rose-500/30 border-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.4)]'
                            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-xl flex items-center justify-center min-h-[28px]">
                          <AnimalAvatar animal={animal} size="sm" />
                        </div>
                        <div className="text-[9px] font-bold truncate text-slate-300">{animal.name}</div>
                        <div className="text-[8px] font-mono text-rose-400">DMG {getBaseDamage(animal).toLocaleString()}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* MATCH DURATION & START ACTION */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-950/80 rounded-2xl border border-indigo-500/20">
                <div className="flex items-center gap-3">
                  <Timer size={18} className="text-indigo-400" />
                  <span className="text-xs font-bold uppercase text-slate-300">Match Duration:</span>
                  <div className="flex gap-2">
                    {[30, 45, 60].map((sec, idx) => (
                      <button
                        key={`match-sec-${sec}-${idx}`}
                        onClick={() => setDuration(sec)}
                        className={`px-3 py-1 rounded-lg text-xs font-black font-mono transition-all cursor-pointer ${
                          duration === sec
                            ? 'bg-indigo-500 text-white shadow-md'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {sec}s
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleStartClash}
                  disabled={!p1Unit || !p2Unit}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-rose-600 hover:from-indigo-400 hover:to-rose-500 font-black uppercase text-sm tracking-widest text-white shadow-[0_0_25px_rgba(99,102,241,0.5)] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Play size={18} className="fill-white" /> BEGIN ANIMAL CLASH
                </button>
              </div>
            </div>
          ) : (
            /* ACTIVE BATTLE OR RESULTS VIEW */
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              {/* LIVE TIMER & COMPARISON BAR */}
              <div className="p-3 bg-slate-950/90 rounded-2xl border border-indigo-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-2 text-cyan-400 font-mono">
                    <span className="w-5 h-5 inline-flex items-center justify-center">{p1Unit && <AnimalAvatar animal={p1Unit} size="xs" />}</span> {p1Name}: {p1Damage.toLocaleString()} ({p1Dps.toLocaleString()} DPS)
                  </div>
                  <div className="px-3 py-1 bg-indigo-950 border border-indigo-500/50 rounded-full font-mono text-indigo-300 font-black text-sm flex items-center gap-1.5 animate-pulse">
                    <Timer size={14} /> ⏳ {timeLeft}s
                  </div>
                  <div className="flex items-center gap-2 text-rose-400 font-mono">
                    {p2Name}: {p2Damage.toLocaleString()} ({p2Dps.toLocaleString()} DPS) <span className="w-5 h-5 inline-flex items-center justify-center">{p2Unit && <AnimalAvatar animal={p2Unit} size="xs" />}</span>
                  </div>
                </div>

                {/* DYNAMIC PROGRESS BAR */}
                <div className="h-4 bg-slate-900 rounded-full overflow-hidden p-0.5 flex border border-slate-800">
                  <div
                    style={{ width: `${p1Percent}%` }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-200 rounded-l-full"
                  />
                  <div
                    style={{ width: `${p2Percent}%` }}
                    className="h-full bg-gradient-to-r from-purple-500 to-rose-500 transition-all duration-200 rounded-r-full"
                  />
                </div>
              </div>

              {/* ARENA CANVAS */}
              <div className="relative w-full aspect-[2/1] max-h-[360px] bg-slate-950 rounded-2xl border border-indigo-500/30 overflow-hidden flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  width={720}
                  height={360}
                  className="w-full h-full object-contain"
                />

                {/* WINNER OVERLAY ON BATTLE FINISHED */}
                {battleFinished && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
                  >
                    <Trophy size={56} className="text-amber-400 animate-bounce mb-2" />
                    <h3 className="text-3xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-purple-300 to-cyan-300">
                      {winner === 'p1' ? `${p1Name} VICTORIOUS!` : winner === 'p2' ? `${p2Name} WINS!` : 'EPIC DRAW!'}
                    </h3>
                    <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-4">
                      TOTAL DAMAGE DEALT TO INFINITY TITAN
                    </p>

                    <div className="grid grid-cols-2 gap-4 max-w-md w-full mb-6">
                      <div className="p-3 bg-cyan-950/40 border border-cyan-500/40 rounded-xl text-center">
                        <span className="text-[10px] text-cyan-300 uppercase font-bold">{p1Name}</span>
                        <div className="text-lg font-black font-mono text-cyan-400">{p1Damage.toLocaleString()}</div>
                      </div>
                      <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-center">
                        <span className="text-[10px] text-rose-300 uppercase font-bold">{p2Name}</span>
                        <div className="text-lg font-black font-mono text-rose-400">{p2Damage.toLocaleString()}</div>
                      </div>
                    </div>

                    {winner === 'p1' && (
                      <div className="mb-6 px-4 py-2 bg-gradient-to-r from-amber-950/60 via-purple-950/60 to-slate-950 border border-amber-500/40 rounded-xl flex items-center gap-3">
                        <Sparkles size={18} className="text-amber-400 animate-pulse" />
                        <span className="text-xs font-bold text-amber-200 uppercase">
                          REWARD PAYOUT: +100 God Shards • +50K Meat • +20K DNA
                        </span>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={handleStartClash}
                        className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase flex items-center gap-2 transition-all cursor-pointer"
                      >
                        <RefreshCw size={14} /> REMATCH
                      </button>
                      <button
                        onClick={() => {
                          setInBattle(false);
                          setBattleFinished(false);
                        }}
                        className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase transition-all cursor-pointer"
                      >
                        BACK TO LOBBY
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
