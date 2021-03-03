import { AspectRatio } from './core/AspectRatio';
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
  private margin: number;
  private get paddedCanvasWidth(): number {
    return this.canvasWidth + this.margin * 2;
  }
  private get paddedCanvasHeight(): number {
    return this.canvasHeight + this.margin * 2;
  }

  private cropRect: IRect;

  private cropRectElement: SVGRectElement;
  private cropShadeElement: SVGPathElement;

  private container: SVGGElement;

  private topLeftGrip: ResizeGrip;
  private topRightGrip: ResizeGrip;
  private bottomLeftGrip: ResizeGrip;
  private bottomRightGrip: ResizeGrip;
  private activeGrip: ResizeGrip;

  private isMoving = false;
  private previousPoint: IPoint;

  private _aspectRatio: AspectRatio;
  public get aspectRatio(): AspectRatio {
    return this._aspectRatio;
  }
  public set aspectRatio(value: AspectRatio) {
    this._aspectRatio = value;
    this.adjustCropRect();
    this.setCropRectangle(this.cropRect);
  }

  private _isGridVisible = true;
  public get isGridVisible(): boolean {
    return this._isGridVisible;
  }
  public set isGridVisible(value: boolean) {
    this._isGridVisible = value;
    if (this.gridContainer) {
      SvgHelper.setAttributes(this.gridContainer, [
        ['display', `${this._isGridVisible ? '' : 'none'}`]
      ]);
    }
  }

  public numberOfGridLines = 2;
  private gridContainer: SVGGElement;
  private horizontalGridLines: SVGLineElement[] = [];
  private verticalGridLines: SVGLineElement[] = [];

  constructor(
    canvasWidth: number,
    canvasHeight: number,
    margin: number,
    container: SVGGElement
  ) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.margin = margin;
    this.container = container;

    this.attachEvents = this.attachEvents.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.resize = this.resize.bind(this);
    this.adjustCropRect = this.adjustCropRect.bind(this);
  }

  public open(): void {
    this.cropShadeElement = SvgHelper.createPath('M0,0Z', [
      ['fill', '#ffffff'],
      ['fill-opacity', '0.8'],
    ]);
    this.container.appendChild(this.cropShadeElement);

    this.gridContainer = SvgHelper.createGroup([
      ['display', `${this.isGridVisible ? '' : 'none'}`]
    ]);
    this.container.appendChild(this.gridContainer);

    for(let i = 0; i < this.numberOfGridLines; i++) {
      this.horizontalGridLines.push(SvgHelper.createLine(0,0,0,0,[
        ['stroke', '#ffffff'],
        ['stroke-width', '1'],
        ['stroke-dasharray', '3 1'],
        ['opacity', '0.7']
      ]));
      this.verticalGridLines.push(SvgHelper.createLine(0,0,0,0,[
        ['stroke', '#ffffff'],
        ['stroke-width', '1'],
        ['stroke-dasharray', '3 1'],
        ['opacity', '0.7']
      ]));
    }
    this.horizontalGridLines.forEach(line => this.gridContainer.appendChild(line));
    this.verticalGridLines.forEach(line => this.gridContainer.appendChild(line));

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

    const verticalGridStep = this.cropRect.height / (this.numberOfGridLines + 1);
    this.horizontalGridLines.forEach((line, index) => {
      const y = this.cropRect.y + verticalGridStep * (index + 1);
      SvgHelper.setAttributes(line, [
        ['x1', `${this.cropRect.x}`],
        ['y1', `${y}`],
        ['x2', `${this.cropRect.x + this.cropRect.width}`],
        ['y2', `${y}`],
      ]);
    });
    const horizontalGridStep = this.cropRect.width / (this.numberOfGridLines + 1);
    this.verticalGridLines.forEach((line, index) => {
      const x = this.cropRect.x + horizontalGridStep * (index + 1);
      SvgHelper.setAttributes(line, [
        ['x1', `${x}`],
        ['y1', `${this.cropRect.y}`],
        ['x2', `${x}`],
        ['y2', `${this.cropRect.y + this.cropRect.height}`],
      ]);
    });

    SvgHelper.setAttributes(this.cropShadeElement, [
      [
        'd',
        SvgHelper.getHollowRectanglePath(
          this.margin,
          this.margin,
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
    return {
      x: x - clientRect.x + this.margin,
      y: y - clientRect.y + this.margin,
    };
  }

  private onPointerDown(ev: PointerEvent) {
    this.previousPoint = this.clientToLocalCoordinates(ev.clientX, ev.clientY);
    if (this.cropRectElement === ev.target) {
      this.isMoving = true;
    } else if (this.topLeftGrip.ownsTarget(ev.target)) {
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
    if (this.isMoving) {
      this.move(this.clientToLocalCoordinates(ev.clientX, ev.clientY));
    } else if (this.activeGrip) {
      const localPoint = this.clientToLocalCoordinates(ev.clientX, ev.clientY);
      localPoint.x = Math.min(
        Math.max(localPoint.x, this.margin),
        this.margin + this.canvasWidth
      );
      localPoint.y = Math.min(
        Math.max(localPoint.y, this.margin),
        this.margin + this.canvasHeight
      );
      this.resize(localPoint);
    }
    ev.preventDefault();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onPointerUp(ev: PointerEvent) {
    this.activeGrip = undefined;
    this.isMoving = false;
  }

  private move(point: IPoint): void {
    const xDelta = point.x - this.previousPoint.x;
    const yDelta = point.y - this.previousPoint.y;

    this.cropRect.x = Math.min(
      Math.max(this.margin, this.cropRect.x + xDelta),
      this.canvasWidth - this.cropRect.width + this.margin
    );
    this.cropRect.y = Math.min(
      Math.max(this.margin, this.cropRect.y + yDelta),
      this.canvasHeight - this.cropRect.height + this.margin
    );
    this.setCropRectangle(this.cropRect);
    this.previousPoint = point;
  }

  private resize(point: IPoint): void {
    const newCropRect = Object.assign({}, this.cropRect);

    const arX = point.x;
    const arY = point.y;
    let xDelta = 0;

    switch (this.activeGrip) {
      case this.bottomLeftGrip:
      case this.topLeftGrip:
        newCropRect.x = arX;
        xDelta = this.cropRect.x - newCropRect.x;
        newCropRect.width =
          this.cropRect.x + this.cropRect.width - newCropRect.x;
        break;
      case this.bottomRightGrip:
      case this.topRightGrip:
        newCropRect.width = arX - newCropRect.x;
        xDelta = newCropRect.width - this.cropRect.width;
        break;
    }

    switch (this.activeGrip) {
      case this.topLeftGrip:
      case this.topRightGrip:
        if (this.aspectRatio) {
          newCropRect.y =
            this.cropRect.y - this.aspectRatio.getVerticalLength(xDelta);
          newCropRect.height = this.aspectRatio.getVerticalLength(
            newCropRect.width
          );
        } else {
          newCropRect.y = arY;
          newCropRect.height =
            this.cropRect.y + this.cropRect.height - newCropRect.y;
        }
        break;
      case this.bottomLeftGrip:
      case this.bottomRightGrip:
        if (this.aspectRatio) {
          newCropRect.height = this.aspectRatio.getVerticalLength(
            newCropRect.width
          );
        } else {
          newCropRect.height = arY - newCropRect.y;
        }
        break;
    }

    if (newCropRect.width < 10) {
      newCropRect.x = this.cropRect.x;
      newCropRect.width = 10;
    }
    if (newCropRect.height < 10) {
      newCropRect.y = this.cropRect.y;
      newCropRect.height = 10;
    }

    if (
      newCropRect.x >= this.margin &&
      newCropRect.y >= this.margin &&
      newCropRect.x - this.margin + newCropRect.width <= this.canvasWidth &&
      newCropRect.y - this.margin + newCropRect.height <= this.canvasHeight
    ) {
      this.setCropRectangle(newCropRect);
    }
  }

  private adjustCropRect() {
    if (this.aspectRatio) {
      if (
        Math.round(this.cropRect.height) !==
        Math.round(this.aspectRatio.getVerticalLength(this.cropRect.width))
      ) {
        const centerX = this.cropRect.x + this.cropRect.width / 2;
        const centerY = this.cropRect.y + this.cropRect.height / 2;

        const arWidth = this.aspectRatio.getHorizontalLength(
          this.cropRect.height
        );
        const arHeight = this.aspectRatio.getVerticalLength(
          this.cropRect.width
        );

        if (arWidth / this.canvasWidth < arHeight / this.canvasHeight) {
          this.cropRect.width = arWidth;
        } else {
          this.cropRect.height = arHeight;
        }
        if (this.cropRect.width > this.canvasWidth) {
          this.cropRect.height /= this.cropRect.width / this.canvasWidth;
          this.cropRect.width = this.canvasWidth;
        }
        if (this.cropRect.height > this.canvasHeight) {
          this.cropRect.width /= this.cropRect.height / this.canvasHeight;
          this.cropRect.height = this.canvasHeight;
        }
        this.cropRect.x = centerX - this.cropRect.width / 2;
        this.cropRect.y = centerY - this.cropRect.height / 2;
        if (
          this.cropRect.x + this.cropRect.width >
          this.margin + this.canvasWidth
        ) {
          this.cropRect.x =
            this.margin + this.canvasWidth - this.cropRect.width;
        }
        if (
          this.cropRect.y + this.cropRect.height >
          this.margin + this.canvasHeight
        ) {
          this.cropRect.y =
            this.margin + this.canvasHeight - this.cropRect.height;
        }
        this.cropRect.x = Math.max(this.cropRect.x, this.margin);
        this.cropRect.y = Math.max(this.cropRect.y, this.margin);

        // this.cropRect.x = this.canvasWidth / 2 - this.cropRect.width / 2;
        // this.cropRect.y = this.canvasHeight / 2 - this.cropRect.height / 2;
      }
    }
  }
}
