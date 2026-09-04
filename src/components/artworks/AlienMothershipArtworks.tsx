import React from 'react';
import { ArtworkProps } from './CommonArtworks';

// 🛸 Alien Scout UFO / Fighter Drone
export const AlienUFOArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="ufoGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="60%" stopColor="#047857" />
        <stop offset="100%" stopColor="#022c22" />
      </radialGradient>
      <linearGradient id="ufoDome" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#34d399" />
        <stop offset="70%" stopColor="#059669" />
        <stop offset="100%" stopColor="#064e3b" />
      </linearGradient>
      <linearGradient id="ufoRim" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#1e293b" />
        <stop offset="25%" stopColor="#334155" />
        <stop offset="50%" stopColor="#0f172a" />
        <stop offset="75%" stopColor="#334155" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>
    </defs>

    {/* Anti-Grav Tractor Beam Aura */}
    <polygon points="20,44 44,44 56,62 8,62" fill="url(#ufoGlow)" opacity="0.35" />
    <line x1="24" y1="44" x2="12" y2="62" stroke="#34d399" strokeWidth="1" strokeDasharray="2,2" opacity="0.6" />
    <line x1="40" y1="44" x2="52" y2="62" stroke="#34d399" strokeWidth="1" strokeDasharray="2,2" opacity="0.6" />

    {/* Main Flying Saucer Disc */}
    <ellipse cx="32" cy="38" rx="28" ry="9" fill="url(#ufoRim)" stroke="#34d399" strokeWidth="1.5" />
    <ellipse cx="32" cy="37" rx="22" ry="5.5" fill="#0f172a" />

    {/* Ventral Pulsing Alien Node Lights */}
    <circle cx="12" cy="39" r="2" fill="#34d399" />
    <circle cx="20" cy="42" r="2.2" fill="#10b981" />
    <circle cx="32" cy="43" r="2.8" fill="#6ee7b7" />
    <circle cx="44" cy="42" r="2.2" fill="#10b981" />
    <circle cx="52" cy="39" r="2" fill="#34d399" />

    {/* Cockpit Canopy Dome */}
    <path d="M 20 34 C 20 20, 44 20, 44 34 Z" fill="url(#ufoDome)" stroke="#a7f3d0" strokeWidth="1.5" />
    {/* Alien Pilot Silhouette & HUD Scanner */}
    <ellipse cx="32" cy="27" rx="4" ry="5.5" fill="#022c22" />
    <circle cx="30.5" cy="25" r="1.2" fill="#34d399" />
    <circle cx="33.5" cy="25" r="1.2" fill="#34d399" />

    {/* Dual Underwing Plasma Blaster Turrets */}
    <rect x="15" y="42" width="3" height="6" rx="1" fill="#064e3b" stroke="#34d399" strokeWidth="0.8" />
    <rect x="46" y="42" width="3" height="6" rx="1" fill="#064e3b" stroke="#34d399" strokeWidth="0.8" />
    <circle cx="16.5" cy="48" r="1.2" fill="#ef4444" />
    <circle cx="47.5" cy="48" r="1.2" fill="#ef4444" />
  </svg>
);

