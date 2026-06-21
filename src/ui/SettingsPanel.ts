import Phaser from 'phaser';
import { gameConfig } from '../config/gameConfig';
import type { SaveData } from '../types';

export class SettingsPanel extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, data: SaveData, onToggleMusic: () => void, onToggleSfx: () => void, onLanguage: () => void, onLogin: () => void, onClose: () => void) {
    super(scene, gameConfig.width / 2, gameConfig.height / 2);
    this.add(scene.add.rectangle(0, 0, 560, 430, 0xfff3d8, 1).setStrokeStyle(4, 0xd9914b, 1));
    const items = [
      ['Music ' + String(data.sound.music), onToggleMusic],
      ['Sfx ' + String(data.sound.sfx), onToggleSfx],
      ['Lang ' + data.language, onLanguage],
      ['Login', onLogin],
      ['Close', () => { this.destroy(); onClose(); }]
    ] as Array<[string, () => void]>;
    items.forEach(([label, action], index) => {
      const text = scene.add.text(0, -140 + index * 70, label, { fontSize: '28px', color: '#5B3926', backgroundColor: '#9EE6C5', padding: { x: 20, y: 10 } }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      text.on('pointerdown', action);
      this.add(text);
    });
    this.setDepth(1000);
    scene.add.existing(this);
  }
}
