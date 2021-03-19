import { ToolbarBlock } from './ToolbarBlock';
import { ToolbarButton } from './ToolbarButton';

/**
 * Toolbar block made of {@linkcode ToolbarButton} elements.
 */
export class ToolbarButtonBlock extends ToolbarBlock {
  private buttons: ToolbarButton[] = [];

  /**
   * CSS class name representing button layout.
   */
  public buttonClassName: string;
  /**
   * CSS class name representing button's colors.
   */
  public buttonColorsClassName: string;
  /**
   * CSS class name representing active/pressed button colors.
   */
  public buttonActiveColorsClassName: string;

  /**
   * Adds a new button to the block.
   * @param button button to add.
   */
  public addButton(button: ToolbarButton): void {
    button.className = this.buttonClassName;
    button.colorsClassName = this.buttonColorsClassName;
    button.activeColorsClassName = this.buttonActiveColorsClassName;
    this.buttons.push(button);
  }

  /**
   * Returns block UI.
   * @returns block UI as an `HTMLDivElement`.
   */
  public getUI(): HTMLDivElement {
    const buttonBlock = super.getUI();

    this.buttons.forEach((button) => buttonBlock.appendChild(button.getUI()));

    return buttonBlock;
  }
}
