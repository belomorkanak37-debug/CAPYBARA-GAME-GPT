import { economyConfig } from '../config/economyConfig';
import type { MergeCategory, MergeItemState, SaveData } from '../types';

export class MergeSystem {
  canMerge(a: MergeItemState, b: MergeItemState): boolean { const max = a.category === 'worker' ? economyConfig.maxWorkerLevel : economyConfig.maxDishLevel; return a.id !== b.id && a.category === b.category && a.level === b.level && a.level < max; }
  merge(data: SaveData, source: MergeItemState, target: MergeItemState): MergeItemState | null { if (!this.canMerge(source, target)) return null; const list = source.category === 'worker' ? data.workers : data.dishes; const si = list.findIndex(i => i.id === source.id); const ti = list.findIndex(i => i.id === target.id); if (si < 0 || ti < 0) return null; list[ti] = { ...target, level: target.level + 1 }; list.splice(si, 1); data.mergeCount += 1; return list[ti]; }
  getFreeSlot(data: SaveData, category: MergeCategory): number | null { const list = category === 'worker' ? data.workers : data.dishes; for (let i = 0; i < 5; i += 1) if (!list.some(item => item.slot === i)) return i; return null; }
  addItem(data: SaveData, category: MergeCategory, level = 1): MergeItemState | null { const slot = this.getFreeSlot(data, category); if (slot === null) return null; const item: MergeItemState = { id: `${category}-${Date.now()}-${Math.floor(Math.random() * 10000)}`, category, level, slot }; if (category === 'worker') data.workers.push(item); else data.dishes.push(item); return item; }
}

export const mergeSystem = new MergeSystem();
