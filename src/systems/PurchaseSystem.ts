import type { PurchaseProduct, PurchaseProductId, PurchaseResult, SaveData } from '../types';
import { analytics } from './AnalyticsSystem';

const products: PurchaseProduct[] = [
  {
    id: 'starter_coins',
    title: 'Starter Coins',
    description: 'A soft launch coin pack for testing purchase flow.',
    priceLabel: 'Mock',
    rewardLabel: '+1500 coins',
    consumable: true
  },
  {
    id: 'barista_bundle',
    title: 'Barista Bundle',
    description: 'Coins plus a short cafe boost.',
    priceLabel: 'Mock',
    rewardLabel: '+2500 coins + boost',
    consumable: true
  },
  {
    id: 'no_interstitials',
    title: 'No Interstitials',
    description: 'Disables fullscreen interstitial ads. Rewarded ads stay optional.',
    priceLabel: 'Mock',
    rewardLabel: 'Remove interstitials',
    consumable: false
  }
];

class PurchaseSystem {
  getProducts(): PurchaseProduct[] { return products; }

  hasProduct(data: SaveData, productId: PurchaseProductId): boolean {
    return data.purchasedProductIds.includes(productId);
  }

  purchase(productId: PurchaseProductId, data: SaveData): PurchaseResult {
    const product = products.find(item => item.id === productId);
    if (!product) return { ok: false, productId, reason: 'unknown_product' };
    if (!product.consumable && this.hasProduct(data, productId)) return { ok: false, productId, reason: 'already_owned' };

    analytics.track('purchase_mock_started', { productId });

    if (productId === 'starter_coins') {
      data.coins += 1500;
      data.totalEarnedCoins += 1500;
    }

    if (productId === 'barista_bundle') {
      data.coins += 2500;
      data.totalEarnedCoins += 2500;
      data.boosterUntil = Math.max(data.boosterUntil, Date.now() + 5 * 60 * 1000);
    }

    if (productId === 'no_interstitials') {
      data.adsRemoved = true;
    }

    if (!product.consumable && !data.purchasedProductIds.includes(productId)) {
      data.purchasedProductIds.push(productId);
    }

    analytics.track('purchase_mock_completed', { productId, consumable: product.consumable });
    return { ok: true, productId };
  }
}

export const purchaseSystem = new PurchaseSystem();
