import { encodeGif, type GifFrame } from "@/gif-encoder";
import { type PresetConfig, presets } from "@/presets";
import type { Format, OnProgress, Preset, StickerOptions, StickerResult } from "@/types";
import { encodeAnimatedWebP, type WebPFrame } from "@/webp-encoder";

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
	const onProgress = options.onProgress;

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

	onProgress?.(15);

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

		for (let i = 0; i < frameImages.length; i++) {
			const frameImg = frameImages[i];
			const canvas = createCanvas(width, height);
			const ctx = canvas.getContext("2d");

			// Draw logo first (behind Abe)
			ctx.drawImage(logoImage, logoX, logoY, logoW, logoH);

			// Draw the Abe frame on top
			ctx.drawImage(frameImg, 0, 0, width, height);

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

			onProgress?.(20 + Math.round((i / frameImages.length) * 75));
		}

		const data = encodeGif(gifFrames, FRAME_DELAY_MS);
		onProgress?.(100);
		return { data, format: "gif", width, height, preset };
	}

	// ── WebP path ─────────────────────────────────────────────────
	const webpFrames: WebPFrame[] = [];

	for (let i = 0; i < frameImages.length; i++) {
		const frameImg = frameImages[i];
		const canvas = createCanvas(width, height);
		const ctx = canvas.getContext("2d");

		// Draw logo first (behind Abe)
		ctx.drawImage(logoImage, logoX, logoY, logoW, logoH);

		// Draw the Abe frame on top
		ctx.drawImage(frameImg, 0, 0, width, height);

		const buf = await canvas.encode("webp", 80);
		const frameData = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
		webpFrames.push({ data: frameData, width, height });

		onProgress?.(20 + Math.round((i / frameImages.length) * 70));
	}

	const data = encodeAnimatedWebP(webpFrames, FRAME_DELAY_MS);
	onProgress?.(100);
	return { data, format: "webp", width, height, preset };
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
	/** Progress callback (0-100). */
	onProgress?: OnProgress;
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
 * Draw one composited frame onto a canvas context.
 * Draws logo first, then Abe frame on top.
 */
export function compositeFrame(
	ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
	frame: HTMLImageElement | ImageBitmap,
	logo: HTMLImageElement | ImageBitmap,
	size: number,
	bg?: string,
): void {
	const config = presets.large;
	// Find the right preset by size
	let presetConfig: PresetConfig = config;
	for (const p of Object.values(presets)) {
		if (p.width === size) {
			presetConfig = p;
			break;
		}
	}

	ctx.clearRect(0, 0, size, size);

	// Fill solid background if requested
	if (bg) {
		ctx.fillStyle = bg;
		ctx.fillRect(0, 0, size, size);
	}

	// Calculate logo dimensions
	const logoAspect = logo.width / logo.height;
	let logoW = presetConfig.logo.maxWidth;
	let logoH = logoW / logoAspect;
	if (logoH > presetConfig.logo.maxHeight) {
		logoH = presetConfig.logo.maxHeight;
		logoW = logoH * logoAspect;
	}
	logoW = Math.round(logoW);
	logoH = Math.round(logoH);

	// Draw logo first (behind Abe)
	ctx.drawImage(logo, presetConfig.logo.x, presetConfig.logo.y, logoW, logoH);

	// Draw Abe frame on top
	ctx.drawImage(frame, 0, 0, size, size);
}

/**
 * Create a sticker in the browser from pre-loaded images.
 * Uses @jsquash/webp for WebP encoding.
 */
export async function createStickerFromImages(
	options: BrowserStickerOptions,
): Promise<StickerResult> {
	const preset: Preset = options.preset ?? "large";
	const format: Format = options.format ?? "gif";
	const config: PresetConfig = presets[preset];
	const { width, height } = config;
	const onProgress = options.onProgress;

	if (options.frames.length !== FRAME_COUNT) {
		throw new Error(`Expected ${FRAME_COUNT} frames, got ${options.frames.length}`);
	}

	const logo = options.logo;

	const canvas = new OffscreenCanvas(width, height);
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Failed to get 2d context");

	if (format === "gif") {
		const gifFrames: GifFrame[] = [];

		for (let i = 0; i < options.frames.length; i++) {
			compositeFrame(ctx as unknown as CanvasRenderingContext2D, options.frames[i], logo, width);

			const imageData = ctx.getImageData(0, 0, width, height);
			gifFrames.push({
				data: new Uint8Array(imageData.data.buffer),
				width,
				height,
			});

			onProgress?.(20 + Math.round((i / options.frames.length) * 75));
		}

		const data = encodeGif(gifFrames, FRAME_DELAY_MS);
		onProgress?.(100);
		return { data, format: "gif", width, height, preset };
	}

	// ── WebP path (using @jsquash/webp) ──────────────────────────
	const { encode: encodeWebPFrame } = await import("@jsquash/webp");
	const webpFrames: WebPFrame[] = [];

	for (let i = 0; i < options.frames.length; i++) {
		compositeFrame(ctx as unknown as CanvasRenderingContext2D, options.frames[i], logo, width);

		const imageData = ctx.getImageData(0, 0, width, height);
		const webpBuffer = await encodeWebPFrame(imageData, {
			lossless: 1,
			alpha_compression: 1,
			alpha_quality: 100,
		});
		webpFrames.push({ data: new Uint8Array(webpBuffer), width, height });

		onProgress?.(20 + Math.round((i / options.frames.length) * 65));
	}

	onProgress?.(90);
	const data = encodeAnimatedWebP(webpFrames, FRAME_DELAY_MS);
	onProgress?.(100);
	return { data, format: "webp", width, height, preset };
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
