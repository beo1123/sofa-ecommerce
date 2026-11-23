import { headers } from "next/headers";
import { prisma, type Prisma } from "@/lib/prisma";

interface AuditLogPayload {
  actorId?: number | string | null;
  action: string;
  entity: string;
  entityId?: string | number | null;
  changes?: Prisma.InputJsonValue;
  ip?: string | null;
  userAgent?: string | null;
}

async function resolveRequestMeta(): Promise<{
  ip: string | null;
  userAgent: string | null;
}> {
  try {
    const h = await headers();
    const forwardedFor = h.get("x-forwarded-for");
    const ip = (forwardedFor ? forwardedFor.split(",")[0]?.trim() : null) ?? h.get("x-real-ip") ?? null;
    const userAgent = h.get("user-agent") ?? null;
    return { ip, userAgent };
  } catch {
    return { ip: null, userAgent: null };
  }
}

export async function recordAuditLog(payload: AuditLogPayload): Promise<void> {
  try {
    const parsedActorId =
      typeof payload.actorId === "number"
        ? payload.actorId
        : typeof payload.actorId === "string" && /^\d+$/.test(payload.actorId)
          ? Number(payload.actorId)
          : null;

    const reqMeta =
      payload.ip === undefined || payload.userAgent === undefined
        ? await resolveRequestMeta()
        : { ip: payload.ip, userAgent: payload.userAgent };

    await prisma.auditLog.create({
      data: {
        actorId: parsedActorId,
        action: payload.action,
        entity: payload.entity,
        entityId: payload.entityId !== undefined && payload.entityId !== null ? String(payload.entityId) : null,
        changes: payload.changes,
        ip: payload.ip ?? reqMeta.ip,
        userAgent: payload.userAgent ?? reqMeta.userAgent,
      },
    });
  } catch (err) {
    console.error("[recordAuditLog] Failed to persist audit log:", err);
  }
}
