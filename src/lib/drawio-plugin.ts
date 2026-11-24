import { readFileSync } from 'node:fs';
import { defineMdastPlugin } from 'satteri';

// The light theme's colours, as draw.io writes them, and the variable each one follows on the page.
const themed: [RegExp, string][] = [
	[/#5c6370|rgb\(92, 99, 112\)/gi, 'var(--muted)'],
	[/#1d2026|rgb\(29, 32, 38\)/gi, 'var(--text)'],
	[/#ffffff|rgb\(255, 255, 255\)/gi, 'var(--surface)'],
];

const escape = (text: string) =>
	text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Draws an image whose file ends in `.drawio.svg` inside the page, rather than as an `<img>`,
 * so that its lines and labels follow the theme.
 */
export default defineMdastPlugin({
	name: 'drawio',
	paragraph(node, { fileURL }) {
		const [image] = node.children;
		if (node.children.length !== 1 || image.type !== 'image' || !image.url.endsWith('.drawio.svg')) return;
		if (!fileURL) throw new Error(`${image.url}: no document to find it from`);
		let svg = readFileSync(new URL(image.url, fileURL), 'utf8');
		// The prolog and the copy of the diagram that draw.io edits are of no use to the page.
		svg = svg.slice(svg.indexOf('<svg')).replace(/ content="[^"]*"/, '');
		for (const [color, variable] of themed) svg = svg.replace(color, variable);
		svg = svg.replace('<svg', `<svg role="img" aria-label="${escape(image.alt ?? '')}"`);
		return { type: 'html', value: `<figure class="diagram">${svg}</figure>` };
	},
});
