// Delete images in posts/images/ that no post references anymore (e.g. after deleting a post).
// An image counts as used if its file name appears anywhere in any post, as-is or URL-encoded.
// Usage: node scripts/clean-images.mjs [--dry-run]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const postsDir = path.join(root, 'posts');
const imagesDir = path.join(postsDir, 'images');
const dryRun = process.argv.includes('--dry-run');

// macOS may store Korean file names decomposed (NFD), so compare everything as NFC.
const nfc = (s) => s.normalize('NFC');
// Decode each run of %XX on its own, so one stray % doesn't stop the rest from decoding.
const decode = (s) =>
	s.replace(/(?:%[0-9A-Fa-f]{2})+/g, (m) => {
		try {
			return decodeURIComponent(m);
		} catch {
			return m;
		}
	});

const posts = fs
	.readdirSync(postsDir, { recursive: true })
	.filter((f) => f.endsWith('.md'))
	.map((f) => fs.readFileSync(path.join(postsDir, f), 'utf8'));
const text = nfc(posts.join('\n'));
const decodedText = nfc(decode(posts.join('\n')));

const images = fs.existsSync(imagesDir)
	? fs.readdirSync(imagesDir).filter((f) => !f.startsWith('.'))
	: [];
const unused = images.filter((f) => !text.includes(nfc(f)) && !decodedText.includes(nfc(f)));

for (const f of unused) {
	if (!dryRun) fs.rmSync(path.join(imagesDir, f));
	console.log(`${dryRun ? '안 쓰는 이미지' : '삭제'}: posts/images/${f}`);
}
