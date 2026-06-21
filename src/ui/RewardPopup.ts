import Phaser from 'phaser';
import { gameConfig } from '../config/gameConfig';

export class RewardPopup extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, title: string, message: string, onClose: () => void) {
    super(scene, gameConfig.width / 2, gameConfig.height / 2);
    this.add(scene.add.rectangle(0, 0, 520, 260, 0xfff3d8, 1).setStrokeStyle(4, 0xd9914b, 1));
    this.add(scene.add.text(0, -60, title, { fontSize: '30px', color: '#5B3926' }).setOrigin(0.5));
    this.add(scene.add.text(0, 0, message, { fontSize: '24px', color: '#5B3926' }).setOrigin(0.5));
    const ok = scene.add.text(0, 80, 'OK', { fontSize: '28px', color: '#5B3926', backgroundColor: '#62C370', padding: { x: 24, y: 12 } }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    ok.on('pointerdown', () => { this.destroy(); onClose(); });
    this.add(ok);
    this.setDepth(1000);
    scene.add.existing(this);
  }
}
