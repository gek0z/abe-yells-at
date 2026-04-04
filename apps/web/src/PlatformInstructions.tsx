import { useState } from "react";
import type { Format } from "@/sticker-engine";

type Platform = "whatsapp" | "slack" | "discord";

const TABS: { id: Platform; label: string }[] = [
	{ id: "whatsapp", label: "WhatsApp" },
	{ id: "slack", label: "Slack" },
	{ id: "discord", label: "Discord" },
];

const RECOMMENDED: Record<Platform, string> = {
	whatsapp: "WebP",
	slack: "GIF",
	discord: "GIF or WebP",
};

// WhatsApp icon helper
const WA_ICON = "https://static.xx.fbcdn.net/assets/?set=whatsapp_help_article_assets&name=";
function WaIcon({ name, alt, noInvert }: { name: string; alt: string; noInvert?: boolean }) {
	return (
		<img
			className={noInvert ? "no-invert" : undefined}
			src={`${WA_ICON}${name}&density=1`}
			alt={alt}
		/>
	);
}

function WhatsAppAndroid() {
	return (
		<ol>
			<li>
				Tap <WaIcon name="android-sticker" alt="Stickers" /> &gt;{" "}
				<WaIcon name="android-stickers" alt="Stickers panel" />.
			</li>
			<li>
				Tap <strong>Create</strong> &gt; <strong>Recents</strong> &gt; <strong>See more</strong>{" "}
				&gt; <strong>Photos</strong>.
			</li>
			<li>Select your downloaded sticker from your gallery.</li>
			<li>
				On the preview screen, choose from one of the preset options, then:
				<ul>
					<li>
						Tap <WaIcon name="android-add-sticker-emoji" alt="Add sticker emoji" noInvert /> to add
						a sticker or emoji.
					</li>
					<li>
						Tap <WaIcon name="android-add-text-to-sticker" alt="Add text" noInvert /> to add text.
					</li>
					<li>
						Tap <WaIcon name="android-draw-on-sticker" alt="Draw" noInvert /> to draw on your
						sticker.
					</li>
					<li>
						Tap <WaIcon name="iphone-dismiss" alt="Dismiss" noInvert /> to cancel or start over.
					</li>
				</ul>
			</li>
			<li>
				Tap <WaIcon name="android-send" alt="Send" noInvert /> to send your sticker.
			</li>
		</ol>
	);
}

function WhatsAppIOS() {
	return (
		<ol>
			<li>
				Tap <strong>Save / Share</strong> above and select <strong>WhatsApp</strong> from the share
				sheet to send the sticker directly.
			</li>
			<li>
				Alternatively, tap <strong>Save to Files</strong> in the share sheet, then in WhatsApp:
			</li>
			<li>
				Tap <WaIcon name="iphone-stickers-sticker-icon" alt="Stickers" />.
			</li>
			<li>
				Tap <WaIcon name="iphone-create-sticker" alt="Create sticker" /> &gt;{" "}
				<strong>Use a photo</strong>.
			</li>
			<li>Browse to your saved sticker file and select it.</li>
			<li>
				Tap <WaIcon name="iphone-send" alt="Send" noInvert /> to send your sticker.
			</li>
		</ol>
	);
}

function WhatsAppInstructions() {
	const [os, setOs] = useState<"android" | "ios">("android");

	return (
		<div>
			<div className="os-toggle">
				<button
					className={os === "android" ? "active" : ""}
					onClick={() => setOs("android")}
					type="button"
				>
					Android
				</button>
				<button className={os === "ios" ? "active" : ""} onClick={() => setOs("ios")} type="button">
					iOS
				</button>
			</div>
			{os === "android" ? <WhatsAppAndroid /> : <WhatsAppIOS />}
			<p className="instructions-link">
				Learn more in the{" "}
				<a
					href="https://faq.whatsapp.com/1056840314992666"
					target="_blank"
					rel="noopener noreferrer"
				>
					official WhatsApp guide
				</a>
				.
			</p>
		</div>
	);
}

