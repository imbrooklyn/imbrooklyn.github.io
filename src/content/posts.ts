import { getCollection, type CollectionEntry } from "astro:content";
import { assertUniqueSlugs } from "./slug-validation";

export type PublishedPost = CollectionEntry<"posts">;

function entrySource(
  entry: CollectionEntry<"drafts"> | CollectionEntry<"posts">,
): string {
  return entry.filePath ?? `${entry.collection}/${entry.id}`;
}

async function loadValidatedCollections(): Promise<{
  drafts: CollectionEntry<"drafts">[];
  posts: CollectionEntry<"posts">[];
}> {
  const [posts, drafts] = await Promise.all([
    getCollection("posts"),
    getCollection("drafts"),
  ]);

  assertUniqueSlugs(
    [...posts, ...drafts]
      .map((entry) => ({
        slug: entry.data.slug,
        source: entrySource(entry),
      }))
      .sort((left, right) => left.source.localeCompare(right.source)),
  );

  return { drafts, posts };
}

export async function getPublishedPosts(): Promise<PublishedPost[]> {
  const { posts } = await loadValidatedCollections();

  return posts
    .filter((post) => !post.data.draft && post.data.publish.site)
    .sort(
      (left, right) =>
        right.data.date.getTime() - left.data.date.getTime() ||
        left.data.slug.localeCompare(right.data.slug),
    );
}

export async function getPublishedPostBySlug(
  slug: string,
): Promise<PublishedPost | undefined> {
  const posts = await getPublishedPosts();
  return posts.find((post) => post.data.slug === slug);
}
