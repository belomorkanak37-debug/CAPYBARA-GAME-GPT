export class SaveScheduler {
  private timer: number | null = null;
  private active = false;
  private dirty = false;

  constructor(private readonly runSave: () => Promise<void>, private readonly delayMs = 1200) {}

  markDirty(): void {
    this.dirty = true;
    if (this.timer !== null) window.clearTimeout(this.timer);
    this.timer = window.setTimeout(() => void this.flush(), this.delayMs);
  }

  async flush(): Promise<void> {
    if (this.timer !== null) {
      window.clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.active) return;
    this.dirty = false;
    this.active = true;
    try {
      await this.runSave();
    } finally {
      this.active = false;
      if (this.dirty) this.markDirty();
    }
  }

  dispose(): void {
    if (this.timer !== null) window.clearTimeout(this.timer);
    this.timer = null;
    this.dirty = false;
  }
}
