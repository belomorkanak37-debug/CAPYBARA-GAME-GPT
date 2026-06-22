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

    this.drawBackground();
    this.drawCafeWindow();
    const hero = this.drawHeroCapybara();
    this.tweens.add({ targets: hero, y: hero.y - 14, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    const badge = this.add.text(gameConfig.width / 2, 128, 'MERGE IDLE TYCOON', {
      fontSize: '19px',
      color: gameConfig.colors.white,
      backgroundColor: gameConfig.colors.brown,
      padding: { x: 18, y: 8 },
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(5);
    badge.setAlpha(0.92);

    this.add.text(gameConfig.width / 2, 238, 'CAPI CAFE', {
      fontSize: '66px',
      color: gameConfig.colors.text,
      fontStyle: 'bold',
      stroke: gameConfig.colors.white,
      strokeThickness: 8
    }).setOrigin(0.5).setDepth(5);

    this.add.text(gameConfig.width / 2, 315, i18n.t('subtitle'), {
      fontSize: '34px',
      color: gameConfig.colors.caramel,
      fontStyle: 'bold',
      stroke: gameConfig.colors.white,
      strokeThickness: 5
    }).setOrigin(0.5).setDepth(5);

    const hint = i18n.getLanguage() === 'ru' ? 'Объединяй капибар, открывай зоны и развивай уютное кафе' : 'Merge capybaras, unlock zones and grow a cozy cafe';
    this.add.text(gameConfig.width / 2, 750, hint, {
      fontSize: '24px',
      color: gameConfig.colors.brown,
      align: 'center',
      wordWrap: { width: 560 },
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(5);

    const playButton = new Button(this, gameConfig.width / 2, 895, 450, 104, i18n.t('play'), startGame, 0x62c370);
    playButton.setDepth(10);
    this.tweens.add({ targets: playButton, scale: 1.035, duration: 950, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    const footer = i18n.getLanguage() === 'ru' ? 'Работает без входа. Прогресс сохраняется автоматически.' : 'Works without login. Progress autosaves.';
    this.add.text(gameConfig.width / 2, 1018, footer, {
      fontSize: '20px',
      color: gameConfig.colors.text,
      align: 'center',
      wordWrap: { width: 560 }
    }).setOrigin(0.5).setAlpha(0.82);

    this.input.keyboard?.once('keydown-ENTER', startGame);
  }

  private drawBackground(): void {
    this.add.rectangle(0, 0, gameConfig.width, gameConfig.height, Phaser.Display.Color.HexStringToColor(gameConfig.colors.background).color).setOrigin(0);
    const g = this.add.graphics();
    g.fillStyle(0xfff3d8, 0.9).fillCircle(86, 132, 120);
    g.fillStyle(0xffffff, 0.38).fillCircle(640, 210, 150);
    g.fillStyle(0xffd15c, 0.28).fillCircle(570, 1030, 180);
    g.fillStyle(0x9ee6c5, 0.26).fillCircle(118, 1020, 140);

    for (let i = 0; i < 18; i += 1) {
      const dot = this.add.circle(Phaser.Math.Between(30, 690), Phaser.Math.Between(80, 1180), Phaser.Math.Between(3, 8), 0xffffff, 0.24);
      this.tweens.add({ targets: dot, alpha: 0.55, duration: Phaser.Math.Between(900, 1900), yoyo: true, repeat: -1 });
    }
  }

  private drawCafeWindow(): void {
    const g = this.add.graphics();
    g.fillStyle(0x8a5a34, 0.18).fillRoundedRect(88, 378, 544, 316, 44);
    g.fillStyle(0xfffdf6, 0.92).fillRoundedRect(76, 356, 568, 326, 44);
    g.lineStyle(8, 0xd9914b, 0.95).strokeRoundedRect(76, 356, 568, 326, 44);
    g.fillStyle(0x9ee6c5, 0.55).fillRoundedRect(116, 392, 208, 168, 26);
    g.fillStyle(0x9ee6c5, 0.55).fillRoundedRect(396, 392, 208, 168, 26);
    g.fillStyle(0xd9914b, 1).fillRoundedRect(106, 588, 508, 52, 20);
    g.fillStyle(0x5b3926, 0.16).fillEllipse(360, 675, 360, 40);
  }

  private drawHeroCapybara(): Phaser.GameObjects.Container {
    const hero = this.add.container(gameConfig.width / 2, 590).setDepth(4);
    const body = this.add.ellipse(0, 0, 240, 190, 0xb87845, 1).setStrokeStyle(6, 0x8a5a34, 0.5);
    const belly = this.add.ellipse(20, 28, 135, 92, 0xe3b476, 1);
    const head = this.add.ellipse(-28, -82, 170, 130, 0xb87845, 1).setStrokeStyle(6, 0x8a5a34, 0.5);
    const earA = this.add.circle(-92, -142, 28, 0x8a5a34, 1);
    const earB = this.add.circle(38, -146, 28, 0x8a5a34, 1);
    const eyeA = this.add.circle(-72, -94, 8, 0x2f1d13, 1);
    const eyeB = this.add.circle(14, -96, 8, 0x2f1d13, 1);
    const nose = this.add.ellipse(-28, -62, 46, 26, 0x2f1d13, 1);
    const cup = this.add.container(108, -16);
    cup.add([
      this.add.rectangle(0, 0, 58, 70, 0xfffdf6, 1).setStrokeStyle(4, 0xd9914b, 1),
      this.add.ellipse(0, -35, 58, 18, 0x5b3926, 0.75),
      this.add.text(0, 4, '☕', { fontSize: '28px' }).setOrigin(0.5)
    ]);
    const hat = this.add.graphics();
    hat.fillStyle(0xfffdf6, 1).fillRoundedRect(-96, -182, 132, 34, 14);
    hat.fillStyle(0xfffdf6, 1).fillEllipse(-30, -185, 118, 48);
    hat.lineStyle(3, 0xd9914b, 0.5).strokeRoundedRect(-96, -182, 132, 34, 14);
    hero.add([body, belly, head, earA, earB, eyeA, eyeB, nose, cup, hat]);
    return hero;
  }
}
