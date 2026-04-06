import { useEffect, useState } from "react";
import { AnalyticsEvent, trackEvent } from "@/lib/analytics";

const STORAGE_KEY = "cookie-consent";

export function CookieBar() {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		if (localStorage.getItem(STORAGE_KEY) === null) {
			// Small delay so the slide-up animation plays after mount
			const id = requestAnimationFrame(() => setVisible(true));
			return () => cancelAnimationFrame(id);
		}
	}, []);

	if (localStorage.getItem(STORAGE_KEY) !== null && !visible) {
		return null;
	}

	const handleAccept = () => {
		localStorage.setItem(STORAGE_KEY, "granted");
		window.gtag("consent", "update", {
			ad_storage: "denied",
			ad_user_data: "denied",
			ad_personalization: "denied",
			analytics_storage: "granted",
		});
		trackEvent(AnalyticsEvent.COOKIE_CONSENT, { action: "accept" });
		setVisible(false);
	};

	const handleReject = () => {
		localStorage.setItem(STORAGE_KEY, "denied");
		trackEvent(AnalyticsEvent.COOKIE_CONSENT, { action: "reject" });
		setVisible(false);
	};

	return (
		<div className={`cookie-bar${visible ? " visible" : ""}`}>
			<div className="cookie-bar-content">
				<p>
					We use cookies to understand how you use our site. <a href="/privacy">Learn more</a>
				</p>
				<div className="cookie-bar-actions">
					<button className="cookie-bar-reject" onClick={handleReject} type="button">
						Reject
					</button>
					<button className="cookie-bar-accept" onClick={handleAccept} type="button">
						Accept
					</button>
				</div>
			</div>
		</div>
	);
}
