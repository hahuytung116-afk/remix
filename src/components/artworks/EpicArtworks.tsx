import React from 'react';
import { ArtworkProps } from './CommonArtworks';

// 🦁 12. Majestic Lion
export const LionArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="url(#lionBg)" />
    <defs>
      <radialGradient id="lionBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#78350f" />
      </radialGradient>
      <radialGradient id="lionMane" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#d97706" />
        <stop offset="100%" stopColor="#451a03" />
      </radialGradient>
    </defs>
    {/* Giant Golden Mane */}
    <g fill="url(#lionMane)" stroke="#78350f" strokeWidth="1.5">
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const x = 32 + Math.cos(rad) * 22;
        const y = 32 + Math.sin(rad) * 22;
        return <circle key={i} cx={x} cy={y} r="9" />;
      })}
    </g>
    {/* Ears */}
    <circle cx="20" cy="18" r="5" fill="#fde047" stroke="#78350f" strokeWidth="1.5" />
    <circle cx="44" cy="18" r="5" fill="#fde047" stroke="#78350f" strokeWidth="1.5" />
    {/* Lion Face */}
    <ellipse cx="32" cy="35" rx="16" ry="15" fill="#facc15" stroke="#78350f" strokeWidth="1.5" />
    {/* Muzzle */}
    <ellipse cx="32" cy="42" rx="10" ry="7" fill="#fef08a" />
    {/* Noble Eyes */}
    <ellipse cx="25" cy="31" rx="3" ry="3.5" fill="#78350f" />
    <circle cx="24" cy="30" r="1" fill="#ffffff" />
    <ellipse cx="39" cy="31" rx="3" ry="3.5" fill="#78350f" />
    <circle cx="38" cy="30" r="1" fill="#ffffff" />
    {/* Nose & Whiskers */}
    <polygon points="32,41 28,37 36,37" fill="#451a03" />
    <path d="M 32 41 L 32 45 M 32 45 Q 28 47 26 45 M 32 45 Q 36 47 38 45" stroke="#451a03" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// 🐻 13. Grizzly Bear
export const BearArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="url(#bearBg)" />
    <defs>
      <radialGradient id="bearBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#92400e" />
        <stop offset="100%" stopColor="#292524" />
      </radialGradient>
    </defs>
    {/* Round Bear Ears */}
    <circle cx="16" cy="18" r="8" fill="#78350f" stroke="#451a03" strokeWidth="2" />
    <circle cx="16" cy="18" r="4.5" fill="#fed7aa" />
    <circle cx="48" cy="18" r="8" fill="#78350f" stroke="#451a03" strokeWidth="2" />
    <circle cx="48" cy="18" r="4.5" fill="#fed7aa" />
    {/* Massive Bear Head */}
    <ellipse cx="32" cy="36" rx="21" ry="19" fill="#78350f" stroke="#451a03" strokeWidth="2" />
    {/* Snout */}
    <ellipse cx="32" cy="43" rx="12" ry="9" fill="#d97706" />
    {/* Black Nose */}
    <ellipse cx="32" cy="40" rx="4.5" ry="3" fill="#1c1917" />
    <circle cx="31" cy="39" r="1" fill="#ffffff" />
    {/* Small Fierce Eyes */}
    <circle cx="23" cy="30" r="3" fill="#1c1917" />
    <circle cx="22" cy="29" r="1" fill="#ffffff" />
    <circle cx="41" cy="30" r="3" fill="#1c1917" />
    <circle cx="40" cy="29" r="1" fill="#ffffff" />
    {/* Jaw Line */}
    <path d="M 28 47 Q 32 50 36 47" stroke="#451a03" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// 🐊 14. Swamp Crocodile
