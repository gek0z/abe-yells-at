import { useEffect, useState } from "react";
import { AnalyticsEvent, trackEvent } from "@/lib/analytics";

const STORAGE_KEY = "cookie-consent";

export function ConsentBar() {
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
		if (typeof window.gtag === "function") {
			window.gtag("consent", "update", {
				ad_storage: "denied",
				ad_user_data: "denied",
				ad_personalization: "denied",
				analytics_storage: "granted",
			});
		}
		trackEvent(AnalyticsEvent.COOKIE_CONSENT, { action: "accept" });
		setVisible(false);
	};

	const handleReject = () => {
		localStorage.setItem(STORAGE_KEY, "denied");
		trackEvent(AnalyticsEvent.COOKIE_CONSENT, { action: "reject" });
		setVisible(false);
	};

	return (
		<div className={`consent-bar${visible ? " visible" : ""}`}>
			<div className="consent-bar-content">
				<p>
					Old man yells at cookies! We use them to understand how you use our site.{" "}
					<a aria-label="Learn more about our cookie policy" href="/privacy">
						Learn more
					</a>
				</p>
				<div className="consent-bar-actions">
					<button className="consent-bar-reject" onClick={handleReject} type="button">
						Get off my lawn!
					</button>
					<button className="consent-bar-accept" onClick={handleAccept} type="button">
						Fine, whatever
					</button>
				</div>
			</div>
		</div>
	);
}
