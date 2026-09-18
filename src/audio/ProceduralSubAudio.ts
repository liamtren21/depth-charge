/**
 * ProceduralSubAudio.ts
 * 100% Procedural Web Audio API sound engine for DEPTH CHARGE.
 * Generates authentic Cold War bathyscaphe & deep-sea acoustic effects without any audio files.
 */

class SubAudioEngine {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private isMuted: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(muted ? 0 : 0.12, this.ctx.currentTime);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Continuous deep ocean ambient rumble with subtle low-frequency drift
   */
  public startAmbient() {
    if (this.ambientGain || this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // Brown noise generator via script or multi-oscillator hum
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      this.ambientGain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(46, now); // deep 46 Hz submarine hull hum

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(32, now); // 32 Hz sub-audible pressure vibration

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(90, now);

      this.ambientGain.gain.setValueAtTime(0.12, now);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
    } catch (e) {
      console.warn('Audio ambient failed to start:', e);
    }
  }

  /**
   * Resonant Cold War Active Sonar Ping with underwater reverberation
   */
  public playSonarPing(intensity: number = 1.0) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Sonar carrier frequency: 1050 Hz with subtle downward pitch chirp
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1080, now);
      osc.frequency.exponentialRampToValueAtTime(1020, now + 0.18);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1050, now);
      filter.Q.setValueAtTime(8.0, now);

      // Sharp attack, long exponential decay (underwater resonance)
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.35 * intensity, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 1.85);

      // Create delayed echo blip (bouncing off ocean trench wall)
      const echoOsc = this.ctx.createOscillator();
      const echoGain = this.ctx.createGain();
      echoOsc.type = 'sine';
      echoOsc.frequency.setValueAtTime(1030, now + 0.42);
      echoGain.gain.setValueAtTime(0.001, now);
      echoGain.gain.setValueAtTime(0.10 * intensity, now + 0.42);
      echoGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

      echoOsc.connect(filter);
      echoOsc.start(now + 0.42);
      echoOsc.stop(now + 1.65);
    } catch (e) {
      console.warn('Audio ping failed:', e);
    }
  }

  /**
   * Hull Groan under extreme hydrostatic pressure (FM noise + low resonant bend)
   */
  public playHullGroan(depthSeverity: number = 0.5) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Metal plate screech/groan
      osc.type = 'sawtooth';
      const baseFreq = 80 + depthSeverity * 40;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.linearRampToValueAtTime(baseFreq * 0.75, now + 1.2);

      // Low frequency modulation for shuddering vibration
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(8 + depthSeverity * 12, now);
      lfoGain.gain.setValueAtTime(25, now);
      lfo.connect(osc.frequency);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(220, now);
      filter.Q.setValueAtTime(4.5, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.25 * (0.5 + depthSeverity * 0.5), now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      lfo.start(now);
      osc.start(now);
      lfo.stop(now + 1.45);
      osc.stop(now + 1.45);
    } catch (e) {
      console.warn('Hull groan audio failed:', e);
    }
  }

  /**
   * Dive Horn / Two-Tone Klaxon
   */
  public playDiveKlaxon() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const tones = [
        { freq: 440, start: 0.0, dur: 0.22 },
        { freq: 350, start: 0.25, dur: 0.35 },
      ];

      tones.forEach(t => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(t.freq, now + t.start);

        gain.gain.setValueAtTime(0.001, now + t.start);
        gain.gain.linearRampToValueAtTime(0.18, now + t.start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + t.start + t.dur);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + t.start);
        osc.stop(now + t.start + t.dur);
      });
    } catch (e) {
      console.warn('Dive klaxon failed:', e);
    }
  }

  /**
   * Ballast Tank Air / Seawater venting whoosh
   */
  public playBallastVent() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const bufferSize = this.ctx.sampleRate * 0.8;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      const now = this.ctx.currentTime;
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(200, now + 0.7);
      filter.Q.setValueAtTime(2.0, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.20, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.75);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 0.8);
    } catch (e) {
      console.warn('Ballast audio failed:', e);
    }
  }

  /**
   * Hull Breach / Violent Implosion Crunch
   */
  public playHullBreach() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // Sub-bass heavy transient
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(140, now);
      subOsc.frequency.exponentialRampToValueAtTime(25, now + 0.6);

      subGain.gain.setValueAtTime(0.6, now);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 0.95);

      // High-pressure glass shatter / metal crunch
      const bufferSize = this.ctx.sampleRate * 0.6;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.15));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.4, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

      noise.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noise.start(now);
      noise.stop(now + 0.65);
    } catch (e) {
      console.warn('Breach audio failed:', e);
    }
  }

  /**
   * Success Chime / Challenger Deep Cleared Jackpot
   */
  public playJackpotSurfaced() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const chords = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C Major arpeggio
      chords.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);

        gain.gain.setValueAtTime(0.001, now + idx * 0.1);
        gain.gain.linearRampToValueAtTime(0.22, now + idx * 0.1 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 1.2);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 1.25);
      });
    } catch (e) {
      console.warn('Jackpot audio failed:', e);
    }
  }

  /**
   * Discrete mechanical tick when adjusting telegraph or passing zones
   */
  public playMechanicalTick() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.025);

      gain.gain.setValueAtTime(0.20, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.03);
    } catch (e) {
      console.warn('Tick audio failed:', e);
    }
  }
}

export const subAudio = new SubAudioEngine();
