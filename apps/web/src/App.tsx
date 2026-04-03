import { useCallback, useEffect, useState } from "react";
import { DropZone } from "@/DropZone";
import { FormatSelector } from "@/FormatSelector";
import { LogoPicker } from "@/LogoPicker";
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
	const [preset, setPreset] = useState<Preset>("whatsapp");
	const [format, setFormat] = useState<Format>("gif");

	const [generating, setGenerating] = useState(false);
	const [progress, setProgress] = useState(0);
	const [resultBlob, setResultBlob] = useState<Blob | null>(null);

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

	return (
		<div className="app">
			<div className="container">
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

				{!logoImg ? (
					<div className="input-section">
						<DropZone onFile={handleFile} />
						<div className="input-divider">
							<span>or pick a brand logo</span>
						</div>
						<LogoPicker onSelect={handlePickedLogo} />
					</div>
				) : (
					<div className="editor">
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
				)}
			</div>

			<footer className="footer">Abe Yells At -- Sticker Creator</footer>
		</div>
	);
}
