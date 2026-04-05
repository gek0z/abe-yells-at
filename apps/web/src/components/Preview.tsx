import { useEffect, useRef } from "react";
import { loadFrames, PRESET_SIZES, type Preset, renderPreviewFrame } from "@/lib/sticker-engine";

/** Always render at the largest size so the preview is never pixelated. */
const RENDER_SIZE = PRESET_SIZES.large;

export function Preview({ logo, preset }: { logo: HTMLImageElement; preset: Preset }) {
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

			const tick = () => {
				const canvas = canvasRef.current;
				if (!canvas || !framesRef.current) return;
				const idx = frameIdxRef.current % framesRef.current.length;
				renderPreviewFrame(canvas, framesRef.current[idx], logo, RENDER_SIZE);
				frameIdxRef.current = idx + 1;
			};

			tick();
			timerRef.current = setInterval(tick, 50);
		}

		start();

		return () => {
			cancelled = true;
			if (timerRef.current) clearInterval(timerRef.current);
		};
	}, [logo]);

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
