import React from "react";
import clsx from "clsx";

export type StatusDomain = "workshop" | "product" | "article" | "inquiry" | "shipment" | "return" | "refund" | "order";

export interface StatusStyleConfig {
  label: string;
  className: string;
}

export const STATUS_CONFIGS: Record<StatusDomain, Record<string, StatusStyleConfig>> = {
  workshop: {
    new: { label: "Đơn mới", className: "bg-brand-50 text-brand-200" },
    deposited: { label: "Đã cọc", className: "bg-green-50 text-green-700" },
    production: {
      label: "Đang sản xuất",
      className: "bg-amber-50 text-amber-700",
    },
    shipping: { label: "Đang giao", className: "bg-blue-50 text-blue-700" },
    done: { label: "Hoàn thành", className: "bg-brand-50 text-brand-400" },
    warranty: { label: "Bảo hành", className: "bg-red-50 text-red-600" },
    cancelled: { label: "Đã hủy", className: "bg-gray-100 text-gray-500" },
  },
  product: {
    PUBLISHED: {
      label: "Đang hiển thị",
      className: "bg-green-50 text-green-700",
    },
    DRAFT: { label: "Bản nháp", className: "bg-amber-50 text-amber-700" },
    ARCHIVED: { label: "Lưu trữ", className: "bg-gray-100 text-gray-500" },
  },
  article: {
    PUBLISHED: {
      label: "Đã xuất bản",
      className: "bg-green-50 text-green-700",
    },
    DRAFT: { label: "Bản nháp", className: "bg-amber-50 text-amber-700" },
    ARCHIVED: { label: "Lưu trữ", className: "bg-gray-100 text-gray-500" },
  },
  inquiry: {
    new: { label: "Mới", className: "bg-brand-50 text-brand-300" },
    processing: {
      label: "Đang tư vấn",
      className: "bg-amber-50 text-amber-700",
    },
    closed_won: { label: "Chốt đơn", className: "bg-green-50 text-green-700" },
    closed_lost: {
      label: "Không chốt",
      className: "bg-gray-100 text-gray-500",
    },
  },
  shipment: {
    scheduled: {
      label: "Đã lên lịch",
      className: "bg-brand-50 text-brand-300",
    },
    delivering: { label: "Đang giao", className: "bg-blue-50 text-blue-700" },
    done: { label: "Đã giao", className: "bg-green-50 text-green-700" },
    failed: { label: "Giao thất bại", className: "bg-red-50 text-red-600" },
  },
  return: {
    PENDING: { label: "Chờ duyệt", className: "bg-amber-50 text-amber-700" },
    APPROVED: { label: "Đã duyệt", className: "bg-blue-50 text-blue-700" },
    RECEIVED: { label: "Đã nhận hàng", className: "bg-green-50 text-green-700" },
    REJECTED: { label: "Từ chối", className: "bg-red-50 text-red-600" },
  },
  refund: {
    PENDING: {
      label: "Chờ hoàn tiền",
      className: "bg-amber-50 text-amber-700",
    },
    COMPLETED: {
      label: "Đã hoàn tiền",
      className: "bg-green-50 text-green-700",
    },
    FAILED: { label: "Thất bại", className: "bg-red-50 text-red-600" },
  },
  order: {
    CREATED: { label: "Mới tạo", className: "bg-brand-50 text-brand-300" },
    PENDING_PAYMENT: {
      label: "Chờ thanh toán",
      className: "bg-amber-50 text-amber-700",
    },
    PAID: { label: "Đã thanh toán", className: "bg-green-50 text-green-700" },
    FAILED_PAYMENT: {
      label: "Lỗi thanh toán",
      className: "bg-red-50 text-red-600",
    },
    COD_PENDING: {
      label: "COD chờ thu",
      className: "bg-amber-50 text-amber-700",
    },
    COD_COMPLETED: {
      label: "COD hoàn tất",
      className: "bg-green-50 text-green-700",
    },
    FULFILLED: { label: "Hoàn thành", className: "bg-brand-50 text-brand-400" },
    CANCELLED: { label: "Đã hủy", className: "bg-gray-100 text-gray-500" },
    REFUNDED: { label: "Đã hoàn tiền", className: "bg-red-50 text-red-600" },
  },
};

export function getStatusConfig(domain: StatusDomain, status: string): StatusStyleConfig {
  return (
    STATUS_CONFIGS[domain]?.[status] ?? {
      label: status,
      className: "bg-gray-100 text-gray-500",
    }
  );
}

export interface StatusBadgeProps {
  status: string;
  domain?: StatusDomain;
  label?: string;
  interactive?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  rightIcon?: React.ReactNode;
}

export function StatusBadge({
  status,
  domain = "workshop",
  label,
  interactive = false,
  onClick,
  className,
  rightIcon,
}: StatusBadgeProps) {
  const config = getStatusConfig(domain, status);
  const displayLabel = label ?? config.label;
  const sharedClasses = clsx(
    "inline-flex items-center gap-1 rounded-[20px] px-2.5 py-1 text-xs font-medium leading-none whitespace-nowrap",
    config.className,
    (interactive || onClick) &&
      "cursor-pointer transition-opacity hover:opacity-85 focus:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-50",
    className
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={sharedClasses}>
        <span>{displayLabel}</span>
        {rightIcon}
      </button>
    );
  }

  return (
    <span className={sharedClasses}>
      <span>{displayLabel}</span>
      {rightIcon}
    </span>
  );
}

export default StatusBadge;
