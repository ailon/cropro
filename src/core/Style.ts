import { IStyleSettings } from './IStyleSettings';

/**
 * Simple utility CSS-in-JS implementation.
 */
export class StyleManager {

  private _classNamePrefix = '__cropro_';
  private _coverClassName = 'cropro_cover';
  /**
   * Prefix used for all internally created CSS classes.
   */
  public get classNamePrefix(): string {
    return this._classNamePrefix;
  }

  public get coverClassName(): string {
    return this._coverClassName;
  }

  private classes: StyleClass[] = [];
  private rules: StyleRule[] = [];
  private styleSheet?: HTMLStyleElement;

  /**
   * For cases when you need to add the stylesheet to anything
   * other than document.head (default), set this property
   * before calling `show()`.
   */
  public styleSheetRoot: HTMLElement;

  /**
   * Returns default UI styles.
   */
  public get defaultSettings(): IStyleSettings {
    return {
      canvasBackgroundColor: '#333333',
      toolbarBackgroundColor: '#111111',
      toolbarBackgroundHoverColor: '#333333',
      toolbarBackgroundActiveColor: '#282828',
      toolbarColor: '#eeeeee',
      cropShadeColor: '#ffffff',
      cropFrameColor: '#ffffff',
      gripColor: '#333333',
      gripFillColor: '#cccccc',
      toolbarHeight: 40
    }
  }

  /**
   * Holds current UI styles.
   */
  public settings: IStyleSettings = this.defaultSettings;

  /**
   * Returns global fade-in animation class name.
   */
  public get fadeInAnimationClassName(): string {
    return `${this.classNamePrefix}_fade_in`;
  }
  /**
   * Returns global fade-out animation class name.
   */
  public get fadeOutAnimationClassName(): string {
    return `${this.classNamePrefix}_fade_out`;
  }

  /**
   * Initializes a new style manager.
   * @param instanceNo - instance id.
   */
  constructor(instanceNo: number) {
    this._classNamePrefix = `${this._classNamePrefix}_${instanceNo}_`;
  }

  /**
   * Adds a CSS class declaration.
   * @param styleClass - class to add.
   */
  public addClass(styleClass: StyleClass): StyleClass {
    if (this.styleSheet === undefined) {
      this.addStyleSheet();
    }
    styleClass.name = `${this.classNamePrefix}${styleClass.localName}`;
    this.classes.push(styleClass);
    this.styleSheet.sheet.addRule('.' + styleClass.name, styleClass.style);
    return styleClass;
  }

  /**
   * Add arbitrary CSS rule
   * @param styleRule - CSS rule to add.
   */
  public addRule(styleRule: StyleRule): void {
    if (this.styleSheet === undefined) {
      this.addStyleSheet();
    }
    this.rules.push(styleRule);
    // this.styleSheet.sheet.addRule(styleRule.selector, styleRule.style); // crashes in legacy Edge
    this.styleSheet.sheet.insertRule(
      `${styleRule.selector} {${styleRule.style}}`,
      this.styleSheet.sheet.rules.length
    );
  }

  private addStyleSheet() {
    this.styleSheet = document.createElement('style');
    (this.styleSheetRoot ?? document.head).appendChild(this.styleSheet);

    // add global rules
    this.addRule(new StyleRule(`.${this.classNamePrefix} h3`, 'font-family: sans-serif'));

    this.addRule(new StyleRule(`@keyframes ${this.classNamePrefix}_fade_in_animation_frames`, `
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
    `));
    this.addRule(new StyleRule(`@keyframes ${this.classNamePrefix}_fade_out_animation_frames`, `
        from {
          opacity: 1;
        }
        to {
          opacity: 0;
        }
    `));

    this.addClass(new StyleClass('_fade_in', `
      animation-duration: 0.3s;
      animation-name: ${this.classNamePrefix}_fade_in_animation_frames;
    `));
    this.addClass(new StyleClass('_fade_out', `
      animation-duration: 0.3s;
      animation-name: ${this.classNamePrefix}_fade_out_animation_frames;
    `));
  }

  public removeStyleSheet(): void {
    if (this.styleSheet) {
      (this.styleSheetRoot ?? document.head).removeChild(this.styleSheet);
      this.styleSheet = undefined;
    }
  }
}

/**
 * Represents an arbitrary CSS rule.
 */
export class StyleRule {
  /**
   * CSS selector.
   */
  public selector: string;
  /**
   * Style declaration for the rule.
   */
  public style: string;
  /**
   * Creates an arbitrary CSS rule using the selector and style rules.
   * @param selector - CSS selector
   * @param style - styles to apply
   */
  constructor(selector: string, style: string) {
    this.selector = selector;
    this.style = style; 
  }
}

/**
 * Represents a CSS class.
 */
export class StyleClass {
  /**
   * CSS style rules for the class.
   */
  public style: string;
  
  /**
   * Class name without the global prefix.
   */
  public localName: string;
  /**
   * Fully qualified CSS class name.
   */
  public name: string;

  /**
   * Creates a CSS class declaration based on supplied (local) name and style rules.
   * @param name - local CSS class name (will be prefixed with the marker.js prefix).
   * @param style - style declarations.
   */
  constructor(name: string, style: string) {
    this.localName = name;
    this.style = style; 
  }
}
