import Phaser from 'phaser';
import { gameConfig } from '../config/gameConfig';
import { audio } from '../systems/AudioSystem';

export class Button extends Phaser.GameObjects.Container {
  private readonly shadow: Phaser.GameObjects.Graphics;
  private readonly bg: Phaser.GameObjects.Graphics;
  private readonly label: Phaser.GameObjects.Text;
  private enabled = true;
  private isPressed = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    private readonly buttonWidth: number,
    private readonly buttonHeight: number,
    text: string,
    private readonly onClick: () => void,
    private readonly baseColor = Phaser.Display.Color.HexStringToColor(gameConfig.colors.green).color
  ) {
    super(scene, x, y);
    this.shadow = scene.add.graphics();
    this.bg = scene.add.graphics();
    this.label = scene.add.text(0, -1, text, {
      fontFamily: 'Arial, sans-serif',
      fontSize: `${Math.max(17, Math.floor(buttonHeight * 0.32))}px`,
      color: gameConfig.colors.text,
      align: 'center',
      fontStyle: 'bold',
      wordWrap: { width: buttonWidth - 24 }
    }).setOrigin(0.5);

    this.add([this.shadow, this.bg, this.label]);
    this.setSize(buttonWidth, buttonHeight);
    this.redraw();

    const hitArea = new Phaser.Geom.Rectangle(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight);
    this.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
    this.on('pointerdown', () => this.press());
    this.on('pointerup', () => this.release(true));
    this.on('pointerout', () => this.release(false));
    this.on('pointerover', () => { if (this.enabled) this.setScale(1.02); });
    this.on('pointerout', () => { if (!this.isPressed) this.setScale(1); });
    scene.add.existing(this);
  }

  setText(text: string): this { this.label.setText(text); return this; }

  setEnabled(enabled: boolean): this {
    this.enabled = enabled;
    this.alpha = enabled ? 1 : 0.58;
    this.redraw();
    return this;
  }

  private press(): void {
    if (!this.enabled) return;
    this.isPressed = true;
    this.setScale(0.97);
    this.bg.y = 5;
    this.label.y = 4;
  }

  private release(trigger: boolean): void {
    if (!this.isPressed) return;
    this.isPressed = false;
    this.bg.y = 0;
    this.label.y = -1;
    this.setScale(1);
    if (!this.enabled || !trigger) return;
    audio.play('click');
    this.scene.tweens.add({ targets: this, scale: 1.04, duration: 80, yoyo: true, ease: 'Sine.easeOut' });
    this.onClick();
  }

  private redraw(): void {
    const radius = Math.min(26, Math.floor(this.buttonHeight * 0.34));
    const fill = this.enabled ? this.baseColor : 0xb6afa4;
    const halfW = this.buttonWidth / 2;
    const halfH = this.buttonHeight / 2;

    this.shadow.clear();
    this.shadow.fillStyle(0x8a5a34, 0.32);
    this.shadow.fillRoundedRect(-halfW, -halfH + 8, this.buttonWidth, this.buttonHeight, radius);

    this.bg.clear();
    this.bg.fillStyle(fill, 1);
    this.bg.fillRoundedRect(-halfW, -halfH, this.buttonWidth, this.buttonHeight, radius);
    this.bg.fillStyle(0xffffff, 0.22);
    this.bg.fillRoundedRect(-halfW + 8, -halfH + 7, this.buttonWidth - 16, Math.max(12, this.buttonHeight * 0.38), radius - 4);
    this.bg.lineStyle(3, 0xffffff, 0.72);
    this.bg.strokeRoundedRect(-halfW + 1.5, -halfH + 1.5, this.buttonWidth - 3, this.buttonHeight - 3, radius);
    this.bg.lineStyle(2, 0x8a5a34, 0.18);
    this.bg.strokeRoundedRect(-halfW + 3, -halfH + 3, this.buttonWidth - 6, this.buttonHeight - 6, radius - 2);
  }
}
