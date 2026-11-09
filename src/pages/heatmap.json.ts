// The days posts were written, for the writing heatmap on the home page (src/components/Heatmap.astro):
// { "2026-11-06": ["title", …], … }. The page fetches it once and paints the grid from it.
import { dayKey, getPosts } from '../lib/posts';

export async function GET() {
	const days: Record<string, string[]> = {};
	for (const post of await getPosts()) (days[dayKey(post.data.date)] ??= []).push(post.data.title);
	return new Response(JSON.stringify(days), { headers: { 'Content-Type': 'application/json' } });
}
