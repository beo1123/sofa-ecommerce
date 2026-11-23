"use client";

import React, { useMemo, useState } from "react";
import {
  IconBuildingFactory2,
  IconCode,
  IconFilterOff,
  IconPhone,
  IconSearch,
  IconShieldLock,
  IconWorld,
} from "@tabler/icons-react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Badge, { type BadgeVariant } from "@/components/ui/Badge";
import Drawer from "@/components/ui/Drawer";
import { formatDateTimeVi, formatNumberVi } from "@/lib/format";
import type { AuditActorOption, SerializedAuditLog, WorkshopOverviewInfo } from "@/components/admin/settings/types";

interface SettingsAuditClientProps {
  initialLogs: SerializedAuditLog[];
  actors: AuditActorOption[];
  entities: string[];
  overview: WorkshopOverviewInfo;
}

function getActionBadgeVariant(action: string): BadgeVariant {
  const upper = action.toUpperCase();
  if (upper.includes("DELETE") || upper.includes("REJECT")) return "danger";
  if (upper.includes("CREATE") || upper.includes("APPROVE")) return "success";
  if (upper.includes("TOGGLE") || upper.includes("STATUS")) return "warning";
  return "brand";
}

export default function SettingsAuditClient({ initialLogs, actors, entities, overview }: SettingsAuditClientProps) {
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [actorFilter, setActorFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedLog, setSelectedLog] = useState<SerializedAuditLog | null>(null);

  const entityOptions = useMemo(
    () => [{ label: "Tất cả đối tượng (Entity)", value: "" }, ...entities.map((e) => ({ label: e, value: e }))],
    [entities]
  );

  const actorOptions = useMemo(
    () => [
      { label: "Tất cả tài khoản (Actor)", value: "" },
      ...actors.map((a) => ({
        label: a.displayName ? `${a.displayName} (${a.email})` : a.email,
        value: String(a.id),
      })),
    ],
    [actors]
  );

  const filteredLogs = useMemo(() => {
    const q = search.trim().toLowerCase();
    const fromTime = fromDate ? new Date(`${fromDate}T00:00:00+07:00`).getTime() : null;
    const toTime = toDate ? new Date(`${toDate}T23:59:59+07:00`).getTime() : null;

    return initialLogs.filter((log) => {
      if (entityFilter && log.entity !== entityFilter) return false;
      if (actorFilter && String(log.actorId ?? "") !== actorFilter) return false;

      const createdTs = new Date(log.createdAt).getTime();
      if (fromTime !== null && createdTs < fromTime) return false;
      if (toTime !== null && createdTs > toTime) return false;

      if (!q) return true;
      return [log.actorEmail ?? "", log.actorName ?? "", log.action, log.entity, log.entityId ?? "", log.ip ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [initialLogs, search, entityFilter, actorFilter, fromDate, toDate]);

  const hasFilters = Boolean(search || entityFilter || actorFilter || fromDate || toDate);

  const resetFilters = () => {
    setSearch("");
    setEntityFilter("");
    setActorFilter("");
    setFromDate("");
    setToDate("");
  };

  return (
    <div className="space-y-6">
      {/* Workshop Profile & System Summary */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="rounded-[12px] border border-brand-100 bg-bg-muted p-5 lg:col-span-7 space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-brand-100 bg-bg-page text-brand-400">
              <IconBuildingFactory2 size={18} stroke={1.75} />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-brand-400">Xưởng sản xuất Sofa Phạm Gia</h3>
              <p className="text-xs text-text-muted">TP. Hồ Chí Minh · Đóng sofa theo kích thước & chất liệu yêu cầu</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 border-t border-brand-100 pt-3 text-xs text-text-default">
            <span className="inline-flex items-center gap-1.5">
              <IconWorld size={15} stroke={1.75} className="text-brand-300" />
              sofaphamgia.com
            </span>
            <span className="inline-flex items-center gap-1.5">
              <IconPhone size={15} stroke={1.75} className="text-brand-300" />
              Hotline / Zalo Mr. Giang: 0932 111 620
            </span>
            <span className="inline-flex items-center gap-1.5">
              <IconShieldLock size={15} stroke={1.75} className="text-brand-300" />
              {overview.adminUsersCount} tài khoản quản trị
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:col-span-5">
          <div className="rounded-[12px] border border-brand-100 bg-bg-muted p-4">
            <p className="text-xs text-text-muted">Sản phẩm</p>
            <p className="mt-1 text-xl font-bold text-brand-400">{formatNumberVi(overview.productsCount)}</p>
          </div>
          <div className="rounded-[12px] border border-brand-100 bg-bg-muted p-4">
            <p className="text-xs text-text-muted">Đơn hàng</p>
            <p className="mt-1 text-xl font-bold text-brand-400">{formatNumberVi(overview.ordersCount)}</p>
          </div>
          <div className="rounded-[12px] border border-brand-100 bg-bg-muted p-4">
            <p className="text-xs text-text-muted">Yêu cầu tư vấn</p>
            <p className="mt-1 text-xl font-bold text-brand-400">{formatNumberVi(overview.inquiriesCount)}</p>
          </div>
          <div className="rounded-[12px] border border-brand-100 bg-bg-muted p-4">
            <p className="text-xs text-text-muted">Tổng bản ghi Log</p>
            <p className="mt-1 text-xl font-bold text-brand-400">{formatNumberVi(overview.auditLogsCount)}</p>
          </div>
        </div>
      </section>

      {/* AuditLog Section */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-brand-400">Nhật ký hoạt động (AuditLog)</h3>
            <p className="text-xs text-text-muted">
              Theo dõi mọi thao tác thay đổi đơn hàng, sản phẩm, bài đăng, hoàn tiền và khuyến mãi.
            </p>
          </div>
          <p className="text-xs text-text-muted">
            Hiển thị <span className="font-semibold text-brand-400">{filteredLogs.length}</span> / {initialLogs.length}{" "}
            bản ghi gần nhất
          </p>
        </div>

        {/* Filters: entity, actor, date range, search */}
        <div className="grid grid-cols-1 gap-3 rounded-[12px] border border-brand-100 bg-bg-muted p-3.5 md:grid-cols-2 xl:grid-cols-12">
          <div className="xl:col-span-3">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm action, entityId, IP..."
              inputSize="sm"
              fullWidth
              leftIcon={<IconSearch size={15} stroke={1.75} />}
            />
          </div>

          <div className="xl:col-span-2">
            <Select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              selectSize="sm"
              fullWidth
              options={entityOptions}
            />
          </div>

          <div className="xl:col-span-3">
            <Select
              value={actorFilter}
              onChange={(e) => setActorFilter(e.target.value)}
              selectSize="sm"
              fullWidth
              options={actorOptions}
            />
          </div>

          <div className="xl:col-span-2">
            <Input
              type="date"
              aria-label="Từ ngày"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              inputSize="sm"
              fullWidth
            />
          </div>

          <div className="flex items-center gap-2 xl:col-span-2">
            <Input
              type="date"
              aria-label="Đến ngày"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              inputSize="sm"
              fullWidth
            />
            {hasFilters && (
              <Button variant="outline" size="sm" onClick={resetFilters} title="Xóa bộ lọc" aria-label="Xóa bộ lọc">
                <IconFilterOff size={15} stroke={1.75} />
              </Button>
            )}
          </div>
        </div>

        {/* AuditLog Table */}
        <div className="rounded-[12px] border border-brand-100 bg-bg-page">
          {filteredLogs.length === 0 ? (
            <div className="px-6 py-14 text-center text-sm text-text-muted">
              Chưa có bản ghi AuditLog phù hợp với bộ lọc hiện tại.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-brand-100 bg-bg-muted text-xs font-medium text-text-muted">
                    <th className="px-4 py-3">Thời gian</th>
                    <th className="px-3 py-3">Tài khoản (actor.email)</th>
                    <th className="px-3 py-3">Hành động</th>
                    <th className="px-3 py-3">Đối tượng</th>
                    <th className="px-3 py-3">Entity ID</th>
                    <th className="px-3 py-3">IP</th>
                    <th className="px-4 py-3 text-right">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-100/60">
                  {filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="transition-colors hover:bg-brand-50/40 cursor-pointer">
                      <td className="px-4 py-3 text-xs whitespace-nowrap text-text-muted">
                        {formatDateTimeVi(log.createdAt)}
                      </td>

                      <td className="px-3 py-3 text-xs">
                        <p className="font-medium text-text-default">{log.actorEmail ?? "Hệ thống"}</p>
                        {log.actorName && <p className="text-[11px] text-text-muted">{log.actorName}</p>}
                      </td>

                      <td className="px-3 py-3">
                        <Badge variant={getActionBadgeVariant(log.action)}>{log.action}</Badge>
                      </td>

                      <td className="px-3 py-3">
                        <Badge variant="muted">{log.entity}</Badge>
                      </td>

                      <td className="px-3 py-3 font-mono text-xs text-brand-400">{log.entityId ?? "—"}</td>

                      <td className="px-3 py-3 font-mono text-xs text-text-muted">{log.ip ?? "—"}</td>

                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                          className="inline-flex items-center gap-1 rounded-[8px] border border-brand-100 bg-bg-page px-2.5 py-1 text-xs font-medium text-brand-300 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-400 cursor-pointer">
                          <IconCode size={14} stroke={1.75} />
                          <span>JSON</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Audit Detail Drawer */}
      <Drawer
        open={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        title={selectedLog ? selectedLog.action : ""}
        subtitle={
          selectedLog
            ? `${selectedLog.entity}${selectedLog.entityId ? ` #${selectedLog.entityId}` : ""} · ${formatDateTimeVi(selectedLog.createdAt)}`
            : undefined
        }>
        {selectedLog && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 rounded-[12px] border border-brand-100 bg-bg-muted p-4">
              <div>
                <p className="text-text-muted">Tài khoản thực hiện</p>
                <p className="mt-0.5 font-semibold text-brand-400">{selectedLog.actorEmail ?? "Hệ thống"}</p>
              </div>
              <div>
                <p className="text-text-muted">Địa chỉ IP</p>
                <p className="mt-0.5 font-mono text-text-default">{selectedLog.ip ?? "—"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-text-muted">User Agent</p>
                <p className="mt-0.5 break-all text-text-default">{selectedLog.userAgent ?? "—"}</p>
              </div>
            </div>

            <div>
              <p className="mb-1.5 font-semibold text-brand-400">Dữ liệu thay đổi (changes JSON)</p>
              <pre className="max-h-[420px] overflow-auto rounded-[12px] border border-brand-100 bg-bg-muted p-4 font-mono text-[11px] leading-relaxed text-text-default">
                {selectedLog.changes ? JSON.stringify(selectedLog.changes, null, 2) : "Không có chi tiết thay đổi."}
              </pre>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
