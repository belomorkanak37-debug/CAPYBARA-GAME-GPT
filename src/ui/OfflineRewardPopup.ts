import Phaser from 'phaser';
import { gameConfig } from '../config/gameConfig';
import { i18n } from '../systems/LocalizationSystem';
import { Button } from './Button';

export class OfflineRewardPopup extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, coins: number, onClaim: () => void, onDouble: () => void) {
    super(scene, gameConfig.width / 2, gameConfig.height / 2);
    const dim = scene.add.rectangle(0, 0, gameConfig.width, gameConfig.height, 0x000000, 0.35).setInteractive();
    const card = scene.add.rectangle(0, 0, 570, 410, 0xfff3d8, 1).setStrokeStyle(5, 0xffd15c, 1);
    const title = scene.add.text(0, -130, i18n.t('offlineTitle'), { fontSize: '32px', color: gameConfig.colors.text, fontStyle: 'bold', align: 'center', wordWrap: { width: 480 } }).setOrigin(0.5);
    const amount = scene.add.text(0, -45, `+${coins} 🪙`, { fontSize: '42px', color: gameConfig.colors.text, fontStyle: 'bold' }).setOrigin(0.5);
    const claim = new Button(scene, -135, 85, 240, 70, i18n.t('offlineClaim'), () => { this.destroy(); onClaim(); });
    const double = new Button(scene, 135, 85, 250, 70, i18n.t('watchAdOffline'), () => { this.destroy(); onDouble(); }, 0x62c370);
    this.add([dim, card, title, amount, claim, double]);
    this.setDepth(1000);
    scene.add.existing(this);
  }
}
