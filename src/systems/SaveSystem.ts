import { economyConfig, createInitialQuests, stationConfigs } from '../config/economyConfig';
import { gameConfig } from '../config/gameConfig';
import type { LanguageCode, OfflineReward, SaveData, StationId } from '../types';
import { yandexSDK } from './YandexSDK';

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
  async load(): Promise<SaveData> { const cloud = await yandexSDK.loadData<SaveData>(); const local = this.loadLocal(); this.data = this.migrate(cloud ?? local ?? this.data); return this.data; }
  async save(): Promise<void> { this.data.lastExitAt = Date.now(); localStorage.setItem(gameConfig.saveKey, JSON.stringify(this.data)); try { await yandexSDK.saveData(this.data); } catch (error) { console.warn('[SaveSystem] Cloud save failed', error); } }
  loadLocal(): SaveData | null { try { const raw = localStorage.getItem(gameConfig.saveKey); return raw ? JSON.parse(raw) as SaveData : null; } catch { return null; } }
  calculateOfflineReward(now = Date.now()): OfflineReward { const elapsed = Math.max(0, Math.floor((now - this.data.lastExitAt) / 1000)); const seconds = Math.min(elapsed, gameConfig.maxOfflineSeconds); const perMinute = Object.values(this.data.stations).filter(s => s.unlocked).reduce((sum, s) => sum + s.level * 10, 0); return { seconds, coins: Math.floor((perMinute / 60) * seconds) }; }
  applyOfflineReward(coins: number): void { this.data.coins += coins; this.data.totalEarnedCoins += coins; }
  private migrate(data: SaveData): SaveData { const fallback = createDefaultSaveData(data.language ?? 'ru'); return { ...fallback, ...data, version: 1, stations: { ...fallback.stations, ...data.stations }, sound: { ...fallback.sound, ...data.sound }, tutorial: { ...fallback.tutorial, ...data.tutorial }, quests: data.quests?.length ? data.quests : fallback.quests }; }
}
