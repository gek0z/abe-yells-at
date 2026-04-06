import { useCallback, useEffect, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

import { AnalyticsEvent, trackEvent } from "@/lib/analytics";

interface SvglLogo {
	id: number;
	title: string;
	category: string | string[];
	route: string | { light: string; dark: string };
}

interface LogoResult {
	id: string;
	title: string;
	imgUrl: string;
	source: "svgl" | "logodev";
}

function getLogoUrl(logo: { route: string | { light: string; dark: string } }): string {
	if (typeof logo.route === "string") return logo.route;
	return logo.route.light;
}

const SVGL_PREFIX = "https://svgl.app/library/";
const RAW_GH_PREFIX = "https://raw.githubusercontent.com/pheralb/svgl/main/static/library/";

function getCorsUrl(url: string): string {
	if (url.startsWith(SVGL_PREFIX)) {
		return url.replace(SVGL_PREFIX, RAW_GH_PREFIX);
	}
	return url;
}

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

const LOGO_DEV_TOKEN = import.meta.env.VITE_LOGO_DEV_TOKEN as string;

function logoDevUrl(name: string): string {
	return `https://img.logo.dev/name/${encodeURIComponent(name)}?token=${LOGO_DEV_TOKEN}&size=128&format=png&fallback=404`;
}

async function searchSvgl(query: string): Promise<LogoResult[]> {
	if (!query) return [];
	const res = await fetch(`https://api.svgl.app?search=${encodeURIComponent(query)}`);
	if (!res.ok) return [];
	const data: SvglLogo[] = await res.json();
	return data.map((logo) => ({
		id: `svgl-${logo.id}`,
		title: logo.title,
		imgUrl: getLogoUrl(logo),
		source: "svgl" as const,
	}));
}

async function searchLogoDev(query: string): Promise<LogoResult | null> {
	if (!query || !LOGO_DEV_TOKEN) return null;
	const url = logoDevUrl(query);
	try {
		const res = await fetch(url);
		if (!res.ok) return null;
		// Verify it's actually an image, not an error
		const contentType = res.headers.get("content-type") || "";
		if (!contentType.includes("image")) return null;
		const blob = await res.blob();
		const blobUrl = URL.createObjectURL(blob);
		return {
			id: `logodev-${query}`,
			title: query,
			imgUrl: blobUrl,
			source: "logodev",
		};
	} catch {
		return null;
	}
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LogoDrawer({
	open,
	onClose,
	onSelect,
}: {
	open: boolean;
	onClose: () => void;
	onSelect: (name: string, img: HTMLImageElement, source: "svgl" | "logodev") => void;
}) {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<LogoResult[]>([]);
	const [loading, setLoading] = useState(false);
	const [searched, setSearched] = useState(false);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const searchRef = useRef<HTMLInputElement | null>(null);
	const drawerRef = useRef<HTMLDivElement | null>(null);

	// Debounced search, queries both sources
	useEffect(() => {
		if (!query.trim()) {
			setResults([]);
			setSearched(false);
			return;
		}

		if (debounceRef.current) clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(async () => {
			setLoading(true);
			setSearched(true);
			trackEvent(AnalyticsEvent.LOGO_SEARCH, { query: query.trim() });
			try {
				const [svglResults, logoDevResult] = await Promise.allSettled([
					searchSvgl(query),
					searchLogoDev(query),
				]);

				const combined: LogoResult[] = [];
				if (logoDevResult.status === "fulfilled" && logoDevResult.value) {
					combined.push(logoDevResult.value);
				}
				if (svglResults.status === "fulfilled") {
					for (const r of svglResults.value) {
						combined.push(r);
					}
				}
				setResults(combined);
			} finally {
				setLoading(false);
			}
		}, 300);

		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
		};
	}, [query]);

	// Focus + keyboard handling
	useEffect(() => {
		if (!open) return;

		const t = setTimeout(() => searchRef.current?.focus(), 350);

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
				return;
			}
			if (e.key === "Tab" && drawerRef.current) {
				const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
					'button, input, a[href], [tabindex]:not([tabindex="-1"])',
				);
				if (focusable.length === 0) return;
				const first = focusable[0];
				const last = focusable[focusable.length - 1];
				if (e.shiftKey && document.activeElement === first) {
					e.preventDefault();
					last.focus();
				} else if (!e.shiftKey && document.activeElement === last) {
					e.preventDefault();
					first.focus();
				}
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => {
			clearTimeout(t);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [open, onClose]);

	const handleSelect = useCallback(
		async (result: LogoResult) => {
			try {
				let blobUrl: string;

				if (result.source === "svgl") {
					const corsUrl = getCorsUrl(result.imgUrl);
					const res = await fetch(corsUrl);
					const svgText = await res.text();
					const blob = new Blob([svgText], { type: "image/svg+xml" });
					blobUrl = URL.createObjectURL(blob);
				} else {
					// logo.dev results already have blob URLs
					blobUrl = result.imgUrl;
				}

				const img = new Image();
				img.onload = () => {
					onSelect(result.title, img, result.source);
					onClose();
				};
				img.onerror = () => URL.revokeObjectURL(blobUrl);
				img.src = blobUrl;
			} catch {
				// Direct fallback
				const img = new Image();
				img.onload = () => {
					onSelect(result.title, img, result.source);
					onClose();
				};
				img.src = result.imgUrl;
			}
		},
		[onSelect, onClose],
	);

	return (
		<>
			{/* biome-ignore lint/a11y/noStaticElementInteractions: backdrop click to close */}
			<div
				className={`drawer-backdrop${open ? " open" : ""}`}
				onClick={onClose}
				onKeyDown={(e) => {
					if (e.key === "Escape") onClose();
				}}
			/>
			<div
				ref={drawerRef}
				className={`drawer${open ? " open" : ""}`}
				role="dialog"
				aria-modal="true"
				aria-label="Search brand logos"
			>
				<div className="drawer-header">
					<span className="drawer-title">Search Logos</span>
					<button
						className="drawer-close"
						onClick={onClose}
						type="button"
						aria-label="Close drawer"
					>
						&#x2715;
					</button>
				</div>

				<input
					ref={searchRef}
					className="drawer-search"
					type="text"
					aria-label="Search brand logos"
					placeholder="Type a brand name..."
					value={query}
					onChange={(e) => setQuery(e.target.value)}
				/>

				<div className="drawer-credits">
					<a href="https://svgl.app" target="_blank" rel="noopener noreferrer">
						svgl
					</a>
					<span>+</span>
					<a href="https://logo.dev" target="_blank" rel="noopener noreferrer">
						logo.dev
					</a>
				</div>

				<div className="drawer-grid">
					{loading && <p className="drawer-status">Searching...</p>}
					{!loading && !searched && <p className="drawer-status">Type a brand name to search</p>}
					{!loading && searched && results.length === 0 && (
						<p className="drawer-status">No logos found</p>
					)}
					{results.map((result) => (
						<button
							key={result.id}
							className="drawer-item"
							onClick={() => handleSelect(result)}
							type="button"
						>
							<img src={result.imgUrl} alt={result.title} loading="lazy" />
							<span>{result.title}</span>
						</button>
					))}
				</div>
			</div>
		</>
	);
}
