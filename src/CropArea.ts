import { Activator } from './core/Activator';
import { SvgHelper } from './core/SvgHelper';
import { CropAreaState } from './CropAreaState';

import Logo from './assets/markerjs-logo-m.svg';
import { IPoint } from './core/IPoint';

/**
 * Event handler type for {@linkcode MarkerArea} `render` event.
 */
export type RenderEventHandler = (dataURL: string, state?: CropAreaState) => void;
/**
 * Event handler type for {@linkcode MarkerArea} `close` event.
 */
export type CloseEventHandler = () => void;

/**
 * CROPRO display mode - `inline` or `popup`.
 */
export type DisplayMode = 'inline' | 'popup';

export class CropArea {
  private target: HTMLImageElement;
  private targetObserver: ResizeObserver;

  private imageWidth: number;
  private imageHeight: number;
  private left: number;
  private top: number;
  private windowHeight: number;

  private cropImage: SVGSVGElement;
  private cropImageHolder: HTMLDivElement;
  private defs: SVGDefsElement;

  private coverDiv: HTMLDivElement;
  private uiDiv: HTMLDivElement;
  private contentDiv: HTMLDivElement;
  private editorCanvas: HTMLDivElement;
  private editingTarget: HTMLImageElement;

  private logoUI: HTMLElement;
  
  /**
   * `targetRoot` is used to set an alternative positioning root for the UI.
   *
   * This is useful in cases when your target image is positioned, say, inside a div with `position: relative;`
   *
   * ```typescript
   * // set targetRoot to a specific div instead of document.body
   * cropArea.targetRoot = document.getElementById('myRootElement');
   * ```
   *
   * @default document.body
   */
  public targetRoot: HTMLElement;
  
  // for preserving orginal window state before opening the editor
  private bodyOverflowState: string;
  private scrollYState: number;
  private scrollXState: number;

  private renderEventListeners: RenderEventHandler[] = [];
  private closeEventListeners: CloseEventHandler[] = [];

  private _isOpen = false;
  /**
   * Returns `true` when CropArea is open and `false` otherwise.
   *
   * @readonly
   */
  public get isOpen(): boolean {
    return this._isOpen;
  }

  /**
   * When set to true resulting image will be rendered at the natural (original) resolution
   * of the target image. Otherwise (default), screen dimensions of the image are used.
   *
   * @default false (use screen dimensions)
   */
  public renderAtNaturalSize = false;
  /**
   * Type of image for the rendering result. Eg. `image/png` (default) or `image/jpeg`.
   *
   * @default `image/png`
   */
  public renderImageType = 'image/png';
  /**
   * When rendering engine/format supports it (jpeg, for exmample),
   * sets the rendering quality for the resulting image.
   *
   * In case of `image/jpeg` the value should be between 0 (worst quality) and 1 (best quality).
   */
  public renderImageQuality?: number;

  /**
   * Display mode.
   */
  public displayMode: DisplayMode = 'inline';

  /**
   * Margin in pixels between CROPRO popup UI and window borders.
   */
  public popupMargin = 30;

  /**
   * Base height of the toolbar block in pixels.
   */
  toolbarHeight?: number;

  /**
   * Creates a new CropArea for the specified target image.
   *
   * ```typescript
   * // create an instance of CropArea and pass the target image reference as a parameter
   * let cropArea = new cropro.CropArea(document.getElementById('myimg'));
   * ```
   *
   * @param target image object to crop.
   */
  constructor(target: HTMLImageElement) {
    this.target = target;
    this.targetRoot = document.body;

    this.open = this.open.bind(this);
    this.setTopLeft = this.setTopLeft.bind(this);

    // @todo
    // this.toolbarButtonClicked = this.toolbarButtonClicked.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.overrideOverflow = this.overrideOverflow.bind(this);
    this.restoreOverflow = this.restoreOverflow.bind(this);
    this.close = this.close.bind(this);
    this.closeUI = this.closeUI.bind(this);
    this.addCloseEventListener = this.addCloseEventListener.bind(this);
    this.removeCloseEventListener = this.removeCloseEventListener.bind(this);
    this.addRenderEventListener = this.addRenderEventListener.bind(this);
    this.removeRenderEventListener = this.removeRenderEventListener.bind(this);
    this.clientToLocalCoordinates = this.clientToLocalCoordinates.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
    this.setWindowHeight = this.setWindowHeight.bind(this);
  }

