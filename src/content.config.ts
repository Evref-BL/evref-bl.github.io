import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { KIND_NAMES } from './consts';

const slug = z
	.string()
	.regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'use lowercase words joined by hyphens, like "moose-rules"');

const posts = defineCollection({
	loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z
			.object({
				title: z.string().min(1),
				/** One or two sentences: lists show it under the title, search engines show it too. */
				description: z.string().min(1),
				date: z.coerce.date(),
				updated: z.coerce.date().optional(),
				kind: z.enum(KIND_NAMES),
				tags: z.array(slug).default([]),
				authors: z.array(reference('authors')).min(1),
				series: reference('series').optional(),
				part: z.number().int().positive().optional(),
				cover: image().optional(),
				coverAlt: z.string().optional(),
				draft: z.boolean().default(false),
			})
			.refine((post) => (post.series === undefined) === (post.part === undefined), {
				message: 'a post in a series gives its `part`, and only such a post does',
				path: ['part'],
			})
			.refine((post) => !post.cover || post.coverAlt, {
				message: 'a cover needs a `coverAlt` describing it',
				path: ['coverAlt'],
			}),
});

const authors = defineCollection({
	loader: file('./src/content/authors.yaml'),
	schema: z.object({
		name: z.string(),
		github: z.string().optional(),
		url: z.url().optional(),
	}),
});

const series = defineCollection({
	loader: file('./src/content/series.yaml'),
	schema: z.object({
		title: z.string(),
		description: z.string(),
	}),
});

export const collections = { posts, authors, series };
