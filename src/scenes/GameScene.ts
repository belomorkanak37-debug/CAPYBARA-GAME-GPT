import Phaser from 'phaser';
import { gameConfig } from '../config/gameConfig';
import { dishTiers, stationConfigs, zoneConfigs } from '../config/economyConfig';
import { AdSystem } from '../systems/AdSystem';
import { audio } from '../systems/AudioSystem';
import { i18n } from '../systems/LocalizationSystem';
import { mergeSystem } from '../systems/MergeSystem';
import { SaveSystem } from '../systems/SaveSystem';
import type { MergeItemState, SaveData, StationId, ZoneId } from '../types';
import { OfflineRewardPopup } from '../ui/OfflineRewardPopup';
import { RewardPopup } from '../ui/RewardPopup';

interface SlotView { item: MergeItemState; box: Phaser.GameObjects.Container; x: number; y: number; }

export class GameScene extends Phaser.Scene {
  saveSystem!: SaveSystem;
  adSystem!: AdSystem;
  saveData!: SaveData;
  private bars = new Map<StationId, Phaser.GameObjects.Rectangle>();
  private views = new Map<string, SlotView>();
  private layer?: Phaser.GameObjects.Container;

  constructor() { super('GameScene'); }

  async create(): Promise<void> {
    try {
      this.add.rectangle(0, 0, gameConfig.width, gameConfig.height, 0xf7d9a6).setOrigin(0);
      this.add.text(360, 610, 'Loading cafe...', { fontSize: '30px', color: gameConfig.colors.text }).setOrigin(0.5);
      this.saveSystem = new SaveSystem(i18n.getLanguage());
      this.saveData = await this.saveSystem.load();
      i18n.setLanguage(this.saveData.language);
      audio.applySettings(this.saveData.sound);
      this.adSystem = new AdSystem(() => this.saveSystem.save());
      this.registry.set('save', this.saveData);
      this.drawCafe();
      this.renderSlots();
      this.scene.launch('UIScene');
      const offline = this.saveSystem.calculateOfflineReward();
      if (offline.coins > 0) new OfflineRewardPopup(this, offline.coins, () => this.giveOffline(offline.coins), () => void this.doubleOffline(offline.coins));
      if (!this.saveData.tutorial.completed) this.scene.launch('TutorialScene');
      this.time.addEvent({ delay: gameConfig.autosaveMs, loop: true, callback: () => void this.saveSystem.save() });
      this.game.events.on('buy-worker', () => this.buyWorker());
      this.game.events.on('buy-dish', () => this.buyDish());
      this.game.events.on('upgrade-station', (id: StationId) => this.upgradeStation(id));
      this.game.events.on('unlock-zone', (id: ZoneId) => this.unlockZone(id));
      this.game.events.on('claim-quest', () => this.claimQuest());
      this.game.events.on('reward-coins', () => void this.rewardCoins());
      this.game.events.on('reward-boost', () => void this.rewardBoost());
      this.game.events.on('reward-worker', () => void this.rewardWorker());
      document.addEventListener('visibilitychange', () => { if (document.hidden) { audio.pause(); void this.saveSystem.save(); } else audio.resume(); });
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
      if (bar) bar.width = Phaser.Math.Clamp(st.progress, 0, 1) * 185;
      if (st.progress >= 1) { st.progress = 0; this.earn(this.income(st.id)); }
    }
  }

