---
title: How to write a post
description: Add a Markdown file, fill in its frontmatter, preview it locally and open a pull request.
date: 2026-11-20
kind: guide
tags: [site, writing]
authors: [gabriel-darbord]
---

A post is a Markdown file in [`src/content/posts/`](https://github.com/Evref-BL/evref-bl.github.io/tree/main/src/content/posts) of the site's repository. Its file name is its address: `moose-rules.md` is published at `/posts/moose-rules/`.

## The frontmatter

```yaml
---
title: Writing rules with the Moose Rule Engine
description: One or two sentences saying what the reader gets from this post.
date: 2026-11-20
kind: guide # guide, experiment, project or news
tags: [moose, rules] # lowercase, words joined by hyphens
authors: [gabriel-darbord] # keys from src/content/authors.yaml
---
```

Every list on the site shows the title and the description, so write the description for someone deciding whether to open the post.

The build checks the frontmatter, and fails on a missing description, an unknown author or kind, or a tag like `Moose Rules` instead of `moose-rules`.

Optional fields:

- `updated: 2026-12-01` when a guide changes in a way readers should know about.
- `draft: true` keeps a post off the published site; it still shows on your local server.
- `cover` and `coverAlt` give the post an image, from a file next to it.
- `series` and `part` put the post in a series, which links its parts in order. A series is declared once in `src/content/series.yaml`, with a title and a description.

A new author adds themselves to `src/content/authors.yaml`:

```yaml
jane-doe:
  name: Jane Doe
  github: jane-doe
```

## Code and diagrams

Code blocks are highlighted from their language, Smalltalk included:

```st
MRERule subclass: #MyRule
	instanceVariableNames: ''
	classVariableNames: ''
	package: 'My-Rules'
```

A `mermaid` code block is drawn as a diagram:

```mermaid
flowchart LR
  write[Write the post] --> preview[Preview it locally] --> pr[Open a pull request] --> merge[Merge: it is published]
```

A post that needs components or interactive parts can be an `.mdx` file instead.

## Preview and publish

```sh
npm install
npm run dev
```

The site is then at `http://localhost:4321`, and reloads as you edit. Open a pull request: its checks build the site, and merging it publishes the post.
