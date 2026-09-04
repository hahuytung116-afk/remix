import React from 'react';
import { ArtworkProps } from './CommonArtworks';

// 👑✨ 52. Genesis Primal Alpha
export const OriginalGenesisArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="url(#genesisBg)" />
    <defs>
      <radialGradient id="genesisBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="40%" stopColor="#fde047" />
        <stop offset="100%" stopColor="#ca8a04" />
      </radialGradient>
    </defs>
    {/* Holy Creation Orbit Rings */}
    <ellipse cx="32" cy="32" rx="26" ry="10" stroke="#ffffff" strokeWidth="2" fill="none" transform="rotate(-30 32 32)" />
    <ellipse cx="32" cy="32" rx="26" ry="10" stroke="#f59e0b" strokeWidth="2" fill="none" transform="rotate(30 32 32)" />
    {/* Radiant Alpha Core */}
    <polygon points="32,14 42,32 32,50 22,32" fill="#ffffff" stroke="#eab308" strokeWidth="2" />
    <circle cx="32" cy="32" r="5" fill="#f59e0b" />
  </svg>
);

// 👑🌌 53. Abyssal Void Overlord
export const OriginalAbyssArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="#09090b" stroke="#a855f7" strokeWidth="2" />
    {/* Dark Obsidian Crown */}
    <polygon points="18,22 24,10 32,18 40,10 46,22" fill="#3b0764" stroke="#c084fc" strokeWidth="1.5" />
    {/* Void Monarch Eyes */}
    <circle cx="24" cy="34" r="4.5" fill="#c084fc" />
    <circle cx="24" cy="34" r="2" fill="#000000" />
    <circle cx="40" cy="34" r="4.5" fill="#c084fc" />
    <circle cx="40" cy="34" r="2" fill="#000000" />
    {/* Bottomless Singularity Mouth */}
    <ellipse cx="32" cy="46" rx="8" ry="4" fill="#581c87" />
  </svg>
);

// 🕳️⭐ 54. Blackhole Dwarf
export const BlackholeDwarfArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="#030712" />
    {/* Dual Relativistic Jets */}
    <polygon points="32,2 29,18 35,18" fill="#ec4899" />
    <polygon points="32,62 29,46 35,46" fill="#ec4899" />
    {/* Accretion Disk */}
    <ellipse cx="32" cy="32" rx="28" ry="12" stroke="#f43f5e" strokeWidth="3" fill="none" transform="rotate(-15 32 32)" />
    <ellipse cx="32" cy="32" rx="24" ry="8" stroke="#ffffff" strokeWidth="1.5" fill="none" transform="rotate(-15 32 32)" />
    {/* Event Horizon */}
    <circle cx="32" cy="32" r="10" fill="#000000" stroke="#f43f5e" strokeWidth="1.5" />
  </svg>
);

// ☄️💥 55. Ragnarok Endbringer
export const OriginalRagnarokArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="#450a0a" />
    {/* Supernova Explosion Sparks */}
    {[0, 60, 120, 180, 240, 300].map((deg, i) => {
      const rad = (deg * Math.PI) / 180;
      const x2 = 32 + Math.cos(rad) * 26;
      const y2 = 32 + Math.sin(rad) * 26;
      return <line key={i} x1="32" y1="32" x2={x2} y2={y2} stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />;
    })}
    {/* Core Doomsday Skull */}
    <circle cx="32" cy="32" r="14" fill="#ea580c" stroke="#facc15" strokeWidth="2" />
    <circle cx="27" cy="30" r="2.5" fill="#000000" />
    <circle cx="37" cy="30" r="2.5" fill="#000000" />
  </svg>
);

// 🌌⚛️ 56. Omega Star Devourer
export const OriginalOmegaArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="#18181b" />
    {/* Omega Symbol & Plasma Swirl */}
    <path d="M 18 46 L 24 46 C 24 46, 20 20, 32 20 C 44 20, 40 46, 40 46 L 46 46" stroke="#c084fc" strokeWidth="4.5" strokeLinecap="round" fill="none" />
    <circle cx="32" cy="32" r="6" fill="#f43f5e" />
  </svg>
);