  buyWorker(free = false): boolean { const cost = this.workerCost(); if (!free && this.saveData.coins < cost) return this.fail(); if (!free) this.saveData.coins -= cost; const item = mergeSystem.addItem(this.saveData, 'worker'); if (!item) return this.fail(i18n.t('noSlots')); audio.play('upgrade'); this.renderSlots(); this.changed(); return true; }
  buyDish(): boolean { const cost = this.dishCost(); if (this.saveData.coins < cost) return this.fail(); this.saveData.coins -= cost; const item = mergeSystem.addItem(this.saveData, 'dish'); if (!item) return this.fail(i18n.t('noSlots')); audio.play('upgrade'); this.renderSlots(); this.changed(); return true; }
  upgradeStation(id: StationId): boolean { const st = this.saveData.stations[id]; const cost = this.upgradeCost(id); if (!st.unlocked || this.saveData.coins < cost) return this.fail(); this.saveData.coins -= cost; st.level += 1; audio.play('upgrade'); this.pop(360, 420); this.changed(); return true; }
  unlockZone(id: ZoneId): boolean { const z = zoneConfigs.find(zone => zone.id === id); if (!z || this.saveData.unlockedZones.includes(id) || this.saveData.coins < z.coinCost || this.saveData.stars < z.starCost) return this.fail(); this.saveData.coins -= z.coinCost; this.saveData.stars -= z.starCost; this.saveData.unlockedZones.push(id); this.saveData.stations[z.stationId].unlocked = true; this.saveData.stations[z.stationId].level = 1; audio.play('reward'); this.drawCafe(); this.renderSlots(); this.changed(); void this.adSystem.maybeShowInterstitial(this.saveData); return true; }
  claimQuest(): void { const q = this.saveData.quests.find(item => !item.claimed); if (!q) return; this.updateQuestState(); if (!q.completed) return; q.claimed = true; this.saveData.coins += q.rewardCoins; this.saveData.stars += q.rewardStars; this.saveData.cafeLevel = 1 + Math.floor(this.saveData.stars / 10); new RewardPopup(this, i18n.t('questDone'), `+${q.rewardCoins} coins +${q.rewardStars} stars`, () => undefined); this.changed(); }
  async rewardCoins(): Promise<void> { const ok = await this.adSystem.showRewarded('coins', () => this.earn(300)); this.toast(ok ? i18n.t('rewardGranted') : i18n.t('adUnavailable'), !ok); this.changed(); }
  async rewardBoost(): Promise<void> { const ok = await this.adSystem.showRewarded('boost', () => { this.saveData.boosterUntil = Date.now() + 120000; }); this.toast(ok ? i18n.t('rewardGranted') : i18n.t('adUnavailable'), !ok); this.changed(); }
  async rewardWorker(): Promise<void> { const ok = await this.adSystem.showRewarded('worker', () => this.buyWorker(true)); this.toast(ok ? i18n.t('rewardGranted') : i18n.t('adUnavailable'), !ok); this.changed(); }
  toggleMusic(): void { this.saveData.sound.music = !this.saveData.sound.music; audio.setMusic(this.saveData.sound.music); this.changed(); }
  toggleSfx(): void { this.saveData.sound.sfx = !this.saveData.sound.sfx; audio.setSfx(this.saveData.sound.sfx); this.changed(); }
  switchLanguage(): void { this.saveData.language = this.saveData.language === 'ru' ? 'en' : 'ru'; i18n.setLanguage(this.saveData.language); this.changed(); this.scene.restart(); }
  completeTutorial(): void { this.saveData.tutorial.completed = true; this.saveData.tutorial.step = 6; this.changed(); }

