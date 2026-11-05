// @ts-check
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://luca388.github.io',
	base: '/blog',
	trailingSlash: 'always',
	integrations: [sitemap()],
	// No Astro toolbar at the bottom of pages on the local dev server.
	devToolbar: { enabled: false },
	markdown: {
		shikiConfig: {
			themes: { light: 'github-light', dark: 'github-dark' },
		},
	},
});
