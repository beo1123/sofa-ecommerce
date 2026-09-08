import { BRAND_NAME, SITE_NAME, SITE_URL, siteContact, siteSocialLinks } from "@/seo/config/site";

export function OrganizationSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FurnitureStore",
          name: BRAND_NAME,
          alternateName: SITE_NAME,
          url: SITE_URL,
          logo: `${SITE_URL}/images/LOGO_SOFA.png`,
          image: `${SITE_URL}/images/LOGO_SOFA.png`,
          telephone: siteContact.phone,
          sameAs: siteSocialLinks,
          address: {
            "@type": "PostalAddress",
            streetAddress: siteContact.address,
            addressLocality: "TP.HCM",
            addressRegion: "Hồ Chí Minh",
            addressCountry: "VN",
          },
          description:
            "Sofa Phạm Gia chuyên sản xuất và cung cấp sofa phòng khách, sofa băng, sofa góc, sofa da, sofa vải và sofa theo yêu cầu tại TP.HCM.",
        }),
      }}
    />
  );
}
