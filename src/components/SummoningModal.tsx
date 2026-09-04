import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Trophy, Zap, RefreshCw, CheckSquare, Square } from 'lucide-react';
import { Animal } from '../types';
import { ANIMALS, RARITY_WEIGHTS, FEATURED_MYTHICS, getFeaturedMythicsAtTime } from '../constants';
import { gameAudio } from '../utils/audio';
import { SummonCutsceneModal } from './SummonCutsceneModal';
import CapybaraAvatar from './CapybaraAvatar';
import AnimalAvatar from './AnimalAvatar';

interface RollResult {
  animal: Animal;
  isDuplicate: boolean;
  autoSold: boolean;
  dnaRefund: number;
}

interface SummoningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSummonComplete: (
    unlockedIds: string[], 
    finalSecretPity: number, 
    finalCelestialPity: number, 
    finalMysteryPity: number, 
    netDnaDiff: number, 
    rolledMysteryAnimal?: Animal,
    finalOriginalPity?: number,
    finalOverseerPity?: number,
    shardsSpent?: number,
    finalUnrivaledPity?: number,
    finalCapyPity?: number,
    capyCoinsSpent?: number
  ) => void;
  dna: number;
  shardsOfGods?: number;
  capyCoins?: number;
  secretPity: number;
  celestialPity: number;
  mysteryPity: number;
  originalPity?: number;
  overseerPity?: number;
  unrivaledPity?: number;
  capyPity?: number;
  ownedAnimals: string[];
  autoSellDuplicates: boolean;
  autoSellCommons: boolean;
  autoSellRares: boolean;
  autoSellEpics: boolean;
  autoSellLegendaries: boolean;
  setAutoSellDuplicates: (val: boolean) => void;
  setAutoSellCommons: (val: boolean) => void;
  setAutoSellRares: (val: boolean) => void;
  setAutoSellEpics: (val: boolean) => void;
  setAutoSellLegendaries: (val: boolean) => void;
  isDevMode?: boolean;
  isGigaGacha?: boolean;
  isSandbox?: boolean;
  disableSummonCutscene?: boolean;
}

const REFUND_VALUES: Record<string, number> = {
  Common: 50,
  Rare: 150,
  Epic: 500,
  Legendary: 2000,
  Mythic: 10000,
  Secret: 50000,
  Celestial: 250000,
  Unrivaled: 1000000,
  '???': 5000000,
  Original: 25000000,
  'The Chillful': 25000000,
  Overseer: 100000000,
  Arcane: 500000000,
};

const ALTARS = {
  standard: {
    colorRGB: '124, 58, 237',
    name: 'Standard DNA Lab',
    cost: 250,
    weights: {
      Common: 40,
      Rare: 25,
      Epic: 14.893999,
      Legendary: 10,
      Mythic: 5,
      Secret: 5,
      Unrivaled: 0.1,
      Celestial: 0.005,
      '???': 0.001,
      Arcane: 0.000001,
    }
  },
  quantum: {
    colorRGB: '217, 119, 6',
    name: 'Primal Overlord Altar',
    cost: 2500,
    weights: {
      Common: 0,
      Rare: 10,
      Epic: 30,
      Legendary: 35,
      Mythic: 15,
      Secret: 8.48999,
      Unrivaled: 1.0,
      Celestial: 0.5,
      '???': 0.01,
      Arcane: 0.00001,
    }
  },
  ultra: {
    colorRGB: '6, 182, 212',
    name: 'Gods Altar',
    cost: 5,
    weights: {
      Secret: 40,
      Unrivaled: 24.999988,
      Celestial: 20,
      '???': 15,
      Original: 0.000009,
      Overseer: 0.000001,
      Arcane: 0.000002,
    }
  },
  capy: {
    colorRGB: '132, 204, 22',
    name: 'Capybara Summon Altar',
    cost: 5,
    weights: {
      Secret: 35,
      Unrivaled: 24.999988,
      Celestial: 20,
      '???': 15,
      'The Chillful': 0.000009,
      Original: 0.000009,
      Overseer: 0.000001,
      Arcane: 0.000002,
    }
  }
};

