import { defineMdastPlugin } from 'satteri';

const escape = (text: string) =>
	text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Turns ```mermaid code blocks into `<pre class="mermaid">`, which the browser draws,
 * before the code highlighter sees them. Search leaves their source out of its index.
 */
export default defineMdastPlugin({
	name: 'mermaid',
	code(node) {
		if (node.lang !== 'mermaid') return;
		return { type: 'html', value: `<pre class="mermaid" data-pagefind-ignore>${escape(node.value)}</pre>` };
	},
});
