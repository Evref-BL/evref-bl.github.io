import { fileURLToPath } from 'node:url';
import { defineMdastPlugin } from 'satteri';
import { Numbering, anchor, check, groupText, label, referenceText, referencesHtml, split } from './citations';

const escape = (text: string) =>
	text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Turns `[@key]` citations into numbers that link to the post's references, and lists those
 * references under a "References" heading at the end of the post. See citations.ts.
 */
export default defineMdastPlugin({
	name: 'citations',
	text(node, ctx) {
		if (!node.value.includes('[@')) return;
		const parts = split(node.value);
		if (parts.every((part) => part.text !== undefined)) return;
		const where = ctx.fileURL ? fileURLToPath(ctx.fileURL) : 'a document';
		const numbering = ((ctx.data.citations as Numbering | undefined) ??= new Numbering());
		ctx.replaceNode(
			node,
			parts.map((part) => {
				if (part.text !== undefined) return { type: 'text', value: part.text };
				for (const { key } of part.cites!) check(key, where);
				const links = groupText(
					label(part.cites!, numbering),
					({ number, key }) => `<a href="#${anchor(key)}" title="${escape(referenceText(key))}">${number}</a>`,
				);
				return { type: 'html', value: `<span class="citation">[${links}]</span>` };
			}),
		);
	},
	after(root, ctx) {
		const numbering = ctx.data.citations as Numbering | undefined;
		if (!numbering?.order.length) return;
		ctx.appendChild(root, {
			type: 'html',
			value: `<h2 id="references">References</h2>${referencesHtml(numbering.order)}`,
		});
	},
});
