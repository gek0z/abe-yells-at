# Abe Yells At

<p align="center">
  <img src="assets/abe.gif" alt="Grandpa Abe Simpson yelling" width="200" />
</p>

<p align="center">
  Create animated stickers of Grandpa Abe Simpson yelling at your logo.<br/>
  Upload your own or pick from 500+ brand logos. Download as GIF or WebP for WhatsApp, Slack, or Discord.
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

Open [http://localhost:5173](http://localhost:5173) -- drop a logo anywhere on the page, or search 500+ brand logos via the built-in [svgl](https://svgl.app)-powered drawer. Pick a size, download your sticker.

### CLI

```bash
npx abe-yells-at logo.png
```

Options:

```
--preset, -p   large | medium | small        (default: large)
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

# Run tests
bun run test
```

Pre-commit hooks (via [lefthook](https://github.com/evilmartians/lefthook)) automatically run lint, typecheck, and tests on every commit.

## Project Structure

```
abe-yells/
├── packages/core/          # npm package "abe-yells-at"
│   ├── src/                # library + CLI source
│   ├── tests/              # bun tests
│   └── frames/             # animation frame PNGs
├── apps/web/               # Vite + React web app
│   ├── src/
│   │   ├── App.tsx         # main app shell (landing + result views)
│   │   ├── LogoDrawer.tsx  # slide-up drawer for svgl logo search
│   │   ├── LogoMarquee.tsx # rotating logo showcase on landing page
│   │   ├── Preview.tsx     # animated canvas preview
│   │   ├── PlatformInstructions.tsx  # WhatsApp/Slack/Discord usage guides
│   │   ├── PresetSelector.tsx
│   │   ├── FormatSelector.tsx
│   │   └── sticker-engine.ts  # client-side compositing + encoding
│   └── public/frames/      # animation frames served statically
└── assets/                 # original source assets
```

## Tech Stack

- **Runtime & package manager**: [Bun](https://bun.sh) workspaces
- **Type checking**: [tsgo](https://github.com/microsoft/typescript-go) (`@typescript/native-preview`)
- **Linting & formatting**: [Biome](https://biomejs.dev)
- **Git hooks**: [Lefthook](https://github.com/evilmartians/lefthook)
- **Web app**: [Vite](https://vite.dev) + [React](https://react.dev)
- **Logo library**: [svgl](https://svgl.app) API (500+ brand SVGs)
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

## Author

Created by [riccardo.lol](https://riccardo.lol)

## License

MIT
