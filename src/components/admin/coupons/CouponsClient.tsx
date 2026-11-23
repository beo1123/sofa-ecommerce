"use client";

import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { IconEdit, IconPlus, IconSearch, IconSparkles, IconTrash } from "@tabler/icons-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge, { type BadgeVariant } from "@/components/ui/Badge";
import Drawer from "@/components/ui/Drawer";
import { formatDateVi, formatVnd } from "@/lib/format";
import { couponFormSchema, type CouponFormValues } from "@/lib/validators/coupon";
import { deleteCouponAction, saveCouponAction, toggleCouponActiveAction } from "@/app/(admin)/admin/coupons/actions";
import type { CouponType } from "@/lib/prisma";
import type { SerializedCoupon } from "@/components/admin/coupons/types";

interface CouponsClientProps {
  initialCoupons: SerializedCoupon[];
}

const COUPON_TYPE_LABELS: Record<CouponType, string> = {
  PERCENT: "Giảm %",
  FIXED: "Giảm tiền cố định",
  BOGO: "Mua 1 tặng 1",
};

const COUPON_TYPE_BADGE: Record<CouponType, BadgeVariant> = {
  PERCENT: "brand",
  FIXED: "info",
  BOGO: "success",
};

function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() < Date.now();
}

export default function CouponsClient({ initialCoupons }: CouponsClientProps) {
  const [coupons, setCoupons] = useState<SerializedCoupon[]>(initialCoupons);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "expired">("all");
  const [typeFilter, setTypeFilter] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<SerializedCoupon | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponFormSchema),
    defaultValues: {
      code: "",
      type: "PERCENT",
      amount: "",
      percent: "10",
      description: "",
      startsAt: "",
      expiresAt: "",
      usageLimit: "",
      usagePerUser: "1",
      active: true,
      metadataText: "",
    },
  });

  const watchedType = form.watch("type");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return coupons.filter((c) => {
      const expired = isExpired(c.expiresAt);
      if (statusFilter === "active" && (!c.active || expired)) return false;
      if (statusFilter === "inactive" && c.active) return false;
      if (statusFilter === "expired" && !expired) return false;
      if (typeFilter && c.type !== typeFilter) return false;
      if (!q) return true;
      return `${c.code} ${c.description ?? ""}`.toLowerCase().includes(q);
    });
  }, [coupons, search, statusFilter, typeFilter]);

  const openCreate = () => {
    setFeedbackError(null);
    setEditingCoupon(null);
    form.reset({
      code: "",
      type: "PERCENT",
      amount: "",
      percent: "10",
      description: "",
      startsAt: "",
      expiresAt: "",
      usageLimit: "",
      usagePerUser: "1",
      active: true,
      metadataText: "",
    });
    setDrawerOpen(true);
  };

  const openEdit = (coupon: SerializedCoupon) => {
    setFeedbackError(null);
    setEditingCoupon(coupon);
    form.reset({
      code: coupon.code,
      type: coupon.type,
      amount: coupon.amount !== null ? String(coupon.amount) : "",
      percent: coupon.percent !== null ? String(coupon.percent) : "",
      description: coupon.description ?? "",
      startsAt: toDatetimeLocal(coupon.startsAt),
      expiresAt: toDatetimeLocal(coupon.expiresAt),
      usageLimit: coupon.usageLimit !== null ? String(coupon.usageLimit) : "",
      usagePerUser: coupon.usagePerUser !== null ? String(coupon.usagePerUser) : "",
      active: coupon.active,
      metadataText: coupon.metadata ? JSON.stringify(coupon.metadata, null, 2) : "",
    });
    setDrawerOpen(true);
  };

  const handleGenerateCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let suffix = "";
    for (let i = 0; i < 5; i += 1) {
      suffix += chars[Math.floor(Math.random() * chars.length)];
    }
    form.setValue("code", `PG-${suffix}`, { shouldValidate: true });
  };

  const handleToggleActive = async (coupon: SerializedCoupon) => {
    setFeedbackError(null);
    const nextActive = !coupon.active;
    setCoupons((list) => list.map((c) => (c.id === coupon.id ? { ...c, active: nextActive } : c)));

    const res = await toggleCouponActiveAction(coupon.id, nextActive);
    if (!res.ok) {
      setCoupons((list) => list.map((c) => (c.id === coupon.id ? { ...c, active: coupon.active } : c)));
      setFeedbackError(res.error ?? "Không thể cập nhật trạng thái");
    }
  };

  const handleDelete = async (coupon: SerializedCoupon) => {
    if (!window.confirm(`Xóa mã khuyến mãi "${coupon.code}"?`)) return;
    setFeedbackError(null);
    const res = await deleteCouponAction(coupon.id);
    if (!res.ok) {
      setFeedbackError(res.error ?? "Không thể xóa mã khuyến mãi");
      return;
    }
    setCoupons((list) => list.filter((c) => c.id !== coupon.id));
  };

  const handleSave = form.handleSubmit(async (values) => {
    setFeedbackError(null);
    const metadataObj = values.metadataText ? (JSON.parse(values.metadataText) as Record<string, unknown>) : null;

    const res = await saveCouponAction({
      id: editingCoupon?.id,
      code: values.code.trim().toUpperCase(),
      type: values.type,
      amount: values.type === "FIXED" && values.amount ? Number(values.amount) : null,
      percent: values.type === "PERCENT" && values.percent ? Number(values.percent) : null,
      description: values.description || null,
      startsAt: values.startsAt ? new Date(values.startsAt).toISOString() : null,
      expiresAt: values.expiresAt ? new Date(values.expiresAt).toISOString() : null,
      usageLimit: values.usageLimit ? Number(values.usageLimit) : null,
      usagePerUser: values.usagePerUser ? Number(values.usagePerUser) : null,
      active: values.active,
      metadata: metadataObj,
    });

    if (!res.ok || !res.data) {
      setFeedbackError(res.error ?? "Lưu mã khuyến mãi thất bại");
      return;
    }

    const saved = res.data;
    setCoupons((list) => (editingCoupon ? list.map((c) => (c.id === saved.id ? saved : c)) : [saved, ...list]));
    setDrawerOpen(false);
  });

  return (
    <div className="space-y-4">
      {/* Status pills + Create CTA */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: "all", label: "Tất cả" },
              { id: "active", label: "Đang hoạt động" },
              { id: "inactive", label: "Tạm tắt" },
              { id: "expired", label: "Hết hạn" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={clsx(
                "rounded-[20px] border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                statusFilter === tab.id
                  ? "border-brand-400 bg-brand-400 text-white"
                  : "border-brand-100 bg-bg-page text-text-muted hover:border-brand-200"
              )}>
              {tab.label}
            </button>
          ))}
        </div>

        <Button variant="primary" size="sm" leftIcon={<IconPlus size={16} stroke={1.75} />} onClick={openCreate}>
          Tạo mã khuyến mãi
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 rounded-[12px] border border-brand-100 bg-bg-muted p-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center">
          <div className="w-full sm:max-w-xs">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm mã khuyến mãi, mô tả..."
              inputSize="sm"
              fullWidth
              leftIcon={<IconSearch size={16} stroke={1.75} />}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              selectSize="sm"
              fullWidth
              options={[
                { value: "", label: "Tất cả loại mã" },
                { value: "PERCENT", label: "Giảm %" },
                { value: "FIXED", label: "Giảm tiền cố định" },
                { value: "BOGO", label: "Mua 1 tặng 1 (BOGO)" },
              ]}
            />
          </div>
        </div>

        <p className="text-xs text-text-muted">
          Hiển thị <span className="font-semibold text-brand-400">{filtered.length}</span> / {coupons.length} mã
        </p>
      </div>

      {feedbackError && (
        <div role="alert" className="rounded-[8px] border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700">
          {feedbackError}
        </div>
      )}

      {/* Coupons table */}
      <div className="rounded-[12px] border border-brand-100 bg-bg-page">
        {filtered.length === 0 ? (
          <div className="px-6 py-14 text-center text-sm text-text-muted">Chưa có mã khuyến mãi nào phù hợp.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-brand-100 bg-bg-muted text-xs font-medium text-text-muted">
                  <th className="px-4 py-3">Mã code</th>
                  <th className="px-3 py-3">Loại</th>
                  <th className="px-3 py-3">Mức giảm</th>
                  <th className="px-3 py-3">Hết hạn</th>
                  <th className="px-3 py-3 text-right">Đã dùng</th>
                  <th className="px-3 py-3">Kích hoạt</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100/60">
                {filtered.map((coupon) => {
                  const expired = isExpired(coupon.expiresAt);
                  return (
                    <tr key={coupon.id} className="transition-colors hover:bg-brand-50/40">
                      <td className="px-4 py-3.5 align-top">
                        <span className="inline-flex rounded-[8px] border border-brand-100 bg-brand-50 px-2.5 py-1 font-mono text-xs font-bold text-brand-400">
                          {coupon.code}
                        </span>
                        {coupon.description && (
                          <p className="mt-1 max-w-[260px] truncate text-xs text-text-muted">{coupon.description}</p>
                        )}
                      </td>

                      <td className="px-3 py-3.5 align-top">
                        <Badge variant={COUPON_TYPE_BADGE[coupon.type]}>{COUPON_TYPE_LABELS[coupon.type]}</Badge>
                      </td>

                      <td className="px-3 py-3.5 align-top font-semibold text-brand-400 whitespace-nowrap">
                        {coupon.type === "PERCENT"
                          ? `${coupon.percent ?? 0}%`
                          : coupon.type === "FIXED"
                            ? formatVnd(coupon.amount ?? 0)
                            : "Tặng kèm (BOGO)"}
                      </td>

                      <td className="px-3 py-3.5 align-top text-xs whitespace-nowrap">
                        {coupon.expiresAt ? (
                          <div className="flex items-center gap-1.5">
                            <span className={expired ? "text-red-600 font-medium" : "text-text-default"}>
                              {formatDateVi(coupon.expiresAt)}
                            </span>
                            {expired && <Badge variant="danger">Hết hạn</Badge>}
                          </div>
                        ) : (
                          <span className="text-text-muted">Không giới hạn</span>
                        )}
                      </td>

                      <td className="px-3 py-3.5 align-top text-right text-xs whitespace-nowrap">
                        <span className="font-semibold text-brand-400">{coupon.timesUsed}</span>
                        {coupon.usageLimit !== null && <span className="text-text-muted"> / {coupon.usageLimit}</span>}
                      </td>

                      <td className="px-3 py-3.5 align-top">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={coupon.active}
                          aria-label={`Bật/tắt mã ${coupon.code}`}
                          onClick={() => handleToggleActive(coupon)}
                          className={clsx(
                            "relative inline-flex h-6 w-11 items-center rounded-full border transition-colors cursor-pointer",
                            coupon.active ? "border-brand-400 bg-brand-400" : "border-brand-100 bg-bg-muted"
                          )}>
                          <span
                            className={clsx(
                              "inline-block h-4 w-4 transform rounded-full bg-bg-page transition-transform",
                              coupon.active ? "translate-x-5" : "translate-x-1"
                            )}
                          />
                        </button>
                      </td>

                      <td className="px-4 py-3.5 align-top text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(coupon)}
                            title="Sửa mã"
                            aria-label={`Sửa ${coupon.code}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-brand-100 bg-bg-page text-brand-300 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-400 cursor-pointer">
                            <IconEdit size={16} stroke={1.75} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(coupon)}
                            title="Xóa mã"
                            aria-label={`Xóa ${coupon.code}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-brand-100 bg-bg-page text-red-600 hover:border-red-300 hover:bg-red-50 cursor-pointer">
                            <IconTrash size={16} stroke={1.75} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Coupon Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingCoupon ? `Chỉnh sửa mã ${editingCoupon.code}` : "Tạo mã khuyến mãi mới"}
        subtitle="Đầy đủ cấu hình giới hạn lượt dùng, thời gian hiệu lực và điều kiện áp dụng">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                label="Mã khuyến mãi (Code)"
                required
                placeholder="VD: SOFA10, TET2026"
                fullWidth
                error={form.formState.errors.code?.message}
                {...form.register("code")}
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handleGenerateCode}
              leftIcon={<IconSparkles size={15} stroke={1.75} />}>
              Tạo mã
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Select
              label="Loại khuyến mãi"
              fullWidth
              options={[
                { value: "PERCENT", label: "Giảm theo % (PERCENT)" },
                { value: "FIXED", label: "Giảm tiền cố định (FIXED)" },
                { value: "BOGO", label: "Mua 1 tặng 1 (BOGO)" },
              ]}
              {...form.register("type")}
            />

            {watchedType === "PERCENT" && (
              <Input
                label="Phần trăm giảm (%)"
                type="number"
                min={1}
                max={100}
                required
                placeholder="VD: 10"
                fullWidth
                error={form.formState.errors.percent?.message}
                {...form.register("percent")}
              />
            )}

            {watchedType === "FIXED" && (
              <Input
                label="Số tiền giảm (VND)"
                type="number"
                min={1000}
                step={50000}
                required
                placeholder="VD: 1000000"
                fullWidth
                error={form.formState.errors.amount?.message}
                {...form.register("amount")}
              />
            )}
          </div>

          <Input
            label="Mô tả chương trình"
            placeholder="VD: Giảm 10% cho đơn đặt đóng sofa từ 15 triệu"
            fullWidth
            {...form.register("description")}
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input label="Bắt đầu (startsAt)" type="datetime-local" fullWidth {...form.register("startsAt")} />
            <Input
              label="Hết hạn (expiresAt)"
              type="datetime-local"
              fullWidth
              error={form.formState.errors.expiresAt?.message}
              {...form.register("expiresAt")}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="Tổng lượt dùng tối đa"
              type="number"
              min={1}
              placeholder="Để trống = không giới hạn"
              fullWidth
              error={form.formState.errors.usageLimit?.message}
              {...form.register("usageLimit")}
            />
            <Input
              label="Giới hạn mỗi khách"
              type="number"
              min={1}
              placeholder="VD: 1"
              fullWidth
              error={form.formState.errors.usagePerUser?.message}
              {...form.register("usagePerUser")}
            />
          </div>

          <label className="inline-flex items-center gap-2 text-sm font-medium text-text-default cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-brand-200 accent-brand-400"
              {...form.register("active")}
            />
            <span>Kích hoạt mã ngay sau khi lưu</span>
          </label>

          <div>
            <label htmlFor="coupon-metadata" className="block text-sm font-medium text-text-default mb-1.5">
              Metadata JSON (tùy chọn)
            </label>
            <textarea
              id="coupon-metadata"
              rows={3}
              placeholder='{"minOrderAmount": 15000000}'
              className="block w-full rounded-[8px] border border-brand-100 bg-bg-page px-3 py-2 font-mono text-xs text-text-default focus:border-brand-300 focus:outline-none focus:ring-[3px] focus:ring-brand-50"
              {...form.register("metadataText")}
            />
            {form.formState.errors.metadataText?.message && (
              <p className="mt-1 text-xs text-red-600">{form.formState.errors.metadataText.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setDrawerOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={form.formState.isSubmitting}>
              {editingCoupon ? "Cập nhật mã" : "Tạo mã"}
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