  private open(): void {
    this.setupResizeObserver();
    this.setEditingTarget();
    this.setTopLeft();
    this.initCropCanvas();
    this.attachEvents();

    if (!Activator.isLicensed) {
      // NOTE:
      // before removing this call please consider supporting CROPRO
      // by visiting https://markerjs.com/products/cropro for details
      // thank you!
      this.addLogo();
    }

    this._isOpen = true;
  }

  /**
   * Initializes the CropArea and opens the UI.
   */
  public show(): void {
    this.showUI();
    this.open();
  }

  /**
   * Closes the CropArea UI.
   */
  public close(): void {
    if (this.isOpen) {
      if (this.coverDiv) {
        this.closeUI();
      }
      if (this.targetObserver) {
        this.targetObserver.unobserve(this.target);
      }
      if (this.displayMode === 'popup') {
        window.removeEventListener('resize', this.setWindowHeight);
      }
      this.closeEventListeners.forEach((listener) => listener());
      this._isOpen = false;
    }
  }

  /**
   * Add a `render` event listener which is called when user clicks on the OK/save button
   * in the toolbar.
   *
   * ```typescript
   * // register an event listener for when user clicks OK/save in the UI
   * cropArea.addRenderEventListener(dataUrl => {
   *   // we are setting the cropping result to replace our original image on the page
   *   // but you can set a different image or upload it to your server
   *   document.getElementById('myimg').src = dataUrl;
   * });
   * ```
   *
   * This is where you place your code to save a resulting image and/or CropAreaState.
   *
   * @param listener - a method handling rendering results
   *
   * @see {@link CropAreaState}
   */
  public addRenderEventListener(listener: RenderEventHandler): void {
    this.renderEventListeners.push(listener);
  }

  /**
   * Remove a `render` event handler.
   *
   * @param listener - previously registered `render` event handler.
   */
  public removeRenderEventListener(listener: RenderEventHandler): void {
    if (this.renderEventListeners.indexOf(listener) > -1) {
      this.renderEventListeners.splice(
        this.renderEventListeners.indexOf(listener),
        1
      );
    }
  }

  /**
   * Add a `close` event handler to perform actions in your code after the user
   * clicks on the close button (without saving).
   *
   * @param listener - close event listener
   */
  public addCloseEventListener(listener: CloseEventHandler): void {
    this.closeEventListeners.push(listener);
  }

  /**
   * Remove a `close` event handler.
   *
   * @param listener - previously registered `close` event handler.
   */
  public removeCloseEventListener(listener: CloseEventHandler): void {
    if (this.closeEventListeners.indexOf(listener) > -1) {
      this.closeEventListeners.splice(
        this.closeEventListeners.indexOf(listener),
        1
      );
    }
  }

  private setupResizeObserver() {
    if (this.displayMode === 'inline') {
      this.targetObserver = new ResizeObserver(() => {
        this.resize(this.target.clientWidth, this.target.clientHeight);
      });
      this.targetObserver.observe(this.target);
    } else if (this.displayMode === 'popup') {
      this.targetObserver = new ResizeObserver(() => {
        const ratio = 1.0 * this.target.clientWidth / this.target.clientHeight;
        const newWidth = this.editorCanvas.clientWidth / ratio > this.editorCanvas.clientHeight ?
          this.editorCanvas.clientHeight * ratio : this.editorCanvas.clientWidth;
        const newHeight = newWidth < this.editorCanvas.clientWidth ?
          this.editorCanvas.clientHeight : this.editorCanvas.clientWidth / ratio;
        this.resize(newWidth, newHeight);
      });
      this.targetObserver.observe(this.editorCanvas);
      window.addEventListener('resize', this.setWindowHeight);
    }
  }

  private setWindowHeight() {
    this.windowHeight = window.innerHeight;
  }

