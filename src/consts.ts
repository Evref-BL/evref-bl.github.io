export const SITE_TITLE = 'Evref-BL';
export const SITE_DESCRIPTION = 'Guides, experiments and projects from the Evref-BL project.';
export const GITHUB_URL = 'https://github.com/Evref-BL';
export const REPOSITORY_URL = 'https://github.com/Evref-BL/evref-bl.github.io';

/** What a post is. The key is what a post's `kind` names; `path` is its list page. */
export const KINDS = {
	guide: { label: 'Guide', plural: 'Guides', path: 'guides' },
	experiment: { label: 'Experiment', plural: 'Experiments', path: 'experiments' },
	project: { label: 'Project', plural: 'Projects', path: 'projects' },
	news: { label: 'News', plural: 'News', path: 'news' },
} as const;

export type Kind = keyof typeof KINDS;
export const KIND_NAMES = Object.keys(KINDS) as [Kind, ...Kind[]];
