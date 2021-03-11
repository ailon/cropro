import { CropArea } from '../../src';
import { CropAreaState } from '../../src/CropAreaState';

export class Experiments {
  public showCropArea(target: HTMLImageElement): void {
    const ca = new CropArea(target);
    // ca.gridLines = 8;
    // ca.isGridVisible = false;
    // ca.displayMode = 'popup';

    // ca.renderAtNaturalSize = true;
    // ca.renderWidth = 640;
    // ca.renderHeight = 480;
    ca.renderImageType = 'image/jpeg';

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ca.addRenderEventListener((dataUrl: string, state: CropAreaState) => {
      const res = document.createElement('img');
      res.src = dataUrl;
      document.body.appendChild(res);
    })
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
