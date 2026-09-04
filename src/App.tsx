import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Coins, 
  Skull, 
  Swords, 
  Zap, 
  Target, 
  RefreshCw,
  Sparkles,
  Info,
  Cpu,
  Layers,
  Bot,
  Atom,
  Settings,
  Crown,
  Radar,
  Backpack,
  Trophy,
  FolderClosed,
  ArrowRightLeft,
  Filter,
  Check,
  CheckCheck,
  SlidersHorizontal,
  Sliders,
  ChevronDown,
  Gamepad2,
  Trash2,
  X,
  BookOpen,
  Plus,
  Dna,
  Palette,
  Shield,
  Flame
} from 'lucide-react';
import { useGameLoop } from './hooks/useGameLoop';
import { GameCanvas } from './components/GameCanvas';
import { SummoningModal } from './components/SummoningModal';
import { AutomationModal } from './components/AutomationModal';
import { SettingsModal } from './components/SettingsModal';
import { GameModesModal } from './components/GameModesModal';
import { HunterCodexModal } from './components/HunterCodexModal';
import { MysteryFlashPopup } from './components/MysteryFlashPopup';
import { BackpackModal } from './components/BackpackModal';
import FusionModal from './components/FusionModal';
import { FusedTempleModal } from './components/FusedTempleModal';
import { TacticalPlansModal } from './components/TacticalPlansModal';
import { QuickDeployModal } from './components/QuickDeployModal';
import { OverseerCutsceneModal } from './components/OverseerCutsceneModal';
import { UnrivaledCutsceneModal } from './components/UnrivaledCutsceneModal';
import { WarperBladeClashCutsceneModal } from './components/WarperBladeClashCutsceneModal';
import { SkyChasingCutsceneModal } from './components/SkyChasingCutsceneModal';
import { WarperInfectionCutsceneModal } from './components/WarperInfectionCutsceneModal';
import { TitanBaseReturnCutsceneModal } from './components/TitanBaseReturnCutsceneModal';
import { BaseAttackPart1CutsceneModal } from './components/BaseAttackPart1CutsceneModal';
import { BaseAttackPart2CutsceneModal } from './components/BaseAttackPart2CutsceneModal';
import { BaseAttackPart3CutsceneModal } from './components/BaseAttackPart3CutsceneModal';
import { LoreTitanTransformationCutsceneModal } from './components/LoreTitanTransformationCutsceneModal';
import { WarperReturnCutsceneModal } from './components/WarperReturnCutsceneModal';
import { SkyModeInfoBox } from './components/SkyModeInfoBox';
import { DailyMissionsModal } from './components/DailyMissionsModal';
import { DailyMissionsHUD } from './components/DailyMissionsHUD';
import { CurrencyConverterModal } from './components/CurrencyConverterModal';
import { InteractiveTutorial } from './components/InteractiveTutorial';
import { RelicVaultModal } from './components/RelicVaultModal';
import { RelicDetailModal } from './components/RelicDetailModal';
import { RelicDiscoveredModal } from './components/RelicDiscoveredModal';
import { RELICS, RelicDef } from './relics';
import { WaveMVPPopup } from './components/WaveMVPPopup';
import { ElementalBoardModal } from './components/ElementalBoardModal';
import { PlayerTradeModal } from './components/PlayerTradeModal';
import { SummonCutsceneModal } from './components/SummonCutsceneModal';
import { TitanUpgradeModal } from './components/TitanUpgradeModal';
import { UltraBossVictoryModal } from './components/UltraBossVictoryModal';
import { AnimalClashModal } from './components/AnimalClashModal';
import { PrimalArcadeModal } from './components/PrimalArcadeModal';
import { BadgesModal } from './components/BadgesModal';
import { LoreChronicleHUD } from './components/LoreChronicleHUD';
import { LoreCodexModal } from './components/LoreCodexModal';
import { isAnimalUnlockedInLoreMode, getAnimalUnlockWave } from './data/loreCampaign';
import { getTacticalPlan, selectDiverseAnimalForTacticalPlan, TACTICAL_PLANS } from './data/tacticalPlans';
import { BADGES, getActiveBadge, checkNewBadgeUnlocks, getUniqueUnlockedBadges } from './badges';
import { ANIMALS } from './constants';
import { TRAITS } from './traits';
import { Animal, Rarity, Badge, TacticalPlan } from './types';
import CapybaraAvatar from './components/CapybaraAvatar';
import AnimalAvatar from './components/AnimalAvatar';
import { UnitProfilePanel } from './components/UnitProfilePanel';
import { DevConsole } from './components/DevConsole';
import { LoadingScreen } from './components/LoadingScreen';
import { WelcomeScreen } from './components/WelcomeScreen';
import { GameGuideModal } from './components/GameGuideModal';
import { AdminSecurityModal } from './components/AdminSecurityModal';
import { gameAudio } from './utils/audio';

const RARITY_ORDER: Record<string, number> = {
  'Arcane': 13,
  'The Chillful': 12,
  'Overseer': 11,
  'Original': 10,
  '???': 9,
  'Celestial': 8,
  'Unrivaled': 7,
  'Secret': 6,
  'Mythic': 5,
  'Legendary': 4,
  'Epic': 3,
  'Rare': 2,
  'Common': 1
};

const RARITY_STYLE_CONFIG: Record<string, { label: string; shortLabel: string; activeBorder: string; activeBg: string; activeText: string; dot: string; glow: string }> = {
  'Arcane': { label: 'Arcane', shortLabel: 'Arc', activeBorder: 'border-purple-400', activeBg: 'bg-purple-950/80', activeText: 'text-purple-300', dot: 'bg-purple-400', glow: 'shadow-[0_0_8px_rgba(168,85,247,0.4)]' },
  'Overseer': { label: 'Overseer', shortLabel: 'Ovr', activeBorder: 'border-amber-400', activeBg: 'bg-amber-950/80', activeText: 'text-amber-300', dot: 'bg-amber-400', glow: 'shadow-[0_0_8px_rgba(245,158,11,0.4)]' },
  'Unrivaled': { label: 'Unrivaled', shortLabel: 'Unr', activeBorder: 'border-red-400', activeBg: 'bg-red-950/80', activeText: 'text-red-300', dot: 'bg-red-400', glow: 'shadow-[0_0_8px_rgba(239,68,68,0.4)]' },
  'Original': { label: 'Original', shortLabel: 'Org', activeBorder: 'border-rose-400', activeBg: 'bg-rose-950/80', activeText: 'text-rose-300', dot: 'bg-rose-400', glow: 'shadow-[0_0_8px_rgba(244,63,94,0.4)]' },
  '???': { label: '???', shortLabel: '???', activeBorder: 'border-pink-400', activeBg: 'bg-pink-950/80', activeText: 'text-pink-300', dot: 'bg-pink-400', glow: 'shadow-[0_0_8px_rgba(236,72,153,0.4)]' },
  'Celestial': { label: 'Celestial', shortLabel: 'Cel', activeBorder: 'border-violet-400', activeBg: 'bg-violet-950/80', activeText: 'text-violet-300', dot: 'bg-violet-400', glow: 'shadow-[0_0_8px_rgba(139,92,246,0.4)]' },
  'Secret': { label: 'Secret', shortLabel: 'Sec', activeBorder: 'border-cyan-400', activeBg: 'bg-cyan-950/80', activeText: 'text-cyan-300', dot: 'bg-cyan-400', glow: 'shadow-[0_0_8px_rgba(6,182,212,0.4)]' },
  'Mythic': { label: 'Mythic', shortLabel: 'Myth', activeBorder: 'border-orange-400', activeBg: 'bg-orange-950/80', activeText: 'text-orange-300', dot: 'bg-orange-400', glow: 'shadow-[0_0_8px_rgba(249,115,22,0.4)]' },
  'Legendary': { label: 'Legendary', shortLabel: 'Leg', activeBorder: 'border-yellow-400', activeBg: 'bg-yellow-950/80', activeText: 'text-yellow-300', dot: 'bg-yellow-400', glow: 'shadow-[0_0_8px_rgba(234,179,8,0.4)]' },
  'Epic': { label: 'Epic', shortLabel: 'Epic', activeBorder: 'border-indigo-400', activeBg: 'bg-indigo-950/80', activeText: 'text-indigo-300', dot: 'bg-indigo-400', glow: 'shadow-[0_0_8px_rgba(99,102,241,0.4)]' },
  'Rare': { label: 'Rare', shortLabel: 'Rare', activeBorder: 'border-blue-400', activeBg: 'bg-blue-950/80', activeText: 'text-blue-300', dot: 'bg-blue-400', glow: 'shadow-[0_0_8px_rgba(59,130,246,0.4)]' },
  'Common': { label: 'Common', shortLabel: 'Com', activeBorder: 'border-slate-400', activeBg: 'bg-slate-800/80', activeText: 'text-slate-200', dot: 'bg-slate-400', glow: 'shadow-[0_0_6px_rgba(148,163,184,0.3)]' },
};

const getRarityAuraClass = (rarity: string): string => {
  switch (rarity) {
    case 'Overseer':
    case 'Original':
    case 'Unrivaled':
    case '???':
      return 'aura-prismatic';
    case 'Celestial':
    case 'Secret':
    case 'Divine':
      return 'aura-cosmic';
    case 'Mythic':
    case 'Legendary':
      return 'aura-gold';
    case 'Epic':
      return 'aura-epic';
    case 'Rare':
      return 'aura-rare';
    default:
      return '';
  }
};

