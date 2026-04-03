import { useCallback, useEffect, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// Types matching the svgl.app API
// ---------------------------------------------------------------------------

interface SvglLogo {
	id: number;
	title: string;
	category: string | string[];
	route: string | { light: string; dark: string };
	wordmark?: { light: string; dark: string };
	url?: string;
}

export function getLogoUrl(logo: SvglLogo): string {
	if (typeof logo.route === "string") return logo.route;
	return logo.route.light;
}

const SVGL_PREFIX = "https://svgl.app/library/";
const RAW_GH_PREFIX = "https://raw.githubusercontent.com/pheralb/svgl/main/static/library/";

export function getCorsUrl(url: string): string {
	if (url.startsWith(SVGL_PREFIX)) {
		return url.replace(SVGL_PREFIX, RAW_GH_PREFIX);
	}
	return url;
}

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

const API_BASE = "https://api.svgl.app";

async function searchLogos(query: string): Promise<SvglLogo[]> {
	const url = query ? `${API_BASE}?search=${encodeURIComponent(query)}` : `${API_BASE}?limit=60`;
	const res = await fetch(url);
	if (!res.ok) return [];
	return res.json();
}

async function fetchByCategory(category: string): Promise<SvglLogo[]> {
	const res = await fetch(`${API_BASE}/category/${encodeURIComponent(category)}`);
	if (!res.ok) return [];
	return res.json();
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

const CATEGORIES = [
	"All",
	"Payment",
	"Software",
	"AI",
	"Framework",
	"Library",
	"Language",
	"Database",
	"Cloud",
	"Design",
	"Social",
	"Browser",
	"Hosting",
	"Compiler",
	"CMS",
	"Education",
];

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
	onSelect: (name: string, img: HTMLImageElement) => void;
}) {
	const [query, setQuery] = useState("");
	const [category, setCategory] = useState("All");
	const [logos, setLogos] = useState<SvglLogo[]>([]);
	const [loading, setLoading] = useState(false);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const searchRef = useRef<HTMLInputElement | null>(null);

	const fetchLogos = useCallback(async (q: string, cat: string) => {
		setLoading(true);
		try {
			const results = cat !== "All" && !q ? await fetchByCategory(cat) : await searchLogos(q);
			setLogos(results);
		} catch {
			setLogos([]);
		} finally {
			setLoading(false);
		}
	}, []);

	// Debounced search
	useEffect(() => {
		if (debounceRef.current) clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => {
			fetchLogos(query, category);
		}, 250);
		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
		};
	}, [query, category, fetchLogos]);

	const drawerRef = useRef<HTMLDivElement | null>(null);

	// Auto-focus search input when opened, handle Escape, trap focus
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
		async (logo: SvglLogo) => {
			const corsUrl = getCorsUrl(getLogoUrl(logo));
			try {
				// Fetch via CORS-friendly URL, create local blob
				// so the canvas doesn't get tainted
				const res = await fetch(corsUrl);
				const svgText = await res.text();
				const blob = new Blob([svgText], { type: "image/svg+xml" });
				const blobUrl = URL.createObjectURL(blob);

				const img = new Image();
				img.onload = () => {
					onSelect(logo.title, img);
					onClose();
				};
				img.onerror = () => URL.revokeObjectURL(blobUrl);
				img.src = blobUrl;
			} catch {
				const img = new Image();
				img.onload = () => {
					onSelect(logo.title, img);
					onClose();
				};
				img.src = getLogoUrl(logo);
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
					<span className="drawer-title">Brand Logos</span>
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
					placeholder="Search 500+ brand logos..."
					value={query}
					onChange={(e) => {
						setQuery(e.target.value);
						setCategory("All");
					}}
				/>

				<a
					className="drawer-credit"
					href="https://svgl.app"
					target="_blank"
					rel="noopener noreferrer"
				>
					powered by svgl
				</a>

				<div className="drawer-categories">
					{CATEGORIES.map((cat) => (
						<button
							key={cat}
							className={`drawer-cat${category === cat ? " active" : ""}`}
							onClick={() => {
								setCategory(cat);
								setQuery("");
							}}
							type="button"
						>
							{cat}
						</button>
					))}
				</div>

				<div className="drawer-grid">
					{loading && <p className="drawer-status">Searching...</p>}
					{!loading && logos.length === 0 && <p className="drawer-status">No logos found</p>}
					{logos.map((logo) => (
						<button
							key={logo.id}
							className="drawer-item"
							onClick={() => handleSelect(logo)}
							type="button"
						>
							<img src={getLogoUrl(logo)} alt={logo.title} loading="lazy" />
							<span>{logo.title}</span>
						</button>
					))}
				</div>
			</div>
		</>
	);
}
