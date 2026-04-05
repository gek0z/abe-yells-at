import { GitHubIcon, NpmIcon } from "@/components/icons";

export function SiteNav({ className, activePage }: { className?: string; activePage?: string }) {
	const isActive = (page: string) => activePage === page;
	return (
		<nav className={`site-nav unselectable${className ? ` ${className}` : ""}`}>
			<div className="footer-links">
				<a href="https://github.com/gek0z/abe-yells-at" target="_blank" rel="noopener noreferrer">
					<GitHubIcon />
				</a>
				<a
					href="https://www.npmjs.com/package/abe-yells-at"
					target="_blank"
					rel="noopener noreferrer"
				>
					<NpmIcon />
				</a>
			</div>
			<a className={`footer-link-text${isActive("docs") ? " active" : ""}`} href="/docs">
				Docs
			</a>
			<a className={`footer-privacy${isActive("privacy") ? " active" : ""}`} href="/privacy">
				Privacy Policy
			</a>
		</nav>
	);
}
