import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Sparkles, 
  Zap, 
  ArrowRight, 
  Check, 
  AlertTriangle,
  Atom,
  Lock,
  Coins
} from 'lucide-react';
import { Animal, Rarity } from '../types';
import { ANIMALS } from '../constants';
import AnimalAvatar from './AnimalAvatar';

interface FusionModalProps {
  isOpen: boolean;
  onClose: () => void;
  ownedAnimals: Animal[]; // List of unique owned constructs
  summonedAnimalsRaw: string[]; // List of all owned construct IDs (including duplicates)
  dna: number;
  onFuse: (parentAId: string, parentBId: string, resultId: string, dnaCost: number) => void;
}

const FUSION_MAPPING: Record<Rarity, { resultId: string; nextRarity: Rarity; cost: number }> = {
  'Common': { resultId: 'fused_chimera_pup', nextRarity: 'Rare', cost: 150 },
  'Rare': { resultId: 'fused_dire_alpha', nextRarity: 'Epic', cost: 400 },
  'Epic': { resultId: 'fused_gryphon_sentinel', nextRarity: 'Legendary', cost: 1000 },
  'Legendary': { resultId: 'fused_megashark_rex', nextRarity: 'Mythic', cost: 3000 },
  'Mythic': { resultId: 'fused_cosmic_basilisk', nextRarity: 'Secret', cost: 8000 },
  'Secret': { resultId: 'fused_unrivaled_tempest_hydra', nextRarity: 'Unrivaled', cost: 20000 },
  'Unrivaled': { resultId: 'fused_nebula_kaiser', nextRarity: 'Celestial', cost: 50000 },
  'Celestial': { resultId: 'fused_singularity_overlord', nextRarity: '???', cost: 120000 },
  '???': { resultId: 'fused_primal_omega', nextRarity: 'Original', cost: 300000 },
  'Original': { resultId: 'fused_chrono_watcher', nextRarity: 'Overseer', cost: 750000 },
  'Overseer': { resultId: 'fused_twin_singularity', nextRarity: 'Arcane', cost: 2000000 },
  'Arcane': { resultId: '', nextRarity: 'Arcane', cost: 0 },
  'The Chillful': { resultId: '', nextRarity: 'The Chillful', cost: 0 }
};

const RARITY_BG_CLASS: Record<Rarity, string> = {
  'Arcane': 'from-purple-600/30 via-fuchsia-600/20 to-purple-950/50 border-purple-400 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.4)] animate-pulse',
  'The Chillful': 'from-lime-600/30 via-emerald-600/20 to-lime-950/50 border-lime-400 text-lime-300 shadow-[0_0_15px_rgba(132,204,22,0.4)] animate-pulse',
  'Overseer': 'from-amber-600/20 to-amber-900/40 border-amber-500/40 text-amber-300',
  'Unrivaled': 'from-amber-500/25 via-red-600/15 to-pink-600/25 border-amber-400 text-amber-200',
  'Original': 'from-red-600/20 to-red-950/40 border-red-500/40 text-red-400',
  '???': 'from-fuchsia-600/20 to-fuchsia-950/40 border-fuchsia-500/40 text-fuchsia-400',
  'Celestial': 'from-purple-600/20 to-purple-950/40 border-purple-500/40 text-purple-400',
  'Secret': 'from-cyan-600/20 to-cyan-950/40 border-cyan-500/40 text-cyan-400',
  'Mythic': 'from-orange-600/20 to-orange-950/40 border-orange-500/40 text-orange-400',
  'Legendary': 'from-yellow-600/20 to-yellow-950/40 border-yellow-500/40 text-yellow-400',
  'Epic': 'from-indigo-600/20 to-indigo-950/40 border-indigo-500/40 text-indigo-400',
  'Rare': 'from-blue-600/20 to-blue-950/40 border-blue-500/40 text-blue-400',
  'Common': 'from-slate-600/20 to-slate-950/40 border-slate-500/40 text-slate-300'
};

