import Phaser from 'phaser';
import { gameConfig } from '../config/gameConfig';
import { Button } from './Button';

export class RewardPopup extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, title: string, message: string, onClose: () => void) {
    super(scene, gameConfig.width / 2, gameConfig.height / 2);

    const dim = scene.add.rectangle(0, 0, gameConfig.width, gameConfig.height, 0x2f1d13, 0.36).setInteractive();
    const shadow = scene.add.graphics();
    shadow.fillStyle(0x8a5a34, 0.22).fillRoundedRect(-270, -124, 540, 292, 34);

    const card = scene.add.graphics();
    card.fillStyle(0xfff3d8, 1).fillRoundedRect(-275, -145, 550, 290, 34);
    card.fillStyle(0xffffff, 0.36).fillRoundedRect(-250, -125, 500, 78, 28);
    card.lineStyle(5, 0xffd15c, 1).strokeRoundedRect(-275, -145, 550, 290, 34);
    card.lineStyle(2, 0xd9914b, 0.45).strokeRoundedRect(-260, -130, 520, 260, 28);

    const shine = scene.add.text(0, -104, '✦', { fontSize: '44px', color: gameConfig.colors.gold }).setOrigin(0.5);
    const titleText = scene.add.text(0, -58, title, {
      fontSize: '32px',
      color: gameConfig.colors.text,
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: 460 }
    }).setOrigin(0.5);
    const messageText = scene.add.text(0, 5, message, {
      fontSize: '25px',
      color: gameConfig.colors.brown,
      align: 'center',
      wordWrap: { width: 470 }
    }).setOrigin(0.5);
    const ok = new Button(scene, 0, 94, 210, 64, 'OK', () => { this.destroy(); onClose(); }, 0xffd15c);

    this.add([dim, shadow, card, shine, titleText, messageText, ok]);
    this.setDepth(1000);
    this.setScale(0.88);
    this.alpha = 0;
    scene.add.existing(this);
    scene.tweens.add({ targets: this, scale: 1, alpha: 1, duration: 190, ease: 'Back.Out' });
    scene.tweens.add({ targets: shine, angle: 12, scale: 1.12, yoyo: true, repeat: -1, duration: 760, ease: 'Sine.easeInOut' });
  }
}
