import React from 'react';

export interface ArtworkProps {
  className?: string;
}

// 🐭 1. Field Mouse
export const MouseArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="url(#mouseBg)" />
    <defs>
      <radialGradient id="mouseBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#cbd5e1" />
        <stop offset="100%" stopColor="#64748b" />
      </radialGradient>
      <radialGradient id="mouseEar" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#f472b6" />
        <stop offset="100%" stopColor="#cbd5e1" />
      </radialGradient>
    </defs>
    {/* Large Round Ears */}
    <circle cx="16" cy="18" r="13" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
    <circle cx="16" cy="18" r="8" fill="url(#mouseEar)" />
    <circle cx="48" cy="18" r="13" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
    <circle cx="48" cy="18" r="8" fill="url(#mouseEar)" />
    {/* Head & Body */}
    <ellipse cx="32" cy="38" rx="20" ry="18" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
    {/* Cheeks */}
    <ellipse cx="32" cy="44" rx="14" ry="10" fill="#cbd5e1" />
    {/* Nose */}
    <polygon points="32,44 28,40 36,40" fill="#f43f5e" />
    {/* Whiskers */}
    <line x1="12" y1="42" x2="26" y2="43" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="12" y1="46" x2="26" y2="45" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="52" y1="42" x2="38" y2="43" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="52" y1="46" x2="38" y2="45" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" />
    {/* Big Shiny Eyes */}
    <circle cx="23" cy="32" r="4.5" fill="#0f172a" />
    <circle cx="21.5" cy="30.5" r="1.5" fill="#ffffff" />
    <circle cx="41" cy="32" r="4.5" fill="#0f172a" />
    <circle cx="39.5" cy="30.5" r="1.5" fill="#ffffff" />
    {/* Smile */}
    <path d="M 29 48 Q 32 51 35 48" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// 🐰 2. Swift Rabbit
export const RabbitArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="url(#rabbitBg)" />
    <defs>
      <linearGradient id="rabbitBg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f1f5f9" />
        <stop offset="100%" stopColor="#94a3b8" />
      </linearGradient>
    </defs>
    {/* Tall Ears */}
    <path d="M 22 32 C 16 16, 14 2, 22 2 C 28 2, 28 16, 26 32 Z" fill="#e2e8f0" stroke="#64748b" strokeWidth="1.5" />
    <path d="M 22 26 C 18 16, 17 6, 22 6 C 26 6, 26 16, 24 26 Z" fill="#f472b6" />
    <path d="M 42 32 C 48 16, 50 2, 42 2 C 36 2, 36 16, 38 32 Z" fill="#e2e8f0" stroke="#64748b" strokeWidth="1.5" />
    <path d="M 42 26 C 46 16, 47 6, 42 6 C 38 6, 38 16, 40 26 Z" fill="#f472b6" />
    {/* Head */}
    <ellipse cx="32" cy="40" rx="19" ry="17" fill="#f8fafc" stroke="#64748b" strokeWidth="1.5" />
    {/* Cheeks */}
    <circle cx="20" cy="45" r="4" fill="#fbcfe8" opacity="0.6" />
    <circle cx="44" cy="45" r="4" fill="#fbcfe8" opacity="0.6" />
    {/* Nose & Mouth */}
    <polygon points="32,43 29,39 35,39" fill="#f43f5e" />
    <path d="M 32 43 L 32 46 M 32 46 Q 28 49 26 47 M 32 46 Q 36 49 38 47" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
    {/* Whiskers */}
    <line x1="12" y1="44" x2="24" y2="45" stroke="#cbd5e1" strokeWidth="1.5" />
    <line x1="52" y1="44" x2="40" y2="45" stroke="#cbd5e1" strokeWidth="1.5" />
    {/* Eyes */}
    <circle cx="23" cy="35" r="3.5" fill="#be185d" />
    <circle cx="22" cy="34" r="1.2" fill="#ffffff" />
    <circle cx="41" cy="35" r="3.5" fill="#be185d" />
    <circle cx="40" cy="34" r="1.2" fill="#ffffff" />
  </svg>
);

