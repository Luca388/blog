import { execFileSync } from 'node:child_process';
import { getCollection, type CollectionEntry } from 'astro:content';

type Entry = CollectionEntry<'posts'>;

/** A post whose title, date and category are always filled in. */
export type Post = Omit<Entry, 'data'> & {
	data: Required<Omit<Entry['data'], 'title' | 'date' | 'category'>> & {
		title: string;
		date: Date;
		category: string;
		slug: string;
		/** The title came from the body's leading `# heading`, so the post page hides that heading. */
		titleFromBody: boolean;
	};
};

/** `# 제목` on the first line of the body. */
export const leadingTitle = (body: string) => body.trimStart().match(/^#[ \t]+([^\n]+?)[ \t#]*(?:\n|$)/)?.[1];

/**
 * Date of the oldest commit in which this file (following renames) sat outside posts/drafts/,
 * i.e. when it was published. Later moves between folders or renames keep that date.
 * Needs full history in CI (`fetch-depth: 0`).
 */
const publishedAtCache = new Map<string, Date | undefined>();
function publishedAt(filePath: string) {
	if (publishedAtCache.has(filePath)) return publishedAtCache.get(filePath);
	const log = execFileSync(
		'git',
		['log', '--follow', '--name-status', '--format=%x00%aI', '--', filePath],
		{ encoding: 'utf8' },
	);
	let date: Date | undefined;
	// newest first: each chunk is "<date>\n\n<status>\t[old\t]<path>"
	for (const chunk of log.split('\0').slice(1)) {
		const [iso, ...rest] = chunk.trim().split('\n');
		const path = rest.filter(Boolean).at(-1)?.split('\t').at(-1) ?? '';
		if (!path.includes('posts/drafts/')) date = new Date(iso);
	}
	publishedAtCache.set(filePath, date);
	return date;
}

/**
 * Front matter is optional. Missing values come from the file itself:
 * - category: folder name (`posts/OS/...`)
 * - date: filename prefix (`2026-09-25-...`), else when it was first committed outside drafts/,
 *   else today for a post that isn't committed yet
 * - title: leading `# heading`, otherwise the filename
 */
function resolve(entry: Entry): Post {
	const parts = entry.id.split('/');
	const file = parts.at(-1)!;
	const folder = parts.length > 1 ? parts[0] : undefined;
	const [, fileDate, rest] = file.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/) ?? [, undefined, file];
	const slug = rest!.trim().replace(/\s+/g, '-');

	const date =
		entry.data.date ?? (fileDate ? new Date(fileDate) : (publishedAt(entry.filePath!) ?? new Date()));
	const category = entry.data.category ?? folder;
	if (!category) throw new Error(`${entry.filePath}: 카테고리 폴더 안에 넣거나 category를 적어주세요`);

	const heading = entry.data.title ? undefined : leadingTitle(entry.body ?? '');
	const title = entry.data.title ?? heading ?? rest!.trim();
	return {
		...entry,
		data: { ...entry.data, title, date, category, slug, titleFromBody: heading !== undefined },
	};
}

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Prefix a site-relative path with the configured base (`/blog`). */
export const url = (path: string) => `${base}${path}`;

/** URL keys for category and tag pages. */
export const categoryKey = (category: string) => category.toLowerCase();
export const tagKey = (tag: string) => tag.toLowerCase().replace(/\s+/g, '-');

/** Posts live at /blog/<slug>/, independent of their folder, so regrouping never breaks links. */
export const postUrl = (post: Post) => url(`/${post.data.slug}/`);

/** Top-level paths used by other pages; a post with one of these slugs would be shadowed. */
export const RESERVED_SLUGS = ['categories', 'tags', 'search', '404', 'rss.xml', 'pagefind', '_astro'];

/** Published posts, newest first. */
export async function getPosts() {
	const posts = (await getCollection('posts', ({ data }) => !data.draft)).map(resolve);
	return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** Group posts by a key, keeping the first-seen label for display. */
export function groupBy(
	posts: Post[],
	labelsOf: (post: Post) => string[],
	keyOf: (label: string) => string,
) {
	const groups = new Map<string, { label: string; posts: Post[] }>();
	for (const post of posts) {
		for (const label of labelsOf(post)) {
			const key = keyOf(label);
			if (!groups.has(key)) groups.set(key, { label, posts: [] });
			groups.get(key)!.posts.push(post);
		}
	}
	return [...groups.entries()].sort((a, b) => b[1].posts.length - a[1].posts.length);
}

export const groupByCategory = (posts: Post[]) =>
	groupBy(posts, (p) => [p.data.category], categoryKey);
export const groupByTag = (posts: Post[]) => groupBy(posts, (p) => p.data.tags, tagKey);

export const formatDate = (date: Date) =>
	date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Seoul' });
