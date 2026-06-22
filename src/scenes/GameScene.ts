import Phaser from 'phaser';
import { gameConfig } from '../config/gameConfig';
import { dishTiers, stationConfigs, workerTiers, zoneConfigs } from '../config/economyConfig';
import { AdSystem } from '../systems/AdSystem';
import { analytics } from '../systems/AnalyticsSystem';
import { audio } from '../systems/AudioSystem';
import { dailyRewardSystem } from '../systems/DailyRewardSystem';
import { FxPool } from '../systems/FxPool';
import { i18n } from '../systems/LocalizationSystem';
import { mergeSystem } from '../systems/MergeSystem';
import { purchaseSystem } from '../systems/PurchaseSystem';
import { SaveScheduler } from '../systems/SaveScheduler';
import { SaveSystem } from '../systems/SaveSystem';
import type { MergeItemState, PurchaseProductId, SaveData, StationId, ZoneId } from '../types';
import { OfflineRewardPopup } from '../ui/OfflineRewardPopup';
import { RewardPopup } from '../ui/RewardPopup';

interface SlotView { item: MergeItemState; box: Phaser.GameObjects.Container; x: number; y: number; }

export class GameScene extends Phaser.Scene {
  saveSystem!: SaveSystem;
  adSystem!: AdSystem;
  saveData!: SaveData;
  private saveScheduler?: SaveScheduler;
  private fx?: FxPool;
  private bars = new Map<StationId, Phaser.GameObjects.Rectangle>();
  private views = new Map<string, SlotView>();
  private layer?: Phaser.GameObjects.Container;
  private isDragging = false;
  private lastUserActionAt = 0;

  private readonly onBuyWorker = () => this.buyWorker();
  private readonly onBuyDish = () => this.buyDish();
  private readonly onUpgradeStation = (id: StationId) => this.upgradeStation(id);
  private readonly onUnlockZone = (id: ZoneId) => this.unlockZone(id);
  private readonly onClaimQuest = () => this.claimQuest();
  private readonly onClaimDailyReward = () => this.claimDailyReward();
  private readonly onPurchaseProduct = (id: PurchaseProductId) => this.purchaseProduct(id);
  private readonly onRewardCoins = () => void this.rewardCoins();
  private readonly onRewardBoost = () => void this.rewardBoost();
  private readonly onRewardWorker = () => void this.rewardWorker();
  private readonly onVisibilityChange = () => { if (document.hidden) { audio.pause(); void this.flushSave(); } else audio.resume(); };
  private readonly onShutdown = () => this.cleanupListeners();

  constructor() { super('GameScene'); }

