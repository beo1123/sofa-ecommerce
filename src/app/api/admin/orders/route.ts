import { NextResponse } from "next/server";
import { prisma, type PaymentMethod } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { AdminOrderService } from "@/services/admin/order.service";
import { normalizeError, ok, parsePagination, parseStringParam } from "@/server/utils/api";

const orderService = new AdminOrderService(prisma);
const PAYMENT_METHODS: readonly PaymentMethod[] = ["VNPAY", "COD", "WALLET", "OTHER"];

export async function GET(req: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const { page, perPage, skip, take } = parsePagination(searchParams, 20);
    const workshopStatus = parseStringParam(searchParams.get("workshopStatus"));
    const paymentMethodRaw = parseStringParam(searchParams.get("paymentMethod"));
    const search = parseStringParam(searchParams.get("search"));

    const paymentMethod =
      paymentMethodRaw && (PAYMENT_METHODS as readonly string[]).includes(paymentMethodRaw)
        ? (paymentMethodRaw as PaymentMethod)
        : undefined;

    const { items, total } = await orderService.listPaginatedOrders({
      skip,
      take,
      workshopStatus,
      paymentMethod,
      search,
    });

    return NextResponse.json(ok(items, { page, perPage, total }));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return NextResponse.json(payload, { status });
  }
}
