export interface SlugSource {
  slug: string;
  source: string;
}

export function findDuplicateSlugErrors(entries: SlugSource[]): string[] {
  const firstSourceBySlug = new Map<string, string>();
  const errors: string[] = [];

  for (const entry of entries) {
    const firstSource = firstSourceBySlug.get(entry.slug);

    if (firstSource) {
      errors.push(
        `${entry.source}: slug: Duplicate slug "${entry.slug}"; first used by ${firstSource}.`,
      );
      continue;
    }

    firstSourceBySlug.set(entry.slug, entry.source);
  }

  return errors;
}

export function assertUniqueSlugs(entries: SlugSource[]): void {
  const errors = findDuplicateSlugErrors(entries);

  if (errors.length > 0) {
    throw new Error(`Content validation failed:\n- ${errors.join("\n- ")}`);
  }
}
