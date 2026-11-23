"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { IconBrandWhatsapp, IconCheck, IconPhone, IconSend } from "@tabler/icons-react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

const consultationSchema = z.object({
  name: z.string().trim().min(2, "Vui lòng nhập họ tên (tối thiểu 2 ký tự)").max(120),
  phone: z
    .string()
    .trim()
    .min(8, "Vui lòng nhập số điện thoại hợp lệ")
    .max(20)
    .regex(/^[0-9+\s().-]+$/, "Số điện thoại không hợp lệ"),
  district: z.string().trim().max(100).optional(),
  roomType: z.string().trim().max(100).optional(),
  budgetRange: z.string().trim().optional(),
  note: z.string().trim().max(2000).optional(),
});

type ConsultationFormValues = z.infer<typeof consultationSchema>;

const HCMC_DISTRICT_OPTIONS = [
  { value: "", label: "Chọn Quận / Huyện" },
  { value: "Quận 1", label: "Quận 1" },
  { value: "Quận 3", label: "Quận 3" },
  { value: "Quận 4", label: "Quận 4" },
  { value: "Quận 5", label: "Quận 5" },
  { value: "Quận 6", label: "Quận 6" },
  { value: "Quận 7", label: "Quận 7" },
  { value: "Quận 8", label: "Quận 8" },
  { value: "Quận 10", label: "Quận 10" },
  { value: "Quận 11", label: "Quận 11" },
  { value: "Quận 12", label: "Quận 12" },
  { value: "TP. Thủ Đức", label: "TP. Thủ Đức" },
  { value: "Bình Thạnh", label: "Quận Bình Thạnh" },
  { value: "Gò Vấp", label: "Quận Gò Vấp" },
  { value: "Phú Nhuận", label: "Quận Phú Nhuận" },
  { value: "Tân Bình", label: "Quận Tân Bình" },
  { value: "Tân Phú", label: "Quận Tân Phú" },
  { value: "Bình Tân", label: "Quận Bình Tân" },
  { value: "Bình Chánh", label: "Huyện Bình Chánh" },
  { value: "Nhà Bè", label: "Huyện Nhà Bè" },
  { value: "Hóc Môn", label: "Huyện Hóc Môn" },
  { value: "Củ Chi", label: "Huyện Củ Chi" },
  { value: "Tỉnh / Thành khác", label: "Tỉnh / Thành phố khác" },
];

const ROOM_TYPE_OPTIONS = [
  { value: "", label: "Chọn loại không gian" },
  { value: "Phòng khách chung cư", label: "Phòng khách chung cư" },
  { value: "Phòng khách nhà phố", label: "Phòng khách nhà phố" },
  { value: "Biệt thự / Villa", label: "Biệt thự / Villa" },
  { value: "Phòng ngủ / Sofa giường", label: "Phòng ngủ / Sofa giường" },
  { value: "Văn phòng / Showroom", label: "Văn phòng / Showroom" },
  { value: "Café / Lounge", label: "Café / Lounge" },
];

const BUDGET_RANGE_MAP: Record<string, { label: string; min: number | null; max: number | null }> = {
  under_10: { label: "Dưới 10 triệu", min: null, max: 10_000_000 },
  "10_20": { label: "10 – 20 triệu", min: 10_000_000, max: 20_000_000 },
  "20_35": { label: "20 – 35 triệu", min: 20_000_000, max: 35_000_000 },
  "35_50": { label: "35 – 50 triệu", min: 35_000_000, max: 50_000_000 },
  over_50: { label: "Trên 50 triệu", min: 50_000_000, max: null },
};

const BUDGET_OPTIONS = [
  { value: "", label: "Chọn khoảng ngân sách dự kiến" },
  ...Object.entries(BUDGET_RANGE_MAP).map(([value, cfg]) => ({
    value,
    label: cfg.label,
  })),
];

interface ConsultationFormProps {
  initialNote?: string;
}

