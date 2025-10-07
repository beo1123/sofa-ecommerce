// components/Button.tsx
import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

const Button = React.forwardRef<HTMLButtonElement, Props>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      fullWidth = false,
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      className = "",
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

    const variantClasses = {
      primary:
        "bg-[var(--color-brand-300)] text-white hover:bg-[var(--color-brand-400)] focus:ring-[var(--color-brand-400)]",
      secondary:
        "bg-[var(--color-brand-50)] text-[var(--color-brand-400)] hover:bg-[var(--color-brand-100)] focus:ring-[var(--color-brand-300)]",
      outline:
        "border-2 border-[var(--color-brand-300)] text-[var(--color-brand-400)] hover:bg-[var(--color-brand-50)] focus:ring-[var(--color-brand-300)]",
      ghost: "text-[var(--color-brand-400)] hover:bg-[var(--color-bg-muted)] focus:ring-[var(--color-brand-200)]",
      danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    };

    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm rounded",
      md: "px-4 py-2 text-base rounded-md",
      lg: "px-6 py-3 text-lg rounded-lg",
    };

    const widthClass = fullWidth ? "w-full" : "";
    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`;

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={classes}
        aria-busy={loading}
        aria-disabled={disabled || loading}
        {...props}>
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 
                 5.291A7.962 7.962 0 014 12H0c0 
                 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
