import { encodeGif, type GifFrame } from "@/gif-encoder";
import { type PresetConfig, presets } from "@/presets";
import type { Format, Preset, StickerOptions, StickerResult } from "@/types";
import {
	encodeAnimatedWebP,
	encodeWebPFrameBrowser,
	encodeWebPFrameNode,
	type WebPFrame,
} from "@/webp-encoder";

const FRAME_COUNT = 9;
const FRAME_DELAY_MS = 50; // 20 fps

// ── Environment detection ────────────────────────────────────────────

function isNode(): boolean {
	return (
		typeof process !== "undefined" && process.versions != null && process.versions.node != null
	);
}

// ── Node implementation ──────────────────────────────────────────────

async function createStickerNode(options: StickerOptions): Promise<StickerResult> {
	const { createCanvas, loadImage } = await import("@napi-rs/canvas");
	const path = await import("node:path");

	const preset: Preset = options.preset ?? "large";
	const format: Format = options.format ?? "gif";
	const config: PresetConfig = presets[preset];
	const { width, height } = config;

	// Resolve frames directory (relative to this file in the package)
	const framesDir = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "frames");

	// Load all 9 frame PNGs
	const framePaths = Array.from({ length: FRAME_COUNT }, (_, i) =>
		path.join(framesDir, `frame-${i + 1}.png`),
	);

	const frameImages = await Promise.all(framePaths.map((p) => loadImage(p)));

	// Load the user's logo
	let logoImage: Awaited<ReturnType<typeof loadImage>>;
	if (typeof options.logo === "string") {
		// File path
		logoImage = await loadImage(options.logo);
	} else if (Buffer.isBuffer(options.logo)) {
		logoImage = await loadImage(options.logo);
	} else if (options.logo instanceof Uint8Array) {
		logoImage = await loadImage(Buffer.from(options.logo));
	} else if (options.logo instanceof ArrayBuffer) {
		logoImage = await loadImage(Buffer.from(options.logo));
	} else {
		// Blob
		const ab = await (options.logo as Blob).arrayBuffer();
		logoImage = await loadImage(Buffer.from(ab));
	}

	// Calculate logo dimensions (fit within maxWidth/maxHeight, maintain aspect ratio)
	const logoAspect = logoImage.width / logoImage.height;
	let logoW = config.logo.maxWidth;
	let logoH = logoW / logoAspect;
	if (logoH > config.logo.maxHeight) {
		logoH = config.logo.maxHeight;
		logoW = logoH * logoAspect;
	}
	logoW = Math.round(logoW);
	logoH = Math.round(logoH);

	const logoX = config.logo.x;
	const logoY = config.logo.y;

	if (format === "gif") {
		// ── GIF path ──────────────────────────────────────────────────
		const gifFrames: GifFrame[] = [];

		for (const frameImg of frameImages) {
			const canvas = createCanvas(width, height);
			const ctx = canvas.getContext("2d");

			// Draw the Abe frame scaled to canvas size
			ctx.drawImage(frameImg, 0, 0, width, height);

			// Draw a subtle white outline/shadow behind the logo
			ctx.save();
			ctx.shadowColor = "rgba(255, 255, 255, 0.85)";
			ctx.shadowBlur = Math.max(2, Math.round(width * 0.008));
			ctx.shadowOffsetX = 0;
			ctx.shadowOffsetY = 0;
			ctx.drawImage(logoImage, logoX, logoY, logoW, logoH);
			ctx.restore();

			// Draw logo on top (crisp, no shadow)
			ctx.drawImage(logoImage, logoX, logoY, logoW, logoH);

			const imageData = ctx.getImageData(0, 0, width, height);
			gifFrames.push({
				data: new Uint8Array(
					imageData.data.buffer,
					imageData.data.byteOffset,
					imageData.data.byteLength,
				),
				width,
				height,
			});
		}

		const data = encodeGif(gifFrames, FRAME_DELAY_MS);
		return { data, format: "gif", width, height, preset };
	} else {
		// ── WebP path ─────────────────────────────────────────────────
		const webpFrames: WebPFrame[] = [];

		for (const frameImg of frameImages) {
			const canvas = createCanvas(width, height);
			const ctx = canvas.getContext("2d");

			ctx.drawImage(frameImg, 0, 0, width, height);

			// Shadow for logo
			ctx.save();
			ctx.shadowColor = "rgba(255, 255, 255, 0.85)";
			ctx.shadowBlur = Math.max(2, Math.round(width * 0.008));
			ctx.shadowOffsetX = 0;
			ctx.shadowOffsetY = 0;
			ctx.drawImage(logoImage, logoX, logoY, logoW, logoH);
			ctx.restore();

			ctx.drawImage(logoImage, logoX, logoY, logoW, logoH);

			const frameData = await encodeWebPFrameNode(
				canvas as unknown as Parameters<typeof encodeWebPFrameNode>[0],
			);
			webpFrames.push({ data: frameData, width, height });
		}

		const data = encodeAnimatedWebP(webpFrames, FRAME_DELAY_MS);
		return { data, format: "webp", width, height, preset };
	}
}

