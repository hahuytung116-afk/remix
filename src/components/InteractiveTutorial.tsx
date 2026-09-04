import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  HelpCircle, 
  Sparkles, 
  Backpack, 
  Swords, 
  Coins, 
  Bot, 
  Trophy, 
  Cpu,
  Bookmark
} from 'lucide-react';

interface TutorialStep {
  title: string;
  desc: string;
  targetId?: string;
  icon: React.ReactNode;
  hint?: string;
}

interface InteractiveTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  const steps: TutorialStep[] = [
    {
      title: "🧬 Welcome, Chief Bio-Splicer!",
      desc: "Inside this post-apocalyptic simulator, old military arsenals are useless. You are tasked with splicing extinct species templates (dinosaurs, ancient deities, mythical creatures, and Unrivaled behemoths) to build a defense grid against waves of cyber-hunting ravagers.",
      icon: <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />,
      hint: "Let's begin a quick interactive simulation to master the dashboard controls!"
    },
    {
      title: "📊 Genomic Resource Hub",
      desc: "Monitor your biological resources at the top of the interface. Slaying mutated hunters yields Meat 🥩. Meat is used to deploy or evolve beasts onto the map during combat. Successfully neutralizing waves yields DNA 🧬, which is spent inside the lab to splice newer beast species templates.",
      targetId: "tutorial-currency-hub",
      icon: <Coins className="w-7 h-7 text-yellow-400" />,
      hint: "All tower configurations and upgrades require keeping an eye on these values!"
    },
    {
      title: "⚔️ Tactical Arena Grid",
      desc: "This is the active combat canvas where hunting forces flow. Clicking any empty grid space allows you to deploy your selected tower species. You can also click on placed towers to upgrade them, configure their traits, or sell them if necessary.",
      targetId: "tutorial-game-canvas",
      icon: <Swords className="w-7 h-7 text-cyan-400" />,
      hint: "Hovering over coordinates on the path will give you direct range indicator graphics."
    },
    {
      title: "🔮 Extinct Splicing Portal",
      desc: "Spend DNA to summon species models ranging from Common up to Unrivaled, Celestial, and Original. Toggling 'Auto-Summon' enables real-time background gacha splicing as you defeat waves, immediately unlocking premium assets without stopping gameplay.",
      targetId: "tutorial-summon-altar",
      icon: <Sparkles className="w-7 h-7 text-indigo-400 animate-spin" style={{ animationDuration: '4s' }} />,
      hint: "Pity counters ensure that you are guaranteed top-tier Gods after a certain amount of splicing attempts."
    },
    {
      title: "🎒 Genome Inventory Backpack",
      desc: "Open your Unit Backpack to browse your current collection. You can compare attack power and elemental ranges, lock favorite templates, and trigger Mass Purge to dissolve duplicates into useful mutation shards used for Pinnacle Transcendence.",
      targetId: "tutorial-unit-backpack",
      icon: <Backpack className="w-7 h-7 text-emerald-400" />,
      hint: "Your unlocked species are retained across runs unless you fully rebuild the database!"
    },
    {
      title: "🤖 Auto-Pilot Automation Matrix",
      desc: "Unfold hands-free simulation tools! Configure auto-pilot settings to deploy new defense waves automatically, upgrade towers instantly on the grid using Meat, or let our robotic splicing system handles duplicates behind-the-scenes.",
      targetId: "tutorial-autopilot",
      icon: <Bot className="w-7 h-7 text-purple-400 animate-bounce" style={{ animationDuration: '2s' }} />,
      hint: "Use automation to speed through early waves and focus strictly on extreme strategy configurations."
    },
    {
      title: "🏆 Splicer Mission Logs",
      desc: "Check your Active Daily Mission board regularly. Triggering special summon events, leveling units to extreme tiers, or surviving high waves earns you heaps of extra DNA resources and rare Divine Shards.",
      targetId: "tutorial-missions",
      icon: <Trophy className="w-7 h-7 text-amber-400" />,
      hint: "Completing daily missions is the fastest way to amass material payloads for high-tier summons."
    },
    {
      title: "🚀 Launch Combat Operations",
      desc: "Ready to test your configurations? Click 'Deploy Defenses' in the header to launch a mutant wave. Adjust the game speed (1x to 3x) to fast-forward combat, or toggle hardcore stages (Jungle, Savanna, Prehistoric) from the sidebar options to alter path layouts!",
      targetId: "tutorial-wave-controller",
      icon: <Cpu className="w-7 h-7 text-green-400 animate-pulse" />,
      hint: "Keep your base health above 0. If things get too hectic, adjust sound parameters in Settings."
    }
  ];

  useEffect(() => {
    if (!isOpen) return;
    const targetId = steps[currentStep]?.targetId;
    if (!targetId) {
      setSpotlightRect(null);
      return;
    }

    const updateRect = () => {
      const el = document.getElementById(targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        setSpotlightRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        });
        
        // Scroll target seamlessly into view
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        setSpotlightRect(null);
      }
    };

    updateRect();
    const timer = setTimeout(updateRect, 180);
    
    window.addEventListener('resize', updateRect);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateRect);
    };
  }, [currentStep, isOpen]);

  if (!isOpen) return null;

  const activeStep = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem('df_completed_combat_tour', 'true');
      onClose();
      setCurrentStep(0);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('df_completed_combat_tour', 'true');
    onClose();
    setCurrentStep(0);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
        {/* Spotlight Dark Mask Panel Backdrop */}
        {spotlightRect ? (
          <div className="fixed inset-0 pointer-events-none z-45">
            <div 
              className="absolute bg-slate-950/80 transition-all duration-300" 
              style={{ top: 0, left: 0, right: 0, height: `${spotlightRect.top}px` }}
            />
            <div 
              className="absolute bg-slate-950/80 transition-all duration-300" 
              style={{ top: `${spotlightRect.top + spotlightRect.height}px`, left: 0, right: 0, bottom: 0 }}
            />
            <div 
              className="absolute bg-slate-950/80 transition-all duration-300" 
              style={{ top: `${spotlightRect.top}px`, left: 0, width: `${spotlightRect.left}px`, height: `${spotlightRect.height}px` }}
            />
            <div 
              className="absolute bg-slate-950/80 transition-all duration-300" 
              style={{ top: `${spotlightRect.top}px`, left: `${spotlightRect.left + spotlightRect.width}px`, right: 0, height: `${spotlightRect.height}px` }}
            />
            {/* Spotlight neon glowing outline border */}
            <div 
              className="absolute border-2 border-cyan-400 rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.7),inset_0_0_15px_rgba(6,182,212,0.3)] transition-all duration-300 animate-pulse pointer-events-auto"
              style={{ 
                top: `${spotlightRect.top - 6}px`, 
                left: `${spotlightRect.left - 6}px`, 
                width: `${spotlightRect.width + 12}px`, 
                height: `${spotlightRect.height + 12}px` 
              }}
            />
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-45"
            onClick={handleSkip}
          />
        )}

        {/* Tutorial Card Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative max-w-md w-full bg-slate-900/90 border border-cyan-500/30 backdrop-blur-xl rounded-2xl p-6 shadow-[0_0_50px_rgba(6,182,212,0.25)] z-50 overflow-hidden"
          style={{
            // Position near target if spotlight is active to preserve ergonomics
            transform: spotlightRect ? 'translateY(0px)' : 'none'
          }}
        >
          {/* Subtle Cybernetic Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-40"></div>
          
          {/* Active Highlight Glow Ring */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative space-y-4">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="p-2 border border-cyan-500/20 bg-cyan-950/40 rounded-xl">
                  {activeStep.icon}
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-cyan-200">
                    {activeStep.title}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                    Step {currentStep + 1} of {steps.length} • Splicer Manual
                  </p>
                </div>
              </div>
              <button 
                onClick={handleSkip}
                className="text-slate-500 hover:text-white hover:bg-slate-800/60 p-1.5 rounded-lg transition-colors cursor-pointer"
                title="Exit Tutorial"
              >
                <X size={15} />
              </button>
            </div>

            {/* Description Body Code */}
            <div className="text-xs text-slate-300 leading-relaxed font-medium bg-slate-950/40 border border-white/5 p-4 rounded-xl">
              {activeStep.desc}
            </div>

            {/* Micro Hint Info Tab */}
            {activeStep.hint && (
              <div className="flex gap-2 items-start bg-indigo-550/10 border border-indigo-500/20 px-3 py-2.5 rounded-lg">
                <Bookmark className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5 animate-pulse" />
                <p className="text-[10.5px] text-indigo-200 tracking-tight font-semibold leading-relaxed">
                  <span className="text-indigo-300 font-extrabold uppercase">Tactical Advice: </span>
                  {activeStep.hint}
                </p>
              </div>
            )}

            {/* Navigation Indicators & Buttons Block */}
            <div className="flex justify-between items-center pt-2">
              {/* Stepper Dots Indicator */}
              <div className="flex items-center gap-1.5">
                {steps.map((_, idx) => (
                  <button
                    key={`tutorial-step-dot-${idx}`}
                    onClick={() => setCurrentStep(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === currentStep 
                        ? 'w-5 bg-cyan-400' 
                        : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                    }`}
                  />
                ))}
              </div>

              {/* Back / Next action buttons */}
              <div className="flex items-center gap-2">
                {currentStep > 0 && (
                  <button
                    onClick={handlePrev}
                    className="flex items-center gap-1 px-3 py-2 text-[10px] font-bold tracking-wider text-slate-400 hover:text-white bg-slate-850 hover:bg-slate-800 border border-white/5 rounded-lg uppercase transition-all cursor-pointer select-none active:scale-95"
                  >
                    <ChevronLeft size={12} /> Back
                  </button>
                )}

                <button
                  onClick={handleNext}
                  className="flex items-center gap-1 px-4 py-2 text-[10px] font-black tracking-wider text-slate-950 bg-gradient-to-r from-cyan-400 to-indigo-400 hover:from-cyan-300 hover:to-indigo-300 rounded-lg uppercase transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer select-none active:scale-95 animate-pulse"
                >
                  {currentStep === steps.length - 1 ? "Complete Training" : "Review Next"} <ChevronRight size={12} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
