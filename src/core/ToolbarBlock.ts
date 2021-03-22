/**
 * Represents a block in a {@linkcode Toolbar}.
 */
export class ToolbarBlock {
  /**
   * CSS class name defining layout of the block.
   */
  public className: string;
  /**
   * Minimum width of the block.
   */
  public minWidth?: string;
  /**
   * Alignment of the block content.
   */
  public contentAlign?: 'start' | 'center' | 'end';

  /**
   * Returns block UI.
   * @returns block UI as an `HTMLDivElement`.
   */
  public getUI(): HTMLDivElement {
    const block = document.createElement('div');
    block.className = this.className;
    if (this.minWidth !== undefined) {
      block.style.minWidth = this.minWidth;
    }
    if (this.contentAlign !== undefined) {
      switch(this.contentAlign) {
        case 'start': {
          block.style.justifyContent = 'flex-start';
          break;
        }
        case 'center': {
          block.style.justifyContent = 'center';
          break;
        }
        case 'end': {
          block.style.justifyContent = 'flex-end';
          break;
        }
      }
    }
    block.style.whiteSpace = 'nowrap';

    return block;
  }
}
