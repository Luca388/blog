// Fixes applied to each post's Markdown just before Astro parses it (see astro.config.mjs).
// The web editor's preview uses the same code: src/pages/admin/markdown-fixes.js.ts sends
// markdownFixes to the browser, so everything it needs lives inside that one function.

export function markdownFixes() {
	// Code (```…```, ~~~…~~~ and `…`) is never touched.
	const CODE = /(```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]*`)/;
	const outsideCode = (markdown, fix) =>
		markdown
			.split(CODE)
			.map((part, i) => (i % 2 ? part : fix(part)))
			.join('');

	/**
	 * Math written the LaTeX way, \( inline \) and \[ block \] (ChatGPT and many notes do), becomes
	 * $…$ and $$…$$. In Markdown those are just escaped brackets. `\\[2pt]` (a line break inside a
	 * formula) is left alone.
	 */
	const LATEX_MATH = /(?<!\\)\\\[([\s\S]+?)(?<!\\)\\\]|(?<!\\)\\\(([\s\S]+?)(?<!\\)\\\)/g;
	const latexDelimiters = (markdown) =>
		outsideCode(markdown, (text) =>
			text.replace(LATEX_MATH, (_, block, inline) => (block !== undefined ? `$$${block}$$` : `$${inline.trim()}$`)),
		);

	/**
	 * Bold next to Korean: Markdown does not close **군(Group)**은, because the bold ends in a
	 * punctuation mark and a letter follows (the same goes for the opening side). Those pairs become
	 * <strong>…</strong>, which works anywhere; every other ** is left to the parser.
	 */
	const BOLD = /(?<![*\\])\*\*(?![\s*])((?:(?!\*\*)[^\n])+?)(?<![\s\\])\*\*(?!\*)/g;
	const PUNCT = /[\p{P}\p{S}]/u;
	const WORD = /[\p{L}\p{N}]/u;
	const koreanBold = (markdown) =>
		outsideCode(markdown, (text) =>
			text.replace(BOLD, (match, inner, offset, whole) => {
				const before = whole[offset - 1] ?? '';
				const after = whole[offset + match.length] ?? '';
				const stuck =
					(PUNCT.test(inner.at(-1)) && WORD.test(after)) || (PUNCT.test(inner[0]) && WORD.test(before));
				return stuck ? `<strong>${inner}</strong>` : match;
			}),
		);

	const fixMarkdown = (markdown) => koreanBold(latexDelimiters(markdown));

	/**
	 * Takes the math out of (fixed) Markdown, leaving @@math<n>@@ in its place, for renderers that
	 * would otherwise read _ and * inside it as emphasis. Same rule as src/lib/katex.mjs: a single-$
	 * pair with a space just inside or a digit right after ("$5 … $10") is not math.
	 */
	const MATH = /(?<!\\)\$\$([\s\S]+?)\$\$|(?<![\\$])\$(?=[^\s$])([^$\n]*?[^\s\\])\$(?![\d$])/g;
	const protectMath = (markdown) => {
		const math = [];
		const text = outsideCode(markdown, (part) =>
			part.replace(MATH, (_, block, inline) => {
				math.push({ tex: block ?? inline, display: block !== undefined });
				return `@@math${math.length - 1}@@`;
			}),
		);
		return { text, math };
	};

	return { latexDelimiters, koreanBold, fixMarkdown, protectMath };
}

export const { latexDelimiters, koreanBold, fixMarkdown, protectMath } = markdownFixes();

/** Wraps Astro's Markdown processor so every post goes through fixMarkdown first. */
export function withMarkdownFixes(processor) {
	const createRenderer = processor.createRenderer.bind(processor);
	processor.createRenderer = async (shared) => {
		const renderer = await createRenderer(shared);
		return { ...renderer, render: (content, opts) => renderer.render(fixMarkdown(content), opts) };
	};
	return processor;
}
