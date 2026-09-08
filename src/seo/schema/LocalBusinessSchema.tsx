import { BRAND_NAME, SITE_NAME, SITE_URL, siteContact } from "@/seo/config/site";

export function LocalBusinessSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: BRAND_NAME,
          alternateName: SITE_NAME,
          image: `${SITE_URL}/images/LOGO_SOFA.png`,
          url: SITE_URL,
          telephone: siteContact.phone,
          address: {
            "@type": "PostalAddress",
            streetAddress: siteContact.address,
            addressLocality: "TP.HCM",
            addressRegion: "Hồ Chí Minh",
            addressCountry: "VN",
          },
          makesOffer: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Product",
                name: "Sofa phòng khách",
              },
            },
          ],
        }),
      }}
    />
  );
}
