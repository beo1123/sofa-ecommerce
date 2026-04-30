export interface BlogArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  thumbnail: string;
  publishedAt: string | Date;
}

export interface BlogArticleCategory {
  id: number;
  name: string;
  slug: string;
}
