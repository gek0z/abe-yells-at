# abe-yells-at

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
