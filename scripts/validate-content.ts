import { validateAllMarkdownMetadata } from "../src/content/validate-files";

try {
  const entries = await validateAllMarkdownMetadata();
  const noun = entries.length === 1 ? "file" : "files";
  console.log(
    `Validated ${entries.length} Markdown ${noun} across posts/ and drafts/.`,
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
