// Synthesized Audio System using Web Audio API for Primal Defense
// No external asset loading - fully synthesized, low latency, and lightweight.

type SFXType = 'click' | 'place' | 'upgrade' | 'gacha' | 'wave_start' | 'victory' | 'defeat' | 'error';

const RARITY_MULTIPLIERS: Record<string, { pitch: number; volume: number; duration: number; complexity: number }> = {
  Common: { pitch: 1.0, volume: 0.8, duration: 0.15, complexity: 1 },
  Rare: { pitch: 1.25, volume: 0.9, duration: 0.20, complexity: 2 },
  Epic: { pitch: 1.5, volume: 1.0, duration: 0.26, complexity: 2 },
  Legendary: { pitch: 1.75, volume: 1.1, duration: 0.38, complexity: 3 },
  Mythic: { pitch: 2.0, volume: 1.25, duration: 0.50, complexity: 4 },
  Secret: { pitch: 2.25, volume: 1.35, duration: 0.65, complexity: 4 },
  Celestial: { pitch: 2.5, volume: 1.45, duration: 0.85, complexity: 5 },
  Unrivaled: { pitch: 2.8, volume: 1.6, duration: 1.10, complexity: 5 },
  '???': { pitch: 0.8, volume: 1.7, duration: 1.30, complexity: 6 },
  Original: { pitch: 0.6, volume: 1.85, duration: 1.60, complexity: 6 },
  'The Chillful': { pitch: 1.0, volume: 1.6, duration: 2.20, complexity: 6 },
  Overseer: { pitch: 0.5, volume: 2.0, duration: 1.90, complexity: 7 },
  Arcane: { pitch: 0.4, volume: 2.2, duration: 2.20, complexity: 8 },
};

class GameAudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private capyGain: GainNode | null = null;
  
  private ambientInterval: any = null;
  private activeAmbientOscillators: { osc: OscillatorNode; gain: GainNode }[] = [];
  
  // Capybara Theme Song Synth State
  private capyThemeInterval: any = null;
  private capyThemePlaying: boolean = false;
  private capyThemeVolume: number = 0.85;
  private activeCapyOscillators: { osc: OscillatorNode; gain: GainNode }[] = [];
  
  // Settings mirroring game state
  private soundEffectsEnabled: boolean = true;
  private ambientAudioEnabled: boolean = true;
  private globalMute: boolean = false;

  private init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      
      // Setup audio routing graph
      this.masterGain = this.ctx.createGain();
      this.ambientGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.capyGain = this.ctx.createGain();
      
      // Connect gains
      this.ambientGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.capyGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
      
      this.applyVolumes();
    } catch (e) {
      console.error('Failed to initialize AudioContext', e);
    }
  }

  // Adjust routing volumes based on state parameters
  private applyVolumes() {
    if (!this.masterGain || !this.ambientGain || !this.sfxGain || !this.ctx) return;
    
    // Global mute controller
    if (this.globalMute) {
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    } else {
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
    }
    
    // Ambient sound volume (very soft/subtle background volume)
    if (this.ambientAudioEnabled && !this.globalMute) {
      // Gentle soft drone level
      this.ambientGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    } else {
      this.ambientGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
    
    // SFX volume controller
    if (this.soundEffectsEnabled && !this.globalMute) {
      this.sfxGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
    } else {
      this.sfxGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }

    // Capy Theme Volume Controller
    if (this.capyGain) {
      if (this.globalMute) {
        this.capyGain.gain.setValueAtTime(0, this.ctx.currentTime);
      } else {
        this.capyGain.gain.setValueAtTime(this.capyThemeVolume, this.ctx.currentTime);
      }
    }
  }

  public updateSettings(soundEffects: boolean, ambient: boolean, globalMute: boolean) {
    this.soundEffectsEnabled = soundEffects;
    this.ambientAudioEnabled = ambient;
    this.globalMute = globalMute;
    
    // Try to auto-initialize if context starts on user interaction
    if (!this.ctx && (soundEffects || ambient) && !globalMute) {
      this.init();
    }
    
    this.applyVolumes();
    
    // Start or stop background looping depending on state
    if (this.ambientAudioEnabled && !this.globalMute) {
      this.startAmbient();
    } else {
      this.clearAmbientOscillators();
    }
  }

  // Plays synthesized cyberpunk sound effects with dynamic rarity scaling
  public playSFX(type: SFXType, rarity: string = 'Common') {
    if (!this.soundEffectsEnabled || this.globalMute) return;
    
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    
    // Resume context if suspended (browser security autostart policy protection)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    
    try {
      switch (type) {
        case 'click': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
          
          gain.gain.setValueAtTime(0.04, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
          
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(now);
          osc.stop(now + 0.06);
          break;
        }
        
        case 'place': {
          const config = RARITY_MULTIPLIERS[rarity] || RARITY_MULTIPLIERS.Common;
          const pitchMult = config.pitch;
          const volMult = config.volume;
          const dur = config.duration;

          if (['Original', 'Overseer', '???'].includes(rarity)) {
            // Deep, heavy cosmic void warp drop
            const oscSub = this.ctx.createOscillator();
            const oscSaw = this.ctx.createOscillator();
            const subGain = this.ctx.createGain();
            const sawGain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            oscSub.type = 'sine';
            oscSub.frequency.setValueAtTime(100 * pitchMult, now);
            oscSub.frequency.exponentialRampToValueAtTime(35 * pitchMult, now + dur);

            oscSaw.type = 'sawtooth';
            oscSaw.frequency.setValueAtTime(120 * pitchMult, now);
            oscSaw.frequency.linearRampToValueAtTime(50 * pitchMult, now + dur * 0.8);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(400, now);
            filter.frequency.exponentialRampToValueAtTime(120, now + dur);
            filter.Q.setValueAtTime(8, now);

            subGain.gain.setValueAtTime(0.25 * volMult, now);
            subGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

            sawGain.gain.setValueAtTime(0.12 * volMult, now);
            sawGain.gain.exponentialRampToValueAtTime(0.001, now + dur * 0.6);

            oscSub.connect(subGain);
            subGain.connect(this.sfxGain);

            oscSaw.connect(filter);
            filter.connect(sawGain);
            sawGain.connect(this.sfxGain);

            oscSub.start(now);
            oscSub.stop(now + dur + 0.1);
            oscSaw.start(now);
            oscSaw.stop(now + dur + 0.1);

            // Glitchy tick modulation for cosmic feel
            for (let i = 0; i < 6; i++) {
              const tickTime = now + (i * dur / 6);
              const tickOsc = this.ctx.createOscillator();
              const tickGain = this.ctx.createGain();
              tickOsc.type = 'square';
              tickOsc.frequency.setValueAtTime(800 - i * 100, tickTime);
              tickGain.gain.setValueAtTime(0.02 * volMult, tickTime);
              tickGain.gain.exponentialRampToValueAtTime(0.0001, tickTime + 0.04);
              tickOsc.connect(tickGain);
              tickGain.connect(this.sfxGain);
              tickOsc.start(tickTime);
              tickOsc.stop(tickTime + 0.05);
            }
          } else if (['Celestial', 'Unrivaled'].includes(rarity)) {
            // Ethereal chime chord & riser
            const frequencies = [329.63, 392.00, 523.25, 659.25, 987.77].map(f => f * pitchMult);
            frequencies.forEach((freq, idx) => {
              const osc = this.ctx!.createOscillator();
              const oscSine = this.ctx!.createOscillator();
              const gain = this.ctx!.createGain();
              const chimeTime = now + idx * 0.03;

              osc.type = 'triangle';
              osc.frequency.setValueAtTime(freq, chimeTime);
              osc.frequency.exponentialRampToValueAtTime(freq * 1.2, chimeTime + dur);

              oscSine.type = 'sine';
              oscSine.frequency.setValueAtTime(freq * 2, chimeTime);

              gain.gain.setValueAtTime(0.05 * volMult, chimeTime);
              gain.gain.exponentialRampToValueAtTime(0.001, chimeTime + dur - idx * 0.03);

              osc.connect(gain);
              oscSine.connect(gain);
              gain.connect(this.sfxGain!);

              osc.start(chimeTime);
              osc.stop(chimeTime + dur);
              oscSine.start(chimeTime);
              oscSine.stop(chimeTime + dur);
            });
            
            // Laser sweep riser for Unrivaled
            if (rarity === 'Unrivaled') {
              const laser = this.ctx.createOscillator();
              const laserGain = this.ctx.createGain();
              laser.type = 'sawtooth';
              laser.frequency.setValueAtTime(150, now);
              laser.frequency.exponentialRampToValueAtTime(1500, now + dur);
              laserGain.gain.setValueAtTime(0.03 * volMult, now);
              laserGain.gain.exponentialRampToValueAtTime(0.001, now + dur);
              const filter = this.ctx.createBiquadFilter();
              filter.type = 'lowpass';
              filter.frequency.setValueAtTime(800, now);
              laser.connect(filter);
              filter.connect(laserGain);
              laserGain.connect(this.sfxGain);
              laser.start(now);
              laser.stop(now + dur);
            }
          } else if (['Legendary', 'Mythic', 'Secret'].includes(rarity)) {
            // Beautiful rich triad chord
            const baseFreq = 261.63 * pitchMult;
            const chords = [1, 1.25, 1.5, 2]; // Major triad + octave
            chords.forEach((factor, idx) => {
              const osc = this.ctx!.createOscillator();
              const gain = this.ctx!.createGain();
              const noteTime = now + idx * 0.04;

              osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
              osc.frequency.setValueAtTime(baseFreq * factor, noteTime);
              osc.frequency.exponentialRampToValueAtTime(baseFreq * factor * 1.5, noteTime + dur);

              gain.gain.setValueAtTime(0.06 * volMult, noteTime);
              gain.gain.exponentialRampToValueAtTime(0.001, noteTime + dur - idx * 0.04);

              osc.connect(gain);
              gain.connect(this.sfxGain!);

              osc.start(noteTime);
              osc.stop(noteTime + dur);
            });
          } else {
            // Common, Rare, Epic
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            osc.type = rarity === 'Epic' ? 'sawtooth' : 'triangle';
            const baseFreq = 140 * pitchMult;
            osc.frequency.setValueAtTime(baseFreq, now);
            osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.2, now + dur);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(rarity === 'Epic' ? 1200 : 800, now);
            filter.frequency.exponentialRampToValueAtTime(300, now + dur);

            gain.gain.setValueAtTime(0.12 * volMult, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(now);
            osc.stop(now + dur + 0.01);
          }
          break;
        }
        
        case 'upgrade': {
          const config = RARITY_MULTIPLIERS[rarity] || RARITY_MULTIPLIERS.Common;
          const pitchMult = config.pitch;
          const volMult = config.volume;
          const dur = config.duration * 1.3; // Upgrades are slightly longer for grandeur

          if (['Original', 'Overseer', '???'].includes(rarity)) {
            // reality-bending upgrade fanfare
            const frequencies = [80, 160, 240, 320, 480].map(f => f * pitchMult);
            frequencies.forEach((freq, idx) => {
              const osc = this.ctx!.createOscillator();
              const gain = this.ctx!.createGain();
              const delay = idx * 0.08;

              osc.type = 'sawtooth';
              osc.frequency.setValueAtTime(freq, now + delay);
              osc.frequency.exponentialRampToValueAtTime(freq * 3, now + delay + dur);

              const filter = this.ctx!.createBiquadFilter();
              filter.type = 'lowpass';
              filter.frequency.setValueAtTime(100, now + delay);
              filter.frequency.exponentialRampToValueAtTime(1500, now + delay + dur);

              gain.gain.setValueAtTime(0.08 * volMult, now + delay);
              gain.gain.exponentialRampToValueAtTime(0.001, now + delay + dur);

              osc.connect(filter);
              filter.connect(gain);
              gain.connect(this.sfxGain!);

              osc.start(now + delay);
              osc.stop(now + delay + dur + 0.1);
            });
          } else if (['Celestial', 'Unrivaled'].includes(rarity)) {
            // Celestial ascending scales and divine star shimmer
            const scale = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50].map(f => f * pitchMult);
            scale.forEach((freq, idx) => {
              const osc = this.ctx!.createOscillator();
              const gain = this.ctx!.createGain();
              const delay = idx * 0.05;

              osc.type = 'sine';
              osc.frequency.setValueAtTime(freq, now + delay);
              osc.frequency.linearRampToValueAtTime(freq * 1.1, now + delay + 0.15);

              gain.gain.setValueAtTime(0.05 * volMult, now + delay);
              gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.3);

              osc.connect(gain);
              gain.connect(this.sfxGain!);

              osc.start(now + delay);
              osc.stop(now + delay + 0.35);
            });

            // Sparkle chimes at the top
            const sparkle = this.ctx.createOscillator();
            const sparkleGain = this.ctx.createGain();
            sparkle.type = 'triangle';
            sparkle.frequency.setValueAtTime(1500 * pitchMult, now + 0.3);
            sparkleGain.gain.setValueAtTime(0.08 * volMult, now + 0.3);
            sparkleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3 + dur * 0.6);
            sparkle.connect(sparkleGain);
            sparkleGain.connect(this.sfxGain);
            sparkle.start(now + 0.3);
            sparkle.stop(now + 0.3 + dur);
          } else if (['Legendary', 'Mythic', 'Secret'].includes(rarity)) {
            // Triumphant multi-tone fanfare
            const baseFreq = 220 * pitchMult;
            const steps = [1, 1.25, 1.5, 2.0]; // Major triad arpeggio
            steps.forEach((step, idx) => {
              const osc1 = this.ctx!.createOscillator();
              const osc2 = this.ctx!.createOscillator();
              const gain = this.ctx!.createGain();
              const delay = idx * 0.06;

              osc1.type = 'sine';
              osc1.frequency.setValueAtTime(baseFreq * step, now + delay);
              osc1.frequency.linearRampToValueAtTime(baseFreq * step * 1.5, now + delay + 0.2);

              osc2.type = 'triangle';
              osc2.frequency.setValueAtTime(baseFreq * step * 0.5, now + delay);

              gain.gain.setValueAtTime(0.06 * volMult, now + delay);
              gain.gain.exponentialRampToValueAtTime(0.001, now + delay + dur - delay);

              osc1.connect(gain);
              osc2.connect(gain);
              gain.connect(this.sfxGain!);

              osc1.start(now + delay);
              osc1.stop(now + delay + dur);
              osc2.start(now + delay);
              osc2.stop(now + delay + dur);
            });
          } else {
            // Common, Rare, Epic
            const osc1 = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc1.type = 'sine';
            const baseFreq1 = 330 * pitchMult;
            osc1.frequency.setValueAtTime(baseFreq1, now);
            osc1.frequency.setValueAtTime(baseFreq1 * 1.33, now + 0.06);
            osc1.frequency.setValueAtTime(baseFreq1 * 2.0, now + 0.12);

            osc2.type = 'triangle';
            const baseFreq2 = 165 * pitchMult;
            osc2.frequency.setValueAtTime(baseFreq2, now);
            osc2.frequency.exponentialRampToValueAtTime(baseFreq2 * 2.0, now + dur);

            gain.gain.setValueAtTime(0.08 * volMult, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(this.sfxGain);

            osc1.start(now);
            osc1.stop(now + dur);
            osc2.start(now);
            osc2.stop(now + dur);
          }
          break;
        }

        case 'gacha': {
          const config = RARITY_MULTIPLIERS[rarity] || RARITY_MULTIPLIERS.Common;
          const pitchMult = config.pitch;
          const volMult = config.volume;
          const dur = config.duration * 1.5;

          if (['Original', 'Overseer', '???'].includes(rarity)) {
            // Super cosmic spatial chime chord with massive depth
            const notes = [110, 220, 330, 440, 554, 660, 880].map(f => f * pitchMult);
            notes.forEach((freq, idx) => {
              const osc = this.ctx!.createOscillator();
              const gain = this.ctx!.createGain();
              const pTime = now + idx * 0.06;

              osc.type = idx % 2 === 0 ? 'sawtooth' : 'sine';
              osc.frequency.setValueAtTime(freq, pTime);
              osc.frequency.exponentialRampToValueAtTime(freq * 0.5, pTime + dur);

              const filter = this.ctx!.createBiquadFilter();
              filter.type = 'lowpass';
              filter.frequency.setValueAtTime(80, pTime);
              filter.frequency.exponentialRampToValueAtTime(1000, pTime + 0.3);
              filter.frequency.exponentialRampToValueAtTime(80, pTime + dur);

              gain.gain.setValueAtTime(0.09 * volMult, pTime);
              gain.gain.exponentialRampToValueAtTime(0.001, pTime + dur);

              osc.connect(filter);
              filter.connect(gain);
              gain.connect(this.sfxGain!);

              osc.start(pTime);
              osc.stop(pTime + dur + 0.1);
            });
          } else if (['Celestial', 'Unrivaled', 'Secret', 'Mythic'].includes(rarity)) {
            // Chime notes cascading
            const chimeNotes = [440, 554.37, 659.25, 880, 1108.73, 1318.51, 1760].map(f => f * pitchMult);
            chimeNotes.forEach((freq, idx) => {
              const osc = this.ctx!.createOscillator();
              const gain = this.ctx!.createGain();
              const pTime = now + idx * 0.05;

              osc.type = 'sine';
              osc.frequency.setValueAtTime(freq, pTime);
              osc.frequency.exponentialRampToValueAtTime(freq * 1.5, pTime + dur);

              gain.gain.setValueAtTime(0.07 * volMult, pTime);
              gain.gain.exponentialRampToValueAtTime(0.001, pTime + dur);

              osc.connect(gain);
              gain.connect(this.sfxGain!);

              osc.start(pTime);
              osc.stop(pTime + dur + 0.1);
            });
          } else {
            // Common, Rare, Epic, Legendary chimes
            const chimeNotes = [440, 554.37, 659.25, 880].map(f => f * pitchMult);
            chimeNotes.forEach((freq, idx) => {
              const osc = this.ctx!.createOscillator();
              const gain = this.ctx!.createGain();
              const pTime = now + idx * 0.04;

              osc.type = 'sine';
              osc.frequency.setValueAtTime(freq, pTime);
              osc.frequency.exponentialRampToValueAtTime(freq * 1.3, pTime + dur);

              gain.gain.setValueAtTime(0.04 * volMult, pTime);
              gain.gain.exponentialRampToValueAtTime(0.001, pTime + dur);

              osc.connect(gain);
              gain.connect(this.sfxGain!);

              osc.start(pTime);
              osc.stop(pTime + dur);
            });
          }
          break;
        }
        
        case 'wave_start': {
          // Warning alarm sirens
          for (let i = 0; i < 2; i++) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const pTime = now + i * 0.25;
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(180, pTime);
            osc.frequency.linearRampToValueAtTime(320, pTime + 0.12);
            osc.frequency.linearRampToValueAtTime(180, pTime + 0.24);
            
            gain.gain.setValueAtTime(0.08, pTime);
            gain.gain.linearRampToValueAtTime(0.05, pTime + 0.12);
            gain.gain.exponentialRampToValueAtTime(0.001, pTime + 0.25);
            
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(pTime);
            osc.stop(pTime + 0.25);
          }
          break;
        }
        
        case 'victory': {
          // Sweeping victorious scale
          const victoryNotes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
          victoryNotes.forEach((freq, idx) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            const pTime = now + idx * 0.07;
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, pTime);
            
            gain.gain.setValueAtTime(0.08, pTime);
            gain.gain.exponentialRampToValueAtTime(0.001, pTime + 0.5);
            
            osc.connect(gain);
            gain.connect(this.sfxGain!);
            osc.start(pTime);
            osc.stop(pTime + 0.55);
          });
          break;
        }

        case 'defeat': {
          // Descending dark theme chord
          const defeatNotes = [220, 207.65, 196, 174.61];
          defeatNotes.forEach((freq, idx) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            const pTime = now + idx * 0.15;
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, pTime);
            osc.frequency.linearRampToValueAtTime(freq * 0.8, pTime + 0.4);
            
            gain.gain.setValueAtTime(0.09, pTime);
            gain.gain.exponentialRampToValueAtTime(0.001, pTime + 0.45);
            
            osc.connect(gain);
            gain.connect(this.sfxGain!);
            osc.start(pTime);
            osc.stop(pTime + 0.5);
          });
          break;
        }
        
        case 'error': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(130, now);
          osc.frequency.setValueAtTime(110, now + 0.08);
          
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
          
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(now);
          osc.stop(now + 0.18);
          break;
        }
      }
    } catch (e) {
      console.warn('Playback of SFX interrupted gracefully:', e);
    }
  }

  // Ambient Drone loop
  // Periodically schedules a beautiful cybernetic space ambient pad
  private startAmbient() {
    if (!this.ambientAudioEnabled || this.globalMute) {
      this.clearAmbientOscillators();
      return;
    }
    
    this.init();
    if (!this.ctx) return;
    
    if (this.ctx.state === 'suspended') {
      // Don't loop aggressively if blocked by browser policy, wait for interactions
      return;
    }

    if (this.ambientInterval) return; // Already running

    const playDroneStep = () => {
      if (!this.ctx || !this.ambientGain || !this.ambientAudioEnabled || this.globalMute) return;
      
      const now = this.ctx.currentTime;
      
      // Chords representing deep, spacey synthesized themes
      const chordPool = [
        [130.81, 164.81, 196.00, 261.63], // C major depth
        [130.81, 155.56, 196.00, 246.94], // C minor key spacey depth
        [116.54, 146.83, 174.61, 233.08], // Bb major warm
        [103.83, 130.81, 155.56, 207.65], // Ab major warm pad
        [110.00, 138.59, 164.81, 220.00], // A major
      ];
      
      const chosenChord = chordPool[Math.floor(Math.random() * chordPool.length)];
      
      // Create lush background pad oscillators
      chosenChord.forEach((freq) => {
        if (!this.ctx || !this.ambientGain) return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        
        osc.type = Math.random() > 0.5 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        
        // Slight low-frequency oscillation (vibes)
        osc.frequency.linearRampToValueAtTime(freq + (Math.random() * 4 - 2), now + 3);
        
        filter.type = 'lowpass';
        // Low cutoff frequency for deep warm drone without treble hiss
        filter.frequency.setValueAtTime(180, now);
        filter.frequency.exponentialRampToValueAtTime(320, now + 1.5);
        filter.frequency.exponentialRampToValueAtTime(180, now + 3.8);
        
        // Soft fading volume ramp envelope (fade-in, sustain, fade-out)
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.015, now + 1.5); // very soft
        gain.gain.setValueAtTime(0.015, now + 2.5);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.9);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ambientGain);
        
        osc.start(now);
        osc.stop(now + 4);
        
        const record = { osc, gain };
        this.activeAmbientOscillators.push(record);
        
        // Clear references after they expire
        setTimeout(() => {
          this.activeAmbientOscillators = this.activeAmbientOscillators.filter(item => item !== record);
        }, 4200);
      });
    };

    // Play immediately and then repeat every 3.8 seconds for smooth blending overlays
    playDroneStep();
    this.ambientInterval = setInterval(playDroneStep, 3800);
  }

  private clearAmbientOscillators() {
    if (this.ambientInterval) {
      clearInterval(this.ambientInterval);
      this.ambientInterval = null;
    }
    
    // Smoothly stop active drones
    this.activeAmbientOscillators.forEach(({ osc, gain }) => {
      try {
        if (this.ctx) {
          gain.gain.cancelScheduledValues(this.ctx.currentTime);
          gain.gain.setValueAtTime(gain.gain.value, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.3);
          setTimeout(() => {
            try { osc.stop(); } catch {}
          }, 350);
        } else {
          osc.stop();
        }
      } catch {}
    });
    
    this.activeAmbientOscillators = [];
  }

  // ==========================================
  // 🦫 CAPYBARA VIRAL THEME SONG SYNTHESIZER 🦫
  // Plays the authentic viral "Capybara, Capybara, Capybara, Capybara, Capybara-bara-bara-bara, Capybara!"
  // 128 BPM energetic bounce with vocal formant synthesis, driving house kick & clap, and slap bass!
  // ==========================================

  public startCapybaraTheme() {
    this.init();
    if (!this.ctx || !this.capyGain) return;
    
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    if (this.capyThemePlaying) return; // already playing
    this.capyThemePlaying = true;

    // Stop ambient during Capybara theme for pristine audio clarity
    this.clearAmbientOscillators();

    const bpm = 128;
    const beatSec = 60 / bpm; // ~0.46875s per beat
    const loopDurationSec = beatSec * 16; // 4 bars = 16 beats (~7.5s)

    // Formant vocal chant synthesizer ("Ca-py-ba-ra")
    const playVocalChantNote = (freq: number, startTime: number, duration: number, vowel: 'ca' | 'py' | 'ba' | 'ra' = 'ca', vol = 0.32) => {
      if (!this.ctx || !this.capyGain || !this.capyThemePlaying) return;
      try {
        const osc = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const formant1 = this.ctx.createBiquadFilter();
        const formant2 = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        // Sawtooth wave through dual-bandpass formant filter creates robotic human vowel phonetics
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, startTime);

        osc2.type = 'square';
        osc2.frequency.setValueAtTime(freq * 0.998, startTime); // subtle detune for fat vocal punch

        formant1.type = 'bandpass';
        formant1.Q.setValueAtTime(4.5, startTime);
        formant2.type = 'bandpass';
        formant2.Q.setValueAtTime(5.0, startTime);

        // Vowel formant frequencies
        if (vowel === 'ca' || vowel === 'ba' || vowel === 'ra') {
          // 'Ah' vowel (~750Hz, 1250Hz)
          formant1.frequency.setValueAtTime(750, startTime);
          formant2.frequency.setValueAtTime(1250, startTime);
        } else {
          // 'Ee' vowel (~350Hz, 2400Hz for "-py-")
          formant1.frequency.setValueAtTime(400, startTime);
          formant2.frequency.setValueAtTime(2200, startTime);
        }

        // Punchy vocal articulation envelope
        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(vol, startTime + 0.015);
        gain.gain.exponentialRampToValueAtTime(vol * 0.85, startTime + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(formant1);
        osc2.connect(formant1);
        osc.connect(formant2);
        osc2.connect(formant2);

        formant1.connect(gain);
        formant2.connect(gain);
        gain.connect(this.capyGain);

        osc.start(startTime);
        osc2.start(startTime);
        osc.stop(startTime + duration + 0.05);
        osc2.stop(startTime + duration + 0.05);

        const rec1 = { osc, gain };
        const rec2 = { osc: osc2, gain };
        this.activeCapyOscillators.push(rec1, rec2);
        setTimeout(() => {
          this.activeCapyOscillators = this.activeCapyOscillators.filter(r => r !== rec1 && r !== rec2);
        }, (startTime - this.ctx.currentTime + duration + 0.3) * 1000);
      } catch {}
    };

    // Bouncy plucked Bass note
    const playBassNote = (freq: number, startTime: number, duration: number, vol = 0.34) => {
      if (!this.ctx || !this.capyGain || !this.capyThemePlaying) return;
      try {
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, startTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, startTime);
        filter.frequency.exponentialRampToValueAtTime(120, startTime + duration);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(vol, startTime + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.capyGain);

        osc.start(startTime);
        osc.stop(startTime + duration + 0.05);

        const rec = { osc, gain };
        this.activeCapyOscillators.push(rec);
        setTimeout(() => {
          this.activeCapyOscillators = this.activeCapyOscillators.filter(r => r !== rec);
        }, (startTime - this.ctx.currentTime + duration + 0.3) * 1000);
      } catch {}
    };

    // Lead Synth hook
    const playLeadSynth = (freq: number, startTime: number, duration: number, vol = 0.18) => {
      if (!this.ctx || !this.capyGain || !this.capyThemePlaying) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(vol, startTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
        osc.connect(gain);
        gain.connect(this.capyGain);
        osc.start(startTime);
        osc.stop(startTime + duration + 0.05);
        this.activeCapyOscillators.push({ osc, gain });
      } catch {}
    };

    // Bouncy dance percussion (kick, clap, offbeat hihat)
    const playPercussion = (startTime: number, type: 'kick' | 'clap' | 'hihat') => {
      if (!this.ctx || !this.capyGain || !this.capyThemePlaying) return;
      try {
        if (type === 'kick') {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.frequency.setValueAtTime(160, startTime);
          osc.frequency.exponentialRampToValueAtTime(42, startTime + 0.12);
          gain.gain.setValueAtTime(0.35, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.14);
          osc.connect(gain);
          gain.connect(this.capyGain);
          osc.start(startTime);
          osc.stop(startTime + 0.15);
          this.activeCapyOscillators.push({ osc, gain });
        } else if (type === 'clap') {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(320, startTime);
          osc.frequency.exponentialRampToValueAtTime(100, startTime + 0.08);
          gain.gain.setValueAtTime(0.18, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.09);
          osc.connect(gain);
          gain.connect(this.capyGain);
          osc.start(startTime);
          osc.stop(startTime + 0.1);
          this.activeCapyOscillators.push({ osc, gain });
        } else {
          // Crisp open hi-hat
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(1100, startTime);
          gain.gain.setValueAtTime(0.06, startTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.08);
          osc.connect(gain);
          gain.connect(this.capyGain);
          osc.start(startTime);
          osc.stop(startTime + 0.09);
          this.activeCapyOscillators.push({ osc, gain });
        }
      } catch {}
    };

    // Notes for viral Capybara chant in D Minor
    const D4 = 293.66;
    const F4 = 349.23;
    const G4 = 392.00;
    const A4 = 440.00;
    const C5 = 523.25;
    const D5 = 587.33;

    const D2 = 73.42;
    const F2 = 87.31;
    const G2 = 98.00;
    const A2 = 110.00;

    const scheduleCapyPattern = () => {
      if (!this.ctx || !this.capyGain || !this.capyThemePlaying) return;
      const baseTime = this.ctx.currentTime + 0.05;

      // ==========================================
      // SECTION 1: 4 Iconic Chant Blocks
      // "Ка-пи-ба-ра" (Beat 0) -> "Ка-пи-ба-ра" (Beat 1) -> "Ка-пи-ба-ра" (Beat 2) -> "Ка-пи-ба-ра" (Beat 3)
      // ==========================================

      // 1st Chant: "Ка-пи-ба-ра" on D4
      playVocalChantNote(D4, baseTime + beatSec * 0.0, beatSec * 0.22, 'ca');
      playVocalChantNote(D4, baseTime + beatSec * 0.25, beatSec * 0.22, 'py');
      playVocalChantNote(D4, baseTime + beatSec * 0.5, beatSec * 0.22, 'ba');
      playVocalChantNote(D4, baseTime + beatSec * 0.75, beatSec * 0.22, 'ra');

      // 2nd Chant: "Ка-пи-ба-ра" on F4
      playVocalChantNote(F4, baseTime + beatSec * 1.0, beatSec * 0.22, 'ca');
      playVocalChantNote(F4, baseTime + beatSec * 1.25, beatSec * 0.22, 'py');
      playVocalChantNote(F4, baseTime + beatSec * 1.5, beatSec * 0.22, 'ba');
      playVocalChantNote(F4, baseTime + beatSec * 1.75, beatSec * 0.22, 'ra');

      // 3rd Chant: "Ка-пи-ба-ра" on G4
      playVocalChantNote(G4, baseTime + beatSec * 2.0, beatSec * 0.22, 'ca');
      playVocalChantNote(G4, baseTime + beatSec * 2.25, beatSec * 0.22, 'py');
      playVocalChantNote(G4, baseTime + beatSec * 2.5, beatSec * 0.22, 'ba');
      playVocalChantNote(G4, baseTime + beatSec * 2.75, beatSec * 0.22, 'ra');

      // 4th Chant: "Ка-пи-ба-ра" on A4
      playVocalChantNote(A4, baseTime + beatSec * 3.0, beatSec * 0.22, 'ca');
      playVocalChantNote(A4, baseTime + beatSec * 3.25, beatSec * 0.22, 'py');
      playVocalChantNote(A4, baseTime + beatSec * 3.5, beatSec * 0.22, 'ba');
      playVocalChantNote(A4, baseTime + beatSec * 3.75, beatSec * 0.22, 'ra');

      // ==========================================
      // SECTION 2: Rapid Viral Chant "Ка-пи-ба-ра-ба-ра-ба-ра, КАПИБАРА!"
      // ==========================================
      // Fast sixteenth chant "Ка-пи-ба-ра-ба-ра-ба-ра"
      const fastNotes = [A4, A4, A4, A4, G4, G4, F4, F4];
      fastNotes.forEach((n, i) => {
        playVocalChantNote(n, baseTime + beatSec * (4.0 + i * 0.25), beatSec * 0.2, (i % 2 === 0 ? 'ba' : 'ra'), 0.36);
      });

      // Grand drop finish: "Ка-пи-ба-ра!" (D4 -> F4 -> G4 -> A4)
      playVocalChantNote(D4, baseTime + beatSec * 6.0, beatSec * 0.3, 'ca', 0.38);
      playVocalChantNote(F4, baseTime + beatSec * 6.35, beatSec * 0.3, 'py', 0.38);
      playVocalChantNote(G4, baseTime + beatSec * 6.7, beatSec * 0.3, 'ba', 0.38);
      playVocalChantNote(A4, baseTime + beatSec * 7.05, beatSec * 0.8, 'ra', 0.42);

      // ==========================================
      // SECTION 3: Infectious Dance Drop Riff (Beats 8-16)
      // ==========================================
      const riff = [
        { t: 8.0, n: D4 }, { t: 8.5, n: D4 }, { t: 9.0, n: F4 }, { t: 9.5, n: D4 },
        { t: 10.0, n: G4 }, { t: 10.5, n: F4 }, { t: 11.0, n: D4 }, { t: 11.5, n: C5 },
        { t: 12.0, n: D5 }, { t: 12.5, n: A4 }, { t: 13.0, n: F4 }, { t: 13.5, n: G4 },
        { t: 14.0, n: A4 }, { t: 14.5, n: G4 }, { t: 15.0, n: F4 }, { t: 15.5, n: D4 }
      ];
      riff.forEach(r => {
        playLeadSynth(r.n, baseTime + beatSec * r.t, beatSec * 0.42, 0.24);
        playVocalChantNote(r.n, baseTime + beatSec * r.t, beatSec * 0.22, 'ca', 0.2);
      });

      // Bass progression across 16 beats (D2 -> F2 -> G2 -> A2)
      for (let b = 0; b < 16; b += 2) {
        const bassFreq = (b < 4) ? D2 : (b < 8) ? F2 : (b < 12) ? G2 : A2;
        playBassNote(bassFreq, baseTime + beatSec * b, beatSec * 0.8, 0.35);
        playBassNote(bassFreq, baseTime + beatSec * (b + 1), beatSec * 0.6, 0.3);
      }

      // 4-on-the-floor Drums rhythm
      for (let i = 0; i < 16; i++) {
        const beatTime = baseTime + beatSec * i;
        // Kick on every beat 0..15
        playPercussion(beatTime, 'kick');
        // Clap on beats 1, 3, 5, 7, 9, 11, 13, 15
        if (i % 2 === 1) {
          playPercussion(beatTime, 'clap');
        }
        // Offbeat hi-hat on & (i + 0.5)
        playPercussion(beatTime + beatSec * 0.5, 'hihat');
      }
    };

    scheduleCapyPattern();
    this.capyThemeInterval = setInterval(scheduleCapyPattern, loopDurationSec * 1000 - 30);
  }

  public stopCapybaraTheme() {
    this.capyThemePlaying = false;
    if (this.capyThemeInterval) {
      clearInterval(this.capyThemeInterval);
      this.capyThemeInterval = null;
    }

    // Fade out and stop any active oscillators
    this.activeCapyOscillators.forEach(({ osc, gain }) => {
      try {
        if (this.ctx) {
          gain.gain.cancelScheduledValues(this.ctx.currentTime);
          gain.gain.setValueAtTime(gain.gain.value, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.15);
          setTimeout(() => {
            try { osc.stop(); } catch {}
          }, 180);
        } else {
          osc.stop();
        }
      } catch {}
    });
    this.activeCapyOscillators = [];

    // Resume subtle ambient audio if enabled
    if (this.ambientAudioEnabled && !this.globalMute) {
      this.startAmbient();
    }
  }

  public isCapybaraThemePlaying(): boolean {
    return this.capyThemePlaying;
  }

  public setCapybaraThemeVolume(volume: number) {
    this.capyThemeVolume = Math.max(0, Math.min(1, volume));
    if (this.capyGain && this.ctx && !this.globalMute) {
      this.capyGain.gain.setValueAtTime(this.capyThemeVolume, this.ctx.currentTime);
    }
  }
}

export const gameAudio = new GameAudioManager();
