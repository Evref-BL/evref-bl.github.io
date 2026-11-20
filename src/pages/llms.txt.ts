import type { APIContext } from 'astro';
import { KIND_NAMES, KINDS, SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { postLink } from '../lib/markdown';
import { getPosts } from '../lib/posts';

/** The site's index for agents, after https://llmstxt.org. */
export async function GET({ site }: APIContext) {
	const posts = await getPosts();
	const sections = KIND_NAMES.map((kind) => {
		const ofKind = posts.filter((post) => post.data.kind === kind);
		return ofKind.length === 0
			? ''
			: `## ${KINDS[kind].plural}\n\n${ofKind.map((post) => postLink(post, site!)).join('\n')}`;
	}).filter(Boolean);
	const text = [
		`# ${SITE_TITLE}`,
		`> ${SITE_DESCRIPTION}`,
		[
			'Every post is also served as Markdown: add `.md` to its path, as the links below do.',
			`All posts in one file: ${new URL('llms-full.txt', site)}`,
		].join('\n'),
		...sections,
	].join('\n\n');
	return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
