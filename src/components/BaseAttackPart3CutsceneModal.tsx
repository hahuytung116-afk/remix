import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Zap, 
  Volume2, 
  VolumeX, 
  FastForward, 
  Flame, 
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Radio,
  Crosshair,
  Skull
} from 'lucide-react';
import { 
  AllSeeingOverseerArtwork, 
  CapybaraArtwork
} from './artworks/OriginalAndOverseerArtworks';
import { UpgradedRageTitanArtwork } from './artworks/UpgradedTitanArtwork';
import { ScientistAnimalsArtwork } from './artworks/ScientistArtwork';
import { 
  AlienUFOArtwork, 
  AlienMothershipArtwork, 
  GalaxyElementalGodArtwork,
  SanctuaryBaseArtwork,
  SanctuaryBaseRuinsArtwork 
} from './artworks/AlienMothershipArtworks';

interface BaseAttackPart3CutsceneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  isPreview?: boolean;
}

type CutsceneStep = 0 | 1 | 2 | 3 | 4;

interface UFOEntity {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  size: number;
  laserCooldown: number;
  alive: boolean;
}

interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  length: number;
  type: 'alien_plasma' | 'galaxy_beam' | 'bullet' | 'laser' | 'titan_railgun';
  life: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  type: 'spark' | 'smoke' | 'debris' | 'star';
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
  lineWidth: number;
}

