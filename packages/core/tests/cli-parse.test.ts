import { describe, expect, test } from "bun:test";
import { CliParseError, parseArgs } from "@/cli";

// parseArgs expects argv like process.argv: [node, script, ...args]
const argv = (...args: string[]) => ["node", "cli.js", ...args];

describe("parseArgs", () => {
	test("returns null for empty args (help)", () => {
		expect(parseArgs(argv())).toBeNull();
	});

	test("returns null for --help", () => {
		expect(parseArgs(argv("--help"))).toBeNull();
	});

	test("returns null for -h", () => {
		expect(parseArgs(argv("-h"))).toBeNull();
	});

	test("parses image path with defaults", () => {
		const result = parseArgs(argv("logo.png"));
		expect(result).toEqual({
			imagePath: "logo.png",
			preset: "whatsapp",
			format: "all",
			output: ".",
		});
	});

	test("parses --preset flag", () => {
		const result = parseArgs(argv("logo.png", "--preset", "discord"));
		expect(result?.preset).toBe("discord");
	});

	test("parses -p shorthand", () => {
		const result = parseArgs(argv("logo.png", "-p", "slack"));
		expect(result?.preset).toBe("slack");
	});

	test("parses --format flag", () => {
		const result = parseArgs(argv("logo.png", "--format", "gif"));
		expect(result?.format).toBe("gif");
	});

	test("parses -f shorthand", () => {
		const result = parseArgs(argv("logo.png", "-f", "webp"));
		expect(result?.format).toBe("webp");
	});

	test("parses --output flag", () => {
		const result = parseArgs(argv("logo.png", "--output", "./out"));
		expect(result?.output).toBe("./out");
	});

	test("parses -o shorthand", () => {
		const result = parseArgs(argv("logo.png", "-o", "/tmp/stickers"));
		expect(result?.output).toBe("/tmp/stickers");
	});

	test("parses all flags together", () => {
		const result = parseArgs(argv("logo.png", "-p", "discord", "-f", "gif", "-o", "./out"));
		expect(result).toEqual({
			imagePath: "logo.png",
			preset: "discord",
			format: "gif",
			output: "./out",
		});
	});

	test("throws on invalid preset", () => {
		expect(() => parseArgs(argv("logo.png", "-p", "telegram"))).toThrow(CliParseError);
	});

	test("throws on invalid format", () => {
		expect(() => parseArgs(argv("logo.png", "-f", "mp4"))).toThrow(CliParseError);
	});

	test("throws on unknown option", () => {
		expect(() => parseArgs(argv("logo.png", "--verbose"))).toThrow(CliParseError);
	});

	test("throws when no image path provided", () => {
		expect(() => parseArgs(argv("-p", "slack"))).toThrow(CliParseError);
	});

	test("throws on missing preset value", () => {
		expect(() => parseArgs(argv("logo.png", "-p"))).toThrow(CliParseError);
	});

	test("throws on missing output value", () => {
		expect(() => parseArgs(argv("logo.png", "-o"))).toThrow(CliParseError);
	});
});
