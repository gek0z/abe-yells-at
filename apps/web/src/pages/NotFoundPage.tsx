import { SiteNav } from "@/components/SiteNav";

export function NotFoundPage() {
	return (
		<div className="landing not-found-page">
			<SiteNav />

			{/* Clouds */}
			<div className="cloud cloud-1" />
			<div className="cloud cloud-2" />
			<div className="cloud cloud-3" />
			<div className="cloud cloud-4" />

			<div className="landing-content not-found-content">
				<h1 className="landing-title">
					Old man yells at
					<br />
					<span className="title-brand">missing page</span>
				</h1>
				<a className="not-found-link" href="/">
					Go Home
				</a>
			</div>

			<div className="abe-frame unselectable">
				<span className="not-found-404 unselectable">404</span>
				<img
					className="abe-landing unselectable"
					src="/abe.svg"
					alt="Grandpa Abe Simpson yelling"
				/>
			</div>
		</div>
	);
}
