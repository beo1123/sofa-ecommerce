import BlogCategoryFilter from "@/components/blog/BlogList/BlogCategoryFilter";
import BlogGrid from "@/components/blog/BlogList/BlogGrid";
import BlogHeader from "@/components/blog/BlogList/BlogHeader";
import { prisma } from "@/lib/prisma";
import { generateHomeMetadata } from "@/seo/generators/generateMetadata";
import { ArticleService } from "@/services/article.service";
import { ArticleCategory } from "@/services/articleCategory.service";
const articleService = new ArticleService(prisma);
const categoryService = new ArticleCategory(prisma);

export const metadata = {
  ...generateHomeMetadata(),
  title: "Bài viết nội thất Sofa Phạm Gia",
  description: "Tin tức, xu hướng nội thất, kinh nghiệm chọn sofa và kiến thức hữu ích từ Sofa Phạm Gia.",
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
    <div className="min-h-screen py-4 sm:py-8 lg:py-10 space-y-6 sm:space-y-8">
      <BlogHeader />
      <div>
        <BlogCategoryFilter categories={categories.data} selected={categorySlug} />
        <BlogGrid items={categorySlug ? articles.data.articles : articles.data} />
      </div>
    </div>
  );
}
