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

	test("shares one palette across frames and always marks transparency", () => {
		// More than 256 colors per frame, so per-frame palettes would differ
		const frames = [0, 1, 2].map((shift) => {
			const frame = makeFrame(32, 32, 0, 0, 0);
			for (let i = 0; i < 32 * 32; i++) {
				frame.data[i * 4] = i % 256;
				frame.data[i * 4 + 1] = (i * 7 + shift * 40) % 256;
				frame.data[i * 4 + 2] = (i >> 2) % 256;
			}
			frame.data[3] = 0; // one transparent pixel
			return frame;
		});
		const gif = encodeGif(frames);

		const descriptors = gifBlocks(gif);
		expect(descriptors).toHaveLength(3);
		for (const { localColorTable, transparent } of descriptors) {
			expect(localColorTable).toBe(false);
			expect(transparent).toBe(true);
		}
	});
});

/** Walk the GIF block structure and report each frame's palette and transparency flags. */
function gifBlocks(gif: Uint8Array): { localColorTable: boolean; transparent: boolean }[] {
	const frames: { localColorTable: boolean; transparent: boolean }[] = [];
	let p = 13;
	if (gif[10] & 0x80) p += 3 * (2 << (gif[10] & 7));
	let transparent = false;
	const skipSubBlocks = () => {
		while (gif[p]) p += gif[p] + 1;
		p++;
	};
	while (p < gif.length && gif[p] !== 0x3b) {
		const block = gif[p++];
		if (block === 0x21) {
			if (gif[p] === 0xf9) transparent = (gif[p + 2] & 1) === 1;
			p++;
			skipSubBlocks();
		} else if (block === 0x2c) {
			const flags = gif[p + 8];
			frames.push({ localColorTable: (flags & 0x80) !== 0, transparent });
			p += 9;
			if (flags & 0x80) p += 3 * (2 << (flags & 7));
			p++; // LZW minimum code size
			skipSubBlocks();
		} else {
			throw new Error(`Unexpected GIF block 0x${block.toString(16)}`);
		}
	}
	return frames;
}
