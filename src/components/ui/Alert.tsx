// components/Alert.tsx
import React from "react";

type Props = {
  title?: string;
  description?: string;
  variant?: "info" | "success" | "warning" | "error";
  className?: string;
};

export default function Alert({ title, description, variant = "info", className = "" }: Props) {
  const variantStyles = {
    info: "bg-blue-50 text-blue-800 border-blue-200",
    success: "bg-green-50 text-green-800 border-green-200",
    warning: "bg-yellow-50 text-yellow-800 border-yellow-200",
    error: "bg-red-50 text-red-800 border-red-200",
  };

  return (
    <div role="alert" className={`border rounded-md p-4 ${variantStyles[variant]} ${className}`}>
      {title && <h4 className="font-semibold mb-1">{title}</h4>}
      {description && <p className="text-sm">{description}</p>}
    </div>
  );
}
