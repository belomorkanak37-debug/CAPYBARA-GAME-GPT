import Phaser from 'phaser';
import { gameConfig } from '../config/gameConfig';

export class ProgressBar extends Phaser.GameObjects.Container {
  private fill: Phaser.GameObjects.Rectangle;
  private widthValue: number;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
    super(scene, x, y);
    this.widthValue = width;
    const bg = scene.add.rectangle(0, 0, width, height, 0xffffff, 0.45).setOrigin(0, 0.5);
    this.fill = scene.add.rectangle(0, 0, 0, height, Phaser.Display.Color.HexStringToColor(gameConfig.colors.green).color, 1).setOrigin(0, 0.5);
    this.add([bg, this.fill]);
    scene.add.existing(this);
  }

  setValue(value: number): void { this.fill.width = Phaser.Math.Clamp(value, 0, 1) * this.widthValue; }
}
