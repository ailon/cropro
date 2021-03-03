import { CropArea } from '../../src';

export class Experiments {
  public showCropArea(target: HTMLImageElement): void {
    const ca = new CropArea(target);
    // ca.gridLines = 8;
    // ca.isGridVisible = false;
    // ca.displayMode = 'popup';
    ca.show();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const targetImg = document.getElementById('testImage1') as HTMLImageElement;
  const experiments = new Experiments();
  targetImg.addEventListener('click', () =>
    experiments.showCropArea(targetImg)
  );
});
