import { encode as encodeWebPFrame } from "@jsquash/webp";
import { applyPalette, GIFEncoder, quantize } from "gifenc";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Preset = "large" | "medium" | "small";
export type Format = "gif" | "webp" | "video";

export const PRESET_SIZES: Record<Preset, number> = {
	large: 512,
	medium: 320,
	small: 128,
};

const FRAME_COUNT = 9;
const FRAME_DELAY_MS = 50;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadImage(src: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => resolve(img);
		img.onerror = (_e) => reject(new Error(`Failed to load image: ${src}`));
		img.src = src;
	});
}

/**
 * Draw one composited frame onto the canvas:
 *  - background frame fills the canvas
 *  - user logo sits in the top-left corner with padding
 */
function compositeFrame(
	ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
	frame: HTMLImageElement,
	logo: HTMLImageElement | ImageBitmap,
	size: number,
	bg?: string,
) {
	ctx.clearRect(0, 0, size, size);

	// Fill solid background if requested (video needs this, GIF/WebP use transparency)
	if (bg) {
		ctx.fillStyle = bg;
		ctx.fillRect(0, 0, size, size);
	}

	// Draw background frame, scaled to fill
	ctx.drawImage(frame, 0, 0, size, size);

	// Logo placement: top-left, ~5% padding, ~30% of frame size
	const pad = Math.round(size * 0.05);
	const maxLogoDim = Math.round(size * 0.3);

	const logoW =
		logo.width >= logo.height ? maxLogoDim : Math.round((logo.width / logo.height) * maxLogoDim);
	const logoH =
		logo.height >= logo.width ? maxLogoDim : Math.round((logo.height / logo.width) * maxLogoDim);

	ctx.drawImage(logo, pad, pad, logoW, logoH);
}

// ---------------------------------------------------------------------------
// Animated WebP muxer
// ---------------------------------------------------------------------------

/** Little-endian helper */
function writeUint32LE(value: number): Uint8Array {
	const buf = new Uint8Array(4);
	buf[0] = value & 0xff;
	buf[1] = (value >> 8) & 0xff;
	buf[2] = (value >> 16) & 0xff;
	buf[3] = (value >> 24) & 0xff;
	return buf;
}

function writeUint24LE(value: number): Uint8Array {
	const buf = new Uint8Array(3);
	buf[0] = value & 0xff;
	buf[1] = (value >> 8) & 0xff;
	buf[2] = (value >> 16) & 0xff;
	return buf;
}

/**
 * Build an animated WebP from individual WebP frame ArrayBuffers.
 *
 * Uses the RIFF container format:
 *   RIFF(WEBP)
 *     VP8X (extended header with animation flag)
 *     ANIM (animation parameters)
 *     ANMF (per-frame chunks, each wrapping the raw VP8/VP8L bitstream)
 */
