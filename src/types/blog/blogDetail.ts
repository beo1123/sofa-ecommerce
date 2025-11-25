export type Category = {
  name: string;
  slug: string;
};

export type Author = {
  displayName: string;
} | null;

export type blogDetail = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string; // HTML string
  thumbnail: string;
  publishedAt: string; // ISO date string
  status: "DRAFT" | "PUBLISHED";
  category: Category;
  author: Author;
};
