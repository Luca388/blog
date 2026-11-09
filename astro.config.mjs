// @ts-check
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import { katexPlugin } from './src/lib/katex.mjs';
import { withMarkdownFixes } from './src/lib/markdown-fixes.mjs';

// https://astro.build/config
export default defineConfig({
	site: 'https://luca388.github.io',
	base: '/blog',
	trailingSlash: 'always',
	integrations: [sitemap()],
	// No Astro toolbar at the bottom of pages on the local dev server.
	devToolbar: { enabled: false },
	// The GitHub profile picture is downloaded at build time (src/components/Avatar.astro);
	// github.com/<user>.png redirects to avatars.githubusercontent.com. Only those addresses:
	// other github.com images in posts stay as they are.
	image: {
		remotePatterns: [
			{ protocol: 'https', hostname: 'github.com', pathname: '/Luca388.png' },
			{ protocol: 'https', hostname: 'avatars.githubusercontent.com', pathname: '/u/**' },
		],
	},
	markdown: {
		// LaTeX math: $inline$ and $$block$$ (or \( \) and \[ \]), rendered to HTML at build time
		// (src/lib/katex.mjs). Each post is first passed through src/lib/markdown-fixes.mjs.
		processor: withMarkdownFixes(satteri({ features: { math: true }, mdastPlugins: [katexPlugin] })),
		shikiConfig: {
			themes: { light: 'github-light', dark: 'github-dark' },
		},
	},
});
