export interface IAspectRatio {
  horizontal: number;
  vertical: number;
}

export class AspectRatio implements IAspectRatio {
  public horizontal: number;
  public vertical: number;

  public get ratio(): number {
    return (this.horizontal * 1.0) / this.vertical;
  }

  constructor(horizontal: number, vertical: number) {
    this.horizontal = horizontal;
    this.vertical = vertical;
  }

  public getVerticalLength(horizontalLength: number): number {
    return horizontalLength / this.ratio;
  }

  public getHorizontalLength(verticalLength: number): number {
    return verticalLength * this.ratio;
  }
}
