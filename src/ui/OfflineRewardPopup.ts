import Phaser from 'phaser';
import { gameConfig } from '../config/gameConfig';
import { i18n } from '../systems/LocalizationSystem';
import { Button } from './Button';

export class OfflineRewardPopup extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, coins: number, onClaim: () => void, onDouble: () => void) {
    super(scene, gameConfig.width / 2, gameConfig.height / 2);
    const dim = scene.add.rectangle(0, 0, gameConfig.width, gameConfig.height, 0x2f1d13, 0.38).setInteractive();
    const shadow = scene.add.graphics();
    shadow.fillStyle(0x8a5a34, 0.24).fillRoundedRect(-292, -176, 584, 392, 38);
    const card = scene.add.graphics();
    card.fillStyle(0xfff3d8, 1).fillRoundedRect(-295, -205, 590, 410, 38);
    card.fillStyle(0xffffff, 0.38).fillRoundedRect(-268, -184, 536, 92, 30);
    card.lineStyle(6, 0xffd15c, 1).strokeRoundedRect(-295, -205, 590, 410, 38);
    card.lineStyle(2, 0xd9914b, 0.45).strokeRoundedRect(-278, -188, 556, 376, 30);
    const icon = scene.add.text(0, -132, '☕🦫', { fontSize: '50px' }).setOrigin(0.5);
    const title = scene.add.text(0, -70, i18n.t('offlineTitle'), { fontSize: '31px', color: gameConfig.colors.text, fontStyle: 'bold', align: 'center', wordWrap: { width: 500 } }).setOrigin(0.5);
    const amount = scene.add.text(0, 18, `+${coins} 🪙`, { fontSize: '46px', color: gameConfig.colors.text, fontStyle: 'bold' }).setOrigin(0.5);
    const hint = scene.add.text(0, 66, 'Бонус за возвращение', { fontSize: '20px', color: gameConfig.colors.brown, align: 'center' }).setOrigin(0.5);
    const claim = new Button(scene, -140, 140, 250, 72, i18n.t('offlineClaim'), () => { this.destroy(); onClaim(); }, 0xffd15c);
    const double = new Button(scene, 145, 140, 265, 72, 'x2 Bonus', () => { this.destroy(); onDouble(); }, 0x62c370);
    this.add([dim, shadow, card, icon, title, amount, hint, claim, double]);
    this.setDepth(1000);
    this.setScale(0.9);
    this.alpha = 0;
    scene.add.existing(this);
    scene.tweens.add({ targets: this, scale: 1, alpha: 1, duration: 210, ease: 'Back.Out' });
    scene.tweens.add({ targets: icon, y: -140, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }
}
