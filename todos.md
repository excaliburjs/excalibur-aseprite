

## Reading native Aseprite files

Spec: https://github.com/aseprite/aseprite/blob/main/docs/ase-file-specs.md
DataView: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView

* [x] Download native aseprite file
* [x] Parse little-endian file in data structure
   * To read the sprite:
        * [x] Read the ASE header
        * [x] For each frame do (how many frames? the ASE header has that information):
            * Read the frame header
            * For each chunk in this frame (how many chunks? the frame header has that information)
                * Read the chunk (it should be layer information, a cel or a palette)
* [x] Extract pixel information
* [x] Read tags chunk to get animation data
* [x] Extract animation
* [x] Support multiple layers
* [x] Refactorings
