import type { Preset } from "@/types";

// Kept apart from cli.ts, which runs main() on load, so the library entry can
// re-export these without starting the CLI.

export interface CliArgs {
	imagePath: string;
	preset: Preset;
	format: "gif" | "webp" | "png" | "all";
	output: string;
}

export class CliParseError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "CliParseError";
	}
}

export function parseArgs(argv: string[]): CliArgs | null {
	const args = argv.slice(2);

	if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
		return null;
	}

	let imagePath = "";
	let preset: Preset = "large";
	let format: "gif" | "webp" | "png" | "all" = "all";
	let output = "";

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];

		if (arg === "--preset" || arg === "-p") {
			const val = args[++i];
			if (!val || !["large", "medium", "small"].includes(val)) {
				throw new CliParseError(`Invalid preset "${val}". Use large, medium, or small.`);
			}
			preset = val as Preset;
		} else if (arg === "--format" || arg === "-f") {
			const val = args[++i];
			if (!val || !["gif", "webp", "png", "all"].includes(val)) {
				throw new CliParseError(`Invalid format "${val}". Use gif, webp, png, or all.`);
			}
			format = val as "gif" | "webp" | "png" | "all";
		} else if (arg === "--output" || arg === "-o") {
			const val = args[++i];
			if (!val) {
				throw new CliParseError("--output requires a directory path.");
			}
			output = val;
		} else if (!arg.startsWith("-")) {
			imagePath = arg;
		} else {
			throw new CliParseError(`Unknown option "${arg}"`);
		}
	}

	if (!imagePath) {
		throw new CliParseError("No image path provided.");
	}

	return { imagePath, preset, format, output };
}
