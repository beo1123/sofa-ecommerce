"use client";

import React, { useEffect } from "react";
import clsx from "clsx";
import { IconX } from "@tabler/icons-react";

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  side?: "right" | "left";
  widthClassName?: string;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
  bodyClassName?: string;
}

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  footer,
  children,
  side = "right",
  widthClassName = "w-full max-w-[520px]",
  showCloseButton = true,
  closeOnOverlayClick = true,
  className,
  bodyClassName,
}: DrawerProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={clsx("fixed inset-0 z-50 flex", side === "right" ? "justify-end" : "justify-start")}
      role="dialog"
      aria-modal="true">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-brand-400/20 backdrop-blur-[1px] animate-fadeIn"
        aria-hidden="true"
        onClick={() => {
          if (closeOnOverlayClick) onClose();
        }}
      />

      {/* Panel */}
      <div
        className={clsx(
          "relative z-10 flex h-full flex-col bg-bg-page animate-fadeIn",
          side === "right" ? "border-l border-brand-100" : "border-r border-brand-100",
          widthClassName,
          className
        )}>
        {(title || subtitle || showCloseButton) && (
          <div className="flex items-start justify-between gap-4 border-b border-brand-100 px-6 py-4">
            <div className="min-w-0 flex-1">
              {title && <h2 className="truncate text-lg font-semibold text-brand-400">{title}</h2>}
              {subtitle && <p className="mt-0.5 truncate text-xs text-text-muted">{subtitle}</p>}
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Đóng"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] border border-transparent text-text-muted transition-colors hover:border-brand-100 hover:bg-brand-50/60 hover:text-brand-400 focus:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-50 cursor-pointer">
                <IconX size={18} stroke={1.75} aria-hidden="true" />
              </button>
            )}
          </div>
        )}

        <div className={clsx("flex-1 overflow-y-auto", bodyClassName ?? "px-6 py-5")}>{children}</div>

        {footer && <div className="border-t border-brand-100 bg-bg-muted px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}

export default Drawer;