// ── Browser implementation ───────────────────────────────────────────

export interface BrowserStickerOptions {
	/** Pre-loaded frame images (9 frames). */
	frames: (HTMLImageElement | ImageBitmap)[];
	/** Pre-loaded logo image. */
	logo: HTMLImageElement | ImageBitmap;
	/** Target size preset (default: 'large'). */
	preset?: Preset;
	/** Output format (default: 'gif'). */
	format?: Format;
}

/**
 * Load frame images from a base URL.
 *
 * @param basePath  URL prefix (e.g. "/frames" or "https://cdn.example.com/frames").
 * @returns         Array of 9 loaded HTMLImageElement objects.
 */
export async function loadFrameImages(basePath: string): Promise<HTMLImageElement[]> {
	const promises = Array.from({ length: FRAME_COUNT }, (_, i) => {
		return new Promise<HTMLImageElement>((resolve, reject) => {
			const img = new Image();
			img.crossOrigin = "anonymous";
			img.onload = () => resolve(img);
			img.onerror = (e) => reject(new Error(`Failed to load frame-${i + 1}.png: ${e}`));
			img.src = `${basePath}/frame-${i + 1}.png`;
		});
	});
	return Promise.all(promises);
}

/**
 * Create a sticker in the browser from pre-loaded images.
 */
export async function createStickerFromImages(
	options: BrowserStickerOptions,
): Promise<StickerResult> {
	const preset: Preset = options.preset ?? "large";
	const format: Format = options.format ?? "gif";
	const config: PresetConfig = presets[preset];
	const { width, height } = config;

	if (options.frames.length !== FRAME_COUNT) {
		throw new Error(`Expected ${FRAME_COUNT} frames, got ${options.frames.length}`);
	}

	const logo = options.logo;

	// Calculate logo dimensions
	const logoAspect = logo.width / logo.height;
	let logoW = config.logo.maxWidth;
	let logoH = logoW / logoAspect;
	if (logoH > config.logo.maxHeight) {
		logoH = config.logo.maxHeight;
		logoW = logoH * logoAspect;
	}
	logoW = Math.round(logoW);
	logoH = Math.round(logoH);

	const logoX = config.logo.x;
	const logoY = config.logo.y;

	const canvas = new OffscreenCanvas(width, height);
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Failed to get 2d context");

	if (format === "gif") {
		const gifFrames: GifFrame[] = [];

		for (const frameImg of options.frames) {
			ctx.clearRect(0, 0, width, height);
			ctx.drawImage(frameImg, 0, 0, width, height);

			ctx.save();
			ctx.shadowColor = "rgba(255, 255, 255, 0.85)";
			ctx.shadowBlur = Math.max(2, Math.round(width * 0.008));
			ctx.shadowOffsetX = 0;
			ctx.shadowOffsetY = 0;
			ctx.drawImage(logo, logoX, logoY, logoW, logoH);
			ctx.restore();

			ctx.drawImage(logo, logoX, logoY, logoW, logoH);

			const imageData = ctx.getImageData(0, 0, width, height);
			gifFrames.push({
				data: new Uint8Array(imageData.data.buffer),
				width,
				height,
			});
		}

		const data = encodeGif(gifFrames, FRAME_DELAY_MS);
		return { data, format: "gif", width, height, preset };
	} else {
		const webpFrames: WebPFrame[] = [];

		for (const frameImg of options.frames) {
			ctx.clearRect(0, 0, width, height);
			ctx.drawImage(frameImg, 0, 0, width, height);

			ctx.save();
			ctx.shadowColor = "rgba(255, 255, 255, 0.85)";
			ctx.shadowBlur = Math.max(2, Math.round(width * 0.008));
			ctx.shadowOffsetX = 0;
			ctx.shadowOffsetY = 0;
			ctx.drawImage(logo, logoX, logoY, logoW, logoH);
			ctx.restore();

			ctx.drawImage(logo, logoX, logoY, logoW, logoH);

			const frameData = await encodeWebPFrameBrowser(canvas);
			webpFrames.push({ data: frameData, width, height });
		}

		const data = encodeAnimatedWebP(webpFrames, FRAME_DELAY_MS);
		return { data, format: "webp", width, height, preset };
	}
}

// ── Main entry (auto-detects environment) ────────────────────────────

/**
 * Create an animated sticker from a logo image.
 *
 * In Node.js this uses `@napi-rs/canvas` and loads frames from the package's
 * `frames/` directory.
 *
 * In browsers, use `createStickerFromImages()` instead for full control over
 * image loading, or use `loadFrameImages()` to pre-load frames from a URL.
 */
export async function createSticker(options: StickerOptions): Promise<StickerResult> {
	if (isNode()) {
		return createStickerNode(options);
	}

	throw new Error(
		"createSticker() requires Node.js. In the browser, use createStickerFromImages() instead.",
	);
}
