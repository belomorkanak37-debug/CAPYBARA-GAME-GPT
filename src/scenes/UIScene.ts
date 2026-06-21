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
  private saveData?: SaveData;

  constructor() { super('UIScene'); }

  create(): void {
    this.saveData = this.registry.get('save') as SaveData;
    this.add.rectangle(360, 55, 700, 100, 0xfff3d8, 0.95).setStrokeStyle(4, 0xd9914b, 0.8);
    this.coins = new CoinCounter(this, 125, 55, 'C', this.saveData.coins);
    this.stars = new CoinCounter(this, 330, 55, '*', this.saveData.stars);
    this.level = new CoinCounter(this, 535, 55, 'L', this.saveData.cafeLevel);
    new Button(this, 660, 118, 70, 54, '⚙', () => this.openSettings(), 0x9ee6c5);
    this.add.rectangle(360, 1116, 700, 185, 0xfff3d8, 0.96).setStrokeStyle(4, 0xd9914b, 0.8);
    new Button(this, 102, 1070, 120, 62, i18n.t('shop'), () => this.scene.launch('ShopScene'));
    new Button(this, 238, 1070, 120, 62, i18n.t('buyWorker'), () => this.game.events.emit('buy-worker'));
    new Button(this, 374, 1070, 120, 62, i18n.t('buyDish'), () => this.game.events.emit('buy-dish'));
    new Button(this, 510, 1070, 120, 62, i18n.t('upgrade'), () => this.game.events.emit('upgrade-station', 'coffee'));
    new Button(this, 646, 1070, 120, 62, i18n.t('reward'), () => this.game.events.emit('reward-coins'), 0x62c370);
    this.questText = this.add.text(46, 1158, '', { fontSize: '22px', color: gameConfig.colors.text, fontStyle: 'bold', wordWrap: { width: 500 } });
    new Button(this, 602, 1190, 150, 60, i18n.t('quests'), () => this.game.events.emit('claim-quest'), 0xffd15c);
    this.game.events.on('save-changed', this.refresh, this);
    this.refresh(this.saveData);
  }

  private refresh(data: SaveData): void {
    this.saveData = data;
    this.coins?.setValue(data.coins);
    this.stars?.setValue(data.stars);
    this.level?.setValue(data.cafeLevel);
    const quest = data.quests.find(item => !item.claimed) ?? data.quests[data.quests.length - 1];
    if (quest) this.questText?.setText(`${i18n.t(quest.textKey)}: ${Math.min(quest.progress, quest.goal)}/${quest.goal}`);
  }

  private openSettings(): void {
    if (!this.saveData) return;
    const gameScene = this.scene.get('GameScene') as unknown as { toggleMusic: () => void; toggleSfx: () => void; switchLanguage: () => void };
    new SettingsPanel(this, this.saveData, () => { gameScene.toggleMusic(); this.scene.restart(); }, () => { gameScene.toggleSfx(); this.scene.restart(); }, () => gameScene.switchLanguage(), async () => { await yandexSDK.login(); }, () => undefined);
  }
}
