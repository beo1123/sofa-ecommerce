import type { Inquiry, Prisma, PrismaClient } from "@prisma/client";
import { recordAuditLog } from "@/lib/audit";
import { isInquirySource, isInquiryStatus, type InquiryStatus } from "@/lib/workshop-types";
import type { CreateInquiryInput } from "@/lib/validators/inquiry";
import type { SerializedInquiry } from "@/components/admin/inquiries/types";

export function serializeInquiry(inq: Inquiry): SerializedInquiry {
  return {
    id: inq.id,
    name: inq.name,
    phone: inq.phone,
    district: inq.district,
    city: inq.city,
    roomType: inq.roomType,
    budgetMin: inq.budgetMin,
    budgetMax: inq.budgetMax,
    note: inq.note,
    source: isInquirySource(inq.source) ? inq.source : "web",
    assignedTo: inq.assignedTo,
    status: isInquiryStatus(inq.status) ? inq.status : "new",
    createdAt: inq.createdAt.toISOString(),
    updatedAt: inq.updatedAt.toISOString(),
  };
}

export class AdminInquiryService {
  constructor(private readonly db: PrismaClient) {}

  async listInquiriesWithStaff() {
    const [inquiries, adminUsers] = await Promise.all([
      this.db.inquiry.findMany({ orderBy: { createdAt: "desc" } }),
      this.db.user.findMany({
        where: {
          userRoles: {
            some: {
              role: {
                name: {
                  in: ["Admin", "ADMIN", "ORDER_MANAGER", "PRODUCT_MANAGER"],
                },
              },
            },
          },
        },
        select: { displayName: true, email: true },
      }),
    ]);

    const staffSet = new Set<string>(["Mr. Giang"]);
    for (const u of adminUsers) {
      staffSet.add(u.displayName || u.email);
    }

    return {
      inquiries: inquiries.map(serializeInquiry),
      staffNames: Array.from(staffSet),
    };
  }

  async listPaginated(params: { skip: number; take: number; status?: string; source?: string; search?: string }) {
    const where: Prisma.InquiryWhereInput = {
      ...(params.status && isInquiryStatus(params.status) ? { status: params.status } : {}),
      ...(params.source && isInquirySource(params.source) ? { source: params.source } : {}),
      ...(params.search
        ? {
            OR: [
              { name: { contains: params.search, mode: "insensitive" } },
              { phone: { contains: params.search, mode: "insensitive" } },
              { district: { contains: params.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.db.inquiry.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: "desc" },
      }),
      this.db.inquiry.count({ where }),
    ]);

    return { items: items.map(serializeInquiry), total };
  }

  async createInquiry(input: CreateInquiryInput, actorId?: string | number | null): Promise<SerializedInquiry> {
    const created = await this.db.inquiry.create({
      data: {
        name: input.name,
        phone: input.phone,
        district: input.district || null,
        city: input.city || "TP.HCM",
        roomType: input.roomType || null,
        budgetMin: input.budgetMin ?? null,
        budgetMax: input.budgetMax ?? null,
        note: input.note || null,
        source: input.source,
        assignedTo: input.assignedTo || null,
        status: "new",
      },
    });

    if (actorId !== undefined) {
      await recordAuditLog({
        actorId,
        action: "INQUIRY_CREATED",
        entity: "Inquiry",
        entityId: created.id,
        changes: {
          name: created.name,
          phone: created.phone,
          source: created.source,
        },
      });
    }

    return serializeInquiry(created);
  }

  async updateInquiry(
    inquiryId: number,
    patch: { status?: InquiryStatus; assignedTo?: string | null; note?: string | null },
    actorId?: string | number | null
  ): Promise<SerializedInquiry> {
    const updated = await this.db.inquiry.update({
      where: { id: inquiryId },
      data: {
        ...(patch.status !== undefined ? { status: patch.status } : {}),
        ...(patch.assignedTo !== undefined ? { assignedTo: patch.assignedTo || null } : {}),
        ...(patch.note !== undefined ? { note: patch.note || null } : {}),
      },
    });

    await recordAuditLog({
      actorId,
      action: "INQUIRY_UPDATED",
      entity: "Inquiry",
      entityId: updated.id,
      changes: patch,
    });

    return serializeInquiry(updated);
  }

  async deleteInquiry(inquiryId: number, actorId?: string | number | null): Promise<{ deleted: boolean }> {
    const existing = await this.db.inquiry.findUnique({
      where: { id: inquiryId },
      select: { id: true, name: true, phone: true },
    });

    if (!existing) {
      throw new Error("INQUIRY_NOT_FOUND");
    }

    await this.db.inquiry.delete({ where: { id: inquiryId } });

    await recordAuditLog({
      actorId,
      action: "INQUIRY_DELETED",
      entity: "Inquiry",
      entityId: existing.id,
      changes: { name: existing.name, phone: existing.phone },
    });

    return { deleted: true };
  }
}
