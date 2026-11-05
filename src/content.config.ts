import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Meta fields may be left blank (`platform:` → null) when filled from a template.
const text = z.string().nullish();
const day = z.coerce.date().nullish();

const posts = defineCollection({
	// Keep the path (<category>/<slug>) as the id so Korean slugs survive as-is.
	loader: glob({
		base: './posts',
		pattern: '**/*.md',
		generateId: ({ entry }) => entry.replace(/\.md$/, ''),
	}),
	// Everything is optional: title, date and category are inferred in src/lib/posts.ts.
	schema: z.object({
		title: z.string().optional(),
		date: z.coerce.date().optional(),
		category: z.string().optional(),
		tags: z.array(z.string()).default([]),
		draft: z.boolean().default(false),
		// Optional per-category details, shown in a box above the post (src/components/PostMeta.astro).
		ctf: z
			.object({
				platform: text, // Dreamhack, pwnable.kr, ...
				event: text, // CTF name, for contests
				field: text, // pwn, rev, web, crypto, forensics, misc
				difficulty: text,
				solved: day,
				link: text,
			})
			.nullish(),
		bugbounty: z
			.object({
				target: text,
				platform: text, // HackerOne, Bugcrowd, 직접 제보, ...
				type: text, // XSS, IDOR, ...
				severity: text, // Critical, High, Medium, Low, Info
				status: text, // 제보, 확인, 패치, 공개
				reported: day,
				link: text, // CVE, public report
			})
			.nullish(),
		paper: z
			.object({
				venue: text, // USENIX Security 2024, ...
				authors: text,
				kind: text, // 논문, 발표, 참관
				link: text,
			})
			.nullish(),
		achievement: z
			.object({
				kind: text, // 자격증, 공모전, 해커톤
				name: text,
				organizer: text,
				result: text, // 합격, 대상, 준비 중, ...
				date: day,
			})
			.nullish(),
		project: z
			.object({
				repo: text,
				demo: text,
				stack: z.array(z.string()).nullish(),
				period: text,
			})
			.nullish(),
	}),
});

export const collections = { posts };
