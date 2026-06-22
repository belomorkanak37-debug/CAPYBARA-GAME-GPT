import Phaser from 'phaser';
import { gameConfig } from '../config/gameConfig';
import { audio } from './AudioSystem';

export class FxPool {
  private coinTexts: Phaser.GameObjects.Text[] = [];
  private dots: Phaser.GameObjects.Arc[] = [];
  private readonly colors = [0xffd15c, 0x9ee6c5, 0xffffff, 0xf7a35c];

  constructor(private readonly scene: Phaser.Scene, coinPoolSize = 12, dotPoolSize = 56) {
    for (let i = 0; i < coinPoolSize; i += 1) {
      const text = scene.add.text(-500, -500, '', {
        fontSize: '31px',
        color: gameConfig.colors.text,
        fontStyle: 'bold',
        stroke: gameConfig.colors.white,
        strokeThickness: 5
      }).setOrigin(0.5).setDepth(100).setVisible(false).setActive(false);
      this.coinTexts.push(text);
    }
    for (let i = 0; i < dotPoolSize; i += 1) {
      const dot = scene.add.circle(-500, -500, 5, 0xffffff, 1).setDepth(200).setVisible(false).setActive(false);
      this.dots.push(dot);
    }
  }

  flyCoins(x: number, y: number, amount: number): void {
    const text = this.takeText();
    text.setText(`+${amount}`).setPosition(x, y).setAlpha(1).setScale(1).setVisible(true).setActive(true);
    this.scene.tweens.killTweensOf(text);
    this.scene.tweens.add({ targets: text, y: 105, scale: 1.2, alpha: 0, duration: 850, ease: 'Cubic.easeOut', onComplete: () => this.releaseText(text) });
    audio.play('coin');
  }

  burst(x: number, y: number, count = 14): void {
    this.takeDots(count).forEach(dot => {
      const color = this.colors[Phaser.Math.Between(0, this.colors.length - 1)] ?? 0xffffff;
      dot.setPosition(x, y).setRadius(Phaser.Math.Between(4, 8)).setFillStyle(color, 1).setAlpha(1).setScale(1).setVisible(true).setActive(true);
      this.scene.tweens.killTweensOf(dot);
      this.scene.tweens.add({ targets: dot, x: x + Phaser.Math.Between(-110, 110), y: y + Phaser.Math.Between(-90, 80), alpha: 0, scale: 0.2, duration: 680, ease: 'Cubic.easeOut', onComplete: () => this.releaseDot(dot) });
    });
  }

  destroy(): void {
    [...this.coinTexts, ...this.dots].forEach(item => item.destroy());
    this.coinTexts = [];
    this.dots = [];
  }

  private takeText(): Phaser.GameObjects.Text { return this.coinTexts.find(item => !item.active) ?? this.coinTexts[0]; }
  private releaseText(text: Phaser.GameObjects.Text): void { text.setVisible(false).setActive(false).setPosition(-500, -500); }
  private takeDots(count: number): Phaser.GameObjects.Arc[] { const free = this.dots.filter(item => !item.active); const pool = free.length > 0 ? free : this.dots; return pool.slice(0, Math.min(count, pool.length)); }
  private releaseDot(dot: Phaser.GameObjects.Arc): void { dot.setVisible(false).setActive(false).setPosition(-500, -500); }
}