// 📡⚡ 57. Nebula Overcharge Beacon (Buffer)
export const BufferArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="#042f2e" />
    {/* Dish Antenna */}
    <path d="M 16 28 Q 32 12 48 28 Z" fill="#2dd4bf" stroke="#0f766e" strokeWidth="2" />
    {/* Mast & Signal Emitter */}
    <line x1="32" y1="20" x2="32" y2="48" stroke="#5eead4" strokeWidth="3" strokeLinecap="round" />
    <circle cx="32" cy="14" r="4" fill="#facc15" />
    {/* Radio Waves */}
    <path d="M 22 10 Q 32 4 42 10" stroke="#facc15" strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>
);

// 👁️✨ 58. The Archon Overseer
export const AllSeeingOverseerArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="#020617" />
    {/* Triple Floating Glyphic Rings */}
    <circle cx="32" cy="32" r="26" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="6,4" fill="none" />
    <circle cx="32" cy="32" r="21" stroke="#00f0ff" strokeWidth="1.2" strokeDasharray="3,3" fill="none" />
    {/* Divine All-Seeing Eye */}
    <path d="M 12 32 Q 32 14 52 32 Q 32 50 12 32 Z" fill="#0f172a" stroke="#fbbf24" strokeWidth="2" />
    {/* Iris & Laser Lens */}
    <circle cx="32" cy="32" r="9" fill="#00f0ff" stroke="#38bdf8" strokeWidth="1.5" />
    <circle cx="32" cy="32" r="4" fill="#020617" />
    <circle cx="30" cy="30" r="1.5" fill="#ffffff" />
  </svg>
);

// 🔱🔥 59. The Elemental Deity (12 Elements)
export const ElementalGodArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="#1e1b4b" />
    {/* 12 Elemental Dots Corona */}
    {['#ef4444', '#10b981', '#3b82f6', '#d97706', '#854d0e', '#06b6d4', '#a8a29e', '#eab308', '#f59e0b', '#8b5cf6', '#f97316', '#ec4899'].map((col, i) => {
      const rad = (i * 30 * Math.PI) / 180;
      const x = 32 + Math.cos(rad) * 25;
      const y = 32 + Math.sin(rad) * 25;
      return <circle key={i} cx={x} cy={y} r="2.8" fill={col} stroke="#ffffff" strokeWidth="0.8" />;
    })}
    {/* Elemental Deity Core Trident / Crystal */}
    <polygon points="32,10 24,34 32,28 40,34" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
    <line x1="32" y1="28" x2="32" y2="52" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

// 🛡️🤖 60. The Armored Titan / The True Defender
export const TitanDefenderArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="#0b132b" stroke="#38bdf8" strokeWidth="2" />
    
    {/* Left Heavy Mecha Hand & Arm System */}
    <g id="left-mecha-hand">
      {/* Hydraulic Piston Linkage */}
      <line x1="16" y1="28" x2="4" y2="34" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
      <line x1="16" y1="32" x2="6" y2="38" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
      {/* Articulated Bionic Fist */}
      <rect x="2" y="30" width="8" height="12" rx="2.5" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.2" />
      {/* Heavy Knuckles & Neon Capacitors */}
      <rect x="1" y="32" width="2.5" height="2.5" rx="0.5" fill="#00f0ff" />
      <rect x="1" y="36" width="2.5" height="2.5" rx="0.5" fill="#00f0ff" />
      <rect x="1" y="40" width="2.5" height="2.5" rx="0.5" fill="#00f0ff" />
      {/* Hydraulic Wrist Collar */}
      <circle cx="8" cy="36" r="2" fill="#38bdf8" />
    </g>

    {/* Right Heavy Mecha Hand & Arm System */}
    <g id="right-mecha-hand">
      {/* Hydraulic Piston Linkage */}
      <line x1="48" y1="28" x2="60" y2="34" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
      <line x1="48" y1="32" x2="58" y2="38" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
      {/* Articulated Bionic Fist */}
      <rect x="54" y="30" width="8" height="12" rx="2.5" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.2" />
      {/* Heavy Knuckles & Neon Capacitors */}
      <rect x="60.5" y="32" width="2.5" height="2.5" rx="0.5" fill="#00f0ff" />
      <rect x="60.5" y="36" width="2.5" height="2.5" rx="0.5" fill="#00f0ff" />
      <rect x="60.5" y="40" width="2.5" height="2.5" rx="0.5" fill="#00f0ff" />
      {/* Hydraulic Wrist Collar */}
      <circle cx="56" cy="36" r="2" fill="#38bdf8" />
    </g>

    {/* Top Left Cannon */}
    <rect x="12" y="10" width="6" height="12" rx="1.5" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" />
    <circle cx="15" cy="10" r="2" fill="#00f0ff" />

    {/* Top Right Cannon */}
    <rect x="46" y="10" width="6" height="12" rx="1.5" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" />
    <circle cx="49" cy="10" r="2" fill="#00f0ff" />

    {/* 4 Shield Generator Arcs */}
    <path d="M 24 8 Q 32 4 40 8" stroke="#00f0ff" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M 24 56 Q 32 60 40 56" stroke="#00f0ff" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M 8 20 Q 5 24 8 28" stroke="#00f0ff" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M 56 20 Q 59 24 56 28" stroke="#00f0ff" strokeWidth="1.5" strokeLinecap="round" />

    {/* Titan Armored Chassis & Chestplate */}
    <polygon points="32,14 18,24 20,48 44,48 46,24" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
    <polygon points="32,18 24,26 24,44 40,44 40,26" fill="#334155" />
    
    {/* Visor Optics */}
    <rect x="25" y="21" width="14" height="4" rx="1" fill="#00f0ff" />

    {/* Cyan Arc Reactor */}
    <circle cx="32" cy="35" r="5.5" fill="#00f0ff" stroke="#ffffff" strokeWidth="1.5" />
  </svg>
);

