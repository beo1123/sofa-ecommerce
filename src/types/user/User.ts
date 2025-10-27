export type Address = {
  id: number;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  district: string;
  ward: string;
  isDefault?: boolean;
};

export type User = {
  id?: number;
  email?: string;
  name?: string;
  addresses?: Address[];
};
