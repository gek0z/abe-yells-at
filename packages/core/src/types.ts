export type Preset = "large" | "medium" | "small";
export type Format = "gif" | "webp";

export type OnProgress = (percent: number) => void;

export interface StickerOptions {
	/** Logo image: file path (Node), URL string, or raw image data */
	logo: string | Buffer | Blob | ArrayBuffer | Uint8Array;
	/** Target size preset (default: 'large') */
	preset?: Preset;
	/** Output format (default: 'gif') */
	format?: Format;
	/** Progress callback (0-100) */
	onProgress?: OnProgress;
}

export interface StickerResult {
	/** Encoded sticker binary data */
	data: Uint8Array;
	/** Output format */
	format: Format;
	/** Sticker width in pixels */
	width: number;
	/** Sticker height in pixels */
	height: number;
	/** Preset used */
	preset: Preset;
}
