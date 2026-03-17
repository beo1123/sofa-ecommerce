import { seedCategories } from "./categories.js";
import { seedProductImages } from "./productImages.js";
import { seedProducts } from "./products.js";
import { seedProductVariants } from "./productVariants.js";

async function main() {
  console.log("🌱 Seeding...");

  await seedCategories();
  await seedProducts();
  await seedProductImages();
  await seedProductVariants();

  console.log("✅ Seed done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
