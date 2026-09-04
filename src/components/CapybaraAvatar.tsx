import React from 'react';

export interface CapybaraAvatarProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'custom';
  className?: string;
  withYuzu?: boolean;
  withAura?: boolean;
  animated?: boolean;
  idleBreathing?: boolean;
  variant?: 'head' | 'full' | 'onsen';
  onClick?: (e: React.MouseEvent) => void;
}

const sizeMap = {
  xs: 'w-4 h-4 text-xs',
  sm: 'w-6 h-6 text-sm',
  md: 'w-8 h-8 text-base',
  lg: 'w-12 h-12 text-xl',
  xl: 'w-16 h-16 text-3xl',
  '2xl': 'w-24 h-24 text-5xl',
  custom: '',
};

export const CapybaraAvatar: React.FC<CapybaraAvatarProps> = ({
  size = 'md',
  className = '',
  withYuzu = true,
  withAura = false,
  animated = false,
  idleBreathing = true,
  variant = 'head',
  onClick,
}) => {
  const sizeClass = size !== 'custom' ? sizeMap[size] : '';

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center select-none ${sizeClass} ${className} ${
        animated ? 'hover:scale-110 transition-transform duration-300' : ''
      } ${idleBreathing ? 'animate-idle-breathing' : ''}`}
      title="Capybara (The Chillful - Pure Zen Entity)"
    >
      {/* Optional Zen Glow Aura */}
      {withAura && (
        <div className="absolute inset-0 rounded-full bg-lime-400/25 blur-md animate-pulse pointer-events-none" />
      )}

      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-sm overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Fur Gradient - Warm Chestnut & Caramel tones */}
          <linearGradient id="capyFur" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#b45309" />
            <stop offset="50%" stopColor="#92400e" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>

          {/* Snout Gradient - Deep Dark Chocolate */}
          <linearGradient id="capySnout" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5c2605" />
            <stop offset="100%" stopColor="#3f1802" />
          </linearGradient>

          {/* Yuzu Orange Gradient */}
          <linearGradient id="yuzuGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="60%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>

          {/* Leaf Gradient */}
          <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>

          {/* Inner Ear Gradient */}
          <linearGradient id="earInner" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#9a3412" />
            <stop offset="100%" stopColor="#431407" />
          </linearGradient>
        </defs>

        {/* 1. EARS (Rounded, characteristic capybara ears sitting back-high on head) */}
        {/* Left Ear */}
        <path
          d="M 18,34 C 13,26 18,17 27,21 C 30,23 29,32 23,36 Z"
          fill="#78350f"
          stroke="#451a03"
          strokeWidth="2"
        />
        <path
          d="M 19,31 C 16,26 19,21 24,23 C 26,24 25,30 21,33 Z"
          fill="url(#earInner)"
        />

        {/* Right Ear */}
        <path
          d="M 82,34 C 87,26 82,17 73,21 C 70,23 71,32 77,36 Z"
          fill="#78350f"
          stroke="#451a03"
          strokeWidth="2"
        />
        <path
          d="M 81,31 C 84,26 81,21 76,23 C 74,24 75,30 79,33 Z"
          fill="url(#earInner)"
        />

        {/* 2. CAPYBARA HEAD (Iconic rectangular, boxy & stout silhouette) */}
        <path
          d="M 24,30 C 35,28 65,28 76,30 C 85,32 88,44 88,60 C 88,78 82,88 68,90 C 58,91 42,91 32,90 C 18,88 12,78 12,60 C 12,44 15,32 24,30 Z"
          fill="url(#capyFur)"
          stroke="#451a03"
          strokeWidth="2.5"
        />

        {/* Subtle Cheek / Fur Highlights */}
        <path
          d="M 20,40 C 22,35 28,33 36,33"
          stroke="#d97706"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.4"
        />

        {/* 3. CAPYBARA SNOUT (Signature wide, blunt, dark chocolate muzzle) */}
        <path
          d="M 26,56 C 36,53 64,53 74,56 C 81,60 81,84 71,87 C 60,89 40,89 29,87 C 19,84 19,60 26,56 Z"
          fill="url(#capySnout)"
          stroke="#260e02"
          strokeWidth="2"
        />

        {/* 4. NOSTRILS & MOUTH */}
        {/* Left Nostril */}
        <ellipse cx="40" cy="67" rx="3.5" ry="2" fill="#170901" transform="rotate(-10 40 67)" />
        {/* Right Nostril */}
        <ellipse cx="60" cy="67" rx="3.5" ry="2" fill="#170901" transform="rotate(10 60 67)" />
        
        {/* Cute Philtrum & Serene Zen Mouth */}
        <path d="M 50,70 L 50,76" stroke="#170901" strokeWidth="2" strokeLinecap="round" />
        <path
          d="M 42,76 C 46,78 49,78 50,76 C 51,78 54,78 58,76"
          stroke="#170901"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />

        {/* 5. ULTRA-CHILL ZEN EYES (The peaceful, sleepy, horizontal slit expression) */}
        {/* Left Eye */}
        <path
          d="M 23,49 C 27,47 34,47 37,50"
          stroke="#1e293b"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        {/* Tiny lower eyelid crease */}
        <path
          d="M 25,53 C 28,54 32,54 35,53"
          stroke="#78350f"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.7"
        />

        {/* Right Eye */}
        <path
          d="M 77,49 C 73,47 66,47 63,50"
          stroke="#1e293b"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        {/* Tiny lower eyelid crease */}
        <path
          d="M 75,53 C 72,54 68,54 65,53"
          stroke="#78350f"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.7"
        />

        {/* Cute zen cheek blush */}
        <ellipse cx="22" cy="62" rx="4" ry="2.5" fill="#f43f5e" opacity="0.25" />
        <ellipse cx="78" cy="62" rx="4" ry="2.5" fill="#f43f5e" opacity="0.25" />

        {/* 6. SIGNATURE YUZU / ORANGE ON HEAD */}
        {withYuzu && (
          <g className={animated ? 'animate-bounce' : ''}>
            {/* Shadow under yuzu on head */}
            <ellipse cx="50" cy="27" rx="12" ry="3" fill="#451a03" opacity="0.5" />

            {/* The Yuzu / Orange fruit */}
            <circle
              cx="50"
              cy="17"
              r="12"
              fill="url(#yuzuGrad)"
              stroke="#c2410c"
              strokeWidth="1.5"
            />
            {/* Orange skin dimple */}
            <circle cx="50" cy="7" r="1.5" fill="#c2410c" />

            {/* Green Leaf */}
            <path
              d="M 50,7 C 56,2 66,4 67,11 C 61,12 54,11 50,7 Z"
              fill="url(#leafGrad)"
              stroke="#15803d"
              strokeWidth="1"
            />
            {/* Leaf stem */}
            <path
              d="M 50,7 C 49,4 47,3 45,3"
              stroke="#15803d"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </g>
        )}
      </svg>
    </div>
  );
};

export default CapybaraAvatar;
