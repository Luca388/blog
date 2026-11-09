// LaTeX math in posts: $inline$ and $$block$$, turned into HTML with KaTeX at build time.
// Sätteri (Astro's Markdown processor) parses the math; this plugin renders it.
// Post pages with math load the KaTeX styles (src/pages/[slug].astro).
import katex from 'katex';

const render = (tex, displayMode) =>
	katex.renderToString(tex, { displayMode, throwOnError: false, output: 'htmlAndMathml' });

export const katexPlugin = {
	name: 'katex',
	math(node, ctx) {
		ctx.replaceNode(node, { type: 'html', value: render(node.value, true) });
	},
	inlineMath(node, ctx) {
		ctx.replaceNode(node, { type: 'html', value: render(node.value, false) });
	},
};
