import { GameDispatch, GameState } from './GameContext';
import Align from './systems/Align';
import SoundSystem from './systems/SoundSystem';

export default class GameScene extends Phaser.Scene {
  private _sounds!: SoundSystem;

  preload() {
    Align.init(this);

    // load atlasses
    this.load.atlas('GameAtlas', 'atlas/game.webp', 'atlas/game.json');

    // load bitmap fonts
    this.load.bitmapFont('arial', 'fonts/arial.png', 'fonts/arial.fnt');
    this.load.bitmapFont('arial-stroke', 'fonts/arial-stroke.png', 'fonts/arial-stroke.fnt');

    // load settings
    this.load.json('default-settings', 'settings.json');

    // load sounds
    this.load.audioSprite('sounds', 'audio/sounds.json', 'audio/sounds.mp3');
  }

  create(data: { dispatch: GameDispatch; initialState: GameState }) {
    // TODO: here create elements

    // example way to add points on UI
    // setTimeout(() => {
    //   data.dispatch(new ActionAddScore(10));
    // }, 1500);

    // other systems
    // initialize sounds
    this._sounds = new SoundSystem(this.game, 'sounds');

    this.scale.on(Phaser.Scale.Events.RESIZE, this.resize, this);
    this.resize();
  }

  resize() {}

  update() {
    // TODO: here update existing elements
  }

  get sounds() {
    return this._sounds;
  }
}
