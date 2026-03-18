import { AUDIO_PATHS, AUDIO_POOL_SIZE } from "@utils/constants";

export class SoundEffects {
  private readonly shootPool: HTMLAudioElement[];
  private readonly hitPool: HTMLAudioElement[];
  private readonly explosionSound: HTMLAudioElement;
  private readonly levelUpSound: HTMLAudioElement;

  private shootIndex: number = 0;
  private hitIndex: number = 0;

  public constructor() {
    this.shootPool = this.createPool(AUDIO_PATHS.shoot, AUDIO_POOL_SIZE);
    this.hitPool = this.createPool(AUDIO_PATHS.hit, AUDIO_POOL_SIZE);
    this.explosionSound = new Audio(AUDIO_PATHS.explosion);
    this.levelUpSound = new Audio(AUDIO_PATHS.levelUp);

    this.levelUpSound.volume = 0.4;
  }

  public playShootSound(): void {
    this.playFromPool(this.shootPool, this.shootIndex);
    this.shootIndex = (this.shootIndex + 1) % this.shootPool.length;
  }

  public playHitSound(): void {
    this.playFromPool(this.hitPool, this.hitIndex);
    this.hitIndex = (this.hitIndex + 1) % this.hitPool.length;
  }

  public playExplosionSound(): void {
    void this.explosionSound.play();
  }

  public playLevelUpSound(): void {
    void this.levelUpSound.play();
  }

  private createPool(path: string, size: number): HTMLAudioElement[] {
    return Array.from({ length: size }, () => new Audio(path));
  }

  private playFromPool(pool: HTMLAudioElement[], index: number): void {
    const audio = pool[index];
    if (!audio) return;
    audio.currentTime = 0;
    void audio.play();
  }
}

export default SoundEffects;