// ☀️🔥 61. Unrivaled Solar Phoenix
export const UnrivaledSolarPhoenixArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="#450a0a" stroke="#f59e0b" strokeWidth="2" />
    {/* Solar Corona */}
    <circle cx="32" cy="32" r="25" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,4" fill="none" />
    <path d="M 12 32 Q 18 10 32 6 Q 46 10 52 32 Q 32 40 12 32 Z" fill="#ea580c" />
    <polygon points="32,10 26,24 38,24" fill="#fef08a" />
    <circle cx="32" cy="28" r="4" fill="#ffffff" />
  </svg>
);

// 🕳️👹 62. Unrivaled Void Behemoth
export const UnrivaledVoidBehemothArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="#09090b" stroke="#ec4899" strokeWidth="2" />
    {/* Obsidian Plates */}
    <polygon points="32,8 14,24 18,54 46,54 50,24" fill="#18181b" stroke="#ec4899" strokeWidth="2" />
    <circle cx="26" cy="30" r="3.5" fill="#f43f5e" />
    <circle cx="38" cy="30" r="3.5" fill="#f43f5e" />
    <polygon points="32,44 26,38 38,38" fill="#a855f7" />
  </svg>
);

// ❄️🐉 63. Unrivaled Frost Dragon
export const UnrivaledFrostDragonArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="#082f49" stroke="#38bdf8" strokeWidth="2" />
    {/* Glacial Horns */}
    <polygon points="20,20 8,4 24,14" fill="#7dd3fc" />
    <polygon points="44,20 56,4 40,14" fill="#7dd3fc" />
    {/* Ice Dragon Face */}
    <polygon points="32,54 16,30 24,18 40,18 48,30" fill="#0284c7" stroke="#e0f2fe" strokeWidth="2" />
    <polygon points="24,28 29,26 28,32" fill="#ffffff" />
    <polygon points="40,28 35,26 36,32" fill="#ffffff" />
  </svg>
);

// ⚡🦅 64. Unrivaled Storm Wyvern
export const UnrivaledStormWyvernArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="#1e1b4b" stroke="#facc15" strokeWidth="2" />
    {/* Lightning Bolts */}
    <path d="M 12 18 L 22 28 L 16 32 L 26 44" stroke="#fde047" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <path d="M 52 18 L 42 28 L 48 32 L 38 44" stroke="#fde047" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    {/* Wyvern Head */}
    <polygon points="32,10 22,28 42,28" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />
    <circle cx="28" cy="24" r="2.5" fill="#38bdf8" />
    <circle cx="36" cy="24" r="2.5" fill="#38bdf8" />
  </svg>
);