  private resize(newWidth: number, newHeight: number) {
    // @todo
    // const scaleX = newWidth / this.imageWidth;
    // const scaleY = newHeight / this.imageHeight;

    this.imageWidth = Math.round(newWidth);
    this.imageHeight = Math.round(newHeight);
    this.editingTarget.src = this.target.src;
    this.editingTarget.width = this.imageWidth;
    this.editingTarget.height = this.imageHeight;
    this.editingTarget.style.width = `${this.imageWidth}px`;
    this.editingTarget.style.height = `${this.imageHeight}px`;

    this.cropImage.setAttribute('width', this.imageWidth.toString());
    this.cropImage.setAttribute(
      'height',
      this.imageHeight.toString()
    );
    this.cropImage.setAttribute(
      'viewBox',
      '0 0 ' +
        this.imageWidth.toString() +
        ' ' +
        this.imageHeight.toString()
    );

    this.cropImageHolder.style.width = `${this.imageWidth}px`;
    this.cropImageHolder.style.height = `${this.imageHeight}px`;

    if (this.displayMode !== 'popup') {
      this.coverDiv.style.width = `${this.imageWidth.toString()}px`;
    } else {
      this.setTopLeft();
      this.positionCropImage();
    }

    // @todo
    // if (this.toolbar !== undefined) {
    //   this.toolbar.adjustLayout();
    // }

    this.positionLogo();
  }

  private setEditingTarget() {
    this.imageWidth = Math.round(this.target.clientWidth);
    this.imageHeight = Math.round(this.target.clientHeight);
    this.editingTarget.src = this.target.src;
    this.editingTarget.width = this.imageWidth;
    this.editingTarget.height = this.imageHeight;
    this.editingTarget.style.width = `${this.imageWidth}px`;
    this.editingTarget.style.height = `${this.imageHeight}px`;
  }

  private setTopLeft() {
    const targetRect = this.editingTarget.getBoundingClientRect();
    const bodyRect = this.editorCanvas.getBoundingClientRect();
    this.left = targetRect.left - bodyRect.left;
    this.top = targetRect.top - bodyRect.top;
  }

  private initCropCanvas(): void {
    this.cropImageHolder = document.createElement('div');
    // fix for Edge's touch behavior
    this.cropImageHolder.style.setProperty('touch-action', 'none');
    this.cropImageHolder.style.setProperty('-ms-touch-action', 'none');

    this.cropImage = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg'
    );
    this.cropImage.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    this.cropImage.setAttribute('width', this.imageWidth.toString());
    this.cropImage.setAttribute(
      'height',
      this.imageHeight.toString()
    );
    this.cropImage.setAttribute(
      'viewBox',
      '0 0 ' +
        this.imageWidth.toString() +
        ' ' +
        this.imageHeight.toString()
    );
    this.cropImage.style.pointerEvents = 'auto';

    this.cropImageHolder.style.position = 'absolute';
    this.cropImageHolder.style.width = `${this.imageWidth}px`;
    this.cropImageHolder.style.height = `${this.imageHeight}px`;
    this.cropImageHolder.style.transformOrigin = 'top left';
    this.positionCropImage();

    this.defs = SvgHelper.createDefs();
    this.cropImage.appendChild(this.defs);

    this.cropImageHolder.appendChild(this.cropImage);

