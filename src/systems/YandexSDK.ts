import type { RewardResult } from '../types';

interface YandexPlayer { getData<T>(keys?: string[]): Promise<T>; setData(data: unknown, flush?: boolean): Promise<void>; getMode?: () => string; }
interface YandexSDKInstance {
  environment?: { i18n?: { lang?: string } };
  features?: { LoadingAPI?: { ready: () => void } };
  adv?: {
    showFullscreenAdv: (options: { callbacks: { onOpen?: () => void; onClose?: (wasShown: boolean) => void; onError?: (error: unknown) => void } }) => void;
    showRewardedVideo: (options: { callbacks: { onOpen?: () => void; onRewarded?: () => void; onClose?: () => void; onError?: (error: unknown) => void } }) => void;
  };
  getPlayer?: (options?: { scopes?: boolean }) => Promise<YandexPlayer>;
  getLeaderboards?: () => Promise<unknown>;
  getPayments?: (options?: { signed?: boolean }) => Promise<unknown>;
}

type SDKStatus = 'idle' | 'loading' | 'ready' | 'mock' | 'error';

declare global {
  interface Window {
    YaGames?: { init: () => Promise<YandexSDKInstance> };
    __capiSdkLoadPromise?: Promise<boolean>;
  }
}

const SDK_INIT_TIMEOUT_MS = 5000;

function timeout(ms: number): Promise<false> {
  return new Promise(resolve => window.setTimeout(() => resolve(false), ms));
}

class YandexSDK {
  private ysdk: YandexSDKInstance | null = null;
  private player: YandexPlayer | null = null;
  private mock = true;
  private paused = false;
  private status: SDKStatus = 'idle';
  private initPromise: Promise<void> | null = null;

  init(): Promise<void> {
    if (!this.initPromise) this.initPromise = this.initInternal();
    return this.initPromise;
  }

  private async initInternal(): Promise<void> {
    this.status = 'loading';
    const sdkLoad = window.__capiSdkLoadPromise ?? Promise.resolve(Boolean(window.YaGames));
    const loaded = await Promise.race([sdkLoad, timeout(SDK_INIT_TIMEOUT_MS)]);

    if (!loaded || !window.YaGames) {
      this.mock = true;
      this.status = 'mock';
      console.info('[YandexSDK] Mock mode');
      return;
    }

    try {
      this.ysdk = await window.YaGames.init();
      this.mock = false;
      this.status = 'ready';
      try { this.player = await this.ysdk.getPlayer?.({ scopes: false }) ?? null; } catch { this.player = null; }
    } catch (error) {
      this.ysdk = null;
      this.player = null;
      this.mock = true;
      this.status = 'error';
      console.warn('[YandexSDK] Init failed, mock mode', error);
    }
  }

  ready(): void { if (!this.mock) this.ysdk?.features?.LoadingAPI?.ready(); }
  getStatus(): SDKStatus { return this.status; }
  isReady(): boolean { return this.status === 'ready' && !this.mock; }
  getLanguage(): string { return this.ysdk?.environment?.i18n?.lang ?? navigator.language?.slice(0, 2) ?? 'ru'; }
  isMock(): boolean { return this.mock; }
  async isAuthorized(): Promise<boolean> { return !this.mock && this.player?.getMode?.() !== 'lite'; }
  async login(): Promise<boolean> { if (this.mock) return false; try { this.player = await this.ysdk?.getPlayer?.({ scopes: true }) ?? null; return Boolean(this.player); } catch { return false; } }
  async saveData(data: unknown): Promise<void> { if (!this.mock && this.player) await this.player.setData({ save: data }, true); }
  async loadData<T>(): Promise<T | null> { if (this.mock || !this.player) return null; try { const data = await this.player.getData<{ save?: T }>(['save']); return data?.save ?? null; } catch { return null; } }

  showInterstitial(): Promise<boolean> {
    this.pauseGame();
    if (this.mock || !this.ysdk?.adv) return new Promise(resolve => window.setTimeout(() => { this.resumeGame(); resolve(false); }, 250));
    return new Promise(resolve => this.ysdk?.adv?.showFullscreenAdv({ callbacks: { onOpen: () => this.pauseGame(), onClose: shown => { this.resumeGame(); resolve(Boolean(shown)); }, onError: () => { this.resumeGame(); resolve(false); } } }));
  }

  showRewarded(onReward: () => void): Promise<RewardResult> {
    this.pauseGame();
    let rewarded = false;
    if (this.mock || !this.ysdk?.adv) return new Promise(resolve => window.setTimeout(() => { rewarded = true; onReward(); this.resumeGame(); resolve({ granted: true }); }, 450));
    return new Promise(resolve => this.ysdk?.adv?.showRewardedVideo({ callbacks: { onOpen: () => this.pauseGame(), onRewarded: () => { rewarded = true; onReward(); }, onClose: () => { this.resumeGame(); resolve({ granted: rewarded }); }, onError: () => { this.resumeGame(); resolve({ granted: false, reason: 'error' }); } } }));
  }

  pauseGame(): void { this.paused = true; window.dispatchEvent(new CustomEvent('capi:pause')); }
  resumeGame(): void { this.paused = false; window.dispatchEvent(new CustomEvent('capi:resume')); }
  isPaused(): boolean { return this.paused; }
}

export const yandexSDK = new YandexSDK();
