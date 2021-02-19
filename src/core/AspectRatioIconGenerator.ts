import { SvgHelper } from './SvgHelper';

export class AspectRatioIconGenerator {
  public static getIcon(hRatio: number, vRatio: number): string {
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    icon.setAttribute('viewBox', '0 0 24 24');

    const defs = SvgHelper.createDefs();
    icon.appendChild(defs);

    const clipPath = SvgHelper.createElement('clipPath', [
      ['id', 'text-bg-clip'],
    ]);
    const clipPathShape = SvgHelper.createPath('M0,0V23H23V0H2V8H21V16H2V0Z');
    clipPath.appendChild(clipPathShape);
    defs.appendChild(clipPath);

    const cropShape = SvgHelper.createPath('M2,2V22H22V2H4V4H20V20H4V2Z');
    SvgHelper.setAttributes(cropShape, [['clip-path', 'url(#text-bg-clip)']]);
    icon.appendChild(cropShape);

    const text = SvgHelper.createText([
      ['x', '3'],
      ['y', '14'],
      ['font-size', '9px'],
      ['font-family', 'sans-serif'],
    ]);
    text.appendChild(SvgHelper.createTSpan('16:9'));
    icon.appendChild(text);

    return icon.outerHTML;
  }
}
