import type { SaveData } from '../types';
import { analytics } from './AnalyticsSystem';

export interface DailyRewardPreview { day: number; coins: number; stars: number; label: string; canClaim: boolean; }

function dayKey(now = new Date()): string { return now.toISOString().slice(0, 10); }

function previousDayKey(now = new Date()): string {
  const date = new Date(now);
  date.setUTCDate(date.getUTCDate() - 1);
  return dayKey(date);
}

class DailyRewardSystem {
  getPreview(data: SaveData, now = new Date()): DailyRewardPreview {
    const today = dayKey(now);
    const yesterday = previousDayKey(now);
    const continues = data.dailyReward.lastClaimDay === yesterday;
    const currentStreak = data.dailyReward.lastClaimDay === today ? data.dailyReward.streak : continues ? data.dailyReward.streak : 0;
    const day = Math.min(7, currentStreak + (data.dailyReward.lastClaimDay === today ? 0 : 1));
    const reward = this.rewardForDay(day);
    return { day, ...reward, canClaim: data.dailyReward.lastClaimDay !== today };
  }

  claim(data: SaveData, now = new Date()): DailyRewardPreview {
    const today = dayKey(now);
    const preview = this.getPreview(data, now);
    if (!preview.canClaim) return preview;

    const yesterday = previousDayKey(now);
    const continues = data.dailyReward.lastClaimDay === yesterday;
    data.dailyReward.streak = continues ? Math.min(7, data.dailyReward.streak + 1) : 1;
    data.dailyReward.lastClaimDay = today;
    data.dailyReward.claimedToday = true;
    data.coins += preview.coins;
    data.stars += preview.stars;
    data.totalEarnedCoins += preview.coins;
    data.cafeLevel = 1 + Math.floor(data.stars / 10);
    analytics.track('daily_reward_claimed', { day: preview.day, coins: preview.coins, stars: preview.stars });
    return { ...preview, canClaim: false };
  }

  private rewardForDay(day: number): Omit<DailyRewardPreview, 'day' | 'canClaim'> {
    const rewards = [
      { coins: 100, stars: 0, label: '+100 coins' },
      { coins: 200, stars: 0, label: '+200 coins' },
      { coins: 350, stars: 1, label: '+350 coins + 1 star' },
      { coins: 600, stars: 1, label: '+600 coins + 1 star' },
      { coins: 900, stars: 2, label: '+900 coins + 2 stars' },
      { coins: 1200, stars: 2, label: '+1200 coins + 2 stars' },
      { coins: 1800, stars: 4, label: '+1800 coins + 4 stars' }
    ];
    return rewards[Math.max(0, Math.min(day - 1, rewards.length - 1))];
  }
}

export const dailyRewardSystem = new DailyRewardSystem();
