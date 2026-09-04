import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Atom, 
  Sparkles, 
  Flame, 
  Zap, 
  Crown, 
  ArrowRight, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  Dna, 
  RefreshCw, 
  BookOpen, 
  Award, 
  Lock, 
  Unlock, 
  ShieldAlert, 
  TrendingUp,
  Cpu,
  History,
  Clock,
  Info,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  Compass
} from 'lucide-react';
import { Animal, Rarity, FusionRecord } from '../types';
import { ANIMALS } from '../constants';
import { AnimalAvatar } from './AnimalAvatar';
import { FUSION_RECIPES, TEMPLE_LEVELS, getAllFusedAnimals, getRecipeForRarity } from '../data/fusedTemple';

interface FusedTempleModalProps {
  isOpen: boolean;
  onClose: () => void;
  ownedAnimals: Animal[];
  summonedAnimalsRaw?: string[];
  dna: number;
  templeLevel?: number;
  templeEssence?: number;
  totalFusions?: number;
  fusionHistory?: FusionRecord[];
  onFuse: (unit1: Animal, unit2: Animal, outputUnit: Animal, dnaCost: number, essenceGain: number) => { success: boolean; message: string; outputUnit?: Animal };
  onBulkAutoFuse?: (pairs: { unit1: Animal; unit2: Animal; outputUnit: Animal; dnaCost: number; essenceGain: number }[]) => { success: boolean; message: string; count: number; totalDna: number; totalEssence: number };
  onUpgradeTemple?: (nextLevel: number, dnaCost: number, essenceCost: number) => { success: boolean; message: string };
  onOpenBackpack?: () => void;
}

