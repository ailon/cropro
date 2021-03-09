import { SvgHelper } from '..';
import { IPoint } from './IPoint';

/**
 * Angle change handler.
 */
export type AngleChangeHandler = (delta: number) => void;

export class StraightenControl {
  private title: string;

  private _angle = 0;
  public get angle(): number {
    return this._angle;
  }
  public set angle(value: number) {
    this._angle = value;
    if (this.angleLabelText) {
      this.angleLabelText.innerHTML = `${Math.round(this._angle)}`;
    }
    if (this.scaleShape) {
      const translate = this.scaleShape.transform.baseVal.getItem(0);
      translate.setTranslate((this._angle % 5) * 5 - 25, 0);
      this.scaleShape.transform.baseVal.replaceItem(translate, 0);
    }
  }
  public onAngleChange: AngleChangeHandler;

  private previousPoint: IPoint;
  private isDragging = false;

  protected uiContainer: HTMLDivElement;
  protected controlContainer: HTMLDivElement;

  private scaleShape: SVGPathElement;
  private angleLabelElement: SVGTextElement;
  private angleLabelText: SVGTSpanElement;

  public className: string;
  public colorsClassName: string;

  constructor(title: string) {
    this.title = title;
    this.uiContainer = document.createElement('div');

    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
  }

  public getUI(): HTMLElement {
    this.controlContainer = document.createElement('div');
    this.controlContainer.title = this.title;
    this.controlContainer.className = `${this.className} ${this.colorsClassName}`;
    this.controlContainer.appendChild(this.getVisual());

    this.controlContainer.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);

    this.uiContainer.appendChild(this.controlContainer);
    this.uiContainer.style.display = 'inline-block';

    return this.uiContainer;
  }

  private onPointerDown(ev: PointerEvent) {
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
  }

  private getVisual(): SVGSVGElement {
    const degreeStep = 5;
    const width = 100;
    const height = 24;

    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    icon.setAttribute('viewBox', `0 0 ${width} ${height}`);

    document.body.appendChild(icon);

    let d = `M0,${height-1} v${-height / 3}h1v${height/3}`;
    for (let i = 1; i <= (width / degreeStep + 10); i++) {
      const tipHeight = i % 5 === 0 ? height / 3 : height / 6;
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
      ['font-size', '7px'],
      ['font-family', 'monospace'],
    ]);
    this.angleLabelText = SvgHelper.createTSpan(`${this.angle}`);
    this.angleLabelElement.appendChild(this.angleLabelText);
    icon.appendChild(this.angleLabelElement);

    const textBBox = this.angleLabelElement.getBBox();
    SvgHelper.setAttributes(this.angleLabelElement, [
      ['x', ((width - textBBox.width) / 2).toString()],
      ['y', ((height - textBBox.height) / 2 - textBBox.y).toString()],
    ]);

    document.body.removeChild(icon);

    return icon;
  }
}
