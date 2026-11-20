# evref-bl.github.io

The Evref-BL website, at <https://evref-bl.github.io>: guides, experiments, projects and news from the Evref-BL organization.

To write a post, read [How to write a post](src/content/posts/writing-a-post.md).

```sh
npm install
npm run dev      # http://localhost:4321, drafts included
npm run check    # type-checks the components and the posts' frontmatter
npm run build    # the site and its search index, in dist/
npm run preview  # serves dist/, where search works
```

A pull request builds the site. A push to `main` publishes it to GitHub Pages.

## Layout

- `src/content/posts/`: the posts, one Markdown or MDX file each. `src/content.config.ts` defines their frontmatter.
- `src/content/authors.yaml`, `src/content/series.yaml`: the authors and series that posts name.
- `src/consts.ts`: the site's name and the kinds of post.
- `src/pages/`: one file per kind of page. Every list of posts goes through `src/components/PostList.astro`.

## For agents

Every post is also served as Markdown at its path plus `.md`, `/llms.txt` lists them, and `/llms-full.txt` holds them all.
