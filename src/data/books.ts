export interface Book {
  description: string;
  href: string;
  languages: readonly string[];
  status: string;
  title: string;
  titleZh: string;
}

export const books = [
  {
    title: "Understanding Large Language Models from the Ground Up",
    titleZh: "理解大语言模型",
    description:
      "A bilingual, from-the-ground-up guide to how modern LLMs are built, run, evaluated, and turned into reliable systems.",
    href: "/books/understanding-llms/",
    status: "In progress",
    languages: ["简体中文", "English"],
  },
] as const satisfies readonly Book[];

export const featuredBooks = books;
