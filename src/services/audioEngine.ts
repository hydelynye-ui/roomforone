import { WeatherPreset } from '../types';

class ProceduralAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private masterGain: GainNode | null = null;
  private weatherGain: GainNode | null = null;
  private weatherFilter: BiquadFilterNode | null = null;
  private ambientGain: GainNode | null = null;
  
  // Oscillators and noise nodes
  private noiseNode: AudioBufferSourceNode | null = null;
  private birdTimer: number | null = null;
  private isInitialized: boolean = false;

  private currentPreset: WeatherPreset = 'sunny';
  private windowOpen: boolean = true;

  constructor() {
    // AudioContext will only be created/resumed on user gesture
  }

  private initContext() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Weather channel
    this.weatherGain = this.ctx.createGain();
    this.weatherFilter = this.ctx.createBiquadFilter();
    this.weatherFilter.type = 'lowpass';
    this.weatherFilter.frequency.setValueAtTime(1200, this.ctx.currentTime);

    this.weatherGain.connect(this.weatherFilter);
    this.weatherFilter.connect(this.masterGain);

    // Ambient channel
    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    this.ambientGain.connect(this.masterGain);

    this.startNoiseGenerators();
    this.isInitialized = true;
  }

  private startNoiseGenerators() {
    if (!this.ctx || !this.weatherGain || !this.ambientGain) return;

    // Create 5 seconds loop of pink/white noise
    const bufferSize = this.ctx.sampleRate * 5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = buffer;
    this.noiseNode.loop = true;
    this.noiseNode.connect(this.weatherGain);
    this.noiseNode.start();
  }

  private triggerBirdChirp() {
    if (!this.ctx || this.isMuted || !this.ambientGain || this.currentPreset !== 'sunny') return;
    
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const chirpGain = this.ctx.createGain();
      
      osc.type = 'sine';
      const baseFreq = 2200 + Math.random() * 800;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq + 600, now + 0.06);
      osc.frequency.exponentialRampToValueAtTime(baseFreq - 300, now + 0.14);

      chirpGain.gain.setValueAtTime(0, now);
      chirpGain.gain.linearRampToValueAtTime(0.04 * (this.windowOpen ? 1 : 0.3), now + 0.02);
      chirpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

      osc.connect(chirpGain);
      chirpGain.connect(this.ambientGain);

      osc.start(now);
      osc.stop(now + 0.18);
    } catch {
      // ignore
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (!muted) {
      this.initContext();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    if (this.masterGain && this.ctx) {
      const targetGain = muted ? 0 : 0.8;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.1);
    }

    if (!muted && this.currentPreset === 'sunny' && !this.birdTimer) {
      this.birdTimer = window.setInterval(() => {
        if (Math.random() > 0.4) {
          this.triggerBirdChirp();
        }
      }, 4000);
    } else if (muted && this.birdTimer) {
      clearInterval(this.birdTimer);
      this.birdTimer = null;
    }
  }

  public updatePreset(preset: WeatherPreset, windowOpen: boolean, volWeather: number, volAmbient: number) {
    this.currentPreset = preset;
    this.windowOpen = windowOpen;

    if (!this.isInitialized || !this.ctx || !this.weatherGain || !this.weatherFilter || !this.ambientGain) {
      return;
    }

    const now = this.ctx.currentTime;
    // Window attenuation
    const windowFactor = windowOpen ? 1.0 : 0.35;
    const filterFreq = windowOpen ? 3000 : 700;

    this.weatherFilter.frequency.setTargetAtTime(filterFreq, now, 0.4);

    switch (preset) {
      case 'sunny':
        // Soft rustle
        this.weatherGain.gain.setTargetAtTime(volWeather * 0.15 * windowFactor, now, 0.3);
        this.ambientGain.gain.setTargetAtTime(volAmbient * 0.25, now, 0.3);
        break;
      case 'rain':
        // Rich rain sound
        this.weatherGain.gain.setTargetAtTime(volWeather * 0.7 * windowFactor, now, 0.3);
        this.ambientGain.gain.setTargetAtTime(volAmbient * 0.2, now, 0.3);
        break;
      case 'snow':
        // Quiet wind
        this.weatherGain.gain.setTargetAtTime(volWeather * 0.25 * windowFactor, now, 0.3);
        this.ambientGain.gain.setTargetAtTime(volAmbient * 0.15, now, 0.3);
        break;
      case 'autumn':
        // Autumn breeze & leaves rustle
        this.weatherGain.gain.setTargetAtTime(volWeather * 0.45 * windowFactor, now, 0.3);
        this.ambientGain.gain.setTargetAtTime(volAmbient * 0.3, now, 0.3);
        break;
      case 'night':
        // Warm lo-fi room stillness
        this.weatherGain.gain.setTargetAtTime(volWeather * 0.1 * windowFactor, now, 0.3);
        this.ambientGain.gain.setTargetAtTime(volAmbient * 0.12, now, 0.3);
        break;
    }
  }
}

export const audioEngine = new ProceduralAudioEngine();
