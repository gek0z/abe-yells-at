import {
	type BrowserStickerOptions,
	compositeFrame,
	createStickerFromImages,
	type Format,
	loadFrameImages,
	type Preset,
	type PresetConfig,
	presets,
} from "abe-yells-at";

// ---------------------------------------------------------------------------
// Re-exports from core
// ---------------------------------------------------------------------------

export type { Format, Preset };

export const PRESET_SIZES: Record<Preset, number> = Object.fromEntries(
	Object.entries(presets).map(([key, config]: [string, PresetConfig]) => [key, config.width]),
) as Record<Preset, number>;

const FRAME_COUNT = 9;
const FRAME_DELAY_MS = 50;

// ---------------------------------------------------------------------------
// Frame loading
// ---------------------------------------------------------------------------

/**
 * Load all 9 animation frames from /frames/ and return as HTMLImageElements.
 */
export async function loadFrames(): Promise<HTMLImageElement[]> {
	return loadFrameImages("/frames");
}

// ---------------------------------------------------------------------------
// Live preview
// ---------------------------------------------------------------------------

/**
 * Render one composited frame to a canvas (for the live preview).
 */
export function renderPreviewFrame(
	canvas: HTMLCanvasElement,
	frame: HTMLImageElement,
	logo: HTMLImageElement | ImageBitmap,
	size: number,
) {
	canvas.width = size;
	canvas.height = size;
	const ctx = canvas.getContext("2d");
	if (!ctx) return;
	compositeFrame(ctx, frame, logo, size);
}

// ---------------------------------------------------------------------------
// Sticker generation
// ---------------------------------------------------------------------------

/**
 * Generate the final sticker as a downloadable Blob.
 * Delegates to the core package's createStickerFromImages.
 */
export async function generateSticker(options: {
	logo: HTMLImageElement | ImageBitmap;
	preset: Preset;
	format: Format;
	onProgress?: (percent: number) => void;
}): Promise<Blob> {
	const { logo, preset, format, onProgress } = options;

	onProgress?.(5);
	const frames = await loadFrames();
	onProgress?.(15);

	const result = await createStickerFromImages({
		frames,
		logo,
		preset,
		format,
		onProgress,
	} satisfies BrowserStickerOptions);

	return new Blob([result.data], {
		type: format === "gif" ? "image/gif" : "image/webp",
	});
}

export { FRAME_COUNT, FRAME_DELAY_MS };
