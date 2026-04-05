# Abe Yells At

<p align="center">
  <img src="assets/abe.gif" alt="Grandpa Abe Simpson yelling" width="200" />
</p>

<p align="center">
  Create animated stickers of Grandpa Abe Simpson yelling at your logo.<br/>
  Upload your own or search thousands of brand logos. Download as GIF or WebP for WhatsApp, Slack, or Discord.
</p>

<p align="center">
  <a href="https://abeyells.at">abeyells.at</a>
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

Visit [abeyells.at](https://abeyells.at), or run locally at [http://localhost:5173](http://localhost:5173) -- drop a logo anywhere on the page, or search thousands of brand logos via the built-in drawer powered by [svgl](https://svgl.app) and [logo.dev](https://logo.dev). Pick a size, download your sticker.

The logo is composited behind Abe so his fist goes over the logo. The result page shows a live preview with step-by-step instructions for WhatsApp (Android/iOS), Slack (Desktop/Mobile), and Discord.

### CLI

```bash
npx abe-yells-at logo.png
```

Options:

```
--preset, -p   large | medium | small        (default: large)
--format, -f   gif | webp | all             (default: all)
--output, -o   output directory             (default: same as input)
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
  onProgress: (percent) => console.log(`${percent}%`),
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
  onProgress: (percent) => console.log(`${percent}%`),
});
```

The logo is composited behind Abe (his fist goes over the logo). The browser path uses WASM-based WebP encoding via `@jsquash/webp` for iOS compatibility.

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
│   ├── src/                # library + CLI source (browser + Node entry points)
│   ├── tests/              # bun tests
│   └── frames/             # animation frame PNGs
├── apps/web/               # Vite + React web app
│   ├── src/
│   │   ├── App.tsx         # main app shell (landing + result views)
│   │   ├── LogoDrawer.tsx  # slide-up drawer (svgl + logo.dev search)
│   │   ├── LogoMarquee.tsx # rotating logo showcase on landing page
│   │   ├── Preview.tsx     # animated canvas preview
│   │   ├── PlatformInstructions.tsx  # WhatsApp/Slack/Discord guides
│   │   ├── SiteNav.tsx     # shared nav (GitHub, npm, Docs, Privacy)
│   │   ├── CookieBar.tsx   # cookie consent banner (Consent Mode v2)
│   │   ├── DocsPage.tsx    # /docs page with usage guides + credits
│   │   ├── NotFoundPage.tsx # 404 page
│   │   ├── PrivacyPage.tsx # /privacy page
│   │   ├── PresetSelector.tsx
│   │   ├── FormatSelector.tsx
│   │   └── sticker-engine.ts  # thin wrapper around abe-yells-at core
│   └── public/frames/      # animation frames served statically
└── assets/                 # original source assets
```

## Tech Stack

- **Runtime & package manager**: [Bun](https://bun.sh) workspaces
- **Type checking**: [tsgo](https://github.com/microsoft/typescript-go) (`@typescript/native-preview`)
- **Linting & formatting**: [Biome](https://biomejs.dev)
- **Git hooks**: [Lefthook](https://github.com/evilmartians/lefthook)
- **Web app**: [Vite](https://vite.dev) + [React](https://react.dev)
- **Logo search**: [svgl](https://svgl.app) + [logo.dev](https://logo.dev) APIs
- **GIF encoding**: [gifenc](https://github.com/mattdesl/gifenc) with 1-bit alpha snapping
- **WebP encoding**: [@jsquash/webp](https://github.com/jamsinclair/jsquash) WASM encoder + custom animated WebP RIFF muxer
- **Versioning**: [Changesets](https://github.com/changesets/changesets)
- **Deployment**: [Cloudflare Pages](https://pages.cloudflare.com)

All sticker processing happens client-side -- no server needed.

## CI/CD

Three GitHub Actions workflows handle everything automatically:

| Workflow | Trigger | What it does |
|----------|---------|--------------|
| **CI** | push to main, PRs with `run-ci` label | lint, typecheck, test, build |
| **Deploy** | push to main (path-filtered) | deploy web app to Cloudflare Pages |
| **Release** | push to main (path-filtered) | version PR or npm publish via changesets |

### Publishing a new version

1. Make changes to `packages/core`
2. Run `bunx changeset` -- pick patch/minor/major, write a summary
3. Commit the changeset with your changes and merge to main
4. The Release workflow auto-creates a "Version Packages" PR
5. Merge that PR -- bumps version, updates CHANGELOG, publishes to npm

### Required secrets

| Secret | Where |
|--------|-------|
| `CLOUDFLARE_API_TOKEN` | GitHub Actions |
| `CLOUDFLARE_ACCOUNT_ID` | GitHub Actions |
| `VITE_LOGO_DEV_TOKEN` | GitHub Actions + `.env` |
| `VITE_GTM_ID` | GitHub Actions + `.env` |
| `CLOUDFLARE_ZONE_ID` | GitHub Actions |
| `NPM_TOKEN` | GitHub Actions (npm Automation token) |

## Author

Created by [riccardo.lol](https://riccardo.lol)

## License

MIT