    this.editorCanvas.appendChild(this.cropImageHolder);
  }

  private positionCropImage() {
    this.cropImageHolder.style.top = this.top + 'px';
    this.cropImageHolder.style.left = this.left + 'px';
  }

  private attachEvents() {
    this.cropImage.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('resize', this.onWindowResize)
  }

  /**
   * NOTE:
   *
   * before removing or modifying this method please consider supporting CROPRO
   * by visiting https://markerjs.com/products/cropro for details
   *
   * thank you!
   */
  private addLogo() {
    this.logoUI = document.createElement('div');
    this.logoUI.style.display = 'inline-block';
    this.logoUI.style.margin = '0px';
    this.logoUI.style.padding = '0px';
    this.logoUI.style.fill = '#333333';

    const link = document.createElement('a');
    link.href = 'https://markerjs.com/products/cropro';
    link.target = '_blank';
    link.innerHTML = Logo;
    link.title = 'Powered by CROPRO';

    link.style.display = 'grid';
    link.style.alignItems = 'center';
    link.style.justifyItems = 'center';
    link.style.padding = '3px';
    link.style.width = '20px';
    link.style.height = '20px';

    this.logoUI.appendChild(link);

    this.editorCanvas.appendChild(this.logoUI);

    this.logoUI.style.position = 'absolute';
    this.logoUI.style.pointerEvents = 'all';
    this.positionLogo();
  }

  private positionLogo() {
    if (this.logoUI) {
      this.logoUI.style.left = `${this.cropImageHolder.offsetLeft + 10}px`;
      this.logoUI.style.top = `${
        this.cropImageHolder.offsetTop +
        this.cropImageHolder.offsetHeight -
        this.logoUI.clientHeight -
        10
      }px`;
    }
  }

  private overrideOverflow() {
    // backup current state of scrolling and overflow
    this.scrollXState = window.scrollX;
    this.scrollYState = window.scrollY;
    this.bodyOverflowState = document.body.style.overflow;

    window.scroll({ top: 0, left: 0 });
    document.body.style.overflow = 'hidden';
  }

  private restoreOverflow() {
    document.body.style.overflow = this.bodyOverflowState;
    window.scroll({ top: this.scrollYState, left: this.scrollXState });
  }

  private showUI(): void {
    if (this.displayMode === 'popup') {
      this.overrideOverflow();
    }

    this.coverDiv = document.createElement('div');
    
    // @todo
    // this.coverDiv.className = Style.CLASS_PREFIX;

    // hardcode font size so nothing inside is affected by higher up settings
    this.coverDiv.style.fontSize = '16px';
    switch(this.displayMode) {
      case 'inline': {
        this.coverDiv.style.position = 'absolute';
        const coverTop =
          this.target.offsetTop > this.toolbarHeight
            ? this.target.offsetTop - this.toolbarHeight
            : 0;
        this.coverDiv.style.top = `${coverTop}px`;
        this.coverDiv.style.left = `${this.target.offsetLeft.toString()}px`;
        this.coverDiv.style.width = `${this.target.offsetWidth.toString()}px`;
        //this.coverDiv.style.height = `${this.target.offsetHeight.toString()}px`;
        this.coverDiv.style.zIndex = '5';
        // flex causes the ui to stretch when toolbox has wider nowrap panels
        //this.coverDiv.style.display = 'flex';
        break;
      }
      case 'popup': {
        this.coverDiv.style.position = 'absolute';
        this.coverDiv.style.top = '0px';
        this.coverDiv.style.left = '0px';
        this.coverDiv.style.width = '100vw';
        this.coverDiv.style.height = `${window.innerHeight}px`;
        this.coverDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.75)';
        this.coverDiv.style.zIndex = '1000';
        this.coverDiv.style.display = 'flex';
        // this.coverDiv.style.overflow = 'auto';
      }
    }
    this.targetRoot.appendChild(this.coverDiv);

    this.uiDiv = document.createElement('div');
    this.uiDiv.style.display = 'flex';
    this.uiDiv.style.flexDirection = 'column';
    this.uiDiv.style.flexGrow = '2';
    this.uiDiv.style.margin = this.displayMode === 'popup' ? `${this.popupMargin}px` : '0px';
    this.uiDiv.style.border = '0px';
    // this.uiDiv.style.overflow = 'hidden';
    //this.uiDiv.style.backgroundColor = '#ffffff';
    this.coverDiv.appendChild(this.uiDiv);

    // @todo
    // this.toolbar = new Toolbar(this.uiDiv, this.settings.displayMode, this._availableMarkerTypes, this.uiStyleSettings);
    // this.toolbar.addButtonClickListener(this.toolbarButtonClicked);
    // this.toolbar.show();

    this.contentDiv = document.createElement('div');
    this.contentDiv.style.display = 'flex';
    this.contentDiv.style.flexDirection = 'row';
    this.contentDiv.style.flexGrow = '2';
    this.contentDiv.style.flexShrink = '1';
    // @todo
    // this.contentDiv.style.backgroundColor = this.uiStyleSettings.canvasBackgroundColor;
    if (this.displayMode === 'popup') {
      this.contentDiv.style.maxHeight = `${this.windowHeight -
        this.popupMargin * 2 - this.toolbarHeight * 3.5}px`;
      // this.contentDiv.style.maxHeight = `calc(100vh - ${
      //   this.settings.popupMargin * 2 + this.uiStyleSettings.toolbarHeight * 3.5}px)`;
      this.contentDiv.style.maxWidth = `calc(100vw - ${this.popupMargin * 2}px)`;
    }
    this.uiDiv.appendChild(this.contentDiv);

    this.editorCanvas = document.createElement('div');
    this.editorCanvas.style.flexGrow = '2';
    this.editorCanvas.style.flexShrink = '1';
    this.editorCanvas.style.position = 'relative';
    this.editorCanvas.style.overflow = 'hidden';
    this.editorCanvas.style.display = 'flex';
    if (this.displayMode === 'popup') {
      this.editorCanvas.style.alignItems = 'center';
      this.editorCanvas.style.justifyContent = 'center';
    }
    this.editorCanvas.style.pointerEvents = 'none';
    this.contentDiv.appendChild(this.editorCanvas);

    this.editingTarget = document.createElement('img');
    this.editorCanvas.appendChild(this.editingTarget);

    // @todo
    // this.toolbox = new Toolbox(this.uiDiv, this.settings.displayMode, this.uiStyleSettings);
    // this.toolbox.show();
  }

  private closeUI() {
    if (this.displayMode === 'popup') {
      this.restoreOverflow();
    }
    // @todo better cleanup
    this.targetRoot.removeChild(this.coverDiv);
  }

  /**
   * Returns the complete state for the CropArea that can be preserved and used
   * to continue cropping next time.
   */
  public getState(): CropAreaState {
    const result: CropAreaState = {
      width: this.imageWidth,
      height: this.imageHeight
    };
    return result;
  }

  /**
   * Restores CropArea state to continue previous cropping session.
   *
   * **IMPORTANT**: call `restoreState()` __after__ you've opened the CropArea with {@linkcode show}.
   *
   * ```typescript
   * this.cropArea1.show();
   * if (this.currentState) {
   *   this.cropArea1.restoreState(this.currentState);
   * }
   * ```
   *
   * @param state - previously saved state object.
   */
  public restoreState(state: CropAreaState): void {
    if (
      state.width && state.height
      && (state.width !== this.imageWidth || state.height !== this.imageHeight)) {
        // @todo
        // this.scaleMarkers(this.imageWidth / state.width, this.imageHeight / state.height);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onPointerDown(ev: PointerEvent) {
    // @todo
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onPointerMove(ev: PointerEvent) {
    // @todo
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onPointerUp(ev: PointerEvent) {
    // @todo
  }

  private clientToLocalCoordinates(x: number, y: number): IPoint {
    const clientRect = this.cropImage.getBoundingClientRect();
    return { x: x - clientRect.x, y: y - clientRect.y };
  }

  private onWindowResize() {
    this.positionUI();
  }

  private positionUI() {
    this.setTopLeft();
    switch(this.displayMode) {
      case 'inline': {
        const coverTop =
          this.target.offsetTop > this.toolbarHeight
            ? this.target.offsetTop - this.toolbarHeight
            : 0;
        this.coverDiv.style.top = `${coverTop}px`;
        this.coverDiv.style.left = `${this.target.offsetLeft.toString()}px`;
        break;
      }
      case 'popup': {
        this.coverDiv.style.top = '0px';
        this.coverDiv.style.left = '0px';
        this.coverDiv.style.width = '100vw';
        this.coverDiv.style.height = `${this.windowHeight}px`;
        this.contentDiv.style.maxHeight = `${this.windowHeight -
          this.popupMargin * 2 - this.toolbarHeight * 3.5}px`;
      }
    }
    this.positionCropImage();
    this.positionLogo();
  }

}