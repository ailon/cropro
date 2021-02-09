import { LibDemo } from '../../src';

export class Experiments {
  public addHelloToBody() {
    const ld = new LibDemo();
    ld.addHello(document.body);
  }
}

window.addEventListener('DOMContentLoaded', (event) => {
  const experiments = new Experiments();
  experiments.addHelloToBody();
});