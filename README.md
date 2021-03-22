# CROPRO &mdash; image cropping and rotation component for your web apps.

CROPRO is a JavaScript browser library for adding image cropping and rotation functionality to 
your web applications.

> For a more detailed "Getting started" and other docs and tutorials, please refer to the [official documentation](https://markerjs.com/docs/cropro).

## Installation

```
npm install cropro
```

or 

```
yarn add cropro
```

## Usage

To add CROPRO to your web application follow these 3 easy steps:

1. Create an instance of `cropro.CropArea` by passing a target image reference to the constructor.
2. Set an event handler for `render` event.
3. Call the `show()` method.

Here's a simple example:

```js
// skip this line if you are importing cropro into the global space via the script tag
import * as cropro from 'cropro';

// create an instance of CropArea and pass the target image reference as a parameter
let cropArea = new cropro.CropArea(document.getElementById('myimg'));

// register an event listener for when user clicks OK/save in the UI
cropArea.addRenderEventListener(dataUrl => {
  // we are setting the cropped result to replace our original image on the page
  // but you can set a different image or upload it to your server
  document.getElementById('myimg').src = dataUrl;
});

// finally, call the show() method and CROPRO UI opens
cropArea.show();
```

## Demos
coming soon.

## More docs and tutorials
coming soon.

## Credits

cropro is using icons from [Material Design Icons](https://materialdesignicons.com/) for its toolbar.

## License
Linkware (see [LICENSE](https://github.com/ailon/cropro/blob/master/LICENSE) for details) - the UI displays a small link back to the CROPRO website which should be retained.

Alternative licenses are available through the [official website](https://markerjs.com/buy).