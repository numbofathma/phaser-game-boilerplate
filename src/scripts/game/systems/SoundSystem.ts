import { logger } from './Logger';

export type PlayConfig = {
  loop?: boolean;
  // 0 - 1
  volume?: number;
  // 0 - 1
  volumeRange?: number;
  // 0 - 1 - for what part of duration should system lock the sound from replaying
  replayLock?: number;
};
type Audio = Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound | Phaser.Sound.NoAudioSound;

export default class SoundSystem {
  private sounds: { [key: string]: Audio } = {};
  private game: Phaser.Game;
  private key: string;

  sfxVolume = 1;
  musicVolume = 0.15;
  enabled = true;

  constructor(game: Phaser.Game, key = 'sounds') {
    this.game = game;
    this.key = key;

    Object.keys(this.sounds).forEach((key) => {
      delete this.sounds[key];
    });
  }

  play(name: SfxKey | SfxKey[], config: PlayConfig = {}) {
    if (!this.sfxVolume) return;
    if (Array.isArray(name)) name = Phaser.Utils.Array.GetRandom(name) as SfxKey;
    this.playRaw(name, config);
  }

  private playRaw(name: string, config: PlayConfig = {}) {
    const { sounds, enabled } = this;

    if (!enabled) return;

    if (config.volume === undefined) config.volume = 1;

    let sound;
    try {
      let audioInstance = sounds[name];
      if (!audioInstance) {
        audioInstance = this.game.sound.addAudioSprite(this.key);
        sounds[name] = audioInstance;
      }

      sound = audioInstance.play(name, {
        volume: config.volume,
        loop: config.loop ?? false,
      });
    } catch (error: any) {
      logger.warn(error);
      logger.error('No such sound:', name);
      return null;
    }

    return sound;
  }

  stopSounds() {
    Object.keys(this.sounds).forEach((key) => {
      const sound = this.sounds[key];
      if (!sound) return;
      sound.stop();
    });
  }
}

export type SfxKey = 'btn' | 'collect' | 'fail';
