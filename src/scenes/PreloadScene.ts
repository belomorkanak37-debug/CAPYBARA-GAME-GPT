import Phaser from 'phaser';
import { yandexSDK } from '../systems/YandexSDK';

export class PreloadScene extends Phaser.Scene {
  constructor() { super('PreloadScene'); }
  create(): void {
    const g = this.add.graphics();
    g.fillStyle(0x9ee6c5, 1);
    g.fillRoundedRect(0, 0, 92, 92, 24);
    g.generateTexture('slot', 92, 92);
    g.destroy();
    yandexSDK.ready();
    document.getElementById('loading-screen')?.remove();
    this.scene.start('MainMenuScene');
  }
}
