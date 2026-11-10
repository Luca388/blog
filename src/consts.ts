export const SITE_TITLE = "Luca's development diary";
export const SITE_DESCRIPTION = '개발과 보안을 공부하며 배운 것들을 차곡차곡 정리하는 기록';
export const GITHUB_URL = 'https://github.com/Luca388';
/** Name on the home page profile; the photo is the GitHub profile picture (src/assets/avatar.jpg). */
export const AUTHOR = 'Luca';

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
	AI: 'AI',
};

/** The two groups categories are shown in, on the home and category pages. */
export const CATEGORY_GROUPS = [
	{
		key: 'activity',
		label: 'Activity',
		description: '직접 만들고, 풀고, 찾고, 읽은 것들의 기록',
	},
	{
		key: 'study',
		label: 'Study Notes',
		description: '수업과 독학으로 쌓아 온 기초 개념 정리',
	},
] as const;

export type CategoryGroup = (typeof CATEGORY_GROUPS)[number]['key'];

export interface CategoryInfo {
	group: CategoryGroup;
	/** Name of an icon in src/components/Icon.astro. */
	icon: string;
	description: string;
	/** Shown on the category page while it has no posts yet. */
	plans?: string[];
}

/** Per category (by display name): group, icon and description. A category missing here goes under Study Notes. */
export const CATEGORY_INFO: Record<string, CategoryInfo> = {
	개발: {
		group: 'activity',
		icon: 'code',
		description: '직접 만든 프로젝트와 도구의 제작기',
		plans: ['이 블로그 제작기 (Astro + GitHub Pages)', '보안 도구 · 자동화 스크립트 개발기', '프로젝트 회고'],
	},
	'CTF/Wargame': {
		group: 'activity',
		icon: 'flag',
		description: 'CTF 대회와 워게임 문제 풀이 write-up',
		plans: ['워게임 (Dreamhack 등) 문제 풀이', 'CTF 대회 참가 후기와 write-up', '분야별 (pwn · rev · web) 풀이 노트'],
	},
	'Bug Bounty': {
		group: 'activity',
		icon: 'bug',
		description: '취약점 탐색과 제보 경험, 공개된 리포트 정리',
		plans: ['버그바운티 플랫폼과 참여 절차 정리', '공개 허가된 취약점 리포트', '공개된 CVE · 리포트 분석'],
	},
	'블로그/기술문서': {
		group: 'activity',
		icon: 'doc',
		description: '기술 개념과 도구 사용법을 문서처럼 정리',
		plans: ['공식 문서 읽고 정리하기', '개발 · 보안 도구 사용법'],
	},
	'논문/컨퍼런스': {
		group: 'activity',
		icon: 'book',
		description: '보안 논문과 컨퍼런스 발표를 읽고 요약',
		plans: ['보안 학회 (USENIX Security, CCS 등) 논문 요약', '컨퍼런스 발표 정리와 참관 후기'],
	},
	'공모전/자격증': {
		group: 'activity',
		icon: 'award',
		description: '공모전 참가와 자격증 준비 과정, 결과',
		plans: ['자격증 준비 로드맵과 합격 후기', '공모전 · 해커톤 참가 후기'],
	},
	CS: { group: 'study', icon: 'cpu', description: '운영체제, 컴퓨터 구조, 네트워크' },
	Security: { group: 'study', icon: 'shield', description: '리버싱, 윈도우 내부 구조, 시스템 해킹, 암호' },
	DB: { group: 'study', icon: 'database', description: '데이터 모델링과 SQL' },
	Language: { group: 'study', icon: 'terminal', description: 'C, 어셈블리, 개발 환경' },
	Algorithm: { group: 'study', icon: 'tree', description: '자료구조와 알고리즘 문제 풀이' },
	Math: { group: 'study', icon: 'sigma', description: '대수, 정수론 등 수학 정리' },
	AI: {
		group: 'study',
		icon: 'sparkles',
		description: '머신러닝, 딥러닝, LLM 공부 정리',
		plans: ['머신러닝 · 딥러닝 기초 개념', 'LLM 동작 원리와 활용', 'AI 보안 (프롬프트 인젝션 등)'],
	},
};

/** Google AdSense publisher ID (`ca-pub-...`). Ads and the account meta tag are only added when set. */
export const ADSENSE_CLIENT = 'ca-pub-4797272423669740';
