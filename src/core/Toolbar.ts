import { ToolbarBlock } from './ToolbarBlock';
import { ToolbarButtonBlock } from './ToolbarButtonBlock';
import { ToolbarElementBlock } from './ToolbarElementBlock';

/**
 * Represents crop area toolbar.
 */
export class Toolbar {
  private blocks: ToolbarBlock[] = [];

  /**
   * CSS class name representing layout of the toolbar.
   */
  public className: string;
  /**
   * CSS class name representing colors of the toolbar.
   */
  public colorsClassName: string;
  /**
   * CSS class name for the fade-in animation.
   */
  public fadeInClassName: string;

  /**
   * CSS class name representing layout of a toolbar block.
   */
  public blockClassName: string;

  /**
   * CSS class name representing layout of a toolbar button.
   */
  public buttonClassName: string;
  /**
   * CSS class name representing colors of a toolbar button.
   */
  public buttonColorsClassName: string;
  /**
   * CSS class name repesenting colors of an active/pressed toolbar button.
   */
  public buttonActiveColorsClassName: string;

  /**
   * Toolbar visibility.
   */
  public visibility = 'visible';

  /**
   * Adds toolbar button block.
   * @param block - block to add.
   */
  public addButtonBlock(block: ToolbarButtonBlock): void {
    block.className = this.blockClassName;
    block.buttonClassName = this.buttonClassName;
    block.buttonColorsClassName = this.buttonColorsClassName;
    block.buttonActiveColorsClassName = this.buttonActiveColorsClassName;
    this.blocks.push(block);
  }

  /**
   * Adds arbitrary element block.
   * @param block - block to add.
   */
  public addElementBlock(block: ToolbarElementBlock): void {
    if (block.className === undefined) {
      block.className = this.blockClassName;
    }
    this.blocks.push(block);
  }

  /**
   * Returns toolbar UI.
   * @returns toolbar UI as an `HTMLElement`.
   */
  public getUI(): HTMLElement {
    const uiContainer = document.createElement('div');
    uiContainer.className = `${this.className} ${this.colorsClassName} ${this.fadeInClassName}`;
    uiContainer.style.visibility = this.visibility;

    this.blocks.forEach((block) => uiContainer.appendChild(block.getUI()));

    return uiContainer;
  }
}
