// The blog's Markdown fixes (src/lib/markdown-fixes.mjs) as a plain script for the web editor
// (public/admin/index.html), so its preview reads posts exactly the way the site does.
import { markdownFixes } from '../../lib/markdown-fixes.mjs';

export function GET() {
	return new Response(`window.markdownFixes = (${markdownFixes.toString()})();\n`, {
		headers: { 'Content-Type': 'text/javascript; charset=utf-8' },
	});
}
