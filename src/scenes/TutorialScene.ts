import Phaser from 'phaser';
import { gameConfig } from '../config/gameConfig';
import { i18n } from '../systems/LocalizationSystem';
import { Button } from '../ui/Button';

export class TutorialScene extends Phaser.Scene {
  private step = 0;
  private text?: Phaser.GameObjects.Text;
  private pointer?: Phaser.GameObjects.Text;

  constructor() { super('TutorialScene'); }

  create(): void {
    this.add.rectangle(0, 0, gameConfig.width, gameConfig.height, 0x000000, 0.2).setInteractive();
    this.add.rectangle(360, 245, 620, 155, 0xfff3d8, 1).setStrokeStyle(5, 0xffd15c, 1);
    this.text = this.add.text(360, 222, '', { fontSize: '26px', color: gameConfig.colors.text, fontStyle: 'bold', align: 'center', wordWrap: { width: 550 } }).setOrigin(0.5);
    this.pointer = this.add.text(360, 390, 'v', { fontSize: '58px', color: gameConfig.colors.text }).setOrigin(0.5);
    new Button(this, 360, 316, 220, 58, i18n.t('tutorialNext'), () => this.next());
    this.tweens.add({ targets: this.pointer, y: 430, duration: 650, yoyo: true, repeat: -1 });
    this.showStep();
  }

  private next(): void {
    this.step += 1;
    if (this.step >= 6) {
      const gameScene = this.scene.get('GameScene') as unknown as { completeTutorial: () => void };
      gameScene.completeTutorial();
      this.scene.stop();
      return;
    }
    this.showStep();
  }

  private showStep(): void {
    this.text?.setText(i18n.t(`tutorial${this.step + 1}`));
    const targets = [{ x: 360, y: 360 }, { x: 238, y: 1010 }, { x: 170, y: 800 }, { x: 510, y: 1010 }, { x: 602, y: 1130 }, { x: 102, y: 1010 }];
    const target = targets[this.step];
    this.pointer?.setPosition(target.x, target.y);
  }
}
