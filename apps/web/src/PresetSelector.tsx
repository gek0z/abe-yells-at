import type { Preset } from "@/sticker-engine";

const PRESET_OPTIONS: { value: Preset; label: string }[] = [
	{ value: "large", label: "Large 512" },
	{ value: "medium", label: "Medium 320" },
	{ value: "small", label: "Small 128" },
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
