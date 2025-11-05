export type Address = {
  id: number;
  line1: string;
  city: string;
  province: string;
  country: string;
  isDefault?: boolean;
};

export type User = {
  id?: number;
  email?: string;
  displayName?: string;
  roles?: string;
  addresses: Address[];
};
