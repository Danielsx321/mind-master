/** Every timer in a screen goes through one of these, so leaving the screen cancels all of them at once. */
export class Timers {
  private timeouts = new Set<number>();
  private intervals = new Set<number>();
  private frames = new Set<number>();

  after(ms: number, fn: () => void): number {
    const id = window.setTimeout(() => {
      this.timeouts.delete(id);
      fn();
    }, ms);
    this.timeouts.add(id);
    return id;
  }

  every(ms: number, fn: () => void): number {
    const id = window.setInterval(fn, ms);
    this.intervals.add(id);
    return id;
  }

  frame(fn: () => void): number {
    const id = requestAnimationFrame(() => {
      this.frames.delete(id);
      fn();
    });
    this.frames.add(id);
    return id;
  }

  cancel(id: number): void {
    clearTimeout(id);
    clearInterval(id);
    cancelAnimationFrame(id);
    this.timeouts.delete(id);
    this.intervals.delete(id);
    this.frames.delete(id);
  }

  clear(): void {
    this.timeouts.forEach((id) => clearTimeout(id));
    this.intervals.forEach((id) => clearInterval(id));
    this.frames.forEach((id) => cancelAnimationFrame(id));
    this.timeouts.clear();
    this.intervals.clear();
    this.frames.clear();
  }
}
