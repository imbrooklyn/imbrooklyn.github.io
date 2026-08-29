export interface Project {
  name: string;
  description?: string;
  featured: boolean;
  url: string;
}

export const projects = [
  {
    name: "shuttle",
    description:
      "Type-safe composition primitives for Go: comparators, predicates, Optional values, and lazy Streams.",
    featured: true,
    url: "https://github.com/imbrooklyn/shuttle",
  },
  {
    name: "ldappool",
    description:
      "A concurrency-safe pool of reusable, authenticated LDAP connections for Go.",
    featured: false,
    url: "https://github.com/imbrooklyn/ldappool",
  },
  {
    name: "weave",
    description:
      "A backend-neutral query predicate construction and compilation core for Go.",
    featured: true,
    url: "https://github.com/imbrooklyn/weave",
  },
  {
    name: "leakviz",
    featured: false,
    url: "https://github.com/imbrooklyn/leakviz",
  },
  {
    name: "kupilot",
    description:
      "A local, single-process Kubernetes TUI agent for evidence-first diagnosis.",
    featured: true,
    url: "https://github.com/imbrooklyn/kupilot",
  },
  {
    name: "semver-go",
    description: "An implementation of Semantic Versioning 2.0.0 in Go.",
    featured: false,
    url: "https://github.com/imbrooklyn/semver-go",
  },
] as const satisfies readonly Project[];

export const featuredProjects = projects.filter((project) => project.featured);
