"use client";

import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { IconBrandWhatsapp, IconCheck, IconPhone, IconPlus, IconSearch, IconTrash } from "@tabler/icons-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge, { type BadgeVariant } from "@/components/ui/Badge";
import StatusBadge from "@/components/ui/StatusBadge";
import Drawer from "@/components/ui/Drawer";
import { formatDateTimeVi, formatVndCompact } from "@/lib/format";
import {
  INQUIRY_SOURCES,
  INQUIRY_SOURCE_LABELS,
  INQUIRY_STATUSES,
  INQUIRY_STATUS_LABELS,
  type InquirySource,
  type InquiryStatus,
} from "@/lib/workshop-types";
import { inquiryAdminFormSchema, type InquiryAdminFormValues } from "@/lib/validators/inquiry";
import {
  createInquiryAdminAction,
  deleteInquiryAction,
  updateInquiryAssignedAction,
  updateInquiryNoteAction,
  updateInquiryStatusAction,
} from "@/app/(admin)/admin/inquiries/actions";
import type { SerializedInquiry } from "@/components/admin/inquiries/types";

interface InquiriesClientProps {
  initialInquiries: SerializedInquiry[];
  staffNames: string[];
  initialStatusFilter?: string;
}

const SOURCE_BADGE_VARIANT: Record<InquirySource, BadgeVariant> = {
  web: "brand",
  zalo: "info",
  fb: "info",
  tiktok: "neutral",
  "walk-in": "success",
};

function formatBudgetRange(min: number | null, max: number | null): string {
  if (min && max) {
    return `${formatVndCompact(min)} – ${formatVndCompact(max)}`;
  }
  if (min) return `Từ ${formatVndCompact(min)}`;
  if (max) return `Đến ${formatVndCompact(max)}`;
  return "—";
}

function normalizePhoneDigits(phone: string): string {
  return phone.replace(/[^0-9]/g, "");
}

