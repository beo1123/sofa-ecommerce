import Link from "next/link";
import { SafeImage } from "@/components/ui/SafeImage";
import Text from "@/components/ui/Text";
import { formatVNDate } from "@/lib/helpers";
import { BlogArticle } from "@/types/blog/blog";

export default function BlogArticleCard({ item }: { item: BlogArticle }) {
  return (
    <Link
      href={`/bai-viet/${item.slug}`}
      className="group rounded-2xl border border-gray-200 hover:shadow-md transition-all bg-white p-3 flex flex-col h-[420px]">
      <div className="overflow-hidden rounded-xl mb-4">
        <SafeImage
          src={item.thumbnail}
          alt={item.title}
          width={600}
          height={350}
          className="rounded-xl object-cover w-full h-40 transition-transform duration-300 group-hover:scale-[1.06]"
        />
      </div>

      <div className="flex flex-col flex-1">
        <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-brand-600 transition-colors">
          {item.title}
        </h3>

        <Text muted className="line-clamp-3 text-[15px] leading-relaxed mb-3">
          {item.excerpt}
        </Text>

        <Text muted className="text-sm mt-auto">
          {formatVNDate(item.publishedAt)}
        </Text>
      </div>
    </Link>
  );
}
