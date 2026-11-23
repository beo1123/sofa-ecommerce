import type { PrismaClient } from "@prisma/client";
import { toNumber } from "@/lib/format";
import type { CategoryOrderPoint, DailyRevenuePoint } from "@/components/admin/dashboard/DashboardCharts";

function getHoChiMinhDateParts(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [year, month, day] = formatter.format(date).split("-").map(Number);
  return { year, month, day };
}

function toHcmDayKey(date: Date): string {
  const { year, month, day } = getHoChiMinhDateParts(date);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export class AdminDashboardService {
  constructor(private readonly db: PrismaClient) {}

  async getSummary(now: Date = new Date()) {
    const { year, month, day } = getHoChiMinhDateParts(now);

    const startOfToday = new Date(
      `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T00:00:00+07:00`
    );
    const startOfMonth = new Date(`${year}-${String(month).padStart(2, "0")}-01T00:00:00+07:00`);
    const startOf30Days = new Date(startOfToday);
    startOf30Days.setDate(startOf30Days.getDate() - 29);

    const [
      ordersTodayCount,
      productionCount,
      shippingCount,
      monthlyRevenueAgg,
      last30DaysOrders,
      orderItemsWithCategory,
      recentOrders,
      pendingInquiriesCount,
      recentPendingInquiries,
    ] = await Promise.all([
      this.db.order.count({
        where: { createdAt: { gte: startOfToday } },
      }),
      this.db.order.count({
        where: { workshopStatus: "production" },
      }),
      this.db.order.count({
        where: { workshopStatus: "shipping" },
      }),
      this.db.order.aggregate({
        where: {
          createdAt: { gte: startOfMonth },
          workshopStatus: { not: "cancelled" },
          status: { not: "CANCELLED" },
        },
        _sum: { total: true },
      }),
      this.db.order.findMany({
        where: {
          createdAt: { gte: startOf30Days },
          workshopStatus: { not: "cancelled" },
          status: { not: "CANCELLED" },
        },
        select: { createdAt: true, total: true },
      }),
      this.db.orderItem.findMany({
        select: {
          orderId: true,
          product: {
            select: { category: { select: { name: true } } },
          },
        },
      }),
      this.db.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          items: { select: { id: true, name: true, quantity: true }, take: 2 },
          _count: { select: { items: true } },
        },
      }),
      this.db.inquiry.count({ where: { status: "new" } }),
      this.db.inquiry.findMany({
        where: { status: "new" },
        take: 4,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          phone: true,
          district: true,
          source: true,
          createdAt: true,
        },
      }),
    ]);

    const dailyMap = new Map<string, { revenue: number; orderCount: number }>();
    for (let i = 0; i < 30; i += 1) {
      const d = new Date(startOf30Days);
      d.setDate(startOf30Days.getDate() + i);
      dailyMap.set(toHcmDayKey(d), { revenue: 0, orderCount: 0 });
    }

    for (const order of last30DaysOrders) {
      const key = toHcmDayKey(order.createdAt);
      const entry = dailyMap.get(key);
      if (entry) {
        entry.revenue += toNumber(order.total);
        entry.orderCount += 1;
      }
    }

    const revenueSeries: DailyRevenuePoint[] = Array.from(dailyMap.entries()).map(([dateKey, stats]) => {
      const [, m, d] = dateKey.split("-");
      return {
        dateKey: `${d}/${m}/${dateKey.slice(0, 4)}`,
        label: `${d}/${m}`,
        revenue: stats.revenue,
        orderCount: stats.orderCount,
      };
    });

    const categoryOrderSets = new Map<string, Set<number>>();
    for (const item of orderItemsWithCategory) {
      const catName = item.product?.category?.name ?? "Khác";
      const existing = categoryOrderSets.get(catName);
      if (existing) existing.add(item.orderId);
      else categoryOrderSets.set(catName, new Set([item.orderId]));
    }

    const categorySeries: CategoryOrderPoint[] = Array.from(categoryOrderSets.entries())
      .map(([category, orderIds]) => ({ category, orders: orderIds.size }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 8);

    return {
      dateParts: { year, month, day },
      kpis: {
        ordersTodayCount,
        productionCount,
        shippingCount,
        monthlyRevenue: toNumber(monthlyRevenueAgg._sum.total),
      },
      revenueSeries,
      categorySeries,
      recentOrders,
      pendingInquiriesCount,
      recentPendingInquiries,
    };
  }
}
