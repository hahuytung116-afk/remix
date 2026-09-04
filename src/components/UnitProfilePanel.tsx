import React from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  Dna, 
  Sparkles, 
  Palette, 
  BookOpen, 
  Sliders, 
  Info, 
  RefreshCw, 
  Shield, 
  Flame, 
  Eye, 
  Swords, 
  Wrench, 
  Crown, 
  AlertTriangle,
  Plane
} from 'lucide-react';
import { Animal, TowerInstance } from '../types';
import { TRAITS } from '../traits';
import { AIRCRAFTS } from '../aircrafts';
import AnimalAvatar from './AnimalAvatar';
import CapybaraAvatar from './CapybaraAvatar';

export interface UnitProfilePanelProps {
  selectedTower: TowerInstance | null;
  hoveredAnimal: Animal | null;
  selectedTowerAnimal: Animal | null;
  gameState: any;
  sidebarTab: 'upgrades' | 'traits' | 'abilities' | 'skins' | 'lore' | 'hangar';
  setSidebarTab: (tab: 'upgrades' | 'traits' | 'abilities' | 'skins' | 'lore' | 'hangar') => void;
  selectedTowerDamage: number;
  selectedTowerCadence: number;
  selectedTowerRange: number;
  upgradeCost: number;
  sellRefund: number;
  isDevMode: boolean;
  upgradeTower: (id: string) => void;
  maxUpgradeTower: (id: string) => void;
  cheatMaxUpgradeTower: (id: string) => void;
  ascendTowerToPinnacle: (id: string) => void;
  upgradeTowerAlienTech?: (id: string) => boolean;
  sellTower: (id: string) => void;
  setSelectedPlacedTowerId: (id: string | null) => void;
  rerollTowerTrait: (id: string) => string | null;
  setMysteryPopup: (popup: any) => void;
  setTraitWarning: (warning: any) => void;
  triggerOverseerActiveSkill: (id: string) => any;
  toggleTitanForm: (id: string) => void;
  setIsTitanUpgradeModalOpen: (open: boolean) => void;
  setIsLoreTitanCutsceneOpen?: (open: boolean) => void;
  upgradeWarperPart: (id: string, part: 'blade' | 'armoured_titan', cost: number) => any;
  setIsWarperClashCutsceneOpen: (open: boolean) => void;
  triggerUnrivaledFinisher: (id: string) => any;
  changeTowerElement: (towerId: string, element: any) => void;
  changeAllDeitiesElement: (element: any) => void;
  setTowers: React.Dispatch<React.SetStateAction<TowerInstance[]>>;
  setGameState: React.Dispatch<React.SetStateAction<any>>;
  loreLoading: boolean;
  loreCache: Record<string, any>;
  setLoreCache: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  fetchLore: (animal: Animal) => Promise<void>;
}

