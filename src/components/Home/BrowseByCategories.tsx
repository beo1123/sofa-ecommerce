import Container from "@/components/ui/Container";
import Heading from "@/components/ui/Heading";
import Grid, { GridItem } from "@/components/ui/Grid";
import Link from "next/link";
import { CategoryService } from "@/services/category.service";
import { prisma } from "@/lib/prisma";

const categoryService = new CategoryService(prisma);

export default async function BrowseByCategories() {
  const { data: categories } = await categoryService.getAll(1, 100, 0);

  return (
    <Container>
      <Heading level={2} className="mb-lg text-[var(--color-brand-400)] text-center">
        Khám phá theo Danh Mục
      </Heading>

      <Grid cols={2} responsive={{ sm: 3, lg: 6 }} gap="lg">
        {categories.map((cat) => (
          <Link key={cat.slug} href={`/san-pham?category=${cat.slug}&page=1`} className="group">
            <GridItem className="relative h-24 rounded-2xl flex items-center justify-center bg-white shadow-sm ring-1 ring-[var(--color-brand-100)] text-[var(--color-brand-400)] font-medium transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:ring-[var(--color-brand-300)] overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-br from-[var(--color-brand-50)] to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 tracking-wide group-hover:scale-[1.03] transition-transform duration-300">
                {cat.name}
              </span>
            </GridItem>
          </Link>
        ))}
      </Grid>
    </Container>
  );
}
