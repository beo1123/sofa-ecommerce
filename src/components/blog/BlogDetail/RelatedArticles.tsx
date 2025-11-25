import Heading from "@/components/ui/Heading";
import BlogArticleCard from "../BlogList/BlogArticleCard";

export default function RelatedArticles({ related }: { related: any[] }) {
  if (!related || related.length === 0) return null;

  return (
    <section>
      <Heading level={3} className="mb-4">
        Bài viết liên quan
      </Heading>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {related.map((r) => (
          <BlogArticleCard key={r.id} item={r} />
        ))}
      </div>
    </section>
  );
}
