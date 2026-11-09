// LaTeX math in posts: $inline$ and $$block$$, turned into HTML with KaTeX at build time.
// Sätteri (Astro's Markdown processor) parses the math; this plugin renders it.
// \( \) and \[ \] are turned into $ and $$ beforehand (src/lib/markdown-fixes.mjs).
// Post pages with math load the KaTeX styles (src/pages/[slug].astro).
import katex from 'katex';

const render = (tex, displayMode) =>
	katex.renderToString(tex, { displayMode, throwOnError: false, output: 'htmlAndMathml' });

/**
 * Prices are not math: "$5 이고 $10" would otherwise become a formula.
 * As in Pandoc, a single-$ pair is math only when no space sits just inside either $
 * and the closing $ is not followed by a digit. `\$` always gives a plain dollar sign.
 */
function isPrice(node, source) {
	const start = node.position?.start?.offset;
	const end = node.position?.end?.offset;
	if (start == null || end == null) return false;
	if (source.startsWith('$$', start)) return false;
	// the parser trims the value, so look at the text itself: `$ x$`, `$x $`, `$x$5`
	return /\s/.test(source[start + 1] ?? '') || /\s/.test(source[end - 2] ?? '') || /\d/.test(source[end] ?? '');
}

export const katexPlugin = {
	name: 'katex',
	options: { position: true },
	math(node, ctx) {
		ctx.replaceNode(node, { type: 'html', value: render(node.value, true) });
	},
	inlineMath(node, ctx) {
		if (isPrice(node, ctx.source)) {
			const { start, end } = node.position;
			ctx.replaceNode(node, { type: 'text', value: ctx.source.slice(start.offset, end.offset) });
			return;
		}
		ctx.replaceNode(node, { type: 'html', value: render(node.value, false) });
	},
};
