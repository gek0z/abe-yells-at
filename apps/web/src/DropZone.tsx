import { useCallback, useState } from "react";

export function DropZone({ onFile }: { onFile: (file: File) => void }) {
	const [dragOver, setDragOver] = useState(false);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			setDragOver(false);
			const file = e.dataTransfer.files[0];
			if (file?.type.startsWith("image/")) onFile(file);
		},
		[onFile],
	);

	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (file) onFile(file);
		},
		[onFile],
	);

	return (
		<label
			className={`dropzone${dragOver ? " drag-over" : ""}`}
			onDragOver={(e) => {
				e.preventDefault();
				setDragOver(true);
			}}
			onDragLeave={() => setDragOver(false)}
			onDrop={handleDrop}
		>
			<span className="dropzone-icon" aria-hidden="true">
				{dragOver ? "\u{1F3AF}" : "\u{1F4E4}"}
			</span>
			<p className="dropzone-label">
				Drop your logo here or <strong>click to upload</strong>
			</p>
			<p className="dropzone-hint">PNG, JPG, SVG, or WebP</p>
			<input
				type="file"
				accept="image/png,image/jpeg,image/svg+xml,image/webp"
				onChange={handleChange}
				aria-label="Upload logo"
			/>
		</label>
	);
}
