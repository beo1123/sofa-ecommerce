import type { OrderStatus, PaymentMethod } from "@/lib/prisma";
import type { ShipmentStatus, WorkshopStatus } from "@/lib/workshop-types";

export interface SerializedOrderItem {
  id: number;
  name: string;
  sku: string | null;
  price: number;
  quantity: number;
  total: number;
  productId: number | null;
  workshopCode: string | null;
  variantName: string | null;
}

export interface SerializedShipment {
  id: number;
  orderId: number;
  scheduledDate: string | null;
  driverName: string | null;
  needsCrane: boolean;
  buildingFloor: number | null;
  hasElevator: boolean;
  specialNote: string | null;
  status: ShipmentStatus;
  updatedAt: string;
}

export interface SerializedDepositLog {
  id: number;
  orderId: number;
  amount: number;
  method: string | null;
  note: string | null;
  recordedBy: string | null;
  createdAt: string;
}

export interface SerializedOrderStatusHistory {
  id: number;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  note: string | null;
  actorName: string | null;
  createdAt: string;
}

export interface SerializedAdminOrder {
  id: number;
  orderNumber: string;
  recipientName: string;
  phone: string;
  email: string | null;
  line1: string;
  city: string;
  province: string;
  country: string;
  status: OrderStatus;
  workshopStatus: WorkshopStatus;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  depositPaid: number;
  paymentMethod: PaymentMethod;
  isCustomSize: boolean;
  customWidthCm: number | null;
  customDepthCm: number | null;
  customHeightCm: number | null;
  materialChoice: string | null;
  colorChoice: string | null;
  internalNote: string | null;
  deliverDate: string | null;
  invoiceUrl: string | null;
  createdAt: string;
  updatedAt: string;
  items: SerializedOrderItem[];
  shipment: SerializedShipment | null;
  depositLogs: SerializedDepositLog[];
  statusHistory: SerializedOrderStatusHistory[];
}
