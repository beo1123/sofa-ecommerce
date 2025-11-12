export type BestSellerProduct = {
  id: number;
  slug: string;
  title: string;
  shortDescription?: string;
  totalSold: number;
  priceMin: number;
  priceMax: number;
  primaryImage?: {
    url?: string;
    alt?: string;
  };
};
