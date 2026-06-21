import { economyConfig } from '../config/economyConfig';
import type { SaveData } from '../types';

export class EconomySystem {
  getWorkerCost(data: SaveData): number { return Math.floor(economyConfig.firstWorkerCost * Math.pow(1.28, data.workers.length)); }
  addCoins(data: SaveData, amount: number): void { data.coins += amount; data.totalEarnedCoins += amount; }
}
export const economy = new EconomySystem();
