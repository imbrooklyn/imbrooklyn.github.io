import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { siteConfig } from "../config/site";
import {
  getAbsoluteUrl,
  getPostPath,
  requireSiteUrl,
} from "../config/urls";
import { getPublishedPosts } from "../content/posts";

export const GET: APIRoute = async ({ site: configuredSite }) => {
  const site = requireSiteUrl(configuredSite);
  const posts = await getPublishedPosts();

  return rss({
    title: siteConfig.blog.title,
    description: siteConfig.blog.description,
    site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: getAbsoluteUrl(getPostPath(post.data.slug), site),
      categories: post.data.tags,
    })),
    customData: "<language>en-us</language>",
  });
};
