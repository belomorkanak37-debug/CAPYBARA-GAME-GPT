import Phaser from 'phaser';
import { gameConfig } from '../config/gameConfig';
import { i18n } from '../systems/LocalizationSystem';
import { Button } from '../ui/Button';

export class ShopScene extends Phaser.Scene {
  constructor() { super('ShopScene'); }
  create(): void {
    this.add.rectangle(0, 0, gameConfig.width, gameConfig.height, 0x000000, 0.35).setInteractive();
    this.add.rectangle(360, 640, 620, 620, 0xfff3d8, 1).setStrokeStyle(5, 0xd9914b, 1);
    this.add.text(360, 350, i18n.t('shop'), { fontSize: '42px', color: gameConfig.colors.text, fontStyle: 'bold' }).setOrigin(0.5);
    new Button(this, 360, 470, 460, 70, i18n.t('buyWorker'), () => { this.game.events.emit('buy-worker'); this.scene.stop(); });
    new Button(this, 360, 560, 460, 70, i18n.t('buyDish'), () => { this.game.events.emit('buy-dish'); this.scene.stop(); }, 0xffd15c);
    new Button(this, 360, 650, 460, 70, i18n.t('reward'), () => { this.game.events.emit('reward-coins'); this.scene.stop(); }, 0x62c370);
    new Button(this, 360, 820, 260, 70, i18n.t('close'), () => this.scene.stop(), 0xf7a35c);
  }
}
