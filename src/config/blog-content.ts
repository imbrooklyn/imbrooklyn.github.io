import { existsSync, statSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const SITE_ROOT_DIR = fileURLToPath(new URL("../../", import.meta.url));

const configuredContentDir = process.env.BLOG_CONTENT_DIR?.trim();

export const BLOG_CONTENT_DIR = resolve(
  SITE_ROOT_DIR,
  configuredContentDir || "../blog",
);
export const BLOG_ASSETS_DIR = join(BLOG_CONTENT_DIR, "assets");
export const BLOG_POSTS_DIR = join(BLOG_CONTENT_DIR, "posts");
export const BLOG_DRAFTS_DIR = join(BLOG_CONTENT_DIR, "drafts");
export const BLOG_POSTS_URL = pathToFileURL(`${BLOG_POSTS_DIR}${sep}`);
export const BLOG_DRAFTS_URL = pathToFileURL(`${BLOG_DRAFTS_DIR}${sep}`);

function assertDirectory(
  pathname: string,
  label: string,
  guidance?: string,
): void {
  if (!existsSync(pathname) || !statSync(pathname).isDirectory()) {
    const nextStep = guidance ? ` ${guidance}` : "";
    throw new Error(`${label} not found: ${pathname}.${nextStep}`);
  }
}

export function assertBlogContentStructure(): void {
  assertDirectory(
    BLOG_CONTENT_DIR,
    "Blog content directory",
    "Keep the blog repository next to the website repository or set BLOG_CONTENT_DIR.",
  );
  assertDirectory(BLOG_ASSETS_DIR, "Blog assets directory");
  assertDirectory(BLOG_POSTS_DIR, "Blog posts directory");
  assertDirectory(BLOG_DRAFTS_DIR, "Blog drafts directory");
}

export function formatContentPath(pathname: string): string {
  return relative(SITE_ROOT_DIR, pathname).split(sep).join("/");
}