export const CrocArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="url(#crocBg)" />
    <defs>
      <radialGradient id="crocBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#15803d" />
        <stop offset="100%" stopColor="#052e16" />
      </radialGradient>
    </defs>
    {/* Armored Back Ridges */}
    <polygon points="12,18 20,24 24,16 32,22 40,16 44,24 52,18 48,32 16,32" fill="#166534" stroke="#052e16" strokeWidth="1.5" />
    {/* Long Snout */}
    <path d="M 20 28 L 18 52 L 32 56 L 46 52 L 44 28 Z" fill="#22c55e" stroke="#14532d" strokeWidth="2" />
    {/* Nostrils */}
    <circle cx="27" cy="51" r="2" fill="#052e16" />
    <circle cx="37" cy="51" r="2" fill="#052e16" />
    {/* Protruding Razor Teeth */}
    <polygon points="20,40 23,43 23,40" fill="#ffffff" />
    <polygon points="44,40 41,43 41,40" fill="#ffffff" />
    <polygon points="20,46 23,49 23,46" fill="#ffffff" />
    <polygon points="44,46 41,49 41,46" fill="#ffffff" />
    {/* Predatory Slit Eyes atop head */}
    <ellipse cx="23" cy="24" rx="4.5" ry="3.5" fill="#facc15" stroke="#14532d" strokeWidth="1.5" />
    <line x1="23" y1="21" x2="23" y2="27" stroke="#052e16" strokeWidth="2" />
    <ellipse cx="41" cy="24" rx="4.5" ry="3.5" fill="#facc15" stroke="#14532d" strokeWidth="1.5" />
    <line x1="41" y1="21" x2="41" y2="27" stroke="#052e16" strokeWidth="2" />
  </svg>
);

// 🦏 15. Armored Rhino
export const RhinoArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="url(#rhinoBg)" />
    <defs>
      <radialGradient id="rhinoBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#334155" />
      </radialGradient>
    </defs>
    {/* Plated Rhino Head */}
    <polygon points="32,54 14,32 20,16 44,16 50,32" fill="#64748b" stroke="#1e293b" strokeWidth="2" />
    {/* Armor Plate Lines */}
    <path d="M 20 28 L 44 28 M 22 36 L 42 36" stroke="#334155" strokeWidth="2" />
    {/* Great Titanium Horn */}
    <polygon points="32,16 28,40 36,40" fill="#f8fafc" stroke="#475569" strokeWidth="1.5" />
    {/* Secondary Lower Horn */}
    <polygon points="32,38 29,48 35,48" fill="#e2e8f0" stroke="#475569" strokeWidth="1.5" />
    {/* Eyes */}
    <circle cx="20" cy="28" r="2.5" fill="#0f172a" />
    <circle cx="19" cy="27" r="0.8" fill="#ffffff" />
    <circle cx="44" cy="28" r="2.5" fill="#0f172a" />
    <circle cx="43" cy="27" r="0.8" fill="#ffffff" />
  </svg>
);

// 🦉 16. Snowy Owl
export const OwlArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="url(#owlBg)" />
    <defs>
      <radialGradient id="owlBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#0c4a6e" />
      </radialGradient>
    </defs>
    {/* Feather Horn Tufts */}
    <polygon points="16,22 10,8 24,18" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5" />
    <polygon points="48,22 54,8 40,18" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5" />
    {/* Body */}
    <ellipse cx="32" cy="38" rx="20" ry="19" fill="#f8fafc" stroke="#0284c7" strokeWidth="1.5" />
    {/* Giant Disc Eyes */}
    <circle cx="22" cy="30" r="9" fill="#fef08a" stroke="#d97706" strokeWidth="2" />
    <circle cx="22" cy="30" r="5" fill="#0f172a" />
    <circle cx="20" cy="28" r="1.8" fill="#ffffff" />
    <circle cx="42" cy="30" r="9" fill="#fef08a" stroke="#d97706" strokeWidth="2" />
    <circle cx="42" cy="30" r="5" fill="#0f172a" />
    <circle cx="40" cy="28" r="1.8" fill="#ffffff" />
    {/* Sharp Taloned Beak */}
    <polygon points="32,40 28,32 36,32" fill="#ea580c" stroke="#9a3412" strokeWidth="1" />
    {/* Feather Speckles */}
    <path d="M 24 46 Q 27 49 30 46 M 34 46 Q 37 49 40 46 M 29 51 Q 32 54 35 51" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
