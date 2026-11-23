"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import {
  IconCalendarWeek,
  IconChevronLeft,
  IconChevronRight,
  IconCrane,
  IconElevator,
  IconList,
  IconPlus,
  IconSearch,
} from "@tabler/icons-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import StatusBadge from "@/components/ui/StatusBadge";
import Drawer from "@/components/ui/Drawer";
import { formatDateInputValue, formatDateVi } from "@/lib/format";
import { SHIPMENT_STATUSES, SHIPMENT_STATUS_LABELS, type ShipmentStatus } from "@/lib/workshop-types";
import { shipmentFormSchema, type ShipmentFormValues } from "@/lib/validators/order";
import { upsertOrderShipmentAction } from "@/app/(admin)/admin/orders/actions";
import { updateShipmentStatusAction } from "@/app/(admin)/admin/shipments/actions";
import type { SerializedShipmentRow, UnscheduledOrderOption } from "@/components/admin/shipments/types";

interface ShipmentsClientProps {
  initialShipments: SerializedShipmentRow[];
  unscheduledOrders: UnscheduledOrderOption[];
}

const CALENDAR_CARD_STYLES: Record<ShipmentStatus, string> = {
  scheduled: "border-brand-200 bg-brand-50/70 text-brand-400",
  delivering: "border-blue-200 bg-blue-50 text-blue-700",
  done: "border-green-200 bg-green-50 text-green-700",
  failed: "border-red-200 bg-red-50 text-red-600",
};

const WEEKDAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 = Sun, 1 = Mon...
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function toLocalDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function ShipmentsClient({
  initialShipments,
  unscheduledOrders: initialUnscheduled,
}: ShipmentsClientProps) {
  const [shipments, setShipments] = useState<SerializedShipmentRow[]>(initialShipments);
  const [unscheduledOrders, setUnscheduledOrders] = useState<UnscheduledOrderOption[]>(initialUnscheduled);

  const [viewMode, setViewMode] = useState<"table" | "calendar">("table");
  const [statusFilter, setStatusFilter] = useState("");
  const [craneOnly, setCraneOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [weekStart, setWeekStart] = useState<Date>(() => getStartOfWeek(new Date()));

  // Edit/Create Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<number | null>(null);
  const [editingOrderMeta, setEditingOrderMeta] = useState<{
    orderNumber: string;
    recipientName: string;
    phone: string;
    address: string;
  } | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const form = useForm<ShipmentFormValues>({
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

  const filteredShipments = useMemo(() => {
    const q = search.trim().toLowerCase();
    return shipments.filter((item) => {
      if (statusFilter && item.status !== statusFilter) return false;
      if (craneOnly && !item.needsCrane) return false;
      if (!q) return true;
      return [item.orderNumber, item.recipientName, item.phone, item.address, item.driverName ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [shipments, statusFilter, craneOnly, search]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return {
        date: d,
        key: toLocalDayKey(d),
        weekday: WEEKDAY_LABELS[i],
        dayNum: d.getDate(),
        monthNum: d.getMonth() + 1,
      };
    });
  }, [weekStart]);

  const todayKey = toLocalDayKey(new Date());

  const shipmentsByDay = useMemo(() => {
    const map = new Map<string, SerializedShipmentRow[]>();
    const unscheduled: SerializedShipmentRow[] = [];
    for (const s of filteredShipments) {
      if (!s.scheduledDate) {
        unscheduled.push(s);
        continue;
      }
      const key = toLocalDayKey(new Date(s.scheduledDate));
      const existing = map.get(key);
      if (existing) existing.push(s);
      else map.set(key, [s]);
    }
    return { map, unscheduled };
  }, [filteredShipments]);

  const openEditDrawer = (row: SerializedShipmentRow) => {
    setFeedbackError(null);
    setEditingOrderId(row.orderId);
    setEditingOrderMeta({
      orderNumber: row.orderNumber,
      recipientName: row.recipientName,
      phone: row.phone,
      address: row.address,
    });
    form.reset({
      scheduledDate: formatDateInputValue(row.scheduledDate),
      driverName: row.driverName ?? "",
      needsCrane: row.needsCrane,
      buildingFloor: row.buildingFloor !== null ? String(row.buildingFloor) : "",
      hasElevator: row.hasElevator,
      specialNote: row.specialNote ?? "",
      status: row.status,
    });
    setDrawerOpen(true);
  };

  const openCreateDrawer = () => {
    setFeedbackError(null);
    const firstOrder = unscheduledOrders[0] ?? null;
    setEditingOrderId(firstOrder?.id ?? null);
    setEditingOrderMeta(
      firstOrder
        ? {
            orderNumber: firstOrder.orderNumber,
            recipientName: firstOrder.recipientName,
            phone: firstOrder.phone,
            address: firstOrder.address,
          }
        : null
    );
    form.reset({
      scheduledDate: formatDateInputValue(firstOrder?.deliverDate ?? new Date()),
      driverName: "",
      needsCrane: false,
      buildingFloor: "",
      hasElevator: true,
      specialNote: "",
      status: "scheduled",
    });
    setDrawerOpen(true);
  };

  const handleInlineStatus = async (shipmentId: number, nextStatus: ShipmentStatus) => {
    setFeedbackError(null);
    const prev = shipments.find((s) => s.id === shipmentId)?.status ?? "scheduled";
    setShipments((list) => list.map((s) => (s.id === shipmentId ? { ...s, status: nextStatus } : s)));

    const res = await updateShipmentStatusAction(shipmentId, nextStatus);
    if (!res.ok) {
      setShipments((list) => list.map((s) => (s.id === shipmentId ? { ...s, status: prev } : s)));
      setFeedbackError(res.error ?? "Không thể cập nhật trạng thái");
    }
  };

  const handleSaveShipment = form.handleSubmit(async (values) => {
    if (!editingOrderId || !editingOrderMeta) {
      setFeedbackError("Vui lòng chọn đơn hàng cần lên lịch giao");
      return;
    }

    setFeedbackError(null);
    const res = await upsertOrderShipmentAction({
      orderId: editingOrderId,
      scheduledDate: values.scheduledDate || null,
      driverName: values.driverName || null,
      needsCrane: values.needsCrane,
      buildingFloor: values.buildingFloor.trim() === "" ? null : Number(values.buildingFloor),
      hasElevator: values.hasElevator,
      specialNote: values.specialNote || null,
      status: values.status,
    });

    if (!res.ok || !res.data) {
      setFeedbackError(res.error ?? "Lưu lịch giao hàng thất bại");
      return;
    }

    const saved = res.data.shipment;
    const nextRow: SerializedShipmentRow = {
      id: saved.id,
      orderId: saved.orderId,
      orderNumber: editingOrderMeta.orderNumber,
      recipientName: editingOrderMeta.recipientName,
      phone: editingOrderMeta.phone,
      address: editingOrderMeta.address,
      scheduledDate: saved.scheduledDate,
      driverName: saved.driverName,
      needsCrane: saved.needsCrane,
      buildingFloor: saved.buildingFloor,
      hasElevator: saved.hasElevator,
      specialNote: saved.specialNote,
      status: saved.status,
      updatedAt: saved.updatedAt,
    };

    setShipments((list) => {
      const exists = list.some((s) => s.orderId === saved.orderId);
      return exists ? list.map((s) => (s.orderId === saved.orderId ? nextRow : s)) : [nextRow, ...list];
    });
    setUnscheduledOrders((list) => list.filter((o) => o.id !== saved.orderId));
    setDrawerOpen(false);
  });

  const shiftWeek = (days: number) => {
    setWeekStart((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + days);
      return next;
    });
  };

  const isCreatingNew = drawerOpen && editingOrderId !== null && !shipments.some((s) => s.orderId === editingOrderId);

  return (
    <div className="space-y-4">
      {/* Top controls: status pills + view mode toggle + schedule button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setStatusFilter("")}
            className={clsx(
              "inline-flex items-center gap-1.5 rounded-[20px] border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
              statusFilter === ""
                ? "border-brand-400 bg-brand-400 text-white"
                : "border-brand-100 bg-bg-page text-text-muted hover:border-brand-200"
            )}>
            <span>Tất cả</span>
            <span className="opacity-80">({shipments.length})</span>
          </button>

          {SHIPMENT_STATUSES.map((st) => {
            const count = shipments.filter((s) => s.status === st).length;
            const active = statusFilter === st;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(active ? "" : st)}
                className={clsx(
                  "inline-flex items-center gap-1.5 rounded-[20px] border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                  active
                    ? "border-brand-400 bg-brand-50 text-brand-400"
                    : "border-brand-100 bg-bg-page text-text-muted hover:border-brand-200"
                )}>
                <span>{SHIPMENT_STATUS_LABELS[st]}</span>
                <span>({count})</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-[8px] border border-brand-100 bg-bg-muted p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={clsx(
                "inline-flex h-8 items-center gap-1.5 rounded-[6px] px-2.5 text-xs font-medium transition-colors cursor-pointer",
                viewMode === "table"
                  ? "bg-bg-page text-brand-400 border border-brand-100"
                  : "text-text-muted hover:text-brand-400"
              )}>
              <IconList size={15} stroke={1.75} />
              <span>Bảng</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("calendar")}
              className={clsx(
                "inline-flex h-8 items-center gap-1.5 rounded-[6px] px-2.5 text-xs font-medium transition-colors cursor-pointer",
                viewMode === "calendar"
                  ? "bg-bg-page text-brand-400 border border-brand-100"
                  : "text-text-muted hover:text-brand-400"
              )}>
              <IconCalendarWeek size={15} stroke={1.75} />
              <span>Lịch tuần</span>
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            disabled={unscheduledOrders.length === 0}
            leftIcon={<IconPlus size={15} stroke={1.75} />}
            onClick={openCreateDrawer}>
            Lên lịch giao
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 rounded-[12px] border border-brand-100 bg-bg-muted p-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="w-full sm:max-w-xs">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm mã đơn, khách hàng, địa chỉ, tài xế..."
              inputSize="sm"
              fullWidth
              leftIcon={<IconSearch size={16} stroke={1.75} />}
            />
          </div>

          <label className="inline-flex items-center gap-2 text-xs font-medium text-brand-400 cursor-pointer">
            <input
              type="checkbox"
              checked={craneOnly}
              onChange={(e) => setCraneOnly(e.target.checked)}
              className="h-4 w-4 rounded border-brand-200 accent-brand-400"
            />
            <span>Chỉ hiện đơn cần xe cẩu</span>
          </label>
        </div>

        <p className="text-xs text-text-muted">
          Hiển thị <span className="font-semibold text-brand-400">{filteredShipments.length}</span> chuyến giao
        </p>
      </div>

      {feedbackError && (
        <div role="alert" className="rounded-[8px] border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700">
          {feedbackError}
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === "table" && (
        <div className="rounded-[12px] border border-brand-100 bg-bg-page">
          {filteredShipments.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <p className="text-sm font-medium text-brand-400">Chưa có chuyến vận chuyển nào</p>
              <p className="mt-1 text-xs text-text-muted">
                Nhấn &ldquo;Lên lịch giao&rdquo; hoặc cập nhật vận chuyển trong chi tiết đơn hàng.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1040px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-brand-100 bg-bg-muted text-xs font-medium text-text-muted">
                    <th className="px-4 py-3">Mã đơn</th>
                    <th className="px-3 py-3">Người nhận & Địa chỉ</th>
                    <th className="px-3 py-3">Tầng</th>
                    <th className="px-3 py-3">Thang máy</th>
                    <th className="px-3 py-3">Xe cẩu</th>
                    <th className="px-3 py-3">Ngày giao</th>
                    <th className="px-3 py-3">Tài xế</th>
                    <th className="px-4 py-3">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-100/60">
                  {filteredShipments.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => openEditDrawer(row)}
                      className="transition-colors hover:bg-brand-50/40 cursor-pointer">
                      <td className="px-4 py-3.5 align-top whitespace-nowrap">
                        <Link
                          href={`/admin/orders?orderId=${row.orderId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-semibold text-brand-400 hover:text-brand-300 hover:underline">
                          {row.orderNumber}
                        </Link>
                      </td>

                      <td className="max-w-[260px] px-3 py-3.5 align-top">
                        <p className="font-medium text-text-default">
                          {row.recipientName} <span className="text-xs font-normal text-text-muted">· {row.phone}</span>
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-text-muted">{row.address}</p>
                      </td>

                      <td className="px-3 py-3.5 align-top text-xs whitespace-nowrap text-text-default">
                        {row.buildingFloor !== null
                          ? row.buildingFloor === 0
                            ? "Trệt"
                            : `Tầng ${row.buildingFloor}`
                          : "—"}
                      </td>

                      <td className="px-3 py-3.5 align-top whitespace-nowrap">
                        <Badge variant={row.hasElevator ? "success" : "warning"}>
                          <IconElevator size={12} stroke={1.75} />
                          {row.hasElevator ? "Có thang máy" : "Không thang máy"}
                        </Badge>
                      </td>

                      <td className="px-3 py-3.5 align-top whitespace-nowrap">
                        <Badge variant={row.needsCrane ? "danger" : "neutral"}>
                          <IconCrane size={12} stroke={1.75} />
                          {row.needsCrane ? "Cần xe cẩu" : "Không cần"}
                        </Badge>
                      </td>

                      <td className="px-3 py-3.5 align-top text-xs font-medium whitespace-nowrap text-brand-400">
                        {formatDateVi(row.scheduledDate)}
                      </td>

                      <td className="px-3 py-3.5 align-top text-xs text-text-default">
                        {row.driverName || <span className="text-text-muted">Chưa phân công</span>}
                      </td>

                      <td className="px-4 py-3.5 align-top" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col gap-1">
                          <StatusBadge domain="shipment" status={row.status} />
                          <select
                            aria-label={`Đổi trạng thái giao ${row.orderNumber}`}
                            value={row.status}
                            onChange={(e) => handleInlineStatus(row.id, e.target.value as ShipmentStatus)}
                            className="h-7 rounded-[8px] border border-brand-100 bg-bg-page px-2 text-xs text-text-default focus:border-brand-300 focus:outline-none cursor-pointer">
                            {SHIPMENT_STATUSES.map((st) => (
                              <option key={st} value={st}>
                                {SHIPMENT_STATUS_LABELS[st]}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* WEEKLY CALENDAR VIEW */}
      {viewMode === "calendar" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-brand-100 bg-bg-page px-4 py-3">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="xs"
                onClick={() => shiftWeek(-7)}
                leftIcon={<IconChevronLeft size={14} stroke={1.75} />}>
                Tuần trước
              </Button>
              <Button variant="secondary" size="xs" onClick={() => setWeekStart(getStartOfWeek(new Date()))}>
                Tuần này
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={() => shiftWeek(7)}
                rightIcon={<IconChevronRight size={14} stroke={1.75} />}>
                Tuần sau
              </Button>
            </div>

            <p className="text-sm font-semibold text-brand-400">
              {formatDateVi(weekDays[0].date)} – {formatDateVi(weekDays[6].date)}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-7">
            {weekDays.map((day) => {
              const items = shipmentsByDay.map.get(day.key) ?? [];
              const isToday = day.key === todayKey;

              return (
                <div
                  key={day.key}
                  className={clsx(
                    "flex min-h-[260px] flex-col rounded-[12px] border p-3",
                    isToday ? "border-brand-300 bg-brand-50/40" : "border-brand-100 bg-bg-page"
                  )}>
                  <div className="mb-2.5 flex items-baseline justify-between border-b border-brand-100 pb-2">
                    <span className="text-xs font-semibold text-brand-400">{day.weekday}</span>
                    <span
                      className={clsx(
                        "rounded-[20px] px-2 py-0.5 text-xs font-medium",
                        isToday ? "bg-brand-400 text-white" : "text-text-muted"
                      )}>
                      {String(day.dayNum).padStart(2, "0")}/{String(day.monthNum).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="flex-1 space-y-2">
                    {items.length === 0 ? (
                      <p className="pt-4 text-center text-[11px] text-text-muted/70">Trống lịch</p>
                    ) : (
                      items.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => openEditDrawer(item)}
                          className={clsx(
                            "w-full rounded-[8px] border p-2 text-left text-xs transition-opacity hover:opacity-85 cursor-pointer",
                            CALENDAR_CARD_STYLES[item.status]
                          )}>
                          <p className="font-semibold truncate">{item.orderNumber}</p>
                          <p className="truncate font-medium">{item.recipientName}</p>
                          <p className="mt-0.5 truncate text-[11px] opacity-80">
                            {item.driverName || "Chưa gán tài xế"}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {item.needsCrane && (
                              <span className="rounded bg-bg-page/80 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">
                                Xe cẩu
                              </span>
                            )}
                            {item.buildingFloor !== null && (
                              <span className="rounded bg-bg-page/80 px-1.5 py-0.5 text-[10px] font-medium text-brand-400">
                                Tầng {item.buildingFloor}
                              </span>
                            )}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {shipmentsByDay.unscheduled.length > 0 && (
            <div className="rounded-[12px] border border-brand-100 bg-bg-muted p-4 space-y-2">
              <p className="text-xs font-semibold text-brand-400">
                Chưa ấn định ngày giao ({shipmentsByDay.unscheduled.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {shipmentsByDay.unscheduled.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => openEditDrawer(s)}
                    className="rounded-[8px] border border-brand-100 bg-bg-page px-3 py-1.5 text-xs hover:border-brand-300 cursor-pointer">
                    <span className="font-semibold text-brand-400">{s.orderNumber}</span> · {s.recipientName}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit / Create Shipment Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={
          isCreatingNew
            ? "Lên lịch giao hàng mới"
            : editingOrderMeta
              ? `Vận chuyển · ${editingOrderMeta.orderNumber}`
              : "Thông tin vận chuyển"
        }
        subtitle={editingOrderMeta ? `${editingOrderMeta.recipientName} · ${editingOrderMeta.phone}` : undefined}>
        <form onSubmit={handleSaveShipment} className="space-y-4">
          {isCreatingNew && (
            <Select
              label="Chọn đơn hàng"
              required
              fullWidth
              value={editingOrderId ? String(editingOrderId) : ""}
              onChange={(e) => {
                const nextId = Number(e.target.value);
                setEditingOrderId(nextId || null);
                const found = unscheduledOrders.find((o) => o.id === nextId);
                setEditingOrderMeta(
                  found
                    ? {
                        orderNumber: found.orderNumber,
                        recipientName: found.recipientName,
                        phone: found.phone,
                        address: found.address,
                      }
                    : null
                );
              }}
              options={unscheduledOrders.map((o) => ({
                value: String(o.id),
                label: `${o.orderNumber} — ${o.recipientName} (${o.phone})`,
              }))}
            />
          )}

          {editingOrderMeta && (
            <div className="rounded-[8px] border border-brand-100 bg-bg-muted p-3 text-xs text-text-muted">
              <p className="font-semibold text-brand-400">
                {editingOrderMeta.recipientName} · {editingOrderMeta.phone}
              </p>
              <p className="mt-0.5">{editingOrderMeta.address}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input label="Ngày hẹn giao" type="date" fullWidth {...form.register("scheduledDate")} />
            <Select
              label="Trạng thái"
              fullWidth
              options={SHIPMENT_STATUSES.map((s) => ({
                value: s,
                label: SHIPMENT_STATUS_LABELS[s],
              }))}
              {...form.register("status")}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="Tài xế / Tổ giao"
              placeholder="VD: Anh Tuấn - Xe tải 1.5T"
              fullWidth
              {...form.register("driverName")}
            />
            <Input
              label="Số tầng"
              placeholder="VD: 15 (0 = trệt)"
              fullWidth
              error={form.formState.errors.buildingFloor?.message}
              {...form.register("buildingFloor")}
            />
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-text-default">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-brand-200 accent-brand-400"
                {...form.register("hasElevator")}
              />
              <span>Có thang máy</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-brand-200 accent-brand-400"
                {...form.register("needsCrane")}
              />
              <span>Cần xe cẩu / kéo dây</span>
            </label>
          </div>

          <div>
            <label htmlFor="shipment-special-note" className="block text-sm font-medium text-text-default mb-1.5">
              Ghi chú đặc biệt
            </label>
            <textarea
              id="shipment-special-note"
              rows={3}
              placeholder="Giờ cấm tải, đăng ký ban quản lý chung cư, hẻm hẹp..."
              className="block w-full rounded-[8px] border border-brand-100 bg-bg-page px-3 py-2 text-sm text-text-default focus:border-brand-300 focus:outline-none focus:ring-[3px] focus:ring-brand-50"
              {...form.register("specialNote")}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setDrawerOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={form.formState.isSubmitting}>
              Lưu lịch giao
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
