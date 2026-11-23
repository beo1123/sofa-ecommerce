import type { RefundStatus, ReturnStatus } from "@/lib/prisma";

export interface SerializedRefund {
  id: number;
  orderId: number;
  orderNumber: string;
  returnRequestId: number | null;
  amount: number;
  method: string;
  status: RefundStatus;
  providerRef: string | null;
  createdAt: string;
  processedAt: string | null;
}

export interface SerializedReturnRequest {
  id: number;
  orderId: number;
  orderNumber: string;
  recipientName: string;
  phone: string;
  orderItemId: number;
  itemName: string;
  itemQuantity: number;
  itemTotal: number;
  reason: string;
  status: ReturnStatus;
  evidenceUrls: string[];
  requestedAt: string;
  processedAt: string | null;
  refund: SerializedRefund | null;
}

export function extractEvidenceUrls(raw: unknown): string[] {
  if (!raw) return [];
  const collect = (arr: unknown[]): string[] =>
    arr
      .map((entry) => {
        if (typeof entry === "string") return entry.trim();
        if (
          entry &&
          typeof entry === "object" &&
          "url" in entry &&
          typeof (entry as { url?: unknown }).url === "string"
        ) {
          return (entry as { url: string }).url.trim();
        }
        return "";
      })
      .filter((url) => url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/"));

  if (Array.isArray(raw)) return collect(raw);
  if (typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.images)) return collect(obj.images);
    if (Array.isArray(obj.urls)) return collect(obj.urls);
    if (Array.isArray(obj.files)) return collect(obj.files);
  }
  return [];
}
