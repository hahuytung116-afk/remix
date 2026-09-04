import React from 'react';
import { ArtworkProps } from './CommonArtworks';

// 🦊 6. Red Fox
export const FoxArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="url(#foxBg)" />
    <defs>
      <radialGradient id="foxBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fb923c" />
        <stop offset="100%" stopColor="#9a3412" />
      </radialGradient>
    </defs>
    {/* Large Pointed Fox Ears */}
    <polygon points="18,30 10,6 26,18" fill="#ea580c" stroke="#7c2d12" strokeWidth="1.5" />
    <polygon points="17,26 12,10 24,18" fill="#1e293b" />
    <polygon points="46,30 54,6 38,18" fill="#ea580c" stroke="#7c2d12" strokeWidth="1.5" />
    <polygon points="47,26 52,10 40,18" fill="#1e293b" />
    {/* Head shape */}
    <polygon points="32,54 12,28 52,28" fill="#f97316" stroke="#9a3412" strokeWidth="1.5" />
    {/* White cheek patches */}
    <polygon points="32,52 14,30 24,42" fill="#ffffff" />
    <polygon points="32,52 50,30 40,42" fill="#ffffff" />
    {/* Sleek Fox Eyes */}
    <path d="M 20 30 Q 25 26 28 32 Q 25 34 20 30 Z" fill="#10b981" stroke="#064e3b" strokeWidth="1" />
    <ellipse cx="24" cy="30" rx="1.2" ry="2.2" fill="#022c22" />
    <path d="M 44 30 Q 39 26 36 32 Q 39 34 44 30 Z" fill="#10b981" stroke="#064e3b" strokeWidth="1" />
    <ellipse cx="40" cy="30" rx="1.2" ry="2.2" fill="#022c22" />
    {/* Black Nose */}
    <ellipse cx="32" cy="50" rx="3" ry="2" fill="#09090b" />
  </svg>
);

// 🐺 7. Grey Wolf
export const WolfArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="url(#wolfBg)" />
    <defs>
      <radialGradient id="wolfBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#64748b" />
        <stop offset="100%" stopColor="#0f172a" />
      </radialGradient>
    </defs>
    {/* Pointed Wolf Ears */}
    <polygon points="16,32 10,8 24,20" fill="#334155" stroke="#1e293b" strokeWidth="1.5" />
    <polygon points="16,28 12,12 22,20" fill="#0f172a" />
    <polygon points="48,32 54,8 40,20" fill="#334155" stroke="#1e293b" strokeWidth="1.5" />
    <polygon points="48,28 52,12 42,20" fill="#0f172a" />
    {/* Head & Muzzle */}
    <polygon points="32,56 14,28 50,28" fill="#475569" stroke="#1e293b" strokeWidth="1.5" />
    <polygon points="32,54 22,34 42,34" fill="#94a3b8" />
    {/* Piercing Ice Blue Wolf Eyes */}
    <polygon points="20,29 27,27 24,34" fill="#38bdf8" />
    <polygon points="44,29 37,27 40,34" fill="#38bdf8" />
    {/* Black Nose & Fangs */}
    <polygon points="32,51 28,47 36,47" fill="#020617" />
    <polygon points="27,51 29,55 30,51" fill="#ffffff" />
    <polygon points="37,51 35,55 34,51" fill="#ffffff" />
  </svg>
);

// 🦅 8. Golden Eagle
export const EagleArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="url(#eagleBg)" />
    <defs>
      <radialGradient id="eagleBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#d97706" />
        <stop offset="100%" stopColor="#451a03" />
      </radialGradient>
    </defs>
    {/* Feather Crown */}
    <path d="M 20 22 L 32 8 L 44 22 L 38 12 L 32 4 L 26 12 Z" fill="#b45309" />
    {/* White Head Plumes */}
    <ellipse cx="32" cy="28" rx="18" ry="16" fill="#f8fafc" stroke="#d97706" strokeWidth="1.5" />
    {/* Sharp Hooked Raptor Beak */}
    <path d="M 24 30 Q 32 26 40 30 C 40 42, 34 52, 32 54 C 30 52, 24 42, 24 30 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
    <path d="M 32 54 C 33 50, 37 40, 37 36" stroke="#92400e" strokeWidth="1.5" />
    {/* Fierce Amber Eagle Eyes */}
    <circle cx="21" cy="26" r="4.5" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
    <circle cx="21" cy="26" r="2.2" fill="#0f172a" />
    <circle cx="43" cy="26" r="4.5" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
    <circle cx="43" cy="26" r="2.2" fill="#0f172a" />
  </svg>
);

