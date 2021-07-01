import { Activator } from './core/Activator';
import { SvgHelper } from './core/SvgHelper';
import { CropAreaState } from './CropAreaState';

import { IPoint } from './core/IPoint';
import { StyleClass, StyleManager, StyleRule } from './core/Style';
import { Toolbar } from './core/Toolbar';
import { ToolbarButtonBlock } from './core/ToolbarButtonBlock';
import { ToolbarButton } from './core/ToolbarButton';
import { ToolbarElementBlock } from './core/ToolbarElementBlock';

import GridIcon from './assets/toolbar-icons/grid.svg';
import ZoomIcon from './assets/toolbar-icons/zoomin.svg';
import CheckIcon from './assets/toolbar-icons/check.svg';
import CloseIcon from './assets/toolbar-icons/close.svg';
import RotateLeftIcon from './assets/toolbar-icons/rotate-left.svg';
import RotateRightIcon from './assets/toolbar-icons/rotate-right.svg';
import FlipHotizontalIcon from './assets/toolbar-icons/flip-horizontal.svg';
import FlipVerticalIcon from './assets/toolbar-icons/flip-vertical.svg';
import LogoIcon from './assets/cropro-logo-white-square.svg';
import { AspectRatioIconGenerator } from './core/AspectRatioIconGenerator';
import { DropdownToolbarButton } from './core/DropdownToolbarButton';
import { AspectRatio, IAspectRatio } from './core/AspectRatio';
import { CropLayer, IRect } from './CropLayer';
import { StraightenControl } from './core/StraightenControl';
import { Renderer } from './core/Renderer';

/**
 * Event handler type for {@linkcode CropArea} `render` event.
 */
export type RenderEventHandler = (
  dataURL: string,
  state?: CropAreaState
) => void;
/**
 * Event handler type for {@linkcode CropArea} `close` event.
 */
export type CloseEventHandler = () => void;

/**
 * CROPRO display mode - `inline` or `popup` (full screen).
 */
export type DisplayMode = 'inline' | 'popup';

