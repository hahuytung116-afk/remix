import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bot, Cpu, Swords, Hammer, Layers, AlertCircle, RefreshCw, Sparkles, CheckSquare, Square, TrendingUp } from 'lucide-react';
import { ANIMALS } from '../constants';

interface AutomationModalProps {
  isOpen: boolean;
  onClose: () => void;
  autoDeployWaves: boolean;
  autoDeployTowers: boolean;
  autoDeployUnitId?: string;
  summonedAnimals?: string[];
  autoUpgradeTowers: boolean;
  autoSellDuplicates: boolean;
  autoSellCommons: boolean;
  autoSellRares: boolean;
  autoSellEpics: boolean;
  autoSellLegendaries: boolean;
  autoSummon: boolean;
  autoSummonAltar: 'standard' | 'quantum' | 'ultra';
  setAutoDeployWaves: (val: boolean) => void;
  setAutoDeployTowers: (val: boolean) => void;
  setAutoDeployUnitId?: (val: string) => void;
  setAutoUpgradeTowers: (val: boolean) => void;
  setAutoSellDuplicates: (val: boolean) => void;
  setAutoSellCommons: (val: boolean) => void;
  setAutoSellRares: (val: boolean) => void;
  setAutoSellEpics: (val: boolean) => void;
  setAutoSellLegendaries: (val: boolean) => void;
  setAutoSummon: (val: boolean) => void;
  setAutoSummonAltar: (val: 'standard' | 'quantum' | 'ultra') => void;
  bulkEvolveTowers?: () => { success: boolean; upgradedCount: number; totalCost: number; message: string };
  towers?: any[];
  meat?: number;
}