export default function InquiriesClient({
  initialInquiries,
  staffNames,
  initialStatusFilter = "",
}: InquiriesClientProps) {
  const [inquiries, setInquiries] = useState<SerializedInquiry[]>(initialInquiries);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [sourceFilter, setSourceFilter] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const createForm = useForm<InquiryAdminFormValues>({
    resolver: zodResolver(inquiryAdminFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      district: "",
      city: "TP.HCM",
      roomType: "",
      budgetMin: "",
      budgetMax: "",
      source: "zalo",
      assignedTo: staffNames[0] ?? "",
      note: "",
    },
  });

  const staffOptions = useMemo(() => {
    const unique = new Set<string>(staffNames);
    for (const item of inquiries) {
      if (item.assignedTo) unique.add(item.assignedTo);
    }
    return [
      { label: "Chưa phân công", value: "" },
      ...Array.from(unique).map((name) => ({ label: name, value: name })),
    ];
  }, [staffNames, inquiries]);

  const sourceFilterOptions = useMemo(
    () => [
      { label: "Tất cả nguồn", value: "" },
      ...INQUIRY_SOURCES.map((src) => ({
        label: INQUIRY_SOURCE_LABELS[src],
        value: src,
      })),
    ],
    []
  );

  const statusSelectOptions = useMemo(
    () =>
      INQUIRY_STATUSES.map((s) => ({
        value: s,
        label: INQUIRY_STATUS_LABELS[s],
      })),
    []
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return inquiries.filter((item) => {
      if (statusFilter && item.status !== statusFilter) return false;
      if (sourceFilter && item.source !== sourceFilter) return false;
      if (!q) return true;
      return [
        item.name,
        item.phone,
        item.district ?? "",
        item.city,
        item.roomType ?? "",
        item.assignedTo ?? "",
        item.note ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [inquiries, search, statusFilter, sourceFilter]);

  const selectedInquiry = useMemo(() => inquiries.find((i) => i.id === selectedId) ?? null, [inquiries, selectedId]);

  const openDetail = (item: SerializedInquiry) => {
    setSelectedId(item.id);
    setNoteDraft(item.note ?? "");
    setFeedbackError(null);
  };

  const handleAssignedChange = async (inquiryId: number, nextStaff: string) => {
    setFeedbackError(null);
    const prev = inquiries.find((i) => i.id === inquiryId)?.assignedTo ?? null;
    const val = nextStaff.trim() || null;

    setInquiries((list) => list.map((i) => (i.id === inquiryId ? { ...i, assignedTo: val } : i)));

    const res = await updateInquiryAssignedAction(inquiryId, val);
    if (!res.ok) {
      setInquiries((list) => list.map((i) => (i.id === inquiryId ? { ...i, assignedTo: prev } : i)));
      setFeedbackError(res.error ?? "Lỗi phân công nhân viên");
    }
  };

  const handleStatusChange = async (inquiryId: number, nextStatus: InquiryStatus) => {
    setFeedbackError(null);
    const prev = inquiries.find((i) => i.id === inquiryId)?.status ?? "new";

    setInquiries((list) => list.map((i) => (i.id === inquiryId ? { ...i, status: nextStatus } : i)));

    const res = await updateInquiryStatusAction(inquiryId, nextStatus);
    if (!res.ok) {
      setInquiries((list) => list.map((i) => (i.id === inquiryId ? { ...i, status: prev } : i)));
      setFeedbackError(res.error ?? "Lỗi cập nhật trạng thái");
    }
  };

  const handleSaveNote = async () => {
    if (!selectedInquiry) return;
    setSavingNote(true);
    const res = await updateInquiryNoteAction(selectedInquiry.id, noteDraft.trim() || null);
    setSavingNote(false);
    if (res.ok) {
      setInquiries((list) =>
        list.map((i) => (i.id === selectedInquiry.id ? { ...i, note: noteDraft.trim() || null } : i))
      );
    } else {
      setFeedbackError(res.error ?? "Không thể lưu ghi chú");
    }
  };

  const handleDelete = async (inquiryId: number) => {
    if (!window.confirm("Xóa yêu cầu tư vấn này?")) return;
    const res = await deleteInquiryAction(inquiryId);
    if (res.ok) {
      setInquiries((list) => list.filter((i) => i.id !== inquiryId));
      if (selectedId === inquiryId) setSelectedId(null);
    } else {
      setFeedbackError(res.error ?? "Không thể xóa lead");
    }
  };

  const handleCreateLead = createForm.handleSubmit(async (values) => {
    setFeedbackError(null);
    const toOptInt = (v?: string) => {
      if (!v || !v.trim()) return null;
      const n = Number(v);
      return Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
    };

    const res = await createInquiryAdminAction({
      name: values.name,
      phone: values.phone,
      district: values.district || null,
      city: values.city || "TP.HCM",
      roomType: values.roomType || null,
      budgetMin: toOptInt(values.budgetMin),
      budgetMax: toOptInt(values.budgetMax),
      source: values.source,
      assignedTo: values.assignedTo || null,
      note: values.note || null,
    });

    if (!res.ok || !res.data) {
      setFeedbackError(res.error ?? "Không thể thêm lead");
      return;
    }

    setInquiries((list) => [res.data!, ...list]);
    createForm.reset();
    setCreateOpen(false);
  });

  return (
    <div className="space-y-4">
      {/* Header action + status pills */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setStatusFilter("")}
            className={clsx(
              "inline-flex items-center gap-1.5 rounded-[20px] border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
              statusFilter === ""
                ? "border-brand-400 bg-brand-400 text-white"
                : "border-brand-100 bg-bg-page text-text-muted hover:border-brand-200 hover:bg-brand-50/50 hover:text-brand-400"
            )}>
            <span>Tất cả</span>
            <span className="opacity-80">({inquiries.length})</span>
          </button>

          {INQUIRY_STATUSES.map((st) => {
            const count = inquiries.filter((i) => i.status === st).length;
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
                    : "border-brand-100 bg-bg-page text-text-muted hover:border-brand-200 hover:bg-brand-50/40 hover:text-brand-400"
                )}>
                <span>{INQUIRY_STATUS_LABELS[st]}</span>
                <span>({count})</span>
              </button>
            );
          })}
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<IconPlus size={16} stroke={1.75} />}
          onClick={() => setCreateOpen(true)}>
          Thêm Lead mới
        </Button>
      </div>

      {/* Search & source filter */}
      <div className="flex flex-col gap-3 rounded-[12px] border border-brand-100 bg-bg-muted p-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center">
          <div className="w-full sm:max-w-xs">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tên khách, SĐT, quận/huyện..."
              inputSize="sm"
              fullWidth
              leftIcon={<IconSearch size={16} stroke={1.75} />}
            />
          </div>
          <div className="w-full sm:w-44">
            <Select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              selectSize="sm"
              fullWidth
              options={sourceFilterOptions}
            />
          </div>
        </div>

        <p className="text-xs text-text-muted">
          Hiển thị <span className="font-semibold text-brand-400">{filtered.length}</span> / {inquiries.length} yêu cầu
        </p>
      </div>

      {feedbackError && (
        <div role="alert" className="rounded-[8px] border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700">
          {feedbackError}
        </div>
      )}

      {/* Table */}
      <div className="rounded-[12px] border border-brand-100 bg-bg-page">
        {filtered.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="text-sm font-medium text-brand-400">Chưa có yêu cầu tư vấn nào</p>
            <p className="mt-1 text-xs text-text-muted">
              Yêu cầu từ form /lien-he hoặc lead nhập từ Zalo/Showroom sẽ xuất hiện tại đây.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-brand-100 bg-bg-muted text-xs font-medium text-text-muted">
                  <th className="px-4 py-3">Thời gian</th>
                  <th className="px-3 py-3">Nguồn</th>
                  <th className="px-3 py-3">Khách hàng</th>
                  <th className="px-3 py-3">Số điện thoại</th>
                  <th className="px-3 py-3">Quận / Huyện</th>
                  <th className="px-3 py-3">Ngân sách</th>
                  <th className="px-3 py-3">Phụ trách</th>
                  <th className="px-4 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100/60">
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => openDetail(item)}
                    className={clsx(
                      "transition-colors hover:bg-brand-50/40 cursor-pointer",
                      selectedId === item.id && "bg-brand-50/60"
                    )}>
                    <td className="px-4 py-3.5 align-top text-xs whitespace-nowrap text-text-muted">
                      {formatDateTimeVi(item.createdAt)}
                    </td>

                    <td className="px-3 py-3.5 align-top">
                      <Badge variant={SOURCE_BADGE_VARIANT[item.source]}>{INQUIRY_SOURCE_LABELS[item.source]}</Badge>
                    </td>

                    <td className="px-3 py-3.5 align-top">
                      <p className="font-semibold text-brand-400">{item.name}</p>
                      {item.roomType && <p className="text-xs text-text-muted">{item.roomType}</p>}
                    </td>

                    <td className="px-3 py-3.5 align-top whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <a
                        href={`tel:${item.phone}`}
                        className="font-medium text-brand-300 hover:text-brand-400 hover:underline">
                        {item.phone}
                      </a>
                    </td>

                    <td className="px-3 py-3.5 align-top text-xs text-text-default">
                      {item.district ? `${item.district}, ${item.city}` : item.city}
                    </td>

                    <td className="px-3 py-3.5 align-top text-xs font-medium whitespace-nowrap text-brand-400">
                      {formatBudgetRange(item.budgetMin, item.budgetMax)}
                    </td>

                    <td className="px-3 py-3.5 align-top w-44" onClick={(e) => e.stopPropagation()}>
                      <Select
                        aria-label={`Phân công cho ${item.name}`}
                        value={item.assignedTo ?? ""}
                        onChange={(e) => handleAssignedChange(item.id, e.target.value)}
                        selectSize="sm"
                        fullWidth
                        options={staffOptions}
                      />
                    </td>

                    <td className="px-4 py-3.5 align-top w-40" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-col gap-1">
                        <StatusBadge domain="inquiry" status={item.status} />
                        <select
                          aria-label={`Đổi trạng thái ${item.name}`}
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value as InquiryStatus)}
                          className="h-7 rounded-[8px] border border-brand-100 bg-bg-page px-2 text-xs text-text-default focus:border-brand-300 focus:outline-none cursor-pointer">
                          {statusSelectOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
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

      {/* Detail Drawer */}
      <Drawer
        open={Boolean(selectedInquiry)}
        onClose={() => setSelectedId(null)}
        title={selectedInquiry ? `Khách tư vấn: ${selectedInquiry.name}` : ""}
        subtitle={
          selectedInquiry
            ? `${INQUIRY_SOURCE_LABELS[selectedInquiry.source]} · ${formatDateTimeVi(selectedInquiry.createdAt)}`
            : undefined
        }
        footer={
          selectedInquiry ? (
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<IconTrash size={15} stroke={1.75} />}
                onClick={() => handleDelete(selectedInquiry.id)}>
                Xóa Lead
              </Button>
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${selectedInquiry.phone}`}
                  className="inline-flex h-8 items-center gap-1.5 rounded-[8px] border border-brand-300 bg-bg-page px-3 text-xs font-medium text-brand-400 hover:bg-brand-50">
                  <IconPhone size={14} stroke={1.75} />
                  <span>Gọi ngay</span>
                </a>
                <a
                  href={`https://zalo.me/${normalizePhoneDigits(selectedInquiry.phone)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-8 items-center gap-1.5 rounded-[8px] bg-brand-400 px-3 text-xs font-medium text-white hover:bg-brand-300">
                  <IconBrandWhatsapp size={14} stroke={1.75} />
                  <span>Nhắn Zalo</span>
                </a>
              </div>
            </div>
          ) : null
        }>
        {selectedInquiry && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 rounded-[12px] border border-brand-100 bg-bg-muted p-4 text-xs">
              <div>
                <p className="text-text-muted">Số điện thoại</p>
                <p className="mt-0.5 text-sm font-semibold text-brand-400">{selectedInquiry.phone}</p>
              </div>
              <div>
                <p className="text-text-muted">Khu vực</p>
                <p className="mt-0.5 text-sm font-medium text-text-default">
                  {selectedInquiry.district
                    ? `${selectedInquiry.district}, ${selectedInquiry.city}`
                    : selectedInquiry.city}
                </p>
              </div>
              <div>
                <p className="text-text-muted">Loại phòng</p>
                <p className="mt-0.5 text-sm font-medium text-text-default">
                  {selectedInquiry.roomType || "Chưa nêu rõ"}
                </p>
              </div>
              <div>
                <p className="text-text-muted">Ngân sách dự kiến</p>
                <p className="mt-0.5 text-sm font-semibold text-brand-300">
                  {formatBudgetRange(selectedInquiry.budgetMin, selectedInquiry.budgetMax)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Select
                label="Nhân viên phụ trách"
                value={selectedInquiry.assignedTo ?? ""}
                onChange={(e) => handleAssignedChange(selectedInquiry.id, e.target.value)}
                options={staffOptions}
                fullWidth
              />
              <Select
                label="Trạng thái xử lý"
                value={selectedInquiry.status}
                onChange={(e) => handleStatusChange(selectedInquiry.id, e.target.value as InquiryStatus)}
                options={statusSelectOptions}
                fullWidth
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="inquiry-detail-note" className="block text-sm font-medium text-text-default">
                Ghi chú tư vấn
              </label>
              <textarea
                id="inquiry-detail-note"
                rows={5}
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder="Ghi nhận kích thước phòng khách, màu da ưa thích, lịch hẹn ghé xưởng..."
                className="block w-full rounded-[8px] border border-brand-100 bg-bg-page px-3 py-2 text-sm text-text-default focus:border-brand-300 focus:outline-none focus:ring-[3px] focus:ring-brand-50"
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant="secondary"
                  loading={savingNote}
                  leftIcon={<IconCheck size={15} stroke={1.75} />}
                  onClick={handleSaveNote}>
                  Lưu ghi chú
                </Button>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Create Lead Drawer */}
      <Drawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Thêm khách tư vấn (Lead)"
        subtitle="Nhập nhanh yêu cầu từ Zalo, Facebook, TikTok hoặc khách ghé xưởng">
        <form onSubmit={handleCreateLead} className="space-y-4">
          <Input
            label="Họ tên khách hàng"
            required
            placeholder="VD: Chị Lan Anh"
            fullWidth
            error={createForm.formState.errors.name?.message}
            {...createForm.register("name")}
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="Số điện thoại"
              required
              placeholder="0909 xxx xxx"
              fullWidth
              error={createForm.formState.errors.phone?.message}
              {...createForm.register("phone")}
            />
            <Select
              label="Nguồn khách"
              fullWidth
              options={INQUIRY_SOURCES.map((s) => ({
                value: s,
                label: INQUIRY_SOURCE_LABELS[s],
              }))}
              {...createForm.register("source")}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="Quận / Huyện"
              placeholder="VD: Quận 7, TP. Thủ Đức"
              fullWidth
              {...createForm.register("district")}
            />
            <Input label="Thành phố" placeholder="TP.HCM" fullWidth {...createForm.register("city")} />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="Loại phòng"
              placeholder="VD: Phòng khách chung cư"
              fullWidth
              {...createForm.register("roomType")}
            />
            <Select label="Phụ trách" fullWidth options={staffOptions} {...createForm.register("assignedTo")} />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="Ngân sách từ (VND)"
              type="number"
              step={1000000}
              placeholder="15000000"
              fullWidth
              {...createForm.register("budgetMin")}
            />
            <Input
              label="Ngân sách đến (VND)"
              type="number"
              step={1000000}
              placeholder="25000000"
              fullWidth
              {...createForm.register("budgetMax")}
            />
          </div>

          <div>
            <label htmlFor="new-lead-note" className="block text-sm font-medium text-text-default mb-1.5">
              Ghi chú nhu cầu
            </label>
            <textarea
              id="new-lead-note"
              rows={3}
              placeholder="Quan tâm sofa góc 2m6 da Microfiber màu kem..."
              className="block w-full rounded-[8px] border border-brand-100 bg-bg-page px-3 py-2 text-sm text-text-default focus:border-brand-300 focus:outline-none focus:ring-[3px] focus:ring-brand-50"
              {...createForm.register("note")}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setCreateOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={createForm.formState.isSubmitting}>
              Lưu Lead
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
