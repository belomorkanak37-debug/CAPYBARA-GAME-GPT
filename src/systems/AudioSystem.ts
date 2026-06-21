import type { SoundSettings } from '../types';

class AudioSystem {
  private context: AudioContext | null = null;
  private settings: SoundSettings = { music: true, sfx: true };
  private timer: number | null = null;

  applySettings(settings: SoundSettings): void { this.settings = settings; if (settings.music) this.startMusic(); else this.pause(); }
  setMusic(enabled: boolean): void { this.settings.music = enabled; enabled ? this.startMusic() : this.pause(); }
  setSfx(enabled: boolean): void { this.settings.sfx = enabled; }

  play(type: 'click' | 'coin' | 'merge' | 'upgrade' | 'quest' | 'error' | 'visitor' | 'reward'): void {
    if (!this.settings.sfx) return;
    const map = { click: 520, coin: 880, merge: 660, upgrade: 740, quest: 980, error: 180, visitor: 440, reward: 1040 };
    this.beep(map[type], type === 'error' ? 0.16 : 0.08);
  }

  pause(): void { if (this.timer !== null) { window.clearInterval(this.timer); this.timer = null; } }
  resume(): void { if (this.settings.music) this.startMusic(); }

  private ensure(): AudioContext | null {
    if (this.context) return this.context;
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    this.context = Ctx ? new Ctx() : null;
    return this.context;
  }

  private beep(freq: number, duration: number): void {
    const ctx = this.ensure();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.035, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration + 0.02);
  }

  private startMusic(): void {
    if (this.timer !== null) return;
    const notes = [262, 330, 392, 330, 294, 349];
    let i = 0;
    this.timer = window.setInterval(() => { if (this.settings.music) this.beep(notes[i++ % notes.length], 0.08); }, 800);
  }
}

export const audio = new AudioSystem();
