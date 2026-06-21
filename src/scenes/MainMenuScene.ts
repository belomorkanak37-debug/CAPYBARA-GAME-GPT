import Phaser from 'phaser';
import { gameConfig } from '../config/gameConfig';
import { i18n } from '../systems/LocalizationSystem';
import { Button } from '../ui/Button';

export class MainMenuScene extends Phaser.Scene {
  constructor() { super('MainMenuScene'); }

  create(): void {
    const startGame = () => {
      try {
        this.scene.start('GameScene');
      } catch (error) {
        console.error('Failed to start game scene', error);
        this.add.text(gameConfig.width / 2, 790, 'Start error. Open console.', { fontSize: '24px', color: '#E46C6C' }).setOrigin(0.5);
      }
    };

    this.add.rectangle(0, 0, gameConfig.width, gameConfig.height, Phaser.Display.Color.HexStringToColor(gameConfig.colors.background).color).setOrigin(0);
    this.add.text(gameConfig.width / 2, 230, 'CAPI CAFE', { fontSize: '60px', color: gameConfig.colors.text, fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(gameConfig.width / 2, 330, i18n.t('title'), { fontSize: '48px', color: gameConfig.colors.text, fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(gameConfig.width / 2, 410, i18n.t('subtitle'), { fontSize: '34px', color: gameConfig.colors.caramel, fontStyle: 'bold' }).setOrigin(0.5);

    const playButton = new Button(this, gameConfig.width / 2, 650, 430, 108, i18n.t('play'), startGame);
    playButton.setDepth(10);
    this.input.keyboard?.once('keydown-ENTER', startGame);
  }
}
