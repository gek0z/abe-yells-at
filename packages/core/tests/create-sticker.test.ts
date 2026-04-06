import { describe, expect, test } from "bun:test";
import path from "node:path";
import { createSticker } from "@/create-sticker";

const LOGO = path.resolve(import.meta.dir, "..", "frames", "frame-1.png");

describe("createSticker (Node)", () => {
	test("generates GIF with default preset", async () => {
		const result = await createSticker({ logo: LOGO, format: "gif" });
		expect(result.format).toBe("gif");
		expect(result.preset).toBe("large");
		expect(result.width).toBe(512);
		expect(result.height).toBe(512);
		// GIF89a header
		expect(result.data[0]).toBe(0x47);
		expect(result.data[1]).toBe(0x49);
		expect(result.data[2]).toBe(0x46);
	});

	test("generates PNG (single frame)", async () => {
		const result = await createSticker({ logo: LOGO, format: "png" });
		expect(result.format).toBe("png");
		// PNG signature
		expect(result.data[0]).toBe(0x89);
		expect(result.data[1]).toBe(0x50);
		expect(result.data[2]).toBe(0x4e);
		expect(result.data[3]).toBe(0x47);
	});

	test("generates WebP", async () => {
		const result = await createSticker({ logo: LOGO, format: "webp" });
		expect(result.format).toBe("webp");
		// RIFF header
		const riff = String.fromCharCode(
			result.data[0],
			result.data[1],
			result.data[2],
			result.data[3],
		);
		expect(riff).toBe("RIFF");
		const webp = String.fromCharCode(
			result.data[8],
			result.data[9],
			result.data[10],
			result.data[11],
		);
		expect(webp).toBe("WEBP");
	});

	test("respects small preset", async () => {
		const result = await createSticker({ logo: LOGO, format: "png", preset: "small" });
		expect(result.width).toBe(128);
		expect(result.height).toBe(128);
		expect(result.preset).toBe("small");
	});

	test("respects medium preset", async () => {
		const result = await createSticker({ logo: LOGO, format: "png", preset: "medium" });
		expect(result.width).toBe(320);
		expect(result.height).toBe(320);
	});

	test("calls onProgress", async () => {
		const calls: number[] = [];
		await createSticker({
			logo: LOGO,
			format: "png",
			onProgress: (p) => calls.push(p),
		});
		expect(calls.length).toBeGreaterThan(0);
		expect(calls[calls.length - 1]).toBe(100);
	});

	test("accepts Buffer input", async () => {
		const fs = await import("node:fs");
		const buf = fs.readFileSync(LOGO);
		const result = await createSticker({ logo: buf, format: "png" });
		expect(result.format).toBe("png");
		expect(result.data.length).toBeGreaterThan(0);
	});

	test("accepts Uint8Array input", async () => {
		const fs = await import("node:fs");
		const buf = fs.readFileSync(LOGO);
		const uint8 = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
		const result = await createSticker({ logo: uint8, format: "png" });
		expect(result.format).toBe("png");
		expect(result.data.length).toBeGreaterThan(0);
	});

	test("throws on invalid logo path", async () => {
		expect(createSticker({ logo: "/nonexistent.png", format: "png" })).rejects.toThrow();
	});
});
