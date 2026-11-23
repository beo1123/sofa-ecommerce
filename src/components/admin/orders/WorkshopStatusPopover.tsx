"use client";

import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { IconCheck, IconChevronDown, IconLoader2 } from "@tabler/icons-react";
import StatusBadge, { getStatusConfig } from "@/components/ui/StatusBadge";
import { WORKSHOP_STATUSES, type WorkshopStatus } from "@/lib/workshop-types";
import { updateOrderWorkshopStatusAction } from "@/app/(admin)/admin/orders/actions";

interface WorkshopStatusPopoverProps {
  orderId: number;
  currentStatus: WorkshopStatus;
  onUpdated: (nextStatus: WorkshopStatus) => void;
  align?: "left" | "right";
}

export default function WorkshopStatusPopover({
  orderId,
  currentStatus,
  onUpdated,
  align = "left",
}: WorkshopStatusPopoverProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const handleSelect = async (event: React.MouseEvent, nextStatus: WorkshopStatus) => {
    event.stopPropagation();
    if (nextStatus === currentStatus) {
      setOpen(false);
      return;
    }

    const previous = currentStatus;
    setErrorMsg(null);
    setSaving(true);
    onUpdated(nextStatus);
    setOpen(false);

    const res = await updateOrderWorkshopStatusAction({
      orderId,
      workshopStatus: nextStatus,
    });

    setSaving(false);

    if (!res.ok) {
      onUpdated(previous);
      setErrorMsg(res.error ?? "Lỗi cập nhật");
    }
  };

  return (
    <div ref={containerRef} className="relative inline-block" onClick={(e) => e.stopPropagation()}>
      <StatusBadge
        domain="workshop"
        status={currentStatus}
        interactive
        onClick={(e) => {
          e.stopPropagation();
          if (!saving) setOpen((prev) => !prev);
        }}
        rightIcon={
          saving ? (
            <IconLoader2 size={12} stroke={1.75} className="animate-spin" />
          ) : (
            <IconChevronDown size={12} stroke={1.75} />
          )
        }
      />

      {errorMsg && <p className="mt-1 text-[11px] text-red-600">{errorMsg}</p>}

      {open && (
        <div
          role="menu"
          aria-label="Cập nhật tiến độ xưởng"
          className={clsx(
            "absolute top-full z-40 mt-1.5 w-52 rounded-[12px] border border-brand-100 bg-bg-page p-1.5 animate-fadeIn",
            align === "right" ? "right-0" : "left-0"
          )}>
          <p className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
            Quy trình xưởng
          </p>
          <div className="space-y-0.5">
            {WORKSHOP_STATUSES.map((step, idx) => {
              const cfg = getStatusConfig("workshop", step);
              const isSelected = step === currentStatus;
              return (
                <button
                  key={step}
                  type="button"
                  role="menuitem"
                  onClick={(e) => handleSelect(e, step)}
                  className={clsx(
                    "flex w-full items-center justify-between gap-2 rounded-[8px] px-2.5 py-1.5 text-left text-xs transition-colors cursor-pointer",
                    isSelected ? "bg-brand-50 font-semibold text-brand-400" : "text-text-default hover:bg-brand-50/60"
                  )}>
                  <span className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-text-muted">{idx + 1}.</span>
                    <span
                      className={clsx("inline-flex rounded-[20px] px-2 py-0.5 text-[11px] font-medium", cfg.className)}>
                      {cfg.label}
                    </span>
                  </span>
                  {isSelected && <IconCheck size={14} stroke={1.75} className="text-brand-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
