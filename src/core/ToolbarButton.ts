/**
 * Click handler type for toolbar button click events.
 */
export type ToolbarButtonClickHandler = () => void;

export class ToolbarButton {
  private _icon: string;

  public get icon(): string {
    return this._icon;
  }
  public set icon(value: string) {
    this._icon = value;
    this.buttonContainer.innerHTML = this._icon;
  }

  private title: string;
  public onClick: ToolbarButtonClickHandler;

  protected uiContainer: HTMLDivElement;
  protected buttonContainer: HTMLDivElement;

  private _isActive = false;
  public get isActive(): boolean {
    return this._isActive;
  }
  public set isActive(value: boolean) {
    this._isActive = value;
    this.adjustClassName();
  }

  private _isHidden = false;
  
  public className: string;
  public colorsClassName: string;
  public activeColorsClassName: string;

  constructor(
    icon: string,
    title: string
  ) {
    this._icon = icon;
    this.title = title;
    this.uiContainer = document.createElement('div');

    this.adjustClassName = this.adjustClassName.bind(this);
  }

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

  public hide(): void {
    this._isHidden = true;
  }
}
