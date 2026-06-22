import { gameConfig } from '../config/gameConfig';
import type { SaveData } from '../types';
import { audio } from './AudioSystem';
import { yandexSDK } from './YandexSDK';

export interface InterstitialContext {
  isTutorial?: boolean;
  isDragging?: boolean;
  isPopupOpen?: boolean;
  lastUserActionAt?: number;
  minIdleMs?: number;
}

export class AdSystem {
  private lastAt = 0;

  constructor(private readonly save: () => Promise<void>) {}

  canShowInterstitial(data: SaveData, force = false, context: InterstitialContext = {}): boolean {
    if (data.adsRemoved) return false;
    if (context.isTutorial || context.isDragging || context.isPopupOpen) return false;

    const now = Date.now();
    if (!force && now - this.lastAt < gameConfig.interstitialCooldownMs) return false;

    const minIdleMs = context.minIdleMs ?? 800;
    if (context.lastUserActionAt && now - context.lastUserActionAt < minIdleMs) return false;

    return true;
  }

  async maybeShowInterstitial(data: SaveData, force = false, context: InterstitialContext = {}): Promise<boolean> {
    if (!this.canShowInterstitial(data, force, context)) return false;

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
    if (!result.granted) console.warn('[AdSystem] Reward was not granted', label, result.reason);
    return result.granted;
  }
}