// 🔮⚡ 65. Arcane Warper
export const ArcaneWarperArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="#1e1b4b" stroke="#c084fc" strokeWidth="2" />
    {/* Dual Void Rings */}
    <ellipse cx="32" cy="32" rx="26" ry="10" stroke="#c084fc" strokeWidth="2" strokeDasharray="4,3" fill="none" transform="rotate(-20 32 32)" />
    <ellipse cx="32" cy="32" rx="26" ry="10" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="4,3" fill="none" transform="rotate(20 32 32)" />
    {/* Arcane Warper Head/Mask */}
    <polygon points="32,12 18,34 32,50 46,34" fill="#6d28d9" stroke="#e879f9" strokeWidth="2" />
    {/* Laser Orbs */}
    <circle cx="26" cy="32" r="3.5" fill="#f43f5e" />
    <circle cx="38" cy="32" r="3.5" fill="#f43f5e" />
    <circle cx="32" cy="26" r="3" fill="#ffffff" />
  </svg>
);

// 🧿🩸 65b. Infected Corrupted Arcane Warper
export const InfectedWarperArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="infectedAura" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#881337" />
        <stop offset="60%" stopColor="#4c0519" />
        <stop offset="100%" stopColor="#09050d" />
      </radialGradient>
      <linearGradient id="corruptSlash" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ff0055" />
        <stop offset="50%" stopColor="#9333ea" />
        <stop offset="100%" stopColor="#ff0055" />
      </linearGradient>
    </defs>
    {/* Corrupted Void Base */}
    <circle cx="32" cy="32" r="30" fill="url(#infectedAura)" stroke="#f43f5e" strokeWidth="2.5" />
    
    {/* Corrupted Spacetime Tendrils / Infection Glitches */}
    <path d="M 12 12 Q 22 28 8 44" stroke="#e11d48" strokeWidth="1.8" strokeDasharray="3,3" fill="none" opacity="0.8" />
    <path d="M 52 12 Q 42 28 56 44" stroke="#e11d48" strokeWidth="1.8" strokeDasharray="3,3" fill="none" opacity="0.8" />

    {/* Dual Corrupted Reality Fracture Rings */}
    <ellipse cx="32" cy="32" rx="27" ry="10" stroke="url(#corruptSlash)" strokeWidth="2.5" strokeDasharray="5,2" fill="none" transform="rotate(-25 32 32)" />
    <ellipse cx="32" cy="32" rx="27" ry="10" stroke="#f43f5e" strokeWidth="1.8" strokeDasharray="3,4" fill="none" transform="rotate(25 32 32)" />

    {/* Glitched Singularity Tendrils */}
    <polygon points="32,6 26,18 38,18" fill="#f43f5e" opacity="0.9" />
    <polygon points="32,58 26,46 38,46" fill="#f43f5e" opacity="0.9" />

    {/* Arcane Warper Head/Mask with Corrupted Crimson Shell */}
    <polygon points="32,12 16,34 32,52 48,34" fill="#3b0764" stroke="#f43f5e" strokeWidth="2.5" />
    <polygon points="32,18 22,34 32,46 42,34" fill="#1e1b4b" stroke="#e11d48" strokeWidth="1.5" />
    
    {/* Agonized Corrupted Quantum Eyes & Core */}
    <circle cx="25" cy="32" r="4" fill="#ff0055" stroke="#ffffff" strokeWidth="1" />
    <circle cx="39" cy="32" r="4" fill="#ff0055" stroke="#ffffff" strokeWidth="1" />
    <circle cx="32" cy="24" r="3.5" fill="#f43f5e" />
    <circle cx="32" cy="38" r="2.5" fill="#ffffff" />
  </svg>
);

