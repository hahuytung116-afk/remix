import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Flame, Dna, Trophy, Sparkles, RefreshCw, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';
import { GameState } from '../types';
import CapybaraAvatar from './CapybaraAvatar';

interface CurrencyConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

// Synthesized cyberpunk sci-fi audio effects using Web Audio API
const playConvertSound = (soundType: 'success' | 'fail' | 'shards', isSoundEnabled: boolean = true) => {
  if (!isSoundEnabled) return;
  try {
    if (typeof window === 'undefined') return;
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    if (soundType === 'success') {
      // DNA Extraction success spark
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (soundType === 'shards') {
      // Divine Cosmic Shard chime melody
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        gain.gain.setValueAtTime(0.06, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.4);
      });
    } else {
      // Heavy defusion/error buzzer
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch (err) {
    console.error('Failed to play synthesized convert audio', err);
  }
};

export const CurrencyConverterModal: React.FC<CurrencyConverterModalProps> = ({
  isOpen,
  onClose,
  gameState,
  setGameState,
}) => {
  const [activeTab, setActiveTab] = useState<'dna' | 'shards' | 'capy'>('dna');
  const [successToast, setSuccessToast] = useState<{ message: string; sub: string } | null>(null);

  // Sound effects helper
  const isSoundEnabled = gameState.soundEffectsEnabled !== false && !gameState.globalMute;

  // Tab 1: MEAT ➔ DNA Conversion
  const meatToDnaRate = 100; // 100 Meat = 1 DNA
  const maxDnaPossible = Math.floor(gameState.meat / meatToDnaRate);
  const [dnaToExtract, setDnaToExtract] = useState<number>(Math.min(10, maxDnaPossible));
  const [dnaInputVal, setDnaInputVal] = useState<string>('10');

  // Update input text when state changes or on load
  useEffect(() => {
    if (activeTab === 'dna') {
      const parsed = parseInt(dnaInputVal, 10);
      if (isNaN(parsed) || parsed !== dnaToExtract) {
        setDnaInputVal(dnaToExtract.toString());
      }
    }
  }, [dnaToExtract, activeTab]);

  // Handle Meat to DNA changes
  const handleDnaSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setDnaToExtract(val);
  };

  const handleDnaInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value;
    setDnaInputVal(valStr);
    const parsed = parseInt(valStr, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      setDnaToExtract(Math.min(maxDnaPossible, parsed));
    }
  };

  const adjustDnaExtract = (amount: number) => {
    setDnaToExtract(prev => Math.max(0, Math.min(maxDnaPossible, prev + amount)));
  };

  const setDnaMax = () => {
    setDnaToExtract(maxDnaPossible);
  };

  // Convert Meat ➔ DNA
  const executeDnaExtraction = () => {
    if (dnaToExtract <= 0) {
      playConvertSound('fail', isSoundEnabled);
      return;
    }
    const meatCost = dnaToExtract * meatToDnaRate;
    if (gameState.meat < meatCost) {
      playConvertSound('fail', isSoundEnabled);
      alert(`Insufficient Meat! Required: ${meatCost.toLocaleString()} Meat.`);
      return;
    }

    // Execute Splicer Conversion
    setGameState(prev => ({
      ...prev,
      meat: prev.meat - meatCost,
      dna: prev.dna + dnaToExtract,
    }));

    // Trigger Daily Missions event
    try {
      window.dispatchEvent(new CustomEvent('daily-mission-event', {
        detail: { type: 'spend-meat', amount: meatCost }
      }));
    } catch (e) {
      console.error('Error dispatching convert missions event', e);
    }

    playConvertSound('success', isSoundEnabled);
    setSuccessToast({
      message: `🧬 SYNTHESIZED +${dnaToExtract.toLocaleString()} EXTINCT DNA`,
      sub: `Recycled ${meatCost.toLocaleString()} Biotic Meat scraps.`
    });
    setTimeout(() => setSuccessToast(null), 3500);

    // Dynamic clean-up resets
    const newMax = Math.floor((gameState.meat - meatCost) / meatToDnaRate);
    setDnaToExtract(Math.min(10, newMax));
  };


  // Tab 2: MEAT + DNA ➔ GOD SHARDS Synthesis
  // Cost: 10,000 Meat + 100 DNA = 1 Shard of Gods
  const shardMeatCostPerUnit = 10000;
  const shardDnaCostPerUnit = 100;

  // Calculate max shards possible with current resources
  const maxShardsByMeat = Math.floor(gameState.meat / shardMeatCostPerUnit);
  const maxShardsByDna = Math.floor(gameState.dna / shardDnaCostPerUnit);
  const maxShardsPossible = Math.min(maxShardsByMeat, maxShardsByDna);

  const [shardsToSynthesize, setShardsToSynthesize] = useState<number>(Math.min(1, maxShardsPossible));
  const [shardsInputVal, setShardsInputVal] = useState<string>('1');

  // Sync textbox input
  useEffect(() => {
    if (activeTab === 'shards') {
      const parsed = parseInt(shardsInputVal, 10);
      if (isNaN(parsed) || parsed !== shardsToSynthesize) {
        setShardsInputVal(shardsToSynthesize.toString());
      }
    }
  }, [shardsToSynthesize, activeTab]);

  const handleShardSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setShardsToSynthesize(val);
  };

  const handleShardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value;
    setShardsInputVal(valStr);
    const parsed = parseInt(valStr, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      setShardsToSynthesize(Math.min(maxShardsPossible, parsed));
    }
  };

  const adjustShardsSynthesize = (amount: number) => {
    setShardsToSynthesize(prev => Math.max(0, Math.min(maxShardsPossible, prev + amount)));
  };

  const setShardsMax = () => {
    setShardsToSynthesize(maxShardsPossible);
  };

  // Convert MEAT + DNA ➔ GOD SHARDS
  const executeShardSynthesis = () => {
    if (shardsToSynthesize <= 0) {
      playConvertSound('fail', isSoundEnabled);
      return;
    }
    const totalMeatCost = shardsToSynthesize * shardMeatCostPerUnit;
    const totalDnaCost = shardsToSynthesize * shardDnaCostPerUnit;

    if (gameState.meat < totalMeatCost || gameState.dna < totalDnaCost) {
      playConvertSound('fail', isSoundEnabled);
      alert(`Missing required currencies! Need ${totalMeatCost.toLocaleString()} Meat & ${totalDnaCost.toLocaleString()} DNA.`);
      return;
    }

    setGameState(prev => {
      const currentShards = prev.shardsOfGods ?? 20;
      return {
        ...prev,
        meat: prev.meat - totalMeatCost,
        dna: prev.dna - totalDnaCost,
        shardsOfGods: currentShards + shardsToSynthesize
      };
    });

    // Trigger daily missions events for spending meat
    try {
      window.dispatchEvent(new CustomEvent('daily-mission-event', {
        detail: { type: 'spend-meat', amount: totalMeatCost }
      }));
    } catch (e) {
      console.error('Error dispatching shard conversion mission progress', e);
    }

    playConvertSound('shards', isSoundEnabled);
    setSuccessToast({
      message: `💎 CRYSTALLIZED +${shardsToSynthesize.toLocaleString()} DIVINE SHARDS`,
      sub: `Collapsed ${totalMeatCost.toLocaleString()} Meat & ${totalDnaCost.toLocaleString()} DNA in void singularity.`
    });
    setTimeout(() => setSuccessToast(null), 3500);

    const newMaxMeat = Math.floor((gameState.meat - totalMeatCost) / shardMeatCostPerUnit);
    const newMaxDna = Math.floor((gameState.dna - totalDnaCost) / shardDnaCostPerUnit);
    const newMax = Math.min(newMaxMeat, newMaxDna);
    setShardsToSynthesize(Math.min(1, newMax));
  };

  // Tab 3: 10 SHARDS ➔ 5 CAPY COINS Transmutation
  const shardsPerCapyBatch = 10;
  const capyCoinsPerBatch = 5;
  const currentShards = gameState.shardsOfGods ?? 0;
  const maxCapyBatches = Math.floor(currentShards / shardsPerCapyBatch);
  const maxCapyCoins = maxCapyBatches * capyCoinsPerBatch;

  const [capyCoinsToMint, setCapyCoinsToMint] = useState<number>(Math.min(5, maxCapyCoins));
  const [capyCoinsInputVal, setCapyCoinsInputVal] = useState<string>('5');

  useEffect(() => {
    if (activeTab === 'capy') {
      const parsed = parseInt(capyCoinsInputVal, 10);
      if (isNaN(parsed) || parsed !== capyCoinsToMint) {
        setCapyCoinsInputVal(capyCoinsToMint.toString());
      }
    }
  }, [capyCoinsToMint, activeTab]);

  const handleCapySliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = parseInt(e.target.value, 10);
    // Snap to increments of 5
    const snapped = Math.round(rawVal / 5) * 5;
    setCapyCoinsToMint(Math.min(maxCapyCoins, Math.max(0, snapped)));
  };

  const handleCapyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value;
    setCapyCoinsInputVal(valStr);
    const parsed = parseInt(valStr, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      const snapped = Math.round(parsed / 5) * 5;
      setCapyCoinsToMint(Math.min(maxCapyCoins, snapped));
    }
  };

  const adjustCapyMint = (amountCoins: number) => {
    setCapyCoinsToMint(prev => Math.max(0, Math.min(maxCapyCoins, prev + amountCoins)));
  };

  const setCapyMax = () => {
    setCapyCoinsToMint(maxCapyCoins);
  };

  const executeCapyMinting = () => {
    if (capyCoinsToMint <= 0) {
      playConvertSound('fail', isSoundEnabled);
      return;
    }
    const batches = Math.ceil(capyCoinsToMint / capyCoinsPerBatch);
    const shardsRequired = batches * shardsPerCapyBatch;
    const actualCoinsGained = batches * capyCoinsPerBatch;

    if (currentShards < shardsRequired) {
      playConvertSound('fail', isSoundEnabled);
      alert(`Missing Divine Shards! Need ${shardsRequired.toLocaleString()} Shards to mint ${actualCoinsGained} Capy Coins.`);
      return;
    }

    setGameState(prev => ({
      ...prev,
      shardsOfGods: Math.max(0, (prev.shardsOfGods ?? 0) - shardsRequired),
      capyCoins: (prev.capyCoins ?? 0) + actualCoinsGained
    }));

    playConvertSound('shards', isSoundEnabled);
    setSuccessToast({
      message: `🪙 TRANSMUTED +${actualCoinsGained.toLocaleString()} CAPY COINS`,
      sub: `Exchanged ${shardsRequired.toLocaleString()} Divine Shards at the sacred rate of 10 Shards = 5 Capy Coins.`
    });
    setTimeout(() => setSuccessToast(null), 3500);

    const remainingShards = currentShards - shardsRequired;
    const newMaxCoins = Math.floor(remainingShards / shardsPerCapyBatch) * capyCoinsPerBatch;
    setCapyCoinsToMint(Math.min(5, newMaxCoins));
  };


  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm select-none font-sans">
        
        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 15 }}
          className="relative w-full max-w-xl bg-slate-900/90 border border-indigo-500/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(99,102,241,0.25)] text-slate-100 flex flex-col"
        >
          {/* Scientific Grid Glow */}
          <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Modal Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/5 z-10">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-r from-cyan-950 to-indigo-950 border border-cyan-400/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                <RefreshCw size={18} className="text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-black uppercase tracking-widest text-white leading-normal flex items-center gap-1.5">
                  Quantum Currency Exchange <span className="text-[9px] bg-cyan-950/60 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/20">V.3</span>
                </h2>
                <p className="text-[9px] text-slate-400 uppercase tracking-tighter">Transmute biotic resources into divine cosmic materials</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Top Quick Status Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950/45 p-4 border-b border-white/5 z-10 text-[10px] font-mono">
            <div className="bg-slate-900/50 border border-yellow-500/10 p-2 rounded-xl flex flex-col items-center justify-center">
              <span className="text-slate-400 text-[8px] uppercase tracking-widest flex items-center gap-1">
                🥩 Biotic Meat
              </span>
              <span className="text-[11px] sm:text-xs font-black text-yellow-400 mt-1">
                {Math.floor(gameState.meat).toLocaleString()}
              </span>
            </div>
            
            <div className="bg-slate-900/50 border border-indigo-500/10 p-2 rounded-xl flex flex-col items-center justify-center">
              <span className="text-slate-400 text-[8px] uppercase tracking-widest flex items-center gap-1">
                🧬 Extinct DNA
              </span>
              <span className="text-[11px] sm:text-xs font-black text-indigo-400 mt-1">
                {Math.floor(gameState.dna).toLocaleString()}
              </span>
            </div>

            <div className="bg-slate-900/50 border border-amber-500/10 p-2 rounded-xl flex flex-col items-center justify-center">
              <span className="text-slate-400 text-[8px] uppercase tracking-widest flex items-center gap-1">
                💎 God Shards
              </span>
              <span className="text-[11px] sm:text-xs font-black text-amber-400 mt-1">
                {(gameState.shardsOfGods ?? 0).toLocaleString()}
              </span>
            </div>

            <div className="bg-slate-900/50 border border-lime-500/10 p-2 rounded-xl flex flex-col items-center justify-center">
              <span className="text-slate-400 text-[8px] uppercase tracking-widest flex items-center gap-1">
                🪙 Capy Coins
              </span>
              <span className="text-[11px] sm:text-xs font-black text-lime-400 mt-1">
                {(gameState.capyCoins ?? 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Splicer Tab Buttons */}
          <div className="flex border-b border-white/5 bg-slate-900/30 p-2 gap-1 z-10">
            <button
              onClick={() => setActiveTab('dna')}
              className={`flex-1 py-2 sm:py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 select-none transition-all cursor-pointer ${
                activeTab === 'dna'
                  ? 'bg-gradient-to-r from-indigo-950 to-cyan-950 border border-cyan-500/30 text-white shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/20'
              }`}
            >
              <Dna size={12} className={activeTab === 'dna' ? 'text-indigo-400 animate-pulse' : 'text-slate-400'} />
              DNA Extract
            </button>
            <button
              onClick={() => setActiveTab('shards')}
              className={`flex-1 py-2 sm:py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 select-none transition-all cursor-pointer ${
                activeTab === 'shards'
                  ? 'bg-gradient-to-r from-purple-950 to-amber-950 border border-amber-500/30 text-white shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/20'
              }`}
            >
              <Sparkles size={12} className={activeTab === 'shards' ? 'text-amber-400 animate-pulse' : 'text-slate-400'} />
              Divine Shards
            </button>
            <button
              onClick={() => setActiveTab('capy')}
              className={`flex-1 py-2 sm:py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 select-none transition-all cursor-pointer ${
                activeTab === 'capy'
                  ? 'bg-gradient-to-r from-lime-950 to-emerald-950 border border-lime-400/40 text-white shadow-[0_0_15px_rgba(132,204,22,0.2)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/20'
              }`}
            >
              <span className="text-sm">🪙</span>
              Capy Coins
            </button>
          </div>

          {/* Scrollable Converter Body */}
          <div className="flex-1 p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[380px] z-10">
            
            {/* Real-time Status Toast Notification */}
            <AnimatePresence>
              {successToast && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="bg-emerald-950/45 border border-emerald-500/30 text-emerald-200 p-3 rounded-xl flex flex-col relative overflow-hidden shadow-[0_0_10px_rgba(16,185,129,0.1)] gap-0.5"
                >
                  <span className="text-[9.5px] font-black select-none tracking-widest flex items-center gap-1">
                    🟢 TRANSACTION STATUS: VERIFIED
                  </span>
                  <span className="text-[10px] font-black leading-tight uppercase mt-0.5">{successToast.message}</span>
                  <span className="text-[8.5px] text-slate-400 tracking-tight leading-tighter uppercase font-mono">{successToast.sub}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* TAB 1: MEAT ➔ DNA EXTRACTOR */}
            {activeTab === 'dna' && (
              <div className="space-y-4">
                {/* Visual Pipeline Layout */}
                <div className="p-4 bg-slate-950/50 border border-white/5 rounded-2xl flex items-center justify-between relative overflow-hidden">
                  <div className="flex flex-col items-center justify-center p-2.5 bg-slate-900 border border-yellow-500/15 rounded-xl w-24">
                    <Flame size={18} className="text-yellow-500 animate-pulse" />
                    <span className="text-[7.5px] text-slate-400 font-bold uppercase tracking-widest mt-1">Biotic Meat</span>
                    <span className="text-[9.5px] text-yellow-400 font-black font-mono mt-0.5">-{ (dnaToExtract * meatToDnaRate).toLocaleString() }</span>
                  </div>

                  {/* Flow Arrow Animation */}
                  <div className="flex-1 flex flex-col items-center justify-center px-4 relative">
                    <span className="text-[7px] text-slate-400 uppercase font-bold tracking-widest font-mono mb-1">
                      RATE: 100 ➔ 1
                    </span>
                    <div className="w-full h-[2px] bg-indigo-500/20 relative rounded-full overflow-hidden flex items-center">
                      <motion.div 
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                        className="h-full w-12 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center p-2.5 bg-slate-900 border border-indigo-500/15 rounded-xl w-24">
                    <Dna size={18} className="text-indigo-400 animate-bounce" />
                    <span className="text-[7.5px] text-slate-400 font-bold uppercase tracking-widest mt-1">Extinct DNA</span>
                    <span className="text-[9.5px] text-green-400 font-black font-mono mt-0.5">+{ dnaToExtract.toLocaleString() }</span>
                  </div>
                </div>

                {/* Information Header */}
                <div className="p-3 bg-indigo-950/15 border border-indigo-500/10 rounded-xl leading-normal text-[9px] text-indigo-200">
                  🧬 <span className="font-bold text-indigo-300">BIO-RECIRCULATOR ACTIVATED:</span> Pure extinct DNA is vital for genetic gacha summons, trait rerolls, and unlocking pinnacle advancements. Recycler breakdown occurs at a ratio of <strong>100 Meat for every 1 DNA</strong>.
                </div>

                {/* Quantity Control System */}
                <div className="bg-slate-950/20 border border-white/5 rounded-2xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Extract Target Quantity</span>
                    
                    {/* Compact manual input box */}
                    <div className="flex items-center gap-1.5">
                      <input
                        type="percentage"
                        pattern="[0-9]*"
                        value={dnaInputVal}
                        onChange={handleDnaInputChange}
                        className="w-16 text-center text-[10.5px] font-mono bg-slate-950 border border-indigo-500/25 rounded-md px-1.5 py-1 text-white font-black"
                      />
                      <span className="text-[8px] font-black uppercase text-indigo-400 font-mono">DNA</span>
                    </div>
                  </div>

                  {/* Slider Control */}
                  <div className="space-y-1 pt-1">
                    <input
                      type="range"
                      min={0}
                      max={Math.max(100, maxDnaPossible)}
                      disabled={maxDnaPossible <= 0}
                      value={dnaToExtract}
                      onChange={handleDnaSliderChange}
                      className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    <div className="flex justify-between text-[7.5px] text-slate-400 font-bold font-mono">
                      <span>MIN: 0 DNA</span>
                      <span className="text-indigo-400 font-black">SLIDER MATCH RANGE</span>
                      <span>MAX: {maxDnaPossible.toLocaleString()} DNA</span>
                    </div>
                  </div>

                  {/* Preset Increments */}
                  <div className="flex flex-wrap gap-1 bg-slate-950/40 p-1.5 rounded-lg">
                    {[
                      { label: '+1 DNA', amount: 1 },
                      { label: '+10 DNA', amount: 10 },
                      { label: '+100 DNA', amount: 100 },
                      { label: '+1k DNA', amount: 1000 },
                    ].map((btn, idx) => (
                      <button
                        key={`dna-preset-${btn.label}-${idx}`}
                        onClick={() => adjustDnaExtract(btn.amount)}
                        disabled={maxDnaPossible <= 0}
                        className={`flex-1 min-w-16 py-1 border rounded text-[8px] font-mono font-black transition-all cursor-pointer hover:bg-slate-900 border-white/5 text-slate-300`}
                      >
                        {btn.label}
                      </button>
                    ))}
                    <button
                      onClick={setDnaMax}
                      disabled={maxDnaPossible <= 0}
                      className="flex-1 py-1 bg-indigo-950/40 border border-indigo-500/25 rounded text-[8px] font-mono font-black transition-all cursor-pointer hover:bg-indigo-900/40 text-indigo-300"
                    >
                      Convert MAX
                    </button>
                  </div>
                </div>

                {/* Resource Validation Warning */}
                {maxDnaPossible <= 0 && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-xl leading-normal text-[8px] flex gap-2 items-start">
                    <AlertTriangle size={12} className="shrink-0 animate-bounce" />
                    <span>
                      <strong>RESOURCE WARNING:</strong> Meat storage does not contain enough energy to run DNA Extraction. Place higher generation towers or clear additional waves to harvest Meat!
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: MEAT + DNA ➔ DIVINE GOD SHARDS */}
            {activeTab === 'shards' && (
              <div className="space-y-4">
                {/* Dual Input Resource Pipeline */}
                <div className="p-4 bg-slate-950/50 border border-white/5 rounded-2xl flex flex-col gap-3 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    {/* Input Meat Column */}
                    <div className="flex flex-col items-center justify-center p-2 bg-slate-900 border border-yellow-500/15 rounded-xl w-24">
                      <Flame size={14} className="text-yellow-500 animate-pulse" />
                      <span className="text-[7px] text-slate-400 font-bold uppercase mt-1">Biotic Meat</span>
                      <span className="text-[9px] text-yellow-400 font-black font-mono mt-0.5">-{ (shardsToSynthesize * shardMeatCostPerUnit).toLocaleString() }</span>
                    </div>

                    <span className="text-zinc-600 font-black font-mono text-[11px]">+</span>

                    {/* Input DNA Column */}
                    <div className="flex flex-col items-center justify-center p-2 bg-slate-900 border border-indigo-500/15 rounded-xl w-24">
                      <Dna size={14} className="text-indigo-400 animate-pulse" />
                      <span className="text-[7px] text-slate-400 font-bold uppercase mt-1">Extinct DNA</span>
                      <span className="text-[9px] text-indigo-400 font-black font-mono mt-0.5">-{ (shardsToSynthesize * shardDnaCostPerUnit).toLocaleString() }</span>
                    </div>

                    {/* Synthesis Arrow */}
                    <div className="flex-1 flex flex-col items-center justify-center px-2">
                      <div className="w-full h-[2px] bg-amber-500/25 relative rounded-full overflow-hidden">
                        <motion.div 
                          animate={{ x: ['-100%', '200%'] }}
                          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                          className="h-full w-8 bg-gradient-to-r from-transparent via-amber-400 to-transparent"
                        />
                      </div>
                    </div>

                    {/* Output God Shard */}
                    <div className="flex flex-col items-center justify-center p-2 bg-gradient-to-br from-amber-950 to-purple-950 border border-amber-500/30 rounded-xl w-24 shadow-[0_0_15px_rgba(245,158,11,0.25)] relative">
                      <Sparkles size={16} className="text-amber-400 animate-bounce" />
                      <span className="text-[7px] text-slate-300 font-bold uppercase mt-1">God Shards</span>
                      <span className="text-[9.5px] text-amber-300 font-black font-mono mt-0.5">+{ shardsToSynthesize.toLocaleString() }</span>
                    </div>
                  </div>

                  <div className="text-center text-[7.5px] text-slate-400 font-bold uppercase tracking-widest font-mono border-t border-white/5 pt-2 flex justify-between">
                    <span>Rate Per Shard: 10,000 Meat</span>
                    <span className="text-amber-500 animate-pulse">⚙️ Singularity Splicing Node ⚙️</span>
                    <span>100 DNA</span>
                  </div>
                </div>

                {/* Description Header */}
                <div className="p-3 bg-amber-950/15 border border-amber-500/10 rounded-xl leading-normal text-[9px] text-amber-200">
                  💎 <span className="font-bold text-amber-300">CORE CONDENSATION SENSORS:</span> Divine Shards can be used to purchase powerful <strong>Nebula Overcharge Beacons</strong>. Condense <strong>10,000 Meat + 100 DNA</strong> to manufacture a solid God Shard.
                </div>

                {/* Shards Control Panel */}
                <div className="bg-slate-950/20 border border-white/5 rounded-2xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Synthesize Target shards</span>
                    
                    <div className="flex items-center gap-1.5">
                      <input
                        type="percentage"
                        pattern="[0-9]*"
                        value={shardsInputVal}
                        onChange={handleShardInputChange}
                        className="w-14 text-center text-[10.5px] font-mono bg-slate-950 border border-amber-500/25 rounded-md px-1.5 py-1 text-white font-black"
                      />
                      <span className="text-[8px] font-black uppercase text-amber-400 font-mono">Shards</span>
                    </div>
                  </div>

                  {/* Slider */}
                  <div className="space-y-1 pt-1">
                    <input
                      type="range"
                      min={0}
                      max={Math.max(10, maxShardsPossible)}
                      disabled={maxShardsPossible <= 0}
                      value={shardsToSynthesize}
                      onChange={handleShardSliderChange}
                      className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                    <div className="flex justify-between text-[7.5px] text-slate-400 font-bold font-mono">
                      <span>MIN: 0 SHARDS</span>
                      <span className="text-amber-400 font-black">SLIDER SYNTH MATRIX</span>
                      <span>MAX: {maxShardsPossible.toLocaleString()} SHARDS</span>
                    </div>
                  </div>

                  {/* Presets */}
                  <div className="flex bg-slate-950/40 p-1.5 rounded-lg gap-1">
                    {[
                      { label: '+1 Shard', amount: 1 },
                      { label: '+5 Shards', amount: 5 },
                      { label: '+10 Shards', amount: 10 },
                    ].map((btn, idx) => (
                      <button
                        key={`shard-preset-${btn.label}-${idx}`}
                        onClick={() => adjustShardsSynthesize(btn.amount)}
                        disabled={maxShardsPossible <= 0}
                        className="flex-1 py-1 border border-white/5 rounded text-[8px] font-mono font-black text-slate-300 hover:bg-slate-900 cursor-pointer transition-all"
                      >
                        {btn.label}
                      </button>
                    ))}
                    <button
                      onClick={setShardsMax}
                      disabled={maxShardsPossible <= 0}
                      className="flex-1 py-1 bg-amber-950/40 border border-amber-500/25 rounded text-[8px] font-mono font-black transition-all cursor-pointer hover:bg-amber-900/40 text-amber-300"
                    >
                      Synthesize MAX
                    </button>
                  </div>
                </div>

                {/* Requirements Warning */}
                {maxShardsPossible <= 0 && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl leading-normal text-[8px] flex gap-2 items-start">
                    <AlertTriangle size={12} className="shrink-0 animate-bounce text-rose-500" />
                    <span>
                      <strong>MATERIALS DEPLETED:</strong> Dual resources required. Check that you have at least <strong>10,000 Meat</strong> and <strong>100 DNA</strong> to collapse materials into solid Shards of the Gods.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: CAPY COINS TRANSMUTATION */}
            {activeTab === 'capy' && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-950/50 border border-lime-500/20 rounded-2xl flex items-center justify-between relative overflow-hidden">
                  <div className="flex flex-col items-center justify-center p-2.5 bg-slate-900 border border-amber-500/20 rounded-xl w-28">
                    <Sparkles size={18} className="text-amber-400 animate-pulse" />
                    <span className="text-[7.5px] text-slate-400 font-bold uppercase tracking-widest mt-1">God Shards</span>
                    <span className="text-[9.5px] text-amber-400 font-black font-mono mt-0.5">
                      -{ (Math.ceil(capyCoinsToMint / capyCoinsPerBatch) * shardsPerCapyBatch).toLocaleString() }
                    </span>
                  </div>

                  {/* Flow Arrow Animation */}
                  <div className="flex-1 flex flex-col items-center justify-center px-4 relative">
                    <span className="text-[7.5px] text-lime-400 uppercase font-black tracking-widest font-mono mb-1">
                      10 SHARDS ➔ 5 COINS
                    </span>
                    <div className="w-full h-[2px] bg-lime-500/20 relative rounded-full overflow-hidden flex items-center">
                      <motion.div 
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                        className="h-full w-12 bg-gradient-to-r from-transparent via-lime-400 to-transparent"
                      />
                    </div>
                    <span className="text-[6.5px] text-slate-400 uppercase font-mono mt-1">SACRED TRANQUIL RATE</span>
                  </div>

                  <div className="flex flex-col items-center justify-center p-2.5 bg-slate-900 border border-lime-500/30 rounded-xl w-28 shadow-[0_0_12px_rgba(132,204,22,0.2)]">
                    <span className="text-xl animate-bounce">🪙</span>
                    <span className="text-[7.5px] text-lime-300 font-bold uppercase tracking-widest mt-0.5">Capy Coins</span>
                    <span className="text-[10px] text-lime-400 font-black font-mono mt-0.5">
                      +{ (Math.ceil(capyCoinsToMint / capyCoinsPerBatch) * capyCoinsPerBatch).toLocaleString() }
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-lime-950/20 border border-lime-500/20 rounded-xl leading-normal text-[9px] text-lime-200 flex items-center gap-2">
                  <div className="w-5 h-5 flex-none flex items-center justify-center">
                    <CapybaraAvatar size="xs" withYuzu={false} />
                  </div>
                  <div>
                    <span className="font-bold text-lime-300">CAPY COIN ALCHEMY:</span> Convert <strong>10 Divine Shards for 5 Capy Coins</strong>. Use Capy Coins exclusively at the new <strong>Capybara Summon Altar</strong> to summon the mythical <strong>Capybara</strong>!
                  </div>
                </div>

                <div className="bg-slate-950/20 border border-white/5 rounded-2xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Target Capy Coins</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="percentage"
                        pattern="[0-9]*"
                        value={capyCoinsInputVal}
                        onChange={handleCapyInputChange}
                        className="w-14 text-center text-[10.5px] font-mono bg-slate-950 border border-lime-500/30 rounded-md px-1.5 py-1 text-white font-black"
                      />
                      <span className="text-[8px] font-black uppercase text-lime-400 font-mono">Coins</span>
                    </div>
                  </div>

                  <div className="space-y-1 pt-1">
                    <input
                      type="range"
                      min={0}
                      max={Math.max(5, maxCapyCoins)}
                      step={5}
                      disabled={maxCapyCoins <= 0}
                      value={capyCoinsToMint}
                      onChange={handleCapySliderChange}
                      className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-lime-500"
                    />
                    <div className="flex justify-between text-[7.5px] text-slate-400 font-bold font-mono">
                      <span>MIN: 0 COINS</span>
                      <span className="text-lime-400 font-black">STEP INCREMENT: 5 COINS</span>
                      <span>MAX: {maxCapyCoins.toLocaleString()} COINS</span>
                    </div>
                  </div>

                  <div className="flex bg-slate-950/40 p-1.5 rounded-lg gap-1">
                    {[
                      { label: '+5 Coins', amount: 5 },
                      { label: '+10 Coins', amount: 10 },
                      { label: '+25 Coins', amount: 25 },
                      { label: '+50 Coins', amount: 50 },
                    ].map((btn, idx) => (
                      <button
                        key={`capy-preset-${btn.label}-${idx}`}
                        onClick={() => adjustCapyMint(btn.amount)}
                        disabled={maxCapyCoins <= 0}
                        className="flex-1 py-1 border border-white/5 rounded text-[8px] font-mono font-black text-slate-300 hover:bg-slate-900 cursor-pointer transition-all hover:text-lime-300 hover:border-lime-500/20"
                      >
                        {btn.label}
                      </button>
                    ))}
                    <button
                      onClick={setCapyMax}
                      disabled={maxCapyCoins <= 0}
                      className="flex-1 py-1 bg-lime-950/40 border border-lime-500/30 rounded text-[8px] font-mono font-black transition-all cursor-pointer hover:bg-lime-900/40 text-lime-300"
                    >
                      Mint MAX
                    </button>
                  </div>
                </div>

                {maxCapyCoins <= 0 && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl leading-normal text-[8px] flex gap-2 items-start">
                    <AlertTriangle size={12} className="shrink-0 animate-bounce text-rose-500" />
                    <span>
                      <strong>INSUFFICIENT DIVINE SHARDS:</strong> Need at least <strong>10 Divine Shards</strong> to mint 5 Capy Coins.
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Modal Footer Controls */}
          <div className="p-5 border-t border-white/5 bg-slate-950/45 flex items-center justify-between z-10">
            <div className="text-[8.5px] font-mono text-slate-400 flex flex-col *:leading-tight uppercase">
              <span>Splicer Core Node Active</span>
              <span className="text-[7.5px] text-cyan-400 animate-pulse mt-0.5">● SECURE SECTOR LINKS</span>
            </div>

            {activeTab === 'dna' && (
              <motion.button
                onClick={executeDnaExtraction}
                disabled={dnaToExtract <= 0}
                whileHover={dnaToExtract > 0 ? { scale: 1.03 } : {}}
                whileTap={dnaToExtract > 0 ? { scale: 0.97 } : {}}
                className={`px-6 py-2.5 rounded-xl text-[10.5px] font-black uppercase tracking-wider flex items-center gap-2 select-none shadow-lg ${
                  dnaToExtract <= 0
                    ? 'bg-slate-800 text-slate-500 border border-white/5 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white border border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.3)] cursor-pointer'
                }`}
              >
                <Dna size={12} />
                Extract DNA
              </motion.button>
            )}

            {activeTab === 'shards' && (
              <motion.button
                onClick={executeShardSynthesis}
                disabled={shardsToSynthesize <= 0}
                whileHover={shardsToSynthesize > 0 ? { scale: 1.03 } : {}}
                whileTap={shardsToSynthesize > 0 ? { scale: 0.97 } : {}}
                className={`px-6 py-2.5 rounded-xl text-[10.5px] font-black uppercase tracking-wider flex items-center gap-2 select-none shadow-lg ${
                  shardsToSynthesize <= 0
                    ? 'bg-slate-800 text-slate-500 border border-white/5 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-650 to-amber-500 hover:from-purple-550 hover:to-amber-400 text-white border border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)] cursor-pointer'
                }`}
              >
                <Sparkles size={12} />
                Synthesize God Shards
              </motion.button>
            )}

            {activeTab === 'capy' && (
              <motion.button
                onClick={executeCapyMinting}
                disabled={capyCoinsToMint <= 0}
                whileHover={capyCoinsToMint > 0 ? { scale: 1.03 } : {}}
                whileTap={capyCoinsToMint > 0 ? { scale: 0.97 } : {}}
                className={`px-6 py-2.5 rounded-xl text-[10.5px] font-black uppercase tracking-wider flex items-center gap-2 select-none shadow-lg ${
                  capyCoinsToMint <= 0
                    ? 'bg-slate-800 text-slate-500 border border-white/5 cursor-not-allowed'
                    : 'bg-gradient-to-r from-lime-600 to-emerald-500 hover:from-lime-500 hover:to-emerald-400 text-white border border-lime-400 shadow-[0_0_20px_rgba(132,204,22,0.4)] cursor-pointer'
                }`}
              >
                <span className="text-sm">🪙</span>
                Mint Capy Coins
              </motion.button>
            )}
          </div>
          
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