export default function ConsultationForm({ initialNote = "" }: ConsultationFormProps) {
  const [submittedId, setSubmittedId] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<ConsultationFormValues>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      name: "",
      phone: "",
      district: "",
      roomType: "",
      budgetRange: "",
      note: initialNote,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);
    const budget = values.budgetRange ? BUDGET_RANGE_MAP[values.budgetRange] : undefined;

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          phone: values.phone,
          district: values.district || null,
          city: values.district === "Tỉnh / Thành khác" ? "Khác" : "TP.HCM",
          roomType: values.roomType || null,
          budgetMin: budget?.min ?? null,
          budgetMax: budget?.max ?? null,
          note: values.note || null,
          source: "web",
        }),
      });
      const json = await res.json();

      if (!res.ok || !json?.ok) {
        setSubmitError(json?.error ?? "Không thể gửi yêu cầu. Vui lòng thử lại.");
        return;
      }

      setSubmittedId(json.data.id as number);
      form.reset({
        name: "",
        phone: "",
        district: "",
        roomType: "",
        budgetRange: "",
        note: "",
      });
    } catch {
      setSubmitError("Lỗi kết nối mạng. Vui lòng thử lại hoặc gọi 0932 111 620.");
    }
  });

  if (submittedId !== null) {
    return (
      <div className="rounded-[12px] border border-brand-200 bg-bg-muted p-6 sm:p-8 text-center space-y-4 animate-fadeIn">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-400 text-white">
          <IconCheck size={24} stroke={2} />
        </span>
        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-brand-400">Đã tiếp nhận yêu cầu tư vấn (#{submittedId})</h2>
          <p className="mx-auto max-w-md text-sm text-text-muted">
            Cảm ơn anh/chị đã liên hệ Xưởng Sofa Phạm Gia. Mr. Giang và đội ngũ kỹ thuật sẽ liên hệ báo giá & gửi mẫu
            da/vải trong vòng 15–30 phút.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
          <a
            href="https://zalo.me/0932111620"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-[8px] bg-brand-400 px-4 text-sm font-semibold text-white hover:bg-brand-300">
            <IconBrandWhatsapp size={17} stroke={1.75} />
            <span>Nhắn Zalo ngay</span>
          </a>
          <a
            href="tel:0932111620"
            className="inline-flex h-10 items-center gap-2 rounded-[8px] border border-brand-300 bg-bg-page px-4 text-sm font-semibold text-brand-400 hover:bg-brand-50">
            <IconPhone size={17} stroke={1.75} />
            <span>Gọi 0932 111 620</span>
          </a>
        </div>

        <div className="pt-2">
          <Button variant="ghost" size="sm" onClick={() => setSubmittedId(null)}>
            Gửi thêm yêu cầu khác
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-brand-400">Đăng ký tư vấn & báo giá tại xưởng</h2>
        <p className="mt-1 text-xs text-text-muted">
          Điền thông tin bên dưới để nhận tư vấn kích thước chuẩn phòng khách, bảng màu da/vải và báo giá trực tiếp
          không qua trung gian.
        </p>
      </div>

      {submitError && (
        <div role="alert" className="rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {submitError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Họ và tên"
          required
          placeholder="VD: Anh Minh / Chị Lan"
          fullWidth
          error={form.formState.errors.name?.message}
          {...form.register("name")}
        />
        <Input
          label="Số điện thoại (Zalo)"
          required
          type="tel"
          placeholder="0932 xxx xxx"
          fullWidth
          error={form.formState.errors.phone?.message}
          {...form.register("phone")}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select label="Quận / Huyện" fullWidth options={HCMC_DISTRICT_OPTIONS} {...form.register("district")} />
        <Select label="Loại phòng" fullWidth options={ROOM_TYPE_OPTIONS} {...form.register("roomType")} />
      </div>

      <Select label="Ngân sách dự kiến" fullWidth options={BUDGET_OPTIONS} {...form.register("budgetRange")} />

      <div>
        <label htmlFor="consultation-note" className="block text-sm font-medium text-text-default mb-1.5">
          Ghi chú kích thước, mẫu sofa hoặc chất liệu mong muốn
        </label>
        <textarea
          id="consultation-note"
          rows={4}
          placeholder="VD: Phòng khách dài 3m2, cần sofa góc chữ L 2m6 bọc da Microfiber màu kem, nhà chung cư tầng 12 có thang máy..."
          className="block w-full rounded-[8px] border border-brand-100 bg-bg-page px-3 py-2 text-sm text-text-default placeholder:text-text-muted/70 transition-colors hover:border-brand-200 focus:border-brand-300 focus:outline-none focus:ring-[3px] focus:ring-brand-50"
          {...form.register("note")}
        />
        {form.formState.errors.note?.message && (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {form.formState.errors.note.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={form.formState.isSubmitting}
        leftIcon={<IconSend size={17} stroke={1.75} />}>
        Gửi yêu cầu tư vấn miễn phí
      </Button>

      <p className="text-center text-xs text-text-muted">Miễn phí tư vấn & gửi mẫu da/vải tận nơi khu vực TP.HCM.</p>
    </form>
  );
}
