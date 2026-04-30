import type { ArticleDetail } from "@repo/types";
import { buildCanonical } from "../utils/canonical";
import { buildOpenGraphImage } from "../utils/openGraph";

export function generateArticlesMetadata() {
  return {
    title: "Bài viết nội thất Sofa Phạm Gia",
    description: "Tin tức, xu hướng nội thất, kinh nghiệm chọn sofa và kiến thức hữu ích từ Sofa Phạm Gia.",
    alternates: {
      canonical: buildCanonical("/bai-viet"),
    },
  };
}

export function generateArticleMetadata(article: ArticleDetail) {
  const title = article.title;
  const description = article.excerpt ?? "";
  const canonical = buildCanonical(`/bai-viet/${article.slug}`);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: "article",
      url: canonical,
      images: [buildOpenGraphImage(title, article.thumbnail)],
      publishedTime: article.publishedAt ? new Date(article.publishedAt).toISOString() : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [buildOpenGraphImage(title, article.thumbnail).url],
    },
  };
}
