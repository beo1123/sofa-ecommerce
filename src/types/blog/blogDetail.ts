import type { ArticleStatus } from "@prisma/client";

export type Category = {
  name: string;
  slug: string;
} | null;

export type Author = {
  displayName: string;
} | null;

export type blogDetail = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  thumbnail: string | null;
  publishedAt: string | Date | null;
  status: ArticleStatus;
  category: Category;
  author: Author;
};
