import { ToolbarButton } from './ToolbarButton';

/**
 * Toolbar button with a dropdown of other toolbar buttons.
 */
export class DropdownToolbarButton extends ToolbarButton {
  private dropdownBlock: HTMLDivElement;
  private isDropdownOpen = false;
  private dropdownButtons: ToolbarButton[];
  /**
   * CSS class name for the dropdown element.
   */
  public dropdownClassName: string;
  /**
   * CSS class name for the dropdown element's colors.
   */
   public dropdownColorsClassName: string;

  /**
   * Initializes a drowpdown toolbar button.
   * @param icon - default icon.
   * @param title - button title.
   * @param dropdownButtons - list of buttons in the dropdown section.
   */
  constructor(icon: string, title: string, dropdownButtons: ToolbarButton[]) {
    super(icon, title);
    this.onClick = this.dropdownButtonClicked;
    this.dropdownButtons = dropdownButtons;
  }

  private setupDropdown() {
    this.dropdownBlock = document.createElement('div');
    this.dropdownBlock.className = `${this.dropdownClassName} ${this.dropdownColorsClassName}`;
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

  /**
   * Expands dropdown section.
   */
  public showDropdown(): void {
    this.isDropdownOpen = true;
    this.toggleDropdown();
  }

  /**
   * Collapses dropdown section.
   */
  public hideDropdown(): void {
    this.isDropdownOpen = false;
    this.toggleDropdown();
  }
}
