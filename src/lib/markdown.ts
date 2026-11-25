import { getEntries } from 'astro:content';
import { KINDS } from '../consts';
import { citeMarkdown } from './citations';
import { markdownUrl, postUrl, type Post } from './posts';

const day = (date: Date) => date.toISOString().slice(0, 10);

/**
 * A post as Markdown for agents: its title, what it is, then its source.
 * MDX imports are dropped, since they mean nothing outside the site; citations are numbered
 * and the references they name are listed at the end, as on the page.
 */
export async function postMarkdown(post: Post, site: URL): Promise<string> {
	const { title, description, date, updated, kind, tags } = post.data;
	const authors = (await getEntries(post.data.authors)).map((author) => author.data.name);
	const facts = [
		`${KINDS[kind].label} by ${authors.join(', ')}`,
		`published ${day(date)}`,
		updated && `updated ${day(updated)}`,
		tags.length > 0 && `tags: ${tags.join(', ')}`,
	].filter(Boolean);
	const body = citeMarkdown((post.body ?? '').replace(/^import\s.+$\n?/gm, '').trim(), post.filePath ?? post.id);
	return [
		`# ${title}`,
		`> ${description}`,
		`${facts.join(' · ')}\nWeb page: ${new URL(postUrl(post), site)}`,
		body,
	].join('\n\n') + '\n';
}

/** The line a list of posts gives each post for agents, in llms.txt form. */
export const postLink = (post: Post, site: URL) =>
	`- [${post.data.title}](${new URL(markdownUrl(post), site)}): ${post.data.description}`;
