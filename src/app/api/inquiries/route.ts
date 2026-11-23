import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createInquirySchema } from "@/lib/validators/inquiry";
import { formatVndCompact } from "@/lib/format";

async function sendOptionalAdminNotification(inquiry: {
  id: number;
  name: string;
  phone: string;
  district: string | null;
  city: string;
  roomType: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  note: string | null;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.ADMIN_NOTIFY_EMAIL || process.env.ADMIN_EMAIL;
  if (!apiKey || !toEmail) return;

  const budgetText =
    inquiry.budgetMin && inquiry.budgetMax
      ? `${formatVndCompact(inquiry.budgetMin)} – ${formatVndCompact(inquiry.budgetMax)}`
      : inquiry.budgetMin
        ? `Từ ${formatVndCompact(inquiry.budgetMin)}`
        : inquiry.budgetMax
          ? `Đến ${formatVndCompact(inquiry.budgetMax)}`
          : "Chưa chọn";

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.NOTIFY_FROM_EMAIL || "Sofa Pham Gia <no-reply@sofaphamgia.com>",
        to: [toEmail],
        subject: `[Lead mới #${inquiry.id}] ${inquiry.name} – ${inquiry.phone}`,
        text: [
          `Khách hàng: ${inquiry.name}`,
          `SĐT: ${inquiry.phone}`,
          `Khu vực: ${inquiry.district ? `${inquiry.district}, ` : ""}${inquiry.city}`,
          `Loại phòng: ${inquiry.roomType || "Chưa chọn"}`,
          `Ngân sách: ${budgetText}`,
          `Ghi chú: ${inquiry.note || "Không có"}`,
        ].join("\n"),
      }),
    });
  } catch (err) {
    console.warn("[POST /api/inquiries] Admin email notification skipped:", err);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = createInquirySchema.safeParse({
      ...body,
      source: body?.source || "web",
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: parsed.error.issues[0]?.message ?? "Vui lòng kiểm tra lại thông tin liên hệ",
          issues: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const d = parsed.data;

    const created = await prisma.inquiry.create({
      data: {
        name: d.name,
        phone: d.phone,
        district: d.district || null,
        city: d.city || "TP.HCM",
        roomType: d.roomType || null,
        budgetMin: d.budgetMin ?? null,
        budgetMax: d.budgetMax ?? null,
        note: d.note || null,
        source: d.source,
        status: "new",
      },
      select: {
        id: true,
        name: true,
        phone: true,
        district: true,
        city: true,
        roomType: true,
        budgetMin: true,
        budgetMax: true,
        note: true,
        createdAt: true,
      },
    });

    void sendOptionalAdminNotification(created);

    revalidatePath("/admin/inquiries");
    revalidatePath("/admin");

    return NextResponse.json(
      {
        ok: true,
        data: {
          id: created.id,
          name: created.name,
          phone: created.phone,
          createdAt: created.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/inquiries]", err);
    return NextResponse.json(
      { ok: false, error: "Không thể gửi yêu cầu tư vấn lúc này. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}
