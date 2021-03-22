import { AspectRatio } from './AspectRatio';
import { SvgHelper } from './SvgHelper';
import AspectIcon from './../assets/toolbar-icons/aspect.svg';

/**
 * Generates custom aspect ratio icons for the toolbar.
 */
export class AspectRatioIconGenerator {
  /**
   * Returns an aspect ratio icon for dimenssions provided.
   * @param hRatio - horizontal scale.
   * @param vRatio - vertical scale.
   * @returns aspect ratio icon as an SVG image string.
   */
  public static getIcon(hRatio: number, vRatio: number): string {
    if (hRatio > 0 && vRatio > 0) {
      const ar = new AspectRatio(hRatio, vRatio);
      const csWidth = ar.ratio >= 1 ? 20 : ar.getHorizontalLength(20);
      const csHeight = ar.ratio < 1 ? 20 : ar.getVerticalLength(20);

      const icon = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'svg'
      );
      icon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      icon.setAttribute('viewBox', '0 0 24 24');

      document.body.appendChild(icon);

      const defs = SvgHelper.createDefs();
      icon.appendChild(defs);

      const clipPath = SvgHelper.createElement('clipPath', [
        ['id', 'text-bg-clip'],
      ]);
      defs.appendChild(clipPath);

      const cropShape = SvgHelper.createPath(
        SvgHelper.getHollowRectanglePath(
          (24 - csWidth) / 2,
          (24 - csHeight) / 2,
          csWidth,
          csHeight,
          (24 - csWidth) / 2 + 2,
          (24 - csHeight) / 2 + 2,
          csWidth - 4,
          csHeight - 4
        )
      );
      icon.appendChild(cropShape);

      const text = SvgHelper.createText([
        ['x', '0'],
        ['y', '0'],
        ['font-size', '7px'],
        ['font-family', 'monospace'],
      ]);
      text.appendChild(SvgHelper.createTSpan(`${hRatio}:${vRatio}`));
      icon.appendChild(text);

      const textBBox = text.getBBox();
      SvgHelper.setAttributes(text, [
        ['x', ((24 - textBBox.width) / 2).toString()],
        ['y', ((24 - textBBox.height) / 2 - textBBox.y).toString()],
      ]);

      const clipPathShape = SvgHelper.createPath(
        SvgHelper.getHollowRectanglePath(
          0,
          0,
          24,
          24,
          (24 - Math.ceil(textBBox.width)) / 2,
          (24 - Math.ceil(textBBox.height)) /2,
          Math.ceil(textBBox.width),
          Math.ceil(textBBox.height)
        )
      );
      clipPath.appendChild(clipPathShape);
      SvgHelper.setAttributes(cropShape, [['clip-path', 'url(#text-bg-clip)']]);

      document.body.removeChild(icon);

      return icon.outerHTML;
    } else {
      return AspectIcon;
    }
  }
}
