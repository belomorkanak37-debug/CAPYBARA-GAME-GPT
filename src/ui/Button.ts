import Phaser from 'phaser';
import { gameConfig } from '../config/gameConfig';
import { audio } from '../systems/AudioSystem';

export class Button extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Rectangle;
  private label: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, text: string, onClick: () => void, color = Phaser.Display.Color.HexStringToColor(gameConfig.colors.green).color) {
    super(scene, x, y);
    this.bg = scene.add.rectangle(0, 0, width, height, color, 1).setStrokeStyle(4, 0xffffff, 0.7);
    this.bg.setInteractive({ useHandCursor: true });
    this.label = scene.add.text(0, 0, text, { fontFamily: 'Arial', fontSize: `${Math.max(18, Math.floor(height * 0.34))}px`, color: gameConfig.colors.text, align: 'center', wordWrap: { width: width - 18 } }).setOrigin(0.5);
    this.add([this.bg, this.label]);
    this.setSize(width, height);
    this.bg.on('pointerdown', () => { audio.play('click'); scene.tweens.add({ targets: this, scale: 0.94, duration: 70, yoyo: true }); onClick(); });
    scene.add.existing(this);
  }

  setText(text: string): this { this.label.setText(text); return this; }
  setEnabled(enabled: boolean): this { this.bg.disableInteractive(); if (enabled) this.bg.setInteractive({ useHandCursor: true }); this.alpha = enabled ? 1 : 0.55; return this; }
}
