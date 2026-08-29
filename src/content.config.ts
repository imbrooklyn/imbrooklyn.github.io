import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import {
  assertBlogContentStructure,
  BLOG_DRAFTS_URL,
  BLOG_POSTS_URL,
} from "./config/blog-content";
import { createBlogPostSchema } from "./content/schema";

assertBlogContentStructure();

const posts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: BLOG_POSTS_URL }),
  schema: ({ image }) => createBlogPostSchema(image()),
});

const drafts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: BLOG_DRAFTS_URL }),
  schema: ({ image }) => createBlogPostSchema(image()),
});

export const collections = { drafts, posts };
