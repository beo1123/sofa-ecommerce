"use client";

import React from "react";
import clsx from "clsx";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  inputSize?: "sm" | "md";
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      inputSize = "md",
      id,
      className,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;
    const hasError = Boolean(error);

    return (
      <div className={clsx(fullWidth && "w-full")}>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-text-default mb-1.5">
            {label}
            {required && (
              <span className="text-red-600 ml-1" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            aria-invalid={hasError || undefined}
            aria-describedby={hasError ? errorId : helperText ? helperId : undefined}
            className={clsx(
              "block w-full rounded-[8px] border bg-bg-page text-text-default placeholder:text-text-muted/70 shadow-none transition-colors duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-bg-muted",
              inputSize === "sm" ? "h-8 px-2.5 text-sm" : "h-10 px-3 text-sm",
              hasError
                ? "border-red-400 focus:border-red-500 focus:ring-[3px] focus:ring-red-100"
                : "border-brand-100 hover:border-brand-200 focus:border-brand-300 focus:ring-[3px] focus:ring-brand-50",
              leftIcon && "pl-9",
              rightIcon && "pr-9",
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted">{rightIcon}</div>
          )}
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

Input.displayName = "Input";

export default Input;