// 🛸👾 The Colossal Alien Mothership (Dreadnought Flagship)
export const AlienMothershipArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="mothershipCore" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#6ee7b7" />
        <stop offset="30%" stopColor="#10b981" />
        <stop offset="70%" stopColor="#065f46" />
        <stop offset="100%" stopColor="#022c22" />
      </radialGradient>
      <linearGradient id="mothershipHull" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0f172a" />
        <stop offset="30%" stopColor="#1e293b" />
        <stop offset="70%" stopColor="#090d16" />
        <stop offset="100%" stopColor="#020617" />
      </linearGradient>
      <linearGradient id="apocalypseBeam" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="25%" stopColor="#6ee7b7" />
        <stop offset="65%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#047857" stopOpacity="0" />
      </linearGradient>
    </defs>

    {/* Gravitational Distortions & Dark Warp Shadow */}
    <ellipse cx="50" cy="45" rx="46" ry="18" fill="#020617" opacity="0.85" />

    {/* Colossal Dreadnought Outrigger Wings */}
    <path 
      d="M 4 40 L 22 28 L 36 34 L 50 20 L 64 34 L 78 28 L 96 40 L 84 56 L 68 50 L 50 62 L 32 50 L 16 56 Z" 
      fill="url(#mothershipHull)" 
      stroke="#10b981" 
      strokeWidth="2" 
    />

    {/* Armor Plating Ribs & Tech Seams */}
    <line x1="22" y1="28" x2="32" y2="50" stroke="#34d399" strokeWidth="1.2" opacity="0.7" />
    <line x1="78" y1="28" x2="68" y2="50" stroke="#34d399" strokeWidth="1.2" opacity="0.7" />
    <line x1="50" y1="20" x2="50" y2="40" stroke="#6ee7b7" strokeWidth="1.5" />

    {/* Flanking Heavy Hangar Bays */}
    <ellipse cx="24" cy="44" rx="7" ry="4" fill="#047857" stroke="#34d399" strokeWidth="1" />
    <circle cx="21" cy="44" r="1.5" fill="#a7f3d0" />
    <circle cx="27" cy="44" r="1.5" fill="#a7f3d0" />

    <ellipse cx="76" cy="44" rx="7" ry="4" fill="#047857" stroke="#34d399" strokeWidth="1" />
    <circle cx="73" cy="44" r="1.5" fill="#a7f3d0" />
    <circle cx="79" cy="44" r="1.5" fill="#a7f3d0" />

    {/* Upper Command Citadel Bridge */}
    <polygon points="50,14 42,24 58,24" fill="#022c22" stroke="#34d399" strokeWidth="1.5" />
    <line x1="45" y1="22" x2="55" y2="22" stroke="#6ee7b7" strokeWidth="1.5" />

    {/* Ventral Apocalyptic Superlaser Emitter Core */}
    <circle cx="50" cy="48" r="12" fill="url(#mothershipCore)" stroke="#a7f3d0" strokeWidth="2.5" />
    <circle cx="50" cy="48" r="7" fill="#ffffff" />
    
    {/* Focusing Plasma Ring Coils */}
    <ellipse cx="50" cy="48" rx="16" ry="6" stroke="#34d399" strokeWidth="1.8" strokeDasharray="4,2" fill="none" />
    <ellipse cx="50" cy="48" rx="16" ry="6" stroke="#6ee7b7" strokeWidth="1" fill="none" transform="rotate(45 50 48)" />
    <ellipse cx="50" cy="48" rx="16" ry="6" stroke="#6ee7b7" strokeWidth="1" fill="none" transform="rotate(-45 50 48)" />

    {/* Energy Charge Particle Tendrils */}
    <circle cx="42" cy="42" r="1.5" fill="#6ee7b7" />
    <circle cx="58" cy="42" r="1.5" fill="#6ee7b7" />
    <circle cx="42" cy="54" r="1.5" fill="#6ee7b7" />
    <circle cx="58" cy="54" r="1.5" fill="#6ee7b7" />
  </svg>
);

// 🌌✨ The Elemental Deity in GALAXY / COSMOS Mode!
export const GalaxyElementalGodArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="galaxyCosmosBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="35%" stopColor="#818cf8" />
        <stop offset="70%" stopColor="#4c1d95" />
        <stop offset="100%" stopColor="#030712" />
      </radialGradient>
      <linearGradient id="stellarTrident" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="30%" stopColor="#38bdf8" />
        <stop offset="70%" stopColor="#c084fc" />
        <stop offset="100%" stopColor="#ec4899" />
      </linearGradient>
    </defs>

    {/* Cosmic Void & Nebula Core */}
    <circle cx="32" cy="32" r="30" fill="url(#galaxyCosmosBg)" stroke="#38bdf8" strokeWidth="2" />

    {/* Swirling Galactic Accretion Arms */}
    <ellipse cx="32" cy="32" rx="27" ry="11" stroke="#38bdf8" strokeWidth="1.8" strokeDasharray="5,2" fill="none" transform="rotate(-25 32 32)" opacity="0.85" />
    <ellipse cx="32" cy="32" rx="27" ry="11" stroke="#ec4899" strokeWidth="1.5" strokeDasharray="3,4" fill="none" transform="rotate(35 32 32)" opacity="0.75" />
    <ellipse cx="32" cy="32" rx="23" ry="7" stroke="#ffffff" strokeWidth="1" strokeDasharray="2,3" fill="none" transform="rotate(-60 32 32)" opacity="0.6" />

    {/* 12 Cosmic Starlight Constellations around perimeter */}
    {['#38bdf8', '#818cf8', '#c084fc', '#f472b6', '#38bdf8', '#ffffff', '#a855f7', '#06b6d4', '#ec4899', '#67e8f9', '#e879f9', '#ffffff'].map((col, i) => {
      const rad = (i * 30 * Math.PI) / 180;
      const x = 32 + Math.cos(rad) * 25;
      const y = 32 + Math.sin(rad) * 25;
      return (
        <g key={i}>
          <circle cx={x} cy={y} r="2.5" fill={col} stroke="#ffffff" strokeWidth="0.8" />
          <circle cx={x} cy={y} r="1" fill="#ffffff" />
        </g>
      );
    })}

    {/* Galaxy Element Core Trident / Scepter */}
    <polygon points="32,8 23,32 32,26 41,32" fill="url(#stellarTrident)" stroke="#ffffff" strokeWidth="1.5" />
    <line x1="32" y1="26" x2="32" y2="54" stroke="url(#stellarTrident)" strokeWidth="3.5" strokeLinecap="round" />

    {/* Supernova Energy Core */}
    <circle cx="32" cy="24" r="5" fill="#ffffff" />
    <circle cx="32" cy="24" r="3" fill="#38bdf8" />
  </svg>
);

