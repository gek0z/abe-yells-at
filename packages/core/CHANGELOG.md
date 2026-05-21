# abe-yells-at

## 1.3.0

### Minor Changes

- [#17](https://github.com/gek0z/abe-yells-at/pull/17) [`af31959`](https://github.com/gek0z/abe-yells-at/commit/af31959bf0d719680a0091075d4d124d64130e5c) Thanks [@gek0z](https://github.com/gek0z)! - Update @napi-rs/canvas to v1

## 1.2.2

### Patch Changes

- [`73255c6`](https://github.com/gek0z/abe-yells-at/commit/73255c6a663dc2054b34b9b2acff94972d351596) Thanks [@gek0z](https://github.com/gek0z)! - Fix Windows path resolution, add input validation, and optimize frame assets

  - Fix `fileURLToPath` usage for correct Windows path handling
  - Validate logo dimensions to prevent division-by-zero on corrupt images
  - Add bounds check in WebP RIFF chunk parser for malformed inputs
  - Validate logo input type with clear error for unsupported types
  - Align Node WebP encoding quality with browser output (quality 100)
  - Optimize bundled frame PNGs (~70% smaller, 102 KB → 28 KB each)
  - Add integration tests for createSticker (GIF, PNG, WebP, all presets)

## 1.2.1

### Patch Changes

- [`7140c18`](https://github.com/gek0z/abe-yells-at/commit/7140c18436671d33ad56792dad0a0450921c1d6b) Thanks [@gek0z](https://github.com/gek0z)! - Improve npm package README with expanded CLI and library documentation

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
