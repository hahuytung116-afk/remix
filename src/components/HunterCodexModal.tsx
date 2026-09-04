import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldAlert, Skull, Info, Crosshair, Cpu, Eye, Shield, Zap, Radar, CircleDot, BookOpen, Radio } from 'lucide-react';
import { ENEMIES } from '../constants';
import { EnemyType } from '../types';

const drawCubeEnemy = (
  ctx: CanvasRenderingContext2D,
  size: number,
  color: string,
  enemyId: string,
  emoji?: string,
  isBoss: boolean = false
) => {
  const h = size / 2;

  // 1. Drop Shadow under the cube (sinister crimson/purple shadow)
  ctx.fillStyle = isBoss ? 'rgba(239, 68, 68, 0.45)' : 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.ellipse(0, h, size * 0.75, size * 0.38, 0, 0, Math.PI * 2);
  ctx.fill();

  // If boss, draw glowing background aura
  if (isBoss) {
    ctx.save();
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, size * 1.1, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // 2. Base Square (sinister dark-tinted colors)
  ctx.fillStyle = color;
  ctx.fillRect(-h, -h, size, size);

  // 3. Isometric Top Overlay (Lighter tint)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.beginPath();
  ctx.moveTo(-h, -h);
  ctx.lineTo(0, -h - h/2);
  ctx.lineTo(h, -h);
  ctx.lineTo(0, -h + h/2);
  ctx.closePath();
  ctx.fill();

  // 4. Isometric Right Face Overlay (Darker shade)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.moveTo(0, -h + h/2);
  ctx.lineTo(h, -h);
  ctx.lineTo(h, h);
  ctx.lineTo(0, h + h/2);
  ctx.closePath();
  ctx.fill();

  // 5. Isometric Left Face Overlay (Medium shade)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.beginPath();
  ctx.moveTo(-h, -h);
  ctx.lineTo(0, -h + h/2);
  ctx.lineTo(0, h + h/2);
  ctx.lineTo(-h, h);
  ctx.closePath();
  ctx.fill();

  // 6. Draw glowing corrupted evil eye lines on left/right faces
  ctx.fillStyle = '#ff003c'; // Neon radioactive red
  // Left eye
  ctx.beginPath();
  ctx.arc(-h / 2, h / 4, 1.8, 0, Math.PI * 2);
  ctx.fill();
  // Right eye
  ctx.beginPath();
  ctx.arc(h / 2, h / 4, 1.8, 0, Math.PI * 2);
  ctx.fill();

  // Add neon radioactive brow/frown
  ctx.strokeStyle = '#ff003c';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-h / 2 - 2, h / 4 - 2.5);
  ctx.lineTo(-h / 2 + 2, h / 4 - 1.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(h / 2 + 2, h / 4 - 2.5);
  ctx.lineTo(h / 2 - 2, h / 4 - 1.5);
  ctx.stroke();

  // 7. Draw the animal emoji beautifully centered inside the cube
  if (emoji) {
    ctx.save();
    ctx.font = `bold ${Math.max(10, Math.floor(size * 0.72))}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#000000';
    // Draw emoji slightly shifted up
    ctx.fillText(emoji, 0, -h / 4);
    ctx.restore();
  }

  // Draw cyber horn or toxic tubes for specific bad animals
  if (enemyId.startsWith('hitech_') || isBoss) {
    ctx.strokeStyle = '#a855f7'; // Purple tech conduits
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -h - h/2);
    ctx.lineTo(0, -h - h/2 - 6);
    ctx.stroke();
    ctx.fillStyle = '#ec4899'; // Hot pink tip
    ctx.fillRect(-1.5, -h - h/2 - 9, 3, 3);
  }
};

interface LoreEntry {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  quote: string;
  quoteAuthor: string;
  body: string[];
  visualAura: string;
}

const LORE_ENTRIES: LoreEntry[] = [
  {
    id: 'cataclysm',
    title: 'The Great Quantum Rift',
    subtitle: 'The sundering of reality and creation of Wave 1',
    icon: '🌀',
    quote: 'We sought infinite power within the planetary crust, but instead we unlocked the seals of the old gods. Reality shattered, and the first wave began.',
    quoteAuthor: 'Archon Overseer, Records of Era 0',
    visualAura: 'from-amber-500/20 to-red-500/20 text-amber-400 border-amber-500/30',
    body: [
      'In the year 2088, the Syndicate Corps—a trillion-dollar military-industrial conglomerate—deployed deep-crust sub-atomic drill-heads to extract "Primal Essence". This quantum fuel-source was supposed to usher in a new era of clean nuclear reactors. Instead, the drilling broke through a dimensional membrane.',
      'A catastrophic energy shockwave, known as the "Quantum Rift", swept across Earth. This wave did not just destroy buildings—it rewrote the rules of biology, time, and space. Epochs overlapped. Prehistoric dinosaurs, extinct mammals, mythical beasts, and futuristic invaders were forced onto the same temporal plane.',
      'The Syndicate Corps quickly established defensive dome cities, trying to poach and harvest the DNA of these prehistoric animals to develop biomechanical weapons. To resist them, the ancient spirit of nature awoke, summoning the primal guardians of old to defend the planet.'
    ]
  },
  {
    id: 'syndicate',
    title: 'The Syndicate Corps',
    subtitle: 'The poaching conglomerate and cybernetic legion',
    icon: '🦾',
    quote: 'In nature, there is only inefficiency. By weaving synthetic alloy with biological tissue, we achieve peak optimization.',
    quoteAuthor: 'Syndicate High Commander Vane',
    visualAura: 'from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30',
    body: [
      'The Syndicate Corps are the primary antagonists of the Primal Realm. Led by highly augmented cyborg generals, they view the animal kingdom purely as "raw materials" for genetic refinement.',
      'Their legions range from nimble Desert Recon Scouts to massive hydraulic Enforcer Exosuits and high-tech specialist units. They have deployed defensive target scramblers, heavy net traps, and electromagnetic scramblers to strip down our defensive grids.',
      'They seek to capture the "Chill Master" (The Great Capybara) because its calming alpha waves are completely neutralizing the aggression-inducing chips implanted in their soldiers. A relaxed soldier is an unproductive soldier—making the Capybara their ultimate target.'
    ]
  },
  {
    id: 'sovereign',
    title: 'The Chill Sovereign',
    subtitle: 'Why the Capybara does 0 damage but wins all wars',
    icon: '🍊',
    quote: 'True strength is not the force of your blow, but the stillness of your soul. Let the waters rise; we shall float together.',
    quoteAuthor: 'The Sacred Capybara',
    visualAura: 'from-lime-500/20 to-emerald-500/20 text-lime-400 border-lime-500/30',
    body: [
      'While the Saber-toothed Tigers bite and the ancient Dragons rain thermonuclear meteors, the Great Capybara sits peacefully at the center of the battlefield, sporting a fresh citrus fruit on its head.',
      'The Capybara is "The Chillful" archetype—the undisputed support god of the defensive line. It deals exactly 0 base damage because it holds absolute immunity to the cycle of violence. Instead, it radiates soothing waves of tranquil zen.',
      'When hostile Syndicate soldiers enter its aura, their aggression chips short-circuit, and they are overcome by a profound feeling of peaceful relaxation. Hypnotized by this serenity, up to 10 enemy hunters will turn their weapons upon their own commanders, fighting as turncoat allies.'
    ]
  },
  {
    id: 'extinction',
    title: 'Extinction & Deities',
    subtitle: 'The summoning grid and the legendary genomes',
    icon: '🧬',
    quote: 'Nothing is truly lost in the stream of time. It only awaits the correct harmonic frequency to walk the earth once more.',
    quoteAuthor: 'Genesis Altar Manual',
    visualAura: 'from-fuchsia-500/20 to-purple-500/20 text-fuchsia-400 border-purple-500/30',
    body: [
      'By collecting Meat, DNA, and Shards of Gods, defenders can activate the cosmic summoning portal. This device targets specific genetic echoes suspended in the quantum field.',
      'Common mice and rabbits are easily replicated. However, the legendary extinct ones—Mammoths, Saber-toothed Tigers, and Battle Dodos—require thousands of DNA sequences. Beyond them sit the Cosmic Deities: T-Rex, Phoenix, and the multi-headed Hydra.',
      'The ultimate tier of summoning manifests "Celestial" and "Arcane" class anomalies. These beings, such as the Astro Leviathan or the reality-warping Warper, are literal gods capable of overriding the current game space. Placing them on the grid alters the gravitational field, pulling all active enemies into an inescapable singularity.'
    ]
  }
];

interface HunterCodexModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HunterCodexModal: React.FC<HunterCodexModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'alien' | 'hitech' | 'standard' | 'lore'>('alien');
  const [selectedEnemyId, setSelectedEnemyId] = useState<string>('alien_bio_titan');
  const [selectedLoreId, setSelectedLoreId] = useState<string>('cataclysm');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Filter lists
  const alienEnemies = ENEMIES.filter(e => e.isAlien || e.category === 'alien');
  const hitechEnemies = ENEMIES.filter(e => e.id.startsWith('hitech_') && e.id !== 'hitech_decoy_phantom');
  const standardEnemies = ENEMIES.filter(e => !e.id.startsWith('hitech_') && !e.isAlien && e.category !== 'alien' && e.id !== 'hitech_decoy_phantom');

  const displayedList = activeTab === 'alien' 
    ? alienEnemies 
    : activeTab === 'hitech' 
    ? hitechEnemies 
    : standardEnemies;
  const selectedEnemy = ENEMIES.find(e => e.id === selectedEnemyId) || (activeTab === 'alien' ? alienEnemies[0] : hitechEnemies[0]);

  const selectedLore = LORE_ENTRIES.find(l => l.id === selectedLoreId) || LORE_ENTRIES[0];

  // Set initial selection when switching tabs
  useEffect(() => {
    if (activeTab === 'alien') {
      setSelectedEnemyId('alien_bio_titan');
    } else if (activeTab === 'hitech') {
      setSelectedEnemyId('hitech_spectre');
    } else if (activeTab === 'standard') {
      setSelectedEnemyId('hunter_scout');
    }
  }, [activeTab]);

  // Handle drawing animated preview on micro-canvas inside the details card
  useEffect(() => {
    if (!selectedEnemy || !canvasRef.current || !isOpen) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frame = 0;

    const render = () => {
      frame++;
      // Clear with dark high-tech background grid
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw subtle grid lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 15) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 15) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);

      // Spin rotation matching gameplay speed
      const rotation = (frame * 0.02) % (Math.PI * 2);
      ctx.rotate(rotation);

      const size = selectedEnemy.size || 20;
      const color = selectedEnemy.color || '#38bdf8';
      const isBoss = !!selectedEnemy.isBoss;
      const emoji = selectedEnemy.emoji;

      // Draw model specific canvas vectors using 3D voxels:
      if (selectedEnemy.id === 'hitech_spectre') {
        const isCamo = Math.sin(frame * 0.05) > -0.2;
        if (isCamo) {
          ctx.globalAlpha = 0.3;
          drawCubeEnemy(ctx, size, color, selectedEnemy.id, emoji, isBoss);
        } else {
          ctx.globalAlpha = 0.95;
          drawCubeEnemy(ctx, size, '#ef4444', selectedEnemy.id, emoji, isBoss);
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-size / 2 - 2, -size / 2 - 2, size + 4, size + 4);
        }
      } else if (selectedEnemy.id === 'hitech_nullifier') {
        drawCubeEnemy(ctx, size, color, selectedEnemy.id, emoji, isBoss);

        ctx.restore();
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        const startRad = rotation - Math.PI / 3;
        const endRad = rotation + Math.PI / 3;
        ctx.arc(0, 0, size * 1.25, startRad, endRad);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.beginPath();
        ctx.arc(0, 0, size * 1.25, 0, Math.PI * 2);
        ctx.stroke();
      } else if (selectedEnemy.id === 'hitech_trapper') {
        drawCubeEnemy(ctx, size, color, selectedEnemy.id, emoji, isBoss);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        for (let leg = 0; leg < 8; leg++) {
          const angle = (leg * Math.PI) / 4;
          ctx.beginPath();
          ctx.moveTo(Math.cos(angle) * (size / 2), Math.sin(angle) * (size / 2));
          ctx.lineTo(Math.cos(angle) * (size * 0.9), Math.sin(angle) * (size * 0.9));
          ctx.stroke();
        }
      } else if (selectedEnemy.id === 'hitech_decoy') {
        drawCubeEnemy(ctx, size, color, selectedEnemy.id, emoji, isBoss);

        ctx.rotate(-rotation * 1.5);
        ctx.strokeStyle = '#f472b6';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-size / 2 - 4, -size / 2 - 4, size + 8, size + 8);
      } else if (selectedEnemy.id === 'hitech_decoy_phantom') {
        ctx.globalAlpha = 0.45;
        const jitterX = Math.sin(frame * 0.35) * 2;
        ctx.translate(jitterX, 0);
        drawCubeEnemy(ctx, size, '#f43f5e', selectedEnemy.id, emoji, isBoss);
      } else if (selectedEnemy.id === 'alien_bio_titan') {
        // Alien Bio-Titan preview
        const time = frame * 0.03;
        ctx.fillStyle = 'rgba(132, 204, 22, 0.25)';
        ctx.beginPath();
        ctx.arc(0, 0, size * 1.25 + Math.sin(time * 3) * 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#14532d';
        ctx.fillRect(-size * 0.65, -size * 0.4, size * 0.3, size * 0.8);
        ctx.fillRect(size * 0.35, -size * 0.4, size * 0.3, size * 0.8);

        drawCubeEnemy(ctx, size, '#15803d', selectedEnemy.id, emoji, isBoss);

        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.85, 0, Math.PI * 2);
        ctx.stroke();
      } else if (selectedEnemy.id === 'alien_mothership') {
        // Alien Mothership Flagship preview
        const time = frame * 0.03;
        ctx.save();
        ctx.rotate(time);
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([12, 6]);
        ctx.beginPath();
        ctx.arc(0, 0, size * 1.1, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        drawCubeEnemy(ctx, size, '#042f2e', selectedEnemy.id, emoji, isBoss);

        ctx.fillStyle = '#34d399';
        ctx.beginPath();
        ctx.arc(0, 0, 16 + Math.sin(time * 4) * 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (selectedEnemy.id === 'hitech_hover_dreadnought') {
        drawCubeEnemy(ctx, size, color, selectedEnemy.id, emoji, isBoss);
        ctx.fillStyle = '#10b981';
        ctx.fillRect(-size / 2 - 5, -3, 4, 6);
        ctx.fillRect(size / 2 + 1, -3, 4, 6);
      } else {
        drawCubeEnemy(ctx, size, color, selectedEnemy.id, emoji, isBoss);
      }

      ctx.restore();

      // Threat Radar circular animations
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 55 + Math.sin(frame * 0.04) * 5, 0, Math.PI * 2);
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [selectedEnemy, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="hunter-codex-container">
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
            id="hunter-codex-backdrop"
          />

          {/* Dialog Frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col z-10 max-h-[85vh] md:max-h-[80vh]"
            id="hunter-codex-dialog"
          >
            <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${
              activeTab === 'alien'
                ? 'from-lime-500 via-emerald-400 to-cyan-400 animate-pulse'
                : activeTab === 'hitech' 
                ? 'from-cyan-500 via-fuchsia-500 to-cyan-500 animate-pulse' 
                : activeTab === 'standard' 
                ? 'from-emerald-500 via-teal-500 to-emerald-500'
                : 'from-amber-500 via-orange-500 to-amber-500 animate-pulse'
            }`}></div>

            {/* Header */}
            <header className="p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/40">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl border flex items-center justify-center ${
                  activeTab === 'alien'
                    ? 'bg-lime-500/10 border-lime-500/30'
                    : activeTab === 'hitech' 
                    ? 'bg-cyan-500/10 border-cyan-500/30' 
                    : activeTab === 'standard'
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-amber-500/10 border-amber-500/30'
                }`}>
                  <Radar className={activeTab === 'alien' ? 'text-lime-400 animate-pulse' : activeTab === 'hitech' ? 'text-cyan-400 animate-pulse' : activeTab === 'standard' ? 'text-emerald-400' : 'text-amber-400'} size={20} />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase text-white tracking-widest font-mono">
                    {activeTab === 'lore' ? 'PRIMAL REALM CODEX' : 'TACTICAL INTEL DOSSIER'}
                  </h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                    <span>
                      {activeTab === 'lore' ? 'ANCIENT UNIVERSE MYTHOS' : 'BAD ANIMAL FIELD BESTIARY'}
                    </span>
                    <span className="text-xs">•</span>
                    <span className={
                      activeTab === 'alien'
                        ? 'text-lime-400'
                        : activeTab === 'hitech' 
                        ? 'text-cyan-400' 
                        : activeTab === 'standard'
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }>
                      {activeTab === 'alien'
                        ? 'EXTRATERRESTRIAL INVASION ARMADA'
                        : activeTab === 'hitech' 
                        ? 'CLASS-S HIGH TECH SPECIALISTS' 
                        : activeTab === 'standard'
                        ? 'STANDARD INTRUSION SQUADS'
                        : 'SACRED HISTORIES & DATALOGS'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Action buttons/tabs */}
              <div className="flex items-center gap-2">
                <div className="flex flex-wrap bg-slate-950 border border-white/5 p-1 rounded-xl gap-1">
                  <button
                    onClick={() => setActiveTab('alien')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 ${
                      activeTab === 'alien'
                        ? 'bg-lime-600/20 text-lime-400 shadow-[inset_0_0_8px_rgba(132,204,22,0.2)] border border-lime-500/30'
                        : 'text-slate-400 hover:text-white border border-transparent'
                    }`}
                  >
                    <Radio size={12} /> Alien Armada
                  </button>
                  <button
                    onClick={() => setActiveTab('hitech')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 ${
                      activeTab === 'hitech'
                        ? 'bg-cyan-600/20 text-cyan-400 shadow-[inset_0_0_8px_rgba(34,211,238,0.2)] border border-cyan-500/30'
                        : 'text-slate-400 hover:text-white border border-transparent'
                    }`}
                  >
                    <Cpu size={12} /> Spec Ops
                  </button>
                  <button
                    onClick={() => setActiveTab('standard')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 ${
                      activeTab === 'standard'
                        ? 'bg-emerald-600/20 text-emerald-400 shadow-[inset_0_0_8px_rgba(16,185,129,0.2)] border border-emerald-500/30'
                        : 'text-slate-400 hover:text-white border border-transparent'
                    }`}
                  >
                    <Crosshair size={12} /> Infantry
                  </button>
                  <button
                    onClick={() => setActiveTab('lore')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 ${
                      activeTab === 'lore'
                        ? 'bg-amber-600/20 text-amber-400 shadow-[inset_0_0_8px_rgba(245,158,11,0.2)] border border-amber-500/30'
                        : 'text-slate-400 hover:text-white border border-transparent'
                    }`}
                  >
                    <BookOpen size={12} /> Lore
                  </button>
                </div>
 
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl bg-slate-950/40 text-slate-400 hover:text-white border border-white/5 hover:border-white/10 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>
            </header>
 
            {/* Dual Panel Body Layout */}
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden" id="hunter-codex-panels">
              {/* LEFT COLUMN: Threat Selection or Lore selection Scroll List */}
              <div className="w-full md:w-80 border-r border-white/10 flex flex-col bg-slate-950/20 max-h-[250px] md:max-h-full overflow-y-auto">
                {activeTab === 'lore' ? (
                  <>
                    <div className="p-3 bg-slate-950/40 border-b border-white/5 flex items-center justify-between text-[9px] font-bold text-amber-400 uppercase tracking-widest font-mono">
                      <span>DATALOG RECORDS</span>
                      <span>SELECT CHAPTER</span>
                    </div>
                    <div className="p-2 space-y-1">
                      {LORE_ENTRIES.map((chapter) => (
                        <button
                          key={chapter.id}
                          onClick={() => setSelectedLoreId(chapter.id)}
                          className={`w-full text-left p-3 rounded-xl transition-all duration-300 flex items-center gap-3 border ${
                            selectedLoreId === chapter.id
                              ? 'bg-amber-950/30 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.1)]'
                              : 'bg-slate-950/10 hover:bg-slate-950/40 border-transparent hover:border-white/5'
                          }`}
                        >
                          <span className="text-xl">{chapter.icon}</span>
                          <div>
                            <p className={`text-xs font-bold uppercase transition-colors tracking-wide ${selectedLoreId === chapter.id ? 'text-amber-400' : 'text-slate-200 group-hover:text-white'}`}>
                              {chapter.title}
                            </p>
                            <p className="text-[9px] text-slate-500 uppercase tracking-tight font-mono mt-0.5">
                              {chapter.subtitle.length > 28 ? `${chapter.subtitle.substring(0, 25)}...` : chapter.subtitle}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-3 bg-slate-950/40 border-b border-white/5 flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                      <span>IDENTIFIED HOSTILLES ({displayedList.length})</span>
                      <span>SELECT TARGET</span>
                    </div>
                    <div className="p-2 space-y-1">
                      {displayedList.map((enemy, idx) => (
                        <button
                          key={`${enemy.id}-${idx}`}
                          onClick={() => setSelectedEnemyId(enemy.id)}
                          className={`w-full text-left p-3 rounded-xl transition-all duration-300 flex items-center justify-between group border ${
                            selectedEnemyId === enemy.id
                              ? activeTab === 'alien'
                                ? 'bg-lime-950/30 border-lime-500/40 shadow-[0_0_12px_rgba(132,204,22,0.15)]'
                                : activeTab === 'hitech'
                                ? 'bg-cyan-950/30 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.1)]'
                                : 'bg-emerald-950/30 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.1)]'
                              : 'bg-slate-950/10 hover:bg-slate-950/40 border-transparent hover:border-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {/* Dynamic mini-color thumbnail */}
                            <div
                              className="w-3.5 h-3.5 rounded-sm shadow-md flex-shrink-0"
                              style={{
                                backgroundColor: enemy.color,
                                boxShadow: `0 0 8px ${enemy.color}`
                              }}
                            />
                            <div>
                              <p className={`text-xs font-bold uppercase transition-colors tracking-wide ${selectedEnemyId === enemy.id ? (activeTab === 'alien' ? 'text-lime-400' : activeTab === 'hitech' ? 'text-cyan-400' : 'text-emerald-400') : 'text-slate-200 group-hover:text-white'}`}>
                                {enemy.name}
                              </p>
                              <p className="text-[9px] text-slate-500 uppercase tracking-tight font-mono mt-0.5">
                                SIZE: {enemy.size}px • REWARD: {enemy.bounty} MEAT
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {enemy.id === 'alien_bio_titan' && (
                              <span className="text-[8px] font-black bg-lime-500/20 text-lime-400 px-1.5 py-0.5 rounded border border-lime-500/30 tracking-widest uppercase">
                                TITAN
                              </span>
                            )}
                            {enemy.id === 'alien_mothership' && (
                              <span className="text-[8px] font-black bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/30 tracking-widest uppercase">
                                FLAGSHIP
                              </span>
                            )}
                            {enemy.isBoss && enemy.id !== 'alien_bio_titan' && enemy.id !== 'alien_mothership' && (
                              <span className="text-[8px] font-black bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded border border-red-500/30 tracking-widest uppercase">
                                BOSS
                              </span>
                            )}
                            {!enemy.isBoss && enemy.id.startsWith('hitech_') && (
                              <span className="text-[8px] font-black bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/30 tracking-widest uppercase">
                                SPEC
                              </span>
                            )}
                            {!enemy.isBoss && (enemy.isAlien || enemy.category === 'alien') && (
                              <span className="text-[8px] font-black bg-lime-500/20 text-lime-400 px-1.5 py-0.5 rounded border border-lime-500/30 tracking-widest uppercase">
                                ALIEN
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
 
              {/* RIGHT COLUMN: Interactive Details display or Lore reading panel */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-900/40">
                {activeTab === 'lore' ? (
                  selectedLore ? (
                    <div className="space-y-6" id="hunter-lore-detail-view">
                      {/* Lore Banner Row */}
                      <div className={`p-5 bg-gradient-to-br ${selectedLore.visualAura} rounded-2xl border flex items-start gap-4 shadow-lg`}>
                        <div className="text-4xl p-2.5 bg-slate-950/50 rounded-2xl border border-white/5 shadow-inner select-none">
                          {selectedLore.icon}
                        </div>
                        <div className="space-y-1">
                          <span className="text-[8.5px] font-black uppercase text-amber-400 tracking-widest font-mono">
                            PRIMAL CODEX // DATA_RECORD_0{LORE_ENTRIES.indexOf(selectedLore) + 1}
                          </span>
                          <h3 className="text-base font-black text-white uppercase tracking-wider font-mono">
                            {selectedLore.title}
                          </h3>
                          <p className="text-[10px] text-slate-300 font-bold uppercase tracking-tight">
                            {selectedLore.subtitle}
                          </p>
                        </div>
                      </div>

                      {/* Atmosphere Quote Block */}
                      <div className="p-4 bg-slate-950/60 border-l-2 border-amber-500 rounded-r-xl space-y-2 italic relative">
                        <span className="absolute top-1 right-3 text-4xl font-serif text-amber-500/10 pointer-events-none select-none">"</span>
                        <p className="text-[11px] text-slate-300 leading-relaxed font-serif">
                          "{selectedLore.quote}"
                        </p>
                        <p className="text-[9px] font-mono uppercase text-amber-500 font-bold tracking-widest text-right">
                          — {selectedLore.quoteAuthor}
                        </p>
                      </div>

                      {/* Detailed Story Chapters paragraphs */}
                      <div className="space-y-4">
                        {selectedLore.body.map((paragraph, index) => (
                          <div key={index} className="p-4 bg-slate-950/40 border border-white/5 rounded-xl space-y-1.5 leading-relaxed">
                            <p className="text-xs font-sans tracking-wide leading-relaxed text-slate-200">
                              {paragraph}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Decryption status */}
                      <div className="p-3 bg-slate-950/40 rounded-xl border border-white/5 text-[9px] font-mono text-slate-500 flex items-center justify-between uppercase tracking-widest">
                        <span>DATA SECURE LEVEL: UNRESTRICTED</span>
                        <span className="text-amber-500 font-black">NATURE PROTOCOLS ONLINE</span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 p-8">
                      <Info size={40} className="stroke-1 animate-bounce text-slate-600" />
                      <p className="text-xs uppercase mt-3 font-mono">Datalog link unestablished...</p>
                    </div>
                  )
                ) : selectedEnemy ? (
                  <div className="space-y-6" id="hunter-intel-detail-view">
                    {/* Visual Card Row */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                      {/* Left: Tactical Animated Canvas Preview */}
                      <div className="md:col-span-4 rounded-2xl border border-white/5 bg-slate-950/40 p-4 flex flex-col items-center justify-center relative group min-h-[160px]">
                        <div className="absolute top-2 left-2 flex items-center gap-1.5 text-[8.5px] font-mono text-slate-500 uppercase tracking-wider">
                          <CircleDot size={10} className="text-cyan-400 animate-pulse" /> LIVE SIMULATING
                        </div>
                        <canvas
                          ref={canvasRef}
                          width={140}
                          height={140}
                          className="rounded-xl border border-white/5 bg-slate-950 cursor-pointer shadow-lg shadow-black/50"
                        />
                        <div className="mt-2 text-[8px] font-mono text-slate-400 uppercase tracking-widest text-center mt-3">
                          ROTATION MATRIX: <span className="text-cyan-400">ACTIVE</span>
                        </div>
                      </div>
 
                      {/* Right: Core Attributes table card */}
                      <div className="md:col-span-8 p-5 bg-gradient-to-br from-slate-950/30 to-slate-900/50 rounded-2xl border border-white/5 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-widest font-mono ${selectedEnemy.id.startsWith('hitech_') ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
                              ID: {selectedEnemy.id.toUpperCase()}
                            </span>
                            {selectedEnemy.isBoss && (
                              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 tracking-widest font-mono">
                                ALPHA TITAN INTEL
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-black text-white uppercase tracking-wider font-mono">
                            {selectedEnemy.name}
                          </h3>
                          <p className="text-[10px] text-slate-400 uppercase mt-1 tracking-tight leading-relaxed">
                            {selectedEnemy.description || 'No database logs found. Extreme threat caution recommended.'}
                          </p>
                        </div>
 
                        {/* In-game Attribute benchmarks */}
                        <div className="grid grid-cols-3 gap-3 border-t border-white/5 pt-4 mt-4 text-center">
                          <div className="p-2 bg-slate-950/40 rounded-xl border border-white/5">
                            <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest font-mono">BASE STRUCTURAL HP</span>
                            <span className="text-xs font-extrabold text-red-400 tracking-wide">{selectedEnemy.health} HP</span>
                          </div>
                          <div className="p-2 bg-slate-950/40 rounded-xl border border-white/5">
                            <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest font-mono">LOCOMOTION SPEED</span>
                            <span className="text-xs font-extrabold text-blue-400 tracking-wide">{selectedEnemy.speed} m/s</span>
                          </div>
                          <div className="p-2 bg-slate-950/40 rounded-xl border border-white/5">
                            <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest font-mono">MEAT VALUE REWARD</span>
                            <span className="text-xs font-extrabold text-amber-400 tracking-wide">+{selectedEnemy.bounty} MEAT</span>
                          </div>
                        </div>
                      </div>
                    </div>
 
                    {/* Section 2: Physical Appearance breakdown */}
                    {selectedEnemy.appearance && (
                      <div className="p-4 bg-slate-950/30 rounded-2xl border border-white/5 space-y-1.5">
                        <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest font-mono flex items-center gap-1.5">
                          <Eye size={12} className="text-purple-400" /> RECONNAISSANCE VISUAL APPEARANCE
                        </h4>
                        <p className="text-[10px] text-slate-300 uppercase leading-relaxed tracking-tight">
                          {selectedEnemy.appearance}
                        </p>
                      </div>
                    )}
 
                    {/* Section 3: Specialized Threat Capabilities */}
                    {selectedEnemy.abilities && selectedEnemy.abilities.length > 0 && (
                      <div className="p-4 bg-slate-950/30 rounded-2xl border border-white/5 space-y-3">
                        <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest font-mono flex items-center gap-1.5">
                          <Zap size={12} className="text-yellow-400" /> COMBAT THREAT CAPABILITIES
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          {selectedEnemy.abilities.map((ability, idx) => {
                            const parts = ability.split(':');
                            const title = parts[0];
                            const text = parts[1] || '';
                            return (
                              <div key={`threat-ability-${idx}-${title}`} className="p-3 bg-slate-950/50 rounded-xl border border-white/5 flex items-start gap-2.5">
                                <div className="p-1 bg-yellow-500/10 rounded-lg text-yellow-400 flex items-center justify-center mt-0.5">
                                  <Shield size={12} />
                                </div>
                                <div className="space-y-0.5">
                                  <span className="text-[10px] font-extrabold uppercase text-slate-200 tracking-wider">
                                    {title}
                                  </span>
                                  {text && (
                                    <p className="text-[9.5px] uppercase text-slate-400 leading-normal tracking-tight">
                                      {text.trim()}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
 
                    {/* Section 4: Weaknesses and Tactical counters */}
                    <div className="p-4 bg-yellow-950/20 rounded-2xl border border-yellow-500/20 space-y-2">
                      <h4 className="text-[10px] font-bold uppercase text-yellow-500 tracking-widest font-mono flex items-center gap-1.5">
                        <Crosshair size={12} className="text-yellow-500" /> OPTIMAL VULNERABILITY & TACTICAL COUNTERS
                      </h4>
                      <p className="text-[10px] text-yellow-200/90 uppercase leading-relaxed tracking-tight font-sans">
                        {selectedEnemy.weakpoint || 'No certified weaknesses reported. Heavy tactical pressure is key.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 p-8">
                    <Info size={40} className="stroke-1 animate-bounce text-slate-600" />
                    <p className="text-xs uppercase mt-3 font-mono">Awaiting scanner feed authorization...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer status credits */}
            <footer className="p-4 border-t border-white/10 bg-slate-950/80 flex items-center justify-between text-[8px] font-mono text-slate-500 uppercase tracking-widest">
              <span>SECURITY LEVEL: AUTHENTICATED INTEL</span>
              <span>TACTICAL NETWORK SYSTEM v4.4.1</span>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
