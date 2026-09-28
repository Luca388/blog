import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
	// Keep the path (<category>/<slug>) as the id so Korean slugs survive as-is.
	// Anything under posts/drafts/ is a work in progress and never published.
	loader: glob({
		base: './posts',
		pattern: ['**/*.md', '!drafts/**'],
		generateId: ({ entry }) => entry.replace(/\.md$/, ''),
	}),
	// Everything is optional: title, date and category are inferred in src/lib/posts.ts.
	schema: z.object({
		title: z.string().optional(),
		date: z.coerce.date().optional(),
		category: z.string().optional(),
		tags: z.array(z.string()).default([]),
		draft: z.boolean().default(false),
	}),
});

export const collections = { posts };
