import type { APIRoute } from "astro";
import {
  getAbsoluteUrl,
  requireSiteUrl,
  SITEMAP_INDEX_PATH,
  UNDERSTANDING_LLMS_SITEMAP_PATH,
} from "../config/urls";

export const GET: APIRoute = ({ site: configuredSite }) => {
  const site = requireSiteUrl(configuredSite);
  const sitemapUrl = getAbsoluteUrl(SITEMAP_INDEX_PATH, site);
  const bookSitemapUrl = getAbsoluteUrl(
    UNDERSTANDING_LLMS_SITEMAP_PATH,
    site,
  );
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\nSitemap: ${bookSitemapUrl}\n`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
