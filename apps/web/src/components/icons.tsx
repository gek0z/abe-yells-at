export function GitHubIcon() {
	return (
		<svg aria-label="GitHub" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
			<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
		</svg>
	);
}

export function NpmIcon() {
	return (
		<svg aria-label="npm" viewBox="0 0 2500 2500" fill="currentColor" width="20" height="20">
			<mask id="npm-n">
				<rect width="2500" height="2500" fill="white" />
				<path fill="black" d="M1241.5 268.5h-973v1962.9h972.9V763.5h495v1467.9h495V268.5z" />
			</mask>
			<rect width="2500" height="2500" mask="url(#npm-n)" />
		</svg>
	);
}

export function UploadIcon() {
	return (
		<svg
			aria-label="Upload"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			width="18"
			height="18"
		>
			<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
			<polyline points="17 8 12 3 7 8" />
			<line x1="12" y1="3" x2="12" y2="15" />
		</svg>
	);
}

export function SmileyIcon() {
	return (
		<svg
			className="no-invert"
			aria-label="Smiley face"
			width="20"
			height="20"
			viewBox="0 0 20 20"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			style={{ verticalAlign: "middle", margin: "0 0.15rem" }}
		>
			<circle cx="10" cy="10" r="8.5" />
			<circle cx="7" cy="8.5" r="1" fill="currentColor" stroke="none" />
			<circle cx="13" cy="8.5" r="1" fill="currentColor" stroke="none" />
			<path d="M6.5 12.5c.8 1.5 2 2 3.5 2s2.7-.5 3.5-2" strokeLinecap="round" />
		</svg>
	);
}
