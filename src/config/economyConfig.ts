import type { DishTier, QuestState, StationConfig, StationId, WorkerTier, ZoneConfig } from '../types';

export const economyConfig = {
  startCoins: 100,
  firstWorkerCost: 50,
  workerCostGrowth: 1.28,
  firstDishCost: 35,
  dishCostGrowth: 1.25,
  upgradeCostGrowth: 1.35,
  incomeGrowth: 1.25,
  maxStationLevel: 10,
  maxWorkerLevel: 5,
  maxDishLevel: 8,
  guestRewardBase: 4,
  cafeLevelEveryStars: 10
};

export const workerTiers: WorkerTier[] = [
  { level: 1, nameKey: 'worker1', incomeMultiplier: 1, emoji: '🦫' },
  { level: 2, nameKey: 'worker2', incomeMultiplier: 1.5, emoji: '🦫' },
  { level: 3, nameKey: 'worker3', incomeMultiplier: 2.2, emoji: '🦫' },
  { level: 4, nameKey: 'worker4', incomeMultiplier: 3.2, emoji: '🦫' },
  { level: 5, nameKey: 'worker5', incomeMultiplier: 4.8, emoji: '🦫' }
];

export const dishTiers: DishTier[] = [
  { level: 1, nameKey: 'dish1', recipeMultiplier: 1, emoji: '☕' },
  { level: 2, nameKey: 'dish2', recipeMultiplier: 1.35, emoji: '🥛' },
  { level: 3, nameKey: 'dish3', recipeMultiplier: 1.75, emoji: '🥐' },
  { level: 4, nameKey: 'dish4', recipeMultiplier: 2.25, emoji: '🧁' },
  { level: 5, nameKey: 'dish5', recipeMultiplier: 3, emoji: '🍰' },
  { level: 6, nameKey: 'dish6', recipeMultiplier: 3.8, emoji: '🍋' },
  { level: 7, nameKey: 'dish7', recipeMultiplier: 4.7, emoji: '🥪' },
  { level: 8, nameKey: 'dish8', recipeMultiplier: 6, emoji: '🍦' }
];

export const stationConfigs: Record<StationId, StationConfig> = {
  coffee: { id: 'coffee', zoneId: 'coffee_bar', nameKey: 'stationCoffee', emoji: '☕', baseIncome: 5, baseDurationMs: 4000, firstUpgradeCost: 80, unlockOrder: 1 },
  oven: { id: 'oven', zoneId: 'dessert_case', nameKey: 'stationOven', emoji: '🥐', baseIncome: 15, baseDurationMs: 5200, firstUpgradeCost: 220, unlockOrder: 2 },
  dessert: { id: 'dessert', zoneId: 'window_tables', nameKey: 'stationDessert', emoji: '🍰', baseIncome: 45, baseDurationMs: 6500, firstUpgradeCost: 650, unlockOrder: 3 },
  lemonade: { id: 'lemonade', zoneId: 'terrace', nameKey: 'stationLemonade', emoji: '🍋', baseIncome: 140, baseDurationMs: 7600, firstUpgradeCost: 1800, unlockOrder: 4 },
  delivery: { id: 'delivery', zoneId: 'delivery', nameKey: 'stationDelivery', emoji: '🛵', baseIncome: 420, baseDurationMs: 9000, firstUpgradeCost: 5200, unlockOrder: 5 }
};

export const zoneConfigs: ZoneConfig[] = [
  { id: 'coffee_bar', nameKey: 'zoneCoffee', stationId: 'coffee', coinCost: 0, starCost: 0, x: 110, y: 250, width: 500, height: 150 },
  { id: 'dessert_case', nameKey: 'zoneDessert', stationId: 'oven', coinCost: 500, starCost: 3, x: 90, y: 430, width: 540, height: 140 },
  { id: 'window_tables', nameKey: 'zoneWindow', stationId: 'dessert', coinCost: 1500, starCost: 8, x: 90, y: 590, width: 250, height: 180 },
  { id: 'terrace', nameKey: 'zoneTerrace', stationId: 'lemonade', coinCost: 5000, starCost: 20, x: 380, y: 590, width: 250, height: 180 },
  { id: 'delivery', nameKey: 'zoneDelivery', stationId: 'delivery', coinCost: 15000, starCost: 40, x: 120, y: 780, width: 480, height: 120 }
];

const questData: Array<[string, string, QuestState['type'], number, number, number, string?]> = [
  ['q1','questEarn100','earnCoins',100,80,1],['q2','questServe5','serveGuests',5,100,1],['q3','questMerge1','merge',1,120,1],['q4','questCoffee3','stationLevel',3,150,1,'coffee'],['q5','questEarn500','earnCoins',500,200,2],['q6','questMerge3','merge',3,240,2],['q7','questServe20','serveGuests',20,300,2],['q8','questUnlockDessert','unlockZone',1,300,3,'dessert_case'],['q9','questOven3','stationLevel',3,420,3,'oven'],['q10','questWorker3','workerLevel',3,500,3],['q11','questEarn1500','earnCoins',1500,650,4],['q12','questMerge8','merge',8,750,4],['q13','questServe50','serveGuests',50,850,4],['q14','questUnlockWindow','unlockZone',1,1000,5,'window_tables'],['q15','questDessert4','stationLevel',4,1200,5,'dessert'],['q16','questEarn5000','earnCoins',5000,1400,6],['q17','questWorker4','workerLevel',4,1600,6],['q18','questMerge15','merge',15,1800,6],['q19','questServe100','serveGuests',100,2100,7],['q20','questUnlockTerrace','unlockZone',1,2500,8,'terrace'],['q21','questLemonade4','stationLevel',4,3000,8,'lemonade'],['q22','questEarn12000','earnCoins',12000,3500,9],['q23','questMerge25','merge',25,4000,9],['q24','questServe180','serveGuests',180,4500,10],['q25','questCoffee8','stationLevel',8,5000,10,'coffee'],['q26','questUnlockDelivery','unlockZone',1,6000,12,'delivery'],['q27','questDelivery3','stationLevel',3,7000,12,'delivery'],['q28','questWorker5','workerLevel',5,8000,14],['q29','questEarn40000','earnCoins',40000,10000,16],['q30','questServe300','serveGuests',300,12000,18]
];

export function createInitialQuests(): QuestState[] {
  return questData.map(([id, textKey, type, goal, rewardCoins, rewardStars, target]) => ({ id, textKey, type, goal, rewardCoins, rewardStars, target, progress: 0, completed: false, claimed: false }));
}
