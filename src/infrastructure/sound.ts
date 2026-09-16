// Real-time reminder policy, deliberately independent of the cooking/demo clock.
export class ReminderWindow {
  private lastCue: number | null = null;
  constructor(private suppressed = false) {}
  due(now: number, visible: boolean, alert: boolean, enabled: boolean) {
    if (!visible || !alert || this.suppressed) return false;
    if (!enabled || (this.lastCue !== null && now - this.lastCue < 2000))
      return false;
    this.lastCue = now;
    return true;
  }
}
// Do not replay skipped seconds or compress ticks into a burst in demo mode.
export class CountdownTicks {
  private lastSecond: number | null = null;
  private lastCue = -Infinity;
  due(seconds: number, now: number, visible: boolean, enabled: boolean) {
    if (
      !visible ||
      !enabled ||
      seconds < 1 ||
      seconds > 10 ||
      seconds === this.lastSecond
    )
      return false;
    this.lastSecond = seconds;
    if (now - this.lastCue < 900) return false;
    this.lastCue = now;
    return true;
  }
}
export class CookSound {
  private context: AudioContext | null = null;
  private nodes = new Set<OscillatorNode>();
  private generation = 0;
  constructor(
    private unavailable: () => void,
    private create: () => AudioContext = () => new AudioContext(),
  ) {}
  async enable() {
    const generation = ++this.generation;
    try {
      this.context ??= this.create();
      await this.context.resume();
      if (generation !== this.generation) return;
      if (this.context.state !== 'running') throw new Error();
      this.play(false);
    } catch {
      if (generation === this.generation) this.unavailable();
    }
  }
  tick() {
    this.play(false, true);
  }
  play(alert = true, tick = false) {
    try {
      const context = this.context;
      if (!context || context.state !== 'running') throw new Error();
      if (this.nodes.size) return;
      (alert ? [880, 1100, 880] : [tick ? 1000 : 659.25]).forEach(
        (frequency, index) => {
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          const start = context.currentTime + index * 0.22;
          oscillator.type = 'sine';
          oscillator.frequency.value = frequency;
          gain.gain.setValueAtTime(0, start);
          gain.gain.linearRampToValueAtTime(0.07, start + 0.02);
          gain.gain.exponentialRampToValueAtTime(
            0.001,
            start + (tick ? 0.05 : 0.18),
          );
          oscillator.connect(gain);
          gain.connect(context.destination);
          this.nodes.add(oscillator);
          oscillator.onended = () => {
            this.nodes.delete(oscillator);
            oscillator.disconnect();
            gain.disconnect();
          };
          oscillator.start(start);
          oscillator.stop(start + (tick ? 0.07 : 0.2));
        },
      );
    } catch {
      this.unavailable();
    }
  }
  stop() {
    this.generation++;
    for (const node of this.nodes) {
      try {
        node.stop();
      } catch {
        /* Already ended. */
      }
    }
    this.nodes.clear();
  }
  close() {
    this.stop();
    void this.context?.close();
  }
}
