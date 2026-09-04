import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Search, 
  Zap, 
  Sparkles, 
  Swords, 
  Target, 
  Coins, 
  Trash2, 
  Check, 
  RefreshCw,
  Plus,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { Animal, Rarity } from '../types';
import AnimalAvatar from './AnimalAvatar';

interface QuickDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  ownedAnimals: Animal[];
  quickDeployUnitIds: string[];
  onUpdateQuickDeploy: (ids: string[]) => void;
  onSelectAnimalForDeploy: (animalId: string) => void;
  meat: number;
}

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

export function QuickDeployModal({
  isOpen,
  onClose,
  ownedAnimals,
  quickDeployUnitIds,
  onUpdateQuickDeploy,
  onSelectAnimalForDeploy,
  meat
}: QuickDeployModalProps) {
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRarity, setSelectedRarity] = useState<string>('All');

  // Fill up to 4 slots (or padded with empty strings)
  const currentSlots = useMemo(() => {
    const slots = [...quickDeployUnitIds];
    while (slots.length < 4) {
      slots.push('');
    }
    return slots.slice(0, 4);
  }, [quickDeployUnitIds]);

  const slotAnimals = useMemo(() => {
    return currentSlots.map(id => id ? ownedAnimals.find(a => a.id === id) || null : null);
  }, [currentSlots, ownedAnimals]);

  const uniqueRarities = useMemo(() => {
    const set = new Set<string>();
    ownedAnimals.forEach(a => set.add(a.rarity));
    return ['All', ...Array.from(set).sort((a, b) => (RARITY_ORDER[b] || 0) - (RARITY_ORDER[a] || 0))];
  }, [ownedAnimals]);

  const filteredOwnedAnimals = useMemo(() => {
    return ownedAnimals
      .filter(a => {
        if (selectedRarity !== 'All' && a.rarity !== selectedRarity) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return a.name.toLowerCase().includes(q) || a.rarity.toLowerCase().includes(q);
        }
        return true;
      })
      .sort((a, b) => {
        const diff = (RARITY_ORDER[b.rarity] || 0) - (RARITY_ORDER[a.rarity] || 0);
        if (diff !== 0) return diff;
        return b.damage - a.damage;
      });
  }, [ownedAnimals, selectedRarity, searchQuery]);

  if (!isOpen) return null;

  const handleAssignUnitToSlot = (animalId: string, slotIdx: number) => {
    const newSlots = [...currentSlots];
    
    // If unit is already in another slot, swap or clear that slot
    const existingIdx = newSlots.findIndex(id => id === animalId);
    if (existingIdx !== -1 && existingIdx !== slotIdx) {
      newSlots[existingIdx] = '';
    }
    
    newSlots[slotIdx] = animalId;
    // Filter out trailing empty strings but keep array structure clean
    const cleaned = newSlots.filter(Boolean);
    onUpdateQuickDeploy(cleaned);

    // Auto advance to next empty slot if any
    const nextEmpty = newSlots.findIndex((id, idx) => idx > slotIdx && !id);
    if (nextEmpty !== -1) {
      setSelectedSlotIndex(nextEmpty);
    }
  };

  const handleClearSlot = (slotIdx: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newSlots = [...currentSlots];
    newSlots[slotIdx] = '';
    onUpdateQuickDeploy(newSlots.filter(Boolean));
  };

  const handleAutoFillStrongest = () => {
    const sorted = [...ownedAnimals].sort((a, b) => {
      const diff = (RARITY_ORDER[b.rarity] || 0) - (RARITY_ORDER[a.rarity] || 0);
      if (diff !== 0) return diff;
      return b.damage - a.damage;
    });
    const top4Ids = sorted.slice(0, 4).map(a => a.id);
    onUpdateQuickDeploy(top4Ids);
  };

  const handleClearAll = () => {
    onUpdateQuickDeploy([]);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900/95 border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col overflow-hidden text-slate-200"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-white/10 bg-slate-950/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/30 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner">
                <Zap size={20} className="animate-pulse" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                  CUSTOMIZE QUICK-DEPLOY LOADOUT
                </h2>
                <p className="text-[10.5px] text-slate-400 uppercase tracking-tight">
                  Choose up to 4 favorite units for instant 1-tap deployment in combat
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAutoFillStrongest}
                className="px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 text-[10px] font-black uppercase rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                title="Automatically assign your 4 highest damage and rarity units"
              >
                <Sparkles size={12} /> Auto-Fill Strongest
              </button>
              <button
                onClick={handleClearAll}
                className="px-2.5 py-1.5 bg-slate-800/80 hover:bg-red-950/40 border border-white/10 hover:border-red-500/30 text-slate-400 hover:text-red-300 text-[10px] font-bold uppercase rounded-lg transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                title="Clear all 4 slots"
              >
                <Trash2 size={11} /> Clear
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* 4 Quick Deploy Slots Row */}
          <div className="p-4 sm:p-5 bg-slate-950/40 border-b border-white/5">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>🎯</span> ACTIVE LOADOUT SLOTS (SELECT A SLOT TO ASSIGN A UNIT)
              </span>
              <span className="text-cyan-400 font-mono text-[9px]">
                Slot {selectedSlotIndex + 1} Selected
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {slotAnimals.map((animal, slotIdx) => {
                const isSelectedSlot = selectedSlotIndex === slotIdx;

                return (
                  <div
                    key={`loadout-slot-${slotIdx}`}
                    onClick={() => setSelectedSlotIndex(slotIdx)}
                    className={`relative p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between min-h-[92px] group ${
                      isSelectedSlot
                        ? 'bg-slate-800/90 border-cyan-400 ring-2 ring-cyan-400/30 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                        : animal
                        ? 'bg-slate-900/80 border-white/10 hover:border-cyan-500/40 hover:bg-slate-850'
                        : 'bg-slate-950/60 border-dashed border-white/15 hover:border-cyan-500/40'
                    }`}
                  >
                    {/* Slot badge label */}
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded font-mono ${
                        isSelectedSlot 
                          ? 'bg-cyan-500 text-slate-950 font-black' 
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        SLOT {slotIdx + 1}
                      </span>

                      {animal && (
                        <button
                          onClick={(e) => handleClearSlot(slotIdx, e)}
                          className="text-slate-500 hover:text-red-400 transition-colors p-0.5 rounded hover:bg-slate-950 cursor-pointer"
                          title="Remove from this slot"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>

                    {animal ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-7 h-7 rounded-full bg-slate-950 border flex items-center justify-center p-0.5 flex-shrink-0"
                            style={{ borderColor: animal.color }}
                          >
                            <AnimalAvatar animal={animal} size="xs" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[10px] font-black text-white truncate leading-tight">
                              {animal.name}
                            </div>
                            <div 
                              className="text-[7.5px] font-black uppercase tracking-wider"
                              style={{ color: animal.color }}
                            >
                              {animal.rarity}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-1 text-[7.5px] font-mono bg-slate-950/60 p-1 rounded border border-white/5 mt-1">
                          <div className="text-rose-300 flex items-center gap-0.5">
                            <Swords size={7} /> {animal.damage}
                          </div>
                          <div className="text-yellow-400 flex items-center justify-end gap-0.5">
                            <Coins size={7} /> {animal.cost}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center py-2">
                        <Plus size={16} className={`mb-1 ${isSelectedSlot ? 'text-cyan-400 animate-bounce' : 'text-slate-600'}`} />
                        <span className="text-[8.5px] font-black text-slate-500 uppercase tracking-tight">
                          Empty Slot
                        </span>
                        <span className="text-[7.5px] text-slate-600 uppercase">
                          Click unit below
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Unit Picker Grid from Owned Animals */}
          <div className="flex-1 flex flex-col overflow-hidden p-4 sm:p-5">
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 mb-3">
              <div className="relative flex-1">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search unit by name or rarity..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-950/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all font-sans"
                />
              </div>

              {/* Rarity filter tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin scrollbar-thumb-slate-800">
                {uniqueRarities.map(rarity => (
                  <button
                    key={`filter-${rarity}`}
                    onClick={() => setSelectedRarity(rarity)}
                    className={`px-2 py-1 rounded-lg text-[8.5px] font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                      selectedRarity === rarity
                        ? 'bg-cyan-500 text-slate-950 font-black shadow-[0_0_10px_rgba(6,182,212,0.35)]'
                        : 'bg-slate-950/60 border border-white/5 text-slate-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {rarity}
                  </button>
                ))}
              </div>
            </div>

            {/* Units Grid */}
            <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
              {filteredOwnedAnimals.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center text-center text-slate-500 text-xs uppercase font-bold p-4 border border-dashed border-white/10 rounded-xl">
                  <SlidersHorizontal size={24} className="text-slate-600 mb-2" />
                  No units found matching your search.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {filteredOwnedAnimals.map((animal) => {
                    const assignedSlotIndex = currentSlots.findIndex(id => id === animal.id);
                    const isAssigned = assignedSlotIndex !== -1;
                    const isAffordable = meat >= animal.cost;

                    return (
                      <div
                        key={`picker-${animal.id}`}
                        onClick={() => handleAssignUnitToSlot(animal.id, selectedSlotIndex)}
                        className={`p-2 rounded-xl border relative overflow-hidden transition-all cursor-pointer group select-none text-left flex flex-col justify-between ${
                          isAssigned
                            ? 'bg-cyan-950/30 border-cyan-400/80 shadow-[0_0_12px_rgba(6,182,212,0.15)] ring-1 ring-cyan-400/40'
                            : 'bg-slate-950/70 border-white/5 hover:border-cyan-500/40 hover:bg-slate-900'
                        }`}
                      >
                        {/* Rarity Accent strip */}
                        <div 
                          className="absolute left-0 top-0 bottom-0 w-[3px]"
                          style={{ backgroundColor: animal.color }}
                        />

                        {/* Top: Avatar, Name, Rarity & Slot indicator */}
                        <div className="flex items-center gap-2 mb-1.5 pl-1">
                          <div 
                            className="w-7 h-7 rounded-full bg-slate-900 border flex items-center justify-center p-0.5 flex-shrink-0"
                            style={{ borderColor: animal.color }}
                          >
                            <AnimalAvatar animal={animal} size="xs" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[10px] font-black text-white truncate leading-tight group-hover:text-cyan-300 transition-colors">
                              {animal.name}
                            </div>
                            <span 
                              className="text-[7.5px] font-black uppercase tracking-wider"
                              style={{ color: animal.color }}
                            >
                              {animal.rarity}
                            </span>
                          </div>

                          {isAssigned && (
                            <span className="px-1.5 py-0.5 rounded bg-cyan-500 text-slate-950 text-[7px] font-black uppercase font-mono flex-shrink-0 flex items-center gap-0.5">
                              <Check size={7} /> S{assignedSlotIndex + 1}
                            </span>
                          )}
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-1 bg-slate-900/80 p-1 rounded-lg border border-white/5 text-center font-mono text-[7.5px] mb-1.5">
                          <div>
                            <div className="text-[6.5px] text-slate-500 uppercase font-black">DMG</div>
                            <div className="font-bold text-rose-300">{animal.damage}</div>
                          </div>
                          <div>
                            <div className="text-[6.5px] text-slate-500 uppercase font-black">RNG</div>
                            <div className="font-bold text-cyan-300">{animal.range}</div>
                          </div>
                          <div>
                            <div className="text-[6.5px] text-slate-500 uppercase font-black">COST</div>
                            <div className="font-bold text-yellow-400">{animal.cost}</div>
                          </div>
                        </div>

                        {/* Actions row: Assign or Deploy Now */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAssignUnitToSlot(animal.id, selectedSlotIndex);
                            }}
                            className={`flex-1 py-1 rounded-md text-[8px] font-black uppercase tracking-tight transition-all cursor-pointer flex items-center justify-center gap-1 ${
                              isAssigned
                                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                                : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 group-hover:bg-cyan-500 group-hover:text-slate-950'
                            }`}
                          >
                            <Zap size={8} /> {isAssigned ? `Assigned to Slot ${assignedSlotIndex + 1}` : `Set Slot ${selectedSlotIndex + 1}`}
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectAnimalForDeploy(animal.id);
                              onClose();
                            }}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-md text-[8px] font-extrabold uppercase transition-all cursor-pointer"
                            title="Select and close modal to deploy immediately"
                          >
                            Deploy
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Footer note */}
          <div className="p-3 bg-slate-950/80 border-t border-white/5 flex items-center justify-between text-[9px] text-slate-500 uppercase tracking-tight px-5">
            <span>💡 Tip: Quick-Deploy loadout is saved automatically and accessible on the left combat sidebar.</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-lg text-[9.5px] uppercase tracking-wider transition-all cursor-pointer active:scale-95"
            >
              Done & Save
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
