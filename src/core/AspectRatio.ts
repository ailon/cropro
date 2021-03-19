/**
 * Represents aspect ratio.
 */
export interface IAspectRatio {
  /**
   * Horizontal dimension.
   */
  horizontal: number;
  /**
   * Vertical dimension.
   */
  vertical: number;
}

/**
 * Implements {@linkcode IAspectRatio} and provides helper methods.
 */
export class AspectRatio implements IAspectRatio {
  /**
   * Horizontal dimension.
   */
  public horizontal: number;
  /**
   * Vertical dimension.
   */
  public vertical: number;

  /**
   * Returns aspect ratio.
   *
   * @readonly
   */
  public get ratio(): number {
    return (this.horizontal * 1.0) / this.vertical;
  }

  /**
   * Initialize aspect ratio object.
   * @param horizontal - horizontal dimension.
   * @param vertical - vertical dimension.
   */
  constructor(horizontal: number, vertical: number) {
    this.horizontal = horizontal;
    this.vertical = vertical;
  }

  /**
   * Calculates vertical length based on horizontal length provided.
   * @param horizontalLength - horizontal length.
   * @returns - vertical length.
   */
  public getVerticalLength(horizontalLength: number): number {
    return horizontalLength / this.ratio;
  }

  
  /**
   * Calculates horizontal length based on vertical length provided.
   * @param verticalLength - vertical length.
   * @returns - horizontal length.
   */
  public getHorizontalLength(verticalLength: number): number {
    return verticalLength * this.ratio;
  }
}