async function muxAnimatedWebP(
	frames: ArrayBuffer[],
	width: number,
	height: number,
	delayMs: number,
): Promise<Blob> {
	// Extract the raw VP8/VP8L bitstream from each single-image WebP
	const rawFrames: Uint8Array[] = [];
	for (const frame of frames) {
		const view = new DataView(frame);
		// Skip RIFF header (12 bytes), then find the VP8 or VP8L chunk
		let offset = 12;
		while (offset < frame.byteLength) {
			const fourcc = String.fromCharCode(
				view.getUint8(offset),
				view.getUint8(offset + 1),
				view.getUint8(offset + 2),
				view.getUint8(offset + 3),
			);
			const chunkSize = view.getUint32(offset + 4, true);
			if (fourcc === "VP8 " || fourcc === "VP8L") {
				// Include the fourcc + size + data
				const chunkBytes = new Uint8Array(frame, offset, 8 + chunkSize + (chunkSize % 2));
				rawFrames.push(chunkBytes);
				break;
			}
			// Move to next chunk (chunks are padded to even size)
			offset += 8 + chunkSize + (chunkSize % 2);
		}
	}

	if (rawFrames.length === 0) {
		throw new Error("No VP8/VP8L chunks found in WebP frames");
	}

	const encoder = new TextEncoder();

	// VP8X chunk: 10 bytes payload
	// Flags: animation bit = 0x02
	const vp8xPayload = new Uint8Array(10);
	vp8xPayload[0] = 0x02; // animation flag
	// canvas width - 1 (24-bit LE) at bytes 4..6
	const w1 = writeUint24LE(width - 1);
	vp8xPayload[4] = w1[0];
	vp8xPayload[5] = w1[1];
	vp8xPayload[6] = w1[2];
	// canvas height - 1 (24-bit LE) at bytes 7..9
	const h1 = writeUint24LE(height - 1);
	vp8xPayload[7] = h1[0];
	vp8xPayload[8] = h1[1];
	vp8xPayload[9] = h1[2];

	// ANIM chunk: 6 bytes payload
	// background color (4 bytes, BGRA) + loop count (2 bytes)
	const animPayload = new Uint8Array(6);
	// background = transparent black (0,0,0,0) - already zeroed
	// loop count = 0 = infinite
	animPayload[4] = 0;
	animPayload[5] = 0;

	// Build ANMF chunks
	const anmfChunks: Uint8Array[] = [];
	for (const rawFrame of rawFrames) {
		// ANMF payload: 16 bytes header + frame data
		// offset X (24-bit), offset Y (24-bit), width-1 (24-bit), height-1 (24-bit),
		// duration (24-bit), flags (1 byte)
		const anmfHeader = new Uint8Array(16);
		// offsets = 0 (already zeroed)
		// width - 1
		const fw = writeUint24LE(width - 1);
		anmfHeader[6] = fw[0];
		anmfHeader[7] = fw[1];
		anmfHeader[8] = fw[2];
		// height - 1
		const fh = writeUint24LE(height - 1);
		anmfHeader[9] = fh[0];
		anmfHeader[10] = fh[1];
		anmfHeader[11] = fh[2];
		// duration in ms (24-bit LE)
		const dur = writeUint24LE(delayMs);
		anmfHeader[12] = dur[0];
		anmfHeader[13] = dur[1];
		anmfHeader[14] = dur[2];
		// flags: bit 0 = dispose to bg (1), bit 1 = no blending (0)
		anmfHeader[15] = 1;

		const anmfPayloadSize = 16 + rawFrame.byteLength;
		const anmfPadding = anmfPayloadSize % 2; // pad to even

		const anmfChunk = new Uint8Array(8 + anmfPayloadSize + anmfPadding);
		anmfChunk.set(encoder.encode("ANMF"), 0);
		anmfChunk.set(writeUint32LE(anmfPayloadSize), 4);
		anmfChunk.set(anmfHeader, 8);
		anmfChunk.set(rawFrame, 24);
		anmfChunks.push(anmfChunk);
	}

	// Calculate total file size
	const vp8xChunkSize = 8 + vp8xPayload.byteLength;
	const animChunkSize = 8 + animPayload.byteLength;
	let anmfTotalSize = 0;
	for (const c of anmfChunks) anmfTotalSize += c.byteLength;
	const riffPayloadSize = 4 + vp8xChunkSize + animChunkSize + anmfTotalSize; // 4 for "WEBP"

	// Assemble all chunks into a single Uint8Array
	const chunks: Uint8Array[] = [];
	chunks.push(encoder.encode("RIFF"));
	chunks.push(writeUint32LE(riffPayloadSize));
	chunks.push(encoder.encode("WEBP"));
	chunks.push(encoder.encode("VP8X"));
	chunks.push(writeUint32LE(vp8xPayload.byteLength));
	chunks.push(vp8xPayload);
	chunks.push(encoder.encode("ANIM"));
	chunks.push(writeUint32LE(animPayload.byteLength));
	chunks.push(animPayload);
	for (const c of anmfChunks) chunks.push(c);

	// Concatenate into one buffer
	let totalLen = 0;
	for (const c of chunks) totalLen += c.byteLength;
	const result = new Uint8Array(totalLen);
	let offset = 0;
	for (const c of chunks) {
		result.set(c, offset);
		offset += c.byteLength;
	}

	return new Blob([new Uint8Array(result)], { type: "image/webp" });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Load all 9 animation frames and return as HTMLImageElements.
 * Useful for the live preview.
 */
export async function loadFrames(): Promise<HTMLImageElement[]> {
	const promises: Promise<HTMLImageElement>[] = [];
	for (let i = 1; i <= FRAME_COUNT; i++) {
		promises.push(loadImage(`/frames/frame-${i}.png`));
	}
	return Promise.all(promises);
}

/**
 * Render one composited frame to a canvas and return the canvas/context.
 * Used by the live preview component.
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

/**
 * Generate the final sticker as a downloadable Blob.
 */
export async function generateSticker(options: {
	logo: HTMLImageElement | ImageBitmap;
	preset: Preset;
	format: Format;
	onProgress?: (percent: number) => void;
}): Promise<Blob> {
	const { logo, preset, format, onProgress } = options;
	const size = PRESET_SIZES[preset];

	// Load frames
	onProgress?.(5);
	const frames = await loadFrames();
	onProgress?.(15);

	// Create an offscreen canvas
	const canvas = document.createElement("canvas");
	canvas.width = size;
	canvas.height = size;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Failed to get 2d context");

	if (format === "gif") {
		return encodeGIF(ctx, canvas, frames, logo, size, onProgress);
	} else if (format === "video") {
		return encodeVideo(ctx, canvas, frames, logo, size, onProgress);
	} else {
		return encodeWebP(ctx, canvas, frames, logo, size, onProgress);
	}
}

// ---------------------------------------------------------------------------
// GIF encoding
// ---------------------------------------------------------------------------

async function encodeGIF(
	ctx: CanvasRenderingContext2D,
	_canvas: HTMLCanvasElement,
	frames: HTMLImageElement[],
	logo: HTMLImageElement | ImageBitmap,
	size: number,
	onProgress?: (percent: number) => void,
): Promise<Blob> {
	const gif = GIFEncoder();

	for (let i = 0; i < frames.length; i++) {
		compositeFrame(ctx, frames[i], logo, size);
		const imageData = ctx.getImageData(0, 0, size, size);
		const { data } = imageData;

		// Snap semi-transparent pixels: alpha >= 128 becomes fully opaque,
		// alpha < 128 becomes fully transparent. This prevents dark fringe
		// artifacts since GIF only supports 1-bit transparency.
		for (let px = 0; px < data.length; px += 4) {
			if (data[px + 3] < 128) {
				data[px] = 0;
				data[px + 1] = 0;
				data[px + 2] = 0;
				data[px + 3] = 0;
			} else {
				data[px + 3] = 255;
			}
		}

		const palette = quantize(data, 256, { format: "rgba4444" });
		const index = applyPalette(data, palette, "rgba4444");

		// Find a transparent color in the palette (alpha < 128)
		let transparentIndex = -1;
		for (let p = 0; p < palette.length; p++) {
			if (palette[p][3] !== undefined && palette[p][3] < 128) {
				transparentIndex = p;
				break;
			}
		}

		gif.writeFrame(index, size, size, {
			palette,
			delay: FRAME_DELAY_MS,
			repeat: 0,
			transparent: transparentIndex >= 0,
			transparentIndex: transparentIndex >= 0 ? transparentIndex : 0,
			dispose: 2,
		});

		const progress = 20 + Math.round((i / frames.length) * 75);
		onProgress?.(progress);

		// Yield to keep UI responsive
		await new Promise((r) => setTimeout(r, 0));
	}

	gif.finish();
	onProgress?.(100);

	const bytes = gif.bytes();
	return new Blob([new Uint8Array(bytes)], { type: "image/gif" });
}

// ---------------------------------------------------------------------------
// Animated WebP encoding
// ---------------------------------------------------------------------------

async function encodeWebP(
	ctx: CanvasRenderingContext2D,
	_canvas: HTMLCanvasElement,
	frames: HTMLImageElement[],
	logo: HTMLImageElement | ImageBitmap,
	size: number,
	onProgress?: (percent: number) => void,
): Promise<Blob> {
	const frameBuffers: ArrayBuffer[] = [];

	for (let i = 0; i < frames.length; i++) {
		compositeFrame(ctx, frames[i], logo, size);

		// Encode frame to WebP via WASM (works on all browsers including iOS)
		const imageData = ctx.getImageData(0, 0, size, size);
		const webpBuffer = await encodeWebPFrame(imageData, {
			lossless: 1,
			alpha_compression: 1,
			alpha_quality: 100,
		});
		frameBuffers.push(webpBuffer);

		const progress = 20 + Math.round((i / frames.length) * 65);
		onProgress?.(progress);
	}

	onProgress?.(90);
	const result = await muxAnimatedWebP(frameBuffers, size, size, FRAME_DELAY_MS);
	onProgress?.(100);
	return result;
}

// ---------------------------------------------------------------------------
// Video encoding (MP4/WebM via MediaRecorder)
// ---------------------------------------------------------------------------

async function encodeVideo(
	ctx: CanvasRenderingContext2D,
	canvas: HTMLCanvasElement,
	frames: HTMLImageElement[],
	logo: HTMLImageElement | ImageBitmap,
	size: number,
	onProgress?: (percent: number) => void,
): Promise<Blob> {
	const fps = Math.round(1000 / FRAME_DELAY_MS);

	// Use a live framerate stream (iOS needs this instead of manual requestFrame)
	const stream = canvas.captureStream(fps);

	// Pick best available codec
	const mimeType = MediaRecorder.isTypeSupported("video/mp4;codecs=avc1")
		? "video/mp4;codecs=avc1"
		: MediaRecorder.isTypeSupported("video/mp4")
			? "video/mp4"
			: MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
				? "video/webm;codecs=vp9"
				: "video/webm";

	const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 4_000_000 });
	const chunks: Blob[] = [];

	recorder.ondataavailable = (e) => {
		if (e.data.size > 0) chunks.push(e.data);
	};

	const stopped = new Promise<void>((resolve) => {
		recorder.onstop = () => resolve();
	});

	// Draw the first frame before starting to avoid blank start
	compositeFrame(ctx, frames[0], logo, size, "#ffffff");
	recorder.start(100); // collect data every 100ms

	// Loop the animation 3 times
	const loops = 3;
	const totalFrames = frames.length * loops;
	let frameCount = 0;

	for (let loop = 0; loop < loops; loop++) {
		for (let i = 0; i < frames.length; i++) {
			compositeFrame(ctx, frames[i], logo, size, "#ffffff");
			await new Promise((r) => setTimeout(r, FRAME_DELAY_MS));

			frameCount++;
			onProgress?.(20 + Math.round((frameCount / totalFrames) * 75));
		}
	}

	recorder.stop();
	await stopped;
	onProgress?.(100);

	const ext = mimeType.includes("mp4") ? "mp4" : "webm";
	return new Blob(chunks, { type: `video/${ext}` });
}
