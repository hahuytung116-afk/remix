import React from 'react';
import { ArtworkProps } from './CommonArtworks';

// 🤖🦖 30. Mecha Rex
export const MechaRexArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="url(#mechaBg)" />
    <defs>
      <radialGradient id="mechaBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#0ea5e9" />
        <stop offset="100%" stopColor="#020617" />
      </radialGradient>
    </defs>
    {/* Titanium Chassis */}
    <polygon points="14,36 18,16 36,12 52,24 54,44 38,42 32,48 18,46" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
    {/* Chrome Armor Plates */}
    <polygon points="20,20 34,16 38,26 24,28" fill="#475569" />
    {/* Glowing Cyan HUD Visor (Laser Optic) */}
    <path d="M 24 22 L 46 26 L 44 30 L 22 26 Z" fill="#00f0ff" />
    {/* Plasma Power Core / Vents */}
    <line x1="20" y1="36" x2="30" y2="36" stroke="#00f0ff" strokeWidth="2" />
    <line x1="20" y1="40" x2="28" y2="40" stroke="#00f0ff" strokeWidth="2" />
    {/* Cybernetic Steel Fangs */}
    <polygon points="34,34 36,39 38,34" fill="#38bdf8" />
    <polygon points="40,34 42,40 44,34" fill="#38bdf8" />
    <polygon points="46,34 48,40 50,34" fill="#38bdf8" />
  </svg>
);

// 🐙🌌 31. Cosmic Cthulhu
export const CthulhuArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="url(#cthBg)" />
    <defs>
      <radialGradient id="cthBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="70%" stopColor="#4c1d95" />
        <stop offset="100%" stopColor="#052e16" />
      </radialGradient>
    </defs>
    {/* Eldritch Horns */}
    <path d="M 18 16 Q 8 6 12 2 Q 18 8 24 14 Z" fill="#065f46" stroke="#10b981" strokeWidth="1" />
    <path d="M 46 16 Q 56 6 52 2 Q 46 8 40 14 Z" fill="#065f46" stroke="#10b981" strokeWidth="1" />
    {/* Head */}
    <ellipse cx="32" cy="26" rx="18" ry="16" fill="#047857" stroke="#10b981" strokeWidth="1.5" />
    {/* Multi-faceted Void Eyes */}
    <circle cx="24" cy="22" r="3" fill="#a855f7" />
    <circle cx="40" cy="22" r="3" fill="#a855f7" />
    <circle cx="28" cy="18" r="2.2" fill="#34d399" />
    <circle cx="36" cy="18" r="2.2" fill="#34d399" />
    {/* Writhing Face Tentacles */}
    <path d="M 24 32 Q 18 46 22 56 M 28 34 Q 26 48 30 58 M 36 34 Q 38 48 34 58 M 40 32 Q 46 46 42 56" stroke="#059669" strokeWidth="3.5" strokeLinecap="round" />
  </svg>
);

// ☢️🦎 32. Atomic Kaiju
export const KaijuArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="url(#kaijuBg)" />
    <defs>
      <radialGradient id="kaijuBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#c084fc" />
        <stop offset="100%" stopColor="#1e1b4b" />
      </radialGradient>
    </defs>
    {/* Glowing Dorsal Spines */}
    <polygon points="32,2 28,14 36,14" fill="#a855f7" stroke="#e879f9" strokeWidth="1.5" />
    <polygon points="22,8 20,18 26,18" fill="#a855f7" stroke="#e879f9" strokeWidth="1.5" />
    <polygon points="42,8 44,18 38,18" fill="#a855f7" stroke="#e879f9" strokeWidth="1.5" />
    {/* Armored Skull */}
    <ellipse cx="32" cy="34" rx="20" ry="18" fill="#1e1b4b" stroke="#7e22ce" strokeWidth="2" />
    {/* Atomic Breath Throat Glow */}
    <ellipse cx="32" cy="46" rx="10" ry="6" fill="#e879f9" opacity="0.85" />
    {/* Glowing Radioactive Eyes */}
    <polygon points="20,28 27,24 25,32" fill="#38bdf8" />
    <polygon points="44,28 37,24 39,32" fill="#38bdf8" />
    {/* Jaws */}
    <path d="M 20 40 Q 32 46 44 40" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

// ✨🦁 33. Stardust Chimera
export const SecretStardustArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="url(#stardustBg)" />
    <defs>
      <radialGradient id="stardustBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#ec4899" />
        <stop offset="60%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#0f172a" />
      </radialGradient>
    </defs>
    {/* Cosmic Constellation Stars */}
    <circle cx="16" cy="14" r="1.5" fill="#ffffff" />
    <circle cx="48" cy="14" r="1.5" fill="#ffffff" />
    <circle cx="12" cy="44" r="1.2" fill="#ffffff" />
    <circle cx="52" cy="44" r="1.2" fill="#ffffff" />
    <line x1="16" y1="14" x2="32" y2="8" stroke="#f472b6" strokeWidth="0.8" strokeDasharray="2,2" />
    <line x1="48" y1="14" x2="32" y2="8" stroke="#f472b6" strokeWidth="0.8" strokeDasharray="2,2" />
    {/* Nebular Mane */}
    <ellipse cx="32" cy="34" rx="22" ry="20" fill="#f43f5e" opacity="0.6" />
    <ellipse cx="32" cy="34" rx="16" ry="15" fill="#fdf4ff" stroke="#ec4899" strokeWidth="1.5" />
    {/* Eyes */}
    <circle cx="24" cy="30" r="3.5" fill="#ec4899" />
    <circle cx="23" cy="29" r="1.2" fill="#ffffff" />
    <circle cx="40" cy="30" r="3.5" fill="#ec4899" />
    <circle cx="39" cy="29" r="1.2" fill="#ffffff" />
  </svg>
);

