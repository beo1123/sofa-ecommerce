import BlogCategoryFilter from "@/components/blog/BlogList/BlogCategoryFilter";
import BlogGrid from "@/components/blog/BlogList/BlogGrid";
import BlogHeader from "@/components/blog/BlogList/BlogHeader";
import Container from "@/components/ui/Container";
import prisma from "@/lib/prisma";
import { ArticleService } from "@/services/article.service";
import { ArticleCategory } from "@/services/articleCategory.service";
const articleService = new ArticleService(prisma);
const categoryService = new ArticleCategory(prisma);

export const metadata = {
  title: "Bài viết – Blog",
  description: "Tin tức, xu hướng nội thất, mẹo mua sắm và kiến thức hữu ích.",
};

export const revalidate = 3600;
export default async function BlogPage(props: { searchParams: Promise<{ page?: string; category?: string }> }) {
  const searchParams = await props.searchParams;

  const page = Number(searchParams.page) || 1;
  const perPage = 9;
  const skip = (page - 1) * perPage;
  const categorySlug = searchParams.category;

  const categories = await categoryService.getAllArticleCategory(1, 100, 0);

  let articles: any;

  if (categorySlug) {
    articles = await articleService.getArticleByCategory(categorySlug);
  } else {
    articles = await articleService.getAllArticle(page, perPage, skip);
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg-muted)] px-5">
      <BlogHeader />
      <Container>
        <BlogCategoryFilter categories={categories.data} selected={categorySlug} />
        <BlogGrid items={categorySlug ? articles.data.articles : articles.data} />
      </Container>
    </main>
  );
}
