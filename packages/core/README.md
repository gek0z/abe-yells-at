# abe-yells-at

[![npm version](https://img.shields.io/npm/v/abe-yells-at?color=yellow&label=npm)](https://www.npmjs.com/package/abe-yells-at)
[![npm downloads](https://img.shields.io/npm/dm/abe-yells-at?color=yellow)](https://www.npmjs.com/package/abe-yells-at)
[![license](https://img.shields.io/github/license/gek0z/abe-yells-at)](https://github.com/gek0z/abe-yells-at/blob/main/LICENSE)

Create animated stickers of Grandpa Abe Simpson yelling at your logo. Export as GIF, WebP, or static PNG.

Try it in the browser at [abeyells.at](https://abeyells.at).

## CLI

Generate stickers from the command line, no code needed.

### Install

```bash
npm install -g abe-yells-at
# or
pnpm add -g abe-yells-at
# or
bun add -g abe-yells-at
```

Or run directly without installing:

```bash
npx abe-yells-at logo.png
```

### Options

| Flag | Values | Default | Description |
|------|--------|---------|-------------|
| `--preset, -p` | large, medium, small | large | Output size (512px, 320px, 128px) |
| `--format, -f` | gif, webp, png, all | all | Output format. `all` generates GIF + WebP + PNG |
| `--output, -o` | directory path | same as input | Where to save the output files |
| `--help, -h` | | | Show help message |

### Output

Files are named `abe-yells-at-<name>-<preset>.<ext>`. For example:

```
abe-yells-at-logo-large.gif   # animated GIF
abe-yells-at-logo-large.webp  # animated WebP
abe-yells-at-logo-large.png   # static PNG (frame 1)
```

### Examples

```bash
# Generate all formats at large size
abe-yells-at logo.png

# Small GIF only
abe-yells-at logo.png -p small -f gif

# Static PNG at medium size
abe-yells-at logo.png -f png -p medium

# Save to a specific directory
abe-yells-at logo.png -o ./stickers
```

## Library

```bash
npm install abe-yells-at
# or
pnpm add abe-yells-at
# or
bun add abe-yells-at
```

### Node.js

The `logo` option accepts a file path, URL, Buffer, ArrayBuffer, Uint8Array, or Blob.

```ts
import { createSticker } from "abe-yells-at";

const result = await createSticker({
  logo: "./my-logo.png",
  preset: "large",   // "large" | "medium" | "small"
  format: "gif",     // "gif" | "webp" | "png"
  onProgress: (percent) => console.log(percent + "%"),
});

// result.data    Uint8Array of the encoded image
// result.format  "gif" | "webp" | "png"
// result.width   pixel width
// result.height  pixel height
// result.preset  preset used
fs.writeFileSync("sticker.gif", result.data);
```

### Browser

Use `createStickerFromImages` with pre-loaded frames. Copy the 9 frame PNGs from `node_modules/abe-yells-at/frames/` to your public directory and load them with `loadFrameImages`. The `logo` must be an `HTMLImageElement` or `ImageBitmap`.

```ts
import { createStickerFromImages, loadFrameImages } from "abe-yells-at";

const frames = await loadFrameImages("/frames");
const result = await createStickerFromImages({
  frames,
  logo: myImageElement,
  preset: "medium",
  format: "webp",
  onProgress: (percent) => console.log(percent + "%"),
});

// Convert to a downloadable Blob
const blob = new Blob([result.data], { type: "image/webp" });
```

## Size Presets

| Preset | Size |
|--------|------|
| `large` | 512x512 |
| `medium` | 320x320 |
| `small` | 128x128 |

## License

MIT
