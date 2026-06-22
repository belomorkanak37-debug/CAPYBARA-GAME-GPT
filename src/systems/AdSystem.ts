import { gameConfig } from '../config/gameConfig';
import type { RewardPlacement, SaveData } from '../types';
import { audio } from './AudioSystem';
import { analytics } from './AnalyticsSystem';
import { yandexSDK } from './YandexSDK';

export interface InterstitialContext {
  isTutorial?: boolean;
  isDragging?: boolean;
  isPopupOpen?: boolean;
  lastUserActionAt?: number;
  minIdleMs?: number;
  placement?: string;
}

const rewardedCooldownMs: Record<RewardPlacement, number> = {
  coins_300: 5 * 60 * 1000,
  boost_2m: 10 * 60 * 1000,
  free_worker: 15 * 60 * 1000,
  offline_x2: 0
};

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

  canShowRewarded(data: SaveData, placement: RewardPlacement): boolean {
    const until = data.adCooldowns[placement] ?? 0;
    return Date.now() >= until;
  }

  getRewardedCooldownLeftMs(data: SaveData, placement: RewardPlacement): number {
    return Math.max(0, (data.adCooldowns[placement] ?? 0) - Date.now());
  }

  async maybeShowInterstitial(data: SaveData, force = false, context: InterstitialContext = {}): Promise<boolean> {
    const placement = context.placement ?? 'interstitial';
    if (!this.canShowInterstitial(data, force, context)) {
      analytics.track('ad_interstitial_skipped', { placement });
      return false;
    }

    analytics.track('ad_interstitial_requested', { placement });
    await this.save();
    audio.pause();
    const shown = await yandexSDK.showInterstitial();
    audio.resume();
    this.lastAt = Date.now();
    analytics.track('ad_interstitial_closed', { placement, shown });
    return shown;
  }

  async showRewarded(placement: RewardPlacement, data: SaveData, action: () => void): Promise<boolean> {
    if (!this.canShowRewarded(data, placement)) {
      analytics.track('ad_rewarded_cooldown', { placement, leftMs: this.getRewardedCooldownLeftMs(data, placement) });
      return false;
    }

    analytics.track('ad_rewarded_requested', { placement });
    await this.save();
    audio.pause();
    const result = await yandexSDK.showRewarded(action);
    audio.resume();

    if (result.granted) {
      data.adCooldowns[placement] = Date.now() + rewardedCooldownMs[placement];
      analytics.track('ad_rewarded_granted', { placement });
      await this.save();
    } else {
      analytics.track('ad_rewarded_failed', { placement, reason: result.reason ?? 'unknown' });
      console.warn('[AdSystem] Reward was not granted', placement, result.reason);
    }

    return result.granted;
  }
}
