import { logger } from './Logger';

export type Alignable =
  | (
      | Phaser.GameObjects.Components.ComputedSize
      | Phaser.GameObjects.Components.Size
      | Phaser.GameObjects.Text
      | Phaser.GameObjects.BitmapText
      | Phaser.GameObjects.Shape
      | Phaser.GameObjects.Container
    ) &
      Phaser.GameObjects.Components.Transform;
export type PointLike = { x: number; y: number };

export type AlignableX = {
  width: number;
  displayWidth?: number;
  x?: number;
};
export type AlignableImgX = {
  width: number;
  displayWidth: number;
  x: number;
};

export type AlignableY = {
  height: number;
  displayHeight?: number;
  y?: number;
};
export type AlignableImgY = {
  height: number;
  displayHeight: number;
  y: number;
};

export type BitmapText = Phaser.GameObjects.BitmapText;

export class AlignUtils {
  static EVENT_DPR_CHANGED = 'dpr changed';

  canvasWidth: number = 0;
  canvasHeight: number = 0;
  viewportWidth: number = 0;
  viewportHeight: number = 0;
  devicePixelRatio: number = 0;
  camera!: Phaser.Cameras.Scene2D.Camera;

  private _topSafeAreaRaw = 0;
  private _bottomSafeAreaRaw = 0;
  private _lastSafeAreaChangeTm = 0;

  get topSafeAreaPx() {
    return this._topSafeAreaRaw * this.devicePixelRatio;
  }
  get bottomSafeAreaPx() {
    return this._bottomSafeAreaRaw * this.devicePixelRatio;
  }
  set topSafeAreaRaw(value: number) {
    if (value === this._topSafeAreaRaw) return;
    this._topSafeAreaRaw = value;

    this._lastSafeAreaChangeTm = Date.now();
  }
  set bottomSafeAreaRaw(value: number) {
    if (value === this._bottomSafeAreaRaw) return;
    this._bottomSafeAreaRaw = value;

    this._lastSafeAreaChangeTm = Date.now();
  }

  private listeners: Map<string, { func: Function; context: any }[]> = new Map();

  // call it from the very first scene
  init(scene: Phaser.Scene) {
    this.camera = scene.cameras.main;
  }

  setDevicePixelRatio(dpr: number) {
    this.devicePixelRatio = dpr;
    this.emit(AlignUtils.EVENT_DPR_CHANGED);
  }

