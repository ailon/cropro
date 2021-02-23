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

  constructor(
    canvasWidth: number,
    canvasHeight: number,
    container: SVGGElement
  ) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.container = container;
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
}
