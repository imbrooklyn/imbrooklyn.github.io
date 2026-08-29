# ImBrooklyn Website

This is a static Astro site built with TypeScript and pnpm.

## Local development

The sibling `../blog` repository is the default source for article Markdown and original article assets.

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

Article images live in `../blog/assets/<slug>/` and are referenced with relative paths from Markdown. Astro imports them directly from the sibling repository and emits content-hashed files in the ignored build output. There is no generated article source directory and no manual asset sync step.

## Publishing metadata

The production site URL is configured once in `src/config/site.ts`. Static builds use it for canonical and social metadata, the summary feed at `/rss.xml`, the generated sitemap, and `/robots.txt`.

## Deployment

GitHub Pages is deployed by `.github/workflows/deploy.yml`. The workflow checks out this repository and the public `imbrooklyn/blog` repository side by side, preserving the same `../blog` content path used for local development. It validates content, runs project checks, builds the static site, and deploys the Pages artifact.

The workflow runs in these cases:

- A push to the website repository's `main` branch deploys immediately.
- A manual `workflow_dispatch` run deploys immediately.
- A daily scheduled run picks up the latest blog repository content as an eventual fallback.

A push to the blog repository does not directly trigger this workflow. Run the website deployment workflow manually for an immediate blog refresh, or wait for the next scheduled build. A future immediate cross-repository trigger would require an authenticated repository dispatch or GitHub App.

No custom deployment secret is required while both repositories remain public. A private blog repository would require a separate, least-privilege authentication mechanism.

For initial activation, open the website repository's **Settings → Pages**, then select **GitHub Actions** as the build and deployment source.
