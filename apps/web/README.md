# Abe Yells At — Web App

The web app for [Abe Yells At](https://abeyells.at) — create animated stickers of Grandpa Abe Simpson yelling at your logo, entirely in the browser.

## Getting Started

```bash
# from the repo root
bun install
cd apps/web && bun run dev
```

Open [http://localhost:5173](http://localhost:5173).

You'll need a `.env` file for the logo search and analytics integrations:

```
VITE_LOGO_DEV_TOKEN=...
VITE_GTM_ID=...
```

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start Vite dev server |
| `bun run build` | Production build |
| `bun run preview` | Preview production build locally |
| `bun run typecheck` | Type check with tsgo |
| `bun run lint` | Lint with Biome |
| `bun run format` | Format with Biome |

## Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `App.tsx` | Landing page (logo upload/search) and sticker result view |
| `/docs` | `DocsPage.tsx` | Documentation with tabbed sections (Website, npm, CLI, Assets, Credits) |
| `/privacy` | `PrivacyPage.tsx` | Privacy policy |
| `*` | `NotFoundPage.tsx` | 404 page |

## How It Works

1. User uploads a logo (drag & drop, file picker) or searches brand logos via [svgl](https://svgl.app) / [logo.dev](https://logo.dev)
2. A live canvas preview composites the logo behind Abe's animation frames
3. On download, the sticker is encoded client-side using the `abe-yells-at` core package — GIF via gifenc, WebP via a WASM encoder, or static PNG
4. The result page shows platform-specific instructions for WhatsApp, Slack, and Discord

## Tech

- **Vite** + **React 19**
- **abe-yells-at** (workspace dependency) for sticker generation
- **@jsquash/webp** WASM encoder for animated WebP (iOS compatibility)
- **GA4** custom event tracking via GTM
- Deployed to **Cloudflare Pages**
