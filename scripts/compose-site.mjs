import {
  cpSync,
  existsSync,
  mkdirSync,
  rmSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const websiteRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const websiteDist = resolve(websiteRoot, "dist");
const bookDist = resolve(websiteRoot, "../understanding-llms/dist");
const bookTarget = resolve(
  websiteDist,
  "books/understanding-llms",
);

const requiredBuildFiles = [
  resolve(websiteDist, "index.html"),
  resolve(bookDist, "index.html"),
  resolve(bookDist, "en/index.html"),
  resolve(bookDist, "zh-hans/index.html"),
];

for (const pathname of requiredBuildFiles) {
  if (!existsSync(pathname)) {
    throw new Error(
      `Required build output not found: ${pathname}. Build the website and book before composing the Pages artifact.`,
    );
  }
}

rmSync(bookTarget, { recursive: true, force: true });
mkdirSync(dirname(bookTarget), { recursive: true });
cpSync(bookDist, bookTarget, { recursive: true });

console.log("Added Understanding LLMs to dist/books/understanding-llms/.");
