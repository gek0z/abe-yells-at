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
 * @param delay   Delay between frames in milliseconds (default 100 = 10 fps).
 * @returns       Uint8Array of the complete GIF binary.
 */
export function encodeGif(frames: GifFrame[], delay = 50): Uint8Array {
	if (frames.length === 0) {
		throw new Error("At least one frame is required");
	}

	const { width, height } = frames[0];
	const gif = GIFEncoder();

	for (let i = 0; i < frames.length; i++) {
		const frame = frames[i];

		// Snap semi-transparent pixels to fully opaque or fully transparent
		// to prevent dark fringe artifacts (GIF only supports 1-bit alpha)
		const data = new Uint8Array(frame.data);
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

		gif.writeFrame(index, width, height, {
			palette,
			delay,
			repeat: 0, // loop infinitely
			transparent: transparentIndex >= 0,
			transparentIndex: transparentIndex >= 0 ? transparentIndex : 0,
			dispose: 2, // restore to background
		});
	}

	gif.finish();
	return gif.bytes();
}
