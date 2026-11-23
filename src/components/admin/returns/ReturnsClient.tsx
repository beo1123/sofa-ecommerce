"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import {
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconCurrencyDong,
  IconPhoto,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import StatusBadge from "@/components/ui/StatusBadge";
import Drawer from "@/components/ui/Drawer";
import { formatDateTimeVi, formatDateVi, formatVnd } from "@/lib/format";
import { refundFormSchema, type RefundFormValues } from "@/lib/validators/return";
import { updateReturnStatusAction, upsertRefundAction } from "@/app/(admin)/admin/returns/actions";
import type { ReturnStatus } from "@/lib/prisma";
import type { SerializedRefund, SerializedReturnRequest } from "@/components/admin/returns/types";

interface ReturnsClientProps {
  initialReturns: SerializedReturnRequest[];
  initialRefunds: SerializedRefund[];
}

const RETURN_STATUS_TABS: Array<{ value: string; label: string }> = [
  { value: "", label: "Tất cả" },
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "RECEIVED", label: "Đã nhận hàng" },
  { value: "REJECTED", label: "Từ chối" },
];

const RETURN_STATUS_OPTIONS: Array<{ value: ReturnStatus; label: string }> = [
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "RECEIVED", label: "Đã nhận hàng" },
  { value: "REJECTED", label: "Từ chối" },
];

const REFUND_METHOD_OPTIONS = [
  { value: "Chuyển khoản ngân hàng", label: "Chuyển khoản ngân hàng" },
  { value: "VNPAY", label: "Hoàn tiền VNPay" },
  { value: "Tiền mặt", label: "Tiền mặt tại xưởng" },
  { value: "Ví điện tử", label: "Ví điện tử" },
];

const REFUND_STATUS_OPTIONS = [
  { value: "PENDING", label: "Chờ hoàn tiền" },
  { value: "COMPLETED", label: "Đã hoàn tiền" },
  { value: "FAILED", label: "Thất bại" },
];

