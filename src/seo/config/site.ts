export const SITE_URL = "https://sofaphamgia.com";
export const SITE_NAME = "Sofa Phạm Gia | Xưởng Sản Xuất Sofa Phòng Khách Tại TPHCM";
export const BRAND_NAME = "Sofa Phạm Gia";
export const SITE_DESCRIPTION =
  "Sofa Phạm Gia chuyên sản xuất và cung cấp sofa phòng khách, sofa băng, sofa góc, sofa da, sofa vải và sofa theo yêu cầu tại TP.HCM.";
export const DEFAULT_OG_IMAGE = "/images/LOGO_SOFA.png";

export const siteContact = {
  phone: process.env.NEXT_PUBLIC_PHONE_URL || "0932 111 620",
  zalo: process.env.NEXT_PUBLIC_ZALO_URL || "https://zalo.me/0932111620",
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || "https://www.facebook.com/sofaphamgia",
  tiktok: process.env.NEXT_PUBLIC_TIKTOK_URL || "https://www.tiktok.com/@sofaphamgia",
  address: "C12/17, Ấp 3, Bình Chánh, TP.HCM",
};

export const siteSocialLinks = [siteContact.facebook, siteContact.tiktok, siteContact.zalo].filter(Boolean);
