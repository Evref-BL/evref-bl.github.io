import { defineMdastPlugin } from 'satteri';

const escape = (text: string) =>
	text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Turns ```mermaid code blocks into `<pre class="mermaid">`, which the browser draws,
 * before the code highlighter sees them.
 */
export default defineMdastPlugin({
	name: 'mermaid',
	code(node) {
		if (node.lang !== 'mermaid') return;
		return { type: 'html', value: `<pre class="mermaid">${escape(node.value)}</pre>` };
	},
});
