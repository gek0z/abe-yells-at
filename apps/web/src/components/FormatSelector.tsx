import type { Format } from "@/lib/sticker-engine";

const FORMAT_OPTIONS: { value: Format; label: string }[] = [
	{ value: "gif", label: "GIF" },
	{ value: "webp", label: "WebP" },
	{ value: "png", label: "PNG" },
];

export function FormatSelector({
	value,
	onChange,
}: {
	value: Format;
	onChange: (f: Format) => void;
}) {
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
