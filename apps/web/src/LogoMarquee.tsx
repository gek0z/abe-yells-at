import { useCallback, useEffect, useMemo, useState } from "react";

interface ShowcaseLogo {
	title: string;
	url: string;
	invert?: boolean;
	brightness?: number;
}

const SHOWCASE_LOGOS: ShowcaseLogo[] = [
	{ title: "Apple", url: "https://svgl.app/library/apple.svg" },
	{ title: "Google", url: "https://svgl.app/library/google.svg" },
	{ title: "Microsoft", url: "https://svgl.app/library/microsoft.svg" },
	{ title: "AWS", url: "https://svgl.app/library/aws_light.svg" },
	{ title: "Meta", url: "https://svgl.app/library/meta.svg" },
	{ title: "Netflix", url: "https://svgl.app/library/netflix-icon.svg" },
	{ title: "Discord", url: "https://svgl.app/library/discord.svg" },
	{ title: "GitHub", url: "https://svgl.app/library/github_light.svg" },
	{ title: "Twitter", url: "https://svgl.app/library/x.svg" },
	{ title: "Figma", url: "https://svgl.app/library/figma.svg" },
	{ title: "Notion", url: "https://svgl.app/library/notion.svg" },
	{ title: "Vercel", url: "https://svgl.app/library/vercel.svg" },
	{ title: "OpenAI", url: "https://svgl.app/library/openai.svg" },
	{ title: "Cloudflare", url: "https://svgl.app/library/cloudflare.svg" },
	{ title: "PayPal", url: "https://svgl.app/library/paypal.svg" },
	{ title: "Twitch", url: "https://svgl.app/library/twitch.svg" },
	{ title: "Reddit", url: "https://svgl.app/library/reddit.svg" },
	{ title: "Shopify", url: "https://svgl.app/library/shopify.svg" },
	{ title: "Docker", url: "https://svgl.app/library/docker.svg", brightness: 0.5 },
	{ title: "Firebase", url: "https://svgl.app/library/firebase.svg" },
	{ title: "Linear", url: "https://svgl.app/library/linear.svg", brightness: 0 },
	{ title: "YouTube", url: "https://svgl.app/library/youtube.svg" },
	{ title: "Instagram", url: "https://svgl.app/library/instagram-icon.svg" },
	{ title: "WhatsApp", url: "https://svgl.app/library/whatsapp-icon.svg", invert: true },
	{ title: "Snapchat", url: "https://svgl.app/library/snapchat.svg" },
	{ title: "Pinterest", url: "https://svgl.app/library/pinterest.svg" },
	{ title: "Telegram", url: "https://svgl.app/library/telegram.svg" },
	{ title: "Tailwind", url: "https://svgl.app/library/tailwindcss.svg", invert: true },
	{ title: "React", url: "https://svgl.app/library/react_light.svg" },
	{ title: "Rust", url: "https://svgl.app/library/rust.svg" },
	{ title: "Go", url: "https://svgl.app/library/golang.svg" },
	{ title: "Kubernetes", url: "https://svgl.app/library/kubernetes.svg" },
	{ title: "Uber", url: "https://svgl.app/library/uber_light.svg" },
	{ title: "Airbnb", url: "https://svgl.app/library/airbnb.svg" },
	{ title: "Zoom", url: "https://svgl.app/library/zoom.svg" },
	{ title: "Salesforce", url: "https://svgl.app/library/salesforce.svg" },
	{ title: "Steam", url: "https://svgl.app/library/steam.svg" },
	{ title: "PlayStation", url: "https://svgl.app/library/playstation.svg", brightness: 0.5 },
	{ title: "Xbox", url: "https://svgl.app/library/xbox.svg" },
];

function shuffle<T>(arr: T[]): T[] {
	const a = [...arr];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

export function LogoShowcase({ onLogoChange }: { onLogoChange?: (name: string) => void }) {
	const logos = useMemo(() => shuffle(SHOWCASE_LOGOS), []);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [visible, setVisible] = useState(true);

	useEffect(() => {
		onLogoChange?.(logos[0].title);
	}, [logos, onLogoChange]);

	const advance = useCallback(() => {
		setVisible(false);
		// Wait for fade-out (300ms CSS) + buffer before swapping
		setTimeout(() => {
			setCurrentIndex((prev) => {
				const next = (prev + 1) % logos.length;
				onLogoChange?.(logos[next].title);
				return next;
			});
			setVisible(true);
		}, 350);
	}, [logos, onLogoChange]);

	useEffect(() => {
		const timer = setInterval(advance, 2500);
		return () => clearInterval(timer);
	}, [advance]);

	const logo = logos[currentIndex];
	const nextLogo = logos[(currentIndex + 1) % logos.length];

	return (
		<div className="logo-showcase" aria-live="polite" aria-atomic="true">
			<div className={`logo-showcase-item${visible ? " visible" : ""}`}>
				<img
					src={logo.url}
					alt={logo.title}
					style={
						logo.invert
							? { filter: "brightness(0) invert(1)" }
							: logo.brightness != null
								? { filter: `brightness(${logo.brightness})` }
								: undefined
					}
				/>
				<span className="sr-only">Abe yells at {logo.title}</span>
			</div>
			<img
				src={nextLogo.url}
				alt=""
				aria-hidden="true"
				style={{ position: "absolute", width: 0, height: 0, overflow: "hidden", opacity: 0 }}
			/>
		</div>
	);
}
