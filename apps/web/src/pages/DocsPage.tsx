import { useState } from "react";
import { CodeBlock } from "@/components/CodeBlock";
import { SiteNav } from "@/components/SiteNav";

const TABS = ["Web App", "npm Package", "CLI", "Credits"] as const;
type Tab = (typeof TABS)[number];

const HASH_TO_TAB: Record<string, Tab> = {
	"web-app": "Web App",
	package: "npm Package",
	cli: "CLI",
	credits: "Credits",
};

const TAB_TO_HASH: Record<Tab, string> = {
	"Web App": "web-app",
	"npm Package": "package",
	CLI: "cli",
	Credits: "credits",
};

function getTabFromHash(): Tab {
	const hash = window.location.hash.replace("#", "");
	return HASH_TO_TAB[hash] ?? "Web App";
}

export function DocsPage() {
	const [tab, setTab] = useState<Tab>(getTabFromHash);

	const selectTab = (t: Tab) => {
		setTab(t);
		window.history.replaceState(null, "", `#${TAB_TO_HASH[t]}`);
	};

	return (
		<div className="docs-page">
			<SiteNav className="on-docs" activePage="docs" />

			<div className="docs-content">
				<a className="docs-back" href="/">
					&larr; Back to App
				</a>
				<h1 className="docs-title">Docs</h1>
				<p className="docs-intro">
					Create animated stickers of Grandpa Abe Simpson yelling at your logo. Upload your own or
					pick from thousands of brand logos. Download as GIF, WebP, or PNG.
				</p>

				<div className="pills docs-pills">
					{TABS.map((t) => (
						<button
							key={t}
							type="button"
							className={`pill${tab === t ? " active" : ""}`}
							onClick={() => selectTab(t)}
						>
							{t}
						</button>
					))}
				</div>

				{tab === "Web App" && (
					<section className="docs-section">
						<h2>Web App</h2>
						<p>
							The easiest way to use Abe Yells At. No installation needed, everything runs in your
							browser.
						</p>
						<ol>
							<li>
								<strong>Drop a logo</strong> anywhere on the page, or click{" "}
								<strong>Search Brand Logos</strong> to browse 500+ logos from{" "}
								<a href="https://svgl.app" target="_blank" rel="noopener noreferrer">
									svgl
								</a>{" "}
								and{" "}
								<a href="https://logo.dev" target="_blank" rel="noopener noreferrer">
									logo.dev
								</a>
								.
							</li>
							<li>
								Choose a <strong>size preset</strong> (Large 512px, Medium 320px, Small 128px) and{" "}
								<strong>format</strong> (GIF, WebP, or PNG).
							</li>
							<li>
								Click <strong>Generate & Download</strong>, the sticker is created client-side and
								downloaded instantly.
							</li>
							<li>
								Follow the <strong>platform instructions</strong> below the preview to add your
								sticker to WhatsApp, Slack, or Discord.
							</li>
						</ol>
					</section>
				)}

				{tab === "npm Package" && (
					<section className="docs-section">
						<h2>npm Package</h2>
						<p>
							Use <code>abe-yells-at</code> programmatically in your Node.js or browser projects.
						</p>
						<CodeBlock
							lang="bash"
							code={`npm install abe-yells-at
# or
pnpm add abe-yells-at
# or
bun add abe-yells-at`}
						/>

						<h3>Node.js</h3>
						<p>
							The <code>logo</code> option accepts a file path, URL, Buffer, ArrayBuffer,
							Uint8Array, or Blob.
						</p>
						<CodeBlock
							lang="ts"
							code={`import { createSticker } from "abe-yells-at";

const result = await createSticker({
  logo: "./my-logo.png",
  preset: "large",   // "large" | "medium" | "small"
  format: "gif",     // "gif" | "webp" | "png"
  onProgress: (percent) => console.log(percent + "%"),
});

// result.data    Uint8Array of the encoded image
// result.format  "gif" | "webp" | "png"
// result.width   pixel width
// result.height  pixel height
// result.preset  preset used
fs.writeFileSync("sticker.gif", result.data);`}
						/>

						<h3>Browser</h3>
						<p>
							In the browser, use <code>createStickerFromImages</code> with pre-loaded frames. Copy
							the 9 frame PNGs from <code>node_modules/abe-yells-at/frames/</code> to your public
							directory and load them with <code>loadFrameImages</code>. The <code>logo</code> must
							be an <code>HTMLImageElement</code> or <code>ImageBitmap</code>.
						</p>
						<CodeBlock
							lang="ts"
							code={`import { createStickerFromImages, loadFrameImages } from "abe-yells-at";

const frames = await loadFrameImages("/frames");
const result = await createStickerFromImages({
  frames,
  logo: myImageElement,
  preset: "medium",
  format: "webp",
  onProgress: (percent) => console.log(percent + "%"),
});

// Convert to a downloadable Blob
const blob = new Blob([result.data], { type: "image/webp" });`}
						/>

						<h3>Size Presets</h3>
						<table className="docs-table">
							<thead>
								<tr>
									<th>Preset</th>
									<th>Size</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>
										<code>large</code>
									</td>
									<td>512 x 512</td>
								</tr>
								<tr>
									<td>
										<code>medium</code>
									</td>
									<td>320 x 320</td>
								</tr>
								<tr>
									<td>
										<code>small</code>
									</td>
									<td>128 x 128</td>
								</tr>
							</tbody>
						</table>
					</section>
				)}

				{tab === "CLI" && (
					<section className="docs-section">
						<h2>CLI</h2>
						<p>
							Generate stickers from the command line. No code needed, just point it at an image.
						</p>

						<h3>Install</h3>
						<CodeBlock
							lang="bash"
							code={`npm install -g abe-yells-at
# or
pnpm add -g abe-yells-at
# or
bun add -g abe-yells-at`}
						/>
						<p>Or run directly without installing:</p>
						<CodeBlock
							lang="bash"
							code={`npx abe-yells-at logo.png
# or
pnpm dlx abe-yells-at logo.png
# or
bunx abe-yells-at logo.png`}
						/>

						<h3>Usage</h3>
						<CodeBlock code="abe-yells-at <image-path> [options]" lang="bash" />

						<h3>Options</h3>
						<table className="docs-table">
							<thead>
								<tr>
									<th>Flag</th>
									<th>Values</th>
									<th>Default</th>
									<th>Description</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>
										<code>--preset, -p</code>
									</td>
									<td>large, medium, small</td>
									<td>large</td>
									<td>Output size (512px, 320px, 128px)</td>
								</tr>
								<tr>
									<td>
										<code>--format, -f</code>
									</td>
									<td>gif, webp, png, all</td>
									<td>all</td>
									<td>
										Output format. <code>all</code> generates GIF + WebP + PNG
									</td>
								</tr>
								<tr>
									<td>
										<code>--output, -o</code>
									</td>
									<td>directory path</td>
									<td>same as input</td>
									<td>Where to save the output files</td>
								</tr>
								<tr>
									<td>
										<code>--help, -h</code>
									</td>
									<td />
									<td />
									<td>Show help message</td>
								</tr>
							</tbody>
						</table>

						<h3>Output</h3>
						<p>
							Files are named <code>abe-yells-at-&lt;name&gt;-&lt;preset&gt;.&lt;ext&gt;</code>. For
							example, running on <code>logo.png</code> with default settings produces:
						</p>
						<CodeBlock
							lang="bash"
							code={`abe-yells-at-logo-large.gif   # animated GIF
abe-yells-at-logo-large.webp  # animated WebP
abe-yells-at-logo-large.png   # static PNG (frame 1)`}
						/>

						<h3>Examples</h3>
						<CodeBlock
							lang="bash"
							code={`# Generate all formats at large size
abe-yells-at logo.png

# Small GIF only
abe-yells-at logo.png -p small -f gif

# Static PNG at medium size
abe-yells-at logo.png -f png -p medium

# Save to a specific directory
abe-yells-at logo.png -o ./stickers`}
						/>
					</section>
				)}

				{tab === "Credits" && (
					<section className="docs-section">
						<h2>Credits</h2>
						<ul className="docs-credits">
							<li>
								Created by{" "}
								<a href="https://riccardo.lol" target="_blank" rel="noopener noreferrer">
									riccardo.lol
								</a>
							</li>
							<li>
								Logo search powered by{" "}
								<a href="https://svgl.app" target="_blank" rel="noopener noreferrer">
									svgl
								</a>{" "}
								and{" "}
								<a href="https://logo.dev" target="_blank" rel="noopener noreferrer">
									logo.dev
								</a>
							</li>
							<li>
								GIF encoding by{" "}
								<a
									href="https://github.com/mattdesl/gifenc"
									target="_blank"
									rel="noopener noreferrer"
								>
									gifenc
								</a>
								, WebP encoding by{" "}
								<a
									href="https://github.com/jamsinclair/jSquash"
									target="_blank"
									rel="noopener noreferrer"
								>
									jSquash
								</a>
							</li>
							<li>
								Source on{" "}
								<a
									href="https://github.com/gek0z/abe-yells-at"
									target="_blank"
									rel="noopener noreferrer"
								>
									GitHub
								</a>{" "}
								/ available on{" "}
								<a
									href="https://www.npmjs.com/package/abe-yells-at"
									target="_blank"
									rel="noopener noreferrer"
								>
									npm
								</a>
							</li>
							<li>
								Shoutout to{" "}
								<a
									href="https://github.com/oncilla/old-man-yells-at"
									target="_blank"
									rel="noopener noreferrer"
								>
									old-man-yells-at
								</a>{" "}
								(static CLI) and{" "}
								<a href="https://slackmojis.com/" target="_blank" rel="noopener noreferrer">
									Slackmojis
								</a>{" "}
								(low-res Slack emoji)
							</li>
							<li>MIT License</li>
						</ul>
					</section>
				)}
			</div>
		</div>
	);
}
