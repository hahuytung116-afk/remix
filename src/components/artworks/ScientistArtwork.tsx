import React from 'react';
import { ArtworkProps } from './CommonArtworks';

// 🔬🥼🧪 Custom Artwork: Scientist Animals (Chief Animal Cyber-Biologist & Engineering Guild)
export const ScientistAnimalsArtwork: React.FC<ArtworkProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      {/* High-tech Lab Bay Background Gradient */}
      <radialGradient id="sciLabBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#0f172a" />
        <stop offset="60%" stopColor="#090d16" />
        <stop offset="100%" stopColor="#020617" />
      </radialGradient>

      {/* Holographic Diagnostic Glow */}
      <linearGradient id="holoGlow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
        <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.4" />
      </linearGradient>

      {/* Lab Coat Shading */}
      <linearGradient id="labCoatGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="80%" stopColor="#e2e8f0" />
        <stop offset="100%" stopColor="#cbd5e1" />
      </linearGradient>

      {/* Cyber Goggle Lenses */}
      <radialGradient id="goggleLens" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#67e8f9" />
        <stop offset="45%" stopColor="#06b6d4" />
        <stop offset="100%" stopColor="#0891b2" />
      </radialGradient>

      {/* Fur Shading */}
      <radialGradient id="owlFur" cx="50%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="60%" stopColor="#d97706" />
        <stop offset="100%" stopColor="#92400e" />
      </radialGradient>
    </defs>

    {/* Lab Outer Shield & Rim */}
    <circle cx="32" cy="32" r="30" fill="url(#sciLabBg)" stroke="#06b6d4" strokeWidth="1.5" />

    {/* Background Tech Matrix Grid & Warning Ring */}
    <circle cx="32" cy="32" r="27" stroke="#334155" strokeWidth="1" strokeDasharray="3,3" opacity="0.6" />
    <path d="M 6 32 H 14 M 50 32 H 58" stroke="#00f0ff" strokeWidth="1.2" opacity="0.7" />
    <path d="M 32 6 V 12 M 32 52 V 58" stroke="#00f0ff" strokeWidth="1.2" opacity="0.7" />

    {/* Floating Holographic Diagnostic Tablet in Background */}
    <rect x="39" y="10" width="18" height="15" rx="2" fill="#0369a1" fillOpacity="0.3" stroke="#38bdf8" strokeWidth="1" />
    <line x1="42" y1="14" x2="54" y2="14" stroke="#38bdf8" strokeWidth="1" />
    <path d="M 42 18 L 45 20 L 48 16 L 51 22 L 54 17" stroke="#ef4444" strokeWidth="1" fill="none" />
    <circle cx="53" cy="12" r="1" fill="#f43f5e" />

    {/* Animal Ears (Wise Cyber-Owl / Fox Tufts) */}
    {/* Left Ear */}
    <polygon points="18,12 24,2 26,14" fill="#92400e" stroke="#f59e0b" strokeWidth="1" />
    <polygon points="20,11 24,5 25,12" fill="#fde68a" />
    {/* Right Ear */}
    <polygon points="46,12 40,2 38,14" fill="#92400e" stroke="#f59e0b" strokeWidth="1" />
    <polygon points="44,11 40,5 39,12" fill="#fde68a" />

    {/* Head & Feathery Cheeks */}
    <ellipse cx="32" cy="24" rx="16" ry="14" fill="url(#owlFur)" stroke="#b45309" strokeWidth="1.2" />
    {/* Cheek Tufts */}
    <polygon points="15,26 9,30 16,33" fill="#f59e0b" />
    <polygon points="49,26 55,30 48,33" fill="#f59e0b" />

    {/* Stethoscope / Cybernetic Bio-Sensor Band around Neck */}
    <path d="M 22 36 Q 32 46 42 36" stroke="#06b6d4" strokeWidth="2" fill="none" strokeLinecap="round" />
    <circle cx="32" cy="43" r="3" fill="#0e7490" stroke="#67e8f9" strokeWidth="1.2" />
    <circle cx="32" cy="43" r="1.2" fill="#ffffff" />

    {/* Pristine High-Collar Lab Coat & Body */}
    <path d="M 17 38 L 14 60 L 50 60 L 47 38 Z" fill="url(#labCoatGrad)" stroke="#94a3b8" strokeWidth="1.2" />
    {/* Lab Coat Lapels */}
    <polygon points="25,37 32,48 27,58 20,40" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
    <polygon points="39,37 32,48 37,58 44,40" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
    {/* Shirt & Cyan Diagnostic Tie */}
    <polygon points="30,37 34,37 33,46 31,46" fill="#0284c7" />
    <line x1="32" y1="46" x2="32" y2="58" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" />

    {/* Animal Face Details: Beak / Snout */}
    <polygon points="30,26 34,26 32,31" fill="#d97706" stroke="#78350f" strokeWidth="1" />
    <line x1="30" y1="32" x2="34" y2="32" stroke="#78350f" strokeWidth="0.8" />

    {/* Cybernetic High-Tech Goggles & Visor Spectacles */}
    {/* Goggle Bridge */}
    <rect x="29" y="19" width="6" height="2" fill="#334155" stroke="#00f0ff" strokeWidth="0.8" />
    {/* Left Goggle */}
    <circle cx="23" cy="20" r="7" fill="url(#goggleLens)" stroke="#0f172a" strokeWidth="2" />
    <circle cx="23" cy="20" r="5" stroke="#ffffff" strokeWidth="0.8" strokeDasharray="2,2" fill="none" opacity="0.8" />
    <circle cx="21" cy="18" r="1.8" fill="#ffffff" />
    <circle cx="24" cy="21" r="0.8" fill="#ffffff" />
    {/* Reticle HUD on Left Eye */}
    <path d="M 23 16 V 18 M 23 22 V 24 M 19 20 H 21 M 25 20 H 27" stroke="#ffffff" strokeWidth="0.7" opacity="0.9" />

    {/* Right Goggle */}
    <circle cx="41" cy="20" r="7" fill="url(#goggleLens)" stroke="#0f172a" strokeWidth="2" />
    <circle cx="41" cy="20" r="5" stroke="#ffffff" strokeWidth="0.8" strokeDasharray="2,2" fill="none" opacity="0.8" />
    <circle cx="39" cy="18" r="1.8" fill="#ffffff" />
    <circle cx="42" cy="21" r="0.8" fill="#ffffff" />

    {/* Goggle Strap extending around head */}
    <path d="M 16 20 L 8 22 M 48 20 L 56 22" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />

    {/* Paws Holding Holographic Repair Laser / Spanner Tool */}
    {/* Left Paw */}
    <ellipse cx="20" cy="50" rx="3.5" ry="3" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
    {/* Right Paw holding Nanite Syringe / Sonic Screwdriver */}
    <ellipse cx="44" cy="49" rx="3.5" ry="3" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
    <rect x="43" y="38" width="3" height="12" rx="1" fill="#0284c7" stroke="#38bdf8" strokeWidth="0.8" />
    <polygon points="44.5,33 46,38 43,38" fill="#38bdf8" />
    {/* Sonic Laser Beam emitting from tool */}
    <line x1="44.5" y1="33" x2="44.5" y2="28" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="44.5" cy="28" r="1.5" fill="#ffffff" />

    {/* Junior Assistant Tech Mouse / Robot Drone in bottom-left */}
    <g id="assistant-drone" transform="translate(4, 38)">
      {/* Mini Assistant Robot Dome */}
      <circle cx="8" cy="8" r="7" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" />
      <circle cx="8" cy="8" r="4" fill="#0284c7" />
      <circle cx="8" cy="8" r="2" fill="#67e8f9" />
      {/* Mini Antenna */}
      <line x1="8" y1="1" x2="8" y2="-2" stroke="#38bdf8" strokeWidth="1" strokeLinecap="round" />
      <circle cx="8" cy="-3" r="1" fill="#ef4444" />
      {/* Hover Thruster Spark */}
      <polygon points="6,15 10,15 8,19" fill="#06b6d4" />
    </g>

    {/* ID Badge on Coat */}
    <rect x="23" y="44" width="4" height="6" rx="0.5" fill="#f8fafc" stroke="#64748b" strokeWidth="0.6" />
    <circle cx="25" cy="46" r="1" fill="#0284c7" />
    <line x1="24" y1="48" x2="26" y2="48" stroke="#94a3b8" strokeWidth="0.6" />
  </svg>
);
