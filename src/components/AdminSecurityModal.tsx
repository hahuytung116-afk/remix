import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  Lock, 
  Unlock, 
  Terminal, 
  AlertTriangle, 
  X, 
  KeyRound, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Flame,
  Cpu
} from 'lucide-react';

export interface AdminSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Obfuscated hash & key verification for secondary admin passcode "RAHH"
const VERIFY_PASSCODE = (input: string): boolean => {
  const clean = input.trim().toUpperCase();
  if (clean === 'RAHH') return true;
  // Fallback checks
  try {
    if (btoa(clean) === 'UkFISE==') return true;
  } catch {
    // ignore
  }
  return false;
};

export const AdminSecurityModal: React.FC<AdminSecurityModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPasscode('');
      setErrorMsg('');
      setIsSuccess(false);
      setIsProcessing(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isProcessing || isSuccess) return;

    setErrorMsg('');
    setIsProcessing(true);

    setTimeout(() => {
      if (VERIFY_PASSCODE(passcode)) {
        setIsSuccess(true);
        setIsProcessing(false);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 900);
      } else {
        setIsProcessing(false);
        setAttempts(prev => prev + 1);
        setErrorMsg(`ACCESS DENIED: Invalid secondary passcode (Attempt ${attempts + 1})`);
        setPasscode('');
        inputRef.current?.focus();
      }
    }, 400);
  };

  return (
    <div id="admin-security-modal" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 15 }}
        className="w-full max-w-md bg-slate-950/95 border-2 border-red-500/60 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.35)] overflow-hidden flex flex-col font-mono relative text-left"
      >
        {/* Top Scanline effect bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-red-600 via-amber-500 to-rose-600 animate-pulse" />

        {/* Modal Header */}
        <div className="p-4 bg-slate-900/90 border-b border-red-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 animate-pulse">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-black uppercase text-red-400 tracking-wider flex items-center gap-1.5 leading-tight">
                ADMIN CLEARANCE PROTOCOL
              </h2>
              <p className="text-[9px] text-slate-400 tracking-widest uppercase mt-0.5">
                Secondary Security Gate • Level 5
              </p>
            </div>
          </div>
          <button
            id="close-admin-security-modal"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          <div className="p-3 bg-red-950/30 border border-red-500/30 rounded-xl flex items-start gap-2.5">
            <Cpu size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-[10px] text-slate-300 leading-relaxed">
              <span className="text-red-400 font-bold uppercase">Restricted Developer Authorization:</span> Even with game code access or host privileges, you must authenticate with the secondary admin passcode to unlock root permissions.
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-black tracking-widest text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <KeyRound size={12} className="text-amber-400" />
                  Secondary Admin Password:
                </span>
                {attempts > 0 && (
                  <span className="text-red-400 text-[8.5px]">Failed: {attempts}</span>
                )}
              </label>

              <div className="relative">
                <input
                  ref={inputRef}
                  id="admin-secondary-passcode-input"
                  type={showPassword ? "text" : "password"}
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter Password..."
                  disabled={isProcessing || isSuccess}
                  className={`w-full py-3 pl-4 pr-11 bg-slate-900/90 border rounded-xl text-white font-mono text-sm tracking-widest focus:outline-none transition-all placeholder:text-slate-600 ${
                    errorMsg 
                      ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                      : isSuccess
                      ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)] text-green-400'
                      : 'border-white/15 focus:border-red-400 focus:shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-2.5 bg-red-950/60 border border-red-500/50 rounded-lg text-red-300 text-[10px] flex items-center gap-2"
              >
                <AlertTriangle size={13} className="text-red-400 flex-shrink-0" />
                <span className="font-mono">{errorMsg}</span>
              </motion.div>
            )}

            {/* Success Message */}
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-green-950/70 border border-green-500/50 rounded-xl text-green-300 text-[11px] font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
              >
                <CheckCircle2 size={16} className="text-green-400" />
                <span>ACCESS GRANTED • ADMIN AUTHENTICATED</span>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing || isSuccess}
                className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 rounded-xl text-[10px] uppercase font-black tracking-wider transition-all cursor-pointer active:scale-95"
              >
                Cancel
              </button>

              <button
                id="submit-admin-passcode-btn"
                type="submit"
                disabled={isProcessing || isSuccess || !passcode.trim()}
                className={`py-2.5 px-3 rounded-xl text-[10px] uppercase font-black tracking-wider transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer ${
                  isSuccess
                    ? 'bg-green-500 text-slate-950 font-black'
                    : isProcessing
                    ? 'bg-red-900/50 text-red-300 border border-red-500/40 cursor-wait'
                    : passcode.trim()
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] border border-red-400'
                    : 'bg-slate-800/60 text-slate-500 border border-white/5 cursor-not-allowed'
                }`}
              >
                {isProcessing ? (
                  <span>AUTHENTICATING...</span>
                ) : isSuccess ? (
                  <span>UNLOCKED</span>
                ) : (
                  <>
                    <Unlock size={13} />
                    <span>UNLOCK ADMIN</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer info */}
        <div className="p-2.5 bg-slate-950 border-t border-white/5 text-center text-[8px] text-slate-500 uppercase tracking-widest">
          SECURITY PROTOCOL • ACCESS RESTRICTED TO AUTHORIZED OPERATORS
        </div>
      </motion.div>
    </div>
  );
};

export default AdminSecurityModal;
