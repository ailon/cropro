import { IRect } from './CropLayer';

/**
 * Represents state of the CropArea.
 * Used to preserve and restore state between sessions.
 */
export interface CropAreaState {
  /**
   * Editing canvas width.
   */
  width: number;
  /**
   * Editing canvas height.
   */
  height: number;

  /**
   * Rotation angle of the original image.
   */
  rotationAngle: number;
  /**
   * Is original image flipped horizontally?
   */
  flippedHorizontally: boolean;
  /**
   * Is original image flipped vertically?
   */
  flippedVertically: boolean;
  /**
   * Crop rectangle.
   */
  cropRect: IRect;
}