export default function FusionModal({
  isOpen,
  onClose,
  ownedAnimals,
  summonedAnimalsRaw,
  dna,
  onFuse
}: FusionModalProps) {
  const [selectedA, setSelectedA] = useState<Animal | null>(null);
  const [selectedB, setSelectedB] = useState<Animal | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [fusionResult, setFusionResult] = useState<Animal | null>(null);

  // Calculate counts of each animal in the player's actual raw inventory
  const animalCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    summonedAnimalsRaw.forEach(id => {
      counts[id] = (counts[id] || 0) + 1;
    });
    return counts;
  }, [summonedAnimalsRaw]);

  // Handle unit selection
  const handleSelect = (animal: Animal) => {
    if (isAnimating || fusionResult) return;

    const count = animalCounts[animal.id] || 0;
    if (count <= 0) return;

    // Deselect if already selected
    if (selectedA?.id === animal.id) {
      setSelectedA(null);
      return;
    }
    if (selectedB?.id === animal.id) {
      setSelectedB(null);
      return;
    }

    // Place in Slot A or Slot B
    if (!selectedA) {
      setSelectedA(animal);
    } else if (!selectedB) {
      // Check if trying to select a duplicate and if there is enough count
      if (selectedA.id === animal.id && count < 2) {
        return; // Not enough copies to select twice
      }
      setSelectedB(animal);
    }
  };

  const handleClearSlots = () => {
    setSelectedA(null);
    setSelectedB(null);
    setFusionResult(null);
  };

  // Determine if fusion is valid and calculate output
  const fusionInfo = useMemo(() => {
    if (!selectedA || !selectedB) return null;

    const sameRarity = selectedA.rarity === selectedB.rarity;
    if (!sameRarity) {
      return {
        isValid: false,
        error: 'Constructs must be of the same rarity to fuse!',
        result: null,
        cost: 0
      };
    }

    const mapInfo = FUSION_MAPPING[selectedA.rarity];
    if (!mapInfo || !mapInfo.resultId) {
      return {
        isValid: false,
        error: `Constructs of rarity "${selectedA.rarity}" cannot be fused further!`,
        result: null,
        cost: 0
      };
    }

    const resultUnit = ANIMALS.find(a => a.id === mapInfo.resultId);
    if (!resultUnit) {
      return {
        isValid: false,
        error: 'Fused construct target not found in registry!',
        result: null,
        cost: 0
      };
    }

    const hasEnoughDna = dna >= mapInfo.cost;

    return {
      isValid: hasEnoughDna,
      error: !hasEnoughDna ? 'Insufficient DNA resources for fusion!' : null,
      result: resultUnit,
      cost: mapInfo.cost
    };
  }, [selectedA, selectedB, dna]);

  // Execute fusion sequence
  const handleFuse = () => {
    if (!selectedA || !selectedB || !fusionInfo || !fusionInfo.isValid || !fusionInfo.result) return;

    setIsAnimating(true);

    // Dynamic timeout for cinematic reveal
    setTimeout(() => {
      onFuse(selectedA.id, selectedB.id, fusionInfo.result!.id, fusionInfo.cost);
      setFusionResult(fusionInfo.result);
      setIsAnimating(false);
    }, 2800);
  };

  const handleClaim = () => {
    handleClearSlots();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div id="fusion-chamber-modal" className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-5xl bg-slate-900/90 border border-amber-500/40 rounded-2xl shadow-[0_0_40px_rgba(245,158,11,0.2)] overflow-hidden"
        >
          {/* Glowing Top Frame */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]" />

          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/5 bg-slate-950/40">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-400/20">
                <Atom className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-wider">Multiverse Fusion Chamber</h2>
                <p className="text-xs text-slate-400">Combine twin constructs of equal rarity to synthesize supreme Fused variants.</p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-white/5 bg-slate-800/50 hover:bg-slate-700/60 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Grid Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-white/5 h-[580px]">
            
            {/* Left: Inventory List (3 Columns in Grid) */}
            <div className="lg:col-span-3 p-5 overflow-y-auto flex flex-col h-full bg-slate-950/10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Construct Blueprint Core</span>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 font-mono text-[10px]">
                  <Zap className="w-3.5 h-3.5" />
                  <span>{dna.toLocaleString()} DNA</span>
                </div>
              </div>

              {ownedAnimals.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 text-center p-8 border border-dashed border-white/5 rounded-xl">
                  <span className="text-4xl mb-2">🧬</span>
                  <p className="text-sm font-semibold text-slate-400">No constructs in database.</p>
                  <p className="text-xs text-slate-500 mt-1">Unlock constructs using the main Gacha shop to begin fusion experiments.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {ownedAnimals.map(animal => {
                    const count = animalCounts[animal.id] || 0;
                    const isSelectedA = selectedA?.id === animal.id;
                    const isSelectedB = selectedB?.id === animal.id;
                    const isFullySelected = isSelectedA && isSelectedB;
                    
                    // Highlight backgrounds based on current slots
                    let activeBorder = 'border-white/5';
                    if (isSelectedA || isSelectedB) {
                      activeBorder = 'border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)] bg-amber-500/5';
                    }

                    return (
                      <button
                        key={animal.id}
                        onClick={() => handleSelect(animal)}
                        className={`group relative text-left p-3 rounded-xl border ${activeBorder} hover:border-slate-700 bg-slate-900/40 transition-all flex flex-col justify-between h-[120px] overflow-hidden`}
                      >
                        {/* Selected Indicator Ribbon */}
                        {(isSelectedA || isSelectedB) && (
                          <div className="absolute top-1.5 right-1.5 flex gap-1">
                            {isSelectedA && (
                              <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[9px] font-bold">
                                A
                              </span>
                            )}
                            {isSelectedB && (
                              <span className="w-4 h-4 rounded-full bg-yellow-400 text-slate-950 flex items-center justify-center text-[9px] font-bold">
                                B
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-start gap-2.5">
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/5 bg-slate-950 flex items-center justify-center">
                            <span className="text-xl">{animal.emoji}</span>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-amber-400 transition-colors">
                              {animal.name}
                            </h4>
                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                              {animal.rarity}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-end justify-between mt-2 pt-2 border-t border-white/5">
                          <span className="text-[10px] text-slate-400 font-medium">
                            Owned: <strong className="text-white font-bold">{count}</strong>
                          </span>
                          <span className="text-[9px] font-mono text-slate-500">
                            DMG: {animal.damage.toLocaleString()}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Fusion Chamber Active Grid (2 Columns in Grid) */}
            <div className="lg:col-span-2 p-5 flex flex-col justify-between bg-slate-950/40 h-full relative">
              
              {/* Cinematic Fusion State View */}
              <div className="flex-1 flex flex-col items-center justify-center">
                
                {fusionResult ? (
                  /* Success/Reveal State */
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center text-center p-4 relative"
                  >
                    {/* Glowing Aura Effect */}
                    <div className="absolute -inset-10 rounded-full bg-gradient-to-r from-amber-500/20 via-purple-500/10 to-cyan-500/20 blur-2xl animate-pulse" />

                    <div className="w-24 h-24 rounded-2xl border-2 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.4)] flex items-center justify-center text-5xl bg-slate-950 mb-4 animate-bounce">
                      {fusionResult.emoji}
                    </div>

                    <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 font-black uppercase tracking-widest text-[10px] mb-2 shadow-[0_0_8px_rgba(245,158,11,0.2)]">
                      ✨ FUSION SUCCESS ✨
                    </span>

                    <h3 className="text-xl font-black text-white uppercase tracking-wider mb-1">
                      {fusionResult.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 max-w-sm leading-relaxed mb-4">
                      {fusionResult.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 w-full max-w-xs p-3 rounded-lg bg-slate-900 border border-white/5 font-mono text-xs text-left mb-6">
                      <div>
                        <span className="text-slate-400">Rarity:</span>
                        <p className="text-amber-400 font-bold uppercase">{fusionResult.rarity}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Power Base:</span>
                        <p className="text-white font-bold">{fusionResult.damage.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Range Radius:</span>
                        <p className="text-white font-bold">{fusionResult.range}px</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Active Skill:</span>
                        <p className="text-cyan-400 font-bold truncate">{fusionResult.skillName || 'N/A'}</p>
                      </div>
                    </div>

                    <button
                      onClick={handleClaim}
                      className="w-full py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-wider text-xs shadow-[0_0_15px_rgba(245,158,11,0.35)] transition-all transform active:scale-95"
                    >
                      Secure Blueprint Construct
                    </button>
                  </motion.div>
                ) : isAnimating ? (
                  /* Fusion Animation State */
                  <div className="flex flex-col items-center text-center p-4">
                    <div className="relative w-36 h-36 flex items-center justify-center mb-6">
                      {/* Spinners & Particle rings */}
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                        className="absolute inset-0 rounded-full border-4 border-dashed border-amber-400/40"
                      />
                      <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ repeat: Infinity, duration: 1.0, ease: 'linear' }}
                        className="absolute -inset-4 rounded-full border-2 border-dashed border-cyan-400/30"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="absolute inset-8 rounded-full bg-amber-500/10 blur-xl"
                      />

                      {/* Parent icons collapsing together */}
                      <motion.div
                        animate={{ x: [0, 40, 0] }}
                        transition={{ repeat: Infinity, duration: 1.4 }}
                        className="absolute left-0 text-3xl z-10"
                      >
                        {selectedA?.emoji}
                      </motion.div>
                      <motion.div
                        animate={{ x: [0, -40, 0] }}
                        transition={{ repeat: Infinity, duration: 1.4 }}
                        className="absolute right-0 text-3xl z-10"
                      >
                        {selectedB?.emoji}
                      </motion.div>

                      <Atom className="w-12 h-12 text-amber-400 animate-spin z-20 shadow-glow" />
                    </div>

                    <h3 className="text-sm font-black text-white uppercase tracking-widest animate-pulse">
                      HYBRIDIZING BLUEPRINTS...
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Merging DNA code, mapping neural threads, and stabilizing coordinates.</p>
                  </div>
                ) : (
                  /* Standard Configuration State */
                  <div className="flex flex-col items-center w-full">
                    <div className="flex items-center gap-4 justify-center w-full max-w-sm mb-6">
                      
                      {/* Slot A */}
                      <div className="flex flex-col items-center gap-2 flex-1">
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Slot A Core</span>
                        <button
                          onClick={() => selectedA && setSelectedA(null)}
                          className={`w-20 h-20 rounded-2xl border-2 ${selectedA ? 'border-amber-400 bg-slate-900 shadow-[0_0_12px_rgba(245,158,11,0.2)]' : 'border-dashed border-white/5 bg-slate-900/30'} flex items-center justify-center text-3xl transition-all hover:scale-105 active:scale-95`}
                        >
                          {selectedA ? selectedA.emoji : <span className="text-slate-600 font-bold text-sm">ADD</span>}
                        </button>
                        <span className="text-xs font-bold text-slate-300 text-center truncate w-full max-w-[90px]">
                          {selectedA ? selectedA.name : 'Empty'}
                        </span>
                        {selectedA && (
                          <span className="text-[9px] font-black uppercase text-slate-500 px-1.5 py-0.2 rounded bg-slate-800">
                            {selectedA.rarity}
                          </span>
                        )}
                      </div>

                      <ArrowRight className="w-6 h-6 text-slate-600 shrink-0 mt-4 animate-pulse" />

                      {/* Slot B */}
                      <div className="flex flex-col items-center gap-2 flex-1">
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Slot B Core</span>
                        <button
                          onClick={() => selectedB && setSelectedB(null)}
                          className={`w-20 h-20 rounded-2xl border-2 ${selectedB ? 'border-yellow-400 bg-slate-900 shadow-[0_0_12px_rgba(251,191,36,0.2)]' : 'border-dashed border-white/5 bg-slate-900/30'} flex items-center justify-center text-3xl transition-all hover:scale-105 active:scale-95`}
                        >
                          {selectedB ? selectedB.emoji : <span className="text-slate-600 font-bold text-sm">ADD</span>}
                        </button>
                        <span className="text-xs font-bold text-slate-300 text-center truncate w-full max-w-[90px]">
                          {selectedB ? selectedB.name : 'Empty'}
                        </span>
                        {selectedB && (
                          <span className="text-[9px] font-black uppercase text-slate-500 px-1.5 py-0.2 rounded bg-slate-800">
                            {selectedB.rarity}
                          </span>
                        )}
                      </div>

                    </div>

                    {/* Feedback and preview box */}
                    {fusionInfo ? (
                      fusionInfo.isValid && fusionInfo.result ? (
                        <div className="w-full max-w-sm p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-center flex flex-col items-center">
                          <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> FUSION MATRIX STABLE
                          </span>
                          <h4 className="text-sm font-bold text-white uppercase tracking-wider mt-1.5 flex items-center gap-1.5">
                            Yield: {fusionInfo.result.emoji} <span className="text-amber-400">{fusionInfo.result.name}</span>
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-1 max-w-xs leading-relaxed">
                            A powerful, highly-balanced construct of <strong className="text-white uppercase">{fusionInfo.result.rarity}</strong> rank. Will permanently consume Slot A & B constructs.
                          </p>
                          <div className="flex items-center gap-1.5 mt-3 px-3 py-1 rounded-lg bg-slate-950/60 border border-white/5">
                            <span className="text-[10px] text-slate-400 uppercase font-mono">Resource Cost:</span>
                            <span className="text-[11px] font-mono font-bold text-cyan-300">{fusionInfo.cost.toLocaleString()} DNA</span>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full max-w-sm p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-center flex flex-col items-center">
                          <AlertTriangle className="w-5 h-5 text-rose-400" />
                          <span className="text-[10px] font-black uppercase text-rose-400 tracking-wider mt-1.5">
                            FUSION MATRIX COLLAPSE
                          </span>
                          <p className="text-xs text-rose-300 mt-1 max-w-xs font-semibold leading-relaxed">
                            {fusionInfo.error}
                          </p>
                          {fusionInfo.cost > 0 && (
                            <p className="text-[10px] text-slate-500 mt-1 font-mono">
                              Required: {fusionInfo.cost.toLocaleString()} DNA (You have {dna.toLocaleString()})
                            </p>
                          )}
                        </div>
                      )
                    ) : (
                      <div className="w-full max-w-sm p-4 rounded-xl border border-white/5 bg-slate-900/30 text-center">
                        <p className="text-xs text-slate-400">
                          Select two unlocked constructs of equal rarity from the database to configure the fusion matrix.
                        </p>
                      </div>
                    )}

                    {/* Reset Button */}
                    {(selectedA || selectedB) && (
                      <button
                        onClick={handleClearSlots}
                        className="mt-4 text-[10px] uppercase font-bold tracking-wider text-slate-400 hover:text-white transition-colors"
                      >
                        Clear Matrix Slots
                      </button>
                    )}

                  </div>
                )}

              </div>

              {/* Action Trigger Row */}
              {!fusionResult && (
                <div className="border-t border-white/5 pt-4 mt-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">DNA Balance</span>
                    <span className="text-sm font-mono font-black text-cyan-300">{dna.toLocaleString()} DNA</span>
                  </div>

                  <button
                    disabled={!fusionInfo || !fusionInfo.isValid || isAnimating}
                    onClick={handleFuse}
                    className="py-3 px-6 rounded-xl font-black uppercase tracking-wider text-xs transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.25)] flex items-center gap-2 active:scale-95 transform"
                  >
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    <span>SYNTHESIZE CONSTRUCT</span>
                  </button>
                </div>
              )}

            </div>

          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
