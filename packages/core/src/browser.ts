/**
 * Browser-safe entry point.
 *
 * Re-exports only the parts of the API that work without Node-only
 * dependencies (e.g. @napi-rs/canvas, node:path).
 */

export type { BrowserStickerOptions } from "@/create-sticker";
export { compositeFrame, createStickerFromImages, loadFrameImages } from "@/create-sticker";
export type { GifFrame } from "@/gif-encoder";
export { encodeGif } from "@/gif-encoder";
export type { PresetConfig } from "@/presets";
export { presets } from "@/presets";
export type { Format, OnProgress, Preset, StickerOptions, StickerResult } from "@/types";
export type { WebPFrame } from "@/webp-encoder";
export { encodeAnimatedWebP } from "@/webp-encoder";
