// components/Badge.tsx
import React from "react";

type Props = {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
  className?: string;
};

export default function Badge({ children, variant = "default", className = "" }: Props) {
  const variantClasses = {
    default: "bg-[var(--color-brand-50)] text-[var(--color-brand-400)]",
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    danger: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-sm font-medium rounded-md ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}
