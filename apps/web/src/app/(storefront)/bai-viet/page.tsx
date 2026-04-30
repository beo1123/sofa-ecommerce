import BlogCategoryFilter from "@/components/blog/BlogList/BlogCategoryFilter";
import BlogGrid from "@/components/blog/BlogList/BlogGrid";
import BlogHeader from "@/components/blog/BlogList/BlogHeader";
import Container from "@repo/ui/Container";
import { sdk } from "@repo/sdk";
import { generateArticlesMetadata } from "@repo/seo";
import type { BlogArticle } from "@repo/types";

export const metadata = generateArticlesMetadata();

export const revalidate = 3600;
export default async function BlogPage(props: { searchParams: Promise<{ page?: string; category?: string }> }) {
  const searchParams = await props.searchParams;

  const page = Number(searchParams.page) || 1;
  const perPage = 9;
  const categorySlug = searchParams.category;

  const categories = await sdk.articleCategories.getAll();
  const rawItems = categorySlug
    ? (await sdk.articles.listByCategory(categorySlug)).articles
    : (await sdk.articles.list(page, perPage)).items;

  const items: BlogArticle[] = rawItems.map((item) => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt ?? "",
    thumbnail: item.thumbnail ?? "/images/404.jpg",
    publishedAt: item.publishedAt ?? new Date().toISOString(),
  }));

  return (
    <main className="min-h-screen bg-bg-muted px-5">
      <BlogHeader />
      <Container>
        <BlogCategoryFilter categories={categories} selected={categorySlug} />
        <BlogGrid items={items} />
      </Container>
    </main>
  );
}
