import { useState } from "react";
import { SiteNav } from "@/SiteNav";

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
					pick from thousands of brand logos. Download as GIF or WebP.
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
							The easiest way to use Abe Yells At. No installation needed -- everything runs in your
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
								<strong>format</strong> (GIF or WebP).
							</li>
							<li>
								Click <strong>Generate & Download</strong> -- the sticker is created client-side and
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
						<pre>
							<code>npm install abe-yells-at</code>
						</pre>

						<h3>Node.js</h3>
						<pre>
							<code>
								{`import { createSticker } from "abe-yells-at";

const result = await createSticker({
  logo: "./my-logo.png",
  preset: "large",   // "large" | "medium" | "small"
  format: "gif",     // "gif" | "webp"
});

// result.data is a Uint8Array
fs.writeFileSync("sticker.gif", result.data);`}
							</code>
						</pre>

						<h3>Browser</h3>
						<pre>
							<code>
								{`import { createStickerFromImages, loadFrameImages } from "abe-yells-at";

const frames = await loadFrameImages("/frames");
const result = await createStickerFromImages({
  frames,
  logo: myImageElement,
  preset: "medium",
  format: "webp",
});`}
							</code>
						</pre>

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
						<pre>
							<code>npx abe-yells-at logo.png</code>
						</pre>
						<h3>Options</h3>
						<table className="docs-table">
							<thead>
								<tr>
									<th>Flag</th>
									<th>Values</th>
									<th>Default</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>
										<code>--preset, -p</code>
									</td>
									<td>large, medium, small</td>
									<td>large</td>
								</tr>
								<tr>
									<td>
										<code>--format, -f</code>
									</td>
									<td>gif, webp, all</td>
									<td>all</td>
								</tr>
								<tr>
									<td>
										<code>--output, -o</code>
									</td>
									<td>directory path</td>
									<td>same as input</td>
								</tr>
							</tbody>
						</table>
						<h3>Examples</h3>
						<pre>
							<code>
								{`# Generate all formats at large size
abe-yells-at logo.png

# Small GIF only
abe-yells-at logo.png -p small -f gif

# Custom output directory
abe-yells-at logo.png -o ./stickers`}
							</code>
						</pre>
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
							<li>MIT License</li>
						</ul>
					</section>
				)}
			</div>
		</div>
	);
}
