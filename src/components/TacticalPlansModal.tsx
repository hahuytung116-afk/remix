import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Target, 
  ShieldAlert, 
  Atom, 
  Sparkles, 
  Crosshair, 
  Zap, 
  TrendingUp, 
  Bot, 
  Layers, 
  CheckCircle2, 
  HelpCircle, 
  Play, 
  Sliders, 
  Info,
  ChevronRight,
  Flame
} from 'lucide-react';
import { TacticalPlan, Animal, TowerInstance, GameState } from '../types';
import { 
  TACTICAL_PLANS, 
  getTacticalPlan, 
  analyzeBattlefieldComposition, 
  selectDiverseAnimalForTacticalPlan,
  getAnimalTacticalRole
} from '../data/tacticalPlans';
import { ANIMALS } from '../constants';
import { AnimalAvatar } from './AnimalAvatar';

interface TacticalPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePlanId?: string;
  autoDiversifyEnabled?: boolean;
  ownedAnimals: Animal[];
  towers: TowerInstance[];
  meat: number;
  onSelectPlan: (planId: string) => void;
  onToggleAutoDiversify: (enabled: boolean) => void;
  onExecutePlanDeployment: (plan: TacticalPlan) => { success: boolean; deployedCount: number; message: string };
}

export const TacticalPlansModal: React.FC<TacticalPlansModalProps> = ({
  isOpen,
  onClose,
  activePlanId = 'balanced_matrix',
  autoDiversifyEnabled = true,
  ownedAnimals,
  towers,
  meat,
  onSelectPlan,
  onToggleAutoDiversify,
  onExecutePlanDeployment,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(activePlanId);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const currentPlan = useMemo(() => getTacticalPlan(selectedPlanId), [selectedPlanId]);
  const liveComposition = useMemo(() => analyzeBattlefieldComposition(towers), [towers]);

  const totalTowers = Math.max(1, liveComposition.totalTowers);
  const livePercentages = useMemo(() => ({
    singleTargetDps: Math.round((liveComposition.singleTargetDps / totalTowers) * 100),
    aoeNuker: Math.round((liveComposition.aoeNuker / totalTowers) * 100),
    crowdControl: Math.round((liveComposition.crowdControl / totalTowers) * 100),
    fusedBeast: Math.round((liveComposition.fusedBeast / totalTowers) * 100),
    supportEconomy: Math.round((liveComposition.supportEconomy / totalTowers) * 100)
  }), [liveComposition, totalTowers]);

  if (!isOpen) return null;

  const handleApplyPlan = (planId: string) => {
    setSelectedPlanId(planId);
    onSelectPlan(planId);
    setFeedback({
      type: 'success',
      message: `Activated Tactical Plan: "${getTacticalPlan(planId).name}"!`
    });
  };

  const handleExecuteInstantDeployment = () => {
    const res = onExecutePlanDeployment(currentPlan);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const getPlanIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldAlert': return <ShieldAlert size={20} />;
      case 'Atom': return <Atom size={20} />;
      case 'Sparkles': return <Sparkles size={20} />;
      case 'Crosshair': return <Crosshair size={20} />;
      case 'Zap': return <Zap size={20} />;
      case 'TrendingUp': return <TrendingUp size={20} />;
      default: return <Target size={20} />;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="relative w-full max-w-5xl max-h-[92vh] bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-cyan-500/50 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col overflow-hidden text-slate-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-cyan-500/30 bg-gradient-to-r from-cyan-950/60 via-slate-900/90 to-indigo-950/60 relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
            
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-cyan-500/20 border-2 border-cyan-400/70 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                <Target size={24} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-teal-200 to-sky-400">
                    🎯 TACTICAL PLANS & AUTO-DIVERSITY
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-cyan-500/20 border border-cyan-400/50 text-cyan-300">
                    DOCTRINES
                  </span>
                </div>
                <p className="text-xs text-cyan-200/70 font-medium">
                  Select tactical blueprints to automatically diversify and deploy balanced squads across combat zones.
                </p>
              </div>
            </div>

            {/* Automation Toggle & Close */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => onToggleAutoDiversify(!autoDiversifyEnabled)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  autoDiversifyEnabled
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                <Bot size={15} />
                <span>Auto-Diversify: {autoDiversifyEnabled ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Feedback Toast */}
          {feedback && (
            <div className={`mx-4 mt-3 p-3 rounded-xl flex items-center gap-2.5 text-xs font-bold border ${
              feedback.type === 'success' 
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                : 'bg-rose-950/80 border-rose-500/50 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
            }`}>
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              
              {/* Left 5 Cols: Tactical Plan Catalog */}
              <div className="lg:col-span-5 space-y-2.5">
                <div className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-1">
                  <Layers size={14} className="text-cyan-400" /> TACTICAL DOCTRINES CATALOG
                </div>

                {TACTICAL_PLANS.map((plan) => {
                  const isSelected = selectedPlanId === plan.id;
                  const isActive = activePlanId === plan.id;

                  return (
                    <div
                      key={plan.id}
                      onClick={() => handleApplyPlan(plan.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                        isActive
                          ? 'bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border-cyan-400 ring-2 ring-cyan-400/40 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                          : isSelected
                          ? 'bg-slate-900/90 border-slate-600'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2.5">
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center border shrink-0"
                            style={{ backgroundColor: `${plan.color}20`, borderColor: `${plan.color}60`, color: plan.color }}
                          >
                            {getPlanIcon(plan.icon)}
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-white leading-tight">{plan.name}</h4>
                            <span className="text-[9px] font-bold text-slate-400">{plan.subtitle}</span>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider border shrink-0" style={{ borderColor: `${plan.color}50`, color: plan.color }}>
                          {plan.tag}
                        </span>
                      </div>

                      <p className="text-[9.5px] text-slate-300 leading-relaxed mb-2.5">
                        {plan.description}
                      </p>

                      {/* Mini composition indicators */}
                      <div className="grid grid-cols-5 gap-1 text-[8px] font-mono text-center pt-2 border-t border-slate-800/80">
                        <div className="bg-slate-950/80 p-1 rounded text-red-300">
                          DPS {plan.composition.singleTargetDps}%
                        </div>
                        <div className="bg-slate-950/80 p-1 rounded text-amber-300">
                          AoE {plan.composition.aoeNuker}%
                        </div>
                        <div className="bg-slate-950/80 p-1 rounded text-purple-300">
                          CC {plan.composition.crowdControl}%
                        </div>
                        <div className="bg-slate-950/80 p-1 rounded text-yellow-300">
                          FUSED {plan.composition.fusedBeast}%
                        </div>
                        <div className="bg-slate-950/80 p-1 rounded text-emerald-300">
                          SUP {plan.composition.supportEconomy}%
                        </div>
                      </div>

                      {isActive && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 text-[8.5px] font-black text-cyan-300 uppercase">
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                          <span>ACTIVE</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Right 7 Cols: Selected Plan Detail & Live Diversity Matrix */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* Active Plan Strategy & Execute Card */}
                <div className="p-4 rounded-2xl bg-slate-950/90 border border-cyan-500/30 relative overflow-hidden space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center border"
                        style={{ backgroundColor: `${currentPlan.color}25`, borderColor: currentPlan.color, color: currentPlan.color }}
                      >
                        {getPlanIcon(currentPlan.icon)}
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white">{currentPlan.name}</h3>
                        <span className="text-[10px] font-bold text-slate-400">Strategic Placement Protocol</span>
                      </div>
                    </div>

                    <button
                      onClick={handleExecuteInstantDeployment}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer transition-all active:scale-95"
                    >
                      <Play size={14} className="fill-current" />
                      <span>Execute Tactical Squad</span>
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                    <strong className="text-cyan-300">Deployment Strategy: </strong>
                    {currentPlan.strategyNotes}
                  </div>

                  {/* Composition Quotas Visual Progress */}
                  <div className="space-y-2 pt-1">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center justify-between">
                      <span>IDEAL COMPOSITION DISTRIBUTION:</span>
                      <span className="text-cyan-400 font-mono">100% Target Matrix</span>
                    </div>

                    <div className="h-3 w-full rounded-full overflow-hidden flex bg-slate-900 border border-slate-800">
                      <div style={{ width: `${currentPlan.composition.singleTargetDps}%` }} className="bg-red-500 h-full" title={`Single Target DPS: ${currentPlan.composition.singleTargetDps}%`} />
                      <div style={{ width: `${currentPlan.composition.aoeNuker}%` }} className="bg-amber-500 h-full" title={`AoE Nukers: ${currentPlan.composition.aoeNuker}%`} />
                      <div style={{ width: `${currentPlan.composition.crowdControl}%` }} className="bg-purple-500 h-full" title={`Crowd Control: ${currentPlan.composition.crowdControl}%`} />
                      <div style={{ width: `${currentPlan.composition.fusedBeast}%` }} className="bg-yellow-400 h-full" title={`Fused Beasts: ${currentPlan.composition.fusedBeast}%`} />
                      <div style={{ width: `${currentPlan.composition.supportEconomy}%` }} className="bg-emerald-500 h-full" title={`Support / Economy: ${currentPlan.composition.supportEconomy}%`} />
                    </div>
                  </div>
                </div>

                {/* Live Battlefield Diversity Meter */}
                <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Bot size={15} className="text-teal-400" /> LIVE BATTLEFIELD DIVERSITY METER ({towers.length} TOWERS)
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Auto-Diversify balances deficits automatically
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                    {/* Single Target DPS */}
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                      <div className="text-[9px] font-bold text-red-300 uppercase">Single DPS</div>
                      <div className="text-base font-black font-mono text-white my-0.5">{livePercentages.singleTargetDps}%</div>
                      <div className="text-[8px] text-slate-400 font-mono">Quota: {currentPlan.composition.singleTargetDps}%</div>
                    </div>

                    {/* AoE Nuker */}
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                      <div className="text-[9px] font-bold text-amber-300 uppercase">AoE Nuker</div>
                      <div className="text-base font-black font-mono text-white my-0.5">{livePercentages.aoeNuker}%</div>
                      <div className="text-[8px] text-slate-400 font-mono">Quota: {currentPlan.composition.aoeNuker}%</div>
                    </div>

                    {/* Crowd Control */}
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                      <div className="text-[9px] font-bold text-purple-300 uppercase">Stasis / CC</div>
                      <div className="text-base font-black font-mono text-white my-0.5">{livePercentages.crowdControl}%</div>
                      <div className="text-[8px] text-slate-400 font-mono">Quota: {currentPlan.composition.crowdControl}%</div>
                    </div>

                    {/* Fused Beast */}
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                      <div className="text-[9px] font-bold text-yellow-300 uppercase">Fused Beasts</div>
                      <div className="text-base font-black font-mono text-white my-0.5">{livePercentages.fusedBeast}%</div>
                      <div className="text-[8px] text-slate-400 font-mono">Quota: {currentPlan.composition.fusedBeast}%</div>
                    </div>

                    {/* Support / Economy */}
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                      <div className="text-[9px] font-bold text-emerald-300 uppercase">Support / Eco</div>
                      <div className="text-base font-black font-mono text-white my-0.5">{livePercentages.supportEconomy}%</div>
                      <div className="text-[8px] text-slate-400 font-mono">Quota: {currentPlan.composition.supportEconomy}%</div>
                    </div>
                  </div>
                </div>

                {/* Auto-Diversification Explained */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-teal-950/30 to-indigo-950/30 border border-teal-500/20 text-xs text-slate-300 space-y-1.5">
                  <div className="font-black text-teal-300 uppercase flex items-center gap-1.5">
                    <Sparkles size={14} /> HOW AUTO-DIVERSIFICATION WORKS:
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    When Auto-Diversify is enabled, whenever towers are automatically or manually deployed with a Tactical Plan, the deployment engine calculates which tactical role is under-represented relative to your plan's ideal quotas. It then picks your strongest owned construct of that deficit role and strategically positions it to maximize combat coverage!
                  </p>
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
