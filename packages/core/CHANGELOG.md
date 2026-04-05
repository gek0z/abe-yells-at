# abe-yells-at

## 1.2.0

### Minor Changes

- [`f3db066`](https://github.com/gek0z/abe-yells-at/commit/f3db066dc142c6ef2b5c7b0ac0d309c994d4ef11) Thanks [@gek0z](https://github.com/gek0z)! - Add static PNG export format alongside GIF and WebP. Available in the npm package, CLI (`--format png`), and web app.

## 1.1.2

### Patch Changes

- [`a0bf478`](https://github.com/gek0z/abe-yells-at/commit/a0bf47855e6c2660ff32b6200049a35e5937ad74) Thanks [@gek0z](https://github.com/gek0z)! - Fix CLI output: default to input image directory instead of CWD, include original filename in output (abe-yells-at-[name]-[preset]), and fix corrupted animated WebP by stripping VP8X/ICCP chunks from ANMF frame data

## 1.1.1

### Patch Changes

- [`9f96d88`](https://github.com/gek0z/abe-yells-at/commit/9f96d88184c54411fa4c5ae7f24f1ce78a26de0e) Thanks [@gek0z](https://github.com/gek0z)! - Add repository, homepage, bugs, and author fields to package.json; add README for npm

## 1.1.0

### Minor Changes

- Deduplicate sticker generation: web app now uses core package

  - Export `compositeFrame` for reuse (logo drawn behind Abe)
  - Added `onProgress` callback to all sticker creation functions
  - Browser path uses `@jsquash/webp` WASM for WebP encoding
  - Added browser entry point for tree-shaking Node-only code
  - Removed `encodeWebPFrameNode`/`encodeWebPFrameBrowser` (internalized)

## 1.0.1

### Patch Changes

- Initial release setup
