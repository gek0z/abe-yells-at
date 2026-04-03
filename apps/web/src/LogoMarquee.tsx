import { useCallback, useEffect, useState } from "react";
import { getLogoUrl } from "@/LogoDrawer";

interface SvglLogo {
	id: number;
	title: string;
	category: string | string[];
	route: string | { light: string; dark: string };
}

export function LogoShowcase({ onLogoChange }: { onLogoChange?: (name: string) => void }) {
	const [logos, setLogos] = useState<SvglLogo[]>([]);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		let cancelled = false;
		async function load() {
			try {
				const res = await fetch("https://api.svgl.app?limit=30");
				if (!res.ok) return;
				const data: SvglLogo[] = await res.json();
				if (!cancelled && data.length > 0) {
					setLogos(data);
					setVisible(true);
					onLogoChange?.(data[0].title);
				}
			} catch {
				// decorative -- fail silently
			}
		}
		load();
		return () => {
			cancelled = true;
		};
	}, [onLogoChange]);

	const advance = useCallback(() => {
		setVisible(false);
		setTimeout(() => {
			setCurrentIndex((prev) => {
				const next = (prev + 1) % logos.length;
				onLogoChange?.(logos[next].title);
				return next;
			});
			setVisible(true);
		}, 400);
	}, [logos, onLogoChange]);

	useEffect(() => {
		if (logos.length === 0) return;
		const timer = setInterval(advance, 2500);
		return () => clearInterval(timer);
	}, [logos, advance]);

	if (logos.length === 0) return null;

	const logo = logos[currentIndex];

	return (
		<div className="logo-showcase">
			<div className={`logo-showcase-item${visible ? " visible" : ""}`}>
				<img src={getLogoUrl(logo)} alt={logo.title} />
			</div>
		</div>
	);
}
