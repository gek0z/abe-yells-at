import { useState } from "react";
import type { Format } from "@/sticker-engine";

type Platform = "whatsapp" | "slack" | "discord";

const TABS: { id: Platform; label: string }[] = [
	{ id: "whatsapp", label: "WhatsApp" },
	{ id: "slack", label: "Slack" },
	{ id: "discord", label: "Discord" },
];

const RECOMMENDED: Record<Platform, { format: string; size: string }> = {
	whatsapp: { format: "GIF", size: "512x512" },
	slack: { format: "GIF", size: "512x512" },
	discord: { format: "GIF or WebP", size: "320x320" },
};

function WhatsAppInstructions() {
	return (
		<ol>
			<li>
				Tap the sticker button{" "}
				<img
					src="https://static.xx.fbcdn.net/assets/?set=whatsapp_help_article_assets&name=android-sticker&density=1"
					alt="sticker button"
				/>{" "}
				in the message composer
			</li>
			<li>
				Tap <strong>Create</strong>, then go to <strong>Recents</strong> &gt;{" "}
				<strong>See more</strong> &gt; <strong>Photos</strong>
			</li>
			<li>Select your downloaded sticker from your gallery</li>
			<li>
				Tap send{" "}
				<img
					src="https://static.xx.fbcdn.net/assets/?set=whatsapp_help_article_assets&name=android-send&density=1"
					alt="send button"
				/>{" "}
				to share your sticker
			</li>
		</ol>
	);
}

function SlackInstructions() {
	return (
		<ol>
			<li>Open any Slack channel or DM</li>
			<li>
				Click the <strong>+</strong> button in the message composer
			</li>
			<li>
				Select <strong>Upload from your computer</strong>
			</li>
			<li>Choose your downloaded sticker file</li>
			<li>
				Add it as a custom emoji: Go to <strong>Customize Workspace</strong> &gt;{" "}
				<strong>Add Custom Emoji</strong>
			</li>
		</ol>
	);
}

function DiscordInstructions() {
	return (
		<ol>
			<li>
				Open <strong>Server Settings</strong> &gt; <strong>Stickers</strong>
			</li>
			<li>
				Click <strong>Upload Sticker</strong>
			</li>
			<li>Select your downloaded sticker file</li>
			<li>Give it a name and related emoji</li>
			<li>
				Click <strong>Upload</strong> to save
			</li>
		</ol>
	);
}

export function PlatformInstructions({ format: _format }: { format: Format }) {
	const [tab, setTab] = useState<Platform>("whatsapp");

	const rec = RECOMMENDED[tab];

	return (
		<div className="instructions">
			<h2 className="instructions-title">How to Use Your Sticker</h2>
			<div className="instructions-tabs">
				{TABS.map((t) => (
					<button
						key={t.id}
						className={`instructions-tab${tab === t.id ? " active" : ""}`}
						onClick={() => setTab(t.id)}
						type="button"
					>
						{t.label}
					</button>
				))}
			</div>
			<div className="instructions-content">
				<span className="instructions-badge">
					Best: {rec.format} {rec.size}
				</span>
				{tab === "whatsapp" && <WhatsAppInstructions />}
				{tab === "slack" && <SlackInstructions />}
				{tab === "discord" && <DiscordInstructions />}
			</div>
		</div>
	);
}
