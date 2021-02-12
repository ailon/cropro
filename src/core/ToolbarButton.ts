/**
 * Click handler type for toolbar button click events.
 */
export type ToolbarButtonClickHandler = () => void;

export class ToolbarButton {
  private icon: string;
  private title: string;
  private onClick: ToolbarButtonClickHandler;
  
  public className: string;
  public colorsClassName: string;

  constructor(
    icon: string,
    title: string,
    onClick: ToolbarButtonClickHandler
  ) {
    this.icon = icon;
    this.title = title;
    this.onClick = onClick;
  }

  public getUI(): HTMLElement {
    const buttonContainer = document.createElement('div');
    buttonContainer.title = this.title;
    buttonContainer.className = `${this.className} ${this.colorsClassName}`;
    buttonContainer.innerHTML = this.icon;
    buttonContainer.addEventListener('click', () => this.onClick());

    return buttonContainer;
  }
}