export const AutomationModal: React.FC<AutomationModalProps> = ({
  isOpen,
  onClose,
  autoDeployWaves,
  autoDeployTowers,
  autoDeployUnitId = 'best',
  summonedAnimals = [],
  autoUpgradeTowers,
  autoSellDuplicates,
  autoSellCommons,
  autoSellRares,
  autoSellEpics,
  autoSellLegendaries,
  autoSummon,
  autoSummonAltar,
  setAutoDeployWaves,
  setAutoDeployTowers,
  setAutoDeployUnitId,
  setAutoUpgradeTowers,
  setAutoSellDuplicates,
  setAutoSellCommons,
  setAutoSellRares,
  setAutoSellEpics,
  setAutoSellLegendaries,
  setAutoSummon,
  setAutoSummonAltar,
  bulkEvolveTowers,
  towers = [],
  meat = 0,
}) => {
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const bulkEvolveStats = useMemo(() => {
    if (!towers) return { totalCost: 0, count: 0, maxAffordableCount: 0, affordableCost: 0 };
    const eligible = towers.filter(t => t.level < 20);
    
    let totalCost = 0;
    const upgradeCosts = eligible.map(t => {
      const animal = ANIMALS.find(a => a.id === t.animalId);
      if (!animal) return 0;
      return Math.floor(animal.cost * (t.level + 1) * 0.5);
    });

    totalCost = upgradeCosts.reduce((acc, curr) => acc + curr, 0);

    let affordableCost = 0;
    let maxAffordableCount = 0;
    
    const items = eligible.map(t => {
      const animal = ANIMALS.find(a => a.id === t.animalId)!;
      const cost = animal ? Math.floor(animal.cost * (t.level + 1) * 0.5) : 0;
      return { tower: t, animal, cost };
    });

    const rarityPriority: Record<string, number> = {
      'Celestial': 7,
      'Secret': 6,
      'Mythic': 5,
      'Legendary': 4,
      'Epic': 3,
      'Rare': 2,
      'Common': 1
    };

    items.sort((a, b) => {
      const rA = rarityPriority[a.animal?.rarity || ''] || 0;
      const rB = rarityPriority[b.animal?.rarity || ''] || 0;
      if (rA !== rB) {
        return rB - rA;
      }
      return a.cost - b.cost;
    });

    let remainingMeat = meat;
    for (const item of items) {
      if (remainingMeat >= item.cost) {
        remainingMeat -= item.cost;
        affordableCost += item.cost;
        maxAffordableCount++;
      }
    }

    return {
      totalCost,
      count: eligible.length,
      maxAffordableCount,
      affordableCost
    };
  }, [towers, meat]);

  const handleBulkEvolveClick = () => {
    if (!bulkEvolveTowers) return;
    const res = bulkEvolveTowers();
    if (res.success) {
      setStatusMessage({ text: res.message, type: 'success' });
    } else {
      setStatusMessage({ text: res.message, type: 'error' });
    }
    setTimeout(() => {
      setStatusMessage(null);
    }, 4000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col z-10 max-h-[90vh]"
          >
            {/* Holographic Header Decor */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>

            {/* Header */}
            <header className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-950/40">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-cyan-500/10 rounded-xl border border-cyan-500/30 flex items-center justify-center">
                  <Bot className="text-cyan-400 animate-pulse" size={20} />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase text-white tracking-widest">Auto-Pilot Config Panel</h2>
                  <p className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest">CYBERNETIC SYSTEM CORES</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-slate-950/40 text-slate-400 hover:text-white border border-white/5 hover:border-white/10 transition-colors"
              >
                <X size={16} />
              </button>
            </header>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* SECTION 1: Tactical Grid Automator */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                  <Cpu className="text-cyan-400" size={14} />
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TACTICAL GRID AUTOMATION</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Auto Waves */}
                  <div className="p-4 rounded-2xl bg-slate-950/40 border border-white/5 hover:border-cyan-500/20 transition-all flex flex-col justify-between space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                          <Swords size={12} className="text-emerald-400" /> Auto-Deploy Waves
                        </span>
                        <p className="text-[8px] text-slate-400 uppercase mt-1 tracking-tight leading-relaxed">
                          Triggers the next wave instantly 1.2s after standard enemy neutralization.
                        </p>
                      </div>
                      <button
                        onClick={() => setAutoDeployWaves(!autoDeployWaves)}
                        className={`w-9 h-5 rounded-full p-0.5 transition-all duration-300 flex-shrink-0 ${autoDeployWaves ? 'bg-cyan-500' : 'bg-slate-800'}`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 ${autoDeployWaves ? 'transform translate-x-4' : ''}`}></div>
                      </button>
                    </div>
                  </div>

                  {/* Auto Tower Placer */}
                  <div className="p-4 rounded-2xl bg-slate-950/40 border border-white/5 hover:border-cyan-500/20 transition-all flex flex-col justify-between space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                          <Hammer size={12} className="text-amber-400" /> Auto-Deploy Towers
                        </span>
                        <p className="text-[8px] text-slate-400 uppercase mt-1 tracking-tight leading-relaxed">
                          Installs unlocked animal defense nodes securely next to the path, selecting cheapest first.
                        </p>
                      </div>
                      <button
                        onClick={() => setAutoDeployTowers(!autoDeployTowers)}
                        className={`w-9 h-5 rounded-full p-0.5 transition-all duration-300 flex-shrink-0 ${autoDeployTowers ? 'bg-cyan-500' : 'bg-slate-800'}`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 ${autoDeployTowers ? 'transform translate-x-4' : ''}`}></div>
                      </button>
                    </div>

                    {/* Auto-Deploy Unit Selection dropdown */}
                    {autoDeployTowers && setAutoDeployUnitId && (
                      <div className="pt-2 border-t border-white/5 mt-1">
                        <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">
                          Deploy Target Unit
                        </label>
                        <select
                          value={autoDeployUnitId}
                          onChange={(e) => setAutoDeployUnitId(e.target.value)}
                          className="w-full bg-slate-900 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] font-bold text-white focus:outline-none focus:border-cyan-500/50"
                        >
                          <option value="best">👑 Best Available / Selected</option>
                          {ANIMALS.filter(a => summonedAnimals.includes(a.id)).map((a, idx) => (
                            <option key={`auto-deploy-unit-${a.id}-${idx}`} value={a.id}>
                              {a.name} ({a.rarity}) - {a.cost}🍖
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Auto Tower Upgrader */}
                  <div className="p-4 rounded-2xl bg-slate-950/40 border border-white/5 hover:border-cyan-500/20 transition-all flex flex-col justify-between space-y-3 md:col-span-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                          <Layers size={12} className="text-indigo-400" /> Auto-Evolve Towers
                        </span>
                        <p className="text-[8px] text-slate-400 uppercase mt-1 tracking-tight leading-relaxed">
                          Uses accumulated Meat to level up existing combat units, targeting highest rarity nodes prioritarily.
                        </p>
                      </div>
                      <button
                        onClick={() => setAutoUpgradeTowers(!autoUpgradeTowers)}
                        className={`w-9 h-5 rounded-full p-0.5 transition-all duration-300 flex-shrink-0 ${autoUpgradeTowers ? 'bg-cyan-500' : 'bg-slate-800'}`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 ${autoUpgradeTowers ? 'transform translate-x-4' : ''}`}></div>
                      </button>
                    </div>
                  </div>

                  {/* Manual Bulk Evolve Panel */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/20 to-slate-950/50 border border-cyan-500/20 shadow-lg flex flex-col space-y-3 md:col-span-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-black uppercase text-cyan-400 tracking-wider flex items-center gap-1.5">
                          <TrendingUp size={12} className="text-cyan-400 animate-pulse" /> Manual Bulk Evolve
                        </span>
                        <p className="text-[8px] text-slate-300 uppercase mt-1 tracking-tight leading-relaxed">
                          Instantly upgrade all currently placed defense units by +1 level at once using your meat stash. Saves thousands of clicks!
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-end text-right flex-shrink-0">
                        <span className="text-[7.5px] font-bold text-slate-400 uppercase">Available</span>
                        <span className="text-[10px] font-black text-emerald-400 font-mono">{meat.toLocaleString()} 🍖</span>
                      </div>
                    </div>

                    {/* Stats summary */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-950/40 p-2 rounded-xl border border-white/5">
                      <div className="flex flex-col">
                        <span className="text-[7.5px] font-bold text-slate-500 uppercase">Upgradeable units</span>
                        <span className="text-[10px] font-black font-mono text-slate-200">
                          {bulkEvolveStats.count > 0 ? `${bulkEvolveStats.count} Units` : 'None/Maxed'}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[7.5px] font-bold text-slate-500 uppercase">Total +1 Lvl Cost</span>
                        <span className={`text-[10px] font-black font-mono ${meat >= bulkEvolveStats.totalCost ? "text-cyan-400" : "text-amber-400"}`}>
                          {bulkEvolveStats.totalCost.toLocaleString()} 🍖
                        </span>
                      </div>
                    </div>

                    {/* Action buttons/notifications */}
                    <div className="flex flex-col gap-1.5 pt-1">
                      {statusMessage && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`p-2 rounded-lg text-[8px] font-black uppercase text-center border ${
                            statusMessage.type === 'success' 
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                              : 'bg-red-500/10 border-red-500/20 text-red-500'
                          }`}
                        >
                          {statusMessage.text}
                        </motion.div>
                      )}

                      <button
                        onClick={handleBulkEvolveClick}
                        disabled={bulkEvolveStats.count === 0}
                        className={`w-full py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          bulkEvolveStats.count === 0
                            ? 'bg-slate-800 text-slate-500 border border-white/5 cursor-not-allowed'
                            : (meat >= bulkEvolveStats.totalCost
                                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black shadow-[0_0_15px_rgba(6,182,212,0.25)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-[0.98]'
                                : 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/20 active:scale-[0.98]'
                              )
                        }`}
                      >
                        {bulkEvolveStats.count === 0 ? (
                          'No Units To Evolve'
                        ) : (
                          meat >= bulkEvolveStats.totalCost ? (
                            <>⚡ Bulk Evolve All ({bulkEvolveStats.count} Units)</>
                          ) : (
                            <>⚒️ Upgrade Affordables ({bulkEvolveStats.maxAffordableCount}/{bulkEvolveStats.count}) for {bulkEvolveStats.affordableCost.toLocaleString()} Meat</>
                          )
                        )}
                      </button>
                      
                      {meat < bulkEvolveStats.totalCost && bulkEvolveStats.count > 0 && bulkEvolveStats.maxAffordableCount > 0 && (
                        <div className="text-[7.5px] text-amber-400/80 uppercase text-center font-bold tracking-tight">
                          ⚠️ Cannot afford all. Evolving {bulkEvolveStats.maxAffordableCount} highest-tier units first.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Auto Summoner Wildlife */}
                  <div className="p-4 rounded-2xl bg-slate-950/40 border border-white/5 hover:border-cyan-500/20 transition-all flex flex-col justify-between space-y-3 md:col-span-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                          <Sparkles size={12} className="text-yellow-400 animate-pulse" /> Auto-Summon Wildlife
                        </span>
                        <p className="text-[8px] text-slate-400 uppercase mt-1 tracking-tight leading-relaxed">
                          Draws genetic wildlife codes automatically inside the DNA Altar in the background as genomes are earned.
                        </p>
                      </div>
                      <button
                        onClick={() => setAutoSummon(!autoSummon)}
                        className={`w-9 h-5 rounded-full p-0.5 transition-all duration-300 flex-shrink-0 ${autoSummon ? 'bg-cyan-500' : 'bg-slate-800'}`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 ${autoSummon ? 'transform translate-x-4' : ''}`}></div>
                      </button>
                    </div>

                    {/* Altar selector if active */}
                    {autoSummon && (
                      <div className="pt-2.5 border-t border-white/5 flex gap-2 items-center justify-between flex-col sm:flex-row">
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest self-start sm:self-center">Active Summoning Vector:</span>
                        <div className="flex gap-1.5 flex-wrap">
                          <button
                            onClick={() => setAutoSummonAltar('standard')}
                            className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${
                              autoSummonAltar === 'standard' 
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-[0_0_10px_rgba(6,182,212,0.15)]' 
                              : 'bg-slate-900 border border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/10'
                            }`}
                          >
                            Standard (100 DNA)
                          </button>
                          <button
                            onClick={() => setAutoSummonAltar('quantum')}
                            className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${
                              autoSummonAltar === 'quantum' 
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30 shadow-[0_0_10px_rgba(168,85,247,0.15)]' 
                              : 'bg-slate-900 border border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/10'
                            }`}
                          >
                            Quantum (500 DNA)
                          </button>
                          <button
                            onClick={() => setAutoSummonAltar('ultra')}
                            className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${
                              autoSummonAltar === 'ultra' 
                              ? 'bg-amber-500/20 text-yellow-300 border border-amber-400/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]' 
                              : 'bg-slate-900 border border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/10'
                            }`}
                          >
                            🔮 Gods Altar (1 Shard)
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 2: Altar Scrap Settings */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                  <RefreshCw className="text-cyan-400 animate-spin-slow" size={14} />
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ALTAR SCRAP & INTEGRATION RULES</h3>
                </div>

                <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 space-y-4">
                  <div className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed tracking-wider flex items-start gap-2 border-b border-white/5 pb-2.5">
                    <AlertCircle size={14} className="text-cyan-400 flex-none" />
                    <span>Configuring these limits automatically recycles newly drawn duplicates into raw DNA upon Altar Summoning.</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Auto Sell Duplicates */}
                    <button
                      onClick={() => setAutoSellDuplicates(!autoSellDuplicates)}
                      className="flex items-start gap-3 text-left group"
                    >
                      <div className="text-cyan-400 group-hover:scale-110 transition-transform mt-0.5 flex-none">
                        {autoSellDuplicates ? <CheckSquare size={16} /> : <Square size={16} />}
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-200 uppercase tracking-wider">Scrap All Repeat Repeats</div>
                        <div className="text-[8.5px] text-slate-400 uppercase mt-0.5 tracking-tight leading-tight">Always scrap repeat summons (keeps at least 1)</div>
                      </div>
                    </button>

                    {/* Auto Sell Commons */}
                    <button
                      onClick={() => setAutoSellCommons(!autoSellCommons)}
                      className="flex items-start gap-3 text-left group"
                    >
                      <div className="text-slate-400 group-hover:scale-110 transition-transform mt-0.5 flex-none">
                        {autoSellCommons ? <CheckSquare size={16} /> : <Square size={16} />}
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-200 uppercase tracking-wider">Scrap Commons (+45 DNA)</div>
                        <div className="text-[8.5px] text-slate-400 uppercase mt-0.5 tracking-tight leading-tight">Immediately converts newly drawn Commons</div>
                      </div>
                    </button>

                    {/* Auto Sell Rares */}
                    <button
                      onClick={() => setAutoSellRares(!autoSellRares)}
                      className="flex items-start gap-3 text-left group"
                    >
                      <div className="text-cyan-500 group-hover:scale-110 transition-transform mt-0.5 flex-none">
                        {autoSellRares ? <CheckSquare size={16} /> : <Square size={16} />}
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-200 uppercase tracking-wider">Scrap Rares (+60 DNA)</div>
                        <div className="text-[8.5px] text-slate-400 uppercase mt-0.5 tracking-tight leading-tight">Immediately converts newly drawn Rares</div>
                      </div>
                    </button>

                    {/* Auto Sell Epics */}
                    <button
                      onClick={() => setAutoSellEpics(!autoSellEpics)}
                      className="flex items-start gap-3 text-left group"
                    >
                      <div className="text-purple-400 group-hover:scale-110 transition-transform mt-0.5 flex-none">
                        {autoSellEpics ? <CheckSquare size={16} /> : <Square size={16} />}
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-200 uppercase tracking-wider">Scrap Epics (+80 DNA)</div>
                        <div className="text-[8.5px] text-slate-400 uppercase mt-0.5 tracking-tight leading-tight">Immediately converts newly drawn Epics</div>
                      </div>
                    </button>

                    {/* Auto Sell Legendaries */}
                    <button
                      onClick={() => setAutoSellLegendaries(!autoSellLegendaries)}
                      className="flex items-start gap-3 text-left group sm:col-span-2"
                    >
                      <div className="text-amber-400 group-hover:scale-110 transition-transform mt-0.5 flex-none">
                        {autoSellLegendaries ? <CheckSquare size={16} /> : <Square size={16} />}
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-200 uppercase tracking-wider">Scrap Legendaries (+100 DNA)</div>
                        <div className="text-[8.5px] text-slate-400 uppercase mt-0.5 tracking-tight leading-tight">Immediately converts newly drawn Legendaries</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer className="p-6 border-t border-white/10 bg-slate-950/40 flex items-center justify-between">
              <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span> COGNITIVE LINK SECURE
              </span>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-cyan-500 text-slate-950 font-black rounded-xl hover:bg-cyan-400 active:scale-95 transition-all uppercase text-[10px] tracking-widest shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              >
                Engage Systems
              </button>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
