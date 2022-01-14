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
  /**
   * Background color of active (pressed) toolbar buttons.
   */
  toolbarBackgroundActiveColor?: string;
  /**
   * Foreground color of toolbar icons.
   */
  toolbarColor?: string;

  /**
   * Color of the crop shade (outside area).
   */
  cropShadeColor?: string;
  /**
   * Line color of the crop frame.
   */
  cropFrameColor?: string;
  /**
   * Outline color of the crop frame grips.
   */
  gripColor?: string;
  /**
   * Fill color of the crop frame grips.
   */
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
  /**
   * CSS class name defining the visual style of the dropdown portion of a dropdown toolbar button.
   *
   * _Note_: should only be used for colors and similar styles. Changing layout-related styles here can break the UI.
   */
  toolbarDropdownStyleColorsClassName?: string;

  /**
   * CSS class name defining the visual style of the straightening control.
   */
  toolbarStraightenerColorsClassName?: string;
  /**
   * CSS class name defining the visual style of the OK button.
   */
  toolbarOkButtonStyleColorsClassName?: string;
  /**
   * CSS class name defining the visual style of the close button.
   */
  toolbarCloseButtonStyleColorsClassName?: string;

  /**
   * If set to true, the top toolbar is hidden.
   */
  hideTopToolbar?: boolean;
  /**
   * If set to true, the bottom toolbar is hidden.
   */
  hideBottomToolbar?: boolean;

  /**
   * zIndex for the CROPRO UI.
   * 
   * Defaults to 5 in inline mode and 1000 in popup mode.
   * 
   * @since 1.2.0
   */
   zIndex?: string;  
}
