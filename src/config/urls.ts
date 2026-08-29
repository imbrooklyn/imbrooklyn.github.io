export const RSS_PATH = "/rss.xml";
export const ROBOTS_PATH = "/robots.txt";
export const SITEMAP_INDEX_PATH = "/sitemap-index.xml";

export function requireSiteUrl(site: URL | undefined): URL {
  if (!site) {
    throw new Error(
      "The production site URL must be configured in siteConfig.url.",
    );
  }

  return site;
}

export function getAbsoluteUrl(path: string, site: URL): string {
  return new URL(path, site).href;
}

export function getPostPath(slug: string): string {
  return `/blog/${slug}/`;
}

export function isSitemapPage(page: string): boolean {
  const pathname = new URL(page).pathname;
  return pathname !== RSS_PATH && pathname !== ROBOTS_PATH;
}