export const BaseAttackPart3CutsceneModal: React.FC<BaseAttackPart3CutsceneModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  isPreview = false
}) => {
  const [currentStep, setCurrentStep] = useState<CutsceneStep>(0);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [screenShake, setScreenShake] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [beamCharge, setBeamCharge] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const ufosRef = useRef<UFOEntity[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const shockwavesRef = useRef<Shockwave[]>([]);
  const typingIntervalRef = useRef<any>(null);
  const shakeTimeoutRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Singleton AudioContext to prevent hitting browser hardware limit (max 6 contexts)
  const getAudioContext = useCallback(() => {
    try {
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          audioCtxRef.current = new AudioCtx();
        }
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {});
      }
      return audioCtxRef.current;
    } catch {
      return null;
    }
  }, []);

  // Web Audio Synthesizer
  const playSFX = (type: 'alarm' | 'galaxy_beam' | 'bullets' | 'mothership_charge' | 'mothership_fire' | 'quantum_shield' | 'obliteration' | 'dialogue') => {
    if (isAudioMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      if (type === 'dialogue') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(130, now + 0.08);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (type === 'alarm') {
        for (let i = 0; i < 2; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(880 + i * 80, now + i * 0.15);
          osc.frequency.linearRampToValueAtTime(440, now + i * 0.15 + 0.12);
          gain.gain.setValueAtTime(0.2, now + i * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.14);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.15);
          osc.stop(now + i * 0.15 + 0.15);
        }
      } else if (type === 'galaxy_beam') {
        // Shimmering celestial cosmic synth
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(320, now);
        osc1.frequency.exponentialRampToValueAtTime(1200, now + 0.6);
        gain1.gain.setValueAtTime(0.25, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.7);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.75);

        // Chime harmonics
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(780, now + 0.1);
        osc2.frequency.exponentialRampToValueAtTime(1560, now + 0.5);
        gain2.gain.setValueAtTime(0.2, now + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.1);
        osc2.stop(now + 0.62);
      } else if (type === 'bullets') {
        // Fast triple railgun burst
        for (let i = 0; i < 4; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(300, now + i * 0.06);
          osc.frequency.exponentialRampToValueAtTime(70, now + i * 0.06 + 0.04);
          gain.gain.setValueAtTime(0.2, now + i * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.06 + 0.05);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.06);
          osc.stop(now + i * 0.06 + 0.06);
        }
      } else if (type === 'mothership_charge') {
        // Deep sub-bass dread drone & rising warning pitch
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(55, now);
        osc.frequency.linearRampToValueAtTime(140, now + 1.2);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.35);
      } else if (type === 'mothership_fire') {
        // Apocalyptic superbeam blast
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(120, now);
        osc1.frequency.exponentialRampToValueAtTime(25, now + 1.4);
        gain1.gain.setValueAtTime(0.6, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 1.5);

        // High frequency ionization crackle
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(950, now);
        osc2.frequency.exponentialRampToValueAtTime(80, now + 0.8);
        gain2.gain.setValueAtTime(0.35, now);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.9);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now);
        osc2.stop(now + 0.95);
      } else if (type === 'quantum_shield') {
        // Expanding holographic energy dome
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.5);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.58);
      } else if (type === 'obliteration') {
        // Massive seismic explosion
        for (let i = 0; i < 3; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(80 - i * 15, now + i * 0.1);
          osc.frequency.exponentialRampToValueAtTime(20, now + i * 0.1 + 0.8);
          gain.gain.setValueAtTime(0.45, now + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.85);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.1);
          osc.stop(now + i * 0.1 + 0.9);
        }
      }
    } catch {
      // Audio context fallbacks handled safely
    }
  };

  // Step descriptions and script
  const stepData = [
    {
      title: 'THE ALIEN UFO SWARM INVASION',
      speaker: 'ACRON & ELEMENTAL (WITH ALL ANIMALS)',
      speakerTitle: 'Sanctuary Defenders • Unified Stand',
      speakerEmoji: '⚔️',
      speakerColor: '#f59e0b',
      text: 'DEFEND AT ALL COST!',
      subtitle: 'Swarms of alien UFO fighters tear through the atmospheric perimeter, raining green plasma bombs across the base!',
      actionLabel: 'Elemental Switches to Galaxy Element ➔',
      actionSFX: 'bullets'
    },
    {
      title: 'GALAXY BEAM & TITAN\'S REVENGE OATH',
      speaker: 'UPGRADED TITAN & ELEMENTAL GOD',
      speakerTitle: 'Cosmic Counterattack',
      speakerEmoji: '🤖',
      speakerColor: '#00f0ff',
      text: 'I WILL REVENGE.. FOR WARPER',
      subtitle: 'Elemental Deity transitions into GALAXY ELEMENT, incinerating alien squadrons with a colossal starlight beam while animals fire bullets and lasers!',
      actionLabel: 'Warning: Dread Signal Detected ➔',
      actionSFX: 'galaxy_beam'
    },
    {
      title: 'THE DREAD MOTHERSHIP EMERGES',
      speaker: 'THE ALIEN MOTHERSHIP',
      speakerTitle: 'Flagship Annihilator • Extinction Class',
      speakerEmoji: '🛸',
      speakerColor: '#10b981',
      text: 'EXTINCTION SEQUENCE INITIATED: CHARGING PLANETARY SUPERBEAM.',
      subtitle: 'A colossal city-sized Mothership warps into low orbit, blotting out the sky and locking its apocalyptic core beam onto the base!',
      actionLabel: 'Titan Initiates Emergency Evacuation ➔',
      actionSFX: 'mothership_charge'
    },
    {
      title: 'TITAN\'S EMERGENCY EVACUATION',
      speaker: 'UPGRADED TITAN',
      speakerTitle: 'Guardian of Sanctuary',
      speakerEmoji: '🛡️',
      speakerColor: '#38bdf8',
      text: 'COME NEAR ME AND I WILL SAVE YOU GUYS, GO',
      subtitle: 'Titan deploys his maximum-yield quantum dimensional shield, rallying Acron Overseer, Elemental Deity, Capybara, and all animals inside!',
      actionLabel: 'Mothership Fires Planetary Cannon! ➔',
      actionSFX: 'quantum_shield'
    },
    {
      title: 'BASE OBLITERATION & QUANTUM RETREAT',
      speaker: 'UPGRADED TITAN',
      speakerTitle: 'In the Quantum Rift',
      speakerEmoji: '🌌',
      speakerColor: '#a855f7',
      text: 'The base is gone... but we survived. We will rebuild. We will get stronger. And we WILL have our revenge for Warper!',
      subtitle: 'The Mothership fires its apocalyptic beam, obliterating Sanctuary Base into cosmic ash! Titan warps all survivors safely into the quantum void!',
      actionLabel: 'Close & Continue Campaign ➔',
      actionSFX: 'obliteration'
    }
  ];

  // Reset cutscene state when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setDisplayedText('');
      setIsTyping(true);
      setScreenShake(false);
      setBeamCharge(0);
      ufosRef.current = [];
      projectilesRef.current = [];
      particlesRef.current = [];
      shockwavesRef.current = [];
    }
  }, [isOpen]);

  // Initialize Canvas animation loop & UFO entities
  useEffect(() => {
    if (!isOpen) return;

    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    if (shakeTimeoutRef.current) {
      clearTimeout(shakeTimeoutRef.current);
      shakeTimeoutRef.current = null;
    }

    // Trigger step SFX
    if (currentStep === 0) playSFX('alarm');
    if (currentStep === 1) playSFX('galaxy_beam');
    if (currentStep === 2) playSFX('mothership_charge');
    if (currentStep === 3) playSFX('quantum_shield');
    if (currentStep === 4) {
      playSFX('mothership_fire');
      setTimeout(() => playSFX('obliteration'), 400);
    }

    // Screen shake trigger with independent timeout
    if (currentStep === 0 || currentStep === 1 || currentStep === 4) {
      setScreenShake(true);
      shakeTimeoutRef.current = setTimeout(() => setScreenShake(false), currentStep === 4 ? 1800 : 600);
    }

    // Typewriter effect
    const fullText = stepData[currentStep].text;
    setDisplayedText('');
    setIsTyping(true);
    let charIdx = 0;
    typingIntervalRef.current = setInterval(() => {
      charIdx++;
      if (charIdx <= fullText.length) {
        setDisplayedText(fullText.slice(0, charIdx));
        if (charIdx % 3 === 0) playSFX('dialogue');
      } else {
        setIsTyping(false);
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
        }
      }
    }, 22);

    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
      if (shakeTimeoutRef.current) {
        clearTimeout(shakeTimeoutRef.current);
        shakeTimeoutRef.current = null;
      }
    };
  }, [currentStep, isOpen]);

  // Setup UFO and Particle systems
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas safely with fallback dimensions
    const updateSize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const newWidth = Math.max(320, Math.floor(rect.width || canvas.offsetWidth || 800));
      const newHeight = Math.max(240, Math.floor(rect.height || canvas.offsetHeight || 450));
      if (canvas.width !== newWidth || canvas.height !== newHeight) {
        canvas.width = newWidth;
        canvas.height = newHeight;
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    // Populate initial UFO swarm
    ufosRef.current = Array.from({ length: 9 }, (_, i) => ({
      x: 50 + (i % 3) * (canvas.width / 3.5) + (Math.random() * 40 - 20),
      y: 40 + Math.floor(i / 3) * 50 + (Math.random() * 20),
      targetX: Math.random() * canvas.width,
      targetY: 40 + Math.random() * 120,
      speed: 1.2 + Math.random() * 1.5,
      size: 22 + Math.random() * 10,
      laserCooldown: Math.random() * 40,
      alive: true
    }));

    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;

      // STEP-SPECIFIC VISUAL SIMULATION
      if (currentStep === 0) {
        // Step 0: Alien UFO swarm bombing base
        ufosRef.current.forEach((ufo, idx) => {
          // Hovering movement
          ufo.x += Math.sin(frame * 0.05 + idx) * 1.5;
          ufo.y += Math.cos(frame * 0.04 + idx) * 0.8;

          // Draw UFO glow
          ctx.beginPath();
          ctx.ellipse(ufo.x, ufo.y, ufo.size, ufo.size * 0.4, 0, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
          ctx.fill();

          // Draw saucer rim
          ctx.beginPath();
          ctx.ellipse(ufo.x, ufo.y, ufo.size * 0.8, ufo.size * 0.3, 0, 0, Math.PI * 2);
          ctx.fillStyle = '#1e293b';
          ctx.strokeStyle = '#34d399';
          ctx.lineWidth = 1.5;
          ctx.fill();
          ctx.stroke();

          // Green dome
          ctx.beginPath();
          ctx.arc(ufo.x, ufo.y - 3, ufo.size * 0.35, Math.PI, 0);
          ctx.fillStyle = '#10b981';
          ctx.fill();

          // Shoot plasma bolts downward
          ufo.laserCooldown++;
          if (ufo.laserCooldown > 45) {
            ufo.laserCooldown = 0;
            projectilesRef.current.push({
              x: ufo.x,
              y: ufo.y + 4,
              vx: (Math.random() - 0.5) * 2,
              vy: 5 + Math.random() * 2,
              color: '#34d399',
              size: 4,
              length: 14,
              type: 'alien_plasma',
              life: 60
            });
          }
        });

        // Animal return fire (bullets and blue lasers from base)
        if (frame % 8 === 0) {
          projectilesRef.current.push({
            x: w * 0.3 + (Math.random() - 0.5) * 80,
            y: h - 30,
            vx: (Math.random() - 0.5) * 4,
            vy: -7 - Math.random() * 3,
            color: '#f59e0b',
            size: 3,
            length: 12,
            type: 'bullet',
            life: 50
          });
          projectilesRef.current.push({
            x: w * 0.7 + (Math.random() - 0.5) * 80,
            y: h - 30,
            vx: (Math.random() - 0.5) * 3,
            vy: -9 - Math.random() * 4,
            color: '#00f0ff',
            size: 3.5,
            length: 20,
            type: 'laser',
            life: 50
          });
        }
      } else if (currentStep === 1) {
        // Step 1: Galaxy Element Beam & Animal Heavy Barrage
        // Massive cosmic starlight beam across the center
        const beamX = w * 0.5;
        const beamY = h * 0.45;

        // Radiant galaxy nebula beam
        const grad = ctx.createLinearGradient(0, 0, w, 0);
        grad.addColorStop(0, 'rgba(56, 189, 248, 0)');
        grad.addColorStop(0.3, 'rgba(56, 189, 248, 0.4)');
        grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)');
        grad.addColorStop(0.7, 'rgba(168, 85, 247, 0.4)');
        grad.addColorStop(1, 'rgba(236, 72, 153, 0)');

        ctx.fillStyle = grad;
        ctx.fillRect(0, beamY - 24, w, 48);

        // Core central laser
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, beamY - 6, w, 12);

        // Swirling stars and cosmic sparkles along beam
        if (frame % 2 === 0) {
          particlesRef.current.push({
            x: Math.random() * w,
            y: beamY + (Math.random() - 0.5) * 40,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            color: ['#ffffff', '#38bdf8', '#c084fc', '#ec4899'][Math.floor(Math.random() * 4)],
            size: 2 + Math.random() * 4,
            life: 30,
            maxLife: 30,
            type: 'star'
          });
        }

        // Exploding UFO debris from galaxy beam
        if (frame % 15 === 0) {
          const expX = w * 0.3 + Math.random() * (w * 0.4);
          shockwavesRef.current.push({
            x: expX,
            y: beamY + (Math.random() - 0.5) * 20,
            radius: 5,
            maxRadius: 40,
            color: '#38bdf8',
            alpha: 1,
            lineWidth: 3
          });
          for (let p = 0; p < 8; p++) {
            particlesRef.current.push({
              x: expX,
              y: beamY,
              vx: (Math.random() - 0.5) * 8,
              vy: (Math.random() - 0.5) * 8,
              color: '#34d399',
              size: 3,
              life: 35,
              maxLife: 35,
              type: 'debris'
            });
          }
        }
      } else if (currentStep === 2) {
        // Step 2: Dread Mothership charging its ventral supercannon
        const msX = w * 0.5;
        const msY = h * 0.28;

        // Energy gathering coils converging on center
        ctx.beginPath();
        ctx.arc(msX, msY + 25, 30 + Math.sin(frame * 0.15) * 8, 0, Math.PI * 2);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Core plasma charge
        const chargeGrad = ctx.createRadialGradient(msX, msY + 25, 2, msX, msY + 25, 45);
        chargeGrad.addColorStop(0, '#ffffff');
        chargeGrad.addColorStop(0.4, '#34d399');
        chargeGrad.addColorStop(0.8, '#059669');
        chargeGrad.addColorStop(1, 'rgba(6, 78, 59, 0)');
        ctx.fillStyle = chargeGrad;
        ctx.beginPath();
        ctx.arc(msX, msY + 25, 45, 0, Math.PI * 2);
        ctx.fill();

        // Inward rushing energy sparks
        if (frame % 2 === 0) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 80 + Math.random() * 60;
          particlesRef.current.push({
            x: msX + Math.cos(angle) * dist,
            y: msY + 25 + Math.sin(angle) * dist,
            vx: -Math.cos(angle) * 6,
            vy: -Math.sin(angle) * 6,
            color: '#a7f3d0',
            size: 2.5,
            life: 25,
            maxLife: 25,
            type: 'spark'
          });
        }
      } else if (currentStep === 3) {
        // Step 3: Titan's Quantum Dimensional Shield Sphere
        const shieldX = w * 0.5;
        const shieldY = h * 0.72;
        const shieldRadius = 90 + Math.sin(frame * 0.1) * 4;

        // Holographic protective sphere
        const shieldGrad = ctx.createRadialGradient(shieldX, shieldY, 10, shieldX, shieldY, shieldRadius);
        shieldGrad.addColorStop(0, 'rgba(0, 240, 255, 0.15)');
        shieldGrad.addColorStop(0.7, 'rgba(99, 102, 241, 0.35)');
        shieldGrad.addColorStop(0.95, 'rgba(236, 72, 153, 0.7)');
        shieldGrad.addColorStop(1, '#ffffff');

        ctx.fillStyle = shieldGrad;
        ctx.beginPath();
        ctx.arc(shieldX, shieldY, shieldRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Pulsing quantum rings around shield
        ctx.beginPath();
        ctx.ellipse(shieldX, shieldY, shieldRadius + 12, (shieldRadius + 12) * 0.35, frame * 0.02, 0, Math.PI * 2);
        ctx.strokeStyle = '#e0e7ff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Animal allies rushing inside particles
        if (frame % 3 === 0) {
          particlesRef.current.push({
            x: shieldX + (Math.random() - 0.5) * (shieldRadius * 1.5),
            y: shieldY + (Math.random() - 0.5) * (shieldRadius * 1.5),
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
            color: '#38bdf8',
            size: 3,
            life: 40,
            maxLife: 40,
            type: 'spark'
          });
        }
      } else if (currentStep === 4) {
        // Step 4: Mothership Shoots & Base Obliteration
        // Blinding apocalyptic beam slamming down from top to bottom
        const beamX = w * 0.5;
        const beamWidth = 240 + Math.sin(frame * 0.4) * 40;

        const colGrad = ctx.createLinearGradient(beamX - beamWidth / 2, 0, beamX + beamWidth / 2, 0);
        colGrad.addColorStop(0, 'rgba(16, 185, 129, 0)');
        colGrad.addColorStop(0.2, 'rgba(52, 211, 153, 0.8)');
        colGrad.addColorStop(0.5, '#ffffff');
        colGrad.addColorStop(0.8, 'rgba(52, 211, 153, 0.8)');
        colGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');

        ctx.fillStyle = colGrad;
        ctx.fillRect(beamX - beamWidth / 2, 0, beamWidth, h);

        // Exploding base structures and shockwaves
        if (frame % 6 === 0) {
          shockwavesRef.current.push({
            x: beamX + (Math.random() - 0.5) * 100,
            y: h - 40,
            radius: 10,
            maxRadius: 180,
            color: '#ef4444',
            alpha: 1,
            lineWidth: 4
          });
          shockwavesRef.current.push({
            x: beamX,
            y: h - 60,
            radius: 20,
            maxRadius: 220,
            color: '#10b981',
            alpha: 1,
            lineWidth: 3
          });
        }

        // Violent debris scattering
        for (let i = 0; i < 4; i++) {
          particlesRef.current.push({
            x: beamX + (Math.random() - 0.5) * 120,
            y: h - 50 + (Math.random() - 0.5) * 30,
            vx: (Math.random() - 0.5) * 16,
            vy: -4 - Math.random() * 14,
            color: ['#ef4444', '#f97316', '#facc15', '#78716c', '#000000'][Math.floor(Math.random() * 5)],
            size: 3 + Math.random() * 7,
            life: 45,
            maxLife: 45,
            type: 'debris'
          });
        }
      }

      // Update and draw Projectiles
      for (let i = projectilesRef.current.length - 1; i >= 0; i--) {
        const p = projectilesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;

        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * (p.length / 10), p.y - p.vy * (p.length / 10));
        ctx.stroke();

        if (p.life <= 0 || p.y < -50 || p.y > h + 50 || p.x < -50 || p.x > w + 50) {
          projectilesRef.current.splice(i, 1);
        }
      }

      // Update and draw Shockwaves
      for (let i = shockwavesRef.current.length - 1; i >= 0; i--) {
        const sw = shockwavesRef.current[i];
        sw.radius += 5;
        sw.alpha = Math.max(0, 1 - sw.radius / sw.maxRadius);

        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = sw.color;
        ctx.globalAlpha = sw.alpha;
        ctx.lineWidth = sw.lineWidth;
        ctx.stroke();
        ctx.globalAlpha = 1;

        if (sw.radius >= sw.maxRadius) {
          shockwavesRef.current.splice(i, 1);
        }
      }

      // Update and draw Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const part = particlesRef.current[i];
        part.x += part.vx;
        part.y += part.vy;
        part.life--;

        const alpha = Math.max(0, part.life / part.maxLife);
        ctx.fillStyle = part.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        if (part.life <= 0) {
          particlesRef.current.splice(i, 1);
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', updateSize);
    };
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  const current = stepData[currentStep];

  const handleAdvance = useCallback(() => {
    const fullText = stepData[currentStep].text;
    // If still typing, immediately complete text and cancel the timer
    if (typingIntervalRef.current || displayedText.length < fullText.length) {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
      setDisplayedText(fullText);
      setIsTyping(false);
      return;
    }
    // If text is already full, proceed to next step
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as CutsceneStep);
    } else {
      if (onComplete) onComplete();
      onClose();
    }
  }, [currentStep, displayedText.length, stepData, onComplete, onClose]);

  // Guaranteed step forward when the action button is clicked
  const handleNextStep = useCallback(() => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as CutsceneStep);
    } else {
      if (onComplete) onComplete();
      onClose();
    }
  }, [currentStep, onComplete, onClose]);

  const handleSkip = useCallback(() => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    if (onComplete) onComplete();
    onClose();
  }, [onComplete, onClose]);

  // Keyboard navigation: Space, Enter, or ArrowRight advances dialogue; Escape skips
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'ArrowRight') {
        e.preventDefault();
        handleAdvance();
      } else if (e.code === 'Escape') {
        e.preventDefault();
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleAdvance]);

  return (
    <AnimatePresence>
      <div 
        id="base-attack-part3-modal"
        className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-slate-950/95 backdrop-blur-2xl select-none overflow-hidden"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            x: screenShake ? [0, -6, 6, -4, 4, -2, 2, 0] : 0,
            y: screenShake ? [0, 4, -4, 3, -3, 2, -1, 0] : 0
          }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-4xl h-[92vh] max-h-[700px] min-h-[460px] bg-slate-950 border-2 border-emerald-500/60 rounded-2xl sm:rounded-3xl shadow-[0_0_80px_rgba(16,185,129,0.4)] overflow-hidden flex flex-col"
        >
          {/* Header Bar */}
          <div className="p-3 sm:p-4 border-b border-white/10 flex items-center justify-between bg-slate-950/80 z-20 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <Skull size={18} className="animate-pulse" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-300">
                    SAGA VII • CHAPTER 270
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                    BASE ATTACK PART 3
                  </span>
                </div>
                <div className="text-[10px] sm:text-xs text-slate-400 font-semibold">
                  The Alien Mothership • Extinction Incursion
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsAudioMuted(!isAudioMuted)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-white/10 cursor-pointer"
                title={isAudioMuted ? "Unmute Audio" : "Mute Audio"}
              >
                {isAudioMuted ? <VolumeX size={15} /> : <Volume2 size={15} className="text-emerald-400" />}
              </button>
              <button
                type="button"
                onClick={handleSkip}
                className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-all border border-white/10 flex items-center gap-1 cursor-pointer"
              >
                <FastForward size={13} />
                <span>Skip</span>
              </button>
            </div>
          </div>

          {/* Cinematic Canvas & Character Stage - CLICKABLE TO ADVANCE DIALOGUE */}
          <div 
            onClick={handleAdvance}
            className="relative flex-1 min-h-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden flex items-center justify-center cursor-pointer group"
            title="Click stage to advance dialogue"
          >
            {/* Background Particle Canvas */}
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />

            {/* Click to advance overlay hint on stage */}
            <div className="absolute top-2 right-2 z-30 px-2 py-0.5 rounded-md bg-black/60 border border-white/10 text-[9px] font-mono text-emerald-300 opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none">
              Click stage to advance ➔
            </div>

            {/* Dynamic Step Stage Artwork Display */}
            <div className="relative z-20 w-full h-full flex flex-col items-center justify-center p-2 sm:p-4">
              {currentStep === 0 && (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 sm:gap-4">
                  {/* UFO Swarm on Top */}
                  <div className="flex items-center justify-center gap-4 sm:gap-8 animate-bounce">
                    <div className="w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 drop-shadow-[0_0_20px_rgba(16,185,129,0.7)]">
                      <AlienUFOArtwork />
                    </div>
                    <div className="w-16 h-16 sm:w-22 sm:h-22 md:w-24 md:h-24 drop-shadow-[0_0_25px_rgba(16,185,129,0.9)] scale-110">
                      <AlienUFOArtwork />
                    </div>
                    <div className="w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 drop-shadow-[0_0_20px_rgba(16,185,129,0.7)]">
                      <AlienUFOArtwork />
                    </div>
                  </div>

                  {/* Animal Defenders at Sanctuary Base */}
                  <div className="w-full max-w-md sm:max-w-lg bg-slate-950/80 border border-emerald-500/40 rounded-2xl p-2 sm:p-3 flex items-center justify-around shadow-2xl backdrop-blur-md">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 flex flex-col items-center">
                      <AllSeeingOverseerArtwork />
                      <span className="text-[8px] sm:text-[9px] font-black uppercase text-amber-300 mt-0.5">Acron</span>
                    </div>
                    <div className="w-12 h-12 sm:w-16 sm:h-16 flex flex-col items-center">
                      <GalaxyElementalGodArtwork />
                      <span className="text-[8px] sm:text-[9px] font-black uppercase text-cyan-300 mt-0.5">Elemental</span>
                    </div>
                    <div className="w-12 h-12 sm:w-16 sm:h-16 flex flex-col items-center">
                      <CapybaraArtwork />
                      <span className="text-[8px] sm:text-[9px] font-black uppercase text-orange-300 mt-0.5">Capybara</span>
                    </div>
                    <div className="w-12 h-12 sm:w-16 sm:h-16 flex flex-col items-center">
                      <ScientistAnimalsArtwork />
                      <span className="text-[8px] sm:text-[9px] font-black uppercase text-purple-300 mt-0.5">Scientists</span>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 sm:gap-4">
                  {/* Galaxy Elemental Charging Beam */}
                  <div className="flex items-center justify-center gap-6 sm:gap-12">
                    <div className="flex flex-col items-center animate-pulse">
                      <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 drop-shadow-[0_0_35px_rgba(56,189,248,0.9)]">
                        <GalaxyElementalGodArtwork />
                      </div>
                      <span className="mt-1.5 text-[9px] sm:text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                        🌟 GALAXY ELEMENT BEAM!
                      </span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 drop-shadow-[0_0_35px_rgba(0,240,255,0.9)]">
                        <UpgradedRageTitanArtwork />
                      </div>
                      <span className="mt-1.5 text-[9px] sm:text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40">
                        💥 TITAN RAGE CANNON
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 sm:gap-3">
                  {/* Colossal Dread Mothership */}
                  <div className="w-36 h-36 sm:w-52 sm:h-52 md:w-60 md:h-60 drop-shadow-[0_0_40px_rgba(16,185,129,0.8)] animate-pulse">
                    <AlienMothershipArtwork />
                  </div>
                  <div className="px-3 py-1 bg-red-950/90 border border-red-500/60 rounded-xl text-center shadow-lg">
                    <span className="text-[10px] sm:text-xs font-mono font-black text-red-300 tracking-wider flex items-center gap-1.5 justify-center">
                      <AlertTriangle size={13} className="text-red-400 animate-spin" />
                      EXTINCTION SUPERBEAM LOCKED ON SANCTUARY BASE: 99,999,999 MW
                    </span>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 sm:gap-3">
                  {/* Titan Holographic Quantum Evacuation Bubble */}
                  <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 rounded-full border-2 border-cyan-400 bg-gradient-to-r from-cyan-950/50 via-purple-950/60 to-indigo-950/50 shadow-[0_0_50px_rgba(6,182,212,0.8)] flex items-center justify-center p-2">
                    {/* Centered Titan */}
                    <div className="w-20 h-20 sm:w-26 sm:h-26 drop-shadow-[0_0_30px_rgba(0,240,255,0.9)] z-20">
                      <UpgradedRageTitanArtwork />
                    </div>
                    {/* Surrounding Evacuated Animal Allies */}
                    <div className="absolute top-3 left-4 w-9 h-9 sm:w-11 sm:h-11">
                      <AllSeeingOverseerArtwork />
                    </div>
                    <div className="absolute top-3 right-4 w-9 h-9 sm:w-11 sm:h-11">
                      <GalaxyElementalGodArtwork />
                    </div>
                    <div className="absolute bottom-4 left-5 w-9 h-9 sm:w-11 sm:h-11">
                      <CapybaraArtwork />
                    </div>
                    <div className="absolute bottom-4 right-5 w-9 h-9 sm:w-11 sm:h-11">
                      <ScientistAnimalsArtwork />
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-cyan-950/90 border border-cyan-500/60 rounded-xl text-center shadow-lg">
                    <span className="text-[10px] sm:text-xs font-mono font-black text-cyan-300 tracking-wider">
                      🛡️ QUANTUM DIMENSIONAL SHIELD: 100% SECURE • ALL ANIMALS SAVED!
                    </span>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 sm:gap-3">
                  {/* Base Vaporized into Cosmic Ruins */}
                  <div className="w-32 h-32 sm:w-44 sm:h-44 md:w-52 md:h-52 drop-shadow-[0_0_40px_rgba(239,68,68,0.8)] animate-pulse">
                    <SanctuaryBaseRuinsArtwork />
                  </div>
                  <div className="text-center space-y-0.5">
                    <div className="text-xs sm:text-sm font-black uppercase tracking-widest text-red-400">
                      💥 BASE COMPLETELY VAPORIZED
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-slate-400 max-w-md">
                      The Mothership's planetary cannon incinerated all base structures. But Titan's quantum shield evacuated everyone safely into the dimensional rift!
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dialogue & Narrative Area - ALWAYS PINNED AND FULLY VISIBLE */}
          <div 
            onClick={handleAdvance}
            className="relative z-30 flex-shrink-0 p-3 sm:p-5 bg-slate-950/98 border-t-2 border-emerald-500/50 flex flex-col gap-2 sm:gap-3 shadow-2xl cursor-pointer"
          >
            {/* Speaker Bar & Step Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl p-1 bg-white/5 rounded-lg border border-white/10">
                  {current.speakerEmoji}
                </span>
                <div>
                  <span 
                    className="text-xs sm:text-sm md:text-base font-black uppercase tracking-wider block"
                    style={{ color: current.speakerColor }}
                  >
                    {current.speaker}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 font-mono">
                    {current.speakerTitle}
                  </span>
                </div>
              </div>

              {/* Step indicator dots - clickable */}
              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                {stepData.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      if (typingIntervalRef.current) {
                        clearInterval(typingIntervalRef.current);
                        typingIntervalRef.current = null;
                      }
                      setCurrentStep(i as CutsceneStep);
                      setDisplayedText(stepData[i].text);
                      setIsTyping(false);
                    }}
                    title={`Jump to Act ${i + 1}`}
                    className={`h-2 sm:h-2.5 rounded-full transition-all cursor-pointer ${
                      i === currentStep 
                        ? 'w-7 sm:w-8 bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.9)]' 
                        : i < currentStep 
                          ? 'w-2 sm:w-2.5 bg-emerald-700 hover:bg-emerald-600' 
                          : 'w-2 sm:w-2.5 bg-slate-700 hover:bg-slate-600'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Typewritten Dialogue Line - LARGE, HIGH CONTRAST, GUARANTEED VISIBLE & CLICKABLE */}
            <div 
              onClick={handleAdvance}
              className="min-h-[56px] sm:min-h-[64px] p-3 sm:p-4 rounded-xl bg-slate-950/95 border-2 border-emerald-500/50 hover:border-emerald-400 font-mono flex items-center shadow-inner cursor-pointer transition-colors"
              title="Click dialogue box to complete text or advance"
            >
              <div className="flex items-start gap-2.5 w-full">
                <span className="text-emerald-400 font-black text-base sm:text-lg select-none">&gt;</span>
                <p 
                  className="text-sm sm:text-base md:text-lg font-black tracking-wide leading-snug drop-shadow-md select-text"
                  style={{ color: current.speakerColor }}
                >
                  "{displayedText || (isTyping ? '' : current.text)}"
                  {isTyping && (
                    <span className="inline-block w-2 sm:w-2.5 h-4 sm:h-5 ml-1.5 bg-emerald-400 animate-pulse align-middle" />
                  )}
                </p>
              </div>
            </div>

            {/* Subtitle / Narration */}
            <div className="text-[11px] sm:text-xs text-slate-300 leading-relaxed font-sans font-medium">
              {current.subtitle}
            </div>

            {/* Bottom Controls Bar */}
            <div className="flex items-center justify-between pt-1 border-t border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-[11px] font-mono font-bold text-emerald-400/80 animate-pulse hidden sm:inline">
                  [ CLICK ANYWHERE OR PRESS SPACE TO ADVANCE ]
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-400/80 animate-pulse sm:hidden">
                  [ TAP TO ADVANCE ]
                </span>
              </div>

              {/* Next / Proceed Button - IMMEDIATELY STEPS FORWARD */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextStep();
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 active:scale-95 text-white text-xs sm:text-sm font-black uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(16,185,129,0.5)] flex items-center gap-2 cursor-pointer border border-emerald-400/40"
              >
                <span>{currentStep === 4 ? 'VICTORY RETREAT (CLAIM REWARD)' : current.actionLabel}</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
