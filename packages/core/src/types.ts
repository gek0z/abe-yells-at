export type Preset = "whatsapp" | "slack" | "discord";
export type Format = "gif" | "webp";

export interface StickerOptions {
	/** Logo image: file path (Node), URL string, or raw image data */
	logo: string | Buffer | Blob | ArrayBuffer | Uint8Array;
	/** Target platform preset (default: 'whatsapp') */
	preset?: Preset;
	/** Output format (default: 'gif') */
	format?: Format;
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
