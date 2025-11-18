import Container from "@/components/ui/Container";
import Heading from "@/components/ui/Heading";
import Grid, { GridItem } from "@/components/ui/Grid";
import Link from "next/link";
import { CategoryService } from "@/services/category.service";
import prisma from "@/lib/prisma";

const categoryService = new CategoryService(prisma);

export default async function BrowseByCategories() {
  const { data: categories } = await categoryService.getAll(1, 100, 0);

  return (
    <Container>
      <Heading level={2} className="mb-lg">
        Khám phá theo Danh Mục
      </Heading>

      <Grid cols={2} responsive={{ sm: 3, lg: 6 }} gap="md">
        {categories.map((cat) => (
          <Link key={cat.id} href={`/san-pham?category=${cat.slug}&page=1`}>
            <GridItem
              className="
                bg-white shadow rounded-md p-lg text-center
                cursor-pointer transition hover:shadow-lg hover:bg-brand-50
              ">
              {cat.name}
            </GridItem>
          </Link>
        ))}
      </Grid>
    </Container>
  );
}
