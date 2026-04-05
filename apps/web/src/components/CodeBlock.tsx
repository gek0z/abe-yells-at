import { useCallback, useState } from "react";

function highlightBash(code: string): string {
	return code
		.replace(/^(#.*)$/gm, '<span class="cb-comment">$1</span>')
		.replace(
			/\b(npx|bunx|bun|npm|pnpm|abe-yells-at|install|run|add|dlx)\b/g,
			'<span class="cb-keyword">$1</span>',
		);
}

function highlightTS(code: string): string {
	// Process line-by-line so comments don't get inner highlights
	return code
		.split("\n")
		.map((line) => {
			const commentIdx = line.indexOf("//");
			if (commentIdx === -1) return highlightTSTokens(line);
			const before = line.slice(0, commentIdx);
			const comment = line.slice(commentIdx);
			return `${highlightTSTokens(before)}<span class="cb-comment">${comment}</span>`;
		})
		.join("\n");
}

function highlightTSTokens(text: string): string {
	return (
		text
			// strings (double and single quoted, and backtick)
			.replace(/(["'`])(?:(?!\1).)*\1/g, '<span class="cb-string">$&</span>')
			// keywords
			.replace(
				/\b(import|from|export|const|let|var|await|async|type|interface|new)\b/g,
				'<span class="cb-keyword">$1</span>',
			)
	);
}

const highlighters: Record<string, (code: string) => string> = {
	bash: highlightBash,
	ts: highlightTS,
};

export function CodeBlock({ code, lang }: { code: string; lang?: "bash" | "ts" }) {
	const [copied, setCopied] = useState(false);

	const handleCopy = useCallback(() => {
		navigator.clipboard.writeText(code).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		});
	}, [code]);

	const highlight = lang ? highlighters[lang] : undefined;
	const html = highlight ? highlight(code) : code;

	return (
		<div className="cb-wrap">
			<button className="cb-copy" onClick={handleCopy} type="button">
				{copied ? "Copied!" : "Copy"}
			</button>
			<pre>
				{/* biome-ignore lint/security/noDangerouslySetInnerHtml: static code snippets only */}
				<code dangerouslySetInnerHTML={{ __html: html }} />
			</pre>
		</div>
	);
}
