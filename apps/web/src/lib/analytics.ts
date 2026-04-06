export const AnalyticsEvent = {
	LOGO_UPLOAD: "logo_upload",
	LOGO_DRAWER_OPEN: "logo_drawer_open",
	LOGO_SEARCH: "logo_search",
	LOGO_SELECT: "logo_select",
	STICKER_GENERATE: "sticker_generate",
	PRESET_CHANGE: "preset_change",
	FORMAT_CHANGE: "format_change",
	START_OVER: "start_over",
	COOKIE_CONSENT: "cookie_consent",
} as const;

type EventParams = Record<string, string | number>;

export function trackEvent(name: string, params?: EventParams) {
	if (typeof window.gtag === "function") {
		window.gtag("event", name, params);
	}
}
