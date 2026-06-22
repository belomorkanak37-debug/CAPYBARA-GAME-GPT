import Phaser from 'phaser';
import { gameConfig } from '../config/gameConfig';

export class CoinCounter extends Phaser.GameObjects.Container {
  private readonly label: Phaser.GameObjects.Text;
  private lastValue = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, icon: string, value: number) {
    super(scene, x, y);
    const shadow = scene.add.graphics();
    shadow.fillStyle(0x8a5a34, 0.18).fillRoundedRect(-94, -25, 188, 58, 22);

    const bg = scene.add.graphics();
    bg.fillStyle(0xfffdf6, 0.94).fillRoundedRect(-96, -30, 192, 58, 22);
    bg.lineStyle(2, 0xd9914b, 0.7).strokeRoundedRect(-96, -30, 192, 58, 22);
    bg.fillStyle(0xffffff, 0.45).fillRoundedRect(-84, -22, 168, 19, 14);

    const iconBg = scene.add.circle(-68, -1, 23, 0xffd15c, 1).setStrokeStyle(3, 0xffffff, 0.8);
    const emoji = scene.add.text(-68, -2, icon, { fontSize: '25px' }).setOrigin(0.5);
    this.label = scene.add.text(-36, -1, this.format(value), {
      fontFamily: 'Arial, sans-serif',
      fontSize: '23px',
      color: gameConfig.colors.text,
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);

    this.add([shadow, bg, iconBg, emoji, this.label]);
    this.lastValue = value;
    scene.add.existing(this);
  }

  setValue(value: number): void {
    if (Math.floor(value) === Math.floor(this.lastValue)) return;
    this.label.setText(this.format(value));
    if (value > this.lastValue) {
      this.scene.tweens.add({ targets: this, scale: 1.06, duration: 90, yoyo: true, ease: 'Sine.easeOut' });
    }
    this.lastValue = value;
  }

  private format(value: number): string {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 10000) return `${Math.floor(value / 1000)}K`;
    return String(Math.floor(value));
  }
}
