# CROPRO Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.6] - 2020-05-10
### Fixed
- cropped image wasn't rendered in Safari on the first try

## [1.0.5] - 2020-04-28
### Fixed
- clicking close button wasn't firing the 'close' event.

## [1.0.4] - 2020-04-23
### Fixed
- negative width/height exceptions when closing a popup
- slight offset on rotation

## [1.0.3] - 2020-04-09
### Fixed
- toolbar button color customization inconsistencies.
- image rotation and flipping was off after resizing.
- straightening behavior on touch devices.
- rotation, flipping in Safari.

## [1.0.2] - 2020-04-07
### Added
- `toolbarDropdownStyleColorsClassName` setting to control the colors of the dropdown section of a dropdown button.

### Fixed
- UI sizing issues in pages overriding default line-height CSS style (eg. TailwindCSS).
- hidden toolbars still interferred with pointer events.
- if `aspectRatios` is set to a new value but `aspectRatio` isn't set explicitly it should return the first AR in `aspectRatios`.
- aspect ratio dropdown should be narrower when there are less than 4 items in it.

## [1.0.1] - 2020-03-31
### Added
- links to docs and demos to README.

### Fixed
- setting zoomToCropEnabled from code caused an error.

## [1.0.0] - 2020-03-23
### Added
- Initial public release.

[1.0.6]: https://github.com/ailon/cropro/releases/tag/v1.0.6
[1.0.5]: https://github.com/ailon/cropro/releases/tag/v1.0.5
[1.0.4]: https://github.com/ailon/cropro/releases/tag/v1.0.4
[1.0.3]: https://github.com/ailon/cropro/releases/tag/v1.0.3
[1.0.2]: https://github.com/ailon/cropro/releases/tag/v1.0.2
[1.0.1]: https://github.com/ailon/cropro/releases/tag/v1.0.1
[1.0.0]: https://github.com/ailon/cropro/releases/tag/v1.0.0
