import { SiteNav } from "@/components/SiteNav";

export function PrivacyPage() {
	return (
		<div className="docs-page">
			<SiteNav className="on-docs" activePage="privacy" />

			<div className="docs-content">
				<a className="docs-back" href="/">
					&larr; Back to App
				</a>
				<h1 className="docs-title">Privacy Policy</h1>
				<p className="docs-intro">
					This policy explains what data we collect when you visit <strong>abeyells.at</strong> and
					how we use it.
				</p>

				<section className="docs-section">
					<h2>What We Collect</h2>
					<p>
						We use <strong>Google Analytics 4</strong> to collect anonymous usage data such as page
						views, device type, browser, and general geographic region. This helps us understand how
						the site is used and improve it.
					</p>
					<p>
						Sticker generation happens entirely in your browser. We never upload, store, or process
						your logos on any server.
					</p>
				</section>

				<section className="docs-section">
					<h2>Cookies</h2>
					<p>If you accept analytics cookies, Google Analytics may set the following cookies:</p>
					<ul>
						<li>
							<code>_ga</code> &mdash; distinguishes unique visitors (expires after 2 years)
						</li>
						<li>
							<code>_ga_*</code> &mdash; maintains session state (expires after 2 years)
						</li>
					</ul>
					<p>
						We also store your cookie preference in your browser&apos;s local storage under the key{" "}
						<code>cookie-consent</code>. This is not a cookie and is never sent to any server.
					</p>
				</section>

				<section className="docs-section">
					<h2>Google Consent Mode</h2>
					<p>
						We use <strong>Google Consent Mode v2</strong>. If you reject cookies, Google Analytics
						runs in cookieless mode &mdash; no cookies are set and no persistent identifiers are
						stored. Google may still receive anonymous, aggregated pings for consent mode modeling.
					</p>
				</section>

				<section className="docs-section">
					<h2>Your Rights</h2>
					<ul>
						<li>You can accept or reject analytics cookies at any time using the cookie banner.</li>
						<li>To reset your choice, clear your browser&apos;s local storage for this site.</li>
						<li>
							You can also block cookies and scripts using your browser settings or an ad blocker.
						</li>
					</ul>
				</section>

				<section className="docs-section">
					<h2>Third-Party Services</h2>
					<ul>
						<li>
							<strong>Google Analytics</strong> &mdash;{" "}
							<a
								href="https://policies.google.com/privacy"
								target="_blank"
								rel="noopener noreferrer"
							>
								Google Privacy Policy
							</a>
						</li>
						<li>
							<strong>svgl</strong> and <strong>logo.dev</strong> &mdash; used for logo search.
							Requests are made directly from your browser.
						</li>
					</ul>
				</section>

				<section className="docs-section">
					<h2>Contact</h2>
					<p>
						Questions about this policy? Reach out at{" "}
						<a href="https://riccardo.lol" target="_blank" rel="noopener noreferrer">
							riccardo.lol
						</a>
						.
					</p>
				</section>

				<section className="docs-section">
					<h2>Last Updated</h2>
					<p>April 2026</p>
				</section>
			</div>
		</div>
	);
}
