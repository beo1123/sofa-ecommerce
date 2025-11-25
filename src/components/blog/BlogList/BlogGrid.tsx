import Grid, { GridItem } from "@/components/ui/Grid";
import BlogArticleCard from "./BlogArticleCard";
import { BlogArticle } from "@/types/blog/blog";

export default function BlogGrid({ items }: { items: BlogArticle[] }) {
  return (
    <Grid className="pb-10" cols={1} responsive={{ sm: 2, lg: 3 }} gap="xl">
      {items.map((item) => (
        <GridItem key={item.id}>
          <BlogArticleCard item={item} />
        </GridItem>
      ))}
    </Grid>
  );
}
