import React from 'react';
import { ArtworkProps } from './CommonArtworks';

// 🦣 17. Woolly Mammoth (Ancient Extinct)
export const MammothArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="url(#mammothBg)" />
    <defs>
      <radialGradient id="mammothBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#78350f" />
        <stop offset="100%" stopColor="#1c1917" />
      </radialGradient>
    </defs>
    {/* Mammoth Head & Shaggy Hair */}
    <ellipse cx="32" cy="28" rx="18" ry="16" fill="#451a03" stroke="#1c1917" strokeWidth="2" />
    <path d="M 20 18 L 24 10 L 28 18 L 32 8 L 36 18 L 40 10 L 44 18" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
    {/* Mammoth Trunk */}
    <path d="M 32 28 Q 32 46 26 50 Q 22 52 20 48" stroke="#78350f" strokeWidth="6" strokeLinecap="round" fill="none" />
    {/* Giant Curved Ivory Tusks */}
    <path d="M 24 38 Q 8 44 6 26 Q 6 18 12 18" stroke="#fef3c7" strokeWidth="3.5" strokeLinecap="round" fill="none" />
    <path d="M 40 38 Q 56 44 58 26 Q 58 18 52 18" stroke="#fef3c7" strokeWidth="3.5" strokeLinecap="round" fill="none" />
    {/* Frost Breath / Ice crystals */}
    <circle cx="16" cy="48" r="1.5" fill="#38bdf8" />
    <circle cx="12" cy="52" r="2" fill="#bae6fd" />
    {/* Eyes */}
    <circle cx="23" cy="24" r="2.5" fill="#f59e0b" />
    <circle cx="41" cy="24" r="2.5" fill="#f59e0b" />
  </svg>
);

// 🐯 18. Smilodon (Saber-toothed Cat)
export const SmilodonArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="url(#smilodonBg)" />
    <defs>
      <radialGradient id="smilodonBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#ea580c" />
        <stop offset="100%" stopColor="#431407" />
      </radialGradient>
    </defs>
    {/* Ears */}
    <polygon points="16,24 10,8 24,16" fill="#c2410c" stroke="#431407" strokeWidth="1.5" />
    <polygon points="48,24 54,8 40,16" fill="#c2410c" stroke="#431407" strokeWidth="1.5" />
    {/* Head */}
    <ellipse cx="32" cy="34" rx="19" ry="17" fill="#f97316" stroke="#431407" strokeWidth="1.5" />
    {/* Tiger Stripes */}
    <path d="M 18 26 L 24 28 M 46 26 L 40 28 M 16 34 L 22 34 M 48 34 L 42 34" stroke="#431407" strokeWidth="2" strokeLinecap="round" />
    {/* Muzzle */}
    <ellipse cx="32" cy="40" rx="11" ry="8" fill="#ffedd5" />
    <polygon points="32,39 28,35 36,35" fill="#431407" />
    {/* MASSIVE Saber Fangs */}
    <polygon points="25,41 27,41 25,56" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
    <polygon points="39,41 37,41 39,56" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
    {/* Predatory Amber Eyes */}
    <polygon points="21,29 27,27 26,33" fill="#facc15" />
    <polygon points="43,29 37,27 38,33" fill="#facc15" />
  </svg>
);

// 🦤 19. Battle Dodo (Extinct Champion)
export const DodoArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="url(#dodoBg)" />
    <defs>
      <radialGradient id="dodoBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#a855f7" />
        <stop offset="100%" stopColor="#3b0764" />
      </radialGradient>
    </defs>
    {/* Body Plumes */}
    <ellipse cx="32" cy="38" rx="20" ry="17" fill="#c084fc" stroke="#581c87" strokeWidth="1.5" />
    {/* Tail Tufts */}
    <path d="M 12 36 Q 6 30 10 24 M 14 40 Q 6 42 10 48" stroke="#e9d5ff" strokeWidth="2.5" strokeLinecap="round" />
    {/* Head with Battle Crest */}
    <circle cx="34" cy="24" r="14" fill="#d8b4fe" stroke="#581c87" strokeWidth="1.5" />
    <polygon points="30,12 34,4 38,12" fill="#facc15" stroke="#a16207" strokeWidth="1" />
    {/* Giant Bulbous Hooked Dodo Beak */}
    <path d="M 32 26 C 42 26, 52 28, 54 36 C 54 44, 46 48, 42 42 C 40 38, 32 34, 32 30 Z" fill="#38bdf8" stroke="#0369a1" strokeWidth="1.5" />
    <ellipse cx="50" cy="38" rx="3" ry="3" fill="#facc15" />
    {/* Plucky Big Eye */}
    <circle cx="28" cy="22" r="4.5" fill="#fde047" stroke="#854d0e" strokeWidth="1" />
    <circle cx="28" cy="22" r="2.5" fill="#0f172a" />
    <circle cx="27" cy="21" r="1" fill="#ffffff" />
  </svg>
);

