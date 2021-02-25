import { Activator } from './core/Activator';
import { SvgHelper } from './core/SvgHelper';
import { CropAreaState } from './CropAreaState';

import Logo from './assets/markerjs-logo-m.svg';
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
import { AspectRatioIconGenerator } from './core/AspectRatioIconGenerator';
import { DropdownToolbarButton } from './core/DropdownToolbarButton';
import { AspectRatio, IAspectRatio } from './core/AspectRatio';
import { CropLayer } from './CropLayer';

/**
 * Event handler type for {@linkcode MarkerArea} `render` event.
 */
export type RenderEventHandler = (
  dataURL: string,
  state?: CropAreaState
) => void;
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

  private static instanceCounter = 0;
  private _instanceNo: number;
  public get instanceNo(): number {
    return this._instanceNo;
  }

  private styleManager: StyleManager;

  private cropLayer: CropLayer;

  private toolbarStyleClass: StyleClass;
  private toolbarStyleColorsClass: StyleClass;
  private toolbarBlockStyleClass: StyleClass;
  private toolbarButtonStyleClass: StyleClass;
  private toolbarButtonStyleColorsClass: StyleClass;
  private toolbarActiveButtonStyleColorsClass: StyleClass;
  private toolbarDropdownStyleClass: StyleClass;

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
  toolbarHeight = 40;

  public aspectRatios: IAspectRatio[] = [
    { horizontal: 0, vertical: 0 },
    { horizontal: 1, vertical: 1 },
    { horizontal: 4, vertical: 3 },
    { horizontal: 3, vertical: 2 },
    { horizontal: 16, vertical: 9 },
    { horizontal: 3, vertical: 4 },
    { horizontal: 2, vertical: 3 },
    { horizontal: 9, vertical: 16 },
  ];
  public aspectRatio = this.aspectRatios[0];

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

    this.styleManager = new StyleManager(this.instanceNo);

    this.target = target;
    this.targetRoot = document.body;

    this.open = this.open.bind(this);
    this.setTopLeft = this.setTopLeft.bind(this);

    // @todo
    // this.toolbarButtonClicked = this.toolbarButtonClicked.bind(this);
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
    this.initCropLayer();
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
        const ratio =
          (1.0 * this.target.clientWidth) / this.target.clientHeight;
        const newWidth =
          this.editorCanvas.clientWidth / ratio > this.editorCanvas.clientHeight
            ? this.editorCanvas.clientHeight * ratio
            : this.editorCanvas.clientWidth;
        const newHeight =
          newWidth < this.editorCanvas.clientWidth
            ? this.editorCanvas.clientHeight
            : this.editorCanvas.clientWidth / ratio;
        this.resize(newWidth, newHeight);
      });
      this.targetObserver.observe(this.editorCanvas);
      window.addEventListener('resize', this.setWindowHeight);
    }
  }

  private setWindowHeight() {
    this.windowHeight = window.innerHeight;
  }

  private setEditingTargetSize() {
    this.editingTarget.width = this.imageWidth;
    this.editingTarget.height = this.imageHeight;
    this.editingTarget.style.width = `${this.imageWidth}px`;
    this.editingTarget.style.height = `${this.imageHeight}px`;
    this.editingTarget.style.margin = `${this.CANVAS_MARGIN}px`;
  }

  private resize(newWidth: number, newHeight: number) {
    // @todo
    // const scaleX = newWidth / this.imageWidth;
    // const scaleY = newHeight / this.imageHeight;

    this.imageWidth = Math.round(newWidth);
    this.imageHeight = Math.round(newHeight);
    this.editingTarget.src = this.target.src;
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
    this.setEditingTargetSize();
  }

  private setTopLeft() {
    const targetRect = this.editingTarget.getBoundingClientRect();
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

    this.cropImageHolder.style.position = 'absolute';
    this.cropImageHolder.style.width = `${this.paddedImageWidth}px`;
    this.cropImageHolder.style.height = `${this.paddedImageHeight}px`;
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

  private initCropLayer() {
    // crop layer
    const cropLayerG = SvgHelper.createGroup();
    this.cropImage.appendChild(cropLayerG);
    this.cropLayer = new CropLayer(
      this.paddedImageWidth,
      this.paddedImageHeight,
      cropLayerG
    );
    this.cropLayer.open();
    this.cropLayer.setCropRectangle({
      x: 30 + this.CANVAS_MARGIN,
      y: 30 + this.CANVAS_MARGIN,
      width: this.imageWidth - 60,
      height: this.imageHeight - 60,
    });
  }

  private attachEvents() {
    window.addEventListener('resize', this.onWindowResize);
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
    this.addStyles();

    if (this.displayMode === 'popup') {
      this.overrideOverflow();
    }

    this.coverDiv = document.createElement('div');

    this.coverDiv.className = this.styleManager.classNamePrefix;

    // hardcode font size so nothing inside is affected by higher up settings
    this.coverDiv.style.fontSize = '16px';
    switch (this.displayMode) {
      case 'inline': {
        this.coverDiv.style.position = 'absolute';
        const coverTop =
          this.target.offsetTop > this.toolbarHeight + this.CANVAS_MARGIN
            ? this.target.offsetTop - (this.toolbarHeight + this.CANVAS_MARGIN)
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
    this.contentDiv.style.backgroundColor = 'white';
    if (this.displayMode === 'popup') {
      this.contentDiv.style.maxHeight = `${
        this.windowHeight - this.popupMargin * 2 - this.toolbarHeight * 3.5
      }px`;
      // this.contentDiv.style.maxHeight = `calc(100vh - ${
      //   this.settings.popupMargin * 2 + this.uiStyleSettings.toolbarHeight * 3.5}px)`;
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

    this.editingTarget = document.createElement('img');
    this.editorCanvas.appendChild(this.editingTarget);

    this.uiDiv.appendChild(this.bottomToolbar.getUI());
  }

  private addToolbars() {
    this.addTopToolbar();
    this.addBottomToolbar();
  }

  private addTopToolbar() {
    this.topToolbar = new Toolbar();
    this.topToolbar.className = this.toolbarStyleClass.name;
    this.topToolbar.colorsClassName = this.toolbarStyleColorsClass.name;
    this.topToolbar.fadeInClassName = this.styleManager.fadeInAnimationClassName;

    this.topToolbar.blockClassName = this.toolbarBlockStyleClass.name;

    this.topToolbar.buttonClassName = this.toolbarButtonStyleClass.name;
    this.topToolbar.buttonColorsClassName = this.toolbarButtonStyleColorsClass.name;

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

    cropBlock.addButton(this.aspectRatioButton);

    cropBlock.addButton(new ToolbarButton(GridIcon, 'Toggle grid'));
    cropBlock.addButton(new ToolbarButton(ZoomIcon, 'Zoom to selection'));

    const logoBlock = new ToolbarElementBlock();
    this.topToolbar.addElementBlock(logoBlock);

    const logoText = document.createElement('div');
    logoText.innerHTML = 'CROPRO';
    logoText.style.color = 'white';
    logoBlock.addElement(logoText);

    const actionBlock = new ToolbarButtonBlock();
    actionBlock.minWidth = `${this.toolbarHeight * 3}px`;
    actionBlock.contentAlign = 'end';
    this.topToolbar.addButtonBlock(actionBlock);

    const okButton = new ToolbarButton(CheckIcon, 'OK');
    okButton.onClick = this.closeUI;
    actionBlock.addButton(okButton);
    const closeButton = new ToolbarButton(CloseIcon, 'Close');
    closeButton.onClick = this.closeUI;
    actionBlock.addButton(closeButton);
  }

  private addBottomToolbar() {
    this.bottomToolbar = new Toolbar();
    this.bottomToolbar.className = this.toolbarStyleClass.name;
    this.bottomToolbar.colorsClassName = this.toolbarStyleColorsClass.name;
    this.bottomToolbar.fadeInClassName = this.styleManager.fadeInAnimationClassName;

    this.bottomToolbar.blockClassName = this.toolbarBlockStyleClass.name;

    this.bottomToolbar.buttonClassName = this.toolbarButtonStyleClass.name;
    this.bottomToolbar.buttonColorsClassName = this.toolbarButtonStyleColorsClass.name;

    const rotateBlock = new ToolbarButtonBlock();
    rotateBlock.minWidth = `${this.toolbarHeight * 2}px`;
    this.bottomToolbar.addButtonBlock(rotateBlock);

    rotateBlock.addButton(new ToolbarButton(RotateLeftIcon, 'Rotate left'));
    rotateBlock.addButton(new ToolbarButton(RotateRightIcon, 'Rotate right'));

    const straightenBlock = new ToolbarElementBlock();
    this.bottomToolbar.addElementBlock(straightenBlock);

    const tempStraightener = document.createElement('div');
    tempStraightener.innerHTML = '-------';
    tempStraightener.style.color = 'white';
    straightenBlock.addElement(tempStraightener);

    const flipBlock = new ToolbarButtonBlock();
    flipBlock.minWidth = `${this.toolbarHeight * 2}px`;
    flipBlock.contentAlign = 'end';
    this.bottomToolbar.addButtonBlock(flipBlock);

    flipBlock.addButton(
      new ToolbarButton(FlipHotizontalIcon, 'Flip horizontal')
    );
    flipBlock.addButton(new ToolbarButton(FlipVerticalIcon, 'Flip vertical'));
  }

  private ratioButtonClicked(ratio: IAspectRatio) {
    this.aspectRatio = ratio;
    this.setCropLayerAspectRatio();
    this.aspectRatioButton.icon = AspectRatioIconGenerator.getIcon(
      ratio.horizontal,
      ratio.vertical
    );
    this.aspectRatioButton.hideDropdown();
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
      state.width &&
      state.height &&
      (state.width !== this.imageWidth || state.height !== this.imageHeight)
    ) {
      // @todo
      // this.scaleMarkers(this.imageWidth / state.width, this.imageHeight / state.height);
    }
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
        this.contentDiv.style.maxHeight = `${
          this.windowHeight - this.popupMargin * 2 - this.toolbarHeight * 3.5
        }px`;
      }
    }
    this.positionCropImage();
    this.positionLogo();
  }

  private addStyles() {
    this.toolbarStyleClass = this.styleManager.addClass(
      new StyleClass(
        'toolbar',
        `
      width: 100%;
      flex-shrink: 0;
      display: flex;
      flex-direction: row;
      justify-content: space-between;      
      height: ${this.toolbarHeight}px;
      box-sizing: content-box;
      overflow: hidden;
    `
      )
    );

    this.toolbarStyleColorsClass = this.styleManager.addClass(
      new StyleClass(
        'toolbar_colors',
        `
      background-color: ${this.styleManager.settings.toolbarBackgroundColor};
    `
      )
    );

    this.toolbarBlockStyleClass = this.styleManager.addClass(
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
    this.toolbarButtonStyleClass = this.styleManager.addClass(
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
    this.toolbarButtonStyleColorsClass = this.styleManager.addClass(
      new StyleClass(
        'toolbar_button_colors',
        `
      fill: ${this.styleManager.settings.toolbarColor};
    `
      )
    );

    this.toolbarActiveButtonStyleColorsClass = this.styleManager.addClass(
      new StyleClass(
        'toolbar_active_button',
        `
      fill: ${this.styleManager.settings.toolbarColor};
      background-color: ${this.styleManager.settings.toolbarBackgroundHoverColor}
    `
      )
    );

    this.styleManager.addRule(
      new StyleRule(
        `.${this.toolbarButtonStyleClass.name} svg`,
        `
      height: ${this.toolbarHeight / 2}px;
    `
      )
    );

    this.styleManager.addRule(
      new StyleRule(
        `.${this.toolbarButtonStyleColorsClass.name}:hover`,
        `
        background-color: ${this.styleManager.settings.toolbarBackgroundHoverColor}
    `
      )
    );

    this.toolbarDropdownStyleClass = this.styleManager.addClass(
      new StyleClass(
        'toolbar_dropdown',
        `
      position: absolute;
      width: ${this.toolbarHeight * 4}px;
      background-color: ${this.styleManager.settings.toolbarBackgroundColor};
      z-index: 20;
      white-space: normal;
      box-sizing: content-box;
      box-shadow: 3px 3px rgba(33, 33, 33, 0.1);
    `
      )
    );
  }
}