export default function ReturnsClient({ initialReturns, initialRefunds }: ReturnsClientProps) {
  const [returns, setReturns] = useState<SerializedReturnRequest[]>(initialReturns);
  const [refunds, setRefunds] = useState<SerializedRefund[]>(initialRefunds);
  const [activeView, setActiveView] = useState<"returns" | "refunds">("returns");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selectedReturnId, setSelectedReturnId] = useState<number | null>(null);
  const [lightboxState, setLightboxState] = useState<{
    urls: string[];
    index: number;
  } | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [refundSavedMsg, setRefundSavedMsg] = useState<string | null>(null);

  const refundForm = useForm<RefundFormValues>({
    resolver: zodResolver(refundFormSchema),
    defaultValues: {
      amount: "",
      method: "Chuyển khoản ngân hàng",
      status: "PENDING",
      providerRef: "",
    },
  });

  const selectedReturn = useMemo(
    () => returns.find((r) => r.id === selectedReturnId) ?? null,
    [returns, selectedReturnId]
  );

  // Sync refund form when selecting a ReturnRequest
  useEffect(() => {
    if (!selectedReturn) return;
    setRefundSavedMsg(null);
    setFeedbackError(null);
    refundForm.reset({
      amount: String(selectedReturn.refund?.amount ?? selectedReturn.itemTotal),
      method: selectedReturn.refund?.method ?? "Chuyển khoản ngân hàng",
      status: selectedReturn.refund?.status ?? "PENDING",
      providerRef: selectedReturn.refund?.providerRef ?? "",
    });
  }, [selectedReturn?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Escape & arrow navigation for lightbox
  useEffect(() => {
    if (!lightboxState) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxState(null);
      if (e.key === "ArrowLeft") {
        setLightboxState((prev) =>
          prev
            ? {
                ...prev,
                index: (prev.index - 1 + prev.urls.length) % prev.urls.length,
              }
            : null
        );
      }
      if (e.key === "ArrowRight") {
        setLightboxState((prev) => (prev ? { ...prev, index: (prev.index + 1) % prev.urls.length } : null));
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [lightboxState]);

  const filteredReturns = useMemo(() => {
    const q = search.trim().toLowerCase();
    return returns.filter((item) => {
      if (statusFilter && item.status !== statusFilter) return false;
      if (!q) return true;
      return [item.orderNumber, item.recipientName, item.phone, item.itemName, item.reason]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [returns, statusFilter, search]);

  const handleReturnStatusChange = async (returnRequestId: number, nextStatus: ReturnStatus) => {
    setFeedbackError(null);
    const prev = returns.find((r) => r.id === returnRequestId);
    if (!prev) return;

    setReturns((list) => list.map((r) => (r.id === returnRequestId ? { ...r, status: nextStatus } : r)));

    const res = await updateReturnStatusAction(returnRequestId, nextStatus);
    if (!res.ok || !res.data) {
      setReturns((list) => list.map((r) => (r.id === returnRequestId ? prev : r)));
      setFeedbackError(res.error ?? "Cập nhật trạng thái thất bại");
      return;
    }

    const updated = res.data;
    setReturns((list) =>
      list.map((r) =>
        r.id === returnRequestId ? { ...r, status: updated.status, processedAt: updated.processedAt } : r
      )
    );
  };

  const handleSaveRefund = refundForm.handleSubmit(async (values) => {
    if (!selectedReturn) return;
    setFeedbackError(null);
    setRefundSavedMsg(null);

    const res = await upsertRefundAction({
      returnRequestId: selectedReturn.id,
      orderId: selectedReturn.orderId,
      amount: Number(values.amount),
      method: values.method,
      status: values.status,
      providerRef: values.providerRef || null,
    });

    if (!res.ok || !res.data) {
      setFeedbackError(res.error ?? "Lưu hoàn tiền thất bại");
      return;
    }

    const savedRefund = res.data;
    setReturns((list) => list.map((r) => (r.id === selectedReturn.id ? { ...r, refund: savedRefund } : r)));
    setRefunds((list) => {
      const exists = list.some((rf) => rf.id === savedRefund.id);
      return exists ? list.map((rf) => (rf.id === savedRefund.id ? savedRefund : rf)) : [savedRefund, ...list];
    });
    setRefundSavedMsg("Đã lưu thông tin hoàn tiền");
  });

  return (
    <div className="space-y-4">
      {/* Sub-module switcher: ReturnRequest vs Refund */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-100 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveView("returns")}
            className={clsx(
              "rounded-[8px] border px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer",
              activeView === "returns"
                ? "border-brand-400 bg-brand-400 text-white"
                : "border-brand-100 bg-bg-page text-text-default hover:border-brand-200 hover:bg-brand-50/60"
            )}>
            Yêu cầu bảo hành / đổi trả ({returns.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveView("refunds")}
            className={clsx(
              "rounded-[8px] border px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer",
              activeView === "refunds"
                ? "border-brand-400 bg-brand-400 text-white"
                : "border-brand-100 bg-bg-page text-text-default hover:border-brand-200 hover:bg-brand-50/60"
            )}>
            Lịch sử hoàn tiền ({refunds.length})
          </button>
        </div>
      </div>

      {feedbackError && (
        <div role="alert" className="rounded-[8px] border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700">
          {feedbackError}
        </div>
      )}

      {/* VIEW 1: RETURN REQUESTS */}
      {activeView === "returns" && (
        <div className="space-y-4">
          {/* Status filter pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {RETURN_STATUS_TABS.map((tab) => {
              const count = tab.value === "" ? returns.length : returns.filter((r) => r.status === tab.value).length;
              const active = statusFilter === tab.value;
              return (
                <button
                  key={tab.value || "all"}
                  type="button"
                  onClick={() => setStatusFilter(tab.value)}
                  className={clsx(
                    "inline-flex items-center gap-1.5 rounded-[20px] border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                    active
                      ? "border-brand-400 bg-brand-50 text-brand-400"
                      : "border-brand-100 bg-bg-page text-text-muted hover:border-brand-200 hover:bg-brand-50/40"
                  )}>
                  <span>{tab.label}</span>
                  <span>({count})</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-3 rounded-[12px] border border-brand-100 bg-bg-muted p-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full sm:max-w-sm">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm mã đơn, tên sản phẩm, khách hàng, lý do..."
                inputSize="sm"
                fullWidth
                leftIcon={<IconSearch size={16} stroke={1.75} />}
              />
            </div>
            <p className="text-xs text-text-muted">
              Hiển thị <span className="font-semibold text-brand-400">{filteredReturns.length}</span> yêu cầu
            </p>
          </div>

          <div className="rounded-[12px] border border-brand-100 bg-bg-page">
            {filteredReturns.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <p className="text-sm font-medium text-brand-400">Chưa có yêu cầu bảo hành / đổi trả nào</p>
                <p className="mt-1 text-xs text-text-muted">
                  Các phiếu bảo hành khung, đệm, bọc da hoặc đổi trả từ đơn hàng sẽ hiển thị tại đây.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1040px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-brand-100 bg-bg-muted text-xs font-medium text-text-muted">
                      <th className="px-4 py-3">Mã đơn</th>
                      <th className="px-3 py-3">Sản phẩm</th>
                      <th className="px-3 py-3">Lý do</th>
                      <th className="px-3 py-3">Trạng thái</th>
                      <th className="px-3 py-3">Hình ảnh minh chứng</th>
                      <th className="px-3 py-3">Ngày gửi</th>
                      <th className="px-3 py-3">Ngày xử lý</th>
                      <th className="px-4 py-3">Hoàn tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-100/60">
                    {filteredReturns.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedReturnId(item.id)}
                        className={clsx(
                          "transition-colors hover:bg-brand-50/40 cursor-pointer",
                          selectedReturnId === item.id && "bg-brand-50/60"
                        )}>
                        <td className="px-4 py-3.5 align-top">
                          <Link
                            href={`/admin/orders?orderId=${item.orderId}`}
                            onClick={(e) => e.stopPropagation()}
                            className="font-semibold text-brand-400 hover:text-brand-300 hover:underline">
                            {item.orderNumber}
                          </Link>
                          <p className="text-xs text-text-muted">
                            {item.recipientName} · {item.phone}
                          </p>
                        </td>

                        <td className="max-w-[200px] px-3 py-3.5 align-top">
                          <p className="truncate font-medium text-text-default">{item.itemName}</p>
                          <p className="text-xs text-text-muted">
                            SL {item.itemQuantity} · {formatVnd(item.itemTotal)}
                          </p>
                        </td>

                        <td className="max-w-[220px] px-3 py-3.5 align-top text-xs text-text-default">
                          <p className="line-clamp-2">{item.reason}</p>
                        </td>

                        <td className="px-3 py-3.5 align-top" onClick={(e) => e.stopPropagation()}>
                          <div className="flex flex-col gap-1">
                            <StatusBadge domain="return" status={item.status} />
                            <select
                              aria-label={`Đổi trạng thái phiếu #${item.id}`}
                              value={item.status}
                              onChange={(e) => handleReturnStatusChange(item.id, e.target.value as ReturnStatus)}
                              className="h-7 rounded-[8px] border border-brand-100 bg-bg-page px-2 text-xs text-text-default focus:border-brand-300 focus:outline-none cursor-pointer">
                              {RETURN_STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>

                        <td className="px-3 py-3.5 align-top" onClick={(e) => e.stopPropagation()}>
                          {item.evidenceUrls.length === 0 ? (
                            <span className="text-xs text-text-muted">Không có</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                setLightboxState({
                                  urls: item.evidenceUrls,
                                  index: 0,
                                })
                              }
                              className="inline-flex items-center gap-1.5 rounded-[8px] border border-brand-100 bg-bg-muted px-2.5 py-1.5 text-xs font-medium text-brand-400 transition-colors hover:border-brand-300 hover:bg-brand-50 cursor-pointer">
                              <IconPhoto size={15} stroke={1.75} />
                              <span>Xem {item.evidenceUrls.length} ảnh</span>
                            </button>
                          )}
                        </td>

                        <td className="px-3 py-3.5 align-top text-xs whitespace-nowrap text-text-muted">
                          {formatDateVi(item.requestedAt)}
                        </td>

                        <td className="px-3 py-3.5 align-top text-xs whitespace-nowrap text-text-muted">
                          {formatDateVi(item.processedAt)}
                        </td>

                        <td className="px-4 py-3.5 align-top whitespace-nowrap">
                          {item.refund ? (
                            <div className="space-y-1">
                              <StatusBadge domain="refund" status={item.refund.status} />
                              <p className="text-xs font-semibold text-brand-400">{formatVnd(item.refund.amount)}</p>
                            </div>
                          ) : (
                            <span className="text-xs text-brand-300 underline">Tạo phiếu hoàn</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: REFUNDS SUB-PANEL TABLE */}
      {activeView === "refunds" && (
        <div className="rounded-[12px] border border-brand-100 bg-bg-page">
          {refunds.length === 0 ? (
            <div className="px-6 py-14 text-center text-sm text-text-muted">Chưa có giao dịch hoàn tiền nào.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-brand-100 bg-bg-muted text-xs font-medium text-text-muted">
                    <th className="px-4 py-3">Mã đơn</th>
                    <th className="px-3 py-3 text-right">Số tiền hoàn</th>
                    <th className="px-3 py-3">Phương thức</th>
                    <th className="px-3 py-3">Trạng thái</th>
                    <th className="px-3 py-3">Mã tham chiếu (providerRef)</th>
                    <th className="px-4 py-3 text-right">Ngày xử lý</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-100/60">
                  {refunds.map((rf) => (
                    <tr key={rf.id} className="transition-colors hover:bg-brand-50/40">
                      <td className="px-4 py-3.5 font-semibold text-brand-400">
                        <Link
                          href={`/admin/orders?orderId=${rf.orderId}`}
                          className="hover:text-brand-300 hover:underline">
                          {rf.orderNumber}
                        </Link>
                      </td>
                      <td className="px-3 py-3.5 text-right font-semibold text-brand-400">{formatVnd(rf.amount)}</td>
                      <td className="px-3 py-3.5 text-xs text-text-default">{rf.method}</td>
                      <td className="px-3 py-3.5">
                        <StatusBadge domain="refund" status={rf.status} />
                      </td>
                      <td className="px-3 py-3.5 font-mono text-xs text-text-muted">{rf.providerRef ?? "—"}</td>
                      <td className="px-4 py-3.5 text-right text-xs text-text-muted">
                        {formatDateTimeVi(rf.processedAt ?? rf.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Detail + Refund Sub-panel Drawer */}
      <Drawer
        open={Boolean(selectedReturn)}
        onClose={() => setSelectedReturnId(null)}
        title={selectedReturn ? `Phiếu đổi trả / bảo hành · ${selectedReturn.orderNumber}` : ""}
        subtitle={selectedReturn ? `Gửi lúc ${formatDateTimeVi(selectedReturn.requestedAt)}` : undefined}>
        {selectedReturn && (
          <div className="space-y-6">
            {/* Return request overview */}
            <section className="rounded-[12px] border border-brand-100 bg-bg-muted p-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-brand-400">{selectedReturn.itemName}</span>
                <StatusBadge domain="return" status={selectedReturn.status} />
              </div>
              <p className="text-text-muted">
                Khách hàng: {selectedReturn.recipientName} · {selectedReturn.phone}
              </p>
              <div className="rounded-[8px] border border-brand-100 bg-bg-page p-3 text-text-default">
                <p className="text-[11px] font-medium text-text-muted mb-1">Lý do yêu cầu:</p>
                <p>{selectedReturn.reason}</p>
              </div>

              {selectedReturn.evidenceUrls.length > 0 && (
                <div className="pt-1">
                  <p className="mb-2 text-[11px] font-medium text-text-muted">
                    Ảnh minh chứng ({selectedReturn.evidenceUrls.length})
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedReturn.evidenceUrls.map((url, idx) => (
                      <button
                        key={url}
                        type="button"
                        onClick={() =>
                          setLightboxState({
                            urls: selectedReturn.evidenceUrls,
                            index: idx,
                          })
                        }
                        className="aspect-[4/3] overflow-hidden rounded-[8px] border border-brand-100 bg-brand-50 cursor-pointer">
                        <img src={url} alt={`Minh chứng ${idx + 1}`} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Refund Sub-panel Form */}
            <section className="rounded-[12px] border border-brand-100 bg-bg-page p-4 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-300">
                  <IconCurrencyDong size={15} stroke={1.75} />
                  <span>Xử lý hoàn tiền (Refund)</span>
                </h3>
                {selectedReturn.refund && <StatusBadge domain="refund" status={selectedReturn.refund.status} />}
              </div>

              <form onSubmit={handleSaveRefund} className="space-y-3">
                <Input
                  label="Số tiền hoàn (VND)"
                  type="number"
                  min={1000}
                  step={50000}
                  fullWidth
                  error={refundForm.formState.errors.amount?.message}
                  {...refundForm.register("amount")}
                />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Select
                    label="Phương thức hoàn"
                    fullWidth
                    options={REFUND_METHOD_OPTIONS}
                    {...refundForm.register("method")}
                  />
                  <Select
                    label="Trạng thái hoàn tiền"
                    fullWidth
                    options={REFUND_STATUS_OPTIONS}
                    {...refundForm.register("status")}
                  />
                </div>

                <Input
                  label="Mã tham chiếu giao dịch (providerRef)"
                  placeholder="VD: VNPAY-20261123-XXXX hoặc mã lệnh CK"
                  fullWidth
                  {...refundForm.register("providerRef")}
                />

                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="text-xs">
                    {refundSavedMsg && (
                      <span className="inline-flex items-center gap-1 text-green-700">
                        <IconCheck size={14} stroke={1.75} />
                        {refundSavedMsg}
                      </span>
                    )}
                  </div>
                  <Button type="submit" variant="primary" size="sm" loading={refundForm.formState.isSubmitting}>
                    {selectedReturn.refund ? "Cập nhật hoàn tiền" : "Tạo phiếu hoàn tiền"}
                  </Button>
                </div>
              </form>
            </section>
          </div>
        )}
      </Drawer>

      {/* Evidence Lightbox */}
      {lightboxState && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Xem ảnh minh chứng"
          onClick={() => setLightboxState(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-400/75 p-4 backdrop-blur-xs animate-fadeIn">
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[12px] border border-brand-100 bg-bg-page">
            <div className="flex items-center justify-between border-b border-brand-100 px-4 py-3">
              <span className="text-xs font-semibold text-brand-400">
                Ảnh minh chứng {lightboxState.index + 1} / {lightboxState.urls.length}
              </span>
              <button
                type="button"
                onClick={() => setLightboxState(null)}
                aria-label="Đóng lightbox"
                className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] text-text-muted hover:bg-brand-50 hover:text-brand-400 cursor-pointer">
                <IconX size={18} stroke={1.75} />
              </button>
            </div>

            <div className="relative flex items-center justify-center bg-bg-muted p-4">
              <img
                src={lightboxState.urls[lightboxState.index]}
                alt={`Minh chứng ${lightboxState.index + 1}`}
                className="max-h-[70vh] w-auto rounded-[8px] object-contain"
              />

              {lightboxState.urls.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Ảnh trước"
                    onClick={() =>
                      setLightboxState((prev) =>
                        prev
                          ? {
                              ...prev,
                              index: (prev.index - 1 + prev.urls.length) % prev.urls.length,
                            }
                          : null
                      )
                    }
                    className="absolute left-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-brand-100 bg-bg-page text-brand-400 hover:bg-brand-50 cursor-pointer">
                    <IconChevronLeft size={18} stroke={1.75} />
                  </button>
                  <button
                    type="button"
                    aria-label="Ảnh tiếp theo"
                    onClick={() =>
                      setLightboxState((prev) =>
                        prev
                          ? {
                              ...prev,
                              index: (prev.index + 1) % prev.urls.length,
                            }
                          : null
                      )
                    }
                    className="absolute right-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-brand-100 bg-bg-page text-brand-400 hover:bg-brand-50 cursor-pointer">
                    <IconChevronRight size={18} stroke={1.75} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
