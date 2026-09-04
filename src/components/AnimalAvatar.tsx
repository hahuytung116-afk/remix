import React from 'react';
import { Animal } from '../types';
import { ANIMALS } from '../constants';
import CapybaraAvatar from './CapybaraAvatar';
import UnitArtwork from './artworks/UnitArtwork';
import RarityParticleEffect from './RarityParticleEffect';

export interface AnimalAvatarProps {
  animal?: Animal | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'custom';
  className?: string;
  withAura?: boolean;
  withParticles?: boolean;
  animated?: boolean;
  idleFloat?: boolean;
  idleBreathing?: boolean;
  fallbackText?: string;
}

const sizeDimensionsMap = {
  xs: 'w-5 h-5',
  sm: 'w-7 h-7',
  md: 'w-9 h-9',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
  '2xl': 'w-24 h-24',
  custom: 'w-full h-full',
};

export const AnimalAvatar: React.FC<AnimalAvatarProps> = ({
  animal,
  size = 'md',
  className = '',
  withAura = false,
  withParticles = false,
  animated = false,
  idleFloat = false,
  idleBreathing = true,
  fallbackText,
}) => {
  const animalObj: Animal | undefined = typeof animal === 'string'
    ? ANIMALS.find(a => a.id === animal)
    : animal;

  const animalId = animalObj?.id || (typeof animal === 'string' ? animal : '');
  const rarity = animalObj?.rarity || 'Common';

  // 🍊 ACTUAL AUTHENTIC CAPYBARA
  if (animalId === 'capybara' || animalObj?.rarity === 'The Chillful') {
    return (
      <div className={`relative inline-flex items-center justify-center ${idleBreathing ? 'animate-idle-breathing' : ''}`}>
        {withParticles && (
          <RarityParticleEffect rarity="The Chillful" color="#f59e0b" size={size} />
        )}
        <CapybaraAvatar
          size={size}
          className={className}
          withYuzu={true}
          withAura={withAura}
          animated={animated}
          idleBreathing={idleBreathing}
        />
      </div>
    );
  }

  const dimensionClass = size !== 'custom' ? sizeDimensionsMap[size] : '';
  const emoji = animalObj?.emoji || fallbackText || animalObj?.name?.[0] || '🐾';

  return (
    <div
      className={`inline-flex items-center justify-center relative flex-shrink-0 transition-transform duration-300 ease-out ${dimensionClass} ${className} ${
        animated ? 'hover:scale-115 active:scale-95' : ''
      } ${idleFloat ? 'animate-bounce-subtle' : ''}`}
    >
      {/* Dynamic Rarity Particles Overlay */}
      {withParticles && (
        <RarityParticleEffect rarity={rarity} color={animalObj?.color} size={size} />
      )}

      {animalId ? (
        <div className={`w-full h-full flex items-center justify-center transition-all duration-300 transform group-hover:scale-110 group-hover:-translate-y-0.5 ${
          idleBreathing ? 'animate-idle-breathing' : ''
        }`}>
          <UnitArtwork 
            animalId={animalId} 
            className="w-full h-full drop-shadow-sm filter group-hover:drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] transition-all duration-300" 
            fallbackEmoji={emoji} 
          />
        </div>
      ) : (
        <span className={`select-none text-base transition-transform duration-300 group-hover:scale-115 ${
          idleBreathing ? 'animate-idle-breathing' : ''
        }`}>{emoji}</span>
      )}
      {withAura && animalObj?.color && (
        <div
          className="absolute inset-0 rounded-full blur-[6px] pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity duration-300 -z-10"
          style={{ backgroundColor: animalObj.color }}
        />
      )}
    </div>
  );
};

export default AnimalAvatar;


