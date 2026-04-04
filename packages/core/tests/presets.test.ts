import { describe, expect, test } from "bun:test";
import { presets } from "@/presets";

describe("presets", () => {
	test("large is 512x512", () => {
		expect(presets.large.width).toBe(512);
		expect(presets.large.height).toBe(512);
	});

	test("medium is 320x320", () => {
		expect(presets.medium.width).toBe(320);
		expect(presets.medium.height).toBe(320);
	});

	test("small is 128x128", () => {
		expect(presets.small.width).toBe(128);
		expect(presets.small.height).toBe(128);
	});

	test("logo placement is within frame bounds", () => {
		for (const preset of Object.values(presets)) {
			const { logo } = preset;
			expect(logo.x).toBeGreaterThan(0);
			expect(logo.y).toBeGreaterThan(0);
			expect(logo.x + logo.maxWidth).toBeLessThan(preset.width);
			expect(logo.y + logo.maxHeight).toBeLessThan(preset.height);
		}
	});

	test("logo size is roughly 40-50% of frame", () => {
		for (const preset of Object.values(presets)) {
			const ratio = preset.logo.maxWidth / preset.width;
			expect(ratio).toBeGreaterThan(0.4);
			expect(ratio).toBeLessThan(0.5);
		}
	});
});
