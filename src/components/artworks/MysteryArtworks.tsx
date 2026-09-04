import React from 'react';
import { ArtworkProps } from './CommonArtworks';

// ❓⚡ 44. Mystery Anomaly
export const MysteryAnomalyArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="url(#anomBg)" />
    <defs>
      <radialGradient id="anomBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#000000" />
        <stop offset="70%" stopColor="#27272a" />
        <stop offset="100%" stopColor="#000000" />
      </radialGradient>
    </defs>
    {/* Question Glyph & Glitch lines */}
    <rect x="14" y="20" width="36" height="2" fill="#ffffff" />
    <rect x="8" y="32" width="48" height="2" fill="#38bdf8" />
    <rect x="16" y="44" width="32" height="2" fill="#f43f5e" />
    <text x="32" y="44" fontSize="32" fontWeight="900" textAnchor="middle" fill="#ffffff" fontFamily="monospace" stroke="#38bdf8" strokeWidth="1">?</text>
  </svg>
);

// 🌀⚛️ 45. Singularity Prime
export const MysterySingularityArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="#030712" />
    <defs>
      <radialGradient id="singGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="40%" stopColor="#06b6d4" />
        <stop offset="80%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#000000" />
      </radialGradient>
    </defs>
    {/* Accretion Disk */}
    <ellipse cx="32" cy="32" rx="28" ry="10" stroke="#00f0ff" strokeWidth="2.5" fill="none" transform="rotate(25 32 32)" />
    <ellipse cx="32" cy="32" rx="22" ry="7" stroke="#ffffff" strokeWidth="1.5" fill="none" transform="rotate(25 32 32)" />
    {/* Black Hole Core */}
    <circle cx="32" cy="32" r="10" fill="url(#singGrad)" />
    <circle cx="32" cy="32" r="6" fill="#000000" />
  </svg>
);

// 🚫💻 46. System Nullifier
export const MysteryNullifierArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="#09090b" stroke="#ef4444" strokeWidth="2" />
    {/* Glitch Diagonal Strikethrough */}
    <circle cx="32" cy="32" r="20" stroke="#ef4444" strokeWidth="3.5" fill="none" />
    <line x1="18" y1="18" x2="46" y2="46" stroke="#ef4444" strokeWidth="3.5" />
    {/* Binary Null Matrix */}
    <text x="32" y="26" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#22d3ee" fontFamily="monospace">01001100</text>
    <text x="32" y="44" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#22d3ee" fontFamily="monospace">NULL_EX</text>
  </svg>
);

// 🌑🔥 47. Eclipse Horizon Prime
export const MysteryEclipseArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="#09090b" />
    {/* Blazing Red/Orange Solar Corona */}
    <circle cx="32" cy="32" r="22" stroke="#ea580c" strokeWidth="3" fill="none" opacity="0.8" />
    <circle cx="32" cy="32" r="18" stroke="#f97316" strokeWidth="2" fill="none" />
    <circle cx="32" cy="32" r="15" stroke="#fde047" strokeWidth="1" fill="none" />
    {/* Total Eclipse Moon */}
    <circle cx="32" cy="32" r="14" fill="#020617" />
    {/* Diamond Ring Solar Flare */}
    <circle cx="44" cy="20" r="3" fill="#ffffff" />
  </svg>
);

// 🔮⚡ 48. Entropy Devourer
export const MysteryEntropyArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="#18181b" />
    <defs>
      <radialGradient id="entGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#ec4899" />
        <stop offset="60%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#000000" />
      </radialGradient>
    </defs>
    {/* Inward Spiraling Energy Arms */}
    <path d="M 32 6 Q 48 18 32 32" stroke="#ec4899" strokeWidth="2.5" fill="none" />
    <path d="M 58 32 Q 46 48 32 32" stroke="#8b5cf6" strokeWidth="2.5" fill="none" />
    <path d="M 32 58 Q 16 46 32 32" stroke="#3b82f6" strokeWidth="2.5" fill="none" />
    <path d="M 6 32 Q 18 16 32 32" stroke="#06b6d4" strokeWidth="2.5" fill="none" />
    {/* Central Core */}
    <circle cx="32" cy="32" r="8" fill="url(#entGrad)" />
  </svg>
);

// 🌌⚛️ 49. Supervoid Singularity
export const MysterySupervoidArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="#000000" stroke="#0284c7" strokeWidth="1.5" />
    {/* Distant Star field distorted */}
    <circle cx="16" cy="18" r="1" fill="#38bdf8" />
    <circle cx="48" cy="18" r="1" fill="#38bdf8" />
    <circle cx="20" cy="46" r="1" fill="#38bdf8" />
    <circle cx="44" cy="46" r="1" fill="#38bdf8" />
    {/* Deep Gravitational Void */}
    <circle cx="32" cy="32" r="18" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2,2" fill="none" />
    <circle cx="32" cy="32" r="12" fill="#0369a1" />
    <circle cx="32" cy="32" r="7" fill="#000000" />
  </svg>
);

// 🔮⚡ 50. Continuum Rift
export const MysteryContinuumArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="#020617" />
    {/* Jagged Dimensional Tear */}
    <path d="M 32 4 L 38 18 L 24 28 L 40 38 L 26 48 L 32 60" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M 32 4 L 38 18 L 24 28 L 40 38 L 26 48 L 32 60" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    {/* Reality Sparkles */}
    <circle cx="20" cy="16" r="2" fill="#38bdf8" />
    <circle cx="44" cy="44" r="2" fill="#38bdf8" />
  </svg>
);

// 🌟🌑 51. Darkstar Singularity
export const MysteryDarkstarArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="#09090b" />
    {/* Pulsar Beams */}
    <line x1="8" y1="8" x2="56" y2="56" stroke="#c084fc" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="8" y1="8" x2="56" y2="56" stroke="#ffffff" strokeWidth="1" />
    {/* Dark Star Core */}
    <circle cx="32" cy="32" r="14" fill="#581c87" stroke="#d8b4fe" strokeWidth="1.5" />
    <circle cx="32" cy="32" r="8" fill="#000000" />
    <circle cx="32" cy="32" r="3" fill="#ec4899" />
  </svg>
);
