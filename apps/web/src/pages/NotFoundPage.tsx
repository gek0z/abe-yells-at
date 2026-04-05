import { SiteNav } from "@/components/SiteNav";

export function NotFoundPage() {
	return (
		<div className="not-found-page">
			<SiteNav />
			<div className="not-found-content">
				<img className="not-found-abe" src="/abe.gif" alt="Grandpa Abe Simpson yelling" />
				<h1 className="not-found-title">404</h1>
				<p className="not-found-text">Old man yells at missing page.</p>
				<a className="not-found-link" href="/">
					Go Home
				</a>
			</div>
		</div>
	);
}
