/**
 * Demo class - replace with your own code.
 */
export class LibDemo {
  /**
   * Demo method.
   * 
   * @param target - parent element to add a new element to.
   */
  public addHello(target: HTMLElement): void {
    const helloBox = document.createElement('div');
    helloBox.innerHTML = 'Hello!';
    // test comment
    target.appendChild(helloBox);
  }
}
