type ProductSchemaProps = {
  name: string;
  description?: string | null;
  slug?: string;
  image?: string[];
  sku?: string | null;
  price?: number | null;
  currency?: string;
  availability?: string;
};

export function ProductSchema({
  name,
  description,
  slug,
  image = [],
  sku,
  price,
  currency = "VND",
  availability = "https://schema.org/InStock",
}: ProductSchemaProps) {
  const productUrl = slug ? `https://sofaphamgia.com/san-pham/${slug}` : "https://sofaphamgia.com/san-pham";

  const offer = price
    ? {
        "@type": "Offer",
        price,
        priceCurrency: currency,
        availability,
        url: productUrl,
      }
    : undefined;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name,
          description: description || name,
          image,
          sku: sku ?? undefined,
          brand: {
            "@type": "Brand",
            name: "Sofa Phạm Gia",
          },
          url: productUrl,
          ...(offer ? { offers: offer } : {}),
        }),
      }}
    />
  );
}
