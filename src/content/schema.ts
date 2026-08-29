import { z } from "astro/zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function isCalendarDate(value: string): boolean {
  if (!datePattern.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

const contentDateSchema = z
  .union([z.date(), z.string()])
  .refine(
    (value) =>
      value instanceof Date
        ? !Number.isNaN(value.getTime())
        : isCalendarDate(value),
    "Must be a valid calendar date in YYYY-MM-DD format.",
  )
  .transform((value) =>
    value instanceof Date
      ? value
      : new Date(`${value}T00:00:00.000Z`),
  );

const nonEmptyString = z.string().trim().min(1, "Must be a non-empty string.");

export function createBlogPostSchema<T extends z.ZodType>(
  coverSourceSchema: T,
) {
  return z
    .object({
      title: nonEmptyString,
      description: nonEmptyString,
      slug: z
        .string()
        .trim()
        .min(1, "Must be a non-empty string.")
        .regex(
          slugPattern,
          "Must contain lowercase letters, numbers, and single hyphens only.",
        ),
      date: contentDateSchema,
      updated: contentDateSchema.optional(),
      tags: z.array(nonEmptyString),
      draft: z.boolean(),
      cover: z
        .object({
          src: coverSourceSchema,
          alt: nonEmptyString,
        })
        .strict()
        .nullable()
        .optional(),
      publish: z
        .object({
          site: z.boolean(),
          devto: z.boolean(),
          hashnode: z.boolean(),
        })
        .strict(),
    })
    .strict();
}

export const blogPostSchema = createBlogPostSchema(nonEmptyString);

export type BlogPostFrontmatter = z.infer<typeof blogPostSchema>;
