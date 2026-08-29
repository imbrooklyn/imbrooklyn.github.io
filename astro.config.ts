import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import { siteConfig } from "./src/config/site";
import { isSitemapPage } from "./src/config/urls";

export default defineConfig({
  site: siteConfig.url,
  output: "static",
  trailingSlash: "always",
  integrations: [
    sitemap({
      filter: isSitemapPage,
    }),
  ],
  image: {
    service: {
      entrypoint: "astro/assets/services/noop",
    },
  },
  markdown: {
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      defaultColor: false,
    },
  },
  build: {
    format: "directory",
  },
});