// 🌌🕳️ 67. The Multiverse Watcher (2nd Arcane - Titan Defender 3rd Form)
export const MultiverseWatcherArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="singularityGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#000000" />
        <stop offset="45%" stopColor="#050510" />
        <stop offset="70%" stopColor="#3b0764" />
        <stop offset="88%" stopColor="#06b6d4" />
        <stop offset="100%" stopColor="#d946ef" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="accretionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00f0ff" />
        <stop offset="35%" stopColor="#a855f7" />
        <stop offset="70%" stopColor="#ec4899" />
        <stop offset="100%" stopColor="#38bdf8" />
      </linearGradient>
      <linearGradient id="jetGrad" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor="#00ffff" />
        <stop offset="50%" stopColor="#c084fc" />
        <stop offset="100%" stopColor="#00ffff" />
      </linearGradient>
    </defs>
    {/* Outer Cosmic Void Field */}
    <circle cx="32" cy="32" r="30" fill="url(#singularityGlow)" stroke="#c084fc" strokeWidth="1.5" />
    
    {/* Relativistic Polar Jets */}
    <polygon points="32,2 29,20 35,20" fill="url(#jetGrad)" opacity="0.9" />
    <polygon points="32,62 29,44 35,44" fill="url(#jetGrad)" opacity="0.9" />
    <circle cx="32" cy="4" r="2.5" fill="#ffffff" />
    <circle cx="32" cy="60" r="2.5" fill="#ffffff" />

    {/* Swirling Outer Accretion Rings */}
    <ellipse cx="32" cy="32" rx="27" ry="9" stroke="url(#accretionGrad)" strokeWidth="2.5" strokeDasharray="6,2" fill="none" transform="rotate(-25 32 32)" />
    <ellipse cx="32" cy="32" rx="27" ry="9" stroke="#ffffff" strokeWidth="1" strokeDasharray="3,5" fill="none" transform="rotate(-25 32 32)" opacity="0.75" />
    <ellipse cx="32" cy="32" rx="24" ry="7" stroke="#ec4899" strokeWidth="1.5" fill="none" transform="rotate(25 32 32)" opacity="0.8" />

    {/* 8 Orbiting Multiverse Spacetime Prisms */}
    <circle cx="8" cy="32" r="2" fill="#00ffff" />
    <circle cx="56" cy="32" r="2" fill="#00ffff" />
    <circle cx="15" cy="18" r="1.5" fill="#f43f5e" />
    <circle cx="49" cy="46" r="1.5" fill="#f43f5e" />
    <circle cx="15" cy="46" r="1.5" fill="#a855f7" />
    <circle cx="49" cy="18" r="1.5" fill="#a855f7" />

    {/* Gravitational Warping Rings */}
    <circle cx="32" cy="32" r="16" stroke="#c084fc" strokeWidth="1.5" fill="none" opacity="0.7" />
    <circle cx="32" cy="32" r="13" stroke="#00f0ff" strokeWidth="2" fill="none" />

    {/* Event Horizon Photon Ring */}
    <circle cx="32" cy="32" r="9" stroke="#ffffff" strokeWidth="2" fill="#000000" />
    <circle cx="32" cy="32" r="7" fill="#000000" />
    
    {/* Inner Singularity Eye / Quantum Core */}
    <circle cx="32" cy="32" r="3" fill="#ffffff" opacity="0.9" />
  </svg>
);

// 🍊🐾 66. The Chillful Capybara
export const CapybaraArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="url(#capyBg)" />
    <defs>
      <radialGradient id="capyBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#d97706" />
        <stop offset="100%" stopColor="#78350f" />
      </radialGradient>
    </defs>
    {/* Small round ears */}
    <ellipse cx="18" cy="24" rx="4" ry="3.5" fill="#92400e" stroke="#451a03" strokeWidth="1.5" />
    <ellipse cx="46" cy="24" rx="4" ry="3.5" fill="#92400e" stroke="#451a03" strokeWidth="1.5" />
    {/* Distinctive Capybara Boxy Head & Snout */}
    <path d="M 22 22 C 22 22, 16 32, 18 46 C 20 54, 44 54, 46 46 C 48 32, 42 22, 42 22 Z" fill="#b45309" stroke="#451a03" strokeWidth="2" />
    {/* Muzzle Flat Line */}
    <ellipse cx="32" cy="46" rx="10" ry="6" fill="#92400e" />
    {/* Nostrils */}
    <ellipse cx="28" cy="45" rx="1.8" ry="1.2" fill="#1c1917" />
    <ellipse cx="36" cy="45" rx="1.8" ry="1.2" fill="#1c1917" />
    {/* Chill Relaxed Sleepy Eyes */}
    <line x1="22" y1="32" x2="28" y2="33" stroke="#1c1917" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="42" y1="32" x2="36" y2="33" stroke="#1c1917" strokeWidth="2.5" strokeLinecap="round" />
    {/* Yuzu Orange on Head! */}
    <circle cx="32" cy="16" r="6.5" fill="#f97316" stroke="#c2410c" strokeWidth="1.5" />
    <circle cx="32" cy="10" r="1.5" fill="#15803d" />
  </svg>
);