function SmileyIcon() {
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

function SlackDesktop() {
	return (
		<ol>
			<li>
				Click the <SmileyIcon /> smiley face icon in the message field to open the emoji menu.
			</li>
			<li>
				Click <strong>Add emoji</strong>.
			</li>
			<li>
				Click <strong>Upload image</strong>, and select your downloaded sticker file.
			</li>
			<li>
				Under <strong>Give it a name</strong>, enter a name for your emoji, then click{" "}
				<strong>Save</strong>.
			</li>
		</ol>
	);
}

function SlackIOS() {
	return (
		<ol>
			<li>
				Tap the <SmileyIcon /> smiley face icon in the message field to open the menu.
			</li>
			<li>
				Enter a name for your custom emoji, then tap <strong>Add custom emoji</strong>.
			</li>
			<li>Select an option and follow the prompts to upload your sticker image.</li>
			<li>
				When you're ready, tap <strong>Add</strong> in the top-right corner.
			</li>
		</ol>
	);
}

function SlackInstructions() {
	const [os, setOs] = useState<"desktop" | "ios">("desktop");

	return (
		<div>
			<div className="os-toggle">
				<button
					className={os === "desktop" ? "active" : ""}
					onClick={() => setOs("desktop")}
					type="button"
				>
					Desktop
				</button>
				<button className={os === "ios" ? "active" : ""} onClick={() => setOs("ios")} type="button">
					Mobile
				</button>
			</div>
			{os === "desktop" ? <SlackDesktop /> : <SlackIOS />}
			<p className="instructions-link">
				Learn more in the{" "}
				<a
					href="https://slack.com/intl/en-gb/help/articles/206870177-Add-customised-emoji-and-aliases-to-your-workspace"
					target="_blank"
					rel="noopener noreferrer"
				>
					official Slack guide
				</a>
				.
			</p>
		</div>
	);
}

function DiscordServerSettings() {
	return (
		<ol>
			<li>Choose the server where you want to add your sticker as a custom emoji.</li>
			<li>
				Open <strong>Server Settings</strong> by selecting the drop-down menu next to the server
				name.
			</li>
			<li>
				Select the <strong>Emoji</strong> tab, then press <strong>Upload Emoji</strong> and choose
				your downloaded sticker file.
			</li>
			<li>
				Give it a name (at least 2 characters, alphanumeric and underscores only). Must be under
				256KB.
			</li>
		</ol>
	);
}

function DiscordEmojiPicker() {
	return (
		<ol>
			<li>
				In the <strong>Emoji Picker</strong>, select <strong>Add Emoji</strong> to open Emoji
				Studio.
			</li>
			<li>Choose a file to upload (JPEG, PNG, GIF, or WebP).</li>
			<li>
				Customize your emoji by resizing, rotating, or zooming. Give it a name and select which
				server to upload it to.
			</li>
			<li>
				When you're finished, select <strong>Upload Emoji</strong>.
			</li>
		</ol>
	);
}

function DiscordInstructions() {
	const [method, setMethod] = useState<"settings" | "picker">("settings");

	return (
		<div>
			<div className="os-toggle">
				<button
					className={method === "settings" ? "active" : ""}
					onClick={() => setMethod("settings")}
					type="button"
				>
					Server Settings
				</button>
				<button
					className={method === "picker" ? "active" : ""}
					onClick={() => setMethod("picker")}
					type="button"
				>
					Emoji Picker
				</button>
			</div>
			{method === "settings" ? <DiscordServerSettings /> : <DiscordEmojiPicker />}
			<p className="instructions-link">
				Learn more in the{" "}
				<a
					href="https://support.discord.com/hc/en-us/articles/360036479811-How-to-Add-Custom-Emojis-on-Discord"
					target="_blank"
					rel="noopener noreferrer"
				>
					official Discord guide
				</a>
				.
			</p>
		</div>
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
				<span className="instructions-badge">Best format: {rec}</span>
				{tab === "whatsapp" && <WhatsAppInstructions />}
				{tab === "slack" && <SlackInstructions />}
				{tab === "discord" && <DiscordInstructions />}
			</div>
		</div>
	);
}
