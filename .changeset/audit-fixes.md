---
"abe-yells-at": patch
---

Fix Windows path resolution, add input validation, and optimize frame assets

- Fix `fileURLToPath` usage for correct Windows path handling
- Validate logo dimensions to prevent division-by-zero on corrupt images
- Add bounds check in WebP RIFF chunk parser for malformed inputs
- Validate logo input type with clear error for unsupported types
- Align Node WebP encoding quality with browser output (quality 100)
- Optimize bundled frame PNGs (~70% smaller, 102 KB → 28 KB each)
- Add integration tests for createSticker (GIF, PNG, WebP, all presets)
