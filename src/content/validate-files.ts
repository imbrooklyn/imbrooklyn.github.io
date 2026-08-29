import { readdir, readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import matter from "gray-matter";
import { parse as parseYaml } from "yaml";
import {
  assertBlogContentStructure,
  BLOG_DRAFTS_DIR,
  BLOG_POSTS_DIR,
  formatContentPath,
} from "../config/blog-content";
import { findArticleContentErrors } from "./assets";
import { blogPostSchema, type BlogPostFrontmatter } from "./schema";
import { findDuplicateSlugErrors } from "./slug-validation";

export interface ValidatedMarkdownMetadata {
  filePath: string;
  metadata: BlogPostFrontmatter;
  source: "drafts" | "posts";
}

async function listMarkdownFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries.sort((left, right) =>
    left.name.localeCompare(right.name),
  )) {
    const pathname = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listMarkdownFiles(pathname)));
    } else if (entry.isFile() && extname(entry.name).toLowerCase() === ".md") {
      files.push(pathname);
    }
  }

  return files;
}

function issuePath(path: PropertyKey[]): string {
  return path.length > 0 ? path.map(String).join(".") : "frontmatter";
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function parseYamlFrontmatter(source: string): object {
  const parsed: unknown = parseYaml(source);

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("Frontmatter must be a YAML mapping.");
  }

  return parsed;
}

export async function validateAllMarkdownMetadata(): Promise<
  ValidatedMarkdownMetadata[]
> {
  assertBlogContentStructure();

  const candidates = [
    ...(await listMarkdownFiles(BLOG_POSTS_DIR)).map((filePath) => ({
      filePath,
      source: "posts" as const,
    })),
    ...(await listMarkdownFiles(BLOG_DRAFTS_DIR)).map((filePath) => ({
      filePath,
      source: "drafts" as const,
    })),
  ].sort((left, right) => left.filePath.localeCompare(right.filePath));

  const errors: string[] = [];
  const validated: ValidatedMarkdownMetadata[] = [];

  for (const candidate of candidates) {
    const displayPath = formatContentPath(candidate.filePath);
    let body = "";
    let frontmatter: unknown;

    try {
      const source = await readFile(candidate.filePath, "utf8");
      const parsed = matter(source, {
        engines: { yaml: parseYamlFrontmatter },
      });
      body = parsed.content;
      frontmatter = parsed.data;
    } catch (error) {
      errors.push(`${displayPath}: frontmatter: ${errorMessage(error)}`);
      continue;
    }

    const result = blogPostSchema.safeParse(frontmatter);

    if (!result.success) {
      for (const issue of result.error.issues) {
        errors.push(`${displayPath}: ${issuePath(issue.path)}: ${issue.message}`);
      }
      continue;
    }

    errors.push(
      ...(await findArticleContentErrors({
        body,
        cover: result.data.cover,
        filePath: candidate.filePath,
        slug: result.data.slug,
      })),
    );

    validated.push({
      filePath: candidate.filePath,
      metadata: result.data,
      source: candidate.source,
    });
  }

  errors.push(
    ...findDuplicateSlugErrors(
      validated.map((entry) => ({
        slug: entry.metadata.slug,
        source: formatContentPath(entry.filePath),
      })),
    ),
  );

  if (errors.length > 0) {
    throw new Error(`Content validation failed:\n- ${errors.join("\n- ")}`);
  }

  return validated;
}
