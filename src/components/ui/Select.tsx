"use client";

import React from "react";
import clsx from "clsx";
import { IconChevronDown } from "@tabler/icons-react";

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
  error?: string;
  helperText?: string;
  placeholder?: string;
  options?: SelectOption[];
  fullWidth?: boolean;
  selectSize?: "sm" | "md";
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      placeholder,
      options,
      children,
      fullWidth = false,
      selectSize = "md",
      id,
      className,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;
    const hasError = Boolean(error);

    return (
      <div className={clsx(fullWidth && "w-full")}>
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-text-default mb-1.5">
            {label}
            {required && (
              <span className="text-red-600 ml-1" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            required={required}
            aria-invalid={hasError || undefined}
            aria-describedby={hasError ? errorId : helperText ? helperId : undefined}
            className={clsx(
              "block w-full appearance-none rounded-[8px] border bg-bg-page pr-9 text-text-default shadow-none transition-colors duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-bg-muted cursor-pointer",
              selectSize === "sm" ? "h-8 pl-2.5 text-sm" : "h-10 pl-3 text-sm",
              hasError
                ? "border-red-400 focus:border-red-500 focus:ring-[3px] focus:ring-red-100"
                : "border-brand-100 hover:border-brand-200 focus:border-brand-300 focus:ring-[3px] focus:ring-brand-50",
              className
            )}
            {...props}>
            {placeholder !== undefined && <option value="">{placeholder}</option>}
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-text-muted">
            <IconChevronDown size={16} stroke={1.75} aria-hidden="true" />
          </span>
        </div>

        {error && (
          <p id={errorId} className="mt-1 text-xs text-red-600" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-1 text-xs text-text-muted">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
