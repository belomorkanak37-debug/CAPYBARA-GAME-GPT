import type { SoundSettings } from '../types';

type SfxType = 'click' | 'coin' | 'merge' | 'upgrade' | 'quest' | 'error' | 'visitor' | 'reward';
type ChannelName = 'music' | 'ambient' | 'ui' | 'sfx';

const volumes: Record<ChannelName, number> = {
  music: 0.32,
  ambient: 0.16,
  ui: 0.52,
  sfx: 0.62
};

class AudioSystem {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private channels = new Map<ChannelName, GainNode>();
  private settings: SoundSettings = { music: true, sfx: true };
  private musicTimer: number | null = null;
  private ambientTimer: number | null = null;
  private unlocked = false;
  private paused = false;
  private musicStep = 0;

  applySettings(settings: SoundSettings): void {
    this.settings = settings;
    if (!settings.music) this.stopLoops();
    if (settings.music && this.unlocked && !this.paused) this.startLoops();
  }

  async unlock(): Promise<void> {
    const ctx = this.ensure();
    if (!ctx) return;
    if (ctx.state === 'suspended') await ctx.resume().catch(() => undefined);
    this.unlocked = true;
    this.paused = false;
    this.setChannelVolume('ui', volumes.ui, 0.01);
    this.setChannelVolume('sfx', volumes.sfx, 0.01);
    if (this.settings.music) this.startLoops();
  }

  setMusic(enabled: boolean): void {
    this.settings.music = enabled;
    if (!enabled) {
      this.stopLoops();
      return;
    }
    if (this.unlocked && !this.paused) this.startLoops();
  }

  setSfx(enabled: boolean): void { this.settings.sfx = enabled; }

  play(type: SfxType): void {
    if (!this.settings.sfx) return;
    const ctx = this.ensure();
    if (!ctx) return;
    if (ctx.state === 'suspended') void ctx.resume();
    this.unlocked = true;

    if (type === 'click') this.sequence([520, 650], 0.035, 'ui', 0.38, 'triangle');
    else if (type === 'coin') this.sequence([880, 1175, 1568], 0.055, 'sfx', 0.42, 'sine');
    else if (type === 'merge') this.sequence([392, 523, 784], 0.09, 'sfx', 0.46, 'triangle');
    else if (type === 'upgrade') this.sequence([440, 554, 659, 880], 0.07, 'sfx', 0.44, 'triangle');
    else if (type === 'quest' || type === 'reward') this.sequence([659, 880, 1175, 1760], 0.085, 'sfx', 0.5, 'sine');
    else if (type === 'visitor') this.sequence([330, 392], 0.05, 'sfx', 0.28, 'triangle');
    else this.sequence([180, 135], 0.09, 'sfx', 0.32, 'sawtooth');
  }

  pause(): void {
    this.paused = true;
    this.fadeChannel('music', 0, 0.18);
    this.fadeChannel('ambient', 0, 0.18);
    window.setTimeout(() => this.stopLoops(), 220);
  }

  resume(): void {
    this.paused = false;
    if (this.settings.music && this.unlocked) this.startLoops();
  }

  isUnlocked(): boolean { return this.unlocked; }

  private ensure(): AudioContext | null {
    if (this.context) return this.context;
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    this.context = new Ctx();
    this.master = this.context.createGain();
    this.master.gain.value = 0.9;
    this.master.connect(this.context.destination);
    (Object.keys(volumes) as ChannelName[]).forEach(channel => {
      const gain = this.context!.createGain();
      gain.gain.value = 0;
      gain.connect(this.master!);
      this.channels.set(channel, gain);
    });
    this.setChannelVolume('ui', volumes.ui, 0.01);
    this.setChannelVolume('sfx', volumes.sfx, 0.01);
    return this.context;
  }

  private startLoops(): void {
    const ctx = this.ensure();
    if (!ctx || !this.settings.music || this.paused) return;
    this.setChannelVolume('music', volumes.music, 0.65);
    this.setChannelVolume('ambient', volumes.ambient, 0.9);
    if (this.musicTimer === null) {
      this.playMusicPhrase();
      this.musicTimer = window.setInterval(() => this.playMusicPhrase(), 2400);
    }
    if (this.ambientTimer === null) {
      this.playAmbientPad();
      this.ambientTimer = window.setInterval(() => this.playAmbientPad(), 5200);
    }
  }

  private stopLoops(): void {
    if (this.musicTimer !== null) { window.clearInterval(this.musicTimer); this.musicTimer = null; }
    if (this.ambientTimer !== null) { window.clearInterval(this.ambientTimer); this.ambientTimer = null; }
    this.fadeChannel('music', 0, 0.25);
    this.fadeChannel('ambient', 0, 0.25);
  }

  private playMusicPhrase(): void {
    const phrases = [
      [392, 494, 587, 494, 440, 523],
      [349, 440, 523, 659, 587, 494],
      [392, 523, 659, 784, 659, 523]
    ];
    const notes = phrases[this.musicStep % phrases.length];
    this.musicStep += 1;
    notes.forEach((freq, index) => this.tone(freq, 0.18, 'music', 0.13, 'triangle', index * 0.28));
  }

  private playAmbientPad(): void {
    const chord = [196, 247, 330];
    chord.forEach((freq, index) => this.tone(freq, 1.8, 'ambient', 0.045, 'sine', index * 0.04));
  }

  private sequence(notes: number[], duration: number, channel: ChannelName, volume: number, type: OscillatorType): void {
    notes.forEach((freq, index) => this.tone(freq, duration, channel, volume, type, index * duration * 0.72));
  }

  private tone(freq: number, duration: number, channel: ChannelName, volume: number, type: OscillatorType, delay = 0): void {
    const ctx = this.ensure();
    const gainNode = this.channels.get(channel);
    if (!ctx || !gainNode) return;
    const start = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(freq, start);
    osc.type = type;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), start + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(gainNode);
    osc.start(start);
    osc.stop(start + duration + 0.04);
  }

  private setChannelVolume(channel: ChannelName, volume: number, seconds: number): void {
    const ctx = this.ensure();
    const gain = this.channels.get(channel);
    if (!ctx || !gain) return;
    gain.gain.cancelScheduledValues(ctx.currentTime);
    gain.gain.setValueAtTime(Math.max(0.0001, gain.gain.value), ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + seconds);
  }

  private fadeChannel(channel: ChannelName, volume: number, seconds: number): void { this.setChannelVolume(channel, volume, seconds); }
}

export const audio = new AudioSystem();
