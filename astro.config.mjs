// @ts-check
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import { katexPlugin } from './src/lib/katex.mjs';

// https://astro.build/config
export default defineConfig({
	site: 'https://luca388.github.io',
	base: '/blog',
	trailingSlash: 'always',
	integrations: [sitemap()],
	// No Astro toolbar at the bottom of pages on the local dev server.
	devToolbar: { enabled: false },
	markdown: {
		// LaTeX math: $inline$ and $$block$$, rendered to HTML at build time (see src/lib/katex.mjs).
		processor: satteri({ features: { math: true }, mdastPlugins: [katexPlugin] }),
		shikiConfig: {
			themes: { light: 'github-light', dark: 'github-dark' },
		},
	},
});
