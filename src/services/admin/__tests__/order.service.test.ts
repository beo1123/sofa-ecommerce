import type { PrismaClient } from "@prisma/client";
import { AdminOrderService } from "@/services/admin/order.service";

jest.mock("@/lib/audit", () => ({
  recordAuditLog: jest.fn().mockResolvedValue(undefined),
}));

describe("AdminOrderService", () => {
  it("advances workshopStatus from new to deposited and increments depositPaid when adding deposit", async () => {
    const now = new Date("2026-11-23T10:00:00.000Z");

    const txMock = {
      order: {
        findUnique: jest.fn().mockResolvedValue({
          id: 42,
          orderNumber: "ORD-PG-001",
          workshopStatus: "new",
        }),
        update: jest.fn().mockResolvedValue({
          depositPaid: 5_000_000,
          workshopStatus: "deposited",
        }),
      },
      depositLog: {
        create: jest.fn().mockResolvedValue({
          id: 9,
          orderId: 42,
          amount: 5_000_000,
          method: "Chuyển khoản",
          note: "Cọc đợt 1",
          recordedBy: "Mr. Giang",
          createdAt: now,
        }),
      },
    };

    const prismaMock = {
      $transaction: jest.fn(async (cb: (tx: typeof txMock) => unknown) => cb(txMock)),
    } as unknown as PrismaClient;

    const service = new AdminOrderService(prismaMock);
    const result = await service.addDeposit(
      {
        orderId: 42,
        amount: 5_000_000,
        method: "Chuyển khoản",
        note: "Cọc đợt 1",
      },
      "Mr. Giang",
      1
    );

    expect(txMock.order.update).toHaveBeenCalledWith({
      where: { id: 42 },
      data: {
        depositPaid: { increment: 5_000_000 },
        workshopStatus: "deposited",
      },
      select: { depositPaid: true, workshopStatus: true },
    });
    expect(result.depositPaid).toBe(5_000_000);
    expect(result.workshopStatus).toBe("deposited");
    expect(result.depositLog.id).toBe(9);
  });

  it("throws ORDER_NOT_FOUND when updating status of a non-existent order", async () => {
    const prismaMock = {
      order: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
    } as unknown as PrismaClient;

    const service = new AdminOrderService(prismaMock);
    await expect(service.updateWorkshopStatus({ orderId: 9999, workshopStatus: "production" }, 1)).rejects.toThrow(
      "ORDER_NOT_FOUND"
    );
  });
});
