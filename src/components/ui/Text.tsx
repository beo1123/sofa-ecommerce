// components/Text.tsx
import React from "react";

type Props = {
  children: React.ReactNode;
  muted?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export default function Text({
  children,
  muted = false,
  size = "md",
  className = "",
}: Props) {
  const sizeMap = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const colorClass = muted
    ? "text-[var(--color-text-muted)]"
    : "text-[var(--color-text-default)]";

  return (
    <p className={`${sizeMap[size]} ${colorClass} ${className}`}>{children}</p>
  );
}
