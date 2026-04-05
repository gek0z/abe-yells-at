# abe-yells-at

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
