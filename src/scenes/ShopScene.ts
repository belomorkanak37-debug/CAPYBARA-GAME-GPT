import Phaser from 'phaser';
import { gameConfig } from '../config/gameConfig';
import { dailyRewardSystem } from '../systems/DailyRewardSystem';
import { i18n } from '../systems/LocalizationSystem';
import { purchaseSystem } from '../systems/PurchaseSystem';
import type { PurchaseProductId, SaveData } from '../types';
import { Button } from '../ui/Button';

export class ShopScene extends Phaser.Scene {
  constructor() { super('ShopScene'); }

  create(): void {
    const data = this.registry.get('save') as SaveData;
    const lang = i18n.getLanguage();
    const daily = dailyRewardSystem.getPreview(data);

    this.add.rectangle(0, 0, gameConfig.width, gameConfig.height, 0x2f1d13, 0.42).setInteractive();
    const shadow = this.add.graphics();
    shadow.fillStyle(0x8a5a34, 0.25).fillRoundedRect(48, 148, 624, 930, 42);
    const card = this.add.graphics();
    card.fillStyle(0xfff3d8, 1).fillRoundedRect(40, 130, 640, 930, 42);
    card.fillStyle(0xffffff, 0.3).fillRoundedRect(68, 154, 584, 78, 28);
    card.lineStyle(6, 0xd9914b, 0.9).strokeRoundedRect(40, 130, 640, 930, 42);

    this.add.text(360, 184, i18n.t('shop'), { fontSize: '42px', color: gameConfig.colors.text, fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(360, 232, lang === 'ru' ? 'Бонусы, реклама и mock-покупки' : 'Bonuses, ads and mock purchases', { fontSize: '20px', color: gameConfig.colors.brown }).setOrigin(0.5);

    const dailyTitle = lang === 'ru' ? `Ежедневный бонус: день ${daily.day}` : `Daily reward: day ${daily.day}`;
    this.add.text(96, 292, dailyTitle, { fontSize: '24px', color: gameConfig.colors.text, fontStyle: 'bold' });
    this.add.text(96, 326, daily.label, { fontSize: '20px', color: gameConfig.colors.brown });
    const dailyButtonText = daily.canClaim ? (lang === 'ru' ? 'Забрать' : 'Claim') : (lang === 'ru' ? 'Уже получено' : 'Claimed');
    new Button(this, 545, 323, 190, 64, dailyButtonText, () => { this.game.events.emit('claim-daily-reward'); this.scene.stop(); }, daily.canClaim ? 0xffd15c : 0xb6afa4).setEnabled(daily.canClaim);

    this.add.text(96, 404, lang === 'ru' ? 'Rewarded-бонусы' : 'Rewarded bonuses', { fontSize: '24px', color: gameConfig.colors.text, fontStyle: 'bold' });
    new Button(this, 220, 470, 260, 64, lang === 'ru' ? '+300 монет' : '+300 coins', () => { this.game.events.emit('reward-coins'); this.scene.stop(); }, 0x62c370);
    new Button(this, 500, 470, 260, 64, lang === 'ru' ? 'Буст 2 мин' : 'Boost 2m', () => { this.game.events.emit('reward-boost'); this.scene.stop(); }, 0x9ee6c5);
    new Button(this, 360, 548, 340, 64, lang === 'ru' ? 'Бесплатная капибара' : 'Free capybara', () => { this.game.events.emit('reward-worker'); this.scene.stop(); }, 0xffd15c);

    this.add.text(96, 632, lang === 'ru' ? 'Mock-покупки для теста' : 'Mock purchases for testing', { fontSize: '24px', color: gameConfig.colors.text, fontStyle: 'bold' });
    purchaseSystem.getProducts().forEach((product, index) => {
      const y = 700 + index * 92;
      const owned = !product.consumable && purchaseSystem.hasProduct(data, product.id);
      this.add.text(96, y - 20, product.title, { fontSize: '21px', color: gameConfig.colors.text, fontStyle: 'bold' });
      this.add.text(96, y + 8, product.rewardLabel, { fontSize: '17px', color: gameConfig.colors.brown });
      const label = owned ? (lang === 'ru' ? 'Куплено' : 'Owned') : product.priceLabel;
      const button = new Button(this, 535, y, 180, 58, label, () => { this.game.events.emit('purchase-product', product.id as PurchaseProductId); this.scene.stop(); }, owned ? 0xb6afa4 : 0xf7a35c);
      button.setEnabled(!owned || product.consumable);
    });

    new Button(this, 360, 1002, 260, 70, i18n.t('close'), () => this.scene.stop(), 0xf7a35c);
  }
}
