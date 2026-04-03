import { describe, expect, test } from "bun:test";
import { presets } from "@/presets";

describe("presets", () => {
	test("whatsapp is 512x512", () => {
		expect(presets.whatsapp.width).toBe(512);
		expect(presets.whatsapp.height).toBe(512);
	});

	test("slack is 128x128", () => {
		expect(presets.slack.width).toBe(128);
		expect(presets.slack.height).toBe(128);
	});

	test("discord is 320x320", () => {
		expect(presets.discord.width).toBe(320);
		expect(presets.discord.height).toBe(320);
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

	test("logo size is roughly 30-35% of frame", () => {
		for (const preset of Object.values(presets)) {
			const ratio = preset.logo.maxWidth / preset.width;
			expect(ratio).toBeGreaterThan(0.25);
			expect(ratio).toBeLessThan(0.4);
		}
	});
});
