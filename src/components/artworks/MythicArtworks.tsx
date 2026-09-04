import React from 'react';
import { ArtworkProps } from './CommonArtworks';

// 🦖 22. Tyrannosaurus Rex
export const TRexArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="url(#trexBg)" />
    <defs>
      <radialGradient id="trexBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#ef4444" />
        <stop offset="100%" stopColor="#450a0a" />
      </radialGradient>
    </defs>
    {/* Scaly Head Profile */}
    <path d="M 14 36 L 18 16 L 36 12 L 52 24 L 54 44 L 38 42 L 32 48 L 18 46 Z" fill="#b91c1c" stroke="#450a0a" strokeWidth="2" />
    {/* Eyebrow Ridge */}
    <path d="M 22 18 Q 30 14 36 18" stroke="#7f1d1d" strokeWidth="3" strokeLinecap="round" />
    {/* Fierce Amber Saurian Eye */}
    <circle cx="30" cy="22" r="4.5" fill="#facc15" stroke="#450a0a" strokeWidth="1" />
    <ellipse cx="30" cy="22" rx="1.2" ry="3.5" fill="#000000" />
    {/* Giant Jaws & Razor Sharp Teeth */}
    <path d="M 52 34 L 28 36 L 24 40 L 52 42" stroke="#450a0a" strokeWidth="1.5" fill="#450a0a" />
    {/* Teeth */}
    <polygon points="34,34 36,38 38,34" fill="#ffffff" />
    <polygon points="40,34 42,39 44,34" fill="#ffffff" />
    <polygon points="46,34 48,39 50,34" fill="#ffffff" />
    <polygon points="36,42 38,37 40,42" fill="#ffffff" />
    <polygon points="42,42 44,37 46,42" fill="#ffffff" />
    {/* Nostril */}
    <ellipse cx="48" cy="26" rx="2" ry="1.5" fill="#450a0a" />
  </svg>
);

// 🦅🔥 23. Solar Phoenix
export const PhoenixArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="url(#phxBg)" />
    <defs>
      <radialGradient id="phxBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="60%" stopColor="#dc2626" />
        <stop offset="100%" stopColor="#450a0a" />
      </radialGradient>
    </defs>
    {/* Blazing Flame Wings / Corona */}
    <path d="M 32 4 Q 18 16 10 32 Q 22 28 28 36 Q 16 46 8 56 Q 28 50 32 44 Q 36 50 56 56 Q 48 46 36 36 Q 42 28 54 32 Q 46 16 32 4 Z" fill="#f97316" stroke="#fbbf24" strokeWidth="1.5" />
    {/* Head */}
    <ellipse cx="32" cy="26" rx="11" ry="13" fill="#fef08a" stroke="#b45309" strokeWidth="1.5" />
    {/* Crown of Solar Flames */}
    <polygon points="32,6 28,16 36,16" fill="#ffffff" />
    <polygon points="24,10 24,18 30,18" fill="#fbbf24" />
    <polygon points="40,10 40,18 34,18" fill="#fbbf24" />
    {/* Golden Beak */}
    <polygon points="32,38 27,29 37,29" fill="#ea580c" stroke="#7c2d12" strokeWidth="1" />
    {/* Glowing Incandescent Eyes */}
    <circle cx="26" cy="24" r="3" fill="#ffffff" stroke="#ea580c" strokeWidth="1" />
    <circle cx="38" cy="24" r="3" fill="#ffffff" stroke="#ea580c" strokeWidth="1" />
  </svg>
);

// 🐉 24. Crimson Wyrm Dragon
export const DragonArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="url(#dragBg)" />
    <defs>
      <radialGradient id="dragBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#dc2626" />
        <stop offset="100%" stopColor="#1e1b4b" />
      </radialGradient>
    </defs>
    {/* Dual Swept-back Draconic Horns */}
    <path d="M 22 22 Q 10 12 6 2 Q 18 12 26 16 Z" fill="#facc15" stroke="#a16207" strokeWidth="1.5" />
    <path d="M 42 22 Q 54 12 58 2 Q 46 12 38 16 Z" fill="#facc15" stroke="#a16207" strokeWidth="1.5" />
    {/* Dragon Head */}
    <polygon points="32,56 12,30 20,16 44,16 52,30" fill="#991b1b" stroke="#450a0a" strokeWidth="2" />
    {/* Center Horn / Frill */}
    <polygon points="32,10 28,18 36,18" fill="#facc15" />
    {/* Glowing Molten Eyes */}
    <polygon points="20,28 27,24 26,32" fill="#fbbf24" />
    <polygon points="44,28 37,24 38,32" fill="#fbbf24" />
    {/* Molten Nostrils / Smoke */}
    <circle cx="28" cy="48" r="2" fill="#f97316" />
    <circle cx="36" cy="48" r="2" fill="#f97316" />
    {/* Dragon Scales */}
    <path d="M 28 24 Q 32 28 36 24 M 26 34 Q 32 38 38 34" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// 🐍👑 25. Stone Basilisk
