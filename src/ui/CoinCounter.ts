import Phaser from 'phaser';
import { gameConfig } from '../config/gameConfig';

export class CoinCounter extends Phaser.GameObjects.Container {
  private label: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, icon: string, value: number) {
    super(scene, x, y);
    const bg = scene.add.rectangle(0, 0, 190, 52, 0xffffff, 0.78).setStrokeStyle(2, 0xd9914b, 0.8);
    const emoji = scene.add.text(-76, 0, icon, { fontSize: '30px' }).setOrigin(0.5);
    this.label = scene.add.text(-45, 0, this.format(value), { fontFamily: 'Arial', fontSize: '24px', color: gameConfig.colors.text, fontStyle: 'bold' }).setOrigin(0, 0.5);
    this.add([bg, emoji, this.label]);
    scene.add.existing(this);
  }

  setValue(value: number): void { this.label.setText(this.format(value)); }
  private format(value: number): string { if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`; if (value >= 10000) return `${Math.floor(value / 1000)}K`; return String(Math.floor(value)); }
}
