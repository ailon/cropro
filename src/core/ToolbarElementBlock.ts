import { ToolbarBlock } from './ToolbarBlock';

export class ToolbarElementBlock extends ToolbarBlock {
  private elements: HTMLElement[] = [];

  public addElement(el: HTMLElement): void {
    this.elements.push(el);
  }

  public getUI(): HTMLDivElement {
    const elBlock = super.getUI();

    this.elements.forEach((el) => elBlock.appendChild(el));

    return elBlock;
  }
}
