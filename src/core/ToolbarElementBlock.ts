import { ToolbarBlock } from './ToolbarBlock';

/**
 * Represents a toolbar block made up of arbitrary HTML elements.
 */
export class ToolbarElementBlock extends ToolbarBlock {
  private elements: HTMLElement[] = [];

  /**
   * Adds an element to the block.
   * @param el - element to add.
   */
  public addElement(el: HTMLElement): void {
    this.elements.push(el);
  }

  /**
   * Returns block UI.
   * @returns block UI as an `HTMLDivElement`.
   */
  public getUI(): HTMLDivElement {
    const elBlock = super.getUI();

    this.elements.forEach((el) => elBlock.appendChild(el));

    return elBlock;
  }
}
