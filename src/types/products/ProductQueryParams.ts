export type ProductQueryParams = {
  page: number;
  perPage: number;
  category?: string;
  priceMin?: number;
  priceMax?: number;
  color?: string;
  material?: string;
};
