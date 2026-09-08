export interface Book {
  description: string;
  href: string;
  languages: readonly BookLanguage[];
  status: string;
  title: string;
  titleZh: string;
}

export interface BookLanguage {
  href: string;
  label: string;
  lang: string;
}

const bookDevBase = "http://localhost:4322/books/understanding-llms";
const bookBase = "/books/understanding-llms";
const localizedBookBase = import.meta.env.DEV ? bookDevBase : bookBase;

export const books = [
  {
    title: "Understanding Large Language Models from the Ground Up",
    titleZh: "理解大语言模型",
    description:
      "A bilingual, from-the-ground-up guide to how modern LLMs are built, run, evaluated, and turned into reliable systems.",
    href: "/books/understanding-llms/",
    status: "In progress",
    languages: [
      {
        label: "简体中文",
        lang: "zh-CN",
        href: `${localizedBookBase}/zh-hans/`,
      },
      {
        label: "English",
        lang: "en",
        href: `${localizedBookBase}/en/`,
      },
    ],
  },
] as const satisfies readonly Book[];

export const featuredBooks = books;
