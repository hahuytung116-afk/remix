import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Shield, Check, Lock, Star, Sparkles, X, ChevronRight, Zap, Flame, Trophy } from 'lucide-react';
import { BADGES, getBadgeProgress, getActiveBadge, getUniqueUnlockedBadges } from '../badges';
import { Badge, GameState, TowerInstance } from '../types';

interface BadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  towers: TowerInstance[];
}

export const BadgesModal: React.FC<BadgesModalProps> = ({
  isOpen,
  onClose,
  gameState,
  setGameState,
  towers
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterUnlockedOnly, setFilterUnlockedOnly] = useState<boolean>(false);
  const [selectedBadgeDetail, setSelectedBadgeDetail] = useState<Badge | null>(null);

  if (!isOpen) return null;

  const unlockedList = getUniqueUnlockedBadges(gameState);
  const unlockedSet = new Set(unlockedList);

  const activeBadge = getActiveBadge(gameState);

  const categories = [
    { id: 'all', label: 'All Titles', icon: '🌟' },
    { id: 'boss', label: 'Boss Raids', icon: '👑' },
    { id: 'mode', label: 'Game Modes', icon: '🔥' },
    { id: 'dimension', label: 'Dimensions', icon: '🌌' },
    { id: 'mastery', label: 'Mastery', icon: '🏆' },
    { id: 'economy', label: 'Economy', icon: '💰' },
    { id: 'special', label: 'Special Feats', icon: '✨' },
  ];

  const filteredBadges = BADGES.filter(b => {
    if (selectedCategory !== 'all' && b.category !== selectedCategory) return false;
    if (filterUnlockedOnly && !unlockedSet.has(b.id)) return false;
    return true;
  });

  const totalUnlockedCount = BADGES.filter(b => unlockedSet.has(b.id)).length;
  const progressPercent = Math.round((totalUnlockedCount / BADGES.length) * 100);

  const handleEquip = (badgeId: string) => {
    if (!unlockedSet.has(badgeId)) return;
    setGameState(prev => ({
      ...prev,
      activeBadgeId: badgeId,
    }));
  };

  const handleUnequip = () => {
    setGameState(prev => ({
      ...prev,
      activeBadgeId: undefined,
    }));
  };

  const handleClearGodSlayerTags = () => {
    setGameState(prev => ({
      ...prev,
      ultraBossSlayer: false,
      ultraBossKills: 0,
      activeBadgeId: prev.activeBadgeId === 'god_slayer' ? undefined : prev.activeBadgeId,
      unlockedBadges: (prev.unlockedBadges || []).filter(b => b !== 'god_slayer')
    }));
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-purple-600 p-[1px] shadow-[0_0_20px_rgba(234,179,8,0.3)]">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center text-xl">
                🎖️
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                  Badges & Title Hall
                </h2>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  {totalUnlockedCount} / {BADGES.length} Unlocked ({progressPercent}%)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Unlock commemorative titles, prestige honorifics & permanent gameplay perks
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* CURRENT EQUIPPED TITLE BANNER */}
        <div className="p-4 bg-gradient-to-r from-slate-950 via-purple-950/20 to-slate-950 border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs uppercase font-bold tracking-widest text-slate-400">Equipped Title:</span>
            {activeBadge ? (
              <div className={`px-3 py-1 rounded-lg border flex items-center gap-2 ${activeBadge.borderClass} bg-slate-950`}>
                <span className="text-base">{activeBadge.icon}</span>
                <span className={`text-xs font-black tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r ${activeBadge.gradientClass}`}>
                  {activeBadge.title}
                </span>
                <span className="text-[9px] bg-white/10 text-slate-300 px-1.5 py-0.2 rounded font-bold uppercase">
                  {activeBadge.rarity}
                </span>
              </div>
            ) : (
              <span className="text-xs text-slate-500 italic">No Title Equipped (Select one below)</span>
            )}
          </div>

          {activeBadge ? (
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <Sparkles size={11} /> Perk: {activeBadge.bonusDescription}
              </span>
              <button
                onClick={handleUnequip}
                className="text-[10px] font-bold text-slate-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 px-2 py-1 rounded border border-white/10 transition-colors"
              >
                Unequip
              </button>
            </div>
          ) : (
            <span className="text-[11px] text-slate-400">Equip an unlocked title to activate its special perk!</span>
          )}
        </div>

        {/* CATEGORY TABS & FILTER BAR */}
        <div className="p-3 bg-slate-950/30 border-b border-white/5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={`badge-cat-${cat.id}`}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filterUnlockedOnly}
              onChange={e => setFilterUnlockedOnly(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-purple-600 focus:ring-0 cursor-pointer"
            />
            <span>Show Unlocked Only</span>
          </label>
        </div>

        {/* BADGES GRID */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredBadges.map((badge, idx) => {
              const isUnlocked = unlockedSet.has(badge.id);
              const isEquipped = activeBadge?.id === badge.id;
              const progress = getBadgeProgress(badge.id, gameState, towers);

              return (
                <div
                  key={`badge-item-${badge.id}-${idx}`}
                  className={`relative p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                    isUnlocked
                      ? isEquipped
                        ? `${badge.borderClass} bg-slate-950/90 ring-2 ring-purple-500/50`
                        : 'border-white/10 bg-slate-950/60 hover:border-white/20'
                      : 'border-white/5 bg-slate-950/30 opacity-75 hover:opacity-90'
                  }`}
                >
                  {/* TOP ROW: Icon, Title & Rarity */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border ${
                        isUnlocked
                          ? 'bg-slate-900 border-white/20 shadow-md'
                          : 'bg-slate-900/60 border-white/5 text-slate-600'
                      }`}>
                        {isUnlocked ? badge.icon : <Lock size={20} className="text-slate-600" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className={`text-sm font-black tracking-wide uppercase ${
                            isUnlocked ? 'text-white' : 'text-slate-400'
                          }`}>
                            {badge.name}
                          </h3>
                          <span
                            className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded border"
                            style={{
                              color: badge.badgeColor,
                              borderColor: `${badge.badgeColor}40`,
                              backgroundColor: `${badge.badgeColor}15`
                            }}
                          >
                            {badge.rarity}
                          </span>
                        </div>
                        <div className={`text-xs font-bold tracking-wide mt-0.5 ${
                          isUnlocked
                            ? `text-transparent bg-clip-text bg-gradient-to-r ${badge.gradientClass}`
                            : 'text-slate-500'
                        }`}>
                          {badge.title}
                        </div>
                      </div>
                    </div>

                    {/* STATUS PILL */}
                    {isUnlocked ? (
                      isEquipped ? (
                        <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded-full font-black uppercase flex items-center gap-1">
                          <Check size={11} /> Equipped
                        </span>
                      ) : (
                        <button
                          onClick={() => handleEquip(badge.id)}
                          className="text-[10px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-lg font-black uppercase transition-all cursor-pointer active:scale-95 flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                        >
                          <Star size={11} className="fill-emerald-300" /> Equip Title
                        </button>
                      )
                    ) : (
                      <span className="text-[10px] bg-slate-800 text-slate-500 border border-slate-700 px-2 py-0.5 rounded-full font-bold uppercase flex items-center gap-1">
                        <Lock size={10} /> Locked
                      </span>
                    )}
                  </div>

                  {/* MIDDLE: Description & Requirement */}
                  <div className="space-y-1.5">
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {badge.description}
                    </p>

                    <div className="bg-slate-900/90 border border-white/5 rounded-lg p-2 text-[11px] flex flex-col gap-1">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="font-semibold text-slate-300">How to Obtain:</span>
                        <span className="text-slate-400 font-mono text-[10px]">{progress.text}</span>
                      </div>
                      <p className="text-slate-400 text-[10.5px]">
                        {badge.requirement}
                      </p>

                      {/* Progress Bar for Locked Badges */}
                      {!isUnlocked && (
                        <div className="w-full bg-slate-950 rounded-full h-1.5 mt-1 overflow-hidden border border-white/5">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-300"
                            style={{ width: `${Math.min(100, Math.round((progress.current / progress.max) * 100))}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* BOTTOM: Perk info */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px]">
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Sparkles size={11} /> Perk: {badge.bonusDescription}
                    </span>
                    {isUnlocked && !isEquipped && (
                      <span className="text-slate-500 text-[9px] uppercase tracking-wider">Click Equip to wear</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredBadges.length === 0 && (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <Trophy size={36} className="mx-auto opacity-30" />
              <p className="text-sm font-semibold">No titles found in this category.</p>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-3.5 bg-slate-950/80 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>✨ Titles displayed in top bar, multiplayer clash, and trade profiles</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors cursor-pointer"
          >
            Close Hall
          </button>
        </div>
      </motion.div>
    </div>
  );
};
