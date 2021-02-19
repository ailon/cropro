export class ToolbarBlock {

  public className: string;
  public minWidth?: string;
  public contentAlign?: 'start' | 'center' | 'end';

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
