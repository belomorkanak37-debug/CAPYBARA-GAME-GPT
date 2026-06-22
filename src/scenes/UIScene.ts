import Phaser from 'phaser';
import { gameConfig } from '../config/gameConfig';
import { i18n } from '../systems/LocalizationSystem';
import { yandexSDK } from '../systems/YandexSDK';
import type { SaveData } from '../types';
import { Button } from '../ui/Button';
import { CoinCounter } from '../ui/CoinCounter';
import { SettingsPanel } from '../ui/SettingsPanel';

export class UIScene extends Phaser.Scene {
  private coins?: CoinCounter;
  private stars?: CoinCounter;
  private level?: CoinCounter;
  private questText?: Phaser.GameObjects.Text;
  private questFill?: Phaser.GameObjects.Rectangle;
  private saveData?: SaveData;

  constructor() { super('UIScene'); }

  create(): void {
    this.saveData = this.registry.get('save') as SaveData;

    this.drawTopBar();
    this.level = new CoinCounter(this, 88, 58, 'lvl', this.saveData.cafeLevel).setDepth(70);
    this.coins = new CoinCounter(this, 300, 58, 'coin', this.saveData.coins).setDepth(70);
    this.stars = new CoinCounter(this, 514, 58, 'star', this.saveData.stars).setDepth(70);
    new Button(this, 660, 58, 88, 58, 'MENU', () => this.openSettings(), 0x8b512a).setDepth(72);

    this.drawSideNav();
    this.drawBottomBar();
    new Button(this, 158, 1070, 232, 62, i18n.t('upgrade'), () => this.game.events.emit('upgrade-station', 'coffee'), 0x78af22).setDepth(72);
    new Button(this, 418, 1070, 232, 62, i18n.t('reward'), () => this.game.events.emit('reward-coins'), 0x2d87b8).setDepth(72);
    new Button(this, 632, 1070, 118, 62, i18n.t('shop'), () => this.scene.launch('ShopScene'), 0xf4a13d).setDepth(72);

    this.questText = this.add.text(70, 1164, '', {
      fontSize: '21px',
      color: gameConfig.colors.text,
      fontStyle: 'bold',
      wordWrap: { width: 450 }
    }).setDepth(72);
    this.add.rectangle(70, 1214, 430, 15, 0x6b3b1e, 0.25).setOrigin(0, 0.5).setDepth(72);
    this.questFill = this.add.rectangle(70, 1214, 1, 15, 0x78af22, 1).setOrigin(0, 0.5).setDepth(73);
    new Button(this, 610, 1190, 162, 64, i18n.t('quests'), () => this.game.events.emit('claim-quest'), 0xffc83d).setDepth(72);

    this.game.events.on('save-changed', this.refresh, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.game.events.off('save-changed', this.refresh, this));
    this.refresh(this.saveData);
  }

  private refresh(data: SaveData): void {
    this.saveData = data;
    this.coins?.setValue(data.coins);
    this.stars?.setValue(data.stars);
    this.level?.setValue(data.cafeLevel);
    const quest = data.quests.find(item => !item.claimed) ?? data.quests[data.quests.length - 1];
    if (quest) {
      const progress = Math.min(quest.progress, quest.goal);
      this.questText?.setText(`${i18n.t(quest.textKey)}  ${progress}/${quest.goal}`);
      if (this.questFill) this.questFill.width = Math.max(8, 430 * Phaser.Math.Clamp(progress / quest.goal, 0, 1));
    }
  }

  private openSettings(): void {
    if (!this.saveData) return;
    const gameScene = this.scene.get('GameScene') as unknown as { toggleMusic: () => void; toggleSfx: () => void; switchLanguage: () => void };
    new SettingsPanel(this, this.saveData, () => { gameScene.toggleMusic(); this.scene.restart(); }, () => { gameScene.toggleSfx(); this.scene.restart(); }, () => gameScene.switchLanguage(), async () => { await yandexSDK.login(); }, () => undefined);
  }

  private drawTopBar(): void {
    const shadow = this.add.graphics().setDepth(55);
    shadow.fillStyle(0x3c2114, 0.28).fillRoundedRect(14, 14, 692, 92, 24);
    const panel = this.add.graphics().setDepth(56);
    panel.fillStyle(0x4a2a18, 1).fillRoundedRect(10, 8, 700, 92, 24);
    panel.fillStyle(0x8b512a, 1).fillRoundedRect(20, 18, 680, 66, 18);
    panel.fillStyle(0xffffff, 0.12).fillRoundedRect(34, 24, 652, 20, 12);
    panel.lineStyle(3, 0xfff7df, 0.35).strokeRoundedRect(20, 18, 680, 66, 18);
  }

  private drawSideNav(): void {
    const labels = [i18n.t('shop'), i18n.t('quests'), i18n.t('reward')];
    const events = [() => this.scene.launch('ShopScene'), () => this.game.events.emit('claim-quest'), () => this.game.events.emit('reward-boost')];
    labels.forEach((label, index) => {
      const y = 340 + index * 112;
      const bg = this.add.graphics().setDepth(64);
      bg.fillStyle(0x3c2114, 0.24).fillRoundedRect(24, y - 38, 112, 86, 18);
      bg.fillStyle(0x8b512a, 0.98).fillRoundedRect(18, y - 44, 112, 86, 18);
      bg.fillStyle(0xffffff, 0.14).fillRoundedRect(28, y - 36, 92, 20, 10);
      bg.lineStyle(3, 0xffc83d, 0.55).strokeRoundedRect(18, y - 44, 112, 86, 18);
      this.add.text(74, y, label, { fontSize: '17px', color: gameConfig.colors.cream, fontStyle: 'bold', align: 'center', wordWrap: { width: 92 } }).setOrigin(0.5).setDepth(66);
      this.add.zone(18, y - 44, 112, 86).setOrigin(0).setInteractive({ useHandCursor: true }).on('pointerup', events[index]);
    });
  }

  private drawBottomBar(): void {
    const shadow = this.add.graphics().setDepth(55);
    shadow.fillStyle(0x3c2114, 0.24).fillRoundedRect(18, 992, 684, 258, 32);
    const panel = this.add.graphics().setDepth(56);
    panel.fillStyle(0xfff7df, 0.98).fillRoundedRect(10, 982, 700, 258, 32);
    panel.fillStyle(0xfff1cf, 0.96).fillRoundedRect(28, 1002, 664, 80, 24);
    panel.lineStyle(4, 0xd8b17a, 0.82).strokeRoundedRect(10, 982, 700, 258, 32);
    this.add.text(54, 1126, i18n.t('dailyQuest'), { fontSize: '18px', color: gameConfig.colors.caramel, fontStyle: 'bold' }).setDepth(72);
  }
}
