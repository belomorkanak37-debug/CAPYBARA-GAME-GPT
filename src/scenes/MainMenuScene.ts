import Phaser from 'phaser';
import { gameConfig } from '../config/gameConfig';
import { i18n } from '../systems/LocalizationSystem';
import { Button } from '../ui/Button';

export class MainMenuScene extends Phaser.Scene {
  constructor() { super('MainMenuScene'); }

  create(): void {
    const startGame = () => {
      try { this.scene.start('GameScene'); }
      catch (error) {
        console.error('Failed to start game scene', error);
        this.add.text(gameConfig.width / 2, 790, 'Start error. Open console.', { fontSize: '24px', color: '#E46C6C' }).setOrigin(0.5);
      }
    };

    this.drawBackground();
    this.drawCafeWindow();
    this.drawLogoSign();
    const hero = this.drawHeroCapybara();
    this.tweens.add({ targets: hero, y: hero.y - 10, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    this.add.text(gameConfig.width / 2, 740, i18n.t('subtitle'), { fontSize: '25px', color: gameConfig.colors.brown, align: 'center', wordWrap: { width: 560 }, fontStyle: 'bold' }).setOrigin(0.5).setDepth(6);
    const playButton = new Button(this, gameConfig.width / 2, 840, 470, 100, i18n.t('play'), startGame, 0x78af22);
    playButton.setDepth(10);
    this.tweens.add({ targets: playButton, scale: 1.035, duration: 950, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.drawFeatureCards();
    this.input.keyboard?.once('keydown-ENTER', startGame);
  }

  private drawBackground(): void {
    this.add.rectangle(0, 0, gameConfig.width, gameConfig.height, Phaser.Display.Color.HexStringToColor(gameConfig.colors.background).color).setOrigin(0);
    const g = this.add.graphics();
    g.fillStyle(0xfff7df, 0.9).fillRoundedRect(22, 22, 676, 1236, 34);
    g.lineStyle(4, 0xd8b17a, 0.72).strokeRoundedRect(22, 22, 676, 1236, 34);
    g.fillStyle(0x94c9ad, 0.22).fillCircle(76, 118, 110);
    g.fillStyle(0xffc83d, 0.16).fillCircle(640, 250, 160);
    g.fillStyle(0x8b512a, 0.1).fillCircle(106, 1120, 145);
  }

  private drawLogoSign(): void {
    const g = this.add.graphics().setDepth(6);
    g.fillStyle(0x3c2114, 0.25).fillRoundedRect(92, 58, 536, 180, 30);
    g.fillStyle(0x7a4524, 1).fillRoundedRect(82, 44, 556, 182, 30);
    g.fillStyle(0xa65d2b, 1).fillRoundedRect(96, 58, 528, 150, 24);
    g.lineStyle(5, 0x3c2114, 0.55).strokeRoundedRect(82, 44, 556, 182, 30);
    this.add.text(360, 118, 'CAPI CAFE', { fontSize: '56px', color: '#FFF7DF', fontStyle: 'bold', stroke: '#3C2114', strokeThickness: 8 }).setOrigin(0.5).setDepth(7);
    this.add.text(360, 184, 'MERGE TYCOON', { fontSize: '24px', color: '#FFC83D', fontStyle: 'bold', stroke: '#3C2114', strokeThickness: 4 }).setOrigin(0.5).setDepth(7);
  }

  private drawCafeWindow(): void {
    const g = this.add.graphics().setDepth(2);
    g.fillStyle(0x3c2114, 0.22).fillRoundedRect(54, 286, 612, 390, 40);
    g.fillStyle(0x6b3b1e, 1).fillRoundedRect(48, 270, 624, 392, 40);
    g.fillStyle(0x8b512a, 1).fillRoundedRect(64, 286, 592, 352, 30);
    g.fillStyle(0xfff7df, 0.18).fillRoundedRect(88, 306, 544, 110, 24);
    g.fillStyle(0x3c2114, 0.22).fillRoundedRect(94, 438, 532, 146, 24);
    g.fillStyle(0xc98b4a, 1).fillRoundedRect(90, 590, 540, 46, 18);
    g.lineStyle(5, 0x3c2114, 0.45).strokeRoundedRect(48, 270, 624, 392, 40);
    this.add.text(150, 470, 'Capi\nCafe', { fontSize: '30px', color: '#FFF7DF', fontStyle: 'bold', align: 'center', stroke: '#3C2114', strokeThickness: 5 }).setOrigin(0.5).setDepth(3);
  }

  private drawHeroCapybara(): Phaser.GameObjects.Container {
    const hero = this.add.container(gameConfig.width / 2, 560).setDepth(5);
    const body = this.add.ellipse(0, 0, 230, 176, 0xb87845, 1).setStrokeStyle(6, 0x6b3b1e, 0.55);
    const belly = this.add.ellipse(20, 26, 130, 86, 0xe4b777, 1);
    const apron = this.add.rectangle(4, 18, 92, 94, 0x47780f, 0.88).setStrokeStyle(4, 0x2f4e12, 0.45);
    const head = this.add.ellipse(-28, -82, 166, 126, 0xb87845, 1).setStrokeStyle(6, 0x6b3b1e, 0.55);
    const earA = this.add.circle(-92, -142, 27, 0x8b512a, 1);
    const earB = this.add.circle(38, -146, 27, 0x8b512a, 1);
    const eyeA = this.add.circle(-72, -94, 8, 0x2f1d13, 1);
    const eyeB = this.add.circle(14, -96, 8, 0x2f1d13, 1);
    const nose = this.add.ellipse(-28, -62, 46, 26, 0x2f1d13, 1);
    const cup = this.add.container(112, -18);
    cup.add([this.add.rectangle(0, 0, 58, 70, 0xfff7df, 1).setStrokeStyle(4, 0x6b3b1e, 1), this.add.ellipse(0, -35, 58, 18, 0x5b3926, 0.85)]);
    const hat = this.add.graphics();
    hat.fillStyle(0xfff7df, 1).fillRoundedRect(-96, -182, 132, 34, 14);
    hat.fillStyle(0xfff7df, 1).fillEllipse(-30, -185, 118, 48);
    hat.lineStyle(3, 0x6b3b1e, 0.5).strokeRoundedRect(-96, -182, 132, 34, 14);
    hero.add([body, belly, apron, head, earA, earB, eyeA, eyeB, nose, cup, hat]);
    return hero;
  }

  private drawFeatureCards(): void {
    const items = [['MERGE', 'combine items'], ['SERVE', 'serve guests'], ['GROW', 'unlock zones']];
    items.forEach((item, index) => {
      const x = 140 + index * 220;
      const g = this.add.graphics().setDepth(4);
      g.fillStyle(0x3c2114, 0.1).fillRoundedRect(x - 92, 972, 184, 116, 24);
      g.fillStyle(0xfff7df, 0.94).fillRoundedRect(x - 96, 962, 192, 116, 24);
      g.lineStyle(3, 0xd8b17a, 0.68).strokeRoundedRect(x - 96, 962, 192, 116, 24);
      this.add.text(x, 1010, item[0], { fontSize: '22px', color: gameConfig.colors.text, fontStyle: 'bold' }).setOrigin(0.5).setDepth(5);
      this.add.text(x, 1050, item[1], { fontSize: '15px', color: gameConfig.colors.mutedText, align: 'center', wordWrap: { width: 150 } }).setOrigin(0.5).setDepth(5);
    });
  }
}
