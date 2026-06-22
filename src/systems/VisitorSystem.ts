import Phaser from 'phaser';

export interface VisitorView {
  container: Phaser.GameObjects.Container;
  body: Phaser.GameObjects.Ellipse;
  mood: Phaser.GameObjects.Text;
}

export class VisitorSystem {
  private pool: VisitorView[] = [];
  private active = new Set<VisitorView>();

  constructor(private readonly scene?: Phaser.Scene, poolSize = 12) {
    if (!scene) return;
    for (let i = 0; i < poolSize; i += 1) this.pool.push(this.createVisitor());
  }

  spawn(x: number, y: number, mood = '☕'): VisitorView | null {
    const visitor = this.pool.find(item => !this.active.has(item));
    if (!visitor) return null;
    this.active.add(visitor);
    visitor.container.setPosition(x, y).setVisible(true).setActive(true).setAlpha(1).setScale(1);
    visitor.mood.setText(mood);
    return visitor;
  }

  release(visitor: VisitorView): void {
    this.active.delete(visitor);
    visitor.container.setVisible(false).setActive(false).setPosition(-500, -500);
  }

  update(_scene: Phaser.Scene, _time: number, _onServed: () => void): void {}

  clear(): void {
    for (const visitor of [...this.active]) this.release(visitor);
  }

  destroy(): void {
    this.pool.forEach(visitor => visitor.container.destroy(true));
    this.pool = [];
    this.active.clear();
  }

  private createVisitor(): VisitorView {
    const container = this.scene!.add.container(-500, -500).setVisible(false).setActive(false);
    const shadow = this.scene!.add.ellipse(3, 24, 58, 18, 0x8a5a34, 0.18);
    const body = this.scene!.add.ellipse(0, 0, 58, 76, 0xb87845, 1).setStrokeStyle(3, 0x8a5a34, 0.45);
    const eyeA = this.scene!.add.circle(-12, -10, 3, 0x2f1d13, 1);
    const eyeB = this.scene!.add.circle(12, -10, 3, 0x2f1d13, 1);
    const mood = this.scene!.add.text(0, -50, '☕', { fontSize: '18px' }).setOrigin(0.5);
    container.add([shadow, body, eyeA, eyeB, mood]);
    return { container, body, mood };
  }
}

export const visitorSystem = new VisitorSystem();
