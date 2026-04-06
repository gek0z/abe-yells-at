import { useCallback, useEffect, useMemo, useState } from "react";

interface ShowcaseLogo {
	title: string;
	url: string;
	invert?: boolean;
	brightness?: number;
}

const SHOWCASE_LOGOS: ShowcaseLogo[] = [
	{ title: "Codex", url: "https://svgl.app/library/codex_light.svg" },
	{ title: "OpenClaw", url: "https://svgl.app/library/openclaw.svg" },
	{ title: "Microsoft Office", url: "https://svgl.app/library/microsoft-office.svg" },
	{ title: "Google Sheets", url: "https://svgl.app/library/google-sheets.svg" },
	{ title: "Google Calendar", url: "https://svgl.app/library/google-calendar.svg" },
	{ title: "Cursor", url: "https://svgl.app/library/cursor_light.svg" },
	{ title: "Google Maps", url: "https://svgl.app/library/googleMaps.svg" },
	{ title: "Google Cloud", url: "https://svgl.app/library/google-cloud.svg" },
	{ title: "Ghostty", url: "https://svgl.app/library/ghostty.svg" },
	{ title: "Anthropic", url: "https://svgl.app/library/anthropic_white.svg" },
	{ title: "Gemini", url: "https://svgl.app/library/gemini.svg" },
	{ title: "Dropbox", url: "https://svgl.app/library/dropbox.svg" },
	{ title: "Claude AI", url: "https://svgl.app/library/claude-ai-icon.svg" },
	{ title: "Raspberry PI", url: "https://svgl.app/library/raspberry_pi.svg" },
	{ title: "PDF", url: "https://svgl.app/library/pdf.svg" },
	{ title: "Apple Music", url: "https://svgl.app/library/apple-music-icon.svg" },
	{ title: "Next.js", url: "https://svgl.app/library/nextjs_icon_dark.svg" },
	{ title: "TikTok", url: "https://svgl.app/library/tiktok-icon-light.svg" },
	{ title: "Android", url: "https://svgl.app/library/android-icon.svg" },
	{ title: "Gmail", url: "https://svgl.app/library/gmail.svg" },
	{ title: "Sky", url: "https://svgl.app/library/sky.svg" },
	{ title: "Linux", url: "https://svgl.app/library/linux.svg" },
	{ title: "Safari", url: "https://svgl.app/library/safari.svg" },
	{ title: "Edge", url: "https://svgl.app/library/edge.svg" },
	{ title: "Photoshop", url: "https://svgl.app/library/photoshop.svg" },
	{ title: "Illustrator", url: "https://svgl.app/library/illustrator.svg" },
	{ title: "Bitcoin", url: "https://svgl.app/library/btc.svg" },
	{ title: "Chrome", url: "https://svgl.app/library/chrome.svg" },
	{ title: "Prime Video", url: "https://svgl.app/library/prime-video.svg" },
	{ title: "Kick", url: "https://svgl.app/library/kick-light.svg" },
	{ title: "WordPress", url: "https://svgl.app/library/wordpress.svg", brightness: 0.7 },
	{ title: "Messenger", url: "https://svgl.app/library/messenger.svg" },
	{ title: "Python", url: "https://svgl.app/library/python.svg" },
	{ title: "Disney+", url: "https://svgl.app/library/disneyplus.svg" },
	{ title: "Microsoft Word", url: "https://svgl.app/library/microsoft-word.svg" },
	{ title: "Microsoft Excel", url: "https://svgl.app/library/microsoft-excel.svg" },
	{ title: "Bun", url: "https://svgl.app/library/bun.svg" },
	{ title: "JavaScript", url: "https://svgl.app/library/javascript.svg" },
	{ title: "TypeScript", url: "https://svgl.app/library/typescript.svg" },
	{ title: "LinkedIn", url: "https://svgl.app/library/linkedin.svg", invert: true },
	{ title: "Firefox", url: "https://svgl.app/library/firefox.svg" },
	{ title: "Facebook", url: "https://svgl.app/library/facebook-icon.svg" },
	{ title: "Spotify", url: "https://svgl.app/library/spotify.svg", invert: true },
	{ title: "NVIDIA", url: "https://svgl.app/library/nvidia-icon-light.svg" },
	{ title: "Apple", url: "https://svgl.app/library/apple.svg" },
	{ title: "Google", url: "https://svgl.app/library/google.svg" },
	{ title: "Microsoft", url: "https://svgl.app/library/microsoft.svg" },
	{ title: "AWS", url: "https://svgl.app/library/aws_light.svg" },
	{ title: "Meta", url: "https://svgl.app/library/meta.svg" },
	{ title: "Netflix", url: "https://svgl.app/library/netflix-icon.svg" },
	{ title: "Discord", url: "https://svgl.app/library/discord.svg" },
	{ title: "GitHub", url: "https://svgl.app/library/github_light.svg" },
	{ title: "X", url: "https://svgl.app/library/x.svg" },
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
	{ title: "Threads", url: "https://svgl.app/library/threads.svg" },
	{ title: "Bluesky", url: "https://svgl.app/library/bluesky.svg" },
	{ title: "Adobe", url: "https://svgl.app/library/adobe.svg" },
	{ title: "Canva", url: "https://svgl.app/library/canva.svg" },
	{ title: "eBay", url: "https://svgl.app/library/ebay.svg" },
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

	useEffect(() => {
		for (let i = 1; i <= 3; i++) {
			const img = new Image();
			img.src = logos[(currentIndex + i) % logos.length].url;
		}
	}, [currentIndex, logos]);

	const logo = logos[currentIndex];

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
		</div>
	);
}
