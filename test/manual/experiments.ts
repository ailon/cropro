import { CropArea } from '../../src';
import { CropAreaState } from '../../src/CropAreaState';

export class Experiments {
  savedState: CropAreaState;
  ca: CropArea;
  public showCropArea1(target: HTMLImageElement): void {
    this.ca = new CropArea(target);
    // ca.gridLines = 8;
    // ca.isGridVisible = false;
    this.ca.displayMode = 'popup';

    // ca.renderAtNaturalSize = true;
    // ca.renderWidth = 640;
    // ca.renderHeight = 480;
    this.ca.renderImageType = 'image/jpeg';

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.ca.addRenderEventListener((dataUrl: string, state: CropAreaState) => {
      const res = document.createElement('img');
      res.src = dataUrl;
      document.body.appendChild(res);
    })
    this.ca.show();
  }

  public showCropArea2(target: HTMLImageElement): void {
    this.ca = new CropArea(target);
    // ca.gridLines = 8;
    // ca.isGridVisible = false;
    // ca.displayMode = 'popup';

    // ca.renderAtNaturalSize = true;
    // ca.renderWidth = 640;
    // ca.renderHeight = 480;
    this.ca.renderImageType = 'image/jpeg';

    this.ca.styles.settings.hideTopToolbar = true;
    //this.ca.styles.settings.hideBottomToolbar = true;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.ca.addRenderEventListener((dataUrl: string, state: CropAreaState) => {
      const res = document.createElement('img');
      res.src = dataUrl;
      document.body.appendChild(res);
      this.savedState = state;
    })
    this.ca.show();
    if (this.savedState) {
      this.ca.restoreState(this.savedState);
    }
  }

  public showCropArea3(target: HTMLImageElement): void {
    this.ca = new CropArea(target);
    this.ca.gridLines = 8;
    // ca.isGridVisible = false;
    this.ca.displayMode = 'popup';

    this.ca.styles.settings.toolbarStyleColorsClassName = 'custom_toolbar background';
    this.ca.styles.settings.toolbarButtonStyleColorsClassName = 'custom_toolbar button';
    this.ca.styles.settings.toolbarActiveButtonStyleColorsClassName = 'custom_toolbar button_active';
    this.ca.styles.settings.toolbarStraightenerColorsClassName = 'custom_toolbar straightener';

    this.ca.styles.settings.toolbarOkButtonStyleColorsClassName = 'custom_toolbar ok_button';
    this.ca.styles.settings.toolbarCloseButtonStyleColorsClassName = 'custom_toolbar close_button';

    this.ca.styles.settings.cropShadeColor = 'pink';
    this.ca.styles.settings.cropFrameColor = 'yellow';
    this.ca.styles.settings.gripColor = 'red';
    this.ca.styles.settings.gripFillColor = 'blue';
    
    this.ca.styles.settings.canvasBackgroundColor = 'magenta';



    this.ca.renderAtNaturalSize = true;
    // ca.renderWidth = 640;
    // ca.renderHeight = 480;
    // ca.renderImageType = 'image/jpeg';

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.ca.addRenderEventListener((dataUrl: string, state: CropAreaState) => {
      const res = document.createElement('img');
      res.src = dataUrl;
      document.body.appendChild(res);
    })
    this.ca.show();
  }

  public renderAndClose(): void {
    if (this.ca) {
      this.ca.startRenderAndClose();
    }
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
  document.getElementById('renderButton').addEventListener('click', () => {
    experiments.renderAndClose();
  });
});
