import { IPoint } from './core/IPoint';
import { ResizeGrip } from './core/ResizeGrip';
import { SvgHelper } from './core/SvgHelper';

export interface IRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class CropLayer {
  private canvasWidth: number;
  private canvasHeight: number;

  private cropRect: IRect;

  private cropRectElement: SVGRectElement;
  private cropShadeElement: SVGPathElement;

  private container: SVGGElement;
  
  private topLeftGrip: ResizeGrip;
  private topRightGrip: ResizeGrip;
  private bottomLeftGrip: ResizeGrip;
  private bottomRightGrip: ResizeGrip;
  private activeGrip: ResizeGrip;

  constructor(
    canvasWidth: number,
    canvasHeight: number,
    container: SVGGElement
  ) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.container = container;

    this.attachEvents = this.attachEvents.bind(this);
    this.resize = this.resize.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
  }

  public open(): void {
    this.cropShadeElement = SvgHelper.createPath('M0,0Z', [
      ['fill', '#ffffff'],
      ['fill-opacity', '0.8']
    ]);
    this.container.appendChild(this.cropShadeElement);

    this.cropRectElement = SvgHelper.createRect(0, 0, [
      ['stroke', '#ffffff'],
      ['stroke-width', '3'],
      ['fill', 'transparent'],
    ]);
    this.container.appendChild(this.cropRectElement);

    this.topLeftGrip = new ResizeGrip();
    this.container.appendChild(this.topLeftGrip.visual);
    this.topRightGrip = new ResizeGrip();
    this.container.appendChild(this.topRightGrip.visual);
    this.bottomLeftGrip = new ResizeGrip();
    this.container.appendChild(this.bottomLeftGrip.visual);
    this.bottomRightGrip = new ResizeGrip();
    this.container.appendChild(this.bottomRightGrip.visual);

    this.attachEvents();
  }

  public setCropRectangle(rect: IRect): void {
    this.cropRect = rect;
    SvgHelper.setAttributes(this.cropRectElement, [
      ['x', this.cropRect.x.toString()],
      ['y', this.cropRect.y.toString()],
      ['width', this.cropRect.width.toString()],
      ['height', this.cropRect.height.toString()],
    ]);

    SvgHelper.setAttributes(this.cropShadeElement, [
      [
        'd',
        SvgHelper.getHollowRectanglePath(
          0,
          0,
          this.canvasWidth,
          this.canvasHeight,
          this.cropRect.x,
          this.cropRect.y,
          this.cropRect.width,
          this.cropRect.height
        ),
      ],
    ]);

    this.topLeftGrip.setCenter(this.cropRect.x, this.cropRect.y);
    this.topRightGrip.setCenter(
      this.cropRect.x + this.cropRect.width,
      this.cropRect.y
    );
    this.bottomLeftGrip.setCenter(
      this.cropRect.x,
      this.cropRect.y + this.cropRect.height
    );
    this.bottomRightGrip.setCenter(
      this.cropRect.x + this.cropRect.width,
      this.cropRect.y + this.cropRect.height
    );
  }

  private attachEvents() {
    this.container.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
  }

  private clientToLocalCoordinates(x: number, y: number): IPoint {
    const clientRect = this.container.getBoundingClientRect();
    return { x: x - clientRect.x, y: y - clientRect.y };
  }

  private onPointerDown(ev: PointerEvent) {
    if (this.topLeftGrip.ownsTarget(ev.target)) {
      this.activeGrip = this.topLeftGrip;
    } else if (this.bottomLeftGrip.ownsTarget(ev.target)) {
      this.activeGrip = this.bottomLeftGrip;
    } else if (this.topRightGrip.ownsTarget(ev.target)) {
      this.activeGrip = this.topRightGrip;
    } else if (this.bottomRightGrip.ownsTarget(ev.target)) {
      this.activeGrip = this.bottomRightGrip;
    }
  }

  private onPointerMove(ev: PointerEvent) {
    if (this.activeGrip) {
      this.resize(this.clientToLocalCoordinates(ev.clientX, ev.clientY));
    }
    ev.preventDefault();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onPointerUp(ev: PointerEvent) {
    this.activeGrip = undefined;
  }

  protected resize(point: IPoint): void {
    const newCropRect = Object.assign({}, this.cropRect);

    switch(this.activeGrip) {
      case this.bottomLeftGrip:
      case this.topLeftGrip:
        newCropRect.x = point.x;
        newCropRect.width = this.cropRect.x + this.cropRect.width - newCropRect.x;
        break; 
      case this.bottomRightGrip:
      case this.topRightGrip:
        newCropRect.width = point.x - newCropRect.x;
        break; 
    }

    switch(this.activeGrip) {
      case this.topLeftGrip:
      case this.topRightGrip:
        newCropRect.y = point.y;
        newCropRect.height = this.cropRect.y + this.cropRect.height - newCropRect.y;
        break; 
      case this.bottomLeftGrip:
      case this.bottomRightGrip:
        newCropRect.height = point.y - newCropRect.y;
        break; 
    }

    if (newCropRect.width < 10) {
      newCropRect.x = this.cropRect.x;
      newCropRect.width = 10;
    }
    if (newCropRect.height < 10) {
      newCropRect.y = this.cropRect.y
      newCropRect.height = 10;
    }

    this.setCropRectangle(newCropRect);
  }  
}
