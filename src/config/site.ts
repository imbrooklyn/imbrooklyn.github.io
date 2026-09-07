const siteName = "Brooklyn Yu";
const siteRole = "Software Engineer";
const siteDescription =
  "Software engineer focused on developer tools, infrastructure, API design, and reliability.";
const blogDescription =
  "Notes on software engineering, developer tools, and infrastructure.";

export const siteConfig = {
  url: "https://imbrooklyn.dev",
  name: siteName,
  role: siteRole,
  description: siteDescription,
  blog: {
    title: `Blog — ${siteName}`,
    description: blogDescription,
  },
  githubUrl: "https://github.com/imbrooklyn",
  navigation: [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/projects/" },
    { label: "Blog", href: "/blog/" },
    { label: "About", href: "/about/" },
  ],
} as const;

export const focusAreas = [
  "Developer Tools",
  "Infrastructure",
  "Go",
  "Kubernetes",
  "API Design",
  "Reliability",
] as const;