export const UnitProfilePanel: React.FC<UnitProfilePanelProps> = ({
  selectedTower,
  hoveredAnimal,
  selectedTowerAnimal,
  gameState,
  sidebarTab,
  setSidebarTab,
  selectedTowerDamage,
  selectedTowerCadence,
  selectedTowerRange,
  upgradeCost,
  sellRefund,
  isDevMode,
  upgradeTower,
  maxUpgradeTower,
  cheatMaxUpgradeTower,
  ascendTowerToPinnacle,
  upgradeTowerAlienTech,
  sellTower,
  setSelectedPlacedTowerId,
  rerollTowerTrait,
  setMysteryPopup,
  setTraitWarning,
  triggerOverseerActiveSkill,
  toggleTitanForm,
  setIsTitanUpgradeModalOpen,
  setIsLoreTitanCutsceneOpen,
  upgradeWarperPart,
  setIsWarperClashCutsceneOpen,
  triggerUnrivaledFinisher,
  changeTowerElement,
  changeAllDeitiesElement,
  setTowers,
  setGameState,
  loreLoading,
  loreCache,
  setLoreCache,
  fetchLore,
}) => {
  const currentUnit = selectedTowerAnimal || hoveredAnimal;
  if (!currentUnit) return null;

  const hasSpecialAbilities = Boolean(
    currentUnit.skillName ||
    (selectedTower && (
      selectedTower.animalId === 'all_seeing_overseer' ||
      selectedTower.animalId === 'titan_defender' ||
      selectedTower.animalId === 'arcane_warper' ||
      selectedTower.animalId === 'elemental_god' ||
      selectedTower.animalId.endsWith('_deity') ||
      selectedTower.animalId === 'unrivaled_void_behemoth' ||
      selectedTower.animalId === 'unrivaled_solar_phoenix'
    ))
  );

  const hasSkinsOrCustomTech = Boolean(
    selectedTower && (
      selectedTower.animalId === 'titan_defender' ||
      selectedTower.animalId === 'arcane_warper' ||
      selectedTower.animalId === 'elemental_god' ||
      selectedTower.animalId.endsWith('_deity')
    )
  );

  return (
    <div id="unit-profile-panel" className="flex flex-col h-full">
      {/* Category Navigation Bar */}
      <div className="grid grid-cols-6 gap-1 bg-slate-950/90 p-1.5 rounded-xl border border-white/10 mb-4 font-mono shadow-inner">
        <button
          id="tab-btn-upgrades"
          onClick={() => setSidebarTab('upgrades')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[9px] uppercase font-black transition-all cursor-pointer ${
            sidebarTab === 'upgrades'
              ? 'bg-gradient-to-br from-cyan-500 to-indigo-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)] border border-cyan-400/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Zap size={13} className={sidebarTab === 'upgrades' ? 'text-yellow-300' : 'text-slate-400'} />
          <span className="mt-1 tracking-wider">Upgrades</span>
        </button>

        <button
          id="tab-btn-traits"
          onClick={() => setSidebarTab('traits')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[9px] uppercase font-black transition-all cursor-pointer relative ${
            sidebarTab === 'traits'
              ? 'bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)] border border-purple-400/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Dna size={13} className={sidebarTab === 'traits' ? 'text-purple-300' : 'text-slate-400'} />
          <span className="mt-1 tracking-wider">Traits</span>
        </button>

        <button
          id="tab-btn-abilities"
          onClick={() => setSidebarTab('abilities')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[9px] uppercase font-black transition-all cursor-pointer relative ${
            sidebarTab === 'abilities'
              ? 'bg-gradient-to-br from-pink-600 to-rose-600 text-white shadow-[0_0_12px_rgba(244,63,94,0.4)] border border-pink-400/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          {hasSpecialAbilities && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          )}
          <Sparkles size={13} className={sidebarTab === 'abilities' ? 'text-cyan-300' : 'text-slate-400'} />
          <span className="mt-1 tracking-wider">Skills</span>
        </button>

        <button
          id="tab-btn-skins"
          onClick={() => setSidebarTab('skins')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[9px] uppercase font-black transition-all cursor-pointer relative ${
            sidebarTab === 'skins'
              ? 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)] border border-emerald-400/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          {hasSkinsOrCustomTech && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400" />
          )}
          <Palette size={13} className={sidebarTab === 'skins' ? 'text-emerald-300' : 'text-slate-400'} />
          <span className="mt-1 tracking-wider">Skins</span>
        </button>

        <button
          id="tab-btn-hangar"
          onClick={() => setSidebarTab('hangar')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[9px] uppercase font-black transition-all cursor-pointer relative ${
            sidebarTab === 'hangar'
              ? 'bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)] border border-blue-400/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Plane size={13} className={sidebarTab === 'hangar' ? 'text-cyan-300' : 'text-slate-400'} />
          <span className="mt-1 tracking-wider">Hangar</span>
        </button>

        <button
          id="tab-btn-lore"
          onClick={() => setSidebarTab('lore')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[9px] uppercase font-black transition-all cursor-pointer ${
            sidebarTab === 'lore'
              ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-[0_0_12px_rgba(245,158,11,0.4)] border border-amber-400/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <BookOpen size={13} className={sidebarTab === 'lore' ? 'text-amber-300' : 'text-slate-400'} />
          <span className="mt-1 tracking-wider">Lore</span>
        </button>
      </div>

      {/* ===================== TAB 1: UPGRADES & COMBAT STATS ===================== */}
      {sidebarTab === 'upgrades' && (
        <motion.div
          key="tab-upgrades"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="space-y-4"
        >
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2.5 text-center">
            <div className="bg-slate-950/80 p-2.5 rounded-lg border border-white/5 shadow-inner">
              <div className="text-[8.5px] uppercase text-slate-500 font-bold mb-0.5">Dmg Output</div>
              <div className="text-sm font-mono font-black text-red-400">
                {selectedTower ? Math.floor(selectedTowerDamage) : currentUnit.damage}
                {selectedTower && gameState.isHardcore && (
                  <span className="text-[8px] text-rose-500 block font-sans font-black leading-none mt-0.5 animate-pulse">HARDCORE (/5)</span>
                )}
              </div>
            </div>

            <div className="bg-slate-950/80 p-2.5 rounded-lg border border-white/5 shadow-inner">
              <div className="text-[8.5px] uppercase text-slate-500 font-bold mb-0.5">Cadence</div>
              <div className="text-sm font-mono font-black text-amber-400">
                {selectedTower 
                  ? selectedTowerCadence.toFixed(1)
                  : (1000 / currentUnit.fireRate).toFixed(1)
                }/s
              </div>
            </div>

            <div className="bg-slate-950/80 p-2.5 rounded-lg border border-white/5 shadow-inner">
              <div className="text-[8.5px] uppercase text-slate-500 font-bold mb-0.5">Scanner Range</div>
              <div className="text-sm font-mono font-black text-blue-400">
                {selectedTower ? Math.floor(selectedTowerRange) : currentUnit.range}m
              </div>
            </div>

            {currentUnit.aoeRange && (
              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-white/5 shadow-inner">
                <div className="text-[8.5px] uppercase text-slate-500 font-bold mb-0.5">AOE Blast</div>
                <div className="text-sm font-mono font-black text-orange-400">
                  {currentUnit.aoeRange}m
                </div>
              </div>
            )}

            {currentUnit.generationMeat && (
              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-white/5 shadow-inner col-span-2">
                <div className="text-[8.5px] uppercase text-slate-500 font-bold mb-0.5">Meat Yield</div>
                <div className="text-sm font-mono font-black text-green-400">
                  +{selectedTower 
                    ? Math.floor(selectedTowerAnimal!.generationMeat! * (1 + (selectedTower.level - 1) * 0.5)) 
                    : currentUnit.generationMeat
                  }/s
                </div>
              </div>
            )}

            {selectedTower && (
              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-amber-500/20 shadow-inner col-span-2 flex justify-between items-center px-3.5">
                <div className="text-[9.5px] uppercase text-slate-400 font-extrabold tracking-wider flex items-center gap-1.5">
                  <span className="text-amber-400">⚡</span> Current DPS
                </div>
                <div className="text-base font-mono font-black text-amber-400">
                  {((selectedTower as any).dps ?? 0).toLocaleString()}
                </div>
              </div>
            )}
          </div>

          {/* Evolution Progression & Level Controls */}
          {selectedTower ? (
            <div className="space-y-3 pt-2">
              <div className="bg-slate-800/30 p-3.5 rounded-xl border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[9.5px] font-bold uppercase text-slate-400 font-mono">Evolution Path</span>
                  <span className="text-[9.5px] font-bold text-yellow-500 font-mono">
                    {(selectedTower as any).isPinnacle ? 'ABSOLUTE PINNACLE' : selectedTower.level >= 20 ? 'Level 20 (MAX)' : `Tier ${selectedTower.level} → ${selectedTower.level + 1}`}
                  </span>
                </div>
                <div className="space-y-1.5 text-[9.5px] text-slate-400 font-mono">
                  <div className="flex justify-between">
                    <span>Damage Bonus</span>
                    <span className="text-green-400 font-bold">
                      {(selectedTower as any).isPinnacle ? '+1,000% (Pinnacle)' : selectedTower.level >= 20 ? 'Maxed (+400%)' : '+20%'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Range Bonus</span>
                    <span className="text-green-400 font-bold">
                      {(selectedTower as any).isPinnacle ? '+150% (Pinnacle)' : selectedTower.level >= 20 ? 'Maxed (+200%)' : '+10%'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pinnacle Evolving Chamber Section */}
              {selectedTower.level >= 20 && !(selectedTower as any).isPinnacle && (
                <div className="bg-gradient-to-br from-amber-950/40 to-slate-900/60 p-3.5 rounded-xl border border-amber-500/30 animate-pulse">
                  <div className="flex gap-2 items-center mb-1.5">
                    <span className="text-sm">🧬</span>
                    <span className="text-[9.5px] font-black uppercase text-amber-400 tracking-wider">EVOLVING CHAMBER ACTIVATED</span>
                  </div>
                  <p className="text-[8.5px] text-slate-400 leading-relaxed mb-2.5">
                    This unit has attained max tier. Sequence genetic markers to break limitation constructs and elevate to <strong className="text-amber-300">Absolute Pinnacle</strong>:
                  </p>
                  <div className="space-y-1 text-[8.5px] text-slate-300 border-t border-amber-500/10 pt-2 mb-3">
                    <div className="flex justify-between">
                      <span>🧬 Absolute Lethality</span>
                      <span className="text-yellow-400 font-black">10.0x Damage (1,000%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>🛰️ Perception Splicing</span>
                      <span className="text-yellow-400 font-black">+50% Attack Range</span>
                    </div>
                    <div className="flex justify-between">
                      <span>⚡ Hyperspeed Resonance</span>
                      <span className="text-yellow-400 font-black">40% Cooldown Reduction</span>
                    </div>
                  </div>
                  <button
                    onClick={() => ascendTowerToPinnacle(selectedTower.id)}
                    disabled={gameState.dna < 2000 || gameState.meat < 15000}
                    className={`w-full py-3 rounded-lg font-black uppercase text-[9.5px] tracking-wider transition-all ${
                      gameState.dna >= 2000 && gameState.meat >= 15000
                      ? 'bg-amber-400 text-slate-950 hover:scale-105 active:scale-95 border-2 border-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.4)] cursor-pointer'
                      : 'bg-slate-900/60 text-slate-600 border border-white/5 cursor-not-allowed'
                    }`}
                  >
                    {gameState.dna >= 2000 && gameState.meat >= 15000
                      ? 'ASCEND GENOME (2000 DNA & 15k Meat)'
                      : `NEED RESOURCES (2000 DNA & 15k Meat)`}
                  </button>
                </div>
              )}

              {(selectedTower as any).isPinnacle && (
                <div className="bg-gradient-to-br from-amber-500/20 via-slate-950 to-slate-900 p-3.5 rounded-xl border border-amber-400/40 text-center">
                  <div className="text-xl mb-0.5 animate-bounce">👑</div>
                  <h4 className="text-[11px] font-black uppercase text-amber-300 tracking-[0.2em] mb-1 font-mono">
                    ABSOLUTE PINNACLE REACHED
                  </h4>
                  <div className="text-[8.5px] text-slate-400 uppercase tracking-widest font-black mb-2 font-mono">
                    Transcendence Level: Pinnacle Alpha
                  </div>
                  <div className="py-2 px-2.5 bg-amber-500/10 rounded-lg border border-amber-500/20 text-[9.5px] text-amber-200/90 leading-tight">
                    This unit has achieved ultimate genetic divinity. Attack radius, projectile force, and speed are capped at universal thresholds.
                  </div>
                </div>
              )}

              {/* Alien Tech Evolution Tier (For Ground Units) */}
              {(!selectedTower.isFlying && (!selectedTower.aircraftId || selectedTower.aircraftId === 'none')) && (
                <div className="bg-gradient-to-br from-lime-950/40 via-slate-950 to-cyan-950/40 p-3.5 rounded-xl border border-lime-500/30 relative overflow-hidden shadow-[0_0_15px_rgba(132,204,22,0.1)]">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-lime-500/5 blur-xl pointer-events-none rounded-full" />
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base animate-pulse">👽</span>
                      <div>
                        <h4 className="text-[10.5px] font-black uppercase text-lime-400 tracking-wider font-mono">
                          ALIEN TECH EVOLUTION
                        </h4>
                        <p className="text-[8px] text-slate-400 font-mono uppercase tracking-widest">
                          {selectedTower.isAlienTech 
                            ? `Level ${selectedTower.alienTechTier || 1}/3 • Xenotech Infused` 
                            : 'Standard Ground Chassis'}
                        </p>
                      </div>
                    </div>
                    {selectedTower.isAlienTech ? (
                      <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-lime-500/20 text-lime-300 border border-lime-500/40 font-mono tracking-wider animate-pulse">
                        TIER {selectedTower.alienTechTier || 1}
                      </span>
                    ) : (
                      <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-white/10 font-mono">
                        AVAILABLE
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 text-[8.5px] text-slate-300 border-t border-white/10 pt-2 mb-3">
                    <div className="flex justify-between items-center bg-slate-900/60 px-2 py-1 rounded border border-white/5">
                      <span className="flex items-center gap-1 text-slate-300">
                        🛡️ Holographic Kinetic Shield
                      </span>
                      <span className="text-cyan-300 font-mono font-bold">
                        {selectedTower.isAlienTech 
                          ? `${Math.round(selectedTower.alienTechShieldHp || 0)} / ${(selectedTower.alienTechTier || 1) * 1200} HP` 
                          : '+1,200 HP Barrier'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900/60 px-2 py-1 rounded border border-white/5">
                      <span className="flex items-center gap-1 text-slate-300">
                        🎯 Laser-Tracking Optics
                      </span>
                      <span className="text-lime-300 font-mono font-bold">
                        {selectedTower.isAlienTech 
                          ? `+${(selectedTower.alienTechTier || 1) * 30}% Range / Lock-On` 
                          : 'Target Lock & +30% Range'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900/60 px-2 py-1 rounded border border-white/5">
                      <span className="flex items-center gap-1 text-slate-300">
                        ⚡ Shockwave & EMP Deflection
                      </span>
                      <span className="text-amber-300 font-mono font-bold">
                        {selectedTower.isAlienTech ? 'Active Absorption' : 'Prevents Stuns'}
                      </span>
                    </div>
                  </div>

                  {upgradeTowerAlienTech && (
                    <button
                      onClick={() => upgradeTowerAlienTech(selectedTower.id)}
                      disabled={
                        (selectedTower.alienTechTier || 0) >= 3 ||
                        gameState.dna < (((selectedTower.alienTechTier || 0) + 1) === 1 ? 500 : ((selectedTower.alienTechTier || 0) + 1) === 2 ? 1000 : 2000) ||
                        gameState.meat < (((selectedTower.alienTechTier || 0) + 1) === 1 ? 3500 : ((selectedTower.alienTechTier || 0) + 1) === 2 ? 7500 : 15000)
                      }
                      className={`w-full py-2.5 rounded-lg font-black uppercase text-[9.5px] tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                        (selectedTower.alienTechTier || 0) >= 3
                          ? 'bg-slate-900/60 text-lime-400/60 border border-lime-500/20 cursor-default'
                          : gameState.dna >= (((selectedTower.alienTechTier || 0) + 1) === 1 ? 500 : ((selectedTower.alienTechTier || 0) + 1) === 2 ? 1000 : 2000) &&
                            gameState.meat >= (((selectedTower.alienTechTier || 0) + 1) === 1 ? 3500 : ((selectedTower.alienTechTier || 0) + 1) === 2 ? 7500 : 15000)
                          ? 'bg-gradient-to-r from-lime-500 to-emerald-500 text-slate-950 hover:scale-[1.02] active:scale-95 shadow-[0_0_15px_rgba(132,204,22,0.3)] cursor-pointer font-black'
                          : 'bg-slate-900/60 text-slate-500 border border-white/5 cursor-not-allowed'
                      }`}
                    >
                      {(selectedTower.alienTechTier || 0) >= 3 ? (
                        '👑 EXTRATERRESTRIAL SOVEREIGN (MAX)'
                      ) : (
                        `🧬 ${selectedTower.isAlienTech ? 'UPGRADE ALIEN TECH' : 'EVOLVE TO ALIEN TECH'} (T${(selectedTower.alienTechTier || 0) + 1}: ${
                          ((selectedTower.alienTechTier || 0) + 1) === 1 ? '500 DNA / 3.5k Meat' :
                          ((selectedTower.alienTechTier || 0) + 1) === 2 ? '1000 DNA / 7.5k Meat' :
                          '2000 DNA / 15k Meat'
                        })`
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* Upgrade Action Buttons */}
              <div className="space-y-2 pt-1">
                <button 
                  onClick={() => upgradeTower(selectedTower.id)}
                  disabled={selectedTower.level >= 20 || gameState.meat < upgradeCost}
                  className={`w-full py-3.5 rounded-lg font-black uppercase text-xs tracking-[0.15em] transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] cursor-pointer ${
                    selectedTower.level >= 20
                    ? 'hidden'
                    : gameState.meat >= upgradeCost 
                    ? 'bg-green-500 text-slate-950 hover:scale-105 active:scale-95 shadow-green-500/30' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5 shadow-none'
                  }`}
                >
                  Evolve Unit ({upgradeCost.toLocaleString()} Meat)
                </button>

                <button 
                  onClick={() => maxUpgradeTower(selectedTower.id)}
                  disabled={selectedTower.level >= 20 || gameState.meat < upgradeCost}
                  className={`w-full py-2.5 rounded-lg font-black uppercase text-[11px] tracking-wider transition-all cursor-pointer ${
                    selectedTower.level >= 20
                    ? 'hidden'
                    : gameState.meat >= upgradeCost 
                    ? 'bg-indigo-600 text-white hover:bg-slate-700/80 active:scale-95 border border-indigo-400' 
                    : 'bg-slate-800/40 text-slate-600 cursor-not-allowed border border-white/5'
                  }`}
                >
                  ⚡ Max Evolve (Affordable)
                </button>

                {isDevMode && (
                  <>
                    <button 
                      onClick={() => cheatMaxUpgradeTower(selectedTower.id)}
                      disabled={selectedTower.level >= 20}
                      className={`w-full py-2 rounded-lg text-[9.5px] uppercase tracking-widest font-black active:scale-95 transition-all border border-white/5 cursor-pointer ${
                        selectedTower.level >= 20
                        ? 'bg-slate-900/40 text-slate-600 cursor-not-allowed'
                        : 'bg-slate-950/60 text-slate-500 hover:bg-rose-950/40 hover:text-rose-400 hover:border-rose-500/30'
                      }`}
                    >
                      {selectedTower.level >= 20 ? '☠️ MAX LEVEL ATTAINED' : '☠️ Instant Max Level 20 (Cheat)'}
                    </button>
                    <button 
                      onClick={() => {
                        setGameState((prev: any) => ({
                          ...prev,
                          arcaneShards: (prev.arcaneShards || 0) + 3
                        }));
                      }}
                      className="w-full py-2 rounded-lg text-[9.5px] uppercase tracking-widest font-black active:scale-95 transition-all border border-purple-500/30 bg-purple-950/50 text-purple-300 hover:bg-purple-900/60 hover:text-purple-100 cursor-pointer flex items-center justify-center gap-1.5 font-mono"
                    >
                      🔮 Give Arcane Shards (+3 Cheat)
                    </button>
                  </>
                )}

                <button 
                  onClick={() => {
                    sellTower(selectedTower.id);
                    setSelectedPlacedTowerId(null);
                  }}
                  className="w-full py-2.5 bg-red-950/40 hover:bg-rose-950/30 text-rose-400 border border-rose-500/20 rounded-lg text-[11px] uppercase tracking-widest font-black active:scale-95 transition-all cursor-pointer"
                >
                  🤑 Sell Unit (+{sellRefund.toLocaleString()} Meat)
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/30 p-3.5 rounded-xl border border-white/10">
              <h4 className="text-[9.5px] font-bold uppercase text-slate-400 mb-2.5 tracking-widest flex items-center gap-2 font-mono">
                <Info size={12} /> Neural Specs
              </h4>
              <div className="space-y-1">
                <div className="flex justify-between text-[8.5px] font-black uppercase text-slate-500 font-mono">
                  <span>Lethality Matrix</span>
                  <span>{Math.floor((currentUnit.damage / 500) * 100)}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    className="h-full bg-red-500" 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (currentUnit.damage / 500) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ===================== TAB 2: TRAITS & GENETIC MUTATIONS ===================== */}
      {sidebarTab === 'traits' && (
        <motion.div
          key="tab-traits"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="space-y-4"
        >
          {selectedTower ? (
            (() => {
              const isOriginal = selectedTowerAnimal?.rarity === 'Original';
              const isOverseer = selectedTowerAnimal?.rarity === 'Overseer';
              const isArcane = selectedTowerAnimal?.rarity === 'Arcane';
              const isChillful = selectedTowerAnimal?.rarity === 'The Chillful' || selectedTowerAnimal?.id === 'capybara' || selectedTower.trait === 'Motivation';

              if (isOriginal) {
                return (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-yellow-500/15 border border-yellow-500/30 flex flex-col gap-2 shadow-[0_0_20px_rgba(245,158,11,0.15)] text-center">
                    <div className="text-xs font-black uppercase text-yellow-400 tracking-widest animate-pulse flex items-center justify-center gap-1 font-mono">
                      👑 ORIGINAL PRIMAL ANOMALY
                    </div>
                    <p className="text-[10.5px] text-slate-300 leading-relaxed font-sans px-1">
                      This creature is of raw **Original** origin, holding absolute primordial energy. It is completely immune to trait modifications, system coding, and rerolls.
                    </p>
                    <div className="inline-block mx-auto text-[9px] text-yellow-400 font-mono font-extrabold uppercase px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
                      TRAITS: IMMUNE TO ATTRIBUTION
                    </div>
                  </div>
                );
              }

              if (isOverseer) {
                return (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/15 to-teal-500/15 border border-cyan-500/30 flex flex-col gap-2 shadow-[0_0_20px_rgba(6,182,212,0.2)] text-center">
                    <div className="text-xs font-black uppercase text-cyan-400 tracking-widest animate-pulse flex items-center justify-center gap-1 font-mono">
                      🌌 TRANSCENDENTAL OVERSEER
                    </div>
                    <p className="text-[10.5px] text-slate-300 leading-relaxed font-sans px-1">
                      This space-time entity is a supreme **Overseer**, witnessing all realities. It carries exclusively the absolute **Eye of God** trait (+500% damage, +50% range, +30% attack speed).
                    </p>
                    <div className="inline-block mx-auto text-[9px] text-cyan-400 font-mono font-extrabold uppercase px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full animate-pulse">
                      TRAIT: EYE OF GOD ONLY
                    </div>
                  </div>
                );
              }

              if (isArcane) {
                return (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/80 via-fuchsia-950/60 to-slate-950 border-2 border-purple-400 flex flex-col gap-2 shadow-[0_0_30px_rgba(168,85,247,0.4)] text-center">
                    <div className="text-xs font-black uppercase text-purple-300 tracking-widest animate-pulse flex items-center justify-center gap-1 font-mono">
                      🔮 SUPREME ARCANE ENTITY (STRONGEST IN GAME)
                    </div>
                    <p className="text-[10.5px] text-purple-100 leading-relaxed font-sans px-1">
                      Absolute cosmic singularity. Endowed with the supreme **Death of World** special trait, amplifying ALL attributes, damage, range, and attack speed by <strong>x100 times</strong>.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-1.5 mt-1">
                      <div className="inline-block text-[9px] text-purple-200 font-mono font-extrabold uppercase px-2.5 py-1 bg-purple-500/25 border border-purple-400/50 rounded-full shadow-[0_0_12px_rgba(168,85,247,0.5)]">
                        SPECIAL TRAIT: DEATH OF WORLD (x100 ALL STATS)
                      </div>
                      <div className="inline-block text-[9px] text-pink-300 font-mono font-extrabold uppercase px-2.5 py-1 bg-pink-500/20 border border-pink-400/50 rounded-full shadow-[0_0_12px_rgba(244,63,94,0.4)]">
                        ⚡ 100% UNSTOPPABLE (CANNOT BE STUNNED)
                      </div>
                    </div>
                  </div>
                );
              }

              if (isChillful) {
                return (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-lime-950/70 via-emerald-950/50 to-slate-950 border border-lime-500/40 flex flex-col gap-2 shadow-[0_0_25px_rgba(132,204,22,0.25)]">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-black uppercase text-lime-400 tracking-wider flex items-center gap-1.5 font-mono">
                        <span className="w-4 h-4 inline-flex items-center justify-center"><CapybaraAvatar size="xs" withYuzu={true} /></span>
                        <span>PERMANENT TRAIT: MOTIVATION</span>
                      </div>
                      <span className="text-[8.5px] font-black uppercase px-2 py-0.5 rounded bg-lime-500/20 text-lime-300 border border-lime-400/40 font-mono">
                        The Chillful
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate-200 leading-relaxed font-sans">
                      Tranquil Motivation: Permanent locked trait of the Capybara that buffs damage by <strong className="text-lime-300">x200 (+19,900%)</strong> and reduces ability cooldowns by <strong className="text-lime-300">10%</strong>.
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <div className="text-[8.5px] text-lime-300 font-mono font-extrabold uppercase px-2 py-0.5 bg-lime-500/15 border border-lime-500/30 rounded-lg">
                        ✨ x200 DMG BOOST
                      </div>
                      <div className="text-[8.5px] text-emerald-300 font-mono font-extrabold uppercase px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/30 rounded-lg">
                        ⚡ -10% COOLDOWN
                      </div>
                      <div className="text-[8.5px] text-amber-300 font-mono font-extrabold uppercase px-2 py-0.5 bg-amber-500/15 border border-amber-500/30 rounded-lg">
                        🔒 CANNOT BE REPLACED
                      </div>
                    </div>
                  </div>
                );
              }

              const traitKey = selectedTower.trait || 'Normal';
              const traitDef = TRAITS[traitKey];
              if (!traitDef) return null;

              return (
                <div className="space-y-3.5">
                  {/* Active Trait Card */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 flex flex-col gap-2.5 shadow-inner">
                    <div className="flex items-center justify-between">
                      <span className="text-[9.5px] font-black uppercase text-slate-500 tracking-wider font-mono">ACTIVE GENETIC TRAIT:</span>
                      <span 
                        className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full font-mono animate-pulse" 
                        style={{ 
                          backgroundColor: `${traitDef.color}20`, 
                          color: traitDef.color, 
                          border: `1px solid ${traitDef.color}50` 
                        }}
                      >
                        {traitDef.name} ({traitDef.rarity})
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-900/60 rounded-xl border border-white/5">
                      <div className="text-[9px] font-black uppercase text-slate-400 mb-1 font-mono flex items-center gap-1">
                        <Info size={11} className="text-purple-400" /> Trait Meaning & Amplifications
                      </div>
                      <p className="text-[11px] text-slate-200 leading-relaxed font-sans">
                        {traitDef.description}
                      </p>
                    </div>

                    {/* Trait Pity System */}
                    <div className="grid grid-cols-2 gap-2 mt-0.5">
                      <div className="flex justify-between items-center text-[8.5px] font-black tracking-wider text-purple-400 uppercase bg-purple-500/10 px-2.5 py-1.5 rounded-lg border border-purple-500/20 font-mono">
                        <span>Celestial Pity</span>
                        <span className="font-mono text-purple-300 font-extrabold">{gameState.celestialTraitPity ?? 0}/15</span>
                      </div>
                      <div className="flex justify-between items-center text-[8.5px] font-black tracking-wider text-indigo-400 uppercase bg-indigo-500/10 px-2.5 py-1.5 rounded-lg border border-indigo-500/20 font-mono">
                        <span>??? Trait Pity</span>
                        <span className="font-mono text-indigo-300 font-extrabold">{gameState.mysteryTraitPity ?? 0}/100</span>
                      </div>
                    </div>
                    
                    {/* Reroll Button */}
                    <button
                      onClick={() => {
                        if (traitDef?.rarity === '???' || traitDef?.rarity === 'Celestial' || traitDef?.rarity === 'Secret') {
                          setTraitWarning({
                            isOpen: true,
                            type: 'reroll',
                            towerId: selectedTower.id,
                            traitName: traitDef.name,
                            traitRarity: traitDef.rarity,
                            traitColor: traitDef.color,
                          });
                          return;
                        }
                        const rolled = rerollTowerTrait(selectedTower.id);
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
                      }}
                      disabled={gameState.dna < 200}
                      className={`w-full py-2.5 mt-1 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer font-mono ${
                        gameState.dna >= 200
                          ? 'bg-purple-600/25 text-purple-200 border border-purple-500/40 hover:bg-purple-600 hover:text-white shadow-[0_0_15px_rgba(168,85,247,0.2)] active:scale-95'
                          : 'bg-slate-800 text-slate-600 border border-white/5 cursor-not-allowed'
                      }`}
                    >
                      🧬 REROLL TRAIT (200 DNA)
                    </button>
                  </div>

                  {/* Trait Tiers Guide */}
                  <div className="p-3 bg-slate-900/40 rounded-xl border border-white/5 text-[9px] text-slate-400 space-y-1.5 font-mono">
                    <div className="text-[9.5px] font-black uppercase text-slate-300 tracking-wider">🧬 Trait Rarity Hierarchy:</div>
                    <div className="grid grid-cols-2 gap-1 text-[8.5px]">
                      <span className="text-slate-400">Common: Normal, Swift</span>
                      <span className="text-emerald-400">Rare: Keen Eye, Vigor</span>
                      <span className="text-blue-400">Epic: Sniper, Berserk</span>
                      <span className="text-amber-400">Legendary: Warlord, Titan</span>
                      <span className="text-red-400">Mythic: Sovereign, Divine</span>
                      <span className="text-purple-400 font-black">Celestial: Monarch, Godspeed</span>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="p-4 bg-slate-900/60 rounded-xl border border-white/5 text-center text-slate-400 text-xs">
              Place unit to inspect and reroll genetic traits.
            </div>
          )}
        </motion.div>
      )}

      {/* ===================== TAB 3: ABILITIES & COMBAT SKILLS ===================== */}
      {sidebarTab === 'abilities' && (
        <motion.div
          key="tab-abilities"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="space-y-4"
        >
          {/* Mythic / Secret Special Skill Card */}
          {currentUnit.skillName ? (
            <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/60 to-purple-950/60 border border-cyan-500/30 shadow-[0_4px_20px_rgba(34,211,238,0.15)]">
              <div className="text-[9.5px] font-black uppercase text-cyan-400 tracking-widest flex items-center gap-1.5 mb-1 font-mono">
                <Sparkles size={13} className="animate-spin" style={{ animationDuration: '3s' }} /> SPECIAL PASSIVE / AUTOCAST SKILL
              </div>
              <div className="text-sm font-black text-white">{currentUnit.skillName}</div>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{currentUnit.skillDesc}</p>
              <div className="text-[8.5px] uppercase font-bold text-indigo-400 mt-2 tracking-tighter font-mono">
                Cooldown: Auto-cast every {currentUnit.id === 'phoenix' ? '4.5' : currentUnit.id === 'mecha_rex' ? '3.5' : currentUnit.id === 'cthulhu' ? '4.0' : '5.0'}s in wave
              </div>
            </div>
          ) : (
            <div className="p-3 bg-slate-900/40 rounded-xl border border-white/5 text-[9px] text-slate-400 text-center font-mono">
              Standard offensive projectile artillery pattern.
            </div>
          )}

          {/* Unit Specific Ultimates & Actives */}
          {selectedTower && (
            <>
              {/* All Seeing Overseer Skill */}
              {selectedTower.animalId === 'all_seeing_overseer' && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/80 to-cyan-950/80 border-2 border-cyan-400 shadow-[0_0_25px_rgba(0,255,204,0.35)] text-center">
                  <div className="text-2xl mb-1">🌀</div>
                  <h4 className="text-[11px] font-black uppercase text-cyan-300 tracking-[0.2em] mb-1 font-mono">
                    REALM EXPANSION READY
                  </h4>
                  <p className="text-[9.5px] text-slate-300 mb-3 leading-relaxed">
                    Unfolds space-time, freezes ALL enemies globally for 1.5 seconds, and inflicts colossal 100x strike damage.
                  </p>
                  <button
                    onClick={() => triggerOverseerActiveSkill(selectedTower.id)}
                    className="w-full py-3 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 text-[10px] tracking-widest uppercase font-black rounded-lg active:scale-95 transition-all shadow-lg hover:brightness-110 cursor-pointer font-mono"
                  >
                    🔮 EXPAND SPACE-TIME REALM (10.0s Cooldown)
                  </button>
                </div>
              )}

              {/* Titan Defender Command */}
              {selectedTower.animalId === 'titan_defender' && (
                <div className={`p-4 rounded-xl text-center space-y-3 ${
                  (selectedTower as any).titanForm === 'form3_multiverse'
                    ? 'bg-gradient-to-r from-purple-950/90 via-fuchsia-950/80 to-slate-950 border-2 border-purple-400 shadow-[0_0_30px_rgba(192,132,252,0.45)]'
                    : 'bg-gradient-to-r from-slate-950 via-cyan-950/80 to-slate-900 border-2 border-cyan-400 shadow-[0_0_25px_rgba(56,189,248,0.35)]'
                }`}>
                  <div className="text-2xl mb-0.5">
                    {(selectedTower as any).titanForm === 'form3_multiverse' ? '🌌' : '🛡️'}
                  </div>
                  <h4 className={`text-[11px] font-black uppercase tracking-[0.2em] font-mono ${
                    (selectedTower as any).titanForm === 'form3_multiverse' ? 'text-purple-300' : 'text-cyan-300'
                  }`}>
                    {(selectedTower as any).titanForm === 'form3_multiverse' ? 'MULTIVERSE WATCHER (2ND ARCANE)' : 'TITAN OVERSEER COMMAND'}
                  </h4>
                  <p className="text-[9.5px] text-slate-300 leading-relaxed">
                    Current Stance: <strong className={`uppercase font-black font-mono ${
                      (selectedTower as any).titanForm === 'form3_multiverse'
                        ? 'text-purple-300'
                        : (selectedTower as any).titanForm === 'form2_merged'
                          ? 'text-cyan-400'
                          : 'text-cyan-200'
                    }`}>
                      {(selectedTower as any).titanForm === 'form3_multiverse' 
                        ? '3RD FORM: MULTIVERSE WATCHER (BLACKHOLE SINGULARITY)' 
                        : (selectedTower as any).titanForm === 'form2_merged' 
                          ? '2ND FORM: GREAT DEFENDER (MERGED BIG LASER)' 
                          : '1ST FORM: DUAL FLANK LASERS'}
                    </strong>
                  </p>

                  {(selectedTower as any).titanForm === 'form3_multiverse' ? (
                    <div className="p-2.5 rounded-lg bg-purple-950/60 border border-purple-400/40 text-left text-[9px] space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-purple-200 uppercase font-mono">
                        <span>✨</span>
                        <span>Omni-Support & Cosmic Aura</span>
                      </div>
                      <p className="text-purple-300/90 leading-tight">
                        • <strong>Infinite Energy</strong> &amp; Immune to stun/drain.
                      </p>
                      <p className="text-purple-300/90 leading-tight">
                        • <strong>Omni-Protection:</strong> Prevents stun &amp; energy loss on all other animals!
                      </p>
                      <p className="text-purple-300/90 leading-tight">
                        • <strong>Cosmic Singularity:</strong> Blasts screen-shaking energy waves (Mechanical upgrades superseded).
                      </p>
                    </div>
                  ) : (
                    <div className="px-3 py-2 bg-slate-950/75 rounded-lg border border-cyan-400/20 text-left font-mono">
                      <div className="flex justify-between items-center text-[9.5px] mb-1">
                        <span className="text-slate-400 uppercase font-black tracking-wider">
                          🔋 Core Energy:
                        </span>
                        <span className={`font-black uppercase tracking-tight ${
                          (selectedTower as any).titanIsCharging ? 'text-yellow-400 animate-pulse' : 'text-cyan-400'
                        }`}>
                          {(selectedTower as any).titanIsCharging ? '⚡ Recharging' : '🟢 Ready'} ({ (selectedTower as any).titanEnergy ?? 100 }%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            (selectedTower as any).titanIsCharging ? 'bg-gradient-to-r from-yellow-500 to-amber-400' : 'bg-gradient-to-r from-cyan-500 to-blue-400'
                          }`}
                          style={{ width: `${(selectedTower as any).titanEnergy ?? 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Arcane Shards Progress & Give Panel Button */}
                  <div className="p-2.5 rounded-xl bg-purple-950/70 border border-purple-500/40 text-left space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[9.5px] font-mono text-purple-200 font-bold">
                        <span className="text-base">🔮</span>
                        <div>
                          <div className="uppercase tracking-wider text-[8.5px] text-purple-300">Arcane Shards (1% Enemy Drop)</div>
                          <div className="text-[11px] font-black text-white">
                            <span className={(gameState.arcaneShards || 0) >= 3 ? 'text-emerald-400 font-bold' : 'text-purple-300'}>
                              {(gameState.arcaneShards || 0)}
                            </span>
                            <span className="text-purple-400"> / 3 Required</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setGameState((prev: any) => ({
                            ...prev,
                            arcaneShards: (prev.arcaneShards || 0) + 3
                          }));
                        }}
                        className="py-1 px-2.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white rounded-lg text-[9px] font-black uppercase tracking-wider active:scale-95 transition-all shadow-[0_0_12px_rgba(168,85,247,0.4)] cursor-pointer font-mono border border-purple-300/30"
                        title="Give 3 Arcane Shards to unlock Multiverse Watcher form"
                      >
                        +3 GIVE SHARDS
                      </button>
                    </div>
                    {(gameState.arcaneShards || 0) < 3 && (selectedTower as any).titanForm !== 'form3_multiverse' && (
                      <p className="text-[8px] text-purple-300/80 leading-tight font-sans">
                        ℹ️ Multiverse Watcher requires 3 Arcane Shards (1% drop from normal enemies, or click &quot;+3 GIVE SHARDS&quot; above).
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        const res = toggleTitanForm(selectedTower.id) as any;
                        if (res && res.success === false && res.message) {
                          alert(res.message);
                        }
                      }}
                      className={`py-2.5 px-2 text-[9px] tracking-wider uppercase font-black rounded-lg active:scale-95 transition-all cursor-pointer font-mono ${
                        (selectedTower as any).titanForm === 'form3_multiverse'
                          ? 'bg-purple-950/80 hover:bg-purple-900 border border-purple-400 text-purple-200 shadow-[0_0_15px_rgba(192,132,252,0.3)]'
                          : (selectedTower as any).titanForm === 'form2_merged'
                            ? (gameState.arcaneShards || 0) >= 3
                              ? 'bg-purple-950/80 hover:bg-purple-900 border border-purple-400 text-purple-200'
                              : 'bg-slate-900 hover:bg-slate-800 border border-purple-500/30 text-purple-300'
                            : 'bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-400/50 text-cyan-200'
                      }`}
                    >
                      🔄 TOGGLE ({ 
                        (selectedTower as any).titanForm === 'form3_multiverse' 
                          ? 'FORM 1' 
                          : (selectedTower as any).titanForm === 'form2_merged' 
                            ? `FORM 3 (${(gameState.arcaneShards || 0)}/3 🔮)` 
                            : 'FORM 2' 
                      })
                    </button>

                    <button
                      onClick={() => {
                        const res = triggerOverseerActiveSkill(selectedTower.id);
                        if (res && !res.success && res.message) {
                          alert(res.message);
                        }
                      }}
                      className="py-2.5 px-2 bg-gradient-to-r from-cyan-400 to-amber-400 text-slate-950 text-[9px] tracking-wider uppercase font-black rounded-lg active:scale-95 transition-all shadow-md hover:brightness-110 cursor-pointer font-mono"
                    >
                      ⚡ {(selectedTower as any).titanForm === 'form3_multiverse' ? 'SINGULARITY' : 'ULTRA LASER'} ({ ((selectedTower as any).titanCoreUpgrade && (selectedTower as any).titanLaserCannonsUpgrade && (selectedTower as any).titanFrontShieldUpgrade && (selectedTower as any).titanSideShieldUpgrade) ? '45s' : '30s' })
                    </button>
                  </div>

                  {setIsLoreTitanCutsceneOpen && (
                    <button
                      onClick={() => setIsLoreTitanCutsceneOpen(true)}
                      className="w-full py-2 px-3 bg-gradient-to-r from-purple-700 via-fuchsia-600 to-pink-600 hover:opacity-90 text-white text-[9.5px] tracking-wider uppercase font-black rounded-lg active:scale-95 transition-all shadow-[0_0_15px_rgba(168,85,247,0.35)] cursor-pointer font-mono flex items-center justify-center gap-1.5 border border-purple-300/30"
                    >
                      <span>🎬</span> WATCH AWAKENING CUTSCENE
                    </button>
                  )}
                </div>
              )}

              {/* Arcane Warper Command */}
              {selectedTower.animalId === 'arcane_warper' && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/90 via-fuchsia-950/80 to-slate-950 border-2 border-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.35)] text-center space-y-3">
                  <div className="text-2xl mb-0.5">🧿</div>
                  <h4 className="text-[11px] font-black uppercase text-purple-300 tracking-[0.2em] font-mono">
                    ARCANE WARPER COMMAND
                  </h4>
                  <p className="text-[9.5px] text-slate-300 leading-relaxed">
                    Current Form: <strong className="text-purple-300 uppercase font-black font-mono">{selectedTower.warperSecondForm ? 'FORM 2: FALSE WARP DEITY (4 LASERS - 2,000x DMG)' : 'FORM 1: WARPER (2 SIDE LASERS)'}</strong>
                  </p>

                  {gameState.isTrueHell && !gameState.isUltraBoss && (
                    <div className="px-3 py-2 bg-slate-950/80 rounded-lg border border-purple-500/30 text-left font-mono">
                      <div className="flex justify-between items-center text-[9.5px] mb-1">
                        <span className="text-slate-400 uppercase font-black tracking-wider">
                          💀 True Hell Souls:
                        </span>
                        <span className={`font-black uppercase tracking-tight ${
                          (selectedTower.warperKillsInTrueHell || 0) >= 50 ? 'text-purple-300 animate-pulse' : 'text-slate-400'
                        }`}>
                          {Math.min(50, selectedTower.warperKillsInTrueHell || 0)} / 50 Kills { (selectedTower.warperKillsInTrueHell || 0) >= 50 ? '💥 READY!' : ''}
                        </span>
                      </div>
                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-purple-500/20">
                        <div 
                          className="h-full transition-all duration-300 bg-gradient-to-r from-purple-500 to-pink-500"
                          style={{ width: `${Math.min(100, ((selectedTower.warperKillsInTrueHell || 0) / 50) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setTowers(prev => prev.map(t => t.id === selectedTower.id ? { ...t, warperSecondForm: !t.warperSecondForm } : t));
                      }}
                      className="py-2.5 px-2 bg-purple-950/80 hover:bg-purple-900 border border-purple-400/50 text-purple-200 text-[9px] tracking-wider uppercase font-black rounded-lg active:scale-95 transition-all cursor-pointer font-mono"
                    >
                      🔄 SWITCH FORM ({ selectedTower.warperSecondForm ? 'FORM 1' : 'FORM 2' })
                    </button>

                    <button
                      onClick={() => {
                        const res = triggerOverseerActiveSkill(selectedTower.id);
                        if (res && !res.success && res.message) {
                          alert(res.message);
                        }
                      }}
                      className="py-2.5 px-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white text-[9px] tracking-wider uppercase font-black rounded-lg active:scale-95 transition-all shadow-md hover:brightness-110 cursor-pointer animate-pulse font-mono"
                    >
                      💥 WORLD CRUSHER
                    </button>
                  </div>
                </div>
              )}

              {/* Elemental Deity Specialty Skill */}
              {(selectedTower.animalId === 'elemental_god' || selectedTower.animalId.endsWith('_deity')) && (
                <div className={`p-4 rounded-xl border-2 text-center shadow-lg transition-all duration-300 ${
                  ((selectedTower as any).element || 'fire') === 'fire' ? 'bg-gradient-to-r from-red-950/80 to-amber-950/80 border-red-500 shadow-red-500/20' :
                  ((selectedTower as any).element) === 'poison' ? 'bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border-emerald-500 shadow-emerald-500/20' :
                  ((selectedTower as any).element) === 'water' ? 'bg-gradient-to-r from-blue-950/80 to-cyan-950/80 border-blue-500 shadow-blue-500/20' :
                  ((selectedTower as any).element) === 'sand' ? 'bg-gradient-to-r from-amber-950/80 to-orange-950/80 border-amber-500 shadow-amber-500/20' :
                  ((selectedTower as any).element) === 'dirt' ? 'bg-gradient-to-r from-stone-900 to-amber-950/50 border-amber-800 shadow-amber-800/10' :
                  ((selectedTower as any).element) === 'ice' ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/80 border-cyan-400 shadow-cyan-400/20' :
                  ((selectedTower as any).element) === 'wind' ? 'bg-gradient-to-r from-stone-900 to-slate-850 border-stone-400 shadow-stone-500/10' :
                  ((selectedTower as any).element) === 'lightning' ? 'bg-gradient-to-r from-yellow-950/80 to-amber-950/80 border-yellow-400 shadow-yellow-500/20' :
                  ((selectedTower as any).element) === 'light' ? 'bg-gradient-to-r from-amber-950/80 to-yellow-900/80 border-amber-300 shadow-amber-300/20' :
                  ((selectedTower as any).element) === 'shadow' ? 'bg-gradient-to-r from-purple-950/80 to-slate-950/80 border-purple-500 shadow-purple-500/20' :
                  ((selectedTower as any).element) === 'magma' ? 'bg-gradient-to-r from-orange-950/80 to-red-950/80 border-orange-500 shadow-orange-500/20' :
                  'bg-gradient-to-r from-pink-950/80 to-purple-950/80 border-pink-400 shadow-pink-400/20'
                }`}>
                  <h4 className="text-[11px] font-black uppercase tracking-[0.2em] mb-1 font-mono text-amber-300">
                    ⭐ DEITY SPECIALTY SKILL
                  </h4>
                  <p className="text-[9.5px] text-slate-300 mb-3 leading-relaxed">
                    Unleashes catastrophic elemental specialty storm across the grid based on active affinity.
                  </p>
                  <button
                    onClick={() => triggerOverseerActiveSkill(selectedTower.id)}
                    className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 text-[10px] tracking-widest uppercase font-black rounded-lg active:scale-95 transition-all shadow-lg hover:brightness-110 cursor-pointer font-mono"
                  >
                    ⭐ ACTIVATE DEITY SPECIALTY (8.0s Cooldown)
                  </button>
                </div>
              )}

              {/* Void Behemoth Finisher */}
              {selectedTower.animalId === 'unrivaled_void_behemoth' && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-pink-950/80 to-purple-950/80 border-2 border-pink-500 shadow-[0_0_25px_rgba(236,72,153,0.35)] text-center">
                  <div className="text-2xl mb-1">🌌</div>
                  <h4 className="text-[11px] font-black uppercase text-pink-300 tracking-[0.2em] mb-1 font-mono">
                    SINGULARITY COLLAPSE READY
                  </h4>
                  <p className="text-[9.5px] text-slate-300 mb-3 leading-relaxed">
                    Fires the Singularity Reality Overwrite. Forcefully pulls ALL enemies on the map right to the Behemoth, trapping them, and dealing 250x colossal dark-matter damage.
                  </p>
                  <button
                    onClick={() => {
                      const res = triggerUnrivaledFinisher(selectedTower.id);
                      if (res && !res.success && res.message) alert(res.message);
                    }}
                    className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-slate-950 text-[10px] tracking-widest uppercase font-black rounded-lg active:scale-95 transition-all shadow-lg hover:brightness-110 cursor-pointer font-mono"
                  >
                    💥 TRIGGER VOID PULL FINISHER
                  </button>
                </div>
              )}

              {/* Solar Phoenix Cosmic Flare */}
              {selectedTower.animalId === 'unrivaled_solar_phoenix' && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/80 to-red-950/80 border-2 border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.35)] text-center">
                  <div className="text-2xl mb-1">☀️</div>
                  <h4 className="text-[11px] font-black uppercase text-amber-300 tracking-[0.2em] mb-1 font-mono">
                    COSMIC FLARE OVERWRITE READY
                  </h4>
                  <p className="text-[9.5px] text-slate-300 mb-3 leading-relaxed">
                    Releases a global radiant wave of orange solar flares. Burns and overwrites ALL enemy matrices with incinerating 250x supernova damage.
                  </p>
                  <button
                    onClick={() => {
                      const res = triggerUnrivaledFinisher(selectedTower.id);
                      if (res && !res.success && res.message) alert(res.message);
                    }}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-slate-950 text-[10px] tracking-widest uppercase font-black rounded-lg active:scale-95 transition-all shadow-lg hover:brightness-110 cursor-pointer font-mono"
                  >
                    🔥 TRIGGER ULTRA COSMIC FLARE
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>
      )}

      {/* ===================== TAB 4: SKINS & TECH LAB ===================== */}
      {sidebarTab === 'skins' && (
        <motion.div
          key="tab-skins"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="space-y-4"
        >
          {selectedTower ? (
            <>
              {/* Titan Defender Modular Upgrades & Variants */}
              {selectedTower.animalId === 'titan_defender' && (
                <div className="space-y-3">
                  {/* Titan Modular System Button */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border-2 border-slate-800 shadow-md text-left">
                    <h4 className="text-[10.5px] font-black uppercase text-cyan-400 tracking-[0.2em] mb-1 font-mono flex items-center gap-1.5 border-b border-white/10 pb-1.5">
                      ⚙️ TITAN MODULAR SYSTEM (12 UPGRADES)
                    </h4>
                    {(selectedTower as any).titanForm === 'form3_multiverse' ? (
                      <div className="p-2 mb-2 rounded bg-purple-950/60 border border-purple-500/30 text-[8.5px] text-purple-200 font-mono">
                        🌌 <strong>FORM 3 ACTIVE:</strong> In Multiverse Watcher form, modular upgrades are bypassed by cosmic singularity powers. Upgrades remain saved for Form 1 &amp; 2.
                      </div>
                    ) : (
                      <p className="text-[8.5px] text-slate-400 leading-normal mb-2.5">
                        Access the retro-cybernetic cockpit grid to customize cores, pulse cannons, laser systems, and shields!
                      </p>
                    )}
                    <button
                      onClick={() => setIsTitanUpgradeModalOpen(true)}
                      className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-[9.5px] tracking-wider uppercase rounded-lg active:scale-95 transition-all shadow-lg shadow-cyan-950/40 border border-cyan-400/30 flex items-center justify-center gap-2 cursor-pointer font-mono"
                    >
                      🛠️ OPEN TITAN UPGRADES PANEL
                    </button>
                  </div>

                  {/* Titan Variants Selector */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-white/10 text-left space-y-2.5">
                    <div className="flex items-center justify-between border-b border-purple-500/20 pb-1.5">
                      <h4 className="text-[10px] font-black uppercase text-purple-400 tracking-[0.2em] font-mono flex items-center gap-1.5">
                        🛡️ TITAN COSMETIC & BATTLE VARIANTS
                      </h4>
                      {(selectedTower as any).titanSkin === 'the_true_defender' && (
                        <span className="text-[8px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-400/40 animate-pulse font-mono">
                          ★ TRUE DEFENDER
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 font-mono">
                      {[
                        { id: 'the_true_defender', label: '🛡️ True Defender', color: 'border-emerald-400 text-emerald-300 bg-emerald-950/40' },
                        { id: 'standard', label: '🤖 Standard', color: 'border-cyan-400 text-cyan-300 bg-cyan-950/40' },
                        { id: 'upgraded_titan_tv_man', label: '📺 TV Man', color: 'border-purple-400 text-purple-300 bg-purple-950/40' },
                        { id: 'upgraded_titan_speakerman', label: '🔊 Speaker Man', color: 'border-red-400 text-red-300 bg-red-950/40' },
                        { id: 'upgraded_titan_cameraman', label: '📷 Camera Man', color: 'border-blue-400 text-blue-300 bg-blue-950/40' },
                        { id: 'titan_drillman', label: '🌀 Drill Man', color: 'border-orange-400 text-orange-300 bg-orange-950/40' },
                        { id: 'titan_clockman', label: '⏳ Clock Man', color: 'border-yellow-400 text-yellow-300 bg-yellow-950/40' },
                      ].map(v => {
                        const isSel = (selectedTower as any).titanSkin === v.id || (!(selectedTower as any).titanSkin && v.id === 'standard');
                        return (
                          <button
                            key={v.id}
                            onClick={() => {
                              setTowers(prev => prev.map(t => t.id === selectedTower.id ? { ...t, titanSkin: v.id as any } : t));
                            }}
                            className={`py-2 px-1.5 rounded-lg text-[8px] tracking-wider uppercase font-black transition-all border cursor-pointer ${
                              isSel ? v.color : 'bg-slate-900 text-slate-500 border-white/5 hover:bg-slate-800'
                            }`}
                          >
                            {v.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Arcane Warper Lab & Skins */}
              {selectedTower.animalId === 'arcane_warper' && (
                <div className="space-y-3">
                  {/* Warper Lab Upgrades */}
                  <div className="p-3.5 rounded-xl bg-slate-950/90 border border-fuchsia-500/40 shadow-[0_0_20px_rgba(217,70,239,0.25)] text-left space-y-2.5">
                    <div className="flex items-center justify-between border-b border-fuchsia-500/20 pb-1.5">
                      <h4 className="text-[10px] font-black uppercase text-fuchsia-300 tracking-[0.2em] font-mono flex items-center gap-1.5">
                        ⚔️ WARPER LAB: SPECIAL UPGRADES
                      </h4>
                      <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-fuchsia-950 text-fuchsia-200 border border-fuchsia-400/40 font-mono">
                        {(selectedTower.warperBladeUpgrade ? 1 : 0) + (selectedTower.warperArmouredTitanUpgrade ? 1 : 0)} / 2 UNLOCKED
                      </span>
                    </div>

                    {/* Blade Upgrade */}
                    <div className="p-2.5 rounded-lg border bg-slate-900/60 border-white/10 text-left">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9.5px] font-black text-fuchsia-200 uppercase font-mono">
                          🗡️ Dual Astral Blades (Dual Range)
                        </span>
                        {selectedTower.warperBladeUpgrade ? (
                          <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-400 font-mono">
                            ✓ ACTIVE
                          </span>
                        ) : (
                          <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                            5M Meat
                          </span>
                        )}
                      </div>
                      {!selectedTower.warperBladeUpgrade ? (
                        <button
                          onClick={() => {
                            const res = upgradeWarperPart(selectedTower.id, 'blade', 5000000);
                            if (res && !res.success && res.message) alert(res.message);
                          }}
                          disabled={gameState.meat < 5000000}
                          className={`w-full py-1.5 px-2 mt-1 rounded-md font-black text-[8.5px] uppercase tracking-wider transition-all cursor-pointer font-mono ${
                            gameState.meat >= 5000000
                              ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-md active:scale-95'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                          }`}
                        >
                          ⚡ Forge Astral Blades (5,000,000 Meat)
                        </button>
                      ) : (
                        <div className="text-[8px] text-fuchsia-300/80 font-mono text-center bg-fuchsia-950/60 py-1 rounded border border-fuchsia-500/20">
                          ✨ Dual-Range Cleave Enabled
                        </div>
                      )}
                    </div>

                    {/* Mecha Armour Upgrade */}
                    <div className="p-2.5 rounded-lg border bg-slate-900/60 border-white/10 text-left">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9.5px] font-black text-cyan-200 uppercase font-mono">
                          🛡️ Armoured Titan Mecha (+2 Cannons)
                        </span>
                        {selectedTower.warperArmouredTitanUpgrade ? (
                          <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400 font-mono">
                            ✓ ACTIVE
                          </span>
                        ) : (
                          <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                            10M Meat
                          </span>
                        )}
                      </div>
                      {!selectedTower.warperArmouredTitanUpgrade ? (
                        <button
                          onClick={() => {
                            const res = upgradeWarperPart(selectedTower.id, 'armoured_titan', 10000000);
                            if (res && !res.success && res.message) alert(res.message);
                          }}
                          disabled={gameState.meat < 10000000}
                          className={`w-full py-1.5 px-2 mt-1 rounded-md font-black text-[8.5px] uppercase tracking-wider transition-all cursor-pointer font-mono ${
                            gameState.meat >= 10000000
                              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md active:scale-95'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                          }`}
                        >
                          🛡️ Equip Mecha Armour (10,000,000 Meat)
                        </button>
                      ) : (
                        <div className="text-[8px] text-cyan-300/80 font-mono text-center bg-cyan-950/60 py-1 rounded border border-cyan-500/20">
                          ⚡ +2 Shoulder Laser Cannons Equipped
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Warper Custom Skins */}
                  <div className="p-3.5 rounded-xl bg-slate-950/90 border border-purple-500/40 text-left space-y-2 font-mono">
                    <div className="flex items-center justify-between border-b border-purple-500/20 pb-1.5">
                      <h4 className="text-[10px] font-black uppercase text-purple-300 tracking-[0.2em]">
                        🎨 WARPER CUSTOM SKINS
                      </h4>
                      <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-900/50 text-purple-200 border border-purple-400/40">
                        {(selectedTower as any).warperSkin || 'standard'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {[
                        { id: 'standard', label: '🌌 Cosmic Void', color: 'border-purple-400 text-purple-200 bg-purple-950/40' },
                        { id: 'void_lord', label: '🩸 Blood Lord', color: 'border-red-400 text-red-200 bg-red-950/40' },
                        { id: 'cyber_matrix', label: '⚡ Cyber Matrix', color: 'border-cyan-400 text-cyan-200 bg-cyan-950/40' },
                        { id: 'celestial_archon', label: '☀️ Archon Gold', color: 'border-amber-400 text-amber-200 bg-amber-950/40' },
                        { id: 'hypernova_eclipse', label: '🌋 Hypernova', color: 'border-orange-400 text-orange-200 bg-orange-950/40' },
                      ].map(s => {
                        const isSel = (selectedTower as any).warperSkin === s.id || (!(selectedTower as any).warperSkin && s.id === 'standard');
                        return (
                          <button
                            key={s.id}
                            onClick={() => {
                              setTowers(prev => prev.map(t => t.id === selectedTower.id ? { ...t, warperSkin: s.id as any } : t));
                            }}
                            className={`py-2 px-1.5 rounded-lg text-[8px] tracking-wider uppercase font-black transition-all border cursor-pointer ${
                              isSel ? s.color : 'bg-slate-900 text-slate-500 border-white/5 hover:bg-slate-800'
                            }`}
                          >
                            {s.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Elemental Deity 12 Affinities */}
              {(selectedTower.animalId === 'elemental_god' || selectedTower.animalId.endsWith('_deity')) && (
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-indigo-500/30 text-left space-y-3 font-mono">
                  <h4 className="text-[10.5px] font-black uppercase text-indigo-300 tracking-[0.2em] flex items-center gap-1.5">
                    🌟 SELECT DEITY AFFINITY (12 ELEMENTS)
                  </h4>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                    {[
                      { id: 'fire', emoji: '🔥', label: 'Fire', color: 'hover:border-red-500/50 bg-red-950/20 text-red-400 border-red-500/20' },
                      { id: 'poison', emoji: '🧪', label: 'Poison', color: 'hover:border-emerald-500/50 bg-emerald-950/20 text-emerald-400 border-emerald-500/20' },
                      { id: 'water', emoji: '💧', label: 'Water', color: 'hover:border-blue-500/50 bg-blue-950/20 text-blue-400 border-blue-500/20' },
                      { id: 'sand', emoji: '⏳', label: 'Sand', color: 'hover:border-amber-600/50 bg-amber-950/10 text-amber-500 border-amber-500/20' },
                      { id: 'dirt', emoji: '🪵', label: 'Earth', color: 'hover:border-amber-800/50 bg-amber-950/30 text-amber-700 border-amber-700/20' },
                      { id: 'ice', emoji: '❄️', label: 'Ice', color: 'hover:border-cyan-500/50 bg-cyan-950/20 text-cyan-400 border-cyan-500/20' },
                      { id: 'wind', emoji: '🌀', label: 'Wind', color: 'hover:border-stone-400/50 bg-stone-950/20 text-stone-400 border-stone-500/20' },
                      { id: 'lightning', emoji: '⚡', label: 'Thunder', color: 'hover:border-yellow-500/50 bg-yellow-950/20 text-yellow-400 border-yellow-500/20' },
                      { id: 'light', emoji: '🌟', label: 'Light', color: 'hover:border-amber-400/50 bg-amber-950/20 text-amber-300 border-amber-400/20' },
                      { id: 'shadow', emoji: '🌌', label: 'Shadow', color: 'hover:border-purple-500/50 bg-purple-950/20 text-purple-400 border-purple-500/20' },
                      { id: 'magma', emoji: '🌋', label: 'Magma', color: 'hover:border-orange-500/50 bg-orange-950/20 text-orange-400 border-orange-500/20' },
                      { id: 'cosmos', emoji: '✨', label: 'Cosmos', color: 'hover:border-pink-500/50 bg-pink-950/20 text-pink-400 border-pink-500/20' },
                    ].map((el, idx) => {
                      const isSelected = (selectedTower as any).element === el.id || (!(selectedTower as any).element && el.id === 'fire');
                      return (
                        <button
                          key={`tower-elem-${el.id}-${idx}`}
                          onClick={() => changeTowerElement(selectedTower.id, el.id as any)}
                          className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all active:scale-95 text-center cursor-pointer ${
                            isSelected 
                            ? 'bg-indigo-500 border-indigo-400 text-slate-950 font-black shadow-[0_0_12px_rgba(99,102,241,0.5)] scale-105'
                            : el.color
                          }`}
                        >
                          <span className="text-lg">{el.emoji}</span>
                          <span className="text-[8px] font-bold uppercase tracking-wider mt-0.5">{el.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => changeAllDeitiesElement((selectedTower as any).element || 'fire')}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-[9.5px] uppercase tracking-wider rounded-lg active:scale-95 transition-all shadow-md cursor-pointer"
                  >
                    🌀 SYNC ALL DEITIES TO CURRENT AFFINITY
                  </button>
                </div>
              )}

              {/* Generic Units without dedicated skins */}
              {selectedTower.animalId !== 'titan_defender' && 
               selectedTower.animalId !== 'arcane_warper' && 
               selectedTower.animalId !== 'elemental_god' && 
               !selectedTower.animalId.endsWith('_deity') && (
                <div className="p-4 bg-slate-900/60 rounded-xl border border-white/5 text-center space-y-2 font-mono">
                  <Palette size={20} className="mx-auto text-slate-500" />
                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Default Genetic Chassis</div>
                  <p className="text-[9px] text-slate-500 leading-relaxed">
                    This unit operates on its standard species genome profile. Custom skins and modular tech frames are unlocked for Titan, Arcane Warper, and Deity units.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="p-4 bg-slate-900/60 rounded-xl border border-white/5 text-center text-slate-400 text-xs">
              Place unit to inspect cosmetic variants and specialized tech.
            </div>
          )}
        </motion.div>
      )}

      {/* ===================== TAB 5: PRIMAL REALM SPECTRUM LORE ===================== */}
      {sidebarTab === 'lore' && (
        <motion.div
          key="tab-lore"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="space-y-4"
        >
          <div className="bg-slate-950/80 p-4 rounded-xl border border-amber-500/20 shadow-xl text-left">
            <h4 className="text-[10.5px] font-black uppercase text-amber-400 tracking-[0.2em] mb-3 flex items-center justify-between font-mono border-b border-amber-500/20 pb-2">
              <span className="flex items-center gap-1.5">🔮 PRIMAL REALM SPECTRUM LORE</span>
            </h4>

            {loreLoading ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <RefreshCw size={24} className="text-amber-400 animate-spin mb-3" />
                <span className="text-[9.5px] font-black uppercase tracking-wider text-amber-300/80 animate-pulse font-mono">
                  Splicing Genetic Lore Vectors...
                </span>
                <p className="text-[8px] text-slate-500 uppercase tracking-tighter mt-1 font-mono">
                  Querying space-time archive via Gemini AI
                </p>
              </div>
            ) : loreCache[currentUnit.id] ? (
              <div className="space-y-3.5">
                {/* Background Story */}
                <div className="space-y-1">
                  <div className="text-[8.5px] font-black uppercase tracking-widest text-amber-500 font-mono">
                    📖 Ancient Legend & Background
                  </div>
                  <p className="text-[11px] text-slate-200 leading-relaxed font-sans bg-slate-900/60 p-3 rounded-lg border border-white/5 shadow-inner italic">
                    "{loreCache[currentUnit.id].background}"
                  </p>
                </div>

                {/* Habitat Sanctuary */}
                <div className="space-y-1 pt-1.5 border-t border-white/5">
                  <div className="text-[8.5px] font-black uppercase tracking-widest text-cyan-400 font-mono">
                    🗺️ Domain & Sanctuary
                  </div>
                  <p className="text-[11px] text-slate-200 leading-relaxed font-sans bg-slate-900/60 p-3 rounded-lg border border-white/5 shadow-inner">
                    {loreCache[currentUnit.id].habitat}
                  </p>
                </div>

                {/* Rarity & Role metadata */}
                <div className="grid grid-cols-2 gap-2 pt-1 text-[8.5px] font-mono uppercase font-bold text-slate-400">
                  <div className="p-2 bg-slate-900/40 rounded border border-white/5">
                    <span className="text-slate-500 block text-[7.5px]">Genetic Rank</span>
                    <span style={{ color: currentUnit.color }} className="font-black">
                      {currentUnit.rarity}
                    </span>
                  </div>
                  <div className="p-2 bg-slate-900/40 rounded border border-white/5">
                    <span className="text-slate-500 block text-[7.5px]">Battle Protocol</span>
                    <span className="text-slate-200 font-black">
                      {currentUnit.role || 'Defender'}
                    </span>
                  </div>
                </div>

                {/* Regeneration trigger */}
                <button
                  onClick={async () => {
                    const aid = currentUnit.id;
                    setLoreCache(prev => {
                      const copy = { ...prev };
                      delete copy[aid];
                      return copy;
                    });
                    await fetchLore(currentUnit);
                  }}
                  className="w-full mt-1 py-2.5 bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 hover:text-white text-[9px] font-black uppercase tracking-wider rounded-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer font-mono"
                >
                  🔄 RE-MUTATE LORE WITH GEMINI
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <span className="text-[9.5px] font-black uppercase tracking-wider text-rose-400 mb-1 font-mono">
                  Lore Vector Severed
                </span>
                <p className="text-[8.5px] text-slate-400 font-mono">
                  Could not connect to the space-time archives.
                </p>
                <button
                  onClick={() => fetchLore(currentUnit)}
                  className="mt-3 px-4 py-2 bg-amber-500 text-slate-950 text-[9px] font-black uppercase tracking-wider rounded-lg active:scale-95 cursor-pointer font-mono"
                >
                  Retry Splicing
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ===================== TAB 6: AVIATION & HANGAR ===================== */}
      {sidebarTab === 'hangar' && (
        <motion.div
          key="tab-hangar"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="space-y-4"
        >
          {/* Sky Fight Toggle Module */}
          <div className="bg-slate-950/90 p-4 rounded-xl border border-blue-500/30 shadow-xl text-left">
            <div className="flex items-center justify-between border-b border-blue-500/20 pb-2.5 mb-3">
              <div className="font-mono">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 block">PROTOCOL STATUS</span>
                <span className="text-xs font-black text-white uppercase">🌌 SKY FIGHT MODE</span>
              </div>
              <button
                onClick={() => {
                  setGameState((prev: any) => {
                    const nextVal = !(prev.isSkyMode || prev.skyFightEnabled);
                    return {
                      ...prev,
                      isSkyMode: nextVal,
                      skyFightEnabled: nextVal,
                      skyFightScore: prev.skyFightScore || 0
                    };
                  });
                }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-black uppercase transition-all duration-300 shadow cursor-pointer border ${
                  (gameState.isSkyMode || gameState.skyFightEnabled)
                    ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.4)] animate-pulse'
                    : 'bg-slate-900 text-slate-400 border-white/5 hover:text-white'
                }`}
              >
                {(gameState.isSkyMode || gameState.skyFightEnabled) ? '🚀 ACTIVE' : '🔒 OFF'}
              </button>
            </div>
            
            <p className="text-[10.5px] text-slate-300 leading-relaxed font-sans mb-2">
              Activates high-altitude aerial operations! Airborne hunters will invade the map from above. In Sky Mode, <span className="text-cyan-400 font-bold">all towers are required to fly to attack</span>. Equip aircrafts or deploy native fliers like the <span className="text-purple-400 font-bold">Arcane Warper</span>.
            </p>
            {(gameState.isSkyMode || gameState.skyFightEnabled) && (
              <div className="flex items-center gap-2 bg-cyan-950/40 p-2 rounded-lg border border-cyan-500/20 mt-1">
                <span className="text-xs animate-spin">🌀</span>
                <span className="text-[8.5px] font-mono uppercase text-cyan-400 font-bold">
                  Sky Combat Enforced: Units must fly to attack • +35% Bonus Wave DNA
                </span>
              </div>
            )}
          </div>

          {/* Active Placed Tower Aircraft Configurator */}
          {selectedTower ? (() => {
            const equippedId = selectedTower.aircraftId || 'none';
            const isTitan = selectedTower.animalId === 'titan_defender';
            const isElemental = selectedTower.animalId === 'elemental_god';
            const isOverseer = selectedTower.animalId === 'all_seeing_overseer';
            const isWarper = selectedTower.animalId === 'arcane_warper';
            
            // Filter compatible aircrafts
            const compatibleAircrafts = AIRCRAFTS.filter(ac => {
              if (isTitan) return ac.isExclusiveTo?.includes('titan_defender');
              if (isElemental) {
                return ac.isExclusiveTo?.includes('elemental_god') || ac.isExclusiveTo?.some(id => id.startsWith('elemental_god'));
              }
              if (isOverseer) return ac.isExclusiveTo?.includes('all_seeing_overseer');
              if (isWarper) return ac.id === 'stealth_jet';
              
              // Standard beasts get standard aircrafts
              return ['propeller_plane', 'jetpack', 'stealth_jet', 'cosmic_carrier'].includes(ac.id);
            });

            return (
              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-white/10 text-left">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2 mb-3">
                  <span className="text-sm">🛩️</span>
                  <div>
                    <h5 className="text-[10px] font-black uppercase text-slate-400 font-mono">Hangar Configurator</h5>
                    <p className="text-[9px] text-slate-500 font-mono">EQUIPPING: {selectedTowerAnimal?.name || 'Animal'}</p>
                  </div>
                </div>

                {isWarper && (
                  <div className="bg-purple-950/30 border border-purple-500/20 p-2.5 rounded-lg mb-3 text-[10px] text-purple-200 leading-normal">
                    ✨ <strong className="text-purple-300">Arcane Portal Flight</strong>: As an ancient void entity, the Arcane Warper floats natively in the clouds (no jetpack required) and can target air and ground targets alike. You can still purchase the Stealth Jet to amplify its combat potential!
                  </div>
                )}

                {/* Dismount Panel */}
                {equippedId !== 'none' && (
                  <div className="p-2.5 rounded-lg border border-red-500/20 bg-red-950/10 mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base shrink-0">❌</span>
                      <div>
                        <div className="text-[10px] font-black text-red-400 font-mono">Dismount Mounted Aircraft</div>
                        <p className="text-[8.5px] text-slate-400">Remove equipped flight drives and return this unit to ground operations.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setTowers((prev: any) => prev.map((t: any) => {
                          if (t.id === selectedTower.id) {
                            return {
                              ...t,
                              aircraftId: 'none',
                              isFlying: isWarper // Warper is naturally flying
                            };
                          }
                          return t;
                        }));
                      }}
                      className="px-2.5 py-1.5 rounded font-mono text-[9px] uppercase font-black bg-red-900/30 hover:bg-red-900/50 border border-red-500/30 text-red-200 active:scale-95 cursor-pointer"
                    >
                      Dismount
                    </button>
                  </div>
                )}

                <div className="space-y-2.5">
                  {compatibleAircrafts.map(ac => {
                    const isEquipped = equippedId === ac.id;
                    const canAfford = gameState.dna >= ac.costDna;
                    
                    return (
                      <div
                        key={ac.id}
                        className={`p-2.5 rounded-lg border transition-all relative ${
                          isEquipped
                            ? 'bg-slate-900/95 border-cyan-500/80 shadow-[0_0_8px_rgba(6,182,212,0.15)]'
                            : 'bg-slate-900/40 border-white/5 hover:border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-base shrink-0">{ac.emoji}</span>
                            <div>
                              <div className="text-[10px] font-black text-white font-mono flex items-center gap-1.5">
                                {ac.name}
                                {isEquipped && (
                                  <span className="text-[7.5px] font-mono px-1 bg-cyan-500/20 text-cyan-400 rounded uppercase font-bold border border-cyan-400/20">
                                    Equipped
                                  </span>
                                )}
                              </div>
                              <p className="text-[8.5px] text-slate-400 mt-0.5 max-w-[200px] leading-relaxed">
                                {ac.description}
                              </p>
                              <div className="text-[8px] font-mono text-green-400 font-bold mt-1 uppercase flex gap-2">
                                {ac.damageBonus > 0 && <span>⚔️ +{(ac.damageBonus * 100).toFixed(0)}% Dmg</span>}
                                {ac.rangeBonus > 0 && <span>🎯 +{(ac.rangeBonus * 100).toFixed(0)}% Rng</span>}
                                {ac.speedBonus > 0 && <span>⚡ +{(ac.speedBonus * 100).toFixed(0)}% Spd</span>}
                              </div>
                            </div>
                          </div>

                          <button
                            disabled={isEquipped}
                            onClick={() => {
                              if (isEquipped) return;
                              if (!canAfford) return;
                              
                              // Deduct DNA and update tower
                              setGameState((prev: any) => ({
                                ...prev,
                                dna: prev.dna - ac.costDna
                              }));
                              
                              setTowers((prev: any) => prev.map((t: any) => {
                                if (t.id === selectedTower.id) {
                                  return {
                                    ...t,
                                    aircraftId: ac.id,
                                    isFlying: true
                                  };
                                }
                                return t;
                              }));
                            }}
                            className={`px-2.5 py-1.5 rounded font-mono text-[9px] uppercase font-black transition-all cursor-pointer ${
                              isEquipped
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                : canAfford
                                  ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 active:scale-95'
                                  : 'bg-slate-900 text-slate-500 border border-white/5 cursor-not-allowed'
                            }`}
                          >
                            {isEquipped ? 'Active' : `${ac.costDna} DNA`}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })() : (
            <div className="p-4 bg-slate-950/60 rounded-xl border border-white/5 text-center text-slate-400 text-xs">
              Place or select an active animal tower on the battlefield to configure custom military aviation aircrafts!
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default UnitProfilePanel;