// 🐦 3. Pigeon
export const PigeonArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="url(#pigeonBg)" />
    <defs>
      <linearGradient id="pigeonBg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#475569" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>
      <linearGradient id="iridNeck" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="50%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#06b6d4" />
      </linearGradient>
    </defs>
    {/* Body */}
    <ellipse cx="32" cy="38" rx="20" ry="17" fill="#64748b" stroke="#334155" strokeWidth="1.5" />
    {/* Iridescent Neck Collar */}
    <path d="M 18 36 Q 32 46 46 36 Q 32 30 18 36 Z" fill="url(#iridNeck)" opacity="0.85" />
    {/* Head */}
    <circle cx="32" cy="24" r="13" fill="#94a3b8" stroke="#334155" strokeWidth="1.5" />
    {/* Crown Crest */}
    <path d="M 28 12 Q 32 6 36 12" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
    {/* Beak with Cere */}
    <path d="M 27 26 L 37 26 L 32 34 Z" fill="#ea580c" />
    <ellipse cx="32" cy="26" rx="3.5" ry="1.5" fill="#f8fafc" />
    {/* Red/Orange Pigeon Eyes */}
    <circle cx="23" cy="22" r="3.8" fill="#ea580c" stroke="#431407" strokeWidth="1" />
    <circle cx="23" cy="22" r="2" fill="#0f172a" />
    <circle cx="22" cy="21" r="0.8" fill="#ffffff" />
    <circle cx="41" cy="22" r="3.8" fill="#ea580c" stroke="#431407" strokeWidth="1" />
    <circle cx="41" cy="22" r="2" fill="#0f172a" />
    <circle cx="40" cy="21" r="0.8" fill="#ffffff" />
  </svg>
);

// 🦔 4. Spiky Hedgehog
export const HedgehogArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="url(#hedgeBg)" />
    <defs>
      <radialGradient id="hedgeBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#78350f" />
        <stop offset="100%" stopColor="#292524" />
      </radialGradient>
    </defs>
    {/* Spikes Halo */}
    <g fill="#451a03" stroke="#1c1917" strokeWidth="1">
      {[-45, -30, -15, 0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 32 + Math.cos(rad) * 16;
        const y1 = 32 + Math.sin(rad) * 16;
        const x2 = 32 + Math.cos(rad + 0.15) * 26;
        const y2 = 32 + Math.sin(rad + 0.15) * 26;
        const x3 = 32 + Math.cos(rad - 0.15) * 26;
        const y3 = 32 + Math.sin(rad - 0.15) * 26;
        return <polygon key={i} points={`${x1},${y1} ${x2},${y2} ${x3},${y3}`} fill={i % 2 === 0 ? '#78350f' : '#a16207'} />;
      })}
    </g>
    {/* Face / Snout */}
    <circle cx="32" cy="36" r="16" fill="#fed7aa" stroke="#78350f" strokeWidth="1.5" />
    {/* Tiny Ears */}
    <circle cx="20" cy="28" r="4" fill="#fbbf24" stroke="#78350f" strokeWidth="1" />
    <circle cx="44" cy="28" r="4" fill="#fbbf24" stroke="#78350f" strokeWidth="1" />
    {/* Cute Nose */}
    <ellipse cx="32" cy="42" rx="3.5" ry="2.5" fill="#1c1917" />
    <circle cx="31" cy="41" r="0.8" fill="#ffffff" />
    {/* Eyes */}
    <circle cx="26" cy="34" r="2.8" fill="#0f172a" />
    <circle cx="25" cy="33" r="1" fill="#ffffff" />
    <circle cx="38" cy="34" r="2.8" fill="#0f172a" />
    <circle cx="37" cy="33" r="1" fill="#ffffff" />
    {/* Smile */}
    <path d="M 30 46 Q 32 48 34 46" stroke="#451a03" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// 🐤 5. Chirping Sparrow
export const SparrowArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="url(#sparrowBg)" />
    <defs>
      <radialGradient id="sparrowBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fde047" />
        <stop offset="100%" stopColor="#ca8a04" />
      </radialGradient>
    </defs>
    {/* Body */}
    <ellipse cx="32" cy="38" rx="19" ry="17" fill="#fbbf24" stroke="#b45309" strokeWidth="1.5" />
    {/* Brown Wing Patterns */}
    <path d="M 14 34 Q 18 48 24 50 Q 20 40 18 34 Z" fill="#92400e" />
    <path d="M 50 34 Q 46 48 40 50 Q 44 40 46 34 Z" fill="#92400e" />
    {/* Head Cap */}
    <circle cx="32" cy="26" r="14" fill="#f59e0b" stroke="#b45309" strokeWidth="1.5" />
    <path d="M 22 20 Q 32 14 42 20 Q 32 18 22 20 Z" fill="#78350f" />
    {/* Beak */}
    <polygon points="32,34 27,27 37,27" fill="#ea580c" stroke="#7c2d12" strokeWidth="1" />
    {/* Cheeks */}
    <circle cx="22" cy="30" r="3" fill="#fef08a" />
    <circle cx="42" cy="30" r="3" fill="#fef08a" />
    {/* Eyes */}
    <circle cx="25" cy="24" r="3" fill="#0f172a" />
    <circle cx="24" cy="23" r="1" fill="#ffffff" />
    <circle cx="39" cy="24" r="3" fill="#0f172a" />
    <circle cx="38" cy="23" r="1" fill="#ffffff" />
  </svg>
);
