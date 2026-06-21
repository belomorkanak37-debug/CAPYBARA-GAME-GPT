import { gameConfig } from '../config/gameConfig';
import type { SaveData } from '../types';
import { audio } from './AudioSystem';
import { yandexSDK } from './YandexSDK';

export class AdSystem {
  private lastAt = 0;

  constructor(private readonly save: () => Promise<void>) {}

  async maybeShowInterstitial(data: SaveData, force = false): Promise<boolean> {
    if (data.adsRemoved) return false;
    const now = Date.now();
    if (!force && now - this.lastAt < gameConfig.interstitialCooldownMs) return false;
    await this.save();
    audio.pause();
    const shown = await yandexSDK.showInterstitial();
    audio.resume();
    this.lastAt = Date.now();
    return shown;
  }

  async showRewarded(label: string, action: () => void): Promise<boolean> {
    await this.save();
    audio.pause();
    const result = await yandexSDK.showRewarded(action);
    audio.resume();
    console.info('[AdSystem]', label, result);
    return result.granted;
  }
}
