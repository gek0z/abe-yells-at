import { describe, expect, test } from "bun:test";
import { encodeGif, type GifFrame } from "@/gif-encoder";

function makeFrame(width: number, height: number, r: number, g: number, b: number): GifFrame {
	const data = new Uint8Array(width * height * 4);
	for (let i = 0; i < width * height; i++) {
		data[i * 4] = r;
		data[i * 4 + 1] = g;
		data[i * 4 + 2] = b;
		data[i * 4 + 3] = 255;
	}
	return { data, width, height };
}

describe("encodeGif", () => {
	test("throws on empty frames", () => {
		expect(() => encodeGif([])).toThrow("At least one frame is required");
	});

	test("produces valid GIF header", () => {
		const frame = makeFrame(2, 2, 255, 0, 0);
		const gif = encodeGif([frame]);

		// GIF89a magic bytes
		expect(gif[0]).toBe(0x47); // G
		expect(gif[1]).toBe(0x49); // I
		expect(gif[2]).toBe(0x46); // F
		expect(gif[3]).toBe(0x38); // 8
		expect(gif[4]).toBe(0x39); // 9
		expect(gif[5]).toBe(0x61); // a
	});

	test("ends with GIF trailer byte", () => {
		const frame = makeFrame(2, 2, 0, 255, 0);
		const gif = encodeGif([frame]);

		// GIF trailer is 0x3B
		expect(gif[gif.length - 1]).toBe(0x3b);
	});

	test("encodes multiple frames", () => {
		const frames = [
			makeFrame(4, 4, 255, 0, 0),
			makeFrame(4, 4, 0, 255, 0),
			makeFrame(4, 4, 0, 0, 255),
		];
		const gif = encodeGif(frames, 100);

		// Should be a valid GIF with reasonable size
		expect(gif.length).toBeGreaterThan(50);
		expect(gif[0]).toBe(0x47); // G
		expect(gif[gif.length - 1]).toBe(0x3b); // trailer
	});

	test("respects delay parameter", () => {
		const frame = makeFrame(2, 2, 128, 128, 128);
		const fast = encodeGif([frame, frame], 50);
		const slow = encodeGif([frame, frame], 200);

		// Different delays produce different bytes (delay is encoded in the GCE)
		let differ = false;
		for (let i = 0; i < fast.length; i++) {
			if (fast[i] !== slow[i]) {
				differ = true;
				break;
			}
		}
		expect(differ).toBe(true);
	});

	test("handles single-pixel frame", () => {
		const frame = makeFrame(1, 1, 255, 255, 255);
		const gif = encodeGif([frame]);
		expect(gif[0]).toBe(0x47);
		expect(gif[gif.length - 1]).toBe(0x3b);
	});
});
