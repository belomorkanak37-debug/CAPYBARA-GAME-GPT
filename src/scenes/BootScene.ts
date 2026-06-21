import Phaser from 'phaser';
import { i18n } from '../systems/LocalizationSystem';
import { yandexSDK } from '../systems/YandexSDK';

export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }
  create(): void {
    const language = i18n.setLanguage(yandexSDK.getLanguage());
    this.registry.set('language', language);
    this.scene.start('PreloadScene');
  }
}
