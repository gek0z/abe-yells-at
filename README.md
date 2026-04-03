# Abe Yells At

<p align="center">
  <img src="assets/abe.gif" alt="Grandpa Abe Simpson yelling" width="200" />
</p>

<p align="center">
  Create animated stickers of Grandpa Abe Simpson yelling at your logo.<br/>
  Download as GIF or WebP for WhatsApp, Slack, or Discord.
</p>

## What's in the box

This is a monorepo with two packages:

| Package | Description |
|---------|-------------|
| [`abe-yells-at`](packages/core) | npm library + CLI for generating stickers programmatically |
| [`@abe-yells/web`](apps/web) | Web app for creating stickers in the browser |

## Quick Start

### Web App

```bash
bun install
cd apps/web && bun run dev
```

Open [http://localhost:5173](http://localhost:5173), upload a logo, pick a size, download your sticker.

### CLI

```bash
npx abe-yells-at logo.png
```

Options:

```
--preset, -p   whatsapp | slack | discord   (default: whatsapp)
--format, -f   gif | webp | all             (default: all)
--output, -o   output directory             (default: .)
```

### Library

```bash
npm install abe-yells-at
```

```ts
import { createSticker } from "abe-yells-at";

const result = await createSticker({
  logo: "./my-logo.png",
  preset: "whatsapp",
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
  preset: "discord",
  format: "webp",
});
```

## Size Presets

| Preset | Size | Use case |
|--------|------|----------|
| `whatsapp` | 512x512 | WhatsApp stickers |
| `slack` | 128x128 | Slack custom emoji |
| `discord` | 320x320 | Discord stickers |

## Development

```bash
# Install dependencies
bun install

# Run web app dev server
cd apps/web && bun run dev

# Build everything
bun run build

# Lint & format
bun run check

# Type check (uses tsgo)
bun run typecheck
```

## Tech Stack

- **Runtime & package manager**: [Bun](https://bun.sh) workspaces
- **Type checking**: [tsgo](https://github.com/nicolo-ribaudo/tsgo) (`@typescript/native-preview`)
- **Linting & formatting**: [Biome](https://biomejs.dev)
- **Web app**: [Vite](https://vite.dev) + [React](https://react.dev)
- **GIF encoding**: [gifenc](https://github.com/mattdesl/gifenc)
- **WebP encoding**: Custom animated WebP RIFF muxer
- **Deployment**: [Cloudflare Pages](https://pages.cloudflare.com)

All sticker processing happens client-side -- no server needed.

## Deploy

The web app deploys to Cloudflare Pages:

```bash
cd apps/web
bun run build
npx wrangler pages deploy dist
```

## License

MIT
