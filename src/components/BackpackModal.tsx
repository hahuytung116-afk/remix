import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Search, 
  ArrowUpDown, 
  Coins, 
  Swords, 
  Target, 
  Zap, 
  Sparkles, 
  Backpack,
  SlidersHorizontal,
  RefreshCw,
  ArrowRightLeft,
  Trash2,
  CheckSquare,
  Square,
  Flame,
  Layers,
  Check
} from 'lucide-react';
import { Animal, Rarity } from '../types';
import AnimalAvatar from './AnimalAvatar';
import CapybaraAvatar from './CapybaraAvatar';

interface BackpackModalProps {
  isOpen: boolean;
  onClose: () => void;
  ownedAnimals: Animal[];
  selectedAnimalId: string | null;
  onSelectAnimal: (id: string | null) => void;
  meat: number;
  onOpenTrade?: () => void;
  onOpenRelicVault?: () => void;
  quickDeployUnitIds?: string[];
  onUpdateQuickDeploy?: (ids: string[]) => void;
  onSellAnimal?: (animalId: string) => boolean;
  onBulkSellAnimals?: (animalIds: string[]) => { count: number; totalMeat: number; totalDna: number };
  equippedRelicIds?: string[];
}

const RARITY_ORDER: Record<Rarity, number> = {
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

const RARITY_BG_CLASS: Record<Rarity, string> = {
  'Arcane': 'from-purple-600/30 via-fuchsia-600/20 to-purple-950/50 border-purple-400 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.4)] animate-pulse',
  'The Chillful': 'from-lime-600/30 via-emerald-600/20 to-lime-950/50 border-lime-400 text-lime-300 shadow-[0_0_15px_rgba(132,204,22,0.4)] animate-pulse',
  'Overseer': 'from-amber-600/20 to-amber-900/40 border-amber-500/40 text-amber-300',
  'Unrivaled': 'from-amber-500/25 via-red-600/15 to-pink-600/25 border-amber-400 text-amber-200 animate-pulse',
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

export function BackpackModal({
  isOpen,
  onClose,
  ownedAnimals,
  selectedAnimalId,
  onSelectAnimal,
  meat,
  onOpenTrade,
  onOpenRelicVault,
  quickDeployUnitIds = [],
  onUpdateQuickDeploy,
  onSellAnimal,
  onBulkSellAnimals,
  equippedRelicIds = []
}: BackpackModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRarityFilter, setSelectedRarityFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'rarity_desc' | 'rarity_asc' | 'cost_desc' | 'cost_asc' | 'dmg_desc' | 'name_asc'>('rarity_desc');
  const [inspectedAnimal, setInspectedAnimal] = useState<Animal | null>(null);

  // Bulk selling state
  const [isBulkSellMode, setIsBulkSellMode] = useState<boolean>(false);
  const [selectedForSellIds, setSelectedForSellIds] = useState<string[]>([]);
  const [confirmingSingleSellId, setConfirmingSingleSellId] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'warning' } | null>(null);

  const showToast = (message: string, type: 'success' | 'warning' = 'success') => {
    setFeedbackToast({ message, type });
    setTimeout(() => {
      setFeedbackToast(null);
    }, 3500);
  };

  const calculateRefund = (animal: Animal) => {
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

    if (equippedRelicIds?.includes('double_helix')) {
      dnaCompensation = Math.floor(dnaCompensation * 1.6);
    }

    return { meatRefund, dnaCompensation };
  };

  const handleAssignQuickDeploySlot = (animalId: string, slotIdx: number) => {
    if (!onUpdateQuickDeploy) return;
    const currentSlots = [...quickDeployUnitIds];
    while (currentSlots.length < 4) currentSlots.push('');

    // If unit is already in this slot, toggle it off
    if (currentSlots[slotIdx] === animalId) {
      currentSlots[slotIdx] = '';
    } else {
      // If unit is in another slot, clear that slot first
      const existingIdx = currentSlots.findIndex(id => id === animalId);
      if (existingIdx !== -1) {
        currentSlots[existingIdx] = '';
      }
      currentSlots[slotIdx] = animalId;
    }
    onUpdateQuickDeploy(currentSlots.filter(Boolean));
  };

  // Single unit sell handler with 2-step confirmation
  const handleSingleSellClick = (animal: Animal) => {
    if (ownedAnimals.length <= 1) {
      showToast("Cannot sell your last remaining construct!", 'warning');
      return;
    }

    if (confirmingSingleSellId !== animal.id) {
      setConfirmingSingleSellId(animal.id);
      return;
    }

    if (onSellAnimal) {
      const { meatRefund, dnaCompensation } = calculateRefund(animal);
      const success = onSellAnimal(animal.id);
      if (success) {
        showToast(`Sold ${animal.name} for +${meatRefund.toLocaleString()} Meat and +${dnaCompensation.toLocaleString()} DNA!`, 'success');
        setConfirmingSingleSellId(null);
        setSelectedForSellIds(prev => prev.filter(id => id !== animal.id));
      } else {
        showToast("Failed to sell construct.", 'warning');
      }
    }
  };

  // Bulk selection toggles
  const toggleUnitForBulkSell = (animalId: string) => {
    setSelectedForSellIds(prev => {
      if (prev.includes(animalId)) {
        return prev.filter(id => id !== animalId);
      } else {
        return [...prev, animalId];
      }
    });
  };

  const handleSelectByRarity = (rarity: string) => {
    const matching = ownedAnimals.filter(a => a.rarity === rarity).map(a => a.id);
    setSelectedForSellIds(prev => {
      const set = new Set([...prev, ...matching]);
      return Array.from(set);
    });
  };

  const handleSelectBelowLegendary = () => {
    const lowRarities = ['Common', 'Rare', 'Epic'];
    const matching = ownedAnimals.filter(a => lowRarities.includes(a.rarity) && a.role !== 'support' && a.id !== 'capybara').map(a => a.id);
    setSelectedForSellIds(prev => {
      const set = new Set([...prev, ...matching]);
      return Array.from(set);
    });
  };

  const handleSelectAll = () => {
    setSelectedForSellIds(ownedAnimals.slice(0, Math.max(1, ownedAnimals.length - 1)).map(a => a.id));
  };

  const handleClearBulkSelection = () => {
    setSelectedForSellIds([]);
  };

  const handleExecuteBulkSell = () => {
    if (selectedForSellIds.length === 0) return;
    if (onBulkSellAnimals) {
      const result = onBulkSellAnimals(selectedForSellIds);
      if (result.count > 0) {
        showToast(`Bulk recycled ${result.count} unit(s) for +${result.totalMeat.toLocaleString()} Meat & +${result.totalDna.toLocaleString()} DNA!`, 'success');
        setSelectedForSellIds([]);
      } else {
        showToast("No units were sold (at least 1 construct must remain).", 'warning');
      }
    }
  };

  // Bulk sell totals
  const bulkSellTotals = useMemo(() => {
    let totalMeat = 0;
    let totalDna = 0;
    selectedForSellIds.forEach(id => {
      const animal = ownedAnimals.find(a => a.id === id);
      if (animal) {
        const { meatRefund, dnaCompensation } = calculateRefund(animal);
        totalMeat += meatRefund;
        totalDna += dnaCompensation;
      }
    });
    return { totalMeat, totalDna, count: selectedForSellIds.length };
  }, [selectedForSellIds, ownedAnimals, equippedRelicIds]);

  // Auto-inspect first animal or keep valid inspected animal
  React.useEffect(() => {
    if (isOpen) {
      if (inspectedAnimal) {
        const stillExists = ownedAnimals.find(a => a.id === inspectedAnimal.id);
        if (stillExists) return;
      }
      if (selectedAnimalId) {
        const found = ownedAnimals.find(a => a.id === selectedAnimalId);
        if (found) {
          setInspectedAnimal(found);
          return;
        }
      }
      if (ownedAnimals.length > 0) {
        const sortedDefault = [...ownedAnimals].sort((a, b) => RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity]);
        setInspectedAnimal(sortedDefault[0]);
      } else {
        setInspectedAnimal(null);
      }
    }
  }, [isOpen, selectedAnimalId, ownedAnimals]);

  // Unique list of rarities representing the user's owned collection
  const availableRarities = useMemo(() => {
    const set = new Set<string>();
    let hasFused = false;
    ownedAnimals.forEach(a => {
      if (a.isFused || a.category === 'fused' || a.id.startsWith('fused_')) {
        hasFused = true;
      }
      set.add(a.rarity);
    });
    const sorted = Array.from(set).sort((a, b) => RARITY_ORDER[b as Rarity] - RARITY_ORDER[a as Rarity]);
    if (hasFused) {
      return ['All', '🧪 Fused', ...sorted];
    }
    return ['All', '🧪 Fused', ...sorted];
  }, [ownedAnimals]);

  // Filter & Sort Logic
  const processedAnimals = useMemo(() => {
    let list = [...ownedAnimals];

    // Search query filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      list = list.filter(a => a.name.toLowerCase().includes(query) || a.rarity.toLowerCase().includes(query));
    }

    // Rarity and category filter
    if (selectedRarityFilter === '🧪 Fused' || selectedRarityFilter === 'Fused') {
      list = list.filter(a => a.isFused || a.category === 'fused' || a.id.startsWith('fused_'));
    } else if (selectedRarityFilter !== 'All') {
      list = list.filter(a => a.rarity === selectedRarityFilter);
    }

    // Sorting block
    list.sort((a, b) => {
      switch (sortBy) {
        case 'rarity_desc': {
          const diff = RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity];
          if (diff !== 0) return diff;
          return b.cost - a.cost;
        }
        case 'rarity_asc': {
          const diff = RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity];
          if (diff !== 0) return diff;
          return a.cost - b.cost;
        }
        case 'cost_desc':
          return b.cost - a.cost;
        case 'cost_asc':
          return a.cost - b.cost;
        case 'dmg_desc':
          return b.damage - a.damage;
        case 'name_asc':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return list;
  }, [ownedAnimals, searchQuery, selectedRarityFilter, sortBy]);

  const handleSelectAndClose = (animal: Animal) => {
    onSelectAnimal(animal.id);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-950/80">
        {/* Backdrop dismiss */}
        <div className="absolute inset-0 cursor-default" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.23, ease: 'easeOut' }}
          className="relative w-full max-w-5xl h-[88vh] bg-slate-900 border border-slate-850 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col z-10 text-slate-200"
        >
          {/* Toast Notification */}
          <AnimatePresence>
            {feedbackToast && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-2xl flex items-center gap-2 border ${
                  feedbackToast.type === 'success'
                    ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                    : 'bg-amber-950/90 text-amber-300 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                }`}
              >
                <Sparkles size={14} className="animate-spin-slow" />
                <span>{feedbackToast.message}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-white/5 flex items-center justify-between bg-slate-900/90 gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-cyan-400">
                <Backpack size={22} className="animate-pulse" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black uppercase text-white tracking-wider flex items-center gap-2">
                  Genome Backpack & Inventory
                </h2>
                <p className="text-xs text-slate-400 uppercase tracking-tight">
                  Stored Extinct Wildlife Constructs • <span className="text-cyan-400 font-bold">{ownedAnimals.length}</span> Total Units
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onOpenRelicVault && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenRelicVault();
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 border bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/30 hover:border-amber-400"
                  title="Open Cosmic Relic Vault"
                >
                  <Sparkles size={13} className="text-amber-400 animate-pulse" />
                  <span className="hidden sm:inline">🌌 Relics</span>
                </button>
              )}

              {/* Toggle Bulk Sell Mode */}
              <button
                onClick={() => {
                  setIsBulkSellMode(!isBulkSellMode);
                  if (isBulkSellMode) {
                    setSelectedForSellIds([]);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 border ${
                  isBulkSellMode
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                    : 'bg-slate-800/80 hover:bg-slate-750 text-amber-300 border-amber-500/30 hover:border-amber-400'
                }`}
                title="Toggle multi-select mode to sell multiple inventory units together"
              >
                <Trash2 size={13} />
                <span>{isBulkSellMode ? 'Exit Bulk Recycle' : '♻️ Bulk Recycle'}</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Sub Header - Filters, Searches, Sorters & Bulk Quick Presets */}
          <div className="px-4 sm:px-5 py-3 bg-slate-950/40 border-b border-white/5 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Search Input */}
              <div className="relative min-w-[200px] flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search unit by name or rarity..."
                  className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-4 py-1.5 text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all font-sans"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs font-bold"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Controls Bar: Category Filters & Sorter */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Rarity filter pills */}
                <div className="flex items-center space-x-1 bg-slate-900 border border-white/5 p-1 rounded-xl">
                  <span className="text-[8.5px] uppercase font-black tracking-widest text-slate-500 px-1.5 flex items-center gap-1">
                    <SlidersHorizontal size={10} /> Filter:
                  </span>
                  <div className="flex space-x-1 max-w-[220px] sm:max-w-none overflow-x-auto scrollbar-hide">
                    {availableRarities.slice(0, 5).map((rar, idx) => (
                      <button
                        key={`rar-pill-${rar}-${idx}`}
                        onClick={() => setSelectedRarityFilter(rar)}
                        className={`px-2 py-0.5 rounded-lg text-[8.5px] font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                          selectedRarityFilter === rar
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-black'
                            : 'text-slate-400 hover:text-white border border-transparent hover:bg-white/5'
                        }`}
                      >
                        {rar}
                      </button>
                    ))}
                    {availableRarities.length > 5 && (
                      <select
                        value={availableRarities.includes(selectedRarityFilter) ? selectedRarityFilter : 'All'}
                        onChange={e => setSelectedRarityFilter(e.target.value)}
                        className="bg-transparent text-slate-400 text-[8.5px] hover:text-white font-bold uppercase outline-none px-1 py-0.5"
                      >
                        <option value="All" disabled className="bg-slate-900">More</option>
                        {availableRarities.slice(5).map((rar, idx) => (
                          <option key={`rar-opt-${rar}-${idx}`} value={rar} className="bg-slate-900">{rar}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {/* Sorters */}
                <div className="flex items-center space-x-1 bg-slate-900 border border-white/5 p-1 rounded-xl">
                  <span className="text-[8.5px] uppercase font-black tracking-widest text-slate-500 px-1.5 flex items-center gap-1">
                    <ArrowUpDown size={10} /> Sort:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy(prev => prev === 'rarity_desc' ? 'rarity_asc' : 'rarity_desc');
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[8.5px] font-black uppercase transition-all cursor-pointer flex items-center gap-1 ${
                      sortBy.startsWith('rarity')
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                        : 'text-slate-400 hover:text-white border border-transparent hover:bg-white/5'
                    }`}
                  >
                    Rarity {sortBy === 'rarity_desc' ? '▼' : sortBy === 'rarity_asc' ? '▲' : ''}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSortBy(prev => prev === 'cost_desc' ? 'cost_asc' : 'cost_desc');
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[8.5px] font-black uppercase transition-all cursor-pointer flex items-center gap-1 ${
                      sortBy.startsWith('cost')
                        ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30'
                        : 'text-slate-400 hover:text-white border border-transparent hover:bg-white/5'
                    }`}
                  >
                    Cost {sortBy === 'cost_desc' ? '▼' : sortBy === 'cost_asc' ? '▲' : ''}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSortBy('dmg_desc');
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[8.5px] font-black uppercase transition-all cursor-pointer ${
                      sortBy === 'dmg_desc'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                        : 'text-slate-400 hover:text-white border border-transparent hover:bg-white/5'
                    }`}
                  >
                    Dmg
                  </button>
                </div>
              </div>
            </div>

            {/* Bulk Mode Presets Strip */}
            {isBulkSellMode && (
              <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-amber-950/30 border border-amber-500/30 rounded-xl">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[8.5px] font-black uppercase text-amber-300 tracking-wider flex items-center gap-1">
                    <Layers size={11} /> Quick-Select:
                  </span>
                  <button
                    onClick={() => handleSelectByRarity('Common')}
                    className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[8px] font-bold uppercase rounded border border-white/10"
                  >
                    + All Commons
                  </button>
                  <button
                    onClick={() => handleSelectByRarity('Rare')}
                    className="px-2 py-0.5 bg-blue-950/40 hover:bg-blue-900/60 text-blue-300 text-[8px] font-bold uppercase rounded border border-blue-500/30"
                  >
                    + All Rares
                  </button>
                  <button
                    onClick={() => handleSelectByRarity('Epic')}
                    className="px-2 py-0.5 bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 text-[8px] font-bold uppercase rounded border border-indigo-500/30"
                  >
                    + All Epics
                  </button>
                  <button
                    onClick={handleSelectBelowLegendary}
                    className="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[8px] font-black uppercase rounded border border-amber-500/40"
                  >
                    + All ≤ Epic
                  </button>
                  <button
                    onClick={handleSelectAll}
                    className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-[8px] font-bold uppercase rounded"
                  >
                    Select All
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClearBulkSelection}
                    className="px-2 py-0.5 bg-slate-900 hover:bg-red-950/50 text-slate-400 hover:text-red-300 text-[8px] font-bold uppercase rounded border border-white/10"
                  >
                    Clear ({selectedForSellIds.length})
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Main Content Area: Left = Grid of Units, Right = Active Unit Details Panel (Full Space) */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Grid Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 scrollbar-thin scrollbar-thumb-slate-700 border-r border-white/5">
              {processedAnimals.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500">
                  <div className="w-16 h-16 rounded-full border border-dashed border-white/10 flex items-center justify-center mb-4">
                    <Backpack size={24} className="opacity-30" />
                  </div>
                  <h3 className="text-sm font-black uppercase text-slate-400 mb-1">No Genomes Match Filter</h3>
                  <p className="text-xs max-w-sm">Try adjusting your filters or search terms, or head to the Summon Lab to splice original extinct DNA strands!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 p-[1px]">
                  {processedAnimals.map((animal, idx) => {
                    const isAffordable = meat >= animal.cost;
                    const isInspected = inspectedAnimal?.id === animal.id;
                    const isSelected = selectedAnimalId === animal.id;
                    const isMarkedForSell = selectedForSellIds.includes(animal.id);
                    const { meatRefund, dnaCompensation } = calculateRefund(animal);

                    return (
                      <div
                        key={`${animal.id}-${idx}`}
                        onClick={() => {
                          if (isBulkSellMode) {
                            toggleUnitForBulkSell(animal.id);
                          } else {
                            setInspectedAnimal(animal);
                          }
                        }}
                        onDoubleClick={() => {
                          if (!isBulkSellMode) {
                            handleSelectAndClose(animal);
                          }
                        }}
                        className={`text-left p-2.5 rounded-xl border relative overflow-hidden transition-all duration-200 active:scale-[0.98] outline-none group min-h-[92px] flex flex-col justify-between cursor-pointer select-none ${
                          isMarkedForSell
                            ? 'bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                            : isInspected 
                            ? 'bg-slate-800 ring-2 ring-cyan-500/60 border-transparent shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                            : isSelected
                              ? 'bg-slate-800/90 border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.1)]'
                              : 'bg-slate-850/60 border-white/5 hover:border-white/10 hover:bg-slate-800/40'
                        }`}
                      >
                        {/* Rarity Accent Strip on Left */}
                        <div 
                          className="absolute left-0 top-0 bottom-0 w-[3px]"
                          style={{ backgroundColor: animal.color }}
                        />

                        {/* Top: Avatar, Name & Rarity */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1">
                              <span 
                                className="text-[7.5px] font-black uppercase tracking-wider font-mono"
                                style={{ color: animal.color }}
                              >
                                {animal.rarity}
                              </span>
                              {(animal.isFused || animal.category === 'fused' || animal.id.startsWith('fused_')) && (
                                <span className="text-[6.5px] font-black bg-amber-500/25 text-amber-300 border border-amber-400/50 px-1 py-0.2 rounded uppercase">
                                  FUSED
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {isBulkSellMode && (
                                <span className={`p-0.5 rounded ${isMarkedForSell ? 'text-amber-400' : 'text-slate-600'}`}>
                                  {isMarkedForSell ? <CheckSquare size={13} /> : <Square size={13} />}
                                </span>
                              )}
                              {!isBulkSellMode && quickDeployUnitIds.includes(animal.id) && (
                                <span className="text-[7px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 px-1.5 py-0.2 rounded-full uppercase flex items-center gap-0.5">
                                  <Zap size={6} /> S{quickDeployUnitIds.indexOf(animal.id) + 1}
                                </span>
                              )}
                              {!isBulkSellMode && isSelected && (
                                <span className="text-[7px] font-black bg-amber-500/20 text-amber-300 border border-amber-400/50 px-1.5 py-0.2 rounded-full uppercase shadow-[0_0_8px_rgba(245,158,11,0.3)] animate-pulse">
                                  Active
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <h4 className="text-xs font-bold text-white mb-1.5 leading-tight group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                            <div 
                              className="w-6 h-6 rounded-full bg-slate-900 border flex items-center justify-center p-0.5 flex-shrink-0"
                              style={{ borderColor: animal.color }}
                            >
                              <AnimalAvatar animal={animal} size="xs" />
                            </div>
                            <span className="truncate">{animal.name}</span>
                          </h4>
                        </div>

                        {/* Middle: Stats grid */}
                        <div className="grid grid-cols-2 gap-1 bg-slate-900/60 p-1 rounded-lg border border-white/5 text-[8px] font-mono mb-1.5">
                          <div className="text-rose-300 flex items-center gap-1">
                            <Swords size={9} /> {animal.damage}
                          </div>
                          <div className="text-yellow-400 flex items-center justify-end gap-1">
                            <Coins size={9} /> {animal.cost}
                          </div>
                        </div>

                        {/* Bottom: Sell Value Preview & Quick Actions */}
                        <div className="flex items-center justify-between text-[7px] font-mono text-slate-500 pt-0.5 border-t border-white/5">
                          <span className="text-emerald-400 font-bold">+{meatRefund} Meat</span>
                          <span className="text-cyan-400 font-bold">+{dnaCompensation} DNA</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Pane: Inspected Animal Deep Dive & Sell Actions */}
            <div className="w-80 lg:w-96 bg-slate-950/60 p-4 sm:p-5 flex flex-col justify-between overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
              {inspectedAnimal ? (
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3.5">
                    {/* Header with Avatar & Details */}
                    <div className="flex items-start space-x-3.5">
                      <div 
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${RARITY_BG_CLASS[inspectedAnimal.rarity] || 'from-slate-700 to-slate-900'} p-1 flex items-center justify-center relative overflow-hidden flex-shrink-0 shadow-lg`}
                      >
                        <AnimalAvatar animal={inspectedAnimal} size="lg" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-1.5 mb-1">
                          <span 
                            className="text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-sm font-mono"
                            style={{ 
                              color: inspectedAnimal.color,
                              borderColor: `${inspectedAnimal.color}50`,
                              backgroundColor: `${inspectedAnimal.color}15`
                            }}
                          >
                            {inspectedAnimal.rarity}
                          </span>
                          <span className="text-[8.5px] font-black text-slate-500 uppercase font-mono">
                            {inspectedAnimal.category || 'DEFENDER'}
                          </span>
                        </div>
                        <h3 className="text-sm font-black text-white uppercase tracking-tight truncate">
                          {inspectedAnimal.name}
                        </h3>
                        <p className="text-[9px] text-slate-400 leading-tight uppercase font-mono line-clamp-2">
                          {inspectedAnimal.description || 'Defensive wildlife construct ready for field deployment.'}
                        </p>
                      </div>
                    </div>

                    {/* Combat Core Matrix */}
                    <div className="grid grid-cols-3 gap-1.5">
                      <div className="bg-slate-900 border border-white/5 rounded-xl p-2 text-center">
                        <span className="text-[7.5px] font-black uppercase text-slate-500 block mb-0.5">DMG</span>
                        <div className="text-xs font-mono font-black text-rose-400">{inspectedAnimal.damage}</div>
                      </div>
                      <div className="bg-slate-900 border border-white/5 rounded-xl p-2 text-center">
                        <span className="text-[7.5px] font-black uppercase text-slate-500 block mb-0.5">RANGE</span>
                        <div className="text-xs font-mono font-black text-cyan-400">{inspectedAnimal.range}</div>
                      </div>
                      <div className="bg-slate-900 border border-white/5 rounded-xl p-2 text-center">
                        <span className="text-[7.5px] font-black uppercase text-slate-500 block mb-0.5">SPEED</span>
                        <div className="text-xs font-mono font-black text-yellow-400">{inspectedAnimal.attackSpeed}s</div>
                      </div>
                    </div>

                    {/* Quick-Deploy Loadout Slot Assignment */}
                    <div className="bg-slate-900 border border-cyan-500/20 rounded-xl p-2.5 space-y-1.5">
                      <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-wider text-slate-400">
                        <span className="flex items-center gap-1 text-cyan-400">
                          <Zap size={10} /> Quick-Deploy Slot
                        </span>
                        <span className="font-mono text-slate-500">
                          {quickDeployUnitIds.includes(inspectedAnimal.id) 
                            ? `Slot ${quickDeployUnitIds.indexOf(inspectedAnimal.id) + 1}`
                            : 'Not Assigned'}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1">
                        {[0, 1, 2, 3].map((slotIdx) => {
                          const isSlotOccupiedByThis = quickDeployUnitIds[slotIdx] === inspectedAnimal.id;
                          const slotOccupantId = quickDeployUnitIds[slotIdx];
                          const slotOccupant = slotOccupantId ? ownedAnimals.find(a => a.id === slotOccupantId) : null;
                          
                          return (
                            <button
                              key={`bp-quick-slot-${slotIdx}`}
                              onClick={() => handleAssignQuickDeploySlot(inspectedAnimal.id, slotIdx)}
                              className={`py-1 px-1 rounded-lg text-[7.5px] font-black uppercase tracking-tighter transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                                isSlotOccupiedByThis
                                  ? 'bg-cyan-500 text-slate-950 font-black shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                                  : slotOccupant
                                  ? 'bg-slate-950/80 border border-white/10 text-slate-400 hover:border-cyan-500/40 hover:text-white'
                                  : 'bg-slate-950/50 border border-dashed border-white/10 text-slate-500 hover:text-cyan-300 hover:border-cyan-500/40'
                              }`}
                              title={slotOccupant ? `Slot ${slotIdx + 1}: ${slotOccupant.name} (Click to replace with ${inspectedAnimal.name})` : `Assign to Slot ${slotIdx + 1}`}
                            >
                              <span>S{slotIdx + 1}</span>
                              <span className="text-[6px] truncate max-w-full font-mono opacity-80">
                                {isSlotOccupiedByThis ? 'ACTIVE' : slotOccupant ? slotOccupant.name.slice(0, 4) : 'EMPTY'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Sell Unit & Recycle Genome Module */}
                    {(() => {
                      const { meatRefund, dnaCompensation } = calculateRefund(inspectedAnimal);
                      const isConfirming = confirmingSingleSellId === inspectedAnimal.id;
                      const isLastUnit = ownedAnimals.length <= 1;

                      return (
                        <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-3 space-y-2">
                          <div className="flex items-center justify-between text-[8.5px] font-black uppercase tracking-wider text-slate-400">
                            <span className="flex items-center gap-1 text-emerald-400">
                              <RefreshCw size={11} /> Unit Recycle & Sale Value
                            </span>
                            <span className="text-[8px] text-slate-500 font-mono">70% Cost + DNA</span>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5 font-mono text-[9px] bg-slate-950/60 p-1.5 rounded-lg border border-white/5">
                            <div className="flex items-center justify-between text-emerald-300">
                              <span>🥩 Meat:</span>
                              <span className="font-bold">+{meatRefund.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between text-cyan-300">
                              <span>🧬 DNA:</span>
                              <span className="font-bold">+{dnaCompensation.toLocaleString()}</span>
                            </div>
                          </div>

                          {/* Sell Button with 2-step confirmation */}
                          {isConfirming ? (
                            <div className="flex items-center gap-1.5 animate-fadeIn">
                              <button
                                onClick={() => handleSingleSellClick(inspectedAnimal)}
                                className="flex-1 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-[9.5px] uppercase tracking-wider rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all cursor-pointer flex items-center justify-center gap-1.5 animate-pulse"
                              >
                                <Trash2 size={12} /> CONFIRM SELL ({inspectedAnimal.name})
                              </button>
                              <button
                                onClick={() => setConfirmingSingleSellId(null)}
                                className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[9px] font-bold uppercase rounded-lg cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleSingleSellClick(inspectedAnimal)}
                              disabled={isLastUnit}
                              className={`w-full py-2 rounded-lg text-[9.5px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                isLastUnit
                                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-white/5'
                                  : 'bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 hover:border-emerald-400 active:scale-98'
                              }`}
                              title={isLastUnit ? "Cannot sell your last unit" : `Sell this construct for +${meatRefund} Meat and +${dnaCompensation} DNA`}
                            >
                              <Trash2 size={12} className="text-emerald-400" />
                              <span>{isLastUnit ? 'Cannot Sell Last Unit' : `Sell Unit (+${meatRefund} Meat / +${dnaCompensation} DNA)`}</span>
                            </button>
                          )}
                        </div>
                      );
                    })()}

                    {/* Passive Yield Modules */}
                    {(inspectedAnimal.generationMeat || inspectedAnimal.generationDna) && (
                      <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-2.5 space-y-1 text-xs">
                        <div className="text-[8px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                          <Sparkles size={10} /> Passive Yield Modules
                        </div>
                        {inspectedAnimal.generationMeat ? (
                          <div className="text-[9.5px] font-bold text-slate-300 uppercase">
                            🥩 Generation: <span className="text-emerald-400 font-mono">+{inspectedAnimal.generationMeat}/sec</span>
                          </div>
                        ) : null}
                        {inspectedAnimal.generationDna ? (
                          <div className="text-[9.5px] font-bold text-slate-300 uppercase">
                            🧬 DNA Synth: <span className="text-cyan-300 font-mono">+{inspectedAnimal.generationDna} per Wave</span>
                          </div>
                        ) : null}
                      </div>
                    )}

                    {/* Ultimate skill display */}
                    {inspectedAnimal.skillName && (
                      <div className="p-2.5 bg-slate-900 border border-cyan-500/10 rounded-xl space-y-1">
                        <div className="text-[7.5px] font-black tracking-widest text-cyan-400 uppercase flex items-center gap-1 leading-none">
                          <Sparkles size={10} className="animate-spin-slow" /> ACTIVE SKILL TRIGGERED
                        </div>
                        <div className="text-[10px] font-extrabold text-white uppercase tracking-tight">{inspectedAnimal.skillName}</div>
                        <p className="text-[8.5px] text-slate-400 leading-tight uppercase tracking-tighter">
                          {inspectedAnimal.skillDesc}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions (Select / Deploy button & Trade button) */}
                  <div className="pt-3 border-t border-white/5 space-y-1.5">
                    <button
                      onClick={() => handleSelectAndClose(inspectedAnimal)}
                      className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl shadow-xl hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Backpack size={13} /> SELECT FOR DEPLOYMENT
                    </button>

                    {onOpenTrade && (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenTrade();
                        }}
                        className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 border border-amber-500/30 hover:border-amber-400 text-amber-300 font-extrabold text-[9.5px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <ArrowRightLeft size={11} className="text-amber-400" /> Trade Unit in P2P Network
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-600 text-center text-xs uppercase font-extrabold p-4">
                  Select a genome archetype to inspect stats & recycle
                </div>
              )}
            </div>

            {/* Floating Bulk Sell Bottom Action Drawer */}
            {isBulkSellMode && selectedForSellIds.length > 0 && (
              <motion.div
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 80, opacity: 0 }}
                className="absolute bottom-3 left-4 right-84 z-30 bg-slate-950/95 border border-amber-500/60 p-3 rounded-xl shadow-[0_0_30px_rgba(245,158,11,0.3)] backdrop-blur-md flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                    <Trash2 size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase text-white flex items-center gap-2">
                      <span>{bulkSellTotals.count} Unit(s) Selected</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40">
                        RECYCLE BATCH
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2">
                      <span>Total Gain:</span>
                      <span className="text-emerald-400 font-bold">+{bulkSellTotals.totalMeat.toLocaleString()} Meat</span>
                      <span>•</span>
                      <span className="text-cyan-400 font-bold">+{bulkSellTotals.totalDna.toLocaleString()} DNA</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClearBulkSelection}
                    className="px-2.5 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg text-[9px] font-bold uppercase transition-all"
                  >
                    Deselect
                  </button>
                  <button
                    onClick={handleExecuteBulkSell}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-lg shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Flame size={14} /> Confirm Recycle (+{bulkSellTotals.totalMeat.toLocaleString()} Meat / +{bulkSellTotals.totalDna.toLocaleString()} DNA)
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
