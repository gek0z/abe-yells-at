import { useCallback, useEffect, useRef, useState } from "react";
import { FormatSelector } from "@/FormatSelector";
import { LogoDrawer } from "@/LogoDrawer";
import { LogoShowcase } from "@/LogoMarquee";
import { PlatformInstructions } from "@/PlatformInstructions";
import { PresetSelector } from "@/PresetSelector";
import { Preview } from "@/Preview";
import { type Format, generateSticker, PRESET_SIZES, type Preset } from "@/sticker-engine";

function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function App() {
	const [logoFile, setLogoFile] = useState<File | null>(null);
	const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null);
	const [logoName, setLogoName] = useState("");
	const [preset, setPreset] = useState<Preset>("large");
	const [format, setFormat] = useState<Format>("gif");

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
			setLogoFile(file);
			setLogoName(file.name.replace(/\.[^.]+$/, ""));
			setResultBlob(null);
		};
		img.src = url;
	}, []);

	const handlePickedLogo = useCallback((name: string, img: HTMLImageElement) => {
		setLogoImg(img);
		setLogoFile(null);
		setLogoName(name);
		setResultBlob(null);
	}, []);

	const handleReset = useCallback(() => {
		setLogoFile(null);
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

			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `abe-yells-at-sticker-${PRESET_SIZES[preset]}x${PRESET_SIZES[preset]}.${format}`;
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
					<nav className="site-nav unselectable">
						<div className="footer-links">
							<a
								href="https://github.com/user/abe-yells-at"
								target="_blank"
								rel="noopener noreferrer"
							>
								<svg
									aria-label="GitHub"
									viewBox="0 0 24 24"
									fill="currentColor"
									width="20"
									height="20"
								>
									<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
								</svg>
							</a>
							<a
								href="https://www.npmjs.com/package/abe-yells-at"
								target="_blank"
								rel="noopener noreferrer"
							>
								<svg
									aria-label="npm"
									viewBox="0 0 24 24"
									fill="currentColor"
									width="20"
									height="20"
								>
									<path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0Zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331Zm4 0v1.336H8.001V8.667h5.334v5.331h-2.669Zm12.001 0h-2.668v-4H18.67v4h-2.669V8.667h6.666v5.331ZM10.662 10H12v2.667h-1.338V10Z" />
								</svg>
							</a>
						</div>
						<div className="footer-info">
							created by{" "}
							<a href="https://riccardo.lol" target="_blank" rel="noopener noreferrer">
								riccardo.lol
							</a>
						</div>
						<a className="footer-privacy" href="/privacy">
							Privacy Policy
						</a>
					</nav>

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
						<button className="search-btn" onClick={() => setDrawerOpen(true)} type="button">
							Search Brand Logos
						</button>
						<button
							className="upload-link"
							onClick={() => fileInputRef.current?.click()}
							type="button"
						>
							or upload a file
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
			<div className="result-page">
				<div className="result-header">
					<h1 className="result-title unselectable">ABE YELLS AT {logoName.toUpperCase()}</h1>
				</div>

				<div className="result-grid">
					<Preview logo={logoImg} preset={preset} />

					<div className="controls">
						<div className="logo-info">
							<img className="logo-thumb" src={logoImg.src} alt="Selected logo" />
							<div className="logo-info-text">
								<span className="logo-name-text">{logoFile ? logoFile.name : logoName}</span>
								<span className="logo-size-text">
									{logoFile ? formatBytes(logoFile.size) : "from svgl.app"}
								</span>
							</div>
						</div>

						<PresetSelector value={preset} onChange={setPreset} />
						<FormatSelector value={format} onChange={setFormat} />

						<div className="control-group">
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

							{resultBlob && !generating && (
								<p className="file-size">File size: {formatBytes(resultBlob.size)}</p>
							)}
						</div>

						<button className="reset-btn" onClick={handleReset} type="button">
							Start Over with New Logo
						</button>
					</div>
				</div>

				<PlatformInstructions format={format} />

				<footer className="site-footer on-result">
					<div className="footer-links">
						<a
							href="https://github.com/user/abe-yells-at"
							target="_blank"
							rel="noopener noreferrer"
						>
							<svg
								aria-label="GitHub"
								viewBox="0 0 24 24"
								fill="currentColor"
								width="20"
								height="20"
							>
								<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
							</svg>
						</a>
						<a
							href="https://www.npmjs.com/package/abe-yells-at"
							target="_blank"
							rel="noopener noreferrer"
						>
							<svg aria-label="npm" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
								<path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0Zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331Zm4 0v1.336H8.001V8.667h5.334v5.331h-2.669Zm12.001 0h-2.668v-4H18.67v4h-2.669V8.667h6.666v5.331ZM10.662 10H12v2.667h-1.338V10Z" />
							</svg>
						</a>
					</div>
					<div className="footer-info">
						created by{" "}
						<a href="https://riccardo.lol" target="_blank" rel="noopener noreferrer">
							riccardo.lol
						</a>
					</div>
					<a className="footer-privacy" href="/privacy">
						Privacy Policy
					</a>
				</footer>
			</div>

			<LogoDrawer
				open={drawerOpen}
				onClose={() => setDrawerOpen(false)}
				onSelect={handlePickedLogo}
			/>
		</>
	);
}
