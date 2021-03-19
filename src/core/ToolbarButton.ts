/**
 * Click handler type for toolbar button click events.
 */
export type ToolbarButtonClickHandler = () => void;

/**
 * Represents a single toolbar button.
 */
export class ToolbarButton {
  private _icon: string;

  /**
   * Button's SVG icon.
   */
  public get icon(): string {
    return this._icon;
  }
  public set icon(value: string) {
    this._icon = value;
    this.buttonContainer.innerHTML = this._icon;
  }

  private title: string;
  /**
   * Method called when the button is clicked.
   */
  public onClick: ToolbarButtonClickHandler;

  /**
   * Container of button's UI.
   */
  protected uiContainer: HTMLDivElement;
  /**
   * Button element.
   */
  protected buttonContainer: HTMLDivElement;

  private _isActive = false;
  /**
   * Gets or sets whether the button is active/enabled or not.
   */
  public get isActive(): boolean {
    return this._isActive;
  }
  public set isActive(value: boolean) {
    this._isActive = value;
    this.adjustClassName();
  }

  private _isHidden = false;
  
  /**
   * CSS class name representing button's layout.
   */
  public className: string;
  /**
   * CSS class name representing button's colors.
   */
  public colorsClassName: string;
  /**
   * CSS class name representing active/pressed button's colors.
   */
  public activeColorsClassName: string;

  /**
   * Creates a new toolbar button.
   * @param icon - SVG icon.
   * @param title - button's title.
   */
  constructor(
    icon: string,
    title: string
  ) {
    this._icon = icon;
    this.title = title;
    this.uiContainer = document.createElement('div');

    this.adjustClassName = this.adjustClassName.bind(this);
  }

  /**
   * Returns button's UI.
   * @returns button UI as an `HTMLElement`.
   */
  public getUI(): HTMLElement {
    this.buttonContainer = document.createElement('div');
    this.buttonContainer.title = this.title;
    this.buttonContainer.className = `${this.className} ${this.colorsClassName}`;
    this.adjustClassName();
    this.buttonContainer.innerHTML = this._icon;
    if (this.onClick) {
      this.buttonContainer.addEventListener('click', () => this.onClick());
    }
    this.uiContainer.appendChild(this.buttonContainer);
    this.uiContainer.style.display = this._isHidden ? 'none' : 'inline-block';

    return this.uiContainer;
  }

  private adjustClassName() {
    if (this.activeColorsClassName) {
      if (this._isActive && this.buttonContainer.className.indexOf(this.activeColorsClassName) < 0) {
        this.buttonContainer.className += ` ${this.activeColorsClassName}`;
      } else if (!this._isActive) {
        this.buttonContainer.className = this.buttonContainer.className.replace(this.activeColorsClassName, '');
      }
    }
  }

  /**
   * Hides the button.
   */
  public hide(): void {
    this._isHidden = true;
  }
}
