import { economyConfig, createInitialQuests, stationConfigs } from '../config/economyConfig';
import { gameConfig } from '../config/gameConfig';
import type { LanguageCode, OfflineReward, SaveData, StationId } from '../types';
import { yandexSDK } from './YandexSDK';

const backupSaveKey = `${gameConfig.saveKey}-backup`;
const corruptSaveKey = `${gameConfig.saveKey}-corrupt`;

export function createDefaultSaveData(language: LanguageCode = 'ru'): SaveData {
  return {
    version: 1, coins: economyConfig.startCoins, stars: 0, cafeLevel: 1, totalEarnedCoins: 0, servedGuests: 0, mergeCount: 0,
    unlockedZones: ['coffee_bar'],
    stations: Object.fromEntries(Object.values(stationConfigs).map(station => [station.id, { id: station.id, level: station.id === 'coffee' ? 1 : 0, unlocked: station.id === 'coffee', progress: 0 }])) as Record<StationId, SaveData['stations'][StationId]>,
    workers: [{ id: 'worker-1', category: 'worker', level: 1, slot: 0 }, { id: 'worker-2', category: 'worker', level: 1, slot: 1 }],
    dishes: [{ id: 'dish-1', category: 'dish', level: 1, slot: 0 }, { id: 'dish-2', category: 'dish', level: 1, slot: 1 }],
    quests: createInitialQuests(), completedQuestIds: [], sound: { music: true, sfx: true }, language, lastExitAt: Date.now(), tutorial: { completed: false, step: 0 }, boosterUntil: 0, adsRemoved: false
  };
}

export class SaveSystem {
  private data: SaveData;

  constructor(language: LanguageCode) { this.data = createDefaultSaveData(language); }

  getData(): SaveData { return this.data; }
  setData(data: SaveData): void { this.data = this.migrate(data); }

  async load(): Promise<SaveData> {
    const cloud = await yandexSDK.loadData<SaveData>();
    const local = this.loadLocal();
    this.data = this.migrate(this.pickNewest(cloud, local, this.data));
    return this.data;
  }

  async save(): Promise<void> {
    this.data.lastExitAt = Date.now();
    const serialized = JSON.stringify(this.data);

    try {
      localStorage.setItem(gameConfig.saveKey, serialized);
      localStorage.setItem(backupSaveKey, serialized);
    } catch (error) {
      console.warn('[SaveSystem] Local save failed', error);
    }

    try { await yandexSDK.saveData(this.data); } catch (error) { console.warn('[SaveSystem] Cloud save failed', error); }
  }

  loadLocal(): SaveData | null {
    const primary = this.readLocalStorage(gameConfig.saveKey, true);
    if (primary) return primary;
    return this.readLocalStorage(backupSaveKey, false);
  }

  calculateOfflineReward(now = Date.now()): OfflineReward {
    const elapsed = Math.max(0, Math.floor((now - this.data.lastExitAt) / 1000));
    const seconds = Math.min(elapsed, gameConfig.maxOfflineSeconds);
    const perMinute = Object.values(this.data.stations).filter(s => s.unlocked).reduce((sum, s) => sum + s.level * 10, 0);
    return { seconds, coins: Math.floor((perMinute / 60) * seconds) };
  }

  applyOfflineReward(coins: number): void { this.data.coins += coins; this.data.totalEarnedCoins += coins; }

  private readLocalStorage(key: string, preserveCorrupt: boolean): SaveData | null {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as SaveData;
    } catch (error) {
      console.warn(`[SaveSystem] Failed to read ${key}`, error);
      if (preserveCorrupt) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) localStorage.setItem(corruptSaveKey, raw);
          localStorage.removeItem(key);
        } catch { /* ignore storage recovery errors */ }
      }
      return null;
    }
  }

  private pickNewest(...candidates: Array<SaveData | null | undefined>): SaveData {
    return candidates.filter(Boolean).sort((a, b) => (b?.lastExitAt ?? 0) - (a?.lastExitAt ?? 0))[0] ?? this.data;
  }

  private migrate(data: SaveData): SaveData {
    const fallback = createDefaultSaveData(data.language ?? 'ru');
    return {
      ...fallback,
      ...data,
      version: 1,
      stations: { ...fallback.stations, ...data.stations },
      sound: { ...fallback.sound, ...data.sound },
      tutorial: { ...fallback.tutorial, ...data.tutorial },
      quests: data.quests?.length ? data.quests : fallback.quests
    };
  }
}
