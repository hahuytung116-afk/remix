import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gamepad2, 
  Trophy, 
  Coins, 
  Sparkles, 
  Flame, 
  Shield, 
  Zap, 
  Heart, 
  RotateCcw, 
  Play, 
  Pause, 
  X, 
  Award, 
  Dna, 
  Star, 
  ArrowLeft, 
  ArrowRight,
  Target,
  CircleDot,
  Volume2,
  VolumeX,
  Gift
} from 'lucide-react';
import { gameAudio } from '../utils/audio';
import CapybaraAvatar from './CapybaraAvatar';
import AnimalAvatar from './AnimalAvatar';

interface PrimalArcadeModalProps {
  isOpen: boolean;
  onClose: () => void;
  meat: number;
  dna: number;
  shardsOfGods?: number;
  capyCoins?: number;
  gameTokens?: number;
  onUseGameTokens?: (amount: number) => boolean;
  onReward: (shards: number, meat: number, dna: number) => void;
}

type MinigameTab = 'hub' | 'catcher' | 'plinko' | 'whack';

// Item types for Catcher minigame
interface FallingItem {
  id: number;
  x: number;
  y: number;
  speed: number;
  type: 'yuzu' | 'meat' | 'shard' | 'dna' | 'star' | 'magnet' | 'shield' | 'bomb';
  size: number;
  rotation: number;
  rotSpeed: number;
  collected?: boolean;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  opacity: number;
}

// Plinko Ball and Peg interfaces
interface PlinkoPeg {
  x: number;
  y: number;
  radius: number;
  hitGlow: number;
}

interface PlinkoBall {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  betAmount: number;
  betType: 'meat' | 'dna';
  trail: { x: number; y: number; alpha: number }[];
  settled?: boolean;
  pocketIndex?: number;
}

// Whack-a-boss hole interface
interface WhackHole {
  id: number;
  occupied: boolean;
  type: 'hunter' | 'dino' | 'glitch' | 'gold_capy' | 'bomb';
  timeLeft: number;
  maxTime: number;
  hit: boolean;
  scale: number;
}

