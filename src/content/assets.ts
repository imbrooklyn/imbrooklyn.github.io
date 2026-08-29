import type { Stats } from "node:fs";
import { lstat, realpath } from "node:fs/promises";
import { dirname, extname, isAbsolute, relative, resolve, sep } from "node:path";
import { fromMarkdown } from "mdast-util-from-markdown";
import { BLOG_ASSETS_DIR, formatContentPath } from "../config/blog-content";

const supportedImageExtensions = new Set([
  ".gif",
  ".jpeg",
  ".jpg",
  ".png",
  ".svg",
  ".webp",
]);

interface MarkdownNode {
  alt?: unknown;
  children?: readonly MarkdownNode[];
  depth?: unknown;
  identifier?: unknown;
  type: string;
  url?: unknown;
  value?: unknown;
}

interface MarkdownImageReference {
  alt: string;
  url: string;
}

interface SourceCover {
  alt: string;
  src: string;
}

interface ValidateArticleAssetsOptions {
  body: string;
  cover?: SourceCover | null;
  filePath: string;
  slug: string;
}

function normalizedIdentifier(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function visit(node: MarkdownNode, callback: (node: MarkdownNode) => void): void {
  callback(node);

  for (const child of node.children ?? []) {
    visit(child, callback);
  }
}

function parseMarkdownImages(body: string): {
  errors: string[];
  hasLevelOneHeading: boolean;
  images: MarkdownImageReference[];
} {
  const tree = fromMarkdown(body) as unknown as MarkdownNode;
  const definitions = new Map<string, string>();
  const errors: string[] = [];
  const images: MarkdownImageReference[] = [];
  let hasLevelOneHeading = false;

  visit(tree, (node) => {
    if (
      node.type === "definition" &&
      typeof node.identifier === "string" &&
      typeof node.url === "string"
    ) {
      definitions.set(normalizedIdentifier(node.identifier), node.url);
    }
  });

  visit(tree, (node) => {
    if (node.type === "heading" && node.depth === 1) {
      hasLevelOneHeading = true;
    }

    if (node.type === "html" && typeof node.value === "string") {
      if (/<h1\b/i.test(node.value)) {
        hasLevelOneHeading = true;
      }

      if (/<(?:img|picture|source)\b/i.test(node.value)) {
        errors.push(
          "Raw HTML image elements are not supported; use Markdown image syntax.",
        );
      }
    }

    if (node.type === "image" && typeof node.url === "string") {
      images.push({
        alt: typeof node.alt === "string" ? node.alt : "",
        url: node.url,
      });
    }

    if (node.type === "imageReference" && typeof node.identifier === "string") {
      const url = definitions.get(normalizedIdentifier(node.identifier));

      if (!url) {
        errors.push(`Image reference "${node.identifier}" has no definition.`);
        return;
      }

      images.push({
        alt: typeof node.alt === "string" ? node.alt : "",
        url,
      });
    }
  });

  return { errors, hasLevelOneHeading, images };
}

function isInside(directory: string, pathname: string): boolean {
  const pathFromDirectory = relative(directory, pathname);

  return (
    pathFromDirectory !== "" &&
    !isAbsolute(pathFromDirectory) &&
    pathFromDirectory !== ".." &&
    !pathFromDirectory.startsWith(`..${sep}`)
  );
}

function errorCode(error: unknown): string | undefined {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code;
  }

  return undefined;
}

