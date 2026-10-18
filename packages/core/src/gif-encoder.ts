import { applyPalette, GIFEncoder, quantize } from "gifenc";

export interface GifFrame {
	data: Uint8Array | Uint8ClampedArray;
	width: number;
	height: number;
}

/**
 * Encode an array of RGBA image frames into an animated GIF.
 *
 * @param frames  Array of objects with raw RGBA `data`, `width`, and `height`.
 * @param delay   Delay between frames in milliseconds (default 50 = 20 fps).
 * @returns       Uint8Array of the complete GIF binary.
 */
export function encodeGif(frames: GifFrame[], delay = 50): Uint8Array {
	if (frames.length === 0) {
		throw new Error("At least one frame is required");
	}

	const { width, height } = frames[0];
	const pixelCount = width * height;

	// All frames share one palette and one palette lookup. Per-frame palettes
	// make static areas (Abe's shirt, the logo) round to a different color each
	// frame, which shows up as flicker. applyPalette also caches lookups per
	// call, so it runs once over every frame for the same reason.
	const all = new Uint8Array(frames.length * pixelCount * 4);
	for (let i = 0; i < frames.length; i++) {
		all.set(frames[i].data, i * pixelCount * 4);
	}

	// GIF only supports 1-bit alpha, so alpha >= 128 counts as opaque
	const opaque = new Uint8Array(all.length);
	let opaqueLength = 0;
	for (let px = 0; px < all.length; px += 4) {
		if (all[px + 3] >= 128) {
			opaque.set(all.subarray(px, px + 3), opaqueLength);
			opaque[opaqueLength + 3] = 255;
			opaqueLength += 4;
		}
	}

	// Reserve the last slot for transparency so it can never be merged with,
	// or stolen by, an opaque color. Opaque pixels are matched against the
	// palette without it, otherwise black outlines would map to it.
	// gifenc reads the whole underlying ArrayBuffer and ignores views, hence slice()
	const colors = quantize(opaque.slice(0, opaqueLength), 255, { format: "rgb565" });
	const transparentIndex = colors.length;
	const palette = [...colors, [0, 0, 0]];

	const indices = applyPalette(all, colors, "rgb565");
	for (let p = 0; p < indices.length; p++) {
		if (all[p * 4 + 3] < 128) indices[p] = transparentIndex;
	}

	const gif = GIFEncoder();

	for (let i = 0; i < frames.length; i++) {
		const index = indices.slice(i * pixelCount, (i + 1) * pixelCount);

		gif.writeFrame(index, width, height, {
			// Only the first frame carries the palette, written as the global color table
			palette: i === 0 ? palette : undefined,
			delay,
			repeat: 0, // loop infinitely
			transparent: true,
			transparentIndex,
			dispose: 2, // restore to background
		});
	}

	gif.finish();
	return gif.bytes();
}
