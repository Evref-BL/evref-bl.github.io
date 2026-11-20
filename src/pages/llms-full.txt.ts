import type { APIContext } from 'astro';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { postMarkdown } from '../lib/markdown';
import { getPosts } from '../lib/posts';

/** Every post, newest first, in one Markdown file for agents. */
export async function GET({ site }: APIContext) {
	const posts = await Promise.all((await getPosts()).map((post) => postMarkdown(post, site!)));
	const text = [`# ${SITE_TITLE}\n\n> ${SITE_DESCRIPTION}\n`, ...posts].join('\n---\n\n');
	return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
