#!/usr/bin/env node

import { type CliArgs, CliParseError, parseArgs } from "@/cli-args";
import { createSticker } from "@/create-sticker";
import type { Format } from "@/types";

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
  ${green("--preset, -p")}   Size preset: ${yellow("large")} | ${yellow("medium")} | ${yellow("small")}  ${dim("(default: large)")}
  ${green("--format, -f")}   Output format: ${yellow("gif")} | ${yellow("webp")} | ${yellow("png")} | ${yellow("all")}  ${dim("(default: all)")}
  ${green("--output, -o")}   Output directory                        ${dim("(default: same as input)")}
  ${green("--help, -h")}     Show this help message

${bold("EXAMPLES")}
  ${dim("# Create stickers in all formats at large size")}
  ${cyan("abe-yells-at logo.png")}

  ${dim("# Create a small GIF")}
  ${cyan("abe-yells-at logo.png -p small -f gif")}

  ${dim("# Specify output directory")}
  ${cyan("abe-yells-at logo.png -o ./stickers")}
`);
}

// ── Main ─────────────────────────────────────────────────────────────

async function main(): Promise<void> {
	let parsed: CliArgs | null;
	try {
		parsed = parseArgs(process.argv);
	} catch (err) {
		if (err instanceof CliParseError) {
			console.error(red(`Error: ${err.message}`));
			printUsage();
			process.exit(1);
		}
		throw err;
	}
	if (!parsed) {
		printUsage();
		return;
	}

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

	// Ensure output directory exists (default: same directory as input image)
	const resolvedOutput = output ? path.resolve(output) : path.dirname(resolvedImage);
	if (!fs.existsSync(resolvedOutput)) {
		fs.mkdirSync(resolvedOutput, { recursive: true });
	}

	const formats: Format[] = format === "all" ? ["gif", "webp", "png"] : [format as Format];

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

			const baseName = path.basename(resolvedImage).replace(/\.[^.]+$/, "");
			const filename = `abe-yells-at-${baseName}-${preset}.${fmt}`;
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
