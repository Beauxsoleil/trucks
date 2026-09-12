// Audio is local to the app. A blocked/unsupported audio API never blocks play.
export class SmashAudio {
  private context?: AudioContext;
  private buffers = new Map<string, AudioBuffer>();
  private active = new Set<AudioBufferSourceNode>();
  private closed = false;

  unlock() {
    try {
      if (this.closed) return;
      this.context ??= new AudioContext();
      void this.context.resume().catch(() => {});
      for (const name of ["rev", "engine", "crash"]) {
        if (this.buffers.has(name)) continue;
        void fetch(`/assets/sounds/${name}.mp3`)
          .then((r) => { if (!r.ok) throw new Error("Audio unavailable"); return r.arrayBuffer(); })
          .then((data) => this.context!.decodeAudioData(data))
          .then((buffer) => { if (!this.closed) this.buffers.set(name, buffer); })
          .catch(() => {});
      }
    } catch { /* Visual play works without audio. */ }
  }

  play(name: string, volume = 0.4) {
    try {
      const buffer = this.buffers.get(name);
      if (!this.context || this.closed) return;
      if (!buffer) return this.fallback(name, volume);
      const source = this.context.createBufferSource();
      const gain = this.context.createGain();
      source.buffer = buffer;
      gain.gain.value = volume;
      source.connect(gain).connect(this.context.destination);
      this.active.add(source);
      source.onended = () => { this.active.delete(source); source.disconnect(); gain.disconnect(); };
      source.start();
    } catch { /* A missing sound is never a failed turn. */ }
  }

  private fallback(name: string, volume: number) {
    // Quiet synthesized cue covers the first tap while the CC0 clips load.
    const ctx = this.context!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(name === "crash" ? 160 : 70, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(name === "crash" ? 45 : 160, ctx.currentTime + 0.25);
    gain.gain.setValueAtTime(volume * 0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(gain).connect(ctx.destination);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); };
    osc.start(); osc.stop(ctx.currentTime + 0.3);
  }

  stop() {
    for (const source of this.active) { try { source.stop(); } catch {} }
    this.active.clear();
  }
  dispose() {
    this.closed = true;
    this.stop();
    if (this.context) void this.context.close().catch(() => {});
  }
}
