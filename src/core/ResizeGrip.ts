import { SvgHelper } from './SvgHelper';

/**
 * Represents a single resize grip.
 */
export class ResizeGrip {
  /**
   * Grip's visual element.
   */
  public visual: SVGGraphicsElement;

  /**
   * Grip's size (raduis).
   */
  public readonly GRIP_SIZE = 10;

  private color: string;
  private fillColor: string;

  /**
   * Creates a new grip.
   * 
   * @param color - outline color.
   * @param fillColor - fill color.
   */
  constructor(color: string, fillColor: string) {
    this.color = color;
    this.fillColor = fillColor;
    this.visual = SvgHelper.createGroup();
    this.visual.appendChild(
      SvgHelper.createCircle(this.GRIP_SIZE * 1.5, [['fill', 'transparent']])
    );
    this.visual.appendChild(
      SvgHelper.createCircle(this.GRIP_SIZE, [
        ['fill', this.fillColor],
        ['fill-opacity', '0.9'],
        ['stroke', this.color],
        ['stroke-width', '2'],
        ['stroke-opacity', '0.7']
      ])
    );
  }

  /**
   * Returns true if passed SVG element belongs to the grip. False otherwise.
   * 
   * @param el - target element.
   */
  public ownsTarget(el: EventTarget): boolean {
    if (
      el === this.visual ||
      el === this.visual.childNodes[0] ||
      el === this.visual.childNodes[1]
    ) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Sets center of the grip circle.
   * @param x - x coordinate of the center.
   * @param y - y coordinate of the center.
   */
  public setCenter(x: number, y: number): void {
    this.visual.childNodes.forEach(circle =>
    SvgHelper.setAttributes(circle as SVGCircleElement, [
      ['cx', x.toString() ],
      ['cy', y.toString() ]
    ]));
  }
}