// 🏰 Sanctuary Defense Base
export const SanctuaryBaseArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="baseWall" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#334155" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
    </defs>
    {/* Base Foundation Platform */}
    <rect x="4" y="44" width="56" height="16" rx="2" fill="url(#baseWall)" stroke="#38bdf8" strokeWidth="1.5" />
    {/* Main Citadel Headquarters */}
    <rect x="18" y="24" width="28" height="20" rx="2" fill="#1e293b" stroke="#60a5fa" strokeWidth="1.5" />
    {/* Radar Dish & Communications Array */}
    <ellipse cx="32" cy="18" rx="8" ry="4" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.2" />
    <line x1="32" y1="18" x2="32" y2="10" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
    <circle cx="32" cy="9" r="2" fill="#ef4444" />
    {/* Twin Defense Laser Turrets */}
    <rect x="8" y="38" width="8" height="6" rx="1" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
    <line x1="12" y1="38" x2="8" y2="30" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
    <rect x="48" y="38" width="8" height="6" rx="1" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
    <line x1="52" y1="38" x2="56" y2="30" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
    {/* Defensive Forcefield Perimeter Grid */}
    <path d="M 6 44 C 6 16, 58 16, 58 44" stroke="#00f0ff" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.65" fill="none" />
  </svg>
);

// 💥💀 Completely Annihilated Sanctuary Base Crater
export const SanctuaryBaseRuinsArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="craterBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#450a0a" />
        <stop offset="60%" stopColor="#1c1917" />
        <stop offset="100%" stopColor="#09090b" />
      </radialGradient>
    </defs>
    {/* Devastated Impact Basin */}
    <ellipse cx="32" cy="42" rx="30" ry="16" fill="url(#craterBg)" stroke="#ef4444" strokeWidth="2" />
    <ellipse cx="32" cy="43" rx="20" ry="9" fill="#000000" stroke="#f97316" strokeWidth="1.5" />

    {/* Melted Structural Girders & Slag */}
    <line x1="14" y1="46" x2="22" y2="34" stroke="#78716c" strokeWidth="2" strokeLinecap="round" />
    <line x1="20" y1="44" x2="28" y2="38" stroke="#44403c" strokeWidth="2.5" />
    <line x1="46" y1="48" x2="38" y2="36" stroke="#78716c" strokeWidth="2" strokeLinecap="round" />
    <line x1="52" y1="45" x2="42" y2="40" stroke="#44403c" strokeWidth="2.5" />

    {/* Smoldering Plasma Fires & Embers */}
    <circle cx="28" cy="44" r="2.5" fill="#f97316" />
    <circle cx="36" cy="46" r="3" fill="#ef4444" />
    <circle cx="33" cy="41" r="1.8" fill="#facc15" />

    {/* Rising Toxic Ash Smoke Cloud */}
    <path d="M 24 38 Q 20 24 32 18 Q 44 24 40 38 Z" fill="#292524" opacity="0.6" />
    <path d="M 28 32 Q 24 16 34 10 Q 42 16 38 32 Z" fill="#1c1917" opacity="0.45" />
  </svg>
);
