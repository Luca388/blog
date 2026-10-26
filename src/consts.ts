export const SITE_TITLE = "Luca's development diary";
export const SITE_DESCRIPTION = 'CS, 시스템 해킹, 리버싱을 공부하며 정리한 기록';
export const GITHUB_URL = 'https://github.com/Luca388';

/**
 * Categories in display order: folder under posts/ → name shown on the site.
 * They are listed even with no posts yet. A folder missing here still works, shown by its folder name.
 * Also add new ones to public/admin/config.yml so the web editor shows them.
 */
export const CATEGORIES: Record<string, string> = {
	개발: '개발',
	'CTF-Wargame': 'CTF/Wargame',
	BugBounty: 'Bug Bounty',
	'블로그-기술문서': '블로그/기술문서',
	'논문-컨퍼런스': '논문/컨퍼런스',
	'공모전-자격증': '공모전/자격증',
	CS: 'CS',
	Security: 'Security',
	DB: 'DB',
	Language: 'Language',
	Algorithm: 'Algorithm',
	Math: 'Math',
};

/** Google AdSense publisher ID (`ca-pub-...`). Ads and the account meta tag are only added when set. */
export const ADSENSE_CLIENT = 'ca-pub-4797272423669740';
