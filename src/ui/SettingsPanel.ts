import Phaser from 'phaser';
import { gameConfig } from '../config/gameConfig';
import { i18n } from '../systems/LocalizationSystem';
import type { SaveData } from '../types';
import { Button } from './Button';

export class SettingsPanel extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, data: SaveData, onToggleMusic: () => void, onToggleSfx: () => void, onLanguage: () => void, onLogin: () => void, onClose: () => void) {
    super(scene, gameConfig.width / 2, gameConfig.height / 2);
    const dim = scene.add.rectangle(0, 0, gameConfig.width, gameConfig.height, 0x2f1d13, 0.34).setInteractive();
    const shadow = scene.add.graphics();
    shadow.fillStyle(0x8a5a34, 0.24).fillRoundedRect(-288, -208, 576, 456, 36);
    const card = scene.add.graphics();
    card.fillStyle(0xfff3d8, 1).fillRoundedRect(-295, -235, 590, 470, 36);
    card.fillStyle(0xffffff, 0.36).fillRoundedRect(-266, -214, 532, 76, 28);
    card.lineStyle(5, 0xd9914b, 1).strokeRoundedRect(-295, -235, 590, 470, 36);
    const title = scene.add.text(0, -180, i18n.t('settings'), { fontSize: '36px', color: gameConfig.colors.text, fontStyle: 'bold' }).setOrigin(0.5);
    const music = new Button(scene, 0, -82, 430, 62, `${i18n.t('music')}: ${data.sound.music ? 'ON' : 'OFF'}`, onToggleMusic, data.sound.music ? 0x9ee6c5 : 0xb6afa4);
    const sfx = new Button(scene, 0, -8, 430, 62, `${i18n.t('sfx')}: ${data.sound.sfx ? 'ON' : 'OFF'}`, onToggleSfx, data.sound.sfx ? 0x9ee6c5 : 0xb6afa4);
    const language = new Button(scene, 0, 66, 430, 62, `${i18n.t('language')}: ${data.language.toUpperCase()}`, onLanguage, 0xffd15c);
    const account = new Button(scene, 0, 140, 430, 62, i18n.t('login'), onLogin, 0x62c370);
    const close = new Button(scene, 0, 214, 230, 60, i18n.t('close'), () => { this.destroy(); onClose(); }, 0xf7a35c);
    this.add([dim, shadow, card, title, music, sfx, language, account, close]);
    this.setDepth(1000);
    this.setScale(0.9);
    this.alpha = 0;
    scene.add.existing(this);
    scene.tweens.add({ targets: this, scale: 1, alpha: 1, duration: 190, ease: 'Back.Out' });
  }
}
