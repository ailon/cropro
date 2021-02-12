import { ToolbarButton } from './ToolbarButton';

export class ToolbarButtonBlock {
  private buttons: ToolbarButton[] = [];

  public className: string;
  public buttonClassName: string;
  public buttonColorsClassName: string;

  public addButton(button: ToolbarButton): void {
    button.className = this.buttonClassName;
    button.colorsClassName = this.buttonColorsClassName;
    this.buttons.push(button);
  }

  public getUI(): HTMLElement {
    const buttonBlock = document.createElement('div');
    buttonBlock.className = this.className;
    buttonBlock.style.whiteSpace = 'nowrap';

    this.buttons.forEach((button) => buttonBlock.appendChild(button.getUI()));

    return buttonBlock;
  }
}
