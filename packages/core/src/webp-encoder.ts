/**
 * Animated WebP encoder.
 *
 * Builds an animated WebP RIFF container from pre-encoded individual WebP
 * frame bitstreams.  The container structure follows the WebP extended file
 * format spec:
 *
 *   RIFF <size> WEBP
 *     VP8X   (extended features: animation flag)
 *     ANIM   (animation parameters: bg color, loop count)
 *     ANMF   (per-frame: position, size, duration, dispose/blend, bitstream)
 *     ...
 */

// ── helpers ──────────────────────────────────────────────────────────

function writeUint32LE(buf: Uint8Array, offset: number, value: number): void {
	buf[offset] = value & 0xff;
	buf[offset + 1] = (value >> 8) & 0xff;
	buf[offset + 2] = (value >> 16) & 0xff;
	buf[offset + 3] = (value >> 24) & 0xff;
}

function writeUint24LE(buf: Uint8Array, offset: number, value: number): void {
	buf[offset] = value & 0xff;
	buf[offset + 1] = (value >> 8) & 0xff;
	buf[offset + 2] = (value >> 16) & 0xff;
}

function writeUint16LE(buf: Uint8Array, offset: number, value: number): void {
	buf[offset] = value & 0xff;
	buf[offset + 1] = (value >> 8) & 0xff;
}

function asciiBytes(s: string): Uint8Array {
	const a = new Uint8Array(s.length);
	for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i);
	return a;
}

/**
 * Strip the outer RIFF/WEBP wrapper from a single-image WebP so we get just
 * the inner chunk (VP8 or VP8L).  We need the raw bitstream for ANMF payloads.
 */
function stripRiffWrapper(webp: Uint8Array): Uint8Array {
	// A valid single-image WebP starts with: RIFF <4 bytes> WEBP <chunk>
	const riff = String.fromCharCode(webp[0], webp[1], webp[2], webp[3]);
	const magic = String.fromCharCode(webp[8], webp[9], webp[10], webp[11]);
	if (riff === "RIFF" && magic === "WEBP") {
		// return everything after the 12-byte RIFF+WEBP header
		return webp.subarray(12);
	}
	// already a raw chunk
	return webp;
}

// ── public API ───────────────────────────────────────────────────────

export interface WebPFrame {
	/** Pre-encoded single-image WebP data (with or without RIFF wrapper). */
	data: Uint8Array;
	width: number;
	height: number;
}

/**
 * Mux pre-encoded individual WebP frames into an animated WebP file.
 *
 * @param frames  Array of pre-encoded WebP frame objects.
 * @param delay   Duration of each frame in milliseconds (default 100).
 * @returns       Uint8Array containing the complete animated WebP.
 */
export function encodeAnimatedWebP(frames: WebPFrame[], delay = 100): Uint8Array {
	if (frames.length === 0) throw new Error("At least one frame is required");

	const canvasWidth = frames[0].width;
	const canvasHeight = frames[0].height;

	// Strip RIFF wrappers from all frames up-front
	const rawFrames = frames.map((f) => stripRiffWrapper(f.data));

	// ── Calculate total size ──────────────────────────────────────────

	// VP8X chunk: 8 (fourcc + size) + 10 (payload)
	const vp8xSize = 18;
	// ANIM chunk: 8 + 6
	const animSize = 14;

	// ANMF chunks
	let anmfTotalSize = 0;
	for (const raw of rawFrames) {
		// ANMF header: 8 (fourcc + size) + 16 (fields) + raw.length
		// If raw.length is odd, a padding byte is added
		const paddedLen = raw.length + (raw.length % 2);
		anmfTotalSize += 8 + 16 + paddedLen;
	}

	const buf = new Uint8Array(12 + vp8xSize + animSize + anmfTotalSize);
	let offset = 0;

	// ── RIFF header ───────────────────────────────────────────────────
	buf.set(asciiBytes("RIFF"), offset);
	offset += 4;
	writeUint32LE(buf, offset, buf.length - 8); // file size minus 8
	offset += 4;
	buf.set(asciiBytes("WEBP"), offset);
	offset += 4;

	// ── VP8X chunk ────────────────────────────────────────────────────
	buf.set(asciiBytes("VP8X"), offset);
	offset += 4;
	writeUint32LE(buf, offset, 10); // chunk data size
	offset += 4;

	// Flags byte: bit 1 = animation
	const flags = 0x02; // animation flag
	writeUint32LE(buf, offset, flags);
	offset += 4;

	// Canvas width - 1 (24-bit LE)
	writeUint24LE(buf, offset, canvasWidth - 1);
	offset += 3;
	// Canvas height - 1 (24-bit LE)
	writeUint24LE(buf, offset, canvasHeight - 1);
	offset += 3;

	// ── ANIM chunk ────────────────────────────────────────────────────
	buf.set(asciiBytes("ANIM"), offset);
	offset += 4;
	writeUint32LE(buf, offset, 6); // chunk data size
	offset += 4;
	// Background color (BGRA) – fully transparent
	writeUint32LE(buf, offset, 0x00000000);
	offset += 4;
	// Loop count: 0 = infinite
	writeUint16LE(buf, offset, 0);
	offset += 2;

	// ── ANMF chunks ───────────────────────────────────────────────────
	for (const raw of rawFrames) {
		const paddedLen = raw.length + (raw.length % 2);
		const anmfPayloadSize = 16 + paddedLen;

		buf.set(asciiBytes("ANMF"), offset);
		offset += 4;
		writeUint32LE(buf, offset, anmfPayloadSize);
		offset += 4;

		// Frame X / 2 (24-bit LE) – always 0
		writeUint24LE(buf, offset, 0);
		offset += 3;
		// Frame Y / 2 (24-bit LE) – always 0
		writeUint24LE(buf, offset, 0);
		offset += 3;
		// Frame width - 1 (24-bit LE)
		writeUint24LE(buf, offset, canvasWidth - 1);
		offset += 3;
		// Frame height - 1 (24-bit LE)
		writeUint24LE(buf, offset, canvasHeight - 1);
		offset += 3;
		// Frame duration in ms (24-bit LE)
		writeUint24LE(buf, offset, delay);
		offset += 3;
		// Flags: bit 0 = dispose (1 = dispose to bg), bit 1 = blend (0 = no blend)
		buf[offset] = 0x01; // dispose=1, blend=0
		offset += 1;

		// Frame bitstream data
		buf.set(raw, offset);
		offset += raw.length;
		// Padding byte if odd
		if (raw.length % 2 !== 0) {
			buf[offset] = 0;
			offset += 1;
		}
	}

	return buf;
}
