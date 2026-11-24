import { type CollectionEntry, getCollection } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

/** Published posts, newest first. Drafts show only on the dev server. */
export async function getPosts(filter: (post: Post) => boolean = () => true): Promise<Post[]> {
	const posts = await getCollection(
		'posts',
		(post) => (import.meta.env.DEV || !post.data.draft) && filter(post),
	);
	return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export const postUrl = (post: Post) => `/posts/${post.id}/`;

/** Each tag with the number of posts that carry it, most used first. */
export function countTags(posts: Post[]): [string, number][] {
	const counts = new Map<string, number>();
	for (const post of posts) {
		for (const tag of post.data.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
	}
	return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

export const markdownUrl = (post: Post) => `/posts/${post.id}.md`;

/**
 * Minutes to read a post, at 200 words a minute. Diagrams and the targets of links and images
 * are left out: a reader looks at a diagram, and reads a link's text.
 */
export function readingMinutes(post: Post): number {
	const text = (post.body ?? '')
		.replace(/```mermaid[\s\S]*?```/g, '')
		.replace(/!\[[^\]]*\]\([^)]*\)/g, '')
		.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
	const words = text.match(/[\p{L}\p{N}]+/gu)?.length ?? 0;
	return Math.max(1, Math.round(words / 200));
}
