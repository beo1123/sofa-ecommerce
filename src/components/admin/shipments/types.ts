import type { ShipmentStatus } from "@/lib/workshop-types";

export interface SerializedShipmentRow {
  id: number;
  orderId: number;
  orderNumber: string;
  recipientName: string;
  phone: string;
  address: string;
  scheduledDate: string | null;
  driverName: string | null;
  needsCrane: boolean;
  buildingFloor: number | null;
  hasElevator: boolean;
  specialNote: string | null;
  status: ShipmentStatus;
  updatedAt: string;
}

export interface UnscheduledOrderOption {
  id: number;
  orderNumber: string;
  recipientName: string;
  phone: string;
  address: string;
  deliverDate: string | null;
}
