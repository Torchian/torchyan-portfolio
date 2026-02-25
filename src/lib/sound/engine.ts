type SoundId = string;

interface SoundConfig {
  url: string;
  volume?: number;
}

export class SoundEngine {
  private static instance: SoundEngine | null = null;
  private context: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private buffers = new Map<SoundId, AudioBuffer>();
  private registry = new Map<SoundId, SoundConfig>();
  private initialized = false;
  private _volume = 0.5;
  private _enabled = true;

  private constructor() {}

  static getInstance(): SoundEngine {
    if (!SoundEngine.instance) {
      SoundEngine.instance = new SoundEngine();
    }
    return SoundEngine.instance;
  }

  register(id: SoundId, config: SoundConfig) {
    this.registry.set(id, config);
  }

  registerAll(sounds: Record<SoundId, SoundConfig>) {
    for (const [id, config] of Object.entries(sounds)) {
      this.register(id, config);
    }
  }

  /**
   * Must be called from a user gesture event handler.
   * Creates the AudioContext and preloads registered sounds.
   */
  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      this.context = new AudioContext();
      this.gainNode = this.context.createGain();
      this.gainNode.gain.value = this._volume;
      this.gainNode.connect(this.context.destination);
      this.initialized = true;

      const loadPromises = Array.from(this.registry.entries()).map(([id, config]) =>
        this.loadSound(id, config.url),
      );
      await Promise.allSettled(loadPromises);
    } catch {
      this.initialized = false;
    }
  }

  private async loadSound(id: SoundId, url: string): Promise<void> {
    if (!this.context) return;
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
      this.buffers.set(id, audioBuffer);
    } catch {
      // Sound failed to load -- degrade silently
    }
  }

  async play(id: SoundId): Promise<void> {
    if (!this._enabled || !this.context || !this.gainNode) return;

    if (!this.initialized) {
      await this.init();
    }

    if (this.context.state === 'suspended') {
      await this.context.resume();
    }

    const buffer = this.buffers.get(id);
    if (!buffer) return;

    const source = this.context.createBufferSource();
    source.buffer = buffer;

    const config = this.registry.get(id);
    if (config?.volume !== undefined) {
      const soundGain = this.context.createGain();
      soundGain.gain.value = config.volume;
      source.connect(soundGain);
      soundGain.connect(this.gainNode);
    } else {
      source.connect(this.gainNode);
    }

    source.start(0);
  }

  setVolume(value: number) {
    this._volume = Math.max(0, Math.min(1, value));
    if (this.gainNode) {
      this.gainNode.gain.value = this._volume;
    }
  }

  get volume() {
    return this._volume;
  }

  set enabled(value: boolean) {
    this._enabled = value;
  }

  get enabled() {
    return this._enabled;
  }

  dispose() {
    if (this.context) {
      this.context.close();
      this.context = null;
    }
    this.gainNode = null;
    this.buffers.clear();
    this.initialized = false;
    SoundEngine.instance = null;
  }
}
