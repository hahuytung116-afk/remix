import React from 'react';
import { ArtworkProps } from './CommonArtworks';

// 🦄🌌 38. Celestial Pegasus
export const CelestialPegasusArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="url(#pegBg)" />
    <defs>
      <radialGradient id="pegBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="60%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#0f172a" />
      </radialGradient>
    </defs>
    {/* Celestial Horn */}
    <polygon points="32,2 29,18 35,18" fill="#facc15" stroke="#fef08a" strokeWidth="1" />
    {/* Starlight Wings */}
    <path d="M 12 32 Q 4 14 18 10 Q 22 22 22 34 Z" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1.5" />
    <path d="M 52 32 Q 60 14 46 10 Q 42 22 42 34 Z" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1.5" />
    {/* Head */}
    <ellipse cx="32" cy="34" rx="15" ry="16" fill="#f8fafc" stroke="#38bdf8" strokeWidth="2" />
    {/* Glowing Starlight Eyes */}
    <circle cx="25" cy="30" r="3.5" fill="#60a5fa" />
    <circle cx="24" cy="29" r="1.2" fill="#ffffff" />
    <circle cx="39" cy="30" r="3.5" fill="#60a5fa" />
    <circle cx="38" cy="29" r="1.2" fill="#ffffff" />
  </svg>
);

// 🦊🌸 39. Celestial Kitsune
export const CelestialKitsuneArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="url(#kitBg)" />
    <defs>
      <radialGradient id="kitBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#f472b6" />
        <stop offset="70%" stopColor="#831843" />
        <stop offset="100%" stopColor="#1e1b4b" />
      </radialGradient>
    </defs>
    {/* Floating Soul Orbs */}
    <circle cx="12" cy="18" r="4" fill="#f43f5e" opacity="0.8" />
    <circle cx="52" cy="18" r="4" fill="#f43f5e" opacity="0.8" />
    <circle cx="32" cy="6" r="3" fill="#fb7185" opacity="0.9" />
    {/* Pointed Fox Ears */}
    <polygon points="18,26 10,6 26,16" fill="#fdf2f8" stroke="#db2777" strokeWidth="1.5" />
    <polygon points="46,26 54,6 38,16" fill="#fdf2f8" stroke="#db2777" strokeWidth="1.5" />
    {/* Head & Mask Markings */}
    <polygon points="32,54 14,28 50,28" fill="#ffffff" stroke="#db2777" strokeWidth="2" />
    <path d="M 20 28 Q 26 22 28 30" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" />
    <path d="M 44 28 Q 38 22 36 30" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" />
    <polygon points="32,24 28,18 36,18" fill="#e11d48" />
    <ellipse cx="32" cy="50" rx="2.5" ry="1.8" fill="#1c1917" />
  </svg>
);

// 🐋🌊 40. Celestial Leviathan
export const CelestialLeviathanArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="url(#leviBg)" />
    <defs>
      <radialGradient id="leviBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#a78bfa" />
        <stop offset="60%" stopColor="#4338ca" />
        <stop offset="100%" stopColor="#0f172a" />
      </radialGradient>
    </defs>
    {/* Stardust Orbital Rings */}
    <ellipse cx="32" cy="34" rx="28" ry="12" stroke="#c084fc" strokeWidth="1.5" strokeDasharray="4,3" fill="none" transform="rotate(-15 32 34)" />
    {/* Cosmic Whale/Leviathan Head */}
    <ellipse cx="32" cy="32" rx="20" ry="18" fill="#312e81" stroke="#818cf8" strokeWidth="2" />
    {/* Bioluminescent Ridge */}
    <line x1="32" y1="16" x2="32" y2="44" stroke="#c084fc" strokeWidth="2.5" strokeLinecap="round" />
    {/* Glowing Eyes */}
    <circle cx="22" cy="30" r="3.5" fill="#38bdf8" />
    <circle cx="42" cy="30" r="3.5" fill="#38bdf8" />
  </svg>
);

// ⏳✨ 41. Celestial Chronos
export const CelestialChronosArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="url(#chronosBg)" />
    <defs>
      <radialGradient id="chronosBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="60%" stopColor="#d97706" />
        <stop offset="100%" stopColor="#1e1b4b" />
      </radialGradient>
    </defs>
    {/* Giant Rotating Clock Gear Rim */}
    <circle cx="32" cy="32" r="24" stroke="#facc15" strokeWidth="2.5" strokeDasharray="3,3" fill="none" />
    {/* Inner Hourglass */}
    <polygon points="20,18 44,18 32,32 44,46 20,46 32,32" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" />
    {/* Temporal Glow */}
    <circle cx="32" cy="32" r="4" fill="#38bdf8" />
    {/* Time Hands */}
    <line x1="32" y1="32" x2="32" y2="24" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
    <line x1="32" y1="32" x2="38" y2="32" stroke="#78350f" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// 👼✨ 42. Celestial Seraph Dragon
export const CelestialSeraphArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="url(#seraphBg)" />
    <defs>
      <radialGradient id="seraphBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="50%" stopColor="#fef08a" />
        <stop offset="100%" stopColor="#1e1b4b" />
      </radialGradient>
    </defs>
    {/* Holy Halo Ring */}
    <ellipse cx="32" cy="14" rx="14" ry="5" stroke="#facc15" strokeWidth="2" fill="none" />
    {/* 6 Radiant Wings */}
    <path d="M 8 20 Q 22 24 28 32 Q 14 26 8 20 Z" fill="#ffffff" stroke="#facc15" strokeWidth="1" />
    <path d="M 56 20 Q 42 24 36 32 Q 50 26 56 20 Z" fill="#ffffff" stroke="#facc15" strokeWidth="1" />
    <path d="M 6 36 Q 22 36 28 42 Q 14 42 6 36 Z" fill="#ffffff" stroke="#facc15" strokeWidth="1" />
    <path d="M 58 36 Q 42 36 36 42 Q 50 42 58 36 Z" fill="#ffffff" stroke="#facc15" strokeWidth="1" />
    {/* Divine Seraph Core */}
    <polygon points="32,20 22,38 42,38" fill="#f8fafc" stroke="#eab308" strokeWidth="2" />
    <circle cx="32" cy="32" r="4.5" fill="#f59e0b" />
    <circle cx="32" cy="32" r="2" fill="#ffffff" />
  </svg>
);

// 🌋🪐 43. Celestial Behemoth
export const CelestialBehemothArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="url(#behemothBg)" />
    <defs>
      <radialGradient id="behemothBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#f97316" />
        <stop offset="60%" stopColor="#4f46e5" />
        <stop offset="100%" stopColor="#0f172a" />
      </radialGradient>
    </defs>
    {/* Floating Asteroid Debris */}
    <circle cx="12" cy="14" r="3" fill="#64748b" />
    <circle cx="52" cy="14" r="3" fill="#64748b" />
    <circle cx="10" cy="48" r="2.5" fill="#64748b" />
    <circle cx="54" cy="48" r="2.5" fill="#64748b" />
    {/* Colossal Obsidian Head */}
    <polygon points="32,12 14,32 18,52 46,52 50,32" fill="#1e1b4b" stroke="#f97316" strokeWidth="2" />
    {/* Molten Lava Cracks */}
    <path d="M 32 16 L 32 40 M 24 28 L 32 34 L 40 28" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
    {/* Burning Core Eyes */}
    <circle cx="24" cy="32" r="3" fill="#fbbf24" />
    <circle cx="40" cy="32" r="3" fill="#fbbf24" />
  </svg>
);
