import Container from "@repo/ui/Container";
import Heading from "@repo/ui/Heading";
import Link from "next/link";
import { sdk } from "@repo/sdk";

export default async function BrowseByCategories() {
  const categories = await sdk.categories.getAll();

  return (
    <Container>
      <Heading level={2} className="mb-lg text-brand-400 text-center">
        Khám phá theo Danh Mục
      </Heading>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/san-pham?category=${cat.slug}&page=1`}
            className="group rounded-2xl overflow-hidden shadow-sm ring-1 ring-brand-100 hover:ring-brand-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 block">
            <div className="relative aspect-[4/5] w-full bg-brand-50">
              {cat.image ? (
                <span
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${cat.image})` }}
                />
              ) : (
                <span className="absolute inset-0 bg-gradient-to-br from-brand-100 to-brand-200" />
              )}

              <span className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent group-hover:from-white/20 transition-colors duration-300" />

              <span className="absolute inset-0 flex items-end justify-center p-3">
                <span className="bg-white/85 backdrop-blur-sm rounded-xl px-3 py-1.5 text-default font-bold text-sm sm:text-base text-center leading-snug tracking-wide shadow-md group-hover:scale-105 group-hover:bg-white group-hover:text-brand-400 transition-all duration-300">
                  {cat.name}
                </span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </Container>
  );
}
