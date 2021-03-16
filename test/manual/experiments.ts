import { CropArea } from '../../src';
import { CropAreaState } from '../../src/CropAreaState';

export class Experiments {
  public showCropArea1(target: HTMLImageElement): void {
    const ca = new CropArea(target);
    // ca.gridLines = 8;
    // ca.isGridVisible = false;
    ca.displayMode = 'popup';

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

  public showCropArea2(target: HTMLImageElement): void {
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

  public showCropArea3(target: HTMLImageElement): void {
    const ca = new CropArea(target);
    ca.gridLines = 8;
    // ca.isGridVisible = false;
    ca.displayMode = 'popup';

    ca.styles.settings.toolbarStyleColorsClassName = 'custom_toolbar background';
    ca.styles.settings.toolbarButtonStyleColorsClassName = 'custom_toolbar button';
    ca.styles.settings.toolbarActiveButtonStyleColorsClassName = 'custom_toolbar button_active';
    ca.styles.settings.toolbarStraightenerColorsClassName = 'custom_toolbar straightener';

    ca.styles.settings.cropShadeColor = 'pink';
    ca.styles.settings.cropFrameColor = 'yellow';
    ca.styles.settings.gripColor = 'red';
    ca.styles.settings.gripFillColor = 'blue';
    
    ca.styles.settings.canvasBackgroundColor = 'magenta';



    ca.renderAtNaturalSize = true;
    // ca.renderWidth = 640;
    // ca.renderHeight = 480;
    // ca.renderImageType = 'image/jpeg';

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
  const experiments = new Experiments();

  const targetImg = document.getElementById('testImage1') as HTMLImageElement;
  targetImg.addEventListener('click', () =>
    experiments.showCropArea1(targetImg)
  );
  document.getElementById('openButton1').addEventListener('click', () => {
    experiments.showCropArea1(targetImg);
  });
  document.getElementById('openButton2').addEventListener('click', () => {
    experiments.showCropArea2(targetImg);
  });
  document.getElementById('openButton3').addEventListener('click', () => {
    experiments.showCropArea3(targetImg);
  });
});
