import type { Preset } from "@/lib/sticker-engine";

const PRESET_OPTIONS: { value: Preset; label: string }[] = [
	{ value: "large", label: "Large" },
	{ value: "medium", label: "Medium" },
	{ value: "small", label: "Small" },
];

export function PresetSelector({
	value,
	onChange,
}: {
	value: Preset;
	onChange: (p: Preset) => void;
}) {
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
