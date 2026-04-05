# abe-yells-at

Create animated stickers of Grandpa Abe Simpson yelling at your logo. Download as GIF or WebP for WhatsApp, Slack, or Discord.

Try it in the browser at [abeyells.at](https://abeyells.at).

## CLI

```bash
npx abe-yells-at logo.png
```

Options:

```
--preset, -p   large | medium | small        (default: large)
--format, -f   gif | webp | all             (default: all)
--output, -o   output directory             (default: same as input)
```

## Library

```bash
npm install abe-yells-at
```

```ts
import { createSticker } from "abe-yells-at";

const result = await createSticker({
  logo: "./my-logo.png",
  preset: "large",
  format: "gif",
});

// result.data is a Uint8Array of the animated GIF
```

For browser usage:

```ts
import { createStickerFromImages, loadFrameImages } from "abe-yells-at";

const frames = await loadFrameImages("/frames");
const result = await createStickerFromImages({
  frames,
  logo: myLogoElement,
  preset: "medium",
  format: "webp",
});
```

## Size Presets

| Preset | Size |
|--------|------|
| `large` | 512x512 |
| `medium` | 320x320 |
| `small` | 128x128 |

## License

MIT
