"use client";
import React from "react";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

/**
 * Smart Input Component
 * - Fully compatible with React Hook Form & Zod
 * - Works with both controlled and uncontrolled forms
 * - Keeps accessibility (aria-invalid, aria-describedby)
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      id,
      className = "",
      disabled,
      required,
      value,
      onChange,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;
    const hasError = Boolean(error);
    const containerClass = fullWidth ? "w-full" : "";

    const baseInputClasses =
      "block w-full px-3 py-2 border rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100";

    const stateClasses = hasError
      ? "border-red-500 text-red-900 focus:ring-red-500 focus:border-red-500"
      : "border-[var(--color-brand-100)] focus:ring-[var(--color-brand-300)] focus:border-[var(--color-brand-400)]";

    const iconPadding = leftIcon ? "pl-10" : rightIcon ? "pr-10" : "";
    const inputClasses = `${baseInputClasses} ${stateClasses} ${iconPadding} ${className}`;

    return (
      <div className={containerClass}>
        {/* LABEL */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--color-text-default)] mb-1"
          >
            {label}
            {required && (
              <span className="text-red-500 ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        {/* INPUT WRAPPER */}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-[var(--color-text-muted)]">{leftIcon}</span>
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            className={inputClasses}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? errorId : helperText ? helperId : undefined
            }
            // ✅ Cho phép controlled & uncontrolled form
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            {...props}
          />

          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-[var(--color-text-muted)]">
                {rightIcon}
              </span>
            </div>
          )}
        </div>

        {/* ERROR / HELPER */}
        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p
            id={helperId}
            className="mt-1 text-sm text-[var(--color-text-muted)]"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
export default Input;
