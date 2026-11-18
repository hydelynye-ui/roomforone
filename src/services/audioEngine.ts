import type { AudioTrack, RoomState, TrackMix, WeatherPreset } from '../types';

const mix: Record<WeatherPreset, TrackMix> = {
  sunny: { rain: 0.06, wind: 0.4, birds: 1, lofi: 0.35 },
  cloudy: { rain: 0.12, wind: 0.55, birds: 0.3, lofi: 0.42 },
  rain: { rain: 1, wind: 0.7, birds: 0.1, lofi: 0.5 },
  snow: { rain: 0.06, wind: 0.65, birds: 0.1, lofi: 0.55 },
  autumn: { rain: 0.06, wind: 0.9, birds: 0.45, lofi: 0.45 },
  night: { rain: 0.06, wind: 0.25, birds: 0.07, lofi: 0.9 },
};

class ProceduralAudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private channels = {} as Record<AudioTrack, GainNode>;
  private filters: BiquadFilterNode[] = [];
  private timer: number | null = null;
  private state: Pick<RoomState, 'weather' | 'windowOpen' | 'audioTracks' | 'masterVolume'> | null = null;
  private muted = true;
  private beat = 0;

  private init() {
    if (this.ctx) return;
    const Constructor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Constructor) throw new Error('This browser does not support room audio');
    const ctx = this.ctx = new Constructor();
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    const compressor = ctx.createDynamicsCompressor();
    this.master.connect(compressor).connect(ctx.destination);
    (['rain', 'wind', 'birds', 'lofi'] as AudioTrack[]).forEach(track => {
      const gain = this.channels[track] = ctx.createGain();
      gain.gain.value = 0;
      if (track === 'rain' || track === 'wind') {
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1600;
        gain.connect(filter).connect(this.master!);
        this.filters.push(filter);
      } else gain.connect(this.master!);
    });
    // Two looped sources are allocated once; switching weather only changes gains/filters.
    for (const track of ['rain', 'wind'] as const) {
      const noise = ctx.createBuffer(1, ctx.sampleRate * 6, ctx.sampleRate);
      const data = noise.getChannelData(0);
      let brown = 0;
      for (let i = 0; i < data.length; i++) {
        const white = Math.random() * 2 - 1;
        brown = (brown + white * 0.02) / 1.02;
        // Fade both ends to zero so the loop has no amplitude discontinuity.
        const envelope = Math.min(1, i / 500, (data.length - i - 1) / 500);
        data[i] = (track === 'rain' ? white * 0.14 : brown * 1.5) * envelope;
      }
      const source = ctx.createBufferSource();
      source.buffer = noise;
      source.loop = true;
      source.connect(this.channels[track]);
      source.start();
    }
    this.timer = window.setInterval(() => this.tick(), 650);
  }

  private tone(track: 'lofi' | 'birds', frequency: number, duration: number, level: number) {
    if (!this.ctx) return;
    const ctx = this.ctx, now = ctx.currentTime;
    const oscillator = ctx.createOscillator(), envelope = ctx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, now);
    if (track === 'birds') oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.35, now + 0.08);
    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(level, now + 0.04);
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(envelope).connect(this.channels[track]);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.01);
    oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); };
  }

  private tick() {
    if (this.muted || this.ctx?.state !== 'running' || !this.state) return;
    const melody = [196, 246.94, 293.66, 220, 174.61, 220, 261.63, 196];
    this.tone('lofi', melody[this.beat % melody.length], 1.15, 0.1);
    if (this.beat % 4 === 0) this.tone('lofi', melody[this.beat % melody.length] / 2, 1.6, 0.07);
    if (this.beat % 5 === 0 && this.state.audioTracks.birds > 0) {
      this.tone('birds', 2200 + Math.random() * 400, 0.2, 0.18);
    }
    this.beat++;
  }

  update(state: Pick<RoomState, 'weather' | 'windowOpen' | 'audioTracks' | 'masterVolume'>) {
    this.state = state;
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    const weatherMix = mix[state.weather];
    for (const track of Object.keys(this.channels) as AudioTrack[]) {
      const attenuation = track === 'lofi' ? 1 : state.windowOpen ? 1 : track === 'birds' ? 0.4 : 0.28;
      const target = state.audioTracks[track] * weatherMix[track] * attenuation;
      const param = this.channels[track].gain;
      param.cancelScheduledValues(t);
      param.setTargetAtTime(target, t, 0.35);
    }
    for (const filter of this.filters) filter.frequency.setTargetAtTime(state.windowOpen ? 3600 : 650, t, 0.35);
    this.master.gain.setTargetAtTime(this.muted ? 0 : state.masterVolume, t, 0.1);
  }

  async setMute(muted: boolean): Promise<boolean> {
    if (muted) {
      this.muted = true;
      if (this.ctx && this.master) this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.04);
      return true;
    }
    // Only called directly by a user's explicit sound button, never by a scene/AI effect.
    this.init();
    if (this.ctx!.state !== 'running') await this.ctx!.resume();
    if (this.ctx!.state !== 'running') throw new Error('Playback is blocked by the browser. Click enable sound again.');
    this.muted = false;
    if (this.state) this.update(this.state);
    return false;
  }

  get playing() { return !this.muted && this.ctx?.state === 'running'; }
}
export const audioEngine = new ProceduralAudioEngine();