export const BasiliskArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="url(#basilBg)" />
    <defs>
      <radialGradient id="basilBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#064e3b" />
      </radialGradient>
    </defs>
    {/* Crown of Stone Spikes */}
    <polygon points="32,4 27,18 37,18" fill="#fde047" stroke="#854d0e" strokeWidth="1" />
    <polygon points="20,8 20,20 28,20" fill="#a3e635" stroke="#365314" strokeWidth="1" />
    <polygon points="44,8 44,20 36,20" fill="#a3e635" stroke="#365314" strokeWidth="1" />
    {/* Scaly Serpent Head */}
    <ellipse cx="32" cy="34" rx="18" ry="17" fill="#047857" stroke="#064e3b" strokeWidth="2" />
    {/* Petrifying Gold Eyes with Slit Pupil */}
    <circle cx="23" cy="30" r="5.5" fill="#facc15" stroke="#713f12" strokeWidth="1.5" />
    <line x1="23" y1="25" x2="23" y2="35" stroke="#000000" strokeWidth="2.5" />
    <circle cx="41" cy="30" r="5.5" fill="#facc15" stroke="#713f12" strokeWidth="1.5" />
    <line x1="41" y1="25" x2="41" y2="35" stroke="#000000" strokeWidth="2.5" />
    {/* Venom Fangs */}
    <polygon points="26,44 28,52 30,44" fill="#a7f3d0" />
    <polygon points="38,44 36,52 34,44" fill="#a7f3d0" />
  </svg>
);

// 🦁🦅 26. Mythic Chimera
export const ChimeraArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="url(#chimeraBg)" />
    <defs>
      <radialGradient id="chimeraBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="50%" stopColor="#7c3aed" />
        <stop offset="100%" stopColor="#1e1b4b" />
      </radialGradient>
    </defs>
    {/* Dragon Horns & Goat Horns */}
    <path d="M 18 18 Q 8 6 12 2 Q 18 8 24 16 Z" fill="#c084fc" stroke="#581c87" strokeWidth="1" />
    <path d="M 46 18 Q 56 6 52 2 Q 46 8 40 16 Z" fill="#c084fc" stroke="#581c87" strokeWidth="1" />
    {/* Lion Mane of Purple Flame */}
    <ellipse cx="32" cy="34" rx="22" ry="20" fill="#6d28d9" stroke="#4c1d95" strokeWidth="1.5" />
    {/* Central Beast Head */}
    <ellipse cx="32" cy="34" rx="15" ry="14" fill="#f59e0b" stroke="#78350f" strokeWidth="1.5" />
    {/* Triple Glowing Eyes */}
    <circle cx="23" cy="28" r="3" fill="#ef4444" />
    <circle cx="41" cy="28" r="3" fill="#ef4444" />
    <circle cx="32" cy="22" r="2.5" fill="#38bdf8" />
    {/* Muzzle with Serpent Fangs */}
    <ellipse cx="32" cy="40" rx="9" ry="6" fill="#fde68a" />
    <polygon points="28,42 30,48 32,42" fill="#ffffff" />
    <polygon points="36,42 34,48 32,42" fill="#ffffff" />
  </svg>
);

