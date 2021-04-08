import { SvgHelper } from './SvgHelper';
import { IPoint } from './IPoint';

/**
 * Angle change handler.
 */
export type AngleChangeHandler = (delta: number) => void;

/**
 * Represents a custom straightener/rotation control.
 */
export class StraightenControl {
  private title: string;

  private _angle = 0;
  /**
   * Current rotation angle.
   */
  public get angle(): number {
    return this._angle;
  }
  public set angle(value: number) {
    this._angle = value;
    this.setAngleLabel();
    this.positionScaleShape();
  }
  /**
   * Method to call when rotation angle changes.
   */
  public onAngleChange: AngleChangeHandler;

  private previousPoint: IPoint;
  private isDragging = false;

  private uiContainer: HTMLDivElement;
  private controlContainer: HTMLDivElement;

  private scaleShape: SVGPathElement;
  private angleLabelElement: SVGTextElement;
  private angleLabelText: SVGTSpanElement;

  /**
   * CSS class name representing layout style.
   */
  public className: string;
  /**
   * CSS class name representing visual style.
   */
  public colorsClassName: string;

  /**
   * Width of the scale image (max width of the control).
   */
  public width = 401;
  /**
   * Control height.
   */
  public height = 24;

  /**
   * Initializes new straightener control.
   * @param title - control title.
   */
  constructor(title: string) {
    this.title = title;
    this.uiContainer = document.createElement('div');

    this.getUI = this.getUI.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);

    this.setAngleLabel = this.setAngleLabel.bind(this);
    this.positionScaleShape = this.positionScaleShape.bind(this);
  }

  /**
   * Returns control UI.
   * @returns control's UI as an `HTMLElement`.
   */
  public getUI(): HTMLElement {
    this.controlContainer = document.createElement('div');
    this.controlContainer.title = this.title;
    this.controlContainer.className = `${this.className} ${this.colorsClassName}`;
    this.controlContainer.appendChild(this.getVisual());

    this.controlContainer.addEventListener('pointerdown', this.onPointerDown);
    this.controlContainer.addEventListener('pointermove', this.onPointerMove);
    this.controlContainer.addEventListener('pointerup', this.onPointerUp);

    this.uiContainer.appendChild(this.controlContainer);
    this.uiContainer.style.display = 'inline-block';
    this.uiContainer.style.touchAction = 'none';

    this.setAngleLabel();
    this.positionScaleShape();

    return this.uiContainer;
  }

  private onPointerDown(ev: PointerEvent) {
    this.controlContainer.setPointerCapture(ev.pointerId);
    this.isDragging = true;
    this.previousPoint = { x: ev.clientX, y: ev.clientY };
  }
  private onPointerMove(ev: PointerEvent) {
    if (this.isDragging) {
      if (this.onAngleChange) {
        this.onAngleChange((ev.clientX - this.previousPoint.x) / 5);
      }
      this.previousPoint.x = ev.clientX;
    }
  }
  private onPointerUp(ev: PointerEvent) {
    if (this.isDragging && this.onAngleChange) {
      this.onAngleChange((ev.clientX - this.previousPoint.x) / 5);
    }
    this.isDragging = false;
    this.controlContainer.releasePointerCapture(ev.pointerId);
  }

  private setAngleLabel() {
    if (this.angleLabelText) {
      this.angleLabelText.innerHTML = `${Math.round(this._angle)}`;
      const textBBox = this.angleLabelText.getBBox();
      SvgHelper.setAttributes(this.angleLabelElement, [
        ['x', ((this.width - textBBox.width) / 2).toString()],
        ['y', (this.height / 2).toString()],
      ]);
    }
  }

  private positionScaleShape() {
    if (this.scaleShape) {
      const translate = this.scaleShape.transform.baseVal.getItem(0);
      translate.setTranslate((this._angle % 5) * 5 - 25, 0);
      this.scaleShape.transform.baseVal.replaceItem(translate, 0);
    }
  }

  private getVisual(): SVGSVGElement {
    const degreeStep = 5;

    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    icon.setAttribute('width', `${this.width}px`);
    icon.setAttribute('height', `${this.height}px`);
    icon.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);
    icon.style.flexShrink = '0';

    document.body.appendChild(icon);

    let d = `M0,${this.height-1} v${-this.height / 3}h1v${this.height/3}`;
    for (let i = 1; i <= (this.width / degreeStep + 10); i++) {
      const tipHeight = i % 5 === 0 ? this.height / 3 : this.height / 6;
      d += `h4v${-tipHeight}h1v${tipHeight}`;
    }
    d+='v1H0Z';

    this.scaleShape = SvgHelper.createPath(d);
    const translate = SvgHelper.createTransform();
    this.scaleShape.transform.baseVal.appendItem(translate);
    icon.appendChild(this.scaleShape);

    this.angleLabelElement = SvgHelper.createText([
      ['x', '0'],
      ['y', '0'],
      ['font-size', '10px'],
      ['font-family', 'monospace'],
    ]);
    this.angleLabelText = SvgHelper.createTSpan('');
    this.angleLabelElement.appendChild(this.angleLabelText);
    const degLabel = SvgHelper.createTSpan('');
    degLabel.innerHTML = '&deg;';
    this.angleLabelElement.appendChild(degLabel);
    icon.appendChild(this.angleLabelElement);

    document.body.removeChild(icon);

    return icon;
  }
}
