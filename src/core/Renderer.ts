import { IRect } from '../CropLayer';

/**
 * Renders the cropped image.
 */
export class Renderer {
  /**
   * Whether the image should be rendered at the original (natural) target image size.
   */
  public naturalSize = false;
  /**
   * Rendered image type (`image/png`, `image/jpeg`, etc.).
   */
  public imageType = 'image/png';
  /**
   * For formats that support it, specifies rendering quality.
   *
   * In the case of `image/jpeg` you can specify a value between 0 and 1 (lowest to highest quality).
   *
   * @type {number} - image rendering quality (0..1)
   */
  public imageQuality?: number;

  /**
   * When set and {@linkcode naturalSize} is `false` sets the width of the rendered image.
   *
   * Both `width` and `height` have to be set for this to take effect.
   */
  public width?: number;
  /**
   * When set and {@linkcode naturalSize} is `false` sets the height of the rendered image.
   *
   * Both `width` and `height` have to be set for this to take effect.
   */
  public height?: number;

  /**
   * Initiates rendering of the result image and returns a promise which when resolved
   * contains a data URL for the rendered image.
   *
   * @param cropImage - crop image
   */
  public rasterize(
    cropImage: SVGSVGElement,
    original: HTMLImageElement,
    cropRectangle: IRect,
    margin: number
  ): Promise<string> {
    return new Promise<string>((resolve) => {
      const canvas = document.createElement('canvas');

      const imageCopy = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'svg'
      );
      imageCopy.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      imageCopy.setAttribute('width', cropImage.width.baseVal.valueAsString);
      imageCopy.setAttribute('height', cropImage.height.baseVal.valueAsString);
      imageCopy.setAttribute(
        'viewBox',
        '0 0 ' +
          cropImage.viewBox.baseVal.width.toString() +
          ' ' +
          cropImage.viewBox.baseVal.height.toString()
      );
      imageCopy.innerHTML = cropImage.innerHTML;

      let xScale = 1;
      let yScale = 1;

      if (this.naturalSize === true) {
        // scale to full image size
        xScale =
          original.naturalWidth / (cropImage.width.baseVal.value - margin * 2);
        yScale =
          original.naturalHeight /
          (cropImage.height.baseVal.value - margin * 2);
        imageCopy.width.baseVal.value =
          original.naturalWidth + margin * xScale * 2;
        imageCopy.height.baseVal.value =
          original.naturalHeight + margin * yScale * 2;
      } else if (this.width !== undefined && this.height !== undefined) {
        // scale to specific dimensions
        xScale = this.width / cropRectangle.width;
        yScale = this.height / cropRectangle.height;
        imageCopy.width.baseVal.value *= xScale;
        imageCopy.height.baseVal.value *= yScale;
      }

      canvas.width = imageCopy.width.baseVal.value;
      canvas.height = imageCopy.height.baseVal.value;

      const data = imageCopy.outerHTML;

      const ctx = canvas.getContext('2d');

      const DOMURL = window.URL; // || window.webkitURL || window;

      const img = new Image(canvas.width, canvas.height);
      img.setAttribute('crossOrigin', 'anonymous');

      const blob = new Blob([data], { type: 'image/svg+xml' });

      const url = DOMURL.createObjectURL(blob);

      img.onload = () => {
        // legacy Edge isn't actually loaded and needs a delay
        if (!/Edge/.test(navigator.userAgent)) {
          ctx.drawImage(img, 0, 0);
          DOMURL.revokeObjectURL(url);

          const cropCanvas = document.createElement('canvas');
          cropCanvas.width = cropRectangle.width * xScale;
          cropCanvas.height = cropRectangle.height * yScale;
          const tmpCtx = cropCanvas.getContext('2d');
          tmpCtx.putImageData(
            ctx.getImageData(
              cropRectangle.x * xScale,
              cropRectangle.y * yScale,
              cropRectangle.width * xScale,
              cropRectangle.height * yScale
            ),
            0,
            0
          );

          const result = cropCanvas.toDataURL(
            this.imageType,
            this.imageQuality
          );
          resolve(result);
        } else {
          setTimeout(() => {
            ctx.drawImage(img, 0, 0);
            DOMURL.revokeObjectURL(url);

            const cropCanvas = document.createElement('canvas');
            cropCanvas.width = cropRectangle.width * xScale;
            cropCanvas.height = cropRectangle.height * yScale;
            const tmpCtx = cropCanvas.getContext('2d');
            tmpCtx.putImageData(
              ctx.getImageData(
                cropRectangle.x * xScale,
                cropRectangle.y * yScale,
                cropRectangle.width * xScale,
                cropRectangle.height * yScale
              ),
              0,
              0
            );

            const result = cropCanvas.toDataURL(
              this.imageType,
              this.imageQuality
            );
            resolve(result);
          }, 500);
        }
      };

      img.src = url;
    });
  }
}
