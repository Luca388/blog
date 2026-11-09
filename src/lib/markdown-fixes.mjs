// Fixes applied to each post's Markdown just before Astro parses it (see astro.config.mjs).
// Code (```…```, ~~~…~~~ and `…`) is never touched.

const CODE = /(```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]*`)/;

/** Runs `fix` on the parts of the Markdown outside code. */
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
export const latexDelimiters = (markdown) =>
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
export const koreanBold = (markdown) =>
	outsideCode(markdown, (text) =>
		text.replace(BOLD, (match, inner, offset, whole) => {
			const before = whole[offset - 1] ?? '';
			const after = whole[offset + match.length] ?? '';
			const stuck =
				(PUNCT.test(inner.at(-1)) && WORD.test(after)) || (PUNCT.test(inner[0]) && WORD.test(before));
			return stuck ? `<strong>${inner}</strong>` : match;
		}),
	);

export const fixMarkdown = (markdown) => koreanBold(latexDelimiters(markdown));

/** Wraps Astro's Markdown processor so every post goes through fixMarkdown first. */
export function withMarkdownFixes(processor) {
	const createRenderer = processor.createRenderer.bind(processor);
	processor.createRenderer = async (shared) => {
		const renderer = await createRenderer(shared);
		return { ...renderer, render: (content, opts) => renderer.render(fixMarkdown(content), opts) };
	};
	return processor;
}
