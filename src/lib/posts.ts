import { execFileSync } from 'node:child_process';
import { getCollection, type CollectionEntry } from 'astro:content';
import { CATEGORIES } from '../consts';

type Entry = CollectionEntry<'posts'>;

/** A post whose title, date and category are always filled in. */
export type Post = Omit<Entry, 'data'> & {
	data: Required<Omit<Entry['data'], 'title' | 'date' | 'category'>> & {
		title: string;
		date: Date;
		category: string;
		slug: string;
		/** The body's leading `# heading` is the title, so the post page hides that heading. */
		titleFromBody: boolean;
	};
};

/** `# 제목` on the first line of the body. */
export const leadingTitle = (body: string) => body.trimStart().match(/^#[ \t]+([^\n]+?)[ \t#]*(?:\n|$)/)?.[1];

/**
 * Date of the first commit of this file, following renames, i.e. when it was published.
 * Later moves between folders or renames keep that date.
 * Needs full history in CI (`fetch-depth: 0`).
 */
const publishedAtCache = new Map<string, Date | undefined>();
function publishedAt(filePath: string) {
	if (publishedAtCache.has(filePath)) return publishedAtCache.get(filePath);
	const log = execFileSync('git', ['log', '--follow', '--format=%aI', '--', filePath], {
		encoding: 'utf8',
	}).trim();
	// newest first, so the last line is the first commit
	const first = log.split('\n').at(-1);
	const date = first ? new Date(first) : undefined;
	publishedAtCache.set(filePath, date);
	return date;
}

/**
 * Front matter is optional. Missing values come from the file itself:
 * - category: folder name (`posts/OS/...`)
 * - date: filename prefix (`2026-09-25-...`), else when it was first committed,
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
	const category = entry.data.category ?? (folder && (CATEGORIES[folder] ?? folder));
	if (!category) throw new Error(`${entry.filePath}: 카테고리 폴더 안에 넣거나 category를 적어주세요`);

	// `||`, not `??`: the web editor can leave an empty title.
	const heading = leadingTitle(entry.body ?? '');
	const title = entry.data.title || heading || rest!.trim();
	// Hide the leading heading when it is the title, so the title isn't shown twice.
	const titleFromBody = heading !== undefined && heading.trim() === title.trim();
	return {
		...entry,
		data: { ...entry.data, title, date, category, slug, titleFromBody },
	};
}

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Prefix a site-relative path with the configured base (`/blog`). */
export const url = (path: string) => `${base}${path}`;

/** URL keys for category and tag pages. */
export const categoryKey = (category: string) => category.toLowerCase().replace(/[\s/]+/g, '-');
export const tagKey = (tag: string) => tag.toLowerCase().replace(/\s+/g, '-');

/** Posts live at /blog/<slug>/, independent of their folder, so regrouping never breaks links. */
export const postUrl = (post: Post) => url(`/${post.data.slug}/`);

/** Top-level paths used by other pages; a post with one of these slugs would be shadowed. */
export const RESERVED_SLUGS = [
	'posts',
	'categories',
	'tags',
	'search',
	'privacy',
	'admin',
	'404',
	'rss.xml',
	'pagefind',
	'_astro',
];

/** The start of the body as plain text, for previews. */
export function excerpt(post: Post, length = 120) {
	let text = post.body ?? '';
	if (post.data.titleFromBody) text = text.trimStart().replace(/^#[^\n]*\n?/, '');
	text = text
		.replace(/```[\s\S]*?```/g, ' ') // code blocks
		.replace(/<[^>]+>/g, ' ') // html
		.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // images
		.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links keep their text
		.replace(/^\s{0,3}(?:#{1,6}|>|[-*+]|\d+\.)\s+/gm, '') // headings, quotes, list markers
		.replace(/[-=]{3,}/g, ' ') // rules, table separators
		.replace(/[`*_~|]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
	return text.length > length ? `${text.slice(0, length).trimEnd()}…` : text;
}

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

/** Every category in CATEGORIES order (empty ones included), then any others by post count. */
export function groupByCategory(posts: Post[]) {
	const groups = new Map(groupBy(posts, (p) => [p.data.category], categoryKey));
	const listed = Object.values(CATEGORIES).map(
		(label) => [categoryKey(label), groups.get(categoryKey(label)) ?? { label, posts: [] }] as const,
	);
	const listedKeys = new Set(listed.map(([key]) => key));
	return [...listed, ...[...groups].filter(([key]) => !listedKeys.has(key))];
}
export const groupByTag = (posts: Post[]) => groupBy(posts, (p) => p.data.tags, tagKey);

export const formatDate = (date: Date) =>
	date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Seoul' });
