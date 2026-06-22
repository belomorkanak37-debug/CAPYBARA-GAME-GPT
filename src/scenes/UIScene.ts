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
    this.coins = new CoinCounter(this, 126, 56, '🪙', this.saveData.coins);
    this.stars = new CoinCounter(this, 342, 56, '⭐', this.saveData.stars);
    this.level = new CoinCounter(this, 558, 56, '🏠', this.saveData.cafeLevel);
    new Button(this, 665, 124, 76, 58, '⚙', () => this.openSettings(), 0x9ee6c5).setDepth(50);

    this.drawBottomBar();
    new Button(this, 92, 1070, 112, 62, i18n.t('shop'), () => this.scene.launch('ShopScene'), 0xffd15c).setDepth(50);
    new Button(this, 224, 1070, 126, 62, i18n.t('buyWorker'), () => this.game.events.emit('buy-worker'), 0x9ee6c5).setDepth(50);
    new Button(this, 368, 1070, 126, 62, i18n.t('buyDish'), () => this.game.events.emit('buy-dish'), 0xffd15c).setDepth(50);
    new Button(this, 512, 1070, 126, 62, i18n.t('upgrade'), () => this.game.events.emit('upgrade-station', 'coffee'), 0xf7a35c).setDepth(50);
    new Button(this, 650, 1070, 112, 62, i18n.t('reward'), () => this.game.events.emit('reward-coins'), 0x62c370).setDepth(50);

    this.questText = this.add.text(70, 1168, '', {
      fontSize: '22px',
      color: gameConfig.colors.text,
      fontStyle: 'bold',
      wordWrap: { width: 440 }
    }).setDepth(50);
    this.add.rectangle(70, 1215, 410, 13, 0xffffff, 0.64).setOrigin(0, 0.5).setDepth(50);
    this.questFill = this.add.rectangle(70, 1215, 1, 13, 0x62c370, 1).setOrigin(0, 0.5).setDepth(51);
    new Button(this, 610, 1190, 160, 64, i18n.t('quests'), () => this.game.events.emit('claim-quest'), 0xffd15c).setDepth(50);

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
      if (this.questFill) this.questFill.width = Math.max(8, 410 * Phaser.Math.Clamp(progress / quest.goal, 0, 1));
    }
  }

  private openSettings(): void {
    if (!this.saveData) return;
    const gameScene = this.scene.get('GameScene') as unknown as { toggleMusic: () => void; toggleSfx: () => void; switchLanguage: () => void };
    new SettingsPanel(this, this.saveData, () => { gameScene.toggleMusic(); this.scene.restart(); }, () => { gameScene.toggleSfx(); this.scene.restart(); }, () => gameScene.switchLanguage(), async () => { await yandexSDK.login(); }, () => undefined);
  }

  private drawTopBar(): void {
    const shadow = this.add.graphics().setDepth(40);
    shadow.fillStyle(0x8a5a34, 0.18).fillRoundedRect(16, 14, 688, 104, 26);
    const panel = this.add.graphics().setDepth(41);
    panel.fillStyle(0xfff3d8, 0.95).fillRoundedRect(10, 8, 700, 104, 26);
    panel.fillStyle(0xffffff, 0.26).fillRoundedRect(28, 18, 664, 34, 18);
    panel.lineStyle(4, 0xd9914b, 0.75).strokeRoundedRect(10, 8, 700, 104, 26);
  }

  private drawBottomBar(): void {
    const shadow = this.add.graphics().setDepth(40);
    shadow.fillStyle(0x8a5a34, 0.2).fillRoundedRect(16, 1000, 688, 252, 28);
    const panel = this.add.graphics().setDepth(41);
    panel.fillStyle(0xfff3d8, 0.97).fillRoundedRect(10, 988, 700, 252, 28);
    panel.fillStyle(0xffffff, 0.24).fillRoundedRect(30, 1004, 660, 34, 18);
    panel.lineStyle(4, 0xd9914b, 0.78).strokeRoundedRect(10, 988, 700, 252, 28);
    this.add.text(54, 1128, i18n.t('dailyQuest'), { fontSize: '18px', color: gameConfig.colors.caramel, fontStyle: 'bold' }).setDepth(50);
  }
}