export default function App() {
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);
  const [selectedPlacedTowerId, setSelectedPlacedTowerId] = useState<string | null>(null);
  const [isTitanUpgradeModalOpen, setIsTitanUpgradeModalOpen] = useState<boolean>(false);
  const [isAnimalClashModalOpen, setIsAnimalClashModalOpen] = useState<boolean>(false);
  const [isArcadeModalOpen, setIsArcadeModalOpen] = useState<boolean>(false);
  const [placeOnlyBest, setPlaceOnlyBest] = useState<boolean>(false);
  const [selectedRarityFilters, setSelectedRarityFilters] = useState<string[]>([]);

  const { 
    gameState, 
    setGameState,
    towers, 
    setTowers,
    enemies, 
    setEnemies,
    projectiles, 
    setProjectiles,
    skillEffects,
    placeTower, 
    upgradeTower,
    bulkEvolveTowers,
    maxUpgradeTower,
    cheatMaxUpgradeTower,
    ascendTowerToPinnacle,
    upgradeTowerAlienTech,
    sellTower,
    sellAllTowers,
    pinnacleAllTowers,
    rerollTowerTrait,
    autoTuneBestFitTrait,
    triggerOverseerActiveSkill,
    toggleTitanForm,
    upgradeTitanPart,
    upgradeWarperPart,
    triggerUnrivaledFinisher,
    startWave, 
    waveSummary,
    setWaveSummary,
    resetGame,
    PATH,
    isOverseerCutsceneOpen,
    setIsOverseerCutsceneOpen,
    isUnrivaledCutsceneOpen,
    setIsUnrivaledCutsceneOpen,
    isWarperClashCutsceneOpen,
    setIsWarperClashCutsceneOpen,
    isSkyChasingCutsceneOpen,
    setIsSkyChasingCutsceneOpen,
    isWarperInfectionCutsceneOpen,
    setIsWarperInfectionCutsceneOpen,
    isTitanBaseReturnCutsceneOpen,
    setIsTitanBaseReturnCutsceneOpen,
    isBaseAttackPart1CutsceneOpen,
    setIsBaseAttackPart1CutsceneOpen,
    isBaseAttackPart2CutsceneOpen,
    setIsBaseAttackPart2CutsceneOpen,
    isBaseAttackPart3CutsceneOpen,
    setIsBaseAttackPart3CutsceneOpen,
    isLoreTitanCutsceneOpen,
    setIsLoreTitanCutsceneOpen,
    handleTransformTitanToMultiverse,
    isWarperReturnCutsceneOpen,
    setIsWarperReturnCutsceneOpen,
    handleWarperPurified,
    spawnHunterCommander,
    towersRef,
    gameStateRef,
    activeSlot,
    changeSlot,
    clearSlot,
    cloneSlot,
    elementalDamage,
    elementalHazards,
    shiftElementalHazards
  } = useGameLoop(selectedAnimalId, placeOnlyBest);

  const [isHazardOverlayOpen, setIsHazardOverlayOpen] = useState(false);
  const [isElementalBoardOpen, setIsElementalBoardOpen] = useState(false);
  const [isTradeOpen, setIsTradeOpen] = useState(false);
  const [isSummoningOpen, setIsSummoningOpen] = useState(false);
  const [isBackpackOpen, setIsBackpackOpen] = useState(false);
  const [isFusionOpen, setIsFusionOpen] = useState(false);
  const [isFusedTempleOpen, setIsFusedTempleOpen] = useState(false);
  const [isTacticalPlansOpen, setIsTacticalPlansOpen] = useState(false);
  const [isQuickDeployModalOpen, setIsQuickDeployModalOpen] = useState(false);
  const [isRelicVaultOpen, setIsRelicVaultOpen] = useState(false);
  const [isAutomationOpen, setIsAutomationOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGameModesModalOpen, setIsGameModesModalOpen] = useState(false);
  const [isLoreCodexOpen, setIsLoreCodexOpen] = useState(false);
  const [isHunterCodexOpen, setIsHunterCodexOpen] = useState(false);
  const [isDailyMissionsOpen, setIsDailyMissionsOpen] = useState(false);
  const [isConverterOpen, setIsConverterOpen] = useState(false);
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState(false);
  const [newBadgeToast, setNewBadgeToast] = useState<Badge | null>(null);
  const [newlyDiscoveredRelic, setNewlyDiscoveredRelic] = useState<RelicDef | null>(null);
  const [inspectingRelic, setInspectingRelic] = useState<RelicDef | null>(null);
  const [isGameHubOpen, setIsGameHubOpen] = useState(false);
  const [isSystemMenuOpen, setIsSystemMenuOpen] = useState(false);
  const [isLoadingScreen, setIsLoadingScreen] = useState<boolean>(true);
  const [isWelcomeScreen, setIsWelcomeScreen] = useState<boolean>(true);
  const [isGameGuideOpen, setIsGameGuideOpen] = useState<boolean>(false);
  const [isAdminSecurityOpen, setIsAdminSecurityOpen] = useState<boolean>(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        const completed = localStorage.getItem('df_completed_combat_tour');
        return completed !== 'true';
      }
    } catch (e) {
      // ignore
    }
    return false;
  });
  const [hoveredAnimal, setHoveredAnimal] = useState<Animal | null>(null);
  const [sidebarTab, setSidebarTab] = useState<'upgrades' | 'traits' | 'abilities' | 'skins' | 'lore' | 'hangar'>('upgrades');
  const [loreLoading, setLoreLoading] = useState(false);
  const [loreCache, setLoreCache] = useState<Record<string, { background: string; habitat: string }>>({});
  const [tuningResult, setTuningResult] = useState<{ trait: string, score: number, archetype: string } | null>(null);
  const [showSellAllConfirm, setShowSellAllConfirm] = useState<boolean>(false);
  const [pulseSidebar, setPulseSidebar] = useState<boolean>(false);
  const [ultraBossVictoryData, setUltraBossVictoryData] = useState<{
    isOpen: boolean;
    rewardShards: number;
    rewardMeat: number;
    rewardDna: number;
    killsCount: number;
  }>({
    isOpen: false,
    rewardShards: 50000,
    rewardMeat: 100000000,
    rewardDna: 10000000,
    killsCount: 1,
  });

  useEffect(() => {
    const handleBadgeUnlocked = (e: Event) => {
      const customEvent = e as CustomEvent<Badge>;
      if (customEvent.detail) {
        setNewBadgeToast(customEvent.detail);
      }
    };
    window.addEventListener('badge-unlocked', handleBadgeUnlocked);
    return () => {
      window.removeEventListener('badge-unlocked', handleBadgeUnlocked);
    };
  }, []);

  useEffect(() => {
    const handleRelicObtained = (e: Event) => {
      const customEvent = e as CustomEvent<{ relic: RelicDef }>;
      if (customEvent.detail && customEvent.detail.relic) {
        setNewlyDiscoveredRelic(customEvent.detail.relic);
        gameAudio.playSFX('victory');
      }
    };
    window.addEventListener('relic-obtained', handleRelicObtained);
    return () => {
      window.removeEventListener('relic-obtained', handleRelicObtained);
    };
  }, []);

  useEffect(() => {
    const handleClashWin = () => {
      setGameState(prev => ({
        ...prev,
        clashWins: (prev.clashWins || 0) + 1,
      }));
    };
    window.addEventListener('clash-win', handleClashWin);
    return () => {
      window.removeEventListener('clash-win', handleClashWin);
    };
  }, [setGameState]);

  // Real-time Badge Unlock Evaluator
  useEffect(() => {
    const newlyUnlocked = checkNewBadgeUnlocks(gameState, towers);
    if (newlyUnlocked.length > 0) {
      setGameState(prev => {
        const uniqueList = getUniqueUnlockedBadges({
          ...prev,
          unlockedBadges: [...(prev.unlockedBadges || []), ...newlyUnlocked]
        });
        return {
          ...prev,
          unlockedBadges: uniqueList,
          activeBadgeId: prev.activeBadgeId || newlyUnlocked[0],
        };
      });
      const firstBadge = BADGES.find(b => b.id === newlyUnlocked[0]);
      if (firstBadge && !gameState.disableAllNotifications) {
        setNewBadgeToast(firstBadge);
      }
    }
  }, [
    gameState.wave,
    gameState.meat,
    gameState.dna,
    gameState.shardsOfGods,
    gameState.ultraBossKills,
    gameState.ultraBossSlayer,
    gameState.isHardcore,
    gameState.isTrueHell,
    gameState.isSuddenDeath,
    gameState.isBossRush,
    gameState.currentStage,
    gameState.summonedAnimals,
    gameState.clashWins,
    gameState.arcaneWarperUses,
    gameState.disableAllNotifications,
    towers,
    setGameState
  ]);

  useEffect(() => {
    const handleUltraBossDefeated = (e: Event) => {
      const customEvent = e as CustomEvent<{
        rewardShards: number;
        rewardMeat: number;
        rewardDna: number;
        killsCount: number;
      }>;
      const detail = customEvent.detail;
      setUltraBossVictoryData({
        isOpen: true,
        rewardShards: detail?.rewardShards || 50000,
        rewardMeat: detail?.rewardMeat || 100000000,
        rewardDna: detail?.rewardDna || 10000000,
        killsCount: detail?.killsCount || 1,
      });
    };
    window.addEventListener('ultra-boss-defeated', handleUltraBossDefeated);
    return () => {
      window.removeEventListener('ultra-boss-defeated', handleUltraBossDefeated);
    };
  }, []);

  useEffect(() => {
    const handleTowerDamage = (e: Event) => {
      const customEvent = e as CustomEvent<{ towerId: string; amount: number }>;
      if (selectedPlacedTowerId && customEvent.detail.towerId === selectedPlacedTowerId) {
        setPulseSidebar(prev => {
          // If already pulsing, we quickly toggle it to re-trigger the animation
          if (prev) {
            return false;
          }
          return true;
        });
        // Ensure it resolves to true if toggled off
        setTimeout(() => {
          setPulseSidebar(true);
        }, 10);
      }
    };

    window.addEventListener('tower-dealt-damage', handleTowerDamage);
    return () => {
      window.removeEventListener('tower-dealt-damage', handleTowerDamage);
    };
  }, [selectedPlacedTowerId]);

  const changeTowerElement = (towerId: string, element: 'fire' | 'poison' | 'water' | 'sand' | 'dirt' | 'ice' | 'wind') => {
    setTowers(prev => prev.map(t => t.id === towerId ? { ...t, element } : t));
    try {
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { message: `Affinity aligned to ${element.toUpperCase()}!`, type: 'success' }
      }));
    } catch (e) {}
  };

  const changeAllDeitiesElement = (element: 'fire' | 'poison' | 'water' | 'sand' | 'dirt' | 'ice' | 'wind') => {
    setTowers(prev => prev.map(t => t.animalId === 'elemental_god' ? { ...t, element } : t));
    try {
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { message: `ALL Elemental Deities aligned to ${element.toUpperCase()}!`, type: 'success' }
      }));
    } catch (e) {}
  };

  // Dynamic Gacha Summon Unlock Toast Notifications
  const [toasts, setToasts] = useState<{ id: string; name: string; rarity: string; color: string }[]>([]);

  // Mastery Milestone Notifications
  const [masteryToasts, setMasteryToasts] = useState<{ id: string; animalName: string; level: number; isMajor: boolean; color: string; rarity: string }[]>([]);

  useEffect(() => {
    const handleMasteryMilestone = (e: Event) => {
      if (gameStateRef.current.disableAllNotifications) return;
      const detail = (e as CustomEvent).detail;
      const animal = ANIMALS.find(a => a.id === detail.animalId);
      if (!animal) return;

      const id = Math.random().toString(36).substring(2, 9);
      
      let rarityColor = '#a855f7'; // purple
      if (animal.rarity === 'Overseer') rarityColor = '#ec4899'; // pink
      else if (animal.rarity === 'Legendary') rarityColor = '#eab308'; // yellow
      else if (animal.rarity === 'Celestial') rarityColor = '#3b82f6'; // blue
      else if (animal.rarity === 'Unrivaled') rarityColor = '#ef4444'; // red
      else if (animal.rarity === 'Epic') rarityColor = '#a855f7'; // purple
      else if (animal.rarity === 'Rare') rarityColor = '#06b6d4'; // cyan

      setMasteryToasts(prev => [
        ...prev,
        {
          id,
          animalName: animal.name,
          level: detail.level,
          isMajor: detail.isMajor,
          color: rarityColor,
          rarity: animal.rarity
        }
      ]);

      // Automatically remove toast after 3.5 seconds
      setTimeout(() => {
        setMasteryToasts(prev => prev.filter(n => n.id !== id));
      }, 3500);
    };

    window.addEventListener('mastery-milestone', handleMasteryMilestone);
    return () => window.removeEventListener('mastery-milestone', handleMasteryMilestone);
  }, []);

  const dismissMasteryToast = (id: string) => {
    setMasteryToasts(prev => prev.filter(n => n.id !== id));
  };

  const dismissAllMasteryToasts = () => {
    setMasteryToasts([]);
  };

  useEffect(() => {
    const handleUnlock = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      // "turn of genome unlocked messages" - we disable creating bottom-right toasts
      // const id = Math.random().toString(36).substring(2, 9);
      // setToasts(prev => [...prev, { id, name: detail.name, rarity: detail.rarity, color: detail.color }]);
      // setTimeout(() => {
      //   setToasts(prev => prev.filter(t => t.id !== id));
      // }, 4000);

      // Trigger spectacular MysteryFlashPopup cutscene if a high-ranking anomaly is spliced in the background!
      if (!detail.noCutscene && (detail.rarity === 'Original' || detail.rarity === '???' || detail.rarity === 'Overseer')) {
        setMysteryPopup({
          isOpen: true,
          type: detail.rarity === 'Original' ? 'original' : (detail.rarity === 'Overseer' ? 'overseer' : 'unit'),
          name: detail.name,
          description: detail.skillDesc || 'An anomalous singularity of infinite power that corrupts and ruptures reality itself.'
        });
      }
    };
    window.addEventListener('auto-summon-unlock', handleUnlock);
    return () => window.removeEventListener('auto-summon-unlock', handleUnlock);
  }, []);

  const [unrivaledNotify, setUnrivaledNotify] = useState<{ type: 'void' | 'solar' | 'defeat'; active: boolean; message: string } | null>(null);

  useEffect(() => {
    const handleFinisher = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setUnrivaledNotify({
        type: detail.type,
        active: true,
        message: detail.type === 'void'
          ? '🌌 UNRIVALED VOID PULL ACTIVATED! SINGULARITY COLLAPSE GENERATING...'
          : '☀️ UNRIVALED COSMIC FLARE COGNITIVE OVERWRITE ACTIVE! MATRIX RESTORED!'
      });
      // Screen Shake effect
      const element = document.getElementById('game-stage-container');
      if (element) {
        element.classList.add('animate-bounce');
        setTimeout(() => element.classList.remove('animate-bounce'), 1500);
      }
    };

    const handleDefeat = () => {
      setUnrivaledNotify({
        type: 'defeat',
        active: true,
        message: '🏆 THE UNRIVALED ORIGINAL ENTIRELY DISSOLVED! COSMIC COORDINATES SECURED! (+100k Meat, +10k DNA, +10 God Shards)'
      });
      // Epic bounce
      const element = document.getElementById('game-stage-container');
      if (element) {
        element.classList.add('animate-ping');
        setTimeout(() => element.classList.remove('animate-ping'), 600);
      }
    };

    window.addEventListener('unrivaled-finisher-triggered', handleFinisher);
    window.addEventListener('unrivaled-boss-defeated', handleDefeat);
    return () => {
      window.removeEventListener('unrivaled-finisher-triggered', handleFinisher);
      window.removeEventListener('unrivaled-boss-defeated', handleDefeat);
    };
  }, []);

  const [isDevMode, setIsDevMode] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        const queryParams = new URLSearchParams(window.location.search);
        const hostEligible = window.location.hostname.includes('ais-dev') || window.location.hostname.includes('localhost') || window.location.hostname.includes('ais-pre');
        const queryEligible = queryParams.has('thenewduckieand') || queryParams.has('dev') || queryParams.has('admin');
        const prevSetting = localStorage.getItem('df_dev_mode_exclusive_thenewduckie');
        
        if (hostEligible || queryEligible) {
          if (prevSetting === 'false') return false;
          return true;
        }
        return prevSetting === 'true';
      }
    } catch (e) {
      // ignore
    }
    return false;
  });
  const [isDevPanelOpen, setIsDevPanelOpen] = useState(true);
  const [devInvincible, setDevInvincible] = useState<boolean>(() => {
    try {
      return localStorage.getItem('df_dev_invincible') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [devSpeed, setDevSpeed] = useState<number>(() => {
    try {
      return parseFloat(localStorage.getItem('df_dev_speed') || '1.0');
    } catch (e) {
      return 1.0;
    }
  });
  const [titleClicks, setTitleClicks] = useState(0);

  const [mysteryPopup, setMysteryPopup] = useState<{ isOpen: boolean; type: 'unit' | 'trait' | 'original' | 'overseer'; name: string; description: string }>({
    isOpen: false,
    type: 'unit',
    name: '',
    description: '',
  });

  const [devSummonCutscene, setDevSummonCutscene] = useState<{ isOpen: boolean; animals: Animal[] }>({
    isOpen: false,
    animals: []
  });

  const [traitWarning, setTraitWarning] = useState<{
    isOpen: boolean;
    type: 'reroll' | 'autotune';
    towerId: string;
    traitName: string;
    traitRarity: string;
    traitColor: string;
  } | null>(null);

  const handleSummonComplete = (
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
  ) => {
    setGameState(prev => ({
      ...prev,
      dna: prev.dna + netDnaDiff,
      shardsOfGods: Math.max(0, (prev.shardsOfGods ?? 20) - (shardsSpent ?? 0)),
      capyCoins: Math.max(0, (prev.capyCoins ?? 0) - (capyCoinsSpent ?? 0)),
      summonedAnimals: [...new Set([...prev.summonedAnimals, ...unlockedIds])],
      secretPity: finalSecretPity,
      celestialPity: finalCelestialPity,
      mysteryPity: finalMysteryPity,
      originalPity: finalOriginalPity !== undefined ? finalOriginalPity : (prev.originalPity ?? 0),
      overseerPity: finalOverseerPity !== undefined ? finalOverseerPity : (prev.overseerPity ?? 0),
      unrivaledPity: finalUnrivaledPity !== undefined ? finalUnrivaledPity : (prev.unrivaledPity ?? 0),
      capyPity: finalCapyPity !== undefined ? finalCapyPity : (prev.capyPity ?? 0),
    }));
  };

  const setAutoSellDuplicates = (val: boolean) => {
    setGameState(prev => ({ ...prev, autoSellDuplicates: val }));
  };

  const setAutoSellCommons = (val: boolean) => {
    setGameState(prev => ({ ...prev, autoSellCommons: val }));
  };

  const setAutoSellRares = (val: boolean) => {
    setGameState(prev => ({ ...prev, autoSellRares: val }));
  };

  const setAutoSellEpics = (val: boolean) => {
    setGameState(prev => ({ ...prev, autoSellEpics: val }));
  };

  const setAutoSellLegendaries = (val: boolean) => {
    setGameState(prev => ({ ...prev, autoSellLegendaries: val }));
  };

  const setAutoDeployWaves = (val: boolean) => {
    setGameState(prev => ({ ...prev, autoDeployWaves: val }));
  };

  const setAutoDeployTowers = (val: boolean) => {
    setGameState(prev => ({ ...prev, autoDeployTowers: val }));
  };

  const setAutoDeployUnitId = (val: string) => {
    setGameState(prev => ({ ...prev, autoDeployUnitId: val }));
  };

  const setAutoUpgradeTowers = (val: boolean) => {
    setGameState(prev => ({ ...prev, autoUpgradeTowers: val }));
  };

  const setAutoSummon = (val: boolean) => {
    setGameState(prev => ({ ...prev, autoSummon: val }));
  };

  const setAutoSummonAltar = (val: 'standard' | 'quantum' | 'ultra') => {
    setGameState(prev => ({ ...prev, autoSummonAltar: val }));
  };

  const handleAddMeat = () => {
    setGameState(prev => ({
      ...prev,
      meat: prev.meat + 500
    }));
  };

  const handleAddDna = () => {
    setGameState(prev => ({
      ...prev,
      dna: prev.dna + 500
    }));
  };

  const handleAdd5000Dna = () => {
    setGameState(prev => ({
      ...prev,
      dna: prev.dna + 5000
    }));
  };

  const purgeLowerRarities = () => {
    const keepRarities = ['Secret', 'Unrivaled', 'Celestial', '???', 'Original', 'Overseer', 'Arcane', 'The Chillful'];
    const keptAnimalIds = ANIMALS.filter(a => keepRarities.includes(a.rarity) || a.role === 'support' || a.id === 'capybara').map(a => a.id);
    
    let totalCompensation = 0;
    gameState.summonedAnimals.forEach(id => {
      const animal = ANIMALS.find(a => a.id === id);
      if (animal && !keepRarities.includes(animal.rarity) && animal.role !== 'support' && animal.id !== 'capybara') {
        if (animal.rarity === 'Common') totalCompensation += 45;
        else if (animal.rarity === 'Rare') totalCompensation += 60;
        else if (animal.rarity === 'Epic') totalCompensation += 80;
        else if (animal.rarity === 'Legendary') totalCompensation += 100;
        else if (animal.rarity === 'Mythic') totalCompensation += 150;
        else totalCompensation += 120;
      }
    });

    // Double Helix Genome Relic: +60% DNA recycling/compensation yield
    if (gameState.equippedRelicIds?.includes('double_helix')) {
      totalCompensation = Math.floor(totalCompensation * 1.6);
    }

    setGameState(prev => {
      const nextSummoned = prev.summonedAnimals.filter(id => keptAnimalIds.includes(id));
      return {
        ...prev,
        dna: prev.dna + totalCompensation,
        summonedAnimals: nextSummoned
      };
    });

    if (selectedAnimalId) {
      const selectedAnimal = ANIMALS.find(a => a.id === selectedAnimalId);
      if (selectedAnimal && !keepRarities.includes(selectedAnimal.rarity)) {
        setSelectedAnimalId(null);
      }
    }
  };

  const calculateAnimalRefund = (animal: Animal) => {
    const meatRefund = Math.floor(animal.cost * 0.7);
    let dnaCompensation = 45;
    if (animal.rarity === 'Common') dnaCompensation = 45;
    else if (animal.rarity === 'Rare') dnaCompensation = 60;
    else if (animal.rarity === 'Epic') dnaCompensation = 80;
    else if (animal.rarity === 'Legendary') dnaCompensation = 100;
    else if (animal.rarity === 'Mythic') dnaCompensation = 150;
    else if (animal.rarity === 'Secret' || animal.rarity === 'Celestial') dnaCompensation = 300;
    else if (animal.rarity === '???' || animal.rarity === 'Original') dnaCompensation = 500;
    else if (animal.rarity === 'Overseer' || animal.rarity === 'Unrivaled' || animal.rarity === 'Arcane' || animal.rarity === 'The Chillful') dnaCompensation = 1000;
    else dnaCompensation = 120;

    if (gameState.equippedRelicIds?.includes('double_helix')) {
      dnaCompensation = Math.floor(dnaCompensation * 1.6);
    }

    return { meatRefund, dnaCompensation };
  };

  const handleSellInventoryAnimal = (animalId: string): boolean => {
    if (gameState.summonedAnimals.length <= 1) {
      return false; // Preserve at least 1 unit
    }
    const animal = ANIMALS.find(a => a.id === animalId);
    if (!animal) return false;

    const { meatRefund, dnaCompensation } = calculateAnimalRefund(animal);

    setGameState(prev => {
      const nextSummoned = prev.summonedAnimals.filter(id => id !== animalId);
      const nextQuickDeploy = prev.quickDeployUnitIds?.filter(id => id !== animalId) || [];
      return {
        ...prev,
        meat: prev.meat + meatRefund,
        dna: prev.dna + dnaCompensation,
        summonedAnimals: nextSummoned,
        quickDeployUnitIds: nextQuickDeploy
      };
    });

    if (selectedAnimalId === animalId) {
      const remaining = gameState.summonedAnimals.filter(id => id !== animalId);
      setSelectedAnimalId(remaining.length > 0 ? remaining[0] : null);
    }

    return true;
  };

  const handleBulkSellInventoryAnimals = (animalIds: string[]): { count: number; totalMeat: number; totalDna: number } => {
    if (animalIds.length === 0) return { count: 0, totalMeat: 0, totalDna: 0 };
    
    let idsToSell = [...animalIds];
    if (idsToSell.length >= gameState.summonedAnimals.length) {
      idsToSell = idsToSell.slice(0, gameState.summonedAnimals.length - 1);
    }

    if (idsToSell.length === 0) return { count: 0, totalMeat: 0, totalDna: 0 };

    let totalMeat = 0;
    let totalDna = 0;

    idsToSell.forEach(id => {
      const animal = ANIMALS.find(a => a.id === id);
      if (animal) {
        const { meatRefund, dnaCompensation } = calculateAnimalRefund(animal);
        totalMeat += meatRefund;
        totalDna += dnaCompensation;
      }
    });

    setGameState(prev => {
      const nextSummoned = prev.summonedAnimals.filter(id => !idsToSell.includes(id));
      const nextQuickDeploy = prev.quickDeployUnitIds?.filter(id => !idsToSell.includes(id)) || [];
      return {
        ...prev,
        meat: prev.meat + totalMeat,
        dna: prev.dna + totalDna,
        summonedAnimals: nextSummoned,
        quickDeployUnitIds: nextQuickDeploy
      };
    });

    if (selectedAnimalId && idsToSell.includes(selectedAnimalId)) {
      const remaining = gameState.summonedAnimals.filter(id => !idsToSell.includes(id));
      setSelectedAnimalId(remaining.length > 0 ? remaining[0] : null);
    }

    return { count: idsToSell.length, totalMeat, totalDna };
  };

  const handleFuse = (parentAId: string, parentBId: string, resultId: string, dnaCost: number) => {
    setGameState(prev => {
      let removedA = false;
      let removedB = false;
      
      const nextSummoned = prev.summonedAnimals.filter(id => {
        if (id === parentAId && !removedA) {
          removedA = true;
          return false;
        }
        if (id === parentBId && !removedB) {
          removedB = true;
          return false;
        }
        return true;
      });

      nextSummoned.push(resultId);

      return {
        ...prev,
        dna: Math.max(0, prev.dna - dnaCost),
        fusedTempleEssence: (prev.fusedTempleEssence || 0) + 15,
        totalFusionsCompleted: (prev.totalFusionsCompleted || 0) + 1,
        summonedAnimals: nextSummoned
      };
    });
  };

  const handleFuseTempleUnit = (unit1: Animal, unit2: Animal, outputUnit: Animal, dnaCost: number, essenceGain: number) => {
    if (gameState.dna < dnaCost) {
      return { success: false, message: `Insufficient DNA! Need ${dnaCost.toLocaleString()} DNA.` };
    }

    const newRecord: import('./types').FusionRecord = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      component1: {
        id: unit1.id,
        name: unit1.name,
        rarity: unit1.rarity,
        color: unit1.color,
        emoji: unit1.emoji || '🧬'
      },
      component2: {
        id: unit2.id,
        name: unit2.name,
        rarity: unit2.rarity,
        color: unit2.color,
        emoji: unit2.emoji || '🧬'
      },
      result: {
        id: outputUnit.id,
        name: outputUnit.name,
        rarity: outputUnit.rarity,
        color: outputUnit.color,
        emoji: outputUnit.emoji || '🧪',
        damage: outputUnit.damage
      },
      dnaCost,
      essenceGain
    };

    setGameState(prev => {
      let removedA = false;
      let removedB = false;
      
      const nextSummoned = prev.summonedAnimals.filter(id => {
        if (id === unit1.id && !removedA) {
          removedA = true;
          return false;
        }
        if (id === unit2.id && !removedB) {
          removedB = true;
          return false;
        }
        return true;
      });

      nextSummoned.push(outputUnit.id);

      return {
        ...prev,
        dna: Math.max(0, prev.dna - dnaCost),
        fusedTempleEssence: (prev.fusedTempleEssence || 0) + essenceGain,
        totalFusionsCompleted: (prev.totalFusionsCompleted || 0) + 1,
        summonedAnimals: nextSummoned,
        fusionHistory: [newRecord, ...(prev.fusionHistory || [])].slice(0, 10)
      };
    });

    try {
      gameAudio.playSFX('victory', outputUnit.rarity);
    } catch {}

    return {
      success: true,
      message: `Sacred Synthesis Complete: [FUSED] ${outputUnit.name} awakened! (+${essenceGain} Temple Essence)`,
      outputUnit
    };
  };

  const handleBulkAutoFuse = (pairs: { unit1: Animal; unit2: Animal; outputUnit: Animal; dnaCost: number; essenceGain: number }[]) => {
    let totalDnaSpent = 0;
    let totalEssenceGained = 0;
    const addedIds: string[] = [];
    const removedIds: string[] = [];

    const newRecords: import('./types').FusionRecord[] = pairs.map(p => ({
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      component1: {
        id: p.unit1.id,
        name: p.unit1.name,
        rarity: p.unit1.rarity,
        color: p.unit1.color,
        emoji: p.unit1.emoji || '🧬'
      },
      component2: {
        id: p.unit2.id,
        name: p.unit2.name,
        rarity: p.unit2.rarity,
        color: p.unit2.color,
        emoji: p.unit2.emoji || '🧬'
      },
      result: {
        id: p.outputUnit.id,
        name: p.outputUnit.name,
        rarity: p.outputUnit.rarity,
        color: p.outputUnit.color,
        emoji: p.outputUnit.emoji || '🧪',
        damage: p.outputUnit.damage
      },
      dnaCost: p.dnaCost,
      essenceGain: p.essenceGain
    }));

    pairs.forEach(p => {
      totalDnaSpent += p.dnaCost;
      totalEssenceGained += p.essenceGain;
      addedIds.push(p.outputUnit.id);
      removedIds.push(p.unit1.id, p.unit2.id);
    });

    setGameState(prev => {
      const remainingSummoned = [...prev.summonedAnimals];
      removedIds.forEach(idToRemove => {
        const idx = remainingSummoned.indexOf(idToRemove);
        if (idx !== -1) {
          remainingSummoned.splice(idx, 1);
        }
      });

      return {
        ...prev,
        dna: Math.max(0, prev.dna - totalDnaSpent),
        fusedTempleEssence: (prev.fusedTempleEssence || 0) + totalEssenceGained,
        totalFusionsCompleted: (prev.totalFusionsCompleted || 0) + pairs.length,
        summonedAnimals: [...remainingSummoned, ...addedIds],
        fusionHistory: [...newRecords, ...(prev.fusionHistory || [])].slice(0, 10)
      };
    });

    try {
      gameAudio.playSFX('victory');
    } catch {}

    return {
      success: true,
      message: `Auto-Rite synthesized ${pairs.length} Fused Constructs for -${totalDnaSpent.toLocaleString()} DNA and +${totalEssenceGained} Temple Essence!`,
      count: pairs.length,
      totalDna: totalDnaSpent,
      totalEssence: totalEssenceGained
    };
  };

  const handleUpgradeTemple = (nextLevel: number, dnaCost: number, essenceCost: number) => {
    if (gameState.dna < dnaCost || (gameState.fusedTempleEssence || 0) < essenceCost) {
      return { success: false, message: "Insufficient DNA or Temple Essences." };
    }

    setGameState(prev => ({
      ...prev,
      dna: prev.dna - dnaCost,
      fusedTempleEssence: (prev.fusedTempleEssence || 0) - essenceCost,
      fusedTempleLevel: nextLevel
    }));

    try {
      gameAudio.playSFX('upgrade');
    } catch {}

    return {
      success: true,
      message: `Temple Sanctuary elevated to Level ${nextLevel}! New passive blessings unlocked!`
    };
  };

  const handleSelectTacticalPlan = (planId: string) => {
    setGameState(prev => ({
      ...prev,
      activeTacticalPlanId: planId
    }));
  };

  const handleToggleAutoDiversify = (enabled: boolean) => {
    setGameState(prev => ({
      ...prev,
      tacticalAutoDiversify: enabled
    }));
  };

  const handleExecuteTacticalSquad = (plan: TacticalPlan) => {
    const owned = ANIMALS.filter(a => gameState.summonedAnimals.includes(a.id));
    if (owned.length === 0) {
      return { success: false, deployedCount: 0, message: "No owned constructs available for tactical squad!" };
    }

    let deployedCount = 0;
    let meatAvailable = gameState.meat;
    const simulatedTowers = [...towers];

    // Try deploying up to 4 units according to the plan's deficit roles
    for (let i = 0; i < 4; i++) {
      const bestDiversePick = selectDiverseAnimalForTacticalPlan(plan, owned, simulatedTowers, meatAvailable);
      if (!bestDiversePick || meatAvailable < bestDiversePick.cost) {
        break;
      }

      // Generate candidate grid spots across the battlefield
      let placed = false;
      const candidateX = [100, 180, 260, 340, 420, 500, 580, 660, 740, 140, 220, 300, 380, 460, 540, 620, 700];
      const candidateY = [100, 180, 260, 340, 420, 500, 140, 220, 300, 380, 460];
      
      // Shuffle candidates slightly
      const shuffledX = [...candidateX].sort(() => Math.random() - 0.5);
      const shuffledY = [...candidateY].sort(() => Math.random() - 0.5);

      for (let xi = 0; xi < shuffledX.length; xi++) {
        for (let yi = 0; yi < shuffledY.length; yi++) {
          const sx = shuffledX[xi];
          const sy = shuffledY[yi];
          if (placeTower(bestDiversePick.id, sx, sy)) {
            meatAvailable -= bestDiversePick.cost;
            deployedCount++;
            simulatedTowers.push({
              id: Math.random().toString(36).substr(2, 9),
              animalId: bestDiversePick.id,
              x: sx,
              y: sy,
              rotation: 0,
              lastFired: 0,
              level: 1
            });
            placed = true;
            break;
          }
        }
        if (placed) break;
      }

      if (!placed) break;
    }

    if (deployedCount > 0) {
      return {
        success: true,
        deployedCount,
        message: `Successfully executed "${plan.name}"! Deployed ${deployedCount} diversified tactical constructs.`
      };
    }

    return {
      success: false,
      deployedCount: 0,
      message: "Insufficient Meat or no open grid positions to deploy tactical squad."
    };
  };

  const handleCanvasClick = (x: number, y: number) => {
    let animalToPlaceId = selectedAnimalId;
    if (placeOnlyBest) {
      const best = getBestOwnedAnimal();
      if (best) {
        animalToPlaceId = best.id;
      }
    }

    if (animalToPlaceId) {
      const placed = placeTower(animalToPlaceId, x, y);
      if (placed) {
        if (placeOnlyBest) {
          setSelectedAnimalId(animalToPlaceId);
        } else {
          setSelectedAnimalId(null);
        }
      }
    } else {
      setSelectedPlacedTowerId(null);
    }
  };

  const handleTowerClick = (towerId: string) => {
    setSelectedPlacedTowerId(towerId);
    setSelectedAnimalId(null);
  };

  const ownedAnimals = useMemo(() => {
    return ANIMALS.filter(a => gameState.summonedAnimals.includes(a.id));
  }, [gameState.summonedAnimals]);

  const selectedDeployAnimal = useMemo(() => {
    if (selectedAnimalId) {
      return ANIMALS.find(a => a.id === selectedAnimalId) || null;
    }
    return null;
  }, [selectedAnimalId]);

  const handleUpdateQuickDeploy = (ids: string[]) => {
    setGameState(prev => ({
      ...prev,
      quickDeployUnitIds: ids
    }));
  };

  const quickDeckAnimals = useMemo(() => {
    const customIds = gameState.quickDeployUnitIds;
    if (customIds && customIds.length > 0) {
      const resolved = customIds
        .map(id => ownedAnimals.find(a => a.id === id))
        .filter((a): a is Animal => !!a);
      if (resolved.length > 0) return resolved;
    }
    const sorted = [...ownedAnimals].sort((a, b) => {
      const diff = (RARITY_ORDER[b.rarity] || 0) - (RARITY_ORDER[a.rarity] || 0);
      if (diff !== 0) return diff;
      return b.damage - a.damage;
    });
    return sorted.slice(0, 4);
  }, [ownedAnimals, gameState.quickDeployUnitIds]);

  const getOwnedAnimals = () => {
    return ownedAnimals;
  };

  const ownedRarityStats = useMemo(() => {
    const counts: Record<string, number> = {};
    ownedAnimals.forEach(a => {
      counts[a.rarity] = (counts[a.rarity] || 0) + 1;
    });
    const uniqueRarities = Object.keys(counts).sort(
      (a, b) => (RARITY_ORDER[b] || 0) - (RARITY_ORDER[a] || 0)
    );
    return { counts, uniqueRarities, total: ownedAnimals.length };
  }, [ownedAnimals]);

  const isAllRaritiesActive = selectedRarityFilters.length === 0;
  const isNoneRaritiesActive = selectedRarityFilters.includes('__none__');

  const filteredOwnedAnimals = useMemo(() => {
    if (isNoneRaritiesActive) return [];
    if (isAllRaritiesActive) return ownedAnimals;
    return ownedAnimals.filter(a => selectedRarityFilters.includes(a.rarity));
  }, [ownedAnimals, selectedRarityFilters, isAllRaritiesActive, isNoneRaritiesActive]);

  const toggleRarityFilter = (rarity: string) => {
    setSelectedRarityFilters(prev => {
      if (prev.length === 0 || prev.includes('__none__')) {
        // If showing all or none, clicking isolates this single rarity
        return [rarity];
      }
      if (prev.includes(rarity)) {
        const next = prev.filter(r => r !== rarity);
        if (next.length === 0) {
          return ['__none__'];
        }
        return next;
      } else {
        const next = [...prev, rarity];
        if (next.length === ownedRarityStats.uniqueRarities.length) {
          return []; // All selected -> reset to all
        }
        return next;
      }
    });
  };

  const selectAllRarities = () => {
    setSelectedRarityFilters([]);
  };

  const clearAllRarities = () => {
    setSelectedRarityFilters(['__none__']);
  };

  const invertRarityFilters = () => {
    if (isAllRaritiesActive) {
      setSelectedRarityFilters(['__none__']);
    } else if (isNoneRaritiesActive) {
      setSelectedRarityFilters([]);
    } else {
      const inverted = ownedRarityStats.uniqueRarities.filter(r => !selectedRarityFilters.includes(r));
      if (inverted.length === 0) {
        setSelectedRarityFilters(['__none__']);
      } else if (inverted.length === ownedRarityStats.uniqueRarities.length) {
        setSelectedRarityFilters([]);
      } else {
        setSelectedRarityFilters(inverted);
      }
    }
  };

  const getBestOwnedAnimal = () => {
    const owned = getOwnedAnimals();
    if (owned.length === 0) return null;

    // Prioritize 'elemental_god' as the absolute best ("elemental entity") if owned as requested
    const elementalEntity = owned.find(a => a.id === 'elemental_god');
    if (elementalEntity) {
      return elementalEntity;
    }

    const rarityRank: Record<string, number> = {
      'Arcane': 12,
      'Overseer': 11,
      'Unrivaled': 10,
      'Original': 9,
      '???': 8,
      'Celestial': 7,
      'Secret': 6,
      'Mythic': 5,
      'Legendary': 4,
      'Epic': 3,
      'Rare': 2,
      'Common': 1
    };

    const sorted = [...owned].sort((a, b) => {
      const rankA = rarityRank[a.rarity] || 0;
      const rankB = rarityRank[b.rarity] || 0;
      if (rankB !== rankA) {
        return rankB - rankA;
      }
      return (b.damage || 0) - (a.damage || 0);
    });

    return sorted[0];
  };

  const selectBestUnit = () => {
    const best = getBestOwnedAnimal();
    if (best) {
      setSelectedAnimalId(prev => (prev === best.id ? prev : best.id));
      setSelectedPlacedTowerId(prev => (prev === null ? null : null));
    }
  };

  // If "Place Only Best" is toggled, automatically enforce selection of the strongest unlocked animal
  useEffect(() => {
    if (placeOnlyBest) {
      const best = getBestOwnedAnimal();
      if (best) {
        setSelectedAnimalId(prev => (prev === best.id ? prev : best.id));
        setSelectedPlacedTowerId(prev => (prev === null ? null : null));
      }
    }
  }, [gameState.summonedAnimals, placeOnlyBest]);

  const selectedTower = towers.find(t => t.id === selectedPlacedTowerId);
  const selectedTowerAnimal = selectedTower ? ANIMALS.find(a => a.id === selectedTower.animalId) : null;

  const activeSidebarAnimal = selectedTowerAnimal || hoveredAnimal;

  const fetchLore = async (animal: Animal) => {
    if (!animal) return;
    if (loreCache[animal.id]) return;
    setLoreLoading(true);
    try {
      const res = await fetch('/api/animal-lore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: animal.id,
          name: animal.name,
          rarity: animal.rarity,
          role: animal.role,
          isExtinct: animal.isExtinct,
          skillName: animal.skillName,
        }),
      });
      const data = await res.json();
      if (data.success && data.lore) {
        setLoreCache((prev) => ({
          ...prev,
          [animal.id]: data.lore,
        }));
      }
    } catch (err) {
      console.error('Failed to generate lore:', err);
    } finally {
      setLoreLoading(false);
    }
  };

  useEffect(() => {
    if (sidebarTab === 'lore' && activeSidebarAnimal) {
      fetchLore(activeSidebarAnimal);
    }
  }, [sidebarTab, activeSidebarAnimal]);
  const upgradeCost = selectedTower && selectedTowerAnimal ? Math.floor(selectedTowerAnimal.cost * (selectedTower.level + 1) * 0.5) : 0;

  const selectedTowerTraitDef = selectedTower ? (TRAITS[selectedTower.trait || 'Normal'] || TRAITS['Normal']) : null;
  const selectedTowerDmgMult = selectedTowerTraitDef ? (selectedTowerTraitDef.damageMultiplier ?? 1.0) : 1.0;
  const selectedTowerRangeMult = selectedTowerTraitDef ? (selectedTowerTraitDef.rangeMultiplier ?? 1.0) : 1.0;
  const selectedTowerFireRateMult = selectedTowerTraitDef ? (selectedTowerTraitDef.fireRateMultiplier ?? 1.0) : 1.0;

  const selectedTowerMasteryLvl = selectedTower ? ((selectedTower as any).masteryLevel || 1) : 1;
  const selectedTowerMasteryDmgMult = 1 + (selectedTowerMasteryLvl - 1) * 0.02;

  let selectedTowerDamage = selectedTower && selectedTowerAnimal 
    ? selectedTowerAnimal.damage * (1 + (selectedTower.level - 1) * 0.2) * selectedTowerDmgMult * selectedTowerMasteryDmgMult
    : 0;
  if (selectedTower && gameState.isHardcore) {
    selectedTowerDamage = selectedTowerDamage / 5;
  }
  // Primal Hearthstone Relic: +30% Global Tower Damage
  if (selectedTower && gameState.equippedRelicIds?.includes('primal_hearthstone')) {
    selectedTowerDamage = selectedTowerDamage * 1.30;
  }

  let selectedTowerRange = selectedTower && selectedTowerAnimal
    ? selectedTowerAnimal.range * (1 + (selectedTower.level - 1) * 0.1) * selectedTowerRangeMult
    : 0;
  // Quantum Magnet Relic: +40% Global Tower Attack Range
  if (selectedTower && gameState.equippedRelicIds?.includes('quantum_magnet')) {
    selectedTowerRange = selectedTowerRange * 1.40;
  }

  const selectedTowerCadence = selectedTower && selectedTowerAnimal
    ? 1000 / (selectedTowerAnimal.fireRate * selectedTowerFireRateMult)
    : 0;

  let totalUpgradeSpent = 0;
  if (selectedTower && selectedTowerAnimal) {
    for (let i = 1; i < selectedTower.level; i++) {
      totalUpgradeSpent += Math.floor(selectedTowerAnimal.cost * i * 0.5);
    }
  }
  const sellRefund = selectedTower && selectedTowerAnimal 
    ? Math.floor((selectedTowerAnimal.cost + totalUpgradeSpent) * 0.7) 
    : 0;

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white select-none overflow-hidden flex flex-col relative">
      <div className="immersive-bg"></div>

      {/* Header Stat Bar */}
      <header className="min-h-16 w-full bg-slate-900/80 backdrop-blur-md border-b border-white/10 flex flex-wrap items-center justify-between gap-3 px-4 sm:px-8 py-3 md:py-0 z-20 shadow-2xl">
        <div className="flex items-center space-x-3 flex-shrink-0">
          <div className="p-1.5 bg-green-500/20 rounded-lg border border-green-500/30">
            <div className="w-3.5 h-3.5 bg-green-400 rounded-full shadow-[0_0_10px_#4ade80]"></div>
          </div>
          <h1 
            onClick={() => {
              setTitleClicks(prev => {
                const next = prev + 1;
                if (next >= 5) {
                  if (!isDevMode) {
                    setIsAdminSecurityOpen(true);
                  } else {
                    setIsDevMode(false);
                    localStorage.setItem('df_dev_mode_exclusive_thenewduckie', 'false');
                    alert("🔒 Developer Mode Locked");
                  }
                  return 0;
                }
                return next;
              });
            }}
            className="text-xl sm:text-2xl font-black tracking-tighter uppercase italic text-green-400 cursor-pointer select-none"
            title="Primal Defense • 5 Clicks for Admin Security Gate"
          >
            Primal Defense
          </h1>
          <div className="flex flex-wrap gap-1.5 ml-2">
            {gameState.isSkyMode && (
              <button 
                onClick={() => setGameState(prev => ({ ...prev, isSkyMode: false }))}
                title="Click to disable Sky Game Mode"
                className="text-[9px] font-black tracking-widest bg-cyan-950/90 hover:bg-cyan-900 text-cyan-300 px-2.5 py-1 rounded-md border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.6)] animate-pulse uppercase flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              >
                ✈️ SKY MODE <span className="bg-cyan-500 text-slate-950 px-1 py-0.2 rounded text-[7.5px] font-black">EXIT ✕</span>
              </button>
            )}
            {gameState.isHardcore && (
              <span className="text-[9px] font-black tracking-widest bg-red-900/60 text-red-200 px-2.5 py-1 rounded-md border border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse uppercase flex items-center gap-1">
                ⚠️ HARDCORE ACTIVE
              </span>
            )}
            {gameState.isBossRush && (
              <button 
                onClick={() => setGameState(prev => ({ ...prev, isBossRush: false }))}
                title="Click to disable Boss Rush"
                className="text-[9px] font-black tracking-widest bg-violet-900/60 hover:bg-violet-800 text-violet-200 px-2.5 py-1 rounded-md border border-violet-500/40 shadow-[0_0_15px_rgba(139,92,246,0.4)] animate-pulse uppercase flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              >
                ☠️ BOSS RUSH <span className="text-[8px] opacity-75 font-mono">✕</span>
              </button>
            )}
            {gameState.isTrueHell && (
              <button 
                onClick={() => setGameState(prev => ({ ...prev, isTrueHell: false }))}
                title="Click to turn off True Hell Mode"
                className="text-[9px] font-black tracking-widest bg-orange-950/90 hover:bg-orange-900 text-orange-300 px-2.5 py-1 rounded-md border border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.6)] animate-pulse uppercase flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              >
                🔥 TRUE HELL <span className="bg-orange-500 text-slate-950 px-1 py-0.2 rounded text-[7.5px] font-black">EXIT ✕</span>
              </button>
            )}
            {gameState.isSuddenDeath && (
              <button 
                onClick={() => setGameState(prev => ({ ...prev, isSuddenDeath: false }))}
                title="Click to disable Sudden Death"
                className="text-[9px] font-black tracking-widest bg-amber-950/80 hover:bg-amber-900 text-amber-300 px-2.5 py-1 rounded-md border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.4)] animate-pulse uppercase flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              >
                ⚡ SUDDEN DEATH <span className="text-[8px] opacity-75 font-mono">✕</span>
              </button>
            )}
            {gameState.isSandbox && (
              <span className="text-[9px] font-black tracking-widest bg-emerald-900/60 text-emerald-300 px-2.5 py-1 rounded-md border border-emerald-500/40 shadow-[0_0_15px_rgba(168,85,247,0.4)] uppercase flex items-center gap-1">
                💎 SANDBOX ACTIVE
              </span>
            )}
          </div>
        </div>

        <div id="tutorial-currency-hub" className="hidden sm:flex items-center space-x-3 md:space-x-4 lg:space-x-5 bg-slate-950/60 border border-white/5 px-3 py-1.5 rounded-xl backdrop-blur-sm">
          <div className="flex flex-col items-end">
            <span className="text-[8px] uppercase tracking-widest text-slate-400 font-bold flex items-center gap-0.5">
              <Heart size={9} className="text-red-400" /> HP
            </span>
            <span className="text-sm font-mono text-red-400 font-bold">{gameState.health}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[8px] uppercase tracking-widest text-slate-400 font-bold flex items-center gap-0.5">
              🥩 Meat
            </span>
            <span className="text-sm font-mono text-yellow-400 font-bold">{Math.floor(gameState.meat).toLocaleString()}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[8px] uppercase tracking-widest text-slate-400 font-bold flex items-center gap-0.5">
              🧬 DNA
            </span>
            <span className="text-sm font-mono text-indigo-400 font-bold">{Math.floor(gameState.dna).toLocaleString()}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[8px] uppercase tracking-widest text-purple-300 font-bold flex items-center gap-0.5">
              ✨ Shards
            </span>
            <span className="text-sm font-mono text-purple-400 font-black">
              {(gameState.shardsOfGods || 0).toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col items-end" title="Arcane Shards (1% drop from normal enemies, used for Titan Defender Multiverse Form)">
            <span className="text-[8px] uppercase tracking-widest text-fuchsia-300 font-bold flex items-center gap-0.5">
              🔮 Arcane
            </span>
            <span className="text-sm font-mono text-fuchsia-400 font-black">
              {(gameState.arcaneShards || 0).toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[8px] uppercase tracking-widest text-lime-400 font-bold flex items-center gap-0.5">
              🪙 Capy Coins
            </span>
            <span className="text-sm font-mono text-lime-400 font-black">
              {(gameState.capyCoins || 0).toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[8px] uppercase tracking-widest text-amber-400 font-bold flex items-center gap-0.5" title="Arcade Game Tokens (10% drop chance from enemies)">
              🎮 Tokens
            </span>
            <span className="text-sm font-mono text-amber-400 font-black">
              {(gameState.gameTokens || 0).toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[8px] uppercase tracking-widest text-slate-400 font-bold flex items-center gap-0.5">
              ⚔️ Wave
            </span>
            <span className="text-sm font-mono text-cyan-400 font-black">{gameState.wave}</span>
          </div>
          {/* EQUIPPED TITLE BADGE - CLICKABLE TO OPEN HALL */}
          {(() => {
            const activeBadge = getActiveBadge(gameState);
            const uniqueUnlocked = getUniqueUnlockedBadges(gameState);
            const totalUnlocked = uniqueUnlocked.length;
            return (
              <button
                onClick={() => setIsBadgesModalOpen(true)}
                className="hidden xl:flex flex-col items-end justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 select-none pl-2 border-l border-white/10"
                title="Click to view & equip Badges, Titles and permanent Perks"
              >
                <span className="text-[7.5px] uppercase tracking-widest text-amber-300 font-black flex items-center gap-1">
                  🎖️ Title <span className="text-slate-400 font-mono text-[7px]">({totalUnlocked}/{BADGES.length})</span>
                </span>
                {activeBadge ? (
                  <div className={`p-[1px] rounded-md shadow-[0_0_12px_rgba(168,85,247,0.4)] ${activeBadge.borderClass}`}>
                    <span className={`bg-slate-950 px-1.5 py-0.2 rounded-[4px] text-[8.5px] font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r ${activeBadge.gradientClass} flex items-center gap-1`}>
                      <span>{activeBadge.icon}</span>
                      <span>{activeBadge.title}</span>
                    </span>
                  </div>
                ) : (
                  <div className="bg-slate-800/80 border border-slate-700 px-1.5 py-0.2 rounded-md text-[8px] font-bold text-slate-300 hover:text-white flex items-center gap-1">
                    <span>🎖️ Select Title</span>
                  </div>
                )}
              </button>
            );
          })()}
        </div>

        <div id="tutorial-wave-controller" className="flex items-center gap-2 relative">
          
          {/* ⚔️ Tactical Game Modes Hub Button */}
          <button
            onClick={() => {
              setIsGameModesModalOpen(true);
              setIsGameHubOpen(false);
              setIsSystemMenuOpen(false);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border cursor-pointer select-none ${
              gameState.isSkyMode || gameState.isHardcore || gameState.isBossRush || gameState.isTrueHell || gameState.isSuddenDeath || gameState.isGigaGacha || gameState.isSandbox
                ? 'bg-gradient-to-r from-cyan-600/30 to-amber-600/30 text-cyan-200 border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.3)] animate-pulse'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-white/10 hover:text-white'
            }`}
            title="Tactical Game Modes Hub (Sky Game Mode, Hardcore, Boss Rush, True Hell, Sudden Death, Giga Gacha, Sandbox)"
          >
            <Swords size={13} className="text-cyan-400" />
            <span className="hidden sm:inline">Game Modes</span>
            <span className="sm:hidden">Modes</span>
            {(gameState.isSkyMode || gameState.isHardcore || gameState.isBossRush || gameState.isTrueHell || gameState.isSuddenDeath || gameState.isGigaGacha || gameState.isSandbox) && (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
            )}
          </button>

          {/* 🎮 Game Hub Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setIsGameHubOpen(!isGameHubOpen);
                setIsSystemMenuOpen(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border cursor-pointer select-none ${
                isGameHubOpen 
                  ? 'bg-gradient-to-r from-amber-500/30 to-purple-500/30 text-amber-200 border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-white/10 hover:text-white'
              }`}
              title="Game Modes & Social Features (Arcade, 1v1 Clash, P2P Trade, Badges & Missions)"
            >
              <Gamepad2 size={13} className="text-amber-400" />
              <span>Game Hub</span>
              <ChevronDown size={11} className={`text-slate-400 transition-transform ${isGameHubOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Game Hub Popover with Backdrop */}
            {isGameHubOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40 bg-transparent" 
                  onClick={() => setIsGameHubOpen(false)} 
                />
                <div 
                  className="absolute left-0 top-full mt-2 w-64 max-w-[calc(100vw-2rem)] p-2 bg-slate-900/98 border border-white/15 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.85)] backdrop-blur-xl z-50 flex flex-col gap-1.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="text-[8px] font-black uppercase tracking-widest text-slate-400 px-2 py-1 border-b border-white/10 flex justify-between items-center">
                    <span>Activities & Modes</span>
                    <span className="text-pink-400 font-bold">🎬 Previews</span>
                  </div>

                  {/* 🎬 Cutscenes & Lore Previews */}
                  <button
                    onClick={() => {
                      setIsDevPanelOpen(true);
                      setIsGameHubOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-pink-500/15 text-left transition-all border border-pink-500/40 bg-pink-950/20 text-pink-200 hover:text-pink-300 group cursor-pointer shadow-[0_0_12px_rgba(236,72,153,0.15)]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-pink-500/20 text-pink-400 group-hover:scale-110 transition-transform text-xs">🎬</span>
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-wide flex items-center gap-1.5 text-pink-300">
                          <span>Cutscene & Story Previews</span>
                          <span className="text-[7px] px-1 py-0.2 bg-pink-500 text-slate-950 rounded font-black">1-400</span>
                        </div>
                        <div className="text-[8px] text-slate-400">Preview Waves 1-400, Base Attacks & Ascensions</div>
                      </div>
                    </div>
                    <span className="text-[7.5px] bg-pink-500/20 text-pink-300 px-1.5 py-0.5 rounded font-black uppercase">Preview</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsGameModesModalOpen(true);
                      setIsGameHubOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-cyan-500/15 text-left transition-all border border-cyan-500/30 bg-cyan-950/20 text-cyan-200 hover:text-cyan-300 group cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 group-hover:scale-110 transition-transform text-xs">⚔️</span>
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-wide flex items-center gap-1.5">
                          <span>Tactical Game Modes</span>
                          <span className="text-[7px] px-1 py-0.2 bg-cyan-500 text-slate-950 rounded font-black">NEW</span>
                        </div>
                        <div className="text-[8px] text-slate-400">Sky Mode (Flight Req), Hardcore, Boss Rush & More</div>
                      </div>
                    </div>
                    <span className="text-[7.5px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded font-black uppercase">Modes</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsArcadeModalOpen(true);
                      setIsGameHubOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-amber-500/15 text-left transition-all border border-transparent hover:border-amber-500/30 text-slate-200 hover:text-amber-300 group cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform text-xs">🎮</span>
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-wide">Primal Arcade</div>
                        <div className="text-[8px] text-slate-400">Play Minigames for Meat, DNA & Shards</div>
                      </div>
                    </div>
                    <span className="text-[7.5px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-black uppercase">Play</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsAnimalClashModalOpen(true);
                      setIsGameHubOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-purple-500/15 text-left transition-all border border-transparent hover:border-purple-500/30 text-slate-200 hover:text-purple-300 group cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform text-xs">⚔️</span>
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-wide">Animal Clash (1v1)</div>
                        <div className="text-[8px] text-slate-400">PvP & CPU Tactical Battler</div>
                      </div>
                    </div>
                    <span className="text-[7.5px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-black uppercase">1v1</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsTradeOpen(true);
                      setIsGameHubOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-orange-500/15 text-left transition-all border border-transparent hover:border-orange-500/30 text-slate-200 hover:text-orange-300 group cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 group-hover:scale-110 transition-transform text-xs">🤝</span>
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-wide">P2P Trade Network</div>
                        <div className="text-[8px] text-slate-400">Exchange Defender Genomes</div>
                      </div>
                    </div>
                    <span className="text-[7.5px] bg-orange-500/20 text-orange-300 px-1.5 py-0.5 rounded font-black uppercase">Trade</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsBadgesModalOpen(true);
                      setIsGameHubOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-cyan-500/15 text-left transition-all border border-transparent hover:border-cyan-500/30 text-slate-200 hover:text-cyan-300 group cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 group-hover:scale-110 transition-transform text-xs">🎖️</span>
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-wide">Badges & Titles</div>
                        <div className="text-[8px] text-slate-400">Showcase perks & achievements</div>
                      </div>
                    </div>
                    <span className="text-[7.5px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded font-black uppercase">
                      {getUniqueUnlockedBadges(gameState).length}/{BADGES.length}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setIsDailyMissionsOpen(true);
                      setIsGameHubOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-emerald-500/15 text-left transition-all border border-transparent hover:border-emerald-500/30 text-slate-200 hover:text-emerald-300 group cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform text-xs">🏆</span>
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-wide">Daily Missions</div>
                        <div className="text-[8px] text-slate-400">Claim daily bounty rewards</div>
                      </div>
                    </div>
                    <span className="text-[7.5px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-black uppercase">Bounties</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* ⚙️ System & Settings Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setIsSystemMenuOpen(!isSystemMenuOpen);
                setIsGameHubOpen(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border cursor-pointer select-none ${
                isSystemMenuOpen 
                  ? 'bg-indigo-600/30 text-indigo-200 border-indigo-400/50 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-white/10 hover:text-white'
              }`}
              title="Performance Mode, Tutorial Guide, Save Slots, Cheats & Config"
            >
              <Settings size={13} className="text-indigo-400" />
              <span className="hidden sm:inline">Settings</span>
              <ChevronDown size={11} className={`text-slate-400 transition-transform ${isSystemMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* System Menu Popover with Backdrop */}
            {isSystemMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40 bg-transparent" 
                  onClick={() => setIsSystemMenuOpen(false)} 
                />
                <div 
                  className="absolute right-0 top-full mt-2 w-64 max-w-[calc(100vw-2rem)] p-2.5 bg-slate-900/98 border border-white/15 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.85)] backdrop-blur-xl z-50 flex flex-col gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="text-[8px] font-black uppercase tracking-widest text-slate-400 px-1 border-b border-white/10 pb-1">
                    Engine & System Settings
                  </div>

                  {/* Performance Mode Selector */}
                  <div className="bg-slate-950/60 p-2 rounded-xl border border-white/5">
                    <div className="flex justify-between items-center text-[8.5px] font-black uppercase text-slate-400 mb-1">
                      <span>Performance Mode:</span>
                      <span className={gameState.ultraLagReduce ? 'text-rose-400' : (gameState.disableVFX ? 'text-amber-400' : 'text-cyan-400')}>
                        {gameState.ultraLagReduce ? 'Ultra Hitscan' : (gameState.disableVFX ? 'Fast (Low VFX)' : 'Full 60 FPS')}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 mt-1 text-[8px] font-bold">
                      <button
                        onClick={() => setGameState(prev => ({ ...prev, disableVFX: false, ultraLagReduce: false }))}
                        className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                          !gameState.disableVFX && !gameState.ultraLagReduce
                            ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-black'
                            : 'bg-slate-900 border-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        ✨ Full
                      </button>
                      <button
                        onClick={() => setGameState(prev => ({ ...prev, disableVFX: true, ultraLagReduce: false }))}
                        className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                          gameState.disableVFX && !gameState.ultraLagReduce
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-black'
                            : 'bg-slate-900 border-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        ⚡ Fast
                      </button>
                      <button
                        onClick={() => setGameState(prev => ({ ...prev, disableVFX: true, ultraLagReduce: true }))}
                        className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                          gameState.ultraLagReduce
                            ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 font-black'
                            : 'bg-slate-900 border-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        🚀 Hitscan
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => {
                        setIsGameGuideOpen(true);
                        setIsSystemMenuOpen(false);
                      }}
                      className="p-2 bg-slate-950/60 hover:bg-cyan-950/40 border border-white/5 hover:border-cyan-500/30 rounded-xl text-left transition-all cursor-pointer text-slate-300 hover:text-cyan-300 flex items-center gap-1.5"
                    >
                      <BookOpen size={13} className="text-cyan-400 flex-shrink-0" />
                      <span className="text-[9px] font-black uppercase">Tactical Guide</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsWelcomeScreen(true);
                        setIsSystemMenuOpen(false);
                      }}
                      className="p-2 bg-slate-950/60 hover:bg-emerald-950/40 border border-white/5 hover:border-emerald-500/30 rounded-xl text-left transition-all cursor-pointer text-slate-300 hover:text-emerald-300 flex items-center gap-1.5"
                    >
                      <Gamepad2 size={13} className="text-emerald-400 flex-shrink-0" />
                      <span className="text-[9px] font-black uppercase">Main Menu</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => {
                        setIsTutorialOpen(true);
                        setIsSystemMenuOpen(false);
                      }}
                      className="p-2 bg-slate-950/60 hover:bg-cyan-950/40 border border-white/5 hover:border-cyan-500/30 rounded-xl text-left transition-all cursor-pointer text-slate-300 hover:text-cyan-300 flex items-center gap-1.5"
                    >
                      <Info size={13} className="text-cyan-400 flex-shrink-0" />
                      <span className="text-[9px] font-black uppercase">Guide Tour</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsSettingsOpen(true);
                        setIsSystemMenuOpen(false);
                      }}
                      className="p-2 bg-slate-950/60 hover:bg-indigo-950/40 border border-white/5 hover:border-indigo-500/30 rounded-xl text-left transition-all cursor-pointer text-slate-300 hover:text-indigo-300 flex items-center gap-1.5"
                    >
                      <FolderClosed size={13} className="text-indigo-400 flex-shrink-0" />
                      <span className="text-[9px] font-black uppercase">Save Slots</span>
                    </button>
                  </div>

                  {/* Developer Cheats if Dev Mode is Enabled */}
                  {isDevMode && (
                    <div className="p-2 bg-purple-950/40 border border-purple-500/30 rounded-xl space-y-1.5">
                      <div className="flex justify-between items-center text-[8px] font-black uppercase text-purple-300">
                        <span>🛠️ Dev Mode Active</span>
                        <button 
                          onClick={() => setIsDevPanelOpen(!isDevPanelOpen)}
                          className="text-pink-400 hover:underline cursor-pointer"
                        >
                          {isDevPanelOpen ? 'Close Panel' : 'Open Panel'}
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-[8px] font-bold">
                        <button onClick={handleAddMeat} className="p-1 bg-slate-900 border border-white/10 rounded text-slate-300 hover:text-yellow-400 hover:border-yellow-400/40 cursor-pointer">+500 Meat</button>
                        <button onClick={handleAddDna} className="p-1 bg-slate-900 border border-white/10 rounded text-slate-300 hover:text-indigo-400 hover:border-indigo-400/40 cursor-pointer">+500 DNA</button>
                        <button onClick={handleAdd5000Dna} className="p-1 bg-slate-900 border border-white/10 rounded text-slate-300 hover:text-indigo-400 hover:border-indigo-400/40 cursor-pointer">+5k DNA</button>
                      </div>
                    </div>
                  )}

                  {/* Wipe Data Safeguard */}
                  <button
                    onClick={() => {
                      if (confirm("Are you sure you want to completely wipe all game data? This cannot be undone!")) {
                        resetGame();
                        setIsSystemMenuOpen(false);
                      }
                    }}
                    className="p-1.5 bg-red-950/30 hover:bg-red-900/50 border border-red-500/20 hover:border-red-500/40 rounded-xl text-center text-red-300 hover:text-red-200 text-[8.5px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 mt-1"
                  >
                    <Trash2 size={11} /> Wipe Game Data
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Auto-Deploy Wave Toggle */}
          <button
            onClick={() => setAutoDeployWaves(!gameState.autoDeployWaves)}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-black uppercase text-[10px] sm:text-xs tracking-wider transition-all border cursor-pointer select-none ${
              gameState.autoDeployWaves 
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'bg-slate-900/80 text-slate-400 border-white/10 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Toggle Continuous Auto-Deploy Waves"
          >
            <span className={`w-2 h-2 rounded-full ${gameState.autoDeployWaves ? 'bg-cyan-400 animate-ping' : 'bg-slate-600'}`}></span>
            <span className="hidden sm:inline">Auto-Wave:</span> {gameState.autoDeployWaves ? 'ON' : 'OFF'}
          </button>

          {/* Primary Action: Deploy Defenses (Start Wave) */}
          {!gameState.isWaveActive && !gameState.isGameOver && (
            <button 
              onClick={startWave}
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 px-3.5 sm:px-5 py-1.5 rounded-lg font-black uppercase text-[10px] sm:text-xs tracking-wider shadow-[0_0_20px_rgba(34,197,94,0.35)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Swords size={13} className="text-slate-950" /> Deploy
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 flex relative overflow-hidden">
        {/* Units Sidebar - Left Side */}
        <aside className="w-72 bg-slate-900/60 backdrop-blur-sm border-r border-white/5 p-4 z-10 flex flex-col space-y-4">
          {/* 🧬 SECTION 1: DNA SUMMON ALTAR */}
          <div id="tutorial-summon-altar" className="p-3 rounded-2xl bg-gradient-to-br from-indigo-950/80 via-slate-900/90 to-indigo-900/60 border border-indigo-500/30 shadow-[0_4px_20px_rgba(99,102,241,0.15)] space-y-2.5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
                  <Sparkles size={13} className="animate-pulse" />
                </div>
                <div>
                  <h2 className="text-[11px] font-black uppercase tracking-wider text-white leading-none">
                    Summon Altar
                  </h2>
                  <span className="text-[8px] text-indigo-300/80 font-mono leading-none">🧬 DNA Synthesizer</span>
                </div>
              </div>
              <span className="text-[9px] font-mono font-black text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded-md border border-indigo-500/30">
                {Math.floor(gameState.dna).toLocaleString()} DNA
              </span>
            </div>

            {/* Main Summon Lab Button */}
            <button 
              onClick={() => setIsSummoningOpen(true)}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-slate-950 font-black rounded-xl transition-all uppercase text-[10px] tracking-wider active:scale-95 shadow-[0_0_15px_rgba(99,102,241,0.35)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles size={13} className="text-slate-950 animate-bounce" style={{ animationDuration: '2s' }} /> 
              Open Summon Lab
            </button>

            {/* Auto-Summon Quick Toggle */}
            <div className="flex border border-white/10 rounded-xl overflow-hidden text-[9px] font-bold bg-slate-950/60">
              <button
                onClick={() => {
                  setGameState(prev => ({ ...prev, autoSummon: !prev.autoSummon }));
                }}
                className={`flex-1 py-1.5 text-center transition-all cursor-pointer select-none ${
                  gameState.autoSummon 
                    ? 'bg-emerald-500/20 text-emerald-300 font-black border-r border-emerald-500/30' 
                    : 'bg-transparent text-slate-400 hover:text-white'
                }`}
              >
                {gameState.autoSummon ? '⚡ AUTO-SUMMON ACTIVE' : '🤖 TOGGLE AUTO-SUMMON'}
              </button>
              {gameState.autoSummon && (
                <button
                  onClick={() => {
                    setGameState(prev => {
                      let nextAltar: 'standard' | 'quantum' | 'ultra' = 'standard';
                      if (prev.autoSummonAltar === 'standard') {
                        nextAltar = 'quantum';
                      } else if (prev.autoSummonAltar === 'quantum') {
                        nextAltar = 'ultra';
                      } else {
                        nextAltar = 'standard';
                      }
                      return { ...prev, autoSummonAltar: nextAltar };
                    });
                  }}
                  className="px-2 bg-indigo-950/70 text-indigo-300 hover:text-white uppercase tracking-tighter cursor-pointer select-none text-[8px] font-mono border-l border-white/10"
                  title="Cycle altar: Standard -> Quantum -> Gods Altar"
                >
                  {gameState.autoSummonAltar === 'ultra' ? '🔮 Gods' : (gameState.autoSummonAltar === 'quantum' ? '⚡ Quantum' : '🧪 Standard')}
                </button>
              )}
            </div>

            {/* Trait Mutator / Reroller */}
            <button
              onClick={() => {
                if (selectedPlacedTowerId) {
                  const rolled = rerollTowerTrait(selectedPlacedTowerId);
                  if (!rolled) {
                    alert("Unable to reroll! Requires 200 DNA Shards. Ensure a dispatched unit is selected!");
                  } else if (rolled === '???') {
                    setMysteryPopup({
                      isOpen: true,
                      type: 'trait',
                      name: '???',
                      description: 'An unstable cosmic mutation. Insinuates the host unit with absolute, extreme traits (+10,000% damage multiplier, +5,000% speed, and absolute multi-directional trajectory).'
                    });
                  }
                } else {
                  alert("Please select a dispatched unit on the combat map first to reroll!");
                }
              }}
              disabled={gameState.dna < 200}
              className={`w-full py-1.5 border border-purple-500/30 rounded-xl transition-all uppercase text-[8.5px] font-black tracking-wider active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer ${
                gameState.dna < 200 ? 'opacity-40 text-slate-500' : 'bg-purple-950/30 hover:bg-purple-900/40 text-purple-300 hover:border-purple-400'
              }`}
            >
              🧬 Reroll Trait (200 DNA)
            </button>

            {isDevMode && (
              <>
                {/* Auto Best Fit has been removed as requested */}
              </>
            )}

            {/* Active Automation Status Badges */}
            <div className="flex flex-wrap gap-1 items-center border-t border-white/5 pt-2">
              <span className={`text-[7.5px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-tighter ${gameState.autoSellDuplicates ?? true ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-950/40 text-slate-500 border border-white/5'}`}>
                ♻️ Auto-Sell Dups
              </span>
              {gameState.autoDeployWaves && (
                <span className="text-[7.5px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-tighter bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  🤖 Auto-Wave
                </span>
              )}
              {gameState.autoDeployTowers && (
                <span className="text-[7.5px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-tighter bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  🤖 Auto-Deploy
                </span>
              )}
              {gameState.autoUpgradeTowers && (
                <span className="text-[7.5px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-tighter bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  🤖 Auto-Evolve
                </span>
              )}
            </div>
          </div>

          {/* ⚔️ SECTION 2: FIELD SQUAD ACTIONS */}
          <div className="grid grid-cols-2 gap-1.5 bg-slate-950/40 p-2 rounded-2xl border border-white/5">
            <button 
              onClick={pinnacleAllTowers}
              disabled={towers.filter(t => t.level >= 20 && !t.isPinnacle).length === 0}
              className={`p-2 border rounded-xl transition-all uppercase text-[8.5px] tracking-wider font-extrabold active:scale-95 flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                towers.filter(t => t.level >= 20 && !t.isPinnacle).length > 0
                  ? 'bg-amber-950/50 hover:bg-amber-900/60 border-amber-500/40 hover:border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                  : 'bg-slate-950/20 text-slate-600 border-white/5 cursor-not-allowed'
              }`}
              title="Elevates all level-20 placed towers to Absolute Pinnacle (Costs 2000 DNA & 15k Meat per tower)."
            >
              <Crown size={12} className={towers.filter(t => t.level >= 20 && !t.isPinnacle).length > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-600'} />
              <span>Pinnacle All</span>
              <span className="text-[7px] font-mono text-slate-400">({towers.filter(t => t.level >= 20 && !t.isPinnacle).length})</span>
            </button>

            <button 
              onClick={() => {
                if (towers.length === 0) return;
                if (!showSellAllConfirm) {
                  setShowSellAllConfirm(true);
                } else {
                  sellAllTowers();
                  setSelectedPlacedTowerId(null);
                  setShowSellAllConfirm(false);
                }
              }}
              disabled={towers.length === 0}
              className={`p-2 border rounded-xl transition-all uppercase text-[8.5px] tracking-wider font-extrabold active:scale-95 flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                towers.length > 0
                  ? showSellAllConfirm
                    ? 'bg-red-600 hover:bg-red-700 border-red-400 text-white animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                    : 'bg-rose-950/40 hover:bg-rose-900/50 border-rose-500/30 hover:border-rose-400 text-rose-300'
                  : 'bg-slate-950/20 text-slate-600 border-white/5 cursor-not-allowed'
              }`}
              title="Reclaims and sells all active defending wildlife on the grid back into Meat."
            >
              <Coins size={12} className={towers.length > 0 ? 'text-rose-400' : 'text-slate-600'} />
              <span>{showSellAllConfirm ? 'Confirm Sell?' : 'Sell All'}</span>
              <span className="text-[7px] font-mono text-slate-400">({towers.length} Defenders)</span>
            </button>
          </div>

          {/* 🌐 SECTION 3: OPERATIONS COMMAND CENTER (Modular Launcher Grid) */}
          <div className="bg-slate-950/40 p-2.5 rounded-2xl border border-white/5 space-y-1.5">
            <div className="text-[8px] font-black uppercase tracking-widest text-slate-500 px-1 flex justify-between items-center">
              <span>Operations Hub</span>
              <span className="text-cyan-400 font-mono text-[7.5px]">Commands</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button 
                id="tutorial-autopilot"
                onClick={() => setIsAutomationOpen(true)}
                className="p-2 bg-slate-900/80 hover:bg-indigo-950/50 border border-white/5 hover:border-indigo-500/40 text-slate-300 hover:text-indigo-200 font-extrabold rounded-xl transition-all uppercase text-[8.5px] tracking-wide active:scale-95 flex items-center gap-1.5 cursor-pointer group"
              >
                <Bot size={12} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="truncate">Auto-Pilot</span>
              </button>

              <button 
                id="tutorial-missions"
                onClick={() => setIsDailyMissionsOpen(true)}
                className="p-2 bg-slate-900/80 hover:bg-amber-950/50 border border-white/5 hover:border-amber-500/40 text-slate-300 hover:text-amber-200 font-extrabold rounded-xl transition-all uppercase text-[8.5px] tracking-wide active:scale-95 flex items-center gap-1.5 cursor-pointer group"
              >
                <Trophy size={12} className="text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="truncate">Missions</span>
              </button>

              <button 
                onClick={() => setIsConverterOpen(true)}
                className="p-2 bg-slate-900/80 hover:bg-cyan-950/50 border border-white/5 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-200 font-extrabold rounded-xl transition-all uppercase text-[8.5px] tracking-wide active:scale-95 flex items-center gap-1.5 cursor-pointer group"
              >
                <RefreshCw size={11} className="text-cyan-400 group-hover:rotate-180 transition-transform duration-500" />
                <span className="truncate">Converter</span>
              </button>

              <button 
                onClick={() => setIsHunterCodexOpen(true)}
                className="p-2 bg-slate-900/80 hover:bg-emerald-950/50 border border-white/5 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-200 font-extrabold rounded-xl transition-all uppercase text-[8.5px] tracking-wide active:scale-95 flex items-center gap-1.5 cursor-pointer group"
              >
                <Radar size={12} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="truncate">Enemy Codex</span>
              </button>

              <button 
                onClick={() => setIsElementalBoardOpen(true)}
                className="p-2 bg-slate-900/80 hover:bg-rose-950/50 border border-white/5 hover:border-rose-500/40 text-slate-300 hover:text-rose-200 font-extrabold rounded-xl transition-all uppercase text-[8.5px] tracking-wide active:scale-95 flex items-center gap-1.5 cursor-pointer group"
              >
                <Zap size={12} className="text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="truncate">Elements</span>
              </button>

              <button 
                onClick={() => setIsTradeOpen(true)}
                className="p-2 bg-slate-900/80 hover:bg-orange-950/50 border border-white/5 hover:border-orange-500/40 text-slate-300 hover:text-orange-200 font-extrabold rounded-xl transition-all uppercase text-[8.5px] tracking-wide active:scale-95 flex items-center gap-1.5 cursor-pointer group"
              >
                <ArrowRightLeft size={12} className="text-orange-400 group-hover:scale-110 transition-transform" />
                <span className="truncate">P2P Trade</span>
              </button>
            </div>
          </div>

          {/* DIVINE SHARD SHOP */}
          <div className="p-3 bg-slate-950/40 border border-amber-500/10 rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-black tracking-wider text-amber-400 flex items-center gap-1">
                💎 Shard Devotion
              </span>
              <span className="font-mono bg-amber-950/50 px-2 py-0.5 rounded border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                💎 {gameState.shardsOfGods || 0}
              </span>
            </div>
            
            <div className="bg-slate-950/40 border border-white/5 rounded-lg p-2.5 space-y-1.5 hover:border-cyan-500/10 transition-all">
              <div className="flex justify-between items-center leading-none">
                <span className="text-[10px] font-black uppercase text-cyan-300">Nebula Beacon</span>
                <span className="text-[9px] font-black text-slate-400 font-mono">Stock: {gameState.bufferStock || 0}/8</span>
              </div>
              <p className="text-[8px] text-slate-400 leading-snug uppercase tracking-tighter">
                Amplifies surrounding towers inside aura range by +150% damage (2.5x multiplier).
              </p>
              
              <button
                onClick={() => {
                  const stock = gameState.bufferStock || 0;
                  if (stock >= 8) {
                    alert("Maximum 8 summons acquired! Overcharger stock depleted.");
                    return;
                  }
                  const shards = gameState.shardsOfGods || 0;
                  if (shards < 20) {
                    alert("Insufficient Divine Shards! Defeat waves (or boss stages) to gather Shards.");
                    return;
                  }
                  
                  setGameState(prev => {
                    const nextStock = (prev.bufferStock || 0) + 1;
                    const nextShards = (prev.shardsOfGods || 0) - 20;
                    const nextSummoned = prev.summonedAnimals.includes('buffer') 
                      ? prev.summonedAnimals 
                      : [...prev.summonedAnimals, 'buffer'];
                      
                    return {
                      ...prev,
                      bufferStock: nextStock,
                      shardsOfGods: nextShards,
                      summonedAnimals: nextSummoned
                    };
                  });
                  
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('auto-summon-unlock', { 
                      detail: { 
                        name: 'Nebula Overcharge Beacon', 
                        rarity: 'Secret', 
                        color: '#22d3ee',
                        skillDesc: 'High-frequency overcharger beacon bolstering all neighboring units within 180 coordinate area.'
                      } 
                    }));
                  }
                }}
                disabled={(gameState.bufferStock || 0) >= 8 || (gameState.shardsOfGods || 0) < 20}
                className={`w-full py-1.5 rounded text-[9px] font-black uppercase text-center active:scale-95 transition-all text-slate-950 flex items-center justify-center gap-1 cursor-pointer ${
                  (gameState.bufferStock || 0) >= 8
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                    : (gameState.shardsOfGods || 0) < 20
                      ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/20'
                      : 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400'
                }`}
              >
                {(gameState.bufferStock || 0) >= 8 ? 'MAX SUMMONS' : `SUMMON CORE (20 SHARDS)`}
              </button>
            </div>
          </div>

          {/* ENVIRONMENT & DIMENSION SELECTOR */}
          <div className="p-3 bg-slate-950/50 border border-white/10 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] uppercase font-black tracking-wider text-slate-300 flex items-center gap-1.5">
                <span>🌌</span> Realm & Dimension
              </h3>
              <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-wider bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-500/20">
                6 Realms
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-1.5 px-[1px]">
              {[
                { id: 'default', name: 'Void Core', cn: 'border-slate-800 bg-slate-900/30 text-slate-300 hover:border-slate-600', icon: '🪐' },
                { id: 'jungle', name: 'Lush Jungle', cn: 'border-emerald-900/40 bg-emerald-950/20 text-emerald-400 hover:border-emerald-600', icon: '🌿' },
                { id: 'savanna', name: 'Arid Savanna', cn: 'border-amber-900/40 bg-amber-950/20 text-yellow-400 hover:border-amber-600', icon: '🏜️' },
                { id: 'prehistoric', name: 'Prehistoric', cn: 'border-red-900/40 bg-red-950/20 text-red-400 hover:border-red-600', icon: '🌋' },
                { id: 'dimension_cosmic', name: 'Cosmic Rift', cn: 'border-purple-800/50 bg-purple-950/30 text-purple-300 hover:border-purple-500', icon: '🌌' },
                { id: 'dimension_abyss', name: 'Abyssal Void', cn: 'border-rose-900/50 bg-rose-950/30 text-rose-300 hover:border-rose-500', icon: '🌀' }
              ].map((stg, idx) => (
                <button
                  key={`stg-${stg.id}-${idx}`}
                  onClick={() => {
                    if (gameState.isWaveActive) {
                      alert("Please neutralise the active wave first!");
                      return;
                    }
                    setGameState(prev => ({ ...prev, currentStage: stg.id as any }));
                  }}
                  className={`p-1.5 border rounded-lg text-center text-[8.5px] font-extrabold uppercase transition-all cursor-pointer flex items-center justify-center gap-1 leading-none ${stg.cn} ${
                    (gameState.currentStage || 'default') === stg.id 
                      ? 'ring-2 ring-cyan-400 bg-cyan-950/50 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.3)]' 
                      : 'border-white/5'
                  }`}
                >
                  <span className="text-[10px]">{stg.icon}</span>
                  <span className="truncate">{stg.name}</span>
                </button>
              ))}
            </div>
            
            <p className="text-[7.5px] text-slate-400 uppercase tracking-tight font-extrabold text-center leading-normal">
              {gameState.currentStage === 'dimension_cosmic' 
                ? '🌌 Cosmic Dimension: +20% Tower Range & Starlight Ticks'
                : gameState.currentStage === 'dimension_abyss'
                ? '🌀 Abyssal Dimension: +25% Tower Damage & Void Singularity'
                : 'Changes path layout, enemy movement & elemental hazards'}
            </p>
          </div>

          {/* Unit Roster & Deployment Deck */}
          <div className="flex-1 flex flex-col overflow-y-auto scrollbar-hide space-y-2.5 pr-0.5">
            {/* Header with Purge button */}
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[10px] uppercase font-bold text-slate-400 tracking-widest flex items-center gap-1.5">
                <span>🛡️</span> DEPLOYMENT DECK
              </h3>
              <button
                onClick={purgeLowerRarities}
                className="text-[8.5px] font-black uppercase text-red-400 hover:text-red-300 border border-red-500/20 bg-red-950/20 px-2 py-0.5 rounded transition-all active:scale-95 flex items-center gap-1 hover:bg-red-950/40 cursor-pointer"
                title="Deletes all Common, Rare, Epic, Legendary, and Mythic units from your inventory to recycle into DNA Shards."
              >
                🧬 Purge Lower
              </button>
            </div>

            {/* 🎒 PRIMARY ACTION: Big Animated Open Backpack Button */}
            <button
              id="tutorial-unit-backpack"
              onClick={() => setIsBackpackOpen(true)}
              className="w-full p-2.5 bg-gradient-to-r from-cyan-600/30 via-indigo-600/30 to-teal-600/30 hover:from-cyan-600/45 hover:via-indigo-600/45 hover:to-teal-600/45 border border-cyan-400/40 hover:border-cyan-300 text-white rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all active:scale-[0.98] cursor-pointer group flex items-center justify-between relative overflow-hidden"
            >
              {/* Glowing animated backdrop */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
              
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-inner">
                  <Backpack size={16} className="animate-pulse" />
                </div>
                <div className="text-left">
                  <div className="text-[10.5px] font-black uppercase tracking-wider text-cyan-300 group-hover:text-white flex items-center gap-1.5">
                    OPEN GENOME BACKPACK
                  </div>
                  <div className="text-[8px] text-slate-400 uppercase tracking-tight">
                    Browse, filter & equip <span className="text-cyan-400 font-bold">{ownedAnimals.length}</span> units
                  </div>
                </div>
              </div>

              <span className="px-2 py-1 bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 rounded-lg text-[8.5px] font-black font-mono">
                {ownedAnimals.length}
              </span>
            </button>

            {/* 🏛️ FUSED TEMPLE: Sacred Synthesis Altar & Fused Category Hub */}
            <button
              onClick={() => setIsFusedTempleOpen(true)}
              className="w-full p-2.5 bg-gradient-to-r from-amber-600/30 via-yellow-600/25 to-amber-700/30 hover:from-amber-600/45 hover:via-yellow-600/40 hover:to-amber-700/45 border border-amber-500/50 hover:border-amber-400 text-white rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.35)] transition-all active:scale-[0.98] cursor-pointer group flex items-center justify-between relative overflow-hidden mt-1.5"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
              
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-inner">
                  <Atom size={16} className="animate-spin-slow" />
                </div>
                <div className="text-left">
                  <div className="text-[10.5px] font-black uppercase tracking-wider text-amber-300 group-hover:text-white flex items-center gap-1.5">
                    🏛️ FUSED TEMPLE & SYNTHESIS
                  </div>
                  <div className="text-[8px] text-slate-400 uppercase tracking-tight">
                    Obtain Fused variants & elevate Temple Lv.{gameState.fusedTempleLevel || 1}
                  </div>
                </div>
              </div>

              <span className="px-2 py-1 bg-amber-950/80 border border-amber-500/30 text-amber-300 rounded-lg text-[8.5px] font-black font-mono">
                TEMPLE
              </span>
            </button>

            {/* 🎯 TACTICAL PLANS: Auto-Diversity Strategic Doctrine Button */}
            <button
              onClick={() => setIsTacticalPlansOpen(true)}
              className="w-full p-2.5 bg-gradient-to-r from-cyan-600/30 via-teal-600/25 to-sky-700/30 hover:from-cyan-600/45 hover:via-teal-600/40 hover:to-sky-700/45 border border-cyan-500/50 hover:border-cyan-400 text-white rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all active:scale-[0.98] cursor-pointer group flex items-center justify-between relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
              
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-inner">
                  <Target size={16} className="animate-pulse" />
                </div>
                <div className="text-left">
                  <div className="text-[10.5px] font-black uppercase tracking-wider text-cyan-300 group-hover:text-white flex items-center gap-1.5">
                    🎯 TACTICAL PLANS & DIVERSITY
                  </div>
                  <div className="text-[8px] text-slate-400 uppercase tracking-tight">
                    {getTacticalPlan(gameState.activeTacticalPlanId).name} • Auto: {gameState.tacticalAutoDiversify !== false ? 'ON' : 'OFF'}
                  </div>
                </div>
              </div>

              <span className="px-2 py-1 bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 rounded-lg text-[8.5px] font-black font-mono">
                DOCTRINE
              </span>
            </button>

            {/* Relics & Trade row */}
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setIsRelicVaultOpen(true)}
                className="py-1.5 px-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/35 hover:to-orange-500/35 border border-amber-500/30 hover:border-amber-400 text-amber-200 font-black rounded-lg transition-all uppercase text-[8.5px] tracking-wider active:scale-95 flex items-center justify-center gap-1.5 group cursor-pointer shadow-sm"
                title="Manage and Forge Cosmic Relics"
              >
                <Sparkles size={11} className="text-amber-400 group-hover:scale-110 transition-transform animate-pulse" />
                <span>Artifact Relics</span>
              </button>
              <button
                onClick={() => setIsTradeOpen(true)}
                className="py-1.5 px-2 bg-gradient-to-r from-pink-600/20 to-purple-600/20 hover:from-pink-600/35 hover:to-purple-600/35 border border-pink-500/30 hover:border-pink-400 text-pink-200 font-black rounded-lg transition-all uppercase text-[8.5px] tracking-wider active:scale-95 flex items-center justify-center gap-1.5 group cursor-pointer shadow-sm"
              >
                <ArrowRightLeft size={11} className="text-pink-400 group-hover:scale-110 transition-transform" />
                <span>P2P Trade</span>
              </button>
            </div>

            {/* Equipped Relics Quick Bar */}
            <div className="grid grid-cols-2 gap-1.5">
              {[0, 1].map((slotIdx) => {
                const relicId = (gameState.equippedRelicIds || [])[slotIdx];
                const relic = relicId ? RELICS.find(r => r.id === relicId) : null;
                return relic ? (
                  <button
                    key={slotIdx}
                    onClick={() => setInspectingRelic(relic)}
                    className="p-1.5 rounded-lg border bg-slate-950/80 hover:bg-slate-900 transition-all flex items-center gap-1.5 cursor-pointer text-left group"
                    style={{ borderColor: `${relic.color}55` }}
                    title={`Equipped Relic: ${relic.name}. Click to view details.`}
                  >
                    <span className="text-sm shrink-0 group-hover:scale-110 transition-transform">{relic.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[8px] font-black text-white truncate leading-tight">{relic.name}</div>
                      <div className="text-[7.5px] font-mono font-bold truncate leading-tight" style={{ color: relic.color }}>{relic.bonus}</div>
                    </div>
                  </button>
                ) : (
                  <button
                    key={slotIdx}
                    onClick={() => setIsRelicVaultOpen(true)}
                    className="p-1.5 rounded-lg border border-dashed border-slate-700/60 hover:border-amber-500/40 bg-slate-950/40 hover:bg-slate-900/60 transition-all flex items-center justify-center gap-1 cursor-pointer text-slate-500 hover:text-amber-300"
                    title="Empty Relic Slot. Click to equip an Artifact Relic."
                  >
                    <Sparkles size={10} />
                    <span className="text-[7.5px] font-bold uppercase tracking-wider">Empty Relic</span>
                  </button>
                );
              })}
            </div>

            {/* ACTIVE SELECTED UNIT CARD (Ready for Canvas Deployment) */}
            <div className="bg-slate-950/70 border border-cyan-500/20 rounded-xl p-2.5 space-y-2 relative overflow-hidden shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-[8.5px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                  <Target size={10} className="text-cyan-400" /> SELECTED CONSTRUCT:
                </span>
                {selectedAnimalId && (
                  <button
                    onClick={() => setSelectedAnimalId(null)}
                    className="text-[8px] font-bold text-slate-400 hover:text-red-400 uppercase tracking-wider flex items-center gap-0.5 cursor-pointer"
                  >
                    <X size={9} /> Deselect
                  </button>
                )}
              </div>

              {selectedDeployAnimal ? (
                <div 
                  className="p-2.5 rounded-lg border bg-slate-900/90 relative overflow-hidden space-y-2 transition-all"
                  style={{ borderColor: `${selectedDeployAnimal.color}66` }}
                >
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-[3px]"
                    style={{ backgroundColor: selectedDeployAnimal.color }}
                  />

                  {/* Animal Info Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div 
                        className={`w-8 h-8 rounded-full bg-slate-950 border flex items-center justify-center p-0.5 flex-shrink-0 ${getRarityAuraClass(selectedDeployAnimal.rarity)}`}
                        style={{ borderColor: selectedDeployAnimal.color }}
                      >
                        <AnimalAvatar animal={selectedDeployAnimal} size="xs" animated={true} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-black text-white truncate leading-tight">
                          {selectedDeployAnimal.name}
                        </div>
                        <span 
                          className="text-[8px] font-black uppercase tracking-wider"
                          style={{ color: selectedDeployAnimal.color }}
                        >
                          {selectedDeployAnimal.rarity}
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-[10px] font-black font-mono text-yellow-400 flex items-center justify-end gap-0.5">
                        <Coins size={10} /> {selectedDeployAnimal.cost}
                      </div>
                      <span className="text-[7.5px] text-slate-400 uppercase">Deploy Cost</span>
                    </div>
                  </div>

                  {/* Stats snippet */}
                  <div className="grid grid-cols-3 gap-1 bg-slate-950/80 p-1.5 rounded-md border border-white/5 text-center font-mono">
                    <div>
                      <div className="text-[7px] text-slate-500 uppercase font-black">DMG</div>
                      <div className="text-[9px] font-bold text-rose-400">{selectedDeployAnimal.damage}</div>
                    </div>
                    <div>
                      <div className="text-[7px] text-slate-500 uppercase font-black">RNG</div>
                      <div className="text-[9px] font-bold text-cyan-400">{selectedDeployAnimal.range}</div>
                    </div>
                    <div>
                      <div className="text-[7px] text-slate-500 uppercase font-black">SPD</div>
                      <div className="text-[9px] font-bold text-amber-400">
                        {selectedDeployAnimal.fireRate === 999999 ? 'Aura' : `${(1000 / selectedDeployAnimal.fireRate).toFixed(1)}/s`}
                      </div>
                    </div>
                  </div>

                  <div className="text-[8px] text-center font-extrabold text-cyan-400 uppercase tracking-tight animate-pulse bg-cyan-950/40 py-1 rounded border border-cyan-500/20">
                    🎯 Tap any open plot on the map to place!
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => setIsBackpackOpen(true)}
                  className="p-3 rounded-lg border border-dashed border-white/10 hover:border-cyan-500/40 bg-slate-900/40 hover:bg-slate-900/80 text-center cursor-pointer transition-all space-y-1 group"
                >
                  <div className="text-[10px] font-black uppercase text-slate-400 group-hover:text-cyan-300 flex items-center justify-center gap-1">
                    <Backpack size={12} className="text-slate-500 group-hover:text-cyan-400" />
                    <span>No Construct Selected</span>
                  </div>
                  <p className="text-[8px] text-slate-500 uppercase tracking-tight">
                    Click here or use the Backpack to choose a unit to deploy.
                  </p>
                </div>
              )}
            </div>

            {/* Place Best Only Toggle */}
            <div className="bg-slate-950/50 border border-white/5 rounded-xl p-2 space-y-1 transition-all hover:border-cyan-500/10">
              <div className="flex items-center justify-between">
                <span className="text-[8.5px] font-black uppercase text-cyan-400 tracking-wider flex items-center gap-1.5 leading-none">
                  <Crown size={11} className={`${placeOnlyBest ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} /> PLACE BEST ONLY
                </span>
                <button
                  onClick={() => setPlaceOnlyBest(prev => !prev)}
                  className={`w-9 h-4.5 rounded-full p-0.5 transition-all duration-300 focus:outline-none cursor-pointer ${placeOnlyBest ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.4)]' : 'bg-slate-800'}`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-md transition-transform duration-300 ${placeOnlyBest ? 'transform translate-x-4.5' : ''}`}></div>
                </button>
              </div>
              <p className="text-[7.5px] text-slate-400 uppercase tracking-tighter leading-snug">
                {placeOnlyBest && getBestOwnedAnimal() 
                  ? `Active: ${getBestOwnedAnimal()?.name} (${getBestOwnedAnimal()?.rarity})`
                  : "Locks placement to your absolute strongest unlocked unit."}
              </p>
            </div>

            {/* QUICK-DEPLOY FAVORITES / TOP SLOTS */}
            <div className="space-y-1.5">
              <div className="text-[8.5px] font-black uppercase text-slate-400 tracking-wider flex items-center justify-between px-0.5">
                <span className="flex items-center gap-1 text-cyan-400">
                  <Zap size={11} className="text-amber-400 animate-pulse" /> Quick-Deploy
                </span>
                <button
                  onClick={() => setIsQuickDeployModalOpen(true)}
                  className="px-2 py-0.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 rounded text-[7.5px] font-black uppercase tracking-tight flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
                  title="Choose which 4 units to assign to Quick-Deploy slots"
                >
                  <SlidersHorizontal size={9} /> Edit Deck
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {[0, 1, 2, 3].map((slotIdx) => {
                  const animal = quickDeckAnimals[slotIdx] || null;
                  const isSelected = animal && selectedAnimalId === animal.id;
                  const isAffordable = animal ? gameState.meat >= animal.cost : false;

                  const isLoreLocked = !!gameState.isLoreMode && !!animal && !isAnimalUnlockedInLoreMode(animal.id, gameState.wave || 0);
                  const loreUnlockWave = animal ? getAnimalUnlockWave(animal.id) : 1;

                  if (animal) {
                    return (
                      <button
                        key={`quick-slot-${animal.id}-${slotIdx}`}
                        onClick={() => {
                          if (isLoreLocked) {
                            alert(`🔒 LORE RESTRICTION: ${animal.name} unlocks at Wave ${loreUnlockWave}! Continue the campaign to unlock.`);
                            return;
                          }
                          setPlaceOnlyBest(false);
                          setSelectedAnimalId(animal.id);
                          setSelectedPlacedTowerId(null);
                        }}
                        className={`p-1.5 rounded-lg border text-left flex items-center gap-1.5 transition-all cursor-pointer relative overflow-hidden group ${
                          isSelected
                            ? 'bg-slate-800 border-amber-400 ring-1 ring-amber-400/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                            : 'bg-slate-900/80 border-white/5 hover:border-white/20 hover:bg-slate-850'
                        } ${(!isAffordable || isLoreLocked) ? 'opacity-50' : ''}`}
                        title={isLoreLocked 
                          ? `🔒 LOCKED: Unlocks at Lore Wave ${loreUnlockWave}`
                          : `Slot ${slotIdx + 1}: ${animal.name} (${animal.rarity}) - Click to select for placement`}
                      >
                        <div 
                          className="absolute left-0 top-0 bottom-0 w-[2.5px]"
                          style={{ backgroundColor: isLoreLocked ? '#64748b' : animal.color }}
                        />
                        <div 
                          className={`w-6 h-6 rounded-full bg-slate-950 border flex items-center justify-center p-0.5 flex-shrink-0 ml-0.5 ${getRarityAuraClass(animal.rarity)}`}
                          style={{ borderColor: isLoreLocked ? '#64748b' : animal.color }}
                        >
                          <AnimalAvatar animal={animal} size="xs" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[8.5px] font-black text-white truncate group-hover:text-cyan-300 transition-colors flex items-center justify-between">
                            <span className="truncate">{animal.name}</span>
                            {isLoreLocked ? (
                              <span className="text-[6.5px] text-amber-400 font-extrabold bg-amber-950/80 px-1 rounded border border-amber-500/40">
                                🔒 W{loreUnlockWave}
                              </span>
                            ) : (
                              <span className="text-[6.5px] text-slate-500 font-mono">S{slotIdx + 1}</span>
                            )}
                          </div>
                          <div className="flex items-center justify-between text-[7px] font-mono mt-0.5">
                            <span style={{ color: animal.color }} className="font-bold truncate">
                              {animal.rarity.slice(0, 4)}
                            </span>
                            <span className="text-yellow-400 font-bold flex items-center gap-0.2">
                              <Coins size={6} /> {animal.cost}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  }

                  return (
                    <button
                      key={`empty-quick-slot-${slotIdx}`}
                      onClick={() => setIsQuickDeployModalOpen(true)}
                      className="p-1.5 rounded-lg border border-dashed border-white/10 hover:border-cyan-500/40 bg-slate-950/40 hover:bg-slate-900/60 text-slate-500 hover:text-cyan-300 transition-all flex items-center justify-center gap-1 text-[8px] font-bold uppercase cursor-pointer min-h-[38px] group"
                    >
                      <Plus size={11} className="group-hover:scale-110 transition-transform text-slate-500 group-hover:text-cyan-400" />
                      <span>Slot {slotIdx + 1}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* Game Area */}
        <section className="flex-1 relative flex flex-col items-center justify-center p-4 bg-slate-950/40">
          <div className="absolute w-full h-full inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
            <div className="absolute w-[800px] h-[800px] border border-white/5 rounded-full"></div>
            <div className="absolute w-[600px] h-[600px] border border-white/10 rounded-full animate-pulse"></div>
          </div>

          {/* Lore Chronicles Narrative HUD */}
          {gameState.isLoreMode && (
            <div className="relative z-10 w-full max-w-[800px] mb-2">
              <LoreChronicleHUD 
                gameState={gameState} 
                onOpenCodex={() => setIsLoreCodexOpen(true)} 
              />
            </div>
          )}

          {gameState.isWaveActive && gameState.totalWaveEnemies && gameState.totalWaveEnemies > 0 && (
            <div className="relative z-10 w-full max-w-[800px] bg-slate-900/60 backdrop-blur-md rounded-xl p-3 border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.1)] mb-4 animate-fade-in flex flex-col gap-1.5 select-none">
              <div className="flex justify-between items-center text-[10px] font-black tracking-wider uppercase">
                <span className="text-cyan-400 flex items-center gap-1.5 font-bold">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
                  WAVE {gameState.wave} PROGRESS
                </span>
                <span className="text-slate-400 font-bold">
                  NEUTRALIZED: <span className="text-white font-mono">{gameState.waveEnemiesDefeated || 0}</span> / <span className="text-cyan-400 font-mono">{gameState.totalWaveEnemies}</span> ({Math.round(((gameState.waveEnemiesDefeated || 0) / gameState.totalWaveEnemies) * 100)}%)
                </span>
              </div>
              <div className="w-full h-3 bg-slate-950 border border-white/5 rounded-full p-[1px] overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 rounded-full transition-all duration-300 ease-out shadow-[0_0_12px_rgba(34,211,238,0.4)]"
                  style={{ width: `${Math.min(100, Math.max(0, ((gameState.waveEnemiesDefeated || 0) / gameState.totalWaveEnemies) * 100))}%` }}
                />
              </div>
            </div>
          )}
          
          <div className="relative z-10 max-w-full max-h-full flex items-center justify-center">
            {unrivaledNotify && unrivaledNotify.active && (
              <div className={`absolute top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3.5 rounded-2xl border backdrop-blur-xl text-center shadow-[0_0_40px_rgba(0,0,0,0.8)] flex flex-col gap-1 items-center animate-bounce min-w-[320px] max-w-[620px] pointer-events-none transition-all duration-300 select-none ${
                unrivaledNotify.type === 'defeat'
                  ? 'border-emerald-500/50 bg-emerald-950/90 text-emerald-200'
                  : unrivaledNotify.type === 'void'
                  ? 'border-pink-500/50 bg-pink-950/90 text-pink-200'
                  : 'border-amber-500/50 bg-amber-950/90 text-amber-200'
              }`}>
                <div className="text-xs font-black tracking-[0.2em] uppercase flex items-center gap-1.5 font-mono">
                  {unrivaledNotify.type === 'defeat' && '🏆 UNRIVALED BOSS SLAIN'}
                  {unrivaledNotify.type === 'void' && '🌌 ENEMY HORIZON CAPTURE'}
                  {unrivaledNotify.type === 'solar' && '☀️ SOLAR MATRIX FLUX'}
                </div>
                <div className="text-[10px] font-bold tracking-wide uppercase opacity-80 leading-normal font-mono">
                  {unrivaledNotify.message}
                </div>
              </div>
            )}
            <GameCanvas 
              towers={towers} 
              enemies={enemies} 
              projectiles={projectiles} 
              skillEffects={skillEffects}
              path={PATH}
              onCanvasClick={handleCanvasClick}
              onTowerClick={handleTowerClick}
              selectedTowerId={selectedPlacedTowerId}
              selectedDeployAnimal={selectedDeployAnimal}
              currentStage={gameState.currentStage}
              isWaveActive={gameState.isWaveActive}
              disableVFX={gameState.disableVFX}
              isUltraBoss={gameState.isUltraBoss}
              elementalHazards={elementalHazards}
              equippedRelicIds={gameState.equippedRelicIds}
              tacticalMode={gameState.tacticalMode}
              onToggleTacticalMode={(enabled) => setGameState(prev => ({ ...prev, tacticalMode: enabled }))}
              showGrid={gameState.showGrid}
            />

            {/* --- ELEMENTAL HAZARD OVERLAY HUD & TACTICAL DRAWER --- */}
            {elementalHazards && elementalHazards.length > 0 && !gameState.isUltraBoss && (
              <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-1.5">
                <div className="flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                  <button
                    onClick={() => setIsHazardOverlayOpen(!isHazardOverlayOpen)}
                    className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                    title="Toggle Elemental Hazard Overlay Info"
                  >
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <span>🌋 Hazards ({elementalHazards.length})</span>
                  </button>

                  <button
                    onClick={() => shiftElementalHazards()}
                    className="bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/40 text-amber-300 text-[9px] font-black uppercase px-2 py-0.5 rounded transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-[0_0_8px_rgba(245,158,11,0.25)]"
                    title="Randomly shift path hazard sections"
                  >
                    <Zap size={10} /> Shift
                  </button>
                </div>

                {/* Expanded Tactical Hazard Breakdown Card */}
                <AnimatePresence>
                  {isHazardOverlayOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="w-72 bg-slate-950/95 backdrop-blur-xl border border-amber-500/40 rounded-xl p-3 shadow-[0_0_25px_rgba(0,0,0,0.8)] text-white flex flex-col gap-2 z-30"
                    >
                      <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-black text-amber-400 uppercase tracking-wide">
                          <Sparkles size={12} />
                          <span>Elemental Hazard Lanes</span>
                        </div>
                        <button
                          onClick={() => setIsHazardOverlayOpen(false)}
                          className="text-slate-400 hover:text-white text-xs cursor-pointer p-0.5"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="text-[10px] text-slate-300 leading-tight">
                        Path segments shift elements! Animals placed near matching lanes receive massive combat buffs:
                      </div>

                      <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-1">
                        {elementalHazards.map((zone, idx) => (
                          <div
                            key={`hazard-hud-${idx}-${zone.element}`}
                            className="bg-slate-900/80 border rounded-lg p-2 flex flex-col gap-1"
                            style={{ borderColor: zone.color + '66' }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black flex items-center gap-1" style={{ color: zone.color }}>
                                <span>{zone.icon}</span>
                                <span>{zone.name}</span>
                              </span>
                              <span className="text-[8px] font-mono uppercase font-bold px-1 py-0.5 rounded bg-black/40 text-slate-300">
                                Path Zone {idx + 1}
                              </span>
                            </div>

                            <div className="text-[9px] text-slate-300 flex flex-col gap-0.5">
                              <div className="flex items-center gap-1">
                                <span className="font-bold text-emerald-400">⚡ Overcharged (+75% DMG, +25% Spd):</span>
                                <span className="text-emerald-200 capitalize">{zone.buffElements.join(', ')}</span>
                              </div>
                              {zone.debuffElements.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <span className="font-bold text-rose-400">⚠️ Dampened (-25% DMG):</span>
                                  <span className="text-rose-200 capitalize">{zone.debuffElements.join(', ')}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-1 border-t border-white/10 flex items-center justify-between">
                        <span className="text-[9px] text-slate-400 italic">Auto-shifts each wave</span>
                        <button
                          onClick={() => shiftElementalHazards()}
                          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wider px-2.5 py-1 rounded transition-all cursor-pointer flex items-center gap-1 shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                        >
                          <Zap size={10} /> Shift Zones Now
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            {selectedAnimalId && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-cyan-500/20 backdrop-blur-md px-6 py-2 rounded-full border border-cyan-400/50 font-bold flex items-center gap-2 animate-pulse text-cyan-400 text-xs uppercase tracking-widest shadow-[0_0_20px_#22d3ee55]">
                <Target size={14} /> Tracking coordinates... Deploy unit
              </div>
            )}
            {gameState.isGameOver && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl rounded-lg flex flex-col items-center justify-center text-white p-8">
                <Skull size={80} className="text-red-500 mb-6 drop-shadow-[0_0_20px_red]" />
                <h2 className="text-5xl font-black mb-2 uppercase tracking-tighter italic">Extinction Event</h2>
                <p className="text-sm opacity-60 mb-10 font-bold uppercase tracking-[0.5em]">Civilization lost to bad animals</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-green-500 text-slate-900 px-12 py-4 rounded-lg font-black text-xs uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-[0_0_30px_#22c55e55]"
                >
                  Initiate Rebirth
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Info Sidebar - Right Side */}
        <aside className="w-80 bg-slate-900/60 backdrop-blur-sm border-l border-white/5 p-4 z-10 flex flex-col">
          {(selectedTowerAnimal || hoveredAnimal) ? (
            <>
              {/* Profile Card */}
              <motion.div 
                className="flex flex-col mb-6 bg-slate-800/50 p-4 rounded-xl border border-white/5 shadow-xl origin-center"
                animate={pulseSidebar ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                onAnimationComplete={() => setPulseSidebar(false)}
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-14 h-14 bg-slate-950 rounded-xl border-2 flex items-center justify-center p-1.5 shadow-inner relative"
                    style={{ borderColor: (selectedTowerAnimal || hoveredAnimal)!.color }}
                  >
                    <AnimalAvatar animal={selectedTowerAnimal || hoveredAnimal || undefined} size="lg" animated={true} withParticles={true} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: (selectedTowerAnimal || hoveredAnimal)!.color }}>
                      {(selectedTowerAnimal || hoveredAnimal)!.rarity} {(selectedTowerAnimal || hoveredAnimal)!.isExtinct && "• EXTINCT"}
                    </div>
                    <div className="text-lg font-black tracking-tight">{(selectedTowerAnimal || hoveredAnimal)!.name}</div>
                    {selectedTower && (
                      <div className="flex items-center gap-2 text-xs font-bold text-yellow-500 italic uppercase tracking-tighter">
                        <span>Level {selectedTower.level}</span>
                        <span className="text-white/20">•</span>
                        <span className="text-indigo-400">Mastery {selectedTower.masteryLevel || 1}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Persistent XP Bar for Mastery */}
                {selectedTower && (
                  (() => {
                    const currentXp = selectedTower.xp ?? 0;
                    const masteryLvl = (selectedTower as any).masteryLevel || 1;
                    
                    const baseCost = selectedTowerAnimal ? selectedTowerAnimal.cost : 100;
                    const xpNeeded = Math.floor(Math.max(100, baseCost * 0.2) * Math.pow(masteryLvl, 1.5)) + 100;
                    
                    const pct = masteryLvl >= 1000 ? 100 : Math.min(100, (currentXp / xpNeeded) * 100);

                    return (
                      <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-400">
                          <span className="flex items-center gap-1">
                            <span className="text-indigo-400">🔮</span> {masteryLvl >= 1000 ? 'Max Mastery' : 'Mastery Progress'}
                          </span>
                          <span>
                            {masteryLvl >= 1000 
                              ? 'MAX' 
                              : `${Math.floor(currentXp).toLocaleString()} / ${xpNeeded.toLocaleString()} (${pct.toFixed(1)}%)`
                            }
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5 p-[1px]">
                          <motion.div 
                            className="h-full rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400"
                            style={{ width: `${pct}%` }}
                            layout
                            transition={{ type: 'spring', stiffness: 80, damping: 15 }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono font-bold">
                          <span>Damage Boost:</span>
                          <span className="text-emerald-400">+{((masteryLvl - 1) * 2).toLocaleString()}% (+{(masteryLvl - 1) * 2 === 0 ? '0' : ((masteryLvl - 1) * 0.02).toFixed(2)}x)</span>
                        </div>
                      </div>
                    );
                  })()
                )}

                {/* Capybara Chill Meter UI Element */}
                {((selectedTowerAnimal || hoveredAnimal)?.id === 'capybara' || (selectedTowerAnimal || hoveredAnimal)?.rarity === 'The Chillful') && (
                  (() => {
                    const activeTower = selectedTower?.animalId === 'capybara' ? selectedTower : null;
                    const hypnotizedInRange = activeTower
                      ? enemies.filter(e => e.isHypnotized && (e.hypnotizedByTowerId === activeTower.id || Math.hypot(e.x - activeTower.x, e.y - activeTower.y) <= (selectedTowerRange || 850))).length
                      : enemies.filter(e => e.isHypnotized).length;
                    
                    const towerMeter = activeTower?.chillMeter;
                    const calculatedPct = towerMeter !== undefined && towerMeter > 0 
                      ? towerMeter 
                      : Math.min(100, hypnotizedInRange * 10);
                    
                    const chillPct = Math.min(100, Math.max(0, calculatedPct));
                    const isMaxZen = chillPct >= 100;

                    return (
                      <div className="mt-3 pt-3 border-t border-lime-500/20 space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-mono font-bold">
                          <span className="flex items-center gap-1.5 text-lime-400">
                            <span className="w-4 h-4 inline-flex items-center justify-center"><CapybaraAvatar size="xs" withYuzu={true} /></span>
                            <span className="tracking-wider uppercase">Chill Meter</span>
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                            isMaxZen
                              ? 'bg-lime-500/20 text-lime-300 border border-lime-400/50 animate-pulse shadow-[0_0_12px_rgba(132,204,22,0.4)]'
                              : chillPct > 0 
                                ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/40'
                                : 'bg-slate-950 text-slate-400 border border-white/10'
                          }`}>
                            {isMaxZen ? '✨ MAX ZEN OVERCHARGE' : `${chillPct}% Chill`}
                          </span>
                        </div>

                        {/* Animated Chill Meter Progress Bar */}
                        <div className="relative h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-lime-500/30 p-[1px] shadow-inner">
                          <motion.div 
                            className="h-full rounded-full bg-gradient-to-r from-lime-500 via-emerald-400 to-amber-300 shadow-[0_0_12px_rgba(132,204,22,0.6)]"
                            style={{ width: `${Math.max(4, chillPct)}%` }}
                            layout
                            transition={{ type: 'spring', stiffness: 80, damping: 15 }}
                          />
                          {isMaxZen && (
                            <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none rounded-full" />
                          )}
                        </div>

                        <div className="flex justify-between items-center text-[9.5px] font-mono">
                          <span className="text-slate-400 flex items-center gap-1">
                            <span>🍃 Hypnotized in Range:</span>
                          </span>
                          <span className="text-lime-300 font-extrabold font-mono">
                            {hypnotizedInRange}/10 Targets
                          </span>
                        </div>

                        <div className="p-2 rounded-lg bg-lime-950/40 border border-lime-500/20 flex flex-col gap-1 text-[9px] text-lime-200/90 leading-tight">
                          <div className="flex items-center justify-between font-bold text-lime-300">
                            <span>✨ Motivation Aura Active</span>
                            <span className="text-amber-300 font-mono">x200 DMG • -10% CD</span>
                          </div>
                          <p className="text-[8.5px] text-slate-300">
                            {isMaxZen
                              ? 'Max Zen achieved! Peaceful waves dominate the battlefield, forcing hypnotized targets into intense turncoat combat.'
                              : 'Fills up as enemy beasts and hunters in range are hypnotized into peaceful turncoats.'}
                          </p>
                        </div>
                      </div>
                    );
                  })()
                )}
              </motion.div>

              <UnitProfilePanel
                selectedTower={selectedTower}
                hoveredAnimal={hoveredAnimal}
                selectedTowerAnimal={selectedTowerAnimal}
                gameState={gameState}
                sidebarTab={sidebarTab}
                setSidebarTab={setSidebarTab}
                selectedTowerDamage={selectedTowerDamage}
                selectedTowerCadence={selectedTowerCadence}
                selectedTowerRange={selectedTowerRange}
                upgradeCost={upgradeCost}
                sellRefund={sellRefund}
                isDevMode={isDevMode}
                upgradeTower={upgradeTower}
                maxUpgradeTower={maxUpgradeTower}
                cheatMaxUpgradeTower={cheatMaxUpgradeTower}
                ascendTowerToPinnacle={ascendTowerToPinnacle}
                upgradeTowerAlienTech={upgradeTowerAlienTech}
                sellTower={sellTower}
                setSelectedPlacedTowerId={setSelectedPlacedTowerId}
                rerollTowerTrait={rerollTowerTrait}
                setMysteryPopup={setMysteryPopup}
                setTraitWarning={setTraitWarning}
                triggerOverseerActiveSkill={triggerOverseerActiveSkill}
                toggleTitanForm={toggleTitanForm}
                setIsTitanUpgradeModalOpen={setIsTitanUpgradeModalOpen}
                setIsLoreTitanCutsceneOpen={setIsLoreTitanCutsceneOpen}
                upgradeWarperPart={upgradeWarperPart}
                setIsWarperClashCutsceneOpen={setIsWarperClashCutsceneOpen}
                triggerUnrivaledFinisher={triggerUnrivaledFinisher}
                changeTowerElement={changeTowerElement}
                changeAllDeitiesElement={changeAllDeitiesElement}
                setTowers={setTowers}
                setGameState={setGameState}
                loreLoading={loreLoading}
                loreCache={loreCache}
                setLoreCache={setLoreCache}
                fetchLore={fetchLore}
              />
            </>
          ) : (
            <div className="flex-1 flex flex-col space-y-6 overflow-y-auto pr-1">
              {/* Cybernetic Automator Panel */}
              <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 shadow-xl text-left">
                <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
                  <Bot size={18} className="text-cyan-400 animate-pulse" />
                  <div>
                    <h3 className="text-xs font-black uppercase text-cyan-400 tracking-wider">DEFENSE AUTOMATOR</h3>
                    <p className="text-[8px] text-slate-400 uppercase tracking-tighter">Cybernetic Auto-Deploy Protocol</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Toggle 1: Auto-Deploy Waves */}
                  <div className="flex flex-col space-y-1.5 p-2 rounded-lg bg-slate-950/40 border border-white/5 transition-all hover:border-cyan-500/10">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase text-white tracking-wide">AUTO-DEPLOY WAVES</span>
                      <button 
                        onClick={() => setAutoDeployWaves(!gameState.autoDeployWaves)}
                        className={`w-10 h-5 rounded-full p-0.5 transition-all duration-300 focus:outline-none ${gameState.autoDeployWaves ? 'bg-cyan-500' : 'bg-slate-800'}`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 ${gameState.autoDeployWaves ? 'transform translate-x-5' : ''}`}></div>
                      </button>
                    </div>
                    <p className="text-[8px] text-slate-400 uppercase tracking-tighter leading-snug">Automatically initiates the next wavefront when the current enemies are neutralized.</p>
                  </div>

                  {/* Toggle 2: Auto-Deploy Towers */}
                  <div className="flex flex-col space-y-1.5 p-2 rounded-lg bg-slate-950/40 border border-white/5 transition-all hover:border-cyan-500/10">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase text-white tracking-wide">AUTO-DEPLOY TOWERS</span>
                      <button 
                        onClick={() => setAutoDeployTowers(!gameState.autoDeployTowers)}
                        className={`w-10 h-5 rounded-full p-0.5 transition-all duration-300 focus:outline-none ${gameState.autoDeployTowers ? 'bg-cyan-500' : 'bg-slate-800'}`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 ${gameState.autoDeployTowers ? 'transform translate-x-5' : ''}`}></div>
                      </button>
                    </div>
                    <p className="text-[8px] text-slate-400 uppercase tracking-tighter leading-snug">Automatically installs flanking defenses along the path, placing your strongest unlocked animals first.</p>
                    {gameState.autoDeployTowers && (
                      <div className="pt-1.5 border-t border-white/5 mt-1">
                        <label className="text-[7.5px] font-black uppercase text-slate-500 block mb-0.5">
                          Target Unit
                        </label>
                        <select
                          value={gameState.autoDeployUnitId || 'best'}
                          onChange={(e) => setAutoDeployUnitId(e.target.value)}
                          className="w-full bg-slate-900 border border-white/10 rounded px-1 py-0.5 text-[8.5px] font-bold text-white focus:outline-none focus:border-cyan-500/50"
                        >
                          <option value="best">👑 Best Available</option>
                          {ANIMALS.filter(a => gameState.summonedAnimals.includes(a.id)).map((a, idx) => (
                            <option key={`auto-deploy-${a.id}-${idx}`} value={a.id}>
                              {a.name} ({a.rarity})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Toggle 3: Auto-Upgrade Towers */}
                  <div className="flex flex-col space-y-1.5 p-2 rounded-lg bg-slate-950/40 border border-white/5 transition-all hover:border-cyan-500/10">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase text-white tracking-wide">AUTO-EVOLVE TOWERS</span>
                      <button 
                        onClick={() => setAutoUpgradeTowers(!gameState.autoUpgradeTowers)}
                        className={`w-10 h-5 rounded-full p-0.5 transition-all duration-300 focus:outline-none ${gameState.autoUpgradeTowers ? 'bg-cyan-500' : 'bg-slate-800'}`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 ${gameState.autoUpgradeTowers ? 'transform translate-x-5' : ''}`}></div>
                      </button>
                    </div>
                    <p className="text-[8px] text-slate-400 uppercase tracking-tighter leading-snug">Automatically levels up active nodes, prioritizing your ultra-powerful Celestials and Secrets first.</p>
                  </div>
                </div>
              </div>

              {/* Grid Scanner Fallback */}
              <div className="flex-1 flex flex-col items-center justify-center text-slate-600 p-6 text-center bg-slate-900/30 rounded-xl border border-dashed border-white/5">
                <Cpu size={24} className="mb-2 opacity-15 text-cyan-500 animate-pulse" />
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] leading-relaxed">Hover or select a dispatched unit on the grid to inspect tactical DNA profiles</p>
              </div>
            </div>
          )}
        </aside>
      </main>

      <footer className="h-12 bg-slate-950 border-t border-white/10 flex items-center justify-between px-8 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
        <div className="flex space-x-6">
          <span>Active Nodes: {towers.length}</span>
          <span>Entropy Level: {gameState.wave}</span>
          <span>System Stable</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span>Biometric Link Active</span>
          </div>
        </div>
      </footer>

       <SummoningModal 
        isOpen={isSummoningOpen} 
        onClose={() => setIsSummoningOpen(false)} 
        onSummonComplete={handleSummonComplete}
        dna={gameState.dna}
        shardsOfGods={gameState.shardsOfGods ?? 20}
        capyCoins={gameState.capyCoins ?? 0}
        secretPity={gameState.secretPity}
        celestialPity={gameState.celestialPity ?? 0}
        mysteryPity={gameState.mysteryPity ?? 0}
        originalPity={gameState.originalPity ?? 0}
        overseerPity={gameState.overseerPity ?? 0}
        unrivaledPity={gameState.unrivaledPity ?? 0}
        capyPity={gameState.capyPity ?? 0}
        ownedAnimals={gameState.summonedAnimals}
        isDevMode={isDevMode}
        isGigaGacha={gameState.isGigaGacha ?? false}
        isSandbox={gameState.isSandbox ?? false}
        disableSummonCutscene={gameState.disableSummonCutscene}
        autoSellDuplicates={gameState.autoSellDuplicates ?? true}
        autoSellCommons={gameState.autoSellCommons ?? false}
        autoSellRares={gameState.autoSellRares ?? false}
        autoSellEpics={gameState.autoSellEpics ?? false}
        autoSellLegendaries={gameState.autoSellLegendaries ?? false}
        setAutoSellDuplicates={setAutoSellDuplicates}
        setAutoSellCommons={setAutoSellCommons}
        setAutoSellRares={setAutoSellRares}
        setAutoSellEpics={setAutoSellEpics}
        setAutoSellLegendaries={setAutoSellLegendaries}
      />

      <AutomationModal
        isOpen={isAutomationOpen}
        onClose={() => setIsAutomationOpen(false)}
        autoDeployWaves={gameState.autoDeployWaves ?? false}
        autoDeployTowers={gameState.autoDeployTowers ?? false}
        autoDeployUnitId={gameState.autoDeployUnitId ?? 'best'}
        summonedAnimals={gameState.summonedAnimals}
        autoUpgradeTowers={gameState.autoUpgradeTowers ?? false}
        autoSellDuplicates={gameState.autoSellDuplicates ?? true}
        autoSellCommons={gameState.autoSellCommons ?? false}
        autoSellRares={gameState.autoSellRares ?? false}
        autoSellEpics={gameState.autoSellEpics ?? false}
        autoSellLegendaries={gameState.autoSellLegendaries ?? false}
        autoSummon={gameState.autoSummon ?? false}
        autoSummonAltar={gameState.autoSummonAltar ?? 'standard'}
        setAutoDeployWaves={setAutoDeployWaves}
        setAutoDeployTowers={setAutoDeployTowers}
        setAutoDeployUnitId={setAutoDeployUnitId}
        setAutoUpgradeTowers={setAutoUpgradeTowers}
        setAutoSellDuplicates={setAutoSellDuplicates}
        setAutoSellCommons={setAutoSellCommons}
        setAutoSellRares={setAutoSellRares}
        setAutoSellEpics={setAutoSellEpics}
        setAutoSellLegendaries={setAutoSellLegendaries}
        setAutoSummon={setAutoSummon}
        setAutoSummonAltar={setAutoSummonAltar}
        bulkEvolveTowers={bulkEvolveTowers}
        towers={towers}
        meat={gameState.meat}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        gameState={gameState}
        setGameState={setGameState}
        resetGame={resetGame}
        activeSlot={activeSlot}
        changeSlot={changeSlot}
        clearSlot={clearSlot}
        cloneSlot={cloneSlot}
        onOpenGameModes={() => setIsGameModesModalOpen(true)}
      />

      <GameModesModal
        isOpen={isGameModesModalOpen}
        onClose={() => setIsGameModesModalOpen(false)}
        gameState={gameState}
        setGameState={setGameState}
      />

      <LoreCodexModal
        isOpen={isLoreCodexOpen}
        onClose={() => setIsLoreCodexOpen(false)}
        gameState={gameState}
      />

      <InteractiveTutorial
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />

      <HunterCodexModal
        isOpen={isHunterCodexOpen}
        onClose={() => setIsHunterCodexOpen(false)}
      />

      <ElementalBoardModal
        isOpen={isElementalBoardOpen}
        onClose={() => setIsElementalBoardOpen(false)}
        elementalDamage={elementalDamage}
        towers={towers}
        onChangeTowerElement={changeTowerElement}
        onChangeAllDeitiesElement={changeAllDeitiesElement}
      />

      <RelicVaultModal
        isOpen={isRelicVaultOpen}
        onClose={() => setIsRelicVaultOpen(false)}
        gameState={gameState}
        setGameState={setGameState}
      />

      <RelicDetailModal
        relic={inspectingRelic}
        isOpen={!!inspectingRelic}
        onClose={() => setInspectingRelic(null)}
        gameState={gameState}
        setGameState={setGameState}
      />

      <RelicDiscoveredModal
        relic={newlyDiscoveredRelic}
        isOpen={!!newlyDiscoveredRelic}
        onClose={() => setNewlyDiscoveredRelic(null)}
        onInspect={(relic) => {
          setNewlyDiscoveredRelic(null);
          setInspectingRelic(relic);
        }}
        gameState={gameState}
        setGameState={setGameState}
      />

      <BackpackModal
        isOpen={isBackpackOpen}
        onClose={() => setIsBackpackOpen(false)}
        ownedAnimals={getOwnedAnimals()}
        selectedAnimalId={selectedAnimalId}
        onSelectAnimal={setSelectedAnimalId}
        meat={gameState.meat}
        onOpenTrade={() => setIsTradeOpen(true)}
        onOpenRelicVault={() => setIsRelicVaultOpen(true)}
        quickDeployUnitIds={gameState.quickDeployUnitIds || []}
        onUpdateQuickDeploy={handleUpdateQuickDeploy}
        onSellAnimal={handleSellInventoryAnimal}
        onBulkSellAnimals={handleBulkSellInventoryAnimals}
        equippedRelicIds={gameState.equippedRelicIds || []}
      />

      <FusionModal
        isOpen={isFusionOpen}
        onClose={() => setIsFusionOpen(false)}
        ownedAnimals={getOwnedAnimals()}
        summonedAnimalsRaw={gameState.summonedAnimals}
        dna={gameState.dna}
        onFuse={handleFuse}
      />

      <FusedTempleModal
        isOpen={isFusedTempleOpen}
        onClose={() => setIsFusedTempleOpen(false)}
        ownedAnimals={getOwnedAnimals()}
        summonedAnimalsRaw={gameState.summonedAnimals}
        dna={gameState.dna}
        templeLevel={gameState.fusedTempleLevel || 1}
        templeEssence={gameState.fusedTempleEssence || 0}
        totalFusions={gameState.totalFusionsCompleted || 0}
        fusionHistory={gameState.fusionHistory || []}
        onFuse={handleFuseTempleUnit}
        onBulkAutoFuse={handleBulkAutoFuse}
        onUpgradeTemple={handleUpgradeTemple}
        onOpenBackpack={() => {
          setIsFusedTempleOpen(false);
          setIsBackpackOpen(true);
        }}
      />

      <TacticalPlansModal
        isOpen={isTacticalPlansOpen}
        onClose={() => setIsTacticalPlansOpen(false)}
        activePlanId={gameState.activeTacticalPlanId || 'balanced_matrix'}
        autoDiversifyEnabled={gameState.tacticalAutoDiversify !== false}
        ownedAnimals={getOwnedAnimals()}
        towers={towers}
        meat={gameState.meat}
        onSelectPlan={handleSelectTacticalPlan}
        onToggleAutoDiversify={handleToggleAutoDiversify}
        onExecutePlanDeployment={handleExecuteTacticalSquad}
      />

      <QuickDeployModal
        isOpen={isQuickDeployModalOpen}
        onClose={() => setIsQuickDeployModalOpen(false)}
        ownedAnimals={getOwnedAnimals()}
        quickDeployUnitIds={gameState.quickDeployUnitIds || []}
        onUpdateQuickDeploy={handleUpdateQuickDeploy}
        onSelectAnimalForDeploy={(id) => {
          setSelectedAnimalId(id);
          setPlaceOnlyBest(false);
          setSelectedPlacedTowerId(null);
        }}
        meat={gameState.meat}
      />

      <OverseerCutsceneModal
        isOpen={isOverseerCutsceneOpen}
        onClose={() => setIsOverseerCutsceneOpen(false)}
        onReward={() => {
          setGameState(prev => ({
            ...prev,
            meat: prev.meat + 10000,
            dna: prev.dna + 1000
          }));
        }}
      />

      <UnrivaledCutsceneModal
        isOpen={isUnrivaledCutsceneOpen}
        onClose={() => setIsUnrivaledCutsceneOpen(false)}
        onReward={() => {
          setGameState(prev => ({
            ...prev,
            meat: prev.meat + 100000,
            dna: prev.dna + 10000,
            shardsOfGods: (prev.shardsOfGods || 0) + 10
          }));
        }}
      />

      <WarperBladeClashCutsceneModal
        isOpen={isWarperClashCutsceneOpen}
        onClose={() => setIsWarperClashCutsceneOpen(false)}
        bossName={gameState.isUltraBoss ? "God of Destruction" : "Ultra World Boss"}
        onReward={() => {
          setGameState(prev => ({
            ...prev,
            ultraBossSlayer: true,
            ultraBossKills: (prev.ultraBossKills || 0) + 1,
            shardsOfGods: (prev.shardsOfGods || 0) + 50000,
            meat: prev.meat + 100000000,
            dna: prev.dna + 10000000
          }));
        }}
      />

      <SkyChasingCutsceneModal
        isOpen={isSkyChasingCutsceneOpen}
        onClose={() => setIsSkyChasingCutsceneOpen(false)}
        onReward={() => {
          setGameState(prev => ({
            ...prev,
            meat: prev.meat + 100000,
            dna: prev.dna + 50000,
            shardsOfGods: (prev.shardsOfGods || 0) + 25,
            skyFightScore: (prev.skyFightScore || 0) + 1000,
            skyChasingCutsceneTriggered: true,
          }));
        }}
      />

      <WarperInfectionCutsceneModal
        isOpen={isWarperInfectionCutsceneOpen}
        onClose={() => setIsWarperInfectionCutsceneOpen(false)}
        onComplete={() => {
          setIsTitanBaseReturnCutsceneOpen(true);
        }}
      />

      <TitanBaseReturnCutsceneModal
        isOpen={isTitanBaseReturnCutsceneOpen}
        onClose={() => setIsTitanBaseReturnCutsceneOpen(false)}
      />

      <BaseAttackPart1CutsceneModal
        isOpen={isBaseAttackPart1CutsceneOpen}
        onClose={() => setIsBaseAttackPart1CutsceneOpen(false)}
      />

      <BaseAttackPart2CutsceneModal
        isOpen={isBaseAttackPart2CutsceneOpen}
        onClose={() => setIsBaseAttackPart2CutsceneOpen(false)}
      />

      <BaseAttackPart3CutsceneModal
        isOpen={isBaseAttackPart3CutsceneOpen}
        onClose={() => setIsBaseAttackPart3CutsceneOpen(false)}
      />

      <LoreTitanTransformationCutsceneModal
        isOpen={isLoreTitanCutsceneOpen}
        onClose={() => setIsLoreTitanCutsceneOpen(false)}
        onTransformationComplete={handleTransformTitanToMultiverse}
      />

      <WarperReturnCutsceneModal
        isOpen={isWarperReturnCutsceneOpen}
        onClose={() => setIsWarperReturnCutsceneOpen(false)}
        onWarperPurified={handleWarperPurified}
      />

      <UltraBossVictoryModal
        isOpen={ultraBossVictoryData.isOpen}
        onClose={() => setUltraBossVictoryData(prev => ({ ...prev, isOpen: false }))}
        rewardShards={ultraBossVictoryData.rewardShards}
        rewardMeat={ultraBossVictoryData.rewardMeat}
        rewardDna={ultraBossVictoryData.rewardDna}
        killsCount={ultraBossVictoryData.killsCount}
      />

      <AnimalClashModal
        isOpen={isAnimalClashModalOpen}
        onClose={() => setIsAnimalClashModalOpen(false)}
        summonedAnimals={gameState.summonedAnimals}
        onReward={(shards, meat, dna) => {
          setGameState(prev => ({
            ...prev,
            shardsOfGods: (prev.shardsOfGods || 0) + shards,
            meat: prev.meat + meat,
            dna: prev.dna + dna
          }));
        }}
      />

      <PrimalArcadeModal
        isOpen={isArcadeModalOpen}
        onClose={() => setIsArcadeModalOpen(false)}
        meat={gameState.meat}
        dna={gameState.dna}
        shardsOfGods={gameState.shardsOfGods || 0}
        capyCoins={gameState.capyCoins || 0}
        gameTokens={gameState.gameTokens || 0}
        onUseGameTokens={(cost) => {
          if ((gameState.gameTokens || 0) >= cost) {
            setGameState(prev => ({
              ...prev,
              gameTokens: Math.max(0, (prev.gameTokens || 0) - cost)
            }));
            return true;
          }
          return false;
        }}
        onReward={(shards, meat, dna) => {
          setGameState(prev => ({
            ...prev,
            shardsOfGods: Math.max(0, (prev.shardsOfGods || 0) + shards),
            meat: Math.max(0, prev.meat + meat),
            dna: Math.max(0, prev.dna + dna)
          }));
        }}
      />

      <SummonCutsceneModal
        isOpen={devSummonCutscene.isOpen}
        onClose={() => setDevSummonCutscene({ isOpen: false, animals: [] })}
        summonedAnimals={devSummonCutscene.animals}
      />

      <DailyMissionsModal
        isOpen={isDailyMissionsOpen}
        onClose={() => setIsDailyMissionsOpen(false)}
        gameState={gameState}
        setGameState={setGameState}
      />

      <TitanUpgradeModal
        isOpen={isTitanUpgradeModalOpen}
        onClose={() => setIsTitanUpgradeModalOpen(false)}
        towers={towers}
        meat={gameState.meat}
        upgradeTitanPart={upgradeTitanPart}
        selectedTowerId={selectedPlacedTowerId}
        setIsLoreTitanCutsceneOpen={setIsLoreTitanCutsceneOpen}
      />

      <DailyMissionsHUD
        gameState={gameState}
        setGameState={setGameState}
      />

      <SkyModeInfoBox
        gameState={gameState}
        setGameState={setGameState}
        onOpenHangar={() => {
          if (towers.length > 0) {
            setSelectedPlacedTowerId(towers[0].id);
          }
        }}
        onTriggerChaseCutscene={() => setIsSkyChasingCutsceneOpen(true)}
      />

      <CurrencyConverterModal
        isOpen={isConverterOpen}
        onClose={() => setIsConverterOpen(false)}
        gameState={gameState}
        setGameState={setGameState}
      />

      <PlayerTradeModal
        isOpen={isTradeOpen}
        onClose={() => setIsTradeOpen(false)}
        gameState={gameState}
        setGameState={setGameState}
      />

      <BadgesModal
        isOpen={isBadgesModalOpen}
        onClose={() => setIsBadgesModalOpen(false)}
        gameState={gameState}
        setGameState={setGameState}
        towers={towers}
      />

      {/* Celebratory Badge Unlock Modal / Banner */}
      <AnimatePresence>
        {newBadgeToast && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className={`max-w-md w-full bg-slate-900 border-2 rounded-2xl p-6 shadow-[0_0_50px_rgba(168,85,247,0.5)] flex flex-col items-center text-center relative overflow-hidden ${newBadgeToast.borderClass}`}
            >
              {/* Particle Sparkle Backdrop */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent pointer-events-none" />

              <div className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-400 mb-2 flex items-center gap-1.5">
                <span>✨</span> NEW BADGE UNLOCKED <span>✨</span>
              </div>

              <div className="w-20 h-20 rounded-2xl bg-slate-950 border border-white/20 flex items-center justify-center text-4xl mb-4 shadow-[0_0_25px_rgba(255,255,255,0.2)] animate-bounce">
                {newBadgeToast.icon}
              </div>

              <h2 className={`text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r ${newBadgeToast.gradientClass} mb-1`}>
                {newBadgeToast.title}
              </h2>

              <span className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-3">
                {newBadgeToast.name}
              </span>

              <p className="text-xs text-slate-400 mb-4 px-4 leading-relaxed">
                {newBadgeToast.description}
              </p>

              <div className="w-full bg-slate-950/70 border border-white/10 rounded-xl p-3 mb-5 flex items-center justify-center gap-2">
                <span className="text-amber-300 text-xs font-bold">Perk Active:</span>
                <span className="text-emerald-400 text-xs font-mono font-black">{newBadgeToast.bonusDescription}</span>
              </div>

              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={() => {
                    setGameState(prev => ({
                      ...prev,
                      activeBadgeId: newBadgeToast.id,
                    }));
                    setNewBadgeToast(null);
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r ${newBadgeToast.gradientClass} shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer`}
                >
                  👑 Equip Title Now
                </button>
                <button
                  onClick={() => {
                    setNewBadgeToast(null);
                    setIsBadgesModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-300 bg-slate-800 hover:bg-slate-700 active:scale-95 transition-all cursor-pointer border border-white/10"
                >
                  View Hall
                </button>
              </div>

              <button
                onClick={() => setNewBadgeToast(null)}
                className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-full bg-slate-950/50 hover:bg-slate-800 transition-colors"
              >
                <X size={16} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <WaveMVPPopup
        summary={waveSummary}
        onClose={() => setWaveSummary(null)}
        onNextWave={startWave}
        autoDeployActive={gameState.autoDeployWaves}
      />

      {/* Dynamic Gacha Unlock Toasts */}
      {!gameState.disableAllNotifications && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-xs pointer-events-none">
          <AnimatePresence>
            {toasts.map((t) => (
              <motion.div
                key={`toast-unlock-${t.id}`}
                initial={{ opacity: 0, y: 15, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8, x: 50 }}
                transition={{ duration: 0.3 }}
                className="bg-slate-950/95 border-l-4 p-3.5 rounded-r-lg shadow-[0_10px_25px_rgba(0,0,0,0.5)] flex items-center gap-3 backdrop-blur-md pointer-events-auto"
                style={{ borderLeftColor: t.color || '#3b82f6' }}
              >
                <div className="p-1 px-2 rounded text-[9px] font-black uppercase text-slate-950 tracking-wider" style={{ backgroundColor: t.color || '#3b82f6' }}>
                  {t.rarity}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                    GENOME UNLOCKED!
                  </div>
                  <div className="text-sm font-black text-white tracking-wide truncate">
                    {t.name}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Mastery Milestone Level-Up Toasts */}
      {!gameState.disableAllNotifications && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 max-w-sm pointer-events-none w-full px-4">
          {masteryToasts.length > 1 && (
            <button
              onClick={dismissAllMasteryToasts}
              className="pointer-events-auto bg-slate-900/90 hover:bg-slate-800 border border-white/20 text-slate-300 hover:text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg backdrop-blur-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 animate-pulse"
            >
              <span>✕ Skip All ({masteryToasts.length})</span>
            </button>
          )}
          <AnimatePresence>
            {masteryToasts.map((toast) => (
              <motion.div
                key={`mastery-toast-${toast.id}`}
                initial={{ opacity: 0, y: -50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ type: 'spring', stiffness: 140, damping: 15 }}
                onClick={() => dismissMasteryToast(toast.id)}
                className="bg-slate-900/95 hover:bg-slate-900 border border-white/10 rounded-xl p-3.5 shadow-[0_15px_40px_rgba(0,0,0,0.6)] backdrop-blur-lg flex flex-col gap-2 pointer-events-auto border-t-4 cursor-pointer transition-all active:scale-[0.98] group w-full"
                style={{ borderTopColor: toast.color }}
                title="Click anywhere to skip notification"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🏆</span>
                    <div className="text-xs font-black tracking-wider uppercase text-slate-300">
                      MASTERY MILESTONE!
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="px-2 py-0.5 rounded text-[9px] font-black uppercase text-slate-900" style={{ backgroundColor: toast.color }}>
                      {toast.rarity}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        dismissMasteryToast(toast.id);
                      }}
                      className="text-slate-400 hover:text-white bg-white/5 hover:bg-white/15 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors"
                      title="Skip this notification"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="flex items-baseline justify-between gap-2 mt-0.5">
                  <div className="text-sm font-black text-white truncate max-w-[200px]">
                    {toast.animalName}
                  </div>
                  <div className="text-lg font-black text-indigo-400 font-mono">
                    Lvl {toast.level}
                  </div>
                </div>
                <div className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/25 px-2 py-1 rounded-md text-center uppercase tracking-wide flex items-center justify-between">
                  <span>🔥 Permanent Bonus: +{(toast.level - 1) * 2}% (+{((toast.level - 1) * 0.02 + 1).toFixed(2)}x)</span>
                  <span className="text-[8px] text-slate-400 font-normal lowercase tracking-tight opacity-75 group-hover:opacity-100">click to skip</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <MysteryFlashPopup
        isOpen={mysteryPopup.isOpen}
        type={mysteryPopup.type}
        name={mysteryPopup.name}
        description={mysteryPopup.description}
        onClose={() => setMysteryPopup(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Trait Roll Warning Dialog */}
      {traitWarning && traitWarning.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm mx-4 p-6 bg-slate-900 border-2 border-red-500/40 rounded-3xl shadow-[0_0_50px_rgba(239,68,68,0.25)] space-y-4 text-left">
            {/* Top indicator bar */}
            <div className="absolute inset-x-0 top-0 h-1 bg-red-500 animate-pulse rounded-t-3xl" />
            
            <div className="text-center space-y-2">
              <div className="mx-auto rounded-full w-12 h-12 bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 text-lg font-bold animate-bounce">
                ⚠️
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight text-white">Overwrite Good Trait?</h3>
              <p className="text-xs text-slate-400 leading-snug">
                This unit currently has the <span className="font-extrabold" style={{ color: traitWarning.traitColor }}>{traitWarning.traitName}</span> trait (<span className="font-extrabold uppercase" style={{ color: traitWarning.traitColor }}>{traitWarning.traitRarity}</span>).
              </p>
              <p className="text-xs text-slate-400 leading-snug px-3 py-2.5 bg-slate-950/70 border border-white/5 rounded-xl">
                Rerolling will permanently overwrite this rare trait. You can easily spend thousands of DNA Shards to get this trait back!
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => {
                  setTraitWarning(null);
                }}
                className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-slate-700 hover:text-white transition-all active:scale-95 cursor-pointer border border-white/5"
              >
                Keep Trait
              </button>
              <button
                onClick={() => {
                  const actionType = traitWarning.type;
                  const towerId = traitWarning.towerId;
                  setTraitWarning(null);
                  
                  if (actionType === 'reroll') {
                    const rolled = rerollTowerTrait(towerId);
                    if (!rolled) {
                      alert("Not enough DNA! Rerolling requires 200 DNA Shards.");
                    } else if (rolled === '???') {
                      setMysteryPopup({
                        isOpen: true,
                        type: 'trait',
                        name: '???',
                        description: 'An unstable cosmic mutation. Insinuates the host unit with absolute, extreme traits (+10,000% damage multiplier, +5,000% speed, and absolute multi-directional trajectory).'
                      });
                    }
                  } else {
                    const result = autoTuneBestFitTrait(towerId);
                    if (result) {
                      setTuningResult(result);
                      setTimeout(() => setTuningResult(null), 7000);
                    } else {
                      alert("Not enough DNA Shards! Auto-tuning requires 500 DNA Shards.");
                    }
                  }
                }}
                className="flex-1 py-2.5 bg-red-600 border border-red-500/40 text-white font-black rounded-xl text-xs uppercase tracking-wider hover:bg-red-500 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] cursor-pointer"
              >
                Overwrite It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modular Tab-Organized Dev Console */}
      <DevConsole
        isDevMode={isDevMode}
        isDevPanelOpen={isDevPanelOpen}
        setIsDevPanelOpen={setIsDevPanelOpen}
        gameState={gameState}
        setGameState={setGameState}
        gameStateRef={gameStateRef}
        towersRef={towersRef}
        setTowers={setTowers}
        setEnemies={setEnemies}
        setProjectiles={setProjectiles}
        devInvincible={devInvincible}
        setDevInvincible={setDevInvincible}
        devSpeed={devSpeed}
        setDevSpeed={setDevSpeed}
        setDevSummonCutscene={setDevSummonCutscene}
        shiftElementalHazards={shiftElementalHazards}
        spawnHunterCommander={spawnHunterCommander}
        setIsWarperClashCutsceneOpen={setIsWarperClashCutsceneOpen}
        setIsUnrivaledCutsceneOpen={setIsUnrivaledCutsceneOpen}
        setIsOverseerCutsceneOpen={setIsOverseerCutsceneOpen}
        setIsSkyChasingCutsceneOpen={setIsSkyChasingCutsceneOpen}
        setIsWarperInfectionCutsceneOpen={setIsWarperInfectionCutsceneOpen}
        setIsTitanBaseReturnCutsceneOpen={setIsTitanBaseReturnCutsceneOpen}
        setIsBaseAttackPart1CutsceneOpen={setIsBaseAttackPart1CutsceneOpen}
        setIsBaseAttackPart2CutsceneOpen={setIsBaseAttackPart2CutsceneOpen}
        setIsBaseAttackPart3CutsceneOpen={setIsBaseAttackPart3CutsceneOpen}
        setIsLoreTitanCutsceneOpen={setIsLoreTitanCutsceneOpen}
        setIsWarperReturnCutsceneOpen={setIsWarperReturnCutsceneOpen}
      />

      {/* --- INITIAL CYBERNETIC LOADING SCREEN --- */}
      <AnimatePresence>
        {isLoadingScreen && (
          <LoadingScreen onComplete={() => setIsLoadingScreen(false)} />
        )}
      </AnimatePresence>

      {/* --- WELCOME SCREEN / MAIN MENU --- */}
      <AnimatePresence>
        {!isLoadingScreen && isWelcomeScreen && (
          <WelcomeScreen
            onPlay={() => setIsWelcomeScreen(false)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenGuide={() => setIsGameGuideOpen(true)}
            onOpenAdminPrompt={() => setIsAdminSecurityOpen(true)}
            gameState={gameState}
            setGameState={setGameState}
          />
        )}
      </AnimatePresence>

      {/* --- TACTICAL FIELD GUIDE MODAL --- */}
      <GameGuideModal
        isOpen={isGameGuideOpen}
        onClose={() => setIsGameGuideOpen(false)}
      />

      {/* --- ADMIN CLEARANCE GATE MODAL (PASSWORD: RAHH) --- */}
      <AdminSecurityModal
        isOpen={isAdminSecurityOpen}
        onClose={() => setIsAdminSecurityOpen(false)}
        onSuccess={() => {
          setIsDevMode(true);
          setIsDevPanelOpen(true);
          localStorage.setItem('df_dev_mode_exclusive_thenewduckie', 'true');
        }}
      />
    </div>
  );
}
