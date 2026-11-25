// Citations. A post cites a work of src/content/references.bib by its key, in
// brackets: [@key], with a locator after a comma, [@key, §15.12], and several
// works separated by semicolons, [@one; @two]. Works are numbered in the order
// the post first cites them and listed under "References" at its end, in IEEE
// style (src/lib/csl/ieee.csl, from the Citation Style Language project).

import fs from 'node:fs';
import path from 'node:path';
import { Cite, plugins } from '@citation-js/core';
import '@citation-js/plugin-bibtex';
import '@citation-js/plugin-csl';

// From the project's root: this module is also bundled into the build, away from its own directory.
const BIBLIOGRAPHY = path.join(process.cwd(), 'src/content/references.bib');
const STYLE = 'ieee';

plugins.config.get('@csl').styles.add(STYLE, fs.readFileSync(path.join(process.cwd(), 'src/lib/csl/ieee.csl'), 'utf8'));

/** A citation group in brackets: one or more `@key`, each with an optional locator after a comma. */
const GROUP = /\[(\s*@[\w:.+/-]*\w(?:,[^;\]]*)?(?:;\s*@[\w:.+/-]*\w(?:,[^;\]]*)?)*)\]/g;

export interface Cited {
	key: string;
	locator?: string;
}

export interface Part {
	text?: string;
	cites?: Cited[];
}

/** Text split into plain runs and citation groups, in order. */
export function split(text: string): Part[] {
	const parts: Part[] = [];
	let last = 0;
	for (const match of text.matchAll(GROUP)) {
		if (match.index > last) parts.push({ text: text.slice(last, match.index) });
		const cites = match[1].split(';').map((one) => {
			const [key, ...locator] = one.trim().slice(1).split(',');
			return { key: key.trim(), locator: locator.join(',').trim() || undefined };
		});
		parts.push({ cites });
		last = match.index + match[0].length;
	}
	if (last < text.length) parts.push({ text: text.slice(last) });
	return parts;
}

let library: { modified: number; cite: Cite; keys: Set<string> } | undefined;

/** The bibliography, read again whenever its file changes. */
function bibliography() {
	const modified = fs.statSync(BIBLIOGRAPHY).mtimeMs;
	if (library?.modified !== modified) {
		const cite = new Cite(fs.readFileSync(BIBLIOGRAPHY, 'utf8'));
		library = { modified, cite, keys: new Set(cite.data.map((entry) => String(entry.id))) };
	}
	return library;
}

/** Fails on a key the bibliography lacks, naming the document. */
export function check(key: string, where: string): void {
	if (!bibliography().keys.has(key)) {
		throw new Error(`${where}: [@${key}] is not in src/content/references.bib`);
	}
}

/** The numbers a document's citations take: the order it first cites each work. */
export class Numbering {
	readonly order: string[] = [];
	number(key: string): number {
		let index = this.order.indexOf(key);
		if (index === -1) index = this.order.push(key) - 1;
		return index + 1;
	}
}

const reference = (keys: string[], format: 'html' | 'text'): string =>
	bibliography().cite.format('bibliography', { format, template: STYLE, lang: 'en-US', entry: keys, hyperlinks: true });

/** One work's reference, as plain text without its number: a citation's tooltip. */
export const referenceText = (key: string) => reference([key], 'text').replace(/^\[\d+\]\s*/, '').trim();

export const anchor = (key: string) => `ref-${key.replace(/[^\w-]/g, '-')}`;

/** The references a document cites, in the order of their numbers, as an HTML list. */
export function referencesHtml(keys: string[]): string {
	const entries = keys.map((key) => {
		const body = reference([key], 'html').match(/<div class="csl-right-inline">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*$/)?.[1];
		return `<li id="${anchor(key)}">${body ?? ''}</li>`;
	});
	return `<ol class="references">${entries.join('')}</ol>`;
}

/** The references a document cites, as Markdown lines numbered like its citations. */
export function referencesMarkdown(keys: string[]): string {
	return keys.map((key, index) => `${index + 1}. ${referenceText(key)}`).join('\n');
}

export interface Label {
	number: number;
	key: string;
	locator?: string;
}

/** A citation group's numbers, each work numbered on its first citation. */
export function label(cites: Cited[], numbering: Numbering): Label[] {
	return cites.map(({ key, locator }) => ({ number: numbering.number(key), key, locator }));
}

/** A citation group as the reader sees it, inside its brackets: 1; 1, §2; 1, 3; 1, §2; 3. */
export function groupText(labels: Label[], each: (label: Label) => string = (l) => String(l.number)): string {
	const located = labels.some((l) => l.locator);
	return labels.map((l) => (l.locator ? `${each(l)}, ${l.locator}` : each(l))).join(located ? '; ' : ', ');
}

/** A document's Markdown with its citations numbered and its references appended, for agents. */
export function citeMarkdown(markdown: string, where: string): string {
	const numbering = new Numbering();
	// Code, fenced or inline, is left as it is: it may show the syntax itself.
	const body = markdown.replace(/(```[\s\S]*?```|`[^`\n]*`)|([^`]+)/g, (whole, code: string | undefined) => {
		if (code) return code;
		return split(whole)
			.map((part) => {
				if (part.text !== undefined) return part.text;
				for (const { key } of part.cites!) check(key, where);
				return `[${groupText(label(part.cites!, numbering))}]`;
			})
			.join('');
	});
	if (numbering.order.length === 0) return markdown;
	return `${body.trimEnd()}\n\n## References\n\n${referencesMarkdown(numbering.order)}\n`;
}