  on(event: string, func: Function, context?: any) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push({ func, context });
  }
  emit(event: string, ...args: any[]) {
    this.listeners.get(event)?.forEach((handle) => {
      handle.func.call(handle.context, ...args);
    });
  }

  /**
   * Checks if the group has been resized already for actual screen dimensions
   *
   * Call this in the beginning of the handleResize functions
   * to prevent from multiple triggers of the same function after single screen size change.
   **/
  isResized(group: any, offset = 0.01) {
    // notch has changed - screen size and alignment are invalidated
    if (Date.now() - this._lastSafeAreaChangeTm < 2000) return false;

    const currentScreenSize = {
      w: this.width,
      h: this.height,
    };

    const previousSize = (group as any).__previousScreenSize;
    if (
      previousSize &&
      Math.abs(previousSize.w - currentScreenSize.w) < offset &&
      Math.abs(previousSize.h - currentScreenSize.h) < offset
    ) {
      // got previous value and it is exactly the same
      // the group is properly resized for current screen size
      return true;
    }

    (group as any).__previousScreenSize = currentScreenSize;
    return false;
  }

  get isPortrait() {
    return this.width > this.height ? false : true;
  }

  get isLandscape() {
    return this.width > this.height ? true : false;
  }

  // iPad resolutions
  get isLandscapeNarrow() {
    return this.isLandscape && this.width / this.height < 1.75;
  }

  /** Returns height of the game area minus CI header */
  get height() {
    return this.canvasHeight;
  }

  get width() {
    return this.canvasWidth;
  }

  get top() {
    return this.camera.y;
  }

  get bottom() {
    return this.top + this.height;
  }

  get left() {
    return this.camera.x;
  }

  get right() {
    return this.left + this.width;
  }

  get centerX() {
    return this.left + this.width / 2;
  }

  get centerY() {
    return this.top + this.height / 2;
  }

  /**
   * Fills the game screen with the given image ("bleeding" allowed)
   *
   * @param {Alignable} img Center-anchored sprite
   * @param {Number} offsetX (optional)
   * @param {Number} offsetY (optional)
   */
  fillScreen(img: Alignable, offsetX = 0, offsetY = 0) {
    img.setScale(
      Math.max(
        (this.width + offsetX) / ((img as any)._width || img.width),
        (this.height + offsetY) / ((img as any)._height || img.height)
      )
    );

    img.x = this.centerX;
    img.y = this.centerY;
  }

  /**
   * Fills the rect (width, height) with the given image ("bleeding" allowed)
   *
   * @param {Alignable} img Center-anchored sprite
   * @param {Number} width
   * @param {Number} height (optional)
   */
  fillSize(img: Alignable, width: number, height = 0) {
    // make a 0.5-anchored img fully fill the screen
    img.setScale(Math.max(width / img.width, height / img.height));
  }

  /**
   * @param {Alignable} img Center-anchored sprite
   * @param {Number} width
   * @param {Number} height
   * @param {Number} maxScale (optional)
   * @param {Number} minScale (optional)
   */
  fitIntoSize(img: Alignable, width: number, height: number, maxScale = Number.MAX_VALUE, minScale = 0.0) {
    if (!img.width || !img.height) {
      logger.error('Width/height == 0');
      return;
    }

    const calcScale = Math.min(width / Math.abs(img.width), height / Math.abs(img.height));
    img.setScale(Math.min(maxScale, Math.max(minScale, calcScale)));
  }

  /**
   * Center + Resize to screen width/height
   * @param {Alignable} img Center-anchored sprite
   * @param {Number} screenWidthP Portion of screen width (i.e. 0.5 = 50% of width)
   * @param {Number} screenHeightP Portion of screen height (i.e. 1.1 = 110% of screen height)
   **/
  toCenter(img: Alignable) {
    img.x = this.centerX;
    img.y = this.top + this.height / 2;
  }

  /**
   * Center + Resize to screen width/height
   * @param {Alignable} img Center-anchored sprite
   * @param {Number} screenWidthP Portion of screen width (i.e. 0.5 = 50% of width)
   * @param {Number} screenHeightP Portion of screen height (i.e. 1.1 = 110% of screen height)
   **/
  fitScreenAndCenter(img: Alignable, screenWidthP: number = 1.0, screenHeightP = 1.0) {
    if (screenWidthP && screenHeightP) {
      this.fitScreen(img, screenWidthP, screenHeightP);
    }

    this.toCenter(img);
  }

  /**
   * Scales the given img to fit into a specified part of the game screen
   *
   * @param {Alignable} img
   * @param {Number} screenWidthP 1.0 - whole screen width | 0.5 - half of the screen width and so on
   * @param {Number} screenHeightP 1.0 - whole screen width | 0.5 - half of the screen width and so on
   */
  fitScreen(img: Alignable, screenWidthP: number, screenHeightP = 1.0) {
    if (!screenWidthP || !screenHeightP) return;

    // assert(img.width && img.height, 'Width/height == 0')
    if (!img.width || !img.height) {
      logger.error('Width/height == 0');
      return;
    }

    const fitWidth = (this.width / img.width) * screenWidthP;
    const fitHeight = (this.height / img.height) * screenHeightP;
    img.setScale(Math.min(fitWidth, fitHeight));
  }

  /**
   * Aligns an center-anchored image __extactly__ to a screen edge (bottom)
   *
   * @param {Alignable} img Center-anchored image/group
   * @param {(Number|{y: number}} l 0.5 - amount of height to consider in aligining to the edge
   * @param {(Number|{y: number}} p (optional) Quick way to separate align parameter for landscape and portrait modes
   */
  toBottom(
    img: Alignable | BitmapText,
    l: number | PointLike = 0.5,
    p: number | PointLike | null | undefined = undefined
  ) {
    if (p === undefined) p = l;

    const absoluteY = LP((l as any).y, (p as any).y);
    if (absoluteY !== undefined) {
      img.y = absoluteY;
    } else {
      const imgHeight = Math.abs(img.displayHeight ?? img.height);
      img.y = this.bottom - imgHeight * LP(l, p);
    }

    return img.y;
  }

  /**
   * Aligns an center-anchored image __extactly__ to a screen edge (top)
   *
   * @param {Alignable} img Center-anchored image/group
   * @param {(Number|{y: number}} l 0.5 - amount of height to consider in aligining to the edge
   * @param {(Number|{y: number}} p (optional) Quick way to separate align parameter for landscape and portrait modes
   */
  toTop(
    img: Alignable | BitmapText,
    l: number | PointLike = 0.5,
    p: number | PointLike | null | undefined = undefined
  ) {
    if (p === undefined) p = l;

    const absoluteY = LP((l as any).y, (p as any).y);
    if (absoluteY !== undefined) {
      img.y = absoluteY;
    } else {
      const imgHeight = Math.abs(img.displayHeight ?? img.height);
      img.y = this.top + imgHeight * LP(l, p);
    }

    return img.y;
  }

  /**
   * Aligns an center-anchored image __extactly__ to a screen edge (left)
   *
   * @param {Alignable} img Center-anchored image/group
   * @param {(Number|{x: number}} l 0.5 - amount of width to consider in aligining to the edge
   * @param {(Number|{x: number}} p (optional) Quick way to separate align parameter for landscape and portrait modes
   */
  toLeft(
    img: Alignable | BitmapText,
    l: number | PointLike = 0.5,
    p: number | PointLike | null | undefined = undefined
  ) {
    if (p === undefined) p = l;

    const absoluteX = LP((l as any).x, (p as any).x);
    if (absoluteX !== undefined) {
      img.x = absoluteX;
    } else {
      const imgWidth = Math.abs(img.displayWidth ?? img.width);
      img.x = this.left + imgWidth * LP(l, p);
    }

    return img.x;
  }

  /**
   * Aligns an center-anchored image __extactly__ to a screen edge (right)
   *
   * @param {Alignable} img Center-anchored image/group
   * @param {(Number|{x: number}} l 0.5 - amount of width to consider in aligining to the edge
   * @param {(Number|{x: number}} p (optional) Quick way to separate align parameter for landscape and portrait modes
   */
  toRight(
    img: Alignable | BitmapText,
    l: number | PointLike = 0.5,
    p: number | PointLike | null | undefined = undefined
  ) {
    if (p === undefined) p = l;

    const absoluteX = LP((l as any).x, (p as any).x);
    if (absoluteX !== undefined) {
      img.x = absoluteX;
    } else {
      const imgWidth = Math.abs(img.displayWidth ?? img.width);
      img.x = this.right - imgWidth * LP(l, p);
    }

    return img.x;
  }

  /**
   * Aligns the object within the game screen from its left by specified fragment of its total width
   *
   * @param {Alignable} img
   * @param {(Number|{x: number}} xf 0.0 - to _lower_ edge (left), 0.5 - to center, 0.5 - to _higher_ edge (right)
   * @param {(Number|{x: number}} xfPortrait (optional) Quick way to separate align parameter for landscape and portrait modes
   */
  horizontally(
    img: PointLike,
    xf: number | PointLike = 0.5,
    xfPortrait: number | PointLike | null | undefined = undefined
  ) {
    if (xfPortrait === undefined) xfPortrait = xf;

    const absoluteX = LP((xf as any).x, (xfPortrait as any).x);
    if (absoluteX !== undefined) {
      img.x = absoluteX;
    } else {
      img.x = this.left + this.width * LP(xf, xfPortrait);
    }

    return img.x;
  }

  /**
   * Aligns the object within the game screen from its top by specified fragment of its total height
   *
   * @param {Alignable} img
   * @param {(Number|{y: number}} yf 0.0 - to _lower_ edge (top), 0.5 - to center, 0.5 - to _higher_ edge (bottom)
   * @param {(Number|{y: number}} yfPortrait (optional) Quick way to separate align parameter for landscape and portrait modes
   */
  vertically(
    img: PointLike,
    yf: number | PointLike = 0.5,
    yfPortrait: number | PointLike | undefined = undefined
  ) {
    if (yfPortrait === undefined) yfPortrait = yf;

    const absoluteY = LP((yf as any).y, (yfPortrait as any).y);
    if (absoluteY !== undefined) {
      img.y = absoluteY;
    } else {
      img.y = this.top + this.height * LP(yf, yfPortrait);
    }

    return img.y;
  }
}

const Align = new AlignUtils();
export default Align;

export function LP(landscape: any, portrait: any) {
  return Align.isPortrait ? portrait : landscape;
}
