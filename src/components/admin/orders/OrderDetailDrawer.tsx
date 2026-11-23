"use client";

import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconPrinter,
  IconExternalLink,
  IconTruckDelivery,
  IconCash,
  IconHistory,
  IconNotes,
  IconPlus,
  IconCheck,
  IconRuler2,
  IconMapPin,
  IconPhone,
  IconUser,
} from "@tabler/icons-react";
import Drawer from "@/components/ui/Drawer";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import StatusBadge from "@/components/ui/StatusBadge";
import WorkshopStatusPopover from "@/components/admin/orders/WorkshopStatusPopover";
import { formatDateInputValue, formatDateTimeVi, formatDateVi, formatVnd } from "@/lib/format";
import { formatDimensionsMeters } from "@/lib/dimensions";
import { SHIPMENT_STATUSES, SHIPMENT_STATUS_LABELS, type WorkshopStatus } from "@/lib/workshop-types";
import {
  depositFormSchema,
  shipmentFormSchema,
  type DepositFormValues,
  type ShipmentFormValues,
} from "@/lib/validators/order";
import {
  addOrderDepositAction,
  updateOrderInternalNoteAction,
  upsertOrderShipmentAction,
} from "@/app/(admin)/admin/orders/actions";
import type { SerializedAdminOrder } from "@/components/admin/orders/types";

interface OrderDetailDrawerProps {
  order: SerializedAdminOrder | null;
  onClose: () => void;
  onOrderPatched: (orderId: number, updater: (prev: SerializedAdminOrder) => SerializedAdminOrder) => void;
}

const DEPOSIT_METHOD_OPTIONS = [
  { label: "Chuyển khoản ngân hàng", value: "Chuyển khoản" },
  { label: "Tiền mặt tại xưởng", value: "Tiền mặt" },
  { label: "VNPay", value: "VNPAY" },
  { label: "Momo / Ví điện tử", value: "Ví điện tử" },
];

const SHIPMENT_STATUS_OPTIONS = SHIPMENT_STATUSES.map((s) => ({
  value: s,
  label: SHIPMENT_STATUS_LABELS[s],
}));