// 🦅⚡ 27. Storm Griffin
export const GriffinArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="url(#griffBg)" />
    <defs>
      <radialGradient id="griffBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fde047" />
        <stop offset="60%" stopColor="#0284c7" />
        <stop offset="100%" stopColor="#0f172a" />
      </radialGradient>
    </defs>
    {/* Lion Ears & Eagle Crest */}
    <polygon points="14,20 8,6 22,14" fill="#d97706" stroke="#78350f" strokeWidth="1" />
    <polygon points="50,20 56,6 42,14" fill="#d97706" stroke="#78350f" strokeWidth="1" />
    <polygon points="32,2 28,14 36,14" fill="#38bdf8" />
    {/* Head */}
    <ellipse cx="32" cy="28" rx="18" ry="16" fill="#f8fafc" stroke="#0284c7" strokeWidth="1.5" />
    {/* Golden Lightning Beak */}
    <path d="M 22 30 C 32 26, 42 30, 42 40 C 36 52, 32 54, 32 54 C 32 54, 28 52, 22 40 Z" fill="#eab308" stroke="#a16207" strokeWidth="1.5" />
    {/* Glowing Electric Cyan Eyes */}
    <circle cx="22" cy="24" r="4.5" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
    <circle cx="22" cy="24" r="2" fill="#ffffff" />
    <circle cx="42" cy="24" r="4.5" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
    <circle cx="42" cy="24" r="2" fill="#ffffff" />
  </svg>
);

// 🐙🌊 28. Abyssal Kraken
export const KrakenArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="url(#krakenBg)" />
    <defs>
      <radialGradient id="krakenBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#06b6d4" />
        <stop offset="100%" stopColor="#083344" />
      </radialGradient>
    </defs>
    {/* Swirling Deep Tentacles */}
    <path d="M 12 36 Q 4 48 10 58 Q 16 54 18 42" stroke="#0891b2" strokeWidth="4.5" strokeLinecap="round" fill="none" />
    <path d="M 24 38 Q 20 54 26 60 Q 30 52 28 42" stroke="#0891b2" strokeWidth="4.5" strokeLinecap="round" fill="none" />
    <path d="M 52 36 Q 60 48 54 58 Q 48 54 46 42" stroke="#0891b2" strokeWidth="4.5" strokeLinecap="round" fill="none" />
    <path d="M 40 38 Q 44 54 38 60 Q 34 52 36 42" stroke="#0891b2" strokeWidth="4.5" strokeLinecap="round" fill="none" />
    {/* Suction Cups */}
    <circle cx="8" cy="52" r="1.5" fill="#67e8f9" />
    <circle cx="56" cy="52" r="1.5" fill="#67e8f9" />
    {/* Dome Mantle */}
    <ellipse cx="32" cy="24" rx="19" ry="18" fill="#155e75" stroke="#083344" strokeWidth="2" />
    {/* Hypnotic Glowing Bioluminescent Eyes */}
    <ellipse cx="23" cy="28" rx="4.5" ry="3.5" fill="#67e8f9" stroke="#164e63" strokeWidth="1" />
    <circle cx="23" cy="28" r="1.5" fill="#083344" />
    <ellipse cx="41" cy="28" rx="4.5" ry="3.5" fill="#67e8f9" stroke="#164e63" strokeWidth="1" />
    <circle cx="41" cy="28" r="1.5" fill="#083344" />
  </svg>
);

// 🐉🧪 29. Multi-headed Hydra
export const HydraArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="url(#hydraBg)" />
    <defs>
      <radialGradient id="hydraBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#22c55e" />
        <stop offset="100%" stopColor="#052e16" />
      </radialGradient>
    </defs>
    {/* Left Serpent Neck & Head */}
    <path d="M 28 46 Q 16 36 16 24" stroke="#15803d" strokeWidth="4" strokeLinecap="round" fill="none" />
    <circle cx="16" cy="20" r="7" fill="#16a34a" stroke="#14532d" strokeWidth="1.5" />
    <circle cx="14" cy="18" r="1.8" fill="#facc15" />
    <circle cx="18" cy="18" r="1.8" fill="#facc15" />
    {/* Right Serpent Neck & Head */}
    <path d="M 36 46 Q 48 36 48 24" stroke="#15803d" strokeWidth="4" strokeLinecap="round" fill="none" />
    <circle cx="48" cy="20" r="7" fill="#16a34a" stroke="#14532d" strokeWidth="1.5" />
    <circle cx="46" cy="18" r="1.8" fill="#facc15" />
    <circle cx="50" cy="18" r="1.8" fill="#facc15" />
    {/* Central Apex Dragon Head */}
    <path d="M 32 50 L 32 28" stroke="#166534" strokeWidth="6" strokeLinecap="round" fill="none" />
    <polygon points="32,8 22,24 42,24" fill="#22c55e" stroke="#14532d" strokeWidth="2" />
    <polygon points="26,20 28,18 29,22" fill="#ef4444" />
    <polygon points="38,20 36,18 35,22" fill="#ef4444" />
    {/* Dripping Venom */}
    <circle cx="32" cy="30" r="2" fill="#86efac" />
  </svg>
);
