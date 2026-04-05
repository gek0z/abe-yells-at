import { useCallback, useEffect, useRef, useState } from "react";
import { DocsPage } from "@/DocsPage";
import { FormatSelector } from "@/FormatSelector";
import { LogoDrawer } from "@/LogoDrawer";
import { LogoShowcase } from "@/LogoMarquee";
import { PlatformInstructions } from "@/PlatformInstructions";
import { PresetSelector } from "@/PresetSelector";
import { Preview } from "@/Preview";
import { SiteNav } from "@/SiteNav";
import { type Format, generateSticker, PRESET_SIZES, type Preset } from "@/sticker-engine";

function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function StickerApp() {
	const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null);
	const [logoName, setLogoName] = useState("");
	const [preset, setPreset] = useState<Preset>("large");
	const [format, setFormat] = useState<Format>("webp");

	const [generating, setGenerating] = useState(false);
	const [progress, setProgress] = useState(0);
	const [resultBlob, setResultBlob] = useState<Blob | null>(null);

	const [drawerOpen, setDrawerOpen] = useState(false);
	const [dragOver, setDragOver] = useState(false);
	const [showcaseName, setShowcaseName] = useState("");

	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const handleFile = useCallback((file: File) => {
		const url = URL.createObjectURL(file);
		const img = new Image();
		img.onload = () => {
			setLogoImg(img);
			setLogoName(file.name.replace(/\.[^.]+$/, ""));
			setResultBlob(null);
		};
		img.src = url;
	}, []);

	const handlePickedLogo = useCallback((name: string, img: HTMLImageElement) => {
		setLogoImg(img);
		setLogoName(name);
		setResultBlob(null);
	}, []);

	const handleReset = useCallback(() => {
		setLogoImg(null);
		setLogoName("");
		setResultBlob(null);
		setProgress(0);
		setGenerating(false);
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: intentional reset on preset/format change
	useEffect(() => {
		setResultBlob(null);
	}, [preset, format]);

	const handleDownload = useCallback(async () => {
		if (!logoImg) return;
		setGenerating(true);
		setProgress(0);
		setResultBlob(null);

		try {
			const blob = await generateSticker({
				logo: logoImg,
				preset,
				format,
				onProgress: setProgress,
			});
			setResultBlob(blob);

			const ext = format === "gif" ? "gif" : "webp";
			const filename = `abe-yells-at-${PRESET_SIZES[preset]}.${ext}`;

			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(url);
		} catch (err) {
			console.error("Sticker generation failed:", err);
		} finally {
			setGenerating(false);
		}
	}, [logoImg, preset, format]);

	// Drag handlers for full-page drop zone
	const handleDragOver = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			if (!dragOver) setDragOver(true);
		},
		[dragOver],
	);

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		// Only set false if leaving the landing container
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		const { clientX, clientY } = e;
		if (
			clientX <= rect.left ||
			clientX >= rect.right ||
			clientY <= rect.top ||
			clientY >= rect.bottom
		) {
			setDragOver(false);
		}
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			setDragOver(false);
			const file = e.dataTransfer.files[0];
			if (file?.type.startsWith("image/")) handleFile(file);
		},
		[handleFile],
	);

	const handleFileInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (file) handleFile(file);
		},
		[handleFile],
	);

	// Landing view
	if (!logoImg) {
		return (
			<>
				{/* biome-ignore lint/a11y/noStaticElementInteractions: landing page is a drop target */}
				<div
					className="landing"
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
				>
					<SiteNav />

					{/* Clouds */}
					<div className="cloud cloud-1" />
					<div className="cloud cloud-2" />
					<div className="cloud cloud-3" />
					<div className="cloud cloud-4" />

					<h1 className="landing-title unselectable">
						ABE YELLS AT
						<br />
						<span className="title-brand" key={showcaseName}>
							{showcaseName ? showcaseName.toUpperCase() : "___"}
						</span>
					</h1>
					<div className="landing-actions unselectable">
						<button
							className="upload-btn"
							onClick={() => fileInputRef.current?.click()}
							type="button"
						>
							<svg
								aria-label="Upload"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								width="18"
								height="18"
							>
								<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
								<polyline points="17 8 12 3 7 8" />
								<line x1="12" y1="3" x2="12" y2="15" />
							</svg>
							Upload Your Own Logo
						</button>
						<button className="search-btn" onClick={() => setDrawerOpen(true)} type="button">
							Search Brand Logos
						</button>
						<input
							ref={fileInputRef}
							className="hidden-input"
							type="file"
							accept="image/png,image/jpeg,image/svg+xml,image/webp"
							onChange={handleFileInputChange}
							aria-label="Upload logo"
						/>
					</div>

					<div className="abe-frame unselectable">
						<LogoShowcase onLogoChange={setShowcaseName} />
						<img className="abe-landing" src="/abe.gif" alt="Grandpa Abe Simpson yelling" />
					</div>

					{/* Drag overlay */}
					{dragOver && (
						<div className="drag-overlay">
							<div className="drag-overlay-inner">
								<h2>Drop your logo!</h2>
								<p>PNG, JPG, SVG, or WebP</p>
							</div>
						</div>
					)}
				</div>

				<LogoDrawer
					open={drawerOpen}
					onClose={() => setDrawerOpen(false)}
					onSelect={handlePickedLogo}
				/>
			</>
		);
	}

	// Result view
	return (
		<>
			<div
				className="result-page"
				style={
					{
						"--preview-size": `min(${PRESET_SIZES[preset]}px, 90vw)`,
					} as React.CSSProperties
				}
			>
				<div
					className="result-preview-top"
					style={
						{
							"--preview-size": `min(${PRESET_SIZES[preset]}px, 90vw)`,
						} as React.CSSProperties
					}
				>
					<Preview logo={logoImg} preset={preset} />
				</div>
				<SiteNav />
				<div className="result-preview-border" />

				<div className="result-container">
					<h1 className="result-title unselectable">
						ABE YELLS AT
						<br />
						{logoName.toUpperCase()}
					</h1>

					<div className="result-controls unselectable">
						<div className="result-controls-row">
							<PresetSelector value={preset} onChange={setPreset} />
							<FormatSelector value={format} onChange={setFormat} />
						</div>

						<button
							className="download-btn"
							onClick={handleDownload}
							disabled={generating}
							type="button"
						>
							{generating
								? `Generating... ${progress}%`
								: resultBlob
									? `Download Again (${formatBytes(resultBlob.size)})`
									: "Generate & Download"}
						</button>

						{generating && (
							<div className="progress-wrap">
								<div className="progress-bar" style={{ width: `${progress}%` }} />
							</div>
						)}
					</div>

					<PlatformInstructions format={format} />

					<button className="reset-btn" onClick={handleReset} type="button">
						Start Over with New Logo
					</button>
				</div>
			</div>

			<LogoDrawer
				open={drawerOpen}
				onClose={() => setDrawerOpen(false)}
				onSelect={handlePickedLogo}
			/>
		</>
	);
}

export default function App() {
	if (window.location.pathname === "/docs") {
		return <DocsPage />;
	}
	return <StickerApp />;
}
