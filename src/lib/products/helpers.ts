export function formatFromPrice(variants: { price: any }[]) {
  if (!variants?.length) return { priceMin: null, priceMax: null };
  const prices = variants.map((v) => Number(v.price));
  return { PriceMin: Math.min(...prices), PriceMax: Math.max(...prices) };
}

export function mapProductListItem(p: any) {
  const { priceMin, priceMax } = formatFromPrice(p.variants);
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    shortDescription: p.shortDescription,
    priceMin,
    priceMax,
    primaryImage: p.images[0] ?? null,
    variantsCount: p.variants.length,
    category: p.category ? { name: p.category.name, slug: p.category.slug } : null,
  };
}

export function formatCurrency(v: number | null | undefined) {
  if (v === null) return "Liên Hệ";
  return `${v?.toLocaleString("vi-VN")} VND`;
}
