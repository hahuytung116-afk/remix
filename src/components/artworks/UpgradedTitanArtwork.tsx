import React from 'react';
import { ArtworkProps } from './CommonArtworks';

// 🤖⚡🔥 Upgraded Rage Titan Defender (Overhauled Quantum/TV Armored Vanguard in Berserk Fury)
export const UpgradedRageTitanArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      {/* Cataclysmic Rage Aura Background */}
      <radialGradient id="titanRageBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#1e1b4b" />
        <stop offset="45%" stopColor="#0f172a" />
        <stop offset="85%" stopColor="#450a0a" />
        <stop offset="100%" stopColor="#000000" />
      </radialGradient>

      {/* Plasma Energy Vent Overload */}
      <linearGradient id="overloadPlasma" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00f0ff" />
        <stop offset="35%" stopColor="#38bdf8" />
        <stop offset="70%" stopColor="#f43f5e" />
        <stop offset="100%" stopColor="#ea580c" />
      </linearGradient>

      {/* TV Screen Visor Fury Wave */}
      <linearGradient id="tvScreenRage" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ff0055" />
        <stop offset="50%" stopColor="#990022" />
        <stop offset="100%" stopColor="#ff1100" />
      </linearGradient>

      {/* Heavy Steel Armor Gradients */}
      <linearGradient id="titanPlateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#334155" />
        <stop offset="50%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#090d16" />
      </linearGradient>
    </defs>

    {/* Outer Heavy Shockwave Field */}
    <circle cx="32" cy="32" r="30" fill="url(#titanRageBg)" stroke="#ef4444" strokeWidth="2" />

    {/* Berserk Energy Shockwave Ripples (Rage Pulse) */}
    <circle cx="32" cy="32" r="27" stroke="#ea580c" strokeWidth="1.2" strokeDasharray="4,3" opacity="0.8" />
    <circle cx="32" cy="32" r="23" stroke="#00f0ff" strokeWidth="1" strokeDasharray="2,4" opacity="0.7" />

    {/* Crumbled Base Rubble & Twisted Metal Rebar at feet */}
    <g id="shattered-base-debris">
      <polygon points="4,58 16,52 22,60 10,63" fill="#1e293b" stroke="#64748b" strokeWidth="0.8" />
      <polygon points="42,54 54,50 60,58 48,62" fill="#1e293b" stroke="#64748b" strokeWidth="0.8" />
      {/* Severed Power Cable with Sparks */}
      <path d="M 6 56 Q 14 59 18 53" stroke="#f59e0b" strokeWidth="1.2" fill="none" />
      <circle cx="18" cy="53" r="1.5" fill="#ffffff" />
      <path d="M 58 54 Q 50 58 46 52" stroke="#00f0ff" strokeWidth="1.2" fill="none" />
      <circle cx="46" cy="52" r="1.5" fill="#ffffff" />
    </g>

    {/* Rear Plasma Thrusters / Exhaust Flames */}
    <polygon points="20,18 16,6 23,12" fill="#ea580c" />
    <polygon points="18,16 16,8 21,12" fill="#facc15" />
    <polygon points="44,18 48,6 41,12" fill="#ea580c" />
    <polygon points="46,16 48,8 43,12" fill="#facc15" />

    {/* Twin Heavy Shoulder Railcannons (New Upgrade!) */}
    {/* Left Railcannon */}
    <rect x="8" y="10" width="7" height="15" rx="1.5" fill="#0f172a" stroke="#00f0ff" strokeWidth="1.2" />
    <line x1="11.5" y1="6" x2="11.5" y2="12" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="11.5" cy="5" r="1.5" fill="#ffffff" />
    {/* Right Railcannon */}
    <rect x="49" y="10" width="7" height="15" rx="1.5" fill="#0f172a" stroke="#00f0ff" strokeWidth="1.2" />
    <line x1="52.5" y1="6" x2="52.5" y2="12" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="52.5" cy="5" r="1.5" fill="#ffffff" />

    {/* Reinforced Shoulder Pauldrons */}
    <polygon points="10,22 22,18 20,32 8,28" fill="url(#titanPlateGrad)" stroke="#38bdf8" strokeWidth="1.5" />
    <polygon points="54,22 42,18 44,32 56,28" fill="url(#titanPlateGrad)" stroke="#38bdf8" strokeWidth="1.5" />
    {/* Pauldron Spikes */}
    <polygon points="7,20 12,16 10,25" fill="#ef4444" stroke="#ff0055" strokeWidth="0.8" />
    <polygon points="57,20 52,16 54,25" fill="#ef4444" stroke="#ff0055" strokeWidth="0.8" />

    {/* Heavy Reinforced Armored Torso */}
    <path d="M 18 24 L 46 24 L 42 50 L 22 50 Z" fill="url(#titanPlateGrad)" stroke="#64748b" strokeWidth="1.5" />
    {/* Heavy Chest Blast Plates */}
    <polygon points="20,26 32,32 24,44 19,34" fill="#0f172a" stroke="#475569" strokeWidth="1" />
    <polygon points="44,26 32,32 40,44 45,34" fill="#0f172a" stroke="#475569" strokeWidth="1" />

    {/* Overcharged Quantum Core (Overclocking at 500%) */}
    <circle cx="32" cy="38" r="7" fill="#020617" stroke="#ff0055" strokeWidth="1.5" />
    <circle cx="32" cy="38" r="5" fill="url(#overloadPlasma)" />
    <circle cx="32" cy="38" r="2.5" fill="#ffffff" />
    {/* Core Radiation Vent Fins */}
    <line x1="32" y1="29" x2="32" y2="31" stroke="#00f0ff" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="32" y1="45" x2="32" y2="47" stroke="#00f0ff" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="23" y1="38" x2="25" y2="38" stroke="#ff0055" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="39" y1="38" x2="41" y2="38" stroke="#ff0055" strokeWidth="1.5" strokeLinecap="round" />

    {/* Titan Head with Upgraded TV Screen Holographic Helmet */}
    <rect x="23" y="11" width="18" height="15" rx="3" fill="#090d16" stroke="#38bdf8" strokeWidth="1.5" />
    {/* TV Screen Visor */}
    <rect x="25" y="13" width="14" height="11" rx="1.5" fill="url(#tvScreenRage)" stroke="#ff0055" strokeWidth="1" />
    {/* TV Screen Glitch Lines & Scanlines */}
    <line x1="25" y1="16" x2="39" y2="16" stroke="#ff6688" strokeWidth="0.5" opacity="0.7" />
    <line x1="25" y1="19" x2="39" y2="19" stroke="#ff6688" strokeWidth="0.5" opacity="0.7" />
    {/* Blazing Digital Rage Optics on TV Visor */}
    <polygon points="27,15 31,18 27,20" fill="#ffffff" />
    <polygon points="37,15 33,18 37,20" fill="#ffffff" />
    {/* Roaring Digital Mouth Grid on TV screen */}
    <path d="M 28 22 L 32 23 L 36 22" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" fill="none" />

    {/* Antenna / Communication Arrays */}
    <line x1="24" y1="11" x2="21" y2="5" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="21" cy="5" r="1.2" fill="#00f0ff" />
    <line x1="40" y1="11" x2="43" y2="5" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="43" cy="5" r="1.2" fill="#00f0ff" />

    {/* Massive Berserk Fist Thrusters (Left & Right Hands in combat strike) */}
    {/* Left Arm Hydraulics */}
    <line x1="16" y1="32" x2="6" y2="40" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
    <circle cx="6" cy="40" r="4.5" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
    <circle cx="6" cy="40" r="2" fill="#00f0ff" />
    {/* Energy Arc on Fist */}
    <path d="M 2 36 L 4 41 L 1 45" stroke="#00f0ff" strokeWidth="1.2" fill="none" />

    {/* Right Arm Hydraulics & Power Smasher */}
    <line x1="48" y1="32" x2="58" y2="40" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
    <circle cx="58" cy="40" r="4.5" fill="#1e293b" stroke="#ff0055" strokeWidth="1.5" />
    <circle cx="58" cy="40" r="2" fill="#ea580c" />
    {/* Energy Arc on Right Fist */}
    <path d="M 62 36 L 60 41 L 63 45" stroke="#ff0055" strokeWidth="1.2" fill="none" />

    {/* Heavy Hydraulic Leg Pistons */}
    <rect x="21" y="49" width="7" height="11" rx="1" fill="#1e293b" stroke="#475569" strokeWidth="1" />
    <rect x="36" y="49" width="7" height="11" rx="1" fill="#1e293b" stroke="#475569" strokeWidth="1" />
    {/* Armor Treads / Heavy Magnetic Boots */}
    <rect x="18" y="58" width="11" height="4" rx="1" fill="#0f172a" stroke="#64748b" strokeWidth="1" />
    <rect x="35" y="58" width="11" height="4" rx="1" fill="#0f172a" stroke="#64748b" strokeWidth="1" />
  </svg>
);
