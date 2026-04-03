import { useCallback, useEffect, useRef, useState } from "react";
import {
	type Format,
	generateSticker,
	loadFrames,
	PRESET_SIZES,
	type Preset,
	renderPreviewFrame,
} from "./sticker-engine";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PRESET_OPTIONS: { value: Preset; label: string }[] = [
	{ value: "whatsapp", label: "WhatsApp 512" },
	{ value: "slack", label: "Slack 128" },
	{ value: "discord", label: "Discord 320" },
];

const FORMAT_OPTIONS: { value: Format; label: string }[] = [
	{ value: "gif", label: "GIF" },
	{ value: "webp", label: "WebP" },
];

function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// ---------------------------------------------------------------------------
// DropZone
// ---------------------------------------------------------------------------

function DropZone({ onFile }: { onFile: (file: File) => void }) {
	const [dragOver, setDragOver] = useState(false);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			setDragOver(false);
			const file = e.dataTransfer.files[0];
			if (file?.type.startsWith("image/")) onFile(file);
		},
		[onFile],
	);

	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (file) onFile(file);
		},
		[onFile],
	);

	return (
		<label
			className={`dropzone${dragOver ? " drag-over" : ""}`}
			onDragOver={(e) => {
				e.preventDefault();
				setDragOver(true);
			}}
			onDragLeave={() => setDragOver(false)}
			onDrop={handleDrop}
		>
			<span className="dropzone-icon" aria-hidden="true">
				{dragOver ? "\u{1F3AF}" : "\u{1F4E4}"}
			</span>
			<p className="dropzone-label">
				Drop your logo here or <strong>click to upload</strong>
			</p>
			<p className="dropzone-hint">PNG, JPG, SVG, or WebP</p>
			<input
				type="file"
				accept="image/png,image/jpeg,image/svg+xml,image/webp"
				onChange={handleChange}
				aria-label="Upload logo"
			/>
		</label>
	);
}

// ---------------------------------------------------------------------------
// Preview (animated canvas)
// ---------------------------------------------------------------------------

function Preview({ logo, preset }: { logo: HTMLImageElement; preset: Preset }) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const framesRef = useRef<HTMLImageElement[] | null>(null);
	const frameIdxRef = useRef(0);
	const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

	useEffect(() => {
		let cancelled = false;

		async function start() {
			const frames = await loadFrames();
			if (cancelled) return;
			framesRef.current = frames;
			frameIdxRef.current = 0;

			// Start animation loop
			const tick = () => {
				const canvas = canvasRef.current;
				if (!canvas || !framesRef.current) return;
				const idx = frameIdxRef.current % framesRef.current.length;
				renderPreviewFrame(canvas, framesRef.current[idx], logo, PRESET_SIZES[preset]);
				frameIdxRef.current = idx + 1;
			};

			tick(); // draw first frame immediately
			timerRef.current = setInterval(tick, 120);
		}

		start();

		return () => {
			cancelled = true;
			if (timerRef.current) clearInterval(timerRef.current);
		};
	}, [logo, preset]);

	return (
		<div className="preview-card">
			<span className="preview-label">Live Preview</span>
			<canvas ref={canvasRef} />
			<span className="preview-label">
				{PRESET_SIZES[preset]} x {PRESET_SIZES[preset]}
			</span>
		</div>
	);
}

// ---------------------------------------------------------------------------
// PresetSelector
// ---------------------------------------------------------------------------

function PresetSelector({ value, onChange }: { value: Preset; onChange: (p: Preset) => void }) {
	return (
		<div className="control-group">
			<span>Size Preset</span>
			<div className="pills">
				{PRESET_OPTIONS.map((opt) => (
					<button
						key={opt.value}
						className={`pill${value === opt.value ? " active" : ""}`}
						onClick={() => onChange(opt.value)}
						type="button"
					>
						{opt.label}
					</button>
				))}
			</div>
		</div>
	);
}

// ---------------------------------------------------------------------------
// FormatSelector
// ---------------------------------------------------------------------------

function FormatSelector({ value, onChange }: { value: Format; onChange: (f: Format) => void }) {
	return (
		<div className="control-group">
			<span>Format</span>
			<div className="segmented">
				{FORMAT_OPTIONS.map((opt) => (
					<button
						key={opt.value}
						className={value === opt.value ? "active" : ""}
						onClick={() => onChange(opt.value)}
						type="button"
					>
						{opt.label}
					</button>
				))}
			</div>
		</div>
	);
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

export default function App() {
	// State
	const [logoFile, setLogoFile] = useState<File | null>(null);
	const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null);
	const [logoName, setLogoName] = useState("");
	const [preset, setPreset] = useState<Preset>("whatsapp");
	const [format, setFormat] = useState<Format>("gif");

	const [generating, setGenerating] = useState(false);
	const [progress, setProgress] = useState(0);
	const [resultBlob, setResultBlob] = useState<Blob | null>(null);

	// When a file is selected, load it as an HTMLImageElement
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

	// Reset to clear state, revoke blob URLs
	const handleReset = useCallback(() => {
		setLogoFile(null);
		setLogoImg(null);
		setLogoName("");
		setResultBlob(null);
		setProgress(0);
		setGenerating(false);
	}, []);

	// Clear previous result when preset/format change
	// biome-ignore lint/correctness/useExhaustiveDependencies: intentional reset on preset/format change
	useEffect(() => {
		setResultBlob(null);
	}, [preset, format]);

	// Generate + download
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

			// Trigger download
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

	// -------------------------------------------------------------------------
	// Render
	// -------------------------------------------------------------------------

	return (
		<div className="app">
			<div className="container">
				{/* Hero */}
				<header className="hero">
					<img className="hero-gif" src="/abe.gif" alt="Grandpa Abe Simpson yelling" />
					<h1>
						ABE YELLS AT{" "}
						{logoName ? (
							<span className="logo-name">{logoName.toUpperCase()}</span>
						) : (
							<span className="logo-name">___</span>
						)}
					</h1>
					<p>
						Upload your logo and get an animated sticker of Grandpa Abe yelling at it. Download as
						GIF or WebP for WhatsApp, Slack, or Discord.
					</p>
				</header>

				{/* Upload or Editor */}
				{!logoImg ? (
					<DropZone onFile={handleFile} />
				) : (
					<div className="editor">
						{/* Left: preview */}
						<Preview logo={logoImg} preset={preset} />

						{/* Right: controls */}
						<div className="controls">
							{/* Logo info */}
							{logoFile && (
								<div className="logo-info">
									<img className="logo-thumb" src={logoImg.src} alt="Uploaded logo" />
									<div className="logo-info-text">
										<span className="logo-name-text">{logoFile.name}</span>
										<span className="logo-size-text">{formatBytes(logoFile.size)}</span>
									</div>
								</div>
							)}

							<PresetSelector value={preset} onChange={setPreset} />
							<FormatSelector value={format} onChange={setFormat} />

							{/* Download */}
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

							{/* Reset */}
							<button className="reset-btn" onClick={handleReset} type="button">
								Start Over with New Logo
							</button>
						</div>
					</div>
				)}
			</div>

			<footer className="footer">Abe Yells At -- Sticker Creator</footer>
		</div>
	);
}
