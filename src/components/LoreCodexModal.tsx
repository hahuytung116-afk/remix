import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  BookOpen, 
  Scroll, 
  Sparkles, 
  Lock, 
  Unlock, 
  ShieldAlert, 
  Zap, 
  Trophy, 
  Search,
  ChevronRight,
  ListFilter
} from 'lucide-react';
import { GameState } from '../types';
import { 
  LORE_SAGAS, 
  getLoreWaveData, 
  ANIMAL_LORE_UNLOCKS, 
  ANIMAL_UNLOCK_WAVE_MAP,
  getUnlockedAnimalsForLoreWave
} from '../data/loreCampaign';
import { ANIMALS } from '../constants';

interface LoreCodexModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
}

export const LoreCodexModal: React.FC<LoreCodexModalProps> = ({
  isOpen,
  onClose,
  gameState
}) => {
  const [activeTab, setActiveTab] = useState<'codex' | 'unlocks'>('codex');
  const [selectedSaga, setSelectedSaga] = useState<number>(1);
  const [selectedWave, setSelectedWave] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const highestWave = Math.max(1, gameState.highestLoreWave || (gameState.isLoreMode ? gameState.wave : 1));

  if (!isOpen) return null;

  // Compute waves for selected saga
  const sagaRange = [
    { saga: 1, start: 1, end: 40 },
    { saga: 2, start: 41, end: 80 },
    { saga: 3, start: 81, end: 120 },
    { saga: 4, start: 121, end: 160 },
    { saga: 5, start: 161, end: 200 },
    { saga: 6, start: 201, end: 250 },
    { saga: 7, start: 251, end: 300 },
    { saga: 8, start: 301, end: 350 },
    { saga: 9, start: 351, end: 380 },
    { saga: 10, start: 381, end: 400 }
  ];

  const currentSagaDef = sagaRange.find(s => s.saga === selectedSaga) || sagaRange[0];
  const sagaWaves: number[] = [];
  for (let w = currentSagaDef.start; w <= currentSagaDef.end; w++) {
    sagaWaves.push(w);
  }

  const selectedWaveData = getLoreWaveData(selectedWave);
  const isSelectedWaveUnlocked = selectedWave <= highestWave;

  // Unlocked animals list
  const allUnlocksList = Object.entries(ANIMAL_LORE_UNLOCKS)
    .map(([wStr, animalId]) => ({
      wave: parseInt(wStr, 10),
      animalId,
      animal: ANIMALS.find(a => a.id === animalId)
    }))
    .filter(item => !!item.animal)
    .sort((a, b) => a.wave - b.wave);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-5xl max-h-[92vh] bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 bg-slate-950/90 border-b border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-md">
              <BookOpen size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-wide flex items-center gap-2">
                MULTIVERSE LORE CODEX
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-400 text-cyan-300 font-extrabold uppercase tracking-widest">
                  400 WAVES ARCHIVE
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Highest Cleared Lore Wave: <span className="text-cyan-400 font-bold">Wave {highestWave} / 400</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Tabs */}
            <div className="flex bg-slate-950 p-0.5 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('codex')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === 'codex' 
                    ? 'bg-cyan-500 text-slate-950 shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Wave Lore (1-400)
              </button>
              <button
                onClick={() => setActiveTab('unlocks')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === 'unlocks' 
                    ? 'bg-cyan-500 text-slate-950 shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Animal Unlocks
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {activeTab === 'codex' ? (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left Sidebar: Saga Selector */}
            <div className="w-full md:w-64 bg-slate-950/60 border-r border-slate-800 flex flex-col p-3 overflow-y-auto space-y-1.5 flex-shrink-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 py-1">
                LORE SAGAS (10 SAGAS)
              </span>
              {LORE_SAGAS.map(saga => {
                const isSelected = selectedSaga === saga.id;
                const sagaDef = sagaRange.find(s => s.saga === saga.id)!;
                const isUnlocked = highestWave >= sagaDef.start;

                return (
                  <button
                    key={`saga-btn-${saga.id}`}
                    onClick={() => {
                      setSelectedSaga(saga.id);
                      setSelectedWave(sagaDef.start);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-md'
                        : 'bg-slate-900/40 border-slate-800/80 text-slate-300 hover:bg-slate-800/50'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <span style={{ color: saga.color }}>●</span>
                        <span>{saga.name.split(':')[0]}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {saga.waveRange}
                      </div>
                    </div>

                    <div>
                      {isUnlocked ? (
                        <Unlock size={13} className="text-cyan-400" />
                      ) : (
                        <Lock size={13} className="text-slate-500" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Middle Column: Waves Grid */}
            <div className="w-full md:w-64 bg-slate-950/40 border-r border-slate-800 flex flex-col p-3 overflow-y-auto flex-shrink-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 py-1 mb-2">
                SAGA {selectedSaga} WAVES ({sagaWaves.length})
              </span>

              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 gap-1.5">
                {sagaWaves.map(w => {
                  const isUnlocked = w <= highestWave;
                  const isSelected = w === selectedWave;
                  const hasUnlock = !!ANIMAL_LORE_UNLOCKS[w];
                  const isBoss = w % 5 === 0;

                  return (
                    <button
                      key={`wave-grid-btn-${w}`}
                      onClick={() => setSelectedWave(w)}
                      className={`p-2 rounded-lg font-black text-xs transition-all cursor-pointer flex flex-col items-center justify-center relative border ${
                        isSelected
                          ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.5)] scale-105 z-10'
                          : isUnlocked
                            ? (isBoss 
                                ? 'bg-red-950/60 border-red-500/40 text-red-200 hover:bg-red-900/60'
                                : 'bg-slate-900/80 border-slate-800 text-slate-200 hover:bg-slate-800')
                            : 'bg-slate-950/50 border-slate-900 text-slate-600'
                      }`}
                    >
                      <span>{w}</span>
                      {hasUnlock && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute top-1 right-1" title="Animal Unlock Wave" />
                      )}
                      {isBoss && (
                        <span className="text-[7.5px] font-extrabold uppercase text-red-400 leading-none mt-0.5">BOSS</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Selected Wave Lore Inspector */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-900/50">
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                    {selectedWaveData.sagaTitle}
                  </div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    {selectedWaveData.chapterTitle}
                    {selectedWaveData.bossTitle && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-red-950 border border-red-500 text-red-300 uppercase">
                        {selectedWaveData.bossTitle}
                      </span>
                    )}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {isSelectedWaveUnlocked ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                      <Unlock size={11} /> Unlocked in Campaign
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-400 text-[10px] font-bold flex items-center gap-1">
                      <Lock size={11} /> Locked (Clear Wave {selectedWave})
                    </span>
                  )}
                </div>
              </div>

              {/* Speaker Card */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl border border-white/20 shadow-md"
                  style={{ backgroundColor: `${selectedWaveData.speakerColor}22` }}
                >
                  {selectedWaveData.speakerEmoji}
                </div>
                <div>
                  <div className="text-sm font-black text-white" style={{ color: selectedWaveData.speakerColor }}>
                    {selectedWaveData.speaker}
                  </div>
                  <div className="text-xs text-slate-400 font-medium">
                    {selectedWaveData.speakerTitle}
                  </div>
                </div>
              </div>

              {/* Dialogue Transcript */}
              <div className="bg-cyan-950/20 border border-cyan-500/20 rounded-xl p-3.5 space-y-1">
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1">
                  <Sparkles size={11} /> IN-WAVE DIALOGUE
                </span>
                <p className="text-xs text-slate-200 font-medium italic">
                  "{selectedWaveData.dialogue}"
                </p>
              </div>

              {/* Historical Lore Piece */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                  <Scroll size={12} className="text-cyan-400" /> HISTORICAL ARCHIVE CHRONICLE
                </span>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {selectedWaveData.lorePiece}
                </p>
              </div>

              {/* Unlocked Animal at this wave if any */}
              {selectedWaveData.unlockedAnimalId && (
                <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const animal = ANIMALS.find(a => a.id === selectedWaveData.unlockedAnimalId);
                      if (!animal) return null;
                      return (
                        <>
                          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-xl">
                            {animal.emoji}
                          </div>
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-wider text-amber-400 block">
                              🔓 REWARD UNLOCK FOR WAVE {selectedWave}
                            </span>
                            <span className="text-xs font-black text-white">
                              {animal.name} ({animal.rarity})
                            </span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Unlocks Timeline Tab */
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-950/40">
            <div className="bg-cyan-950/30 border border-cyan-500/30 rounded-xl p-3 text-xs text-cyan-200">
              <span className="font-bold text-cyan-300 block mb-1">PROGRESIVE RECRUITMENT TIMELINE</span>
              In Lore Chronicles Mode, animals unlock step-by-step as you clear campaign waves. Higher tier and divine constructs (such as The Archon Overseer and Armored Titan) unlock in high endgame waves!
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {allUnlocksList.map(item => {
                const isUnlocked = highestWave >= item.wave;
                const animal = item.animal!;

                return (
                  <div 
                    key={`unlock-card-${item.animalId}`}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                      isUnlocked 
                        ? 'bg-slate-900/90 border-cyan-500/40 shadow-sm' 
                        : 'bg-slate-950/40 border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl">
                        {animal.emoji}
                      </div>
                      <div>
                        <div className="text-xs font-black text-white flex items-center gap-1">
                          {animal.name}
                        </div>
                        <div className="text-[10px] text-cyan-400 font-bold">
                          {animal.rarity}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-black uppercase text-slate-400 block">
                        Unlocks at
                      </span>
                      <span className={`text-xs font-black ${isUnlocked ? 'text-emerald-400' : 'text-amber-400'}`}>
                        Wave {item.wave}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
