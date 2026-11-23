import type { PrismaClient } from "@prisma/client";
import type { AuditActorOption, SerializedAuditLog, WorkshopOverviewInfo } from "@/components/admin/settings/types";

const DEFAULT_ENTITIES = [
  "Order",
  "Product",
  "Article",
  "Inquiry",
  "Shipment",
  "DepositLog",
  "ReturnRequest",
  "Refund",
  "Coupon",
  "Review",
];

export class AdminAuditLogService {
  constructor(private readonly db: PrismaClient) {}

  async getSettingsAuditView(take = 300): Promise<{
    logs: SerializedAuditLog[];
    actors: AuditActorOption[];
    entities: string[];
    overview: WorkshopOverviewInfo;
  }> {
    const [logs, adminUsersCount, productsCount, ordersCount, inquiriesCount, auditLogsCount] = await Promise.all([
      this.db.auditLog.findMany({
        take,
        orderBy: { createdAt: "desc" },
        include: {
          actor: { select: { id: true, email: true, displayName: true } },
        },
      }),
      this.db.user.count({
        where: {
          userRoles: {
            some: { role: { name: { in: ["Admin", "ADMIN"] } } },
          },
        },
      }),
      this.db.product.count(),
      this.db.order.count(),
      this.db.inquiry.count(),
      this.db.auditLog.count(),
    ]);

    const actorMap = new Map<number, AuditActorOption>();
    const entitySet = new Set<string>(DEFAULT_ENTITIES);

    const serializedLogs: SerializedAuditLog[] = logs.map((log) => {
      entitySet.add(log.entity);
      if (log.actor) {
        actorMap.set(log.actor.id, {
          id: log.actor.id,
          email: log.actor.email,
          displayName: log.actor.displayName,
        });
      }

      return {
        id: log.id,
        actorId: log.actorId,
        actorEmail: log.actor?.email ?? null,
        actorName: log.actor?.displayName ?? null,
        action: log.action,
        entity: log.entity,
        entityId: log.entityId,
        changes: log.changes,
        ip: log.ip,
        userAgent: log.userAgent,
        createdAt: log.createdAt.toISOString(),
      };
    });

    return {
      logs: serializedLogs,
      actors: Array.from(actorMap.values()),
      entities: Array.from(entitySet).sort(),
      overview: {
        adminUsersCount,
        productsCount,
        ordersCount,
        inquiriesCount,
        auditLogsCount,
      },
    };
  }
}
