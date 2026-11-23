import React from "react";
import clsx from "clsx";
import { IconLoader2 } from "@tabler/icons-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "xs" | "sm" | "md" | "lg";
  pill?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-brand-400 text-white border border-brand-400 hover:bg-brand-300 hover:border-brand-300 focus-visible:ring-[3px] focus-visible:ring-brand-50",
  secondary:
    "bg-brand-50 text-brand-400 border border-brand-100 hover:bg-brand-100/50 hover:border-brand-200 focus-visible:ring-[3px] focus-visible:ring-brand-50",
  outline:
    "bg-bg-page text-brand-400 border border-brand-300 hover:bg-brand-50 hover:border-brand-400 focus-visible:ring-[3px] focus-visible:ring-brand-50",
  ghost:
    "bg-transparent text-brand-400 border border-transparent hover:bg-brand-50/60 focus-visible:ring-[3px] focus-visible:ring-brand-50",
  danger:
    "bg-red-600 text-white border border-red-600 hover:bg-red-700 hover:border-red-700 focus-visible:ring-[3px] focus-visible:ring-red-100",
};

const SIZE_CLASSES: Record<NonNullable<ButtonProps["size"]>, string> = {
  xs: "h-7 px-2.5 text-xs gap-1.5",
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-11 px-5 text-base gap-2",
};

const LOADER_SIZES: Record<NonNullable<ButtonProps["size"]>, number> = {
  xs: 14,
  sm: 15,
  md: 16,
  lg: 18,
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      pill = false,
      fullWidth = false,
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      className,
      type = "button",
      ...props
    },
    ref
  ) => {
    const isDisabled = Boolean(disabled || loading);

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        aria-disabled={isDisabled || undefined}
        className={clsx(
          "inline-flex items-center justify-center font-medium leading-none transition-colors duration-150 shadow-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none",
          pill ? "rounded-[20px]" : "rounded-[8px]",
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          fullWidth && "w-full",
          className
        )}
        {...props}>
        {loading && (
          <IconLoader2 size={LOADER_SIZES[size]} stroke={1.75} className="animate-spin shrink-0" aria-hidden="true" />
        )}
        {!loading && leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
