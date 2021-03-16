import { ToolbarBlock } from './ToolbarBlock';
import { ToolbarButton } from './ToolbarButton';

export class ToolbarButtonBlock extends ToolbarBlock {
  private buttons: ToolbarButton[] = [];

  public buttonClassName: string;
  public buttonColorsClassName: string;
  public buttonActiveColorsClassName: string;

  public addButton(button: ToolbarButton): void {
    button.className = this.buttonClassName;
    button.colorsClassName = this.buttonColorsClassName;
    button.activeColorsClassName = this.buttonActiveColorsClassName;
    this.buttons.push(button);
  }

  public getUI(): HTMLDivElement {
    const buttonBlock = super.getUI();

    this.buttons.forEach((button) => buttonBlock.appendChild(button.getUI()));

    return buttonBlock;
  }
}
