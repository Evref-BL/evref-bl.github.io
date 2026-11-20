// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import expressiveCode from 'astro-expressive-code';
import { satteri } from '@astrojs/markdown-satteri';
import { defineConfig, fontProviders } from 'astro/config';
import mermaid from './src/lib/mermaid-plugin.ts';

export default defineConfig({
	site: 'https://evref-bl.github.io',
	trailingSlash: 'ignore',
	markdown: {
		processor: satteri({ mdastPlugins: [mermaid] }),
	},
	vite: {
		// Mermaid is the one large chunk, and only pages with a diagram load it.
		build: { chunkSizeWarningLimit: 1500 },
	},
	integrations: [
		// Before mdx, so MDX posts get the same code blocks.
		expressiveCode({
			themes: ['github-light', 'github-dark'],
			themeCssSelector: (theme) => `[data-theme='${theme.type}']`,
			useDarkModeMediaQuery: false,
			shiki: { langAlias: { st: 'smalltalk', ston: 'smalltalk' } },
			styleOverrides: { borderRadius: '8px', codeFontSize: '0.875rem' },
		}),
		mdx(),
		sitemap(),
	],
	fonts: [
		{
			provider: fontProviders.local(),
			name: 'Atkinson',
			cssVariable: '--font-atkinson',
			fallbacks: ['sans-serif'],
			options: {
				variants: [
					{
						src: ['./src/assets/fonts/atkinson-regular.woff'],
						weight: 400,
						style: 'normal',
						display: 'swap',
					},
					{
						src: ['./src/assets/fonts/atkinson-bold.woff'],
						weight: 700,
						style: 'normal',
						display: 'swap',
					},
				],
			},
		},
	],
});