async function validateLocalImage(
  filePath: string,
  slug: string,
  reference: string,
): Promise<string[]> {
  const articleAssetDirectory = resolve(BLOG_ASSETS_DIR, slug);
  const publicAssetContract = formatContentPath(articleAssetDirectory);
  const trimmedReference = reference.trim();

  if (
    trimmedReference === "" ||
    trimmedReference.startsWith("/") ||
    trimmedReference.startsWith("\\") ||
    trimmedReference.startsWith("//") ||
    /^[a-z][a-z\d+.-]*:/i.test(trimmedReference)
  ) {
    return [
      `Image source "${reference}" must be a relative path inside ${publicAssetContract}/.`,
    ];
  }

  if (trimmedReference.includes("\\")) {
    return [`Image source "${reference}" must use forward slashes.`];
  }

  if (trimmedReference.includes("?") || trimmedReference.includes("#")) {
    return [`Image source "${reference}" must not include a query or fragment.`];
  }

  let decodedReference: string;

  try {
    decodedReference = decodeURIComponent(trimmedReference);
  } catch {
    return [`Image source "${reference}" contains invalid URL encoding.`];
  }

  if (decodedReference.includes("\0")) {
    return [`Image source "${reference}" contains an invalid null byte.`];
  }

  if (
    decodedReference.startsWith("/") ||
    decodedReference.startsWith("\\") ||
    decodedReference.startsWith("//") ||
    /^[a-z][a-z\d+.-]*:/i.test(decodedReference)
  ) {
    return [
      `Image source "${reference}" must be a relative path inside ${publicAssetContract}/.`,
    ];
  }

  if (decodedReference.includes("\\")) {
    return [`Image source "${reference}" must use forward slashes.`];
  }

  if (decodedReference.includes("?") || decodedReference.includes("#")) {
    return [`Image source "${reference}" must not include a query or fragment.`];
  }

  const resolvedPath = resolve(dirname(filePath), decodedReference);

  if (!isInside(articleAssetDirectory, resolvedPath)) {
    return [
      `Image source "${reference}" must resolve inside ${publicAssetContract}/.`,
    ];
  }

  const relativeAssetPath = relative(articleAssetDirectory, resolvedPath);

  if (relativeAssetPath.split(sep).some((segment) => segment.startsWith("."))) {
    return [`Image source "${reference}" must not reference hidden files.`];
  }

  const extension = extname(resolvedPath).toLowerCase();

  if (!supportedImageExtensions.has(extension)) {
    return [
      `Image source "${reference}" must use png, jpg, jpeg, webp, gif, or svg.`,
    ];
  }

  let sourceStats: Stats;

  try {
    sourceStats = await lstat(resolvedPath);
  } catch (error) {
    if (errorCode(error) === "ENOENT") {
      return [
        `Missing local image "${reference}" (resolved to ${formatContentPath(resolvedPath)}).`,
      ];
    }

    return [`Unable to inspect image "${reference}": ${String(error)}`];
  }

  if (sourceStats.isSymbolicLink()) {
    return [`Image source "${reference}" must not be a symbolic link.`];
  }

  if (!sourceStats.isFile()) {
    return [`Image source "${reference}" must resolve to a file.`];
  }

  let realAssetsRoot: string;
  let realArticleAssetDirectory: string;
  let realSourcePath: string;

  try {
    [realAssetsRoot, realArticleAssetDirectory, realSourcePath] =
      await Promise.all([
        realpath(BLOG_ASSETS_DIR),
        realpath(articleAssetDirectory),
        realpath(resolvedPath),
      ]);
  } catch (error) {
    return [`Unable to resolve image "${reference}": ${String(error)}`];
  }

  if (!isInside(realAssetsRoot, realArticleAssetDirectory)) {
    return [
      `Image source "${reference}" resolves outside ${formatContentPath(BLOG_ASSETS_DIR)}/.`,
    ];
  }

  if (!isInside(realArticleAssetDirectory, realSourcePath)) {
    return [
      `Image source "${reference}" resolves outside ${publicAssetContract}/.`,
    ];
  }

  return [];
}

export async function findArticleContentErrors({
  body,
  cover,
  filePath,
  slug,
}: ValidateArticleAssetsOptions): Promise<string[]> {
  const displayPath = formatContentPath(filePath);
  const errors: string[] = [];
  let parsedMarkdown;

  try {
    parsedMarkdown = parseMarkdownImages(body);
  } catch (error) {
    return [
      `${displayPath}: body: Unable to parse Markdown: ${error instanceof Error ? error.message : String(error)}`,
    ];
  }

  if (parsedMarkdown.hasLevelOneHeading) {
    errors.push(
      `${displayPath}: body.heading: Article body headings must start at level 2 because the article title is the page heading.`,
    );
  }

  errors.push(
    ...parsedMarkdown.errors.map(
      (message) => `${displayPath}: body.image: ${message}`,
    ),
  );

  for (const image of parsedMarkdown.images) {
    if (image.alt.trim() === "") {
      errors.push(
        `${displayPath}: body.image.alt: Markdown images require non-empty alt text.`,
      );
    }

    errors.push(
      ...(await validateLocalImage(filePath, slug, image.url)).map(
        (message) => `${displayPath}: body.image: ${message}`,
      ),
    );
  }

  if (cover) {
    errors.push(
      ...(await validateLocalImage(filePath, slug, cover.src)).map(
        (message) => `${displayPath}: cover.src: ${message}`,
      ),
    );
  }

  return errors;
}
