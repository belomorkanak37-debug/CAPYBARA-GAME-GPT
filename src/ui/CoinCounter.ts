import Phaser from 'phaser';
import { gameConfig } from '../config/gameConfig';

export class CoinCounter extends Phaser.GameObjects.Container {
  private readonly label: Phaser.GameObjects.Text;
  private lastValue = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, icon: string, value: number) {
    super(scene, x, y);
    const shadow = scene.add.graphics();
    shadow.fillStyle(0x3c2114, 0.28).fillRoundedRect(-90, -24, 180, 56, 20);

    const bg = scene.add.graphics();
    bg.fillStyle(0x4a2a18, 1).fillRoundedRect(-94, -31, 188, 58, 20);
    bg.fillStyle(0x8b512a, 1).fillRoundedRect(-88, -25, 176, 46, 16);
    bg.fillStyle(0xffffff, 0.16).fillRoundedRect(-78, -19, 156, 16, 10);
    bg.lineStyle(2, 0xfff7df, 0.34).strokeRoundedRect(-86, -23, 172, 42, 15);

    const iconBg = scene.add.circle(-62, -2, 22, 0xffc83d, 1).setStrokeStyle(3, 0x6b3b1e, 0.7);
    const iconText = this.iconText(icon);
    const emoji = scene.add.text(-62, -2, iconText, { fontSize: '19px', color: gameConfig.colors.darkBrown, fontStyle: 'bold' }).setOrigin(0.5);
    this.label = scene.add.text(-30, -2, this.format(value), {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      color: gameConfig.colors.cream,
      fontStyle: 'bold',
      stroke: gameConfig.colors.darkBrown,
      strokeThickness: 3
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

  private iconText(icon: string): string {
    if (icon.toLowerCase().includes('lvl')) return 'LV';
    if (icon.toLowerCase().includes('star')) return '*';
    if (icon.toLowerCase().includes('coin')) return '$';
    return icon;
  }

  private format(value: number): string {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 10000) return `${Math.floor(value / 1000)}K`;
    return String(Math.floor(value));
  }
}
