import React from "react";
import clsx from "clsx";

export type BadgeVariant = "default" | "brand" | "muted" | "success" | "warning" | "info" | "danger" | "neutral";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: "sm" | "md";
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default: "bg-brand-50 text-brand-400",
  brand: "bg-brand-50 text-brand-300",
  muted: "bg-bg-muted text-text-muted border border-brand-100",
  success: "bg-green-50 text-green-700",
  warning: "bg-amber-50 text-amber-700",
  info: "bg-blue-50 text-blue-700",
  danger: "bg-red-50 text-red-600",
  neutral: "bg-gray-100 text-gray-500",
};

const SIZE_CLASSES: Record<NonNullable<BadgeProps["size"]>, string> = {
  sm: "px-2.5 py-1 text-xs",
  md: "px-3 py-1 text-sm",
};

export function Badge({ children, variant = "default", size = "sm", className, ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-[20px] font-medium leading-none whitespace-nowrap",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className
      )}
      {...props}>
      {children}
    </span>
  );
}

export default Badge;
