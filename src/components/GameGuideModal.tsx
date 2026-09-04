import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  X, 
  Shield, 
  Sparkles, 
  Zap, 
  Flame, 
  Cpu, 
  Layers, 
  Coins, 
  Dna, 
  Target, 
  ArrowRight, 
  Grid, 
  ChevronRight,
  HelpCircle,
  Award,
  Crown,
  Maximize2
} from 'lucide-react';
import { ANIMALS } from '../constants';
import { TRAITS } from '../traits';
import { Rarity } from '../types';
import { RELICS } from '../relics';
import AnimalAvatar from './AnimalAvatar';

const RARITIES: Rarity[] = [
  'Common',
  'Rare',
  'Epic',
  'Legendary',
  'Mythic',
  'Secret',
  'Celestial',
  '???',
  'Original',
  'Overseer',
  'Unrivaled',
  'Arcane',
  'The Chillful'
];

export interface GameGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type GuideTab = 'basics' | 'relics' | 'rarities' | 'traits' | 'titans' | 'elements' | 'controls';

export const GameGuideModal: React.FC<GameGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<GuideTab>('basics');
  const [selectedRarityFilter, setSelectedRarityFilter] = useState<string>('All');

  if (!isOpen) return null;

  const tabs: { id: GuideTab; label: string; icon: any }[] = [
    { id: 'basics', label: 'Basics & Grid', icon: Grid },
    { id: 'relics', label: 'Artifact Relics', icon: Sparkles },
    { id: 'rarities', label: 'Beast Rarities', icon: Crown },
    { id: 'traits', label: 'Traits & Mutators', icon: Sparkles },
    { id: 'titans', label: '2x2 Titans & Tech', icon: Cpu },
    { id: 'elements', label: 'Elements & Synergy', icon: Flame },
    { id: 'controls', label: 'Hotkeys & Tips', icon: Zap },
  ];

  return (
    <div id="game-guide-modal" className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-4xl max-h-[90vh] bg-slate-950 border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden flex flex-col font-mono text-left"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-900/90 border-b border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <BookOpen size={22} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black uppercase text-cyan-300 tracking-wider flex items-center gap-2">
                TACTICAL FIELD GUIDE
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  v3.7 PROTOCOL
                </span>
              </h2>
              <p className="text-[10px] text-slate-400 tracking-widest uppercase">
                Combat Manual, Splicing Mechanics & Battle Directives
              </p>
            </div>
          </div>
          <button
            id="close-guide-modal-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900/50 border-b border-white/10 overflow-x-auto scrollbar-none">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`guide-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-slate-300 text-xs leading-relaxed">
          {/* TAB 1: BASICS & GRID */}
          {activeTab === 'basics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900/70 border border-cyan-500/20 rounded-xl space-y-2.5">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                    <Grid size={16} />
                    <span>TACTICAL PLACEMENT GRID</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    Selecting any unit from your Backpack or Quick Deploy activates the <strong className="text-cyan-300">Tactical Grid Overlay</strong>.
                  </p>
                  <ul className="space-y-1.5 text-[10px] text-slate-400">
                    <li className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm bg-green-500 flex-shrink-0" />
                      <span><strong className="text-green-400">Green Glow:</strong> Valid deployment ground.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm bg-red-500 flex-shrink-0" />
                      <span><strong className="text-red-400">Red Glow:</strong> Enemy road pathway or occupied cells.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 flex-shrink-0" />
                      <span><strong className="text-amber-400">Downward Neon Arrow:</strong> Live targeting reticle with attack radius preview.</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-900/70 border border-purple-500/20 rounded-xl space-y-2.5">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                    <Dna size={16} />
                    <span>BIO-ECONOMY: MEAT & DNA</span>
                  </div>
                  <div className="space-y-2 text-[11px]">
                    <div className="p-2.5 bg-slate-950/70 rounded-lg border border-white/5 flex items-center justify-between">
                      <span className="text-rose-400 font-bold flex items-center gap-1.5">
                        🥩 MEAT
                      </span>
                      <span className="text-[10px] text-slate-400 text-right">
                        Slay enemy hunters in combat to deploy & evolve towers in real-time.
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-950/70 rounded-lg border border-white/5 flex items-center justify-between">
                      <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                        🧬 DNA
                      </span>
                      <span className="text-[10px] text-slate-400 text-right">
                        Earned by clearing waves. Spent in the Lab for Gacha Summons & Mastery.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-900/70 border border-white/10 rounded-xl space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <Target size={15} />
                  CORE COMBAT DIRECTIVES
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5">
                    <span className="text-amber-300 font-bold block mb-1">1. Deploy Early Choke Points</span>
                    Place high-cadence splash damage units near early track bends to shred clusters of swift recon hunters.
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5">
                    <span className="text-cyan-300 font-bold block mb-1">2. Ascend to Pinnacle</span>
                    Once a unit reaches Tier 5 in combat, ascend it to Pinnacle status for a massive 4.5x stat multiplier!
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5">
                    <span className="text-purple-300 font-bold block mb-1">3. Trigger Active Skills</span>
                    Click placed Secret, Celestial, and Overseer units to unleash Realm Expansions and Ultra Lasers.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ARTIFACT RELICS */}
          {activeTab === 'relics' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-900/80 border border-amber-500/30 rounded-xl text-[11px] text-slate-300">
                <span className="text-amber-400 font-bold">🌌 Cosmic Relic System:</span> Relics provide permanent, global combat enhancements that stack additively with your active Badges and Traits. You can equip up to <strong className="text-amber-300">2 Active Relics</strong> at once in the Relic Vault!
                <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">How to Obtain:</span>
                  <span>Defeat Stage Bosses (Waves 10+), Slay Ultra World Bosses, or Forge with DNA / Shards of Gods in the Relic Vault.</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {RELICS.map(relic => (
                  <div 
                    key={relic.id}
                    className="p-3.5 bg-slate-900/70 border border-white/10 rounded-xl hover:border-amber-500/40 transition-all flex gap-3 text-left"
                  >
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 border"
                      style={{ 
                        backgroundColor: `${relic.color}15`, 
                        borderColor: `${relic.color}40` 
                      }}
                    >
                      {relic.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-white">{relic.name}</h4>
                        <span 
                          className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: `${relic.color}20`, color: relic.color }}
                        >
                          ⚡ {relic.bonus}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                        {relic.description}
                      </p>
                      <div className="mt-2 text-[9px] font-mono text-amber-400/90 flex items-center gap-1">
                        <span>🎯 Synergy:</span>
                        <span className="text-slate-300">{relic.bestSynergy}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: RARITIES */}
          {activeTab === 'rarities' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-900/70 border border-cyan-500/20 rounded-xl text-[11px] text-slate-300">
                Units range from Common wildlife to mythical divine gods and anomalous timeline beings.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {RARITIES.map(rarity => {
                  const sampleAnimal = ANIMALS.find(a => a.rarity === rarity) || ANIMALS[0];
                  return (
                    <div 
                      key={rarity}
                      className="p-3.5 bg-slate-900/70 border border-white/10 rounded-xl hover:border-cyan-400/40 transition-all flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-950 border border-white/15 flex items-center justify-center flex-shrink-0">
                        <AnimalAvatar animal={sampleAnimal} size="xs" animated={false} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs" style={{ color: sampleAnimal.color }}>
                            {rarity}
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono uppercase">
                            Tier {sampleAnimal.rarity}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          Ex: {sampleAnimal.name} ({sampleAnimal.damage} DMG • {sampleAnimal.range} RNG)
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: TRAITS */}
          {activeTab === 'traits' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-900/70 border border-purple-500/20 rounded-xl text-[11px] text-slate-300 flex items-center justify-between">
                <div>
                  <span className="text-purple-300 font-bold block">DNA Trait Mutation System</span>
                  Every summoned beast mutates with a unique trait that grants massive stat buffs.
                </div>
                <div className="text-[10px] text-slate-400 font-mono text-right">
                  Reroll Cost: 🥩 15,000 / 🧬 120
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[50vh] overflow-y-auto pr-1">
                {Object.values(TRAITS).map(trait => (
                  <div key={trait.name} className="p-3 bg-slate-900/60 border border-white/10 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-cyan-300">{trait.name}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-white/10">
                        {trait.rarity}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-snug">
                      {trait.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: TITANS */}
          {activeTab === 'titans' && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-500/30 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Cpu size={16} />
                  <span>2x2 GRID OCCUPATION DIRECTIVE</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  The <strong className="text-amber-300">Titan Defender</strong> is an ultra-heavy armored construct. Because of its massive hydraulic chassis, it requires a full <strong className="text-amber-300">2x2 Grid Area (80x80 pixels)</strong> of clear ground to deploy.
                </p>
                <div className="p-2.5 bg-slate-950/80 rounded-lg border border-amber-500/20 text-[10px] text-amber-200">
                  ⚡ <strong>Placement Note:</strong> All 4 quadrants must be free from enemy paths and existing towers. Look for the glowing 2x2 green matrix box when deploying!
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                <div className="p-3.5 bg-slate-900/70 border border-white/10 rounded-xl space-y-1.5">
                  <span className="text-cyan-400 font-bold text-xs flex items-center gap-1.5">
                    <Zap size={14} /> Ultra Laser Beam
                  </span>
                  <p className="text-slate-400 text-[10px]">
                    Charges a devastating continuous plasma beam dealing 10x DPS through any enemy column.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-900/70 border border-white/10 rounded-xl space-y-1.5">
                  <span className="text-purple-400 font-bold text-xs flex items-center gap-1.5">
                    <Cpu size={14} /> 12-Slot Cockpit Lab
                  </span>
                  <p className="text-slate-400 text-[10px]">
                    Install Overdrive Cores, Coolant Loops, and Kinetic Thrusters inside the Unit Profile panel.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ELEMENTS */}
          {activeTab === 'elements' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-900/70 border border-rose-500/20 rounded-xl text-[11px] text-slate-300">
                Align units of identical elements to unlock <strong className="text-amber-300">Elemental Resonance</strong> bonuses that boost attack speed and critical damage across the battlefield.
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[10px]">
                <div className="p-2.5 bg-slate-900/70 border border-red-500/30 rounded-xl text-center">
                  <span className="text-red-400 font-bold block mb-1">🔥 FIRE</span>
                  Burns targets with damage over time.
                </div>
                <div className="p-2.5 bg-slate-900/70 border border-blue-500/30 rounded-xl text-center">
                  <span className="text-blue-400 font-bold block mb-1">💧 WATER</span>
                  Slows and drenches hunter armor.
                </div>
                <div className="p-2.5 bg-slate-900/70 border border-emerald-500/30 rounded-xl text-center">
                  <span className="text-emerald-400 font-bold block mb-1">🌿 NATURE</span>
                  Roots enemies and leeches Meat.
                </div>
                <div className="p-2.5 bg-slate-900/70 border border-amber-500/30 rounded-xl text-center">
                  <span className="text-amber-400 font-bold block mb-1">⚡ LIGHTNING</span>
                  Chain electric bursts across packs.
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: CONTROLS */}
          {activeTab === 'controls' && (
            <div className="space-y-3">
              <div className="p-3.5 bg-slate-900/70 border border-white/10 rounded-xl space-y-2">
                <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                  KEYBOARD SHORTCUTS & COMBAT CONTROLS
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 bg-slate-950 rounded-lg flex items-center justify-between border border-white/5">
                    <span className="text-slate-400">Spacebar</span>
                    <span className="text-cyan-300 font-bold">Pause / Resume Wave</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-lg flex items-center justify-between border border-white/5">
                    <span className="text-slate-400">1, 2, 3, 4</span>
                    <span className="text-cyan-300 font-bold">Select Quick Deploy Unit</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-lg flex items-center justify-between border border-white/5">
                    <span className="text-slate-400">Escape</span>
                    <span className="text-cyan-300 font-bold">Deselect / Close Modals</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-lg flex items-center justify-between border border-white/5">
                    <span className="text-slate-400">U / M Key</span>
                    <span className="text-cyan-300 font-bold">Upgrade / Max Upgrade</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-900/90 border-t border-white/10 flex items-center justify-between">
          <span className="text-[9px] text-slate-500 uppercase tracking-wider">
            SANCTUARY DEFENSE CORP • ARCHIVE READY
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.4)]"
          >
            Got It, Commander
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default GameGuideModal;