// 🦈 20. Megalodon (Apex Leviathan)
export const MegalodonArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="url(#megBg)" />
    <defs>
      <radialGradient id="megBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#0284c7" />
        <stop offset="100%" stopColor="#082f49" />
      </radialGradient>
    </defs>
    {/* Dorsal Fin */}
    <polygon points="32,4 26,20 38,20" fill="#0369a1" stroke="#082f49" strokeWidth="1.5" />
    {/* Giant Shark Jaws Outline */}
    <ellipse cx="32" cy="36" rx="22" ry="19" fill="#0284c7" stroke="#082f49" strokeWidth="2" />
    {/* Underbelly White */}
    <ellipse cx="32" cy="40" rx="16" ry="13" fill="#f8fafc" />
    {/* Terrifying Open Jaws with 3 Rows of Teeth */}
    <ellipse cx="32" cy="42" rx="11" ry="8" fill="#450a0a" stroke="#0f172a" strokeWidth="1.5" />
    {/* Upper Serrated Teeth */}
    <polygon points="24,37 26,41 28,37" fill="#ffffff" />
    <polygon points="28,37 30,42 32,37" fill="#ffffff" />
    <polygon points="32,37 34,42 36,37" fill="#ffffff" />
    <polygon points="36,37 38,41 40,37" fill="#ffffff" />
    {/* Lower Serrated Teeth */}
    <polygon points="25,47 27,43 29,47" fill="#ffffff" />
    <polygon points="30,47 32,42 34,47" fill="#ffffff" />
    <polygon points="35,47 37,43 39,47" fill="#ffffff" />
    {/* Pitch Black Oceanic Predator Eyes */}
    <circle cx="18" cy="28" r="3" fill="#000000" />
    <circle cx="46" cy="28" r="3" fill="#000000" />
    {/* Gills */}
    <path d="M 14 36 Q 16 38 14 40 M 11 36 Q 13 38 11 40" stroke="#0369a1" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M 50 36 Q 48 38 50 40 M 53 36 Q 51 38 53 40" stroke="#0369a1" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// 🦃 21. Terror Bird (Titanis Walleri)
export const TerrorBirdArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="url(#terrorBg)" />
    <defs>
      <radialGradient id="terrorBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#dc2626" />
        <stop offset="100%" stopColor="#450a0a" />
      </radialGradient>
    </defs>
    {/* Crimson Feather Crest */}
    <polygon points="22,14 18,2 26,10 32,2 38,10 46,2 42,14" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1.5" />
    {/* Heavy Skull */}
    <ellipse cx="32" cy="26" rx="16" ry="14" fill="#b91c1c" stroke="#7f1d1d" strokeWidth="1.5" />
    {/* Massive Axe Beak */}
    <path d="M 22 28 C 32 24, 44 26, 54 36 C 54 48, 42 54, 38 48 C 32 40, 24 38, 22 28 Z" fill="#fbbf24" stroke="#b45309" strokeWidth="2" />
    {/* Blood Hook */}
    <path d="M 54 36 Q 52 46 44 48" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" />
    {/* Fierce Bloodshot Eye */}
    <circle cx="26" cy="22" r="4.5" fill="#facc15" stroke="#7f1d1d" strokeWidth="1" />
    <circle cx="26" cy="22" r="2.2" fill="#7f1d1d" />
    <circle cx="25" cy="21" r="0.8" fill="#ffffff" />
  </svg>
);
