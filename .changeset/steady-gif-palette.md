---
"abe-yells-at": minor
---

Fix GIF flicker, invalid animated WebP, and the CLI running on import

- GIF frames share one palette, so static areas no longer flicker between frames
- Animated WebP sets the VP8X alpha flag, which libwebp-based decoders required to open the file
- Animated WebP is lossy and steps quality down to fit each preset's platform limit (WhatsApp 500KB, Discord 256KB, Slack 128KB), exposed as `PresetConfig.maxBytes`
- Importing the package no longer runs the CLI against the host process's arguments