export const SummoningModal: React.FC<SummoningModalProps> = ({
  isOpen,
  onClose,
  onSummonComplete,
  dna,
  shardsOfGods = 0,
  capyCoins = 0,
  secretPity,
  celestialPity,
  mysteryPity,
  originalPity = 0,
  overseerPity = 0,
  unrivaledPity = 0,
  capyPity = 0,
  ownedAnimals,
  autoSellDuplicates,
  autoSellCommons,
  autoSellRares,
  autoSellEpics,
  autoSellLegendaries,
  setAutoSellDuplicates,
  setAutoSellCommons,
  setAutoSellRares,
  setAutoSellEpics,
  setAutoSellLegendaries,
  isDevMode = false,
  isGigaGacha = false,
  isSandbox = false,
  disableSummonCutscene = false,
}) => {
  const [modalTab, setModalTab] = useState<'chamber' | 'pity' | 'settings'>('chamber');
  const [altarType, setAltarType] = useState<'standard' | 'quantum' | 'ultra' | 'capy'>('standard');
  const [isSummoning, setIsSummoning] = useState(false);
  const [batchResults, setBatchResults] = useState<RollResult[] | null>(null);
  const [summonCountRolled, setSummonCountRolled] = useState(0);
  const [cutsceneData, setCutsceneData] = useState<{ isOpen: boolean; animals: Animal[] }>({ isOpen: false, animals: [] });
  const [isDevMenuOpen, setIsDevMenuOpen] = useState(false);

  const [timeMs, setTimeMs] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeMs(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentFeaturedMythics = getFeaturedMythicsAtTime(timeMs);

  const nextRotationTime = (Math.floor(timeMs / (20 * 60 * 1000)) + 1) * 20 * 60 * 1000;
  const msRemaining = nextRotationTime - timeMs;
  const min = Math.floor(msRemaining / (60 * 1000));
  const sec = Math.floor((msRemaining % (60 * 1000)) / 1000);

  const altar = ALTARS[altarType];
  const summonCost = altar.cost;
  const currencyAmount = altarType === 'ultra' ? (shardsOfGods ?? 0) : (altarType === 'capy' ? (capyCoins ?? 0) : dna);

  const runRollBatch = (count: number) => {
    if (currencyAmount < summonCost) return;
    const actualCount = Math.min(count, Math.min(Math.floor(currencyAmount / summonCost), 100));
    if (actualCount <= 0) return;

    setIsSummoning(true);
    setBatchResults(null);
    setSummonCountRolled(actualCount);

    let currentPity = secretPity;
    let currentCelPity = celestialPity;
    let currentMysteryPity = mysteryPity;
    let currentOriginalPity = originalPity ?? 0;
    let currentOverseerPity = overseerPity ?? 0;
    let currentUnrivaledPity = unrivaledPity ?? 0;
    let currentCapyPity = capyPity ?? 0;
    let shardsSpent = 0;
    let capyCoinsSpent = 0;
    let netDnaGain = 0;
    const currentUnlocked = [...ownedAnimals];
    const results: RollResult[] = [];

    for (let r = 0; r < actualCount; r++) {
      let selectedRarity: any = 'Common';
      let wasPityTriggered = false;
      let wasCelestialPityTriggered = false;
      let wasMysteryPityTriggered = false;
      let wasOriginalPityTriggered = false;
      let wasOverseerPityTriggered = false;
      let wasUnrivaledPityTriggered = false;
      let wasCapyPityTriggered = false;

      // Pure Raw Luck Check for Arcane (Has NO pity - raw luck only)
      const rawArcaneChance = isGigaGacha ? 0.005 : (altarType === 'ultra' || altarType === 'capy' ? 0.000002 : (altarType === 'quantum' ? 0.00001 : 0.000001));
      let isRawArcaneRolled = Math.random() < rawArcaneChance;

      if (isRawArcaneRolled) {
        selectedRarity = 'Arcane';
      } else if (altarType === 'ultra') {
        shardsSpent += summonCost;
        if (currentOverseerPity + 1 >= 20000) {
          selectedRarity = 'Overseer';
          wasOverseerPityTriggered = true;
        } else if (currentOriginalPity + 1 >= 15000) {
          selectedRarity = 'Original';
          wasOriginalPityTriggered = true;
        } else if (currentMysteryPity + 1 >= 1000) {
          selectedRarity = '???';
          wasMysteryPityTriggered = true;
        } else if (currentCelPity + 1 >= 100) {
          selectedRarity = 'Celestial';
          wasCelestialPityTriggered = true;
        } else if (currentUnrivaledPity + 1 >= 50) {
          selectedRarity = 'Unrivaled';
          wasUnrivaledPityTriggered = true;
        } else if (currentPity + 1 >= 15) {
          selectedRarity = 'Secret';
          wasPityTriggered = true;
        } else {
          let weights = { ...altar.weights };
          if (isGigaGacha) {
            weights = {
              Secret: 40,
              Unrivaled: 24.999988,
              Celestial: 20,
              '???': 15,
              Original: 0.000009,
              Overseer: 0.000001,
              Arcane: 0.000002,
            };
          }
          let random = Math.random() * 100;
          for (const [rarity, rawWeight] of Object.entries(weights)) {
            const weight = rawWeight as number;
            if (random < weight) {
              selectedRarity = rarity;
              break;
            }
            random -= weight;
          }
        }
      } else if (altarType === 'capy') {
        capyCoinsSpent += summonCost;
        if (currentCapyPity + 1 >= 15000) {
          selectedRarity = 'The Chillful';
          wasCapyPityTriggered = true;
        } else if (currentOverseerPity + 1 >= 20000) {
          selectedRarity = 'Overseer';
          wasOverseerPityTriggered = true;
        } else if (currentOriginalPity + 1 >= 15000) {
          selectedRarity = 'Original';
          wasOriginalPityTriggered = true;
        } else if (currentMysteryPity + 1 >= 1000) {
          selectedRarity = '???';
          wasMysteryPityTriggered = true;
        } else if (currentCelPity + 1 >= 100) {
          selectedRarity = 'Celestial';
          wasCelestialPityTriggered = true;
        } else if (currentUnrivaledPity + 1 >= 50) {
          selectedRarity = 'Unrivaled';
          wasUnrivaledPityTriggered = true;
        } else if (currentPity + 1 >= 15) {
          selectedRarity = 'Secret';
          wasPityTriggered = true;
        } else {
          let weights = { ...altar.weights };
          if (isGigaGacha) {
            weights = {
              Secret: 35,
              Unrivaled: 24.999988,
              Celestial: 20,
              '???': 15,
              'The Chillful': 0.05,
              Original: 0.000009,
              Overseer: 0.000001,
              Arcane: 0.000002,
            };
          }
          let random = Math.random() * 100;
          for (const [rarity, rawWeight] of Object.entries(weights)) {
            const weight = rawWeight as number;
            if (random < weight) {
              selectedRarity = rarity;
              break;
            }
            random -= weight;
          }
        }
      } else {
        const originalChance = isGigaGacha ? 0.05 : (altarType === 'quantum' ? 0.00002 : 0.000002);
        if (Math.random() < originalChance) {
          selectedRarity = 'Original';
        } else {
          if (currentMysteryPity + 1 >= 1000) {
            selectedRarity = '???';
            wasMysteryPityTriggered = true;
          } else if (currentCelPity + 1 >= 100) {
            selectedRarity = 'Celestial';
            wasCelestialPityTriggered = true;
          } else if (currentUnrivaledPity + 1 >= 50) {
            selectedRarity = 'Unrivaled';
            wasUnrivaledPityTriggered = true;
          } else if (currentPity + 1 >= 15) {
            selectedRarity = 'Secret';
            wasPityTriggered = true;
          } else {
            let weights = { ...altar.weights };
            if (isGigaGacha) {
              if (altarType === 'standard') {
                weights = {
                  Common: 0,
                  Rare: 5,
                  Epic: 15,
                  Legendary: 30,
                  Mythic: 25,
                  Secret: 23,
                  Unrivaled: 1.5,
                  Celestial: 0.4,
                  '???': 0.099,
                  Arcane: 0.001,
                };
              } else if (altarType === 'quantum') {
                weights = {
                  Common: 0,
                  Rare: 0,
                  Epic: 0,
                  Legendary: 10,
                  Mythic: 35,
                  Secret: 35,
                  Unrivaled: 12,
                  Celestial: 6.49,
                  '???': 1.5,
                  Arcane: 0.01,
                };
              }
            }
            const totalWeight = Object.values(weights).reduce((sum, wt) => (sum as number) + (wt as number), 0) as number;
            let random = Math.random() * totalWeight;
            for (const [rarity, rawWeight] of Object.entries(weights)) {
              const weight = rawWeight as number;
              if (random < weight) {
                selectedRarity = rarity;
                break;
              }
              random -= weight;
            }
          }
        }
      }

      // Roll animal within chosen rarity
      let pool = ANIMALS.filter(a => a.rarity === selectedRarity);
      if (selectedRarity === 'Mythic') {
        const featuredList = getFeaturedMythicsAtTime(timeMs);
        if (Math.random() < 0.75) {
          pool = featuredList;
        }
      }
      const animal = pool[Math.floor(Math.random() * pool.length)] || ANIMALS[0];

      if (selectedRarity === 'Secret') {
        wasPityTriggered = true;
      }
      if (selectedRarity === 'Celestial') {
        wasCelestialPityTriggered = true;
      }
      if (selectedRarity === '???') {
        wasMysteryPityTriggered = true;
      }
      if (selectedRarity === 'Original') {
        wasOriginalPityTriggered = true;
      }
      if (selectedRarity === 'The Chillful') {
        wasCapyPityTriggered = true;
      }
      if (selectedRarity === 'Overseer') {
        wasOverseerPityTriggered = true;
      }
      if (selectedRarity === 'Unrivaled') {
        wasUnrivaledPityTriggered = true;
      }

      currentPity = wasPityTriggered ? 0 : currentPity + 1;
      currentCelPity = wasCelestialPityTriggered ? 0 : currentCelPity + 1;
      currentMysteryPity = wasMysteryPityTriggered ? 0 : currentMysteryPity + 1;
      currentOriginalPity = wasOriginalPityTriggered ? 0 : currentOriginalPity + 1;
      currentCapyPity = wasCapyPityTriggered ? 0 : currentCapyPity + 1;
      currentOverseerPity = wasOverseerPityTriggered ? 0 : currentOverseerPity + 1;
      currentUnrivaledPity = wasUnrivaledPityTriggered ? 0 : currentUnrivaledPity + 1;

      // Check Duplication
      const isDuplicate = currentUnlocked.includes(animal.id);

      // Determine Auto-Selling Match
      let autoSold = false;
      if (isDuplicate && autoSellDuplicates) {
        autoSold = true;
      } else if (animal.rarity === 'Common' && autoSellCommons) {
        autoSold = true;
      } else if (animal.rarity === 'Rare' && autoSellRares) {
        autoSold = true;
      } else if (animal.rarity === 'Epic' && autoSellEpics) {
        autoSold = true;
      } else if (animal.rarity === 'Legendary' && autoSellLegendaries) {
        autoSold = true;
      }

      let dnaRefund = 0;
      if (autoSold) {
        dnaRefund = REFUND_VALUES[animal.rarity] || 0;
        netDnaGain += dnaRefund;
      } else {
        // Newly Unlocked in this step
        currentUnlocked.push(animal.id);
      }

      results.push({
        animal,
        isDuplicate,
        autoSold,
        dnaRefund,
      });
    }

    // Spend cost of all rolls
    const totalSpent = (isSandbox || altarType === 'ultra' || altarType === 'capy') ? 0 : (actualCount * summonCost);
    const netDnaDiff = netDnaGain - totalSpent;

    // Filter out only the newly unlocked ones to let the save state update
    const newlyUnlockedInBatch = results
        .filter(res => !res.autoSold && !ownedAnimals.includes(res.animal.id))
        .map(res => res.animal.id);

    const rolledArcane = results.find(res => res.animal.rarity === 'Arcane');
    const rolledOverseer = results.find(res => res.animal.rarity === 'Overseer');
    const rolledOriginal = results.find(res => res.animal.rarity === 'Original');
    const rolledChillful = results.find(res => res.animal.rarity === 'The Chillful');
    
    // Cut the cutscene entirely for ??? rarity but keep it active for Arcane, Overseer, Original, and The Chillful rarities
    const rolledMysteryAnimal = rolledArcane
      ? rolledArcane.animal
      : (rolledOverseer 
        ? rolledOverseer.animal 
        : (rolledOriginal ? rolledOriginal.animal : (rolledChillful ? rolledChillful.animal : undefined)));

    // Simulation delay
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('daily-mission-event', { detail: { type: 'summon', count: actualCount } }));
    }
    setTimeout(() => {
      setIsSummoning(false);
      setBatchResults(results);

      // Play dynamic rarity-scaled gacha sound based on highest rarity in the batch
      const rarityPriority: Record<string, number> = {
        'Arcane': 12,
        'Overseer': 11,
        'Original': 10,
        'The Chillful': 10,
        '???': 9,
        'Unrivaled': 8,
        'Celestial': 7,
        'Secret': 6,
        'Mythic': 5,
        'Legendary': 4,
        'Epic': 3,
        'Rare': 2,
        'Common': 1
      };
      let highestRarity = 'Common';
      results.forEach(res => {
        const r = res.animal.rarity;
        if ((rarityPriority[r] || 0) > (rarityPriority[highestRarity] || 0)) {
          highestRarity = r;
        }
      });
      gameAudio.playSFX('gacha', highestRarity);

      onSummonComplete(
        newlyUnlockedInBatch, 
        currentPity, 
        currentCelPity, 
        currentMysteryPity, 
        netDnaDiff, 
        rolledMysteryAnimal,
        currentOriginalPity,
        currentOverseerPity,
        shardsSpent,
        currentUnrivaledPity,
        currentCapyPity,
        capyCoinsSpent
      );

      // Check if any supreme/special entities or Capybara were rolled
      const hasCapy = results.some(res => res.animal.id === 'capybara' || res.animal.rarity === 'The Chillful');
      const hasSpecial = hasCapy || results.some(res => 
        res.animal.rarity === 'Arcane' || 
        res.animal.rarity === 'Overseer' || 
        res.animal.rarity === 'Original' ||
        res.animal.id === 'elemental_god'
      );

      // Sort results so Capybara and highest-rarity entities appear first in the cutscene sequence!
      const sortedForCutscene = [...results].sort((a, b) => {
        const isCapyA = a.animal.id === 'capybara' || a.animal.rarity === 'The Chillful';
        const isCapyB = b.animal.id === 'capybara' || b.animal.rarity === 'The Chillful';
        if (isCapyA && !isCapyB) return -1;
        if (!isCapyA && isCapyB) return 1;

        const isSpecA = a.animal.rarity === 'Arcane' || a.animal.rarity === 'Overseer' || a.animal.id === 'elemental_god';
        const isSpecB = b.animal.rarity === 'Arcane' || b.animal.rarity === 'Overseer' || b.animal.id === 'elemental_god';
        if (isSpecA && !isSpecB) return -1;
        if (!isSpecA && isSpecB) return 1;

        return (rarityPriority[b.animal.rarity] || 0) - (rarityPriority[a.animal.rarity] || 0);
      });

      // Special entities and Capybara ALWAYS trigger their epic cutscene and music even if skip cutscenes is checked!
      if ((!disableSummonCutscene || hasSpecial) && results.length > 0) {
        setCutsceneData({
          isOpen: true,
          animals: sortedForCutscene.map(r => r.animal)
        });
      }
    }, actualCount === 1 ? 1200 : 1800);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Rare': return 'text-blue-500';
      case 'Epic': return 'text-purple-500';
      case 'Legendary': return 'text-orange-500';
      case 'Mythic': return 'text-red-500';
      case 'Secret': return 'text-cyan-400 font-extrabold animate-pulse';
      case 'Celestial': return 'text-rose-400 font-black tracking-widest animate-pulse';
      case 'Unrivaled': return 'text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-550 to-pink-500 font-black tracking-[0.15em] animate-pulse';
      case '???': return 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-white to-indigo-400 font-black tracking-widest animate-pulse bg-[size:200%]';
      case 'Original': return 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-600 font-black tracking-widest animate-pulse bg-[size:200%]';
      case 'The Chillful': return 'text-transparent bg-clip-text bg-gradient-to-r from-lime-400 via-emerald-300 to-amber-300 font-black tracking-widest animate-pulse bg-[size:200%]';
      case 'Overseer': return 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-teal-400 font-black tracking-widest animate-[pulse_2s_infinite] bg-[size:200%]';
      case 'Arcane': return 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-300 to-pink-400 font-black tracking-widest animate-pulse bg-[size:200%]';
      default: return 'text-slate-500';
    }
  };

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case 'Rare': return 'bg-blue-500/10 border-blue-500/30';
      case 'Epic': return 'bg-purple-500/10 border-purple-500/20';
      case 'Legendary': return 'bg-orange-500/10 border-orange-500/20';
      case 'Mythic': return 'bg-red-500/10 border-red-500/20';
      case 'Secret': return 'bg-cyan-500/10 border-cyan-400/30';
      case 'Celestial': return 'bg-rose-500/15 border-rose-400/40 shadow-[inset_0_0_20px_rgba(244,63,94,0.15)]';
      case 'Unrivaled': return 'bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-pink-500/10 border-amber-400/40 shadow-[0_0_20px_rgba(245,158,11,0.2)] animate-pulse';
      case '???': return 'bg-slate-900 border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.15)] animate-pulse';
      case 'Original': return 'bg-gradient-to-r from-yellow-550/10 to-amber-550/10 border-yellow-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]';
      case 'The Chillful': return 'bg-gradient-to-r from-lime-950/40 via-emerald-950/30 to-amber-950/20 border-lime-400/50 shadow-[0_0_25px_rgba(132,204,22,0.35)] ring-1 ring-lime-400/30';
      case 'Overseer': return 'bg-gradient-to-r from-cyan-950/20 to-teal-950/20 border-cyan-400/40 shadow-[0_0_20px_rgba(6,182,212,0.25)] ring-1 ring-cyan-500/20';
      case 'Arcane': return 'bg-gradient-to-r from-purple-950/40 via-fuchsia-950/30 to-slate-950 border-purple-400/50 shadow-[0_0_25px_rgba(168,85,247,0.35)] ring-1 ring-purple-400/30';
      default: return 'bg-slate-950 border-white/5';
    }
  };

  const currencyForMax = altarType === 'ultra' ? (shardsOfGods ?? 0) : (altarType === 'capy' ? (capyCoins ?? 0) : dna);
  const affordableMaxSummons = Math.min(Math.floor(currencyForMax / summonCost), 50);
  const currencyLabel = altarType === 'ultra' ? 'Shard' : (altarType === 'capy' ? 'Capy Coin' : 'DNA');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md"
        >
          <div className="relative w-full max-w-2xl p-6 bg-slate-900 border border-white/10 rounded-3xl shadow-[0_0_60px_rgba(16,185,129,0.15)] max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Top Close Button */}
            <button 
              onClick={onClose}
              disabled={isSummoning}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white transition-colors disabled:opacity-20"
            >
              <X size={24} />
            </button>

            {/* Header / Bio Logo */}
            <div className="mb-3 flex-none">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-black text-emerald-400 flex items-center gap-2 uppercase italic tracking-tighter">
                  <Sparkles size={18} className="text-emerald-400 animate-pulse" /> DNA SEQUENCING LAB
                </h2>
                
                {/* Dev Mode Toggle Button */}
                {isDevMode && (
                  <button
                    onClick={() => setIsDevMenuOpen(!isDevMenuOpen)}
                    className="px-2 py-1 bg-purple-950/60 border border-purple-500/40 hover:bg-purple-900/60 text-purple-300 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer mr-8"
                  >
                    🛠️ Dev Cheats {isDevMenuOpen ? '▲' : '▼'}
                  </button>
                )}
              </div>

              {/* Dev Cheat Dropdown Drawer */}
              {isDevMode && isDevMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 p-2 bg-slate-950/90 border border-purple-500/30 rounded-xl flex flex-wrap gap-1.5 items-center"
                >
                  <button
                    onClick={() => onSummonComplete([], secretPity, celestialPity, mysteryPity, 5000, undefined, originalPity, overseerPity, 0, unrivaledPity, capyPity, 0)}
                    className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[8.5px] font-black tracking-wider uppercase transition-all active:scale-95 cursor-pointer"
                  >
                    +5000 DNA
                  </button>
                  <button
                    onClick={() => {
                      const capy = ANIMALS.find(a => a.id === 'capybara') || ANIMALS[0];
                      if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('daily-mission-event', { detail: { type: 'summon', count: 1 } }));
                      }
                      onSummonComplete([capy.id], secretPity, celestialPity, mysteryPity, 0, undefined, originalPity, overseerPity, 0, unrivaledPity, 0, 0);
                      setCutsceneData({ isOpen: true, animals: [capy] });
                    }}
                    className="px-2 py-1 bg-lime-600 hover:bg-lime-500 text-slate-950 rounded text-[8.5px] font-black tracking-wider uppercase transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                  >
                    <CapybaraAvatar size="xs" withYuzu={false} /> Capy (Dev)
                  </button>
                  <button
                    onClick={() => {
                      const pool = ANIMALS.filter(a => a.rarity === 'Original');
                      const randOriginal = pool[Math.floor(Math.random() * pool.length)] || ANIMALS[ANIMALS.length - 1];
                      if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('daily-mission-event', { detail: { type: 'summon', count: 1 } }));
                      }
                      onSummonComplete([randOriginal.id], secretPity, celestialPity, mysteryPity, 0, undefined, originalPity, overseerPity, 0, unrivaledPity, capyPity, 0);
                      setCutsceneData({ isOpen: true, animals: [randOriginal] });
                    }}
                    className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 rounded text-[8.5px] font-black tracking-wider uppercase transition-all active:scale-95 cursor-pointer"
                  >
                    👑 Original (Dev)
                  </button>
                  <button
                    onClick={() => {
                      const overseer = ANIMALS.find(a => a.id === 'all_seeing_overseer') || ANIMALS[0];
                      if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('daily-mission-event', { detail: { type: 'summon', count: 1 } }));
                      }
                      onSummonComplete([overseer.id], secretPity, celestialPity, mysteryPity, 0, undefined, originalPity, overseerPity, 0, unrivaledPity, capyPity, 0);
                      setCutsceneData({ isOpen: true, animals: [overseer] });
                    }}
                    className="px-2 py-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded text-[8.5px] font-black tracking-wider uppercase transition-all active:scale-95 cursor-pointer"
                  >
                    🔮 Overseer (Dev)
                  </button>
                  <button
                    onClick={() => {
                      const deity = ANIMALS.find(a => a.id === 'elemental_god') || ANIMALS[0];
                      if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('daily-mission-event', { detail: { type: 'summon', count: 1 } }));
                      }
                      onSummonComplete([deity.id], secretPity, celestialPity, mysteryPity, 0, undefined, originalPity, overseerPity, 0, unrivaledPity, capyPity, 0);
                      setCutsceneData({ isOpen: true, animals: [deity] });
                    }}
                    className="px-2 py-1 bg-orange-600 hover:bg-orange-500 text-slate-950 rounded text-[8.5px] font-black tracking-wider uppercase transition-all active:scale-95 cursor-pointer"
                  >
                    🔥 Deity (Dev)
                  </button>
                  <button
                    onClick={() => {
                      const warper = ANIMALS.find(a => a.id === 'arcane_warper') || ANIMALS[0];
                      if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('daily-mission-event', { detail: { type: 'summon', count: 1 } }));
                      }
                      onSummonComplete([warper.id], secretPity, celestialPity, mysteryPity, 0, undefined, originalPity, overseerPity, 0, unrivaledPity, capyPity, 0);
                      setCutsceneData({ isOpen: true, animals: [warper] });
                    }}
                    className="px-2 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-[8.5px] font-black tracking-wider uppercase transition-all active:scale-95 cursor-pointer"
                  >
                    🧿 Arcane (Dev)
                  </button>
                </motion.div>
              )}

              {/* Resource Dashboard */}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-indigo-950/40 border border-indigo-500/20 px-2.5 py-1 rounded-lg">
                    <span className="text-[9px] uppercase font-bold text-slate-400">DNA:</span>
                    <span className="text-indigo-400 font-mono text-xs font-black">{dna.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-cyan-950/40 border border-cyan-500/20 px-2.5 py-1 rounded-lg">
                    <span className="text-[9px] uppercase font-bold text-slate-400">God Shards:</span>
                    <span className="text-cyan-400 font-mono text-xs font-black">✨ {(shardsOfGods || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-lime-950/40 border border-lime-500/20 px-2.5 py-1 rounded-lg">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Capy Coins:</span>
                    <span className="text-lime-400 font-mono text-xs font-black">🪙 {(capyCoins || 0).toLocaleString()}</span>
                  </div>
                </div>

                {/* Sub-view Navigation Tabs */}
                <div className="flex bg-slate-950 p-1 rounded-xl border border-white/10 text-[9px] font-black uppercase tracking-wider">
                  <button
                    onClick={() => setModalTab('chamber')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      modalTab === 'chamber'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🧬 Splicing Chamber
                  </button>
                  <button
                    onClick={() => setModalTab('pity')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                      modalTab === 'pity'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Trophy size={10} /> Rates & Pity
                  </button>
                  <button
                    onClick={() => setModalTab('settings')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                      modalTab === 'settings'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <RefreshCw size={10} /> Auto-Sell Rules
                  </button>
                </div>
              </div>

              {/* Compact Quick Pity Ticker */}
              <div className="flex items-center gap-1.5 flex-wrap mt-2 overflow-x-auto pb-0.5 scrollbar-none">
                <span className="text-[8px] uppercase font-black tracking-widest text-slate-500 mr-1 flex-none">Pity:</span>
                <span className="bg-cyan-950/60 border border-cyan-500/30 rounded-md px-2 py-0.5 text-[8px] font-black uppercase text-cyan-300">
                  Secret: {secretPity}/15
                </span>
                <span className="bg-amber-950/60 border border-amber-500/30 rounded-md px-2 py-0.5 text-[8px] font-black uppercase text-amber-300">
                  Unrivaled: {unrivaledPity}/50
                </span>
                <span className="bg-rose-950/60 border border-rose-500/30 rounded-md px-2 py-0.5 text-[8px] font-black uppercase text-rose-300">
                  Celestial: {celestialPity}/100
                </span>
                <span className="bg-purple-950/60 border border-purple-500/30 rounded-md px-2 py-0.5 text-[8px] font-black uppercase text-purple-300">
                  ???: {mysteryPity}/1000
                </span>
                <span className="bg-lime-950/60 border border-lime-500/30 rounded-md px-2 py-0.5 text-[8px] font-black uppercase text-lime-300">
                  Capy: {capyPity}/15k
                </span>
                <span className="bg-yellow-950/60 border border-yellow-500/30 rounded-md px-2 py-0.5 text-[8px] font-black uppercase text-yellow-300">
                  Original: {originalPity}/15k
                </span>
                <span className="bg-teal-950/60 border border-teal-500/30 rounded-md px-2 py-0.5 text-[8px] font-black uppercase text-teal-300">
                  Overseer: {overseerPity}/20k
                </span>
                <span className="bg-fuchsia-950/70 border border-fuchsia-400/40 rounded-md px-2 py-0.5 text-[8px] font-black uppercase text-fuchsia-300">
                  Arcane: Raw Luck
                </span>
              </div>
            </div>

            {/* Altar Switcher */}
            <div className="bg-slate-950 p-1.5 rounded-2xl border border-white/5 flex gap-2 mb-3 flex-none">
              <button
                disabled={isSummoning}
                onClick={() => setAltarType('standard')}
                className={`flex-1 py-2 rounded-xl text-center font-black uppercase text-[9px] tracking-wider transition-all cursor-pointer ${
                  altarType === 'standard'
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-md'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                🧬 Standard (250 DNA)
              </button>
              <button
                disabled={isSummoning}
                onClick={() => setAltarType('quantum')}
                className={`flex-1 py-2 rounded-xl text-center font-black uppercase text-[9px] tracking-wider transition-all cursor-pointer ${
                  altarType === 'quantum'
                    ? 'bg-amber-500/20 text-yellow-400 border border-amber-500/30 shadow-md'
                    : 'text-slate-500 hover:text-yellow-550'
                }`}
              >
                🌌 Primal (2500 DNA)
              </button>
              <button
                disabled={isSummoning}
                onClick={() => setAltarType('ultra')}
                className={`flex-1 py-2 rounded-xl text-center font-black uppercase text-[9px] tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 bg-gradient-to-r ${
                  altarType === 'ultra'
                    ? 'from-cyan-500/20 to-teal-550/20 text-cyan-300 border border-cyan-500/45 shadow-[0_0_12px_rgba(6,182,212,0.2)] animate-pulse'
                    : 'text-slate-500 hover:text-cyan-400 border border-transparent'
                }`}
              >
                💎 Gods (5 Shards)
              </button>
              <button
                disabled={isSummoning}
                onClick={() => setAltarType('capy')}
                className={`flex-1 py-2 rounded-xl text-center font-black uppercase text-[9px] tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 bg-gradient-to-r ${
                  altarType === 'capy'
                    ? 'from-lime-500/20 to-emerald-550/20 text-lime-300 border border-lime-500/45 shadow-[0_0_12px_rgba(132,204,22,0.2)] animate-pulse'
                    : 'text-slate-500 hover:text-lime-400 border border-transparent'
                }`}
              >
                <CapybaraAvatar size="xs" withYuzu={false} /> Capy (5 Coins)
              </button>
            </div>

            {/* Tab Views */}
            {modalTab === 'pity' ? (
              // TAB 1: Pity & Rates Detailed Dashboard
              <div className="flex-1 overflow-y-auto min-h-0 space-y-4 p-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Sequence Rates for Active Altar */}
                  <div className="bg-slate-950/80 p-4 rounded-2xl border border-white/5 space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-indigo-400 tracking-wider flex items-center gap-1.5">
                      <Zap size={12} className="text-yellow-400" /> {altar.name} Drop Probabilities
                    </h4>
                    <div className="space-y-1.5 bg-slate-900/60 p-3 rounded-xl text-[10px] font-mono border border-white/5">
                      {Object.entries(altar.weights).map(([rarity, weight], idx) => (
                        <div key={`pity-rate-${rarity}-${idx}`} className="flex justify-between items-center py-0.5 border-b border-white/5 last:border-0">
                          <span className={`font-bold ${getRarityColor(rarity)}`}>{rarity}</span>
                          <span className="text-slate-300 font-bold">{rarity === '???' ? '???' : `${weight}%`}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Guaranteed Pity Milestones */}
                  <div className="bg-slate-950/80 p-4 rounded-2xl border border-white/5 space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                      <Trophy size={12} className="text-yellow-400" /> Guaranteed Pity Meters
                    </h4>
                    <div className="space-y-2 text-[9.5px]">
                      {[
                        { name: 'Secret Genome', cur: secretPity, max: 15, color: 'bg-cyan-500', text: 'text-cyan-300' },
                        { name: 'Unrivaled Apex', cur: unrivaledPity, max: 50, color: 'bg-amber-500', text: 'text-amber-300' },
                        { name: 'Celestial Tier', cur: celestialPity, max: 100, color: 'bg-rose-500', text: 'text-rose-300' },
                        { name: '??? Cosmic Mutation', cur: mysteryPity, max: 1000, color: 'bg-purple-500', text: 'text-purple-300' },
                        { name: 'The Chillful Capy', cur: capyPity, max: 15000, color: 'bg-lime-500', text: 'text-lime-300' },
                        { name: 'Original Sovereign', cur: originalPity, max: 15000, color: 'bg-yellow-500', text: 'text-yellow-300' },
                        { name: 'Overseer Prime', cur: overseerPity, max: 20000, color: 'bg-teal-500', text: 'text-teal-300' },
                      ].map((item, i) => (
                        <div key={`pity-meter-${i}`} className="bg-slate-900/60 p-2 rounded-xl border border-white/5">
                          <div className="flex justify-between items-center mb-1 font-bold">
                            <span className={item.text}>{item.name}</span>
                            <span className="font-mono text-slate-400 text-[9px]">{item.cur} / {item.max.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-white/5">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${item.color}`}
                              style={{ width: `${Math.min(100, (item.cur / item.max) * 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : modalTab === 'settings' ? (
              // TAB 2: Auto-Sell & Scrap Settings
              <div className="flex-1 overflow-y-auto min-h-0 space-y-4 p-1">
                <div className="bg-slate-950/80 p-5 rounded-2xl border border-indigo-500/20 shadow-md">
                  <div className="text-[10px] font-black uppercase text-indigo-400 mb-4 tracking-widest flex items-center gap-1.5">
                    <RefreshCw size={12} className="animate-spin" style={{ animationDuration: '6s' }} /> RECYCLE & SCRAP AUTOMATION RULES
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => setAutoSellDuplicates(!autoSellDuplicates)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                        autoSellDuplicates ? 'bg-indigo-950/40 border-indigo-500/40 text-white' : 'bg-slate-900/40 border-white/5 text-slate-400'
                      }`}
                    >
                      <div className="text-indigo-400 mt-0.5">
                        {autoSellDuplicates ? <CheckSquare size={18} /> : <Square size={18} />}
                      </div>
                      <div>
                        <div className="text-[10px] font-black uppercase">Sell Duplicates</div>
                        <div className="text-[8.5px] text-slate-400 mt-0.5">Automatically converts repeat copies into instant DNA compensation.</div>
                      </div>
                    </button>

                    <button
                      onClick={() => setAutoSellCommons(!autoSellCommons)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                        autoSellCommons ? 'bg-indigo-950/40 border-indigo-500/40 text-white' : 'bg-slate-900/40 border-white/5 text-slate-400'
                      }`}
                    >
                      <div className="text-indigo-400 mt-0.5">
                        {autoSellCommons ? <CheckSquare size={18} /> : <Square size={18} />}
                      </div>
                      <div>
                        <div className="text-[10px] font-black uppercase">Scrap Common Repeats</div>
                        <div className="text-[8.5px] text-slate-400 mt-0.5">+45 DNA refund per Common repeat.</div>
                      </div>
                    </button>

                    <button
                      onClick={() => setAutoSellRares(!autoSellRares)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                        autoSellRares ? 'bg-indigo-950/40 border-indigo-500/40 text-white' : 'bg-slate-900/40 border-white/5 text-slate-400'
                      }`}
                    >
                      <div className="text-indigo-400 mt-0.5">
                        {autoSellRares ? <CheckSquare size={18} /> : <Square size={18} />}
                      </div>
                      <div>
                        <div className="text-[10px] font-black uppercase">Scrap Rare Repeats</div>
                        <div className="text-[8.5px] text-slate-400 mt-0.5">+60 DNA refund per Rare repeat.</div>
                      </div>
                    </button>

                    <button
                      onClick={() => setAutoSellEpics(!autoSellEpics)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                        autoSellEpics ? 'bg-indigo-950/40 border-indigo-500/40 text-white' : 'bg-slate-900/40 border-white/5 text-slate-400'
                      }`}
                    >
                      <div className="text-indigo-400 mt-0.5">
                        {autoSellEpics ? <CheckSquare size={18} /> : <Square size={18} />}
                      </div>
                      <div>
                        <div className="text-[10px] font-black uppercase">Scrap Epic Repeats</div>
                        <div className="text-[8.5px] text-slate-400 mt-0.5">+80 DNA refund per Epic repeat.</div>
                      </div>
                    </button>

                    <button
                      onClick={() => setAutoSellLegendaries(!autoSellLegendaries)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                        autoSellLegendaries ? 'bg-indigo-950/40 border-indigo-500/40 text-white' : 'bg-slate-900/40 border-white/5 text-slate-400'
                      }`}
                    >
                      <div className="text-indigo-400 mt-0.5">
                        {autoSellLegendaries ? <CheckSquare size={18} /> : <Square size={18} />}
                      </div>
                      <div>
                        <div className="text-[10px] font-black uppercase">Scrap Legendary Repeats</div>
                        <div className="text-[8.5px] text-slate-400 mt-0.5">+100 DNA refund per Legendary repeat.</div>
                      </div>
                    </button>
                  </div>

                  <div className="mt-4 bg-indigo-950/40 p-3 rounded-xl border border-indigo-500/20 text-[9px] uppercase font-bold text-indigo-300">
                    💡 DNA REFUND VALUES:
                    <div className="mt-1 font-mono text-slate-300 grid grid-cols-2 sm:grid-cols-4 gap-1 text-[8px]">
                      <div>Common: +45 DNA</div>
                      <div>Rare: +60 DNA</div>
                      <div>Epic: +80 DNA</div>
                      <div>Legendary: +100 DNA</div>
                      <div>Mythic: +150 DNA</div>
                      <div>Secret: +250 DNA</div>
                      <div>Celestial: +500 DNA</div>
                      <div>Unrivaled: +1,000 DNA</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // TAB 3: Main Splicing Chamber
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 overflow-hidden min-h-0 py-1">
                
                {/* Left Column: Quick Rate Summary */}
                <div className="hidden md:flex md:col-span-1 space-y-3 flex-col justify-between overflow-y-auto pr-1">
                  {/* Rates Panel */}
                  <div className="bg-slate-950/80 p-3 rounded-2xl border border-white/5">
                    <h4 className="text-[8px] font-black uppercase text-slate-500 mb-2 tracking-widest flex items-center gap-1">
                      <Zap size={8} className="text-yellow-500" /> ALCHEMY RATES ({altar.name.split(' ')[0]})
                    </h4>
                    <div className="space-y-1 bg-slate-950 p-2 rounded-lg text-[9px] font-mono border border-white/5">
                      {Object.entries(altar.weights).slice(0, 6).map(([rarity, weight], idx) => (
                        <div key={`altar-weight-${rarity}-${idx}`} className="flex justify-between">
                          <span className={getRarityColor(rarity)}>{rarity}:</span>
                          <span className="text-slate-400">{rarity === '???' ? '???' : `${weight}%`}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Active Auto-Sell Indicator */}
                  <div className="bg-slate-950/60 p-3 rounded-2xl border border-white/5 text-[8.5px]">
                    <div className="flex items-center justify-between text-slate-400 font-bold mb-1 uppercase">
                      <span>Recycle Status:</span>
                      <button onClick={() => setModalTab('settings')} className="text-indigo-400 hover:underline cursor-pointer">
                        Edit ⚙️
                      </button>
                    </div>
                    <div className="text-slate-300 flex items-center gap-1 font-semibold">
                      <span className={`w-1.5 h-1.5 rounded-full ${autoSellDuplicates ? 'bg-emerald-400' : 'bg-slate-600'}`}></span>
                      {autoSellDuplicates ? 'Auto-Sell Duplicates [ON]' : 'Auto-Sell Duplicates [OFF]'}
                    </div>
                  </div>
                </div>

                {/* Main Screen Panel */}
                <div className="md:col-span-2 flex flex-col bg-slate-950 border border-white/5 rounded-2xl overflow-hidden relative shadow-inner h-full">
                
                {isSummoning ? (
                  // Spinning animation
                  <div className="flex-1 flex flex-col items-center justify-center p-8">
                    <div className="relative mb-4">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                        className="w-24 h-24 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.2)]"
                      />
                      <div className="absolute inset-0 flex items-center justify-center text-indigo-400 font-extrabold text-[8px] uppercase tracking-widest animate-pulse">
                        Splicing...
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-black uppercase tracking-[0.25em] text-indigo-300">Extracting Extinct Codes</p>
                      <p className="text-[8px] uppercase font-bold text-slate-500 tracking-wider mt-1">Analyzing {summonCountRolled} DNA strands...</p>
                    </div>
                  </div>
                ) : batchResults ? (
                  // Show Result Cards
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                    <h3 className="text-xs font-black uppercase text-indigo-400 tracking-widest border-b border-white/5 pb-2 mb-3 flex justify-between items-center">
                      <span>Injected Sequences ({batchResults.length})</span>
                      <span className="text-[9px] text-slate-500 font-mono">Net DNA cost: -{batchResults.length * summonCost - batchResults.reduce((s, r) => s + r.dnaRefund, 0)}</span>
                    </h3>
                    
                    {batchResults.length === 1 ? (
                      // Gorgeous single result display
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center py-4"
                      >
                        <div 
                          className="w-28 h-28 mx-auto rounded-3xl mb-4 shadow-[0_0_40px_rgba(0,0,0,0.6)] flex items-center justify-center text-white text-5xl font-black border-4 p-2"
                          style={{ backgroundColor: `${batchResults[0].animal.color}15`, borderColor: batchResults[0].animal.color }}
                        >
                          <AnimalAvatar animal={batchResults[0].animal} size="2xl" />
                        </div>
                        <h3 className={`text-2xl font-black italic tracking-tighter ${getRarityColor(batchResults[0].animal.rarity)}`}>
                          {batchResults[0].animal.name}
                        </h3>
                        <div className="flex items-center justify-center gap-2 mt-1">
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 bg-slate-900 border border-white/5 px-2 py-0.5 rounded">
                            {batchResults[0].animal.rarity}
                          </span>
                          {batchResults[0].animal.isExtinct && (
                            <span className="bg-red-500/20 text-red-500 text-[8px] px-2 py-0.5 rounded border border-red-500/20 font-black uppercase tracking-tighter">
                              Extinct
                            </span>
                          )}
                        </div>

                        {/* Sold Banner */}
                        {batchResults[0].autoSold ? (
                          <div className="mt-5 mx-auto max-w-xs bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-xl p-2.5 text-[10px] uppercase font-black tracking-tight animate-bounce">
                            ♻️ Duplicate Spliced • Sold for +{batchResults[0].dnaRefund} DNA
                          </div>
                        ) : (
                          <div className="mt-5 mx-auto max-w-xs bg-green-500/20 border border-green-500/30 text-green-400 rounded-xl p-2.5 text-[10px] uppercase font-black tracking-widest">
                            🔥 NEW GENOME UNLOCKED!
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      // Multi-roll result list
                      <div className="grid grid-cols-2 gap-2">
                        {batchResults.map((res, index) => (
                          <motion.div
                            key={`batch-res-${index}-${res.animal.id}`}
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: Math.min(index * 0.05, 1) }}
                            className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 overflow-hidden ${getRarityBg(res.animal.rarity)}`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div 
                                className="w-8 h-8 rounded-lg flex-none flex items-center justify-center text-sm font-black border p-0.5"
                                style={{ backgroundColor: `${res.animal.color}10`, borderColor: res.animal.color, color: res.animal.color }}
                              >
                                <AnimalAvatar animal={res.animal} size="sm" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] font-black truncate text-white leading-tight">{res.animal.name}</p>
                                <p className={`text-[8px] font-bold uppercase tracking-tighter ${getRarityColor(res.animal.rarity)}`}>{res.animal.rarity}</p>
                              </div>
                            </div>

                            <div className="flex-none text-right">
                              {res.autoSold ? (
                                <span className="bg-amber-950/80 border border-amber-500/20 text-yellow-400 text-[8px] font-mono px-1.5 py-0.5 rounded block uppercase font-black tracking-tighter shadow-inner">
                                  + {res.dnaRefund} DNA
                                </span>
                              ) : (
                                <span className="bg-green-500 text-slate-950 text-[8px] font-black px-1.5 py-0.5 rounded block uppercase tracking-wide">
                                  NEW!
                                </span>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  // Initial Screen showing Featured Mythics rotating every 20-min
                  <div className="flex-1 flex flex-col p-4 overflow-y-auto scrollbar-hide text-left min-h-0 bg-slate-950/60 rounded-2xl">
                    {/* Header Banner info */}
                    <div className="bg-gradient-to-r from-red-950/30 via-slate-900 to-indigo-950/35 p-3.5 rounded-2xl border border-red-500/30 mb-3 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 flex-none">
                      <div>
                        <h3 className="text-xs font-black uppercase text-red-400 tracking-wider flex items-center gap-1.5 italic">
                          <Sparkles size={12} className="text-yellow-400 animate-pulse" /> 20-MIN MYTHIC RATE-UP BANNER
                        </h3>
                        <p className="text-[9px] text-slate-400 uppercase font-black tracking-tight mt-0.5">
                          75% rate up on chosen Mythic genomes!
                        </p>
                      </div>
                      <div className="bg-rose-950/65 border border-rose-500/40 rounded-xl px-2.5 py-1 flex flex-col items-center flex-none min-w-[100px] shadow-[0_0_12px_rgba(244,63,94,0.15)]">
                        <span className="text-[7px] font-black uppercase text-rose-400 tracking-widest animate-pulse leading-none">Next Rotation</span>
                        <span className="font-mono text-xs font-black text-rose-300 tracking-wider mt-0.5 leading-none">
                          {min}m {sec.toString().padStart(2, '0')}s
                        </span>
                      </div>
                    </div>

                    <h4 className="text-[8px] font-black uppercase text-slate-500 mb-2 tracking-widest pl-1 flex-none">
                      👑 ACTIVE FEATURED TARGETS (75% CHANCE)
                    </h4>

                    {/* Featured List Grid */}
                    <div className="grid grid-cols-1 gap-2 overflow-y-auto pr-1">
                      {currentFeaturedMythics.map((animal, idx) => (
                        <div 
                          key={`${animal.id}-${idx}`}
                          className="p-3 rounded-2xl border transition-all flex flex-col justify-between bg-slate-900/20"
                          style={{ 
                            backgroundColor: `${animal.color}06`, 
                            borderColor: `${animal.color}25`, 
                            boxShadow: `inset 0 0 10px ${animal.color}08`
                          }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              {/* Avatar Icon */}
                              <div 
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-md font-black border shadow-inner flex-none p-0.5"
                                style={{ 
                                  backgroundColor: `${animal.color}15`, 
                                  borderColor: animal.color,
                                  color: animal.color
                                }}
                              >
                                <AnimalAvatar animal={animal} size="sm" />
                              </div>
                              <div>
                                <h5 className="text-[11px] font-black text-white tracking-tight leading-tight">{animal.name}</h5>
                                <span className="text-[7.5px] font-black uppercase bg-red-950/60 border border-red-500/20 px-1 py-0.5 rounded text-red-400 tracking-widest mt-0.5 inline-block">
                                  Mythic
                                </span>
                              </div>
                            </div>

                            {/* Extinct status */}
                            {animal.isExtinct && (
                              <span className="bg-red-500/10 text-red-400 text-[6.5px] font-bold border border-red-500/15 rounded-md px-1 py-0.5 uppercase tracking-tighter">
                                Ancient Extinct
                              </span>
                            )}
                          </div>

                          {/* Skill & stats details */}
                          <div className="mt-2 pt-1.5 border-t border-white/5">
                            <div className="text-[8.5px] font-bold text-yellow-400 uppercase tracking-tight flex items-center gap-1 leading-none">
                              ⭐ {animal.skillName || 'Special Ability'}
                            </div>
                            <p className="text-[8.5px] text-slate-400 mt-1 uppercase leading-snug font-mono">
                              {animal.skillDesc || 'Triggers powerful field-clearing attacks regularly.'}
                            </p>
                          </div>

                          {/* Stat indicators */}
                          <div className="grid grid-cols-3 gap-2 mt-2 pt-1 border-t border-white/5 font-mono text-[7px] text-slate-500 leading-none">
                            <div>
                              DMG: <span className="text-white font-bold">{animal.damage}</span>
                            </div>
                            <div>
                              RANGE: <span className="text-white font-bold">{animal.range}</span>
                            </div>
                            <div>
                              ASPD: <span className="text-white font-bold">{(1000 / animal.fireRate).toFixed(1)}/s</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            )}

            {/* Bottom Controls */}
            <div className="mt-4 flex gap-2 flex-none border-t border-white/5 pt-3">
              <button
                disabled={isSummoning || currencyAmount < summonCost}
                onClick={() => runRollBatch(1)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-20 text-white font-black rounded-xl text-[11px] uppercase tracking-wider border border-white/10 active:scale-95 transition-all truncate cursor-pointer"
              >
                Summon 1x ({summonCost} {currencyLabel})
              </button>

              {affordableMaxSummons >= 10 && (
                <button
                  disabled={isSummoning || currencyAmount < summonCost * 10}
                  onClick={() => runRollBatch(10)}
                  className="flex-1 py-2.5 bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 border border-indigo-500/40 disabled:opacity-20 font-black rounded-xl text-[11px] uppercase tracking-wider active:scale-95 transition-all truncate cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                >
                  ⚡ Summon 10x ({summonCost * 10} {currencyLabel}s)
                </button>
              )}

              <button
                disabled={isSummoning || currencyAmount < summonCost}
                onClick={() => runRollBatch(affordableMaxSummons)}
                className="flex-[1.5] py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-black rounded-xl text-[11px] uppercase tracking-wider border border-emerald-400/40 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-[0_4px_25px_rgba(16,185,129,0.25)] truncate cursor-pointer"
              >
                <Sparkles size={13} className="animate-pulse flex-shrink-0 text-slate-950" />
                MAX ({affordableMaxSummons > 1 ? `x${affordableMaxSummons}` : '1x'}) • {affordableMaxSummons * summonCost || summonCost} {currencyLabel}{affordableMaxSummons * summonCost > 1 ? 's' : ''}
              </button>
            </div>

          </div>
        </motion.div>
      )}

      <SummonCutsceneModal
        isOpen={cutsceneData.isOpen}
        onClose={() => setCutsceneData({ isOpen: false, animals: [] })}
        summonedAnimals={cutsceneData.animals}
      />
    </AnimatePresence>
  );
};