export const FusedTempleModal: React.FC<FusedTempleModalProps> = ({
  isOpen,
  onClose,
  ownedAnimals,
  summonedAnimalsRaw = [],
  dna,
  templeLevel = 1,
  templeEssence = 0,
  totalFusions = 0,
  fusionHistory = [],
  onFuse,
  onBulkAutoFuse,
  onUpgradeTemple,
  onOpenBackpack,
}) => {
  const [activeTab, setActiveTab] = useState<'altar' | 'history' | 'hall' | 'sanctum'>('altar');
  const [selectedSlot1, setSelectedSlot1] = useState<Animal | null>(null);
  const [selectedSlot2, setSelectedSlot2] = useState<Animal | null>(null);
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [hallFilter, setHallFilter] = useState<'all' | 'mortal' | 'celestial' | 'apex'>('all');
  const [inspectGodUnit, setInspectGodUnit] = useState<Animal | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showWarperInfoModal, setShowWarperInfoModal] = useState<boolean>(false);

  const fusedUnitsList = useMemo(() => getAllFusedAnimals(), []);

  // Check if player owns Warper
  const hasWarper = useMemo(() => {
    return summonedAnimalsRaw.includes('arcane_warper') || ownedAnimals.some(a => a.id === 'arcane_warper');
  }, [summonedAnimalsRaw, ownedAnimals]);

  const warperAnimal = useMemo(() => {
    return ANIMALS.find(a => a.id === 'arcane_warper') || null;
  }, []);

  // Format relative timestamp
  const formatTimeAgo = (ts: number) => {
    const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
    if (diffSec < 10) return 'Just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    return `${diffHr}h ago`;
  };

  // Calculate Temple Perks based on level
  const dnaDiscount = useMemo(() => {
    if (templeLevel >= 7) return 0.35;
    if (templeLevel >= 2) return 0.15;
    return 0;
  }, [templeLevel]);

  const nextTempleInfo = useMemo(() => {
    return TEMPLE_LEVELS.find(l => l.level === templeLevel + 1);
  }, [templeLevel]);

  // Available candidate units in inventory
  const eligibleAnimals = useMemo(() => {
    return ownedAnimals.filter(a => {
      // Cannot fuse fused units further into low-tier common recipes
      const recipe = getRecipeForRarity(a.rarity);
      return !!recipe;
    });
  }, [ownedAnimals]);

  // Current Recipe based on selected slot 1
  const currentRecipe = useMemo(() => {
    if (!selectedSlot1) return null;
    return getRecipeForRarity(selectedSlot1.rarity);
  }, [selectedSlot1]);

  const outputAnimal = useMemo(() => {
    if (!currentRecipe) return null;
    return ANIMALS.find(a => a.id === currentRecipe.outputUnitId) || null;
  }, [currentRecipe]);

  const effectiveDnaCost = useMemo(() => {
    if (!currentRecipe) return 0;
    return Math.max(10, Math.floor(currentRecipe.dnaCost * (1 - dnaDiscount)));
  }, [currentRecipe, dnaDiscount]);

  // Detect available duplicate pairs for Temple Auto-Rites
  const bulkPairs = useMemo(() => {
    const counts: Record<string, Animal[]> = {};
    ownedAnimals.forEach(a => {
      const recipe = getRecipeForRarity(a.rarity);
      if (recipe) {
        counts[a.rarity] = counts[a.rarity] || [];
        counts[a.rarity].push(a);
      }
    });

    const pairs: { unit1: Animal; unit2: Animal; outputUnit: Animal; dnaCost: number; essenceGain: number }[] = [];
    let remainingDna = dna;

    Object.keys(counts).forEach(rarityKey => {
      const list = counts[rarityKey];
      const recipe = getRecipeForRarity(rarityKey as Rarity);
      if (!recipe) return;
      const targetUnit = ANIMALS.find(a => a.id === recipe.outputUnitId);
      if (!targetUnit) return;

      const cost = Math.max(10, Math.floor(recipe.dnaCost * (1 - dnaDiscount)));

      for (let i = 0; i < list.length - 1; i += 2) {
        if (remainingDna >= cost) {
          pairs.push({
            unit1: list[i],
            unit2: list[i + 1],
            outputUnit: targetUnit,
            dnaCost: cost,
            essenceGain: recipe.essenceReward
          });
          remainingDna -= cost;
        }
      }
    });

    return pairs;
  }, [ownedAnimals, dna, dnaDiscount]);

  if (!isOpen) return null;

  const handleSelectUnit = (animal: Animal) => {
    if (!selectedSlot1) {
      setSelectedSlot1(animal);
      setSelectedSlot2(null);
      setFeedback(null);
    } else if (selectedSlot1 && !selectedSlot2) {
      if (animal.id === selectedSlot1.id) {
        // Can be twin copies of same animal or matching rarity
        setSelectedSlot2(animal);
      } else if (animal.rarity === selectedSlot1.rarity) {
        setSelectedSlot2(animal);
      } else {
        setFeedback({
          type: 'error',
          message: `Slot 2 must match ${selectedSlot1.rarity} tier to initiate Sacred Synthesis!`
        });
      }
    } else {
      setSelectedSlot1(animal);
      setSelectedSlot2(null);
      setFeedback(null);
    }
  };

  const handleExecuteFusion = () => {
    if (!selectedSlot1 || !selectedSlot2 || !outputAnimal || !currentRecipe) {
      setFeedback({ type: 'error', message: 'Sacred Altar requires two valid matching constructs!' });
      return;
    }

    if (dna < effectiveDnaCost) {
      setFeedback({ type: 'error', message: `Insufficient DNA! Need ${effectiveDnaCost.toLocaleString()} DNA for this ritual.` });
      return;
    }

    const res = onFuse(selectedSlot1, selectedSlot2, outputAnimal, effectiveDnaCost, currentRecipe.essenceReward);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setSelectedSlot1(null);
      setSelectedSlot2(null);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleExecuteBulkAutoFuse = () => {
    if (bulkPairs.length === 0) {
      setFeedback({ type: 'error', message: 'No eligible matching pairs or insufficient DNA for Auto-Rites.' });
      return;
    }

    if (onBulkAutoFuse) {
      const res = onBulkAutoFuse(bulkPairs);
      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
        setSelectedSlot1(null);
        setSelectedSlot2(null);
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    }
  };

  const handleUpgradeTempleClick = () => {
    if (!nextTempleInfo) return;
    if (dna < nextTempleInfo.dnaCost || templeEssence < nextTempleInfo.essenceCost) {
      setFeedback({
        type: 'error',
        message: `Requires ${nextTempleInfo.dnaCost.toLocaleString()} DNA and ${nextTempleInfo.essenceCost} Temple Essences.`
      });
      return;
    }

    if (onUpgradeTemple) {
      const res = onUpgradeTemple(nextTempleInfo.level, nextTempleInfo.dnaCost, nextTempleInfo.essenceCost);
      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="relative w-full max-w-5xl max-h-[92vh] bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-amber-500/50 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col overflow-hidden text-slate-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-amber-500/30 bg-gradient-to-r from-amber-950/60 via-slate-900/90 to-purple-950/60 relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse" />
            
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-500/20 border-2 border-amber-400/70 flex items-center justify-center text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                <Atom size={24} className="animate-spin-slow" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 flex items-center gap-2">
                    🏛️ FUSED TEMPLE
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/20 border border-amber-400/50 text-amber-300">
                    SANCTUARY LVL {templeLevel}
                  </span>
                </div>
                <p className="text-xs text-amber-200/70 font-medium">
                  The ancient sanctuary of cosmic genetic synthesis. Combine twin constructs to awaken Fused Tier gods.
                </p>
              </div>
            </div>

            {/* Currency Badges & Close */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-teal-500/40 text-teal-300 text-xs font-mono font-black shadow-inner">
                <Dna size={14} className="text-teal-400" />
                <span>{dna.toLocaleString()} DNA</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-amber-500/40 text-amber-300 text-xs font-mono font-black shadow-inner">
                <Sparkles size={14} className="text-amber-400 animate-pulse" />
                <span>{templeEssence} ESSENCE</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-950/90 border-b border-slate-800/80 overflow-x-auto">
            <button
              onClick={() => setActiveTab('altar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
                activeTab === 'altar'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Flame size={15} />
              <span>Sacred Altar</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <History size={15} />
              <span>Fusion History</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${
                activeTab === 'history' ? 'bg-black/40 text-slate-950 font-bold' : 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
              }`}>
                {fusionHistory.slice(0, 5).length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('hall')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
                activeTab === 'hall'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <BookOpen size={15} />
              <span>Hall of Fused Gods</span>
              <span className="px-1.5 py-0.2 bg-black/40 rounded-full text-[9px] font-mono">
                {fusedUnitsList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('sanctum')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
                activeTab === 'sanctum'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Award size={15} />
              <span>Blessings & Ranks</span>
              <span className="px-1.5 py-0.2 bg-amber-950 text-amber-300 border border-amber-500/40 rounded-full text-[9px] font-mono">
                LVL {templeLevel}
              </span>
            </button>

            {/* Quick Bulk Synthesis Button in header bar */}
            {bulkPairs.length > 0 && (
              <div className="ml-auto shrink-0">
                <button
                  onClick={handleExecuteBulkAutoFuse}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(20,184,166,0.3)] cursor-pointer transition-all active:scale-95"
                >
                  <RefreshCw size={13} className="animate-spin-slow" />
                  <span>Auto-Rite ({bulkPairs.length} Pairs)</span>
                </button>
              </div>
            )}
          </div>

          {/* Feedback Alert Toast */}
          {feedback && (
            <div className={`mx-4 mt-3 p-3 rounded-xl flex items-center gap-2.5 text-xs font-bold border ${
              feedback.type === 'success' 
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                : 'bg-rose-950/80 border-rose-500/50 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
            }`}>
              {feedback.type === 'success' ? <CheckCircle2 size={16} className="text-emerald-400 shrink-0" /> : <AlertCircle size={16} className="text-rose-400 shrink-0" />}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Main Body */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {/* ================= TAB 1: SACRED ALTAR OF FUSION ================= */}
            {activeTab === 'altar' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Left: Interactive Altar Stage (5 cols) */}
                <div className="lg:col-span-6 bg-slate-950/80 border border-amber-500/30 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute inset-0 bg-radial from-amber-500/5 via-transparent to-transparent pointer-events-none" />

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                        <Flame size={14} className="text-amber-400" /> SACRED SYNTHESIS CRUCIBLE
                      </span>
                      {dnaDiscount > 0 && (
                        <span className="text-[10px] font-bold text-teal-300 bg-teal-950/80 border border-teal-500/40 px-2 py-0.5 rounded-md">
                          -{Math.round(dnaDiscount * 100)}% Temple DNA Discount
                        </span>
                      )}
                    </div>

                    {/* Dual Input Slots & Output Conduit */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {/* Slot 1 */}
                      <div 
                        onClick={() => setSelectedSlot1(null)}
                        className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-center cursor-pointer min-h-[140px] relative ${
                          selectedSlot1 
                            ? 'bg-slate-900 border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.2)]' 
                            : 'bg-slate-900/40 border-dashed border-slate-700 hover:border-amber-400/50'
                        }`}
                      >
                        {selectedSlot1 ? (
                          <>
                            <div className="w-12 h-12 rounded-xl bg-slate-950 border flex items-center justify-center p-1 mb-1.5" style={{ borderColor: selectedSlot1.color }}>
                              <AnimalAvatar animal={selectedSlot1} size="sm" animated={true} />
                            </div>
                            <div className="text-xs font-black text-white truncate max-w-[120px]">{selectedSlot1.name}</div>
                            <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: selectedSlot1.color }}>{selectedSlot1.rarity}</span>
                            <span className="text-[8px] text-slate-400 mt-1">Click to remove</span>
                          </>
                        ) : (
                          <>
                            <div className="w-10 h-10 rounded-xl bg-slate-800/60 flex items-center justify-center text-slate-500 mb-1.5">
                              <Atom size={20} />
                            </div>
                            <span className="text-xs font-bold text-slate-400">Select Construct A</span>
                            <span className="text-[9px] text-slate-500">Pick from inventory below</span>
                          </>
                        )}
                      </div>

                      {/* Slot 2 */}
                      <div 
                        onClick={() => setSelectedSlot2(null)}
                        className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-center cursor-pointer min-h-[140px] relative ${
                          selectedSlot2 
                            ? 'bg-slate-900 border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.2)]' 
                            : 'bg-slate-900/40 border-dashed border-slate-700 hover:border-amber-400/50'
                        }`}
                      >
                        {selectedSlot2 ? (
                          <>
                            <div className="w-12 h-12 rounded-xl bg-slate-950 border flex items-center justify-center p-1 mb-1.5" style={{ borderColor: selectedSlot2.color }}>
                              <AnimalAvatar animal={selectedSlot2} size="sm" animated={true} />
                            </div>
                            <div className="text-xs font-black text-white truncate max-w-[120px]">{selectedSlot2.name}</div>
                            <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: selectedSlot2.color }}>{selectedSlot2.rarity}</span>
                            <span className="text-[8px] text-slate-400 mt-1">Click to remove</span>
                          </>
                        ) : (
                          <>
                            <div className="w-10 h-10 rounded-xl bg-slate-800/60 flex items-center justify-center text-slate-500 mb-1.5">
                              <Atom size={20} />
                            </div>
                            <span className="text-xs font-bold text-slate-400">Select Construct B</span>
                            <span className="text-[9px] text-slate-500">Must match tier</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Output Conduit Preview */}
                    <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-amber-950/40 border border-amber-500/40 relative overflow-hidden">
                      <div className="text-[9.5px] font-black uppercase tracking-widest text-amber-300 mb-2 flex items-center justify-between">
                        <span>SYNTHESIS OUTCOME:</span>
                        {currentRecipe && (
                          <span className="text-teal-300 font-mono">+{currentRecipe.essenceReward} Temple Essence</span>
                        )}
                      </div>

                      {outputAnimal ? (
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-2xl bg-slate-950 border-2 flex items-center justify-center p-1.5 shadow-[0_0_20px_rgba(245,158,11,0.3)] shrink-0" style={{ borderColor: outputAnimal.color }}>
                            <AnimalAvatar animal={outputAnimal} size="md" animated={true} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-black text-white truncate flex items-center gap-1.5">
                              <span>{outputAnimal.name}</span>
                              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-400 text-amber-300 text-[8.5px]">FUSED</span>
                            </div>
                            <div className="text-[10px] font-bold font-mono text-amber-300">
                              {outputAnimal.rarity} Tier • {outputAnimal.damage.toLocaleString()} DMG
                            </div>
                            <div className="text-[9px] text-slate-300 line-clamp-1 mt-0.5">
                              {outputAnimal.skillName ? `${outputAnimal.skillName}: ${outputAnimal.skillDesc}` : outputAnimal.description}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="py-4 text-center text-xs text-slate-400">
                          Select two matching tier units to reveal divine Fused entity blueprint.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Button & Cost */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-400">Altar Ritual Cost:</span>
                      <span className="text-xs font-mono font-black text-teal-300">
                        {effectiveDnaCost.toLocaleString()} DNA
                      </span>
                    </div>
                    <button
                      disabled={!selectedSlot1 || !selectedSlot2 || !outputAnimal || dna < effectiveDnaCost}
                      onClick={handleExecuteFusion}
                      className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        selectedSlot1 && selectedSlot2 && outputAnimal && dna >= effectiveDnaCost
                          ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:scale-[1.01] active:scale-[0.98]'
                          : 'bg-slate-800/60 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                      }`}
                    >
                      <Sparkles size={16} />
                      <span>Awaken Divine Fused Beast</span>
                    </button>
                  </div>
                </div>

                {/* Right: Available Inventory Sacrifice Select (7 cols) */}
                <div className="lg:col-span-6 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Layers size={14} className="text-cyan-400" /> CONSTRUCT SELECTION POOL ({eligibleAnimals.length})
                    </span>
                    
                    {/* Rarity filter pills */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-[240px]">
                      {['all', 'Common', 'Rare', 'Epic', 'Legendary', 'Mythic'].map((r) => (
                        <button
                          key={r}
                          onClick={() => setFilterRarity(r)}
                          className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase transition-all cursor-pointer ${
                            filterRarity === r
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-900 text-slate-400 hover:text-white'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Grid of units */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 overflow-y-auto max-h-[360px] p-1 custom-scrollbar">
                    {eligibleAnimals
                      .filter(a => filterRarity === 'all' || a.rarity === filterRarity)
                      .map((animal, idx) => {
                        const isSlot1 = selectedSlot1?.id === animal.id;
                        const isSlot2 = selectedSlot2?.id === animal.id;
                        const isSelected = isSlot1 || isSlot2;

                        return (
                          <div
                            key={`${animal.id}-${idx}`}
                            onClick={() => handleSelectUnit(animal)}
                            className={`p-2 rounded-xl border bg-slate-900/90 hover:bg-slate-800 transition-all flex flex-col items-center text-center cursor-pointer relative group ${
                              isSelected 
                                ? 'border-amber-400 bg-amber-950/30 ring-2 ring-amber-400/40 shadow-lg' 
                                : 'border-slate-800 hover:border-slate-600'
                            }`}
                          >
                            <div className="w-9 h-9 rounded-lg bg-slate-950 border flex items-center justify-center p-0.5 mb-1" style={{ borderColor: animal.color }}>
                              <AnimalAvatar animal={animal} size="xs" animated={false} />
                            </div>
                            <div className="text-[10px] font-black text-white truncate max-w-full leading-tight">{animal.name}</div>
                            <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: animal.color }}>
                              {animal.rarity}
                            </span>

                            {isSelected && (
                              <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[8px] font-black shadow">
                                {isSlot1 ? 'A' : 'B'}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    {eligibleAnimals.length === 0 && (
                      <div className="col-span-full py-12 text-center text-xs text-slate-500">
                        No constructs available in inventory for fusion. Summon more from the Summoning Altar!
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom of Altar: Recent Synthesis History Teaser */}
                <div className="lg:col-span-12 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <History size={15} className="text-amber-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                      Recent Synthesis:
                    </span>
                    {fusionHistory.length > 0 ? (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-300 font-bold">{fusionHistory[0].component1.name}</span>
                        <span className="text-amber-400">+</span>
                        <span className="text-slate-300 font-bold">{fusionHistory[0].component2.name}</span>
                        <ArrowRight size={12} className="text-amber-400" />
                        <span className="text-amber-300 font-black">{fusionHistory[0].result.name}</span>
                        <span className="text-[10px] text-teal-300 font-mono">({formatTimeAgo(fusionHistory[0].timestamp)})</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">No syntheses yet. Combine twin constructs to awaken Fused gods!</span>
                    )}
                  </div>

                  <button
                    onClick={() => setActiveTab('history')}
                    className="flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    <span>View All History ({fusionHistory.slice(0, 5).length}/5)</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* ================= TAB 2: FUSION HISTORY (LAST 5 SYNTHESES) ================= */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                {/* Header info */}
                <div className="flex items-center justify-between flex-wrap gap-2 p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-purple-950/60 border border-amber-500/30">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                      <History size={24} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-amber-300 flex items-center gap-2">
                        📜 SACRED SYNTHESIS CHRONICLES (LAST 5 SYNTHESES)
                      </h3>
                      <p className="text-xs text-slate-300">
                        Detailed audit trail tracking your latest divine transmutations, sacrificed materials, and awakened constructs.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Total Temple Rites</div>
                      <div className="text-sm font-mono font-black text-amber-300">{totalFusions} Completed</div>
                    </div>
                  </div>
                </div>

                {/* History list */}
                {fusionHistory.slice(0, 5).length > 0 ? (
                  <div className="space-y-3">
                    {fusionHistory.slice(0, 5).map((record, index) => (
                      <motion.div
                        key={record.id || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-2xl bg-slate-950/90 border border-amber-500/30 hover:border-amber-400/60 transition-all shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden"
                      >
                        {/* Left sequence index badge */}
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] font-mono font-bold text-slate-400">
                          #{index + 1} • {formatTimeAgo(record.timestamp)}
                        </div>

                        {/* Components A + B */}
                        <div className="flex items-center gap-2 sm:gap-3 mt-4 md:mt-0 flex-wrap justify-center">
                          {/* Component 1 */}
                          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800" style={{ borderColor: `${record.component1.color}40` }}>
                            <div className="w-8 h-8 rounded-lg bg-slate-950 border flex items-center justify-center text-sm shadow-inner" style={{ borderColor: record.component1.color }}>
                              {record.component1.emoji}
                            </div>
                            <div>
                              <div className="text-xs font-black text-white truncate max-w-[100px] sm:max-w-[130px]">{record.component1.name}</div>
                              <span className="text-[9px] font-bold uppercase" style={{ color: record.component1.color }}>{record.component1.rarity}</span>
                            </div>
                          </div>

                          {/* Plus sign with cost */}
                          <div className="flex flex-col items-center justify-center px-1">
                            <span className="text-amber-400 font-black text-sm">+</span>
                            <span className="text-[8px] font-mono text-teal-300 font-bold">-{record.dnaCost.toLocaleString()} DNA</span>
                          </div>

                          {/* Component 2 */}
                          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800" style={{ borderColor: `${record.component2.color}40` }}>
                            <div className="w-8 h-8 rounded-lg bg-slate-950 border flex items-center justify-center text-sm shadow-inner" style={{ borderColor: record.component2.color }}>
                              {record.component2.emoji}
                            </div>
                            <div>
                              <div className="text-xs font-black text-white truncate max-w-[100px] sm:max-w-[130px]">{record.component2.name}</div>
                              <span className="text-[9px] font-bold uppercase" style={{ color: record.component2.color }}>{record.component2.rarity}</span>
                            </div>
                          </div>
                        </div>

                        {/* Conduit Arrow */}
                        <div className="flex items-center gap-1.5 text-amber-400 px-2 shrink-0">
                          <Sparkles size={14} className="animate-pulse text-amber-300" />
                          <ArrowRight size={18} className="animate-bounce-x" />
                        </div>

                        {/* Resulting Fused Unit */}
                        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-amber-950/40 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)] w-full md:w-auto justify-between md:justify-start">
                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-slate-950 border-2 flex items-center justify-center text-lg shadow shrink-0" style={{ borderColor: record.result.color }}>
                              {record.result.emoji}
                            </div>
                            <div>
                              <div className="text-xs font-black text-white truncate flex items-center gap-1.5">
                                <span>{record.result.name}</span>
                                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-400 text-amber-300 text-[8px] font-bold">AWAKENED</span>
                              </div>
                              <div className="text-[10px] font-mono font-bold text-amber-300">
                                {record.result.rarity} • {record.result.damage.toLocaleString()} DMG
                              </div>
                            </div>
                          </div>

                          <div className="text-right pl-3 border-l border-amber-500/20 shrink-0">
                            <div className="text-[9px] uppercase font-bold text-slate-400">Essence Gained</div>
                            <div className="text-xs font-mono font-black text-amber-300">+{record.essenceGain} ✨</div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 text-center flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 mb-3">
                      <History size={32} />
                    </div>
                    <h4 className="text-sm font-black uppercase tracking-wider text-slate-300 mb-1">
                      No Synthesis History Recorded Yet
                    </h4>
                    <p className="text-xs text-slate-500 max-w-md mb-4">
                      When you combine matching-tier constructs at the Sacred Crucible or use Auto-Rites, your last 5 successful syntheses will be archived here.
                    </p>
                    <button
                      onClick={() => setActiveTab('altar')}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition-all"
                    >
                      Enter Sacred Altar
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ================= TAB 3: HALL OF FUSED GODS & ARCANE WARPER ARCHIVE ================= */}
            {activeTab === 'hall' && (
              <div className="space-y-4">
                {/* Dedicated Arcane Warper Archive & Info Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/80 via-indigo-950/70 to-slate-950 border-2 border-purple-500/50 shadow-[0_0_30px_rgba(192,132,252,0.2)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-pulse" />
                  
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border-2 border-purple-400 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(192,132,252,0.4)] shrink-0">
                        🧿
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-base font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-fuchsia-300 to-purple-400 flex items-center gap-2">
                            🌌 WARPER & THE ARCANE PANTHEON
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-purple-500/20 border border-purple-400/50 text-purple-300">
                            SUPREME DEITY ARCHIVE
                          </span>
                        </div>
                        <p className="text-xs text-purple-200/80 font-medium mt-0.5">
                          Looking for <span className="font-bold text-purple-300">Warper</span>? Warper is the supreme 1st Arcane Story Deity unlocked at <span className="text-amber-300 font-bold">Wave 399 of Lore Mode</span> (or Dev Summon)!
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                      <div className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 ${
                        hasWarper 
                          ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                          : 'bg-slate-900 border-purple-500/40 text-purple-300'
                      }`}>
                        {hasWarper ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Lock size={14} className="text-purple-400" />}
                        <span>{hasWarper ? 'WARPER UNLOCKED' : 'WARPER LOCKED (WAVE 399)'}</span>
                      </div>

                      <button
                        onClick={() => setShowWarperInfoModal(true)}
                        className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer shrink-0"
                      >
                        Warper Lore & Guide
                      </button>
                    </div>
                  </div>

                  {/* Lore guide breakdown snippet */}
                  <div className="mt-3 pt-3 border-t border-purple-500/20 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-black/40 border border-purple-500/20">
                      <div className="font-bold text-purple-300 flex items-center gap-1.5 mb-1">
                        <span>🧿 Warper (Story Arcane Deity)</span>
                      </div>
                      <div className="text-[10px] text-slate-300 leading-relaxed">
                        • 999,999,999 Base DMG • Locked <span className="text-purple-300 font-bold">Death of World</span> (x100 DMG) Trait<br/>
                        • Active Skill: <span className="text-amber-300 font-bold">World Crusher</span> (screen-clearing wipe)<br/>
                        • <span className="text-slate-400">Obtained via:</span> Lore Mode Wave 399 Purified Homecoming Cutscene
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-black/40 border border-purple-500/20">
                      <div className="font-bold text-amber-300 flex items-center gap-1.5 mb-1">
                        <span>🧪 [FUSED] Twin Singularity Sovereign (Fused Arcane)</span>
                      </div>
                      <div className="text-[10px] text-slate-300 leading-relaxed">
                        • 2,500,000,000 Base DMG • Multi-beam singularity annihilation<br/>
                        • Permanent <span className="text-purple-300 font-bold">Death of World</span> Trait<br/>
                        • <span className="text-slate-400">Obtained via:</span> Synthesizing <span className="text-amber-300 font-bold">2x Overseer Constructs</span> in this Temple!
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                      <Crown size={16} className="text-amber-400" /> THE MULTIVERSE FUSED PANTHEON
                    </h3>
                    <p className="text-xs text-slate-400">
                      All known Fused category constructs in existence. Inspect their unique passives, damage scaling, and fusion recipes.
                    </p>
                  </div>

                  {/* Filter tabs */}
                  <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    {[
                      { id: 'all', label: 'All Fused' },
                      { id: 'mortal', label: 'Rare - Legend' },
                      { id: 'celestial', label: 'Mythic - Celestial' },
                      { id: 'apex', label: 'God-Tier (Arcane)' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setHallFilter(tab.id as any)}
                        className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                          hallFilter === tab.id
                            ? 'bg-amber-500 text-slate-950 shadow-md'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cards grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {fusedUnitsList
                    .filter(a => {
                      if (hallFilter === 'mortal') return ['Rare', 'Epic', 'Legendary'].includes(a.rarity);
                      if (hallFilter === 'celestial') return ['Mythic', 'Secret', 'Celestial'].includes(a.rarity);
                      if (hallFilter === 'apex') return ['???', 'Original', 'Overseer', 'Unrivaled', 'Arcane'].includes(a.rarity);
                      return true;
                    })
                    .map((fusedUnit) => {
                      const isOwned = ownedAnimals.some(oa => oa.id === fusedUnit.id);
                      const recipe = FUSION_RECIPES.find(r => r.outputUnitId === fusedUnit.id);

                      return (
                        <div
                          key={fusedUnit.id}
                          className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between relative overflow-hidden group ${
                            isOwned
                              ? 'bg-gradient-to-b from-slate-900/90 to-slate-950 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                              : 'bg-slate-950/60 border-slate-800/80 opacity-80'
                          }`}
                        >
                          <div>
                            {/* Card Header */}
                            <div className="flex items-center justify-between mb-2">
                              <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-amber-500/20 border border-amber-400/50 text-amber-300">
                                🧪 FUSED CATEGORY
                              </span>
                              <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded bg-slate-900 border" style={{ color: fusedUnit.color, borderColor: `${fusedUnit.color}40` }}>
                                {fusedUnit.rarity}
                              </span>
                            </div>

                            {/* Avatar and Name */}
                            <div className="flex items-center gap-3 mb-2.5">
                              <div className="w-12 h-12 rounded-xl bg-slate-950 border-2 flex items-center justify-center p-1 shadow-inner shrink-0" style={{ borderColor: fusedUnit.color }}>
                                <AnimalAvatar animal={fusedUnit} size="sm" animated={true} />
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-black text-white truncate leading-tight">{fusedUnit.name}</h4>
                                <div className="text-[10px] font-mono font-bold text-amber-300">
                                  {fusedUnit.damage.toLocaleString()} DMG • {fusedUnit.range} RNG
                                </div>
                              </div>
                            </div>

                            {/* Skill or Description */}
                            <div className="p-2 rounded-xl bg-slate-950/90 border border-slate-800/80 text-[9.5px] text-slate-300 leading-relaxed mb-3">
                              {fusedUnit.skillName ? (
                                <>
                                  <div className="font-bold text-amber-300 mb-0.5 flex items-center gap-1">
                                    <Sparkles size={10} /> {fusedUnit.skillName}
                                  </div>
                                  <div className="text-slate-400 text-[8.5px]">{fusedUnit.skillDesc}</div>
                                </>
                              ) : (
                                <div className="text-slate-400">{fusedUnit.description}</div>
                              )}
                            </div>
                          </div>

                          {/* Recipe Footer */}
                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[9px]">
                            {recipe ? (
                              <div className="text-slate-400 flex items-center gap-1">
                                <span>Recipe:</span>
                                <span className="font-bold text-white">2x {recipe.inputRarity}</span>
                                <span>+</span>
                                <span className="font-mono text-teal-300">{recipe.dnaCost.toLocaleString()} DNA</span>
                              </div>
                            ) : (
                              <span className="text-slate-500">Divine Transmutation</span>
                            )}
                            
                            <span className={`font-black uppercase tracking-wider px-2 py-0.5 rounded text-[8.5px] ${
                              isOwned ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-slate-900 text-slate-500'
                            }`}>
                              {isOwned ? 'UNLOCKED' : 'LOCKED'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* ================= TAB 3: TEMPLE BLESSINGS & RANKS ================= */}
            {activeTab === 'sanctum' && (
              <div className="space-y-4">
                {/* Temple Rank Header Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-purple-950/60 border border-amber-500/40 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                      <Crown size={28} className="animate-pulse" />
                    </div>
                    <div>
                      <div className="text-base font-black uppercase tracking-wider text-amber-300 flex items-center gap-2">
                        SANCTUARY LEVEL {templeLevel} / 10
                      </div>
                      <div className="text-xs text-slate-300">
                        Upgrade the Fused Temple using DNA and Temple Essences to unlock passive blessings across all Fused towers.
                      </div>
                    </div>
                  </div>

                  {nextTempleInfo ? (
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <div className="text-right font-mono text-xs">
                        <div className="text-teal-300 font-bold">{nextTempleInfo.dnaCost.toLocaleString()} DNA</div>
                        <div className="text-amber-300 font-bold">{nextTempleInfo.essenceCost} Essences</div>
                      </div>
                      <button
                        onClick={handleUpgradeTempleClick}
                        disabled={dna < nextTempleInfo.dnaCost || templeEssence < nextTempleInfo.essenceCost}
                        className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                          dna >= nextTempleInfo.dnaCost && templeEssence >= nextTempleInfo.essenceCost
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:scale-105 active:scale-95'
                            : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                        }`}
                      >
                        Elevate to Level {nextTempleInfo.level}
                      </button>
                    </div>
                  ) : (
                    <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-black uppercase">
                      MAXIMUM TEMPLE LEVEL
                    </div>
                  )}
                </div>

                {/* List of 10 Temple Levels & Perks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {TEMPLE_LEVELS.map((levelInfo) => {
                    const isUnlocked = templeLevel >= levelInfo.level;
                    const isNext = templeLevel + 1 === levelInfo.level;

                    return (
                      <div
                        key={levelInfo.level}
                        className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 relative ${
                          isUnlocked
                            ? 'bg-slate-900/90 border-amber-400/50 shadow-sm'
                            : isNext
                            ? 'bg-slate-950 border-cyan-500/40'
                            : 'bg-slate-950/60 border-slate-800/80 opacity-60'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                          isUnlocked ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-500'
                        }`}>
                          {isUnlocked ? <CheckCircle2 size={18} /> : <Lock size={18} />}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-wider text-white">
                              Level {levelInfo.level}: {levelInfo.title}
                            </span>
                            <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded ${
                              isUnlocked ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-slate-900 text-slate-500'
                            }`}>
                              {isUnlocked ? 'ACTIVE' : 'LOCKED'}
                            </span>
                          </div>

                          <div className="text-[10.5px] font-bold text-amber-300 mt-0.5">
                            {levelInfo.unlockedPerk}
                          </div>
                          <div className="text-[9.5px] text-slate-300 leading-relaxed mt-0.5">
                            {levelInfo.perkDescription}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* ================= WARPER LORE & ARCHIVE POPUP MODAL ================= */}
        {showWarperInfoModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-slate-950 border-2 border-purple-500/60 rounded-3xl p-6 shadow-[0_0_50px_rgba(168,85,247,0.3)] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-fuchsia-400 to-indigo-500 animate-pulse" />

              {/* Close Button */}
              <button
                onClick={() => setShowWarperInfoModal(false)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>

              {/* Header */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-purple-950/60 border-2 border-purple-400 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                  🧿
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white uppercase tracking-wider">
                      Warper (True Arcane)
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-purple-500/20 border border-purple-400 text-purple-300">
                      ARCANE
                    </span>
                  </div>
                  <div className="text-xs text-purple-300 font-mono font-bold mt-0.5">
                    999,999,999 DMG • 999 RNG • 0.15s SPD
                  </div>
                  <div className="mt-1">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      hasWarper ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-slate-900 text-purple-300 border border-purple-500/30'
                    }`}>
                      {hasWarper ? <CheckCircle2 size={12} /> : <Lock size={12} />}
                      {hasWarper ? 'Unlocked in Your Roster' : 'Locked: Wave 399 Lore Mode'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Explanation section */}
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-900/90 border border-purple-500/30">
                  <div className="font-black uppercase tracking-wider text-purple-300 mb-1 flex items-center gap-1.5">
                    <HelpCircle size={14} /> Why is Warper not in the Fusion Recipes?
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    <span className="text-white font-bold">Warper</span> is the legendary ancient Story Arcane Deity from the main campaign. It is an <span className="text-purple-300 font-bold">Extinct Lore Construct</span> unlocked through the Wave 399 Homecoming narrative, not forged by sacrificing lower-tier units.
                  </p>
                  <p className="text-slate-300 leading-relaxed text-[11px] mt-2">
                    In the Fused Temple, sacrificing <span className="text-amber-300 font-bold">2x Overseer Constructs</span> synthesizes the <span className="text-amber-300 font-bold">[FUSED] Twin Singularity Sovereign</span> (Fused Arcane Tier), allowing you to wield both Arcane titans simultaneously!
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/90 border border-purple-500/30">
                  <div className="font-black uppercase tracking-wider text-amber-300 mb-1 flex items-center gap-1.5">
                    <Sparkles size={14} /> Unique Warper Arsenal
                  </div>
                  <div className="text-[11px] text-slate-300 space-y-1">
                    <div>• <span className="font-bold text-white">World Crusher</span>: Active ultimate skill instantly vaporizing normal waves and crushing bosses.</div>
                    <div>• <span className="font-bold text-white">Death of World Trait</span>: Permanent +10,000% damage multiplier trait that bypasses standard trait rerolling.</div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-950/40 to-slate-900 border border-purple-500/20 text-[11px] text-slate-300 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white">How to Unlock:</span> Reach & complete Wave 399 in Lore Campaign Mode.
                  </div>
                  {onOpenBackpack && hasWarper && (
                    <button
                      onClick={() => {
                        setShowWarperInfoModal(false);
                        onOpenBackpack();
                      }}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-[10px] uppercase cursor-pointer"
                    >
                      View in Backpack
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-5 text-center">
                <button
                  onClick={() => setShowWarperInfoModal(false)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-black uppercase text-xs rounded-xl transition-all cursor-pointer"
                >
                  Understood
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
};