// 🌌🐙 34. Nebula Space Kraken
export const SecretNebulaKrakenArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="url(#nebKrakBg)" />
    <defs>
      <radialGradient id="nebKrakBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#2dd4bf" />
        <stop offset="60%" stopColor="#0f766e" />
        <stop offset="100%" stopColor="#022c22" />
      </radialGradient>
    </defs>
    {/* Starlight Tentacles */}
    <path d="M 12 36 Q 4 48 12 58 M 24 38 Q 20 54 28 60 M 52 36 Q 60 48 52 58 M 40 38 Q 44 54 36 60" stroke="#5eead4" strokeWidth="4" strokeLinecap="round" fill="none" />
    {/* Mantle */}
    <ellipse cx="32" cy="24" rx="19" ry="18" fill="#134e4a" stroke="#2dd4bf" strokeWidth="2" />
    {/* Pulsing Galaxy Eyes */}
    <circle cx="23" cy="28" r="4.5" fill="#99f6e4" />
    <circle cx="23" cy="28" r="2" fill="#042f2e" />
    <circle cx="41" cy="28" r="4.5" fill="#99f6e4" />
    <circle cx="41" cy="28" r="2" fill="#042f2e" />
  </svg>
);

// 👾🔥 35. Quantum Glitch Phoenix
export const SecretQuantumGlitchArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="url(#qGlitchBg)" />
    <defs>
      <radialGradient id="qGlitchBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#a855f7" />
        <stop offset="100%" stopColor="#030712" />
      </radialGradient>
    </defs>
    {/* Glitched Polygon Blocks */}
    <rect x="8" y="22" width="12" height="6" fill="#c084fc" opacity="0.8" />
    <rect x="44" y="28" width="14" height="6" fill="#22d3ee" opacity="0.8" />
    <rect x="14" y="42" width="16" height="5" fill="#e879f9" opacity="0.7" />
    <polygon points="32,6 20,24 44,24" fill="#67e8f9" stroke="#c084fc" strokeWidth="1.5" />
    {/* Visor */}
    <rect x="22" y="26" width="20" height="8" fill="#ec4899" />
    <line x1="22" y1="30" x2="42" y2="30" stroke="#ffffff" strokeWidth="2" />
  </svg>
);

// 🐍⚡ 36. Hyper Cyber Viper
export const SecretCyberViperArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="url(#cViperBg)" />
    <defs>
      <radialGradient id="cViperBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#022c22" />
      </radialGradient>
    </defs>
    {/* Cyber Bionic Hood */}
    <path d="M 32 10 C 14 14, 8 36, 18 50 C 24 54, 40 54, 46 50 C 56 36, 50 14, 32 10 Z" fill="#064e3b" stroke="#34d399" strokeWidth="2" />
    {/* Circuit Lines */}
    <path d="M 22 20 L 22 42 M 42 20 L 42 42 M 32 18 L 32 30" stroke="#34d399" strokeWidth="1.5" />
    {/* Head */}
    <polygon points="32,16 22,34 42,34" fill="#0f172a" stroke="#10b981" strokeWidth="2" />
    {/* Ocular Lasers */}
    <circle cx="26" cy="28" r="2.5" fill="#f43f5e" />
    <circle cx="38" cy="28" r="2.5" fill="#f43f5e" />
  </svg>
);

// ☀️🦁 37. Solarium Apex Lion
export const SecretSolarLionArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="url(#sLionBg)" />
    <defs>
      <radialGradient id="sLionBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="60%" stopColor="#f97316" />
        <stop offset="100%" stopColor="#7c2d12" />
      </radialGradient>
    </defs>
    {/* Blazing Corona */}
    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
      const rad = (deg * Math.PI) / 180;
      const x1 = 32 + Math.cos(rad) * 20;
      const y1 = 32 + Math.sin(rad) * 20;
      const x2 = 32 + Math.cos(rad) * 29;
      const y2 = 32 + Math.sin(rad) * 29;
      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />;
    })}
    {/* Head */}
    <ellipse cx="32" cy="34" rx="16" ry="15" fill="#fffbeb" stroke="#f59e0b" strokeWidth="2" />
    {/* Eyes of Pure Sunlight */}
    <circle cx="25" cy="30" r="3.5" fill="#f59e0b" />
    <circle cx="25" cy="30" r="1.5" fill="#ffffff" />
    <circle cx="39" cy="30" r="3.5" fill="#f59e0b" />
    <circle cx="39" cy="30" r="1.5" fill="#ffffff" />
  </svg>
);
