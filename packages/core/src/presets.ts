import type { Preset } from "@/types";

export interface PresetConfig {
	/** Canvas width in pixels */
	width: number;
	/** Canvas height in pixels */
	height: number;
	/** Logo placement config */
	logo: {
		/** X offset from left edge (pixels) */
		x: number;
		/** Y offset from top edge (pixels) */
		y: number;
		/** Maximum logo width (pixels) */
		maxWidth: number;
		/** Maximum logo height (pixels) */
		maxHeight: number;
	};
}

function createPresetConfig(size: number): PresetConfig {
	const padding = Math.round(size * 0.05);
	const logoSize = Math.round(size * 0.32);
	return {
		width: size,
		height: size,
		logo: {
			x: padding,
			y: padding,
			maxWidth: logoSize,
			maxHeight: logoSize,
		},
	};
}

export const presets: Record<Preset, PresetConfig> = {
	whatsapp: createPresetConfig(512),
	slack: createPresetConfig(128),
	discord: createPresetConfig(320),
};
