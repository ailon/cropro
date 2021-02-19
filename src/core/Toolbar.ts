import { ToolbarBlock } from './ToolbarBlock';
import { ToolbarButtonBlock } from './ToolbarButtonBlock';
import { ToolbarElementBlock } from './ToolbarElementBlock';

export class Toolbar {
  private blocks: ToolbarBlock[] = [];

  public className: string;
  public colorsClassName: string;
  public fadeInClassName: string;

  public blockClassName: string;

  public buttonClassName: string;
  public buttonColorsClassName: string;

  public addButtonBlock(block: ToolbarButtonBlock): void {
    block.className = this.blockClassName;
    block.buttonClassName = this.buttonClassName;
    block.buttonColorsClassName = this.buttonColorsClassName;
    this.blocks.push(block);
  }

  public addElementBlock(block: ToolbarElementBlock): void {
    block.className = this.blockClassName;
    this.blocks.push(block);
  }

  public getUI(): HTMLElement {
    const uiContainer = document.createElement('div');
    uiContainer.className = `${this.className} ${this.colorsClassName} ${this.fadeInClassName}`;

    this.blocks.forEach((block) => uiContainer.appendChild(block.getUI()));

    return uiContainer;
  }
}