  async create(): Promise<void> {
    try {
      this.add.rectangle(0, 0, gameConfig.width, gameConfig.height, 0xf7d9a6).setOrigin(0);
      this.add.text(360, 610, 'Loading cafe...', { fontSize: '30px', color: gameConfig.colors.text }).setOrigin(0.5);
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.onShutdown);
      this.events.once(Phaser.Scenes.Events.DESTROY, this.onShutdown);
      this.saveSystem = new SaveSystem(i18n.getLanguage());
      this.saveData = await this.saveSystem.load();
      i18n.setLanguage(this.saveData.language);
      audio.applySettings(this.saveData.sound);
      this.saveScheduler = new SaveScheduler(() => this.saveSystem.save());
      this.adSystem = new AdSystem(() => this.flushSave());
      this.registry.set('save', this.saveData);
      analytics.track('game_started', { cafeLevel: this.saveData.cafeLevel, coins: this.saveData.coins });
      this.rebuildCafe();
      this.scene.launch('UIScene');
      const offline = this.saveSystem.calculateOfflineReward();
      if (offline.coins > 0) new OfflineRewardPopup(this, offline.coins, () => this.giveOffline(offline.coins), () => void this.doubleOffline(offline.coins));
      if (!this.saveData.tutorial.completed) this.scene.launch('TutorialScene');
      this.time.addEvent({ delay: gameConfig.autosaveMs, loop: true, callback: () => void this.flushSave() });
      this.game.events.on('buy-worker', this.onBuyWorker);
      this.game.events.on('buy-dish', this.onBuyDish);
      this.game.events.on('upgrade-station', this.onUpgradeStation);
      this.game.events.on('unlock-zone', this.onUnlockZone);
      this.game.events.on('claim-quest', this.onClaimQuest);
      this.game.events.on('claim-daily-reward', this.onClaimDailyReward);
      this.game.events.on('purchase-product', this.onPurchaseProduct);
      this.game.events.on('reward-coins', this.onRewardCoins);
      this.game.events.on('reward-boost', this.onRewardBoost);
      this.game.events.on('reward-worker', this.onRewardWorker);
      document.addEventListener('visibilitychange', this.onVisibilityChange);
    } catch (error) {
      console.error('GameScene create failed', error);
      this.children.removeAll(true);
      this.add.rectangle(0, 0, gameConfig.width, gameConfig.height, 0xf7d9a6).setOrigin(0);
      this.add.text(360, 520, 'Game start error', { fontSize: '38px', color: '#E46C6C', fontStyle: 'bold' }).setOrigin(0.5);
      this.add.text(360, 590, 'Open DevTools Console and send the error.', { fontSize: '24px', color: gameConfig.colors.text, align: 'center', wordWrap: { width: 560 } }).setOrigin(0.5);
    }
  }

  update(_time: number, delta: number): void {
    if (!this.saveData) return;
    for (const st of Object.values(this.saveData.stations)) {
      if (!st.unlocked || st.level <= 0) continue;
      st.progress += delta / this.duration(st.id);
      const bar = this.bars.get(st.id);
      if (bar) bar.width = Phaser.Math.Clamp(st.progress, 0, 1) * 188;
      if (st.progress >= 1) { st.progress = 0; this.earn(this.income(st.id)); }
    }
  }

  buyWorker(free = false): boolean { this.markAction(); const cost = this.workerCost(); if (!free && this.saveData.coins < cost) return this.fail(); if (!free) this.saveData.coins -= cost; const item = mergeSystem.addItem(this.saveData, 'worker'); if (!item) return this.fail(i18n.t('noSlots')); analytics.track('worker_bought', { free, cost }); audio.play('upgrade'); this.renderSlots(); this.changed(); return true; }
  buyDish(): boolean { this.markAction(); const cost = this.dishCost(); if (this.saveData.coins < cost) return this.fail(); this.saveData.coins -= cost; const item = mergeSystem.addItem(this.saveData, 'dish'); if (!item) return this.fail(i18n.t('noSlots')); analytics.track('dish_bought', { cost }); audio.play('upgrade'); this.renderSlots(); this.changed(); return true; }
  upgradeStation(id: StationId): boolean { this.markAction(); const st = this.saveData.stations[id]; const cost = this.upgradeCost(id); if (!st.unlocked || this.saveData.coins < cost) return this.fail(); this.saveData.coins -= cost; st.level += 1; analytics.track('station_upgraded', { stationId: id, level: st.level, cost }); audio.play('upgrade'); this.pop(360, 420); this.changed(); return true; }
  unlockZone(id: ZoneId): boolean { this.markAction(); const z = zoneConfigs.find(zone => zone.id === id); if (!z || this.saveData.unlockedZones.includes(id) || this.saveData.coins < z.coinCost || this.saveData.stars < z.starCost) return this.fail(); this.saveData.coins -= z.coinCost; this.saveData.stars -= z.starCost; this.saveData.unlockedZones.push(id); this.saveData.stations[z.stationId].unlocked = true; this.saveData.stations[z.stationId].level = 1; analytics.track('zone_unlocked', { zoneId: id, stationId: z.stationId }); audio.play('reward'); this.rebuildCafe(); this.changed(); this.time.delayedCall(900, () => void this.adSystem.maybeShowInterstitial(this.saveData, false, { placement: 'zone_unlock', isTutorial: !this.saveData.tutorial.completed, isDragging: this.isDragging, lastUserActionAt: this.lastUserActionAt })); return true; }
  claimQuest(): void { this.markAction(); const q = this.saveData.quests.find(item => !item.claimed); if (!q) return; this.updateQuestState(); if (!q.completed) return; q.claimed = true; this.saveData.coins += q.rewardCoins; this.saveData.stars += q.rewardStars; this.saveData.cafeLevel = 1 + Math.floor(this.saveData.stars / 10); analytics.track('quest_claimed', { questId: q.id, coins: q.rewardCoins, stars: q.rewardStars }); new RewardPopup(this, i18n.t('questDone'), `+${q.rewardCoins} coins +${q.rewardStars} stars`, () => undefined); this.changed(); }
  claimDailyReward(): void { this.markAction(); const before = dailyRewardSystem.getPreview(this.saveData); const result = dailyRewardSystem.claim(this.saveData); if (!before.canClaim) return this.toast(i18n.getLanguage() === 'ru' ? 'Ежедневный бонус уже получен' : 'Daily reward already claimed', true); new RewardPopup(this, i18n.getLanguage() === 'ru' ? `День ${result.day}` : `Day ${result.day}`, result.label, () => undefined); audio.play('reward'); this.changed(); }
  purchaseProduct(id: PurchaseProductId): void { this.markAction(); const result = purchaseSystem.purchase(id, this.saveData); if (!result.ok) return this.toast(result.reason ?? 'Purchase unavailable', true); const product = purchaseSystem.getProducts().find(item => item.id === id); new RewardPopup(this, product?.title ?? 'Purchase', product?.rewardLabel ?? 'Reward granted', () => undefined); audio.play('reward'); this.changed(); }
  async rewardCoins(): Promise<void> { this.markAction(); const ok = await this.adSystem.showRewarded('coins_300', this.saveData, () => this.earn(300)); this.toast(ok ? i18n.t('rewardGranted') : this.rewardCooldownText('coins_300'), !ok); this.changed(); }
  async rewardBoost(): Promise<void> { this.markAction(); const ok = await this.adSystem.showRewarded('boost_2m', this.saveData, () => { this.saveData.boosterUntil = Date.now() + 120000; }); this.toast(ok ? i18n.t('rewardGranted') : this.rewardCooldownText('boost_2m'), !ok); this.changed(); }
  async rewardWorker(): Promise<void> { this.markAction(); const ok = await this.adSystem.showRewarded('free_worker', this.saveData, () => this.buyWorker(true)); this.toast(ok ? i18n.t('rewardGranted') : this.rewardCooldownText('free_worker'), !ok); this.changed(); }
  toggleMusic(): void { this.markAction(); this.saveData.sound.music = !this.saveData.sound.music; audio.setMusic(this.saveData.sound.music); this.changed(); }
  toggleSfx(): void { this.markAction(); this.saveData.sound.sfx = !this.saveData.sound.sfx; audio.setSfx(this.saveData.sound.sfx); this.changed(); }
  switchLanguage(): void { this.markAction(); this.saveData.language = this.saveData.language === 'ru' ? 'en' : 'ru'; i18n.setLanguage(this.saveData.language); this.changed(); this.scene.restart(); }
  completeTutorial(): void { this.saveData.tutorial.completed = true; this.saveData.tutorial.step = 6; analytics.track('tutorial_complete'); this.changed(); }

  private rebuildCafe(): void { this.fx?.destroy(); this.fx = undefined; this.drawCafe(); this.renderSlots(); this.fx = new FxPool(this); }
  private drawCafe(): void { this.children.removeAll(true); this.bars.clear(); this.views.clear(); this.add.rectangle(0, 0, gameConfig.width, gameConfig.height, 0xf7d9a6).setOrigin(0); const bg = this.add.graphics(); bg.fillStyle(0xffffff, 0.26).fillCircle(64, 180, 130); bg.fillStyle(0xffd15c, 0.22).fillCircle(636, 250, 150); bg.fillStyle(0x9ee6c5, 0.16).fillCircle(600, 730, 170); bg.fillStyle(0xd9914b, 0.18).fillRoundedRect(42, 170, 636, 650, 42); bg.fillStyle(0xfffdf6, 0.96).fillRoundedRect(50, 160, 620, 650, 42); bg.lineStyle(8, 0xd9914b, 0.88).strokeRoundedRect(50, 160, 620, 650, 42); bg.fillStyle(0xfff3d8, 0.85).fillRoundedRect(82, 198, 556, 84, 28); this.add.text(360, 205, 'CAPI CAFE', { fontSize: '34px', color: gameConfig.colors.text, fontStyle: 'bold', stroke: gameConfig.colors.white, strokeThickness: 4 }).setOrigin(0.5); this.add.text(360, 248, i18n.getLanguage() === 'ru' ? 'Тапай станции, объединяй капибар и открывай зоны' : 'Tap stations, merge capybaras and unlock zones', { fontSize: '18px', color: gameConfig.colors.brown, align: 'center', wordWrap: { width: 520 } }).setOrigin(0.5); for (const z of zoneConfigs) { const open = this.saveData.unlockedZones.includes(z.id); this.drawZone(z, open); } }
  private drawZone(z: (typeof zoneConfigs)[number], open: boolean): void { const g = this.add.graphics(); const x = z.x; const y = z.y; const w = z.width; const h = z.height; g.fillStyle(0x8a5a34, 0.12).fillRoundedRect(x + 6, y + 10, w, h, 26); g.fillStyle(open ? 0xffffff : 0x9c8d7d, open ? 0.92 : 0.36).fillRoundedRect(x, y, w, h, 26); g.fillStyle(0xffffff, open ? 0.32 : 0.1).fillRoundedRect(x + 14, y + 12, w - 28, Math.min(34, h - 18), 18); g.lineStyle(4, open ? 0xd9914b : 0x7b6c5c, open ? 0.82 : 0.6).strokeRoundedRect(x, y, w, h, 26); this.add.text(x + 22, y + 18, i18n.t(z.nameKey), { fontSize: '21px', color: gameConfig.colors.text, fontStyle: 'bold' }); if (open) { this.drawStation(z.stationId, x + w / 2, y + h / 2 + 22); return; } const lock = this.add.container(x + w / 2, y + h / 2 + 12); const badge = this.add.graphics(); badge.fillStyle(0x8a5a34, 0.9).fillRoundedRect(-148, -32, 296, 64, 22); badge.lineStyle(3, 0xffd15c, 0.9).strokeRoundedRect(-148, -32, 296, 64, 22); const text = this.add.text(0, 0, `${z.coinCost} coins + ${z.starCost} stars`, { fontSize: '21px', color: '#fffdf6', fontStyle: 'bold' }).setOrigin(0.5); lock.add([badge, text]); lock.setSize(296, 64).setInteractive(new Phaser.Geom.Rectangle(-148, -32, 296, 64), Phaser.Geom.Rectangle.Contains).on('pointerdown', () => this.unlockZone(z.id)); }
  private drawStation(id: StationId, x: number, y: number): void { const c = stationConfigs[id]; const st = this.saveData.stations[id]; const card = this.add.container(x, y); const g = this.add.graphics(); g.fillStyle(0x8a5a34, 0.16).fillRoundedRect(-116, -46, 232, 112, 26); g.fillStyle(0xfff3d8, 1).fillRoundedRect(-116, -54, 232, 112, 26); g.fillStyle(0xffffff, 0.32).fillRoundedRect(-98, -42, 196, 34, 18); g.lineStyle(4, 0xd9914b, 0.78).strokeRoundedRect(-116, -54, 232, 112, 26); const iconBg = this.add.circle(-76, -8, 36, 0xffd15c, 1).setStrokeStyle(4, 0xffffff, 0.8); const icon = this.add.text(-76, -10, c.emoji, { fontSize: '34px' }).setOrigin(0.5); const name = this.add.text(-30, -28, i18n.t(c.nameKey), { fontSize: '19px', color: gameConfig.colors.text, fontStyle: 'bold' }).setOrigin(0, 0.5); const income = this.add.text(-30, 0, `Lv.${st.level}  +${this.income(id)}`, { fontSize: '18px', color: gameConfig.colors.brown, fontStyle: 'bold' }).setOrigin(0, 0.5); const progressBg = this.add.rectangle(-94, 34, 188, 13, 0xffffff, 0.68).setOrigin(0, 0.5); const bar = this.add.rectangle(-94, 34, 1, 13, 0x62c370, 1).setOrigin(0, 0.5); this.bars.set(id, bar); card.add([g, iconBg, icon, name, income, progressBg, bar]); card.setSize(232, 112).setInteractive(new Phaser.Geom.Rectangle(-116, -54, 232, 112), Phaser.Geom.Rectangle.Contains).on('pointerdown', () => { this.markAction(); this.earn(this.income(id)); }); this.tweens.add({ targets: iconBg, scale: 1.06, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }); }
  private renderSlots(): void { this.layer?.destroy(true); this.views.clear(); this.layer = this.add.container(0, 0); const panel = this.add.graphics(); panel.fillStyle(0x8a5a34, 0.12).fillRoundedRect(42, 828, 636, 168, 30); panel.fillStyle(0xfffdf6, 0.72).fillRoundedRect(38, 818, 644, 170, 30); panel.lineStyle(3, 0xd9914b, 0.45).strokeRoundedRect(38, 818, 644, 170, 30); panel.fillStyle(0x8a5a34, 0.12).fillRoundedRect(42, 966, 636, 132, 30); panel.fillStyle(0xfffdf6, 0.72).fillRoundedRect(38, 956, 644, 132, 30); panel.lineStyle(3, 0xd9914b, 0.45).strokeRoundedRect(38, 956, 644, 132, 30); this.layer.add(panel); this.layer.add(this.add.text(70, 800, i18n.t('workers'), { fontSize: '23px', color: gameConfig.colors.text, fontStyle: 'bold' })); this.layer.add(this.add.text(70, 940, i18n.t('dishes'), { fontSize: '23px', color: gameConfig.colors.text, fontStyle: 'bold' })); for (let i = 0; i < 5; i += 1) { this.drawSlot(gameConfig.slots.workerStartX + i * gameConfig.slots.gap, gameConfig.slots.workerY); this.drawSlot(gameConfig.slots.dishStartX + i * gameConfig.slots.gap, gameConfig.slots.dishY); } for (const item of [...this.saveData.workers, ...this.saveData.dishes]) this.itemView(item); }
  private drawSlot(x: number, y: number): void { const g = this.add.graphics(); g.fillStyle(0x8a5a34, 0.14).fillRoundedRect(x - 45, y - 39, 90, 90, 22); g.fillStyle(0xffffff, 0.64).fillRoundedRect(x - 45, y - 45, 90, 90, 22); g.lineStyle(3, 0xd9914b, 0.44).strokeRoundedRect(x - 45, y - 45, 90, 90, 22); this.layer?.add(g); }
  private itemView(item: MergeItemState): void { const x = (item.category === 'worker' ? gameConfig.slots.workerStartX : gameConfig.slots.dishStartX) + item.slot * gameConfig.slots.gap; const y = item.category === 'worker' ? gameConfig.slots.workerY : gameConfig.slots.dishY; const box = this.add.container(x, y).setSize(86, 86); const shadow = this.add.circle(5, 8, 43, 0x8a5a34, 0.18); const base = this.add.circle(0, 0, 43, item.category === 'worker' ? 0x9ee6c5 : 0xffd15c, 1).setStrokeStyle(5, 0xffffff, 0.9); const shine = this.add.circle(-13, -14, 14, 0xffffff, 0.24); const tier = item.category === 'worker' ? workerTiers[Math.min(item.level, workerTiers.length) - 1] : dishTiers[Math.min(item.level, dishTiers.length) - 1]; const symbol = item.category === 'worker' ? (tier?.emoji ?? '🦫') : (tier?.emoji ?? '☕'); const symbolText = this.add.text(0, -9, symbol, { fontSize: '36px' }).setOrigin(0.5); const level = this.add.text(0, 30, `Lv.${item.level}`, { fontSize: '15px', color: gameConfig.colors.text, fontStyle: 'bold' }).setOrigin(0.5); box.add([shadow, base, shine, symbolText, level]); this.layer?.add(box); box.setInteractive(new Phaser.Geom.Rectangle(-43, -43, 86, 86), Phaser.Geom.Rectangle.Contains); this.input.setDraggable(box); const view = { item, box, x, y }; this.views.set(item.id, view); box.on('dragstart', () => { this.isDragging = true; this.markAction(); this.tweens.add({ targets: box, scale: 1.12, duration: 120, ease: 'Back.Out' }); }); box.on('drag', (_p: Phaser.Input.Pointer, dx: number, dy: number) => box.setPosition(dx, dy)); box.on('dragend', () => { this.isDragging = false; this.tweens.add({ targets: box, scale: 1, duration: 100 }); this.dragEnd(view); }); }
  private dragEnd(view: SlotView): void { const target = [...this.views.values()].find(v => v.item.id !== view.item.id && Phaser.Math.Distance.Between(v.box.x, v.box.y, view.box.x, view.box.y) < 62); if (target && mergeSystem.canMerge(view.item, target.item) && mergeSystem.merge(this.saveData, view.item, target.item)) { analytics.track('item_merged', { category: view.item.category, nextLevel: view.item.level + 1 }); audio.play('merge'); this.addQuestProgress('merge', 1); this.pop(target.box.x, target.box.y); this.renderSlots(); this.changed(); return; } this.tweens.add({ targets: view.box, x: view.x, y: view.y, duration: 180, ease: 'Back.Out' }); }
  private income(id: StationId): number { const st = this.saveData.stations[id]; const w = Math.max(1, ...this.saveData.workers.map(i => i.level)); const d = Math.max(1, ...this.saveData.dishes.map(i => i.level)); const boost = Date.now() < this.saveData.boosterUntil ? 2 : 1; return Math.floor(stationConfigs[id].baseIncome * Math.pow(1.25, st.level - 1) * (1 + w * 0.45) * (1 + d * 0.25) * boost); }
  private duration(id: StationId): number { return Math.max(1500, stationConfigs[id].baseDurationMs / (1 + this.saveData.stations[id].level * 0.08)); }
  private workerCost(): number { return Math.floor(50 * Math.pow(1.28, this.saveData.workers.length)); }
  private dishCost(): number { return Math.floor(35 * Math.pow(1.25, this.saveData.dishes.length)); }
  private upgradeCost(id: StationId): number { return Math.floor(stationConfigs[id].firstUpgradeCost * Math.pow(1.35, this.saveData.stations[id].level - 1)); }
  private earn(amount: number): void { this.saveData.coins += amount; this.saveData.totalEarnedCoins += amount; this.addQuestProgress('earnCoins', amount); this.fly(amount); this.changed(false); }
  private addQuestProgress(type: string, amount: number): void { for (const q of this.saveData.quests) if (!q.claimed && q.type === type) q.progress = Math.min(q.goal, q.progress + amount); this.updateQuestState(); }
  private updateQuestState(): void { for (const q of this.saveData.quests) { if (q.type === 'workerLevel') q.progress = Math.max(1, ...this.saveData.workers.map(w => w.level)); if (q.type === 'stationLevel' && q.target) q.progress = this.saveData.stations[q.target as StationId]?.level ?? q.progress; if (q.type === 'unlockZone' && q.target) q.progress = this.saveData.unlockedZones.includes(q.target as never) ? 1 : q.progress; q.completed = q.progress >= q.goal; } }
  private fly(amount: number): void { this.fx?.flyCoins(360, 690, amount); }
  private pop(x: number, y: number): void { this.fx?.burst(x, y, 14); }
  private fail(message = i18n.t('notEnoughCoins')): false { this.toast(message, true); return false; }
  private toast(message: string, error = false): void { const t = this.add.text(360, 190, message, { fontSize: '25px', color: error ? gameConfig.colors.danger : gameConfig.colors.text, backgroundColor: '#FFF3D8', padding: { x: 16, y: 10 } }).setOrigin(0.5).setDepth(500); audio.play(error ? 'error' : 'reward'); this.tweens.add({ targets: t, y: 140, alpha: 0, duration: 1200, onComplete: () => t.destroy() }); }
  private rewardCooldownText(placement: 'coins_300' | 'boost_2m' | 'free_worker'): string { const left = Math.ceil(this.adSystem.getRewardedCooldownLeftMs(this.saveData, placement) / 60000); if (left <= 0) return i18n.t('adUnavailable'); return i18n.getLanguage() === 'ru' ? `Бонус будет доступен через ${left} мин.` : `Bonus available in ${left} min.`; }
  private giveOffline(coins: number): void { analytics.track('offline_reward_claimed', { coins, doubled: false }); this.saveSystem.applyOfflineReward(coins); this.changed(); }
  private async doubleOffline(coins: number): Promise<void> { const ok = await this.adSystem.showRewarded('offline_x2', this.saveData, () => this.saveSystem.applyOfflineReward(coins * 2)); analytics.track('offline_reward_claimed', { coins: ok ? coins * 2 : 0, doubled: ok }); this.changed(); }
  private changed(save = true): void { this.updateQuestState(); this.registry.set('save', this.saveData); this.game.events.emit('save-changed', this.saveData); if (save) this.saveScheduler?.markDirty(); }
  private async flushSave(): Promise<void> { if (this.saveScheduler) await this.saveScheduler.flush(); else if (this.saveSystem) await this.saveSystem.save(); }
  private markAction(): void { this.lastUserActionAt = Date.now(); }
  private cleanupListeners(): void { document.removeEventListener('visibilitychange', this.onVisibilityChange); this.game.events.off('buy-worker', this.onBuyWorker); this.game.events.off('buy-dish', this.onBuyDish); this.game.events.off('upgrade-station', this.onUpgradeStation); this.game.events.off('unlock-zone', this.onUnlockZone); this.game.events.off('claim-quest', this.onClaimQuest); this.game.events.off('claim-daily-reward', this.onClaimDailyReward); this.game.events.off('purchase-product', this.onPurchaseProduct); this.game.events.off('reward-coins', this.onRewardCoins); this.game.events.off('reward-boost', this.onRewardBoost); this.game.events.off('reward-worker', this.onRewardWorker); void this.flushSave(); this.saveScheduler?.dispose(); this.fx?.destroy(); this.fx = undefined; this.isDragging = false; }
}
