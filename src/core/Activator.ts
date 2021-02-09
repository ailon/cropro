/**
 * Manages commercial licenses.
 */
export class Activator {
  private static key: string;

  /**
   * Add a license key
   * @param key license key sent to you after purchase.
   */
  public static addKey(key: string): void {
    Activator.key = key;
  }

  /**
   * Returns true if the copy of CROPRO is commercially licensed.
   */
  public static get isLicensed(): boolean {
    // NOTE:
    // before removing or modifying this please consider supporting CROPRO
    // by visiting https://markerjs.com/products/cropro for details
    // thank you!
    if (Activator.key) {
      const keyRegex = new RegExp(/^CRPR-[A-Z][0-9]{3}-[A-Z][0-9]{3}-[0-9]{4}$/, 'i');
      return keyRegex.test(Activator.key);
    } else {
      return false;
    }
  }
}
