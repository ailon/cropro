import { ToolbarButton } from './ToolbarButton';

export class DropdownToolbarButton extends ToolbarButton {
  private dropdownBlock: HTMLDivElement;
  private isDropdownOpen = false;
  private dropdownButtons: ToolbarButton[];
  public dropdownClassName: string;

  constructor(icon: string, title: string, dropdownButtons: ToolbarButton[]) {
    super(icon, title);
    this.onClick = this.dropdownButtonClicked;
    this.dropdownButtons = dropdownButtons;
  }

  private setupDropdown() {
    this.dropdownBlock = document.createElement('div');
    this.dropdownBlock.className = this.dropdownClassName;
    this.dropdownBlock.style.display = 'none';

    this.dropdownButtons.forEach(btn => {
      btn.className = this.className;
      btn.colorsClassName = this.colorsClassName;
      this.dropdownBlock.appendChild(btn.getUI());
    });

    this.uiContainer.appendChild(this.dropdownBlock);
  }

  private positionDropdown() {
    this.dropdownBlock.style.left = `${this.uiContainer.clientLeft}px`;
    this.dropdownBlock.style.top = `${this.uiContainer.clientTop + this.uiContainer.clientHeight}px`;
  }

  private dropdownButtonClicked() {
    if (this.dropdownBlock === undefined) {
      this.setupDropdown();
    }
    this.isDropdownOpen = !this.isDropdownOpen;
    this.toggleDropdown();
  }

  private toggleDropdown() {
    this.positionDropdown();
    this.dropdownBlock.style.display = this.isDropdownOpen ? 'inline-block' : 'none';
  }

  public showDropdown(): void {
    this.isDropdownOpen = true;
    this.toggleDropdown();
  }

  public hideDropdown(): void {
    this.isDropdownOpen = false;
    this.toggleDropdown();
  }
}