// 🐍 9. Desert Cobra
export const CobraArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="url(#cobraBg)" />
    <defs>
      <radialGradient id="cobraBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#84cc16" />
        <stop offset="100%" stopColor="#14532d" />
      </radialGradient>
    </defs>
    {/* Flared Cobra Hood */}
    <path d="M 32 10 C 14 14, 8 36, 18 50 C 24 54, 40 54, 46 50 C 56 36, 50 14, 32 10 Z" fill="#65a30d" stroke="#365314" strokeWidth="2" />
    {/* Hood Markings (Eyespots) */}
    <circle cx="22" cy="30" r="5" fill="#1e293b" stroke="#facc15" strokeWidth="1.5" />
    <circle cx="42" cy="30" r="5" fill="#1e293b" stroke="#facc15" strokeWidth="1.5" />
    {/* Serpent Head */}
    <ellipse cx="32" cy="26" rx="10" ry="12" fill="#4d7c0f" stroke="#14532d" strokeWidth="1.5" />
    {/* Glowing Slit Viper Eyes */}
    <ellipse cx="27" cy="24" rx="2.5" ry="3.5" fill="#facc15" />
    <line x1="27" y1="21" x2="27" y2="27" stroke="#000000" strokeWidth="1.2" />
    <ellipse cx="37" cy="24" rx="2.5" ry="3.5" fill="#facc15" />
    <line x1="37" y1="21" x2="37" y2="27" stroke="#000000" strokeWidth="1.2" />
    {/* Forked Tongue */}
    <path d="M 32 38 L 32 48 L 29 53 M 32 48 L 35 53" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// 🐈‍⬛ 10. Shadow Panther
export const PantherArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="url(#pantherBg)" />
    <defs>
      <radialGradient id="pantherBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#334155" />
        <stop offset="100%" stopColor="#020617" />
      </radialGradient>
    </defs>
    {/* Sleek Ears */}
    <polygon points="18,24 12,8 26,16" fill="#0f172a" stroke="#475569" strokeWidth="1" />
    <polygon points="46,24 52,8 38,16" fill="#0f172a" stroke="#475569" strokeWidth="1" />
    {/* Panther Head */}
    <ellipse cx="32" cy="34" rx="19" ry="17" fill="#09090b" stroke="#334155" strokeWidth="1.5" />
    {/* Muzzle */}
    <ellipse cx="32" cy="42" rx="10" ry="8" fill="#18181b" />
    {/* Glowing Amethyst Panther Eyes */}
    <polygon points="21,30 28,26 27,33" fill="#c084fc" />
    <circle cx="25" cy="30" r="1.5" fill="#f5d0fe" />
    <polygon points="43,30 36,26 37,33" fill="#c084fc" />
    <circle cx="39" cy="30" r="1.5" fill="#f5d0fe" />
    {/* Silver Whiskers */}
    <line x1="10" y1="42" x2="24" y2="43" stroke="#94a3b8" strokeWidth="1.2" />
    <line x1="54" y1="42" x2="40" y2="43" stroke="#94a3b8" strokeWidth="1.2" />
    {/* Nose */}
    <polygon points="32,42 29,38 35,38" fill="#a855f7" />
  </svg>
);

// 🐝 11. Golden Bee (Money Maker)
export const BeeArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="url(#beeBg)" />
    <defs>
      <radialGradient id="beeBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="100%" stopColor="#b45309" />
      </radialGradient>
      <linearGradient id="wingGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#67e8f9" stopOpacity="0.5" />
      </linearGradient>
    </defs>
    {/* Gossamer Wings */}
    <ellipse cx="20" cy="18" rx="12" ry="7" transform="rotate(-30 20 18)" fill="url(#wingGrad)" stroke="#38bdf8" strokeWidth="1.2" />
    <ellipse cx="44" cy="18" rx="12" ry="7" transform="rotate(30 44 18)" fill="url(#wingGrad)" stroke="#38bdf8" strokeWidth="1.2" />
    {/* Golden Striped Body */}
    <ellipse cx="32" cy="36" rx="16" ry="19" fill="#facc15" stroke="#713f12" strokeWidth="2" />
    {/* Black Stripes */}
    <path d="M 18 30 Q 32 36 46 30" stroke="#09090b" strokeWidth="4.5" strokeLinecap="round" />
    <path d="M 18 40 Q 32 46 46 40" stroke="#09090b" strokeWidth="4.5" strokeLinecap="round" />
    {/* Antennae */}
    <path d="M 28 20 Q 24 10 18 12 M 36 20 Q 40 10 46 12" stroke="#09090b" strokeWidth="2" strokeLinecap="round" />
    <circle cx="18" cy="12" r="2" fill="#fbbf24" />
    <circle cx="46" cy="12" r="2" fill="#fbbf24" />
    {/* Big Shiny Eyes */}
    <ellipse cx="25" cy="24" rx="3.5" ry="4" fill="#0f172a" />
    <circle cx="24" cy="22" r="1.2" fill="#ffffff" />
    <ellipse cx="39" cy="24" rx="3.5" ry="4" fill="#0f172a" />
    <circle cx="38" cy="22" r="1.2" fill="#ffffff" />
    {/* Honey Glow Icon */}
    <circle cx="32" cy="50" r="4" fill="#f59e0b" opacity="0.8" />
  </svg>
);