export default function OrderDetailDrawer({ order, onClose, onOrderPatched }: OrderDetailDrawerProps) {
  // Debounced autosave state for internalNote
  const [noteValue, setNoteValue] = useState("");
  const [noteSaveState, setNoteSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const lastSavedNoteRef = useRef<string>("");

  // Shipment feedback
  const [shipmentMessage, setShipmentMessage] = useState<string | null>(null);
  const [shipmentError, setShipmentError] = useState<string | null>(null);

  // Deposit feedback
  const [depositError, setDepositError] = useState<string | null>(null);
  const [depositSuccess, setDepositSuccess] = useState<string | null>(null);

  // PDF generation state
  const [printingPdf, setPrintingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const shipmentForm = useForm<ShipmentFormValues>({
    resolver: zodResolver(shipmentFormSchema),
    defaultValues: {
      scheduledDate: "",
      driverName: "",
      needsCrane: false,
      buildingFloor: "",
      hasElevator: true,
      specialNote: "",
      status: "scheduled",
    },
  });

  const depositForm = useForm<DepositFormValues>({
    resolver: zodResolver(depositFormSchema),
    defaultValues: {
      amount: "",
      method: "Chuyển khoản",
      note: "",
    },
  });

  // Sync forms when selected order changes
  useEffect(() => {
    if (!order) return;

    const initialNote = order.internalNote ?? "";
    setNoteValue(initialNote);
    lastSavedNoteRef.current = initialNote;
    setNoteSaveState("idle");
    setShipmentMessage(null);
    setShipmentError(null);
    setDepositError(null);
    setDepositSuccess(null);
    setPdfError(null);

    shipmentForm.reset({
      scheduledDate: formatDateInputValue(order.shipment?.scheduledDate ?? order.deliverDate),
      driverName: order.shipment?.driverName ?? "",
      needsCrane: order.shipment?.needsCrane ?? false,
      buildingFloor:
        order.shipment?.buildingFloor !== null && order.shipment?.buildingFloor !== undefined
          ? String(order.shipment.buildingFloor)
          : "",
      hasElevator: order.shipment?.hasElevator ?? true,
      specialNote: order.shipment?.specialNote ?? "",
      status: order.shipment?.status ?? "scheduled",
    });

    depositForm.reset({
      amount: "",
      method: "Chuyển khoản",
      note: "",
    });
  }, [order?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced autosave for internalNote (700ms)
  useEffect(() => {
    if (!order) return;
    if (noteValue === lastSavedNoteRef.current) return;

    const orderId = order.id;
    const timer = setTimeout(async () => {
      setNoteSaveState("saving");
      const res = await updateOrderInternalNoteAction({
        orderId,
        internalNote: noteValue,
      });

      if (res.ok) {
        lastSavedNoteRef.current = noteValue;
        setNoteSaveState("saved");
        onOrderPatched(orderId, (prev) => ({
          ...prev,
          internalNote: noteValue.trim() === "" ? null : noteValue,
        }));
      } else {
        setNoteSaveState("error");
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [noteValue, order, onOrderPatched]);

  const handleSaveShipment = shipmentForm.handleSubmit(async (values) => {
    if (!order) return;
    setShipmentMessage(null);
    setShipmentError(null);

    const res = await upsertOrderShipmentAction({
      orderId: order.id,
      scheduledDate: values.scheduledDate || null,
      driverName: values.driverName || null,
      needsCrane: values.needsCrane,
      buildingFloor: values.buildingFloor.trim() === "" ? null : Number(values.buildingFloor),
      hasElevator: values.hasElevator,
      specialNote: values.specialNote || null,
      status: values.status,
    });

    if (!res.ok || !res.data) {
      setShipmentError(res.error ?? "Lưu vận chuyển thất bại");
      return;
    }

    const saved = res.data;
    onOrderPatched(order.id, (prev) => ({
      ...prev,
      shipment: saved.shipment,
      deliverDate: saved.deliverDate ?? prev.deliverDate,
    }));
    setShipmentMessage("Đã lưu thông tin vận chuyển");
  });

  const handleAddDeposit = depositForm.handleSubmit(async (values) => {
    if (!order) return;
    setDepositError(null);
    setDepositSuccess(null);

    const res = await addOrderDepositAction({
      orderId: order.id,
      amount: Number(values.amount),
      method: values.method || null,
      note: values.note || null,
    });

    if (!res.ok || !res.data) {
      setDepositError(res.error ?? "Thêm khoản cọc thất bại");
      return;
    }

    const { depositLog, depositPaid, workshopStatus } = res.data;
    onOrderPatched(order.id, (prev) => ({
      ...prev,
      depositPaid,
      workshopStatus,
      depositLogs: [depositLog, ...prev.depositLogs],
    }));

    depositForm.reset({
      amount: "",
      method: values.method || "Chuyển khoản",
      note: "",
    });
    setDepositSuccess(`Đã ghi nhận cọc ${formatVnd(depositLog.amount)}`);
  });

  const handlePrintInvoice = async () => {
    if (!order) return;
    setPrintingPdf(true);
    setPdfError(null);

    try {
      const response = await fetch(`/api/admin/orders/${order.id}/invoice`, {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok || !data?.ok) {
        setPdfError(data?.error ?? "Không thể xuất hóa đơn PDF");
        setPrintingPdf(false);
        return;
      }

      onOrderPatched(order.id, (prev) => ({
        ...prev,
        invoiceUrl: data.invoiceUrl,
      }));

      window.open(data.streamUrl ?? data.invoiceUrl, "_blank", "noopener,noreferrer");
    } catch {
      setPdfError("Lỗi kết nối khi tạo hóa đơn PDF");
    } finally {
      setPrintingPdf(false);
    }
  };

  const remainingAmount = order ? Math.max(0, order.total - order.depositPaid) : 0;

  return (
    <Drawer
      open={Boolean(order)}
      onClose={onClose}
      widthClassName="w-full max-w-[520px]"
      title={order ? `Đơn hàng ${order.orderNumber}` : ""}
      subtitle={order ? `Tạo lúc ${formatDateTimeVi(order.createdAt)}` : undefined}
      footer={
        order ? (
          <div className="space-y-2">
            {pdfError && <p className="text-xs text-red-600">{pdfError}</p>}
            <div className="flex flex-wrap items-center justify-between gap-2">
              {order.invoiceUrl ? (
                <a
                  href={`/api/admin/orders/${order.id}/invoice`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-brand-300 hover:text-brand-400 hover:underline">
                  <IconExternalLink size={14} stroke={1.75} />
                  <span>Xem hóa đơn đã lưu</span>
                </a>
              ) : (
                <span className="text-xs text-text-muted">Chưa xuất file hóa đơn PDF</span>
              )}

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={onClose}>
                  Đóng
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  loading={printingPdf}
                  leftIcon={<IconPrinter size={16} stroke={1.75} />}
                  onClick={handlePrintInvoice}>
                  In hóa đơn PDF
                </Button>
              </div>
            </div>
          </div>
        ) : null
      }>
      {order && (
        <div className="space-y-6">
          {/* 1. Status & Financials */}
          <section className="rounded-[12px] border border-brand-100 bg-bg-muted p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-text-muted">Tiến độ xưởng:</span>
                <WorkshopStatusPopover
                  orderId={order.id}
                  currentStatus={order.workshopStatus}
                  onUpdated={(next: WorkshopStatus) =>
                    onOrderPatched(order.id, (prev) => ({
                      ...prev,
                      workshopStatus: next,
                    }))
                  }
                />
              </div>

              <div className="flex items-center gap-1.5">
                <Badge variant="muted">{order.paymentMethod}</Badge>
                <StatusBadge domain="order" status={order.status} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 border-t border-brand-100 pt-3">
              <div className="rounded-[8px] border border-brand-100 bg-bg-page p-2.5">
                <p className="text-[11px] text-text-muted">Tổng đơn</p>
                <p className="mt-0.5 text-sm font-bold text-brand-400">{formatVnd(order.total)}</p>
              </div>
              <div className="rounded-[8px] border border-brand-100 bg-bg-page p-2.5">
                <p className="text-[11px] text-text-muted">Đã cọc</p>
                <p className="mt-0.5 text-sm font-bold text-green-700">{formatVnd(order.depositPaid)}</p>
              </div>
              <div className="rounded-[8px] border border-brand-100 bg-bg-page p-2.5">
                <p className="text-[11px] text-text-muted">Còn lại</p>
                <p className="mt-0.5 text-sm font-bold text-brand-300">{formatVnd(remainingAmount)}</p>
              </div>
            </div>
          </section>

          {/* 2. Customer & Order items */}
          <section className="rounded-[12px] border border-brand-100 bg-bg-page p-4 space-y-3">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-300">
              <IconUser size={15} stroke={1.75} />
              <span>Thông tin khách hàng & Sản phẩm</span>
            </h3>

            <div className="space-y-1.5 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-text-default">{order.recipientName}</span>
                <a
                  href={`tel:${order.phone}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-brand-300 hover:text-brand-400">
                  <IconPhone size={14} stroke={1.75} />
                  {order.phone}
                </a>
              </div>
              {order.email && <p className="text-xs text-text-muted">{order.email}</p>}
              <p className="flex items-start gap-1.5 text-xs text-text-muted">
                <IconMapPin size={14} stroke={1.75} className="mt-0.5 shrink-0" />
                <span>
                  {order.line1}, {order.city}, {order.province}
                </span>
              </p>
            </div>

            {/* Custom specs */}
            <div className="rounded-[8px] border border-brand-100 bg-bg-muted px-3 py-2.5 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-medium text-brand-400">
                <IconRuler2 size={14} stroke={1.75} />
                <span>
                  Kích thước:{" "}
                  {order.isCustomSize
                    ? `Đặt riêng (${formatDimensionsMeters(order.customWidthCm, order.customDepthCm, order.customHeightCm) ?? "Theo yêu cầu"})`
                    : "Tiêu chuẩn"}
                </span>
              </div>
              <p className="text-text-muted">
                Chất liệu / Màu:{" "}
                <span className="text-text-default">
                  {[order.materialChoice, order.colorChoice].filter(Boolean).join(" · ") || "Chưa ghi nhận"}
                </span>
              </p>
              <p className="text-text-muted">
                Ngày giao dự kiến:{" "}
                <span className="text-text-default">
                  {formatDateVi(order.deliverDate ?? order.shipment?.scheduledDate)}
                </span>
              </p>
            </div>

            {/* Items list */}
            <ul className="divide-y divide-brand-100/60 border-t border-brand-100 pt-2">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-3 py-2 text-xs">
                  <div className="min-w-0">
                    <p className="font-medium text-text-default">{item.name}</p>
                    <p className="text-text-muted">
                      {[item.workshopCode, item.variantName, `SL: ${item.quantity}`].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <span className="shrink-0 font-semibold text-brand-400">{formatVnd(item.total)}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 3. Shipment inline editor */}
          <section className="rounded-[12px] border border-brand-100 bg-bg-page p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-300">
                <IconTruckDelivery size={15} stroke={1.75} />
                <span>Vận chuyển & Giao lắp</span>
              </h3>
              {order.shipment && <StatusBadge domain="shipment" status={order.shipment.status} />}
            </div>

            <form onSubmit={handleSaveShipment} className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input
                  label="Ngày hẹn giao"
                  type="date"
                  inputSize="sm"
                  fullWidth
                  {...shipmentForm.register("scheduledDate")}
                />
                <Select
                  label="Trạng thái giao"
                  selectSize="sm"
                  fullWidth
                  options={SHIPMENT_STATUS_OPTIONS}
                  {...shipmentForm.register("status")}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input
                  label="Tài xế / Tổ giao"
                  placeholder="VD: Anh Hùng - Xe tải 2T"
                  inputSize="sm"
                  fullWidth
                  {...shipmentForm.register("driverName")}
                />
                <Input
                  label="Số tầng chung cư/nhà"
                  placeholder="VD: 12"
                  inputSize="sm"
                  fullWidth
                  error={shipmentForm.formState.errors.buildingFloor?.message}
                  {...shipmentForm.register("buildingFloor")}
                />
              </div>

              <div className="flex flex-wrap items-center gap-5 pt-0.5 text-xs text-text-default">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-brand-200 accent-brand-400"
                    {...shipmentForm.register("hasElevator")}
                  />
                  <span>Có thang máy</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-brand-200 accent-brand-400"
                    {...shipmentForm.register("needsCrane")}
                  />
                  <span>Cần xe cẩu / kéo dây</span>
                </label>
              </div>

              <Input
                label="Ghi chú giao hàng"
                placeholder="Hẻm nhỏ, khung giờ cấm tải, phí gửi xe..."
                inputSize="sm"
                fullWidth
                {...shipmentForm.register("specialNote")}
              />

              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="text-xs">
                  {shipmentError && <span className="text-red-600">{shipmentError}</span>}
                  {shipmentMessage && (
                    <span className="inline-flex items-center gap-1 text-green-700">
                      <IconCheck size={14} stroke={1.75} />
                      {shipmentMessage}
                    </span>
                  )}
                </div>
                <Button type="submit" variant="secondary" size="sm" loading={shipmentForm.formState.isSubmitting}>
                  Lưu vận chuyển
                </Button>
              </div>
            </form>
          </section>

          {/* 4. DepositLog timeline + Thêm cọc form */}
          <section className="rounded-[12px] border border-brand-100 bg-bg-page p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-300">
                <IconCash size={15} stroke={1.75} />
                <span>Lịch sử đặt cọc ({order.depositLogs.length})</span>
              </h3>
              <span className="text-xs font-semibold text-green-700">Tổng cọc: {formatVnd(order.depositPaid)}</span>
            </div>

            {order.depositLogs.length === 0 ? (
              <p className="rounded-[8px] border border-dashed border-brand-100 bg-bg-muted px-3 py-3 text-center text-xs text-text-muted">
                Chưa có lần đặt cọc nào được ghi nhận.
              </p>
            ) : (
              <ol className="space-y-2 border-l-2 border-brand-100 pl-3.5">
                {order.depositLogs.map((log) => (
                  <li key={log.id} className="relative text-xs">
                    <span
                      className="absolute -left-[19px] top-1.5 h-2 w-2 rounded-full bg-brand-400"
                      aria-hidden="true"
                    />
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-semibold text-brand-400">+{formatVnd(log.amount)}</span>
                      <span className="text-[11px] text-text-muted">{formatDateTimeVi(log.createdAt)}</span>
                    </div>
                    <p className="text-text-muted">
                      {[log.method, log.recordedBy ? `Bởi ${log.recordedBy}` : null].filter(Boolean).join(" · ")}
                    </p>
                    {log.note && <p className="mt-0.5 text-text-default">{log.note}</p>}
                  </li>
                ))}
              </ol>
            )}

            {/* Add deposit form */}
            <form
              onSubmit={handleAddDeposit}
              className="rounded-[8px] border border-brand-100 bg-bg-muted p-3 space-y-2.5">
              <p className="text-xs font-semibold text-brand-400">Ghi nhận đợt cọc mới</p>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <Input
                  label="Số tiền (VND)"
                  type="number"
                  min={1000}
                  step={100000}
                  placeholder="VD: 5000000"
                  inputSize="sm"
                  fullWidth
                  error={depositForm.formState.errors.amount?.message}
                  {...depositForm.register("amount")}
                />
                <Select
                  label="Hình thức"
                  selectSize="sm"
                  fullWidth
                  options={DEPOSIT_METHOD_OPTIONS}
                  {...depositForm.register("method")}
                />
              </div>

              <Input
                label="Ghi chú"
                placeholder="Cọc đợt 1 làm khung, CK Vietcombank..."
                inputSize="sm"
                fullWidth
                {...depositForm.register("note")}
              />

              <div className="flex items-center justify-between gap-2">
                <div className="text-xs">
                  {depositError && <span className="text-red-600">{depositError}</span>}
                  {depositSuccess && <span className="text-green-700">{depositSuccess}</span>}
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={depositForm.formState.isSubmitting}
                  leftIcon={<IconPlus size={15} stroke={1.75} />}>
                  Thêm cọc
                </Button>
              </div>
            </form>
          </section>

          {/* 5. OrderStatusHistory timeline */}
          <section className="rounded-[12px] border border-brand-100 bg-bg-page p-4 space-y-3">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-300">
              <IconHistory size={15} stroke={1.75} />
              <span>Lịch sử trạng thái thanh toán ({order.statusHistory.length})</span>
            </h3>

            {order.statusHistory.length === 0 ? (
              <p className="text-xs text-text-muted">Chưa có bản ghi chuyển trạng thái thanh toán.</p>
            ) : (
              <ol className="space-y-2.5 border-l-2 border-brand-100 pl-3.5">
                {order.statusHistory.map((item) => (
                  <li key={item.id} className="relative text-xs">
                    <span
                      className="absolute -left-[19px] top-1.5 h-2 w-2 rounded-full bg-brand-200"
                      aria-hidden="true"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5">
                        {item.fromStatus && (
                          <>
                            <StatusBadge domain="order" status={item.fromStatus} />
                            <span className="text-text-muted">→</span>
                          </>
                        )}
                        <StatusBadge domain="order" status={item.toStatus} />
                      </div>
                      <span className="text-[11px] text-text-muted">{formatDateTimeVi(item.createdAt)}</span>
                    </div>
                    {(item.note || item.actorName) && (
                      <p className="mt-1 text-text-muted">
                        {[item.note, item.actorName ? `Bởi ${item.actorName}` : null].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </section>

          {/* 6. Internal note with debounced autosave */}
          <section className="rounded-[12px] border border-brand-100 bg-bg-page p-4 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="order-internal-note"
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-300">
                <IconNotes size={15} stroke={1.75} />
                <span>Ghi chú nội bộ xưởng</span>
              </label>
              <span className="text-[11px] text-text-muted">
                {noteSaveState === "saving" && "Đang tự động lưu..."}
                {noteSaveState === "saved" && "Đã tự động lưu"}
                {noteSaveState === "error" && <span className="text-red-600">Lỗi lưu ghi chú</span>}
              </span>
            </div>

            <textarea
              id="order-internal-note"
              rows={4}
              value={noteValue}
              onChange={(e) => setNoteValue(e.target.value)}
              placeholder="Ghi chú cho thợ bọc, gỗ khung, lưu ý riêng của khách (tự động lưu sau khi ngừng gõ)..."
              className="block w-full rounded-[8px] border border-brand-100 bg-bg-page px-3 py-2 text-sm text-text-default placeholder:text-text-muted/70 transition-colors hover:border-brand-200 focus:border-brand-300 focus:outline-none focus:ring-[3px] focus:ring-brand-50"
            />
          </section>
        </div>
      )}
    </Drawer>
  );
}