export const PrimalArcadeModal: React.FC<PrimalArcadeModalProps> = ({
  isOpen,
  onClose,
  meat,
  dna,
  shardsOfGods = 0,
  capyCoins = 0,
  gameTokens = 0,
  onUseGameTokens,
  onReward,
}) => {
  const [activeTab, setActiveTab] = useState<MinigameTab>('hub');
  
  // High scores stored in localStorage
  const [highScores, setHighScores] = useState<{ catcher: number; plinko: number; whack: number }>({
    catcher: 0,
    plinko: 0,
    whack: 0,
  });

  // Out of game tokens modal prompt
  const [showNoTokensModal, setShowNoTokensModal] = useState<boolean>(false);

  // Sound toggle for arcade
  const [arcadeSound, setArcadeSound] = useState<boolean>(true);

  // Load high scores on mount
  useEffect(() => {
    try {
      const savedScores = localStorage.getItem('primal_arcade_highscores');
      if (savedScores) {
        setHighScores(JSON.parse(savedScores));
      }
    } catch {}
  }, []);

  const saveScore = (game: 'catcher' | 'plinko' | 'whack', score: number) => {
    setHighScores(prev => {
      if (score > prev[game]) {
        const next = { ...prev, [game]: score };
        try {
          localStorage.setItem('primal_arcade_highscores', JSON.stringify(next));
        } catch {}
        return next;
      }
      return prev;
    });
  };

  // Sound helper
  const playBeep = (freq: number, type: OscillatorType = 'sine', duration: number = 0.08, vol: number = 0.15) => {
    if (!arcadeSound) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  };

  // Helper to handle play entry verification using Game Tokens (10% drop chance from defeated enemies)
  const verifyAndConsumePlay = (tokenCost: number = 1): boolean => {
    if (onUseGameTokens) {
      const success = onUseGameTokens(tokenCost);
      if (success) {
        playBeep(523.25, 'triangle', 0.1, 0.15);
        return true;
      } else {
        playBeep(180, 'sawtooth', 0.2, 0.25);
        setShowNoTokensModal(true);
        return false;
      }
    }

    if (gameTokens >= tokenCost) {
      playBeep(523.25, 'triangle', 0.1, 0.15);
      return true;
    }

    playBeep(180, 'sawtooth', 0.2, 0.25);
    setShowNoTokensModal(true);
    return false;
  };

  // ---------------------------------------------------------------------------
  // 1. CAPYBARA YUZU CATCHER GAME STATE & LOGIC
  // ---------------------------------------------------------------------------
  const catcherCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [catcherRunning, setCatcherRunning] = useState(false);
  const [catcherScore, setCatcherScore] = useState(0);
  const [catcherLives, setCatcherLives] = useState(3);
  const [catcherCombo, setCatcherCombo] = useState(1);
  const [catcherFrenzy, setCatcherFrenzy] = useState(0); // frenzy timer
  const [catcherMagnet, setCatcherMagnet] = useState(0); // magnet timer
  const [catcherShield, setCatcherShield] = useState(false);
  const [catcherGameOver, setCatcherGameOver] = useState(false);
  const [catcherRewards, setCatcherRewards] = useState({ meat: 0, dna: 0, shards: 0 });

  const catcherPlayerX = useRef(200);
  const catcherTargetX = useRef(200);
  const catcherKeys = useRef<{ left: boolean; right: boolean }>({ left: false, right: false });
  const catcherItems = useRef<FallingItem[]>([]);
  const catcherTexts = useRef<FloatingText[]>([]);
  const catcherAnimRef = useRef<number | null>(null);
  const catcherNextItemId = useRef(1);

  const startCatcherGame = () => {
    if (!verifyAndConsumePlay(1)) return;

    setCatcherScore(0);
    setCatcherLives(3);
    setCatcherCombo(1);
    setCatcherFrenzy(0);
    setCatcherMagnet(0);
    setCatcherShield(false);
    setCatcherGameOver(false);
    setCatcherRewards({ meat: 0, dna: 0, shards: 0 });
    catcherPlayerX.current = 200;
    catcherTargetX.current = 200;
    catcherItems.current = [];
    catcherTexts.current = [];
    setCatcherRunning(true);
    playBeep(587.33, 'triangle', 0.2, 0.2);
  };

  // Catcher Game Loop
  useEffect(() => {
    if (!catcherRunning || activeTab !== 'catcher') {
      if (catcherAnimRef.current) cancelAnimationFrame(catcherAnimRef.current);
      return;
    }

    const canvas = catcherCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastSpawn = Date.now();
    let lastTime = Date.now();

    const loop = () => {
      const now = Date.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Handle keyboard movement
      const moveSpeed = 420;
      if (catcherKeys.current.left) {
        catcherPlayerX.current = Math.max(30, catcherPlayerX.current - moveSpeed * dt);
      }
      if (catcherKeys.current.right) {
        catcherPlayerX.current = Math.min(canvas.width - 30, catcherPlayerX.current + moveSpeed * dt);
      }
      // Smooth interpolation toward touch/mouse target
      if (Math.abs(catcherTargetX.current - catcherPlayerX.current) > 2) {
        catcherPlayerX.current += (catcherTargetX.current - catcherPlayerX.current) * 0.25;
      }

      // Decrement frenzy / magnet timers
      setCatcherFrenzy(prev => Math.max(0, prev - dt));
      setCatcherMagnet(prev => Math.max(0, prev - dt));

      // Spawn falling items
      const isFrenzy = catcherFrenzy > 0;
      const spawnInterval = isFrenzy ? 200 : 480;
      if (now - lastSpawn > spawnInterval) {
        lastSpawn = now;
        const rand = Math.random();
        let type: FallingItem['type'] = 'yuzu';
        if (isFrenzy) {
          type = rand < 0.4 ? 'yuzu' : rand < 0.7 ? 'meat' : rand < 0.9 ? 'dna' : 'star';
        } else {
          if (rand < 0.38) type = 'yuzu';
          else if (rand < 0.60) type = 'meat';
          else if (rand < 0.72) type = 'dna';
          else if (rand < 0.78) type = 'bomb';
          else if (rand < 0.86) type = 'bomb';
          else if (rand < 0.92) type = 'star';
          else if (rand < 0.96) type = 'magnet';
          else if (rand < 0.98) type = 'shield';
          else type = 'shard';
        }

        catcherItems.current.push({
          id: catcherNextItemId.current++,
          x: 25 + Math.random() * (canvas.width - 50),
          y: -20,
          speed: (140 + Math.random() * 90) * (isFrenzy ? 1.3 : 1),
          type,
          size: type === 'shard' || type === 'star' ? 18 : 16,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 4,
        });
      }

      // Clear Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background Sky / Orchard gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      if (catcherFrenzy > 0) {
        bgGrad.addColorStop(0, '#31103f');
        bgGrad.addColorStop(1, '#1e1b4b');
      } else {
        bgGrad.addColorStop(0, '#0f172a');
        bgGrad.addColorStop(1, '#020617');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw subtle orchard grass at bottom
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(0, canvas.height - 24, canvas.width, 24);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(0, canvas.height - 24, canvas.width, 3);

      const playerY = canvas.height - 38;
      const playerRadius = 26;

      // Magnet effect: pull nearby items toward player
      const isMagnet = catcherMagnet > 0;
      if (isMagnet) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(catcherPlayerX.current, playerY, 90, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Update & Draw falling items
      for (let i = catcherItems.current.length - 1; i >= 0; i--) {
        const item = catcherItems.current[i];
        item.y += item.speed * dt;
        item.rotation += item.rotSpeed * dt;

        // Magnet attraction
        if (isMagnet && item.type !== 'bomb') {
          const dx = catcherPlayerX.current - item.x;
          const dy = playerY - item.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            item.x += (dx / dist) * 220 * dt;
            item.y += (dy / dist) * 220 * dt;
          }
        }

        // Draw item
        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.rotate(item.rotation);

        switch (item.type) {
          case 'yuzu':
            // 🍊 Golden Yuzu Citrus
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.arc(0, 0, item.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fde68a';
            ctx.beginPath();
            ctx.arc(-3, -3, item.size * 0.4, 0, Math.PI * 2);
            ctx.fill();
            // Leaf
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(-2, -item.size - 3, 5, 4);
            break;

          case 'meat':
            // 🥩 Prime Meat Rib
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.roundRect(-item.size, -item.size * 0.6, item.size * 2, item.size * 1.2, 4);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-item.size + 2, 0, 3.5, 0, Math.PI * 2);
            ctx.arc(item.size - 2, 0, 3.5, 0, Math.PI * 2);
            ctx.fill();
            break;

          case 'dna':
            // 🧪 DNA Flask / Orb
            ctx.fillStyle = '#818cf8';
            ctx.beginPath();
            ctx.arc(0, 0, item.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#c7d2fe';
            ctx.beginPath();
            ctx.arc(0, 0, item.size * 0.5, 0, Math.PI * 2);
            ctx.fill();
            break;

          case 'shard':
            // 💎 Shard of Gods Diamond
            ctx.fillStyle = '#ec4899';
            ctx.beginPath();
            ctx.moveTo(0, -item.size * 1.3);
            ctx.lineTo(item.size, 0);
            ctx.lineTo(0, item.size * 1.3);
            ctx.lineTo(-item.size, 0);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#fbcfe8';
            ctx.beginPath();
            ctx.moveTo(0, -item.size * 0.7);
            ctx.lineTo(item.size * 0.5, 0);
            ctx.lineTo(0, item.size * 0.7);
            ctx.lineTo(-item.size * 0.5, 0);
            ctx.closePath();
            ctx.fill();
            break;

          case 'star':
            // ⭐ Rainbow Frenzy Star
            ctx.fillStyle = '#eab308';
            ctx.beginPath();
            for (let s = 0; s < 5; s++) {
              ctx.lineTo(Math.cos((18 + s * 72) * 0.01745) * item.size, -Math.sin((18 + s * 72) * 0.01745) * item.size);
              ctx.lineTo(Math.cos((54 + s * 72) * 0.01745) * (item.size * 0.5), -Math.sin((54 + s * 72) * 0.01745) * (item.size * 0.5));
            }
            ctx.closePath();
            ctx.fill();
            break;

          case 'magnet':
            // 🧲 Magnet
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(0, 0, item.size * 0.8, Math.PI, 0);
            ctx.stroke();
            break;

          case 'shield':
            // 🛡️ Shield
            ctx.fillStyle = '#06b6d4';
            ctx.beginPath();
            ctx.arc(0, 0, item.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, 0, item.size * 0.5, 0, Math.PI * 2);
            ctx.fill();
            break;

          case 'bomb':
            // 💣 Spike Bomb Hazard
            ctx.fillStyle = '#334155';
            ctx.beginPath();
            ctx.arc(0, 0, item.size, 0, Math.PI * 2);
            ctx.fill();
            // Red fuse light
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(0, -item.size - 2, 3, 0, Math.PI * 2);
            ctx.fill();
            // Spikes
            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 2;
            for (let sp = 0; sp < 4; sp++) {
              const ang = sp * (Math.PI / 2);
              ctx.moveTo(Math.cos(ang) * item.size, Math.sin(ang) * item.size);
              ctx.lineTo(Math.cos(ang) * (item.size + 4), Math.sin(ang) * (item.size + 4));
            }
            ctx.stroke();
            break;
        }
        ctx.restore();

        // Check collision with Capybara catcher
        const distToPlayer = Math.hypot(item.x - catcherPlayerX.current, item.y - playerY);
        if (distToPlayer < playerRadius + item.size) {
          // Collected item!
          catcherItems.current.splice(i, 1);

          if (item.type === 'bomb') {
            if (catcherShield) {
              setCatcherShield(false);
              playBeep(330, 'square', 0.15, 0.2);
              catcherTexts.current.push({
                id: Date.now() + Math.random(),
                x: catcherPlayerX.current,
                y: playerY - 30,
                text: 'SHIELD BLOCKED!',
                color: '#38bdf8',
                opacity: 1,
              });
            } else {
              playBeep(180, 'sawtooth', 0.25, 0.25);
              setCatcherLives(l => {
                const nextLives = l - 1;
                if (nextLives <= 0) {
                  setCatcherRunning(false);
                  setCatcherGameOver(true);
                  saveScore('catcher', catcherScore);
                }
                return nextLives;
              });
              setCatcherCombo(1);
              catcherTexts.current.push({
                id: Date.now() + Math.random(),
                x: catcherPlayerX.current,
                y: playerY - 30,
                text: '💔 -1 HEART!',
                color: '#ef4444',
                opacity: 1,
              });
            }
          } else {
            // Success Catch!
            playBeep(440 + catcherCombo * 40, 'sine', 0.08, 0.18);
            setCatcherCombo(c => Math.min(10, c + 1));
            
            let pts = 10 * catcherCombo;
            let text = `+${pts}`;
            let textColor = '#facc15';

            if (item.type === 'yuzu') {
              pts = 25 * catcherCombo;
              text = `+${pts} (🍊 +15 DNA)`;
              textColor = '#f59e0b';
              setCatcherRewards(r => ({ ...r, dna: r.dna + 15 }));
            } else if (item.type === 'meat') {
              pts = 40 * catcherCombo;
              text = `+${pts} (🥩 +100 Meat)`;
              textColor = '#ef4444';
              setCatcherRewards(r => ({ ...r, meat: r.meat + 100 }));
            } else if (item.type === 'dna') {
              pts = 50 * catcherCombo;
              text = `+${pts} (🧪 +50 DNA)`;
              textColor = '#818cf8';
              setCatcherRewards(r => ({ ...r, dna: r.dna + 50 }));
            } else if (item.type === 'shard') {
              pts = 250;
              text = `+${pts} (💎 +1 GOD SHARD!)`;
              textColor = '#ec4899';
              setCatcherRewards(r => ({ ...r, shards: r.shards + 1 }));
            } else if (item.type === 'star') {
              pts = 100;
              text = '🌟 FRENZY MODE!';
              textColor = '#facc15';
              setCatcherFrenzy(6);
            } else if (item.type === 'magnet') {
              pts = 50;
              text = '🧲 MAGNET!';
              textColor = '#38bdf8';
              setCatcherMagnet(8);
            } else if (item.type === 'shield') {
              pts = 50;
              text = '🛡️ SHIELD UP!';
              textColor = '#22d3ee';
              setCatcherShield(true);
            }

            setCatcherScore(s => s + pts);
            catcherTexts.current.push({
              id: Date.now() + Math.random(),
              x: catcherPlayerX.current,
              y: playerY - 30,
              text,
              color: textColor,
              opacity: 1,
            });
          }
          continue;
        }

        // Missed item falling off screen
        if (item.y > canvas.height + 20) {
          if (item.type !== 'bomb') {
            setCatcherCombo(1); // reset combo streak on missed fruit
          }
          catcherItems.current.splice(i, 1);
        }
      }

      // Draw Capybara Catcher Avatar
      ctx.save();
      ctx.translate(catcherPlayerX.current, playerY);

      // Shield Aura
      if (catcherShield) {
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#22d3ee';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 0, playerRadius + 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Capybara Body
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.ellipse(0, 2, playerRadius, playerRadius * 0.75, 0, 0, Math.PI * 2);
      ctx.fill();

      // Capybara Snout
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.ellipse(playerRadius * 0.6, 2, 8, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Capybara Eye
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(playerRadius * 0.3, -4, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Capybara Snug Yuzu on Head
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, -playerRadius * 0.7, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(-1, -playerRadius * 0.7 - 9, 3, 3);

      // Catcher Basket
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, -6, playerRadius + 8, 0, Math.PI);
      ctx.stroke();

      ctx.restore();

      // Draw Floating Texts
      for (let t = catcherTexts.current.length - 1; t >= 0; t--) {
        const ft = catcherTexts.current[t];
        ft.y -= 35 * dt;
        ft.opacity -= 1.2 * dt;

        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.opacity);
        ctx.font = '900 12px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#000000';
        ctx.fillText(ft.text, ft.x + 1, ft.y + 1);
        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();

        if (ft.opacity <= 0) {
          catcherTexts.current.splice(t, 1);
        }
      }

      // Draw HUD inside Canvas
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 13px "Inter", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`SCORE: ${catcherScore}`, 14, 24);

      if (catcherCombo > 1) {
        ctx.fillStyle = '#facc15';
        ctx.fillText(`COMBO x${catcherCombo}! 🔥`, 14, 42);
      }

      if (catcherFrenzy > 0) {
        ctx.fillStyle = '#ec4899';
        ctx.fillText(`🌟 FRENZY: ${catcherFrenzy.toFixed(1)}s`, canvas.width - 120, 24);
      }

      catcherAnimRef.current = requestAnimationFrame(loop);
    };

    catcherAnimRef.current = requestAnimationFrame(loop);

    return () => {
      if (catcherAnimRef.current) cancelAnimationFrame(catcherAnimRef.current);
    };
  }, [catcherRunning, catcherFrenzy, catcherMagnet, catcherShield, activeTab, catcherScore, catcherCombo]);

  // Keyboard listeners for Catcher
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== 'catcher') return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        catcherKeys.current.left = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        catcherKeys.current.right = true;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        catcherKeys.current.left = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        catcherKeys.current.right = false;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeTab]);

  // Claim Catcher rewards
  const claimCatcherRewards = () => {
    onReward(catcherRewards.shards, catcherRewards.meat, catcherRewards.dna);
    saveScore('catcher', catcherScore);
    setCatcherGameOver(false);
    setCatcherRunning(false);
  };

  // ---------------------------------------------------------------------------
  // 2. LUCKY PLINKO / PEG PINBALL GAME STATE & LOGIC
  // ---------------------------------------------------------------------------
  const plinkoCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const plinkoPegs = useRef<PlinkoPeg[]>([]);
  const plinkoBalls = useRef<PlinkoBall[]>([]);
  const plinkoAnimRef = useRef<number | null>(null);
  const [plinkoBetAmount, setPlinkoBetAmount] = useState<number>(200);
  const [plinkoBetCurrency, setPlinkoBetCurrency] = useState<'meat' | 'dna'>('meat');
  const [plinkoLastWin, setPlinkoLastWin] = useState<{ amount: number; multiplier: number; currency: 'meat' | 'dna' } | null>(null);
  const [plinkoTotalWon, setPlinkoTotalWon] = useState<{ meat: number; dna: number; shards: number }>({ meat: 0, dna: 0, shards: 0 });

  const POCKET_MULTIPLIERS = [50, 10, 3, 1.5, 0.5, 1.5, 3, 10, 50];
  const POCKET_COLORS = ['#ec4899', '#f97316', '#eab308', '#22c55e', '#64748b', '#22c55e', '#eab308', '#f97316', '#ec4899'];

  // Initialize Plinko Pegboard
  const initPlinkoBoard = (width: number, height: number) => {
    const pegs: PlinkoPeg[] = [];
    const rows = 8;
    const startY = 70;
    const endY = height - 60;
    const ySpacing = (endY - startY) / (rows - 1);

    for (let r = 0; r < rows; r++) {
      const pegCount = r + 3;
      const rowY = startY + r * ySpacing;
      const totalRowWidth = (pegCount - 1) * 38;
      const startX = (width - totalRowWidth) / 2;

      for (let c = 0; c < pegCount; c++) {
        pegs.push({
          x: startX + c * 38,
          y: rowY,
          radius: 4,
          hitGlow: 0,
        });
      }
    }
    plinkoPegs.current = pegs;
  };

  // Drop Plinko Ball (1 Token per ball, or 3 tokens for 3x drop)
  const dropPlinkoBall = (count: number = 1) => {
    if (!verifyAndConsumePlay(count)) return;

    const canvas = plinkoCanvasRef.current;
    const width = canvas ? canvas.width : 400;

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const startX = width / 2 + (Math.random() - 0.5) * 40;
        plinkoBalls.current.push({
          id: Date.now() + Math.random(),
          x: startX,
          y: 25,
          vx: (Math.random() - 0.5) * 2,
          vy: 1.5,
          radius: 7,
          color: plinkoBetCurrency === 'meat' ? '#ef4444' : '#818cf8',
          betAmount: 1000,
          betType: plinkoBetCurrency,
          trail: [],
        });
        playBeep(523.25, 'triangle', 0.1, 0.15);
      }, i * 160);
    }
  };

  // Plinko animation loop
  useEffect(() => {
    if (activeTab !== 'plinko') {
      if (plinkoAnimRef.current) cancelAnimationFrame(plinkoAnimRef.current);
      return;
    }

    const canvas = plinkoCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (plinkoPegs.current.length === 0) {
      initPlinkoBoard(canvas.width, canvas.height);
    }

    let lastTime = Date.now();

    const loop = () => {
      const now = Date.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dark futuristic casino backdrop
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Multiplier Pockets at Bottom
      const pocketWidth = canvas.width / POCKET_MULTIPLIERS.length;
      const pocketY = canvas.height - 45;
      
      POCKET_MULTIPLIERS.forEach((mult, idx) => {
        const px = idx * pocketWidth;
        ctx.fillStyle = `${POCKET_COLORS[idx]}25`;
        ctx.fillRect(px + 1, pocketY, pocketWidth - 2, 40);

        ctx.strokeStyle = POCKET_COLORS[idx];
        ctx.lineWidth = 1.5;
        ctx.strokeRect(px + 1, pocketY, pocketWidth - 2, 40);

        ctx.fillStyle = POCKET_COLORS[idx];
        ctx.font = '900 10.5px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${mult}x`, px + pocketWidth / 2, pocketY + 24);
      });

      // Update & Draw Pegs
      plinkoPegs.current.forEach(peg => {
        if (peg.hitGlow > 0) peg.hitGlow = Math.max(0, peg.hitGlow - dt * 4);

        ctx.save();
        ctx.fillStyle = peg.hitGlow > 0 ? '#facc15' : '#94a3b8';
        if (peg.hitGlow > 0) {
          ctx.shadowColor = '#eab308';
          ctx.shadowBlur = 8;
        }
        ctx.beginPath();
        ctx.arc(peg.x, peg.y, peg.radius + peg.hitGlow * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Physics update for Balls
      const gravity = 380;
      const bounce = 0.58;

      for (let b = plinkoBalls.current.length - 1; b >= 0; b--) {
        const ball = plinkoBalls.current[b];
        
        // Gravity
        ball.vy += gravity * dt;
        ball.x += ball.vx * 60 * dt;
        ball.y += ball.vy * dt;

        // Trail
        ball.trail.push({ x: ball.x, y: ball.y, alpha: 0.6 });
        if (ball.trail.length > 6) ball.trail.shift();

        // Draw Trail
        ball.trail.forEach(t => {
          ctx.fillStyle = `${ball.color}40`;
          ctx.beginPath();
          ctx.arc(t.x, t.y, ball.radius * 0.7, 0, Math.PI * 2);
          ctx.fill();
        });

        // Left/Right Wall Bounce
        if (ball.x - ball.radius < 10) {
          ball.x = 10 + ball.radius;
          ball.vx = Math.abs(ball.vx) * bounce;
        }
        if (ball.x + ball.radius > canvas.width - 10) {
          ball.x = canvas.width - 10 - ball.radius;
          ball.vx = -Math.abs(ball.vx) * bounce;
        }

        // Peg Collisions
        plinkoPegs.current.forEach(peg => {
          const dx = ball.x - peg.x;
          const dy = ball.y - peg.y;
          const dist = Math.hypot(dx, dy);
          const minDist = ball.radius + peg.radius;

          if (dist < minDist) {
            // Push ball out of peg
            const angle = Math.atan2(dy, dx);
            ball.x = peg.x + Math.cos(angle) * (minDist + 0.5);
            ball.y = peg.y + Math.sin(angle) * (minDist + 0.5);

            // Reflect velocity with small randomness
            const speed = Math.hypot(ball.vx, ball.vy);
            ball.vx = Math.cos(angle) * speed * bounce + (Math.random() - 0.5) * 1.5;
            ball.vy = Math.sin(angle) * speed * bounce;

            peg.hitGlow = 1.0;
            playBeep(350 + (peg.y / canvas.height) * 300, 'sine', 0.04, 0.08);
          }
        });

        // Draw Ball
        ctx.save();
        ctx.fillStyle = ball.color;
        ctx.shadowColor = ball.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ball.x - 2, ball.y - 2, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Check if ball landed in pocket
        if (ball.y >= pocketY + 10) {
          const pIndex = Math.max(0, Math.min(POCKET_MULTIPLIERS.length - 1, Math.floor(ball.x / pocketWidth)));
          const mult = POCKET_MULTIPLIERS[pIndex];
          const winAmount = Math.floor(ball.betAmount * mult);

          // Payout reward!
          if (ball.betType === 'meat') {
            onReward(0, winAmount, 0);
            setPlinkoTotalWon(w => ({ ...w, meat: w.meat + winAmount }));
          } else {
            onReward(0, 0, winAmount);
            setPlinkoTotalWon(w => ({ ...w, dna: w.dna + winAmount }));
          }

          // Shards of gods bonus on jackpot!
          if (mult === 50) {
            onReward(2, 0, 0);
            setPlinkoTotalWon(w => ({ ...w, shards: w.shards + 2 }));
            playBeep(880, 'triangle', 0.4, 0.3);
          } else {
            playBeep(587.33, 'triangle', 0.15, 0.2);
          }

          setPlinkoLastWin({ amount: winAmount, multiplier: mult, currency: ball.betType });
          saveScore('plinko', winAmount);
          plinkoBalls.current.splice(b, 1);
        }
      }

      plinkoAnimRef.current = requestAnimationFrame(loop);
    };

    plinkoAnimRef.current = requestAnimationFrame(loop);

    return () => {
      if (plinkoAnimRef.current) cancelAnimationFrame(plinkoAnimRef.current);
    };
  }, [activeTab, meat, dna, gameTokens, plinkoBetAmount, plinkoBetCurrency]);

  // ---------------------------------------------------------------------------
  // 3. PRIMAL WHACK-A-BOSS GAME STATE & LOGIC
  // ---------------------------------------------------------------------------
  const [whackRunning, setWhackRunning] = useState(false);
  const [whackTimeLeft, setWhackTimeLeft] = useState(40);
  const [whackScore, setWhackScore] = useState(0);
  const [whackCombo, setWhackCombo] = useState(1);
  const [whackGameOver, setWhackGameOver] = useState(false);
  const [whackRewards, setWhackRewards] = useState({ meat: 0, dna: 0, shards: 0 });
  const [whackHoles, setWhackHoles] = useState<WhackHole[]>(
    Array.from({ length: 9 }, (_, i) => ({
      id: i,
      occupied: false,
      type: 'hunter',
      timeLeft: 0,
      maxTime: 1.5,
      hit: false,
      scale: 1,
    }))
  );

  const startWhackGame = () => {
    if (!verifyAndConsumePlay(1)) return;

    setWhackScore(0);
    setWhackCombo(1);
    setWhackTimeLeft(40);
    setWhackGameOver(false);
    setWhackRewards({ meat: 0, dna: 0, shards: 0 });
    setWhackHoles(Array.from({ length: 9 }, (_, i) => ({
      id: i,
      occupied: false,
      type: 'hunter',
      timeLeft: 0,
      maxTime: 1.5,
      hit: false,
      scale: 1,
    })));
    setWhackRunning(true);
    playBeep(659.25, 'triangle', 0.2, 0.2);
  };

  // Whack-a-boss tick loop
  useEffect(() => {
    if (!whackRunning || activeTab !== 'whack') return;

    const timer = setInterval(() => {
      setWhackTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer);
          setWhackRunning(false);
          setWhackGameOver(true);
          saveScore('whack', whackScore);
          return 0;
        }
        return t - 1;
      });

      // Randomly pop up bosses in empty holes
      setWhackHoles(prev => {
        const next = [...prev];
        const emptyIndices = next.map((h, idx) => (!h.occupied ? idx : -1)).filter(idx => idx !== -1);
        
        if (emptyIndices.length > 0 && Math.random() < 0.75) {
          const randHole = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
          const r = Math.random();
          let type: WhackHole['type'] = 'hunter';
          if (r < 0.4) type = 'hunter';
          else if (r < 0.7) type = 'dino';
          else if (r < 0.85) type = 'glitch';
          else if (r < 0.95) type = 'gold_capy';
          else type = 'bomb';

          next[randHole] = {
            id: randHole,
            occupied: true,
            type,
            timeLeft: type === 'gold_capy' ? 1.0 : 1.8,
            maxTime: type === 'gold_capy' ? 1.0 : 1.8,
            hit: false,
            scale: 1,
          };
        }

        // Decrement existing holes
        return next.map(h => {
          if (!h.occupied) return h;
          const nextTime = h.timeLeft - 0.25;
          if (nextTime <= 0) {
            return { ...h, occupied: false, hit: false };
          }
          return { ...h, timeLeft: nextTime };
        });
      });
    }, 250);

    return () => clearInterval(timer);
  }, [whackRunning, activeTab, whackScore]);

  // Click on a Whack Hole
  const handleWhackClick = (holeId: number) => {
    if (!whackRunning) return;
    const hole = whackHoles[holeId];
    if (!hole.occupied || hole.hit) return;

    // Mark as hit
    setWhackHoles(prev => prev.map(h => (h.id === holeId ? { ...h, hit: true, scale: 1.2 } : h)));

    if (hole.type === 'bomb') {
      // Hit bomb penalty
      playBeep(180, 'sawtooth', 0.2, 0.25);
      setWhackCombo(1);
      setWhackScore(s => Math.max(0, s - 100));
    } else {
      // Hit target
      playBeep(523.25 + whackCombo * 50, 'sine', 0.08, 0.2);
      setWhackCombo(c => Math.min(15, c + 1));

      let pts = 50 * whackCombo;
      let meatGain = 50;
      let dnaGain = 10;
      let shardGain = 0;

      if (hole.type === 'dino') {
        pts = 100 * whackCombo;
        meatGain = 120;
        dnaGain = 20;
      } else if (hole.type === 'glitch') {
        pts = 180 * whackCombo;
        meatGain = 200;
        dnaGain = 50;
      } else if (hole.type === 'gold_capy') {
        pts = 500 * whackCombo;
        meatGain = 500;
        dnaGain = 150;
        shardGain = 1;
      }

      setWhackScore(s => s + pts);
      setWhackRewards(r => ({
        meat: r.meat + meatGain,
        dna: r.dna + dnaGain,
        shards: r.shards + shardGain,
      }));
    }

    setTimeout(() => {
      setWhackHoles(prev => prev.map(h => (h.id === holeId ? { ...h, occupied: false, hit: false } : h)));
    }, 180);
  };

  const claimWhackRewards = () => {
    onReward(whackRewards.shards, whackRewards.meat, whackRewards.dna);
    saveScore('whack', whackScore);
    setWhackGameOver(false);
    setWhackRunning(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md select-none">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="relative w-full max-w-2xl bg-slate-900 border-2 border-indigo-500/40 rounded-2xl shadow-[0_0_40px_rgba(99,102,241,0.25)] flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-indigo-500/20">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.3)]">
              <Gamepad2 size={18} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white tracking-wide flex items-center gap-1.5">
                PRIMAL ARCADE & MINIGAMES
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  REAL REWARDS
                </span>
              </h2>
              <p className="text-[10px] text-slate-400">Play arcade games to earn Meat, DNA, & God Shards!</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Sound Toggle */}
            <button
              onClick={() => setArcadeSound(!arcadeSound)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 transition-colors"
              title={arcadeSound ? 'Mute Arcade SFX' : 'Enable Arcade SFX'}
            >
              {arcadeSound ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 hover:text-rose-300 text-slate-400 border border-white/10 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-950/40 border-b border-white/5 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab('hub')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
              activeTab === 'hub'
                ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Trophy size={13} /> Arcade Hub
          </button>
          <button
            onClick={() => setActiveTab('catcher')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
              activeTab === 'catcher'
                ? 'bg-amber-600 text-white shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            🍊 Yuzu Orchard Catch
          </button>
          <button
            onClick={() => setActiveTab('plinko')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
              activeTab === 'plinko'
                ? 'bg-rose-600 text-white shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            🎰 Lucky Plinko Drop
          </button>
          <button
            onClick={() => setActiveTab('whack')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
              activeTab === 'whack'
                ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            🎯 Whack-a-Boss
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* ================================================================= */}
          {/* TAB 1: ARCADE HUB OVERVIEW & HIGHSCORES */}
          {/* ================================================================= */}
          {activeTab === 'hub' && (
            <div className="space-y-4">
              {/* Game Tokens Currency Banner */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-indigo-950/80 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-300 text-2xl flex-shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                    🎮
                  </div>
                  <div>
                    <div className="text-xs font-black text-white flex items-center gap-2">
                      <span>ARCADE GAME TOKENS:</span>
                      <span className="text-amber-400 font-mono text-base font-black">
                        {(gameTokens || 0).toLocaleString()} 🎮
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-300 mt-0.5">
                      Obtain Game Tokens with a <strong className="text-amber-300">10% drop chance</strong> when defeating enemies in Tower Defense waves!
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                  <button
                    onClick={() => setActiveTab('catcher')}
                    disabled={(gameTokens || 0) < 1}
                    className={`px-4 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 ${
                      (gameTokens || 0) >= 1
                        ? 'bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 shadow-[0_0_14px_rgba(245,158,11,0.4)] cursor-pointer hover:scale-105 active:scale-95'
                        : 'bg-slate-800 text-slate-500 border border-white/5 cursor-not-allowed'
                    }`}
                  >
                    <Play size={13} /> PLAY (1 TOKEN)
                  </button>
                </div>
              </div>

              {/* Minigames Grid Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Yuzu Catcher */}
                <div 
                  onClick={() => setActiveTab('catcher')}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-amber-500/30 hover:border-amber-500 transition-all hover:scale-[1.02] cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-2xl group-hover:scale-110 transition-transform">🍊</div>
                      <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        1 Token / Play
                      </span>
                    </div>
                    <h3 className="text-sm font-black text-amber-300 group-hover:text-amber-200">Yuzu Orchard Catch</h3>
                    <p className="text-[10px] text-slate-400 mt-1">Move Capybara to catch falling fruit, steaks & diamonds while dodging bombs!</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">Best Score:</span>
                    <span className="font-mono font-bold text-amber-400">{highScores.catcher} pts</span>
                  </div>
                </div>

                {/* 2. Lucky Plinko */}
                <div 
                  onClick={() => setActiveTab('plinko')}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-rose-500/30 hover:border-rose-500 transition-all hover:scale-[1.02] cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-2xl group-hover:scale-110 transition-transform">🎰</div>
                      <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        1 Token / Drop
                      </span>
                    </div>
                    <h3 className="text-sm font-black text-rose-300 group-hover:text-rose-200">Lucky Plinko Drop</h3>
                    <p className="text-[10px] text-slate-400 mt-1">Drop energy balls down physics pegs to hit massive 50x Jackpot multipliers!</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">Biggest Win:</span>
                    <span className="font-mono font-bold text-rose-400">{highScores.plinko} Meat</span>
                  </div>
                </div>

                {/* 3. Whack-a-Boss */}
                <div 
                  onClick={() => setActiveTab('whack')}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-emerald-500/30 hover:border-emerald-500 transition-all hover:scale-[1.02] cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-2xl group-hover:scale-110 transition-transform">🎯</div>
                      <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        1 Token / 40s
                      </span>
                    </div>
                    <h3 className="text-sm font-black text-emerald-300 group-hover:text-emerald-200">Whack-a-Boss Smash</h3>
                    <p className="text-[10px] text-slate-400 mt-1">Test your reflexes by clicking invading hunter bosses and golden capybaras!</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">Best Score:</span>
                    <span className="font-mono font-bold text-emerald-400">{highScores.whack} pts</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 2: CAPYBARA YUZU CATCHER */}
          {/* ================================================================= */}
          {activeTab === 'catcher' && (
            <div className="flex flex-col items-center space-y-3">
              {/* Controls and HUD bar */}
              <div className="w-full flex flex-wrap items-center justify-between gap-2 px-2 text-xs bg-slate-950/60 p-2.5 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 font-mono text-rose-400 font-bold">
                    {Array.from({ length: 3 }).map((_, idx) => (
                      <Heart 
                        key={idx} 
                        size={14} 
                        className={idx < catcherLives ? 'text-rose-500 fill-rose-500' : 'text-slate-700'} 
                      />
                    ))}
                  </div>
                  <div className="text-amber-400 font-mono font-bold">
                    SCORE: {catcherScore}
                  </div>
                </div>

                {!catcherRunning && !catcherGameOver && (
                  <div>
                    <button
                      onClick={() => startCatcherGame()}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-black text-xs transition-all shadow-[0_0_12px_rgba(245,158,11,0.4)] cursor-pointer active:scale-95"
                    >
                      <Play size={13} /> START GAME (🎮 1 Token)
                    </button>
                  </div>
                )}
              </div>

              {/* Game Canvas Container */}
              <div className="relative w-full max-w-md aspect-[4/3] bg-slate-950 rounded-xl overflow-hidden border-2 border-amber-500/30 shadow-inner">
                <canvas
                  ref={catcherCanvasRef}
                  width={400}
                  height={300}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const scaleX = 400 / rect.width;
                    catcherTargetX.current = (e.clientX - rect.left) * scaleX;
                  }}
                  onTouchMove={(e) => {
                    if (e.touches.length > 0) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const scaleX = 400 / rect.width;
                      catcherTargetX.current = (e.touches[0].clientX - rect.left) * scaleX;
                    }
                  }}
                  className="w-full h-full object-contain cursor-ew-resize"
                />

                {/* Game Over Overlay */}
                {catcherGameOver && (
                  <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center">
                    <h3 className="text-lg font-black text-rose-400 mb-1">GAME OVER</h3>
                    <p className="text-xs text-slate-300 mb-3">Final Score: <span className="text-amber-400 font-mono font-bold">{catcherScore}</span></p>

                    <div className="bg-slate-900 border border-white/10 p-3 rounded-xl w-full max-w-xs mb-4 text-left">
                      <div className="text-[10px] font-black text-slate-400 uppercase mb-1.5">Rewards Earned:</div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-rose-300">🥩 Meat:</span>
                        <span className="font-mono text-emerald-400 font-bold">+{catcherRewards.meat}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-indigo-300">🧪 DNA:</span>
                        <span className="font-mono text-indigo-400 font-bold">+{catcherRewards.dna}</span>
                      </div>
                      {catcherRewards.shards > 0 && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-pink-300">💎 God Shards:</span>
                          <span className="font-mono text-pink-400 font-bold">+{catcherRewards.shards}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={claimCatcherRewards}
                        className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-[0_0_12px_rgba(16,185,129,0.4)] cursor-pointer"
                      >
                        CLAIM & DEPOSIT REWARDS
                      </button>
                      <button
                        onClick={() => startCatcherGame()}
                        className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer shadow-md"
                      >
                        🎮 PLAY AGAIN (1 TOKEN)
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile / Keyboard helpers */}
              <div className="flex items-center justify-between w-full max-w-md text-[10px] text-slate-400 px-2">
                <span>Controls: Move Mouse / Drag Touch / [A][D] or [←][→] Keys</span>
                <span className="text-amber-400">Tokens: {(gameTokens || 0).toLocaleString()} 🎮</span>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 3: LUCKY PLINKO PINBALL DROP */}
          {/* ================================================================= */}
          {activeTab === 'plinko' && (
            <div className="flex flex-col items-center space-y-3">
              {/* Plinko Controls */}
              <div className="w-full flex flex-wrap items-center justify-between gap-2 px-2 text-xs bg-slate-950/60 p-2.5 rounded-xl border border-white/5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400">REWARD MULTIPLIER PAYOUT:</span>
                  <button
                    onClick={() => setPlinkoBetCurrency('meat')}
                    className={`px-2 py-1 rounded text-[10px] font-black cursor-pointer transition-all ${
                      plinkoBetCurrency === 'meat' ? 'bg-rose-600 text-white shadow-sm' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    🥩 MEAT
                  </button>
                  <button
                    onClick={() => setPlinkoBetCurrency('dna')}
                    className={`px-2 py-1 rounded text-[10px] font-black cursor-pointer transition-all ${
                      plinkoBetCurrency === 'dna' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    🧪 DNA
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => dropPlinkoBall(1)}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition-all shadow-[0_0_10px_rgba(244,63,94,0.4)] active:scale-95 cursor-pointer flex items-center gap-1"
                  >
                    <span>🎮 DROP (1 TOKEN)</span>
                  </button>
                  <button
                    onClick={() => dropPlinkoBall(3)}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-black text-xs transition-all shadow-[0_0_10px_rgba(245,158,11,0.4)] active:scale-95 cursor-pointer flex items-center gap-1"
                  >
                    <span>🔥 DROP 3x (3 TOKENS)</span>
                  </button>
                </div>
              </div>

              {/* Plinko Canvas */}
              <div className="relative w-full max-w-md aspect-[4/3] bg-slate-950 rounded-xl overflow-hidden border-2 border-rose-500/30 shadow-inner">
                <canvas
                  ref={plinkoCanvasRef}
                  width={400}
                  height={300}
                  className="w-full h-full object-contain"
                />

                {/* Last win toast */}
                {plinkoLastWin && (
                  <div className="absolute top-2 right-2 bg-slate-900/90 border border-amber-500/40 px-2.5 py-1 rounded-lg text-[10px] font-bold text-amber-300 shadow-md">
                    HIT {plinkoLastWin.multiplier}x! (+{plinkoLastWin.amount} {plinkoLastWin.currency.toUpperCase()})
                  </div>
                )}
              </div>

              {/* Plinko Stats Footer */}
              <div className="flex items-center justify-between w-full max-w-md text-[10px] text-slate-400 px-2">
                <span>Tokens Available: <strong className="text-amber-400 font-mono">{(gameTokens || 0).toLocaleString()} 🎮</strong></span>
                <span>Total Won: <strong className="text-emerald-400 font-mono">+{plinkoTotalWon.meat} Meat / +{plinkoTotalWon.dna} DNA</strong></span>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 4: WHACK-A-BOSS SMASH */}
          {/* ================================================================= */}
          {activeTab === 'whack' && (
            <div className="flex flex-col items-center space-y-3">
              {/* Whack HUD */}
              <div className="w-full flex flex-wrap items-center justify-between gap-2 px-2 text-xs bg-slate-950/60 p-2.5 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="text-emerald-400 font-mono font-bold">
                    TIME: {whackTimeLeft}s
                  </div>
                  <div className="text-amber-400 font-mono font-bold">
                    SCORE: {whackScore} (x{whackCombo})
                  </div>
                </div>

                {!whackRunning && !whackGameOver && (
                  <div>
                    <button
                      onClick={() => startWhackGame()}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-[0_0_12px_rgba(16,185,129,0.4)] cursor-pointer active:scale-95"
                    >
                      <Play size={13} /> START 40s SMASH (🎮 1 Token)
                    </button>
                  </div>
                )}
              </div>

              {/* 3x3 Whack Holes Grid */}
              <div className="relative w-full max-w-md bg-slate-950 p-4 rounded-xl border-2 border-emerald-500/30 shadow-inner">
                <div className="grid grid-cols-3 gap-3">
                  {whackHoles.map(hole => (
                    <div
                      key={hole.id}
                      onClick={() => handleWhackClick(hole.id)}
                      className={`relative aspect-square rounded-xl bg-slate-900 border-2 transition-all cursor-pointer flex items-center justify-center overflow-hidden select-none ${
                        hole.occupied
                          ? hole.type === 'bomb'
                            ? 'border-rose-500 bg-rose-950/40 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                            : hole.type === 'gold_capy'
                              ? 'border-amber-400 bg-amber-950/50 shadow-[0_0_20px_rgba(245,158,11,0.5)] animate-pulse'
                              : 'border-emerald-500/60 bg-emerald-950/30'
                          : 'border-white/5 hover:border-white/15'
                      }`}
                    >
                      {/* Hole Dirt Mound */}
                      <div className="absolute bottom-0 inset-x-0 h-4 bg-slate-950/80 border-t border-white/5 rounded-b-lg" />

                      {/* Popped target */}
                      <AnimatePresence>
                        {hole.occupied && (
                          <motion.div
                            initial={{ y: 20, scale: 0.5, opacity: 0 }}
                            animate={{ 
                              y: 0, 
                              scale: hole.hit ? 1.3 : 1, 
                              opacity: 1, 
                              rotate: hole.hit ? 15 : 0 
                            }}
                            exit={{ y: 20, scale: 0.5, opacity: 0 }}
                            className="flex flex-col items-center"
                          >
                            <span className="text-3xl filter drop-shadow-md">
                              {hole.type === 'hunter' && '🤖'}
                              {hole.type === 'dino' && '🦖'}
                              {hole.type === 'glitch' && '👾'}
                              {hole.type === 'gold_capy' && '✨'}
                              {hole.type === 'bomb' && '💣'}
                            </span>
                            <span className="text-[9px] font-black uppercase mt-1 text-white">
                              {hole.type === 'gold_capy' ? 'GOLDEN!' : hole.type === 'bomb' ? 'DON\'T TAP!' : 'SMASH!'}
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>

                {/* Whack Game Over Modal */}
                {whackGameOver && (
                  <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center rounded-xl">
                    <h3 className="text-lg font-black text-emerald-400 mb-1">TIME'S UP!</h3>
                    <p className="text-xs text-slate-300 mb-3">Final Score: <span className="text-amber-400 font-mono font-bold">{whackScore}</span></p>

                    <div className="bg-slate-900 border border-white/10 p-3 rounded-xl w-full max-w-xs mb-4 text-left">
                      <div className="text-[10px] font-black text-slate-400 uppercase mb-1.5">Rewards Earned:</div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-rose-300">🥩 Meat:</span>
                        <span className="font-mono text-emerald-400 font-bold">+{whackRewards.meat}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-indigo-300">🧪 DNA:</span>
                        <span className="font-mono text-indigo-400 font-bold">+{whackRewards.dna}</span>
                      </div>
                      {whackRewards.shards > 0 && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-pink-300">💎 God Shards:</span>
                          <span className="font-mono text-pink-400 font-bold">+{whackRewards.shards}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={claimWhackRewards}
                        className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-[0_0_12px_rgba(16,185,129,0.4)] cursor-pointer"
                      >
                        CLAIM & DEPOSIT REWARDS
                      </button>
                      <button
                        onClick={() => startWhackGame()}
                        className="px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs cursor-pointer shadow-md"
                      >
                        🎮 PLAY AGAIN (1 TOKEN)
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer text */}
              <div className="flex items-center justify-between w-full max-w-md text-[10px] text-slate-400 px-2">
                <span>Tap invading bosses fast to build combo multiplier! Avoid bombs 💣</span>
                <span className="text-emerald-400">Tokens: {(gameTokens || 0).toLocaleString()} 🎮</span>
              </div>
            </div>
          )}
        </div>

        {/* Out of Game Tokens Prompt Modal */}
        {showNoTokensModal && (
          <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border-2 border-amber-500/50 rounded-2xl p-5 max-w-sm w-full shadow-[0_0_40px_rgba(245,158,11,0.3)] text-center animate-fade-in">
              <div className="text-4xl mb-2">🎮</div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider mb-1">
                Out of Game Tokens!
              </h3>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                You need <strong className="text-amber-400">Arcade Game Tokens</strong> to play minigames.
                <br /><br />
                Game Tokens have a <strong className="text-amber-300 font-bold">10% drop chance</strong> from any enemy defeated in Tower Defense waves!
              </p>

              <div className="space-y-2 mb-3">
                <button
                  onClick={() => {
                    setShowNoTokensModal(false);
                    onClose();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 font-black text-xs bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all cursor-pointer"
                >
                  <span>⚔️ Defend Waves to Earn Tokens</span>
                </button>
              </div>

              <button
                onClick={() => setShowNoTokensModal(false)}
                className="text-xs text-slate-400 hover:text-white font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Modal Bottom Footer */}
        <div className="px-4 py-2.5 bg-slate-950/90 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-mono text-amber-400 font-bold">
              🎮 {(gameTokens || 0).toLocaleString()} Tokens
            </span>
            <span className="flex items-center gap-1 font-mono text-rose-300">
              <Coins size={11} /> {meat.toLocaleString()} Meat
            </span>
            <span className="flex items-center gap-1 font-mono text-indigo-300">
              <Dna size={11} /> {dna.toLocaleString()} DNA
            </span>
            <span className="flex items-center gap-1 font-mono text-pink-300">
              💎 {shardsOfGods} Shards
            </span>
            <span className="flex items-center gap-1 font-mono text-lime-400 font-bold">
              🪙 {(capyCoins || 0).toLocaleString()} Capy Coins
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors cursor-pointer"
          >
            Back to TD
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PrimalArcadeModal;
