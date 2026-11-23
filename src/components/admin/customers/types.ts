import type { OrderStatus } from "@/lib/prisma";
import type { WorkshopStatus } from "@/lib/workshop-types";

export interface SerializedCustomerAddress {
  id: number;
  fullName: string;
  phone: string | null;
  line1: string;
  line2: string | null;
  city: string;
  province: string | null;
  country: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
}

export interface SerializedCustomerOrder {
  id: number;
  orderNumber: string;
  total: number;
  depositPaid: number;
  status: OrderStatus;
  workshopStatus: WorkshopStatus;
  createdAt: string;
}

export interface SerializedCustomerReview {
  id: number;
  productId: number;
  productTitle: string;
  productSlug: string;
  rating: number;
  title: string | null;
  body: string | null;
  approved: boolean;
  createdAt: string;
}

export interface SerializedCustomer {
  id: number;
  displayName: string | null;
  email: string;
  city: string | null;
  orderCount: number;
  totalSpent: number;
  lastOrderDate: string | null;
  createdAt: string;
  roles: string[];
  addresses: SerializedCustomerAddress[];
  orders: SerializedCustomerOrder[];
  reviews: SerializedCustomerReview[];
}
