import { BRAND_NAME, SITE_NAME, SITE_URL } from "@/seo/config/site";

export function WebSiteSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: BRAND_NAME,
          alternateName: SITE_NAME,
          url: SITE_URL,
          inLanguage: "vi-VN",
          description:
            "Sofa Phạm Gia là website chính thức của xưởng sản xuất sofa và nội thất phòng khách tại TP.HCM.",
          potentialAction: {
            "@type": "SearchAction",
            target: `${SITE_URL}/san-pham?search={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }),
      }}
    />
  );
}