/**
 * Main CROPRO class.
 * 
 * Simple usage example:
 * 
 * ```javascript
 * let ca = new CropArea(target);
 * ca.addRenderEventListener((dataUrl, state) => {
 *     const res = document.createElement('img');
 *     res.src = dataUrl;
 *     document.body.appendChild(res);
 * });
 * this.ca.show();
 * ```
 */
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
  private editingTargetContainer: SVGGElement;
  private editingTargetRotationContainer: SVGGElement;
  private editingTargetRotationScaleContainer: SVGGElement;
  private editingTarget: SVGImageElement;

  private straightener: StraightenControl;

  private logoUI: HTMLElement;

  private static instanceCounter = 0;
  private _instanceNo: number;
  public get instanceNo(): number {
    return this._instanceNo;
  }

  /**
   * Manage style releated settings via the `styles` property.
   */
  public styles: StyleManager;

  private cropLayerContainer: SVGGElement;
  private cropLayer: CropLayer;

  private cropRect: IRect;

  private _zoomToCropEnabled = true;
  /**
   * Get whether zoom-to-crop feature is enabled.
   * Set to true to enable zooming to crop area all the time.
   * When set to false the whole image is shown and cropping is done within it.
   */
  public get zoomToCropEnabled(): boolean {
    return this._zoomToCropEnabled;
  }
  public set zoomToCropEnabled(value: boolean) {
    this._zoomToCropEnabled = value;
    if (value) {
      this.zoomToCrop();
    } else {
      this.unzoomFromCrop();
    }
  }

  private zoomFactor = 1;

  private flippedHorizontally = false;
  private flippedVertically = false;

  private _isGridVisible = true;
  /**
   * Get whether alginment grid is visible.
   * When set to true alignment grid is shown, hidden otherwise.
   */
  public get isGridVisible(): boolean {
    return this._isGridVisible;
  }
  public set isGridVisible(value: boolean) {
    this._isGridVisible = value;
    if (this.cropLayer) {
      this.cropLayer.isGridVisible = this._isGridVisible;
    }
  }
  private _gridLines = 2;
  /**
   * Number of grid lines in the alignment grid.
   */
  public get gridLines(): number {
    return this._gridLines;
  }
  public set gridLines(value: number) {
    this._gridLines = value;
    if (this.cropLayer) {
      this.cropLayer.numberOfGridLines = this._gridLines;
    }
  }

  private _rotationAngle = 0;
  /**
   * Rotation angle of the original image with the crop area.
   */
  public get rotationAngle(): number {
    return this._rotationAngle;
  }
  public set rotationAngle(value: number) {
    this._rotationAngle = value;
    if (this.straightener) {
      this.straightener.angle = this._rotationAngle;
    }
  }

  private toolbarStyleClass: StyleClass;
  private toolbarStyleColorsClass: StyleClass;
  private toolbarBlockStyleClass: StyleClass;
  private toolbarButtonStyleClass: StyleClass;
  private toolbarButtonStyleColorsClass: StyleClass;
  private toolbarActiveButtonStyleColorsClass: StyleClass;
  private toolbarDropdownStyleClass: StyleClass;
  private toolbarDropdownStyleColorsClass: StyleClass;
  private toolbarStraightenerBlockStyleClass: StyleClass;
  private toolbarStraightenerStyleClass: StyleClass;
  private toolbarStraightenerStyleColorsClass: StyleClass;

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

  private topToolbar: Toolbar;
  private bottomToolbar: Toolbar;

  private CANVAS_MARGIN = 20;
  private get paddedImageWidth(): number {
    return this.imageWidth + this.CANVAS_MARGIN * 2;
  }
  private get paddedImageHeight(): number {
    return this.imageHeight + this.CANVAS_MARGIN * 2;
  }

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
   * When set and {@linkcode renderAtNaturalSize} is `false` sets the width of the rendered image.
   *
   * Both `renderWidth` and `renderHeight` have to be set for this to take effect.
   */
  public renderWidth?: number;
  /**
   * When set and {@linkcode renderAtNaturalSize} is `false` sets the height of the rendered image.
   *
   * Both `renderWidth` and `renderHeight` have to be set for this to take effect.
   */
  public renderHeight?: number;

  /**
   * Display mode. 
   * `inline` for cropping right on top of the original image,
   * `popup` for a full-screen experience.
   */
  public displayMode: DisplayMode = 'inline';

  /**
   * Margin in pixels between CROPRO popup UI and window borders.
   */
  public popupMargin = 30;

  /**
   * Base height of the toolbar block in pixels.
   */
  public toolbarHeight = 40;

  /**
   * Aspect ratio options. 
   * Displayed in the aspect ratio dropdown. 
   * When only one option is specified the aspect ratio button is hidden.
   */
  public aspectRatios: IAspectRatio[] = [
    { horizontal: 0, vertical: 0 },
    { horizontal: 4, vertical: 3 },
    { horizontal: 3, vertical: 2 },
    { horizontal: 16, vertical: 9 },
    { horizontal: 1, vertical: 1 },
    { horizontal: 3, vertical: 4 },
    { horizontal: 2, vertical: 3 },
    { horizontal: 9, vertical: 16 },
  ];
  private _aspectRatio: IAspectRatio;
  /**
   * Currently active aspect ratio.
   */
  public set aspectRatio(value: IAspectRatio) {
    this._aspectRatio = value;
  }
  public get aspectRatio():IAspectRatio {
    return this._aspectRatio ?? this.aspectRatios[0];
  } 

  private aspectRatioButton: DropdownToolbarButton;

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
    this._instanceNo = CropArea.instanceCounter++;

    this.styles = new StyleManager(this.instanceNo);

    this.target = target;
    this.targetRoot = document.body;

    this.open = this.open.bind(this);
    this.setTopLeft = this.setTopLeft.bind(this);

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
    this.rotateBy = this.rotateBy.bind(this);
    this.applyRotation = this.applyRotation.bind(this);
    this.cropRectChanged = this.cropRectChanged.bind(this);
    this.zoomToCrop = this.zoomToCrop.bind(this);
    this.unzoomFromCrop = this.unzoomFromCrop.bind(this);
    this.rotateLeftButtonClicked = this.rotateLeftButtonClicked.bind(this);
    this.rotateRightButtonClicked = this.rotateRightButtonClicked.bind(this);
    this.flipHorizontallyButtonClicked = this.flipHorizontallyButtonClicked.bind(
      this
    );
    this.flipVerticallyButtonClicked = this.flipVerticallyButtonClicked.bind(
      this
    );
    this.applyFlip = this.applyFlip.bind(this);
    this.startRenderAndClose = this.startRenderAndClose.bind(this);
    this.render = this.render.bind(this);
    this.onPopupResize = this.onPopupResize.bind(this);
    this.applyAspectRatio = this.applyAspectRatio.bind(this);
  }

  private open(): void {
    this.imageWidth = Math.round(this.target.clientWidth);
    this.imageHeight = Math.round(this.target.clientHeight);
    this.setupResizeObserver();
    this.initCropCanvas();
    this.setEditingTarget();
    this.setTopLeft();
    this.initCropLayer();
    this.attachEvents();
    this.applyAspectRatio();
    if (this.displayMode === 'popup') {
      this.onPopupResize();
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
  public close(isRendering = false): void {
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
      if (!isRendering) {
        this.closeEventListeners.forEach((listener) => listener());
      }
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
      if (window.ResizeObserver) {
        this.targetObserver = new ResizeObserver(() => {
          this.resize(this.target.clientWidth, this.target.clientHeight);
        });
        this.targetObserver.observe(this.target);
      }
    } else if (this.displayMode === 'popup') {
      if (window.ResizeObserver) {
        this.targetObserver = new ResizeObserver(this.onPopupResize);
        this.targetObserver.observe(this.contentDiv);
      }
      window.addEventListener('resize', this.setWindowHeight);
    }
  }

  private onPopupResize() {
    if (this.contentDiv.clientWidth > 0 && this.contentDiv.clientHeight > 0) {
      const ratio = (1.0 * this.target.clientWidth) / this.target.clientHeight;
      const newWidth =
        this.contentDiv.clientWidth / ratio > this.contentDiv.clientHeight
          ? (this.contentDiv.clientHeight - this.CANVAS_MARGIN * 2) * ratio
          : this.contentDiv.clientWidth - this.CANVAS_MARGIN * 2;
      const newHeight =
        newWidth + this.CANVAS_MARGIN * 2 < this.contentDiv.clientWidth
          ? this.contentDiv.clientHeight - this.CANVAS_MARGIN * 2
          : (this.contentDiv.clientWidth - this.CANVAS_MARGIN * 2) / ratio;

      this.resize(newWidth, newHeight);
    }
  }

  private setWindowHeight() {
    this.windowHeight = window.innerHeight;
  }

  private setEditingTargetSize() {
    this.editorCanvas.style.width = `${
      this.imageWidth + this.CANVAS_MARGIN * 2
    }px`;
    this.editorCanvas.style.height = `${
      this.imageHeight + this.CANVAS_MARGIN * 2
    }px`;
    SvgHelper.setAttributes(this.editingTarget, [
      ['width', `${this.imageWidth}`],
      ['height', `${this.imageHeight}`],
    ]);
    this.editingTarget.style.transformOrigin = `${this.imageWidth / 2}px ${this.imageHeight / 2}px`;
  }

  private resize(newWidth: number, newHeight: number) {
    this.imageWidth = Math.round(newWidth);
    this.imageHeight = Math.round(newHeight);
    this.setEditingTargetSize();

    this.cropImage.setAttribute('width', this.paddedImageWidth.toString());
    this.cropImage.setAttribute('height', this.paddedImageHeight.toString());
    this.cropImage.setAttribute(
      'viewBox',
      '0 0 ' +
        this.paddedImageWidth.toString() +
        ' ' +
        this.paddedImageHeight.toString()
    );

    this.cropImageHolder.style.width = `${this.paddedImageWidth}px`;
    this.cropImageHolder.style.height = `${this.paddedImageHeight}px`;

    if (this.displayMode !== 'popup') {
      this.coverDiv.style.width = `${this.paddedImageWidth}px`;
      // this.coverDiv.style.height = `${this.paddedImageHeight}px`;
    } else {
      this.setTopLeft();
      this.positionCropImage();
    }

    this.cropLayer.scaleCanvas(this.imageWidth, this.imageHeight);
    this.applyRotation();
  }

  private setEditingTarget() {
    const canvas = document.createElement('canvas');
    canvas.width = this.target.naturalWidth;
    canvas.height = this.target.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(
      this.target,
      0,
      0,
      this.target.naturalWidth,
      this.target.naturalHeight
    );
    const imgDataURL = canvas.toDataURL();

    SvgHelper.setAttributes(this.editingTarget, [['href', imgDataURL]]);
    this.setEditingTargetSize();
  }

  private setTopLeft() {
    const targetRect = this.target.getBoundingClientRect();
    const bodyRect = this.editorCanvas.getBoundingClientRect();
    this.left = targetRect.left - bodyRect.left - this.CANVAS_MARGIN;
    this.top = targetRect.top - bodyRect.top - this.CANVAS_MARGIN;
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
    this.cropImage.setAttribute('width', this.paddedImageWidth.toString());
    this.cropImage.setAttribute('height', this.paddedImageHeight.toString());
    this.cropImage.setAttribute(
      'viewBox',
      '0 0 ' +
        this.paddedImageWidth.toString() +
        ' ' +
        this.paddedImageHeight.toString()
    );
    this.cropImage.style.pointerEvents = 'auto';

    //this.cropImageHolder.style.position = 'absolute';
    this.cropImageHolder.style.width = `${this.paddedImageWidth}px`;
    this.cropImageHolder.style.height = `${this.paddedImageHeight}px`;
    this.cropImageHolder.style.transformOrigin = 'top left';
    this.positionCropImage();

    this.defs = SvgHelper.createDefs();
    this.cropImage.appendChild(this.defs);

    this.editingTarget = SvgHelper.createImage([
      ['href', ''],
    ]);
    this.editingTarget.style.transformOrigin = `${this.imageWidth / 2}px ${this.imageHeight / 2}px`;

    this.editingTargetRotationContainer = SvgHelper.createGroup();
    this.editingTargetRotationScaleContainer = SvgHelper.createGroup();
    this.editingTargetRotationScaleContainer.appendChild(this.editingTarget);
    this.editingTargetRotationContainer.appendChild(this.editingTargetRotationScaleContainer);

    const rotate = SvgHelper.createTransform();
    this.editingTargetRotationContainer.transform.baseVal.appendItem(rotate);
    const scale = SvgHelper.createTransform();
    this.editingTargetRotationScaleContainer.transform.baseVal.appendItem(scale);

    this.editingTargetContainer = SvgHelper.createGroup();
    this.editingTargetContainer.style.transform = `translate(${this.CANVAS_MARGIN}px, ${this.CANVAS_MARGIN}px)`;

    this.editingTargetContainer.appendChild(
      this.editingTargetRotationContainer
    );

    this.cropImage.appendChild(this.editingTargetContainer);

    this.cropImageHolder.appendChild(this.cropImage);

    this.editorCanvas.appendChild(this.cropImageHolder);
  }

  private positionCropImage() {
    this.cropImageHolder.style.top = this.top + 'px';
    this.cropImageHolder.style.left = this.left + 'px';
  }

  private initCropLayer() {
    this.cropRect = {
      x: this.CANVAS_MARGIN,
      y: this.CANVAS_MARGIN,
      width: this.imageWidth,
      height: this.imageHeight,
    };

    // crop layer
    this.cropLayerContainer = SvgHelper.createGroup();
    this.cropImage.appendChild(this.cropLayerContainer);
    this.cropLayer = new CropLayer(
      this.imageWidth,
      this.imageHeight,
      this.CANVAS_MARGIN,
      this.cropLayerContainer
    );
    this.cropLayer.onCropChange = this.cropRectChanged;
    this.cropLayer.numberOfGridLines = this.gridLines;
    this.cropLayer.isGridVisible = this.isGridVisible;
    this.cropLayer.cropShadeColor = this.styles.settings.cropShadeColor;
    this.cropLayer.cropFrameColor = this.styles.settings.cropFrameColor;
    this.cropLayer.gripColor = this.styles.settings.gripColor;
    this.cropLayer.gripFillColor = this.styles.settings.gripFillColor;

    this.cropLayer.open();
    this.cropLayer.setCropRectangle(this.cropRect);
    if (this.zoomToCropEnabled) {
      this.zoomToCrop();
    }
  }

  private zoomToCrop() {
    if (this.cropRect) {
      const zoomCenterX =
        this.cropRect.x - this.CANVAS_MARGIN + this.cropRect.width / 2;
      const zoomCenterY =
        this.cropRect.y - this.CANVAS_MARGIN + this.cropRect.height / 2;

      this.zoomFactor = Math.min(
        this.imageWidth / this.cropRect.width,
        this.imageHeight / this.cropRect.height
      );

      if (this.editingTargetContainer && this.cropLayer) {
        this.editingTargetContainer.style.transformOrigin = `${zoomCenterX}px ${zoomCenterY}px`;

        this.editingTargetContainer.style.transform = `translate(${this.imageWidth / 2 
          - zoomCenterX + this.CANVAS_MARGIN}px,${this.imageHeight / 2 
            - zoomCenterY + this.CANVAS_MARGIN}px) scale(${this.zoomFactor})`;

        this.cropLayer.zoomFactor = this.zoomFactor;
      }
    }
  }

  private unzoomFromCrop() {
    this.zoomFactor = 1;
    if (this.editingTargetContainer && this.cropLayer) {
      this.editingTargetContainer.style.transformOrigin = 'center';

      this.editingTargetContainer.style.transform = `translate(${this.CANVAS_MARGIN}px, ${this.CANVAS_MARGIN}px) scale(1)`;

      this.cropLayer.zoomFactor = this.zoomFactor;
    }
  }

  private cropRectChanged(rect: IRect) {
    this.cropRect = rect;
    if (this.zoomToCropEnabled) {
      this.zoomToCrop();
    } else {
      this.cropLayer.zoomFactor = 1;
    }
  }

  private attachEvents() {
    window.addEventListener('resize', this.onWindowResize);
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
    this.addStyles();

    if (this.displayMode === 'popup') {
      this.overrideOverflow();
    }

    this.coverDiv = document.createElement('div');

    this.coverDiv.classList.add(this.styles.classNamePrefix, this.styles.coverClassName);

    // hardcode font size so nothing inside is affected by higher up settings
    this.coverDiv.style.fontSize = '16px';
    switch (this.displayMode) {
      case 'inline': {
        this.coverDiv.style.position = 'absolute';
        const toolbarOffset = this.styles.settings.hideTopToolbar ? 0 : this.toolbarHeight;
        const coverTop =
          this.target.offsetTop > toolbarOffset + this.CANVAS_MARGIN
            ? this.target.offsetTop - (toolbarOffset + this.CANVAS_MARGIN)
            : 0;
        this.coverDiv.style.top = `${coverTop}px`;
        this.coverDiv.style.left = `${
          this.target.offsetLeft > this.CANVAS_MARGIN
            ? this.target.offsetLeft - this.CANVAS_MARGIN
            : 0
        }px`;
        this.coverDiv.style.width = `${
          this.target.offsetWidth + this.CANVAS_MARGIN
        }px`;
        // this.coverDiv.style.height = `${this.target.offsetHeight + this.CANVAS_MARGIN}px`;
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
    this.uiDiv.style.margin =
      this.displayMode === 'popup' ? `${this.popupMargin}px` : '0px';
    this.uiDiv.style.border = '0px';
    // this.uiDiv.style.overflow = 'hidden';
    //this.uiDiv.style.backgroundColor = '#ffffff';
    this.coverDiv.appendChild(this.uiDiv);

    this.addToolbars();

    this.uiDiv.appendChild(this.topToolbar.getUI());

    this.contentDiv = document.createElement('div');
    this.contentDiv.style.display = 'flex';
    this.contentDiv.style.alignItems = 'center';
    this.contentDiv.style.flexDirection = 'row';
    this.contentDiv.style.flexGrow = '2';
    this.contentDiv.style.flexShrink = '1';
    this.contentDiv.style.overflow = 'hidden';
    this.contentDiv.style.backgroundColor = this.styles.settings.canvasBackgroundColor;
    if (this.displayMode === 'popup') {
      this.contentDiv.style.maxHeight = `calc(100vh - ${
        this.popupMargin * 2 + this.toolbarHeight * 2
      }px)`;
      this.contentDiv.style.maxWidth = `calc(100vw - ${
        this.popupMargin * 2
      }px)`;
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

    this.uiDiv.appendChild(this.bottomToolbar.getUI());

    this.straightener.angle = this.rotationAngle;
  }

  private addToolbars() {
    this.addTopToolbar();
    this.addBottomToolbar();
  }

  private addTopToolbar() {
    this.topToolbar = new Toolbar();
    this.topToolbar.display = this.styles.settings.hideTopToolbar ? 'none' : '';
    this.topToolbar.className = this.toolbarStyleClass.name;
    this.topToolbar.colorsClassName = this.styles.settings
      .toolbarStyleColorsClassName
      ? this.styles.settings.toolbarStyleColorsClassName
      : this.toolbarStyleColorsClass.name;
    this.topToolbar.fadeInClassName = this.styles.fadeInAnimationClassName;

    this.topToolbar.blockClassName = this.toolbarBlockStyleClass.name;

    this.topToolbar.buttonClassName = this.toolbarButtonStyleClass.name;
    this.topToolbar.buttonColorsClassName = this.styles.settings
      .toolbarButtonStyleColorsClassName
      ? this.styles.settings.toolbarButtonStyleColorsClassName
      : this.toolbarButtonStyleColorsClass.name;
    this.topToolbar.buttonActiveColorsClassName = this.styles.settings
      .toolbarActiveButtonStyleColorsClassName
      ? this.styles.settings.toolbarActiveButtonStyleColorsClassName
      : this.toolbarActiveButtonStyleColorsClass.name;

    const cropBlock = new ToolbarButtonBlock();
    cropBlock.minWidth = `${this.toolbarHeight * 3}px`;
    this.topToolbar.addButtonBlock(cropBlock);

    const ratioButtons: ToolbarButton[] = [];
    this.aspectRatios.forEach((ratio) => {
      const button = new ToolbarButton(
        AspectRatioIconGenerator.getIcon(ratio.horizontal, ratio.vertical),
        ratio.horizontal === 0 && ratio.vertical === 0
          ? 'FREE'
          : `${ratio.horizontal}:${ratio.vertical}`
      );
      button.onClick = () => this.ratioButtonClicked(ratio);
      ratioButtons.push(button);
    });

    this.aspectRatioButton = new DropdownToolbarButton(
      AspectRatioIconGenerator.getIcon(0, 0),
      'Aspect ratio',
      ratioButtons
    );
    this.aspectRatioButton.dropdownClassName = this.toolbarDropdownStyleClass.name;
    this.aspectRatioButton.dropdownColorsClassName = this.styles.settings
      .toolbarDropdownStyleColorsClassName
      ? this.styles.settings.toolbarDropdownStyleColorsClassName
      : this.toolbarDropdownStyleColorsClass.name;

    cropBlock.addButton(this.aspectRatioButton);

    if (this.aspectRatios.length < 2) {
      this.aspectRatioButton.hide();
    }

    const gridButton = new ToolbarButton(GridIcon, 'Toggle grid');
    gridButton.isActive = this.isGridVisible;
    gridButton.onClick = () => {
      this.isGridVisible = !this.isGridVisible;
      gridButton.isActive = this.isGridVisible;
    };
    cropBlock.addButton(gridButton);

    const zoomButton = new ToolbarButton(ZoomIcon, 'Zoom to selection');
    zoomButton.isActive = this.zoomToCropEnabled;
    zoomButton.onClick = () => {
      this.zoomToCropEnabled = !this.zoomToCropEnabled;
      zoomButton.isActive = this.zoomToCropEnabled;
    };
    cropBlock.addButton(zoomButton);

    /**
     * NOTE:
     *
     * before removing or modifying the code below please consider supporting CROPRO
     * by visiting https://markerjs.com/products/cropro for details
     *
     * thank you!
     */
    if (!Activator.isLicensed) {
      const logoBlock = new ToolbarElementBlock();
      this.topToolbar.addElementBlock(logoBlock);

      //const logoButton = new ToolbarButton(LogoIcon, 'Powered by CROPRO');
      const logoButton = document.createElement('div');
      logoButton.className = `${this.topToolbar.buttonClassName} ${this.topToolbar.buttonColorsClassName}`;
      const logoLink = document.createElement('a');
      logoLink.style.color = 'currentColor';
      logoLink.href = 'https://markerjs.com/products/cropro';
      logoLink.target = '_blank';
      logoLink.innerHTML = LogoIcon;
      logoButton.appendChild(logoLink);
      logoBlock.addElement(logoButton);
    }

    const actionBlock = new ToolbarButtonBlock();
    actionBlock.minWidth = `${this.toolbarHeight * 3}px`;
    actionBlock.contentAlign = 'end';
    this.topToolbar.addButtonBlock(actionBlock);

    const okButton = new ToolbarButton(CheckIcon, 'OK');
    okButton.onClick = this.startRenderAndClose;
    actionBlock.addButton(okButton);
    if (this.styles.settings.toolbarOkButtonStyleColorsClassName) {
      okButton.colorsClassName = this.styles.settings.toolbarOkButtonStyleColorsClassName;
    }
    const closeButton = new ToolbarButton(CloseIcon, 'Close');
    closeButton.onClick = this.close;
    actionBlock.addButton(closeButton);
    if (this.styles.settings.toolbarCloseButtonStyleColorsClassName) {
      closeButton.colorsClassName = this.styles.settings.toolbarCloseButtonStyleColorsClassName;
    }
  }

  private addBottomToolbar() {
    this.bottomToolbar = new Toolbar();
    this.bottomToolbar.display = this.styles.settings.hideBottomToolbar ? 'none' : '';    
    this.bottomToolbar.className = this.toolbarStyleClass.name;
    this.bottomToolbar.colorsClassName = this.styles.settings
      .toolbarStyleColorsClassName
      ? this.styles.settings.toolbarStyleColorsClassName
      : this.toolbarStyleColorsClass.name;
    this.bottomToolbar.fadeInClassName = this.styles.fadeInAnimationClassName;

    this.bottomToolbar.blockClassName = this.toolbarBlockStyleClass.name;

    this.bottomToolbar.buttonClassName = this.toolbarButtonStyleClass.name;
    this.bottomToolbar.buttonColorsClassName = this.styles.settings
      .toolbarButtonStyleColorsClassName
      ? this.styles.settings.toolbarButtonStyleColorsClassName
      : this.toolbarButtonStyleColorsClass.name;
    this.bottomToolbar.buttonActiveColorsClassName = this.styles.settings
      .toolbarActiveButtonStyleColorsClassName
      ? this.styles.settings.toolbarActiveButtonStyleColorsClassName
      : this.toolbarActiveButtonStyleColorsClass.name;

    const rotateBlock = new ToolbarButtonBlock();
    rotateBlock.minWidth = `${this.toolbarHeight * 2}px`;
    this.bottomToolbar.addButtonBlock(rotateBlock);

    const rotateLeftButton = new ToolbarButton(RotateLeftIcon, 'Rotate left');
    rotateLeftButton.onClick = this.rotateLeftButtonClicked;
    rotateBlock.addButton(rotateLeftButton);
    const rotateRightButton = new ToolbarButton(
      RotateRightIcon,
      'Rotate right'
    );
    rotateRightButton.onClick = this.rotateRightButtonClicked;
    rotateBlock.addButton(rotateRightButton);

    const straightenBlock = new ToolbarElementBlock();
    straightenBlock.className = this.toolbarStraightenerBlockStyleClass.name;
    this.bottomToolbar.addElementBlock(straightenBlock);

    this.straightener = new StraightenControl('Straighten');
    this.straightener.className = this.toolbarStraightenerStyleClass.name;
    this.straightener.colorsClassName = this.styles.settings
      .toolbarStraightenerColorsClassName
      ? this.styles.settings.toolbarStraightenerColorsClassName
      : this.toolbarStraightenerStyleColorsClass.name;
    this.straightener.onAngleChange = (delta: number) => {
      this.rotateBy(delta);
      this.straightener.angle = this.rotationAngle;
    };
    straightenBlock.addElement(this.straightener.getUI());

    const flipBlock = new ToolbarButtonBlock();
    flipBlock.minWidth = `${this.toolbarHeight * 2}px`;
    flipBlock.contentAlign = 'end';
    this.bottomToolbar.addButtonBlock(flipBlock);

    const flipHorButton = new ToolbarButton(
      FlipHotizontalIcon,
      'Flip horizontal'
    );
    flipHorButton.onClick = this.flipHorizontallyButtonClicked;
    flipBlock.addButton(flipHorButton);

    const flipVerButton = new ToolbarButton(FlipVerticalIcon, 'Flip vertical');
    flipVerButton.onClick = this.flipVerticallyButtonClicked;
    flipBlock.addButton(flipVerButton);
  }

  private ratioButtonClicked(ratio: IAspectRatio) {
    this.aspectRatio = ratio;
    this.applyAspectRatio();
    this.aspectRatioButton.hideDropdown();
  }

  private applyAspectRatio() {
    this.setCropLayerAspectRatio();
    this.aspectRatioButton.icon = AspectRatioIconGenerator.getIcon(
      this.aspectRatio.horizontal,
      this.aspectRatio.vertical
    );
  }

  private setCropLayerAspectRatio() {
    if (this.cropLayer) {
      if (
        this.aspectRatio &&
        this.aspectRatio.horizontal !== 0 &&
        this.aspectRatio.vertical !== 0
      ) {
        this.cropLayer.aspectRatio = new AspectRatio(
          this.aspectRatio.horizontal,
          this.aspectRatio.vertical
        );
      } else {
        this.cropLayer.aspectRatio = undefined;
      }
    }
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
      height: this.imageHeight,
      rotationAngle: this.rotationAngle,
      flippedHorizontally: this.flippedHorizontally,
      flippedVertically: this.flippedVertically,
      cropRect: Object.assign({}, this.cropRect),
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
    if (state) {
      const newRect = this.cropLayer.getRescaledRect(
        state.width,
        state.height,
        this.imageWidth,
        this.imageHeight,
        state.cropRect,
        this.CANVAS_MARGIN
      );
      this.cropLayer.setCropRectangle(newRect);
      this.cropRectChanged(newRect);
      this.flippedHorizontally = state.flippedHorizontally;
      this.flippedVertically = state.flippedVertically;
      this.applyFlip();
      this.rotationAngle = state.rotationAngle;
      this.applyRotation();
    }
  }

  private clientToLocalCoordinates(x: number, y: number): IPoint {
    const clientRect = this.cropImage.getBoundingClientRect();
    return { x: x - clientRect.left, y: y - clientRect.top };
  }

  private onWindowResize() {
    this.positionUI();
  }

  private positionUI() {
    this.setTopLeft();
    switch (this.displayMode) {
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
        this.contentDiv.style.maxHeight = `calc(100vh - ${
          this.popupMargin * 2 + this.toolbarHeight * 2
        }px)`;
      }
    }
    this.positionCropImage();
  }

  private rotateLeftButtonClicked() {
    let angle = this.rotationAngle - 90;
    if (this.rotationAngle % 90 !== 0) {
      angle +=
        this.rotationAngle >= 0
          ? 90 - (this.rotationAngle % 90)
          : -this.rotationAngle % 90;
    }
    this.rotateTo(angle);
  }

  private rotateRightButtonClicked() {
    let angle = this.rotationAngle + 90;
    if (this.rotationAngle % 90 !== 0) {
      angle -=
        this.rotationAngle >= 0
          ? this.rotationAngle % 90
          : 90 + (this.rotationAngle % 90);
    }
    this.rotateTo(angle);
  }

  private rotateTo(angle: number) {
    angle = angle > 180 ? angle - 360 : angle;
    angle = angle <= -180 ? angle + 360 : angle;
    this.rotationAngle = angle;

    this.applyRotation();
  }
  private rotateBy(degrees: number) {
    this.rotateTo((this.rotationAngle + degrees) % 360);
  }

  private applyRotation() {
    // scale to original for accurate measuring
    const ztcCurrent = this.zoomToCropEnabled;
    this.zoomToCropEnabled = false;

    //this.editingTargetRotationScaleContainer.style.transformOrigin = 'center';
    this.editingTargetRotationScaleContainer.style.transformOrigin = `${this.imageWidth / 2}px ${this.imageHeight / 2}px`;
    this.editingTargetRotationScaleContainer.style.transform = 'scale(1)';

    const rotate = this.editingTargetRotationContainer.transform.baseVal.getItem(
      0
    );
    rotate.setRotate(this.rotationAngle, this.imageWidth / 2, this.imageHeight / 2);
    this.editingTargetRotationContainer.transform.baseVal.replaceItem(
      rotate,
      0
    );

    // measure and rescale to fit
    const boundingBox = this.editingTarget.getBoundingClientRect();
    const scaleFactor = Math.min(
      this.imageWidth / boundingBox.width,
      this.imageHeight / boundingBox.height
    );
    this.editingTargetRotationScaleContainer.style.transform = `scale(${scaleFactor})`;

    this.zoomToCropEnabled = ztcCurrent;
  }

  private flipHorizontallyButtonClicked() {
    this.flippedHorizontally = !this.flippedHorizontally;
    this.applyFlip();
  }

  private flipVerticallyButtonClicked() {
    this.flippedVertically = !this.flippedVertically;
    this.applyFlip();
  }

  private applyFlip() {
    this.editingTarget.style.transform = `scale(${
      this.flippedHorizontally ? -1 : 1},${this.flippedVertically ? -1 : 1})`;
  }

  /**
   * Initiates rendering of the cropped image.
   * Add an event listener for the `render` event via {@linkcode addRenderEventListener}
   * to get the rendering result.
   */
  public async startRenderAndClose(): Promise<void> {
    const result = await this.render();
    const state = this.getState();
    this.renderEventListeners.forEach((listener) => listener(result, state));
    this.close(true);
  }

  private async render(): Promise<string> {
    const renderer = new Renderer();
    renderer.naturalSize = this.renderAtNaturalSize;
    renderer.imageType = this.renderImageType;
    renderer.imageQuality = this.renderImageQuality;
    renderer.width = this.renderWidth;
    renderer.height = this.renderHeight;

    this.unzoomFromCrop();
    SvgHelper.setAttributes(this.cropLayerContainer, [['display', 'none']]);

    // workaround for Safari (doesn't render on the first call in Safari)
    await renderer.rasterize(
      this.cropImage,
      this.target,
      {
        x: this.cropRect.x,
        y: this.cropRect.y,
        width: this.cropRect.width,
        height: this.cropRect.height,
      },
      this.CANVAS_MARGIN
    );

    return await renderer.rasterize(
      this.cropImage,
      this.target,
      {
        x: this.cropRect.x,
        y: this.cropRect.y,
        width: this.cropRect.width,
        height: this.cropRect.height,
      },
      this.CANVAS_MARGIN
    );
  }

  private addStyles() {
    this.toolbarStyleClass = this.styles.addClass(
      new StyleClass(
        'toolbar',
        `
      width: ${
        this.displayMode === 'inline'
          ? '100%'
          : 'calc(100vw - ' + this.popupMargin * 2 + 'px)'
      };
      flex-shrink: 0;
      display: flex;
      flex-direction: row;
      justify-content: space-between;      
      height: ${this.toolbarHeight}px;
      box-sizing: content-box;
      overflow: hidden;
      line-height: 0px;
    `
      )
    );

    this.toolbarStyleColorsClass = this.styles.addClass(
      new StyleClass(
        'toolbar_colors',
        `
      background-color: ${this.styles.settings.toolbarBackgroundColor};
    `
      )
    );

    this.toolbarBlockStyleClass = this.styles.addClass(
      new StyleClass(
        'toolbar-block',
        `
        display: flex;
        align-items: center;
        box-sizing: content-box;
    `
      )
    );

    const buttonPadding = this.toolbarHeight / 4;
    this.toolbarButtonStyleClass = this.styles.addClass(
      new StyleClass(
        'toolbar_button',
        `
      display: inline-block;
      width: ${this.toolbarHeight - buttonPadding * 2}px;
      height: ${this.toolbarHeight - buttonPadding * 2}px;
      padding: ${buttonPadding}px;
      cursor: default;
      user-select: none;
      box-sizing: content-box;
    `
      )
    );
    this.toolbarButtonStyleColorsClass = this.styles.addClass(
      new StyleClass(
        'toolbar_button_colors',
        `
      color: ${this.styles.settings.toolbarColor};
      fill: currentColor;
    `
      )
    );

    this.toolbarActiveButtonStyleColorsClass = this.styles.addClass(
      new StyleClass(
        'toolbar_active_button',
        `
      color: ${this.styles.settings.toolbarColor};
      fill: currentColor;
      background-color: ${this.styles.settings.toolbarBackgroundActiveColor}
    `
      )
    );

    this.styles.addRule(
      new StyleRule(
        `.${this.toolbarButtonStyleClass.name} svg`,
        `
      height: ${this.toolbarHeight / 2}px;
    `
      )
    );

    this.styles.addRule(
      new StyleRule(
        `.${this.toolbarButtonStyleColorsClass.name}:hover`,
        `
        background-color: ${this.styles.settings.toolbarBackgroundHoverColor}
    `
      )
    );

    this.toolbarDropdownStyleClass = this.styles.addClass(
      new StyleClass(
        'toolbar_dropdown',
        `
      position: absolute;
      max-width: ${this.toolbarHeight * 4}px;
      z-index: 20;
      white-space: normal;
      box-sizing: content-box;
      box-shadow: 3px 3px rgba(33, 33, 33, 0.1);
      margin: ${this.displayMode === 'inline' ? '0' : this.popupMargin}px;
      line-height: 0px;
    `
      )
    );

    this.toolbarDropdownStyleColorsClass = this.styles.addClass(
      new StyleClass(
        'toolbar_dropdown_colors',
        `
      background-color: ${this.styles.settings.toolbarBackgroundColor};
    `
      )
    );

    this.toolbarStraightenerBlockStyleClass = this.styles.addClass(
      new StyleClass(
        'toolbar_straightener_block',
        `
      display: flex;
      overflow: hidden;
      justify-content: center;
      -webkit-mask-image: linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 30%, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%);
    `
      )
    );
    this.toolbarStraightenerStyleClass = this.styles.addClass(
      new StyleClass(
        'toolbar_straightener',
        `
      display: flex;
      overflow: hidden;
      justify-content: center;
      height: ${this.toolbarHeight - buttonPadding * 2}px;
      padding: ${buttonPadding}px;
      cursor: default;
      user-select: none;
      box-sizing: content-box;
    `
      )
    );
    this.toolbarStraightenerStyleColorsClass = this.styles.addClass(
      new StyleClass(
        'toolbar_straightener_colors',
        `
      color: ${this.styles.settings.toolbarColor};
      fill: currentColor;
    `
      )
    );
  }
}
