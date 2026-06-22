export type LanguageCode = 'ru' | 'en';
export type StationId = 'coffee' | 'oven' | 'dessert' | 'lemonade' | 'delivery';
export type ZoneId = 'coffee_bar' | 'dessert_case' | 'window_tables' | 'terrace' | 'delivery';
export type MergeCategory = 'worker' | 'dish';
export type RewardPlacement = 'coins_300' | 'boost_2m' | 'free_worker' | 'offline_x2';
export type PurchaseProductId = 'starter_coins' | 'barista_bundle' | 'no_interstitials';

export interface StationState { id: StationId; level: number; unlocked: boolean; progress: number; }
export interface MergeItemState { id: string; category: MergeCategory; level: number; slot: number; }
export type QuestType = 'earnCoins' | 'serveGuests' | 'merge' | 'upgradeStation' | 'unlockZone' | 'workerLevel' | 'stationLevel';
export interface QuestState { id: string; textKey: string; goal: number; progress: number; rewardCoins: number; rewardStars: number; type: QuestType; target?: string; completed: boolean; claimed: boolean; }
export interface SoundSettings { music: boolean; sfx: boolean; }
export interface TutorialState { completed: boolean; step: number; }
export interface DailyRewardState { streak: number; lastClaimDay: string; claimedToday: boolean; }
export interface SaveData {
  version: number; coins: number; stars: number; cafeLevel: number; totalEarnedCoins: number; servedGuests: number; mergeCount: number;
  unlockedZones: ZoneId[]; stations: Record<StationId, StationState>; workers: MergeItemState[]; dishes: MergeItemState[];
  quests: QuestState[]; completedQuestIds: string[]; sound: SoundSettings; language: LanguageCode; lastExitAt: number; tutorial: TutorialState; boosterUntil: number; adsRemoved: boolean;
  adCooldowns: Record<string, number>; purchasedProductIds: PurchaseProductId[]; dailyReward: DailyRewardState;
}
export interface StationConfig { id: StationId; zoneId: ZoneId; nameKey: string; emoji: string; baseIncome: number; baseDurationMs: number; firstUpgradeCost: number; unlockOrder: number; }
export interface ZoneConfig { id: ZoneId; nameKey: string; stationId: StationId; coinCost: number; starCost: number; x: number; y: number; width: number; height: number; }
export interface WorkerTier { level: number; nameKey: string; incomeMultiplier: number; emoji: string; }
export interface DishTier { level: number; nameKey: string; recipeMultiplier: number; emoji: string; }
export interface RewardResult { granted: boolean; reason?: string; }
export interface OfflineReward { seconds: number; coins: number; }
export interface PurchaseProduct { id: PurchaseProductId; title: string; description: string; priceLabel: string; rewardLabel: string; consumable: boolean; }
export interface PurchaseResult { ok: boolean; productId: PurchaseProductId; reason?: string; }
