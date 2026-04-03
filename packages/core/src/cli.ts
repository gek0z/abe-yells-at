#!/usr/bin/env node

import { createSticker } from "./create-sticker";
import type { Format, Preset } from "./types";

// ── ANSI helpers ─────────────────────────────────────────────────────

const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;
const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const cyan = (s: string) => `\x1b[36m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;

// ── Arg parsing ──────────────────────────────────────────────────────

function printUsage(): void {
	console.log(`
${bold("abe-yells-at")} - Create animated stickers of Grandpa Abe yelling at your logo

${bold("USAGE")}
  ${cyan("abe-yells-at")} <image-path> [options]

${bold("OPTIONS")}
  ${green("--preset, -p")}   Platform preset: ${yellow("whatsapp")} | ${yellow("slack")} | ${yellow("discord")}  ${dim("(default: whatsapp)")}
  ${green("--format, -f")}   Output format: ${yellow("gif")} | ${yellow("webp")} | ${yellow("all")}             ${dim("(default: all)")}
  ${green("--output, -o")}   Output directory                              ${dim("(default: .)")}
  ${green("--help, -h")}     Show this help message

${bold("EXAMPLES")}
  ${dim("# Create stickers in all formats with whatsapp preset")}
  ${cyan("abe-yells-at logo.png")}

  ${dim("# Create a discord-sized GIF")}
  ${cyan("abe-yells-at logo.png -p discord -f gif")}

  ${dim("# Specify output directory")}
  ${cyan("abe-yells-at logo.png -o ./stickers")}
`);
}

interface CliArgs {
	imagePath: string;
	preset: Preset;
	format: "gif" | "webp" | "all";
	output: string;
}

function parseArgs(argv: string[]): CliArgs | null {
	const args = argv.slice(2);

	if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
		printUsage();
		return null;
	}

	let imagePath = "";
	let preset: Preset = "whatsapp";
	let format: "gif" | "webp" | "all" = "all";
	let output = ".";

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];

		if (arg === "--preset" || arg === "-p") {
			const val = args[++i];
			if (!val || !["whatsapp", "slack", "discord"].includes(val)) {
				console.error(red(`Error: Invalid preset "${val}". Use whatsapp, slack, or discord.`));
				process.exit(1);
			}
			preset = val as Preset;
		} else if (arg === "--format" || arg === "-f") {
			const val = args[++i];
			if (!val || !["gif", "webp", "all"].includes(val)) {
				console.error(red(`Error: Invalid format "${val}". Use gif, webp, or all.`));
				process.exit(1);
			}
			format = val as "gif" | "webp" | "all";
		} else if (arg === "--output" || arg === "-o") {
			const val = args[++i];
			if (!val) {
				console.error(red("Error: --output requires a directory path."));
				process.exit(1);
			}
			output = val;
		} else if (!arg.startsWith("-")) {
			imagePath = arg;
		} else {
			console.error(red(`Error: Unknown option "${arg}"`));
			printUsage();
			process.exit(1);
		}
	}

	if (!imagePath) {
		console.error(red("Error: No image path provided."));
		printUsage();
		process.exit(1);
	}

	return { imagePath, preset, format, output };
}

// ── Main ─────────────────────────────────────────────────────────────

async function main(): Promise<void> {
	const parsed = parseArgs(process.argv);
	if (!parsed) return;

	const { imagePath, preset, format, output } = parsed;

	// Dynamic imports for Node-only modules
	const fs = await import("node:fs");
	const path = await import("node:path");

	// Validate image path
	const resolvedImage = path.resolve(imagePath);
	if (!fs.existsSync(resolvedImage)) {
		console.error(red(`Error: File not found: ${resolvedImage}`));
		process.exit(1);
	}

	// Ensure output directory exists
	const resolvedOutput = path.resolve(output);
	if (!fs.existsSync(resolvedOutput)) {
		fs.mkdirSync(resolvedOutput, { recursive: true });
	}

	const formats: Format[] = format === "all" ? ["gif", "webp"] : [format as Format];

	console.log("");
	console.log(bold(`  Old man yells at ${cyan(path.basename(resolvedImage))}`));
	console.log(dim(`  Preset: ${preset} | Format: ${format}`));
	console.log("");

	const results: string[] = [];

	for (const fmt of formats) {
		const spinner = `  ${yellow(">")} Generating ${fmt.toUpperCase()}...`;
		process.stdout.write(spinner);

		try {
			const result = await createSticker({
				logo: resolvedImage,
				preset,
				format: fmt,
			});

			const filename = `abe-yells-at-${preset}.${fmt}`;
			const outPath = path.join(resolvedOutput, filename);
			fs.writeFileSync(outPath, result.data);

			const sizeKB = (result.data.byteLength / 1024).toFixed(1);
			process.stdout.write(
				`\r  ${green(">")} ${filename} ${dim(`(${sizeKB} KB, ${result.width}x${result.height})`)}\n`,
			);
			results.push(outPath);
		} catch (err) {
			process.stdout.write(
				`\r  ${red(">")} Failed to generate ${fmt.toUpperCase()}: ${(err as Error).message}\n`,
			);
		}
	}

	console.log("");
	if (results.length > 0) {
		console.log(green(bold("  Done!")));
		for (const r of results) {
			console.log(dim(`  ${r}`));
		}
	} else {
		console.error(red("  No stickers were generated."));
		process.exit(1);
	}
	console.log("");
}

main().catch((err) => {
	console.error(red(`Fatal: ${err.message}`));
	process.exit(1);
});