  private drawCafe(): void { this.children.removeAll(true); this.bars.clear(); this.views.clear(); this.add.rectangle(0, 0, gameConfig.width, gameConfig.height, 0xf7d9a6).setOrigin(0); this.add.rectangle(360, 535, 640, 660, 0xfff6df).setStrokeStyle(8, 0xd9914b); this.add.text(360, 130, 'CAPI CAFE', { fontSize: '34px', color: gameConfig.colors.text, fontStyle: 'bold' }).setOrigin(0.5); for (const z of zoneConfigs) { const open = this.saveData.unlockedZones.includes(z.id); this.add.rectangle(z.x + z.width / 2, z.y + z.height / 2, z.width, z.height, open ? 0xffffff : 0x9c8d7d, open ? 0.9 : 0.45).setStrokeStyle(4, open ? 0xd9914b : 0x7b6c5c); this.add.text(z.x + 18, z.y + 16, i18n.t(z.nameKey), { fontSize: '22px', color: gameConfig.colors.text, fontStyle: 'bold' }); if (open) this.drawStation(z.stationId, z.x + z.width / 2, z.y + z.height / 2 + 20); else this.add.text(z.x + z.width / 2, z.y + z.height / 2 + 8, `${z.coinCost} coins + ${z.starCost} stars`, { fontSize: '22px', color: '#fffdf6', backgroundColor: '#8A5A34', padding: { x: 12, y: 8 } }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.unlockZone(z.id)); } }
  private drawStation(id: StationId, x: number, y: number): void { const c = stationConfigs[id]; const st = this.saveData.stations[id]; this.add.rectangle(x, y, 210, 94, 0xfff3d8).setStrokeStyle(4, 0xd9914b).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.earn(this.income(id))); this.add.text(x - 82, y - 22, c.emoji, { fontSize: '34px' }).setOrigin(0.5); this.add.text(x - 40, y - 28, i18n.t(c.nameKey), { fontSize: '19px', color: gameConfig.colors.text, fontStyle: 'bold' }).setOrigin(0, 0.5); this.add.text(x - 40, y - 2, `Lv.${st.level} +${this.income(id)}`, { fontSize: '18px', color: gameConfig.colors.text }).setOrigin(0, 0.5); this.add.rectangle(x - 92, y + 30, 185, 12, 0xffffff, 0.55).setOrigin(0, 0.5); this.bars.set(id, this.add.rectangle(x - 92, y + 30, 1, 12, 0x62c370).setOrigin(0, 0.5)); }
  private renderSlots(): void { this.layer?.destroy(true); this.views.clear(); this.layer = this.add.container(0, 0); this.layer.add(this.add.text(70, 805, i18n.t('workers'), { fontSize: '24px', color: gameConfig.colors.text, fontStyle: 'bold' })); this.layer.add(this.add.text(70, 945, i18n.t('dishes'), { fontSize: '24px', color: gameConfig.colors.text, fontStyle: 'bold' })); for (let i = 0; i < 5; i += 1) { this.layer.add(this.add.image(gameConfig.slots.workerStartX + i * gameConfig.slots.gap, gameConfig.slots.workerY, 'slot')); this.layer.add(this.add.image(gameConfig.slots.dishStartX + i * gameConfig.slots.gap, gameConfig.slots.dishY, 'slot')); } for (const item of [...this.saveData.workers, ...this.saveData.dishes]) this.itemView(item); }
  private itemView(item: MergeItemState): void { const x = (item.category === 'worker' ? gameConfig.slots.workerStartX : gameConfig.slots.dishStartX) + item.slot * gameConfig.slots.gap; const y = item.category === 'worker' ? gameConfig.slots.workerY : gameConfig.slots.dishY; const box = this.add.container(x, y).setSize(86, 86); box.add([this.add.circle(0, 0, 42, item.category === 'worker' ? 0x9ee6c5 : 0xffd15c).setStrokeStyle(4, 0xffffff), this.add.text(0, -7, item.category === 'worker' ? 'C' : (dishTiers[Math.min(item.level, dishTiers.length) - 1]?.emoji ?? 'D'), { fontSize: '38px' }).setOrigin(0.5), this.add.text(0, 30, `Lv.${item.level}`, { fontSize: '16px', color: gameConfig.colors.text, fontStyle: 'bold' }).setOrigin(0.5)]); this.layer?.add(box); box.setInteractive(new Phaser.Geom.Rectangle(-43, -43, 86, 86), Phaser.Geom.Rectangle.Contains); this.input.setDraggable(box); const view = { item, box, x, y }; this.views.set(item.id, view); box.on('drag', (_p: Phaser.Input.Pointer, dx: number, dy: number) => box.setPosition(dx, dy)); box.on('dragend', () => this.dragEnd(view)); }
  private dragEnd(view: SlotView): void { const target = [...this.views.values()].find(v => v.item.id !== view.item.id && Phaser.Math.Distance.Between(v.box.x, v.box.y, view.box.x, view.box.y) < 62); if (target && mergeSystem.canMerge(view.item, target.item) && mergeSystem.merge(this.saveData, view.item, target.item)) { audio.play('merge'); this.addQuestProgress('merge', 1); this.pop(target.box.x, target.box.y); this.renderSlots(); this.changed(); return; } this.tweens.add({ targets: view.box, x: view.x, y: view.y, duration: 180, ease: 'Back.Out' }); }
  private income(id: StationId): number { const st = this.saveData.stations[id]; const w = Math.max(1, ...this.saveData.workers.map(i => i.level)); const d = Math.max(1, ...this.saveData.dishes.map(i => i.level)); const boost = Date.now() < this.saveData.boosterUntil ? 2 : 1; return Math.floor(stationConfigs[id].baseIncome * Math.pow(1.25, st.level - 1) * (1 + w * 0.45) * (1 + d * 0.25) * boost); }
  private duration(id: StationId): number { return Math.max(1500, stationConfigs[id].baseDurationMs / (1 + this.saveData.stations[id].level * 0.08)); }
  private workerCost(): number { return Math.floor(50 * Math.pow(1.28, this.saveData.workers.length)); }
  private dishCost(): number { return Math.floor(35 * Math.pow(1.25, this.saveData.dishes.length)); }
  private upgradeCost(id: StationId): number { return Math.floor(stationConfigs[id].firstUpgradeCost * Math.pow(1.35, this.saveData.stations[id].level - 1)); }
  private earn(amount: number): void { this.saveData.coins += amount; this.saveData.totalEarnedCoins += amount; this.addQuestProgress('earnCoins', amount); this.fly(amount); this.changed(false); }
  private addQuestProgress(type: string, amount: number): void { for (const q of this.saveData.quests) if (!q.claimed && q.type === type) q.progress = Math.min(q.goal, q.progress + amount); this.updateQuestState(); }
  private updateQuestState(): void { for (const q of this.saveData.quests) { if (q.type === 'workerLevel') q.progress = Math.max(1, ...this.saveData.workers.map(w => w.level)); if (q.type === 'stationLevel' && q.target) q.progress = this.saveData.stations[q.target as StationId]?.level ?? q.progress; if (q.type === 'unlockZone' && q.target) q.progress = this.saveData.unlockedZones.includes(q.target as never) ? 1 : q.progress; q.completed = q.progress >= q.goal; } }
  private fly(amount: number): void { const t = this.add.text(360, 690, `+${amount}`, { fontSize: '30px', color: gameConfig.colors.text, fontStyle: 'bold' }).setOrigin(0.5).setDepth(100); this.tweens.add({ targets: t, y: 105, alpha: 0, duration: 850, onComplete: () => t.destroy() }); audio.play('coin'); }
  private pop(x: number, y: number): void { for (let i = 0; i < 10; i += 1) { const dot = this.add.circle(x, y, 6, Phaser.Display.Color.RandomRGB(120, 255).color).setDepth(200); this.tweens.add({ targets: dot, x: x + Phaser.Math.Between(-100, 100), y: y + Phaser.Math.Between(-80, 80), alpha: 0, duration: 650, onComplete: () => dot.destroy() }); } }
  private fail(message = i18n.t('notEnoughCoins')): false { this.toast(message, true); return false; }
  private toast(message: string, error = false): void { const t = this.add.text(360, 190, message, { fontSize: '25px', color: error ? gameConfig.colors.danger : gameConfig.colors.text, backgroundColor: '#FFF3D8', padding: { x: 16, y: 10 } }).setOrigin(0.5).setDepth(500); audio.play(error ? 'error' : 'reward'); this.tweens.add({ targets: t, y: 140, alpha: 0, duration: 1200, onComplete: () => t.destroy() }); }
  private giveOffline(coins: number): void { this.saveSystem.applyOfflineReward(coins); this.changed(); }
  private async doubleOffline(coins: number): Promise<void> { await this.adSystem.showRewarded('offline', () => this.saveSystem.applyOfflineReward(coins * 2)); this.changed(); }
  private changed(save = true): void { this.updateQuestState(); this.registry.set('save', this.saveData); this.game.events.emit('save-changed', this.saveData); if (save) void this.saveSystem.save(); }
}
