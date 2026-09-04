import React from 'react';
import { Rarity } from '../types';

export interface RarityParticleEffectProps {
  rarity?: Rarity | string;
  color?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'custom';
  isHovered?: boolean;
}

export const RarityParticleEffect: React.FC<RarityParticleEffectProps> = ({
  rarity = 'Common',
  color,
  size = 'md',
  isHovered = false,
}) => {
  if (!rarity) return null;

  // Render dedicated particle clusters based on rarity archetype
  switch (rarity) {
    case 'Legendary':
      // 🔥 Rising Flame Embers (Yellow / Orange Fire)
      return (
        <div className="absolute inset-0 pointer-events-none overflow-visible -z-0">
          {/* Flame Ember 1 */}
          <div
            className="absolute left-1/4 bottom-0 w-1.5 h-1.5 rounded-full bg-amber-400 animate-ember-1 shadow-[0_0_6px_#f59e0b]"
            style={{ backgroundColor: color || '#f59e0b' }}
          />
          {/* Flame Ember 2 */}
          <div
            className="absolute right-1/4 bottom-0.5 w-1.5 h-1.5 rounded-full bg-orange-500 animate-ember-2 shadow-[0_0_6px_#f97316]"
            style={{ backgroundColor: color || '#ea580c' }}
          />
          {/* Flame Ember 3 (Center Micro-Sparks) */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-1 h-1 rounded-full bg-yellow-300 animate-ember-3 shadow-[0_0_4px_#fde047]" />

          {/* Warm underglow flare */}
          <div
            className={`absolute inset-0 rounded-full blur-md opacity-30 transition-opacity duration-300 ${
              isHovered ? 'opacity-70 scale-110' : ''
            }`}
            style={{ backgroundColor: color || '#f59e0b' }}
          />
        </div>
      );

    case 'Mythic':
      // ✨ Radiating Starlight Sparkles (Golden 4-point Diamond Stars)
      return (
        <div className="absolute inset-0 pointer-events-none overflow-visible -z-0">
          {/* Sparkle 1 (Top-Right) */}
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 animate-sparkle-1">
            <svg viewBox="0 0 24 24" className="w-full h-full text-amber-300 drop-shadow-[0_0_4px_#f59e0b] fill-current">
              <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
            </svg>
          </div>

          {/* Sparkle 2 (Bottom-Left) */}
          <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 animate-sparkle-2">
            <svg viewBox="0 0 24 24" className="w-full h-full text-yellow-200 drop-shadow-[0_0_4px_#facc15] fill-current">
              <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
            </svg>
          </div>

          {/* Sparkle 3 (Top-Left micro diamond) */}
          <div className="absolute -top-0.5 left-0 w-2 h-2 animate-sparkle-3">
            <svg viewBox="0 0 24 24" className="w-full h-full text-orange-300 drop-shadow-[0_0_3px_#fb923c] fill-current">
              <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
            </svg>
          </div>

          {/* Radial gold aura backdrop */}
          <div
            className={`absolute inset-0 rounded-full blur-[5px] opacity-35 transition-opacity duration-300 ${
              isHovered ? 'opacity-75 scale-115' : ''
            }`}
            style={{ backgroundColor: color || '#f97316' }}
          />
        </div>
      );

    case 'Secret':
      // 🌀 Quantum Void Distortion & Cyber-Rifts (Cyan/Teal Warping)
      return (
        <div className="absolute inset-0 pointer-events-none overflow-visible -z-0">
          {/* Gravitational Distortion Ring */}
          <div className="absolute -inset-1 border border-cyan-400/60 rounded-full animate-void-distortion shadow-[0_0_8px_rgba(6,182,212,0.6)]" />

          {/* Glitching Quantum Void Rift */}
          <div className="absolute inset-0 animate-void-rift rounded-full border border-teal-300/40" />

          {/* Micro Void Quantum Spark */}
          <div className="absolute -top-1 right-1 w-1.5 h-1.5 rounded-full bg-cyan-300 animate-sparkle-1 shadow-[0_0_6px_#22d3ee]" />

          {/* Dark space-time rift backdrop */}
          <div
            className={`absolute inset-0 rounded-full blur-[6px] opacity-40 transition-all duration-300 ${
              isHovered ? 'opacity-85 scale-120' : ''
            }`}
            style={{ backgroundColor: color || '#06b6d4' }}
          />
        </div>
      );

    case 'Celestial':
    case 'Divine':
      // 🌌 Cosmic Galaxy Dust & Orbiting Stars (Violet/Purple)
      return (
        <div className="absolute inset-0 pointer-events-none overflow-visible -z-0">
          {/* Orbiting Starlight Particle 1 */}
          <div className="absolute inset-0 flex items-center justify-center animate-cosmic-orbit-1">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-300 shadow-[0_0_6px_#c084fc]" />
          </div>

          {/* Orbiting Starlight Particle 2 */}
          <div className="absolute inset-0 flex items-center justify-center animate-cosmic-orbit-2">
            <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-300 shadow-[0_0_5px_#e879f9]" />
          </div>

          {/* Nebula Core Glow */}
          <div
            className={`absolute inset-0 rounded-full blur-md opacity-35 transition-all duration-300 ${
              isHovered ? 'opacity-80 scale-115' : ''
            }`}
            style={{ backgroundColor: color || '#8b5cf6' }}
          />
        </div>
      );

    case 'Unrivaled':
      // 🩸 Singularity Abyss & Crimson Dark Matter (Red / Black Abyss)
      return (
        <div className="absolute inset-0 pointer-events-none overflow-visible -z-0">
          {/* Swirling Abyss Singularity */}
          <div className="absolute -inset-1 border border-red-500/80 rounded-full animate-singularity shadow-[0_0_10px_rgba(239,68,68,0.7)]" />

          {/* Dark Void Embers */}
          <div className="absolute left-1 bottom-0 w-1.5 h-1.5 rounded-full bg-red-600 animate-ember-1 shadow-[0_0_6px_#dc2626]" />
          <div className="absolute right-1 bottom-0.5 w-1.5 h-1.5 rounded-full bg-rose-500 animate-ember-2 shadow-[0_0_6px_#f43f5e]" />

          {/* Dark Energy Field */}
          <div
            className={`absolute inset-0 rounded-full blur-[6px] opacity-45 transition-all duration-300 ${
              isHovered ? 'opacity-90 scale-120' : ''
            }`}
            style={{ backgroundColor: color || '#ef4444' }}
          />
        </div>
      );

    case 'Overseer':
    case 'Original':
    case '???':
      // 🌈 Prismatic Chromatic Nova (Multi-spectrum Rainbow Laser)
      return (
        <div className="absolute inset-0 pointer-events-none overflow-visible -z-0">
          {/* Chromatic Shifting Ring */}
          <div className="absolute -inset-0.5 border border-pink-400/80 rounded-full animate-chromatic shadow-[0_0_8px_rgba(236,72,153,0.6)]" />

          {/* Twin Prismatic Sparks */}
          <div className="absolute -top-1 -right-0.5 w-2 h-2 animate-sparkle-1">
            <svg viewBox="0 0 24 24" className="w-full h-full text-pink-300 drop-shadow-[0_0_4px_#ec4899] fill-current">
              <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
            </svg>
          </div>
          <div className="absolute -bottom-1 -left-0.5 w-2 h-2 animate-sparkle-2">
            <svg viewBox="0 0 24 24" className="w-full h-full text-cyan-300 drop-shadow-[0_0_4px_#06b6d4] fill-current">
              <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
            </svg>
          </div>

          <div
            className={`absolute inset-0 rounded-full blur-[6px] opacity-40 transition-opacity duration-300 ${
              isHovered ? 'opacity-85 scale-120' : ''
            }`}
            style={{ backgroundColor: color || '#f43f5e' }}
          />
        </div>
      );

    case 'Arcane':
      // 🔮 Mystic Arcane Rune Motes (Violet Arcane)
      return (
        <div className="absolute inset-0 pointer-events-none overflow-visible -z-0">
          {/* Floating Arcane Glyph 1 */}
          <div className="absolute left-1/4 bottom-0 w-1.5 h-1.5 rounded-sm bg-purple-400 rotate-45 animate-arcane-glyph-1 shadow-[0_0_6px_#a855f7]" />
          {/* Floating Arcane Glyph 2 */}
          <div className="absolute right-1/4 bottom-1 w-1.5 h-1.5 rounded-sm bg-indigo-300 rotate-12 animate-arcane-glyph-2 shadow-[0_0_6px_#818cf8]" />

          <div
            className={`absolute inset-0 rounded-full blur-[5px] opacity-35 transition-opacity duration-300 ${
              isHovered ? 'opacity-75 scale-115' : ''
            }`}
            style={{ backgroundColor: color || '#a855f7' }}
          />
        </div>
      );

    case 'The Chillful':
      // 🍊 Zen Yuzu Citrus Sparkles (Warm Orange / Golden Bubbles)
      return (
        <div className="absolute inset-0 pointer-events-none overflow-visible -z-0">
          <div className="absolute -top-1 right-0 w-2 h-2 animate-sparkle-1 text-amber-300">
            <svg viewBox="0 0 24 24" className="w-full h-full fill-current drop-shadow-[0_0_3px_#f59e0b]">
              <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
            </svg>
          </div>
          <div className="absolute left-1 bottom-0 w-1.5 h-1.5 rounded-full bg-amber-400 animate-bubble-1 shadow-[0_0_4px_#fbbf24]" />
          <div className="absolute right-1 bottom-1 w-1.5 h-1.5 rounded-full bg-orange-300 animate-bubble-2 shadow-[0_0_4px_#fed7aa]" />

          <div
            className={`absolute inset-0 rounded-full blur-[5px] opacity-30 transition-opacity duration-300 ${
              isHovered ? 'opacity-70 scale-115' : ''
            }`}
            style={{ backgroundColor: color || '#f59e0b' }}
          />
        </div>
      );

    case 'Epic':
      // 💜 Ethereal Mystic Wisps (Indigo / Purple)
      return (
        <div className="absolute inset-0 pointer-events-none overflow-visible -z-0">
          <div className="absolute left-1/3 bottom-0 w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bubble-1 shadow-[0_0_5px_#818cf8]" />
          <div className="absolute right-1/4 bottom-1 w-1.5 h-1.5 rounded-full bg-purple-300 animate-bubble-2 shadow-[0_0_5px_#c084fc]" />
          <div
            className={`absolute inset-0 rounded-full blur-[4px] opacity-25 transition-opacity duration-300 ${
              isHovered ? 'opacity-65 scale-110' : ''
            }`}
            style={{ backgroundColor: color || '#6366f1' }}
          />
        </div>
      );

    case 'Rare':
      // 💧 Aqua / Crystal Bubbles (Blue / Cyan)
      return (
        <div className="absolute inset-0 pointer-events-none overflow-visible -z-0">
          <div className="absolute left-1/4 bottom-0 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bubble-1 shadow-[0_0_4px_#22d3ee]" />
          <div className="absolute right-1/3 bottom-0.5 w-1 h-1 rounded-full bg-blue-300 animate-bubble-2 shadow-[0_0_4px_#93c5fd]" />
          <div
            className={`absolute inset-0 rounded-full blur-[4px] opacity-20 transition-opacity duration-300 ${
              isHovered ? 'opacity-55 scale-110' : ''
            }`}
            style={{ backgroundColor: color || '#3b82f6' }}
          />
        </div>
      );

    case 'Common':
    default:
      // ⚪ Subtle Ambient Dust Shimmer
      return (
        <div className="absolute inset-0 pointer-events-none overflow-visible -z-0">
          <div
            className={`absolute inset-0 rounded-full blur-[3px] opacity-15 transition-opacity duration-300 ${
              isHovered ? 'opacity-40 scale-105' : ''
            }`}
            style={{ backgroundColor: color || '#94a3b8' }}
          />
        </div>
      );
  }
};

export default RarityParticleEffect;
