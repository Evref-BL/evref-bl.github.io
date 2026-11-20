# Agent guidance

Read `README.md` first.

- A post's frontmatter is checked by `src/content.config.ts`; run `npm run check` after writing one.
- Every list of posts shows headlines only (title, date, kind, tags, description) through `PostList`. Only a post's own page shows its content.
- The Markdown served for agents is built in `src/lib/markdown.ts`. A change to what a post carries belongs there too.
- Astro's compiler drops the space between text and an element on the next line: keep `text <a>link</a>` on one line, or write `{' '}`.
- Run the dev server in the background with `astro dev --background`, and manage it with `astro dev stop`, `astro dev status` and `astro dev logs`.
