import { describe, expect, test } from "bun:test";
import { encodeAnimatedWebP, type WebPFrame } from "@/webp-encoder";

// Minimal valid VP8L bitstream (1x1 transparent pixel)
// This is the smallest valid lossless WebP: VP8L header + 1px data
function makeMinimalWebPFrame(width: number, height: number): WebPFrame {
	// Create a minimal VP8 chunk (not a real image, but structurally valid for the muxer)
	const vp8Fourcc = new Uint8Array([0x56, 0x50, 0x38, 0x20]); // "VP8 "
	const payload = new Uint8Array(10); // minimal payload
	const size = new Uint8Array(4);
	size[0] = payload.length & 0xff;

	const data = new Uint8Array(vp8Fourcc.length + size.length + payload.length);
	data.set(vp8Fourcc, 0);
	data.set(size, 4);
	data.set(payload, 8);

	return { data, width, height };
}

// Create a fake single-image WebP with RIFF wrapper
function makeWrappedWebPFrame(width: number, height: number): WebPFrame {
	const inner = makeMinimalWebPFrame(width, height);
	const riff = new TextEncoder().encode("RIFF");
	const webp = new TextEncoder().encode("WEBP");
	const fileSize = new Uint8Array(4);
	const totalPayload = 4 + inner.data.length; // "WEBP" + inner
	fileSize[0] = totalPayload & 0xff;
	fileSize[1] = (totalPayload >> 8) & 0xff;

	const data = new Uint8Array(12 + inner.data.length);
	data.set(riff, 0);
	data.set(fileSize, 4);
	data.set(webp, 8);
	data.set(inner.data, 12);

	return { data, width, height };
}

describe("encodeAnimatedWebP", () => {
	test("throws on empty frames", () => {
		expect(() => encodeAnimatedWebP([])).toThrow("At least one frame is required");
	});

	test("produces valid RIFF/WEBP header", () => {
		const frame = makeMinimalWebPFrame(100, 100);
		const webp = encodeAnimatedWebP([frame]);

		const header = String.fromCharCode(webp[0], webp[1], webp[2], webp[3]);
		expect(header).toBe("RIFF");

		const magic = String.fromCharCode(webp[8], webp[9], webp[10], webp[11]);
		expect(magic).toBe("WEBP");
	});

	test("contains VP8X chunk with animation flag", () => {
		const frame = makeMinimalWebPFrame(100, 100);
		const webp = encodeAnimatedWebP([frame]);

		const vp8x = String.fromCharCode(webp[12], webp[13], webp[14], webp[15]);
		expect(vp8x).toBe("VP8X");

		// Animation flag is bit 1 of the flags byte (offset 20)
		expect(webp[20] & 0x02).toBe(0x02);
	});

	test("contains ANIM chunk", () => {
		const frame = makeMinimalWebPFrame(50, 50);
		const webp = encodeAnimatedWebP([frame]);

		// Find ANIM chunk after VP8X (VP8X is at offset 12, size 18 = 12+18=30)
		const anim = String.fromCharCode(webp[30], webp[31], webp[32], webp[33]);
		expect(anim).toBe("ANIM");
	});

	test("contains ANMF chunks for each frame", () => {
		const frames = [makeMinimalWebPFrame(64, 64), makeMinimalWebPFrame(64, 64)];
		const webp = encodeAnimatedWebP(frames);

		// Count ANMF occurrences
		let anmfCount = 0;
		const text = new TextDecoder("ascii");
		for (let i = 0; i < webp.length - 4; i++) {
			if (text.decode(webp.subarray(i, i + 4)) === "ANMF") {
				anmfCount++;
			}
		}
		expect(anmfCount).toBe(2);
	});

	test("strips RIFF wrapper from wrapped frames", () => {
		const rawFrame = makeMinimalWebPFrame(32, 32);
		const wrappedFrame = makeWrappedWebPFrame(32, 32);

		const fromRaw = encodeAnimatedWebP([rawFrame]);
		const fromWrapped = encodeAnimatedWebP([wrappedFrame]);

		// Both should produce the same output since the wrapper is stripped
		expect(fromRaw.length).toBe(fromWrapped.length);
	});

	test("encodes canvas dimensions correctly", () => {
		const frame = makeMinimalWebPFrame(256, 128);
		const webp = encodeAnimatedWebP([frame]);

		// Canvas width-1 is at VP8X offset 24..26 (3 bytes LE)
		// VP8X chunk starts at 12, payload at 20
		// Flags at 20 (4 bytes), then width-1 at 24 (3 bytes), height-1 at 27 (3 bytes)
		const w = webp[24] | (webp[25] << 8) | (webp[26] << 16);
		const h = webp[27] | (webp[28] << 8) | (webp[29] << 16);
		expect(w).toBe(255); // 256 - 1
		expect(h).toBe(127); // 128 - 1
	});
});
