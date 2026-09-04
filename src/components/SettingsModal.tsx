import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Settings, Volume2, VolumeX, Grid, Zap, Trash2, Eye, FolderClosed, Play, Copy, Film, Crosshair, Gamepad2, ArrowRight, Bell, BellOff } from 'lucide-react';
import { GameState } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  resetGame: () => void;
  activeSlot: string;
  changeSlot: (slot: string) => void;
  clearSlot: (slot: string) => void;
  cloneSlot: (fromSlot: string, toSlot: string) => void;
  onOpenGameModes?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  gameState,
  setGameState,
  resetGame,
  activeSlot,
  changeSlot,
  clearSlot,
  cloneSlot,
  onOpenGameModes,
}) => {
  const getSlotStats = (slot: string) => {
    try {
      const dataStr = localStorage.getItem(`primal_defense_slot_${slot}`);
      if (!dataStr) return null;
      const parsed = JSON.parse(dataStr);
      return {
        wave: parsed.wave ?? 0,
        dna: parsed.dna ?? 0,
        meat: parsed.meat ?? 0,
        stage: parsed.currentStage ?? 'default',
        towersCount: Array.isArray(parsed.towers) ? parsed.towers.length : 0,
        genomesCount: Array.isArray(parsed.summonedAnimals) ? parsed.summonedAnimals.length : 0,
        savedAt: parsed.savedAt ? new Date(parsed.savedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Unknown'
      };
    } catch {
      return null;
    }
  };

  const setGameSpeed = (speed: number) => {
    setGameState(prev => ({ ...prev, gameSpeed: speed }));
  };

  const toggleGrid = () => {
    setGameState(prev => ({ ...prev, showGrid: !prev.showGrid }));
  };

  const toggleTacticalMode = () => {
    setGameState(prev => {
      const nextVal = !prev.tacticalMode;
      try {
        localStorage.setItem('primal_tactical_mode', String(nextVal));
      } catch {}
      return { ...prev, tacticalMode: nextVal };
    });
  };

  const toggleSound = () => {
    setGameState(prev => ({ ...prev, soundEffectsEnabled: !prev.soundEffectsEnabled }));
  };

  const toggleAmbientAudio = () => {
    setGameState(prev => ({ ...prev, ambientAudioEnabled: !prev.ambientAudioEnabled }));
  };

  const toggleGlobalMute = () => {
    setGameState(prev => ({ ...prev, globalMute: !prev.globalMute }));
  };

  const toggleScreenShake = () => {
    setGameState(prev => ({ ...prev, screenShakeEnabled: !prev.screenShakeEnabled }));
  };

  const toggleSummonCutscene = () => {
    setGameState(prev => ({ ...prev, disableSummonCutscene: !prev.disableSummonCutscene }));
  };

  const toggleAllNotifications = () => {
    setGameState(prev => ({ ...prev, disableAllNotifications: !prev.disableAllNotifications }));
  };

  const toggleVFX = () => {
    setGameState(prev => {
      if (!prev.disableVFX && !prev.ultraLagReduce) {
        return { ...prev, disableVFX: true, ultraLagReduce: false };
      } else if (prev.disableVFX && !prev.ultraLagReduce) {
        return { ...prev, disableVFX: true, ultraLagReduce: true };
      } else {
        return { ...prev, disableVFX: false, ultraLagReduce: false };
      }
    });
  };

  const confirmReset = () => {
    if (confirm("Are you absolutely sure you want to WIPE all your saved DNA, Meat, and unlocked animal collections? This CANNOT be undone!")) {
      resetGame();
      onClose();
    }
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
            className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col z-10 max-h-[90vh]"
          >
            {/* Holographic Header Decor */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>

            {/* Header */}
            <header className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-950/40">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/30 flex items-center justify-center">
                  <Settings className="text-indigo-400 animate-spin-slow" size={20} />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase text-white tracking-widest">System & Save Profiles</h2>
                  <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest">STORAGE SLOTS & HARDWARE ENGINE</p>
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

              {/* GAME MODES LAUNCHER BANNER */}
              {onOpenGameModes && (
                <div 
                  onClick={() => {
                    onClose();
                    onOpenGameModes();
                  }}
                  className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-purple-950/40 to-slate-950/60 border border-cyan-500/40 hover:border-cyan-400 transition-all cursor-pointer group shadow-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 group-hover:scale-110 transition-transform">
                      <Gamepad2 size={20} />
                    </div>
                    <div>
                      <div className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                        Tactical Game Modes Hub
                        <span className="text-[7.5px] px-1.5 py-0.2 rounded bg-cyan-500 text-slate-950 font-black">NEW</span>
                      </div>
                      <p className="text-[8.5px] text-slate-300 mt-0.5">
                        Sky Game Mode (Flight required to attack), Hardcore, Boss Rush, True Hell, and Sudden Death.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] font-black text-cyan-400 group-hover:translate-x-1 transition-transform uppercase">
                    <span>Open</span>
                    <ArrowRight size={13} />
                  </div>
                </div>
              )}
              
              {/* SECTION: SAVE PROFILES & BKP SLOTS */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-950/60 border border-indigo-500/30 space-y-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-indigo-400 tracking-wider flex items-center gap-1.5">
                    <FolderClosed size={16} className="text-indigo-400" /> 💾 COMMAND PROFILES (SAVE SLOTS)
                  </span>
                  <span className="text-[9px] px-2 py-0.5 bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 font-extrabold rounded-md uppercase">
                    AUTO-SAVES SECURED
                  </span>
                </div>
                
                <p className="text-[9.5px] text-slate-400 uppercase leading-normal tracking-tight">
                  Saves are tied to your browser. Use multiple profiles to play alternate strategies or maintain local stage copies.
                </p>

                <div className="space-y-3">
                  {['1', '2', '3'].map((slotId, idx) => {
                    const stats = getSlotStats(slotId);
                    const isActive = activeSlot === slotId;
                    
                    return (
                      <div 
                        key={`profile-slot-${slotId}-${idx}`}
                        className={`p-3.5 rounded-xl border transition-all flex flex-col gap-2.5 ${
                          isActive 
                            ? 'bg-gradient-to-r from-indigo-950/20 to-indigo-900/10 border-indigo-500/60 shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
                            : 'bg-slate-950/30 border-white/5 hover:border-white/10'
                        }`}
                      >
                        {/* Header: Slot Name & Active Tag */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`w-5 h-5 rounded-md flex items-center justify-center font-mono text-[10.5px] font-black ${
                              isActive ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {slotId}
                            </span>
                            <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                              Tactical Command Profile
                            </span>
                          </div>
                          {isActive && (
                            <span className="text-[7.5px] font-black bg-emerald-500/10 border border-emerald-400/30 text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></span> ACTIVE RUN
                            </span>
                          )}
                        </div>

                        {/* Stats Body */}
                        {stats ? (
                          <div className="grid grid-cols-2 gap-y-1.5 gap-x-3 bg-slate-950/50 p-2.5 rounded-lg border border-white/5 font-mono text-[9px] uppercase text-slate-300">
                            <div className="flex justify-between border-b border-white/5 pb-0.5">
                              <span className="text-slate-500 font-sans font-bold">WAVE DETECTED:</span>
                              <span className="text-indigo-400 font-extrabold">{stats.wave}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-0.5">
                              <span className="text-slate-500 font-sans font-bold">GENOMES UNLOCKED:</span>
                              <span className="text-yellow-500 font-extrabold">{stats.genomesCount}</span>
                            </div>
                            <div className="flex justify-between font-mono">
                              <span className="text-slate-500 font-sans font-bold">DNA RESOURCES:</span>
                              <span className="text-cyan-400 font-extrabold">{stats.dna.toLocaleString()} 🧬</span>
                            </div>
                            <div className="flex justify-between font-mono">
                              <span className="text-slate-500 font-sans font-bold">MEAT CRATE:</span>
                              <span className="text-orange-400 font-extrabold">{stats.meat.toLocaleString()} 🍖</span>
                            </div>
                            <div className="col-span-2 flex justify-between border-t border-white/5 pt-1 mt-1 text-[8px] text-slate-500 leading-tight">
                              <span>STAGE: <span className="text-slate-400 font-bold">{stats.stage}</span> • {stats.towersCount} UNITS</span>
                              <span>SYNCED: {stats.savedAt}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="py-4 rounded-lg bg-slate-950/20 border border-white/5 border-dashed flex flex-col items-center justify-center text-center">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">
                              — COMMAND DEPLOYMENT LOG VACANT —
                            </span>
                            <span className="text-[7.5px] text-slate-600 uppercase mt-0.5 font-bold">
                              No previous defenses saved on this profile
                            </span>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5 self-end">
                          {/* Load/Activating Button */}
                          {!isActive && (
                            <button
                              onClick={() => {
                                if (confirm(`Load Tactical Command Profile ${slotId}? Current active progress will be saved to your active slot first.`)) {
                                  changeSlot(slotId);
                                }
                              }}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold uppercase text-[8.5px] rounded-md tracking-wider flex items-center gap-1 transition-all cursor-pointer active:scale-95 shadow-[0_2px_8px_rgba(99,102,241,0.2)]"
                            >
                              <Play size={10} fill="currentColor" /> Load Slot
                            </button>
                          )}

                          {/* Copy/Backup Active save option if this slot is different */}
                          {!isActive && (
                            <button
                              onClick={() => {
                                if (confirm(`Copy all wave states, units, and currencies from slot ${activeSlot} into slot ${slotId}? This will overwrite slot ${slotId}'s current save data!`)) {
                                  cloneSlot(activeSlot, slotId);
                                }
                              }}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 font-extrabold uppercase text-[8.5px] rounded-md border border-white/5 tracking-wider flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                              title="Overwrite this slot with your current active save data as a backup"
                            >
                              <Copy size={10} /> Clone Active Here
                            </button>
                          )}

                          {/* Clear Option */}
                          {stats && (
                            <button
                              onClick={() => {
                                if (confirm(`Are you absolutely sure you want to PURGE Slot ${slotId} data? This will instantly reset this slot's genomes, waves, and power variables!`)) {
                                  clearSlot(slotId);
                                }
                              }}
                              className="p-1 px-1.5 bg-red-950/30 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 rounded-md transition-all cursor-pointer active:scale-95 flex items-center justify-center"
                              title="Purge save data for this profile"
                            >
                              <Trash2 size={10.5} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION: AUDIO SYNTHESIZER CALIBRATION */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/20 to-slate-950/50 border border-indigo-500/20 space-y-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-indigo-500/10 pb-2.5">
                  <span className="text-[11px] font-black uppercase text-indigo-400 tracking-wider flex items-center gap-1.5">
                    <Volume2 size={15} /> SYSTEM AUDIO CONFIG
                  </span>
                  
                  {/* Global Master Mute Toggle */}
                  <div className="flex items-center gap-2">
                    <span className="text-[8.5px] font-black uppercase tracking-wider text-slate-400">
                      MASTER MUTE
                    </span>
                    <button
                      onClick={toggleGlobalMute}
                      className={`w-11 h-5.5 rounded-full p-0.5 transition-all duration-300 flex-shrink-0 flex items-center ${
                        gameState.globalMute ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'bg-indigo-600'
                      }`}
                    >
                      <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-md transition-transform duration-300 flex items-center justify-center ${
                        gameState.globalMute ? 'transform translate-x-5' : 'transform translate-x-0'
                      }`}>
                        {gameState.globalMute ? <VolumeX size={10} className="text-red-500" /> : <Volume2 size={10} className="text-indigo-600" />}
                      </div>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* SFX Button */}
                  <button
                    onClick={toggleSound}
                    disabled={gameState.globalMute}
                    className={`p-3 rounded-xl transition-all border flex flex-col items-center gap-2 cursor-pointer ${
                      gameState.globalMute 
                        ? 'opacity-40 bg-slate-950/10 border-white/5 cursor-not-allowed' 
                        : (gameState.soundEffectsEnabled !== false ? 'bg-indigo-950/20 hover:bg-indigo-950/30 border-indigo-500/30' : 'bg-slate-950/40 hover:bg-slate-950/60 border-white/5')
                    }`}
                  >
                    {gameState.globalMute || gameState.soundEffectsEnabled === false ? (
                      <VolumeX className="text-slate-600" size={18} />
                    ) : (
                      <Volume2 className="text-indigo-400" size={18} />
                    )}
                    <div className="text-center">
                      <div className="text-[9px] font-black text-slate-200 uppercase">SFX Audio</div>
                      <div className="text-[7.5px] font-mono text-slate-500 mt-0.5 uppercase">
                        {gameState.globalMute ? 'MUTED' : (gameState.soundEffectsEnabled !== false ? 'ENABLED' : 'MUTED')}
                      </div>
                    </div>
                  </button>

                  {/* Ambient Background Drone BGM Button */}
                  <button
                    onClick={toggleAmbientAudio}
                    disabled={gameState.globalMute}
                    className={`p-3 rounded-xl transition-all border flex flex-col items-center gap-2 cursor-pointer ${
                      gameState.globalMute 
                        ? 'opacity-40 bg-slate-950/10 border-white/5 cursor-not-allowed' 
                        : (gameState.ambientAudioEnabled !== false ? 'bg-indigo-950/20 hover:bg-indigo-950/30 border-indigo-500/30' : 'bg-slate-950/40 hover:bg-slate-950/60 border-white/5')
                    }`}
                    title="Synthesizes low-volume procedural background drone pads"
                  >
                    {gameState.globalMute || gameState.ambientAudioEnabled === false ? (
                      <VolumeX className="text-slate-600" size={18} />
                    ) : (
                      <div className="relative">
                        <Volume2 className="text-cyan-400" size={18} />
                        <span className="absolute -top-0.5 -right-0.5 flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
                        </span>
                      </div>
                    )}
                    <div className="text-center">
                      <div className="text-[9px] font-black text-slate-200 uppercase">Ambient drone</div>
                      <div className="text-[7.5px] font-mono text-slate-500 mt-0.5 uppercase">
                        {gameState.globalMute ? 'MUTED' : (gameState.ambientAudioEnabled !== false ? 'ACTIVE DETECT' : 'MUTED')}
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* SECTION: ENVIRONMENT DISPLAY & SIM CONFIG */}
              <div className="grid grid-cols-2 gap-3">
                {/* Tactical Heatmap Mode */}
                <button
                  onClick={toggleTacticalMode}
                  className={`p-3 rounded-xl transition-all border flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                    gameState.tacticalMode 
                      ? 'bg-cyan-950/30 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]' 
                      : 'bg-slate-950/40 hover:bg-slate-950/60 border-white/5'
                  }`}
                >
                  <Crosshair className={gameState.tacticalMode ? 'text-cyan-400 animate-pulse' : 'text-slate-600'} size={18} />
                  <span className="text-[9px] font-bold text-slate-200 uppercase">Tactical Mode</span>
                  <span className="text-[7.5px] font-mono text-cyan-400 uppercase font-semibold">
                    {gameState.tacticalMode ? 'ACTIVE (KEY: T)' : 'DISABLED'}
                  </span>
                </button>

                {/* Grid */}
                <button
                  onClick={toggleGrid}
                  className="p-3 rounded-xl bg-slate-950/40 hover:bg-slate-950/60 transition-all border border-white/5 flex flex-col items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Grid className={gameState.showGrid ? 'text-green-400' : 'text-slate-600'} size={18} />
                  <span className="text-[9px] font-bold text-slate-300 uppercase">Grid Overlay</span>
                  <span className="text-[7.5px] font-mono text-slate-500 uppercase">{gameState.showGrid ? 'SHOWN' : 'HIDDEN'}</span>
                </button>

                {/* Screen shake */}
                <button
                  onClick={toggleScreenShake}
                  className="p-3 rounded-xl bg-slate-950/40 hover:bg-slate-950/60 transition-all border border-white/5 flex flex-col items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Zap className={gameState.screenShakeEnabled ? 'text-amber-400' : 'text-slate-600'} size={18} />
                  <span className="text-[9px] font-bold text-slate-300 uppercase">Screen Shake</span>
                  <span className="text-[7.5px] font-mono text-slate-500 uppercase">{gameState.screenShakeEnabled ? 'ACTIVE' : 'DISABLED'}</span>
                </button>

                {/* Summon Cutscene Toggle */}
                <button
                  onClick={toggleSummonCutscene}
                  className="p-3 rounded-xl bg-slate-950/40 hover:bg-slate-950/60 transition-all border border-white/5 flex flex-col items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Film className={!gameState.disableSummonCutscene ? 'text-cyan-400' : 'text-slate-600'} size={18} />
                  <span className="text-[9px] font-bold text-slate-300 uppercase">Summon Cutscenes</span>
                  <span className="text-[7.5px] font-mono text-slate-500 uppercase">{!gameState.disableSummonCutscene ? 'ENABLED' : 'DISABLED'}</span>
                </button>

                {/* Disable All Notifications In Game */}
                <button
                  onClick={toggleAllNotifications}
                  className={`p-3 rounded-xl transition-all border flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                    gameState.disableAllNotifications 
                      ? 'bg-rose-950/30 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.25)]' 
                      : 'bg-slate-950/40 hover:bg-slate-950/60 border-white/5'
                  }`}
                  title="Mutes all in-game toast notifications, unlock alerts, and mastery banners"
                >
                  {gameState.disableAllNotifications ? (
                    <BellOff className="text-rose-400 animate-pulse" size={18} />
                  ) : (
                    <Bell className="text-emerald-400" size={18} />
                  )}
                  <span className="text-[9px] font-bold text-slate-200 uppercase text-center leading-tight">Disable All Notifications</span>
                  <span className={`text-[7.5px] font-mono uppercase font-semibold ${gameState.disableAllNotifications ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {gameState.disableAllNotifications ? 'ALL MUTED (OFF)' : 'ALL ACTIVE (ON)'}
                  </span>
                </button>

                {/* Visual Effects Toggle */}
                <button
                  onClick={toggleVFX}
                  className="p-3 rounded-xl bg-slate-950/40 hover:bg-slate-950/60 transition-all border border-white/5 flex flex-col items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className={gameState.ultraLagReduce ? 'text-rose-500' : (!gameState.disableVFX ? 'text-cyan-400' : 'text-amber-400')} size={18} />
                  <span className="text-[9px] font-bold text-slate-300 uppercase">Visual Effects (VFX)</span>
                  <span className="text-[7.5px] font-mono text-slate-500 uppercase">
                    {gameState.ultraLagReduce 
                      ? 'ULTRA (FASTEST)' 
                      : (!gameState.disableVFX ? 'MAX QUALITY' : 'REDUCED (FAST)')}
                  </span>
                </button>

                {/* Game speed selector */}
                <div className="p-2 rounded-xl bg-slate-950/40 border border-white/5 flex flex-col items-center justify-between gap-1">
                  <span className="text-[9px] font-bold text-slate-300 uppercase flex-shrink-0">Sim Speed</span>
                  <div className="flex bg-slate-900 border border-white/5 p-0.5 rounded-lg w-full">
                    {[1, 1.5, 2, 3].map((speed, idx) => (
                      <button
                        key={`settings-speed-${speed}-${idx}`}
                        onClick={() => setGameSpeed(speed)}
                        className={`flex-1 py-1 text-[7.5px] font-black rounded cursor-pointer ${gameState.gameSpeed === speed ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION: TITLE & BADGE TAGS MANAGEMENT */}
              <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest flex items-center gap-1.5">
                    👑 TITLES & HONORIFIC TAGS
                  </span>
                  {(gameState.ultraBossSlayer || (gameState.ultraBossKills ?? 0) > 0 || gameState.activeBadgeId === 'god_slayer') && (
                    <span className="text-[8px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-black uppercase">
                      God Slayer Active
                    </span>
                  )}
                </div>
                <p className="text-[8.5px] text-slate-400 uppercase leading-snug">
                  Manage or remove equipped badge titles and prestige honorific tags from your header profile.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => {
                      setGameState(prev => ({
                        ...prev,
                        ultraBossSlayer: false,
                        ultraBossKills: 0,
                        activeBadgeId: prev.activeBadgeId === 'god_slayer' ? undefined : prev.activeBadgeId,
                        unlockedBadges: (prev.unlockedBadges || []).filter(b => b !== 'god_slayer')
                      }));
                    }}
                    className="flex-1 py-2 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 font-extrabold rounded-lg transition-all uppercase text-[9px] tracking-wider border border-amber-500/30 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>🗑️</span> Remove God Slayer Tags
                  </button>
                  {gameState.activeBadgeId && (
                    <button
                      onClick={() => {
                        setGameState(prev => ({ ...prev, activeBadgeId: undefined }));
                      }}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold rounded-lg transition-all uppercase text-[9px] tracking-wider border border-white/10 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>✕</span> Unequip Active Title
                    </button>
                  )}
                </div>
              </div>

              {/* SECTION: WIPE CONSOLE COMMAND */}
              <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 space-y-3">
                <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Trash2 size={12} /> NUCLEAR PURGE
                </span>
                <p className="text-[8.5px] text-slate-400 uppercase leading-snug">
                  Wipes your local storage database clean. Unlocks standard genomes and resets all DNA back to baseline values.
                </p>
                <button
                  onClick={confirmReset}
                  className="w-full py-2 bg-red-950/30 hover:bg-red-500/20 text-red-400 font-extrabold rounded-lg transition-all uppercase text-[9px] tracking-wider border border-red-500/20 active:scale-95 cursor-pointer"
                >
                  Confirm Full Factory Reset
                </button>
              </div>

            </div>

            {/* Footer */}
            <footer className="p-6 border-t border-white/10 bg-slate-950/40 flex items-center justify-between">
              <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span> SECURE MATRIX SYSTEMS
              </span>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-slate-800 text-white font-black rounded-xl hover:bg-slate-700 border border-white/10 active:scale-95 transition-all uppercase text-[10px] tracking-widest cursor-pointer"
              >
                Close Settings
              </button>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
