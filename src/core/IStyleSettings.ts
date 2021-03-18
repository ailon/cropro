/**
 * Describes customizable UI settings.
 */
export interface IStyleSettings {
  /**
   * Background color for the editor canvas when in popup mode.
   */
  canvasBackgroundColor?: string;
  /**
   * Background color of the toolbar block.
   */
  toolbarBackgroundColor?: string;
  /**
   * Background color of toolbar buttons on hover.
   */
  toolbarBackgroundHoverColor?: string;

  toolbarBackgroundActiveColor?: string;

  /**
   * Foreground color of toolbar icons.
   */
  toolbarColor?: string;

  cropShadeColor?: string;
  cropFrameColor?: string;
  gripColor?: string;
  gripFillColor?: string;


  /**
   * Base height of the toolbar block in pixels.
   */
  toolbarHeight?: number;
  /**
   * CSS class name defining the visual style of the toolbar block.
   *
   * _Note_: should only be used for colors and similar styles. Changing layout-related styles here can break the UI.
   */
  toolbarStyleColorsClassName?: string;
  /**
   * CSS class name defining the visual style of the toolbar overflow block.
   * Displayed when markers don't fit in the main toolbar block.
   *
   * _Note_: should only be used for colors and similar styles. Changing layout-related styles here can break the UI.
   */
  toolbarOverflowBlockStyleColorsClassName?: string;
  /**
   * CSS class name defining the visual style of the toolbar buttons.
   *
   * _Note_: should only be used for colors and similar styles. Changing layout-related styles here can break the UI.
   */
  toolbarButtonStyleColorsClassName?: string;
  /**
   * CSS class name defining the visual style of the active (selected) toolbar button.
   *
   * _Note_: should only be used for colors and similar styles. Changing layout-related styles here can break the UI.
   */
  toolbarActiveButtonStyleColorsClassName?: string;

  toolbarStraightenerColorsClassName?: string;

  toolbarOkButtonStyleColorsClassName?: string;
  toolbarCloseButtonStyleColorsClassName?: string;

  /**
   * If set to true, the top toolbar is hidden.
   */
  hideTopToolbar?: boolean;
  /**
   * If set to true, the bottom toolbar is hidden.
   */
  hideBottomToolbar?: boolean;

}
