/// <reference types="vite/client" />

declare module "gifenc" {
	export function GIFEncoder(opts?: { auto?: boolean }): {
		writeFrame(
			index: Uint8Array,
			width: number,
			height: number,
			opts?: {
				palette?: number[][];
				delay?: number;
				repeat?: number;
				transparent?: boolean;
				transparentIndex?: number;
				dispose?: number;
				first?: boolean;
			},
		): void;
		finish(): void;
		bytes(): Uint8Array;
		bytesView(): Uint8Array;
	};

	export function quantize(
		data: Uint8Array | Uint8ClampedArray,
		maxColors: number,
		opts?: { format?: string },
	): number[][];

	export function applyPalette(
		data: Uint8Array | Uint8ClampedArray,
		palette: number[][],
		format?: string,
	): Uint8Array;
}
