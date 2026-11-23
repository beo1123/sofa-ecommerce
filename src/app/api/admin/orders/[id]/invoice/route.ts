import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { recordAuditLog } from "@/lib/audit";
import { AdminOrderService } from "@/services/admin/order.service";
import { renderOrderInvoicePdf } from "@/components/admin/orders/OrderInvoicePdf";

export const runtime = "nodejs";

const orderService = new AdminOrderService(prisma);

async function tryUploadPdfToCloudinary(buffer: Buffer, orderNumber: string): Promise<string | null> {
  const hasCloudinary =
    Boolean(process.env.CLOUDINARY_URL) ||
    Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
  if (!hasCloudinary) return null;

  try {
    if (!process.env.CLOUDINARY_URL) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
      });
    }
    const safeId = orderNumber.replace(/[^a-zA-Z0-9_-]/g, "-");
    const dataUri = `data:application/pdf;base64,${buffer.toString("base64")}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "invoices",
      public_id: `hoa-don-${safeId}`,
      resource_type: "raw",
      overwrite: true,
    });
    return result.secure_url ?? null;
  } catch (err) {
    console.warn("[invoice] Cloudinary raw upload skipped, falling back to API PDF URL:", err);
    return null;
  }
}

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch (err: any) {
    return NextResponse.json(err?.body ?? { error: "Unauthorized" }, {
      status: err?.status ?? 401,
    });
  }

  const { id } = await context.params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
  }

  const order = await orderService.getSerializedOrderById(orderId);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const pdfBuffer = await renderOrderInvoicePdf(order);
  const safeFilename = `hoa-don-${order.orderNumber.replace(/[^a-zA-Z0-9_-]/g, "-")}.pdf`;

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${safeFilename}"`,
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(_req: Request, context: { params: Promise<{ id: string }> }) {
  let session: Awaited<ReturnType<typeof requireAdmin>>;
  try {
    session = await requireAdmin();
  } catch (err: any) {
    return NextResponse.json(err?.body ?? { error: "Unauthorized" }, {
      status: err?.status ?? 401,
    });
  }

  const { id } = await context.params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
  }

  const order = await orderService.getSerializedOrderById(orderId);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const pdfBuffer = await renderOrderInvoicePdf(order);
  const uploadedUrl = await tryUploadPdfToCloudinary(pdfBuffer, order.orderNumber);
  const invoiceUrl = uploadedUrl ?? `/api/admin/orders/${order.id}/invoice`;

  await prisma.order.update({
    where: { id: order.id },
    data: { invoiceUrl },
  });

  await recordAuditLog({
    actorId: session.user.id,
    action: "ORDER_INVOICE_GENERATED",
    entity: "Order",
    entityId: order.id,
    changes: { orderNumber: order.orderNumber, invoiceUrl },
  });

  return NextResponse.json({
    ok: true,
    invoiceUrl,
    streamUrl: `/api/admin/orders/${order.id}/invoice`,
  });
}
