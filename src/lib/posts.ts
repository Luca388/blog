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
 * Date of the commit that added this file at its current path. `--no-renames` makes a move
 * out of drafts/ count as the add, so the date is when the post was published.
 * Needs full history in CI (`fetch-depth: 0`).
 */
const addedAtCache = new Map<string, Date | undefined>();
function addedAt(filePath: string) {
	if (addedAtCache.has(filePath)) return addedAtCache.get(filePath);
	const out = execFileSync(
		'git',
		['log', '--no-renames', '--diff-filter=A', '--format=%aI', '--', filePath],
		{ encoding: 'utf8' },
	).trim();
	const first = out.split('\n').at(-1);
	const date = first ? new Date(first) : undefined;
	addedAtCache.set(filePath, date);
	return date;
}

/**
 * Front matter is optional. Missing values come from the file itself:
 * - category: folder name (`posts/OS/...`)
 * - date: filename prefix (`2026-09-25-...`), else the commit that first added the file at
 *   this path (i.e. when it left drafts/), else today for a post that isn't committed yet
 * - title: leading `# heading`, otherwise the filename
 */
function resolve(entry: Entry): Post {
	const parts = entry.id.split('/');
	const file = parts.at(-1)!;
	const folder = parts.length > 1 ? parts[0] : undefined;
	const [, fileDate, rest] = file.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/) ?? [, undefined, file];
	const slug = rest!.trim().replace(/\s+/g, '-');

	const date =
		entry.data.date ?? (fileDate ? new Date(fileDate) : (addedAt(entry.filePath!) ?? new Date()));
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

/** Lowercased category and tag keys match the old Jekyll URLs (/blog/:category/:title/). */
export const categoryKey = (category: string) => category.toLowerCase();
export const tagKey = (tag: string) => tag.toLowerCase().replace(/\s+/g, '-');

export const postUrl = (post: Post) =>
	url(`/${categoryKey(post.data.category)}/${post.data.slug}/`);

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
