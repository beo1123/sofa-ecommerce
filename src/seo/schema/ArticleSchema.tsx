type ArticleSchemaProps = {
  headline: string;
  description?: string | null;
  image?: string | null;
  datePublished?: string | Date | null;
  dateModified?: string | Date | null;
  author?: string | null;
  url?: string;
};

export default function ArticleSchema({
  headline,
  description,
  image,
  datePublished,
  dateModified,
  author,
  url,
}: ArticleSchemaProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline,
          description: description || headline,
          image: image || undefined,
          datePublished: datePublished ? new Date(datePublished).toISOString() : undefined,
          dateModified: dateModified ? new Date(dateModified).toISOString() : undefined,
          author: author
            ? {
                "@type": "Person",
                name: author,
              }
            : undefined,
          publisher: {
            "@type": "Organization",
            name: "Sofa Phạm Gia",
            logo: {
              "@type": "ImageObject",
              url: "https://sofaphamgia.com/images/LOGO_SOFA.png",
            },
          },
          mainEntityOfPage: url || "https://sofaphamgia.com",
        }),
      }}
    />
  );
}
