# ImBrooklyn Website

This is a static Astro site built with TypeScript and pnpm.

## Local development

The sibling `../blog` repository is the default source for article Markdown and original article assets. The sibling `../understanding-llms` repository contains the independent Starlight source for the first web book.

```sh
pnpm install
pnpm dev
```

Use `BLOG_CONTENT_DIR` only when the blog repository is stored elsewhere. Relative overrides are resolved from this repository root.

```sh
BLOG_CONTENT_DIR=/absolute/path/to/blog pnpm dev
```

## Commands

- `pnpm dev` validates content, then starts Astro development mode.
- `pnpm build` validates content, then creates the static site.
- `pnpm check` validates content and runs Astro's TypeScript checks.
- `pnpm validate:content` validates Markdown frontmatter, heading structure, and local image references in `posts/` and `drafts/`.
- `pnpm compose:site` adds an already-built sibling Book site to the website `dist/` directory.

Article images live in `../blog/assets/<slug>/` and are referenced with relative paths from Markdown. Astro imports them directly from the sibling repository and emits content-hashed files in the ignored build output. There is no generated article source directory and no manual asset sync step.

## Publishing metadata

The production site URL is configured once in `src/config/site.ts`. Static builds use it for canonical and social metadata, the summary feed at `/rss.xml`, the generated sitemap, and `/robots.txt`.

## Deployment

GitHub Pages is deployed by `.github/workflows/deploy.yml`. The workflow checks out this repository and the public `imbrooklyn/blog` and `imbrooklyn/understanding-llms` repositories side by side. It validates and builds the main Astro site and Starlight book independently, composes their static output, and deploys one Pages artifact.

The workflow runs in these cases:

- A push to the website repository's `main` branch deploys immediately.
- A manual `workflow_dispatch` run deploys immediately.
- A daily scheduled run picks up the latest public content repositories as an eventual fallback.

A push to a content repository does not directly trigger this workflow. After updating the blog or book, run the website deployment workflow manually for an immediate refresh, or wait for the next scheduled build.

No custom deployment secret is required while all content repositories remain public. A private content repository would require a separate, least-privilege read credential.

For initial activation, open the website repository's **Settings → Pages**, then select **GitHub Actions** as the build and deployment source.
