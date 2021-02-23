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
  
  public className: string;
  public colorsClassName: string;

  constructor(
    icon: string,
    title: string
  ) {
    this._icon = icon;
    this.title = title;
    this.uiContainer = document.createElement('div');
  }

  public getUI(): HTMLElement {
    this.buttonContainer = document.createElement('div');
    this.buttonContainer.title = this.title;
    this.buttonContainer.className = `${this.className} ${this.colorsClassName}`;
    this.buttonContainer.innerHTML = this._icon;
    if (this.onClick) {
      this.buttonContainer.addEventListener('click', () => this.onClick());
    }
    this.uiContainer.appendChild(this.buttonContainer);
    this.uiContainer.style.display = 'inline-block';

    return this.uiContainer;
  }
}
