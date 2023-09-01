# CROPRO Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.4] - 2023-09-01
### Changed
- improved responsiveness when working with large images.

## [1.2.3] - 2023-07-28
### Fixed
- crop area resizing sometimes would get stuck

## [1.2.2] - 2023-02-06
### Fixed
- broken rendering of flipped images with `renderAtNaturalSize=true`

## [1.2.1] - 2022-11-15
### Fixed
- crop rectangle shifts weirdly in some scenarios when zoom-to-crop is enabled

## [1.2.0] - 2022-01-14
### Added
- `zIndex` setting for controlling UI z-index

## [1.1.2] - 2021-10-13
### Changed
- deprecated CSSStyleSheet `rules` and `addRule()` members replaced with standard `cssRules` and `insertRule`

## [1.1.1] - 2021-10-12
### Fixed
- `renderAtNaturalSize` still caused resolution loss when image was rotated

## [1.1.0] - 2021-07-20
### Added
- `classNamePrefixBase` as a static class name for the UI wrapper

### Changed
- reworked image rendering to dramatically improve performance on larger images

## [1.0.7] - 2021-05-21
### Fixed
- not working in "legacy" Microsoft Edge (won't be officially supported going forward)

## [1.0.6] - 2021-05-10
### Fixed
- cropped image wasn't rendered in Safari on the first try

## [1.0.5] - 2021-04-28
### Fixed
- clicking close button wasn't firing the 'close' event.

## [1.0.4] - 2021-04-23
### Fixed
- negative width/height exceptions when closing a popup
- slight offset on rotation

## [1.0.3] - 2021-04-09
### Fixed
- toolbar button color customization inconsistencies.
- image rotation and flipping was off after resizing.
- straightening behavior on touch devices.
- rotation, flipping in Safari.

## [1.0.2] - 2021-04-07
### Added
- `toolbarDropdownStyleColorsClassName` setting to control the colors of the dropdown section of a dropdown button.

### Fixed
- UI sizing issues in pages overriding default line-height CSS style (eg. TailwindCSS).
- hidden toolbars still interferred with pointer events.
- if `aspectRatios` is set to a new value but `aspectRatio` isn't set explicitly it should return the first AR in `aspectRatios`.
- aspect ratio dropdown should be narrower when there are less than 4 items in it.

## [1.0.1] - 2021-03-31
### Added
- links to docs and demos to README.

### Fixed
- setting zoomToCropEnabled from code caused an error.

## [1.0.0] - 2021-03-23
### Added
- Initial public release.

[1.2.4]: https://github.com/ailon/cropro/releases/tag/v1.2.4
[1.2.3]: https://github.com/ailon/cropro/releases/tag/v1.2.3
[1.2.2]: https://github.com/ailon/cropro/releases/tag/v1.2.2
[1.2.1]: https://github.com/ailon/cropro/releases/tag/v1.2.1
[1.2.0]: https://github.com/ailon/cropro/releases/tag/v1.2.0
[1.1.2]: https://github.com/ailon/cropro/releases/tag/v1.1.2
[1.1.1]: https://github.com/ailon/cropro/releases/tag/v1.1.1
[1.1.0]: https://github.com/ailon/cropro/releases/tag/v1.1.0
[1.0.7]: https://github.com/ailon/cropro/releases/tag/v1.0.7
[1.0.6]: https://github.com/ailon/cropro/releases/tag/v1.0.6
[1.0.5]: https://github.com/ailon/cropro/releases/tag/v1.0.5
[1.0.4]: https://github.com/ailon/cropro/releases/tag/v1.0.4
[1.0.3]: https://github.com/ailon/cropro/releases/tag/v1.0.3
[1.0.2]: https://github.com/ailon/cropro/releases/tag/v1.0.2
[1.0.1]: https://github.com/ailon/cropro/releases/tag/v1.0.1
[1.0.0]: https://github.com/ailon/cropro/releases/tag/v1.0.0
